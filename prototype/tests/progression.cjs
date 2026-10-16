"use strict";

// Actual and temporary appearance progression, in isolated loopback contexts.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const { chromium } = require(process.argv[2] || "playwright");
const base = process.argv[3] || "http://127.0.0.1:4317";
assert(["localhost", "127.0.0.1", "[::1]"].includes(new URL(base).hostname));
const shots = process.env.AZMARA_QA_SCREENSHOTS;
if (shots) assert(fs.statSync(shots).isDirectory());
const key = "azmara-town-layout-v3";
const legacyKey = "azmara-town-design-v1";
const epoch = 1800000000000;
const legacy = ' {"version":1,"townName":"Historical art unchanged"} ';
const milestones = [1, 5, 8, 12, 17];
const allMilestones = [1, 5, 8, 12, 17, 22, 28, 34, 41, 45, 50];
const artLevels = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
const resources = { coins: 48000, timber: 28000, stone: 24000 };
const errors = [];
let groups = 0;
const makeState = (hallLevel = 4, extra = {}) => ({ version: 3, layoutId: "town-23-v1", townName: "Appearance QA", hallLevel, resources, construction: null, ...extra });
const expectedStage = (level) => allMilestones.filter((milestone) => milestone <= Math.max(1, level)).length;
const asset = (role, level, desktop) => role === "hall" ? `assets/progression/azmara-hall-level-${artLevels[expectedStage(level)-1]}.png` : `assets/progression/azmara-desert-${desktop ? "desktop" : "compact"}-level-1-v2.png`;

async function settle(page) {
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.locator("#town-core img, #appearance-hall-preview").evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
  await page.evaluate(async () => {
    const image = new Image(); image.src = document.querySelector("#town-terrain-art").href.baseVal; await image.decode();
  });
}

async function storage(page) { return page.evaluate(({ key, legacyKey }) => [localStorage.getItem(key), localStorage.getItem(legacyKey)], { key, legacyKey }); }
async function pose(page) {
  return page.evaluate(() => {
    const viewport = document.querySelector("#map-viewport");
    const core = document.querySelector("#town-core").getBoundingClientRect();
    return [viewport.scrollLeft, viewport.scrollTop, document.querySelector("#town-map").dataset.zoom, core.x, core.y, core.width, core.height];
  });
}
async function menu(page, selector) {
  await page.locator(await page.locator('[data-desktop-action="options"]').isVisible() ? '[data-desktop-action="options"]' : "#toggle-actions").click();
  const control = page.locator("#actions-menu " + selector);
  await control.scrollIntoViewIfNeeded(); await control.click();
  await page.locator("#actions-menu").waitFor({ state: "hidden" });
  await settle(page);
}
async function mode(page, next) {
  if (await page.locator("#detail-panel").evaluate((dialog) => dialog.open)) {
    // Deliberate external mode event proves cleanup/guards while a native modal
    // correctly blocks ordinary playfield/header interaction.
    const desktop = await page.locator('[data-desktop-action="options"]').isVisible();
    await page.locator(`${desktop ? ".desktop-header" : "#actions-menu"} button[data-preview-mode="${next}"]`).dispatchEvent("click");
    await settle(page);
    assert.equal(await page.locator("#detail-panel").evaluate((dialog) => dialog.open), false);
    assert.equal(await page.locator("body").getAttribute("data-preview-mode"), next);
    return;
  }
  const controls = page.locator(`button[data-preview-mode="${next}"]`);
  for (let index = 0; index < await controls.count(); index += 1) if (await controls.nth(index).isVisible()) { await controls.nth(index).click(); await settle(page); return; }
  await menu(page, `button[data-preview-mode="${next}"]`);
}
async function close(page) { await page.locator("#close-panel").click(); await settle(page); }

