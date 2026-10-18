"use strict";

// Focused locked-land browser regression. It owns a loopback server and
// disposable Chromium contexts; it never opens or reads the Founder's browser.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");

function loadPlaywright() {
  if (process.env.AZMARA_PLAYWRIGHT) return require(process.env.AZMARA_PLAYWRIGHT);
  try { return require("playwright"); }
  catch (error) {
    if (error.code !== "MODULE_NOT_FOUND") throw error;
    const bundled = path.join(os.homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
    if (!fs.existsSync(bundled)) throw new Error("Existing Playwright unavailable; nothing was installed.");
    return require(bundled);
  }
}

const { chromium } = loadPlaywright();
const root = fs.realpathSync(path.resolve(__dirname, ".."));
const storageKey = "azmara-town-layout-v3";
const milestones = [1, 5, 8, 12, 17, 22, 28, 34, 41, 45, 50];
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon" };
const errors = [];
let browser;

const server = http.createServer((request, response) => {
  try {
    if (!["GET", "HEAD"].includes(request.method)) return response.writeHead(405).end();
    const url = new URL(request.url, "http://127.0.0.1");
    const file = path.resolve(root, "." + decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname));
    const relative = path.relative(root, file);
    if (relative.startsWith("..") || path.isAbsolute(relative) || !/^(assets\/|[^/]+\.(html|js|css|ico)$)/.test(relative)) return response.writeHead(403).end();
    const actual = fs.realpathSync(file);
    if (!actual.startsWith(root + path.sep) || !fs.statSync(actual).isFile()) return response.writeHead(403).end();
    response.writeHead(200, { "Content-Type": mime[path.extname(actual)] || "application/octet-stream", "Cache-Control": "no-store" });
    if (request.method === "HEAD") return response.end();
    fs.createReadStream(actual).pipe(response);
  } catch (error) { response.writeHead(error.code === "ENOENT" ? 404 : 400).end(); }
});

function fixture(hallLevel, construction = null) {
  return JSON.stringify({
    version: 3,
    layoutId: "town-23-v1",
    townName: "Land stage QA",
    resources: { coins: 2400, timber: 760, stone: 540 },
    hallLevel,
    construction
  });
}

async function contextWith(viewport, savedRaw) {
  const context = await browser.newContext({ viewport, reducedMotion: "reduce", deviceScaleFactor: 1 });
  await context.addInitScript(({ key, raw }) => {
    if (localStorage.getItem(key) === null) localStorage.setItem(key, raw);
  }, { key: storageKey, raw: savedRaw });
  return context;
}

function observe(page) {
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("requestfailed", (request) => errors.push(`${request.url()}: ${request.failure()?.errorText}`));
  page.on("response", (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
}

async function settle(page) {
  await page.waitForFunction(() => document.querySelector("#town-map")?.dataset.cameraAnimating !== "true" && document.querySelectorAll("#town-core .plot-marker").length === 23);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.querySelectorAll("img, svg image")].map(async (node) => {
      const source = node.currentSrc || node.src || node.getAttribute("href");
      if (!source || !node.getClientRects().length) return;
      const image = new Image(); image.src = source; await image.decode();
    }));
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}

async function load(context, base) {
  const page = await context.newPage();
  observe(page);
  assert.equal((await page.goto(base))?.status(), 200);
  await settle(page);
  return page;
}

async function storage(page) {
  return page.evaluate((key) => localStorage.getItem(key), storageKey);
}

async function landState(page) {
  return page.evaluate(() => {
    const viewport = document.querySelector("#map-viewport").getBoundingClientRect();
    const image = document.querySelector("#azmara-land-stage");
    const painted = image.getBoundingClientRect();
    const legacyIds = ["azmara-oasis-foundation", "town-terrain-overlay", "town-street-ground", "town-scenery-decor", "town-valley-terrain", "town-wall-perimeter", "town-wall-front-layer"];
    return {
      source: image.getAttribute("href"),
      stage: Number(document.body.dataset.townStage),
      imageCount: document.querySelectorAll("#world-landscape > image").length,
      imageId: image.id,
      preserve: image.getAttribute("preserveAspectRatio"),
      covers: painted.left <= viewport.left + .6 && painted.top <= viewport.top + .6 && painted.right >= viewport.right - .6 && painted.bottom >= viewport.bottom - .6,
      viewport: { left: viewport.left, top: viewport.top, right: viewport.right, bottom: viewport.bottom },
      painted: { left: painted.left, top: painted.top, right: painted.right, bottom: painted.bottom, width: painted.width, height: painted.height },
      minimumZoom: Number(document.querySelector("#town-map").dataset.minZoom),
      zoom: Number(document.querySelector("#town-map").dataset.zoom),
      hallArt: document.querySelector('[data-plot="general-01"] .marker').childElementCount,
      wallArt: document.querySelector('[data-plot="wall-01"] .marker').childElementCount,
      emptyArt: [...document.querySelectorAll('.plot-marker[data-occupied="false"] .marker')].reduce((sum, marker) => sum + marker.childElementCount, 0),
      occupied: document.querySelectorAll('.plot-marker[data-occupied="true"]').length,
      legacyVisible: legacyIds.filter((id) => { const node = document.getElementById(id); return node && node.getClientRects().length && getComputedStyle(node).display !== "none"; })
    };
  });
}

