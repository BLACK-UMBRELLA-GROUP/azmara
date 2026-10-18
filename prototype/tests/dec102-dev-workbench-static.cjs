"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const prototype = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(prototype, "app.js"), "utf8");
const index = fs.readFileSync(path.join(prototype, "index.html"), "utf8");

const EXPECTED_BUILDINGS = Object.freeze([
  "Garrison",
  "Cavalry Yard",
  "Hospital",
  "Armoury",
  "Town Wall",
  "Caravan Yard",
  "Haulage Yard",
  "Trading Post",
  "Vault",
  "Town Hall",
  "Royal Palace",
  "Royal Lodge",
  "University",
  "School",
  "Library",
  "Bazaar",
  "Prayer Garden",
  "Courtyard Homes",
  "Toolmaker",
  "Architect's Office",
  "Warehouse"
]);
const EXPECTED_LAND_LEVELS = Object.freeze([1, 5, 8, 12, 17, 22, 28, 34, 41, 45, 50]);

function section(source, from, to) {
  const start = source.indexOf(from);
  assert.notEqual(start, -1, `Missing source marker: ${from}`);
  const end = source.indexOf(to, start + from.length);
  assert.notEqual(end, -1, `Missing source marker: ${to}`);
  return source.slice(start, end);
}

function balancedSlice(source, start, terminates) {
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  let round = 0;
  let square = 0;
  let curly = 0;
  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];
    if (lineComment) {
      if (character === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (character === "*" && next === "/") { blockComment = false; index += 1; }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === "/" && next === "/") { lineComment = true; index += 1; continue; }
    if (character === "/" && next === "*") { blockComment = true; index += 1; continue; }
    if (character === "\"" || character === "'" || character === "`") { quote = character; continue; }
    if (character === "(") round += 1;
    else if (character === ")") round -= 1;
    else if (character === "[") square += 1;
    else if (character === "]") square -= 1;
    else if (character === "{") curly += 1;
    else if (character === "}") curly -= 1;
    if (terminates(character, { round, square, curly }, index)) return source.slice(start, index + 1);
  }
  assert.fail("Unterminated source expression");
}

function expressionFor(name) {
  const marker = `const ${name}`;
  const declaration = app.indexOf(marker);
  assert.notEqual(declaration, -1, `Missing constant ${name}`);
  const equals = app.indexOf("=", declaration + marker.length);
  assert.notEqual(equals, -1, `Missing assignment for ${name}`);
  const raw = balancedSlice(app, equals + 1, (character, depth) =>
    character === ";" && depth.round === 0 && depth.square === 0 && depth.curly === 0);
  return raw.slice(0, -1).trim();
}

function functionFor(name) {
  const marker = `function ${name}(`;
  const start = app.indexOf(marker);
  assert.notEqual(start, -1, `Missing pure helper ${name}`);
  const open = app.indexOf("{", start + marker.length);
  assert.notEqual(open, -1, `Missing function body for ${name}`);
  return balancedSlice(app, start, (character, depth, index) =>
    index >= open && character === "}" && depth.curly === 0);
}

function evaluateFunction(name, extras = {}) {
  return vm.runInNewContext(`(${functionFor(name)})`, {
    MAX_RESOURCE: 1_000_000,
    structuredClone,
    ...extras
  });
}

const buildingOptions = vm.runInNewContext(expressionFor("DEV_BUILDING_OPTIONS"));
assert.equal(buildingOptions.length, 21, "Dev building list must contain exactly 21 placeholders");
const buildingNames = buildingOptions.map((entry) => typeof entry === "string" ? entry : entry.name);
assert.deepEqual(Array.from(buildingNames), Array.from(EXPECTED_BUILDINGS));
assert.equal(new Set(buildingOptions.map((entry) => typeof entry === "string" ? entry : entry.id)).size, 21,
  "Dev building placeholder IDs must be unique");
assert(!buildingNames.includes("Academy"), "Academy must not remain in the locked 21-building list");

assert.equal(vm.runInNewContext(expressionFor("DEV_LAND_STAGE_DEFAULT")), 1,
  "Dev must start with temporary Land Stage 1");
const landContext = { window: {} };
vm.createContext(landContext);
vm.runInContext(fs.readFileSync(path.join(prototype, "building-art.js"), "utf8"), landContext);
vm.runInContext(fs.readFileSync(path.join(prototype, "land-stages.js"), "utf8"), landContext);
assert.deepEqual(Array.from(landContext.window.AzmaraLandStages.milestones), Array.from(EXPECTED_LAND_LEVELS));

assert.match(app, /<select[^>]+id="dev-land-stage"/);
assert.match(app, /AzmaraLandStages\.milestones\.map[\s\S]*?<option/);
assert(!app.includes("data-land-stage-level"), "The retired row of Land Stage buttons must be gone");
assert.match(app, /let devHallLevelOverride = DEV_LAND_STAGE_DEFAULT/);
assert.match(app, /event\.target\.id === "dev-land-stage"[\s\S]*?devHallLevelOverride = level/);
assert.match(app, /event\.target\.closest\("#reset-land-stage"\)[\s\S]*?devHallLevelOverride = null/);

assert.match(app, /<select[^>]+id="dev-building-choice"/);
assert(!app.includes("dev-building-level"), "The placeholder building dropdown must not expose levels");
const saveStateSource = section(app, "function saveState(", "function announce(");
assert(!saveStateSource.includes("devHallLevelOverride"), "Temporary Land Stage leaked into saves");
assert(!saveStateSource.includes("devBuildingChoice"), "Placeholder building choice leaked into saves");

