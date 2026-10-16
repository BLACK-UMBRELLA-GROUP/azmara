"use strict";

// Isolated Chromium regressions for the 23-plot local preview.
// argv[2] is an installed Playwright module; argv[3] is the preview base URL.
const assert = require("node:assert/strict");
const { chromium } = require(process.argv[2] || "playwright");
const { types: buildingTypes } = require("./building-harness.cjs");
const base = process.argv[3] || "http://127.0.0.1:4317";
const key = "azmara-town-layout-v3";
const legacyKey = "azmara-town-design-v1";
const layoutId = "town-23-v1";
const hallId = "general-01";
const initialResources = { coins: 2400, timber: 760, stone: 540 };
const paidResources = { coins: 2160, timber: 630, stone: 440 };
const sizes = [[1440, 900], [390, 844], [320, 720], [844, 390], [1920, 900], [768, 1024], [375, 600], [390, 640], [320, 568], [601, 390], [768, 900], [1024, 768], [390, 1066], [2560, 900]];
const plots = [
  ...Array.from({ length: 19 }, (_, index) => {
    const suffix = String(index + 1).padStart(2, "0");
    return { id: "general-" + suffix, kind: "general", title: index === 0 ? "Town Hall" : "General plot " + suffix };
  }),
  { id: "wall-01", kind: "wall", title: "Wall plot" },
  { id: "harbour-01", kind: "harbour", title: "Caravan plot 1" },
  { id: "harbour-02", kind: "harbour", title: "Caravan plot 2" },
  { id: "freighter-01", kind: "freighter", title: "Freight depot plot" }
];
const expectedIds = plots.map((plot) => plot.id).sort();
const errors = [];
let checks = 0;

function freshState(townName = "Your town") {
  return { version: 3, layoutId, townName, hallLevel: 1, resources: { ...initialResources }, construction: null };
}

function resetState(townName) {
  return { ...freshState(townName), hallPlaced: false };
}

function legacyFixture(now) {
  return JSON.stringify({
    version: 1,
    townName: "Legacy Cedar",
    resources: { coins: 9876, timber: 8765, stone: 7654 },
    levels: { council: 8, library: 7, bazaar: 6, workshop: 5, farm: 4, plot: 1 },
    // An expired legacy job must not be reconciled or imported by the new layout.
    construction: { buildingId: "library", toLevel: 8, startedAt: now - 20000, endsAt: now - 10000 }
  }, null, 2);
}

function captureErrors(page) {
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => errors.push(request.url()));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
}

async function settle(page) {
  await page.locator("#town-core").evaluate(() => new Promise((resolve) => {
    const ready = () => document.querySelector("#town-map").dataset.cameraAnimating === "true" ? requestAnimationFrame(ready) : requestAnimationFrame(() => requestAnimationFrame(resolve));
    requestAnimationFrame(ready);
  }));
}

async function desktopPresentation(page) {
  const profile = await page.locator("#town-map").evaluate((map) => ({ expected: innerWidth >= 1024 && innerHeight >= 600 ? "desktop" : "compact", actual: map.dataset.presentation }));
  assert.equal(profile.actual, profile.expected, "Town presentation disagrees with the approved desktop breakpoint");
  return profile.expected === "desktop";
}

async function actionsTrigger(page) {
  return page.locator(await desktopPresentation(page) ? '[data-desktop-action="options"]' : "#toggle-actions");
}

async function assertTriggerFocus(page, message) {
  assert(await (await actionsTrigger(page)).evaluate((button) => document.activeElement === button), message);
}

async function actions(page, open) {
  const menu = page.locator("#actions-menu");
  const current = await menu.evaluate((dialog) => dialog.open);
  const trigger = await actionsTrigger(page);
  if (current !== open) await (open ? trigger : page.locator("#close-actions")).click();
  // Native dialog close events (ARIA and focus restoration) follow close().
  await settle(page);
  assert.equal(await menu.evaluate((dialog) => dialog.open), open, "Actions menu has the wrong open state");
  assert.equal(await trigger.getAttribute("aria-expanded"), String(open));
  if (open) assert(await menu.evaluate((dialog) => dialog instanceof HTMLDialogElement && dialog.matches(":modal")), "Actions menu is not a native modal dialog");
  await settle(page);
}

async function menuAction(page, control) {
  await actions(page, true);
  await control.scrollIntoViewIfNeeded();
  await control.click();
  await page.locator("#actions-menu").waitFor({ state: "hidden" });
  await settle(page);
  assert.equal(await (await actionsTrigger(page)).getAttribute("aria-expanded"), "false", "An action failed to close the menu");
  await settle(page);
}

async function assertCompactScene(page) {
  const desktop = await desktopPresentation(page);
  const result = await page.locator("#map-viewport").evaluate((viewport) => {
    const box = viewport.getBoundingClientRect();
    const desktop = innerWidth >= 1024 && innerHeight >= 600;
    const name = document.querySelector(desktop ? "#desktop-town-name" : "#town-name");
    const toggle = document.querySelector("#toggle-actions");
    const nameBox = name.getBoundingClientRect();
    return {
      viewport: { x: box.x, y: box.y, right: box.right, bottom: box.bottom }, width: innerWidth, height: innerHeight,
      nameOutsideMenu: !name.closest("#actions-menu"), nameVisible: nameBox.width > 0 && nameBox.height > 0 && nameBox.x >= 0 && nameBox.y >= 0 && nameBox.right <= innerWidth && nameBox.bottom <= innerHeight,
      dots: toggle.querySelectorAll(".four-dots > i").length,
      legacy: document.querySelectorAll(".brand-bar, .town-hud, .hud-controls, .utility-rail, .bottom-dock, #toggle-town-controls, .scene-caption, .mobile-map-hint").length
    };
  });
  for (const field of ["x", "y"]) assert(Math.abs(result.viewport[field]) <= 1, "The scene does not begin at the viewport edge");
  assert(Math.abs(result.viewport.right - result.width) <= 1 && Math.abs(result.viewport.bottom - result.height) <= 1, "The scene does not fill the complete viewport");
  assert(result.nameOutsideMenu && result.nameVisible, "Town name is hidden inside the menu or clipped");
  assert.equal(result.legacy, 0, "Legacy HUD, rails, header/footer or persistent guidance remain");
  assert.equal(result.dots, 4, "The actions toggle does not contain four dots");
  assert.equal(await page.locator("#toggle-actions").getAttribute("aria-controls"), "actions-menu");
  assert.equal(await page.locator("#toggle-actions").getAttribute("aria-haspopup"), "dialog");
  assert.equal(await page.locator("#toggle-actions").getAttribute("aria-expanded"), "false");
  assert.equal(await page.locator("#actions-menu").evaluate((dialog) => dialog.open), false);
  assert.equal(await page.locator("#desktop-hud").isVisible(), desktop, "Desktop HUD visibility disagrees with presentation");
  assert.equal(await page.locator("#toggle-actions").isVisible(), !desktop, "Compact menu trigger visibility disagrees with presentation");
  if (desktop) {
    const trigger = await actionsTrigger(page);
    const box = await trigger.boundingBox();
    assert(box && box.width >= 32 && box.height >= 32 && box.x >= 0 && box.y >= 0 && box.x + box.width <= page.viewportSize().width && box.y + box.height <= page.viewportSize().height, "Desktop Options is undersized or clipped");
    for (const selector of [".desktop-resource-panel", ".desktop-advisers", ".desktop-rail-right", ".desktop-compass"]) assert(await page.locator(selector).isVisible(), "Desktop presentation omitted " + selector);
    assert.equal(await page.locator(".desktop-rail-left").count(), 0, "Removed left toolbar remains in the desktop DOM");
    assert.equal(await page.locator(".desktop-adviser").count(), 4, "Desktop must retain four adviser categories");
  } else await assertTargetBounds(page, "#toggle-actions");
  for (const id of ["zoom-in", "zoom-out", "center-map", "toggle-map-view", "toggle-labels", "rename-town", "show-town"]) {
    assert.equal(await page.locator("#actions-menu #" + id).count(), 1, id + " is not inside the actions menu");
    assert.equal(await page.locator("#" + id).isVisible(), false, id + " remains visible while the menu is closed");
  }
}

