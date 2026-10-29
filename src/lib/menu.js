import Papa from "papaparse";

export const DIETARY_TAGS = Object.freeze(["vegetarian", "vegan", "halal", "no-pork-no-lard"]);
const REQUIRED_COLUMNS = ["id", "name", "price", "canteen", "stall"];
const SORTS = ["name-asc", "name-desc", "price-asc", "price-desc"];
const collator = new Intl.Collator("en", { sensitivity: "base", numeric: true });
const fold = (value) => String(value).normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().trim();

export class MenuDataError extends Error {
  constructor(message, details = []) {
    super(message);
    this.name = "MenuDataError";
    this.details = details;
  }
}

/** Return validation problems without altering records. Empty datasets are valid here. */
export function validateMenuItems(items) {
  if (!Array.isArray(items)) return [{ field: "items", message: "Expected an array of menu items." }];
  const errors = [];
  const ids = new Set();
  items.forEach((item, index) => {
    const report = (field, message) => errors.push({ record: index + 1, field, message });
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      report("item", "Expected a menu item object.");
      return;
    }
    for (const field of ["id", "name", "canteen", "stall"]) {
      if (typeof item[field] !== "string" || !item[field].trim()) report(field, "A non-empty value is required.");
    }
    if (typeof item.id === "string" && item.id.trim()) {
      const id = item.id.trim();
      if (ids.has(id)) report("id", `Duplicate item ID: ${id}. IDs must be unique across all CSV files.`);
      ids.add(id);
    }
    if (item.price !== null && (typeof item.price !== "number" || !Number.isFinite(item.price) || item.price < 0)) {
      report("price", "Use a non-negative number in SGD, or null for an unknown price.");
    }
    if (!Array.isArray(item.dietary_tags) || item.dietary_tags.some((tag) => !DIETARY_TAGS.includes(tag))) {
      report("dietary_tags", `Use an array containing only: ${DIETARY_TAGS.join(", ")}.`);
    }
    for (const field of ["cuisine", "image", "source"]) {
      if (item[field] != null && typeof item[field] !== "string") report(field, "Use text or null.");
    }
  });
  return errors;
}

function assertValid(items, context) {
  const errors = validateMenuItems(items);
  if (errors.length) throw new MenuDataError(`${context}: ${errors.length} validation problem(s).`, errors);
  return items;
}

/** Read UTF-8 comma-separated data, preserving quoted commas, quotes and newlines. */
export function parseMenuCsv(csv, { source = "menu.csv" } = {}) {
  if (typeof csv !== "string") throw new TypeError("CSV input must be text.");
  const parsed = Papa.parse(csv, { delimiter: ",", skipEmptyLines: "greedy", dynamicTyping: false });
  if (parsed.errors.length) {
    throw new MenuDataError(`${source}: invalid CSV.`, parsed.errors.map((error) => ({
      record: error.row == null ? undefined : error.row + 1,
      field: "csv",
      message: error.message,
    })));
  }
  const [rawHeaders = [], ...rows] = parsed.data;
  const headers = rawHeaders.map((header) => header.replace(/^\uFEFF/, "").trim().toLowerCase());
  const headerErrors = REQUIRED_COLUMNS.filter((column) => !headers.includes(column))
    .map((field) => ({ field, message: `Missing required column: ${field}.` }));
  if (new Set(headers).size !== headers.length || headers.includes("")) {
    headerErrors.push({ field: "headers", message: "Column names must be non-empty and unique." });
  }
  if (headerErrors.length) throw new MenuDataError(`${source}: invalid column headings.`, headerErrors);

  const rowErrors = [];
  const items = rows.map((values, index) => {
    if (values.length !== headers.length) {
      rowErrors.push({ record: index + 1, field: "csv", message: `Expected ${headers.length} cells, received ${values.length}.` });
    }
    const row = Object.fromEntries(headers.map((header, column) => [header, (values[column] ?? "").trim()]));
    const price = row.price === "" ? null : /^\d+(?:\.\d{1,2})?$/.test(row.price) ? Number(row.price) : NaN;
    return {
      id: row.id,
      name: row.name,
      price,
      canteen: row.canteen,
      stall: row.stall,
      cuisine: row.cuisine || null,
      dietary_tags: [...new Set((row.dietary_tags || "").split("|").map(fold).filter(Boolean))],
      image: row.image || null,
      source: row.source || null,
    };
  });
  const errors = [...rowErrors, ...validateMenuItems(items)];
  if (errors.length) throw new MenuDataError(`${source}: ${errors.length} validation problem(s).`, errors);
  return items;
}

