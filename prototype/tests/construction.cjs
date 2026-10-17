"use strict";

// Deterministic UI-only deadline/refund QA. Never load the Founder's browser or
// hosted game, and never advance simulation through an internal app function.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(process.argv[2] || "playwright");
const base = process.argv[3] || "http://127.0.0.1:4317";
assert(["localhost", "127.0.0.1", "[::1]"].includes(new URL(base).hostname), "Construction QA is local-only");
const shots = process.env.AZMARA_QA_SCREENSHOTS;
if (shots) assert(fs.statSync(shots).isDirectory());
const key = "azmara-town-layout-v3";
const legacyKey = "azmara-town-design-v1";
const epoch = 1800000000000;
const initial = { coins: 2400, timber: 760, stone: 540 };
const receipt = { coins: 240, timber: 130, stone: 100 };
const paid = { coins: 2160, timber: 630, stone: 440 };
const partial = { coins: 2232, timber: 669, stone: 470 };
const legacyRaw = ' {"version":1,"townName":"Earlier untouched", "resources":{"coins":9876}} ';
const ids = [...Array.from({ length: 19 }, (_, index) => `general-${String(index + 1).padStart(2, "0")}`), "wall-01", "harbour-01", "harbour-02", "freighter-01"].sort();
const errors = [];
let groups = 0;
const state = (extra = {}) => ({ version: 3, layoutId: "town-23-v1", townName: "Construction QA", hallLevel: 1, resources: { ...initial }, construction: null, ...extra });
const job = (extra = {}) => ({ buildingId: "general-01", typeId: "town-hall", toLevel: 2, startedAt: epoch, endsAt: epoch + 120000, paidCost: { ...receipt }, ...extra });

async function setup(context, fixture, now = epoch, blocked = false) {
  await context.addInitScript(({ origin, fixture, now, key, legacyKey, legacyRaw, blocked }) => {
    window.__constructionQaNow = Number(sessionStorage.getItem("__constructionQaNow") || now);
    Date.now = () => window.__constructionQaNow;
    if (blocked) {
      Object.defineProperty(window, "localStorage", { get() { throw new DOMException("QA unavailable storage", "SecurityError"); } });
      return;
    }
    if (location.origin === origin && !sessionStorage.getItem("__constructionQaSeeded")) {
      if (fixture !== null) localStorage.setItem(key, fixture);
      localStorage.setItem(legacyKey, legacyRaw);
      sessionStorage.setItem("__constructionQaSeeded", "true");
    }
  }, { origin: new URL(base).origin, fixture, now, key, legacyKey, legacyRaw, blocked });
}

async function clock(page, now, selector) {
  await page.evaluate(({ now, selector }) => {
    window.__constructionQaNow = now;
    sessionStorage.setItem("__constructionQaNow", String(now));
    // Same JS task makes the exact boundary unambiguous: no preceding timer
    // can remove a cancel control before the user's event is dispatched.
    if (selector) {
      const control = document.querySelector(selector);
      if (!(control instanceof HTMLButtonElement)) throw new Error("Missing boundary control " + selector);
      control.click();
    }
  }, { now, selector });
}

async function settle(page) {
  await page.evaluate(() => new Promise((resolve) => {
    const ready = () => document.querySelector("#town-map").dataset.cameraAnimating === "true" ? requestAnimationFrame(ready) : requestAnimationFrame(() => requestAnimationFrame(resolve));
    requestAnimationFrame(ready);
  }));
  await page.locator("#town-core img").evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
}

async function raw(page, storageKey = key) { return page.evaluate((key) => localStorage.getItem(key), storageKey); }
async function saved(page) { return JSON.parse(await raw(page)); }

async function menu(page, selector) {
  await page.locator('[data-desktop-action="options"]:visible').first().click();
  const control = page.locator("#actions-menu " + selector);
  await control.scrollIntoViewIfNeeded();
  await control.click();
  await page.locator("#actions-menu").waitFor({ state: "hidden" });
  await settle(page);
}

async function hall(page) {
  if (await page.locator("#detail-panel").evaluate((dialog) => dialog.open)) await page.locator("#close-panel").click();
  await menu(page, '[data-panel="buildings"]');
  await page.locator('#detail-panel [data-building="general-01"]').click();
  await settle(page);
}

async function close(page) {
  await page.locator("#close-panel").click();
  await page.locator("#detail-panel").waitFor({ state: "hidden" });
  await settle(page);
}

