"use strict";

// Native-only adapter: the canonical game and its v3 contract stay unchanged.
(() => {
  const KEY = "azmara-town-layout-v3";
  const LEGACY = "azmara-town-design-v1";
  const nativeSet = Storage.prototype.setItem;
  const nativeRemove = Storage.prototype.removeItem;
  const nativeClear = Storage.prototype.clear;
  let hydrated = false;
  let nativePresent = false;
  let failed = false;
  let loaded = false;
  let sequence = 0;
  const pending = new Map();

  // Native-only wording: browser source stays byte-for-byte unchanged.
  function updateSaveCopy() {
    document.querySelectorAll(".panel-note, .rename-help").forEach((element) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const next = node.nodeValue
          .replace("Progress is saved only in this browser.", "Progress is saved on this iPhone.")
          .replace("saved only in this browser", "saved on this iPhone");
        if (next !== node.nodeValue) node.nodeValue = next;
      }
    });
    document.querySelectorAll(".overview-facts > div").forEach((row) => {
      if (row.querySelector("dt")?.textContent !== "Saved progress") return;
      const value = row.querySelector("dd");
      if (value?.textContent === "This browser only") value.textContent = "This iPhone only";
    });
    const warning = document.querySelector(".progress-warning p");
    const copy = "Progress is saved in this AZMARA app on this iPhone. Safari, the website and other devices have separate progress. Removing this app can erase its saved progress; this is not a cloud backup.";
    if (warning && warning.textContent !== copy) warning.textContent = copy;
  }
  new MutationObserver(updateSaveCopy).observe(document.body, { childList: true, subtree: true });

  function post(data) {
    if (!window.AZMARASave || typeof window.AZMARASave.postMessage !== "function") {
      throw new Error("Native save bridge is missing.");
    }
    window.AZMARASave.postMessage(JSON.stringify(data));
  }
  function failure() {
    if (failed) return;
    failed = true;
    try { post({ type: "failed" }); } catch { /* Native timeout fails closed. */ }
  }
  function save(raw) {
    if (failed || !hydrated) throw new Error("Native save is not ready.");
    const id = ++sequence;
    const timer = setTimeout(failure, 15000);
    pending.set(id, timer);
    try { post({ type: "save", id, value: raw }); }
    catch (error) {
      clearTimeout(timer);
      pending.delete(id);
      failure();
      throw error;
    }
  }

  Storage.prototype.setItem = function (key, value) {
    if (this !== window.localStorage || String(key) !== KEY) {
      return nativeSet.call(this, key, value);
    }
    save(String(value));
    return nativeSet.call(this, key, value);
  };
  Storage.prototype.removeItem = function (key) {
    if (this === window.localStorage && [KEY, LEGACY].includes(String(key))) {
      throw new Error("Use the game's explicit reset, not storage removal.");
    }
    return nativeRemove.call(this, key);
  };
  Storage.prototype.clear = function () {
    if (this === window.localStorage) {
      throw new Error("Native preview storage cannot be implicitly cleared.");
    }
    return nativeClear.call(this);
  };

  // Non-cryptographic checksum is an opt-in comparison marker, not security.
  function fingerprint(raw) {
    let hash = 2166136261;
    for (let i = 0; i < raw.length; i++) {
      hash = Math.imul(hash ^ raw.charCodeAt(i), 16777619) >>> 0;
    }
    return hash.toString(16).padStart(8, "0");
  }
  function health() {
    const plots = [...document.querySelectorAll(".plot-marker")];
    const saved = localStorage.getItem(KEY);
    const value = saved ? JSON.parse(saved) : null;
    return {
      plots: plots.length,
      empty: plots.filter((plot) => plot.dataset.occupied === "false").length,
      occupied: plots.filter((plot) => plot.dataset.occupied === "true").length,
      general: plots.filter((plot) => plot.dataset.kind === "general").length,
      wall: plots.filter((plot) => plot.dataset.kind === "wall").length,
      harbour: plots.filter((plot) => plot.dataset.kind === "harbour").length,
      freighter: plots.filter((plot) => plot.dataset.kind === "freighter").length,
      imagesReady: [...document.images].every((image) => image.complete && image.naturalWidth > 0),
      hallLevel: value?.hallLevel,
      construction: value?.construction !== null,
      saved: Boolean(saved),
      nativePresent,
      fingerprint: saved ? fingerprint(saved) : null,
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
      menu: Boolean(document.querySelector("#toggle-actions")),
      nativeZoom: document.querySelector('meta[name="viewport"]')?.content.includes("user-scalable=no") !== true,
    };
  }
  async function finished() {
    const filenames = ["azmara-starting-terrain-v3.png", "azmara-town-hall-v3.png", "azmara-empty-plot-v3.png"];
    await Promise.all(filenames.map((name) => new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = resolve;
      image.onerror = reject;
      image.src = `assets/${name}`;
    })));
    await Promise.all([...document.images].map((image) => image.decode()));
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const result = health();
    if (result.plots !== 23 || result.empty !== 22 || result.occupied !== 1 ||
        result.general !== 19 || result.wall !== 1 || result.harbour !== 2 ||
        result.freighter !== 1 || !result.imagesReady || !result.menu || !result.saved) {
      throw new Error("Bundled town health check failed.");
    }
    loaded = true;
    post({ type: "loaded", health: result });
  }
  window.AZMARA_NATIVE = Object.freeze({
    hydrate(payload) {
      if (hydrated || failed) return;
      try {
        if (!payload || !Object.prototype.hasOwnProperty.call(payload, "town")) {
          throw new Error("Missing native hydration.");
        }
        nativePresent = payload.town !== null;
        if (payload.town === null) nativeRemove.call(localStorage, KEY);
        else if (typeof payload.town === "string") nativeSet.call(localStorage, KEY, payload.town);
        else throw new Error("Invalid native hydration.");
        if (payload.legacy !== null && typeof payload.legacy === "string") {
          nativeSet.call(localStorage, LEGACY, payload.legacy);
        } else {
          nativeRemove.call(localStorage, LEGACY);
        }
        hydrated = true;
        const script = document.createElement("script");
        script.src = "app.js";
        script.onload = () => finished().catch(failure);
        script.onerror = failure;
        document.head.appendChild(script);
      } catch { failure(); }
    },
    ack(id) {
      const timer = pending.get(id);
      if (timer !== undefined) {
        clearTimeout(timer);
        pending.delete(id);
      }
    },
    resume() {
      if (!loaded || failed) return;
      document.dispatchEvent(new Event("visibilitychange"));
      window.dispatchEvent(new Event("resize"));
    },
    health,
  });
  window.addEventListener("error", failure);
  window.addEventListener("unhandledrejection", failure);
  try { post({ type: "ready" }); } catch { failure(); }
})();