async function assertLockedLand(page, expectedLevel) {
  const expectedStage = milestones.findLastIndex((level) => level <= expectedLevel) + 1;
  const actual = await landState(page);
  assert.equal(actual.source, `assets/land/land-stage-${String(expectedStage).padStart(2, "0")}.png`);
  assert.equal(actual.stage, expectedStage);
  assert.equal(actual.imageCount, 1, "Ground must be exactly one locked image");
  assert.equal(actual.imageId, "azmara-land-stage");
  assert.equal(actual.preserve, "xMidYMid meet");
  assert(actual.covers, "Locked land left a hard edge in the game viewport: " + JSON.stringify(actual));
  assert(Math.abs(actual.painted.width / actual.painted.height - 1.5) < .002, "Locked land was stretched");
  assert(Math.abs(actual.minimumZoom - 1) < .00001, "Minimum zoom is not the true cover scale");
  assert(Math.abs(actual.zoom - actual.minimumZoom) < .00001, "Fit is not stopped at the cover size");
  assert.equal(actual.hallArt, 0, "Town Hall sprite was drawn over the painted Hall");
  assert.equal(actual.wallArt, 0, "Town Wall art was drawn over the painted gate");
  assert.equal(actual.emptyArt, 0, "Empty spots or flags were drawn over the locked land");
  assert.deepEqual(actual.legacyVisible, [], "A retired landscape layer is visible");
}

async function openDev(page) {
  await page.locator(".azmara-dev-button:visible").click();
  await page.locator("#detail-panel[open] #dev-land-stage").waitFor({ state: "visible" });
}

async function switchGameplay(page) {
  await page.keyboard.press("Escape");
  // The approved information shell exposes one Dev launcher; the legacy mode
  // controls remain the app's authoritative mode transition implementation.
  // Dispatch that real control instead of mutating body state in the test.
  await page.locator('button[data-preview-mode="gameplay"]').evaluate((button) => button.click());
  await page.waitForFunction(() => document.body.dataset.previewMode === "gameplay");
  await settle(page);
}

async function fitRegistration(page) {
  return page.evaluate(() => {
    const viewport = document.querySelector("#map-viewport").getBoundingClientRect();
    const picture = document.querySelector("#azmara-land-stage").getBoundingClientRect();
    const hall = document.querySelector('[data-plot="general-01"]').getBoundingClientRect();
    const wall = document.querySelector('[data-plot="wall-01"]').getBoundingClientRect();
    const townBar = document.querySelector(".azmara-town-bar").getBoundingClientRect();
    const center = (box) => ({ x: box.left + box.width / 2, y: box.top + box.height / 2 });
    const hallCenter = center(hall), wallCenter = center(wall), viewportCenter = center(viewport), pictureCenter = center(picture);
    const overlapWidth = Math.max(0, Math.min(wall.right, townBar.right) - Math.max(wall.left, townBar.left));
    const overlapHeight = Math.max(0, Math.min(wall.bottom, townBar.bottom) - Math.max(wall.top, townBar.top));
    const owns = (x, y) => document.elementFromPoint(x, y)?.closest?.('[data-plot="wall-01"]') === document.querySelector('[data-plot="wall-01"]');
    const candidates = [];
    for (let y = Math.max(viewport.top, wall.top) + 2; y <= Math.min(viewport.bottom, wall.bottom) - 2; y += 4) {
      for (let x = Math.max(viewport.left, wall.left) + 2; x <= Math.min(viewport.right, wall.right) - 2; x += 4) {
        if (owns(x, y)) candidates.push({ x, y });
      }
    }
    return {
      fit: document.querySelector("#town-map").dataset.fit,
      hallOffset: { x: hallCenter.x - viewportCenter.x, y: hallCenter.y - viewportCenter.y },
      pictureOffset: { x: pictureCenter.x - viewportCenter.x, y: pictureCenter.y - viewportCenter.y },
      pictureCentered: Math.abs(pictureCenter.x - viewportCenter.x) <= 1 && Math.abs(pictureCenter.y - viewportCenter.y) <= 1,
      wallCenter,
      wallCenterReachable: owns(wallCenter.x, wallCenter.y),
      wallReachable: candidates.length > 0,
      firstReachablePoint: candidates[0] || null,
      wallTownBarOverlap: { width: overlapWidth, height: overlapHeight, area: overlapWidth * overlapHeight },
      wall: { left: wall.left, top: wall.top, right: wall.right, bottom: wall.bottom, width: wall.width, height: wall.height },
      townBar: { left: townBar.left, top: townBar.top, right: townBar.right, bottom: townBar.bottom, width: townBar.width, height: townBar.height }
    };
  });
}

