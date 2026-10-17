"use strict";

// Isolated local UI fixtures, not a simulation API or the Founder's save.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const base = process.argv[3] || "http://127.0.0.1:4317";
assert(["localhost", "127.0.0.1", "[::1]"].includes(new URL(base).hostname), "Building QA is local-only");
const shots = process.env.AZMARA_QA_SCREENSHOTS;
if (shots) assert(fs.statSync(shots).isDirectory());
const key = "azmara-town-layout-v3";
const legacyKey = "azmara-town-design-v1";
const legacyRaw = ' {"version":1,"townName":"Legacy untouched", "resources":{"coins":9876}} ';
const epoch = 1800000000000;
const supplies = { coins: 100000, timber: 100000, stone: 100000 };
const ids = [...Array.from({ length: 19 }, (_, i) => `general-${String(i + 1).padStart(2, "0")}`), "wall-01", "harbour-01", "harbour-02", "freighter-01"];
// Independent approved catalogue/role list: never derive eligibility from app.
const types = [
  ["town-hall", "general"], ["academy", "general"], ["warehouse", "general"], ["provision-house", "general"],
  ["palace", "general"], ["governors-residence", "general"], ["museum", "general"], ["embassy", "general"], ["prayer-area", "general"],
  ["trading-port", "harbour"], ["trading-post", "general"], ["depot", "general"], ["military-exchange", "general"],
  ["sea-chart-archive", "general"], ["dockyard", "freighter"], ["intelligence-house", "general"],
  ["barracks", "general"], ["town-wall", "wall"], ["workshop", "general"],
  ["foresters-house", "general"], ["silver-refinery", "general"], ["iron-foundry", "general"],
  ["grain-estate", "general"], ["clayworks", "general"], ["carpenters-workshop", "general"], ["precision-workshop", "general"],
  ["materials-workshop", "general"], ["grain-store", "general"], ["architects-office", "general"], ["chronos-forge", "general"]
].map(([id, role]) => ({ id, role }));
const milestones = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
const fixture = (extra = {}) => ({ version: 3, layoutId: "town-23-v1", townName: "Building QA", hallLevel: 1, resources: { ...supplies }, construction: null, ...extra });
const empty = (extra = {}) => fixture({ hallPlaced: false, ...extra });
const cost = (level) => ({ coins: 240 * Math.max(1, level), timber: 130 * Math.max(1, level), stone: 100 * Math.max(1, level) });
const subtract = (stocks, receipt) => Object.fromEntries(Object.entries(stocks).map(([name, amount]) => [name, amount - receipt[name]]));
const targetFor = (type) => type.id === "town-hall" ? "general-01" : ({ general: "general-02", wall: "wall-01", harbour: "harbour-01", freighter: "freighter-01" })[type.role];
const building = (saved, id) => id === "general-01" ? saved.hallPlaced === false ? null : { typeId: "town-hall", level: saved.hallLevel } : saved.buildings?.[id] || null;

