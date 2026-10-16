"use strict";

// Local-only plot-composition regression; no hosted access or Founder browser.
// argv[2] is an installed Playwright module, argv[3] the local preview URL.
const assert = require("node:assert/strict");
const { markerPoints, assertDrawnMarkers } = require("./marker-proof.cjs");
const { northInset, wallInset, horizontalInsets } = require("./desktop-projection.cjs");
const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require(process.argv[2] || "playwright");
const base = process.argv[3] || "http://127.0.0.1:4317";
assert(["localhost", "127.0.0.1", "[::1]"].includes(new URL(base).hostname), "This suite is local-only");
const shots = process.env.AZMARA_QA_SCREENSHOTS;
if (shots) assert(fs.statSync(shots).isDirectory(), "Screenshot destination must already exist");
const key = "azmara-town-layout-v3";
const legacyKey = "azmara-town-design-v1";
const expected = [
  ...Array.from({ length: 19 }, (_, index) => ["general-" + String(index + 1).padStart(2, "0"), "general"]),
  ["wall-01", "wall"], ["harbour-01", "harbour"], ["harbour-02", "harbour"], ["freighter-01", "freighter"]
];
const priorGeneralArea = 1248000;
const desktopBase = [
  [2100, 1150], [1250, 880], [1250, 1150], [1050, 1400], [1550, 860],
  [1550, 1150], [1550, 1440], [2650, 860], [2950, 1420], [3150, 900],
  [2100, 1600], [2100, 700], [2650, 1150], [2950, 1150], [2650, 1440],
  [1850, 890], [1850, 1410], [2350, 1410], [2350, 890]
];
const desktopAnchors = Object.fromEntries(desktopBase.map(([x, y], index) => ["general-" + String(index + 1).padStart(2, "0"), { x, y }]));
const compactAnchors = [
  [680, 640], [175, 130], [110, 365], [160, 600], [125, 840],
  [440, 240], [405, 525], [405, 800], [1250, 140], [705, 110],
  [715, 370], [700, 915], [965, 220], [1020, 490], [960, 775],
  [980, 1060], [1275, 440], [1260, 740], [1265, 1005]
];
const errors = [];
let groups = 0;

function observe(page) {
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => errors.push(request.url()));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
}

