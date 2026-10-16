"use strict";

// DEC-098 publication staging: bind the oasis to the actual Fit surface.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

const root = fs.realpathSync(path.resolve(__dirname, "../.."));
const prototype = path.join(root, "prototype");
const site = path.join(root, "sites/azmara-private-preview");
const dist = path.join(site, "dist");
const evidence = path.join(root, "evidence/2026-10-15-oasis-fit-bounds");
const manifest = JSON.parse(fs.readFileSync(path.join(site, ".openai/hosting.json"), "utf8"));

assert.equal(manifest.project_id, "appgprj_6ac7643d3f588191ba2157dfe1972c3d");
assert.deepEqual(manifest.static, { directory: "dist" });
fs.mkdirSync(evidence, { recursive: true });

const app = fs.readFileSync(path.join(prototype, "app.js"), "utf8");
const index = fs.readFileSync(path.join(prototype, "index.html"), "utf8");
assert.match(app, /function syncOasisFoundationBounds\(bounds\)/);
assert.match(app, /if \(fitMap\) syncOasisFoundationBounds\(bounds\)/);
assert.equal(
  [...app.matchAll(/id="azmara-oasis-foundation"[^>]*x="\$\{x\}"[^>]*y="\$\{y\}"[^>]*width="\$\{width\}"[^>]*height="\$\{height\}"[^>]*preserveAspectRatio="xMidYMid slice"/g)].length,
  2,
  "Desktop and compact foundations must both cover the actual Fit bounds"
);
assert.doesNotMatch(app, /id="azmara-oasis-foundation"[^>]*x="\$\{DESKTOP_ART\.x\}"/);
assert.match(index, /app\.js\?v=20261015-fit-bounds-web29/);

const files = ["app.js", "index.html"];
const before = [];
function list(directory, prefix = "") {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    assert(!entry.isSymbolicLink(), "No links in publication");
    const relative = prefix + entry.name;
    entry.isDirectory()
      ? list(path.join(directory, entry.name), `${relative}/`)
      : before.push(relative);
  }
}
list(dist);

const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const hashes = {};
for (const name of files) {
  const from = path.join(prototype, name);
  const to = path.join(dist, name);
  const text = fs.readFileSync(from, "utf8");
  assert(
    !/stOAa[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]+|github_pat_[A-Za-z0-9_]+|sk-proj-[A-Za-z0-9_-]+|PRIVATE — API KEYS/i.test(text),
    `Sensitive source pattern: ${name}`
  );
  fs.copyFileSync(from, to);
  assert.equal(hash(from), hash(to));
  hashes[name] = hash(to);
}

const after = [];
function relist(directory, prefix = "") {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    assert(!entry.isSymbolicLink(), "No links in staged runtime");
    const relative = prefix + entry.name;
    entry.isDirectory()
      ? relist(path.join(directory, entry.name), `${relative}/`)
      : after.push(relative);
  }
}
relist(dist);
assert.deepEqual(after.sort(), before.sort(), "Repair must not add or remove runtime files");

fs.writeFileSync(
  path.join(evidence, "publication-source-receipt.json"),
  `${JSON.stringify(
    {
      decision: "DEC-098",
      projectId: manifest.project_id,
      changedFiles: hashes,
      runtimeFiles: after.length,
      byteExact: true,
      manifestUnchanged: true,
      browserLaunched: false,
      verification: "Both responsive profiles bind the foundation rectangle to the actual Fit bounds; manual live-browser review remains required.",
    },
    null,
    2
  )}\n`
);

console.log(
  JSON.stringify({
    passed: true,
    changedFiles: files,
    runtimeFiles: after.length,
    byteExact: true,
    manifestUnchanged: true,
  })
);
