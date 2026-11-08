"use strict";

// Isolated protocol checks, not a WebKit/physical-iPhone acceptance claim.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const code = fs.readFileSync(path.join(__dirname, "../native-bootstrap.js"), "utf8");
const KEY = "azmara-town-layout-v3";
const LEGACY = "azmara-town-design-v1";
const town = (name = "Native town", level = 1) => JSON.stringify({
  version: 3, layoutId: "town-23-v1", townName: name,
  resources: { coins: 2400, timber: 760, stone: 540 },
  hallLevel: level, construction: null,
});

function fixture({ bridge = true, seed = {}, badImage = false, badImageSource = null,
  missingPlot = false, missingLandRegistry = false, missingBuildingRegistry = false,
  occupied = 1 } = {}) {
  class Storage {
    constructor(values = {}) { this.values = new Map(Object.entries(values)); }
    getItem(key) { return this.values.has(String(key)) ? this.values.get(String(key)) : null; }
    setItem(key, value) { this.values.set(String(key), String(value)); }
    removeItem(key) { this.values.delete(String(key)); }
    clear() { this.values.clear(); }
  }
  const localStorage = new Storage(seed);
  const sessionStorage = new Storage();
  const events = new Map();
  const messages = [];
  const scripts = [];
  const imageRequests = [];
  const timers = new Map();
  const dispatched = [];
  let timerId = 0;
  const plots = Array.from({ length: missingPlot ? 22 : 23 }, (_, index) => ({
    dataset: {
      occupied: index < occupied ? "true" : "false",
      kind: index < 19 ? "general" : index === 19 ? "wall" : index < 22 ? "harbour" : "freighter",
    },
  }));
  const document = {
    body: {},
    images: [{ complete: true, naturalWidth: 1536, decode: async () => {} }],
    documentElement: { clientWidth: 430, clientHeight: 800 },
    head: { appendChild(script) { scripts.push(script); } },
    createElement: () => ({}),
    querySelectorAll: (selector) => selector === ".plot-marker" ? plots : [],
    querySelector: (selector) => selector === "#toggle-actions" ? {} :
      selector === 'meta[name="viewport"]' ? { content: "width=device-width, initial-scale=1, viewport-fit=cover" } : null,
    dispatchEvent(event) { dispatched.push(`document:${event.type}`); },
  };
  const window = {
    localStorage,
    addEventListener(type, callback) { events.set(type, callback); },
    dispatchEvent(event) { dispatched.push(`window:${event.type}`); },
  };
  if (!missingLandRegistry) {
    window.AzmaraLandStages = {
      forHallLevel(level) {
        const stage = Number(level) >= 5 ? "02" : "01";
        return { src: `assets/land/land-stage-${stage}.png` };
      },
    };
  }
  if (!missingBuildingRegistry) {
    window.AzmaraBuildingArt = {
      forBuilding(typeId, level) {
        if (typeof typeId !== "string" || !Number.isInteger(level)) return null;
        return { src: `assets/progression/${typeId}-stages-v2.png` };
      },
    };
  }
  if (bridge) window.AZMARASave = { postMessage(raw) { messages.push(JSON.parse(raw)); } };
  const context = vm.createContext({
    window, document, Storage, localStorage, sessionStorage,
    MutationObserver: class { observe() {} }, NodeFilter: { SHOW_TEXT: 4 },
    Image: class {
      constructor() { this.naturalWidth = 1536; }
      async decode() { if (badImage || this.url === badImageSource) throw new Error("decode"); }
      set src(value) {
        this.url = value;
        imageRequests.push(value);
        const broken = badImage || value === badImageSource;
        this.naturalWidth = broken ? 0 : 1536;
        queueMicrotask(() => broken ? this.onerror() : this.onload());
      }
    },
    Event: class { constructor(type) { this.type = type; } },
    requestAnimationFrame(callback) { queueMicrotask(callback); },
    setTimeout(callback) { const id = ++timerId; timers.set(id, callback); return id; },
    clearTimeout(id) { timers.delete(id); },
  });
  vm.runInContext(code, context, { filename: "native-bootstrap.js" });
  return { context, window, document, localStorage, sessionStorage, messages, scripts, timers, events, dispatched, imageRequests };
}