async function appearance(page, level, source = "actual", actualLevel = level, placed = true) {
  await settle(page);
  const desktop = page.viewportSize().width >= 1024 && page.viewportSize().height >= 600;
  const min = milestones[expectedStage(level) - 1];
  const current = await page.evaluate(() => {
    const hall = document.querySelector('#town-core [data-plot="general-01"]');
    const terrain = document.querySelector("#town-terrain-art");
    const overlay = document.querySelector("#town-terrain-overlay");
    return { stage: document.body.dataset.townStage, source: document.body.dataset.townStageSource, level: document.body.dataset.townLevel, occupied: hall.dataset.occupied, buildingStage: hall.dataset.buildingStage, hallSrc: hall.querySelector("img").getAttribute("src"), terrainSrc: terrain.href.baseVal, overlay: { visible: getComputedStyle(overlay).display !== "none", source: overlay.href.baseVal }, margins: [...document.querySelectorAll(".painted-margin-art")].map((image) => image.href.baseVal), terrain: { x: terrain.x.baseVal.value, y: terrain.y.baseVal.value, width: terrain.width.baseVal.value, height: terrain.height.baseVal.value, aspect: terrain.getAttribute("preserveAspectRatio") } };
  });
  assert.equal(current.stage, String(expectedStage(level)));
  assert.equal(current.source, source);
  assert.equal(current.level, String(actualLevel));
  assert.equal(current.occupied, String(placed));
  assert.equal(current.buildingStage, placed ? current.stage : "0");
  assert.equal(current.hallSrc, placed ? asset("hall", min, desktop) : "assets/azmara-empty-plot-v4.png");
  assert.equal(current.terrainSrc, asset("terrain", min, desktop));
  assert.equal(current.overlay.visible, min > 1, "Registered desert scenery is absent or shown before its milestone");
  if (current.overlay.visible) assert(current.overlay.source.startsWith("data:image/svg+xml"));
  assert.deepEqual(current.terrain, desktop ? { x: 0, y: 0, width: 4200, height: 2400, aspect: "xMidYMid slice" } : { x: 1600, y: 960, width: 2800, height: 2800, aspect: "xMidYMid meet" }, "Appearance changed the registered terrain geometry");
  assert.equal(current.margins.length, desktop ? 0 : 4);
  assert(current.margins.every((margin) => margin === current.terrainSrc), "Compact margins retained stale art");
  assert.equal(await page.locator('#town-core .plot-marker[data-occupied="true"]').count(), placed ? 1 : 0);
  assert.equal(await page.locator("#town-core .plot-marker").count(), 23);
}

