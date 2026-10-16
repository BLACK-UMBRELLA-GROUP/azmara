"use strict";

// Independent local-only read-only building-gallery regression.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(process.argv[2] || "playwright");
const base = process.argv[3] || "http://127.0.0.1:4317";
assert(["localhost", "127.0.0.1", "[::1]"].includes(new URL(base).hostname), "Catalogue QA is local-only");
const shots = process.env.AZMARA_QA_SCREENSHOTS;
if (shots) assert(fs.statSync(shots).isDirectory(), "Screenshot folder must already exist");
const key = "azmara-town-layout-v3";
const legacyKey = "azmara-town-design-v1";
const errors = [];
let groups = 0;
const expectedTitles = [
  "Town Hall", "Academy", "Warehouse", "Provision House", "Palace", "Governor’s Residence", "Museum", "Embassy", "Prayer Area",
  "Caravan Station", "Trading Post", "Depot", "Military Exchange", "Route Archive", "Freight Depot", "Intelligence House",
  "Barracks", "Town Wall", "Workshop", "Forester’s House", "Silver Refinery", "Iron Foundry",
  "Grain Estate", "Clayworks", "Carpenter’s Workshop", "Precision Workshop", "Materials Workshop", "Grain Store", "Architect’s Office", "Chronos’ Forge"
];

function observe(page) {
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => errors.push(request.url()));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
}

async function settle(page) {
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function load(context) {
  const page = await context.newPage();
  observe(page);
  assert.equal((await page.goto(base))?.status(), 200);
  await page.waitForFunction(() => Boolean(window.AzmaraCatalogue?.render));
  await page.locator("#town-core img").evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
  await settle(page);
  return page;
}

async function seed(context) {
  const now = Date.now();
  const saved = JSON.stringify({ version: 3, layoutId: "town-23-v1", townName: "Catalogue QA town", resources: { coins: 1900, timber: 610, stone: 400 }, hallLevel: 4, construction: { buildingId: "general-01", toLevel: 5, startedAt: now, endsAt: now + 10000 } });
  const legacy = JSON.stringify({ version: 1, townName: "Legacy kept intact", resources: { coins: 9119 } });
  await context.addInitScript(({ now, key, legacyKey, saved, legacy, origin }) => {
    Date.now = () => now;
    if (location.origin === origin) { localStorage.setItem(key, saved); localStorage.setItem(legacyKey, legacy); }
  }, { now, key, legacyKey, saved, legacy, origin: new URL(base).origin });
  return { saved, legacy };
}

async function bytes(page) {
  return page.evaluate(({ key, legacyKey }) => ({ saved: localStorage.getItem(key), legacy: localStorage.getItem(legacyKey) }), { key, legacyKey });
}

async function preserved(page, expected) {
  assert.deepEqual(await bytes(page), expected, "Catalogue changed valid v3 active queue or legacy bytes");
  assert.equal(await page.locator(".plot-marker").count(), 23);
  assert.equal(await page.locator('.plot-marker[data-occupied="true"]').count(), 1);
}

async function openMenu(page) {
  const desktop = await page.locator('[data-desktop-action="options"]').isVisible();
  await page.locator(desktop ? '[data-desktop-action="options"]' : "#toggle-actions").click();
  await page.waitForFunction(() => document.querySelector("#actions-menu").open);
}

async function exposed(locator, message) {
  const result = await locator.evaluate((element) => {
    const r = element.getBoundingClientRect();
    const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom, hit: hit === element || element.contains(hit), viewportWidth: innerWidth, viewportHeight: innerHeight };
  });
  assert(result.width >= 43.9 && result.height >= 43.9 && result.x >= -.5 && result.y >= -.5 && result.right <= result.viewportWidth + .5 && result.bottom <= result.viewportHeight + .5 && result.hit, message + " " + JSON.stringify(result));
}

