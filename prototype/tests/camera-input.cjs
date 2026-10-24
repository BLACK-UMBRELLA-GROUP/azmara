"use strict";

// Isolated local camera/input regression. No hosted credentials or user Chrome.
// argv[2] is an installed Playwright module, argv[3] the local preview URL.
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require(process.argv[2] || "playwright");
const base = process.argv[3] || "http://127.0.0.1:4317";
assert(["localhost", "127.0.0.1", "[::1]"].includes(new URL(base).hostname), "This suite is local-only");
const shots = process.env.AZMARA_QA_SCREENSHOTS;
if (shots) assert(fs.statSync(shots).isDirectory(), "Screenshot destination must already exist");
const key = "azmara-town-layout-v3";
const legacyKey = "azmara-town-design-v1";
const errors = [];
let groups = 0;

function observe(page) {
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => errors.push(request.url()));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
}

async function settle(page) {
  await page.waitForFunction(() => document.querySelector("#town-map")?.dataset.cameraAnimating !== "true");
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function load(context) {
  const page = await context.newPage();
  observe(page);
  const response = await page.goto(base);
  assert.equal(response?.status(), 200, "Local preview did not load");
  await page.waitForFunction(() => document.querySelectorAll("#town-core .plot-marker").length === 23 && document.querySelector("#azmara-land-stage") && document.querySelector("#town-map")?.dataset.presentation);
  await page.locator("#town-core img").evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
  await settle(page);
  assert.equal(await page.locator("#town-core .empty-slot-plus, #town-core .plot-plus").count(), 0, "Town plots still display removed plus-symbol overlays");
  const fitTargets = await page.locator("#town-core .plot-marker").evaluateAll((buttons) => buttons.map((button) => {
    const box = button.getBoundingClientRect();
    const image = button.querySelector(".marker img");
    let exposed = false;
    for (const fx of [.2, .5, .8]) for (const fy of [.2, .5, .8]) {
      const hit = document.elementFromPoint(box.x + box.width * fx, box.y + box.height * fy);
      if (hit?.closest(".plot-marker") === button) exposed = true;
    }
    const viewportCropped = box.right <= 0 || box.bottom <= 0 || box.left >= innerWidth || box.top >= innerHeight;
    return { id: button.dataset.plot, width: box.width, height: box.height, exposed, viewportCropped, loaded: !image || image.complete && image.naturalWidth > 0, name: button.getAttribute("aria-label") };
  }));
  assert.equal(fitTargets.length, 23);
  fitTargets.forEach((target) => {
    const protectedTarget = target.id === "wall-01" || target.id === "general-01";
    assert(target.width >= 43.9 && target.height >= 43.9 && (target.exposed || !protectedTarget && target.viewportCropped) && target.loaded && target.name,
      "Flag-free target is undersized, obscured, missing or unnamed (Hall and Wall must start exposed): " + JSON.stringify(target));
  });
  return page;
}

async function pose(page) {
  return page.evaluate(() => {
    const viewport = document.querySelector("#map-viewport");
    const map = document.querySelector("#town-map");
    const core = document.querySelector("#town-core");
    const bounds = document.querySelector("#world-landscape").viewBox.baseVal;
    const land = document.querySelector("#azmara-land-stage");
    return {
      left: viewport.scrollLeft, top: viewport.scrollTop,
      maxLeft: viewport.scrollWidth - viewport.clientWidth,
      maxTop: viewport.scrollHeight - viewport.clientHeight,
      width: core.getBoundingClientRect().width,
      zoom: Number(map.dataset.zoom), minZoom: Number(map.dataset.minZoom),
      fit: viewport.dataset.fit === "true", dragging: viewport.dataset.dragging === "true",
      animating: map.dataset.cameraAnimating === "true",
      frame: { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height },
      land: { x: land.x.baseVal.value, y: land.y.baseVal.value, width: land.width.baseVal.value, height: land.height.baseVal.value }
    };
  });
}

function unchangedPose(actual, before, message) {
  for (const field of ["left", "top", "width"]) assert(Math.abs(actual[field] - before[field]) <= 1.5, message + ": " + field);
}

function bounded(actual) {
  assert(actual.left >= -1 && actual.left <= actual.maxLeft + 1 && actual.top >= -1 && actual.top <= actual.maxTop + 1, "Scroll escaped finite camera bounds");
  assert(actual.frame.x >= actual.land.x - .01 && actual.frame.y >= actual.land.y - .01 && actual.frame.x + actual.frame.width <= actual.land.x + actual.land.width + .01 && actual.frame.y + actual.frame.height <= actual.land.y + actual.land.height + .01, "Camera escaped locked land bounds");
}

async function action(page, name, wait = true) {
  // Town camera buttons were removed from the approved shell. Retain direct
  // camera-engine coverage through the existing authoritative controls.
  await page.locator(`[data-desktop-action="${name}"]`).first().evaluate((button) => button.click());
  if (wait) await settle(page);
}

async function ground(page) {
  return page.evaluate(() => {
    const viewport = document.querySelector("#map-viewport");
    for (const y of [.52, .60, .44, .68]) for (const x of [.5, .4, .6, .3, .7]) {
      const point = { x: innerWidth * x, y: innerHeight * y };
      const hit = document.elementFromPoint(point.x, point.y);
      if (hit && viewport.contains(hit) && !hit.closest(".plot-marker")) return point;
    }
    throw new Error("No unobstructed ground found for a player drag");
  });
}

async function drag(page, dx, dy, start) {
  start ||= await ground(page);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + dx, start.y + dy, { steps: 10 });
  assert((await pose(page)).dragging, "Mouse movement never entered drag state");
  await page.mouse.up();
  await settle(page);
  assert(!(await pose(page)).dragging, "Drag state remained active after mouse-up");
  assert.equal(await page.locator("#detail-panel").evaluate((dialog) => dialog.open), false, "Dragging unexpectedly opened a plot");
}