async function assertGateReachable(page, geometry) {
  assert.equal(geometry.fit, "true", "Registration was not measured at Fit");
  assert(geometry.pictureCentered, "Fit is not centred on the land picture: " + JSON.stringify(geometry.pictureOffset));
  assert(geometry.wallReachable, "Painted Town Wall hotspot has no reachable point");
  const point = geometry.firstReachablePoint;
  await page.mouse.click(point.x, point.y);
  await page.locator("#detail-panel[open]").waitFor({ state: "visible" });
  assert.equal(await page.locator('[data-plot="wall-01"]').getAttribute("data-kind"), "wall");
  await page.keyboard.press("Escape");
  await page.locator("#detail-panel").waitFor({ state: "hidden" });
}

async function pickerChecks(page, actualLevel, savedRaw) {
  await openDev(page);
  const picker = page.locator("#dev-land-stage");
  assert.deepEqual(await picker.locator("option").evaluateAll((options) => options.map((option) => Number(option.value))), milestones);
  for (const level of milestones) {
    await picker.selectOption(String(level));
    await settle(page);
    await assertLockedLand(page, level);
    assert.equal(await storage(page), savedRaw, `Dev stage ${level} changed saved progress`);
    assert.equal(await page.locator('[data-plot="general-01"]').getAttribute("data-building-level"), String(level));
  }

  await page.locator("#reset-land-stage").click();
  await settle(page);
  await assertLockedLand(page, actualLevel);
  assert.equal(await storage(page), savedRaw, "Reset-to-actual changed saved progress");

  await picker.selectOption("34");
  await settle(page);
  await assertLockedLand(page, 34);
  await switchGameplay(page);
  await assertLockedLand(page, actualLevel);
  assert.equal(await page.locator(".azmara-dev-button").isVisible(), false, "Dev button remains visible in Gameplay");
  assert.equal(await storage(page), savedRaw, "Gameplay reset changed saved progress");

  await page.reload();
  await settle(page);
  assert.equal(await page.locator("body").getAttribute("data-preview-mode"), "dev");
  await assertLockedLand(page, 1);
  assert.equal(await storage(page), savedRaw, "Reload changed saved progress");
}

(async () => {
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  const base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true, timeout: 20000 });
  try {
    for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
      const savedRaw = fixture(12);
      const context = await contextWith(viewport, savedRaw);
      try {
        const page = await load(context, base);
        await assertLockedLand(page, 1);
        assert.equal((await landState(page)).occupied, 1, "Town Hall-only fixture created another building");
        const registration = await fitRegistration(page);
        await assertGateReachable(page, registration);
        console.log(`INFO Fit picture offset at ${viewport.width}x${viewport.height}: x=${registration.pictureOffset.x.toFixed(2)}px, y=${registration.pictureOffset.y.toFixed(2)}px (${registration.pictureCentered ? "centred" : "not centred"}); Hall offset x=${registration.hallOffset.x.toFixed(2)}px, y=${registration.hallOffset.y.toFixed(2)}px`);
        console.log(`INFO gate at ${viewport.width}x${viewport.height}: reachable=${registration.wallReachable}, center-reachable=${registration.wallCenterReachable}, town-bar overlap=${registration.wallTownBarOverlap.width.toFixed(2)}x${registration.wallTownBarOverlap.height.toFixed(2)}px`);
        await pickerChecks(page, 12, savedRaw);
        console.log(`PASS locked land, full-bleed cover and transient Dev picker at ${viewport.width}x${viewport.height}`);
      } finally { await context.close(); }
    }

    const now = Date.now();
    // Valid retained pre-receipt queue: the loader deliberately accepts the
    // historical 10-second Hall shape through Level 20.
    const queuedRaw = fixture(16, { buildingId: "general-01", toLevel: 17, startedAt: now, endsAt: now + 10000 });
    const queued = await contextWith({ width: 1440, height: 900 }, queuedRaw);
    try {
      const page = await load(queued, base);
      await assertLockedLand(page, 1);
      await openDev(page);
      await page.locator("#dev-land-stage").selectOption("12");
      await page.keyboard.press("Escape");
      await assertLockedLand(page, 12);
      await page.locator('[data-plot="general-01"]').click({ force: true });
      await page.locator("#skip-construction").click();
      await settle(page);
      await openDev(page);
      await page.locator("#reset-land-stage").click();
      await settle(page);
      await assertLockedLand(page, 17);
      const saved = JSON.parse(await storage(page));
      assert.equal(saved.hallLevel, 17);
      assert.equal(saved.construction, null);
      console.log("PASS land stays on the completed Hall look until Dev Skip completes its real queued upgrade");
    } finally { await queued.close(); }

    assert.deepEqual(errors, [], "Browser or asset errors: " + JSON.stringify(errors));
    console.log("PASS 3 locked-land browser groups; zero page, console, request or asset errors");
  } finally {
    await browser.close();
    await new Promise((resolve) => { server.close(resolve); server.closeAllConnections?.(); });
  }
})().catch(async (error) => {
  console.error(error.stack || error);
  if (browser?.isConnected()) await browser.close().catch(() => {});
  if (server.listening) await new Promise((resolve) => { server.close(resolve); server.closeAllConnections?.(); });
  process.exitCode = 1;
});
