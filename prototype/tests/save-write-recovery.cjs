"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../app.js"), "utf8");
const start = source.indexOf("  function saveState() {");
assert.notEqual(start, -1, "Missing the prototype save function");
const end = source.indexOf("\n  function announce(", start);
assert.notEqual(end, -1, "Missing the end of the prototype save function");
const saveScript = new vm.Script(source.slice(start, end), { filename: "app.js" });

const key = "azmara-town-layout-v3";

function createFixture() {
  const writes = [];
  const stored = new Map();
  const storage = { writable: true };
  const context = vm.createContext({
    STORAGE_KEY: key,
    storageAvailable: true,
    lastSavedState: null,
    state: {
      version: 3,
      layoutId: "town-23-v1",
      townName: "First town",
      hallLevel: 1,
      resources: { coins: 2400, timber: 760, stone: 540 },
      construction: null
    },
    localStorage: {
      setItem(name, value) {
        writes.push(name);
        if (!storage.writable) throw new Error("Simulated storage write failure");
        stored.set(name, value);
      }
    }
  });
  saveScript.runInContext(context);
  context.saveState();
  return { context, storage, stored, writes };
}

test("a failed town save preserves the previous bytes and retries the pending change", () => {
  const { context, storage, stored, writes } = createFixture();
  const previous = JSON.stringify(context.state);
  assert.equal(stored.get(key), previous);

  storage.writable = false;
  context.state.townName = "Renamed town";
  context.saveState();
  assert.equal(stored.get(key), previous);
  assert.equal(context.storageAvailable, false);
  assert.deepEqual(writes, [key, key]);

  storage.writable = true;
  context.saveState();
  assert.equal(stored.get(key), JSON.stringify(context.state));
  assert.equal(context.storageAvailable, true);

  context.saveState();
  assert.deepEqual(writes, [key, key, key], "A confirmed save should not be repeated");
});

test("a failed write is retried even when the state matches the last successful save", () => {
  const { context, storage, stored, writes } = createFixture();
  const previous = JSON.stringify(context.state);
  const originalName = context.state.townName;

  storage.writable = false;
  context.state.townName = "Unsaved town";
  context.saveState();
  assert.equal(context.storageAvailable, false);

  storage.writable = true;
  context.state.townName = originalName;
  context.saveState();
  assert.equal(context.storageAvailable, true);
  assert.equal(stored.get(key), previous);
  assert.deepEqual(writes, [key, key, key]);
});