async function settle(page) {
  await page.evaluate(() => new Promise((resolve) => {
    const wait = () => document.querySelector("#town-map").dataset.cameraAnimating === "true" ? requestAnimationFrame(wait) : requestAnimationFrame(() => requestAnimationFrame(resolve));
    requestAnimationFrame(wait);
  }));
  await page.locator("#town-core .marker img").evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
  await page.locator("#town-core .building-sprite").evaluateAll((layers) => Promise.all([...new Set(layers.map((layer) => getComputedStyle(layer).backgroundImage.match(/^url\("?(.*?)"?\)$/)?.[1]))].map(async (url) => {
    if (!url) throw new Error("Missing building atlas URL");
    const image = new Image(); image.src = url; await image.decode();
  })));
}
async function raw(page, storageKey = key) { return page.evaluate((key) => localStorage.getItem(key), storageKey); }
async function saved(page) { return JSON.parse(await raw(page)); }
async function close(page) {
  if (await page.locator("#detail-panel").evaluate((dialog) => dialog.open)) await page.locator("#close-panel").click();
  await settle(page);
}
async function menu(page, selector) {
  await close(page);
  const direct = page.locator(`${selector}:visible`).first();
  if (await direct.count()) {
    await direct.click();
    await settle(page);
    return;
  }
  if (selector.includes('data-panel="appearance"') || selector.includes('data-panel="catalogue"')) {
    await page.locator('.azmara-dev-button:visible').click();
    const devControl = page.locator("#detail-panel " + selector);
    await devControl.scrollIntoViewIfNeeded();
    await devControl.click();
    await settle(page);
    return;
  }
  const desktopOptions = page.locator('[data-desktop-action="options"]:visible').first();
  const trigger = await desktopOptions.count() ? desktopOptions : page.locator("#toggle-actions");
  await trigger.click();
  const control = page.locator("#actions-menu " + selector);
  await control.scrollIntoViewIfNeeded(); await control.click();
  await page.locator("#actions-menu").waitFor({ state: "hidden" });
  await settle(page);
}
async function openPlot(page, id) {
  await menu(page, '[data-panel="buildings"]');
  await page.locator(`#detail-panel [data-building="${id}"]`).click();
  await settle(page);
}
async function click(page, selector) {
  const target = page.locator(selector); await target.scrollIntoViewIfNeeded(); await target.click(); await settle(page);
}
async function at(page, now, selector) {
  await page.evaluate(({ now, selector }) => {
    window.__buildingQaNow = now;
    sessionStorage.setItem("__buildingQaNow", String(now));
    if (selector) {
      const button = document.querySelector(selector);
      if (!(button instanceof HTMLButtonElement)) throw new Error("Missing atomic boundary button " + selector);
      button.click();
    }
  }, { now, selector });
  await settle(page);
}
async function mode(page, name) {
  await close(page);
  const visible = page.locator(`button[data-preview-mode="${name}"]:visible`).first();
  if (await visible.count()) await visible.click(); else await menu(page, `button[data-preview-mode="${name}"]`);
  await settle(page);
  assert.equal(await page.locator("body").getAttribute("data-preview-mode"), name);
}
async function picture(page, name) { if (shots) await page.screenshot({ path: path.join(shots, name + ".png"), scale: "css" }); }
async function create(browser, state, options = {}) {
  const viewport = options.viewport || { width: 1440, height: 900 };
  const context = await browser.newContext({ viewport, reducedMotion: "reduce", hasTouch: viewport.width < 660, isMobile: viewport.width < 660 });
  const errors = [];
  await context.addInitScript(({ origin, seed, key, legacyKey, legacyRaw, now }) => {
    window.__buildingQaNow = Number(sessionStorage.getItem("__buildingQaNow") || now);
    Date.now = () => window.__buildingQaNow;
    if (location.origin === origin && !sessionStorage.getItem("__buildingQaSeeded")) {
      localStorage.setItem(key, seed); localStorage.setItem(legacyKey, legacyRaw);
      sessionStorage.setItem("__buildingQaSeeded", "true");
    }
  }, { origin: new URL(base).origin, seed: typeof state === "string" ? state : JSON.stringify(state), key, legacyKey, legacyRaw, now: options.now ?? epoch });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("requestfailed", (request) => errors.push(request.url() + ": " + request.failure()?.errorText));
  page.on("response", (response) => { if (response.status() >= 400) errors.push(response.status() + " " + response.url()); });
  try {
    assert.equal((await page.goto(base))?.status(), 200);
    await page.locator("#town-core").waitFor({ state: "visible" }); await settle(page);
  } catch(error) {
    let diagnostic;
    try { diagnostic=await page.evaluate(()=>({readyState:document.readyState,bodyMode:document.body.dataset.previewMode,core:document.querySelector("#town-core")?.getBoundingClientRect().toJSON(),plots:document.querySelectorAll(".plot-marker").length,apis:{art:!!window.AzmaraBuildingArt,progression:!!window.AzmaraProgression,catalogue:!!window.AzmaraCatalogue,layouts:!!window.AzmaraTownLayouts,atlas:!!window.AzmaraAtlas},scripts:[...document.scripts].map(s=>s.src),resources:performance.getEntriesByType("resource").filter(r=>r.initiatorType==="script").map(r=>({name:r.name,duration:r.duration,bytes:r.transferSize}))})); } catch(readError) {diagnostic={readError:readError.message};}
    console.error("STARTUP DIAGNOSTIC",JSON.stringify({errors,diagnostic}));
    if(shots)await page.screenshot({path:path.join(shots,"startup-failure-"+Date.now()+".png"),scale:"css"}).catch(()=>{});
    await context.close();
    error.message += "\nCaptured local browser failures: " + JSON.stringify(errors);
    throw error;
  }
  return { context, page, errors };
}

module.exports = { assert, base, key, legacyKey, legacyRaw, epoch, supplies, ids, types, milestones, fixture, empty, cost, subtract, targetFor, building, settle, raw, saved, close, menu, openPlot, click, at, mode, picture, create };
