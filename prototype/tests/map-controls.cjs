"use strict";

// Isolated Chromium checks for the local map camera, not real-device certification.
// Match smoke.cjs: argv[2] is an installed Playwright module; argv[3] is the base URL.
const assert = require("node:assert/strict");
const path = require("node:path");
const { chromium } = require(process.argv[2] || "playwright");
const base = process.argv[3] || "http://127.0.0.1:4317";
const key = "azmara-town-layout-v3";
const legacyKey = "azmara-town-design-v1";
const screenshotDirectory = process.env.AZMARA_QA_SCREENSHOTS;
// Artwork-only QA may use four representative raster-heavy viewport groups;
// keep all eight other camera regressions and the full default matrix intact.
const viewportSelection = process.env.AZMARA_QA_VIEWPORTS;
assert(viewportSelection === undefined || viewportSelection === "representative", "AZMARA_QA_VIEWPORTS must be unset or representative");
const compactProfile = {
  core: { x: 1589.1145833333333, y: 1571.5364583333333, width: 2800, height: 1866.6666666666667 },
  frame: { x: 1589.1145833333333, y: 1571.5364583333333, width: 2800, height: 1866.6666666666667 },
  art: { x: 1589.1145833333333, y: 1571.5364583333333, width: 2800, height: 1866.6666666666667, source: "assets/land/land-stage-01.png", aspect: "xMidYMid meet" }
};
const desktopProfile = {
  core: { x: 13.671875, y: -62.6953125, width: 4200, height: 2800 },
  frame: { x: 13.671875, y: -62.6953125, width: 4200, height: 2800 },
  art: { x: 13.671875, y: -62.6953125, width: 4200, height: 2800, source: "assets/land/land-stage-01.png", aspect: "xMidYMid meet" }
};
const expectedPlots = [
  ...Array.from({ length: 19 }, (_, index) => [`general-${String(index + 1).padStart(2, "0")}`, "general"]),
  ["wall-01", "wall"], ["harbour-01", "harbour"], ["harbour-02", "harbour"], ["freighter-01", "freighter"]
];
const sizes = viewportSelection === "representative"
  ? [[390, 844], [390, 1066], [1440, 900], [2560, 900]]
  : [[1440, 900], [390, 844], [320, 720], [844, 390], [1920, 900], [768, 1024], [375, 600], [390, 640], [320, 568], [601, 390], [768, 900], [1024, 768], [390, 1066], [2560, 900]];
const errors = [];

function captureErrors(page) {
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => errors.push(request.url()));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
}

async function settle(target) {
  await target.locator("#town-map").evaluate(() => new Promise((resolve) => {
    const ready = () => document.querySelector("#town-map").dataset.cameraAnimating === "true" ? requestAnimationFrame(ready) : requestAnimationFrame(() => requestAnimationFrame(resolve));
    requestAnimationFrame(ready);
  }));
}

async function actionsTrigger(target) {
  // Landscape phones and short compact windows can be wider than 700px while
  // still using the phone dock. Follow the app's actual visible control.
  return target.locator('[data-desktop-action="options"]:visible').first();
}

function presentationProfile(value) {
  const desktop = value.windowWidth >= 1024 && value.windowHeight >= 600;
  assert.equal(value.presentation, desktop ? "desktop" : "compact", "Camera presentation disagrees with approved breakpoint");
  const profile = desktop ? desktopProfile : compactProfile;
  assert.deepEqual(value.coreCoordinates, { width: profile.core.width, height: profile.core.height }, "Core data dimensions disagree with the approved profile");
  return { ...profile, desktop, frame: desktop && value.fit ? desktopProfile.art : profile.frame };
}

async function actions(target, open) {
  const menu = target.locator("#actions-menu");
  const trigger = await actionsTrigger(target);
  if (await menu.evaluate((dialog) => dialog.open) !== open) await (open ? trigger : target.locator("#close-actions")).click();
  // Native dialog close events (ARIA and focus restoration) follow close().
  await settle(target);
  assert.equal(await menu.evaluate((dialog) => dialog.open), open);
  assert.equal(await trigger.getAttribute("aria-expanded"), String(open));
  if (open) assert(await menu.evaluate((dialog) => dialog instanceof HTMLDialogElement && dialog.matches(":modal")), "Actions menu is not a native modal dialog");
  await settle(target);
}

async function menuAction(target, control) {
  await actions(target, true);
  await control.scrollIntoViewIfNeeded();
  const box = await control.boundingBox();
  assert(box && box.width >= 44 && box.height >= 44, "Menu action is smaller than a 44px target");
  await control.click();
  await target.locator("#actions-menu").waitFor({ state: "hidden" });
  await settle(target);
  assert.equal(await (await actionsTrigger(target)).getAttribute("aria-expanded"), "false", "Map action did not close the menu");
  await settle(target);
}

async function metrics(target) {
  return target.locator("#map-viewport").evaluate((viewport) => {
    const rect = (element) => {
      const box = element.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height, right: box.right, bottom: box.bottom };
    };
    const worldViewBox = document.querySelector("#world-landscape").viewBox.baseVal;
    return {
      viewport: rect(viewport),
      clientWidth: viewport.clientWidth,
      clientHeight: viewport.clientHeight,
      scrollWidth: viewport.scrollWidth,
      scrollHeight: viewport.scrollHeight,
      left: viewport.scrollLeft,
      top: viewport.scrollTop,
      fit: viewport.dataset.fit === "true",
      zoom: Number(document.querySelector("#town-map").dataset.zoom),
      minimumZoom: Number(document.querySelector("#town-map").dataset.minZoom),
      overflow: getComputedStyle(viewport).overflow,
      landscape: rect(document.querySelector("#world-landscape")),
      core: rect(document.querySelector("#town-core")),
      coreCoordinates: { width: Number(document.querySelector("#town-core").dataset.coreWidth), height: Number(document.querySelector("#town-core").dataset.coreHeight) },
      presentation: document.querySelector("#town-map").dataset.presentation,
      worldViewBox: { x: worldViewBox.x, y: worldViewBox.y, width: worldViewBox.width, height: worldViewBox.height },
      map: rect(document.querySelector("#town-map")),
      bodyWidth: document.body.scrollWidth,
      documentWidth: document.documentElement.scrollWidth,
      windowWidth: innerWidth,
      windowHeight: innerHeight,
      touchAction: getComputedStyle(viewport).touchAction
    };
  });
}

