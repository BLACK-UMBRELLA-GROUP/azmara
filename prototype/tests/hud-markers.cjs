"use strict";

// DEC-046 focused local HUD/marker checks. No user browser or hosted credentials.
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require(process.argv[2] || "playwright");
const { markerPoints, assertDrawnMarkers } = require("./marker-proof.cjs");
const { northInset, wallInset, horizontalInsets } = require("./desktop-projection.cjs");
const base = process.argv[3] || "http://127.0.0.1:4317";
assert(["localhost", "127.0.0.1", "[::1]"].includes(new URL(base).hostname), "This suite is local-only");
const shots = process.env.AZMARA_QA_SCREENSHOTS;
if (shots) assert(fs.statSync(shots).isDirectory(), "Screenshot destination must already exist");
const key = "azmara-town-layout-v3";
const legacyKey = "azmara-town-design-v1";
const actions = ["merchant-ships", "freighter-ships", "population", "action-points", "inventory", "shop"];
const desktopAnchors = Object.fromEntries([
  [2100, 1150], [1250, 880], [1250, 1150], [1050, 1400], [1550, 860],
  [1550, 1150], [1550, 1440], [2650, 860], [2950, 1420], [3150, 900],
  [2100, 1600], [2100, 700], [2650, 1150], [2950, 1150], [2650, 1440],
  [1850, 890], [1850, 1410], [2350, 1410], [2350, 890]
].map(([x, y], index) => ["general-" + String(index + 1).padStart(2, "0"), { x, y }]));
const errors = [];
let groups = 0;

async function settle(page) {
  await page.waitForFunction(() => document.querySelector("#town-map")?.dataset.cameraAnimating !== "true");
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function load(context) {
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => errors.push(request.url()));
  page.on("response", response=>{if(response.status()>=400)errors.push(response.status()+" "+response.url());});
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  assert.equal((await page.goto(base))?.status(), 200);
  await page.waitForFunction(() => document.querySelectorAll("#town-core .plot-marker").length === 23 && document.querySelector("#town-terrain-art") && document.querySelector("#town-map")?.dataset.presentation);
  await page.locator("#town-core img").evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
  await settle(page);
  await page.mouse.move(2, 2);
  return page;
}

async function bytes(page) {
  return page.evaluate(({ key, legacyKey }) => [localStorage.getItem(key), localStorage.getItem(legacyKey)], { key, legacyKey });
}

async function capture(page, name) {
  if (shots) await page.screenshot({ path: path.join(shots, name + ".png"), scale: "css" });
}

async function inspectActions(page) {
  const before = await bytes(page);
  const pose = await page.locator("#town-core").evaluate((core) => core.getBoundingClientRect().toJSON());
  for (const action of actions) {
    const button = page.locator(`#desktop-hud [data-action="${action}"]`);
    assert.equal(await button.count(), 1, "New HUD action is missing or duplicated: " + action);
    assert(await button.isVisible(), "New HUD action is invisible: " + action);
    await button.click();
    await page.locator("#detail-panel").waitFor({ state: "visible" });
    const title = (await page.locator("#panel-title").textContent()).trim();
    assert.match(title, new RegExp(action === "merchant-ships" ? "caravan" : action === "freighter-ships" ? "convoy" : action === "action-points" ? "action points" : action, "i"), "New HUD action opens the wrong surface: " + action);
    assert.match(await page.locator("#panel-content").textContent(), /not configured|not implemented|not yet|draft|future|no .+ configured|cannot make purchases|not run|not balanced|undecided|proposed/i, "Draft action falsely claims live gameplay: " + action);
    assert.equal(await page.locator("#panel-content form, #panel-content input, #panel-content select, #panel-content .primary-button:enabled").count(), 0, "Draft action creates live transactions or simulation: " + action);
    for (const input of ["ArrowRight", "ArrowDown", "+", "-"]) await page.keyboard.press(input);
    const actual = await page.locator("#town-core").evaluate((core) => core.getBoundingClientRect().toJSON());
    for (const field of ["x", "y", "width", "height"]) assert(Math.abs(actual[field] - pose[field]) <= 1, "Draft dialog does not gate map input");
    await capture(page, "hud-markers-panel-" + action);
    await page.keyboard.press("Escape");
    await page.locator("#detail-panel").waitFor({ state: "hidden" });
    await settle(page);
    assert(await button.evaluate((element) => document.activeElement === element), "Draft dialog lost focus return: " + action);
    assert.deepEqual(await bytes(page), before, "Read-only HUD action changes progress: " + action);
  }
}

