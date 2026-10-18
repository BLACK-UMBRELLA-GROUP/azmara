"use strict";

// Focused full-screen shell regression. It owns a loopback server and isolated
// headless Chromium contexts; it never opens or reads the Founder's browser.
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

function fixture() {
  return JSON.stringify({
    version: 3,
    layoutId: "town-23-v1",
    townName: "Full-screen QA",
    resources: { coins: 2400, timber: 760, stone: 540 },
    hallLevel: 12,
    construction: null
  });
}

function observe(page, label) {
  page.on("pageerror", (error) => errors.push(`${label}: ${error.message}`));
  page.on("console", (message) => { if (message.type() === "error") errors.push(`${label}: ${message.text()}`); });
  page.on("requestfailed", (request) => errors.push(`${label}: ${request.url()}: ${request.failure()?.errorText}`));
  page.on("response", (response) => { if (response.status() >= 400) errors.push(`${label}: ${response.status()} ${response.url()}`); });
}

async function settle(page) {
  await page.waitForFunction(() => document.querySelector("#town-map")?.dataset.cameraAnimating !== "true" && document.querySelectorAll("#town-core .plot-marker").length === 23);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.querySelectorAll("img, svg image")].map(async (node) => {
      const source = node.currentSrc || node.src || node.getAttribute("href");
      if (!source || !node.getClientRects().length) return;
      const image = new Image();
      image.src = source;
      await image.decode();
    }));
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}

const closeEnough = (actual, expected, tolerance = 1) => Math.abs(actual - expected) <= tolerance;

async function shellGeometry(page, selector) {
  return page.locator(selector).evaluate((element) => {
    const box = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      left: box.left,
      top: box.top,
      right: box.right,
      bottom: box.bottom,
      width: box.width,
      height: box.height,
      borders: [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth].map(parseFloat),
      margin: [style.marginTop, style.marginRight, style.marginBottom, style.marginLeft].map(parseFloat)
    };
  });
}

function assertViewportBox(box, viewport, label) {
  assert(closeEnough(box.left, 0) && closeEnough(box.top, 0), `${label} is inset from the viewport origin: ${JSON.stringify(box)}`);
  assert(closeEnough(box.right, viewport.width) && closeEnough(box.bottom, viewport.height), `${label} does not reach the viewport edges: ${JSON.stringify(box)}`);
  assert(box.borders.every((value) => value === 0), `${label} has a visible CSS border: ${JSON.stringify(box.borders)}`);
}

async function assertBaseShell(page, viewport, label) {
  for (const selector of ["html", "body", ".game-shell", ".scene", "#map-viewport"]) {
    const box = await shellGeometry(page, selector);
    assertViewportBox(box, viewport, `${label} ${selector}`);
    if (selector === "html" || selector === "body") assert(box.margin.every((value) => value === 0), `${label} ${selector} has an outer margin`);
  }
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), viewport.width, `${label} page has horizontal overflow outside the game shell`);
  assert.equal(await page.evaluate(() => document.documentElement.scrollHeight), viewport.height, `${label} page has vertical overflow outside the game shell`);
}

async function townCoverage(page, viewport, label) {
  const state = await page.evaluate(() => {
    const view = document.querySelector("#map-viewport").getBoundingClientRect();
    const land = document.querySelector("#azmara-land-stage").getBoundingClientRect();
    const map = document.querySelector("#town-map");
    const scroller = document.querySelector("#map-viewport");
    return {
      fit: map.dataset.fit,
      zoom: Number(map.dataset.zoom),
      minimumZoom: Number(map.dataset.minZoom),
      sourceAspect: window.AzmaraLandStages.aspectRatio,
      view: { left: view.left, top: view.top, right: view.right, bottom: view.bottom },
      land: { left: land.left, top: land.top, right: land.right, bottom: land.bottom, width: land.width, height: land.height },
      scroll: { left: scroller.scrollLeft, top: scroller.scrollTop, width: scroller.scrollWidth, height: scroller.scrollHeight, clientWidth: scroller.clientWidth, clientHeight: scroller.clientHeight }
    };
  });
  assert(state.land.left <= state.view.left + .6 && state.land.top <= state.view.top + .6 && state.land.right >= state.view.right - .6 && state.land.bottom >= state.view.bottom - .6,
    `${label} land leaves a hard edge or letterbox: ${JSON.stringify(state)}`);
  assert(Math.abs(state.land.width / state.land.height - state.sourceAspect) < .002, `${label} land is stretched`);
  assertViewportBox({ ...(await shellGeometry(page, "#map-viewport")) }, viewport, `${label} town viewport`);
  return state;
}

