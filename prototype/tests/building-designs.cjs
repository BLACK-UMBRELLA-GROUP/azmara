"use strict";

// Raster milestone proof: decoded cropped cell pixels, not a URL/label change.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { chromium } = require(process.argv[2] || "playwright");
const { markerPoints, assertDrawnMarkers } = require("./marker-proof.cjs");
const { assertNativeCrops }=require("./crop-isolation.cjs");
const { assert, types, milestones, fixture, key, legacyKey, legacyRaw, create, raw, saved, menu, close, openPlot, click, mode, picture, settle } = require("./building-harness.cjs");
const {expected:schedules,artLevels}=require("./oct11-schedules.cjs");
const hallMilestones=schedules["town-hall"];
const stageFor=(id,level)=>schedules[id].filter(min=>min<=Math.max(1,Math.min(50,level))).length;
let groups = 0;
let croppedDesigns = 0;
const reviewed = [
  ["general-01", "town-hall"], ["general-02", "academy"], ["wall-01", "town-wall"],
  ["harbour-01", "trading-port"], ["harbour-02", "shipyard"], ["freighter-01", "dockyard"]
];
function representative(level = 1) {
  return fixture({ hallLevel: level, buildings: Object.fromEntries(reviewed.slice(1).map(([id, typeId]) => [id, { typeId, level }])) });
}
async function complete(context, page, errors, name) {
  assert.equal(await raw(page, legacyKey), legacyRaw);
  assert.deepEqual(errors, [], "Artwork browser/console/request/HTTP errors");
  groups += 1; console.log("PASS " + name);
  await context.close();
}
async function pixels(page, typeId) {
  return page.evaluate(async ({ typeId, schedule }) => {
    const visuals = schedule.map((level) => window.AzmaraBuildingArt.forBuilding(typeId, level));
    const decoded = new Map();
    const canvas = document.createElement("canvas"); canvas.width = 384; canvas.height = 256;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.imageSmoothingQuality = "high";
    let previous, previousMin;
    const stages = [];
    for (const visual of visuals) {
      if (!decoded.has(visual.src)) {
        const image = new Image(); image.src = visual.src; await image.decode(); decoded.set(visual.src, image);
      }
      const image = decoded.get(visual.src);
      const native = document.createElement("canvas"); native.width=image.naturalWidth; native.height=image.naturalHeight;
      const nativeContext=native.getContext("2d",{willReadFrequently:true}); nativeContext.drawImage(image,0,0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (visual.atlas) {
        const rect = visual.rect || [visual.cell % 4 * image.naturalWidth / 4, Math.floor(visual.cell / 4) * image.naturalHeight / 3, image.naturalWidth / 4, image.naturalHeight / 3];
        context.drawImage(image, ...rect, 0, 0, 384, 256);
      }
      else context.drawImage(image, 0, 0, 384, 256);
      const rgba = context.getImageData(0, 0, 384, 256).data;
      let opaque = 0, transparent = 0, painted = 0, changed = 0, union = 0;
      let minX = 384, minY = 256, maxX = 0, maxY = 0;
      for (let index = 0; index < rgba.length; index += 4) {
        const alpha = rgba[index + 3];
        if (alpha >= 240) opaque += 1;
        if (alpha === 0) transparent += 1;
        if (alpha >= 32) { painted += 1; const pixel = index / 4; minX = Math.min(minX, pixel % 384); maxX = Math.max(maxX, pixel % 384); minY = Math.min(minY, Math.floor(pixel / 384)); maxY = Math.max(maxY, Math.floor(pixel / 384)); }
        if (previous && (alpha >= 32 || previous[index + 3] >= 32)) {
          union += 1;
          if ([0, 1, 2, 3].some((channel) => Math.abs(rgba[index + channel] - previous[index + channel]) >= 18)) changed += 1;
        }
      }
      const [nativeX,nativeY,nativeW,nativeH]=visual.rect || [0,0,image.naturalWidth,image.naturalHeight];
      const corners=[[nativeX,nativeY],[nativeX+nativeW-1,nativeY],[nativeX,nativeY+nativeH-1],[nativeX+nativeW-1,nativeY+nativeH-1]].map(([x,y])=>nativeContext.getImageData(x,y,1,1).data[3]);
      stages.push({ level: visual.minLevel, stage: visual.stage, atlas: visual.atlas, cell: visual.cell, cols: visual.cols, rows: visual.rows,
        width: image.naturalWidth, height: image.naturalHeight, src: visual.src, rect: visual.rect || null, opaque, transparent, painted, corners,
        visibleWidth: (maxX - minX + 1) / 384, visibleHeight: (maxY - minY + 1) / 256,
        previousMin, changed, union, difference: union ? changed / union : null });
      previous = new Uint8ClampedArray(rgba); previousMin = visual.minLevel;
    }
    let unused = null;
    if (visuals[0].atlas) {
      const image = decoded.get(visuals[0].src);
      context.clearRect(0, 0, 384, 256);
      context.drawImage(image, image.naturalWidth * 3 / 4, image.naturalHeight * 2 / 3, image.naturalWidth / 4, image.naturalHeight / 3, 0, 0, 384, 256);
      const rgba = context.getImageData(0, 0, 384, 256).data;
      unused = [...Array(rgba.length / 4).keys()].filter((index) => rgba[index * 4 + 3] >= 32).length;
    }
    return { stages, unused };
  }, { typeId, schedule:schedules[typeId] });
}

async function paintedOverlay(page) {
  const overlay = page.locator("#town-terrain-overlay");
  const style = await overlay.getAttribute("style");
  assert.equal(await overlay.evaluate((node) => getComputedStyle(node).display !== "none" && node.getAttribute("href")?.startsWith("data:image/svg+xml")), true);
  const visible = await page.screenshot({ scale: "css" });
  await overlay.evaluate((node) => node.style.setProperty("visibility", "hidden", "important"));
  let hidden;
  try { hidden = await page.screenshot({ scale: "css" }); }
  finally { await overlay.evaluate((node, style) => style === null ? node.removeAttribute("style") : node.setAttribute("style", style), style); }
  const changed = await page.evaluate(async ([visible, hidden]) => {
    const decode = async (source) => { const image = new Image(); image.src = "data:image/png;base64," + source; await image.decode(); const canvas = document.createElement("canvas"); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight; const ctx = canvas.getContext("2d"); ctx.drawImage(image, 0, 0); return ctx.getImageData(0, 0, canvas.width, canvas.height).data; };
    const a = await decode(visible), b = await decode(hidden); let changed = 0;
    for (let i = 0; i < a.length; i += 4) if ([0, 1, 2].some((channel) => Math.abs(a[i + channel] - b[i + channel]) >= 8)) changed += 1;
    return changed;
  }, [visible.toString("base64"), hidden.toString("base64")]);
  assert(changed >= 100, "Late milestone terrain overlay exists in DOM but not in actual painted pixels: " + changed);
}

(async () => {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../building-art.js"), "utf8"), sandbox);
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../progression.js"), "utf8"), sandbox);
  const api = sandbox.window.AzmaraBuildingArt, progression = sandbox.window.AzmaraProgression;
  assert(Object.isFrozen(api) && Object.isFrozen(api.milestones) && Object.isFrozen(api.buildingIds));
  assert.deepEqual([...api.milestones], hallMilestones);assert.deepEqual([...api.artLevels],artLevels); assert.deepEqual([...progression.milestones], hallMilestones);
  assert.deepEqual([...api.buildingIds], Object.keys(schedules));
  assert.equal(api.forBuilding("__proto__", 1), null); assert.equal(api.forBuilding("constructor", 50), null);
  for (const type of types) for (let level = 0; level <= 51; level++) {
    const schedule=schedules[type.id],stage=stageFor(type.id,level),milestone=schedule[stage-1],sourceLevel=artLevels[stage-1];
    const visual = api.forBuilding(type.id, level);
    assert(Object.isFrozen(visual)); assert.equal(visual.minLevel, milestone); assert.equal(visual.stage,stage);assert.equal(visual.artLevel,sourceLevel);
    assert.match(visual.src, /^assets\/progression\/.*\.png$/);
    if (type.id !== "town-hall") { const source=["trading-port","dockyard"].includes(type.id)?`azmara-${type.id}-stages-land-v3.png`:`azmara-${type.id}-stages-v2.png`;assert.equal(visual.src,`assets/progression/${source}`); assert.equal(visual.atlas, true); assert.equal(visual.cols, 4); assert.equal(visual.rows, 3); assert.equal(visual.cell, visual.stage - 1); }
    else { assert.equal(visual.atlas, false); assert.equal(visual.src, `assets/progression/azmara-hall-level-${sourceLevel}.png`); }
  }
  console.log("PASS immutable30-active/31-compatible raster API, independent per-type all1–50 boundaries,11source stages, fixed cropping and prototype rejection"); groups += 1;
  const browser = await chromium.launch({ headless: true });
  try {
    const { context, page, errors } = await create(browser, representative());
    try {
      const before = await raw(page);
      for (const type of types) {
        const evidence = await pixels(page, type.id);
        assert.deepEqual(evidence.stages.map((stage) => stage.level), schedules[type.id]);
        for (const stage of evidence.stages) {
          assert(stage.width >= 512 && stage.height >= 512, "Undecoded/unreadable native source " + type.id);
          assert(stage.opaque > 384 * 256 * .03 && stage.transparent > 384 * 256 * .10, "Milestone cell is blank or has a baked background: " + JSON.stringify({ type: type.id, ...stage }));
          assert(stage.corners.every((alpha) => alpha <= 1), "Cropped cell exceeds approved native corner alpha1/255 quantization bound: " + type.id + "/" + stage.level);
          assert(stage.visibleWidth >= .25 && stage.visibleHeight >= .25, "Building lost meaningful painted extent " + type.id + "/" + stage.level);
          if (stage.rect) {
            const [x,y,width,height] = stage.rect;
            assert(x >= 0 && y >= 0 && width > 0 && height > 0 && x + width <= stage.width && y + height <= stage.height, "Tight native rectangle escapes source " + type.id + "/" + stage.level);
          }
          if (stage.previousMin) assert(stage.difference >= .04, "Consecutive milestone cells do not materially change actual painted pixels: " + JSON.stringify({ type: type.id, level: stage.level, prior: stage.previousMin, difference: stage.difference }));
          croppedDesigns += 1;
        }
        if (type.id !== "town-hall") {
          await assertNativeCrops(page,evidence.stages.map(stage=>({src:stage.src,cell:stage.cell,rect:stage.rect})));
          assert.equal(new Set(evidence.stages.map((stage) => stage.src)).size, 1, "One stage sheet expected per nonHall type");
          assert(evidence.stages.every((stage) => stage.cell >= 0 && stage.cell <= 10), "Unused twelfth atlas cell entered progression " + type.id);
        }
        assert.equal(await raw(page), before, "Raster decoding changed save bytes");
        groups += 1; console.log(`PASS ${type.id}:11 actual cropped transparent and materially different painted designs`);
      }
      assert.deepEqual(errors, []);
    } finally { await context.close(); }

    for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
      const { context, page, errors } = await create(browser, representative(), { viewport });
      try {
        await menu(page, '[data-panel="catalogue"]');
        const before = await raw(page);
        for (let level=1;level<=50;level++) {
          await page.locator("#catalogue-level").selectOption(String(level));
          const gallery = await page.locator(".catalogue-card").evaluateAll((cards) => cards.map((card) => {
            const art = card.querySelector("[data-building-art], .catalogue-stage-art"); const sprite = art?.querySelector(".building-sprite");
            const visual = window.AzmaraBuildingArt.forBuilding(card.dataset.buildingConcept, Number(document.querySelector("#catalogue-level").value));
            return { id: card.dataset.buildingConcept, stage: Number(art?.dataset.artStage), cell: Number(art?.dataset.artCell), declaredRect: art?.dataset.artRect?.split(",").map(Number) || null, size: sprite ? getComputedStyle(sprite).backgroundSize.split(" ").map(parseFloat) : null, position: sprite ? getComputedStyle(sprite).backgroundPosition.split(" ").map(parseFloat) : null, src: art?.tagName === "IMG" ? art.getAttribute("src") : sprite ? getComputedStyle(sprite).backgroundImage : null, rect: visual.rect || null, atlasWidth: visual.atlasWidth, atlasHeight: visual.atlasHeight };
          }));
          assert.deepEqual(gallery.map((art) => art.id), types.map((type) => type.id));
          for (const art of gallery) {
            const stage = stageFor(art.id,level); assert.equal(art.stage, stage, "Gallery cell did not follow its published schedule " + art.id);
            if (art.id !== "town-hall") {
              assert.equal(art.cell, stage - 1); assert(art.size.every((value) => Number.isFinite(value) && value > 0));
              if (art.rect) {
                assert.deepEqual(art.declaredRect, art.rect, "Gallery lost exact native crop " + art.id);
                const [x, y, width, height] = art.rect;
                const expectedSize = [art.atlasWidth / width * 100, art.atlasHeight / height * 100];
                const expectedPosition = [x / (art.atlasWidth - width) * 100, y / (art.atlasHeight - height) * 100];
                assert(art.size.every((value, index) => Math.abs(value - expectedSize[index]) < .001), "Gallery background size uses the wrong native rectangle " + art.id);
                assert(art.position.every((value, index) => Math.abs(value - expectedPosition[index]) < .001), "Gallery background position uses the wrong native rectangle " + art.id);
              } else { assert.deepEqual(art.size, [400,300]); assert(Math.abs(art.position[0] - (art.cell % 4) * 100 / 3) < .0001 && art.position[1] === Math.floor(art.cell / 4) * 50); }
            }
            else assert.equal(art.src, `assets/progression/azmara-hall-level-${artLevels[stage-1]}.png`);
          }
          assert.equal(await raw(page), before, "Gallery milestone wrote actual levels/resources");
        }
        await picture(page, `isolated-gallery-level50-${viewport.width}x${viewport.height}`); await close(page);
        groups += 1; console.log(`PASS all1500 active gallery level selections select exact published source crops without save mutation at${viewport.width}x${viewport.height}`);

        const poses = [];
        for (const level of hallMilestones) {
          for (const [id] of reviewed) {
            await openPlot(page, id); await page.locator("#test-building-level").selectOption(String(level)); await click(page, "#set-test-level");
          }
          await close(page);
          const actual = await saved(page);
          assert.equal(actual.hallLevel, level); assert.equal(actual.construction, null);
          for (const [id, typeId] of reviewed.slice(1)) assert.deepEqual(actual.buildings[id], { typeId, level });
          const points = await markerPoints(page, true); assert.equal(points.length, 23);
          assert(points.every((point) => point.insideTarget && point.exposed && point.rect.width >= 44 && point.rect.height >= 44));
          await assertDrawnMarkers(page, points, true);
          poses.push(points.map((point) => ({ id: point.id, x: point.rect.x, y: point.rect.y, width: point.rect.width, height: point.rect.height })));
          if (level === 1 || level === 20 || level === 25 || level === 50) await picture(page, `isolated-actual-six-role-stage-${level}-${viewport.width}x${viewport.height}`);
          assert.equal(await page.locator("body").getAttribute("data-town-stage"), String(stageFor("town-hall",level)));
          if (level > 20) await paintedOverlay(page);
        }
        for (const pose of poses.slice(1)) assert.deepEqual(pose, poses[0], "Actual stage changed target registration/camera");
        groups += 1; console.log(`PASS11 actual six-role painted map stages, clickable source-accurate cells and invariant registration at${viewport.width}x${viewport.height}`);

        const final = await raw(page);
        await openPlot(page, "general-02"); await click(page, '#panel-content [data-panel="appearance"][data-review-type="academy"]');
        await page.locator("#appearance-level").selectOption("1"); await settle(page);
        assert.equal(await page.locator('[data-plot="general-02"]').getAttribute("data-building-stage"), "1");
        assert.equal(await page.locator('[data-plot="general-01"]').getAttribute("data-building-stage"), "11", "NonHall preview changed actual Hall/terrain");
        assert.equal(await raw(page), final);
        await close(page); assert.equal(await page.locator('[data-plot="general-02"]').getAttribute("data-building-stage"), "11");
        await mode(page, "gameplay"); assert.equal(await raw(page), final); await mode(page, "dev");
        await page.reload(); await settle(page); assert.equal(await raw(page), final);
        await complete(context, page, errors, `NonHall appearance restores actual50 onClose/Gameplay/reload with unchanged save at${viewport.width}x${viewport.height}`);
      } catch (error) { await context.close(); throw error; }
    }
    assert.equal(croppedDesigns, 330);
    console.log(JSON.stringify({ groupsPassed: groups, actualCroppedDesigns: croppedDesigns, browserErrors: 0 }));
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