const settle = async () => { for (let i = 0; i < 30; i++) await Promise.resolve(); };

test("only the ready handshake is posted before native hydration; no game starts early", () => {
  const f = fixture({ seed: { [KEY]: town("Old WebKit container") } });
  assert.deepEqual(f.messages, [{ type: "ready" }]);
  assert.equal(f.scripts.length, 0);
  assert.equal(f.localStorage.getItem(KEY), town("Old WebKit container"));
});

test("native town is hydrated byte-for-byte before app.js loads; duplicate hydration cannot overwrite it", () => {
  const f = fixture({ seed: { [KEY]: town("Wrong file origin") } });
  const raw = town("Founder’s town", 3);
  f.window.AZMARA_NATIVE.hydrate({ town: raw, legacy: null });
  assert.equal(f.localStorage.getItem(KEY), raw);
  assert.equal(f.scripts.length, 1);
  assert.equal(f.scripts[0].src, "app.js");
  assert.deepEqual(f.messages, [{ type: "ready" }]);
  f.window.AZMARA_NATIVE.hydrate({ town: null, legacy: null });
  assert.equal(f.localStorage.getItem(KEY), raw);
  assert.equal(f.scripts.length, 1);
});

test("fresh native install clears only stale browser-origin v3/legacy mirrors, not unrelated data", () => {
  const f = fixture({ seed: { [KEY]: town("Stale"), [LEGACY]: "legacy", unrelated: "keep" } });
  f.window.AZMARA_NATIVE.hydrate({ town: null, legacy: null });
  assert.equal(f.localStorage.getItem(KEY), null);
  assert.equal(f.localStorage.getItem(LEGACY), null);
  assert.equal(f.localStorage.getItem("unrelated"), "keep");
  assert.equal(f.scripts.length, 1);
});

test("legacy hydration is read-only and never emitted as a native save", () => {
  const f = fixture();
  const legacy = '{"townName":"Historic town"}';
  f.window.AZMARA_NATIVE.hydrate({ town: null, legacy });
  assert.equal(f.localStorage.getItem(LEGACY), legacy);
  assert.equal(f.messages.some((m) => m.type === "save"), false);
  assert.throws(() => f.localStorage.removeItem(LEGACY), /explicit reset/);
});

test("missing/wrong-type hydration fails closed without starting or replacing a mirrored town", () => {
  for (const payload of [null, {}, { town: 4 }, { town: {} }]) {
    const raw = town("Retained town");
    const f = fixture({ seed: { [KEY]: raw } });
    f.window.AZMARA_NATIVE.hydrate(payload);
    assert.equal(f.scripts.length, 0);
    assert.equal(f.localStorage.getItem(KEY), raw);
    assert.deepEqual(f.messages.at(-1), { type: "failed" });
  }
});

test("writes before hydration are blocked, not default-forwarded", () => {
  const f = fixture();
  assert.throws(() => f.localStorage.setItem(KEY, town()), /not ready/);
  assert.equal(f.localStorage.getItem(KEY), null);
  assert.equal(f.messages.some((m) => m.type === "save"), false);
});

test("v3 writes are exactly sequenced, ack removes only the matching pending timeout", () => {
  const f = fixture();
  f.window.AZMARA_NATIVE.hydrate({ town: town(), legacy: null });
  const one = town("First save", 2);
  const two = town("Second save", 3);
  f.localStorage.setItem(KEY, one);
  f.localStorage.setItem(KEY, two);
  assert.deepEqual(f.messages.slice(1), [
    { type: "save", id: 1, value: one }, { type: "save", id: 2, value: two },
  ]);
  assert.equal(f.localStorage.getItem(KEY), two);
  assert.equal(f.timers.size, 2);
  f.window.AZMARA_NATIVE.ack(1);
  f.window.AZMARA_NATIVE.ack(999);
  assert.equal(f.timers.size, 1);
  f.window.AZMARA_NATIVE.ack(2);
  assert.equal(f.timers.size, 0);
});