async function neutralAssets(page) {
  const assets = await page.locator("#town-core img.empty-plot-art").evaluateAll(async (images) => {
    const sources = [...new Set(images.map((image) => image.currentSrc))];
    return Promise.all(sources.map(async (source) => {
      const image = new Image(); image.src = source; await image.decode();
      const canvas = document.createElement("canvas"); canvas.width = 256; canvas.height = Math.round(256 * image.naturalHeight / image.naturalWidth);
      const context = canvas.getContext("2d"); context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let strongBlue = 0, opaque = 0;
      for (let index = 0; index < pixels.length; index += 4) {
        const [r, g, b, a] = pixels.slice(index, index + 4);
        if (a >= 210) opaque += 1;
        if (a >= 210 && b >= 100 && b > r + 25 && b > g + 5) strongBlue += 1;
      }
      return { source, strongBlue, opaque };
    }));
  });
  assert.equal(assets.length, 3, "Ordinary earth, wider rectangular wall earth and freighter dock must retain their three original reserve visuals");
  for (const asset of assets) {
    assert(asset.opaque >= 100, "Reserve artwork is blank or undecoded");
    assert.equal(asset.strongBlue, 0, "Removed blue flag remains in active reserve artwork: " + asset.source);
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [width, height] of [[1024, 600], [1024, 768], [1280, 720], [1366, 600], [1500, 600], [1440, 900], [1864, 977], [2560, 900]]) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
      try {
        const page = await load(context);
        await northInset(page, desktopAnchors, true);
        await wallInset(page, true);
        await horizontalInsets(page, true);
        assert(await page.locator("#desktop-hud").isVisible());
        assert.equal(await page.locator(".desktop-rail-left").count(), 0, "Old left toolbar remains");
        const panel = await page.locator(".desktop-resource-panel").boundingBox();
        assert(panel && Math.abs(panel.width - Math.min(700, width - 386)) <= 1 && panel.height <= height * .36, "Expanded HUD width or protected gameplay height disagrees with the approved desktop layout");
        const name = await page.locator(".desktop-town-selector").boundingBox();
        const advisers = await page.locator(".desktop-advisers").boundingBox();
        assert(name && Math.abs(name.width - 176) <= 1 && name.height >= 44, "Town-name box did not stay compact while the surrounding HUD expanded");
        assert(advisers && Math.abs(advisers.width - 344) <= 1 && advisers.x - panel.x - panel.width >= 17, "Expanded advisers overlap the resource HUD or lose the reserved gap");
        const buttons = await page.locator(".desktop-resource-panel button, .desktop-advisers button").evaluateAll((nodes) => nodes.map((node) => { const r = node.getBoundingClientRect(); return { name: node.getAttribute("aria-label") || node.textContent.trim(), rect: r.toJSON(), exposed: document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.closest("button") === node }; }));
        for (const button of buttons) assert(button.name && button.rect.width >= 44 && button.rect.height >= 44 && button.rect.x >= 0 && button.rect.y >= 0 && button.rect.right <= width + 1 && button.rect.bottom <= height + 1 && button.exposed, "Expanded HUD action is clipped, covered or smaller than44px: " + JSON.stringify(button));
        for (const counter of actions.slice(0, 4)) {
          assert.equal((await page.locator("#counter-" + counter).textContent()).trim(), "—", "Undecided counter invents a numeric balance: " + counter);
          assert.match(await page.locator("#counter-" + counter).getAttribute("aria-label"), /not configured/i, "Unconfigured counter is not explained to assistive technology");
        }
        const targets = await page.locator("#town-core .plot-marker").evaluateAll((nodes) => nodes.map((node) => {
          const r = node.getBoundingClientRect();
          const x = r.x + r.width / 2, y = r.y + r.height / 2;
          const samples = [[0, 0], [-21, -21], [21, -21], [-21, 21], [21, 21]];
          return { id: node.dataset.plot, rect: r.toJSON(), name: node.getAttribute("aria-label"), coreExposed: samples.every(([dx, dy]) => document.elementFromPoint(x + dx, y + dy)?.closest(".plot-marker") === node), samples: samples.map(([dx, dy]) => ({ x: x + dx, y: y + dy, hit: document.elementFromPoint(x + dx, y + dy)?.closest("button")?.outerHTML.slice(0, 220) || document.elementFromPoint(x + dx, y + dy)?.outerHTML.slice(0, 220) })) };
        }));
        assert.equal(targets.length, 23);
        if (targets.some((target) => !target.coreExposed)) {
          await capture(page, `hud-markers-${width}x${height}-core-obstruction`);
          console.log("CORE OBSTRUCTION " + JSON.stringify({ panel, advisers, targets: targets.filter((target) => !target.coreExposed) }));
        }
        for (const target of targets) assert(target.name && target.rect.width >= 44 && target.rect.height >= 44 && target.rect.x >= -1 && target.rect.y >= -1 && target.rect.right <= width + 1 && target.rect.bottom <= height + 1 && target.coreExposed, "A full44px plot-selection core is clipped or intercepted: " + JSON.stringify(target));
        for (let a = 0; a < targets.length; a += 1) for (let b = a + 1; b < targets.length; b += 1) {
          const first = targets[a], second = targets[b];
          assert(!(Math.min(first.rect.right, second.rect.right) - Math.max(first.rect.x, second.rect.x) > .5 && Math.min(first.rect.bottom, second.rect.bottom) - Math.max(first.rect.y, second.rect.y) > .5), "Full sprite-aligned targets overlap under the expanded HUD: " + first.id + " / " + second.id);
        }
        const points = await markerPoints(page);
        assert.equal(points.length, 22);
        assert.equal(await page.locator("#town-core .empty-slot-plus, #town-core .plot-plus").count(), 0, "Removed plot plus-symbol overlay remains");
        const blocked = points.filter((point) => !point.inside || !point.exposed || point.artWidth < 24 || point.artHeight < 16);
        if (blocked.length) {
          await capture(page, `hud-markers-${width}x${height}-obstruction`);
          const evidence = await page.evaluate((blocked) => blocked.map((point) => ({ id: point.id, rect: point.rect, artWidth: point.artWidth, artHeight: point.artHeight, samples: point.samples.map(({ x, y }) => { const node = document.elementFromPoint(x, y); return { x, y, hit: node?.closest("button")?.outerHTML || node?.outerHTML?.slice(0, 180) }; }) })), blocked);
          console.log("OBSTRUCTION " + JSON.stringify({ panel, advisers, evidence }));
        }
        assert.equal(blocked.length, 0, "Ground reserves are unreadable, clipped or intercepted by the expanded HUD: " + blocked.map((point) => point.id).join(", "));
        await assertDrawnMarkers(page, points);
        await capture(page, `hud-markers-${width}x${height}-fit`);
        console.log(`PASS expanded HUD, compact176px town name, exposed44px actions, truthful counters and 22 visible flag-free ground reserves ${width}x${height}`);
        groups += 1;
        if (width === 1864) {
          await inspectActions(page);
          console.log("PASS six read-only HUD draft panels, modal gating, focus return and unchanged progress"); groups += 1;
          await neutralAssets(page);
          const roleSources = await page.locator("#town-core img.empty-plot-art").evaluateAll((images) => Object.fromEntries(images.map((image) => [image.closest(".plot-marker").dataset.plot, image.currentSrc])));
          assert.match(roleSources["wall-01"], /wall-earth-reserve-v2\.svg$/, "Wall-only reservation must use its wider neutral rectangular earth artwork");
          assert.notEqual(roleSources["wall-01"], roleSources["general-02"]);
          assert.notEqual(roleSources["freighter-01"], roleSources["general-02"]);
          assert.notEqual(roleSources["wall-01"], roleSources["freighter-01"]);
          console.log("PASS no blue flags or grey wall artwork; wall-only neutral ground and distinct freighter dock preserve their roles"); groups += 1;
          const original = await bytes(page);
          await page.locator('[data-desktop-action="options"]').click();
          await page.locator("#actions-menu").waitFor({ state: "visible" });
          for (const selector of ['[data-panel="buildings"]', '[data-panel="overview"]', "#rename-town", "#zoom-in", "#zoom-out", "#toggle-map-view", "#toggle-labels", "#center-map"]) {
            const control = page.locator("#actions-menu " + selector);
            assert.equal(await control.count(), 1, "Removed toolbar action is unavailable through Options: " + selector);
            await control.scrollIntoViewIfNeeded();
            assert(await control.isVisible());
          }
          await page.keyboard.press("Escape"); await page.locator("#actions-menu").waitFor({ state: "hidden" });
          assert.deepEqual(await bytes(page), original);
          console.log("PASS equivalent Options access after left-toolbar removal"); groups += 1;
        }
      } finally { await context.close(); }
    }
    const saved = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    try {
      const now = Date.now();
      const original = JSON.stringify({ version: 3, layoutId: "town-23-v1", townName: "HUD retained town", resources: { coins: 1900, timber: 600, stone: 400 }, hallLevel: 4, construction: { buildingId: "general-01", toLevel: 5, startedAt: now, endsAt: now + 10000 } });
      const legacy = JSON.stringify({ version: 1, townName: "Untouched older town", levels: { council: 9 }, resources: { coins: 9999 } });
      await saved.addInitScript(({ key, legacyKey, original, legacy, now, origin }) => {
        Date.now = () => now;
        if (location.origin === origin) { localStorage.setItem(key, original); localStorage.setItem(legacyKey, legacy); }
      }, { key, legacyKey, original, legacy, now, origin: new URL(base).origin });
      const page = await load(saved); await inspectActions(page);
      assert.deepEqual(await bytes(page), [original, legacy], "New HUD actions changed valid v3 queue or read-only legacy bytes");
      console.log("PASS exact active v3 queue and legacy-byte compatibility under six new HUD actions"); groups += 1;
    } finally { await saved.close(); }
    assert.deepEqual(errors, [], "Captured browser/console/request errors");
    console.log("PASS zero browser/console/request errors"); groups += 1;
    console.log(`${groups} focused HUD/marker groups passed`);
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); if (errors.length) console.error("Captured errors:", errors); process.exitCode = 1; });