async function decodeArt(page) {
  return page.evaluate(async () => {
    const metadata = [];
    for (const frame of document.querySelectorAll(".catalogue-stage-art.building-frame")) {
      const sprite = frame.querySelector(".building-sprite"), css = getComputedStyle(sprite);
      const url = css.backgroundImage.match(/^url\("?(.*?)"?\)$/)?.[1];
      if (!url) throw new Error("Catalogue atlas background missing");
      const img = new Image(); img.src = url; await img.decode();
      const cell = Number(frame.dataset.artCell), canvas = document.createElement("canvas"); canvas.width = 384; canvas.height = 256;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      const size = css.backgroundSize.split(" ").map(parseFloat), position = css.backgroundPosition.split(" ").map(parseFloat);
      const native = [position[0] / 100 * (img.naturalWidth - img.naturalWidth * 100 / size[0]), position[1] / 100 * (img.naturalHeight - img.naturalHeight * 100 / size[1]), img.naturalWidth * 100 / size[0], img.naturalHeight * 100 / size[1]];
      context.drawImage(img, ...native, 0, 0, canvas.width, canvas.height);
      const rgba = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let transparent = 0;
      let opaque = 0;
      for (let index = 0; index < rgba.length; index += 4) { if (!rgba[index + 3]) transparent += 1; if (rgba[index + 3] >= 240) opaque += 1; }
      metadata.push({ id: frame.dataset.buildingArt, filename: new URL(url).pathname.split("/").at(-1), width: img.naturalWidth, height: img.naturalHeight, transparent, opaque, area: canvas.width * canvas.height, cell, size, position, native, declared: frame.dataset.artRect?.split(",").map(Number), frame: frame.getBoundingClientRect().toJSON(), sprite: sprite.getBoundingClientRect().toJSON(), cellAspect: native[2] / native[3] });
    }
    const hall = document.querySelector(".catalogue-hall-art"); await hall.decode();
    return { metadata, hall: { loaded: hall.complete && hall.naturalWidth > 0, src: new URL(hall.src).pathname.split("/").at(-1) } };
  });
}

async function openCatalogue(page) {
  await openMenu(page);
  const entry = page.locator('#actions-menu [data-panel="catalogue"]');
  await entry.scrollIntoViewIfNeeded();
  await exposed(entry, "Catalogue menu entry is inaccessible or smaller than44px");
  await entry.click();
  await page.waitForFunction(() => document.querySelector("#detail-panel").open && Boolean(document.querySelector(".building-catalogue")));
  await decodeArt(page);
  await settle(page);
}

async function screenshot(page, filename) {
  if (shots) await page.screenshot({ path: path.join(shots, filename + ".png"), scale: "css" });
}

async function cameraPose(page) {
  return page.evaluate(() => {
    const viewport = document.querySelector("#map-viewport"); const map = document.querySelector("#town-map");
    return { left: viewport.scrollLeft, top: viewport.scrollTop, zoom: map.dataset.zoom, width: document.querySelector("#town-core").getBoundingClientRect().width, animating: map.dataset.cameraAnimating, dragging: viewport.dataset.dragging };
  });
}