async function imageInfo(page, sources) {
  return page.evaluate(async (sources) => {
    return Promise.all(sources.map(async (source) => {
      const image = new Image(); image.src = source; await image.decode();
      const canvas = document.createElement("canvas"); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d", { willReadFrequently: true }); context.drawImage(image, 0, 0);
      const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let transparent = 0, opaque = 0, minX = canvas.width, minY = canvas.height, maxX = -1, maxY = -1;
      for (let index = 0; index < data.length / 4; index += 1) {
        if (data[index * 4 + 3] === 0) transparent += 1;
        if (data[index * 4 + 3] >= 250) opaque += 1;
        if (data[index * 4 + 3] > 50) { const x = index % canvas.width, y = Math.floor(index / canvas.width); minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
      }
      const corners = [[0, 0], [canvas.width - 1, 0], [0, canvas.height - 1], [canvas.width - 1, canvas.height - 1]].map(([x, y]) => context.getImageData(x, y, 1, 1).data[3]);
      return { source, width: canvas.width, height: canvas.height, transparent, opaque, total: data.length / 4, corners, visibleWidth: (maxX - minX + 1) / canvas.width, visibleHeight: (maxY - minY + 1) / canvas.height };
    }));
  }, sources);
}

async function pixelDifference(page, before, after) {
  return page.evaluate(async ([before, after]) => {
    const decode = async (source) => { const image = new Image(); image.src = "data:image/png;base64," + source; await image.decode(); const canvas = document.createElement("canvas"); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight; const context = canvas.getContext("2d"); context.drawImage(image, 0, 0); return { width: canvas.width, height: canvas.height, pixels: context.getImageData(0, 0, canvas.width, canvas.height).data }; };
    const a = await decode(before), b = await decode(after);
    if (a.width !== b.width || a.height !== b.height) throw new Error("Stage screenshot dimensions differ");
    // Ignore text HUD, controls and edges. This crop is actual painted playfield,
    // so changing a label or an image URL alone cannot satisfy progression.
    let changed = 0, total = 0;
    for (let y = 220; y < a.height - 100; y += 1) for (let x = 60; x < a.width - 60; x += 1) {
      const offset = (y * a.width + x) * 4;
      if ([0, 1, 2].some((channel) => Math.abs(a.pixels[offset + channel] - b.pixels[offset + channel]) >= 18)) changed += 1;
      total += 1;
    }
    return { changed, total, ratio: changed / total };
  }, [before.toString("base64"), after.toString("base64")]);
}

async function contextPage(browser, viewport, saved) {
  const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
  await context.addInitScript(({ origin, key, legacyKey, saved, legacy, epoch }) => {
    window.__appearanceQaNow = epoch; Date.now = () => window.__appearanceQaNow;
    if (location.origin === origin && !sessionStorage.getItem("__appearanceQaSeeded")) { localStorage.setItem(key, saved); localStorage.setItem(legacyKey, legacy); sessionStorage.setItem("__appearanceQaSeeded", "true"); }
  }, { origin: new URL(base).origin, key, legacyKey, saved, legacy, epoch });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("requestfailed", (request) => errors.push(request.url() + ": " + request.failure()?.errorText));
  page.on("response", (response) => { if (response.status() >= 400) errors.push(response.status() + " " + response.url()); });
  assert.equal((await page.goto(base))?.status(), 200); await settle(page);
  return { context, page };
}

(async () => {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../building-art.js"), "utf8"), sandbox);
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../progression.js"), "utf8"), sandbox);
  const api = sandbox.window.AzmaraProgression;
  assert(Object.isFrozen(api) && Object.isFrozen(api.milestones));
  assert.deepEqual([...api.milestones], allMilestones);
  for (const level of [-1,0,1,4,4.99,5,7,8,9,10,11,12,14,15,16,17,19,20,21,22,24,25,27,28,33,34,40,41,44,45,49,50,99,NaN,Infinity]) {
    const completed=Number.isFinite(level)?Math.max(0,Math.min(50,Math.floor(level))):0;
    const min=allMilestones.filter(value=>value<=Math.max(1,completed)).at(-1),stage=allMilestones.indexOf(min)+1;
    for (const desktop of [true, false]) { const actual = api.forLevel(level, { desktop }); assert(Object.isFrozen(actual)); assert.equal(actual.stage, stage); assert.equal(actual.minLevel, min); assert.equal(actual.hallAsset, asset("hall", min, desktop)); assert.equal(actual.terrainAsset, asset("terrain", min, desktop)); assert.equal(actual.terrainBaseLevel, 1); assert(min === 1 ? actual.terrainOverlay === null : actual.terrainOverlay?.startsWith("data:image/svg+xml")); }
  }
  console.log("PASS pure immutable milestone API handles every boundary, invalid value and profile without simulation"); groups += 1;
  for (const [original, current] of [["azmara-town-hall-v3.png", "azmara-hall-level-10.png"], ["azmara-desktop-terrain-v2.png", "azmara-desktop-level-10.png"], ["azmara-starting-terrain-v3.png", "azmara-compact-level-10.png"]]) {
    const digest = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
    assert.equal(digest(path.join(__dirname, "../assets", original)), digest(path.join(__dirname, "../assets/progression", current)), "Level10 historical registration/source bytes were changed");
  }
  console.log("PASS level10 preserves all three approved historical source assets byte-for-byte"); groups += 1;
  const browser = await chromium.launch({ headless: true });
  try {
    for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
      const { context, page } = await contextPage(browser, viewport, JSON.stringify(makeState()));
      try {
        const desktop = viewport.width >= 1024;
        const sources = [...new Set(milestones.flatMap((min) => [asset("hall", min, desktop), asset("terrain", min, desktop)]))];
        for (const info of await imageInfo(page, sources)) {
          const hall = info.source.includes("-hall-");
          assert(info.width >= 512 && info.height >= 512 && info.opaque > info.total * .15, "Undecoded or visually empty stage asset: " + info.source);
          if (hall) {
            assert.equal(info.width, 1536); assert.equal(info.height, 1024);
            assert(info.transparent > info.total * .15 && info.corners.every((alpha) => alpha === 0), "Stage Hall lost true transparent cutout: " + info.source);
            assert(info.visibleWidth > .5 && info.visibleHeight > .5, "Stage Hall has unreadable padding: " + info.source);
          } else {
            assert.equal(info.transparent, 0); assert.equal(info.opaque, info.total, "Stage terrain contains nonopaque pixels: " + info.source);
            assert.equal(info.width, desktop ? 1671 : 1254, "Dry v2 terrain lost its independently decoded native dimensions: " + info.source);
            assert.equal(info.height, desktop ? 941 : 1254);
          }
        }
        console.log(`PASS five Hall cutouts and registered bare desert base decode with native alpha, fixed registration and meaningful artwork ${viewport.width}x${viewport.height}`); groups += 1;

        let previous = null;
        const baseline = await pose(page);
        for (const level of [1,4,5,7,8,11,12,16,17,21]) {
          const validRaw = JSON.stringify(makeState(level), null, 2);
          await page.evaluate(({ key, validRaw }) => localStorage.setItem(key, validRaw), { key, validRaw });
          await page.reload(); await appearance(page, level);
          assert.deepEqual(await storage(page), [validRaw, legacy], "Read-only actual stage rewrote v3/legacy save");
          assert.deepEqual(await pose(page), baseline, "Actual stage moved or stretched the map/camera");
          if (milestones.includes(level)) {
            const shot = await page.screenshot({ scale: "css" });
            if (shots) await page.screenshot({ path: path.join(shots, `isolated-actual-town-level-${level}-${viewport.width}x${viewport.height}.png`), scale: "css" });
            if (previous) { const difference = await pixelDifference(page, previous, shot); assert(difference.ratio > .01, "Milestone changes labels/URLs but not painted playfield pixels: " + JSON.stringify(difference)); }
            previous = shot;
          }
        }
        console.log(`PASS actual completed-level bands and materially different painted terrain/Hall at each milestone, no early band changes or save mutation ${viewport.width}x${viewport.height}`); groups += 1;

        const validRaw = JSON.stringify(makeState(4, { construction: { buildingId: "general-01", toLevel: 5, startedAt: epoch, endsAt: epoch + 120000, paidCost: { coins: 960, timber: 520, stone: 400 } } }));
        await page.evaluate(({ key, validRaw }) => localStorage.setItem(key, validRaw), { key, validRaw }); await page.reload();
        await appearance(page, 4);
        await menu(page, '[data-panel="appearance"]');
        const select = page.locator("#appearance-level");
        assert.deepEqual(await select.locator("option").evaluateAll((options) => options.map((option) => Number(option.value))), Array.from({length:50},(_,i)=>i+1));
        const bounds = await select.boundingBox(); assert(bounds && bounds.height >= 44 && bounds.width >= 44);
        for (const level of milestones) {
          await select.selectOption(String(level)); await appearance(page, level, "preview", 4);
          assert.equal(await page.locator("#appearance-hall-preview").getAttribute("src"), asset("hall", level, desktop));
          assert.match(await page.locator("#appearance-review-status").textContent(), /Actual levels.*unchanged.*nothing is saved/i);
          assert.deepEqual(await storage(page), [validRaw, legacy]);
        }
        await select.selectOption("20");
        await page.setViewportSize(desktop ? { width: 390, height: 844 } : { width: 1440, height: 900 });
        await appearance(page, 20, "preview", 4);
        assert.deepEqual(await storage(page), [validRaw, legacy], "Profile flip saved a transient appearance");
        await page.setViewportSize(viewport);
        await appearance(page, 20, "preview", 4);
        await close(page); await appearance(page, 4);
        await menu(page, '[data-panel="appearance"]'); await select.selectOption("20");
        await page.locator("#appearance-level").evaluate((node) => { node.append(new Option("Unapproved", "99")); node.value = "99"; node.dispatchEvent(new Event("change", { bubbles: true })); });
        await appearance(page, 20, "preview", 4);
        await mode(page, "gameplay"); await appearance(page, 4);
        assert.deepEqual(await storage(page), [validRaw, legacy]);
        await mode(page, "dev"); await menu(page, '[data-panel="appearance"]'); await select.selectOption("15");
        await page.locator('#actions-menu [data-panel="overview"]').dispatchEvent("click");
        await appearance(page, 4);
        await close(page);
        assert.deepEqual(await storage(page), [validRaw, legacy]);
        console.log(`PASS temporary appearance preview restores on Close/Gameplay/other panel and never changes receipt, deadline, actual level or save ${viewport.width}x${viewport.height}`); groups += 1;

        await page.evaluate((epoch) => { window.__appearanceQaNow = epoch + 119999; }, epoch);
        await page.waitForTimeout(550); await appearance(page, 4);
        assert.equal((await storage(page))[0], validRaw, "Queued milestone painted or completed before deadline");
        await page.evaluate((epoch) => { window.__appearanceQaNow = epoch + 120000; }, epoch);
        await page.waitForFunction((key) => JSON.parse(localStorage.getItem(key)).hallLevel === 5, key);
        await appearance(page, 5);
        const completed = JSON.parse((await storage(page))[0]);
        assert.equal(completed.construction, null); assert.deepEqual(completed.resources, resources);
        assert.equal((await storage(page))[1], legacy);
        console.log(`PASS actual level4-to5 deadline atomically switches both Hall and terrain without extra cost ${viewport.width}x${viewport.height}`); groups += 1;

        const emptyRaw = JSON.stringify(makeState(1, { hallPlaced: false }));
        await page.evaluate(({ key, emptyRaw }) => localStorage.setItem(key, emptyRaw), { key, emptyRaw }); await page.reload();
        await appearance(page, 0, "actual", 0, false);
        await menu(page, '[data-panel="appearance"]'); await select.selectOption("20");
        await appearance(page, 20, "preview", 0, false);
        assert.equal(await page.locator("#town-core img.empty-plot-art").count(), 23);
        assert.deepEqual(await storage(page), [emptyRaw, legacy]);
        await page.locator("#finish-appearance-review").click(); await appearance(page, 0, "actual", 0, false);
        console.log(`PASS Hall-unplaced artwork review never occupies a ground reserve and Return restores the bare actual town ${viewport.width}x${viewport.height}`); groups += 1;
      } finally { await context.close(); }
    }
    assert.deepEqual(errors, [], "Progression browser errors");
    assert.equal(groups, 12);
    console.log(`PASS ${groups} appearance/source/save regression groups; isolated browser only.`);
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); if (errors.length) console.error(errors); process.exitCode = 1; });