async function assertMenuControls(page) {
  await actions(page, true);
  const buttons = page.locator("#actions-menu button");
  assert((await buttons.count()) >= 13, "Actions menu omitted an existing action");
  for (let index = 0; index < await buttons.count(); index += 1) {
    const button = buttons.nth(index);
    await button.scrollIntoViewIfNeeded();
    const target = await button.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const dialog = document.querySelector("#actions-menu").getBoundingClientRect();
      const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
      return { name: element.getAttribute("aria-label") || element.textContent.trim(), width: box.width, height: box.height, visible: box.x >= 0 && box.y >= 0 && box.right <= innerWidth + 1 && box.bottom <= innerHeight + 1 && box.y >= dialog.y && box.bottom <= dialog.bottom + 1, exposed: hit?.closest("button") === element };
    });
    assert(target.name && target.width >= 44 && target.height >= 44 && target.visible && target.exposed, "Menu action is unnamed, undersized, clipped or intercepted: " + target.name);
  }
  for (const resource of ["Timber", "Clay", "Silver", "Grain", "Iron", "Coins"]) {
    const item = page.locator("#actions-menu").getByLabel(new RegExp("^" + resource)).first();
    await item.scrollIntoViewIfNeeded();
    assert(await item.isVisible(), resource + " is unavailable in the actions menu");
  }
  assert.equal(await page.locator("#actions-menu #queue-chip").count(), 1, "Queue status is missing from the menu");
  assert((await page.locator("#queue-chip").textContent()).trim(), "Queue status is empty");
  await actions(page, false);
}

async function assertMenuModal(page) {
  const pose = () => page.locator("#map-viewport").evaluate((viewport) => {
    const core = document.querySelector("#town-core").getBoundingClientRect();
    return [viewport.scrollLeft, viewport.scrollTop, core.x, core.y, core.width, core.height];
  });
  const initial = await pose();
  const state = await rawState(page);
  const legacy = await rawState(page, legacyKey);
  const stable = async () => {
    const actual = await pose();
    assert(actual.every((value, index) => Math.abs(value - initial[index]) <= 1), "Actions dialog changed the underlying camera pose");
    assert.equal(await rawState(page), state, "Actions dialog wrote v3 progress");
    assert.equal(await rawState(page, legacyKey), legacy, "Actions dialog changed legacy progress");
  };
  await actions(page, true);
  assert.equal(await page.locator("dialog:modal").count(), 1, "More than one modal is open");
  assert(await page.evaluate(() => document.activeElement.closest("#actions-menu") !== null), "Opening actions left focus on the inert map");
  const count = await page.locator("#actions-menu button:not(:disabled)").count();
  for (const key of ["Tab", "Shift+Tab"]) {
    for (let index = 0; index < count + 2; index += 1) {
      await page.keyboard.press(key);
      assert(await page.evaluate(() => document.activeElement.closest("#actions-menu") !== null), "Keyboard focus escaped the modal actions dialog");
    }
  }
  for (const key of ["ArrowRight", "ArrowDown", "+", "-"]) await page.keyboard.press(key);
  await stable();
  const menu = await page.locator("#actions-menu").boundingBox();
  await page.mouse.click(menu.x + 4, menu.y + 4);
  assert.equal(await page.locator("#actions-menu").evaluate((dialog) => dialog.open), true, "Clicking inside the menu dismissed it");
  await page.keyboard.press("Escape");
  await page.locator("#actions-menu").waitFor({ state: "hidden" });
  await settle(page);
  await assertTriggerFocus(page, "Menu Escape did not restore trigger focus");
  await stable();
  await actions(page, true);
  const box = await page.locator("#actions-menu").boundingBox();
  const size = page.viewportSize();
  const outside = [[2, 2], [size.width - 2, 2], [2, size.height - 2], [size.width - 2, size.height - 2]].find(([x, y]) => x < box.x || x > box.x + box.width || y < box.y || y > box.y + box.height);
  assert(outside, "No backdrop point is available to verify dismissal");
  await page.mouse.click(...outside);
  await page.locator("#actions-menu").waitFor({ state: "hidden" });
  await settle(page);
  assert.equal(await page.locator("#detail-panel").evaluate((dialog) => dialog.open), false, "Backdrop dismissal selected an underlying plot");
  await assertTriggerFocus(page, "Backdrop dismissal did not restore trigger focus");
  await stable();
  await actions(page, true);
  await actions(page, false);
  await assertTriggerFocus(page, "Close actions did not restore trigger focus");
  await menuAction(page, page.locator("#show-town"));
  await stable();
  await menuAction(page, page.locator('#actions-menu [data-panel="overview"]'));
  assert.equal(await page.locator("dialog:modal").count(), 1, "Actions and detail dialogs remained modal together");
  await close(page, true);
  await stable();
}

