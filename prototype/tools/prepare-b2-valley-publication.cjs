"use strict";

// DEC-093 publication staging only: byte-exact runtime copies, no player data.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const root = fs.realpathSync(path.resolve(__dirname, "../.."));
const prototype = path.join(root, "prototype");
const site = path.join(root, "sites/azmara-private-preview");
const dist = path.join(site, "dist");
const evidence = path.join(root, "evidence/2026-10-14-b2-valley-wall");
const manifest = JSON.parse(fs.readFileSync(path.join(site, ".openai/hosting.json"), "utf8"));
assert.equal(manifest.project_id, "appgprj_6ac7643d3f588191ba2157dfe1972c3d");
assert.equal(manifest.static.directory, "dist");

const files = new Set(fs.readdirSync(prototype).filter(name => /\.(html|css|js)$/.test(name)));
function walk(directory, prefix = "") {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    assert(!entry.isSymbolicLink(), "No links in publication");
    const relative = prefix + entry.name;
    if (entry.isDirectory()) walk(path.join(directory, entry.name), relative + "/");
    else { assert(entry.isFile()); files.add(relative); }
  }
}
// Retain every previously published runtime asset for rollback and older save
// compatibility. Add only the new active B2 defence and street layers.
walk(path.join(dist, "assets"), "assets/");
for (const layout of ["staggered", "grid", "circle", "avenues", "garden-quarters"]) {
  for (const profile of ["desktop", "compact"]) files.add(`assets/streets/${layout}-${profile}-v2.png`);
}
for (const stage of ["timber", "adobe", "sandstone"]) files.add(`assets/valley-wall/azmara-valley-defence-${stage}-v3.png`);

const hash = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const receipt = {
  decision: "DEC-093", projectId: manifest.project_id, files: {},
  excluded: ["project documents", "tests", "tools", "evidence screenshots", "native app", "player data", "generation sources"],
  knownLimits: ["no browser/device pass under the standing no-auto-Chrome rule", "manual owner reload still required", "cosmetic wall/roads only"]
};
for (const name of [...files].sort()) {
  assert(/^(assets\/.*\.(png|svg)|assets\/streets\/manifest\.json|[^/]+\.(html|css|js))$/.test(name), `Unexpected runtime file: ${name}`);
  const from = path.join(prototype, name), to = path.join(dist, name);
  assert(fs.lstatSync(from).isFile() && !fs.lstatSync(from).isSymbolicLink(), `Missing source: ${name}`);
  if (/\.(html|css|js|svg)$/.test(name)) {
    const text = fs.readFileSync(from, "utf8");
    assert(!/stOAa[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]+|github_pat_[A-Za-z0-9_]+|sk-proj-[A-Za-z0-9_-]+|PRIVATE — API KEYS/i.test(text), `Sensitive source pattern: ${name}`);
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  assert.equal(hash(from), hash(to));
  receipt.files[name] = hash(to);
}
for (const match of fs.readFileSync(path.join(dist, "index.html"), "utf8").matchAll(/(?:src|href)="([^"?#]+)(?:\?[^"#]*)?"/g)) {
  const value = match[1];
  if (/^(?:https?:|#|data:)/.test(value)) continue;
  assert(fs.existsSync(path.join(dist, value)), `Missing entry dependency: ${value}`);
}
const actual = [];
function list(directory, prefix = "") {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    assert(!entry.isSymbolicLink()); const relative = prefix + entry.name;
    entry.isDirectory() ? list(path.join(directory, entry.name), relative + "/") : actual.push(relative);
  }
}
list(dist);
assert.deepEqual(actual.sort(), [...files].sort());
fs.writeFileSync(path.join(evidence, "publication-source-receipt.json"), JSON.stringify({
  ...receipt, runtimeFiles: files.size, byteExact: true, manifestUnchanged: true
}, null, 2) + "\n");
console.log(JSON.stringify({ passed: true, runtimeFiles: files.size, byteExact: true, manifestUnchanged: true, excluded: receipt.excluded, knownLimits: receipt.knownLimits }));
