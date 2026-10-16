"use strict";

// DEC065 focused visual QA: isolated loopback fixtures, never Founder storage.
// Ideal is tested through normal modal UI; unobstructed captures use an explicitly
// seeded equivalent town, not modal suppression or a claim of normal Ideal UI.
const q = require("./building-harness.cjs");
const scene = require("./oct11-scenery.cjs");
const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto");
const { chromium } = require(process.argv[2] || "playwright");
const { assert, create, fixture, settle, raw, legacyKey, close, menu, mode, picture } = q;
const layouts = ["grid", "staggered", "circle", "avenues", "garden-quarters"];
const profiles = [[1440, 900], [390, 844]];
const runtime = ["app.js", "town-wall.js", "building-art.js", "progression.js", "town-layouts.js", "index.html", "styles.css", "desktop.css",
  "assets/azmara-mountain-town-v18.png", "assets/azmara-front-wall-stages-v18.png"];
const hashes = () => Object.fromEntries(runtime.map(file => [file, crypto.createHash("sha256").update(fs.readFileSync(path.resolve(__dirname, "..", file))).digest("hex")]));
const initialSources = hashes(), startedAt = new Date().toISOString(), results = [];
const scope = process.env.AZMARA_V18_SCOPE || "all";
assert(["all", "fit", "state", "max", "cosmetic"].includes(scope));
let groups = 0, activeRun = null;
const pass = name => { groups++; console.log("PASS " + name); };
const bytes = async page => [await raw(page), await raw(page, legacyKey)];
const complete = (level, plotLayout = "staggered") => {
  const state = scene.mixedFixture(level);
  Object.values(state.buildings).forEach(building => { building.level = level; });
  return { ...state, plotLayout };
};
async function seed(page, state) {
  await page.evaluate(({ key, seed }) => localStorage.setItem(key, seed), { key: q.key, seed: " \n" + JSON.stringify(state, null, 2) + " \n" });
  await page.reload(); await settle(page);
}
async function ideal(page, level) {
  await menu(page, '[data-panel="appearance"]');
  await page.locator("#ideal-town-enabled").check();
  await page.locator("#ideal-town-level").evaluate((node, value) => { node.value = String(value); node.dispatchEvent(new Event("input", { bubbles: true })); }, level);
  await settle(page);
  assert.equal(await page.locator('#town-core [data-occupied="true"]').count(), 23);
  assert.equal(await page.locator("#ideal-town-value").textContent(), `Level ${level}`);
  assert.deepEqual(await page.locator("#town-core .plot-marker").evaluateAll(nodes => nodes.map(node => Number(node.dataset.buildingLevel))), Array(23).fill(level));
}

