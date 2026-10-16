"use strict";

// DEC064: isolated loopback wall presentation checks, never Founder storage.
// Geometry and pixel checks are not aesthetic acceptance or defence simulation.
const q = require("./building-harness.cjs");
const scene = require("./oct11-scenery.cjs");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { chromium } = require(process.argv[2] || "playwright");
const { assert, create, fixture, settle, raw, saved, legacyKey, close, menu, mode, openPlot, click, picture } = q;
const scope = process.env.AZMARA_WALL_SCOPE || "acceptance";
assert(["acceptance", "state", "max"].includes(scope));
const layouts = ["staggered", "grid", "circle", "avenues", "garden-quarters"];
const profiles = [[1440, 900], [1024, 600], [390, 844], [844, 390], [2560, 900]];
const runtime = ["app.js", "town-wall.js", "building-art.js", "progression.js", "index.html", "styles.css", "desktop.css"];
const hashes = () => Object.fromEntries(runtime.map(f => [f, crypto.createHash("sha256").update(fs.readFileSync(path.resolve(__dirname, "..", f))).digest("hex")]));
const initialSources = hashes(), startedAt = new Date().toISOString(), results = [];
let groups = 0;
const pass = name => { groups++; console.log("PASS " + name); };
const bytes = async page => [await raw(page), await raw(page, legacyKey)];

function complete(level, extra = {}) {
  const state = scene.mixedFixture(level);
  for (const building of Object.values(state.buildings)) building.level = level;
  return { ...state, ...extra };
}
async function shot(page, name) {
  if (await page.locator("#toast").isVisible()) await page.locator("#toast").waitFor({ state: "hidden", timeout: 10000 });
  await settle(page); await picture(page, name);
}

