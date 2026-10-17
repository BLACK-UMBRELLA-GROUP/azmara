"use strict";

// Private live-site geometry smoke test. It uses an isolated headless browser,
// a short-lived Sites bearer supplied through the environment, and disposable
// storage. The bearer is never printed or written to disk.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(process.argv[2] || "playwright");
const base = process.argv[3] || "https://azmara.app";
const bearer = process.env.AZMARA_SITES_BEARER;
const shots = process.env.AZMARA_QA_SCREENSHOTS || "";
const url = new URL(base);
assert.equal(url.protocol, "https:", "Live QA requires HTTPS");
assert(["azmara.app", "www.azmara.app"].includes(url.hostname), "Live QA is restricted to AZMARA's custom domain");
assert(bearer, "AZMARA_SITES_BEARER is required for the private live Site");
if (shots) assert(fs.statSync(shots).isDirectory(), "Screenshot directory must already exist");

const fixture = JSON.stringify({
  version: 3,
  layoutId: "town-23-v1",
  townName: "Live full-screen QA",
  resources: { coins: 2400, timber: 760, stone: 540 },
  hallLevel: 12,
  construction: null
});
const errors = [];
const close = (actual, expected) => Math.abs(actual - expected) <= 1;

function observe(page, label) {
  page.on("pageerror", (error) => errors.push(`${label}: ${error.message}`));
  page.on("console", (message) => { if (message.type() === "error") errors.push(`${label}: ${message.text()}`); });
  page.on("requestfailed", (request) => errors.push(`${label}: ${request.url()}: ${request.failure()?.errorText}`));
  page.on("response", (response) => { if (response.status() >= 400) errors.push(`${label}: ${response.status()} ${response.url()}`); });
}

async function ready(page) {
  await page.waitForFunction(() => document.querySelector("#town-map")?.dataset.presentation &&
    document.querySelectorAll("#town-core .plot-marker").length === 23 &&
    document.querySelector("#town-map").dataset.cameraAnimating !== "true");
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.querySelectorAll("img, svg image")].map(async (node) => {
      if (!node.getClientRects().length) return;
      const source = node.currentSrc || node.src || node.getAttribute("href");
      if (!source) return;
      const image = new Image();
      image.src = source;
      await image.decode();
    }));
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}

async function box(page, selector) {
  return page.locator(selector).evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      left: bounds.left, top: bounds.top, right: bounds.right, bottom: bounds.bottom,
      borders: [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth].map(parseFloat),
      margins: [style.marginTop, style.marginRight, style.marginBottom, style.marginLeft].map(parseFloat)
    };
  });
}

function full(bounds, viewport, label) {
  assert(close(bounds.left, 0) && close(bounds.top, 0) && close(bounds.right, viewport.width) && close(bounds.bottom, viewport.height),
    `${label} does not fill the viewport: ${JSON.stringify(bounds)}`);
  assert(bounds.borders.every((value) => value === 0), `${label} has a visible border`);
}

async function assertShell(page, viewport, label) {
  for (const selector of ["html", "body", ".game-shell", ".scene", "#map-viewport"]) {
    const bounds = await box(page, selector);
    full(bounds, viewport, `${label} ${selector}`);
    if (selector === "html" || selector === "body") assert(bounds.margins.every((value) => value === 0), `${label} ${selector} has an outer margin`);
  }
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), viewport.width, `${label} horizontal overflow`);
  assert.equal(await page.evaluate(() => document.documentElement.scrollHeight), viewport.height, `${label} vertical overflow`);
}

async function capture(page, profile, view) {
  if (!shots) return;
  await page.screenshot({ path: path.join(shots, `live-${profile}-${view}.png`), scale: "css" });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const profile of [{ name: "desktop", width: 1440, height: 900 }, { name: "phone", width: 390, height: 844 }]) {
      const viewport = { width: profile.width, height: profile.height };
      const context = await browser.newContext({
        viewport,
        hasTouch: profile.name === "phone",
        isMobile: profile.name === "phone",
        reducedMotion: "reduce",
        extraHTTPHeaders: { "OAI-Sites-Authorization": bearer.startsWith("Bearer ") ? bearer : `Bearer ${bearer}` }
      });
      await context.addInitScript((raw) => localStorage.setItem("azmara-town-layout-v3", raw), fixture);
      try {
        const page = await context.newPage();
        observe(page, profile.name);
        const response = await page.goto(base, { waitUntil: "domcontentloaded" });
        assert.equal(response?.status(), 200, `${profile.name} live response failed`);
        await ready(page);
        await assertShell(page, viewport, `${profile.name} Town`);
        const coverage = await page.evaluate(() => {
          const land = document.querySelector("#azmara-land-stage").getBoundingClientRect();
          const view = document.querySelector("#map-viewport").getBoundingClientRect();
          return { land: { left: land.left, top: land.top, right: land.right, bottom: land.bottom }, view: { left: view.left, top: view.top, right: view.right, bottom: view.bottom } };
        });
        assert(coverage.land.left <= coverage.view.left + 1 && coverage.land.top <= coverage.view.top + 1 && coverage.land.right >= coverage.view.right - 1 && coverage.land.bottom >= coverage.view.bottom - 1,
          `${profile.name} Town land leaves a hard edge`);
        await capture(page, profile.name, "town");
        for (const view of ["island", "world"]) {
          await page.locator(`.azmara-map-switcher [data-map-navigation="${view}"]`).click();
          await page.waitForFunction((expected) => document.body.dataset.mapView === expected, view);
          await page.locator(".atlas-view:not([hidden])").waitFor({ state: "visible" });
          await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          full(await box(page, ".atlas-view:not([hidden])"), viewport, `${profile.name} ${view}`);
          full(await box(page, ".atlas-view:not([hidden]) .atlas-viewport"), viewport, `${profile.name} ${view} viewport`);
          await capture(page, profile.name, view);
        }
        console.log(`PASS live ${profile.name}: Town, Region and World fill ${profile.width}x${profile.height}`);
      } finally { await context.close(); }
    }
    assert.deepEqual(errors, [], `Live browser/asset errors: ${JSON.stringify(errors)}`);
    console.log("PASS private live Site: no borders, gaps, page errors, console errors, request failures or HTTP asset errors");
  } finally { await browser.close(); }
})().catch((error) => { console.error(error.stack || error); process.exitCode = 1; });
