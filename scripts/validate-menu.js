import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { parseMenuCsv, validateMenuItems, getMenuFacets } from "../src/lib/menu.js";

const files = process.argv.slice(2);
if (!files.length) files.push(fileURLToPath(new URL("../public/data/menu.csv", import.meta.url)));
try {
  const batches = await Promise.all(files.map(async (file) => parseMenuCsv(await readFile(file, "utf8"), { source: file })));
  const items = batches.flat();
  const errors = validateMenuItems(items);
  if (errors.length) {
    console.error(JSON.stringify(errors, null, 2));
    process.exitCode = 1;
  } else if (!items.length) {
    console.error("No menu records found. Add the real CSV data before deployment.");
    process.exitCode = 2;
  } else {
    console.log(JSON.stringify({ files: files.length, items: items.length, ...getMenuFacets(items) }, null, 2));
  }
} catch (error) {
  console.error(error.message);
  if (error.details?.length) console.error(JSON.stringify(error.details, null, 2));
  process.exitCode = 1;
}
