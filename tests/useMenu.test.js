import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import React, { act, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { JSDOM } from "jsdom";
import { useMenu } from "../src/hooks/useMenu.js";

const csv = await readFile(new URL("./fixtures/example-menu.csv", import.meta.url), "utf8");
const ok = (text = csv) => ({ ok: true, text: async () => text });
const flush = () => new Promise((resolve) => setImmediate(resolve));

test("React data hook lifecycle", async (suite) => {
  const dom = new JSDOM("<!doctype html><div id='root'></div>");
  const previous = { window: globalThis.window, document: globalThis.document, fetch: globalThis.fetch, act: globalThis.IS_REACT_ACT_ENVIRONMENT };
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let state;
  function Consumer({ urls = "/menu.csv", filters }) {
    state = useMenu(urls, filters);
    return React.createElement("span", null, String(state.matchCount));
  }
  let root;
  const render = async (props = {}, strict = false) => {
    if (!root) root = createRoot(document.getElementById("root"));
    await act(async () => {
      const child = React.createElement(Consumer, props);
      root.render(strict ? React.createElement(StrictMode, null, child) : child);
      await flush();
    });
  };
  const reset = async () => {
    if (root) await act(async () => root.unmount());
    root = null;
  };
  try {
    await suite.test("loads data and filters locally without another request", async () => {
      let requests = 0;
      globalThis.fetch = async () => { requests++; return ok(); };
      await render();
      assert.equal(state.loading, false);
      assert.equal(state.totalCount, 6);
      await render({ filters: { maxPrice: 0 } });
      assert.equal(state.matchCount, 1);
      assert.equal(requests, 1);
      assert.equal(state.error, null);
      await reset();
    });
    await suite.test("equivalent URL arrays do not cause repeated requests", async () => {
      let requests = 0;
      globalThis.fetch = async () => { requests++; return ok(); };
      await render({ urls: ["/one.csv"] });
      await render({ urls: ["/one.csv"] });
      assert.equal(requests, 1);
      await reset();
    });
    await suite.test("exposes load errors and clears old results", async () => {
      globalThis.fetch = async () => ok();
      await render();
      globalThis.fetch = async () => ({ ok: false, status: 500 });
      await render({ urls: "/failed.csv" });
      assert.equal(state.loading, false);
      assert.equal(state.totalCount, 0);
      assert.match(state.error.message, /HTTP 500/);
      await reset();
    });
    await suite.test("empty menus and invalid filters are distinct states", async () => {
      globalThis.fetch = async () => ok(csv.split("\n")[0]);
      await render();
      assert.equal(state.matchCount, 0);
      assert.equal(state.error, null);
      globalThis.fetch = async () => ok();
      await render({ urls: "/full.csv", filters: { minPrice: 10, maxPrice: 2 } });
      assert.equal(state.totalCount, 6);
      assert.ok(state.filterError instanceof RangeError);
      assert.equal(state.matchCount, 0);
      assert.equal(state.error, null);
      await reset();
    });
    await suite.test("changing source aborts the old request and ignores its late response", async () => {
      let resolveOld;
      let oldSignal;
      globalThis.fetch = (url, { signal }) => {
        if (url === "/old.csv") {
          oldSignal = signal;
          return new Promise((resolve) => { resolveOld = resolve; });
        }
        return Promise.resolve(ok(csv.replaceAll("example-", "new-")));
      };
      await render({ urls: "/old.csv" });
      assert.equal(state.loading, true);
      await render({ urls: "/new.csv" });
      assert.equal(oldSignal.aborted, true);
      assert.ok(state.items.every((item) => item.id.startsWith("new-")));
      await act(async () => { resolveOld(ok()); await flush(); });
      assert.ok(state.items.every((item) => item.id.startsWith("new-")));
      await reset();
    });
    await suite.test("StrictMode cleanup and unmount abort requests safely", async () => {
      const signals = [];
      globalThis.fetch = async (_url, { signal }) => { signals.push(signal); return ok(); };
      await render({}, true);
      assert.equal(state.totalCount, 6);
      assert.ok(signals.length >= 2);
      assert.equal(signals[0].aborted, true);
      await reset();
      assert.ok(signals.every((signal) => signal.aborted));
    });
  } finally {
    await reset();
    dom.window.close();
    globalThis.window = previous.window;
    globalThis.document = previous.document;
    globalThis.fetch = previous.fetch;
    globalThis.IS_REACT_ACT_ENVIRONMENT = previous.act;
  }
});