async function assertTownArtwork(page) {
  assert.equal(await page.locator("#town-core img.town-hall-art").count(), 1, "Town must contain exactly one Hall artwork");
  assert.equal(await page.locator("#town-core img.empty-plot-art").count(), 22, "Every empty plot must have its own unconstructed reserve artwork");
  assert.equal(await page.locator("#town-core .empty-slot-plus, #town-core .plot-plus").count(), 0, "Removed plus-symbol overlays remain on plot reserves");
  assert.equal(await page.locator("#town-core img").count(), 23, "Town contains missing or additional plot artwork");
  const artwork = await page.locator("#town-core img").evaluateAll(async (images) => {
    await Promise.all(images.map((image) => image.decode()));
    return images.map((image) => {
      const plot = image.closest(".plot-marker");
      return {
        hall: image.classList.contains("town-hall-art"),
        empty: image.classList.contains("empty-plot-art"),
        marker: Boolean(image.closest(".marker")),
        plot: plot?.dataset.plot,
        occupied: plot?.dataset.occupied,
        complete: image.complete,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        source: image.currentSrc
      };
    });
  });
  for (const image of artwork) {
    assert(image.complete && image.naturalWidth > 0 && image.naturalHeight > 0 && image.source, "Plot artwork did not load: " + image.plot);
  }
  const hall = artwork.filter((image) => image.hall);
  assert.equal(hall[0].plot, hallId, "Hall artwork is not inside its occupied plot button");
  assert.equal(hall[0].occupied, "true");
  assert.equal(hall[0].empty, false, "Hall artwork is also labelled as empty");
  const flags = artwork.filter((image) => image.empty);
  assert.deepEqual(flags.map((image) => image.plot).sort(), expectedIds.filter((id) => id !== hallId), "Reserve artwork does not match all 22 empty plot IDs");
  assert(flags.every((image) => image.occupied === "false" && image.marker && !image.hall), "Reserve artwork is outside its empty plot marker or occupies the Hall");
}

async function assertVersionThreeArtwork(page) {
  const desktop = await desktopPresentation(page);
  const assets = await page.evaluate(async () => {
    const sources = [
      { role: "terrain", source: document.querySelector("#town-terrain-art").href.baseVal },
      { role: "hall", source: document.querySelector("img.town-hall-art").currentSrc },
      { role: "empty", source: document.querySelector('[data-kind="general"] img.empty-plot-art').currentSrc },
      { role: "wall", source: document.querySelector('[data-kind="wall"] img.empty-plot-art').currentSrc },
      { role: "freighter", source: document.querySelector('[data-kind="freighter"] img.empty-plot-art').currentSrc }
    ];
    return Promise.all(sources.map(async ({ role, source }) => {
      const image = new Image();
      image.src = new URL(source, location.href).href;
      await image.decode();
      const canvas = document.createElement("canvas");
      // Check source alpha at native resolution, including sparse edge holes
      // that downsampling can conceal.
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let transparent = 0;
      let opaque = 0;
      let minAlpha = 255;
      let maxAlpha = 0;
      let minX = canvas.width;
      let minY = canvas.height;
      let maxX = -1;
      let maxY = -1;
      for (let index = 0; index < pixels.length / 4; index += 1) {
        const alpha = pixels[index * 4 + 3];
        minAlpha = Math.min(minAlpha, alpha);
        maxAlpha = Math.max(maxAlpha, alpha);
        if (alpha === 0) transparent += 1;
        if (alpha >= 250) opaque += 1;
        if (alpha > 50) {
          const x = index % canvas.width;
          const y = Math.floor(index / canvas.width);
          minX = Math.min(minX, x); minY = Math.min(minY, y);
          maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
        }
      }
      const corners = [[0, 0], [canvas.width - 1, 0], [0, canvas.height - 1], [canvas.width - 1, canvas.height - 1]].map(([x, y]) => context.getImageData(x, y, 1, 1).data[3]);
      return { role, source: image.src, width: image.naturalWidth, height: image.naturalHeight, transparent, opaque, minAlpha, maxAlpha, total: canvas.width * canvas.height, corners, visibleWidth: (maxX - minX + 1) / canvas.width, visibleHeight: (maxY - minY + 1) / canvas.height };
    }));
  });
  const expected = { terrain: `progression/azmara-desert-${desktop ? "desktop" : "compact"}-level-1-v3.png`, hall: "progression/azmara-hall-level-1.png", empty: "azmara-empty-plot-v4.png", wall: "wall-earth-reserve-v2.svg", freighter: "freight-yard-reserve-v2.svg" };
  for (const asset of assets) {
    assert(new URL(asset.source).pathname.endsWith("/assets/" + expected[asset.role]), "Active scene is using stale " + asset.role + " artwork");
    const vector = asset.role === "freighter" || asset.role === "wall";
    assert(asset.width >= (vector ? 220 : 512) && asset.height >= (asset.role === "wall" ? 145 : vector ? 146 : 512), asset.role + " artwork is too small or undecoded");
    assert(asset.opaque > asset.total * (vector ? .01 : .15), asset.role + " artwork lost its visible opaque content");
    if (asset.role === "terrain") {
      if (desktop) assert(asset.width > asset.height, "Desktop desert terrain must be wide, not the compact square art");
      else assert.equal(asset.width, asset.height, "Square terrain is stretched to the world footprint");
      assert.equal(asset.transparent, 0, "Terrain backdrop contains transparent holes");
      assert.equal(asset.minAlpha, 255, "Terrain backdrop is not fully opaque at native resolution");
    } else {
      assert(Math.abs(asset.width / asset.height - (asset.role === "wall" ? 340 / 145 : 1.5)) < .01, asset.role + " sprite lost its registered artwork proportions");
      assert(asset.transparent > asset.total * 0.15, asset.role + " sprite lost its transparent background");
      assert.equal(asset.minAlpha, 0, asset.role + " sprite lacks fully transparent source pixels");
      assert(asset.maxAlpha >= 250, asset.role + " sprite lacks opaque source pixels");
      assert.deepEqual(asset.corners, [0, 0, 0, 0], asset.role + " sprite has an opaque rectangular corner");
      assert(asset.visibleWidth > 0.5 && asset.visibleHeight > 0.5, asset.role + " sprite has excessive transparent padding");
    }
    console.log(`CHECK ${asset.role} decoded artwork ${asset.width}x${asset.height}; alpha ${asset.minAlpha}-${asset.maxAlpha}; transparent ${asset.transparent}/${asset.total}`);
  }
  const hall = assets.find((asset) => asset.role === "hall");
  const hallBox = await page.locator("#town-core img.town-hall-art").boundingBox();
  assert(hallBox && hall.visibleWidth * hallBox.width >= 24 && hall.visibleHeight * hallBox.height >= 24, "The intentionally modest level1 wooden Hall lost its readable actual drawn silhouette at Fit");
  assert.equal(await page.locator("#world-landscape > image#town-terrain-art").count(), 1, "Registered primary terrain artwork is missing or duplicated");
  assert.equal(await page.locator("#world-landscape > image:not(#town-terrain-overlay)").count(), 1, "Backdrop includes extra facility artwork outside the 23 plots");
  assert.equal(await page.locator("#town-terrain-overlay").count(), 1, "Registered future-stage infrastructure overlay is missing or duplicated");
  assert.equal(await page.locator("#town-terrain-overlay").evaluate((image) => getComputedStyle(image).display), "none", "Level1 falsely shows late infrastructure");
  assert.equal(await page.locator("#painted-margin > image").count(), desktop ? 0 : 4, "Terrain margin copies do not match the active presentation");
  assert.equal(await page.locator("#painted-margin").count(), desktop ? 0 : 1, "Desktop must not tile or reflect its wide coastline");
  assert.equal(await page.locator("#world-landscape pattern:not(#painted-margin), #land-grain, #water-grain, #outland-palms, #outland-light, #water-light").count(), 0, "Obsolete procedural filler is still rendered");
  const margins = await page.locator("#painted-margin > image").evaluateAll((images) => images.map((image) => ({ source: image.href.baseVal, x: image.x.baseVal.value, y: image.y.baseVal.value, width: image.width.baseVal.value, height: image.height.baseVal.value, aspect: image.getAttribute("preserveAspectRatio") })));
  // The copies overlap by eight world pixels per side; the registered primary
  // image stays 2800 square and all copies use the original square bitmap.
  if (!desktop) assert(margins.every((image) => image.source === "assets/" + expected.terrain && image.x === -8 && image.y === -8 && image.width === 2816 && image.height === 2816 && image.aspect === "xMidYMid meet"), "Screen-ratio margin changes the stage-1 painted terrain bitmap, square proportions or eight-pixel overscan");
  const terrain = await page.locator("#town-terrain-art").evaluate((image) => ({ x: image.x.baseVal.value, y: image.y.baseVal.value, width: image.width.baseVal.value, height: image.height.baseVal.value, aspect: image.getAttribute("preserveAspectRatio") }));
  assert.deepEqual(terrain, desktop ? { x: 0, y: 0, width: 4200, height: 2400, aspect: "xMidYMid slice" } : { x: 1600, y: 960, width: 2800, height: 2800, aspect: "xMidYMid meet" }, "Primary terrain registration or uniform image fit changed");
  const emptySources = await page.locator("img.empty-plot-art").evaluateAll((images) => [...new Set(images.map((image) => image.currentSrc))]);
  assert.equal(emptySources.length, 3, "Ordinary earth, rectangular wall earth and freighter dock must retain their three distinct reserve visuals");
  const roleSources = await page.locator("img.empty-plot-art").evaluateAll((images) => images.map((image) => ({ kind: image.closest(".plot-marker").dataset.kind, source: new URL(image.currentSrc).pathname })));
  for (const image of roleSources) {
    const file = image.kind === "wall" ? expected.wall : image.kind === "freighter" ? expected.freighter : expected.empty;
    assert(image.source.endsWith("/assets/" + file), "A dedicated reserve uses the wrong artwork: " + image.kind);
  }
}

