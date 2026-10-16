"use strict";

// Focused DEC-050 selection/composition regression; isolated localhost only.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(process.argv[2] || "playwright");
const { markerPoints, assertDrawnMarkers } = require("./marker-proof.cjs");
const base = process.argv[3] || "http://127.0.0.1:4317";
assert(["localhost", "127.0.0.1", "[::1]"].includes(new URL(base).hostname), "Spacing QA is local-only");
const shots = process.env.AZMARA_QA_SCREENSHOTS;
if (shots) assert(fs.statSync(shots).isDirectory());
const key = "azmara-town-layout-v3";
const legacyKey = "azmara-town-design-v1";
const errors = [];
let groups = 0;

async function settle(page) {
  await page.waitForFunction(() => document.querySelector("#town-map")?.dataset.cameraAnimating !== "true");
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function bytes(page) {
  return page.evaluate(({ key, legacyKey }) => [localStorage.getItem(key), localStorage.getItem(legacyKey)], { key, legacyKey });
}

async function mode(page, next) {
  const controls = page.locator(`button[data-preview-mode="${next}"]`);
  let visible;
  for (let index = 0; index < await controls.count(); index += 1) if (await controls.nth(index).isVisible()) visible = controls.nth(index);
  if (!visible) {
    await page.locator("#toggle-actions").click();
    await page.locator("#actions-menu").waitFor({ state: "visible" });
    visible = page.locator(`#actions-menu button[data-preview-mode="${next}"]`);
  }
  await visible.scrollIntoViewIfNeeded();
  await visible.click(); await settle(page);
  assert.equal(await page.locator("body").getAttribute("data-preview-mode"), next);
  assert.equal(await page.locator("#actions-menu").evaluate((dialog) => dialog.open), false);
  await page.locator("#map-viewport").focus(); await page.mouse.move(2, 2); await settle(page);
}

async function allTargets(page) {
  const targets = await page.locator("#town-core .plot-marker").evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    const x = rect.x + rect.width / 2, y = rect.y + rect.height / 2;
    return { id: node.dataset.plot, kind: node.dataset.kind, occupied: node.dataset.occupied, name: node.getAttribute("aria-label"), rect: rect.toJSON(), x, y, exposed: document.elementFromPoint(x, y)?.closest(".plot-marker") === node };
  }));
  assert.equal(targets.length, 23);
  assert.deepEqual(targets.reduce((result, target) => ({ ...result, [target.kind]: (result[target.kind] || 0) + 1 }), {}), { general: 19, wall: 1, harbour: 2, freighter: 1 });
  assert.deepEqual(targets.filter((target) => target.occupied === "true").map((target) => target.id), ["general-01"]);
  const { width, height } = page.viewportSize();
  for (const target of targets) {
    const rect = target.rect;
    assert(target.name && rect.width >= 44 && rect.height >= 44 && rect.x >= -1 && rect.y >= -1 && rect.right <= width + 1 && rect.bottom <= height + 1 && target.exposed, "Plot target is clipped, unnamed, intercepted or below44px: " + target.id);
  }
  for (let a = 0; a < targets.length; a += 1) for (let b = a + 1; b < targets.length; b += 1) {
    const first = targets[a].rect, second = targets[b].rect;
    assert(!(Math.min(first.right, second.right) - Math.max(first.x, second.x) > .5 && Math.min(first.bottom, second.bottom) - Math.max(first.y, second.y) > .5), "Overlapping plot targets: " + targets[a].id + "/" + targets[b].id);
  }
  return targets;
}

