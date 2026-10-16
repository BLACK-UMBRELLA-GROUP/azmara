"use strict";

// DEC-097 publication staging: two-file full-bleed oasis repair only.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

const root = fs.realpathSync(path.resolve(__dirname, "../.."));
const prototype = path.join(root, "prototype");
const site = path.join(root, "sites/azmara-private-preview");
const dist = path.join(site, "dist");
const evidence = path.join(root, "evidence/2026-10-15-oasis-full-bleed");
const manifest = JSON.parse(fs.readFileSync(path.join(site, ".openai/hosting.json"), "utf8"));

assert.equal(manifest.project_id, "appgprj_6ac7643d3f588191ba2157dfe1972c3d");
assert.deepEqual(manifest.static, { directory: "dist" });

const app = fs.readFileSync(path.join(prototype, "app.js"), "utf8");
assert.match(
  app,
  /id="azmara-oasis-foundation"[^>]*x="\$\{DESKTOP_ART\.x\}"[^>]*y="\$\{DESKTOP_ART\.y\}"[^>]*width="\$\{DESKTOP_ART\.width\}"[^>]*height="\$\{DESKTOP_ART\.height\}"[^>]*preserveAspectRatio="xMidYMid slice"/
);
assert.doesNotMatch(app, /id="azmara-oasis-foundation"[^>]*x="300"/);

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

const hash = (file) =>
  crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
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
      decision: "DEC-097",
      projectId: manifest.project_id,
      changedFiles: hashes,
      runtimeFiles: after.length,
      byteExact: true,
      manifestUnchanged: true,
      browserLaunched: false,
      verification: "The exact centred cover crop was rendered and inspected offline; manual live-browser review remains required.",
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