function sameCamera(before, after) {
  for (const field of ["left", "top", "width"]) assert(Math.abs(before[field] - after[field]) < 1.5, "Catalogue camera moved behind modal: " + field);
  assert.equal(after.zoom, before.zoom);
  assert.notEqual(after.animating, "true"); assert.notEqual(after.dragging, "true");
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    try {
      const expected = await seed(context);
      const page = await load(context);
      await page.locator('[data-desktop-action="close"]').click();
      const before = await cameraPose(page);
      await openCatalogue(page);
      const titles = await page.locator(".catalogue-card h4").allTextContents();
      assert.deepEqual(titles, expectedTitles, "Catalogue does not match the independently listed30 original land titles");
      assert.equal(new Set(titles).size, 30);
      assert.equal(new Set(await page.locator(".catalogue-card").evaluateAll((cards) => cards.map((card) => card.dataset.buildingConcept))).size, 30);
      assert.equal(await page.locator(".catalogue-card").count(), 30);
      assert.equal(await page.locator(".catalogue-stage-art.building-frame").count(), 29);
      for (const [group, count] of Object.entries({ civic: 8, trade: 7, war: 6, industry: 8 })) assert.equal(await page.locator(`.catalogue-group-${group} .catalogue-card`).count(), count);
      for (const [role, count] of Object.entries({ general: 27, harbour: 1, wall: 1, freighter: 1 })) assert.equal(await page.locator(`.catalogue-card[data-plot-role="${role}"]`).count(), count);
      assert.equal(await page.locator('[data-building-concept="town-wall"]').getAttribute("data-plot-role"), "wall");
      assert.equal(await page.locator('[data-building-concept="dockyard"]').getAttribute("data-plot-role"), "freighter");
      assert.equal(await page.locator('[data-building-concept="trading-port"]').getAttribute("data-plot-role"), "harbour");
      assert.equal(await page.locator('[data-building-concept="shipyard"]').count(),0);
      const content = await page.locator(".building-catalogue").textContent();
      assert(content.includes("Prayer Area") && content.includes("Chronos’ Forge"));
      assert(!/\b(gods?|deit(?:y|ies)|miracles?|divine|polytheism|ambrosia|temple)\b/i.test(content), "Excluded deity/miracle/premium prose is present");
      assert(content.includes("First-draft") && content.includes("not simulated"));
      assert.equal(await page.locator(".building-catalogue button, .building-catalogue input, .building-catalogue form, .building-catalogue a").count(), 0, "Gallery contains construction/purchase/state-changing controls");
      assert.equal(await page.locator(".building-catalogue select").count(), 1);
      assert.deepEqual(await page.locator("#catalogue-level option").evaluateAll((options) => options.map((option) => Number(option.value))),Array.from({length:50},(_,i)=>i+1));
      await preserved(page, expected);
      console.log("PASS30 unique original land titles, four groups, dedicated roles, Prayer Area/Chronos and read-only controls"); groups += 1;

      const art = await decodeArt(page);
      assert.equal(art.metadata.length, 29); assert(art.hall.loaded && art.hall.src === "azmara-hall-level-1.png", "Default catalogue Hall is not its level1 design");
      for (const sheet of art.metadata) {
        assert.equal(sheet.width, 1254); assert.equal(sheet.height, 1254);
        assert.equal(sheet.filename, ["trading-port","dockyard"].includes(sheet.id)?`azmara-${sheet.id}-stages-land-v3.png`:`azmara-${sheet.id}-stages-v2.png`, "Wrong or undecoded per-type cleaned raster atlas");
        assert(sheet.transparent > sheet.area * .1 && sheet.opaque > sheet.area * .03, "Cropped cell does not contain real transparency and painted artwork " + JSON.stringify(sheet));
        assert.equal(sheet.cell, 0);
        assert(sheet.size.every((value) => value > 0) && sheet.native.every(Number.isFinite));
        assert(sheet.native[0] >= -.01 && sheet.native[1] >= -.01 && sheet.native[0] + sheet.native[2] <= sheet.width / 4 + .01 && sheet.native[1] + sheet.native[3] <= sheet.height / 3 + .01, "Actual CSS crop escapes first milestone cell");
        assert(sheet.declared?.every((value, index) => Math.abs(value - sheet.native[index]) < .01), "Actual crop differs from registered unmodified-PNG rectangle");
        assert(sheet.sprite.width >= 80 && sheet.sprite.height >= 80 && Math.abs(sheet.sprite.width / sheet.sprite.height - sheet.cellAspect) <= .01, "Cell is stretched or unreadable " + sheet.id);
      }
      console.log("PASS29 decoded transparent per-type raster cells, correct row-major crops and original Hall illustration"); groups += 1;

      assert.equal(await page.evaluate(() => document.activeElement?.id), "close-panel");
      for (let index = 0; index < 4; index += 1) {
        await page.keyboard.press("Tab");
        const gated = await page.evaluate(() => document.querySelector("#detail-panel").contains(document.activeElement) || document.activeElement === document.body);
        // With a single focusable Close button, Chromium's native modal cycles
        // through browser chrome (reported as body) before returning to Close.
        assert(gated, "Keyboard focus entered underlying town controls while modal");
      }
      await page.locator("#close-panel").focus();
      await page.locator("#zoom-in").dispatchEvent("click");
      await page.locator("#map-viewport").dispatchEvent("keydown", { key: "+", bubbles: true });
      await page.locator("#map-viewport").dispatchEvent("keydown", { key: "ArrowRight", bubbles: true });
      await settle(page); sameCamera(before, await cameraPose(page));
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("#detail-panel").evaluate((dialog) => dialog.open), false);
      assert.equal(await page.evaluate(() => document.activeElement?.dataset.desktopAction), "options", "Menu-launched gallery did not restore Options focus");
      await preserved(page, expected);
      console.log("PASS modal keyboard trap, blocked town camera, Escape and close-focus restoration"); groups += 1;

      await page.locator('[data-desktop-action="fit"]').click();
      await page.locator('[data-plot="general-02"]').click();
      await page.locator("#close-panel").click();
      assert.equal(await page.evaluate(() => document.activeElement?.dataset.plot), "general-02", "Plot review lost original plot focus");
      await openCatalogue(page); await page.locator("#close-panel").click();
      assert.equal(await page.evaluate(() => document.activeElement?.dataset.desktopAction), "options");
      await page.locator('.desktop-hud [data-panel="overview"]').first().click();
      await page.keyboard.press("Escape");
      assert.equal(await page.evaluate(() => document.activeElement?.dataset.panel), "overview");
      await openCatalogue(page); await page.keyboard.press("Escape");
      assert.equal(await page.evaluate(() => document.activeElement?.dataset.desktopAction), "options");
      await page.locator('.desktop-hud [data-map-navigation="world"]').click();
      await openCatalogue(page);
      const atlasBefore = await page.locator("#atlas-view").getAttribute("data-zoom");
      await page.locator('[aria-label="Zoom in atlas"]').dispatchEvent("click");
      assert.equal(await page.locator("#atlas-view").getAttribute("data-zoom"), atlasBefore);
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("#atlas-view").getAttribute("data-atlas-view"), "world");
      await page.locator('[data-atlas-action="town"]').click();
      await preserved(page, expected);
      console.log("PASS reachable Options catalogue after plot/overview/atlas reviews, original focus and unchanged town/atlas state"); groups += 1;
    } finally { await context.close(); }

    for (const [width, height] of [[320, 568], [390, 844], [844, 390], [1024, 600], [1440, 900]]) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
      try {
        const expected = await seed(context); const page = await load(context);
        await openCatalogue(page);
        const panel = page.locator("#detail-panel");
        const dimensions = await panel.evaluate((dialog) => ({ client: dialog.clientWidth, scroll: dialog.scrollWidth, height: dialog.clientHeight, scrollHeight: dialog.scrollHeight, r: dialog.getBoundingClientRect().toJSON() }));
        assert(dimensions.scroll <= dimensions.client + 1, "Catalogue requires horizontal scrolling at " + width + " " + JSON.stringify(dimensions));
        assert(dimensions.r.x >= -.5 && dimensions.r.right <= width + .5 && dimensions.r.y >= -.5 && dimensions.r.bottom <= height + .5);
        assert(dimensions.scrollHeight > dimensions.height, "Catalogue is not vertically scrollable");
        await exposed(page.locator("#close-panel"), "Close button is inaccessible");
        if (width >= 1024) {
          const hallVisible = await page.locator(".catalogue-hall-art").evaluate((image) => {
            const r = image.getBoundingClientRect(); const panel = document.querySelector("#detail-panel").getBoundingClientRect();
            return Math.max(0, Math.min(r.bottom, panel.bottom) - Math.max(r.top, panel.top + 57)) / r.height;
          });
          assert(hallVisible >= .9, "The initial desktop catalogue screen does not show its Town Hall illustration");
        }
        await screenshot(page, `catalogue-top-${width}x${height}`);
        const cards = page.locator(".catalogue-card");
        for (let index = 0; index < 30; index += 1) {
          const card = cards.nth(index); await card.scrollIntoViewIfNeeded();
          const visible = await card.evaluate((element) => {
            const r = element.getBoundingClientRect(); const panel = document.querySelector("#detail-panel").getBoundingClientRect();
            const x = r.x + r.width / 2; const y = Math.min(panel.bottom - 5, Math.max(panel.top + 64, r.y + r.height / 2));
            const hit = document.elementFromPoint(x, y);
            const label = element.querySelector("h4"); const title = label.getBoundingClientRect();
            return { title: label.textContent, containedX: r.x >= panel.x && r.right <= panel.right, exposed: element === hit || element.contains(hit), textWidth: label.scrollWidth, clientWidth: label.clientWidth, titleInCard: title.x >= r.x && title.right <= r.right };
          });
          assert(visible.containedX && visible.exposed && visible.textWidth <= visible.clientWidth + 1 && visible.titleInCard, "Card cannot be read via vertical scrolling: " + visible.title + " " + JSON.stringify(visible));
        }
        await screenshot(page, `catalogue-chronos-${width}x${height}`);
        if (width === 390 || width === 1440) {
          await page.locator('[data-building-concept="prayer-area"]').scrollIntoViewIfNeeded();
          await screenshot(page, `catalogue-prayer-${width}x${height}`);
        }
        await exposed(page.locator("#close-panel"), "Sticky Close button became inaccessible at the end");
        await page.locator("#close-panel").click();
        assert.equal(await page.locator("#detail-panel").evaluate((dialog) => dialog.open), false);
        await preserved(page, expected);
        console.log(`PASS30 readable scroll-reachable cards, no horizontal overflow, sticky44px Close and save bytes at ${width}x${height}`); groups += 1;
      } finally { await context.close(); }
    }
    assert.deepEqual(errors, [], "Catalogue page/console/network errors occurred");
    console.log(`PASS ${groups} catalogue regression groups; no page, console or network errors`);
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