async function assertOrganicComposition(page) {
  const plots = await page.locator("#town-core .plot-marker").evaluateAll((markers) => markers.map((marker) => {
    const box = marker.getBoundingClientRect();
    return { id: marker.dataset.plot, kind: marker.dataset.kind, occupied: marker.dataset.occupied, x: Number(marker.dataset.x), y: Number(marker.dataset.y), width: box.width, height: box.height };
  }));
  const general = plots.filter((plot) => plot.kind === "general");
  assert(new Set(general.map((plot) => plot.x)).size >= 12, "General plots still repeat a small column grid");
  assert(new Set(general.map((plot) => plot.y)).size >= 12, "General plots still repeat a small row grid");
  assert(general.every((plot) => general.filter((other) => Math.abs(other.y - plot.y) <= 5).length <= 3), "General plots form a repeated straight row");
  const medianGeneralY = [...general].sort((a, b) => a.y - b.y)[Math.floor(general.length / 2)].y;
  const coast = plots.filter((plot) => plot.kind === "harbour" || plot.kind === "freighter");
  assert(coast.every((plot) => plot.y > medianGeneralY && plot.occupied === "false"), "Coastal roles must remain empty sites along the lower riverbank");
  assert(new Set(coast.map((plot) => plot.x)).size === 3 && new Set(coast.map((plot) => plot.y)).size === 3, "Coastal roles form a uniform row instead of following the shore");
  const moved = plots.find((plot) => plot.id === "general-09");
  const wall = plots.find((plot) => plot.id === "wall-01");
  assert.deepEqual([moved.x, moved.y], [1250, 140], "General 09 did not move to the former right-side wall anchor");
  assert.deepEqual([wall.x, wall.y], [440, 25], "Wall plot did not move to the inland perimeter");
  assert.equal(moved.kind, "general");
  assert.equal(wall.kind, "wall");
  await menuAction(page, page.locator("#zoom-in"));
  await settle(page);
  const footprint = await page.locator("#town-core .plot-marker").evaluateAll((markers) => markers.map((marker) => {
    const box = marker.getBoundingClientRect();
    const image = marker.querySelector("img");
    const imageBox = image.getBoundingClientRect();
    const scale = Math.min(imageBox.width / image.naturalWidth, imageBox.height / image.naturalHeight);
    return { id: marker.dataset.plot, width: box.width, height: box.height, contentWidth: image.naturalWidth * scale, contentHeight: image.naturalHeight * scale, fit: getComputedStyle(image).objectFit };
  }));
  const hall = footprint.find((plot) => plot.id === hallId);
  const empty = footprint.filter((plot) => plot.id !== hallId && plot.id.startsWith("general-"));
  assert(hall.width >= Math.max(...empty.map((plot) => plot.width)) * 1.25, "Hall did not gain a visibly larger footprint than empty sites");
  assert(hall.contentWidth >= Math.max(...empty.map((plot) => plot.contentWidth)) * 1.20, "Transparent/image sizing erased the Hall's larger drawn width");
  assert(footprint.every((plot) => plot.fit === "contain" && plot.width >= 44 && plot.height >= 44), "Plot sizing stretches artwork or loses minimum targets");
}

