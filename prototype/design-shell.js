"use strict";

/* Presentation-only bridge for the approved floating information shell.
   It mirrors the existing authoritative HUD values and remembers only whether
   the player folded the desktop dock. It never writes game progress. */
(() => {
  const STORAGE_KEY = "azmara-ui-dock-collapsed-v1";
  const byId = (id) => document.getElementById(id);
  const sources = {
    "desktop-town-name": "floating-town-name",
    "counter-population": "floating-population",
    "desktop-resource-coins": "floating-resource-coins",
    "desktop-resource-timber": "floating-resource-timber",
    "desktop-resource-stone": "floating-resource-stone",
    "desktop-resource-silver": "floating-resource-silver",
    "desktop-resource-grain": "floating-resource-grain",
    "desktop-resource-iron": "floating-resource-iron"
  };

  function mirror(sourceId, targetId) {
    const source = byId(sourceId), target = byId(targetId);
    if (!source || !target) return;
    const text = source.textContent.trim();
    target.textContent = text || "—";
  }

  function syncValues() {
    Object.entries(sources).forEach(([source, target]) => mirror(source, target));
  }

  const dock = byId("azmara-side-dock");
  const toggle = byId("azmara-dock-toggle");
  const reveal = byId("azmara-dock-reveal");

  function savedCollapsed() {
    try { return localStorage.getItem(STORAGE_KEY) === "true"; }
    catch { return false; }
  }

  function setCollapsed(collapsed, remember = true) {
    document.body.dataset.azmaraDockCollapsed = String(Boolean(collapsed));
    toggle?.setAttribute("aria-expanded", String(!collapsed));
    if (reveal) reveal.hidden = !collapsed;
    if (dock) dock.inert = Boolean(collapsed);
    if (remember) {
      try { localStorage.setItem(STORAGE_KEY, String(Boolean(collapsed))); }
      catch { /* The shell remains usable when browser storage is unavailable. */ }
    }
  }

  toggle?.addEventListener("click", () => setCollapsed(true));
  reveal?.addEventListener("click", () => {
    setCollapsed(false);
    toggle?.focus({ preventScroll: true });
  });

  Object.keys(sources).forEach((id) => {
    const source = byId(id);
    if (source) new MutationObserver(syncValues).observe(source, { childList: true, characterData: true, subtree: true });
  });

  setCollapsed(savedCollapsed(), false);
  syncValues();
})();
