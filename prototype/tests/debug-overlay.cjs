"use strict";

// Focused local diagnostics QA; disposable fixtures, never player storage.
// argv[2]: installed Playwright module; argv[3]: loopback prototype URL.
const q = require("./building-harness.cjs");
const { chromium } = require(process.argv[2] || "playwright");
const { assert, create, fixture, settle, raw, legacyKey, close, menu, mode, picture } = q;
const ordinaryUrl = new URL(q.base);
ordinaryUrl.searchParams.delete("debug");
const debugUrl = new URL(ordinaryUrl);
debugUrl.searchParams.set("debug", "1");
const grid = "#town-debug-grid";
const info = "#town-debug-info";
const seed = " \n" + JSON.stringify(fixture({ townName: "Debug QA town" }), null, 2) + " \n";
const bytes = async page => [await raw(page), await raw(page, legacyKey)];
let groups = 0;
const pass = label => { groups++; console.log("PASS " + label); };

async function load(page, url) {
  // Let late-painted terrain finish before navigating away from the harness page.
  await page.waitForLoadState("networkidle");
  assert.equal((await page.goto(url.href))?.status(), 200);
  await page.waitForFunction(() => document.querySelectorAll("#town-core .plot-marker").length === 23 && document.querySelector("#town-map")?.dataset.presentation);
  await settle(page);
  await page.waitForLoadState("networkidle");
}
async function state(page) { return page.locator(grid).getAttribute("data-enabled"); }
async function enabled(page, expected) {
  await page.waitForFunction(({ selector, expected }) => document.querySelector(selector)?.dataset.enabled === String(expected), { selector: grid, expected });
  assert.equal(await page.locator(grid).isVisible(), expected, "Grid visibility disagrees with enabled state");
  assert.equal(await page.locator(info).isVisible(), expected, "Diagnostic info visibility disagrees with grid");
}
async function pose(page) {
  return page.evaluate(() => {
    const viewport = document.querySelector("#map-viewport"), map = document.querySelector("#town-map");
    return { scroll: [viewport.scrollLeft, viewport.scrollTop], viewBox: document.querySelector("#world-landscape").getAttribute("viewBox"),
      surface: [map.style.width, map.style.height], zoom: map.dataset.zoom, view: map.dataset.view, presentation: map.dataset.presentation,
      plots: [...document.querySelectorAll("#town-core .plot-marker")].map(node => ({ id: node.dataset.plot, rect: node.getBoundingClientRect().toJSON() })) };
  });
}
async function aligned(page) {
  await settle(page);
  const evidence = await page.evaluate(() => {
    const grid = document.querySelector("#town-debug-grid"), terrain = document.querySelector("#world-landscape");
    const box = node => { const r = node.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; };
    return { grid: grid.getAttribute("viewBox")?.trim().split(/\s+/).map(Number), terrain: terrain.getAttribute("viewBox").trim().split(/\s+/).map(Number),
      gridBox: box(grid), terrainBox: box(terrain), pointerEvents: getComputedStyle(grid).pointerEvents,
      collisions: document.querySelector("#debug-real-collisions")?.childElementCount,
      doesNotIntercept: [...document.querySelectorAll("#town-core .plot-marker")].every(node => {
        const r = node.getBoundingClientRect(), x = r.x + r.width / 2, y = r.y + r.height / 2;
        if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return true;
        const hit = document.elementFromPoint(x, y);
        return !hit?.closest("#town-debug-grid, #town-debug-info");
      }) };
  });
  assert.equal(evidence.grid?.length, 4, "Missing debug world viewBox");
  evidence.grid.forEach((value, index) => assert(Math.abs(value - evidence.terrain[index]) < 1e-7, "Debug grid uses screen/native-art units instead of the current world viewBox"));
  evidence.gridBox.forEach((value, index) => assert(Math.abs(value - evidence.terrainBox[index]) < .1, "Debug SVG does not fill the actual landscape surface"));
  assert.equal(evidence.pointerEvents, "none", "Grid intercepts map input");
  assert.equal(evidence.collisions, 0, "Missing collision group or invented gameplay colliders");
  assert(evidence.doesNotIntercept, "Debug layer intercepts a visible plot centre");
  assert.match((await page.locator(info).textContent()).replace(/\s+/g, " "), /not implemented/i, "Diagnostics imply a real collision system exists");
}
async function toggle(page, expected) {
  await page.locator("#map-viewport").evaluate(node => node.focus({ preventScroll: true }));
  const before = { bytes: await bytes(page), pose: await pose(page) };
  await page.keyboard.press("g"); await settle(page); await enabled(page, expected);
  assert.deepEqual(await bytes(page), before.bytes, "G changes exact saved town/legacy bytes");
  assert.deepEqual(await pose(page), before.pose, "G changes the camera or plot rectangles");
  if (expected) await aligned(page);
}
async function navigation(page, view) {
  if (view === "town") {
    await page.locator('[data-atlas-action="town"]').click(); await settle(page); return;
  }
  const selector = `[data-map-navigation="${view}"]`, direct = page.locator(selector + ":visible").first();
  if (await direct.count()) { await direct.click(); await settle(page); }
  else await menu(page, selector);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const normal = await create(browser, seed);
    try {
      const { page } = normal;
      page.setDefaultTimeout(20000);
      await load(page, ordinaryUrl);
      assert.equal(await page.locator(grid).count(), 0, "Debug DOM is loaded without ?debug=1");
      assert.equal(await page.locator(info).count(), 0);
      const before = { bytes: await bytes(page), pose: await pose(page) };
      await page.locator("#map-viewport").focus(); await page.keyboard.press("g"); await settle(page);
      assert.equal(await page.locator(grid).count(), 0);
      assert.deepEqual(await bytes(page), before.bytes); assert.deepEqual(await pose(page), before.pose);
      assert.deepEqual(normal.errors, []);
      pass("Ordinary local game loads no debug DOM; G changes neither saves nor scene");
    } finally { await normal.context.close(); }

    const run = await create(browser, seed);
    try {
      const { page } = run;
      page.setDefaultTimeout(20000);
      await load(page, debugUrl);
      await page.locator(grid).waitFor({ state: "attached" });
      assert.equal(await page.locator(grid).getAttribute("data-cell-size"), "100");
      await enabled(page, false);
      const original = await bytes(page);
      await toggle(page, true); await toggle(page, false); await toggle(page, true);

      // Exercise each input guard without a modal masking editable-field guards.
      const beforeGuards = { bytes: await bytes(page), pose: await pose(page) };
      await page.evaluate(() => {
        const dispatch = (target, extra = {}) => target.dispatchEvent(new KeyboardEvent("keydown", { key: "g", bubbles: true, cancelable: true, ...extra }));
        const viewport = document.querySelector("#map-viewport");
        for (const extra of [{ repeat: true }, { ctrlKey: true }, { metaKey: true }, { altKey: true }]) dispatch(viewport, extra);
        for (const tag of ["input", "select", "textarea", "div"]) {
          const field = document.createElement(tag);
          if (tag === "div") field.contentEditable = "true";
          field.style.position = "absolute"; field.style.left = "-10000px";
          document.body.append(field);
          try { dispatch(field); } finally { field.remove(); }
        }
      });
      await settle(page); await enabled(page, true);
      assert.deepEqual(await bytes(page), beforeGuards.bytes); assert.deepEqual(await pose(page), beforeGuards.pose);
      await menu(page, "#rename-town");
      const input = page.locator("#town-name-input"), name = await input.inputValue();
      await input.focus(); await page.keyboard.press("End"); await page.keyboard.press("g");
      assert.equal(await input.inputValue(), name + "g", "Typing G in rename is swallowed");
      assert.equal(await state(page), "true", "Typing G toggles diagnostics");
      await page.locator("#close-panel").focus(); await page.keyboard.press("g");
      assert.equal(await state(page), "true", "G toggles while a dialog is open");
      await close(page); assert.deepEqual(await bytes(page), original);
      pass("Debug query starts off; G preserves scene/saves and ignores input, modal, repeat and modifier keys");

      await aligned(page); await picture(page, "debug-grid-desktop-fit");
      await page.locator('[data-desktop-action="close"]').click(); await aligned(page);
      await page.locator('[data-desktop-action="zoom-in"]').click(); await aligned(page);
      const viewport = page.locator("#map-viewport");
      await viewport.evaluate(node => node.focus({ preventScroll: true }));
      const pointer = { x: 720, y: 450 };
      await viewport.dispatchEvent("pointermove", { clientX: pointer.x, clientY: pointer.y });
      const cursorBeforePan = await page.locator("#debug-grid-cursor").textContent();
      await page.keyboard.press("ArrowRight"); await aligned(page);
      const cursorAfterPan = await page.locator("#debug-grid-cursor").textContent();
      assert.notEqual(cursorAfterPan, cursorBeforePan, "Stationary-pointer coordinates are stale after keyboard pan");
      const expectedCursor = await page.evaluate(({ x, y }) => {
        const p = new DOMPoint(x, y).matrixTransform(document.querySelector("#town-debug-grid").getScreenCTM().inverse());
        return `Cell (${Math.floor(p.x / 100)},${Math.floor(p.y / 100)}) · world (${p.x.toFixed(1)},${p.y.toFixed(1)})`;
      }, pointer);
      assert.equal(cursorAfterPan, expectedCursor, "Cursor readout disagrees with actual camera transform");
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForFunction(() => document.querySelector("#town-map").dataset.presentation === "compact");
      await aligned(page); await picture(page, "debug-grid-compact-close");
      assert.deepEqual(await bytes(page), original);
      pass("Grid shares the real viewBox and surface through Close, zoom, pan and compact resize; no fake collisions");

      await mode(page, "gameplay"); await enabled(page, false);
      await page.locator("#map-viewport").evaluate(node => node.focus({ preventScroll: true }));
      await page.keyboard.press("g"); await settle(page); await enabled(page, false);
      await mode(page, "dev"); await enabled(page, false); await toggle(page, true);
      await navigation(page, "island");
      assert.equal(await page.locator(grid).isVisible(), false, "Town debug grid leaks into Region");
      assert.equal(await page.locator(info).isVisible(), false);
      const regionState = await state(page);
      await page.keyboard.press("g"); await settle(page);
      assert.equal(await state(page), regionState, "Region G changes town debug state");
      await navigation(page, "town");
      await page.waitForLoadState("networkidle");
      await page.reload(); await settle(page);
      await page.locator(grid).waitFor({ state: "attached" }); await enabled(page, false);
      assert.deepEqual(await bytes(page), original); assert.deepEqual(run.errors, []);
      pass("Gameplay clears diagnostics; Dev needs fresh G; Region hides; reload defaults off; exact saves retained");
    } finally { await run.context.close(); }
  } finally { await browser.close(); }
  console.log(`PASS debug overlay ${groups} focused groups; all isolated contexts/browser closed`);
})().catch(error => { console.error(error); process.exitCode = 1; });