async function assertGeometry(target) {
  const value = await metrics(target);
  assert(value.bodyWidth <= value.windowWidth && value.documentWidth <= value.windowWidth, "Page horizontal overflow");
  assert(Math.abs(value.viewport.x) <= 1 && Math.abs(value.viewport.y) <= 1 && Math.abs(value.viewport.right - value.windowWidth) <= 1 && Math.abs(value.viewport.bottom - value.windowHeight) <= 1, "Town scene does not fill the entire viewport");
  assert.equal(await target.locator("#actions-menu").evaluate((dialog) => dialog.open), false, "Camera checks must run with the modal menu closed");
  const world = value.worldViewBox;
  const profile = presentationProfile(value);
  const { core, frame } = profile;
  const scale = value.core.width / core.width;
  const expectedWidth = frame.width * scale;
  const expectedHeight = frame.height * scale;
  assert(Math.abs(value.map.width - expectedWidth) <= 2 && Math.abs(value.map.height - expectedHeight) <= 2, "Camera extends beyond the finite town frame or adds unnecessary pan padding");
  assert(Math.abs(value.scrollWidth - expectedWidth) <= 2 && Math.abs(value.scrollHeight - expectedHeight) <= 2, `Actual scroll extents include off-town overflow: ${JSON.stringify({actual:[value.scrollWidth,value.scrollHeight],expected:[expectedWidth,expectedHeight],world,scale})}`);
  assert(Math.abs(world.width - expectedWidth / scale) <= 2 && Math.abs(world.height - expectedHeight / scale) <= 2, "World coordinates exceed the town frame plus required viewport padding");
  if (Math.abs(expectedWidth - frame.width * scale) <= 1) assert(Math.abs(world.x - frame.x) <= 2, "Horizontal pan escapes the fixed town frame origin");
  if (Math.abs(expectedHeight - frame.height * scale) <= 1) assert(Math.abs(world.y - frame.y) <= 2, "Vertical pan escapes the fixed town frame origin");
  assert(world.x >= frame.x - 1 && world.y >= frame.y - 1 && world.x + world.width <= frame.x + frame.width + 1 && world.y + world.height <= frame.y + frame.height + 1, "Camera reaches outside the locked land picture");
  assert(value.left >= 0 && value.top >= 0 && value.left <= value.scrollWidth - value.clientWidth + 1 && value.top <= value.scrollHeight - value.clientHeight + 1, "Camera is beyond its native finite scroll bounds");
  assert(Math.abs(value.map.width / value.map.height - world.width / world.height) < 0.004, "Map camera stretched the landscape coordinate ratio");
  assert(Math.abs(value.core.width / value.core.height - core.width / core.height) < 0.004, "Town core coordinates are stretched");
  assert(Math.abs(value.core.x - value.map.x - value.map.width * (core.x - world.x) / world.width) <= 2, "Town core horizontal origin shifted");
  assert(Math.abs(value.core.y - value.map.y - value.map.height * (core.y - world.y) / world.height) <= 2, "Town core vertical origin shifted");
  assertCoverage(value);
  await assertPaint(target);
  await assertTerrainArt(target, value);
  assert(value.touchAction === "auto" || value.touchAction === "manipulation" || (value.touchAction.includes("pan-x") && value.touchAction.includes("pan-y") && value.touchAction.includes("pinch-zoom")), "Map disables native two-axis panning or browser pinch zoom");
  for (const id of ["zoom-in", "zoom-out", "center-map", "toggle-map-view", "toggle-labels"]) {
    assert.equal(await target.locator("#actions-menu #" + id).count(), 1, id + " is missing from the menu");
    assert.equal(await target.locator("#" + id).isVisible(), false, id + " is exposed outside the closed menu");
  }
  assert.equal(await target.getByRole("button", { name: "Zoom in", exact: true, includeHidden: true }).count(), 1);
  assert.equal(await target.getByRole("button", { name: "Zoom out", exact: true, includeHidden: true }).count(), 1);
  assert((await target.locator("#map-zoom-level").textContent()).trim(), "Zoom level has no visible feedback");
  assert.equal(await target.locator(".brand-bar, .town-hud, .hud-controls, .utility-rail, .bottom-dock, #toggle-town-controls, .scene-caption, .mobile-map-hint").count(), 0, "Legacy persistent chrome still occupies the playfield");
  // Match these viewport-local metrics, not Playwright's parent-page iframe
  // coordinates. The same 44px and clipping contract applies in both views.
  const trigger = await (await actionsTrigger(target)).evaluate((button) => button.getBoundingClientRect().toJSON());
  const minimumTrigger = 44;
  assert(trigger && trigger.width >= minimumTrigger && trigger.height >= minimumTrigger && trigger.x >= 0 && trigger.y >= 0 && trigger.x + trigger.width <= value.windowWidth && trigger.y + trigger.height <= value.windowHeight,
    `Persistent actions trigger is undersized or clipped: ${JSON.stringify({ trigger, viewport: [value.windowWidth, value.windowHeight] })}`);
  assert.equal(await target.locator("#desktop-hud").isVisible(), false, "Retired desktop HUD became visible");
  assert(await target.locator(".azmara-town-bar").isVisible(), "Floating town bar is missing");
  assert.equal(await target.locator("#azmara-side-dock").isVisible(), profile.desktop, "Computer side dock visibility disagrees with camera profile");
  assert.equal(await target.locator(".azmara-phone-dock").isVisible(), !profile.desktop, "Phone bottom dock visibility disagrees with camera profile");
  assert.equal(await target.locator("#toggle-actions").isVisible(), false, "Retired compact actions trigger became visible");
  return value;
}

async function zoomToBound(target, direction) {
  const control = target.locator(direction === "in" ? "#zoom-in" : "#zoom-out");
  await coverageAtExtremes(target);
  for (let step = 0; step < 60 && !(await control.isDisabled()); step += 1) {
    await menuAction(target, control);
    await settle(target);
    await assertGeometry(target);
    await coverageAtExtremes(target);
  }
  if (direction === "in") console.log("CHECK finite painted town coverage at every zoom and reachable pan edge");
  assert(await control.isDisabled(), `Zoom ${direction} did not reach a bounded limit`);
  const before = await metrics(target);
  await actions(target, true);
  await control.evaluate((element) => element.click());
  await actions(target, false);
  await settle(target);
  const after = await metrics(target);
  assert(Math.abs(after.core.width - before.core.width) < 1 && Math.abs(after.core.height - before.core.height) < 1, `Disabled zoom ${direction} changed the camera`);
  return assertGeometry(target);
}

function assertFits(value) {
  assert(value.fit, "Camera is not in the protected Fit state");
  assert(value.zoom >= value.minimumZoom - .001, "Protected Fit fell below the ordinary cover floor");
  assertCoverage(value);
}

function assertCoverFloor(value, allowNoOpFit = false) {
  assert(allowNoOpFit || !value.fit, "Normal zoom-out incorrectly restored the protected Fit state");
  assert(Math.abs(value.zoom - value.minimumZoom) <= .001, "Normal zoom-out did not stop at the ordinary cover floor");
  assertCoverage(value);
}

async function assertProtectedStart(target) {
  const value = await metrics(target);
  assertFits(value);
  const result = await target.evaluate(() => {
    const viewport = document.querySelector("#map-viewport").getBoundingClientRect();
    const picture = document.querySelector("#azmara-land-stage").getBoundingClientRect();
    const map = document.querySelector("#town-map");
    const labelsWereHidden = map.classList.contains("labels-hidden");
    map.classList.remove("labels-hidden");
    const rect = (node, name = "Protected camera element") => {
      if (!node) throw new Error(`${name} is missing`);
      const box = node.getBoundingClientRect();
      return { left: box.left, top: box.top, right: box.right, bottom: box.bottom };
    };
    const subjects = [
      ["Town Hall target", document.querySelector('[data-plot="general-01"]')],
      ["Town Hall label", document.querySelector('[data-plot="general-01"] .hotspot-label')],
      ["Town Wall target", document.querySelector('[data-plot="wall-01"]')],
      ["Town Wall label", document.querySelector('[data-plot="wall-01"] .hotspot-label')]
    ].map(([name, node]) => ({ name, ...rect(node, name) }));
    const obstacles = [".azmara-town-bar", "#azmara-side-dock", "#azmara-dock-reveal", ".azmara-phone-dock", ".azmara-dev-button"]
      .map((selector) => document.querySelector(selector))
      .filter((node) => node && !node.hidden && node.getClientRects().length && getComputedStyle(node).display !== "none" && getComputedStyle(node).visibility !== "hidden")
      .map((node) => ({ name: node.id || node.className, ...rect(node) }));
    if (labelsWereHidden) map.classList.add("labels-hidden");
    const overlaps = [];
    for (const subject of subjects) for (const obstacle of obstacles) {
      const width = Math.max(0, Math.min(subject.right, obstacle.right) - Math.max(subject.left, obstacle.left));
      const height = Math.max(0, Math.min(subject.bottom, obstacle.bottom) - Math.max(subject.top, obstacle.top));
      if (width > .5 && height > .5) overlaps.push(`${subject.name} / ${obstacle.name}`);
    }
    return {
      overlaps,
      outside: subjects.filter((box) => box.left < viewport.left - .5 || box.top < viewport.top - .5 || box.right > viewport.right + .5 || box.bottom > viewport.bottom + .5).map((box) => box.name),
      topCrop: Math.max(0, viewport.top - picture.top),
      bottomCrop: Math.max(0, picture.bottom - viewport.bottom)
    };
  });
  assert.deepEqual(result.overlaps, [], "Protected Hall/Wall target or label overlaps floating controls");
  assert.deepEqual(result.outside, [], "Protected Hall/Wall target or label starts outside the viewport");
  assert(result.bottomCrop + 1 >= result.topCrop, "Protected start crop is not biased to the bottom");
  return value;
}