async function inspect(page, expectedLevel) {
  await settle(page);
  const evidence = await page.evaluate(async () => {
    const layer = document.querySelector("#town-wall-perimeter");
    if (!layer) throw new Error("No dedicated wall perimeter layer");
    const level = Number(layer.dataset.wallLevel), fragment = layer.innerHTML;
    if (!fragment.trim()) return { level, absent: true, source: layer.dataset.wallSource };
    const body = layer.querySelector("[data-town-wall-level]");
    if (!body) throw new Error("Actual wall SVG lacks completed-level metadata");
    const width = Number(body.dataset.wallNativeWidth), height = Number(body.dataset.wallNativeHeight);
    const inverse = layer.getScreenCTM().inverse();
    const convert = (x, y) => { const p = new DOMPoint(x, y).matrixTransform(inverse); return { x: p.x, y: p.y }; };
    const footprints = [...document.querySelectorAll("#town-core .plot-marker")].map(node => {
      const r = node.getBoundingClientRect(), a = convert(r.x, r.y), b = convert(r.right, r.bottom);
      return { id: node.dataset.plot, x: a.x, y: a.y, width: b.x - a.x, height: b.y - a.y };
    });
    const contourNode = layer.querySelector("[data-wall-contour]");
    if (!contourNode) throw new Error("Actual rendered enclosure has no explicit contour");
    const contour = JSON.parse(contourNode.getAttribute("data-wall-contour")).map(p => Array.isArray(p) ? { x: p[0], y: p[1] } : p);
    const parts = [...layer.querySelectorAll("[data-wall-part]")].map(node => ({ kind: node.dataset.wallPart, bounds: node.dataset.wallBounds?.split(",").map(Number) }));
    // The actual render is a <g>, not an image clipped to the basepainting.
    // Include the full curtain/tower/stroke/shadow plane outside native0 too.
    const left = Math.floor(Math.min(0, ...parts.map(p => p.bounds[0]))) - 4;
    const top = Math.floor(Math.min(0, ...parts.map(p => p.bounds[1]))) - 4;
    const right = Math.ceil(Math.max(width, ...parts.map(p => p.bounds[0] + p.bounds[2]))) + 4;
    const bottom = Math.ceil(Math.max(height, ...parts.map(p => p.bounds[1] + p.bounds[3]))) + 4;
    const rasterWidth = right - left, rasterHeight = bottom - top;
    const image = new Image();
    image.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${rasterWidth}" height="${rasterHeight}" viewBox="${left} ${top} ${rasterWidth} ${rasterHeight}">${new XMLSerializer().serializeToString(body)}</svg>`);
    await image.decode();
    const canvas = document.createElement("canvas"); canvas.width = rasterWidth; canvas.height = rasterHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true }); ctx.drawImage(image, 0, 0);
    const pixels = ctx.getImageData(0, 0, rasterWidth, rasterHeight).data;
    for (const p of footprints) {
      p.painted = 0; p.maximumAlpha = 0;
      for (let y = Math.max(top, Math.ceil(p.y)); y < Math.min(bottom, Math.floor(p.y + p.height)); y++)
        for (let x = Math.max(left, Math.ceil(p.x)); x < Math.min(right, Math.floor(p.x + p.width)); x++) {
          const alpha = pixels[((y - top) * rasterWidth + x - left) * 4 + 3];
          if (alpha) { p.painted++; p.maximumAlpha = Math.max(p.maximumAlpha, alpha); }
        }
    }
    let painted = 0;
    const extent = { left: right, top: bottom, right: left, bottom: top };
    for (let y = 0; y < rasterHeight; y++) for (let x = 0; x < rasterWidth; x++) if (pixels[(y * rasterWidth + x) * 4 + 3]) {
      painted++; extent.left = Math.min(extent.left, x + left); extent.top = Math.min(extent.top, y + top); extent.right = Math.max(extent.right, x + left + 1); extent.bottom = Math.max(extent.bottom, y + top + 1);
    }
    const matrix = layer.getScreenCTM(), a = new DOMPoint(extent.left, extent.top).matrixTransform(matrix), b = new DOMPoint(extent.right, extent.bottom).matrixTransform(matrix);
    const screenExtent = { left: a.x, top: a.y, right: b.x, bottom: b.y, width: innerWidth, height: innerHeight };
    return { level, absent: false, source: layer.dataset.wallSource, metadataLevel: Number(body.dataset.townWallLevel), material: body.dataset.townWallMaterial, stage: body.dataset.townWallStage,
      contour, footprints, parts, painted, extent, rasterBounds: { left, top, right, bottom }, screenExtent, width, height, sourceDigest: fragment.length, transform: layer.getAttribute("transform") };
  });
  assert.equal(evidence.level, expectedLevel, "Wall follows Hall/queued level instead of its own completed level");
  if (!expectedLevel) { assert(evidence.absent, "Unbuilt wall paints a finished perimeter"); return evidence; }
  assert(!evidence.absent && evidence.painted > 1000, "Enclosure exists only as metadata, not complete actual paint");
  assert.equal(evidence.metadataLevel, expectedLevel);
  if (expectedLevel === 1) assert.equal(evidence.material, "timber");
  if (expectedLevel === 50) assert.equal(evidence.material, "sandstone");
  assert.equal(evidence.footprints.length, 23);
  assert(evidence.contour.length >= 4);
  const inside = (point, polygon) => {
    let result = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const a = polygon[i], b = polygon[j];
      if ((a.y > point.y) !== (b.y > point.y) && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) result = !result;
    }
    return result;
  };
  for (const p of evidence.footprints) {
    for (const corner of [[p.x, p.y], [p.x + p.width, p.y], [p.x, p.y + p.height], [p.x + p.width, p.y + p.height]])
      assert(inside({ x: corner[0], y: corner[1] }, evidence.contour), "Complete actual plot is outside city perimeter: " + p.id);
    assert.equal(p.painted, 0, "Wall face/tower/shadow paints over full plot rectangle: " + JSON.stringify(p));
  }
  for (const p of evidence.parts) {
    assert(p.bounds?.length === 4 && p.bounds.every(Number.isFinite), "Part lacks complete dimensional paint bounds: " + p.kind);
    // A diagonal wall's axis-aligned envelope spans interior blank ground.
    // Pixel alpha above, not that coarse envelope, is the exclusion oracle.
    const [x, y, w, h] = p.bounds;
    assert(w > 0 && h > 0, "Wall component has invalid full paint dimensions: " + p.kind);
  }
  const rb = evidence.rasterBounds;
  assert(evidence.extent.left > rb.left + 1 && evidence.extent.top > rb.top + 1 && evidence.extent.right < rb.right - 1 && evidence.extent.bottom < rb.bottom - 1, "Wall paint is clipped by independent expanded raster plane");
  return evidence;
}