test("unrelated local/session storage is untouched and implicit v3 clearing is blocked", () => {
  const f = fixture();
  f.window.AZMARA_NATIVE.hydrate({ town: town(), legacy: null });
  f.localStorage.setItem("unrelated", "keep");
  f.sessionStorage.setItem(KEY, "session only");
  assert.equal(f.messages.length, 1);
  assert.equal(f.localStorage.getItem("unrelated"), "keep");
  assert.equal(f.sessionStorage.getItem(KEY), "session only");
  assert.throws(() => f.localStorage.removeItem(KEY), /explicit reset/);
  assert.throws(() => f.localStorage.clear(), /implicitly cleared/);
  assert.equal(f.localStorage.getItem(KEY), town());
  f.sessionStorage.clear();
  assert.equal(f.sessionStorage.getItem(KEY), null);
});

test("missing/throwing bridge and unacknowledged saves fail closed, never send a default overwrite", () => {
  const missing = fixture({ bridge: false });
  missing.window.AZMARA_NATIVE.hydrate({ town: town(), legacy: null });
  assert.equal(missing.scripts.length, 0);
  const f = fixture();
  f.window.AZMARA_NATIVE.hydrate({ town: town(), legacy: null });
  f.localStorage.setItem(KEY, town("Pending"));
  [...f.timers.values()][0]();
  assert.deepEqual(f.messages.at(-1), { type: "failed" });
  assert.throws(() => f.localStorage.setItem(KEY, town("Must not reach native")), /not ready/);
  assert.equal(f.messages.filter((m) => m.type === "failed").length, 1);
  const throwing = fixture();
  throwing.window.AZMARA_NATIVE.hydrate({ town: town(), legacy: null });
  throwing.window.AZMARASave.postMessage = () => { throw new Error("transport"); };
  assert.throws(() => throwing.localStorage.setItem(KEY, town("Rejected")), /transport/);
  assert.equal(throwing.localStorage.getItem(KEY), town());
});

test("loaded health requires 23/22, role counts, decoded artwork and a saved town; resume is gated", async () => {
  const f = fixture();
  f.window.AZMARA_NATIVE.resume();
  assert.equal(f.dispatched.length, 0);
  f.window.AZMARA_NATIVE.hydrate({ town: town("Health town", 2), legacy: null });
  f.scripts[0].onload();
  await settle();
  const loaded = f.messages.find((m) => m.type === "loaded");
  assert.ok(loaded);
  for (const [key, value] of Object.entries({ plots: 23, empty: 22, occupied: 1,
    general: 19, wall: 1, harbour: 2, freighter: 1, imagesReady: true,
    hallLevel: 2, construction: false, saved: true, nativePresent: true,
    menu: true, nativeZoom: true })) assert.equal(loaded.health[key], value, key);
  assert.match(loaded.health.fingerprint, /^[a-f0-9]{8}$/);
  assert.deepEqual(f.imageRequests, ["assets/land/land-stage-01.png"]);
  f.window.AZMARA_NATIVE.resume();
  assert.deepEqual(f.dispatched, ["document:visibilitychange", "window:resize"]);
});

test("current saved occupancy is accepted instead of assuming only the Hall exists", async () => {
  const value = JSON.parse(town("Built town", 5));
  value.buildings = {
    "general-02": { typeId: "warehouse", level: 4 },
    "harbour-01": { typeId: "shipyard", level: 2 },
  };
  const f = fixture({ occupied: 3 });
  f.window.AZMARA_NATIVE.hydrate({ town: JSON.stringify(value), legacy: null });
  f.scripts[0].onload();
  await settle();
  const loaded = f.messages.find((m) => m.type === "loaded");
  assert.ok(loaded);
  assert.equal(loaded.health.occupied, 3);
  assert.equal(loaded.health.empty, 20);
  assert.deepEqual(f.imageRequests, [
    "assets/land/land-stage-02.png",
    "assets/progression/warehouse-stages-v2.png",
    "assets/progression/shipyard-stages-v2.png",
  ]);
});