function assertCoverage(value) {
  const layer = value.landscape;
  assert(layer.x <= value.viewport.x + 2 && layer.y <= value.viewport.y + 2 && layer.right >= value.viewport.right - 2 && layer.bottom >= value.viewport.bottom - 2, "Landscape leaves a blank viewport margin");
}

async function assertPaint(target) {
  const result = await target.locator("#world-landscape").evaluate(async (svg) => {
    // Rasterize the exact locked land-stage image currently displayed. Replacing
    // it with a retired procedural terrain asset would make this coverage test
    // pass against artwork that the player never sees.
    window.__azmaraQaTerrainDataUrls ||= new Map();
    const land = document.querySelector("#azmara-land-stage");
    if (!land) throw new Error("Locked land-stage image is missing");
    const source = new URL(land.href.baseVal, location.href).href;
    if (!window.__azmaraQaTerrainDataUrls.has(source)) window.__azmaraQaTerrainDataUrls.set(source, (async () => {
      const response = await fetch(source);
      if (!response.ok) throw new Error("Terrain artwork fetch failed: " + response.status);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    })());
    const dataUrl = await window.__azmaraQaTerrainDataUrls.get(source);
    const clone = svg.cloneNode(true);
    const viewport = document.querySelector("#map-viewport");
    const world = svg.viewBox.baseVal;
    const scale = svg.getBoundingClientRect().width / world.width;
    // Rasterize the actual visible area at native CSS-pixel size. Downsampling
    // the entire map creates artificial alpha gutters at reflected tile joins.
    clone.setAttribute("viewBox", `${world.x + viewport.scrollLeft / scale} ${world.y + viewport.scrollTop / scale} ${viewport.clientWidth / scale} ${viewport.clientHeight / scale}`);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", String(viewport.clientWidth));
    clone.setAttribute("height", String(viewport.clientHeight));
    clone.querySelectorAll("image").forEach((image) => image.setAttribute("href", dataUrl));
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml" }));
    const image = new Image();
    try {
      image.src = url;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const gaps = [];
      for (let y = 1; y < canvas.height - 1; y += 1) {
        for (let x = 1; x < canvas.width - 1; x += 1) {
          const alpha = pixels[(y * canvas.width + x) * 4 + 3];
          if (alpha < 250 && gaps.length < 8) gaps.push({ x, y, alpha });
        }
      }
      return {
        presentation: document.querySelector("#town-map").dataset.presentation,
        patterns: [...svg.querySelectorAll("pattern")].map((pattern) => pattern.id),
        obsolete: svg.querySelectorAll("#land-grain, #water-grain, #outland-palms, #outland-light, #water-light").length,
        filler: [...svg.children].filter((element) => !["defs", "image"].includes(element.localName) && !element.matches(".painted-margin, .dirt-lanes, .terrain-plot")).map((element) => element.localName + "#" + element.id),
        gaps
      };
    } finally { URL.revokeObjectURL(url); }
  });
  assert.deepEqual(result.patterns, [], "Unexpected patterned procedural outland remains in the rendered SVG");
  assert.equal(result.obsolete, 0, "Old procedural outland definitions remain in the rendered SVG");
  assert.deepEqual(result.filler, [], "Extra procedural ground or shoreline remains outside the painted town");
  assert.deepEqual(result.gaps, [], "Painted terrain leaves transparent pixels at finite camera bounds or screen-ratio margins");
}

async function assertTerrainArt(target, value = null) {
  const camera = value || await metrics(target);
  const profile = presentationProfile(camera);
  const art = profile.art;
  assert.equal(await target.locator("#world-landscape > image#azmara-land-stage").count(), 1, "Locked land-stage image is missing or duplicated");
  assert.equal(await target.locator("#world-landscape > image").count(), 1, "An extra terrain or facility image was added over the locked land");
  assert.equal(await target.locator("#world-landscape pattern, #world-landscape mask").count(), 0, "Procedural terrain or a fading mask was added to the locked land");
  const loaded = await target.locator("#azmara-land-stage").evaluate(async (element) => {
    const source = element.href.baseVal;
    const image = new Image();
    image.src = new URL(source, location.href).href;
    await image.decode();
    const box = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const registry = window.AzmaraLandStages;
    const stage = registry.forStage(Number(document.body.dataset.townStage));
    return {
      svgImage: element instanceof SVGImageElement,
      source,
      expectedSource: stage.src,
      width: image.naturalWidth,
      height: image.naturalHeight,
      expectedWidth: registry.width,
      expectedHeight: registry.height,
      artX: element.x.baseVal.value,
      artY: element.y.baseVal.value,
      artWidth: element.width.baseVal.value,
      artHeight: element.height.baseVal.value,
      x: box.x,
      y: box.y,
      renderedWidth: box.width,
      renderedHeight: box.height,
      aspect: element.getAttribute("preserveAspectRatio"),
      visible: style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0
    };
  });
  assert(loaded.svgImage && loaded.source && loaded.width > 0 && loaded.height > 0 && loaded.visible, "Locked land artwork is missing, unloaded or hidden");
  const scale = camera.map.width / camera.worldViewBox.width;
  assert.equal(loaded.source, loaded.expectedSource, "Active land asset does not match the real Town Hall stage rule");
  assert.equal(loaded.source, art.source, "Stage 1 land asset does not match its registered presentation");
  assert.equal(loaded.width, loaded.expectedWidth, "Locked land bitmap width changed");
  assert.equal(loaded.height, loaded.expectedHeight, "Locked land bitmap height changed");
  assert.equal(loaded.aspect, art.aspect, "Land scaling no longer preserves the approved uniform proportions");
  assert(Math.abs(loaded.artX - art.x) <= 0.01 && Math.abs(loaded.artY - art.y) <= 0.01 && Math.abs(loaded.artWidth - art.width) <= 0.01 && Math.abs(loaded.artHeight - art.height) <= 0.01, "Locked land registration changed");
  assert(Math.abs(loaded.x - camera.map.x - (loaded.artX - camera.worldViewBox.x) * scale) <= 2 && Math.abs(loaded.y - camera.map.y - (loaded.artY - camera.worldViewBox.y) * scale) <= 2, "Locked land artwork shifted from its world coordinates");
  assert(Math.abs(loaded.renderedWidth - loaded.artWidth * scale) <= 2 && Math.abs(loaded.renderedHeight - loaded.artHeight * scale) <= 2, "Locked land artwork's world footprint changed");
  assert(Math.abs(loaded.renderedWidth / loaded.renderedHeight - loaded.width / loaded.height) < 0.004, "Locked land PNG is distorted inside its SVG image");
}