async function inspect(page, expectedLevel, { fit = false } = {}) {
  await settle(page);
  const evidence = await page.evaluate(async () => {
    const layer = document.querySelector("#town-wall-perimeter"), body = layer.querySelector("#azmara-wall-perimeter-body");
    const plots = [...document.querySelectorAll("#town-core .plot-marker")].map(node => ({ id: node.dataset.plot, rect: node.getBoundingClientRect().toJSON(), level: Number(node.dataset.buildingLevel) }));
    const terrain = document.querySelector("#town-terrain-art");
    const painting = { src: terrain.getAttribute("href"), rect: terrain.getBoundingClientRect().toJSON() };
    if (!body) return { absent: true, level: Number(layer.dataset.wallLevel), source: layer.dataset.wallSource, plots, painting };
    const raster = body.querySelector(".town-wall-front-raster"), sheet = raster?.querySelector("image");
    if (!raster || !sheet) throw new Error("Front wall is not a rendered raster with an owned native crop");
    const crop = raster.getAttribute("viewBox").split(/\s+/).map(Number);
    const image = new Image(); image.src = sheet.getAttribute("href"); await image.decode();
    const canvas = document.createElement("canvas"); canvas.width = crop[2]; canvas.height = crop[3];
    const ctx = canvas.getContext("2d", { willReadFrequently: true }); ctx.drawImage(image, ...crop, 0, 0, crop[2], crop[3]);
    const rgba = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let painted = 0, maxAlpha = 0;
    const extent = { left: crop[2], top: crop[3], right: 0, bottom: 0 };
    for (let y = 0; y < crop[3]; y++) for (let x = 0; x < crop[2]; x++) {
      const alpha = rgba[(y * crop[2] + x) * 4 + 3]; maxAlpha = Math.max(maxAlpha, alpha);
      if (alpha) { painted++; extent.left = Math.min(extent.left, x); extent.top = Math.min(extent.top, y); extent.right = Math.max(extent.right, x + 1); extent.bottom = Math.max(extent.bottom, y + 1); }
    }
    // Nested SVG getBoundingClientRect reports its complete sheet child, not
    // the clipped viewport. Derive that viewport from its actual screen CTM.
    const matrix = raster.getScreenCTM(), a = new DOMPoint(crop[0], crop[1]).matrixTransform(matrix), b = new DOMPoint(crop[0] + crop[2], crop[1] + crop[3]).matrixTransform(matrix);
    const r = { x: a.x, y: a.y, left: a.x, top: a.y, right: b.x, bottom: b.y, width: b.x - a.x, height: b.y - a.y };
    const screenExtent = { left: r.left + extent.left / crop[2] * r.width, top: r.top + extent.top / crop[3] * r.height,
      right: r.left + extent.right / crop[2] * r.width, bottom: r.top + extent.bottom / crop[3] * r.height };
    const wall = plots.find(plot => plot.id === "wall-01").rect;
    const wx = (wall.x + wall.width / 2 - r.left) / r.width * crop[2], wy = (wall.y + wall.height / 2 - r.top) / r.height * crop[3];
    let controlAlpha = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const x = Math.floor(wx) + dx, y = Math.floor(wy) + dy;
      if (x >= 0 && y >= 0 && x < crop[2] && y < crop[3]) controlAlpha = Math.max(controlAlpha, rgba[(y * crop[2] + x) * 4 + 3]);
    }
    return { absent: false, level: Number(layer.dataset.wallLevel), metadataLevel: Number(body.dataset.townWallLevel), source: layer.dataset.wallSource,
      frontOnly: body.dataset.wallFrontOnly, closed: body.dataset.wallClosed, material: body.dataset.townWallMaterial,
      crop, sheet: { src: sheet.getAttribute("href"), width: image.naturalWidth, height: image.naturalHeight }, raster: r, screenExtent, extent,
      painted, maxAlpha, controlAlpha, controlSourcePoint: { x: wx, y: wy }, plots, painting, fragments: body.querySelectorAll(".town-wall-front-raster").length,
      layoutTransform: layer.getAttribute("transform") };
  });
  assert.equal(evidence.level, expectedLevel, "Wall follows Hall/queue rather than its own completed or temporary review level");
  assert.match(evidence.painting.src, /azmara-mountain-town-v18\.png$/, "Active town is not using the mountain-backed original painting");
  assert.equal(evidence.plots.length, 23);
  if (!expectedLevel) { assert(evidence.absent, "An empty wall site paints completed fortifications"); return evidence; }
  assert(!evidence.absent && evidence.painted > 20000, "Front wall has no meaningful actual native paint");
  assert.equal(evidence.metadataLevel, expectedLevel); assert.equal(evidence.frontOnly, "true"); assert.equal(evidence.closed, "false");
  assert.equal(evidence.fragments, 1, "A repeated wall ring returned");
  assert.equal(evidence.sheet.width, 1536); assert.equal(evidence.sheet.height, 1024);
  assert.match(evidence.sheet.src, /azmara-front-wall-stages-v18\.png$/);
  assert([[0, 0, 1536, 307], [0, 307, 1536, 316], [0, 623, 1536, 401]].some(crop => crop.every((value, i) => value === evidence.crop[i])), "Wall uses equal-thirds or foreign-row crop");
  assert(evidence.maxAlpha >= 200);
  assert(evidence.controlAlpha > 30, "Wall gate target is detached from actual front-wall paint: " + JSON.stringify({ nativePoint: evidence.controlSourcePoint, raster: evidence.raster, target: evidence.plots.find(plot => plot.id === "wall-01").rect }));
  for (const plot of evidence.plots.filter(plot => plot.id !== "wall-01"))
    assert(evidence.raster.top >= plot.rect.bottom - .1, "Front wall paints above/over a complete non-wall sprite footprint: " + JSON.stringify({ id: plot.id, wall: evidence.raster, plot: plot.rect }));
  if (fit) {
    const size = page.viewportSize(), r = evidence.screenExtent;
    assert(r.left >= -.5 && r.top >= -.5 && r.right <= size.width + .5 && r.bottom <= size.height + .5, "Actual full wall paint is clipped at Fit: " + JSON.stringify(r));
    if (size.width >= 1024) assert(r.bottom <= size.height - 64 + .5, "Front wall is covered by the bottom toolbar: " + JSON.stringify(r));
  }
  return evidence;
}