for (const marker of [
  'data-panel="appearance"',
  'id="appearance-type"',
  'id="appearance-level"',
  'id="appearance-review-status"',
  'id="finish-appearance-review"',
  "window.AzmaraAppearanceReview",
  'openView?.type === "appearance"',
  'openView.type === "appearance"'
]) {
  assert(!app.includes(marker), `Appearance Review runtime remains: ${marker}`);
  assert(!index.includes(marker), `Appearance Review entry remains in HTML: ${marker}`);
}

for (const id of ["dev-supply-coins", "dev-supply-timber", "dev-supply-clay", "apply-test-supplies"]) {
  assert(app.includes(`id="${id}"`), `Missing Test Supplies control ${id}`);
}
assert.match(app, /const MAX_RESOURCE = 1000000|const MAX_RESOURCE = 1_000_000/);
const parseDevSupplyValue = evaluateFunction("parseDevSupplyValue");
for (const [raw, expected] of [["1", 1], ["999999", 999999], ["1000000", 1000000]]) {
  assert.equal(parseDevSupplyValue(raw), expected, `Valid supply value rejected: ${raw}`);
}
for (const raw of ["", "0", "1000001", "1.5", "1e3", "+5", "-1", " 5", "5 "]) {
  const value = parseDevSupplyValue(raw);
  assert(value === null || value === undefined || Number.isNaN(value), `Invalid supply value accepted: ${JSON.stringify(raw)}`);
}

const removeSavedAcademy = evaluateFunction("removeSavedAcademy");
const academyState = {
  version: 3,
  layoutId: "town-23-v1",
  townName: "Kept town",
  resources: { coins: 2100, timber: 650, stone: 450 },
  hallLevel: 8,
  construction: {
    buildingId: "general-03",
    typeId: "warehouse",
    toLevel: 2,
    startedAt: 1,
    endsAt: 120001,
    paidCost: { coins: 240, timber: 130, stone: 100 }
  },
  plotLayout: "staggered",
  buildings: {
    "general-02": { typeId: "academy", level: 1 },
    "general-03": { typeId: "warehouse", level: 1 }
  }
};
const academyInput = structuredClone(academyState);
const academyResult = removeSavedAcademy(academyInput);
const repaired = academyResult && typeof academyResult === "object" && academyResult.state
  ? academyResult.state
  : academyResult && typeof academyResult === "object" && academyResult.version
  ? academyResult
  : academyInput;
assert.equal(Object.values(repaired.buildings || {}).some((building) => building.typeId === "academy"), false,
  "Saved Academy was not removed");
assert.deepEqual(repaired.buildings["general-03"], academyState.buildings["general-03"]);
assert.deepEqual(repaired.construction, academyState.construction, "Unrelated construction changed during Academy cleanup");
assert.deepEqual(repaired.resources, academyState.resources, "Resources changed during unrelated Academy cleanup");
assert.equal(repaired.townName, academyState.townName);
assert.equal(repaired.hallLevel, academyState.hallLevel);
assert.equal(repaired.plotLayout, academyState.plotLayout);

const cleanState = structuredClone(academyState);
delete cleanState.buildings["general-02"];
const cleanInput = structuredClone(cleanState);
const cleanResult = removeSavedAcademy(cleanInput);
const unchanged = cleanResult && typeof cleanResult === "object" && cleanResult.state
  ? cleanResult.state
  : cleanResult && typeof cleanResult === "object" && cleanResult.version
  ? cleanResult
  : cleanInput;
assert.deepEqual(unchanged, cleanState, "Academy cleanup changed a save with no Academy");

const academyQueueState = structuredClone(cleanState);
academyQueueState.resources = { coins: 999900, timber: 400, stone: 300 };
academyQueueState.construction = {
  buildingId: "general-02",
  typeId: "academy",
  toLevel: 1,
  startedAt: 1,
  endsAt: 120001,
  paidCost: { coins: 240, timber: 130, stone: 100 }
};
const queueResult = removeSavedAcademy(academyQueueState);
const queueRepaired = queueResult && typeof queueResult === "object" && queueResult.state
  ? queueResult.state
  : academyQueueState;
assert.equal(queueRepaired.construction, null, "Saved Academy construction was not removed");
assert.deepEqual(queueRepaired.resources, { coins: 1000000, timber: 530, stone: 400 },
  "Academy construction receipt was not refunded safely and capped");
assert.equal(queueResult.changed, true, "Academy construction cleanup was not reported");

const resetStart = app.indexOf('    if (event.target.closest("#request-reset")) {');
assert.notEqual(resetStart, -1, "Reset Plots request handler is missing");
const resetEnd = app.indexOf('\n  });\n  content.addEventListener("change"', resetStart);
assert.notEqual(resetEnd, -1, "Reset Plots handler boundary is missing");
const normalizedReset = app.slice(resetStart, resetEnd)
  .replace(/^\s*restoreAppearance\(\);\s*$/m, "")
  .replace(/\s+/g, " ")
  .trim();
assert.equal(crypto.createHash("sha256").update(normalizedReset).digest("hex"),
  "6c1fa1701c269386f7c7848b372a6c578d03df00db1d45ac8c8c89782d0c6392",
  "Reset Plots changed outside the locked scope");

console.log("PASS DEC-102 Dev workbench source and pure-helper invariants");
