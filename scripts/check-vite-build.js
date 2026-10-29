import { build } from "vite";
import { fileURLToPath } from "node:url";

await build({
  configFile: false,
  root: fileURLToPath(new URL("../tests/fixtures/vite-smoke", import.meta.url)),
  base: "/uts2719/",
  build: {
    outDir: fileURLToPath(new URL("../dist/data-smoke", import.meta.url)),
    emptyOutDir: false,
  },
});
