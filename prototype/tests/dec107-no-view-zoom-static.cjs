"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const prototype = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(prototype, "app.js"), "utf8");
const styles = fs.readFileSync(path.join(prototype, "styles.css"), "utf8");

function section(source, from, to) {
  const start = source.indexOf(from);
  assert.notEqual(start, -1, `Missing source marker: ${from}`);
  const end = source.indexOf(to, start + from.length);
  assert.notEqual(end, -1, `Missing source marker: ${to}`);
  return source.slice(start, end);
}

for (const removed of [
  "DEV_VIEW_ZOOM_MIN",
  "DEV_VIEW_ZOOM_MAX",
  "DEV_VIEW_ZOOM_STEP",
  "DEV_VIEW_ZOOM_DEFAULT",
  "devViewZoomPercent",
  "normalizeDevViewZoom",
  "resetDevViewZoom",
  "viewZoomScale",
  "dev-view-zoom",
  "View zoom (test)",
  "dataset.devViewZoom"
]) {
  assert(!app.includes(removed), `Removed temporary view-zoom source remains: ${removed}`);
}

for (const removed of [".dev-view-zoom-test", ".dev-view-zoom-control", "#dev-view-zoom"]) {
  assert(!styles.includes(removed), `Removed temporary view-zoom style remains: ${removed}`);
}

const devPanel = section(app, 'openView.type === "dev-tools"', 'openView.type === "catalogue"');
assert.match(devPanel, /id="dev-land-stage"/, "Dev workbench lost the Land stage picker");
assert.match(devPanel, /id="dev-building-choice"/, "Dev workbench lost the approved Building picker");
assert.match(devPanel, /data-panel="supplies"/, "Dev workbench lost Test supplies");
assert.match(devPanel, /id="request-reset"/, "Dev workbench lost Reset plots");

const layoutMap = section(app, "function layoutMap(", "function stopCameraAnimation(");
assert.match(layoutMap, /const coverScale = Math\.max\(viewportWidth \/ core\.width, viewportHeight \/ core\.height\)/,
  "Normal camera lost its full-cover scale");
assert.match(layoutMap, /const startScale = protectedStartScale\(frame, coverScale, safe\)/,
  "Normal camera lost DEC-105 protected start scaling");
assert.match(layoutMap, /const fitZoom = startScale \/ coverScale/,
  "Fit no longer derives directly from the protected 100% start scale");
assert.match(layoutMap, /mapZoom = fitMap \? fitZoom : Math\.max\(minimumZoom, Math\.min\(MAX_MAP_ZOOM, mapZoom\)\)/,
  "Fit no longer uses the protected normal camera path");
assert.match(layoutMap, /const scale = coverScale \* mapZoom/,
  "Map scale still contains an additional temporary presentation multiplier");
assert.match(layoutMap, /const startCamera = fitMap \? protectedStartCamera\(frame, scale, safe\) : null/,
  "Fit no longer keeps the Town Wall and Town Hall clear of floating controls");
assert.match(layoutMap, /const offsetX = startCamera\?\.offsetX \?\? Math\.max\(0, \(viewportWidth - width\) \/ 2\)/,
  "Normal 100% framing lost its bounded fallback placement");
assert.match(layoutMap, /const offsetY = startCamera\?\.offsetY \?\? Math\.max\(0, \(viewportHeight - height\) \/ 2\)/,
  "Normal 100% framing lost its bounded fallback placement");

const mapViews = section(app, "function useMapView(", "function toggleMapLabels(");
assert.match(mapViews, /const fitZoom = protectedStartScale\(frame, coverScale, startViewSafeArea\(\)\) \/ coverScale/,
  "Town Fit no longer restores the protected normal start frame");
assert.match(mapViews, /animateCamera\(close \? closeZoom\(\) : fitZoom/,
  "Town Fit does not use the protected normal zoom");

const saveState = section(app, "function saveState(", "function announce(");
assert(!/view.?zoom/i.test(saveState), "Removed presentation state leaked into saved progress");

assert.match(styles, /\.building-hotspot\s*\{[^}]*min-width:\s*44px;[^}]*min-height:\s*44px;/s,
  "Building targets no longer retain the 44px interaction floor");
assert.match(styles, /\.scene\s*\{[^}]*background:\s*#[0-9a-f]{6};[^}]*overflow:\s*hidden;/is,
  "The scene lost its bounded background/overflow contract");

console.log("PASS DEC-107 removed temporary View zoom and retained protected 100% Fit invariants");
