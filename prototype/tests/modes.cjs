"use strict";

// Presentation-mode QA uses isolated local contexts, never the Founder's Chrome.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(process.argv[2] || "playwright");
const base = process.argv[3] || "http://127.0.0.1:4317";
assert(["localhost", "127.0.0.1", "[::1]"].includes(new URL(base).hostname), "Mode QA is local-only");
const shots = process.env.AZMARA_QA_SCREENSHOTS;
if (shots) assert(fs.statSync(shots).isDirectory(), "Screenshot folder must already exist");
const key = "azmara-town-layout-v3";
const legacyKey = "azmara-town-design-v1";
const errors = [];
let groups = 0;

async function settle(page) {
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function storage(page) {
  return page.evaluate(() => ({
    local: Object.fromEntries(Object.keys(localStorage).sort().map((key) => [key, localStorage.getItem(key)])),
    session: Object.fromEntries(Object.keys(sessionStorage).sort().map((key) => [key, sessionStorage.getItem(key)]))
  }));
}

async function seed(context, queued = true) {
  const now = Date.now();
  const saved = JSON.stringify({ version: 3, layoutId: "town-23-v1", townName: "Mode QA town", resources: { coins: 4800, timber: 1500, stone: 1000 }, hallLevel: 4, construction: queued ? { buildingId: "general-01", toLevel: 5, startedAt: now, endsAt: now + 10000 } : null });
  const legacy = ' {"version":1,"townName":"Legacy untouched", "resources":{"coins":9191}} ';
  await context.addInitScript(({ now, saved, legacy, key, legacyKey, origin }) => {
    Date.now = () => now;
    if (location.origin === origin && localStorage.getItem(key) === null) {
      localStorage.setItem(key, saved);
      localStorage.setItem(legacyKey, legacy);
    }
  }, { now, saved, legacy, key, legacyKey, origin: new URL(base).origin });
  return { saved, legacy };
}

async function load(context) {
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => errors.push(request.url()));
  page.on("response", response=>{if(response.status()>=400)errors.push(response.status()+" "+response.url());});
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  assert.equal((await page.goto(base))?.status(), 200);
  await page.waitForFunction(() => document.body.dataset.previewMode === "dev" && Boolean(window.AzmaraAtlas));
  await page.locator("#town-core img").evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
  await settle(page);
  return page;
}

async function openMenu(page) {
  const desktop = await page.locator('[data-desktop-action="options"]').isVisible();
  const trigger = page.locator(desktop ? '[data-desktop-action="options"]' : "#toggle-actions");
  if (!await page.locator("#actions-menu").evaluate((dialog) => dialog.open)) await trigger.click();
  await page.waitForFunction(() => document.querySelector("#actions-menu").open);
  return trigger;
}

async function visibleMode(page, mode) {
  const controls = page.locator(`button[data-preview-mode="${mode}"]`);
  for (let index = 0; index < await controls.count(); index += 1) if (await controls.nth(index).isVisible()) return controls.nth(index);
  await openMenu(page);
  for (let index = 0; index < await controls.count(); index += 1) if (await controls.nth(index).isVisible()) return controls.nth(index);
  throw new Error("No accessible " + mode + " mode switch");
}

async function exposed(control) {
  await control.scrollIntoViewIfNeeded();
  const result = await control.evaluate((node) => {
    const r = node.getBoundingClientRect();
    const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return { label: node.textContent, x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height, hit: node === hit || node.contains(hit), viewportWidth: innerWidth, viewportHeight: innerHeight };
  });
  assert(result.width >= 43.9 && result.height >= 43.9 && result.x >= -.5 && result.y >= -.5 && result.right <= result.viewportWidth + .5 && result.bottom <= result.viewportHeight + .5 && result.hit, "Mode switch is clipped, covered or smaller than44px: " + JSON.stringify(result));
}