async function coverageAtExtremes(target) {
  const original = await metrics(target);
  for (const [x, y] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
    await target.locator("#map-viewport").evaluate((viewport, point) => viewport.scrollTo({ left: point.x * (viewport.scrollWidth - viewport.clientWidth), top: point.y * (viewport.scrollHeight - viewport.clientHeight), behavior: "instant" }), { x, y });
    await settle(target);
    const value = await assertGeometry(target);
    assertCoverage(value);
    assert(Math.abs(value.left - x * (value.scrollWidth - value.clientWidth)) <= 2, "Horizontal pan edge is unreachable");
    assert(Math.abs(value.top - y * (value.scrollHeight - value.clientHeight)) <= 2, "Vertical pan edge is unreachable");
    const { core, frame } = presentationProfile(value);
    const scale = value.core.width / core.width;
    const visibleX = value.worldViewBox.x + value.left / scale;
    const visibleY = value.worldViewBox.y + value.top / scale;
    const reachable = presentationProfile(value).desktop ? value.worldViewBox : frame;
    if (value.scrollWidth > value.clientWidth + 2) assert(visibleX >= reachable.x - 2 && visibleX + value.clientWidth / scale <= reachable.x + reachable.width + 2, "Horizontal pan reaches off-town coordinates");
    if (value.scrollHeight > value.clientHeight + 2) assert(visibleY >= reachable.y - 2 && visibleY + value.clientHeight / scale <= reachable.y + reachable.height + 2, "Vertical pan reaches off-town coordinates");
  }
  await target.locator("#map-viewport").evaluate((viewport, point) => viewport.scrollTo({ left: point.x, top: point.y, behavior: "instant" }), { x: original.left, y: original.top });
  await settle(target);
}

function assertPose(value, expected, message) {
  for (const field of ["left", "top"]) assert(Math.abs(value[field] - expected[field]) <= 2, message + ": " + field);
  for (const field of ["x", "y", "width", "height"]) assert(Math.abs(value.core[field] - expected.core[field]) <= 2, message + ": core " + field);
}

function assertBothAxes(value) {
  assert(value.scrollWidth - value.clientWidth >= 44, "Zoomed map lacks meaningful horizontal pan space");
  assert(value.scrollHeight - value.clientHeight >= 44, "Zoomed map lacks meaningful vertical pan space");
}

async function assertRegistration(target) {
  const value = await metrics(target);
  const profile = presentationProfile(value);
  const results = await target.locator(".building-hotspot").evaluateAll((hotspots) => {
    const core = document.querySelector("#town-core");
    const art = core.getBoundingClientRect();
    const coreWidth = Number(core.dataset.coreWidth);
    const coreHeight = Number(core.dataset.coreHeight);
    return hotspots.map((hotspot) => {
      const box = hotspot.getBoundingClientRect();
      const x = parseFloat(hotspot.style.getPropertyValue("--x")) / 100;
      const y = parseFloat(hotspot.style.getPropertyValue("--y")) / 100;
      const marker = hotspot.querySelector(".marker").getBoundingClientRect();
      return { id: hotspot.dataset.plot, kind: hotspot.dataset.kind, anchorX: Number(hotspot.dataset.x), anchorY: Number(hotspot.dataset.y), cssX: x * coreWidth, cssY: y * coreHeight, dx: Math.abs(box.x + box.width / 2 - (art.x + art.width * x)), dy: Math.abs(box.y + box.height / 2 - (art.y + art.height * y)), markerWidthDelta: Math.abs(marker.width - box.width), markerHeightDelta: Math.abs(marker.height - box.height), renderedArt: hotspot.dataset.renderedArt, childCount: hotspot.querySelector(".marker").childElementCount };
    });
  });
  assert.equal(results.length, 23);
  for (const [id, x, y] of [["general-09", 1250, 140], ["wall-01", 850, -120]]) {
    const plot = results.find((result) => result.id === id);
    assert.deepEqual([plot.anchorX, plot.anchorY], [x, y], id + " lost its approved repositioned anchor");
  }
  for (const result of results) {
    assert(Number.isFinite(result.cssX) && Number.isFinite(result.cssY) && result.cssX >= 0 && result.cssY >= 0 && result.cssX <= profile.core.width && result.cssY <= profile.core.height, `${result.id} CSS anchor is outside the locked land coordinate plane`);
    if (result.id === "general-01") {
      assert(Math.abs(result.cssX / profile.core.width - 763 / 1536) <= 0.00001 && Math.abs(result.cssY / profile.core.height - 443.5 / 1024) <= 0.00001, "Town Hall target drifted from its approved source-picture box");
    } else if (result.id === "wall-01") {
      assert(Math.abs(result.cssX / profile.core.width - 780 / 1536) <= 0.00001 && Math.abs(result.cssY / profile.core.height - 117.5 / 1024) <= 0.00001, "Town Wall target drifted from its approved source-picture box");
    }
    assert(result.dx <= 2 && result.dy <= 2, `${result.id} hotspot shifted away from its art anchor`);
    assert(result.markerWidthDelta <= 1 && result.markerHeightDelta <= 1, `${result.id} target includes invisible label-sized hit space`);
    assert.equal(result.childCount, 0, `${result.id} duplicates artwork already painted into the locked land image`);
    assert.equal(result.renderedArt, result.id === "general-01" ? "painted:general" : result.id === "wall-01" ? "painted:wall" : "painted-empty-site", `${result.id} lost its painted-land registration state`);
  }
}

async function center(target) {
  const initial = await metrics(target);
  const fitted = initial.fit;
  await target.locator("#map-viewport").evaluate((viewport) => viewport.scrollTo({ left: 0, top: 0, behavior: "instant" }));
  await menuAction(target, target.locator("#center-map"));
  await settle(target);
  const value = await metrics(target);
  if (fitted) {
    assert(Math.abs(value.left - initial.left) <= 2 && Math.abs(value.top - initial.top) <= 2, "Centre did not restore the protected start frame");
    assertFits(value);
  } else {
    const hall = await target.locator('.building-hotspot[data-plot="general-01"]').evaluate((element) => {
      const box = element.getBoundingClientRect();
      return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
    });
    assert(Math.abs(hall.x - value.viewport.x - value.clientWidth / 2) <= 2, "Centre did not restore the Town Hall's horizontal position");
    assert(Math.abs(hall.y - value.viewport.y - value.clientHeight / 2) <= 2, "Centre did not restore the Town Hall's vertical position");
  }
}

async function keyboardZoomBound(page, target, direction) {
  const before = await metrics(target);
  await target.locator("#map-viewport").focus();
  await page.keyboard.press(direction === "in" ? "+" : "-");
  await settle(target);
  const after = await metrics(target);
  assert(Math.abs(after.core.width - before.core.width) < 1 && Math.abs(after.core.height - before.core.height) < 1, `Keyboard zoom ${direction} exceeded its limit`);
}

async function keyboardPan(page) {
  await center(page);
  await page.locator("#map-viewport").focus();
  const before = await metrics(page);
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowDown");
  await settle(page);
  const after = await metrics(page);
  assert(after.left - before.left >= 50 && after.top - before.top >= 50, "Arrow keys failed to pan both axes");
}

async function openHotspot(target, buildingId, title) {
  await target.locator(`.building-hotspot[data-plot="${buildingId}"]`).evaluate((hotspot) => {
    const viewport = document.querySelector("#map-viewport");
    const box = hotspot.getBoundingClientRect();
    const view = viewport.getBoundingClientRect();
    let point = { x: viewport.clientWidth * 0.5, y: viewport.clientHeight * 0.68 };
    for (const y of [0.68, 0.82, 0.92, 0.5]) {
      const element = document.elementFromPoint(view.x + viewport.clientWidth * 0.5, view.y + viewport.clientHeight * y);
      if (element?.closest("#map-viewport")) { point = { x: viewport.clientWidth * 0.5, y: viewport.clientHeight * y }; break; }
    }
    viewport.scrollTo({
      left: viewport.scrollLeft + box.x + box.width / 2 - view.x - point.x,
      top: viewport.scrollTop + box.y + box.height / 2 - view.y - point.y,
      behavior: "instant"
    });
  });
  await settle(target);
  if (buildingId !== "general-01") {
    await clearPlotHover(target);
    const ground = (await emptyPoints(target)).find((point) => point.id === buildingId);
    assert(ground?.exposed, `${buildingId} painted ground reserve is not reachable after centring the plot`);
    await assertVisibleGround(target, [ground]);
    await target.touchscreen.tap(ground.x, ground.y);
  } else {
    await target.locator(`.building-hotspot[data-plot="${buildingId}"]`).click();
  }
  await target.locator("#detail-panel").waitFor({ state: "visible" });
  assert.equal(await target.locator("#panel-title").textContent(), title);
}