async function settle(page) {
  await page.waitForFunction(() => document.querySelector("#town-map")?.dataset.cameraAnimating !== "true");
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function load(context) {
  const page = await context.newPage();
  observe(page);
  const response = await page.goto(base);
  assert.equal(response?.status(), 200, "Local preview did not load");
  await page.waitForFunction(() => document.querySelectorAll("#town-core .plot-marker").length === 23 && document.querySelector("#town-terrain-art") && document.querySelector("#town-map")?.dataset.presentation);
  await page.locator("#town-core img").evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
  await settle(page);
  await page.mouse.move(2, 2);
  return page;
}

async function geometry(page) {
  return page.evaluate(() => {
    const map = document.querySelector("#town-map");
    const viewport = document.querySelector("#map-viewport");
    const core = document.querySelector("#town-core");
    const coreBox = core.getBoundingClientRect();
    const scale = coreBox.width / Number(core.dataset.coreWidth);
    const viewBox = document.querySelector("#world-landscape").viewBox.baseVal;
    const paintedBox = document.querySelector("#town-terrain-art");
    const coreWorld = { x: viewBox.x + (coreBox.x - map.getBoundingClientRect().x) / scale, y: viewBox.y + (coreBox.y - map.getBoundingClientRect().y) / scale };
    const targets = [...core.querySelectorAll(".plot-marker")].map((element) => {
      const box = element.getBoundingClientRect();
      const marker = element.querySelector(".marker").getBoundingClientRect();
      const image = element.querySelector(".marker img");
      const artScale = Math.min(marker.width / image.naturalWidth, marker.height / image.naturalHeight);
      const center = { x: marker.x + marker.width / 2, y: marker.y + marker.height / 2 };
      return {
        id: element.dataset.plot, kind: element.dataset.kind, occupied: element.dataset.occupied,
        name: element.getAttribute("aria-label"), box: box.toJSON(), marker: marker.toJSON(), center,
        x: coreWorld.x + (center.x - coreBox.x) / scale,
        y: coreWorld.y + (center.y - coreBox.y) / scale,
        worldWidth: image.naturalWidth * artScale / scale, worldHeight: image.naturalHeight * artScale / scale,
        exposed: document.elementFromPoint(center.x, center.y)?.closest(".plot-marker") === element
      };
    });
    return {
      targets, scale, presentation: map.dataset.presentation, fit: viewport.dataset.fit, northInset: Number(map.dataset.northInset || 0), wallInset: Number(map.dataset.wallInset || 0), hallOutset: Number(map.dataset.hallOutset || 0), edgeInset: Number(map.dataset.edgeInset || 0),
      coreWidth: Number(core.dataset.coreWidth), coreHeight: Number(core.dataset.coreHeight),
      frame: { x: viewBox.x, y: viewBox.y, width: viewBox.width, height: viewBox.height },
      map: map.getBoundingClientRect().toJSON(), viewport: viewport.getBoundingClientRect().toJSON(),
      width: innerWidth, height: innerHeight, bodyWidth: document.body.scrollWidth,
      scrollLeft: viewport.scrollLeft, scrollTop: viewport.scrollTop,
      scrollWidth: viewport.scrollWidth, scrollHeight: viewport.scrollHeight,
      terrainSource: paintedBox.getAttribute("href")
    };
  });
}

async function emptyPoints(page) {
  return markerPoints(page);
}

async function capture(page, name) {
  if (shots) await page.screenshot({ path: path.join(shots, name + ".png"), scale: "css" });
}

function idsAndSpacing(data) {
  assert.deepEqual(data.targets.map(({ id, kind }) => [id, kind]).sort(), [...expected].sort(), "Stable IDs or reserved roles changed");
  assert.equal(data.targets.filter((target) => target.occupied === "true").length, 1, "Only one site may be occupied");
  assert.equal(data.targets.find((target) => target.occupied === "true").id, "general-01", "Town Hall left its original ID");
  assert(data.targets.find((target) => target.id === "general-01").name.includes("Level 1"), "Fresh Hall must start at level 1");
  for (const target of data.targets) {
    assert(target.name && target.box.width >= 44 && target.box.height >= 44, "Unnamed or undersized target: " + target.id);
    assert(target.box.x >= -1 && target.box.y >= -1 && target.box.right <= data.width + 1 && target.box.bottom <= data.height + 1, "Full Fit target clipped: " + target.id);
    assert(target.exposed, "Fit target is behind HUD/scenery: " + target.id);
  }
  for (let a = 0; a < data.targets.length; a += 1) for (let b = a + 1; b < data.targets.length; b += 1) {
    const first = data.targets[a];
    const second = data.targets[b];
    assert(!(Math.min(first.box.right, second.box.right) - Math.max(first.box.x, second.box.x) > .5 && Math.min(first.box.bottom, second.box.bottom) - Math.max(first.box.y, second.box.y) > .5), "Overlapping targets: " + first.id + " / " + second.id);
  }
}

async function markerExposure(page) {
  const points = await emptyPoints(page);
  assert.equal(await page.locator("#town-core .empty-slot-plus, #town-core .plot-plus").count(), 0, "Removed plus-symbol overlay remains");
  assert.equal(points.length, 22, "Scene needs exactly 22 independently drawn empty reserves");
  assert(points.every((point) => point.inside && point.exposed), "Drawn ground reserve hidden or outside its target: " + points.filter((point) => !point.inside || !point.exposed).map((point) => point.id).join(", "));
  await assertDrawnMarkers(page, points);
  return points;
}

function composition(data) {
  assert.equal(data.presentation, "desktop");
  assert(data.coreWidth >= 2400 && data.coreHeight >= 1000, "Gameplay clearing has not actually widened");
  const ordinary = data.targets.filter((target) => target.kind === "general");
  const hall = ordinary.find((target) => target.id === "general-01");
  const inset = data.northInset;
  const safeCap = Math.max(0, 900 * (1 - (Math.max(44, 440 / 3 * data.scale) + 1) / (270 * data.scale)));
  assert(Number.isFinite(inset) && inset >= Math.min(safeCap, Math.min(180, Math.max(0, data.width / data.height - 2.1) * 260)) && inset <= safeCap + .1, "HUD-clearance inset exceeds the complete-target closest-row bound");
  const idealOrdinary = [];
  desktopBase.forEach(([x, y], index) => {
    const target = ordinary.find((target) => target.id === "general-" + String(index + 1).padStart(2, "0"));
    const offset = [16, 17].includes(index + 1) ? -data.hallOutset : [18, 19].includes(index + 1) ? data.hallOutset : index + 1 === 3 ? data.edgeInset : index + 1 === 14 ? -data.edgeInset : 0;
    idealOrdinary.push({ x: x + offset, y: y + inset * (1600 - y) / 900 });
    assert(Math.abs(target.x - x - offset) <= 1 && Math.abs(target.y - (y + inset * (1600 - y) / 900)) <= 1, "Plot no longer follows its base anchor with only independently verified responsive clearance: " + target.id);
  });
  const extent = { left: Math.min(...ordinary.map((target) => target.x)), right: Math.max(...ordinary.map((target) => target.x)), top: Math.min(...ordinary.map((target) => target.y)), bottom: Math.max(...ordinary.map((target) => target.y)) };
  const area = (extent.right - extent.left) * (extent.bottom - extent.top);
  assert(Math.abs(hall.x - (extent.left + extent.right) / 2) <= 1 && Math.abs(hall.y - (extent.top + extent.bottom) / 2) <= 1, "Hall is not centred inside the full civilian field");
  assert(Math.abs(area - 1890000 * (1 - inset / 900)) <= 4000, "General field has not expanded into the upper clearing");
  if (inset <= 180) assert(area >= priorGeneralArea * 1.21, "General field failed the original normal-profile expansion floor");
  else assert(area >= 1890000 * (1 - safeCap / 900) - 4000, "HUD-responsive compression exceeds the complete-target closest-row floor");
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const nearest = ordinary.map((target) => Math.min(...ordinary.filter((other) => other !== target).map((other) => distance(target, other))));
  assert(Math.min(...nearest) >= 270 * (1 - inset / 900) - 1, "General-site spacing regressed from the approved expanded geometry");
  // Explicit original composition envelope, not automatic colour inference.
  // Visual shoreline/material acceptance still requires screenshot inspection.
  for (const id of ["general-05", "general-08", "general-12", "general-16", "general-19"]) {
    const target = data.targets.find((target) => target.id === id);
    assert(target.y + target.worldHeight / 2 <= 890 + inset * 710 / 900 + 74, "Requested formerly coastal plot is not safely inland: " + id);
  }
  assert(ordinary.every((target) => target.y + target.worldHeight / 2 <= 1675), "A general-site footprint spills into the waterfront reserve");
  const wall = data.targets.find((target) => target.id === "wall-01");
  assert(Math.abs(wall.x - 900) <= 1 && Math.abs(wall.y - 1000 - data.wallInset) <= 1, "Wall does not retain its base900,1000 with only the independently verified HUD clearance projection");
  const idealWall = { x: 900, y: 1000 + data.wallInset };
  assert(Math.min(...idealOrdinary.map((target) => distance(idealWall, target))) >= 350, "Approved ideal wall/general geometry violates the350-world-unit floor");
  // Browser layout boxes are quantized to1/64 CSS pixel. At2560×900 an
  // ideal350world-unit spacing recovers349.9943603 from those rounded boxes.
  assert(Math.min(...ordinary.map((target) => distance(wall, target))) >= 350 - 1 / 64 / data.scale, "Actual wall/general spacing exceeds one CSS-layout quantum below the strict ideal floor");
  const specials = data.targets.filter((target) => ["harbour", "freighter"].includes(target.kind));
  for (const special of specials) {
    const minimum = special.kind === "freighter" ? 600 : 260;
    assert(Math.min(...ordinary.map((target) => distance(special, target))) >= minimum, "Waterfront facility is cramped beside a general plot: " + special.id);
    assert(special.y >= 1700, "Waterfront site lost its separate lower-coast reserve: " + special.id);
  }
  for (let a = 0; a < specials.length; a += 1) for (let b = a + 1; b < specials.length; b += 1) assert(distance(specials[a], specials[b]) >= 800, "Dedicated waterfront sites remain too close: " + specials[a].id + " / " + specials[b].id);
  return { area, minNearest: Math.min(...nearest), extent };
}

async function action(page, name) {
  await page.locator(`[data-desktop-action="${name}"]`).first().click();
  await settle(page);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [width, height] of [[1024, 600], [1280, 720], [1440, 900], [1864, 977], [1920, 1080], [2560, 900]]) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
      try {
        const page = await load(context);
        const data = await geometry(page);
        assert.equal(data.fit, "true", "Town must start in stable full overview");
        await northInset(page, desktopAnchors, true);
        await wallInset(page, true);
        await horizontalInsets(page, true);
        assert(data.bodyWidth <= width, "Page-wide overflow");
        idsAndSpacing(data);
        const metrics = composition(data);
        await markerExposure(page);
        await capture(page, `plot-layout-${width}x${height}-fit`);
        if (width === 1440) {
          await page.keyboard.press("Tab");
          await page.locator('[data-plot="general-01"]').focus();
          await settle(page);
          await capture(page, "plot-layout-fresh-hall1-keyboard-focus");
          await page.locator("#map-viewport").focus();
          await page.mouse.move(2, 2);
          await settle(page);
        }
        console.log(`PASS ${width}x${height}: 23 full targets, 22 drawn reserves, enlarged general area ${Math.round(metrics.area)}, nearest ${metrics.minNearest.toFixed(1)}, centred Hall and isolated wall/coastal sites`);
        groups += 1;
      } finally { await context.close(); }
    }

    const interactions = await browser.newContext({ viewport: { width: 1864, height: 977 }, reducedMotion: "reduce" });
    try {
      const page = await load(interactions);
      const prior = await page.evaluate((key) => localStorage.getItem(key), key);
      const data = await geometry(page);
      const points = await emptyPoints(page);
      for (const target of data.targets) {
        const point = points.find((candidate) => candidate.id === target.id) || target.center;
        await page.mouse.click(point.x, point.y);
        await page.locator("#detail-panel").waitFor({ state: "visible" });
        const title = target.id === "general-01" ? "Town Hall" : target.kind === "general" ? "General plot " + target.id.slice(-2) : target.kind === "wall" ? "Wall plot" : target.kind === "harbour" ? "Harbour plot " + Number(target.id.slice(-2)) : "Freighter plot";
        assert.equal((await page.locator("#panel-title").textContent()).trim(), title, "Click selected a neighbouring or reidentified plot");
        if (target.id !== "general-01") assert.equal(await page.locator("#upgrade-building, #panel-content form").count(), 0, "Empty role panel invents build gameplay");
        await page.keyboard.press("Escape");
        await page.locator("#detail-panel").waitFor({ state: "hidden" });
        await settle(page);
        await page.mouse.move(2, 2);
      }
      assert.equal(await page.evaluate((key) => localStorage.getItem(key), key), prior, "Inspecting moved plots changes saved progress");
      console.log("PASS all 23 actual ground/Hall clicks retain correct role panels and progress");
      groups += 1;

      await action(page, "close");
      const close = await geometry(page);
      const viewport = page.locator("#map-viewport");
      await viewport.evaluate((element) => element.scrollTo({ left: 100000, top: 100000, behavior: "instant" }));
      await settle(page);
      const far = await geometry(page);
      assert(far.scrollLeft > 0 && far.scrollTop > 0, "Closer enlarged-town camera lost both-axis exploration");
      await capture(page, "plot-layout-close-coast-corner");
      await action(page, "fit");
      const fit = await geometry(page);
      assert.equal(fit.fit, "true");
      idsAndSpacing(fit);
      assert(close.scale > fit.scale, "Close no longer enlarges buildings");
      assert.equal(await page.evaluate((key) => localStorage.getItem(key), key), prior, "Exploring enlarged layout writes progress");
      console.log("PASS closer view, both-axis finite movement and exact whole-town return");
      groups += 1;
    } finally { await interactions.close(); }

    for (const [width, height] of [[390, 844], [844, 390]]) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
      try {
        const page = await load(context);
        assert.equal((await geometry(page)).presentation, "compact", "Paused compact browser composition changed profile");
        const anchors = await page.locator("#town-core .plot-marker").evaluateAll((elements) => Object.fromEntries(elements.map((element) => [element.dataset.plot, [Number(element.dataset.x), Number(element.dataset.y)]])));
        compactAnchors.forEach((anchor, index) => assert.deepEqual(anchors["general-" + String(index + 1).padStart(2, "0")], anchor, "Desktop redesign changed compact general anchors"));
        assert.deepEqual(anchors["wall-01"], [440, 25]);
        assert.deepEqual(anchors["harbour-01"], [145, 1090]);
        assert.deepEqual(anchors["harbour-02"], [690, 1245]);
        assert.deepEqual(anchors["freighter-01"], [1255, 1270]);
        assert.equal(await page.locator("#desktop-hud").isVisible(), false);
        assert(await page.locator("#toggle-actions").isVisible());
        await capture(page, `plot-layout-compact-${width}x${height}`);
        console.log(`PASS desktop-only scope preserves compact 23 anchors and actions ${width}x${height}`);
        groups += 1;
      } finally { await context.close(); }
    }

    const saved = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    try {
      const now = Date.now();
      const savedRaw = JSON.stringify({ version: 3, layoutId: "town-23-v1", townName: "Plot saved town", resources: { coins: 1900, timber: 600, stone: 400 }, hallLevel: 4, construction: { buildingId: "general-01", toLevel: 5, startedAt: now, endsAt: now + 10000 } });
      const legacy = JSON.stringify({ version: 1, townName: "Untouched prior town", levels: { council: 9 }, resources: { coins: 9999 } });
      await saved.addInitScript(({ origin, key, legacyKey, savedRaw, legacy, now }) => {
        Date.now = () => now;
        if (location.origin === origin) { localStorage.setItem(key, savedRaw); localStorage.setItem(legacyKey, legacy); }
      }, { origin: new URL(base).origin, key, legacyKey, savedRaw, legacy, now });
      const page = await load(saved);
      await action(page, "close");
      await action(page, "zoom-in");
      await action(page, "fit");
      await page.setViewportSize({ width: 390, height: 844 });
      await settle(page);
      await page.setViewportSize({ width: 1864, height: 977 });
      await settle(page);
      const bytes = await page.evaluate(({ key, legacyKey }) => [localStorage.getItem(key), localStorage.getItem(legacyKey)], { key, legacyKey });
      assert.deepEqual(bytes, [savedRaw, legacy], "Layout/camera/responsive update changed active v3 queue or legacy bytes");
      assert.match(await page.locator('[data-plot="general-01"]').getAttribute("aria-label"), /Level 4/);
      console.log("PASS exact valid v3 active queue and read-only legacy bytes survive layout/resizing");
      groups += 1;
    } finally { await saved.close(); }
    assert.deepEqual(errors, [], "Captured browser errors");
    console.log("PASS zero browser/console/request errors");
    groups += 1;
    console.log(`${groups} plot-layout groups passed`);
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); if (errors.length) console.error("Captured errors:", errors); process.exitCode = 1; });
