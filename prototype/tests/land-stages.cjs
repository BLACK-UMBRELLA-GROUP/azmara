"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "../..");
const prototype = path.join(root, "prototype");
const context = { console };
context.window = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(prototype, "building-art.js"), "utf8"), context);
vm.runInContext(fs.readFileSync(path.join(prototype, "land-stages.js"), "utf8"), context);

const registry = context.AzmaraLandStages;
const expectedMilestones = [1, 5, 8, 12, 17, 22, 28, 34, 41, 45, 50];
assert.deepEqual([...registry.milestones], expectedMilestones);
assert.equal(registry.stages.length, 11);
assert(Object.isFrozen(registry));
assert(Object.isFrozen(registry.stages));
assert(registry.stages.every(Object.isFrozen));

const sourceForStage = (stage) => stage === 1
  ? path.join(root, "docs/approved/art/TOWN_MASTER_CURRENT_VERSION_V3.png")
  : path.join(root, `docs/approved/art/land/LAND_STAGE_${String(stage).padStart(2, "0")}.png`);
const runtimeForStage = (stage) => path.join(prototype, `assets/land/land-stage-${String(stage).padStart(2, "0")}.png`);
const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const pngDimensions = (file) => {
  const bytes = fs.readFileSync(file);
  assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", `${file} is not a PNG`);
  assert.equal(bytes.subarray(12, 16).toString("ascii"), "IHDR", `${file} has no leading IHDR`);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
};

for (const stage of registry.stages) {
  assert.equal(stage.minLevel, expectedMilestones[stage.stage - 1]);
  assert.equal(stage.src, `assets/land/land-stage-${String(stage.stage).padStart(2, "0")}.png`);
  assert.deepEqual(pngDimensions(sourceForStage(stage.stage)), { width: 1536, height: 1024 });
  assert.deepEqual(pngDimensions(runtimeForStage(stage.stage)), { width: 1536, height: 1024 });
  assert.equal(sha256(runtimeForStage(stage.stage)), sha256(sourceForStage(stage.stage)), `Stage ${stage.stage} runtime copy changed`);
  assert.equal(registry.byMilestone[stage.minLevel], stage);
}

assert.deepEqual(
  [1, 4, 5, 7, 8, 11, 12, 16, 17, 21, 22, 27, 28, 33, 34, 40, 41, 44, 45, 49, 50]
    .map((level) => registry.forHallLevel(level).stage),
  [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11]
);

// Review controls pass string values. Both selectors must return the existing
// stage record, including at fractional, clamped and invalid input boundaries.
for (const stage of registry.stages) {
  for (const value of [stage.stage, String(stage.stage), stage.stage + 0.75]) {
    assert.equal(registry.forStage(value), stage, `Stage selection for ${value}`);
  }
}
for (const [value, expectedStage] of [
  [-100, 1], [0, 1], [null, 1], [undefined, 1], ["", 1],
  ["invalid", 1], [NaN, 1], [Infinity, 1], [-Infinity, 1],
  [12, 11], [100, 11], ["100", 11]
]) {
  assert.equal(registry.forStage(value), registry.stages[expectedStage - 1], `Clamped stage selection for ${value}`);
}
for (const [value, expectedStage] of [
  [-100, 1], [0, 1], [null, 1], [undefined, 1], ["", 1],
  ["invalid", 1], [NaN, 1], [Infinity, 1], [-Infinity, 1],
  [4.99, 1], ["5", 2], [7.99, 2], ["8", 3],
  [49.99, 10], ["50", 11], [100, 11]
]) {
  assert.equal(registry.forHallLevel(value), registry.stages[expectedStage - 1], `Clamped hall-level selection for ${value}`);
}

const expectedBoxes = {
  townHall: { pixels: [668, 375, 858, 512], normalized: [668 / 1536, 375 / 1024, 858 / 1536, 512 / 1024] },
  townWall: { pixels: [740, 95, 820, 140], normalized: [740 / 1536, 95 / 1024, 820 / 1536, 140 / 1024] }
};
for (const [id, expected] of Object.entries(expectedBoxes)) {
  const actual = registry.boxes[id];
  assert.deepEqual([actual.pixels.left, actual.pixels.top, actual.pixels.right, actual.pixels.bottom], expected.pixels);
  assert.deepEqual([actual.normalized.left, actual.normalized.top, actual.normalized.right, actual.normalized.bottom], expected.normalized);
  assert.equal(actual.normalized.width, (expected.pixels[2] - expected.pixels[0]) / 1536);
  assert.equal(actual.normalized.height, (expected.pixels[3] - expected.pixels[1]) / 1024);
}

console.log("land-stages: 11 locked stages, selectors, thresholds, dimensions, boxes and byte identity passed");
