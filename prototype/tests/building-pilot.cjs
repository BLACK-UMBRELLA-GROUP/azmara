"use strict";

// Preliminary Academy/Hall-only proof while the remaining artwork is produced.
// This deliberately does not open the catalogue or unfinished building panels.
const { chromium } = require(process.argv[2] || "playwright");
const { markerPoints, assertDrawnMarkers } = require("./marker-proof.cjs");
const { assert, ids, milestones, fixture, cost, subtract, create, raw, saved, openPlot, click, close, mode, settle, picture, legacyKey, legacyRaw } = require("./building-harness.cjs");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
let groups = 0;
const pass = (name) => { groups += 1; console.log("PASS " + name); };

async function cropProof(page) {
  return page.evaluate(async (milestones) => {
    const visuals = milestones.map((level) => window.AzmaraBuildingArt.forBuilding("academy", level));
    const image = new Image(); image.src = visuals[0].src; await image.decode();
    const canvas = document.createElement("canvas"); canvas.width = 384; canvas.height = 256;
    const context = canvas.getContext("2d", { willReadFrequently: true }); context.imageSmoothingQuality = "high";
    const native = document.createElement("canvas"); native.width = image.naturalWidth; native.height = image.naturalHeight;
    const nativeContext = native.getContext("2d", { willReadFrequently:true }); nativeContext.drawImage(image,0,0);
    let previous;
    const stages = visuals.map((visual) => {
      context.clearRect(0, 0, 384, 256); context.drawImage(image, ...visual.rect, 0, 0, 384, 256);
      const rgba = context.getImageData(0, 0, 384, 256).data;
      let opaque = 0, transparent = 0, union = 0, changed = 0;
      let minX = 384, minY = 256, maxX = 0, maxY = 0;
      for (let offset = 0; offset < rgba.length; offset += 4) {
        if (rgba[offset + 3] >= 240) opaque += 1;
        if (rgba[offset + 3] === 0) transparent += 1;
        if (rgba[offset + 3] >= 32) {
          const pixel = offset / 4; minX = Math.min(minX, pixel % 384); maxX = Math.max(maxX, pixel % 384);
          minY = Math.min(minY, Math.floor(pixel / 384)); maxY = Math.max(maxY, Math.floor(pixel / 384));
        }
        if (previous && (rgba[offset + 3] >= 32 || previous[offset + 3] >= 32)) {
          union += 1;
          if ([0,1,2,3].some((channel) => Math.abs(rgba[offset + channel] - previous[offset + channel]) >= 18)) changed += 1;
        }
      }
      const [x,y,width,height] = visual.rect;
      const result = { level: visual.minLevel, stage: visual.stage, cell: visual.cell, rect: visual.rect, opaque, transparent,
        corners: [[x,y],[x+width-1,y],[x,y+height-1],[x+width-1,y+height-1]].map(([x,y]) => nativeContext.getImageData(x,y,1,1).data[3]),
        paintedWidth: (maxX - minX + 1) / 384, paintedHeight: (maxY - minY + 1) / 256,
        difference: union ? changed / union : null };
      previous = new Uint8ClampedArray(rgba); return result;
    });
    context.clearRect(0, 0, 384, 256);
    context.drawImage(image, image.naturalWidth * 3 / 4, image.naturalHeight * 2 / 3, image.naturalWidth / 4, image.naturalHeight / 3, 0, 0, 384, 256);
    const unused = context.getImageData(0, 0, 384, 256).data;
    let unusedPainted = 0;
    for (let offset = 3; offset < unused.length; offset += 4) if (unused[offset] >= 32) unusedPainted += 1;
    return { width: image.naturalWidth, height: image.naturalHeight, src: visuals[0].src, stages, unusedPainted };
  }, milestones);
}

async function exactCrop(page, level) {
  const actual = await page.locator('[data-plot="general-02"] .building-frame').evaluate(async (frame) => {
    const sprite = frame.querySelector(".building-sprite"), style = getComputedStyle(sprite);
    const image = new Image(); image.src = style.backgroundImage.match(/^url\("?(.*?)"?\)$/)?.[1]; await image.decode();
    const size = style.backgroundSize.split(" ").map(parseFloat), position = style.backgroundPosition.split(" ").map(parseFloat);
    const width = image.naturalWidth * 100 / size[0], height = image.naturalHeight * 100 / size[1];
    const crop = [position[0] / 100 * (image.naturalWidth - width), position[1] / 100 * (image.naturalHeight - height), width, height];
    const box = sprite.getBoundingClientRect();
    return { cell: Number(frame.dataset.artCell), stage: Number(frame.dataset.artStage), declared: frame.dataset.artRect.split(",").map(Number),
      crop, width: image.naturalWidth, height: image.naturalHeight, aspect: box.width / box.height,
      visual: window.AzmaraBuildingArt.forBuilding("academy", Number(frame.closest(".plot-marker").dataset.buildingLevel)) };
  });
  assert.equal(actual.stage, milestones.indexOf(level) + 1); assert.equal(actual.cell, actual.stage - 1);
  assert.deepEqual(actual.declared, actual.visual.rect);
  assert(actual.crop.every((value, index) => Math.abs(value - actual.declared[index]) <= .01), "Rendered CSS crop differs from approved native rectangle: " + JSON.stringify(actual));
  assert(Math.abs(actual.aspect - actual.crop[2] / actual.crop[3]) <= .01, "Rendered Academy crop is stretched");
}