async function closeWithEscape(page, target, buildingId) {
  await page.keyboard.press("Escape");
  await target.locator("#detail-panel").waitFor({ state: "hidden" });
  await settle(target);
  assert.equal(await target.locator("#map-viewport").evaluate(() => document.activeElement.dataset.plot), buildingId, "Dialog failed to restore hotspot focus");
}

// Counts labels disclosed by the preference even when their plots are currently
// cropped. DEC-105 does not require all 23 plots to share one viewport.
async function disclosedLabels(target) {
  return target.locator(".hotspot-label").evaluateAll((labels) => labels.filter((label) => {
    const style = getComputedStyle(label);
    const box = label.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0 && box.width > 0 && box.height > 0;
  }).length);
}

async function assertTransientLabels(target) {
  assert.equal(await target.locator("#town-map").evaluate((map) => map.classList.contains("labels-hidden")), true, "Default labels are pinned instead of hover/focus-only");
  assert.equal(await target.locator("#toggle-labels").getAttribute("aria-pressed"), "false");
  const unexpected = await target.locator(".hotspot-label").evaluateAll((labels) => labels.filter((label) => {
    const style = getComputedStyle(label);
    const box = label.getBoundingClientRect();
    const visible = style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0 && box.width > 0 && box.height > 0;
    return visible && !label.closest(".building-hotspot").matches(":hover, :focus-visible");
  }).map((label) => label.closest(".building-hotspot").dataset.plot));
  // Chromium can reinstate native sticky touch-hover on the last tapped plot
  // when keyboard input starts. Both real hover and keyboard focus may label.
  assert.deepEqual(unexpected, [], "A default label is visible without real hover or keyboard focus");
}

async function clearPlotHover(page, target = page) {
  // The map now fills the viewport: (2,2) can hover a zoomed plot. Park on
  // the persistent four-dot control instead, including inside preview frames.
  await (await actionsTrigger(target)).hover();
  await target.locator("#map-viewport").focus();
  await settle(target);
}

async function emptyPoints(target) {
  return target.locator('#town-core .building-hotspot[data-occupied="false"]').evaluateAll((hotspots) => hotspots.map((hotspot) => {
    const target = hotspot.getBoundingClientRect();
    const marker = hotspot.querySelector(".marker");
    const box = marker.getBoundingClientRect();
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    return {
      id: hotspot.dataset.plot,
      occupied: hotspot.dataset.occupied,
      x,
      y,
      exposed: document.elementFromPoint(x, y)?.closest(".building-hotspot") === hotspot,
      insideTarget: box.x >= target.x - 1 && box.y >= target.y - 1 && box.right <= target.right + 1 && box.bottom <= target.bottom + 1,
      imageDx: 0,
      imageDy: 0,
      childCount: marker.childElementCount,
      renderedArt: hotspot.dataset.renderedArt
    };
  }));
}

async function assertVisibleGround(page, points) {
  const ids = points.map((point) => point.id);
  const registrations = await page.locator('#town-core .building-hotspot[data-occupied="false"]').evaluateAll((hotspots, ids) => hotspots.filter((hotspot) => ids.includes(hotspot.dataset.plot)).map((hotspot) => ({ id: hotspot.dataset.plot, childCount: hotspot.querySelector(".marker").childElementCount, renderedArt: hotspot.dataset.renderedArt })), ids);
  assert.deepEqual(registrations.map((item) => item.id).sort(), [...ids].sort(), "A visible painted empty site lost its semantic hotspot");
  for (const registration of registrations) {
    assert.equal(registration.childCount, 0, `${registration.id} gained duplicate DOM plot artwork over the locked land image`);
    assert.equal(registration.renderedArt, registration.id === "wall-01" ? "painted:wall" : "painted-empty-site", `${registration.id} lost its painted-land registration`);
  }
}

async function coverFloorMarkerHits(page) {
  await clearPlotHover(page);
  assert.equal(await page.locator("#town-core .empty-slot-plus, #town-core .plot-plus").count(), 0, "Town empty plots retain removed plus-symbol overlays");
  const ground = await emptyPoints(page);
  assert.deepEqual(ground.map((point) => point.id).sort(), expectedPlots.filter(([id]) => id !== "general-01").map(([id]) => id).sort(), "Each of the 22 empty plots must draw its neutral ground or dedicated reserve");
  for (const point of ground) assert(point.occupied === "false" && point.insideTarget && point.imageDx <= 1 && point.imageDy <= 1, `${point.id} ground art is not inside its empty-plot target`);
  const boxes = await page.locator("#town-core .building-hotspot").evaluateAll((elements) => elements.map((element) => {
    const b = element.getBoundingClientRect();
    const marker = element.querySelector(".marker").getBoundingClientRect();
    const hit = document.elementFromPoint(marker.x + marker.width / 2, marker.y + marker.height / 2);
    return { id: element.dataset.plot, kind: element.dataset.kind, x: b.x, y: b.y, right: b.right, bottom: b.bottom, width: b.width, height: b.height, exposed: hit?.closest(".building-hotspot")?.dataset.plot === element.dataset.plot };
  }));
  assert.deepEqual(boxes.map(({ id, kind }) => [id, kind]).sort(), [...expectedPlots].sort(), "Cover-floor map has the wrong 23 plots");
  const view = (await metrics(page)).viewport;
  for (const box of boxes) {
    assert(box.width >= 44 && box.height >= 44, `${box.id} cover-floor target is undersized`);
  }
  // Fixed plot anchors can be closer than the mandatory 44px phone envelopes.
  // The centre-hit/tap checks below are the interaction contract: each target
  // must remain independently reachable without moving an approved anchor.
  const exposed = boxes.filter((box) => box.exposed && box.x >= view.x && box.y >= view.y && box.right <= view.right && box.bottom <= view.bottom);
  assert(exposed.length > 0, "Ordinary cover exposes no interactive plot target");
  const exposedGround = ground.filter((point) => point.exposed && point.x >= view.x && point.x <= view.right && point.y >= view.y && point.y <= view.bottom);
  await assertVisibleGround(page, exposedGround);
  console.log(`CHECK ordinary cover exposes ${exposed.length}/23 plot targets; cropped targets remain reachable by panning`);
  for (const { id } of boxes.filter((box) => box.id === "general-01" ? box.exposed : ground.find((point) => point.id === box.id).exposed)) {
    await clearPlotHover(page);
    const hotspot = page.locator(`.building-hotspot[data-plot="${id}"]`);
    const box = await hotspot.boundingBox();
    assert(box.width >= 44 && box.height >= 44, `${id} cover-floor hit target is undersized`);
    const name = await hotspot.getAttribute("aria-label");
    assert(name && name.length > 10, `${id} lost its accessible name at ordinary cover`);
    const marker = await hotspot.locator(".marker").boundingBox();
    const groundPoint = ground.find((candidate) => candidate.id === id);
    const point = groundPoint ? { x: groundPoint.x, y: groundPoint.y } : { x: marker.x + marker.width / 2, y: marker.y + marker.height / 2 };
    const hit = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest(".building-hotspot")?.dataset.plot, point);
    assert.equal(hit, id, `${id} cover-floor marker is intercepted or misregistered`);
    await page.touchscreen.tap(point.x, point.y);
    await page.locator("#detail-panel").waitFor({ state: "visible" });
    const title = (await page.locator("#panel-title").textContent()).trim();
    const expectedTitle = id === "general-01" ? "Town Hall" : id.startsWith("general-") ? `General plot ${id.slice(-2)}` : id === "wall-01" ? "Wall plot" : id.startsWith("harbour-") ? `Caravan plot ${Number(id.slice(-2))}` : "Freight depot plot";
    assert.equal(title, expectedTitle, `${id} cover-floor tap opened the wrong plot dialog`);
    assert(name.includes(title), `${id} lost its full accessible title`);
    if (id === "general-01") assert.equal(title, "Town Hall");
    else assert.equal(await page.locator("#upgrade-building").count(), 0, `${id} empty plot invents a construction action`);
    await closeWithEscape(page, page, id);
  }
}