async function load(page) {
  const response = await page.goto(base);
  assert.equal(response?.status(), 200);
  await page.locator("#world-landscape").waitFor({ state: "visible" });
  await page.locator("#town-core").waitFor({ state: "visible" });
  await assertTownArtwork(page);
  await settle(page);
}

async function runCase(browser, name, options, prepare, verify) {
  const context = await browser.newContext(options);
  try {
    if (prepare) await prepare(context);
    const page = await context.newPage();
    captureErrors(page);
    await load(page);
    await verify(page, context);
    checks += 1;
    console.log("PASS " + name);
  } finally {
    await context.close();
  }
}

async function seed(context, entries) {
  // Seed once per origin/session, so reload cannot silently repair a mutated fixture.
  await context.addInitScript(({ origin, entries }) => {
    if (location.origin !== origin || sessionStorage.getItem("__azmaraSmokeSeeded")) return;
    for (const [storageKey, raw] of entries) localStorage.setItem(storageKey, raw);
    sessionStorage.setItem("__azmaraSmokeSeeded", "true");
  }, { origin: new URL(base).origin, entries });
}

async function holdTimestamp(context, now) {
  // Timers/animation frames still run; only game deadlines in compatibility cases are held.
  await context.addInitScript(({ now }) => { Date.now = () => now; }, { now });
}

async function controlledTimestamp(context, now) {
  await context.addInitScript(({ now }) => {
    window.__azmaraSmokeNow = Number(sessionStorage.getItem("__azmaraSmokeNow") || now);
    Date.now = () => window.__azmaraSmokeNow;
  }, { now });
}

async function advanceTimestamp(page, now) {
  await page.evaluate((now) => {
    window.__azmaraSmokeNow = now;
    sessionStorage.setItem("__azmaraSmokeNow", String(now));
  }, now);
}

async function rawState(page, storageKey = key) {
  return page.evaluate((storageKey) => localStorage.getItem(storageKey), storageKey);
}

async function readState(page) {
  const raw = await rawState(page);
  assert.notEqual(raw, null, "The v3 save was not written");
  const state = JSON.parse(raw);
  assert.equal(state.version, 3);
  assert.equal(state.layoutId, layoutId);
  assert.equal("levels" in state, false, "Legacy building levels leaked into the v3 schema");
  return state;
}

async function assertTargetBounds(page, selector) {
  const bounds = await page.locator(selector).evaluateAll((elements) => elements.map((element) => {
    const box = element.getBoundingClientRect();
    return { width: box.width, height: box.height, x: box.x, y: box.y, right: box.right, bottom: box.bottom };
  }));
  assert(bounds.length > 0, "Missing controls: " + selector);
  const viewport = page.viewportSize();
  for (const box of bounds) {
    assert(box.width >= 44 && box.height >= 44, "Undersized control: " + selector);
    assert(box.x >= 0 && box.y >= 0 && box.right <= viewport.width + 1 && box.bottom <= viewport.height + 1, "Clipped control: " + selector);
  }
}

async function assertPlots(page, hallLevel = 1, hallPlaced = true) {
  const actual = await page.locator("#town-core .building-hotspot.plot-marker").evaluateAll((markers) => markers.map((marker) => ({
    id: marker.dataset.plot,
    kind: marker.dataset.kind,
    occupied: marker.dataset.occupied,
    name: marker.getAttribute("aria-label") || ""
  })));
  assert.equal(actual.length, 23, "Town does not contain exactly 23 plots");
  assert.deepEqual(actual.map((plot) => plot.id).sort(), expectedIds, "Plot IDs are duplicated, missing or stale");
  assert.deepEqual(actual.reduce((counts, plot) => {
    counts[plot.kind] = (counts[plot.kind] || 0) + 1;
    return counts;
  }, {}), { general: 19, wall: 1, harbour: 2, freighter: 1 }, "Dedicated/general plot counts changed");
  assert.deepEqual(actual.filter((plot) => plot.occupied === "true").map((plot) => plot.id), hallPlaced ? [hallId] : [], "Hall occupancy does not match the saved placement");
  assert.equal(actual.filter((plot) => plot.occupied === "false").length, hallPlaced ? 22 : 23, "Empty plot occupancy is missing or ambiguous");
  for (const plot of plots) {
    const marker = actual.find((candidate) => candidate.id === plot.id);
    assert.equal(marker.kind, plot.kind);
    assert(marker.name.includes(plot.title), plot.id + " lost its full accessible name");
  }
  const hall = actual.find((plot) => plot.id === hallId);
  assert(hallPlaced ? new RegExp("\\blevel\\s*" + hallLevel + "\\b", "i").test(hall.name) : /\bempty\b/i.test(hall.name), "Hall placement/level is not reflected in its accessible name");
}

async function assertFreshUI(page, townName = "Your town") {
  assert.equal(await page.locator("#town-name").textContent(), townName);
  await assertPlots(page, 1);
  await actions(page, true);
  for (const [resource, amount] of Object.entries(initialResources)) {
    assert.equal((await page.locator("#resource-" + resource).textContent()).replace(/,/g, "").trim(), String(amount), "Invalid save leaked " + resource);
  }
  await actions(page, false);
}

async function assertResetUI(page, townName) {
  assert.equal(await page.locator("#town-name").textContent(), townName);
  await assertPlots(page, 1, false);
  assert.equal(await page.locator("#town-core img.town-hall-art").count(), 0);
  assert.equal(await page.locator("#town-core img.empty-plot-art").count(), 23);
  await page.locator("#town-core img").evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
  await actions(page, true);
  for (const [resource, amount] of Object.entries(initialResources)) assert.equal((await page.locator("#resource-" + resource).textContent()).replace(/,/g, "").trim(), String(amount));
  await actions(page, false);
}