async function assertOverlayDoesNotResize(page, viewport, profile) {
  const original = await shellGeometry(page, ".scene");
  const panelTrigger = profile === "phone"
    ? page.locator('.azmara-phone-dock [data-panel="overview"]:visible')
    : page.locator('.azmara-side-dock [data-panel="overview"]:visible');
  await panelTrigger.click();
  await page.locator("#detail-panel[open]").waitFor({ state: "visible" });
  assert.deepEqual(await shellGeometry(page, ".scene"), original, `${profile} content panel resized the game`);
  await page.locator("#close-panel").click();
  await page.locator("#detail-panel").waitFor({ state: "hidden" });

  if (profile !== "phone") {
    await page.locator("#azmara-dock-toggle:visible").click();
    await page.waitForFunction(() => document.body.dataset.azmaraDockCollapsed === "true");
    assert.deepEqual(await shellGeometry(page, ".scene"), original, `${profile} collapsed dock resized the game`);
    await page.locator("#azmara-dock-reveal:visible").click();
    await page.waitForFunction(() => document.body.dataset.azmaraDockCollapsed === "false");
    assert.deepEqual(await shellGeometry(page, ".scene"), original, `${profile} restored dock resized the game`);
  }
  await assertBaseShell(page, viewport, `${profile} overlays`);
}