async function paintDifference(page) {
  const visible = await page.screenshot({ scale: "css" });
  const layer = page.locator("#town-wall-perimeter"), style = await layer.getAttribute("style");
  await layer.evaluate(node => node.style.setProperty("visibility", "hidden", "important"));
  let hidden;
  try { hidden = await page.screenshot({ scale: "css" }); }
  finally { await layer.evaluate((node, style) => style === null ? node.removeAttribute("style") : node.setAttribute("style", style), style); }
  const changed = await page.evaluate(async ({ visible, hidden }) => {
    const read = async source => { const image = new Image(); image.src = "data:image/png;base64," + source; await image.decode(); const c = document.createElement("canvas"); c.width = image.naturalWidth; c.height = image.naturalHeight; const ctx = c.getContext("2d"); ctx.drawImage(image, 0, 0); return ctx.getImageData(0, 0, c.width, c.height).data; };
    const a = await read(visible), b = await read(hidden); let changed = 0;
    for (let i = 0; i < a.length; i += 4) if ([0, 1, 2].some(channel => Math.abs(a[i + channel] - b[i + channel]) >= 8)) changed++;
    return changed;
  }, { visible: visible.toString("base64"), hidden: hidden.toString("base64") });
  assert(changed > 100, "Front wall is only metadata or paints behind terrain/UI");
  return changed;
}

