"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const prototype = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(prototype, "app.js"), "utf8");
const html = fs.readFileSync(path.join(prototype, "index.html"), "utf8");
const styles = fs.readFileSync(path.join(prototype, "design-shell.css"), "utf8");

const SOURCE_WIDTH = 1536;
const SOURCE_HEIGHT = 1024;
const SOURCE_BOXES = Object.freeze({
  wall: Object.freeze({ left: 740, top: 95, right: 820, bottom: 140 }),
  hall: Object.freeze({ left: 668, top: 375, right: 858, bottom: 512 })
});

function near(actual, expected, message, tolerance = 1e-7) {
  assert(Math.abs(actual - expected) <= tolerance,
    `${message}: expected ${expected}, received ${actual}`);
}

function functionBody(source, name) {
  const marker = `function ${name}(`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `Missing runtime hook: ${name}()`);
  const open = source.indexOf("{", start + marker.length);
  assert.notEqual(open, -1, `Missing body for runtime hook: ${name}()`);
  let depth = 0;
  for (let index = open; index < source.length; index++) {
    if (source[index] === "{") depth++;
    if (source[index] === "}") {
      depth--;
      if (!depth) return source.slice(start, index + 1);
    }
  }
  assert.fail(`Unclosed body for runtime hook: ${name}()`);
}