test("active occupied-building artwork must decode before native readiness", async () => {
  const value = JSON.parse(town("Broken atlas", 5));
  value.buildings = {
    "general-02": { typeId: "warehouse", level: 4 },
  };
  const source = "assets/progression/warehouse-stages-v2.png";
  for (const options of [
    { badImageSource: source },
    { missingBuildingRegistry: true },
  ]) {
    const f = fixture({ ...options, occupied: 2 });
    f.window.AZMARA_NATIVE.hydrate({ town: JSON.stringify(value), legacy: null });
    f.scripts[0].onload();
    await settle();
    assert.equal(f.messages.some((m) => m.type === "loaded"), false);
    assert.deepEqual(f.messages.at(-1), { type: "failed" });
  }
});

test("missing plot, land registry or failed artwork produces failure instead of a loaded health claim", async () => {
  for (const options of [{ missingPlot: true }, { badImage: true }, { missingLandRegistry: true }]) {
    const f = fixture(options);
    f.window.AZMARA_NATIVE.hydrate({ town: town(), legacy: null });
    f.scripts[0].onload();
    await settle();
    assert.equal(f.messages.some((m) => m.type === "loaded"), false);
    assert.deepEqual(f.messages.at(-1), { type: "failed" });
    f.window.AZMARA_NATIVE.resume();
    assert.equal(f.dispatched.length, 0);
  }
});

test("uncaught errors and rejected promises stop the bridge once and prevent later writes", () => {
  const f = fixture();
  f.window.AZMARA_NATIVE.hydrate({ town: town(), legacy: null });
  f.events.get("error")();
  f.events.get("unhandledrejection")();
  assert.equal(f.messages.filter((m) => m.type === "failed").length, 1);
  assert.throws(() => f.localStorage.setItem(KEY, town("Blocked")), /not ready/);
});

test("app script load failure preserves the hydrated save and permanently blocks readiness", () => {
  const raw = town("Preserved after script failure", 3);
  const f = fixture();
  f.window.AZMARA_NATIVE.hydrate({ town: raw, legacy: null });
  f.scripts[0].onerror();
  f.scripts[0].onerror();
  f.window.AZMARA_NATIVE.resume();
  assert.equal(f.localStorage.getItem(KEY), raw);
  assert.equal(f.messages.some((m) => m.type === "loaded"), false);
  assert.equal(f.messages.filter((m) => m.type === "failed").length, 1);
  assert.deepEqual(f.dispatched, []);
  assert.throws(() => f.localStorage.setItem(KEY, town("Blocked")), /not ready/);
  assert.equal(f.localStorage.getItem(KEY), raw);
});

test("saved occupancy must match rendered plots before native readiness", async () => {
  const withoutHall = JSON.parse(town("Unplaced hall"));
  withoutHall.hallPlaced = false;
  const withBuilding = JSON.parse(town("Missing rendered warehouse"));
  withBuilding.buildings = { "general-02": { typeId: "warehouse", level: 4 } };
  for (const [raw, occupied] of [
    [town("Missing rendered hall"), 0],
    [town("Unexpected occupied plot"), 2],
    [JSON.stringify(withoutHall), 1],
    [JSON.stringify(withBuilding), 1],
  ]) {
    const f = fixture({ occupied });
    f.window.AZMARA_NATIVE.hydrate({ town: raw, legacy: null });
    f.scripts[0].onload();
    await settle();
    f.window.AZMARA_NATIVE.resume();
    assert.equal(f.messages.some((m) => m.type === "loaded"), false);
    assert.deepEqual(f.messages.at(-1), { type: "failed" });
    assert.deepEqual(f.dispatched, []);
    assert.throws(() => f.localStorage.setItem(KEY, town("Blocked")), /not ready/);
    assert.equal(f.localStorage.getItem(KEY), raw);
  }
});

test("missing or malformed saved towns fail health without replacing native progress", async () => {
  for (const raw of [null, "", "{not valid JSON"]) {
    const f = fixture();
    f.window.AZMARA_NATIVE.hydrate({ town: raw, legacy: null });
    f.scripts[0].onload();
    await settle();
    f.window.AZMARA_NATIVE.resume();
    assert.equal(f.messages.some((m) => m.type === "loaded"), false);
    assert.deepEqual(f.messages.at(-1), { type: "failed" });
    assert.deepEqual(f.dispatched, []);
    assert.throws(() => f.localStorage.setItem(KEY, town("Default overwrite")), /not ready/);
    assert.equal(f.localStorage.getItem(KEY), raw);
  }
});