async function swipe(page, context, axis, expectMovement = true, centerFirst = true) {
  if (centerFirst) await center(page);
  const before = await metrics(page);
  const points = await page.locator("#map-viewport").evaluate((viewport, axis) => {
    const box = viewport.getBoundingClientRect();
    const distance = Math.min(100, (axis === "x" ? box.width : box.height) * 0.27);
    const isMapBackground = (x, y) => {
      const element = document.elementFromPoint(x, y);
      return element?.closest("#map-viewport") && !element.closest("button");
    };
    // Keep the former preferred positions, then sample more of the actual
    // painted playfield. The enlarged desktop layout can place a large Hall
    // target across the old central grid at maximum zoom; the gesture still
    // must begin on unobstructed map background, never on a button or HUD.
    for (const yFraction of [0.72, 0.62, 0.82, 0.52, 0.42, 0.32, 0.22, 0.9]) {
      for (const xFraction of [0.7, 0.6, 0.8, 0.5, 0.4, 0.3, 0.2, 0.9]) {
        const start = { x: box.x + box.width * xFraction, y: box.y + box.height * yFraction };
        const end = { x: start.x - (axis === "x" ? distance : 0), y: start.y - (axis === "y" ? distance : 0) };
        // Native scrolling keeps its starting target even when the finger crosses an overlay.
        if (isMapBackground(start.x, start.y)) return { start, end };
      }
    }
    return null;
  }, axis);
  assert(points, `No unobstructed map area available for ${axis} touch gesture`);
  const session = await context.newCDPSession(page);
  try {
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ ...points.start, id: 1 }] });
    for (let step = 1; step <= 8; step += 1) {
      const fraction = step / 8;
      await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: points.start.x + (points.end.x - points.start.x) * fraction, y: points.start.y + (points.end.y - points.start.y) * fraction, id: 1 }] });
      await page.waitForTimeout(20);
    }
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await page.waitForTimeout(250);
  } finally {
    await session.detach();
  }
  const after = await metrics(page);
  const delta = axis === "x" ? after.left - before.left : after.top - before.top;
  if (expectMovement) {
    const range = axis === "x" ? before.scrollWidth - before.clientWidth : before.scrollHeight - before.clientHeight;
    if (range >= 44) assert(delta >= Math.min(20, range / 3), `${axis === "x" ? "Horizontal" : "Vertical"} touch swipe did not move the map (delta ${delta})`);
    else assert(Math.abs(delta) <= range + 2, "Touch swipe exceeded the finite axis range");
  } else assertPose(after, before, "A touch gesture moved the locked Fit camera");
  assert.equal(await page.locator("#detail-panel").evaluate((dialog) => dialog.open), false, "A pan gesture accidentally selected a building");
}

async function assertFitEdgesAndRelease(page, context) {
  await clearPlotHover(page);
  const before = await assertProtectedStart(page);
  assert(before.fit && before.overflow !== "hidden", "Fit does not expose the finite picture for panning");
  await coverageAtExtremes(page);
  await page.locator("#map-viewport").focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowDown");
  await settle(page);
  const keyboard = await metrics(page);
  assert(!keyboard.fit, "Arrow-key panning did not release Fit");
  if (before.scrollWidth - before.clientWidth > 2 || before.scrollHeight - before.clientHeight > 2) {
    assert(Math.abs(keyboard.left - before.left) > 2 || Math.abs(keyboard.top - before.top) > 2, "Arrow keys did not move along the cropped picture axis");
  }
  await menuAction(page, page.locator("#toggle-map-view"));
  const restored = await metrics(page);
  assertFits(restored);
  await assertProtectedStart(page);
  assert(Math.abs(restored.left - before.left) <= 2 && Math.abs(restored.top - before.top) <= 2, "Fit control did not restore the protected start frame");
  const touchAxis = before.scrollWidth - before.clientWidth > 2 ? "x" : "y";
  await swipe(page, context, touchAxis, true, false);
  assert(!(await metrics(page)).fit, "Touch panning did not release Fit");
  await menuAction(page, page.locator("#toggle-map-view"));
  await assertProtectedStart(page);
  await clearPlotHover(page);
  console.log("CHECK protected Fit, all four picture edges, and keyboard/touch release");
}