function overlaps(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function projectBox(box, scale, scroll) {
  return {
    left: box.left * scale - scroll.x,
    top: box.top * scale - scroll.y,
    right: box.right * scale - scroll.x,
    bottom: box.bottom * scale - scroll.y
  };
}

function labelBox(control, width) {
  return {
    left: (control.left + control.right - width) / 2,
    top: control.bottom + 5,
    right: (control.left + control.right + width) / 2,
    bottom: control.bottom + 33
  };
}

function coverScale(picture, viewport) {
  return Math.max(viewport.width / picture.width, viewport.height / picture.height);
}

function panRange(picture, viewport, scale) {
  return {
    x: Math.max(0, picture.width * scale - viewport.width),
    y: Math.max(0, picture.height * scale - viewport.height)
  };
}

function centredHorizontalScroll(picture, viewport, scale) {
  return panRange(picture, viewport, scale).x / 2;
}

function safeAreaFromControls(fixture) {
  const padding = 8;
  const safe = {
    left: padding,
    top: padding,
    right: fixture.viewport.width - padding,
    bottom: fixture.viewport.height - padding,
    viewportWidth: fixture.viewport.width,
    viewportHeight: fixture.viewport.height
  };
  for (const control of fixture.controls) {
    if (control.id === "town-bar") safe.top = Math.max(safe.top, control.bottom + padding);
    if (control.id === "side-dock" || control.id === "dock-reveal") {
      safe.left = Math.max(safe.left, control.right + padding);
    }
    if (control.id === "phone-dock") safe.bottom = Math.min(safe.bottom, control.top - padding);
    if (control.id === "dev") safe.right = Math.min(safe.right, control.left - padding);
  }
  safe.width = safe.right - safe.left;
  safe.height = safe.bottom - safe.top;
  return safe;
}

/* These are the real shell rectangles described by design-shell.css. They are
   deliberately individual obstacles rather than one guessed inset: the phone
   Dev button occupies only the upper-right, while its town bar and bottom dock
   span the usable width. */
const fixtures = [
  {
    name: "current computer",
    picture: { width: SOURCE_WIDTH, height: SOURCE_HEIGHT },
    viewport: { width: 1920, height: 900 },
    controls: [
      { id: "town-bar", left: 14, top: 12, right: 1054, bottom: 60 },
      { id: "side-dock", left: 14, top: 72, right: 100, bottom: 886 },
      { id: "dev", left: 1852, top: 12, right: 1906, bottom: 60 }
    ],
    scale: 1.25,
    scroll: { x: 0, y: 0 }
  },
  {
    name: "current phone",
    picture: { width: SOURCE_WIDTH, height: SOURCE_HEIGHT },
    viewport: { width: 390, height: 844 },
    controls: [
      { id: "town-bar", left: 8, top: 8, right: 382, bottom: 96 },
      { id: "dev", left: 334, top: 101, right: 382, bottom: 141 },
      { id: "phone-dock", left: 0, top: 776, right: 390, bottom: 844 }
    ],
    // The protected 100% start remains a uniform full-cover presentation. A
    // little extra scale is geometrically necessary because the height-fill
    // cover floor has no vertical travel and would put the gate under the bar.
    scale: 104 / 95,
    scroll: { x: null, y: 0 }
  },
  {
    name: "future wider computer master",
    picture: { width: 2048, height: 1024 },
    boxes: {
      wall: { left: 996, top: 95, right: 1076, bottom: 140 },
      hall: { left: 924, top: 375, right: 1114, bottom: 512 }
    },
    viewport: { width: 1920, height: 900 },
    controls: [
      { id: "town-bar", left: 14, top: 12, right: 1054, bottom: 60 },
      { id: "side-dock", left: 14, top: 72, right: 100, bottom: 886 },
      { id: "dev", left: 1852, top: 12, right: 1906, bottom: 60 }
    ],
    scale: 0.9375,
    scroll: { x: 0, y: 0 }
  },
  {
    name: "future wider phone master",
    picture: { width: 2048, height: 1024 },
    boxes: {
      wall: { left: 996, top: 95, right: 1076, bottom: 140 },
      hall: { left: 924, top: 375, right: 1114, bottom: 512 }
    },
    viewport: { width: 390, height: 844 },
    controls: [
      { id: "town-bar", left: 8, top: 8, right: 382, bottom: 96 },
      { id: "dev", left: 334, top: 101, right: 382, bottom: 141 },
      { id: "phone-dock", left: 0, top: 776, right: 390, bottom: 844 }
    ],
    scale: 104 / 95,
    scroll: { x: null, y: 0 }
  }
];

for (const fixture of fixtures) {
  const boxes = fixture.boxes || SOURCE_BOXES;
  const floor = coverScale(fixture.picture, fixture.viewport);
  assert(fixture.scale + 1e-9 >= floor, `${fixture.name} start must remain at least full cover`);

  const drawn = {
    width: fixture.picture.width * fixture.scale,
    height: fixture.picture.height * fixture.scale
  };
  assert(drawn.width + 1e-9 >= fixture.viewport.width,
    `${fixture.name} land must cover the full viewport width`);
  assert(drawn.height + 1e-9 >= fixture.viewport.height,
    `${fixture.name} land must cover the full viewport height`);
  near(drawn.width / drawn.height, fixture.picture.width / fixture.picture.height,
    `${fixture.name} must preserve the source aspect ratio`);

  const maximum = panRange(fixture.picture, fixture.viewport, fixture.scale);
  const scroll = {
    x: fixture.scroll.x == null
      ? centredHorizontalScroll(fixture.picture, fixture.viewport, fixture.scale)
      : fixture.scroll.x,
    y: fixture.scroll.y
  };
  assert(scroll.x >= 0 && scroll.x <= maximum.x + 1e-9, `${fixture.name} horizontal start is bounded`);
  assert(scroll.y >= 0 && scroll.y <= maximum.y + 1e-9, `${fixture.name} vertical start is bounded`);

  const wall = projectBox(boxes.wall, fixture.scale, scroll);
  const hall = projectBox(boxes.hall, fixture.scale, scroll);
  const protectedContent = [
    { id: "Town Wall target", ...wall },
    { id: "Town Wall label", ...labelBox(wall, 88) },
    { id: "Town Hall target", ...hall },
    { id: "Town Hall label", ...labelBox(hall, 110) }
  ];

  for (const content of protectedContent) {
    assert(content.left >= -1e-7 && content.right <= fixture.viewport.width + 1e-7,
      `${fixture.name} ${content.id} must start inside the viewport horizontally`);
    assert(content.top >= -1e-7 && content.bottom <= fixture.viewport.height + 1e-7,
      `${fixture.name} ${content.id} must start inside the viewport vertically`);
    for (const control of fixture.controls) {
      assert(!overlaps(content, control),
        `${fixture.name} ${content.id} must not sit under ${control.id}`);
    }
  }

  const topCrop = scroll.y;
  const bottomCrop = maximum.y - scroll.y;
  assert(bottomCrop + 1e-7 >= topCrop,
    `${fixture.name} unavoidable vertical crop must be biased to the bottom`);

  // Every normal camera scale still has finite, clamped access to all four
  // picture edges. The protected start is framing only, never a pan barrier.
  for (const zoom of [1, 1.1, 1.5, 2.4]) {
    const range = panRange(fixture.picture, fixture.viewport, floor * zoom);
    for (const axis of ["x", "y"]) {
      const clamp = (value) => Math.max(0, Math.min(range[axis], value));
      near(clamp(-1), 0, `${fixture.name} reaches the leading ${axis} edge at ${zoom}`);
      near(clamp(range[axis] + 1), range[axis],
        `${fixture.name} reaches the trailing ${axis} edge at ${zoom}`);
    }
  }
}

const phone = fixtures.find((fixture) => fixture.name === "current phone");
const phoneDock = phone.controls.find((control) => control.id === "phone-dock");
near(phoneDock.left, 0, "Phone dock reaches the left edge");
near(phoneDock.right, phone.viewport.width, "Phone dock reaches the right edge");
near(phoneDock.bottom, phone.viewport.height, "Phone dock reaches the bottom edge");
assert(phone.controls.some((control) => control.id === "dev" && control.right === phone.viewport.width - 8),
  "Phone Dev button geometry must be tested at the upper-right edge");

// Static integration contract: DEC-105 must use actual visible shell geometry,
// not another guessed sidebar or hard-coded playfield rectangle.
const safeArea = functionBody(app, "startViewSafeArea");
for (const selector of [".azmara-town-bar", "#azmara-side-dock", "#azmara-dock-reveal",
  ".azmara-phone-dock", ".azmara-dev-button"]) {
  assert(safeArea.includes(selector), `startViewSafeArea() must measure ${selector}`);
}
assert.match(safeArea, /getBoundingClientRect\(\)/,
  "startViewSafeArea() must read rendered control rectangles");
assert.match(safeArea, /getClientRects\(\)\.length|getComputedStyle\(/,
  "startViewSafeArea() must ignore controls which are not actually visible");

const scaleHook = functionBody(app, "protectedStartScale");
assert.match(scaleHook, /coverScale/);
assert.match(scaleHook, /Math\.max/,
  "Protected start scale must never go below the ordinary cover floor");

const cameraHook = functionBody(app, "protectedStartCamera");
for (const field of ["left", "top", "offsetX", "offsetY", "surfaceWidth", "surfaceHeight"]) {
  assert.match(cameraHook, new RegExp(`\\b${field}\\b`),
    `protectedStartCamera() must return ${field}`);
}
const envelopeHook = functionBody(app, "protectedStartEnvelope");
assert.match(envelopeHook, /paintedControl\(["']wall["']\)/);
assert.match(envelopeHook, /paintedControl\(["']hall["']\)/);
assert.match(`${scaleHook}\n${cameraHook}`, /label/i,
  "Protected start must include both labels, not targets alone");

// Exercise the app's pure camera helpers directly with deterministic control
// rectangles. This catches integration drift which a parallel model alone
// would miss, without launching or emulating a browser.
for (const fixture of fixtures) {
  const boxes = fixture.boxes || SOURCE_BOXES;
  const paintedControl = (kind) => {
    const box = boxes[kind];
    return {
      x: (box.left + box.right) / 2,
      y: (box.top + box.bottom) / 2,
      width: box.right - box.left,
      height: box.bottom - box.top
    };
  };
  const helpers = Function("paintedControl", `"use strict";
    ${envelopeHook}
    ${scaleHook}
    ${cameraHook}
    return { protectedStartScale, protectedStartCamera };`)(paintedControl);
  const frame = { x: 0, y: 0, width: fixture.picture.width, height: fixture.picture.height };
  const safe = safeAreaFromControls(fixture);
  const floor = coverScale(fixture.picture, fixture.viewport);
  const scale = helpers.protectedStartScale(frame, floor, safe);
  const camera = helpers.protectedStartCamera(frame, scale, safe);

  near(scale, fixture.scale, `${fixture.name} runtime protected scale`);
  if (fixture.scroll.x != null) near(camera.left - camera.offsetX, fixture.scroll.x,
    `${fixture.name} runtime horizontal crop`);
  near(camera.top - camera.offsetY, fixture.scroll.y,
    `${fixture.name} runtime vertical crop`);
  assert(scale + 1e-9 >= floor, `${fixture.name} runtime must retain full cover`);
  assert(camera.surfaceWidth + 1e-9 >= fixture.viewport.width,
    `${fixture.name} runtime surface covers viewport width`);
  assert(camera.surfaceHeight + 1e-9 >= fixture.viewport.height,
    `${fixture.name} runtime surface covers viewport height`);

  const effectiveScroll = { x: camera.left - camera.offsetX, y: camera.top - camera.offsetY };
  const wall = projectBox(boxes.wall, scale, effectiveScroll);
  const hall = projectBox(boxes.hall, scale, effectiveScroll);
  const content = [
    { id: "Town Wall target", ...wall },
    { id: "Town Wall label", ...labelBox(wall, 88) },
    { id: "Town Hall target", ...hall },
    { id: "Town Hall label", ...labelBox(hall, 110) }
  ];
  for (const item of content) {
    for (const control of fixture.controls) {
      assert(!overlaps(item, control),
        `${fixture.name} runtime ${item.id} must not sit under ${control.id}`);
    }
  }
  const maximum = panRange(fixture.picture, fixture.viewport, scale).y;
  assert(maximum - effectiveScroll.y + 1e-7 >= effectiveScroll.y,
    `${fixture.name} runtime must put at least half the unavoidable crop below the scene`);
}

const initialFit = functionBody(app, "initialFitArea");
assert.match(initialFit, /coverScale/);
assert.match(initialFit, /scale:\s*coverScale/,
  "The normal player zoom floor must remain the ordinary cover scale");

const layout = functionBody(app, "layoutMap");
assert.match(layout, /startViewSafeArea\(\)/);
assert.match(layout, /protectedStartScale\(/);
assert.match(layout, /protectedStartCamera\(/);
assert.match(layout, /startCamera\?\.left/);
assert.match(layout, /startCamera\?\.top/);
assert.match(layout, /startCamera\?\.offsetX/);
assert.match(layout, /startCamera\?\.offsetY/);
assert.match(layout, /startCamera\?\.surfaceWidth/);
assert.match(layout, /startCamera\?\.surfaceHeight/);
assert.match(layout, /Math\.max\(0, Math\.min\(/,
  "Initial scrolling must remain clamped to the picture edges");

// The full-screen playfield stays under the floating chrome. The safe-area
// calculation moves only the initial camera; it does not reserve a sidebar.
assert.match(styles, /\.azmara-interface\s*\{[^}]*position:\s*fixed;[^}]*inset:\s*0;/s);
assert.match(styles, /\.azmara-side-dock\s*\{[^}]*position:\s*fixed;/s);
assert.match(styles, /\.azmara-phone-dock\s*\{[^}]*position:\s*fixed;/s);
assert.match(html, /<div class="map-viewport" id="map-viewport"/);
assert.match(html, /class="azmara-town-bar parchment"/);
assert.match(html, /class="azmara-dev-button parchment"/);

console.log("PASS DEC-105 protected start framing and all-edge camera invariants");