async function paintProof(page) {
  const layer = page.locator("#town-wall-perimeter"), style = await layer.getAttribute("style");
  const visible = await page.screenshot({ scale: "css" });
  await layer.evaluate(n => n.style.setProperty("visibility", "hidden", "important"));
  let hidden;
  try { hidden = await page.screenshot({ scale: "css" }); }
  finally { await layer.evaluate((n, s) => s === null ? n.removeAttribute("style") : n.setAttribute("style", s), style); }
  const changed = await page.evaluate(async ({ visible, hidden }) => {
    const decode = async text => { const i = new Image(); i.src = "data:image/png;base64," + text; await i.decode(); const c = document.createElement("canvas"); c.width = i.naturalWidth; c.height = i.naturalHeight; const ctx = c.getContext("2d"); ctx.drawImage(i, 0, 0); return ctx.getImageData(0, 0, c.width, c.height).data; };
    const a = await decode(visible), b = await decode(hidden); let changed = 0;
    for (let i = 0; i < a.length; i += 4) if ([0, 1, 2].some(k => Math.abs(a[i + k] - b[i + k]) >= 8)) changed++;
    return changed;
  }, { visible: visible.toString("base64"), hidden: hidden.toString("base64") });
  assert(changed > 100, "Rendered wall is hidden beneath other layers or UI: " + changed);
  return changed;
}