async function assertAtlasView(page, viewport, view) {
  await page.locator(`.azmara-map-switcher [data-map-navigation="${view}"]`).click();
  await page.waitForFunction((expected) => document.body.dataset.mapView === expected, view);
  await page.locator(".atlas-view:not([hidden])").waitFor({ state: "visible" });
  await page.evaluate(async () => {
    await Promise.all([...document.querySelectorAll(".atlas-view:not([hidden]) img")].map(async (image) => {
      if (image.complete) return;
      await new Promise((resolve, reject) => { image.addEventListener("load", resolve, { once: true }); image.addEventListener("error", reject, { once: true }); });
    }));
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  assertViewportBox(await shellGeometry(page, ".atlas-view:not([hidden])"), viewport, `${view} atlas`);
  assertViewportBox(await shellGeometry(page, ".atlas-view:not([hidden]) .atlas-viewport"), viewport, `${view} atlas viewport`);
  assertViewportBox(await shellGeometry(page, ".atlas-view:not([hidden]) .atlas-scenery"), viewport, `${view} fixed scenery`);
}

async function assertMaximumZoomAndEdges(page, viewport, profile) {
  await page.locator("#map-viewport").focus();
  for (let iteration = 0; iteration < 40; iteration++) {
    const zoom = Number(await page.locator("#town-map").getAttribute("data-zoom"));
    if (zoom >= 2.399) break;
    await page.keyboard.press("+");
    await page.waitForFunction(() => document.querySelector("#town-map")?.dataset.cameraAnimating !== "true");
  }
  const maximum = await townCoverage(page, viewport, `${profile} maximum zoom`);
  assert(maximum.zoom >= 2.399, `${profile} did not reach maximum zoom: ${maximum.zoom}`);
  assert(maximum.scroll.width > maximum.scroll.clientWidth + 1, `${profile} maximum zoom lacks horizontal pan range`);
  assert(maximum.scroll.height > maximum.scroll.clientHeight + 1, `${profile} maximum zoom lacks vertical pan range`);

  for (const point of [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }]) {
    await page.locator("#map-viewport").evaluate((element, corner) => {
      element.scrollTo({
        left: corner.x * (element.scrollWidth - element.clientWidth),
        top: corner.y * (element.scrollHeight - element.clientHeight),
        behavior: "instant"
      });
    }, point);
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const state = await townCoverage(page, viewport, `${profile} maximum zoom corner ${point.x},${point.y}`);
    const expectedLeft = point.x * (state.scroll.width - state.scroll.clientWidth);
    const expectedTop = point.y * (state.scroll.height - state.scroll.clientHeight);
    assert(closeEnough(state.scroll.left, expectedLeft, 2) && closeEnough(state.scroll.top, expectedTop, 2), `${profile} pan edge is unreachable at ${point.x},${point.y}`);
  }
}

async function assertMinimumZoomMidpointAndEdges(page, viewport, profile) {
  const start = await townCoverage(page, viewport, `${profile} midpoint Fit`);
  const maxLeft = start.scroll.width - start.scroll.clientWidth;
  const maxTop = start.scroll.height - start.scroll.clientHeight;
  assert(closeEnough(start.scroll.left, maxLeft / 2, 2), `${profile} start is not horizontally centred on the picture`);
  assert(closeEnough(start.scroll.top, maxTop / 2, 2), `${profile} start is not vertically centred on the picture`);
  if (profile === "phone") {
    assert(closeEnough(start.land.height, start.scroll.clientHeight, 2), "Phone cover does not fill the height");
    assert(maxLeft > 1 && maxTop <= 2, "Phone Fit should pan sideways with the full picture height visible");
  }
  for (const point of [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }]) {
    await page.locator("#map-viewport").evaluate((element, corner) => element.scrollTo({
      left: corner.x * (element.scrollWidth - element.clientWidth),
      top: corner.y * (element.scrollHeight - element.clientHeight),
      behavior: "instant"
    }), point);
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const edge = await townCoverage(page, viewport, `${profile} minimum zoom corner ${point.x},${point.y}`);
    assert(closeEnough(edge.scroll.left, point.x * (edge.scroll.width - edge.scroll.clientWidth), 2), `${profile} minimum-zoom horizontal edge is unreachable`);
    assert(closeEnough(edge.scroll.top, point.y * (edge.scroll.height - edge.scroll.clientHeight), 2), `${profile} minimum-zoom vertical edge is unreachable`);
  }
  await page.locator("#map-viewport").evaluate((element, position) => element.scrollTo({ left: position.left, top: position.top, behavior: "instant" }), start.scroll);
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

(async () => {
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  const base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true, timeout: 20000 });
  try {
    const profiles = [
      { name: "desktop", width: 1440, height: 900 },
      { name: "compact", width: 768, height: 900 },
      { name: "phone", width: 390, height: 844 }
    ];
    for (const profile of profiles) {
      const viewport = { width: profile.width, height: profile.height };
      const context = await browser.newContext({ viewport, reducedMotion: "reduce", deviceScaleFactor: 1, hasTouch: profile.name === "phone", isMobile: profile.name === "phone" });
      await context.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), { key: storageKey, raw: fixture() });
      try {
        const page = await context.newPage();
        observe(page, profile.name);
        assert.equal((await page.goto(base))?.status(), 200);
        await settle(page);
        await assertBaseShell(page, viewport, `${profile.name} initial`);
        const fit = await townCoverage(page, viewport, `${profile.name} Fit`);
        assert.equal(fit.fit, "true", `${profile.name} does not start at Fit`);
        assert(Math.abs(fit.zoom - fit.minimumZoom) < .00001, `${profile.name} Fit is below or above the cover floor`);
        assert(Math.abs(fit.minimumZoom - 1) < .00001, `${profile.name} minimum zoom is not the true cover scale`);
        await assertMinimumZoomMidpointAndEdges(page, viewport, profile.name);
        await assertOverlayDoesNotResize(page, viewport, profile.name);
        await assertAtlasView(page, viewport, "island");
        await assertAtlasView(page, viewport, "world");
        await page.locator('.azmara-map-switcher [data-desktop-action="town"]').click();
        await page.waitForFunction(() => document.body.dataset.mapView === "town");
        await settle(page);
        await assertMaximumZoomAndEdges(page, viewport, profile.name);
        console.log(`PASS ${profile.name} ${profile.width}x${profile.height}: full-screen Town/Region/World, floating overlays, Fit and maximum-zoom pan edges`);
      } finally {
        await context.close();
      }
    }
    assert.deepEqual(errors, [], "Browser or asset errors: " + JSON.stringify(errors));
    console.log("PASS full-screen shell: 3 responsive profiles; zero visible borders, viewport gaps, page errors, console errors, request failures or HTTP asset errors");
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