async function checkMode(page, expected) {
  assert.equal(await page.locator("body").getAttribute("data-preview-mode"), expected);
  const controls = await page.locator("button[data-preview-mode]").evaluateAll((buttons) => buttons.map((button) => ({ mode: button.dataset.previewMode, pressed: button.getAttribute("aria-pressed") })));
  assert(controls.some((button) => button.mode === "dev") && controls.some((button) => button.mode === "gameplay"));
  controls.forEach((button) => assert.equal(button.pressed, String(button.mode === expected), "Mode pressed state is stale"));
  assert.equal(await page.locator("#resources-title").textContent(), expected === "dev" ? "Demo resources" : "Resources");
  if (expected === "gameplay") {
    const visibleDev = await page.locator("[data-dev-only]").evaluateAll((nodes) => nodes.filter((node) => getComputedStyle(node).display !== "none" && node.getClientRects().length).map((node) => node.id || node.textContent));
    assert.deepEqual(visibleDev, [], "Dev tools remain visible in Gameplay");
  }
}

async function switchMode(page, mode, keyboard = false) {
  const control = await visibleMode(page, mode);
  await exposed(control);
  const inMenu = await control.evaluate((node) => Boolean(node.closest("#actions-menu")));
  const focusExpected = inMenu ? await page.locator('[data-desktop-action="options"]').isVisible() ? '[data-desktop-action="options"]' : "#toggle-actions" : `button[data-preview-mode="${mode}"]`;
  if (keyboard) { await control.focus(); await page.keyboard.press("Space"); }
  else await control.click();
  await settle(page);
  await checkMode(page, mode);
  assert.equal(await page.locator("#actions-menu").evaluate((dialog) => dialog.open), false, "Mode change left actions modal open");
  assert.equal(await page.locator("#detail-panel").evaluate((dialog) => dialog.open), false, "Mode change left detail modal open");
  assert.equal(await page.evaluate((selector) => document.activeElement?.matches(selector), focusExpected), true, "Mode change did not restore accessible focus");
}

async function menuAction(page, selector) {
  await openMenu(page);
  const action = page.locator("#actions-menu " + selector);
  await action.scrollIntoViewIfNeeded();
  await action.click();
  await settle(page);
}

async function townPose(page) {
  return page.evaluate(() => {
    const viewport = document.querySelector("#map-viewport");
    const map = document.querySelector("#town-map");
    return { left: viewport.scrollLeft, top: viewport.scrollTop, zoom: map.dataset.zoom, mapWidth: map.getBoundingClientRect().width, mapHeight: map.getBoundingClientRect().height, coreWidth: document.querySelector("#town-core").getBoundingClientRect().width, labels: map.classList.contains("labels-hidden") };
  });
}

async function atlasPose(page) {
  return page.evaluate(() => {
    const atlas = document.querySelector("#atlas-view");
    const viewport = document.querySelector("#atlas-viewport");
    return { view: document.body.dataset.mapView, atlasView: atlas.dataset.atlasView, island: atlas.dataset.islandId, type: atlas.dataset.islandType, zoom: atlas.dataset.zoom, left: viewport.scrollLeft, top: viewport.scrollTop, fit: viewport.dataset.fit };
  });
}

async function unchanged(page, expected, fixture) {
  assert.deepEqual(await storage(page), expected, "Presentation switch wrote storage or altered exact active-queue/legacy bytes");
  if (fixture) {
    assert.equal(expected.local[key], fixture.saved);
    assert.equal(expected.local[legacyKey], fixture.legacy);
  }
  assert.equal(await page.locator(".plot-marker").count(), 23);
  assert.equal(await page.locator('.plot-marker[data-occupied="true"]').count(), 1);
}

async function capture(page, name) {
  if (shots) await page.screenshot({ path: path.join(shots, name + ".png"), scale: "css" });
}