/** Load one or more CSVs atomically; duplicates across files are rejected. */
export async function loadMenuCsv(urls, { signal, fetchImpl = globalThis.fetch } = {}) {
  const sources = Array.isArray(urls) ? urls : [urls];
  if (!sources.length || sources.some((url) => !(typeof url === "string" && url.trim()) && !(url instanceof URL))) {
    throw new TypeError("Provide at least one CSV URL.");
  }
  if (typeof fetchImpl !== "function") throw new TypeError("A fetch implementation is required.");
  const batches = await Promise.all(sources.map(async (url) => {
    const response = await fetchImpl(url, { signal });
    if (!response.ok) throw new MenuDataError(`Could not load ${url}: HTTP ${response.status}.`);
    return parseMenuCsv(await response.text(), { source: String(url) });
  }));
  return assertValid(batches.flat(), "Combined menu data");
}

function selection(values, field) {
  if (values == null) return [];
  if (!Array.isArray(values) || values.some((value) => typeof value !== "string")) {
    throw new TypeError(`${field} must be an array of text values.`);
  }
  return values.map(fold).filter(Boolean);
}

/** OR within location/cuisine fields; AND across fields and selected dietary tags. */
export function searchMenu(items, filters = {}) {
  const { query = "", minPrice, maxPrice, sort = "name-asc" } = filters;
  if (typeof query !== "string") throw new TypeError("query must be text.");
  for (const [field, value] of [["minPrice", minPrice], ["maxPrice", maxPrice]]) {
    if (value != null && (typeof value !== "number" || !Number.isFinite(value) || value < 0)) {
      throw new RangeError(`${field} must be a non-negative number, or unset.`);
    }
  }
  if (minPrice != null && maxPrice != null && minPrice > maxPrice) throw new RangeError("Minimum price cannot exceed maximum price.");
  if (!SORTS.includes(sort)) throw new RangeError(`Unknown sort order: ${sort}.`);
  const canteens = selection(filters.canteens, "canteens");
  const stalls = selection(filters.stalls, "stalls");
  const cuisines = selection(filters.cuisines, "cuisines");
  const tags = selection(filters.dietaryTags, "dietaryTags");
  const terms = fold(query).split(/\s+/).filter(Boolean);
  const matches = (selected, value) => !selected.length || selected.includes(fold(value ?? ""));
  const result = items.filter((item) => {
    const searchable = fold([item.name, item.canteen, item.stall, item.cuisine, ...item.dietary_tags].filter(Boolean).join(" "));
    return terms.every((term) => searchable.includes(term))
      && matches(canteens, item.canteen)
      && matches(stalls, item.stall)
      && matches(cuisines, item.cuisine)
      && tags.every((tag) => item.dietary_tags.includes(tag))
      && (minPrice == null || (item.price !== null && item.price >= minPrice))
      && (maxPrice == null || (item.price !== null && item.price <= maxPrice));
  });
  return result.sort((a, b) => {
    if (sort.startsWith("price")) {
      if (a.price === null && b.price !== null) return 1;
      if (b.price === null && a.price !== null) return -1;
      const difference = (a.price ?? 0) - (b.price ?? 0);
      if (difference) return sort === "price-desc" ? -difference : difference;
    }
    const byName = collator.compare(a.name, b.name);
    return sort === "name-desc" ? -byName : byName;
  });
}

/** Build filter options from available records, never from invented categories. */
export function getMenuFacets(items) {
  const unique = (values) => [...new Map(values.filter(Boolean).map((value) => [fold(value), value])).values()]
    .sort(collator.compare);
  const prices = items.map((item) => item.price).filter((price) => price !== null);
  return {
    canteens: unique(items.map((item) => item.canteen)),
    stalls: unique(items.map((item) => item.stall)),
    cuisines: unique(items.map((item) => item.cuisine)),
    dietaryTags: unique(items.flatMap((item) => item.dietary_tags)),
    minPrice: prices.length ? prices.reduce((a, b) => Math.min(a, b)) : null,
    maxPrice: prices.length ? prices.reduce((a, b) => Math.max(a, b)) : null,
  };
}

export function formatPrice(price) {
  if (price === null) return "Price unavailable";
  if (typeof price !== "number" || !Number.isFinite(price) || price < 0) throw new RangeError("Invalid price.");
  return `S$${price.toFixed(2)}`;
}
