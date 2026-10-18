"use strict";

// Isolated, local desktop-overview QA. No hosted credentials or user browser.
// Match the other suites: argv[2] is Playwright, argv[3] the local preview URL.
const assert = require("node:assert/strict");
const { markerPoints, assertDrawnMarkers } = require("./marker-proof.cjs");
const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require(process.argv[2] || "playwright");
const base = process.argv[3] || "http://127.0.0.1:4317";
assert(["localhost", "127.0.0.1", "[::1]"].includes(new URL(base).hostname), "This suite is local-only");
const shots = process.env.AZMARA_QA_SCREENSHOTS;
if (shots) assert(fs.statSync(shots).isDirectory(), "Screenshot destination must be an existing directory");
const key = "azmara-town-layout-v3";
const legacyKey = "azmara-town-design-v1";
const expected = [
  ...Array.from({ length: 19 }, (_, index) => ["general-" + String(index + 1).padStart(2, "0"), "general"]),
  ["wall-01", "wall"], ["harbour-01", "harbour"], ["harbour-02", "harbour"], ["freighter-01", "freighter"]
];
const desktopSizes = [[1440, 900], [1864, 977], [1280, 720]];
const errors = [];
let checks = 0;

async function settle(page) {
  await page.locator("#town-map").evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function raw(page, storageKey = key) {
  return page.evaluate((storageKey) => localStorage.getItem(storageKey), storageKey);
}

async function pose(page) {
  return page.locator("#map-viewport").evaluate((viewport) => {
    const box = document.querySelector("#town-core").getBoundingClientRect();
    return [viewport.scrollLeft, viewport.scrollTop, box.x, box.y, box.width, box.height];
  });
}

function samePose(actual, prior, message) {
  assert(actual.every((value, index) => Math.abs(value - prior[index]) <= 1), message);
}

async function capture(page, name) {
  if (shots) await page.screenshot({ path: path.join(shots, name + ".png"), scale: "css" });
}

async function closePanel(page, trigger) {
  await page.keyboard.press("Escape");
  await page.locator("#detail-panel").waitFor({ state: "hidden" });
  await settle(page);
  if (trigger) assert(await trigger.evaluate((element) => document.activeElement === element), "Detail panel did not return focus to its invoking control");
}

async function desktopAction(page, action) {
  const button = page.locator(`[data-desktop-action="${action}"]`).first();
  assert(await button.isVisible(), "Missing visible desktop action: " + action);
  await button.click();
  await settle(page);
}

async function assertShell(page, desktop) {
  const geometry = await page.evaluate(() => {
    const rect = (selector) => document.querySelector(selector).getBoundingClientRect().toJSON();
    return { view: rect("#map-viewport"), width: innerWidth, height: innerHeight, bodyWidth: document.body.scrollWidth, documentWidth: document.documentElement.scrollWidth };
  });
  assert(geometry.bodyWidth <= geometry.width && geometry.documentWidth <= geometry.width, "Page-wide horizontal overflow");
  assert(Math.abs(geometry.view.x) <= 1 && Math.abs(geometry.view.y) <= 1 && Math.abs(geometry.view.right - geometry.width) <= 1 && Math.abs(geometry.view.bottom - geometry.height) <= 1, "Map does not fill the complete viewport");
  assert.equal(await page.locator("#desktop-hud").isVisible(), desktop, "Desktop HUD visibility is incorrect");
  assert.equal(await page.locator("#toggle-actions").isVisible(), !desktop, "Compact four-dot trigger is incorrect for the current viewport");
  if (!desktop) {
    assert(await page.locator("#town-name").isVisible(), "Compact town name is missing");
    return;
  }
  for (const selector of [".desktop-header", ".desktop-resource-panel", ".desktop-advisers", ".desktop-rail-right", ".desktop-compass"]) {
    assert(await page.locator(selector).isVisible(), "Missing desktop surface: " + selector);
  }
  assert.equal(await page.locator(".desktop-rail-left").count(), 0, "Removed left toolbar remains in the desktop DOM");
  const controls = await page.locator("#desktop-hud button").evaluateAll((buttons) => buttons.filter((button) => button.getBoundingClientRect().width > 0).map((button) => {
    const box = button.getBoundingClientRect();
    const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
    return { name: button.getAttribute("aria-label") || button.textContent.trim(), compactHeader: Boolean(button.closest(".desktop-header")), width: box.width, height: box.height, contained: box.x >= 0 && box.y >= 0 && box.right <= innerWidth + 1 && box.bottom <= innerHeight + 1, exposed: hit?.closest("button") === button };
  }));
  for (const control of controls) {
    const minimum = control.compactHeader ? 32 : 44;
    assert(control.name && control.contained && control.exposed && control.width >= minimum && control.height >= minimum, "Clipped, unnamed, undersized or intercepted desktop control: " + control.name);
  }
  assert.equal(await page.locator(".desktop-adviser[data-panel]").count(), 4, "Desktop must expose four advisers");
}

async function emptyPoints(page) {
  return markerPoints(page);
}

async function assertPlots(page, tapAll) {
  await page.locator("#map-viewport").focus();
  // Prevent a hover label from obscuring a neighbouring site's reserve art.
  await page.mouse.move(2, 2);
  await settle(page);
  const plots = await page.locator("#town-core .plot-marker").evaluateAll((elements) => elements.map((element) => {
    const box = element.getBoundingClientRect();
    const marker = element.querySelector(".marker").getBoundingClientRect();
    const x = marker.x + marker.width / 2;
    const y = marker.y + marker.height / 2;
    return { id: element.dataset.plot, kind: element.dataset.kind, occupied: element.dataset.occupied, box: box.toJSON(), x, y, exposed: document.elementFromPoint(x, y)?.closest(".plot-marker") === element, name: element.getAttribute("aria-label") };
  }));
  assert.deepEqual(plots.map(({ id, kind }) => [id, kind]).sort(), [...expected].sort(), "Semantic plot IDs or dedicated roles changed");
  assert.equal(plots.filter((plot) => plot.occupied === "true").length, 1, "There must be exactly one occupied plot");
  assert.equal(plots.find((plot) => plot.occupied === "true").id, "general-01", "Only the Hall plot may be occupied");
  const view = page.viewportSize();
  for (const plot of plots) {
    assert(plot.name && plot.box.width >= 44 && plot.box.height >= 44, "Plot target is unnamed or below 44px: " + plot.id);
    assert(plot.box.x >= -1 && plot.box.y >= -1 && plot.box.right <= view.width + 1 && plot.box.bottom <= view.height + 1, "Fit clips the complete hit target: " + plot.id);
    assert(plot.exposed, "Fit plot centre is hidden behind HUD/scenery: " + plot.id);
  }
  for (let a = 0; a < plots.length; a += 1) for (let b = a + 1; b < plots.length; b += 1) {
    const left = plots[a].box;
    const right = plots[b].box;
    assert(!(Math.min(left.right, right.right) - Math.max(left.x, right.x) > 0.5 && Math.min(left.bottom, right.bottom) - Math.max(left.y, right.y) > 0.5), "Fit hit targets overlap: " + plots[a].id + " and " + plots[b].id);
  }
  const flags = await emptyPoints(page);
  assert.equal(flags.length, 22, "Fresh scene needs 22 individual visible reserves");
  assert(flags.every((flag) => flag.inside && flag.exposed), "Fit reserve art is outside its target or intercepted: " + flags.filter((flag) => !flag.inside || !flag.exposed).map((flag) => flag.id).join(", "));
  await assertDrawnMarkers(page, flags);
  if (!tapAll) return;
  const before = await pose(page);
  const state = await raw(page);
  for (const plot of plots) {
    const flag = flags.find((flag) => flag.id === plot.id);
    await page.mouse.click(flag ? flag.x : plot.x, flag ? flag.y : plot.y);
    await page.locator("#detail-panel").waitFor({ state: "visible" });
    const expectedTitle = plot.id === "general-01" ? "Town Hall" : plot.id.startsWith("general-") ? "General plot " + plot.id.slice(-2) : plot.id === "wall-01" ? "Wall plot" : plot.id.startsWith("harbour-") ? "Harbour plot " + Number(plot.id.slice(-2)) : "Freighter plot";
    assert.equal((await page.locator("#panel-title").textContent()).trim(), expectedTitle, "Visible reserve click opened the wrong plot");
    if (plot.id !== "general-01") assert.equal(await page.locator("#upgrade-building, #panel-content form").count(), 0, "Empty plot invents gameplay: " + plot.id);
    await closePanel(page, page.locator(`#town-core [data-plot="${plot.id}"]`));
    samePose(await pose(page), before, "Selecting a plot moved the locked Fit view");
  }
  assert.equal(await raw(page), state, "Inspecting the 23 plots altered progress");
}

async function assertHudSync(page, expectedName) {
  const saved = JSON.parse(await raw(page));
  assert.equal((await page.locator("#desktop-town-name").textContent()).trim(), expectedName || saved.townName, "Desktop name is stale");
  for (const resource of ["coins", "timber", "stone"]) {
    const value = (await page.locator("#desktop-resource-" + resource).textContent()).replace(/[^0-9]/g, "");
    assert.equal(Number(value), saved.resources[resource], "Desktop resource is stale: " + resource);
  }
}

async function testCamera(page, captureSnapshot = true) {
  const saved = await raw(page);
  const fit = await pose(page);
  await desktopAction(page, "close");
  assert((await pose(page))[4] >= fit[4] * 1.5, "Close failed to enlarge buildings");
  assert.equal(await page.locator("#map-viewport").getAttribute("data-fit"), "false", "Close remains locked at Fit");
  if (captureSnapshot) await capture(page, "desktop-1440x900-close");
  await page.locator("#map-viewport").focus();
  await page.keyboard.press("+");
  assert((await pose(page))[4] > fit[4], "Keyboard + failed to zoom");
  for (let count = 0; count < 16; count += 1) {
    if (await page.locator('[data-desktop-action="zoom-in"]').first().isDisabled()) break;
    await desktopAction(page, "zoom-in");
  }
  const viewport = page.locator("#map-viewport");
  await desktopAction(page, "center");
  await viewport.focus();
  const prior = await pose(page);
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowDown");
  await settle(page);
  const moved = await pose(page);
  assert(moved[0] > prior[0] + 20 && moved[1] > prior[1] + 20, "Closer desktop camera does not move in both axes");
  await desktopAction(page, "fit");
  samePose(await pose(page), fit, "Fit did not return to its original stable overview");
  assert.equal(await viewport.getAttribute("data-fit"), "true", "Fit failed to restore the midpoint overview");
  await viewport.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowDown");
  await settle(page);
  assert.equal(await viewport.getAttribute("data-fit"), "false", "First manual pan did not release Fit");
  const panned = await pose(page);
  const ranges = await viewport.evaluate((element) => ({ left: element.scrollWidth - element.clientWidth, top: element.scrollHeight - element.clientHeight }));
  if (ranges.left > 2 || ranges.top > 2) assert(Math.abs(panned[0] - fit[0]) > 2 || Math.abs(panned[1] - fit[1]) > 2,
    "Picture-centred cover could not pan along its cropped axis");
  await viewport.evaluate((element) => element.scrollTo(10000, 10000));
  await settle(page);
  const maximum = await pose(page);
  assert(Math.abs(maximum[0] - ranges.left) <= 2 && Math.abs(maximum[1] - ranges.top) <= 2,
    "Camera cannot reach the picture's lower/right edges at minimum zoom");
  await desktopAction(page, "fit");
  samePose(await pose(page), fit, "Fit did not restore its original midpoint framing after panning");
  assert.equal(await raw(page), saved, "Camera controls wrote game progress");
  assert.equal((await page.locator("#desktop-map-zoom-level").textContent()).trim(), "Fit", "Desktop zoom readout is stale");
}

async function testDesktopPanels(page) {
  const original = await raw(page);
  const camera = await pose(page);
  for (const [area, title] of [["overview", "Town overview"], ["forces", "Forces"], ["knowledge", "Knowledge"], ["diplomacy", "Diplomacy"]]) {
    const button = page.locator(`.desktop-adviser[data-panel="${area}"]`);
    await button.click();
    await page.locator("#detail-panel").waitFor({ state: "visible" });
    assert.equal((await page.locator("#panel-title").textContent()).trim(), title, "Desktop adviser opened the wrong panel");
    if (area !== "overview") assert.match(await page.locator("#panel-content").textContent(), /future|not implemented|design/i, "Adviser falsely implies active gameplay");
    for (const input of ["ArrowRight", "ArrowDown", "+", "-"]) await page.keyboard.press(input);
    samePose(await pose(page), camera, "Modal adviser did not gate camera keyboard input");
    await closePanel(page, button);
  }
  for (const area of ["world", "island"]) {
    const button = page.locator(`[data-map-navigation="${area}"]`).first();
    await button.click();
    await page.locator("#atlas-view").waitFor({ state: "visible" });
    assert.equal(await page.locator("#atlas-view").getAttribute("data-atlas-view"), area, "Navigation opens the wrong actual map view");
    assert(await page.locator("#atlas-viewport").isVisible(), "Actual map has no visible playfield");
    assert.equal(await page.locator("#detail-panel").evaluate((dialog) => dialog.open), false, "Map navigation still opens the obsolete planned modal");
    assert.equal(await page.locator("#atlas-view form, #atlas-view input, #atlas-view select").count(), 0, "Visual atlas invents settlement or transport gameplay");
    await page.locator('[data-desktop-action="town"]').click();
    await page.locator("#atlas-view").waitFor({ state: "hidden" });
    await settle(page);
    samePose(await pose(page), camera, "Returning from actual atlas changed the town camera state");
  }
  const help = page.locator('[data-desktop-action="help"]').first();
  await help.click();
  await page.locator("#detail-panel").waitFor({ state: "visible" });
  assert((await page.locator("#panel-content").textContent()).trim(), "Desktop Help has no actual panel");
  await closePanel(page, help);
  const options = page.locator('[data-desktop-action="options"]').first();
  await options.click();
  await page.locator("#actions-menu").waitFor({ state: "visible" });
  assert(await page.locator("#actions-menu").evaluate((dialog) => dialog.matches(":modal")), "Desktop Options is not a modal actions dialog");
  for (const input of ["ArrowRight", "ArrowDown", "+", "-"]) await page.keyboard.press(input);
  samePose(await pose(page), camera, "Desktop Options did not gate keyboard camera input");
  await page.keyboard.press("Escape");
  await page.locator("#actions-menu").waitFor({ state: "hidden" });
  await settle(page);
  assert(await options.evaluate((element) => document.activeElement === element), "Options returned focus to a hidden compact trigger");
  assert.equal(await raw(page), original, "Reading advisers/navigation/help changed game state");
}

async function testRename(page) {
  // Existing semantic rename route stays shared with the compact UI.
  const desktopRename = page.locator('.desktop-town-selector[data-panel="rename"]');
  assert.equal(await desktopRename.count(), 1, "Desktop town selector must provide the existing rename route");
  await desktopRename.click();
  await page.locator("#town-name-input").fill("<AZ> Cedar Town");
  const camera = await pose(page);
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("+");
  samePose(await pose(page), camera, "Typing in the rename form changes map camera");
  await page.getByRole("button", { name: "Save town name", exact: true }).click();
  await page.locator("#detail-panel").waitFor({ state: "hidden" });
  // The + was typed into the input: set a deterministic safe name again.
  const name = JSON.parse(await raw(page)).townName;
  assert(name.includes("<AZ>"), "Literal town-name characters were interpreted as markup");
  await assertHudSync(page, name);
  assert.equal(await page.locator("#desktop-town-name az").count(), 0, "Desktop name used unsafe innerHTML");
  await page.reload();
  await settle(page);
  await assertHudSync(page, name);
}

async function runCase(browser, name, size, task, fixture) {
  const context = await browser.newContext({ viewport: { width: size[0], height: size[1] }, hasTouch: true, reducedMotion: "reduce" });
  if (fixture) {
    await context.addInitScript(({ origin, values, now }) => {
      if (location.origin !== origin) return;
      Date.now = () => now;
      if (!sessionStorage.getItem("desktop-overview-fixture")) {
        for (const [storageKey, value] of Object.entries(values)) localStorage.setItem(storageKey, value);
        sessionStorage.setItem("desktop-overview-fixture", "set");
      }
    }, { origin: new URL(base).origin, values: fixture.values, now: fixture.now });
  }
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => errors.push(request.url()));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  try {
    await page.goto(base, { waitUntil: "networkidle" });
    await settle(page);
    await task(page);
    checks += 1;
    console.log("PASS " + name);
  } finally { await context.close(); }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const size of desktopSizes) await runCase(browser, "desktop midpoint Fit, HUD and registered plots " + size.join("x"), size, async (page) => {
      await assertShell(page, true);
      const state = JSON.parse(await raw(page));
      assert.equal(state.hallLevel, 1, "Fresh Hall does not start at level 1");
      assert.equal(state.construction, null);
      await assertHudSync(page);
      await assertPlots(page, true);
      await page.locator("#map-viewport").focus();
      await page.mouse.move(2, 2);
      await settle(page);
      await capture(page, "desktop-" + size.join("x") + "-fit");
    });
    await runCase(browser, "narrow unchanged compact scene 390x844", [390, 844], async (page) => {
      await assertShell(page, false);
      await assertPlots(page, true);
      await page.locator("#toggle-actions").click();
      await page.locator("#actions-menu").waitFor({ state: "visible" });
      assert(await page.locator("#actions-menu").evaluate((dialog) => dialog.matches(":modal")), "Narrow actions lost native modal behaviour");
      await capture(page, "desktop-regression-390x844-menu");
      await page.keyboard.press("Escape");
      await page.locator("#actions-menu").waitFor({ state: "hidden" });
    });
    await runCase(browser, "desktop Close, +, midpoint Fit and two-axis keyboard exploration", [1440, 900], testCamera);
    await runCase(browser, "desktop adviser/navigation panels and modal input gating", [1440, 900], testDesktopPanels);
    await runCase(browser, "desktop safe name, resource synchronisation and reload", [1440, 900], testRename);
    const now = Date.now();
    const saved = { version: 3, layoutId: "town-23-v1", townName: "Retained Cedar", resources: { coins: 1900, timber: 600, stone: 400 }, hallLevel: 4, construction: { buildingId: "general-01", toLevel: 5, startedAt: now, endsAt: now + 10000 } };
    const savedRaw = JSON.stringify(saved);
    const legacy = JSON.stringify({ version: 1, townName: "Legacy Keep", resources: { coins: 9876, timber: 8765, stone: 7654 }, levels: { council: 8, library: 7, bazaar: 6, workshop: 5, farm: 4, plot: 1 }, construction: { buildingId: "library", toLevel: 8, startedAt: now - 20000, endsAt: now - 10000 } }, null, 2);
    await runCase(browser, "desktop controls and resize preserve v3 active queue and legacy bytes", [1440, 900], async (page) => {
      assert.equal(await raw(page), savedRaw, "Valid v3 state changed on load");
      await assertHudSync(page, saved.townName);
      await testCamera(page, false);
      await testDesktopPanels(page);
      await page.setViewportSize({ width: 390, height: 844 });
      await settle(page);
      await assertShell(page, false);
      await page.setViewportSize({ width: 1280, height: 720 });
      await settle(page);
      await assertShell(page, true);
      await assertHudSync(page, saved.townName);
      await page.reload();
      await settle(page);
      assert.equal(await raw(page), savedRaw, "Desktop/narrow resize or reload changed active v3 progress");
      assert.equal(await raw(page, legacyKey), legacy, "Desktop work altered legacy demo bytes");
      assert.match(await page.locator("#queue-label").textContent(), /Town Hall|construction|preview/i, "Retained queue is missing from its status");
    }, { now, values: { [key]: savedRaw, [legacyKey]: legacy } });
    assert.deepEqual(errors, [], "Captured browser/console/request errors");
    console.log("PASS final zero browser/console/request errors");
    console.log("Completed " + checks + " focused desktop-overview groups.");
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