async function reset(page, confirm = true) {
  if (await page.locator("#detail-panel").evaluate((dialog) => dialog.open)) await close(page);
  await page.locator(".azmara-dev-button:visible").click();
  await page.locator("#detail-panel #request-reset").click();
  assert.equal(await page.locator("#reset-confirm").isVisible(), true);
  await page.locator(confirm ? "#confirm-reset" : "#cancel-reset").click();
  await page.locator("#detail-panel").waitFor({ state: "hidden" });
  await settle(page);
}

async function start(page) {
  await hall(page);
  assert.equal(await page.locator("#upgrade-building").textContent(), "Update");
  await page.locator("#upgrade-building").click();
  const actual = await saved(page);
  assert.deepEqual(actual.resources, paid);
  assert.deepEqual(actual.construction, job());
  assert.equal(actual.hallLevel, 1);
  assert.match(await page.locator("#construction-time").textContent(), /^2:00 remaining/);
  assert.match(await page.locator("#free-cancel-time").textContent(), /1:00/);
  assert.match(await page.locator("#cancel-refund").textContent(), /240 Coins.*130 Timber.*100 Clay.*100%/);
  assert.equal(await page.locator("#upgrade-building:enabled, #build-hall:enabled").count(), 0);
  return actual;
}

async function mode(page, name) {
  await page.locator(`button[data-preview-mode="${name}"]`).first().evaluate((button) => button.click());
  await settle(page);
  assert.equal(await page.locator("#detail-panel").evaluate((dialog) => dialog.open), false);
  assert.equal(await page.locator("body").getAttribute("data-preview-mode"), name);
}

async function plots(page, placed) {
  const markers = await page.locator("#town-core .plot-marker").evaluateAll((nodes) => nodes.map((node) => {
    const r = node.getBoundingClientRect();
    const image = node.querySelector("img");
    return { id: node.dataset.plot, kind: node.dataset.kind, occupied: node.dataset.occupied, stage: node.dataset.buildingStage, label: node.getAttribute("aria-label"), rect: r.toJSON(), exposed: document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.closest(".plot-marker") === node, decoded: !image || image.complete && image.naturalWidth > 0 };
  }));
  assert.deepEqual(markers.map((marker) => marker.id).sort(), ids);
  assert.deepEqual(markers.filter((marker) => marker.occupied === "true").map((marker) => marker.id), placed ? ["general-01"] : []);
  // DEC-099/100: the Hall, empty spots and flags are painted into the locked
  // land master. Plot buttons remain the authoritative, accessible targets.
  assert.equal(await page.locator("#town-core img.town-hall-art, #town-core img.empty-plot-art").count(), 0);
  assert.equal(await page.locator('[data-plot="general-01"] .marker > *').count(), 0);
  assert.equal(await page.locator("#azmara-land-stage").evaluate(async (image) => {
    const probe = new Image(); probe.src = image.getAttribute("href"); await probe.decode();
    return probe.naturalWidth === 1536 && probe.naturalHeight === 1024;
  }), true);
  assert.deepEqual(markers.reduce((roles, marker) => ({ ...roles, [marker.kind]: (roles[marker.kind] || 0) + 1 }), {}), { general: 19, wall: 1, harbour: 2, freighter: 1 });
  const viewport = page.viewportSize();
  for (const marker of markers) {
    const onScreen = marker.rect.right > 0 && marker.rect.bottom > 0
      && marker.rect.x < viewport.width && marker.rect.y < viewport.height;
    assert(marker.decoded && marker.label && marker.rect.width >= 44 && marker.rect.height >= 44
      && (!onScreen || marker.exposed), "Invalid reset target: " + JSON.stringify(marker));
  }
  if (!placed) {
    assert.equal(markers.find((marker) => marker.id === "general-01").stage, "0");
    assert(markers.every((marker) => marker.label && marker.rect.width >= 44 && marker.rect.height >= 44), "Reset painted-spot hotspots are not all registered");
  }
}