async function capture(page, name) {
  if (shots) await page.screenshot({ path: path.join(shots, name + ".png"), scale: "css" });
}

async function seedQueue(context) {
  const now = Date.now();
  const saved = { version: 3, layoutId: "town-23-v1", townName: "Camera saved town", resources: { coins: 1900, timber: 600, stone: 400 }, hallLevel: 4, construction: { buildingId: "general-01", toLevel: 5, startedAt: now, endsAt: now + 10000 } };
  const savedRaw = JSON.stringify(saved);
  const legacy = JSON.stringify({ version: 1, townName: "Untouched legacy", levels: { council: 9 }, resources: { coins: 9999 } });
  await context.addInitScript(({ now, key, legacyKey, savedRaw, legacy, origin }) => {
    Date.now = () => now;
    if (location.origin === origin) {
      localStorage.setItem(key, savedRaw);
      localStorage.setItem(legacyKey, legacy);
    }
  }, { now, key, legacyKey, savedRaw, legacy, origin: new URL(base).origin });
  return { savedRaw, legacy };
}

async function savedBytes(page, expected) {
  const actual = await page.evaluate(({ key, legacyKey }) => ({ savedRaw: localStorage.getItem(key), legacy: localStorage.getItem(legacyKey) }), { key, legacyKey });
  assert.deepEqual(actual, expected, "Camera/input changed valid v3 active-queue or legacy bytes");
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const animated = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });
    try {
      const bytes = await seedQueue(animated);
      const page = await load(animated);
      const fit = await pose(page);
      await page.evaluate(() => {
        window.__cameraQa = { samples: [], running: true, terrain: document.querySelector("#azmara-land-stage") };
        const sample = (time) => {
          if (!window.__cameraQa.running) return;
          window.__cameraQa.samples.push({ time, width: document.querySelector("#town-core").getBoundingClientRect().width, animating: document.querySelector("#town-map").dataset.cameraAnimating === "true" });
          requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      });
      await action(page, "zoom-in", false);
      await settle(page);
      const finished = await pose(page);
      assert(Math.abs(finished.width / fit.width - 1.10) < .002, "One desktop zoom-in step is not the approved 10% increment");
      const frames = await page.evaluate(() => {
        window.__cameraQa.running = false;
        return { samples: window.__cameraQa.samples, sameTerrain: window.__cameraQa.terrain === document.querySelector("#azmara-land-stage") };
      });
      assert(frames.sameTerrain, "Animated zoom rebuilt decoded terrain on each frame");
      // Capture short-lived intermediate states inside requestAnimationFrame,
      // rather than hoping a later protocol round-trip beats a 180ms finish.
      assert(frames.samples.some((frame) => frame.animating && frame.width > fit.width && frame.width < finished.width), "Zoom was abrupt rather than visibly progressing between old and new scales");
      const changing = frames.samples.filter((frame) => frame.width > fit.width + .02 && frame.width < finished.width - .02);
      const transitionSpan = changing.at(-1).time - changing[0].time;
      assert(changing.length >= 3 && transitionSpan >= 80 && transitionSpan <= 300, "Zoom is not a smooth, promptly completing 180ms transition");
      assert(frames.samples.every((frame, index, list) => !index || frame.width >= list[index - 1].width - .2), "Zoom overshot or oscillated instead of smoothly easing: " + JSON.stringify(frames.samples));
      await action(page, "fit");
      unchangedPose(await pose(page), fit, "Fit did not restore the exact original overview");
      // A newly scheduled animation may receive this frame's older timestamp.
      // Inject that scheduling condition deterministically in this isolated page
      // so a rare initial easing bounce cannot disappear on a lucky rerun.
      await page.evaluate(() => {
        const request = window.requestAnimationFrame;
        window.__cameraEarlyFrame = null;
        window.requestAnimationFrame = (callback) => request.call(window, (time) => {
          if (callback.name === "step") {
            window.requestAnimationFrame = request;
            const width = () => document.querySelector("#town-core").getBoundingClientRect().width;
            const before = width();
            callback(performance.now() - 30);
            window.__cameraEarlyFrame = { before, after: width() };
          } else callback(time);
        });
      });
      await action(page, "zoom-in", false);
      await settle(page);
      const early = await page.evaluate(() => window.__cameraEarlyFrame);
      assert(early && Math.abs(early.after - early.before) < .2, "Earlier animation timestamp must clamp to initial scale: " + JSON.stringify(early));
      await action(page, "fit");
      unchangedPose(await pose(page), fit, "Early-timestamp zoom did not preserve exact Fit");
      await savedBytes(page, bytes);
      console.log("PASS fine animated zoom, gradual monotonic frames, retained terrain and exact Fit");
      groups += 1;

      for (let index = 0; index < 3; index += 1) await action(page, "zoom-in", false);
      await settle(page);
      assert(Math.abs((await pose(page)).width / fit.width - 1.10 ** 3) < .004, "Rapid zoom clicks did not accumulate against their pending target");
      await action(page, "zoom-out", false);
      await settle(page);
      assert(Math.abs((await pose(page)).width / fit.width - 1.10 ** 2) < .004, "Zoom reversal lost the pending fine step");
      await action(page, "close", false);
      await page.waitForTimeout(90);
      await action(page, "fit", false);
      await settle(page);
      unchangedPose(await pose(page), fit, "Retargeting a Close transition to Fit left a stale frame");
      await savedBytes(page, bytes);
      console.log("PASS rapid zoom accumulation, reversal and mid-transition Fit retarget");
      groups += 1;

      await action(page, "close", false);
      await page.waitForTimeout(90);
      await page.setViewportSize({ width: 1864, height: 977 });
      await settle(page);
      assert(!(await pose(page)).animating, "Resize did not stop obsolete animation");
      bounded(await pose(page));
      await page.setViewportSize({ width: 390, height: 844 });
      await settle(page);
      assert.equal(await page.locator("#town-map").getAttribute("data-presentation"), "compact", "Resize did not switch render profile");
      assert.equal(await page.locator("#town-core .plot-marker").count(), 23, "Resize lost stable plots");
      await page.setViewportSize({ width: 1440, height: 900 });
      await settle(page);
      bounded(await pose(page));
      await savedBytes(page, bytes);
      console.log("PASS resize mid-animation and desktop/compact profile switching retain state");
      groups += 1;

      await action(page, "fit");
      await action(page, "close", false);
      await page.waitForTimeout(90);
      await action(page, "options", false);
      await page.locator("#actions-menu").waitFor({ state: "visible" });
      const modalPose = await pose(page);
      assert(!modalPose.animating, "Opening a menu did not halt camera motion");
      await page.evaluate(() => {
        document.querySelector('[data-desktop-action="zoom-in"]').click();
        document.querySelector('[data-desktop-action="close"]').click();
        const viewport = document.querySelector("#map-viewport");
        viewport.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, isPrimary: true, pointerType: "mouse", button: 0, buttons: 1, pointerId: 21, clientX: 500, clientY: 500 }));
        viewport.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerType: "mouse", buttons: 1, pointerId: 21, clientX: 350, clientY: 350 }));
      });
      for (const input of ["ArrowRight", "ArrowDown", "+", "-"]) await page.keyboard.press(input);
      await page.waitForTimeout(500);
      unchangedPose(await pose(page), modalPose, "A modal menu permitted background camera input");
      assert(!(await pose(page)).dragging, "Modal opened a background drag");
      await page.keyboard.press("Escape");
      await page.locator("#actions-menu").waitFor({ state: "hidden" });
      await savedBytes(page, bytes);
      console.log("PASS modal halts animation and gates mouse, zoom and keyboard input");
      groups += 1;
    } finally { await animated.close(); }

    for (const [width, height] of [[1440, 900], [1864, 977], [2560, 900]]) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
      try {
        const bytes = await seedQueue(context);
        const page = await load(context);
        const fit = await pose(page);
        await action(page, "zoom-in", false);
        assert(!(await pose(page)).animating, "Reduced-motion zoom still animates");
        await settle(page);
        assert(Math.abs((await pose(page)).width / fit.width - 1.10) < .002, "Reduced motion changed the approved desktop zoom amount");
        await action(page, "close");
        const close = await pose(page);
        assert(Math.abs(close.width / fit.width - 1.5) < .004, "Desktop Close is still excessively magnified");
        assert(!close.fit && close.maxLeft >= 25 && close.maxTop >= 25, "Gentle Close cannot pan along both axes");
        bounded(close);
        await drag(page, -110, -90);
        const moved = await pose(page);
        assert(moved.left > close.left + 15 && moved.top > close.top + 15, "Mouse drag failed to move the zoomed map in x and y");
        bounded(moved);
        await capture(page, `camera-${width}x${height}-close-drag`);
        for (let index = 0; index < 20; index += 1) {
          const current = await pose(page);
          if (current.left <= 1 && current.top <= 1) break;
          await drag(page, 260, 180);
        }
        const minimum = await pose(page);
        assert(minimum.left <= 1 && minimum.top <= 1, "Dragging does not reach the minimum finite boundaries");
        bounded(minimum);
        for (let index = 0; index < 20; index += 1) {
          const current = await pose(page);
          if (Math.abs(current.left - current.maxLeft) <= 1 && Math.abs(current.top - current.maxTop) <= 1) break;
          await drag(page, -260, -180);
        }
        const maximum = await pose(page);
        assert(Math.abs(maximum.left - maximum.maxLeft) <= 1 && Math.abs(maximum.top - maximum.maxTop) <= 1, "Dragging does not reach the maximum finite boundaries");
        bounded(maximum);
        await action(page, "fit");
        const stableFit = await pose(page);
        const start = await ground(page);
        await page.mouse.move(start.x, start.y);
        await page.mouse.down();
        await page.mouse.move(start.x - 110, start.y - 90, { steps: 10 });
        assert((await pose(page)).dragging, "First Fit drag did not release the camera for manual panning");
        await page.mouse.up();
        await settle(page);
        const pannedFit = await pose(page);
        assert(!pannedFit.fit, "Manual panning left the camera falsely labelled Fit");
        const expectedMovement = stableFit.maxLeft > 2 || stableFit.maxTop > 2;
        if (expectedMovement) assert(Math.abs(pannedFit.left - stableFit.left) > 2 || Math.abs(pannedFit.top - stableFit.top) > 2,
          "Fit released but the drag did not move along its cropped axis");
        bounded(pannedFit);
        await action(page, "fit");
        unchangedPose(await pose(page), stableFit, "Fit did not restore the protected start overview after manual panning");
        unchangedPose(stableFit, fit, "Fit did not restore its original framing after drag extremes");
        await savedBytes(page, bytes);
        console.log(`PASS reduced motion, gentle Close, x/y mouse drag, Fit release, both finite boundaries and protected-start restore ${width}x${height}`);
        groups += 1;
      } finally { await context.close(); }
    }

    const fullRange = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    try {
      const bytes = await seedQueue(fullRange);
      const page = await load(fullRange);
      let samples = 0;
      async function assertEnclosedFrame() {
        const actual = await pose(page);
        bounded(actual);
        const frame = actual.frame;
        assert(frame.x <= 650.01 && frame.y <= 600.01 && frame.x + frame.width >= 3800 - .01 && frame.y + frame.height >= 2230 - .01,
          "Intermediate camera does not enclose the complete settlement frame at zoom " + actual.zoom);
        const geometry = await page.evaluate(() => {
          const viewport = document.querySelector("#map-viewport");
          const map = document.querySelector("#town-map").getBoundingClientRect();
          const surface = document.querySelector("#map-surface").getBoundingClientRect();
          return {
            map: map.toJSON(), surface: surface.toJSON(),
            scrollWidth: viewport.scrollWidth, scrollHeight: viewport.scrollHeight,
            plots: [...document.querySelectorAll("#town-core .plot-marker")].map((element) => ({ id: element.dataset.plot, box: element.getBoundingClientRect().toJSON() }))
          };
        });
        assert(Math.abs(geometry.scrollWidth - geometry.map.width) <= 1.4 && Math.abs(geometry.scrollHeight - geometry.map.height) <= 1.4,
          "Plot overflow enlarged actual scroll dimensions beyond painted map at zoom " + actual.zoom);
        assert(Math.abs(geometry.surface.width - geometry.map.width) <= .1 && Math.abs(geometry.surface.height - geometry.map.height) <= .1,
          "Camera surface and painted map dimensions disagree");
        assert.equal(geometry.plots.length, 23, "Camera scale lost stable targets");
        for (const plot of geometry.plots) {
          const box = plot.box;
          assert(box.x >= geometry.map.x - .75 && box.y >= geometry.map.y - .75 && box.right <= geometry.map.right + .75 && box.bottom <= geometry.map.bottom + .75,
            "Target protrudes beyond complete finite world map: " + plot.id + " at zoom " + actual.zoom + " " + JSON.stringify({ frame, map: geometry.map, target: box }));
        }
        samples += 1;
      }
      await assertEnclosedFrame();
      for (let count = 0; count < 64; count += 1) {
        if (await page.locator('[data-desktop-action="zoom-in"]').first().isDisabled()) break;
        await action(page, "zoom-in");
        await assertEnclosedFrame();
        if (count === 8) await capture(page, "camera-intermediate-two-times-fit");
      }
      assert(await page.locator('[data-desktop-action="zoom-in"]').first().isDisabled(), "Full camera range never reached maximum zoom");
      assert(samples >= 8, "Too few 10% zoom steps were inspected for intermediate-frame regression");
      for (let count = 0; count < 64; count += 1) {
        if (await page.locator('[data-desktop-action="zoom-out"]').first().isDisabled()) break;
        await action(page, "zoom-out");
        await assertEnclosedFrame();
      }
      const floor = await pose(page);
      assert(Math.abs(floor.zoom - floor.minZoom) < .001, "Full zoom-out range did not reach the ordinary cover floor");
      assert(!floor.fit, "Player zoom-out incorrectly restored the larger protected Fit start");
      await action(page, "fit");
      assert((await pose(page)).fit, "Explicit Fit did not restore the protected start");
      await savedBytes(page, bytes);
      console.log(`PASS all ${samples} fine zoom samples keep all 23 targets and settlement frame inside finite painted map with no scroll overflow`);
      groups += 1;
    } finally { await fullRange.close(); }

    const interruptions = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    try {
      const bytes = await seedQueue(interruptions);
      const page = await load(interruptions);
      await action(page, "close");
      const hall = page.locator('#town-core [data-plot="general-01"]');
      const hallBox = await hall.boundingBox();
      const hallPoint = { x: hallBox.x + hallBox.width / 2, y: hallBox.y + hallBox.height / 2 };
      await drag(page, -60, -50, hallPoint);
      assert.equal(await page.locator("#detail-panel").evaluate((dialog) => dialog.open), false, "A drag starting on Town Hall opened it");
      await hall.click();
      await page.locator("#detail-panel").waitFor({ state: "visible" });
      assert.equal((await page.locator("#panel-title").textContent()).trim(), "Town Hall", "An ordinary click after drag was suppressed");
      const panelPose = await pose(page);
      for (const input of ["ArrowRight", "+"]) await page.keyboard.press(input);
      unchangedPose(await pose(page), panelPose, "Detail dialog permitted background camera movement");
      await page.keyboard.press("Escape");
      await page.locator("#detail-panel").waitFor({ state: "hidden" });
      // Mouse movement below the five-pixel threshold remains an ordinary click.
      const nearHall = await hall.boundingBox();
      await page.mouse.move(nearHall.x + nearHall.width / 2, nearHall.y + nearHall.height / 2);
      await page.mouse.down();
      await page.mouse.move(nearHall.x + nearHall.width / 2 + 2, nearHall.y + nearHall.height / 2 + 2);
      assert(!(await pose(page)).dragging, "Click jitter entered drag mode");
      await page.mouse.up();
      await page.locator("#detail-panel").waitFor({ state: "visible" });
      await page.keyboard.press("Escape");
      await page.locator("#detail-panel").waitFor({ state: "hidden" });
      await savedBytes(page, bytes);
      console.log("PASS plot-origin drag suppression, ordinary next click, click jitter and detail-dialog gating");
      groups += 1;

      for (const interruption of ["pointercancel", "lostpointercapture", "blur"]) {
        const start = await ground(page);
        await page.evaluate(() => {
          document.querySelector("#map-viewport").addEventListener("pointerdown", (event) => { window.__cameraPointerId = event.pointerId; }, { once: true });
        });
        await page.mouse.move(start.x, start.y);
        await page.mouse.down();
        await page.mouse.move(start.x - 35, start.y - 30, { steps: 4 });
        assert((await pose(page)).dragging, "Interruption fixture did not capture a real pointer");
        const beforeInterruption = await pose(page);
        await page.evaluate((interruption) => {
          const viewport = document.querySelector("#map-viewport");
          if (interruption === "blur") window.dispatchEvent(new Event("blur"));
          else if (interruption === "lostpointercapture") viewport.releasePointerCapture(window.__cameraPointerId);
          else viewport.dispatchEvent(new PointerEvent("pointercancel", { bubbles: true, pointerId: window.__cameraPointerId, pointerType: "mouse", isPrimary: true }));
        }, interruption);
        // releasePointerCapture queues the lost-capture event; the next real
        // pointer input processes it before that pointermove is delivered.
        if (interruption === "lostpointercapture") await page.mouse.move(start.x - 36, start.y - 31);
        await page.waitForFunction(() => document.querySelector("#map-viewport").dataset.dragging !== "true");
        const stopped = await pose(page);
        unchangedPose(stopped, beforeInterruption, "Capture loss moved the camera before cleanup");
        await page.mouse.move(start.x - 90, start.y - 80, { steps: 4 });
        unchangedPose(await pose(page), stopped, "Camera kept following mouse after " + interruption);
        await page.mouse.up();
        await settle(page);
        assert.equal(await page.locator("#detail-panel").evaluate((dialog) => dialog.open), false, "Interruption unexpectedly opened a plot");
      }
      // HUD buttons are outside the map's drag surface and retain their action.
      await action(page, "options", false);
      await page.locator("#actions-menu").waitFor({ state: "visible" });
      assert(!(await pose(page)).dragging, "HUD click entered map dragging");
      await page.keyboard.press("Escape");
      await page.locator("#actions-menu").waitFor({ state: "hidden" });
      const beforeBrowserZoom = await pose(page);
      const notPrevented = await page.evaluate(() => {
        const viewport = document.querySelector("#map-viewport");
        const wheel = new WheelEvent("wheel", { bubbles: true, cancelable: true, ctrlKey: true, deltaY: -100 });
        const shortcut = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ctrlKey: true, key: "+" });
        return { wheel: viewport.dispatchEvent(wheel), shortcut: viewport.dispatchEvent(shortcut) };
      });
      assert(notPrevented.wheel && notPrevented.shortcut, "Map intercepted native Ctrl+wheel or Ctrl+plus browser zoom");
      unchangedPose(await pose(page), beforeBrowserZoom, "Browser zoom shortcuts changed the map camera");
      await savedBytes(page, bytes);
      console.log("PASS pointer cancel/lost capture/blur cleanup, independent HUD and native zoom shortcut pass-through");
      groups += 1;
    } finally { await interruptions.close(); }

    const pinch = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    try {
      const page = await load(pinch);
      const before = await pose(page);
      const browserScale = await page.evaluate(() => visualViewport.scale);
      const session = await pinch.newCDPSession(page);
      try {
        await session.send("Input.synthesizePinchGesture", { x: 195, y: 440, scaleFactor: 1.25, relativeSpeed: 500, gestureSourceType: "touch" });
        await page.waitForTimeout(250);
      } finally { await session.detach(); }
      assert(await page.evaluate((scale) => visualViewport.scale > scale + .05, browserScale), "Native browser pinch no longer works");
      assert.equal((await pose(page)).zoom, before.zoom, "Native page pinch incorrectly changed map zoom");
      assert(!(await pose(page)).dragging, "Touch pinch incorrectly entered mouse drag mode");
      console.log("PASS simulated native browser pinch stays separate from map zoom and mouse dragging");
      groups += 1;
    } finally { await pinch.close(); }

    assert.deepEqual(errors, [], "Captured browser/console/request errors");
    console.log(`${groups} camera/input groups passed; isolated Chromium, no physical-device claim.`);
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
