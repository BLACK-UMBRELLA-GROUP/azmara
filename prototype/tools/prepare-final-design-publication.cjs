"use strict";

// DEC-096 publication staging: publish the approved final-design foundation
// without changing player data, gameplay rules, native files, or site access.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

const root = fs.realpathSync(path.resolve(__dirname, "../.."));
const prototype = path.join(root, "prototype");
const site = path.join(root, "sites/azmara-private-preview");
const dist = path.join(site, "dist");
const evidence = path.join(root, "evidence/2026-10-15-final-design-publication");
const manifest = JSON.parse(fs.readFileSync(path.join(site, ".openai/hosting.json"), "utf8"));

assert.equal(manifest.project_id, "appgprj_6ac7643d3f588191ba2157dfe1972c3d");
assert.equal(manifest.static.directory, "dist");
fs.mkdirSync(evidence, { recursive: true });

const files = new Set(
  fs.readdirSync(prototype).filter((name) => /\.(html|css|js)$/.test(name))
);

function walk(directory, prefix = "") {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    assert(!entry.isSymbolicLink(), "No links in publication");
    const relative = prefix + entry.name;
    if (entry.isDirectory()) walk(path.join(directory, entry.name), `${relative}/`);
    else {
      assert(entry.isFile());
      files.add(relative);
    }
  }
}

// Retain all previously published runtime art for save compatibility and
// rollback. Add the new, building-free oasis foundation used by the shell.
walk(path.join(dist, "assets"), "assets/");
files.add("assets/azmara-oasis-foundation-v1.png");

const hash = (file) =>
  crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const receipt = {
  decision: "DEC-096",
  projectId: manifest.project_id,
  files: {},
  excluded: [
    "project documents",
    "tests",
    "tools",
    "evidence screenshots",
    "native app",
    "player data",
    "image-generation prompts",
  ],
  knownLimits: [
    "no browser/device pass under the standing no-auto-Chrome rule",
    "manual owner reload and visual/input review required",
    "gameplay and economy rules remain unchanged",
  ],
};

for (const name of [...files].sort()) {
  assert(
    /^(assets\/.*\.(png|svg)|assets\/streets\/manifest\.json|[^/]+\.(html|css|js))$/.test(name),
    `Unexpected runtime file: ${name}`
  );
  const from = path.join(prototype, name);
  const to = path.join(dist, name);
  assert(fs.existsSync(from), `Missing source: ${name}`);
  const source = fs.lstatSync(from);
  assert(source.isFile() && !source.isSymbolicLink(), `Unsafe source: ${name}`);
  if (/\.(html|css|js|svg)$/.test(name)) {
    const text = fs.readFileSync(from, "utf8");
    assert(
      !/stOAa[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]+|github_pat_[A-Za-z0-9_]+|sk-proj-[A-Za-z0-9_-]+|PRIVATE — API KEYS/i.test(text),
      `Sensitive source pattern: ${name}`
    );
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  assert.equal(hash(from), hash(to));
  receipt.files[name] = hash(to);
}

for (const match of fs
  .readFileSync(path.join(dist, "index.html"), "utf8")
  .matchAll(/(?:src|href)="([^"?#]+)(?:\?[^"#]*)?"/g)) {
  const value = match[1];
  if (/^(?:https?:|#|data:)/.test(value)) continue;
  assert(fs.existsSync(path.join(dist, value)), `Missing entry dependency: ${value}`);
}

const actual = [];
function list(directory, prefix = "") {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    assert(!entry.isSymbolicLink(), "No links in packaged runtime");
    const relative = prefix + entry.name;
    entry.isDirectory()
      ? list(path.join(directory, entry.name), `${relative}/`)
      : actual.push(relative);
  }
}
list(dist);
assert.deepEqual(actual.sort(), [...files].sort());

fs.writeFileSync(
  path.join(evidence, "publication-source-receipt.json"),
  `${JSON.stringify(
    {
      ...receipt,
      runtimeFiles: files.size,
      byteExact: true,
      manifestUnchanged: true,
    },
    null,
    2
  )}\n`
);

console.log(
  JSON.stringify({
    passed: true,
    runtimeFiles: files.size,
    byteExact: true,
    manifestUnchanged: true,
    excluded: receipt.excluded,
    knownLimits: receipt.knownLimits,
  })
);