async function run(browser, name, verify, options = {}) {
  const context = await browser.newContext({ viewport: options.viewport || { width: 1440, height: 900 }, reducedMotion: "reduce", hasTouch: Boolean(options.viewport?.width < 660), isMobile: Boolean(options.viewport?.width < 660) });
  try {
    await setup(context, options.fixture === undefined ? JSON.stringify(state()) : options.fixture, options.now || epoch, options.blocked);
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    page.on("requestfailed", (request) => errors.push(request.url() + ": " + request.failure()?.errorText));
    page.on("response", (response) => { if (response.status() >= 400) errors.push(response.status() + " " + response.url()); });
    assert.equal((await page.goto(base))?.status(), 200);
    await page.locator("#town-core").waitFor({ state: "visible" });
    await settle(page);
    await verify(page);
    if (!options.blocked) assert.equal(await raw(page, legacyKey), legacyRaw, "Construction/reset rewrote the separate historical preview");
    assert.deepEqual(errors, [], "Browser errors");
    groups += 1;
    console.log("PASS " + name);
  } finally { await context.close(); }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    await run(browser, "fresh town remains occupied Hall1; Update charges exactly once with two distinct countdowns", async (page) => {
      await plots(page, true);
      const before = await raw(page);
      await hall(page);
      assert.equal(await raw(page), before, "Opening Hall rewrote a valid old v3 save");
      await page.locator("#upgrade-building").evaluate((button) => { button.click(); button.click(); });
      assert.deepEqual(await saved(page), state({ resources: paid, construction: job() }));
      assert.match(await page.locator("#construction-time").textContent(), /^2:00/);
      assert.match(await page.locator("#free-cancel-time").textContent(), /1:00/);
    });

    for (const elapsed of [0, 59999]) await run(browser, `${elapsed}ms cancellation returns exactly 100%, immediately and only once`, async (page) => {
      await start(page);
      await clock(page, epoch + elapsed, "#request-cancel-construction");
      assert.deepEqual(await saved(page), state());
      assert.equal(await page.locator("#construction-cancel-confirm").count(), 0);
      assert.equal(await page.locator("#upgrade-building").textContent(), "Update");
      await page.reload(); await settle(page);
      await clock(page, epoch + 140000); await page.waitForTimeout(550);
      assert.deepEqual(await saved(page), state(), "Cancelled job resurrected or refunded twice");
    });

    for (const elapsed of [60000, 119999]) await run(browser, `${elapsed}ms cancellation requires explicit 30% confirmation and applies one receipt refund`, async (page) => {
      const original = await start(page);
      await clock(page, epoch + elapsed, "#request-cancel-construction");
      assert.equal(await page.locator("#construction-cancel-confirm").isVisible(), true);
      assert.deepEqual(await saved(page), original, "Requesting partial cancellation changed resources");
      assert.match(await page.locator("#paid-cancel-warning").textContent(), /72 Coins.*39 Timber.*30 Clay/);
      await page.locator("#confirm-cancel-construction").evaluate((button) => { button.click(); button.click(); });
      assert.deepEqual(await saved(page), state({ resources: partial }));
      await page.reload(); await settle(page);
      await clock(page, epoch + 140000); await page.waitForTimeout(550);
      assert.deepEqual(await saved(page), state({ resources: partial }), "Partial-cancelled job completed or refunded twice");
    });

    await run(browser, "Keep building and Escape never apply the partial refund; reload preserves exact receipt and deadline", async (page) => {
      const original = await start(page);
      await clock(page, epoch + 60000, "#request-cancel-construction");
      await page.locator("#keep-construction").click();
      assert.equal(await page.locator("#construction-cancel-confirm").isVisible(), false);
      assert.deepEqual(await saved(page), original);
      await page.locator("#request-cancel-construction").click();
      await page.keyboard.press("Escape");
      assert.deepEqual(await saved(page), original);
      await page.reload(); await settle(page);
      assert.deepEqual(await saved(page), original);
      await hall(page);
      assert.match(await page.locator("#free-cancel-time").textContent(), /ended.*30%/);
      assert.match(await page.locator("#construction-time").textContent(), /^1:00/);
    });

    await run(browser, "exact 120000ms completion wins a cancel click, retains paid resources and reconciles once", async (page) => {
      await start(page);
      await clock(page, epoch + 119999); await page.waitForTimeout(550);
      assert.deepEqual(await saved(page), state({ resources: paid, construction: job() }));
      await clock(page, epoch + 120000, "#request-cancel-construction");
      assert.deepEqual(await saved(page), state({ hallLevel: 2, resources: paid }));
      assert.equal(await page.locator("#confirm-cancel-construction").count(), 0);
      await page.reload(); await settle(page);
      assert.deepEqual(await saved(page), state({ hallLevel: 2, resources: paid }));
    });

    await run(browser, "a confirmed partial-cancel quote cannot refund a job that completes before confirmation", async (page) => {
      await start(page);
      await clock(page, epoch + 60000, "#request-cancel-construction");
      await page.locator("#confirm-cancel-construction").focus();
      await clock(page, epoch + 120000, "#confirm-cancel-construction");
      assert.deepEqual(await saved(page), state({ hallLevel: 2, resources: paid }));
      assert.equal(await page.evaluate(() => document.activeElement.id), "close-panel", "Completed job left focus on a removed cancellation control");
    });

    for (const [first, later, expected] of [[59999, 60000, state()], [119999, 120000, state({ resources: partial })], [120000, 120001, state({ hallLevel: 2, resources: paid })]]) await run(browser, `one atomic decision timestamp remains consistent while Date.now crosses ${first}/${later}ms`, async (page) => {
      await start(page);
      if (first >= 60000) await clock(page, epoch + 60000, "#request-cancel-construction");
      await page.evaluate(({ first, later, epoch }) => {
        let reads = 0;
        Date.now = () => epoch + (reads++ === 0 ? first : later);
        document.querySelector(first >= 60000 ? "#confirm-cancel-construction" : "#request-cancel-construction").click();
        window.__constructionQaNow = epoch + later;
        sessionStorage.setItem("__constructionQaNow", String(window.__constructionQaNow));
        Date.now = () => window.__constructionQaNow;
      }, { first, later, epoch });
      assert.deepEqual(await saved(page), expected, "Cancellation read a mixed boundary timestamp");
    });

    for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) await run(browser, `confirmed Dev reset preserves name, restores stocks and registers all 23 actual ground targets ${viewport.width}x${viewport.height}`, async (page) => {
      const original = await start(page);
      await reset(page, false);
      assert.deepEqual(await saved(page), original, "Cancelled reset changed the active queue");
      await reset(page);
      const empty = state({ hallPlaced: false });
      assert.deepEqual(await saved(page), empty);
      assert.equal(await page.locator("body").getAttribute("data-town-level"), "0");
      await plots(page, false);
      if (shots) await page.screenshot({ path: path.join(shots, `isolated-dev-reset-all-23-empty-${viewport.width}x${viewport.height}.png`), scale: "css" });
      await mode(page, "gameplay");
      await plots(page, false);
      await hall(page);
      assert.equal(await page.locator("#build-hall, #upgrade-building, #request-cancel-construction, #confirm-reset").count(), 0);
      await close(page);
      await page.reload(); await settle(page);
      await clock(page, epoch + 140000); await page.waitForTimeout(550);
      assert.deepEqual(await saved(page), empty, "Reset job resurrected on reload/deadline");
      await plots(page, false);
    }, { viewport });

    await run(browser, "Build Town Hall uses reserved general01 only, stays empty during queue, completes at level1 then Update resumes", async (page) => {
      await hall(page);
      assert.equal(await page.locator("#build-hall").textContent(), "Build Town Hall");
      await page.locator("#build-hall").click();
      const building = state({ hallPlaced: false, resources: paid, construction: job({ toLevel: 1 }) });
      assert.deepEqual(await saved(page), building);
      await close(page); await plots(page, false);
      await page.reload(); await settle(page);
      assert.deepEqual(await saved(page), building);
      await clock(page, epoch + 119999); await page.waitForTimeout(550);
      assert.deepEqual(await saved(page), building);
      await clock(page, epoch + 120000);
      await page.waitForFunction((key) => JSON.parse(localStorage.getItem(key)).construction === null, key);
      assert.deepEqual(await saved(page), state({ resources: paid }));
      await settle(page); await plots(page, true);
      await hall(page);
      assert.equal(await page.locator("#upgrade-building").textContent(), "Update");
      await page.locator("#upgrade-building").click();
      assert.deepEqual((await saved(page)).resources, { coins: 1920, timber: 500, stone: 340 });
      assert.equal((await saved(page)).construction.toLevel, 2);
    }, { fixture: JSON.stringify(state({ hallPlaced: false })) });

    await run(browser, "free cancellation of first Hall construction keeps all23 empty and restores starting resources", async (page) => {
      await hall(page); await page.locator("#build-hall").click();
      await clock(page, epoch + 59999, "#request-cancel-construction");
      assert.deepEqual(await saved(page), state({ hallPlaced: false }));
      await close(page); await plots(page, false);
    }, { fixture: JSON.stringify(state({ hallPlaced: false })) });

    await run(browser, "Gameplay guards stale reset, Build, Update, cancellation and appearance controls without changing queue", async (page) => {
      const original = await start(page);
      await mode(page, "gameplay");
      await page.locator("#request-cancel-construction").dispatchEvent("click");
      await page.locator('[data-dev-action="reset"]').first().dispatchEvent("click");
      await page.locator('[data-panel="appearance"]').first().dispatchEvent("click");
      assert.equal(await page.locator("#detail-panel").evaluate((dialog) => dialog.open), false);
      assert.deepEqual(await saved(page), original);
      await mode(page, "dev"); await reset(page);
      await hall(page); await mode(page, "gameplay");
      await page.locator("#build-hall").dispatchEvent("click");
      assert.deepEqual(await saved(page), state({ hallPlaced: false }));
      await mode(page, "dev");
      await reset(page, false); // cancellation closes confirmation without a write.
      assert.deepEqual(await saved(page), state({ hallPlaced: false }));
    });

    await run(browser, "historical10s queue reads byte-for-byte and retains its original deadline", async (page) => {
      const original = await raw(page);
      assert.equal(original, JSON.stringify(state({ resources: paid, construction: { buildingId: "general-01", toLevel: 2, startedAt: epoch, endsAt: epoch + 10000 } }), null, 2), "Initialisation reformatted an untouched valid historical queue");
      await hall(page); assert.equal(await raw(page), original);
      await clock(page, epoch + 9999); await page.waitForTimeout(550);
      assert.equal(await raw(page), original);
      await clock(page, epoch + 10000, "#request-cancel-construction");
      assert.deepEqual(await saved(page), state({ hallLevel: 2, resources: paid }));
      await page.reload(); await settle(page);
      assert.deepEqual(await saved(page), state({ hallLevel: 2, resources: paid }));
    }, { fixture: JSON.stringify(state({ resources: paid, construction: { buildingId: "general-01", toLevel: 2, startedAt: epoch, endsAt: epoch + 10000 } }), null, 2) });

    await run(browser, "historical10s cancellation derives the original deterministic receipt without charging again", async (page) => {
      const before = await raw(page);
      await hall(page); assert.equal(await raw(page), before);
      await clock(page, epoch + 9999, "#request-cancel-construction");
      assert.deepEqual(await saved(page), state());
    }, { fixture: JSON.stringify(state({ resources: paid, construction: { buildingId: "general-01", toLevel: 2, startedAt: epoch, endsAt: epoch + 10000 } })) });

    const malformed = [
      ["nonboolean placement", state({ hallPlaced: "false" })],
      ["empty Hall level2", state({ hallPlaced: false, hallLevel: 2 })],
      ["empty Hall old10s queue", state({ hallPlaced: false, resources: paid, construction: job({ toLevel: 1, endsAt: epoch + 10000, paidCost: undefined }) })],
      ["new queue no receipt", state({ resources: paid, construction: job({ paidCost: undefined }) })],
      ["invented inflated receipt", state({ resources: paid, construction: job({ paidCost: { ...receipt, coins: 999 } }) })],
      ["receipt extra resource", state({ resources: paid, construction: job({ paidCost: { ...receipt, iron: 1 } }) })],
      ["receipt fractional value", state({ resources: paid, construction: job({ paidCost: { ...receipt, stone: 100.5 } }) })],
      ["receipt could overflow quantity cap", state({ resources: { ...paid, coins: 99999 }, construction: job() })],
      ["empty Hall target2", state({ hallPlaced: false, resources: paid, construction: job() })],
      ["120001ms duration", state({ resources: paid, construction: job({ endsAt: epoch + 120001 }) })]
    ];
    await run(browser, "strict validator rejects forged receipts, impossible placement and duration with a safe fresh fallback", async (page) => {
      for (const [label, invalid] of malformed) {
        const invalidRaw = JSON.stringify(invalid);
        await page.evaluate(({ key, invalidRaw }) => localStorage.setItem(key, invalidRaw), { key, invalidRaw });
        await page.reload(); await settle(page);
        assert.deepEqual(await saved(page), state({ townName: "Your town" }), "Invalid placement/receipt leaked into the safe fallback: " + label);
        assert.equal(await page.locator("#town-name").textContent(), "Your town", label);
        await plots(page, true);
        await hall(page);
        assert.equal(await page.locator("#upgrade-building").isEnabled(), true, label);
        assert.equal(await page.locator("#request-cancel-construction").count(), 0, "Invalid receipt remained refundable: " + label);
        await close(page);
      }
    });

    await run(browser, "unavailable storage supports visit-only Update/cancel/reset and reload returns honest fresh Hall1", async (page) => {
      await hall(page); await page.locator("#upgrade-building").click();
      await clock(page, epoch + 59999, "#request-cancel-construction");
      for (const [resource, amount] of Object.entries(initial)) assert.equal((await page.locator("#resource-" + resource).textContent()).replace(/,/g, "").trim(), String(amount));
      await reset(page); await plots(page, false);
      await page.reload(); await settle(page);
      await plots(page, true);
      assert.equal(await page.locator("#town-name").textContent(), "Your town");
    }, { fixture: null, blocked: true });

    assert.deepEqual(errors, []);
    console.log(`PASS ${groups} deterministic construction/reset regression groups; isolated Chromium, no real-device claim.`);
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); if (errors.length) console.error(errors); process.exitCode = 1; });