async function close(page, escape = false, origin = "toggle-actions") {
  if (escape) await page.keyboard.press("Escape");
  else await page.locator("#close-panel").click();
  await page.locator("#detail-panel").waitFor({ state: "hidden" });
  await settle(page);
  if (origin === "toggle-actions") await assertTriggerFocus(page, "Details restored focus to a hidden menu control or the wrong trigger");
  else assert.equal(await page.evaluate(() => document.activeElement.id || document.activeElement.dataset.plot), origin, "Details restored focus to the wrong plot");
}

async function openList(page) {
  await menuAction(page, page.locator('#actions-menu [data-panel="buildings"]'));
  await page.locator("#detail-panel").waitFor({ state: "visible" });
  const ids = await page.locator(".building-list-button").evaluateAll((buttons) => buttons.map((button) => button.dataset.plot).sort());
  assert.deepEqual(ids, expectedIds, "Map/list plot IDs do not agree");
}

async function openPlot(page, plot) {
  await openList(page);
  await page.locator('.building-list-button[data-plot="' + plot.id + '"]').click();
  assert.equal(await page.locator("#panel-title").textContent(), plot.title);
}

async function assertStickyClose(page) {
  const panel = page.locator("#detail-panel");
  const overflow = await panel.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
    return element.scrollHeight > element.clientHeight + 1;
  });
  assert(overflow, "The 23-entry list did not exercise dialog scrolling");
  await settle(page);
  const visible = await page.locator("#close-panel").evaluate((button) => {
    const box = button.getBoundingClientRect();
    const panel = document.querySelector("#detail-panel").getBoundingClientRect();
    const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
    return box.width >= 44 && box.height >= 44 && box.y >= panel.y - 1 && box.bottom <= panel.bottom + 1 && hit?.closest("#close-panel") === button;
  });
  assert(visible, "Close control is clipped, intercepted or scrolls away with details");
}

async function rename(page, name, expected = name) {
  await menuAction(page, page.locator("#rename-town"));
  assert.equal(await page.locator("#town-name-input").getAttribute("maxlength"), "20");
  await page.locator("#town-name-input").fill(name);
  await page.getByRole("button", { name: "Save town name", exact: true }).click();
  await page.locator("#detail-panel").waitFor({ state: "hidden" });
  await settle(page);
  await assertTriggerFocus(page, "Rename did not restore the visible menu trigger");
  assert.equal(await page.locator("#town-name").textContent(), expected);
  if (await desktopPresentation(page)) assert.equal(await page.locator("#desktop-town-name").textContent(), expected, "Desktop town selector did not reflect rename");
}

async function reset(page, cancel = false) {
  await menuAction(page, page.locator('#actions-menu [data-panel="overview"]'));
  await page.locator("#request-reset").click();
  await page.locator(cancel ? "#cancel-reset" : "#confirm-reset").click();
  await page.locator("#detail-panel").waitFor({ state: "hidden" });
  await settle(page);
}