async function representativeMax(page) {
  const original = await bytes(page);
  for (let i = 0; i < 40; i++) {
    const button = page.locator('[data-desktop-action="zoom-in"]'); if (await button.isDisabled()) break;
    await button.click(); await settle(page);
  }
  assert.equal(Number(await page.locator("#town-map").getAttribute("data-zoom")), 2.4);
  const inspected = [];
  for (const id of ["general-01", "general-02", "wall-01"]) {
    await page.locator(`#town-core [data-plot="${id}"]`).evaluate(node => {
      const viewport = document.querySelector("#map-viewport"), box = node.getBoundingClientRect(), view = viewport.getBoundingClientRect();
      viewport.scrollTo({ left: viewport.scrollLeft + box.x + box.width / 2 - view.x - view.width / 2,
        top: viewport.scrollTop + box.y + box.height / 2 - view.y - view.height / 2, behavior: "instant" });
    });
    await settle(page);
    const marker = page.locator(`#town-core [data-plot="${id}"]`), rect = await marker.boundingBox();
    assert(rect.width >= 44 && rect.height >= 44);
    const alignment = await marker.evaluate(node => {
      const r = node.getBoundingClientRect(), image = node.querySelector(".marker img, .marker .building-sprite").getBoundingClientRect();
      const x = r.x + r.width / 2, y = r.y + r.height / 2;
      return { dx: Math.abs(x - image.x - image.width / 2), dy: Math.abs(y - image.y - image.height / 2), exposed: document.elementFromPoint(x, y)?.closest(".plot-marker") === node };
    });
    assert(alignment.dx < .1 && alignment.dy < .1 && alignment.exposed, "Maximum zoom detaches or intercepts representative artwork " + id);
    if (id === "wall-01") { const wall = await inspect(page, 50); alignment.actualFrontPaintAlpha = wall.controlAlpha; }
    await marker.click(); assert(await page.locator("#detail-panel").evaluate(node => node.open)); await close(page);
    await picture(page, "v18-max-" + id);
    inspected.push({ id, rect, alignment });
  }
  assert.deepEqual(await bytes(page), original);
  return inspected;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    if (scope === "cosmetic") {
      for (const size of profiles) for (const layout of ["grid", "staggered"]) {
        const run = activeRun = await create(browser, complete(50, layout), { viewport: { width: size[0], height: size[1] } });
        try {
          const { page } = run, original = await bytes(page);
          const targets = await scene.targets(page, "#town-core .plot-marker");
          const painting = await page.locator("#town-terrain-art").evaluate(async node => {
            const image = new Image(); image.src = node.getAttribute("href"); await image.decode();
            return { src: node.getAttribute("href"), rect: node.getBoundingClientRect().toJSON(), native: [image.naturalWidth, image.naturalHeight],
              aspect: node.getAttribute("preserveAspectRatio"), viewport: document.querySelector("#map-viewport").getBoundingClientRect().toJSON() };
          });
          assert.match(painting.src, /azmara-mountain-town-v18\.png$/); assert.deepEqual(painting.native, [1672, 941]);
          assert.equal(painting.aspect, "none");
          const p = painting.rect, v = painting.viewport;
          assert(p.left < v.left && p.top < v.top && p.right > v.right && p.bottom > v.bottom, "Main terrain image still ends inside visible map viewport: " + JSON.stringify(painting));
          await picture(page, `v18-final50-${layout}-${size.join("x")}`);
          assert.deepEqual(await bytes(page), original); assert.deepEqual(run.errors, []);
          results.push({ kind: "cosmetic-terrain-extent", profile: size, layout, painting, targets, savedBytesUnchanged: true, screenshotSource: "isolated all-built50 fixture" });
          pass(`Cosmetic terrain extent ${layout} ${size.join("x")}: covers viewport,23 targets and exact saves unchanged`);
        } catch (error) { await picture(run.page, `v18-cosmetic-diagnostic-${layout}-${size.join("x")}`); throw error; }
        finally { await run.context.close(); activeRun = null; }
      }
    }
    if (["all", "fit"].includes(scope)) {
      for (const size of profiles.filter(size => !process.env.AZMARA_V18_PROFILE || size.join("x") === process.env.AZMARA_V18_PROFILE)) for (const layout of layouts.filter(layout => !process.env.AZMARA_V18_LAYOUT || layout === process.env.AZMARA_V18_LAYOUT)) {
        const run = activeRun = await create(browser, " \n" + JSON.stringify(fixture({ plotLayout: layout }), null, 2) + " \n", { viewport: { width: size[0], height: size[1] } });
        try {
          const { page } = run, original = await bytes(page);
          await ideal(page, 50); const preview = await inspect(page, 50); assert.equal(preview.source, "ideal"); assert.deepEqual(await bytes(page), original);
          await close(page); await inspect(page, 0); assert.deepEqual(await bytes(page), original);
          await seed(page, complete(50, layout)); const actual = await bytes(page);
          const evidence = await inspect(page, 50, { fit: true }), targets = await scene.targets(page, "#town-core .plot-marker");
          const changedPixels = await paintDifference(page);
          await picture(page, `v18-metropolis50-${layout}-${size.join("x")}`);
          assert.deepEqual(await bytes(page), actual); assert.deepEqual(run.errors, []);
          results.push({ kind: "fit", layout, profile: size, preview: { level: preview.level, source: preview.source, savedBytesUnchanged: true }, screenshotSource: "isolated equivalent all-built50 fixture", evidence, targets, changedPixels });
          pass(`Fit ${layout} ${size.join("x")}: unsaved Ideal +23 exposed full targets +painted front wall`);
        } catch (error) { await picture(run.page, `v18-diagnostic-${layout}-${size.join("x")}`); throw error; }
        finally { await run.context.close(); activeRun = null; }
      }
      for (const size of profiles) {
        const run = activeRun = await create(browser, complete(1), { viewport: { width: size[0], height: size[1] } });
        try {
          const original = await bytes(run.page), evidence = await inspect(run.page, 1, { fit: true });
          assert.equal(evidence.material, "timber"); await scene.targets(run.page, "#town-core .plot-marker");
          await picture(run.page, `v18-town1-staggered-${size.join("x")}`); assert.deepEqual(await bytes(run.page), original); assert.deepEqual(run.errors, []);
          results.push({ kind: "level1", profile: size, evidence }); pass(`Level1 weak timber ${size.join("x")}`);
        } finally { await run.context.close(); activeRun = null; }
      }
    }
    if (["all", "state"].includes(scope)) {
      const cost = q.cost(1), state = fixture({ hallLevel: 50, resources: q.subtract(q.supplies, cost), buildings: { "wall-01": { typeId: "town-wall", level: 1 }, "general-02": { typeId: "academy", level: 1 } },
        construction: { buildingId: "general-02", typeId: "academy", toLevel: 2, startedAt: q.epoch, endsAt: q.epoch + 120000, paidCost: cost } });
      const run = activeRun = await create(browser, " \n" + JSON.stringify(state, null, 2) + " \n");
      try {
        const { page } = run, original = await bytes(page); await inspect(page, 1);
        await ideal(page, 50); await inspect(page, 50); assert.deepEqual(await bytes(page), original);
        await close(page); await inspect(page, 1); assert.deepEqual(await bytes(page), original);
        await mode(page, "gameplay"); await inspect(page, 1); assert.deepEqual(await bytes(page), original);
        await mode(page, "dev"); await menu(page, '[data-panel="appearance"]');
        await page.locator("#appearance-type").selectOption("town-wall"); await page.locator("#appearance-level").selectOption("50"); await settle(page);
        await inspect(page, 50); assert.deepEqual(await bytes(page), original);
        await close(page); await inspect(page, 1); await page.reload(); await settle(page); await inspect(page, 1);
        assert.deepEqual(await bytes(page), original); assert.deepEqual(run.errors, []);
        results.push({ kind: "state", actualWall: 1, actualHall: 50, pendingLevel: 2, savedBytesUnchanged: true });
        pass("Appearance/Ideal exit, Gameplay and reload preserve own wall1, Hall50, paid queue and both exact saves");
      } finally { await run.context.close(); activeRun = null; }
    }
    if (["all", "max"].includes(scope)) {
      const run = activeRun = await create(browser, complete(50));
      try { const inspected = await representativeMax(run.page); assert.deepEqual(run.errors, []); results.push({ kind: "max", zoom: 2.4, inspected }); pass("Maximum zoom: only Hall/site/wall representative alignment and input"); }
      finally { await run.context.close(); activeRun = null; }
    }
    assert.deepEqual(hashes(), initialSources, "Runtime/assets changed during this bounded QA run");
    const receipt = { status: "passed", decision: "DEC065", scope, startedAt, completedAt: new Date().toISOString(), groups, initialSources, finalSources: hashes(), results,
      errors: [], teardown: "All QA-owned isolated contexts and Chromium closed", limitations: "Simulated Chromium, not physical devices or Founder aesthetic acceptance; Ideal is verified while its normal modal is open; unobstructed captures explicitly use equivalent isolated all-built fixtures. No v17 enclosure oracle or unrelated broad suites." };
    if (scope === "cosmetic") receipt.priorReceipt = { file: "v18-all-receipt.json", sha256: "33754f50ac541b96339e98ef9bd2520c8843eef4148815cffff59f1cdac12548",
      groups: 14, testedApp: "3c0974d2aa464d2394548b993f92111f80e869c47dba5090b1ed9f47f0664412", qualification: "Before the cosmetic-only terrain image extent change; preserved unchanged, not a14-group run on the final image-extent hash" };
    if (process.env.AZMARA_QA_SCREENSHOTS) fs.writeFileSync(path.join(process.env.AZMARA_QA_SCREENSHOTS, `v18-${scope}-receipt.json`), JSON.stringify(receipt, null, 2));
    console.log(`PASS focused v18 ${groups} groups, zero captured errors`);
  } catch (error) {
    if (activeRun && process.env.AZMARA_QA_SCREENSHOTS) await activeRun.page.screenshot({ path: path.join(process.env.AZMARA_QA_SCREENSHOTS, `v18-${scope}-failure.png`), scale: "css" }).catch(() => {});
    const failure = { status: "failed", scope, groups, message: error.stack, startedAt, completedAt: new Date().toISOString(), initialSources, finalSources: hashes(), results };
    if (process.env.AZMARA_QA_SCREENSHOTS) fs.writeFileSync(path.join(process.env.AZMARA_QA_SCREENSHOTS, `v18-${scope}-failure-${new Date().toISOString().replace(/[:.]/g,"-")}.json`), JSON.stringify(failure, null, 2));
    throw error;
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