async function mapProof(page) {
  const points = await markerPoints(page, true);
  assert.deepEqual(points.map((point) => point.id), ids);
  for (const point of points) {
    assert(point.insideTarget && point.exposed && point.rect.width >= 44 && point.rect.height >= 44, "Unexposed Academy/Hall pilot target " + point.id);
    assert(point.imageDx <= .55 && point.imageDy <= .55, "Artwork/target registration lost " + point.id);
    for (const other of points) if (point.id < other.id) {
      const x = Math.min(point.rect.right, other.rect.right) - Math.max(point.rect.x, other.rect.x);
      const y = Math.min(point.rect.bottom, other.rect.bottom) - Math.max(point.rect.y, other.rect.y);
      assert(x <= 0 || y <= 0, "Overlapping pilot plot targets " + point.id + "/" + other.id);
    }
  }
  await assertDrawnMarkers(page, points, true);
  return points;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const { context, page, errors } = await create(browser, fixture({ hallLevel: 50 }));
    try {
      const initialRaw = await raw(page), initial = await saved(page);
      const crops = await cropProof(page);
      assert.equal(crops.width, 1254); assert.equal(crops.height, 1254);
      assert.deepEqual(crops.stages.map((stage) => stage.level), milestones);
      // The approved repaired pilot has an unused duplicate50 in cell12.
      // Only cells0..10 may be selected; it is not part of level progression.
      for (let level = 1; level <= 50; level += 1) assert((await page.evaluate((level) => window.AzmaraBuildingArt.forBuilding("academy", level).cell, level)) <= 10, "Unused twelfth Academy cell entered active progression");
      for (const stage of crops.stages) {
        const [x,y,width,height] = stage.rect, cellX = stage.cell % 4 * crops.width / 4, cellY = Math.floor(stage.cell / 4) * crops.height / 3;
        assert(x >= cellX && y >= cellY && width > 0 && height > 0 && x + width <= cellX + crops.width / 4 + .01 && y + height <= cellY + crops.height / 3 + .01, "Academy crop crosses stage cell");
        // Approved source quantization bound: native corners are at most1/255
        // opaque; >10% of the sampled crop must remain exactly transparent.
        assert(stage.opaque > 384 * 256 * .03 && stage.transparent > 384 * 256 * .10 && stage.corners.every((alpha) => alpha <= 1), "Blank/background-baked Academy stage " + stage.level);
        assert(stage.paintedWidth >= .25 && stage.paintedHeight >= .25, "Academy stage lost visible painted extent");
        if (stage.difference !== null) assert(stage.difference >= .04, "Academy adjacent stages lack meaningful pixel difference " + stage.level);
        pass("Academy level " + stage.level + ": real isolated tight crop, transparent corners and distinct painted material");
      }
      assert.equal(await raw(page), initialRaw);
      await openPlot(page, "general-02");
      assert.equal(await page.locator("#building-type").inputValue(), "academy");
      await click(page, "#build-selected");
      let state = await saved(page); assert.equal(state.construction.typeId, "academy"); assert.equal(state.construction.toLevel, 1);
      assert.deepEqual(state.resources, subtract(initial.resources, cost(1)));
      await click(page, "#skip-construction");
      state = await saved(page); assert.deepEqual(state.buildings["general-02"], { typeId: "academy", level: 1 }); assert.equal(state.construction, null);
      await click(page, "#upgrade-building"); await click(page, "#skip-construction");
      state = await saved(page); assert.deepEqual(state.buildings["general-02"], { typeId: "academy", level: 2 });
      assert.deepEqual(state.resources, subtract(subtract(initial.resources, cost(1)), cost(1)));
      pass("Actual Academy Build1 / Skip / Update2 / Skip keep exact single charges and compatible saved plot");
      const poses = [];
      for (const level of milestones) {
        await page.locator("#test-building-level").selectOption(String(level)); await click(page, "#set-test-level"); await close(page);
        await exactCrop(page, level);
        const points = await mapProof(page); poses.push(points.map(({id,rect}) => ({id,rect})));
        assert.equal((await saved(page)).hallLevel, 50);
        assert.deepEqual((await saved(page)).buildings["general-02"], { typeId: "academy", level });
        if (level === 1 || level === 50) await picture(page, `isolated-academy-${level}-hall50-1440x900`);
        pass("Academy actual level " + level + ": exact CSS native crop and 23 real source-matching exposed nonoverlapping targets");
        await openPlot(page, "general-02");
      }
      for (const pose of poses.slice(1)) assert.deepEqual(pose, poses[0], "Milestone changes moved targets/camera");
      assert.equal(await page.locator("#upgrade-building").isDisabled(), true);
      assert.match(await page.locator("#upgrade-building").innerText(), /Level 50/);
      await close(page);
      const finalRaw = await raw(page);
      await mode(page, "gameplay"); assert.equal(await raw(page), finalRaw);
      await mode(page, "dev"); await page.reload(); await settle(page); assert.equal(await raw(page), finalRaw);
      await mapProof(page); await picture(page, "isolated-academy50-hall50-reloaded-1440x900");
      assert.equal(await raw(page, legacyKey), legacyRaw); assert.deepEqual(errors, [], "Academy-only browser/console/request/HTTP errors");
      pass("Academy50 cap, Dev/Gameplay and reload preserve actual levels/resources/raw saves and painted artwork");
      const asset = path.join(__dirname, "..", crops.src);
      console.log(JSON.stringify({ preliminary: true, groupsPassed: groups, academyCrops: 11, browserErrors: errors.length,
        unusedCellPaintedPixels: crops.unusedPainted,
        atlasSHA256: crypto.createHash("sha256").update(fs.readFileSync(asset)).digest("hex"),
        runtimeSHA256: crypto.createHash("sha256").update(fs.readFileSync(path.join(__dirname,"../app.js"))).digest("hex") }));
    } finally { await context.close(); }
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