async function assertQueueGuard(page, saved) {
  assert.equal(await page.locator("#upgrade-building:enabled").count(), 0, "A second Hall upgrade remains available during construction");
  const control = page.locator("#upgrade-building");
  if (await control.count()) {
    assert(await control.isDisabled());
    await control.evaluate((button) => button.click());
  }
  assert.deepEqual(await readState(page), saved, "A repeated upgrade deducted resources or replaced the queue");
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [width, height] of sizes) {
      await runCase(browser, "fullscreen scene, responsive HUD, 23 plots and controls " + width + "x" + height,
        { viewport: { width, height }, hasTouch: true, isMobile: width <= 660 }, null, async (page) => {
          await assertCompactScene(page);
          await assertPlots(page);
          assert.equal(await page.locator("#world-landscape").evaluate((element) => element instanceof SVGSVGElement), true, "Terrain is not the inline SVG");
          assert(await page.evaluate(() => document.body.scrollWidth <= innerWidth && document.documentElement.scrollWidth <= innerWidth), "Page horizontal overflow");

          const before = await rawState(page);
          await assertMenuControls(page);
          assert.equal(await rawState(page), before, "Opening the menu wrote game progress");

          const hall = page.locator('.plot-marker[data-plot="' + hallId + '"]');
          await hall.click();
          assert.equal(await page.locator("#panel-title").textContent(), "Town Hall");
          await close(page, true, hallId);
          assert.equal(await page.evaluate(() => document.activeElement.dataset.plot), hallId, "Dialog failed to restore map-marker focus");
          await rename(page, "W".repeat(25), "W".repeat(20));
          await assertMenuControls(page);
          for (const [panel, title] of [["overview", "Town overview"], ["forces", "Forces"], ["knowledge", "Knowledge"], ["diplomacy", "Diplomacy"]]) {
            await menuAction(page, page.locator(`#actions-menu [data-panel="${panel}"]`));
            assert.equal(await page.locator("#panel-title").textContent(), title);
            await close(page);
          }
          await openList(page);
          await assertStickyClose(page);
          await close(page);
        });
    }

    for (const [width, height] of [[390, 844], [1440, 900]]) {
      await runCase(browser, "native actions modal, focus trap, Escape/backdrop and unchanged scene " + width + "x" + height,
        { viewport: { width, height }, hasTouch: true, isMobile: width <= 660 }, null, assertMenuModal);
    }

    for (const [width, height] of [[390, 844], [1440, 900]]) {
      await runCase(browser, "profile terrain, Hall and empty-site PNG decode, native alpha, footprint and role separation " + width + "x" + height,
        { viewport: { width, height } }, null, assertVersionThreeArtwork);
    }

    await runCase(browser, "irregular town composition, coastal sites and larger Hall footprint",
      { viewport: { width: 1440, height: 900 } }, null, assertOrganicComposition);

    await runCase(browser, "all 22 empty plots expose only approved compatible Dev build choices without a saved mutation",
      { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }, null, async (page) => {
        const before = await rawState(page);
        for (const plot of plots.filter((plot) => plot.id !== hallId)) {
          await openPlot(page, plot);
          const text = await page.locator("#panel-content").textContent();
          if (plot.kind === "general") assert(/\b(?:general|ordinary)\b/i.test(text), "General plot omits its intended role");
          if (plot.kind === "wall") assert(/\b(?:town\s+)?wall\b/i.test(text), "Wall plot omits its dedicated use");
          if (plot.kind === "harbour") {
            const optionNames=await page.locator("#building-type option").allTextContents();
            assert.deepEqual(optionNames,["Caravan Station"], "Land caravan choices retain naval or unknown buildings");
          }
          if (plot.kind === "freighter") assert(/\bfreight\s+depot\b/i.test(text), "Freight depot plot omits its dedicated use");
          assert.equal(await page.locator("#upgrade-building").count(), 0, plot.id + " invents an empty-plot upgrade action");
          const eligible = buildingTypes.filter((type) => type.role === plot.kind && type.id !== "town-hall").map((type) => type.id);
          assert.deepEqual(await page.locator("#building-type option").evaluateAll((options) => options.map((option) => option.value)), eligible, plot.id + " offers incompatible building choices");
          assert.equal(await page.locator("#build-selected:enabled").count(), 1, plot.id + " omits the approved Dev build action");
          assert.equal(await page.locator("#build-selected").getAttribute("data-target-plot"), plot.id);
          assert.equal(await page.locator("#panel-content form, #build-hall, #skip-construction, #set-test-level, #request-clear-plot").count(), 0, plot.id + " offers a stale occupied-only, Hall-only or queued action");
          assert.match(text, /No production, civic, trade or combat effects are simulated/, "Dev sample misleadingly implies live economic effects");
          await close(page, true);
          assert.equal(await rawState(page), before, "Inspecting " + plot.id + " changed progress");
        }
      });

    const constructionNow = Date.now();
    await runCase(browser, "controlled 120-second Hall completion, reload, one deduction, safe names and all-empty reset",
      { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }, (context) => controlledTimestamp(context, constructionNow), async (page) => {
        await openPlot(page, plots[0]);
        await page.locator("#upgrade-building").click();
        const paid = await readState(page);
        assert.deepEqual(paid.resources, paidResources);
        assert.equal(paid.hallLevel, 1, "Hall level changed before construction completed");
        assert.equal(paid.construction.buildingId, hallId);
        assert.equal(paid.construction.typeId, "town-hall");
        assert.equal(paid.construction.toLevel, 2);
        assert.equal(paid.construction.endsAt - paid.construction.startedAt, 120000);
        assert.deepEqual(paid.construction.paidCost, { coins: 240, timber: 130, stone: 100 });
        await assertQueueGuard(page, paid);
        await page.reload();
        await settle(page);
        const reloaded = await readState(page);
        assert.deepEqual(reloaded.resources, paidResources, "Reload deducted resources again");
        if (reloaded.construction) assert.deepEqual(reloaded.construction, paid.construction, "Reload replaced the Hall job");
        else {
          assert.equal(reloaded.hallLevel, 2);
          assert(await page.evaluate((deadline) => Date.now() >= deadline, paid.construction.endsAt), "Reload completed the job early");
        }
        await advanceTimestamp(page, paid.construction.endsAt - 1);
        await page.waitForTimeout(550);
        assert.deepEqual(await readState(page), paid, "Hall completed before its exact two-minute deadline");
        await advanceTimestamp(page, paid.construction.endsAt);
        await page.waitForFunction((storageKey) => {
          const state = JSON.parse(localStorage.getItem(storageKey));
          return state.hallLevel === 2 && state.construction === null;
        }, key, { timeout: 20000 });
        assert(await page.evaluate((deadline) => Date.now() >= deadline, paid.construction.endsAt), "Hall completed before its two-minute deadline");
        await page.reload();
        await settle(page);
        const completed = await readState(page);
        assert.equal(completed.hallLevel, 2);
        assert.equal(completed.construction, null);
        assert.deepEqual(completed.resources, paidResources, "Completion/reload deducted resources again");
        await assertPlots(page, 2);
        await rename(page, "<img src=x>");
        assert.equal(await page.locator("#town-name img").count(), 0, "Town-name markup was interpreted");
        await menuAction(page, page.locator('#actions-menu [data-panel="overview"]'));
        assert.equal(await page.locator("#overview-town-name").textContent(), "<img src=x>");
        await close(page);
        const beforeReset = await readState(page);
        await reset(page, true);
        assert.deepEqual(await readState(page), beforeReset, "Cancel reset changed progress");
        await reset(page);
        assert.deepEqual(await readState(page), resetState("<img src=x>"));
        await assertResetUI(page, "<img src=x>");
      });

    const now = Date.now();
    const oldRaw = legacyFixture(now);
    await runCase(browser, "legacy raw preservation, name-only carry, queue guard and reset isolation",
      { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true },
      async (context) => { await holdTimestamp(context, now); await seed(context, [[legacyKey, oldRaw]]); },
      async (page) => {
        await assertFreshUI(page, "Legacy Cedar");
        assert.equal(await rawState(page, legacyKey), oldRaw, "Initialisation rewrote legacy progress");
        await rename(page, "New Layout Cedar");
        assert.equal(await rawState(page, legacyKey), oldRaw, "Rename changed legacy progress");
        await openPlot(page, plots[0]);
        await page.locator("#upgrade-building").click();
        const paid = await readState(page);
        assert.deepEqual(paid.resources, paidResources, "Legacy resources leaked into Hall costs");
        assert.equal(paid.hallLevel, 1);
        assert.equal(paid.construction.buildingId, hallId);
        await assertQueueGuard(page, paid);
        assert.equal(await rawState(page, legacyKey), oldRaw, "Upgrade changed legacy progress");
        await page.reload();
        await settle(page);
        assert.deepEqual(await readState(page), paid, "Reload changed the held v3 Hall job");
        assert.equal(await rawState(page, legacyKey), oldRaw, "Reload reconciled the expired legacy job");
        await openPlot(page, plots[0]);
        await assertQueueGuard(page, paid);
        await close(page);
        await reset(page, true);
        assert.deepEqual(await readState(page), paid, "Cancel reset changed the held Hall job");
        await reset(page);
        assert.deepEqual(await readState(page), resetState("New Layout Cedar"));
        assert.equal(await rawState(page, legacyKey), oldRaw, "Reset removed or changed the legacy save");
        await page.reload();
        await settle(page);
        await assertResetUI(page, "New Layout Cedar");
        assert.equal(await rawState(page, legacyKey), oldRaw, "Reset/reload imported legacy progress again");
      });

    const expired = { ...freshState("Expired Hall"), resources: { ...paidResources }, construction: { buildingId: hallId, toLevel: 2, startedAt: now - 20000, endsAt: now - 10000 } };
    await runCase(browser, "expired Hall reconciliation once, level-scaled cost and reset during construction",
      { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true },
      async (context) => { await holdTimestamp(context, now); await seed(context, [[key, JSON.stringify(expired)], [legacyKey, oldRaw]]); },
      async (page) => {
        const completed = await readState(page);
        assert.equal(completed.hallLevel, 2);
        assert.equal(completed.construction, null);
        assert.deepEqual(completed.resources, paidResources);
        await page.reload();
        await settle(page);
        assert.deepEqual(await readState(page), completed, "An expired job completed more than once");
        await openPlot(page, plots[0]);
        await page.locator("#upgrade-building").click();
        const paidAgain = await readState(page);
        assert.deepEqual(paidAgain.resources, { coins: 1680, timber: 370, stone: 240 }, "Level-2 Hall cost did not multiply by level");
        assert.equal(paidAgain.construction.toLevel, 3);
        await assertQueueGuard(page, paidAgain);
        await close(page);
        await reset(page);
        assert.deepEqual(await readState(page), resetState("Expired Hall"), "Reset did not cancel construction");
        assert.equal(await rawState(page, legacyKey), oldRaw);
      });

    const isolated = { ...freshState("V3 Layout Only"), hallLevel: 2, resources: { coins: 1900, timber: 600, stone: 400 } };
    await runCase(browser, "existing v3 state wins over legacy name and remains isolated",
      { viewport: { width: 390, height: 844 } },
      (context) => seed(context, [[legacyKey, oldRaw], [key, JSON.stringify(isolated)]]), async (page) => {
        assert.equal(await page.locator("#town-name").textContent(), isolated.townName);
        await assertPlots(page, 2);
        assert.deepEqual(await readState(page), isolated, "Artwork initialisation changed existing v3 progress");
        await rename(page, "V3 Name Only");
        const saved = await readState(page);
        assert.deepEqual(saved.resources, isolated.resources);
        assert.equal(saved.hallLevel, 2);
        await page.reload();
        await settle(page);
        assert.deepEqual(await readState(page), saved);
        assert.equal(await rawState(page, legacyKey), oldRaw);
      });

    const malformed = [
      ["invalid JSON", "invalid JSON"], ["null", "null"],
      ["wrong version", JSON.stringify({ ...freshState(), version: 100 })],
      ["wrong layout", JSON.stringify({ ...freshState(), layoutId: "another-layout" })],
      ["negative quantity", JSON.stringify({ ...freshState(), resources: { ...initialResources, timber: -1 } })],
      ["fractional quantity", JSON.stringify({ ...freshState(), resources: { ...initialResources, coins: 2400.5 } })],
      ["string quantity", JSON.stringify({ ...freshState(), resources: { ...initialResources, stone: "540" } })],
      ["Hall zero", JSON.stringify({ ...freshState(), hallLevel: 0 })],
      ["fractional Hall", JSON.stringify({ ...freshState(), hallLevel: 1.5 })],
      ["long town name", JSON.stringify(freshState("W".repeat(21)))],
      ["empty town name", JSON.stringify(freshState("   "))],
      ["empty-plot job", JSON.stringify({ ...freshState(), construction: { buildingId: "general-02", toLevel: 2, startedAt: now, endsAt: now + 10000 } })],
      ["wrong job duration", JSON.stringify({ ...freshState(), construction: { buildingId: hallId, toLevel: 2, startedAt: now, endsAt: now + 9999 } })],
      ["wrong target level", JSON.stringify({ ...freshState(), construction: { buildingId: hallId, toLevel: 3, startedAt: now, endsAt: now + 10000 } })]
    ];
    for (const [name, raw] of malformed) {
      await runCase(browser, "reject malformed v3: " + name, { viewport: { width: 390, height: 844 } },
        async (context) => { await holdTimestamp(context, now); await seed(context, [[key, raw], [legacyKey, oldRaw]]); },
        async (page) => {
          await assertFreshUI(page);
          assert.equal(await rawState(page, legacyKey), oldRaw, "Invalid v3 fallback rewrote legacy data");
          await openPlot(page, plots[0]);
          assert(await page.locator("#upgrade-building").isEnabled(), "Invalid construction remained active");
          await close(page);
          await menuAction(page, page.locator('#actions-menu [data-panel="overview"]'));
          assert((await page.locator("#panel-content").textContent()).includes("This browser only"), "Writable storage was reported as unavailable");
          await close(page);
          await rename(page, "Recovered V3");
          assert.deepEqual(await readState(page), freshState("Recovered V3"));
          assert.equal(await rawState(page, legacyKey), oldRaw);
        });
    }

    for (const raw of ["invalid JSON", "null", JSON.stringify({ version: 1, townName: "W".repeat(21) }), JSON.stringify({ version: 1, townName: "   " })]) {
      await runCase(browser, "invalid legacy name does not carry", { viewport: { width: 390, height: 844 } },
        (context) => seed(context, [[legacyKey, raw]]), async (page) => {
          await assertFreshUI(page);
          await rename(page, "Fresh V3 Town");
          assert.deepEqual(await readState(page), freshState("Fresh V3 Town"));
          assert.equal(await rawState(page, legacyKey), raw, "Invalid legacy data was erased or rewritten");
        });
    }

    await runCase(browser, "blocked storage remains usable with visit-only progress",
      { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true },
      async (context) => {
        await holdTimestamp(context, now);
        await context.addInitScript(() => {
          Object.defineProperty(window, "localStorage", { get() { throw new DOMException("Test blocked storage", "SecurityError"); } });
        });
      }, async (page) => {
        await assertFreshUI(page);
        await rename(page, "<img src=x>");
        assert.equal(await page.locator("#town-name img").count(), 0);
        await menuAction(page, page.locator('#actions-menu [data-panel="overview"]'));
        assert((await page.locator("#panel-content").textContent()).includes("This visit only"));
        await close(page);
        await openPlot(page, plots[0]);
        await page.locator("#upgrade-building").click();
        assert.equal(await page.locator("#upgrade-building:enabled").count(), 0);
        await close(page);
        await actions(page, true);
        for (const [resource, amount] of Object.entries(paidResources)) {
          assert.equal((await page.locator("#resource-" + resource).textContent()).replace(/,/g, "").trim(), String(amount));
        }
        await actions(page, false);
        await reset(page);
        await assertResetUI(page, "<img src=x>");
        await page.reload();
        await settle(page);
        await assertFreshUI(page);
      });

    assert.deepEqual(errors, [], "Captured browser errors");
    console.log(checks + " regression groups passed; isolated Chromium only, no real-device claim.");
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); if (errors.length) console.error("Captured errors:", errors); process.exitCode = 1; });
