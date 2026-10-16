"use strict";

// Read-only alpha/component ownership proof. No image normalization or writes.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const dependencyRoot = process.env.AZMARA_NODE_MODULES;
const sharp = dependencyRoot ? require(path.join(dependencyRoot, "sharp")) : require("sharp");
const prototype = path.resolve(__dirname, "..");
const realm = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(prototype, "building-art.js"), "utf8"), realm);
const atlas = realm.window.AzmaraBuildingArt.sceneryDecor.atlas;
(async () => {
  const bytes = fs.readFileSync(path.join(prototype, atlas.src));
  const { data, info } = await sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  assert.equal(width, atlas.width); assert.equal(height, atlas.height);
  const labels = new Uint32Array(width * height), queue = new Uint32Array(width * height), components = [null];
  for (let seed = 0; seed < labels.length; seed++) {
    if (labels[seed] || data[seed * 4 + 3] <= 30) continue;
    const label = components.length; let head = 0, tail = 1;
    queue[0] = seed; labels[seed] = label;
    let minX = width, minY = height, maxX = 0, maxY = 0;
    while (head < tail) {
      const at = queue[head++], x = at % width, y = Math.floor(at / width);
      minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if ((!dx && !dy) || nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const next = ny * width + nx;
        if (!labels[next] && data[next * 4 + 3] > 30) { labels[next] = label; queue[tail++] = next; }
      }
    }
    components.push({ label, pixels: tail, bounds: [minX, minY, maxX - minX + 1, maxY - minY + 1] });
  }
  const crops = {};
  for (const [kind, [x, y, w, h]] of Object.entries(atlas.rects)) {
    const painted = new Map();
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) {
      const label = labels[yy * width + xx];
      if (label) painted.set(label, (painted.get(label) || 0) + 1);
    }
    const bodies = [...painted].filter(([label]) => components[label].pixels >= 40);
    assert(bodies.some(([label]) => components[label].pixels >= 1000), kind + " actual substantial illustrated body");
    for (const [label, count] of bodies) assert.equal(count, components[label].pixels, kind + " contains complete alpha-owned body/props, no clipped neighboring component");
    crops[kind] = { rect: [x, y, w, h], paintedPixels: [...painted.values()].reduce((a, b) => a + b, 0), ownedComponentsOver40: bodies.map(([label]) => components[label]), partialForeignComponents: 0 };
  }
  console.log(JSON.stringify({ source: atlas.src, sourceSha256: crypto.createHash("sha256").update(bytes).digest("hex"), width, height, alphaThreshold: 30, componentThreshold: 40, cropCount: Object.keys(crops).length, crops, imageWrites: false, browserCertification: false }));
})();
