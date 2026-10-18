"use strict";

// DEC-104 publication staging. Build the hosted runtime from the canonical,
// audited allowlist so stale previews cannot leak into the live bundle.
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = fs.realpathSync(path.resolve(__dirname, "../.."));
const prototype = path.join(root, "prototype");
const site = path.join(root, "sites/azmara-private-preview");
const dist = path.join(site, "dist");
const evidence = path.join(root, "evidence/2026-10-18-web31-publication");
const hostingPath = path.join(site, ".openai/hosting.json");
const manifestPath = path.join(prototype, "runtime-manifest.txt");
const projectId = "appgprj_6ac7643d3f588191ba2157dfe1972c3d";

const hosting = JSON.parse(fs.readFileSync(hostingPath, "utf8"));
assert.equal(hosting.project_id, projectId);
assert.deepEqual(hosting.static, { directory: "dist" });
assert(fs.realpathSync(dist).startsWith(fs.realpathSync(site) + path.sep));

const files = fs.readFileSync(manifestPath, "utf8")
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);
assert.equal(files.length, 76, "The audited web runtime has exactly 76 files");
assert.equal(new Set(files).size, files.length, "Manifest entries must be unique");
for (const relative of files) {
  assert(!path.isAbsolute(relative) && !relative.split("/").includes(".."), `Unsafe path: ${relative}`);
  const source = path.join(prototype, relative);
  assert(fs.statSync(source).isFile(), `Missing canonical runtime file: ${relative}`);
}

const secretPattern = /stOAa[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]+|github_pat_[A-Za-z0-9_]+|sk-proj-[A-Za-z0-9_-]+|PRIVATE\s*[—-]\s*API KEYS|(?:api[_-]?key|password|secret|token)\s*[:=]\s*["'][^"']{12,}["']/i;
for (const relative of files.filter((name) => /\.(?:html|css|js)$/.test(name))) {
  assert(!secretPattern.test(fs.readFileSync(path.join(prototype, relative), "utf8")), `Sensitive source pattern: ${relative}`);
}

function walk(directory, prefix = "") {
  if (!fs.existsSync(directory)) return [];
  const output = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    assert(!entry.isSymbolicLink(), `No links in publication: ${prefix}${entry.name}`);
    const relative = `${prefix}${entry.name}`;
    if (entry.isDirectory()) output.push(...walk(path.join(directory, entry.name), `${relative}/`));
    else output.push(relative);
  }
  return output;
}

const before = walk(dist).sort();
const allowed = new Set(files);
for (const relative of before) {
  if (!allowed.has(relative)) fs.rmSync(path.join(dist, relative));
}
function removeEmptyDirectories(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const child = path.join(directory, entry.name);
    removeEmptyDirectories(child);
    if (!fs.readdirSync(child).length) fs.rmdirSync(child);
  }
}
removeEmptyDirectories(dist);

const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const hashes = {};
let totalBytes = 0;
for (const relative of files) {
  const source = path.join(prototype, relative);
  const target = path.join(dist, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  assert.equal(hash(target), hash(source), `Byte mismatch: ${relative}`);
  totalBytes += fs.statSync(target).size;
  hashes[relative] = hash(target);
}

const after = walk(dist).sort();
assert.deepEqual(after, [...files].sort(), "Hosted runtime must exactly match the allowlist");
assert.equal(totalBytes, 122212481, "Audited runtime byte total changed");
for (let stage = 1; stage <= 11; stage += 1) {
  const id = String(stage).padStart(2, "0");
  assert(allowed.has(`assets/land/land-stage-${id}.png`));
}
assert(allowed.has("assets/progression/azmara-shipyard-stages-v2.png"), "Legacy saves need Shipyard art");

fs.mkdirSync(evidence, { recursive: true });
fs.writeFileSync(path.join(evidence, "publication-source-receipt.json"), `${JSON.stringify({
  decision: "DEC-104",
  projectId,
  manifest: "prototype/runtime-manifest.txt",
  runtimeFiles: after.length,
  runtimeBytes: totalBytes,
  removedHistoricalFiles: before.filter((name) => !allowed.has(name)),
  hashes,
  byteExact: true,
  browserLaunched: false,
}, null, 2)}\n`);

console.log(JSON.stringify({
  passed: true,
  runtimeFiles: after.length,
  runtimeBytes: totalBytes,
  removedHistoricalFiles: before.filter((name) => !allowed.has(name)).length,
  manifestUnchanged: true,
}));
