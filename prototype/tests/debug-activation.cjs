"use strict";

// Browser-free activation checks. Fixtures live only in memory; no saved town,
// real DOM, image, browser, server or on-disk fixture is created or changed.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../debug-overlay.js"), "utf8");
let cases = 0;

function run(context) {
  vm.runInContext(source, context, { filename: "debug-overlay.js", timeout: 1000 });
}

function realm(url, document, extra = {}) {
  const location = new URL(url);
  const context = vm.createContext({ location, URLSearchParams, document, ...extra });
  Object.defineProperty(context, "localStorage", {
    get() { assert.fail("Activation must not access saved towns"); }
  });
  return context;
}

function rejectBeforeDOM(url) {
  const document = new Proxy({}, {
    get() { assert.fail("Rejected URL must not access the DOM: " + url); }
  });
  run(realm(url, document));
  cases++;
}

function fixture(url, { missing, duplicate = false } = {}) {
  const nodes = new Map();
  const created = [], listeners = [], observations = [];
  const element = tag => ({
    tag, dataset: {}, style: {}, children: [], attributes: new Map(),
    setAttribute(name, value) { this.attributes.set(name, value); },
    append(...children) {
      this.children.push(...children);
      for (const child of children) if (child.id) nodes.set("#" + child.id, child);
    },
    addEventListener(...args) { listeners.push({ target: this, args }); }
  });
  for (const selector of ["#map-viewport", "#town-map", "#world-landscape", ".scene"]) {
    if (selector !== missing) nodes.set(selector, element(selector));
  }
  if (duplicate) nodes.set("#town-debug-grid", element("existing-grid"));
  const document = {
    head: element("head"), body: element("body"),
    querySelector(selector) { return nodes.get(selector) || null; },
    createElement(tag) { const node = element(tag); created.push(node); return node; },
    createElementNS(namespace, tag) { return this.createElement(tag); },
    addEventListener(...args) { listeners.push({ target: this, args }); }
  };
  document.body.dataset.previewMode = "dev";
  class Observer {
    observe(target, options) { observations.push({ target, options }); }
  }
  const context = realm(url, document, {
    ResizeObserver: Observer, MutationObserver: Observer,
    requestAnimationFrame() { assert.fail("Activation must leave the grid off"); }
  });
  const counts = () => [created.length, listeners.length, observations.length];
  return { context, document, nodes, counts };
}

for (const host of [
  "azmara.app", "example.test", "localhost.example.test",
  "127.0.0.1.example.test", "0.0.0.0", "localhost."
]) rejectBeforeDOM(`https://${host}/?debug=1`);

for (const host of ["localhost", "127.0.0.1", "[::1]"]) {
  for (const query of ["", "?debug=0", "?debug=true", "?debug=01", "?Debug=1", "?debug=", "?debug=0&debug=1"]) {
    rejectBeforeDOM(`http://${host}:4317/${query}`);
  }
  for (const missing of ["#map-viewport", "#town-map", "#world-landscape"]) {
    const test = fixture(`http://${host}:4317/?debug=1`, { missing });
    run(test.context);
    assert.deepEqual(test.counts(), [0, 0, 0], "Missing map prerequisites must leave the document alone");
    cases++;
  }
  const existing = fixture(`http://${host}:4317/?debug=1`, { duplicate: true });
  run(existing.context);
  assert.deepEqual(existing.counts(), [0, 0, 0], "An existing grid must block a second initialization");
  cases++;

  for (const query of ["?debug=1", "?debug=%31", "?debug=1&debug=0"]) {
    const test = fixture(`http://${host}:4317/${query}`);
    run(test.context);
    const grid = test.nodes.get("#town-debug-grid");
    const info = test.nodes.get("#town-debug-info");
    assert(grid && info, "Explicit local opt-in must initialize diagnostics");
    assert.equal(grid.dataset.enabled, "false", "Diagnostics start disabled");
    assert.match(grid.style.cssText, /display:none(?:;|$)/);
    assert.equal(info.hidden, true);
    const initialized = test.counts();
    assert(initialized.every(count => count > 0), "The fixture must exercise full initialization");
    run(test.context);
    assert.deepEqual(test.counts(), initialized, "Re-execution must not add DOM, handlers or observers");
    assert.equal(test.nodes.get("#town-debug-grid"), grid);
    cases++;
  }
}

console.log(`PASS ${cases} local debug activation cases (browser-free, in-memory fixtures)`);