async function load(page) {
  captureErrors(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const response = await page.goto(base);
  assert.equal(response?.status(), 200);
  await page.locator("#world-landscape").waitFor({ state: "visible" });
  await page.locator("#town-core img").evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
  await settle(page);
  await assertPaint(page);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  let groups = 0;
  try {
    for (const [width, height] of sizes) {
      const context = await browser.newContext({ viewport: { width, height }, hasTouch: true, isMobile: width <= 660 });
      try {
        const page = await context.newPage();
        await load(page);
        const storedBefore = await page.evaluate((storageKey) => localStorage.getItem(storageKey), key);
        const legacyBefore = await page.evaluate((storageKey) => localStorage.getItem(storageKey), legacyKey);
        await assertProtectedStart(page);
        await assertFitEdgesAndRelease(page, context);
        assertCoverFloor(await zoomToBound(page, "out"), true);
        await keyboardZoomBound(page, page, "out");
        const coverFloorWidth = (await metrics(page)).core.width;
        await page.keyboard.press("+");
        await settle(page);
        assert((await metrics(page)).core.width > coverFloorWidth + 1, "Keyboard plus did not enlarge the town from the ordinary cover floor");
        await page.keyboard.press("-");
        await settle(page);
        assertCoverFloor(await assertGeometry(page));
        await assertRegistration(page);
        await coverFloorMarkerHits(page);
        await clearPlotHover(page);
        await assertTransientLabels(page);
        assert.equal(await page.locator("#toggle-labels").getAttribute("aria-pressed"), "false");
        await page.keyboard.press("Tab");
        await settle(page);
        assert.equal(await page.locator("#map-viewport").evaluate(() => document.activeElement.dataset.plot), "general-01", "Tab did not reach the first plot from the map viewport");
        await assertTransientLabels(page);
        const focusedTitle = page.locator('.building-hotspot[data-plot="general-01"] .hotspot-title');
        assert(await focusedTitle.isVisible(), "Focused plot lost its full label at compact cover floor");
        assert.equal(await focusedTitle.textContent(), "Town Hall");
        await clearPlotHover(page);
        if (width <= 390) {
          await menuAction(page, page.locator("#toggle-labels"));
          assert.equal(await disclosedLabels(page), 23, "Explicit Show failed to disclose every registered compact plot label; cropped labels may remain offscreen");
          assert.equal(await page.locator("#toggle-labels").getAttribute("aria-pressed"), "true");
          await menuAction(page, page.locator("#toggle-labels"));
          assert.equal(await page.locator("#toggle-labels").getAttribute("aria-pressed"), "false");
        }
        assertBothAxes(await zoomToBound(page, "in"));
        await clearPlotHover(page);
        assert.equal(await disclosedLabels(page), 0, "Closer zoom unexpectedly pinned hover/focus-only labels");
        if (width <= 390) {
          await menuAction(page, page.locator("#toggle-labels"));
          assert.equal(await disclosedLabels(page), 23, "Closer zoom failed to disclose every registered plot label; cropped labels may remain offscreen");
        }
        await keyboardZoomBound(page, page, "in");
        await keyboardPan(page);
        await assertRegistration(page);
        await swipe(page, context, "x");
        await swipe(page, context, "y");
        await center(page);
        await openHotspot(page, "general-01", "Town Hall");
        await closeWithEscape(page, page, "general-01");
        await menuAction(page, page.locator("#zoom-out"));
        await settle(page);
        await assertRegistration(page);
        await openHotspot(page, "general-02", "General plot 02");
        assert.equal(await page.locator("#upgrade-building").count(), 0, "Empty general plot invents construction");
        await closeWithEscape(page, page, "general-02");
        assert.equal(await page.evaluate((storageKey) => localStorage.getItem(storageKey), key), storedBefore, "Camera or dialog controls changed game progress");
        assert.equal(await page.evaluate((storageKey) => localStorage.getItem(storageKey), legacyKey), legacyBefore, "Camera changed legacy v1 progress");
        console.log(`PASS protected start, ordinary cover floor, zoom bounds, keyboard, two-axis touch, anchors and dialogs ${width}x${height}`);
        groups += 1;
      } finally {
        await context.close();
      }
    }

    for (const [width, height] of [[390, 844], [1440, 900], [390, 1066], [2560, 900]]) {
      const context = await browser.newContext({ viewport: { width, height }, hasTouch: true, isMobile: width <= 660 });
      try {
        const now = Date.now();
        const saved = { version: 3, layoutId: "town-23-v1", townName: "Close camera town", resources: { coins: 1900, timber: 600, stone: 400 }, hallLevel: 4, construction: { buildingId: "general-01", toLevel: 5, startedAt: now, endsAt: now + 10000 } };
        // Match the existing app's canonical save order and serialization;
        // loading and camera actions must preserve real persisted bytes.
        const savedRaw = JSON.stringify(saved);
        const legacy = JSON.stringify({ version: 1, townName: "Retained old town", resources: { coins: 9000 }, levels: { council: 9 } });
        await context.addInitScript(({ now, key, legacyKey, savedRaw, legacy, origin }) => {
          Date.now = () => now;
          if (location.origin === origin) {
            localStorage.setItem(key, savedRaw);
            localStorage.setItem(legacyKey, legacy);
          }
        }, { now, key, legacyKey, savedRaw, legacy, origin: new URL(base).origin });
        const page = await context.newPage();
        await load(page);
        const before = await assertGeometry(page);
        assertFits(before);
        await assertProtectedStart(page);
        const stateBefore = await page.evaluate((key) => localStorage.getItem(key), key);
        assert.equal(stateBefore, savedRaw, "Artwork loading rewrote valid v3 progress bytes");
        assert.deepEqual(JSON.parse(stateBefore), saved, "Close-view fixture did not retain valid v3 progress");
        const hall = page.locator('.plot-marker[data-plot="general-01"]');
        const initialHall = await hall.boundingBox();
        const toggle = page.locator("#toggle-map-view");
        assert.equal(await toggle.getAttribute("aria-label"), "Inspect town detail");
        assert.equal((await toggle.textContent()).trim(), "Inspect");
        await clearPlotHover(page);
        if (screenshotDirectory) {
          await page.screenshot({ path: path.join(screenshotDirectory, `current-${width}x${height}-fit.png`), scale: "css" });
          if ((width === 390 && height === 844) || (width === 1440 && height === 900)) {
            await actions(page, true);
            await page.screenshot({ path: path.join(screenshotDirectory, `current-${width}x${height}-menu.png`), scale: "css" });
            await actions(page, false);
          }
        }
        await menuAction(page, toggle);
        await settle(page);
        const closer = await assertGeometry(page);
        console.log(`CHECK Inspect scale ${width}x${height}: ${(closer.core.width / before.core.width).toFixed(3)}x`);
        // Protected Fit can already be larger than ordinary cover to clear the
        // floating controls. Inspect still has to provide a visible detail step,
        // but it is intentionally modest rather than the retired abrupt 2x jump.
        assert(closer.core.width > before.core.width * 1.15, "Inspect view does not materially enlarge the town");
        await coverageAtExtremes(page);
        await assertRegistration(page);
        assert.equal(await toggle.getAttribute("aria-label"), "Fit land picture");
        assert.equal((await toggle.textContent()).trim(), "Fit");
        const closerHall = await hall.boundingBox();
        assert(closerHall.width > initialHall.width * 1.15, "Inspect view did not enlarge the Hall artwork");
        assert(closerHall.x >= closer.viewport.x - 1 && closerHall.y >= closer.viewport.y - 1 && closerHall.x + closerHall.width <= closer.viewport.right + 1 && closerHall.y + closerHall.height <= closer.viewport.bottom + 1, "Close view clips the Hall it is meant to frame");
        assert(await hall.evaluate((element) => { const box = element.getBoundingClientRect(); return document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)?.closest(".plot-marker") === element; }), "Close view puts the Hall behind fixed UI");
        await clearPlotHover(page);
        if (screenshotDirectory) await page.screenshot({ path: path.join(screenshotDirectory, `current-${width}x${height}-close.png`), scale: "css" });
        await menuAction(page, page.locator("#toggle-labels"));
        assert.equal(await disclosedLabels(page), 23, "Close view prevents explicit label disclosure");
        await menuAction(page, toggle);
        await settle(page);
        const restored = await assertGeometry(page);
        assertFits(restored);
        await assertProtectedStart(page);
        for (const field of ["left", "top"]) assert(Math.abs(restored[field] - before[field]) <= 2, "Fit failed to restore the original protected start " + field);
        assert(Math.abs(restored.core.width - before.core.width) <= 1, "Fit failed to restore the original town scale");
        assert.equal(await disclosedLabels(page), 23, "Close/Fit erased the explicit label preference");
        assert.equal(await toggle.getAttribute("aria-label"), "Inspect town detail");
        await actions(page, true);
        await toggle.scrollIntoViewIfNeeded();
        await toggle.focus();
        await page.keyboard.press("Enter");
        await settle(page);
        assert.equal(await page.locator("#actions-menu").evaluate((dialog) => dialog.open), false, "Keyboard map action did not close the menu");
        assert.equal(await toggle.getAttribute("aria-label"), "Fit land picture", "Keyboard did not activate Inspect view");
        await actions(page, true);
        await toggle.scrollIntoViewIfNeeded();
        await toggle.focus();
        await page.keyboard.press("Enter");
        await settle(page);
        assertFits(await assertGeometry(page));
        await assertProtectedStart(page);
        assert.equal(await page.evaluate((key) => localStorage.getItem(key), key), stateBefore, "Close/Fit changed v3 name, stocks, Hall level or active queue");
        assert.equal(await page.evaluate((legacyKey) => localStorage.getItem(legacyKey), legacyKey), legacy, "Close/Fit rewrote legacy v1 progress");
        console.log(`PASS Close/Fit camera, Hall framing, labels, keyboard and preserved active queue ${width}x${height}`);
        groups += 1;
      } finally { await context.close(); }
    }

    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    try {
      // Hold only this case's game timestamp steady. smoke.cjs checks real completion.
      await context.addInitScript(({ now }) => { Date.now = () => now; }, { now: Date.now() });
      const page = await context.newPage();
      await load(page);
      await menuAction(page, page.locator("#rename-town"));
      await page.locator("#town-name-input").fill("Map legacy town");
      await page.getByRole("button", { name: "Save town name" }).click();
      await menuAction(page, page.locator('#actions-menu [data-panel="buildings"]'));
      await page.locator('.building-list-button[data-plot="general-01"]').click();
      await page.locator("#upgrade-building").click();
      await page.locator("#close-panel").click();
      const saved = await page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)), key);
      assert.equal(saved.version, 3);
      assert.equal(saved.layoutId, "town-23-v1");
      assert.equal(saved.hallLevel, 1);
      assert.deepEqual(saved.resources, { coins: 2160, timber: 630, stone: 440 });
      assert.equal(saved.construction.buildingId, "general-01");
      assertBothAxes(await zoomToBound(page, "in"));
      await page.setViewportSize({ width: 844, height: 390 });
      await page.waitForTimeout(200);
      assertBothAxes(await assertGeometry(page));
      await assertRegistration(page);
      await center(page);
      assertCoverFloor(await zoomToBound(page, "out"), true);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(200);
      assertCoverFloor(await assertGeometry(page));
      assert(await page.locator("#zoom-out").isDisabled(), "Cover-floor zoom intent was lost after orientation change");
      assert.deepEqual(await page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)), key), saved, "Zoom or orientation changed construction or resources");
      await page.reload();
      await settle(page);
      assert.deepEqual(await page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)), key), saved, "Camera update broke v3 progress on reload");
      console.log("PASS orientation, retained ordinary cover floor and v3 Town Hall construction/state compatibility");
      groups += 1;
    } finally {
      await context.close();
    }

    const review = await browser.newContext({ viewport: { width: 1440, height: 900 }, hasTouch: true });
    try {
      const page = await review.newPage();
      captureErrors(page);
      const reviewResources = [];
      page.on("response", (response) => { if (response.url().startsWith(base)) reviewResources.push({ url: response.url(), status: response.status() }); });
      await page.emulateMedia({ reducedMotion: "reduce" });
      const response = await page.goto(new URL("preview.html", base).href);
      assert.equal(response?.status(), 200);
      await page.evaluate(() => {
        const unrelated = document.createElement("iframe");
        unrelated.title = "Unrelated platform frame";
        unrelated.style.cssText = "position:absolute;width:1px;height:1px;left:0;top:0;border:0";
        document.body.prepend(unrelated);
      });
      assert((await page.locator("iframe").count()) >= 2, "Extra-frame selection regression was not exercised");
      const iframeSelector = 'iframe[title="AZMARA interactive town prototype"]';
      const iframe = await page.locator(iframeSelector).elementHandle();
      assert(iframe, "Review iframe element missing");
      const frame = await iframe.contentFrame();
      assert(frame, "Review iframe missing");
      try {
        await frame.locator("#world-landscape").waitFor({ state: "visible" });
      } catch (error) {
        console.error("Review-frame startup diagnostic:", { resources: reviewResources, errors, frame: await frame.evaluate(() => ({ url: location.href, presentation: document.querySelector("#town-map")?.dataset.presentation, terrain: Boolean(document.querySelector("#azmara-land-stage")), plots: document.querySelectorAll("#town-core .plot-marker").length })) });
        throw error;
      }
      await frame.locator("#town-core img").evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
      await settle(frame);
      assert.equal(await frame.evaluate(() => innerWidth), 390);
      await frame.evaluate(() => { window.__azmaraMapQa = "same frame runtime"; });
      const initialState = await frame.evaluate((storageKey) => localStorage.getItem(storageKey), key);
      assertBothAxes(await zoomToBound(frame, "in"));
      await clearPlotHover(page, frame);
      assert.equal(await disclosedLabels(frame), 0, "Closer zoom unexpectedly pinned labels without an explicit preference");
      await page.getByRole("button", { name: "Desktop", exact: true }).click();
      await page.waitForTimeout(200);
      assert(await frame.evaluate(() => innerWidth > 390), "Desktop switch failed to enlarge the iframe");
      assertBothAxes(await assertGeometry(frame));
      await assertRegistration(frame);
      await center(frame);
      await page.getByRole("button", { name: "Phone", exact: true }).click();
      await page.waitForTimeout(200);
      assert.equal(await frame.evaluate(() => innerWidth), 390);
      assertBothAxes(await assertGeometry(frame));
      await assertRegistration(frame);
      assert.equal(await iframe.evaluate((element, selector) => element === document.querySelector(selector), iframeSelector), true, "Review switch replaced the iframe");
      assert.equal(await frame.evaluate(() => window.__azmaraMapQa), "same frame runtime", "Review switch reloaded the iframe");
      assert.equal(await frame.evaluate((storageKey) => localStorage.getItem(storageKey), key), initialState, "Review switch altered game progress");
      assertCoverFloor(await zoomToBound(frame, "out"), true);
      console.log("PASS Phone/Desktop iframe switching preserves camera registration and runtime");
      groups += 1;
    } finally {
      await review.close();
    }

    // Reach the first detail step through the real control, without binding the
    // finite camera to an old percentage or changing its internal coordinates.
    const intermediate = await browser.newContext({ viewport: { width: 390, height: 1066 }, hasTouch: true, isMobile: true });
    try {
      const page = await intermediate.newPage();
      await load(page);
      const fit = await assertGeometry(page);
      assertFits(fit);
      await assertProtectedStart(page);
      const stateBefore = await page.evaluate((storageKey) => localStorage.getItem(storageKey), key);
      await menuAction(page, page.locator("#zoom-in"));
      await settle(page);
      const detail = await assertGeometry(page);
      assert(!detail.fit && detail.core.width > fit.core.width + 1, "First zoom step did not leave Fit and enlarge the town");
      await assertRegistration(page);
      await clearPlotHover(page);
      const ground = (await emptyPoints(page)).filter((point) => point.exposed);
      assert(ground.length > 0, "Intermediate camera exposes no painted ground reserves to inspect");
      await assertVisibleGround(page, ground);
      await coverageAtExtremes(page);
      for (const [id] of expectedPlots) {
        const title = id === "general-01" ? "Town Hall" : id.startsWith("general-") ? `General plot ${id.slice(-2)}` : id === "wall-01" ? "Wall plot" : id.startsWith("harbour-") ? `Caravan plot ${Number(id.slice(-2))}` : "Freight depot plot";
        await openHotspot(page, id, title);
        await closeWithEscape(page, page, id);
      }
      await menuAction(page, page.locator("#toggle-map-view"));
      await settle(page);
      assertPose(await metrics(page), fit, "Fit did not restore the tall-phone view after exploring all plots");
      assert.equal(await page.evaluate((storageKey) => localStorage.getItem(storageKey), key), stateBefore, "Intermediate plot exploration changed town progress");
      console.log("PASS finite intermediate zoom, all 22 painted-ground dialogs, Hall and tall-phone Fit restore");
      groups += 1;
    } finally { await intermediate.close(); }

    const pinch = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    try {
      const page = await pinch.newPage();
      await load(page);
      const cameraBefore = await page.locator("#map-zoom-level").textContent();
      const stateBefore = await page.evaluate((storageKey) => localStorage.getItem(storageKey), key);
      const nativeScale = await page.evaluate(() => visualViewport.scale);
      const session = await pinch.newCDPSession(page);
      try {
        await session.send("Input.synthesizePinchGesture", { x: 200, y: 470, scaleFactor: 1.25, relativeSpeed: 500, gestureSourceType: "touch" });
        await page.waitForTimeout(250);
      } finally { await session.detach(); }
      assert(await page.evaluate((before) => visualViewport.scale > before + 0.05, nativeScale), "Native browser pinch zoom was disabled");
      assert.equal(await page.locator("#map-zoom-level").textContent(), cameraBefore, "Native page pinch incorrectly replaced the map camera scale");
      assert.equal(await page.evaluate((storageKey) => localStorage.getItem(storageKey), key), stateBefore, "Native page pinch changed town progress");
      console.log("PASS native Chromium page pinch remains distinct from map camera zoom");
      groups += 1;
    } finally { await pinch.close(); }

    assert.deepEqual(errors, [], "Captured browser errors");
    console.log(`${groups} map-control groups passed; simulated Chromium gestures only, no real-device claim.`);
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); if (errors.length) console.error("Captured errors:", errors); process.exitCode = 1; });
