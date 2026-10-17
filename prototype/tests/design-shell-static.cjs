"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const prototype = path.resolve(__dirname, "..");
const script = fs.readFileSync(path.join(prototype, "design-shell.js"), "utf8");
const css = fs.readFileSync(path.join(prototype, "design-shell.css"), "utf8");

const values = {
  "desktop-town-name": "Gizmon",
  "counter-population": "—",
  "desktop-resource-coins": "2,400",
  "desktop-resource-timber": "760",
  "desktop-resource-stone": "540",
  "desktop-resource-silver": "—",
  "desktop-resource-grain": "—",
  "desktop-resource-iron": "—"
};
const placeholders = new Set([
  "desktop-resource-silver",
  "desktop-resource-grain",
  "desktop-resource-iron"
]);
const nodes = {};
for (const [id, value] of Object.entries(values)) {
  nodes[id] = {
    textContent: placeholders.has(id) ? value + "Not simulated" : value,
    querySelector(selector) {
      return selector === '[aria-hidden="true"]' && placeholders.has(id)
        ? { textContent: value }
        : null;
    }
  };
}
for (const id of [
  "floating-town-name",
  "floating-population",
  "floating-resource-coins",
  "floating-resource-timber",
  "floating-resource-stone",
  "floating-resource-silver",
  "floating-resource-grain",
  "floating-resource-iron"
]) nodes[id] = { textContent: "" };

const context = {
  document: {
    body: { dataset: {} },
    getElementById: (id) => nodes[id] || null
  },
  localStorage: { getItem: () => null, setItem: () => {} },
  MutationObserver: class { observe() {} }
};
vm.runInNewContext(script, context, { filename: "design-shell.js" });

assert.equal(nodes["floating-resource-coins"].textContent, "2,400");
for (const id of ["silver", "grain", "iron"]) {
  assert.equal(nodes[`floating-resource-${id}`].textContent, "—", `${id} leaked assistive placeholder copy into the town bar`);
}

const desktopStart = css.indexOf("@media (min-width: 1024px)");
const desktopEnd = css.indexOf("@media (max-width: 699px)", desktopStart);
const desktop = desktopStart >= 0 && desktopEnd > desktopStart ? css.slice(desktopStart, desktopEnd) : "";
assert.match(desktop, /\.azmara-resource-ribbon\s*\{\s*overflow-x:\s*hidden;/);
assert.match(desktop, /\.azmara-resource-chip\s*\{[\s\S]*?flex:\s*1 1 0;[\s\S]*?min-width:\s*0;/);
assert.match(css, /\.azmara-resource-ribbon\s*\{[\s\S]*?overflow-x:\s*auto;/, "Phone-capable resource scrolling was removed");
assert.match(css, /@media \(max-width: 699px\)/, "Phone town-bar rules are missing");

console.log("PASS town-bar mirrors visible values, fits all desktop resources and retains phone scrolling");
