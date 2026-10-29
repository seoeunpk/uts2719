import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseMenuCsv, validateMenuItems, loadMenuCsv, searchMenu, getMenuFacets, formatPrice, MenuDataError } from "../src/lib/menu.js";

const csv = await readFile(new URL("./fixtures/example-menu.csv", import.meta.url), "utf8");
const items = parseMenuCsv(csv);
const ids = (result) => result.map((item) => item.id);
const minimalHeader = "id,name,price,canteen,stall";
const validCsv = `${minimalHeader}\n001,Example Dish,3.50,Example Canteen,Example Stall`;
const response = (text) => ({ ok: true, text: async () => text });

test("CSV preserves quoted commas, escaped quotes, multiline text and Unicode", () => {
  const parsed = parseMenuCsv(`${minimalHeader}\r\n001,"Example ""Café"",\n米饭",3.50,Example Canteen,Example Stall\r\n`);
  assert.equal(parsed[0].name, 'Example "Café",\n米饭');
  assert.equal(parsed[0].id, "001");
  assert.equal(parsed[0].price, 3.5);
});

test("UTF-8 BOM, header case, whitespace and blank lines are handled", () => {
  const parsed = parseMenuCsv("\uFEFF ID , NAME , PRICE , CANTEEN , STALL \r\n\r\n 001 , Example Dish , 3.50 , Example Canteen , Example Stall \r\n,,,,\r\n");
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].name, "Example Dish");
});

test("unknown prices remain null and zero remains a valid price", () => {
  assert.equal(items.find((item) => item.id === "example-004").price, null);
  assert.equal(items.find((item) => item.id === "example-005").price, 0);
});

test("a header-only file is empty while missing or duplicate headers fail", () => {
  assert.deepEqual(parseMenuCsv(minimalHeader), []);
  for (const invalid of ["", "name,price,canteen,stall", "id,name,price,canteen,stall,id"]) {
    assert.throws(() => parseMenuCsv(invalid), MenuDataError);
  }
});

test("malformed quotes and uneven row widths fail without silently losing data", () => {
  for (const invalid of [`${minimalHeader}\n001,"unfinished,3.50,Example Canteen,Example Stall`, `${validCsv},extra`, `${minimalHeader}\n001,Example Dish,3.50,Example Canteen`]) {
    assert.throws(() => parseMenuCsv(invalid), MenuDataError);
  }
});

test("invalid prices and required blank values report the record and field", () => {
  for (const price of ["-1", "S$3.50", "3-5", "NaN", "Infinity", "3.999", "3abc"]) {
    assert.throws(() => parseMenuCsv(`${minimalHeader}\n001,Example Dish,${price},Example Canteen,Example Stall`), (error) => {
      assert.ok(error.details.some((detail) => detail.record === 1 && detail.field === "price"));
      return true;
    });
  }
  assert.throws(() => parseMenuCsv(`${minimalHeader}\n001,,3.50,Example Canteen,Example Stall`), MenuDataError);
});

test("duplicate IDs fail and invalid data objects return actionable errors", () => {
  assert.throws(() => parseMenuCsv(`${validCsv}\n001,Another Dish,4.00,Example Canteen,Example Stall`), MenuDataError);
  assert.equal(validateMenuItems({}).length, 1);
  assert.ok(validateMenuItems([null, { ...items[0], price: Infinity, dietary_tags: ["unknown"] }]).length >= 3);
});

test("dietary tags are explicit, normalised and deduplicated", () => {
  const parsed = parseMenuCsv(`${minimalHeader},dietary_tags\n001,Example Dish,3.50,Example Canteen,Example Stall, Vegetarian | VEGAN |vegetarian`);
  assert.deepEqual(parsed[0].dietary_tags, ["vegetarian", "vegan"]);
  assert.deepEqual(items[0].dietary_tags, []);
  assert.throws(() => parseMenuCsv(`${validCsv.split("\n")[0]},dietary_tags\n001,Example Dish,3.50,Example Canteen,Example Stall,maybe-halal`), MenuDataError);
});

test("multiple CSVs keep source order and forward the abort signal", async () => {
  const controller = new AbortController();
  const loaded = await loadMenuCsv(["/one.csv", "/two.csv"], { signal: controller.signal, fetchImpl: async (url, options) => {
    assert.equal(options.signal, controller.signal);
    return response(url === "/one.csv" ? validCsv : validCsv.replace("001,", "002,"));
  } });
  assert.deepEqual(ids(loaded), ["001", "002"]);
});