async function inspectPlots(page, targets, points, next) {
  const prior = await bytes(page);
  for (const target of targets) {
    const point = points.find((point) => point.id === target.id) || target;
    await page.mouse.click(point.x, point.y);
    await page.locator("#detail-panel").waitFor({ state: "visible" });
    const title = target.id === "general-01" ? "Town Hall" : target.kind === "general" ? "General plot " + target.id.slice(-2) : target.kind === "wall" ? "Wall plot" : target.kind === "harbour" ? "Harbour plot " + Number(target.id.slice(-2)) : "Freighter plot";
    assert.equal((await page.locator("#panel-title").textContent()).trim(), title, "Painted reserve selected another site");
    if (target.occupied === "false" || next === "gameplay") assert.equal(await page.locator("#upgrade-building, #panel-content form, #panel-content .primary-button:enabled").count(), 0, "Read-only site acquired a live operation");
    await page.keyboard.press("Escape"); await page.locator("#detail-panel").waitFor({ state: "hidden" });
    assert.equal(await page.locator(`[data-plot="${target.id}"]`).evaluate((node) => document.activeElement === node && getComputedStyle(node).outlineStyle === "none"), true, "Plot lost focus return or retains a rectangular focus outline");
    await page.mouse.move(2, 2); await settle(page);
  }
  assert.deepEqual(await bytes(page), prior, "Reading plots changes v3 or legacy progress");
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [width, height] of [[1024, 600], [1440, 900], [2560, 900], [390, 844]]) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
      try {
        const now = Date.now();
        const saved = JSON.stringify({ version: 3, layoutId: "town-23-v1", townName: "W".repeat(20), resources: { coins: 1900, timber: 600, stone: 400 }, hallLevel: 4, construction: { buildingId: "general-01", toLevel: 5, startedAt: now, endsAt: now + 10000 } });
        const legacy = ' {"version":1,"townName":"Legacy bytes", "resources":{"coins":9191}} ';
        await context.addInitScript(({ origin, key, legacyKey, now, saved, legacy }) => {
          Date.now = () => now;
          if (location.origin === origin) { localStorage.setItem(key, saved); localStorage.setItem(legacyKey, legacy); }
        }, { origin: new URL(base).origin, key, legacyKey, now, saved, legacy });
        const page = await context.newPage();
        page.on("pageerror", (error) => errors.push(error.message));
        page.on("requestfailed", (request) => errors.push(request.url()));
        page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
        assert.equal((await page.goto(base))?.status(), 200);
        await page.waitForFunction(() => document.querySelectorAll("#town-core .plot-marker").length === 23 && document.querySelector("#town-terrain-art"));
        await page.locator("#town-core img").evaluateAll((images) => Promise.all(images.map((image) => image.decode()))); await settle(page);
        for (const next of ["dev", "gameplay"]) {
          await mode(page, next);
          assert.equal(await page.locator("#town-core .empty-slot-plus, #town-core .plot-plus").count(), 0);
          const targets = await allTargets(page);
          const points = await markerPoints(page);
          assert.equal(points.length, 22); assert(points.every((point) => point.inside && point.exposed));
          await assertDrawnMarkers(page, points);
          if (width === 1440 || width === 390) await inspectPlots(page, targets, points, next);
          await page.locator("#map-viewport").focus(); await page.mouse.move(2, 2); await settle(page);
          if (shots) await page.screenshot({ path: path.join(shots, `plot-spacing-${width}x${height}-${next}-fit.png`), scale: "css" });
          assert.deepEqual(await bytes(page), [saved, legacy]);
          console.log(`PASS ${width}x${height} ${next}: 23 exposed44px roles, 22 actual flag-free reserves, unchanged active queue/legacy`); groups += 1;
        }
        if (width >= 1024) {
          const name = await page.locator(".desktop-town-selector").evaluate((node) => {
            const rect = node.getBoundingClientRect(), text = node.querySelector("strong"), style = getComputedStyle(text);
            return { width: rect.width, height: rect.height, exposed: document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)?.closest("button") === node, text: text.textContent, overflow: style.overflow, ellipsis: style.textOverflow };
          });
          assert(Math.abs(name.width - 176) <= 1 && name.height >= 44 && name.exposed && name.text === "W".repeat(20) && name.overflow === "hidden" && name.ellipsis === "ellipsis", "Smaller176px town-name box loses tap size, literal text or truncation");
          console.log(`PASS ${width}x${height}: smaller176px name box retains44px action and safe20-character name`); groups += 1;
        }
        await page.keyboard.press("Tab");
        const hall = page.locator('[data-plot="general-01"]'); await hall.focus(); await settle(page);
        const focus = await hall.evaluate((node) => ({ active: document.activeElement === node, keyboard: node.matches(":focus-visible"), outline: getComputedStyle(node).outlineStyle, filter: getComputedStyle(node.querySelector(".marker")).filter, label: getComputedStyle(node.querySelector(".hotspot-label")).display }));
        assert(focus.active && focus.keyboard && focus.outline === "none" && focus.filter.includes("255, 239, 185") && focus.label !== "none", "Keyboard selection lost its warm silhouette/label or retained rectangular outline: " + JSON.stringify(focus));
        if (shots) await page.screenshot({ path: path.join(shots, `plot-spacing-${width}x${height}-keyboard-hall.png`), scale: "css" });
        console.log(`PASS ${width}x${height}: keyboard Hall has warm silhouette and label, no blue rectangle`); groups += 1;
      } finally { await context.close(); }
    }
    assert.deepEqual(errors, [], "Captured browser/console/request errors");
    console.log("PASS zero browser/console/request errors"); groups += 1;
    console.log(`${groups} focused spacing/selection groups passed`);
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); if (errors.length) console.error("Captured errors:", errors); process.exitCode = 1; });