async function reset(page) {
  await close(page);
  const direct = page.locator('[data-dev-action="reset"]:visible').first();
  if (await direct.count()) await direct.click(); else await menu(page, '[data-dev-action="reset"]');
  await click(page, "#confirm-reset"); await close(page);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    if (scope === "acceptance") {
      for (const size of profiles.filter(p => !process.env.AZMARA_WALL_PROFILE || p.join("x") === process.env.AZMARA_WALL_PROFILE))
        for (const layout of layouts.filter(l => !process.env.AZMARA_WALL_LAYOUT || l === process.env.AZMARA_WALL_LAYOUT)) {
          const run = await create(browser, complete(1, { plotLayout: layout }), { viewport: { width: size[0], height: size[1] } });
          try {
            const { page } = run; await scene.footer(page);
            let priorContour;
            for (const level of [1, 50]) {
              if (level === 50) { await openPlot(page, "wall-01"); await page.locator("#test-building-level").selectOption("50"); await click(page, "#set-test-level"); await close(page); }
              const before = await bytes(page), evidence = await inspect(page, level), changed = await paintProof(page);
              const frame = evidence.screenExtent;
              assert(frame.left >= -.5 && frame.top >= -.5 && frame.right <= size[0] + .5 && frame.bottom <= size[1] + .5, "Complete perimeter is clipped at Fit: " + JSON.stringify(frame));
              if (size[0] >= 1024 && size[1] >= 600) assert(frame.bottom <= size[1] - 64 + .5, "Complete perimeter is covered by the desktop footer: " + JSON.stringify(frame));
              const targets = await scene.targets(page, "#town-core .plot-marker", { fit: true });
              if (priorContour) assert.deepEqual(evidence.contour, priorContour, "Wall strength changed its ground perimeter");
              priorContour = evidence.contour;
              assert.deepEqual(await bytes(page), before); assert.deepEqual(run.errors, []);
              results.push({ layout, profile: size, level, evidence, changed, targets });
              await shot(page, `v17-wall${level}-${layout}-${size.join("x")}`);
            }
            pass(`${layout} ${size.join("x")}: wooden1/strong50 actual painted enclosure protects all23 full plot rectangles and44px targets`);
          } finally { await run.context.close(); }
        }
      if (!process.env.AZMARA_WALL_PROFILE && !process.env.AZMARA_WALL_LAYOUT) {
        for (const size of [[1440, 900], [390, 844]]) {
          const run = await create(browser, complete(50), { viewport: { width: size[0], height: size[1] } });
          try {
            const before = await bytes(run.page), evidence = await inspect(run.page, 50);
            await scene.targets(run.page, "#town-core .plot-marker", { fit: true }); await paintProof(run.page);
            await shot(run.page, `v17-metropolis50-staggered-${size.join("x")}`);
            assert.deepEqual(await bytes(run.page), before); assert.deepEqual(run.errors, []);
            results.push({ fullMetropolis: true, profile: size, evidence });
            pass(`complete all23 level50 metropolis capture ${size.join("x")}`);
          } finally { await run.context.close(); }
        }
      }
    } else if (scope === "state") {
      for (const size of [[1440, 900], [390, 844]]) {
        const state = fixture({ hallLevel: 50 });
        const run = await create(browser, " \n" + JSON.stringify(state, null, 2) + " \n", { viewport: { width: size[0], height: size[1] } });
        try {
          const { page } = run, original = await bytes(page);
          await inspect(page, 0); await menu(page, '[data-panel="appearance"]');
          await page.locator("#ideal-town-enabled").check();
          for (const level of [1, 50]) {
            await page.locator("#ideal-town-level").evaluate((n, level) => { n.value = String(level); n.dispatchEvent(new Event("input", { bubbles: true })); }, level);
            const evidence = await inspect(page, level); assert.equal(evidence.source, "ideal"); assert.equal(await page.locator('#town-core [data-occupied="true"]').count(), 23); assert.deepEqual(await bytes(page), original);
            results.push({ profile: size, ideal: level, evidence });
          }
          await close(page); await inspect(page, 0); assert.deepEqual(await bytes(page), original);
          await openPlot(page, "wall-01"); await click(page, "#build-selected");
          const paid = await saved(page), receipt = { ...paid.construction }, stocks = { ...paid.resources };
          assert.equal(receipt.buildingId, "wall-01"); assert.equal(receipt.typeId, "town-wall");
          await inspect(page, 0); await mode(page, "gameplay"); await inspect(page, 0); assert.deepEqual((await saved(page)).construction, receipt);
          await mode(page, "dev"); await openPlot(page, "wall-01"); await click(page, "#skip-construction"); await close(page); await inspect(page, 1);
          assert.deepEqual((await saved(page)).resources, stocks); assert.equal((await saved(page)).construction, null);
          const actual = await bytes(page); await menu(page, '[data-panel="appearance"]'); await page.locator("#ideal-town-enabled").check();
          await page.locator("#ideal-town-level").evaluate(n => { n.value = "50"; n.dispatchEvent(new Event("input", { bubbles: true })); }); await inspect(page, 50);
          await mode(page, "gameplay"); await inspect(page, 1); assert.deepEqual(await bytes(page), actual);
          await mode(page, "dev"); await reset(page); await inspect(page, 0); assert.equal(await page.locator('#town-core [data-occupied="true"]').count(), 0);
          assert.equal(await raw(page, legacyKey), original[1]); assert.deepEqual(run.errors, []);
          pass(`Hall50 alone/uncompletedWall/Skip1/Ideal1+50/Gameplay/reset preserve wall ownership and exact untouched bytes ${size.join("x")}`);
        } finally { await run.context.close(); }
      }
      const state = complete(1), receipt = { buildingId: "wall-01", typeId: "town-wall", toLevel: 2, startedAt: q.epoch, endsAt: q.epoch + 120000, paidCost: q.cost(1) };
      state.construction = receipt;
      state.resources = q.subtract(state.resources, receipt.paidCost);
      const run = await create(browser, " \n" + JSON.stringify(state, null, 2) + " \n");
      try {
        const before = await bytes(run.page); await inspect(run.page, 1); await menu(run.page, '[data-panel="appearance"]'); await run.page.locator("#ideal-town-enabled").check();
        for (const level of [1, 50]) { await run.page.locator("#ideal-town-level").evaluate((n, level) => { n.value = String(level); n.dispatchEvent(new Event("input", { bubbles: true })); }, level); await inspect(run.page, level); assert.deepEqual(await bytes(run.page), before); }
        await close(run.page); await inspect(run.page, 1); await mode(run.page, "gameplay"); await inspect(run.page, 1); await mode(run.page, "dev"); await run.page.reload(); await settle(run.page);
        await inspect(run.page, 1); assert.deepEqual(await bytes(run.page), before); assert.deepEqual(run.errors, []);
        pass("Unfinished Wall1→2 keeps timber perimeter; Ideal/modes/reload preserve exact active paid receipt and save bytes");
      } finally { await run.context.close(); }
    } else if (scope === "max") {
      for (const size of [[1440, 900], [390, 844]]) {
        const run = await create(browser, complete(50), { viewport: { width: size[0], height: size[1] } });
        try {
          const before = await bytes(run.page), fit = await inspect(run.page, 50);
          let max;
          await scene.maxZoom(run.page, async page => { max = await inspect(page, 50); assert.deepEqual(max.contour, fit.contour, "Zoom moves enclosure ground geometry"); });
          const panned = await inspect(run.page, 50); assert.deepEqual(panned.contour, fit.contour, "Pan moves enclosure ground geometry");
          for (const p of panned.footprints) {
            const original = fit.footprints.find(f => f.id === p.id);
            // Fit's44px minimum can enlarge wrapper envelopes. At higher zoom
            // the wrapper returns to sprite scale; its native centre is fixed
            // and its full rectangle must stay within that safe Fit reserve.
            const dx = p.x + p.width / 2 - original.x - original.width / 2, dy = p.y + p.height / 2 - original.y - original.height / 2;
            // Browser HTML boxes are quantized to1/64 CSSpixel while SVG CTMs
            // retain doubles. A tenth of one nativepixel is still stricter than
            // any drawable material pixel and avoids a false exact-float claim.
            assert(Math.abs(dx) < .1 && Math.abs(dy) < .1, "Pan/zoom changes native plot centre " + JSON.stringify({ id: p.id, dx, dy, actual: p, original }));
            assert(p.x >= original.x - .1 && p.y >= original.y - .1 && p.x + p.width <= original.x + original.width + .1 && p.y + p.height <= original.y + original.height + .1, "Maxzoom sprite escapes full Fit wall exclusion " + JSON.stringify({ id: p.id, actual: p, original }));
          }
          assert.deepEqual(await bytes(run.page), before); assert.deepEqual(run.errors, []); results.push({ profile: size, fit, max, panned });
          pass(`maximum2.4/23 inspected plots: stable native wall, full44px cores and unchanged saved progress ${size.join("x")}`);
        } finally { await run.context.close(); }
      }
    }
    assert.deepEqual(hashes(), initialSources, "Runtime changed during wall QA; source not frozen");
    const receipt = { scope, startedAt, finishedAt: new Date().toISOString(), sourceHashes: initialSources, groupsPassed: groups, browserErrors: 0, aestheticApprovalClaimed: false, results };
    if (process.env.AZMARA_QA_SCREENSHOTS) fs.writeFileSync(path.join(process.env.AZMARA_QA_SCREENSHOTS, `v17-wall-${scope}-receipt.json`), JSON.stringify(receipt, null, 2));
    console.log(JSON.stringify({ scope, groupsPassed: groups, browserErrors: 0 }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); if (process.env.AZMARA_QA_SCREENSHOTS) fs.writeFileSync(path.join(process.env.AZMARA_QA_SCREENSHOTS, `v17-wall-${scope}-failed-${Date.now()}.json`), JSON.stringify({ scope, groupsPassed: groups, failure: error.message, results }, null, 2)); process.exitCode = 1; });
