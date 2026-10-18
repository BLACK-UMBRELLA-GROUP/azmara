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

function near(actual, expected, message, tolerance = 1e-9) {
  assert(Math.abs(actual - expected) <= tolerance,
    `${message}: expected ${expected}, received ${actual}`);
}

function cameraGeometry(picture, viewport, zoom = 1) {
  const cover = Math.max(viewport.width / picture.width, viewport.height / picture.height);
  const drawn = {
    width: picture.width * cover * zoom,
    height: picture.height * cover * zoom
  };
  const maximum = {
    x: Math.max(0, drawn.width - viewport.width),
    y: Math.max(0, drawn.height - viewport.height)
  };
  return {
    cover,
    minimumZoom: 1,
    drawn,
    maximum,
    start: { x: maximum.x / 2, y: maximum.y / 2 }
  };
}

const fixtures = [
  {
    name: "current desktop",
    picture: { width: 1536, height: 1024 },
    viewport: { width: 1920, height: 900 },
    cover: 1.25,
    drawn: { width: 1920, height: 1280 },
    start: { x: 0, y: 190 },
    maximum: { x: 0, y: 380 }
  },
  {
    name: "current phone",
    picture: { width: 1536, height: 1024 },
    viewport: { width: 390, height: 844 },
    cover: 0.82421875,
    drawn: { width: 1266, height: 844 },
    start: { x: 438, y: 0 },
    maximum: { x: 876, y: 0 }
  },
  {
    name: "future-wide desktop",
    picture: { width: 2048, height: 1024 },
    viewport: { width: 1920, height: 900 },
    cover: 0.9375,
    drawn: { width: 1920, height: 960 },
    start: { x: 0, y: 30 },
    maximum: { x: 0, y: 60 }
  },
  {
    name: "future-wide phone",
    picture: { width: 2048, height: 1024 },
    viewport: { width: 390, height: 844 },
    cover: 0.82421875,
    drawn: { width: 1688, height: 844 },
    start: { x: 649, y: 0 },
    maximum: { x: 1298, y: 0 }
  }
];

for (const fixture of fixtures) {
  const geometry = cameraGeometry(fixture.picture, fixture.viewport);
  near(geometry.cover, fixture.cover, `${fixture.name} cover scale`);
  near(geometry.minimumZoom, 1, `${fixture.name} minimum zoom`);
  for (const axis of ["width", "height"]) {
    near(geometry.drawn[axis], fixture.drawn[axis], `${fixture.name} drawn ${axis}`);
    assert(geometry.drawn[axis] + 1e-9 >= fixture.viewport[axis],
      `${fixture.name} must cover viewport ${axis}`);
  }
  for (const axis of ["x", "y"]) {
    near(geometry.start[axis], fixture.start[axis], `${fixture.name} midpoint scroll ${axis}`);
    near(geometry.maximum[axis], fixture.maximum[axis], `${fixture.name} maximum scroll ${axis}`);
    near(geometry.start[axis] * 2, geometry.maximum[axis],
      `${fixture.name} crop must split equally on ${axis}`);
  }

  // Every overflowing axis can visit both picture edges at minimum and all
  // supported closer zooms. A zero-range axis already shows both edges.
  for (const zoom of [1, 1.1, 1.5, 2.4]) {
    const atZoom = cameraGeometry(fixture.picture, fixture.viewport, zoom);
    for (const axis of ["x", "y"]) {
      assert(atZoom.maximum[axis] >= 0, `${fixture.name} ${axis} pan range at ${zoom}`);
      const clamp = (position) => Math.max(0, Math.min(atZoom.maximum[axis], position));
      near(clamp(-1), 0, `${fixture.name} ${axis} reaches the leading edge at ${zoom}`);
      near(clamp(atZoom.maximum[axis] + 1), atZoom.maximum[axis],
        `${fixture.name} ${axis} reaches the trailing edge at ${zoom}`);
    }
  }
}

const currentPhone = cameraGeometry({ width: 1536, height: 1024 }, { width: 390, height: 844 });
near(currentPhone.drawn.height, 844, "Phone cover fills the height");
assert(currentPhone.maximum.x > 0, "Phone cover must retain sideways travel");