test("load rejects duplicates across files, failed requests and invalid sources", async () => {
  await assert.rejects(loadMenuCsv(["a", "b"], { fetchImpl: async () => response(validCsv) }), /Combined menu data/);
  await assert.rejects(loadMenuCsv("a", { fetchImpl: async () => ({ ok: false, status: 404 }) }), /HTTP 404/);
  await assert.rejects(loadMenuCsv("a", { fetchImpl: async () => { throw new Error("offline"); } }), /offline/);
  await assert.rejects(loadMenuCsv(["good", "bad"], { fetchImpl: async (url) => response(url === "good" ? validCsv : "invalid") }), MenuDataError);
  await assert.rejects(loadMenuCsv([]), TypeError);
  await assert.rejects(loadMenuCsv(undefined), TypeError);
});

test("search matches all words, mixed case, accents and text across fields", () => {
  assert.deepEqual(ids(searchMenu(items, { query: "  NORTH   rice  " })), ["example-001"]);
  assert.deepEqual(ids(searchMenu(items, { query: "cafe" })), ["example-006"]);
  assert.equal(searchMenu(items, { query: "not available" }).length, 0);
  const chinese = parseMenuCsv(`${minimalHeader}\n001,米饭,3.50,Example Canteen,Example Stall`);
  assert.equal(searchMenu(chinese, { query: "米饭" }).length, 1);
});

test("canteen, stall, cuisine and inclusive price bounds combine with AND", () => {
  assert.deepEqual(ids(searchMenu(items, { canteens: ["example north"], stalls: ["Example Greens"], cuisines: ["Chinese"], minPrice: 4, maxPrice: 4 })), ["example-002"]);
  assert.deepEqual(ids(searchMenu(items, { canteens: ["Example North"], stalls: ["Example Curry"] })), []);
  assert.equal(searchMenu(items, { canteens: ["Example North", "Example South"] }).length, items.length);
});

test("all requested dietary tags must be present; unknown status never qualifies", () => {
  assert.deepEqual(ids(searchMenu(items, { dietaryTags: ["vegetarian", "halal"] })), ["example-003"]);
  assert.deepEqual(ids(searchMenu(items, { dietaryTags: ["HALAL"] })), ["example-003"]);
  assert.deepEqual(ids(searchMenu(items, { dietaryTags: ["unknown"] })), []);
});

test("price limits exclude unknowns and treat a zero budget as active", () => {
  assert.deepEqual(ids(searchMenu(items, { maxPrice: 0 })), ["example-005"]);
  assert.ok(!ids(searchMenu(items, { minPrice: 0 })).includes("example-004"));
  assert.ok(ids(searchMenu(items)).includes("example-004"));
});

test("sorts put unknown prices last in both directions without mutating input", () => {
  const before = structuredClone(items);
  const asc = searchMenu(items, { sort: "price-asc" });
  const desc = searchMenu(items, { sort: "price-desc" });
  assert.equal(asc[0].id, "example-005");
  assert.equal(desc[0].id, "example-003");
  assert.equal(asc.at(-1).id, "example-004");
  assert.equal(desc.at(-1).id, "example-004");
  assert.deepEqual(ids(searchMenu(items, { sort: "name-desc" })), ids(searchMenu(items)).reverse());
  assert.deepEqual(items, before);
});

test("invalid bounds, filter shapes and sort orders fail explicitly", () => {
  for (const filters of [{ minPrice: 5, maxPrice: 3 }, { maxPrice: -1 }, { maxPrice: "5" }, { minPrice: NaN }, { sort: "unknown" }, { canteens: "North" }, { query: 2 }]) {
    assert.throws(() => searchMenu(items, filters));
  }
});

test("facets derive from data and can be scoped to a canteen for stall navigation", () => {
  const facets = getMenuFacets(items);
  assert.deepEqual(facets.canteens, ["Example North", "Example South"]);
  assert.equal(facets.minPrice, 0);
  assert.equal(facets.maxPrice, 5.5);
  assert.deepEqual(getMenuFacets(searchMenu(items, { canteens: ["Example North"] })).stalls, ["Example Drinks", "Example Greens", "Example Rice"]);
  assert.equal(getMenuFacets([]).minPrice, null);
});

test("prices display as SGD with unknown price distinguished from free", () => {
  assert.equal(formatPrice(3.5), "S$3.50");
  assert.equal(formatPrice(0), "S$0.00");
  assert.equal(formatPrice(null), "Price unavailable");
  assert.throws(() => formatPrice(-1), RangeError);
});

test("release validation rejects a header-only CSV and accepts the fictional fixture", () => {
  const script = fileURLToPath(new URL("../scripts/validate-menu.js", import.meta.url));
  const empty = spawnSync(process.execPath, [script, fileURLToPath(new URL("./fixtures/empty-menu.csv", import.meta.url))], { encoding: "utf8" });
  assert.equal(empty.status, 2);
  assert.match(empty.stderr, /No menu records/);
  const fixture = spawnSync(process.execPath, [script, fileURLToPath(new URL("./fixtures/example-menu.csv", import.meta.url))], { encoding: "utf8" });
  assert.equal(fixture.status, 0, fixture.stderr);
  assert.equal(JSON.parse(fixture.stdout).items, 6);
});