async function switchFromModal(page, mode) {
  const desktop = await page.locator('[data-desktop-action="options"]').isVisible();
  await page.locator(`${desktop ? ".desktop-header" : "#actions-menu"} button[data-preview-mode="${mode}"]`).dispatchEvent("click");
  await settle(page);
  await checkMode(page, mode);
  assert.equal(await page.locator("#detail-panel").evaluate((dialog) => dialog.open), false);
  assert.equal(await page.locator("#actions-menu").evaluate((dialog) => dialog.open), false);
  assert.equal(await page.evaluate((selector) => document.activeElement?.matches(selector), desktop ? `button[data-preview-mode="${mode}"]` : "#toggle-actions"), true, "Modal mode switch left focus on a hidden or stale control");
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [width, height] of [[1440, 900], [390, 844], [320, 568], [844, 390]]) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
      try {
        const fixture = await seed(context);
        const page = await load(context);
        const expected = await storage(page);
        await checkMode(page, "dev");
        await menuAction(page, '[data-panel="catalogue"]');
        assert.equal(await page.locator(".catalogue-card").count(), 30);
        await page.keyboard.press("Escape");
        await switchMode(page, "gameplay", true);
        await capture(page, `gameplay-town-${width}x${height}`);
        const gameplayPose = await townPose(page);
        await openMenu(page);
        assert.equal(await page.locator('#actions-menu [data-panel="catalogue"]').isVisible(), false);
        for (let index = 0; index < 14; index += 1) {
          await page.keyboard.press("Tab");
          const active = await page.evaluate(() => ({ inMenu: document.querySelector("#actions-menu").contains(document.activeElement), body: document.activeElement === document.body, dev: Boolean(document.activeElement.closest("[data-dev-only]")), visible: Boolean(document.activeElement.getClientRects().length) }));
          assert((active.inMenu || active.body) && !active.dev && active.visible, "Tab reached hidden Dev tool or left modal controls: " + JSON.stringify(active));
        }
        await page.keyboard.press("Escape");
        assert.deepEqual(await townPose(page), gameplayPose, "Keyboard menu use altered the town camera");
        await menuAction(page, '[data-panel="overview"]');
        assert.equal(await page.locator("#request-reset, #confirm-reset, #detail-panel [data-panel=\"catalogue\"]").count(), 0);
        assert((await page.locator("#panel-content").textContent()).includes("Level 4"));
        await page.keyboard.press("Escape");
        await menuAction(page, '[data-panel="buildings"]');
        await page.locator('#detail-panel [data-building="general-01"]').click();
        assert.equal(await page.locator("#upgrade-building").count(), 0);
        assert((await page.locator("#panel-content").textContent()).includes("Building updates and developer tools are not available"));
        await page.keyboard.press("Escape");
        for (const advisor of ["forces", "knowledge", "diplomacy"]) {
          await menuAction(page, `[data-panel="${advisor}"]`);
          assert.equal(await page.locator("#detail-panel").evaluate((dialog) => dialog.open), true);
          await page.keyboard.press("Escape");
        }
        await menuAction(page, "#rename-town");
        assert.equal(await page.locator("#town-name-input").inputValue(), "Mode QA town");
        assert.equal(await page.locator('#rename-form button[type="submit"]').isVisible(), true);
        await page.keyboard.press("Escape");
        await unchanged(page, expected, fixture);
        await switchMode(page, "dev");
        await capture(page, `dev-town-${width}x${height}`);
        await unchanged(page, expected, fixture);
        await switchMode(page, "gameplay");
        await page.reload();
        await page.waitForFunction(() => document.body.dataset.previewMode === "dev");
        await settle(page);
        await checkMode(page, "dev");
        await unchanged(page, expected, fixture);
        console.log(`PASS Dev default/reload, keyboard switch, visible44px controls, Gameplay navigation/advisers/rename and exact saves at ${width}x${height}`); groups += 1;
      } finally { await context.close(); }
    }

    for (const [width, height] of [[1440, 900], [390, 844]]) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
      try {
        const fixture = await seed(context);
        const page = await load(context);
        const expected = await storage(page);
        await menuAction(page, "#toggle-map-view");
        await page.locator("#map-viewport").focus();
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowDown");
        const before = await townPose(page);
        await switchMode(page, "gameplay");
        assert.deepEqual(await townPose(page), before, "Mode change moved or resized closer town camera");
        await switchMode(page, "dev");
        assert.deepEqual(await townPose(page), before, "Return to Dev moved closer camera");
        await menuAction(page, '[data-map-navigation="world"]');
        await page.locator('[data-atlas-island="tamar-bay"]').click();
        await page.locator('#atlas-view img').evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
        for (let index = 0; index < 5; index += 1) await page.locator('[aria-label="Zoom in atlas"]').click();
        await page.locator("#atlas-viewport").focus();
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowDown");
        const atlasBefore = await atlasPose(page);
        await switchMode(page, "gameplay");
        assert.deepEqual(await atlasPose(page), atlasBefore, "Mode change reset atlas selection or camera");
        await switchMode(page, "dev");
        assert.deepEqual(await atlasPose(page), atlasBefore, "Return to Dev reset atlas selection or camera");
        assert.equal(await page.locator("#map-viewport").evaluate((node) => node.hidden && node.inert), true);
        await unchanged(page, expected, fixture);
        console.log(`PASS town close/scroll and non-home island close/scroll unchanged through both presentation modes at ${width}x${height}`); groups += 1;

        await menuAction(page, '[data-panel="catalogue"]');
        await switchFromModal(page, "gameplay");
        assert.deepEqual(await atlasPose(page), atlasBefore);
        await switchMode(page, "dev");
        await menuAction(page, '[data-panel="overview"]');
        await page.locator("#request-reset").click();
        assert.equal(await page.locator("#reset-confirm").isVisible(), true);
        await switchFromModal(page, "gameplay");
        await page.locator("#confirm-reset").dispatchEvent("click");
        await page.locator('#actions-menu [data-panel="catalogue"]').dispatchEvent("click");
        const hiddenHelp = page.locator('[data-desktop-action="help"]');
        if (await hiddenHelp.count()) await hiddenHelp.dispatchEvent("click");
        assert.equal(await page.locator("#detail-panel").evaluate((dialog) => dialog.open), false, "Gameplay direct Dev action opened a panel");
        assert.deepEqual(await atlasPose(page), atlasBefore);
        await unchanged(page, expected, fixture);
        console.log(`PASS mode switch closes catalogue/reset modals, restores correct focus and blocks stale reset/catalogue/help actions at ${width}x${height}`); groups += 1;
      } finally { await context.close(); }
    }

    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    try {
      const fixture = await seed(context, false);
      const page = await load(context);
      const expected = await storage(page);
      await menuAction(page, '[data-panel="buildings"]');
      await page.locator('#detail-panel [data-building="general-01"]').click();
      assert.equal(await page.locator("#upgrade-building").isEnabled(), true);
      await switchFromModal(page, "gameplay");
      await page.locator("#upgrade-building").dispatchEvent("click");
      await unchanged(page, expected, fixture);
      await menuAction(page, '[data-panel="buildings"]');
      await page.locator('#detail-panel [data-building="general-02"]').click();
      assert.equal(await page.locator('#detail-panel [data-panel="catalogue"]').count(), 0);
      assert.equal(await page.locator("#upgrade-building, #request-reset, #confirm-reset").count(), 0);
      await page.keyboard.press("Escape");
      await unchanged(page, expected, fixture);
      console.log("PASS affordable stale Hall upgrade blocked in Gameplay; empty sites remain read-only with no Dev catalogue control"); groups += 1;
    } finally { await context.close(); }

    assert.deepEqual(errors, [], "Browser errors during mode QA");
    assert.equal(groups, 9);
    console.log("PASS 9 presentation-mode regression groups; no page, console or network errors");
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