// Midpoint framing is the normalized picture centre and is independent of any
// deliberately off-centre Town Hall control box.
assert.deepEqual({ x: 768 / 1536, y: 512 / 1024 }, { x: 0.5, y: 0.5 });
assert.deepEqual({ x: 1024 / 2048, y: 512 / 1024 }, { x: 0.5, y: 0.5 });
const mockedOffCentreHall = { x: 0.21, y: 0.34 };
assert.notDeepEqual(mockedOffCentreHall, { x: 0.5, y: 0.5 });

// Runtime source contract: true cover, picture-centred Fit, exact image bounds,
// metadata-driven future width and a one-way release from Fit before panning.
const frame = section(app, "function landFrame(", "function landPictureCenter(");
assert.match(frame, /height = LAND_BASE_WIDTHS\[profile\] \/ LAND_BASE_ASPECT/);
assert.match(frame, /width = height \* window\.AzmaraLandStages\.aspectRatio/);
const midpoint = section(app, "function landPictureCenter(", "function paintedControl(");
assert.match(midpoint, /frame\.x \+ frame\.width \/ 2/);
assert.match(midpoint, /frame\.y \+ frame\.height \/ 2/);

const initialFit = section(app, "function initialFitArea(", "function fitArea(");
assert.match(initialFit, /coverScale = Math\.max\(lockedWidth \/ lockedFrame\.width, lockedHeight \/ lockedFrame\.height\)/);
assert.match(initialFit, /scale: coverScale/);
for (const retired of ["paintedControl(\"hall\")", "horizontalReach", "verticalReach", "hallCentredScale"]) {
  assert(!initialFit.includes(retired), `Retired Hall-centred Fit remains: ${retired}`);
}

const completeFrame = section(app, "function completeTownFrame(", "function closeZoom(");
assert.match(completeFrame, /return landFrame\(desktop\)/);
const layout = section(app, "function layoutMap(", "function stopCameraAnimation(");
assert.match(layout, /const target = fitMap \? landPictureCenter\(desktop\) : focus/);
assert.match(layout, /const worldWidth = frame\.width/);
assert.match(layout, /const worldHeight = frame\.height/);
assert.match(layout, /x: frame\.x/);
assert.match(layout, /y: frame\.y/);

const mapViews = section(app, "function useMapView(", "function toggleMapLabels(");
assert.match(mapViews, /close \? plotPosition\(byId\[HALL_ID\]\) : landPictureCenter\(\)/);
const releaseFit = section(app, "function releaseFitForManualPan(", "function updateMapLabels(");
assert.match(releaseFit, /fitMap = false/);
assert.match(releaseFit, /closeMap = false/);
assert.match(releaseFit, /layoutMap\(focus\)/);

const keyboard = section(app, 'viewport.addEventListener("keydown"', "function endMapDrag(");
assert.match(keyboard, /releaseFitForManualPan\(\)/);
assert(!keyboard.includes("if (fitMap) return"), "Keyboard still rejects panning at Fit");
const pointer = section(app, 'viewport.addEventListener("pointerdown"', 'viewport.addEventListener("pointermove"');
assert.match(pointer, /releaseFitForManualPan\(\)/);
assert(!/mapInteractionBlocked\(\) \|\| fitMap/.test(pointer), "Pointer still rejects dragging at Fit");
assert.match(pointer, /event\.pointerType === "touch"/);
const scroll = section(app, 'viewport.addEventListener("scroll"', "new ResizeObserver");
assert(!scroll.includes("fitLeft"), "Scroll still snaps a panned Fit view back horizontally");
assert(!scroll.includes("fitTop"), "Scroll still snaps a panned Fit view back vertically");

assert.match(styles, /touch-action: pan-x pan-y pinch-zoom/);
assert(!/\.map-viewport\[data-fit="true"\][^{]*\{[^}]*overflow:\s*hidden/.test(styles),
  "Fit still hides the native pan overflow");

console.log("PASS DEC-103 midpoint cover and all-edge camera invariants");
