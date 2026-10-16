"use strict";

// Build-time-painted street layers. Runtime selects one flattened PNG for the
// active layout/profile; it never draws, routes, or filters roads in code.
(() => {
  const bounds = Object.freeze({
    desktop: Object.freeze({ x: 0, y: 0, width: 4200, height: 2400 }),
    compact: Object.freeze({ x: 1600, y: 960, width: 2800, height: 2800 })
  });
  const layouts = Object.freeze(["staggered", "grid", "circle", "avenues", "garden-quarters"]);
  const asset = (layout, { desktop = false } = {}) => {
    const id = layouts.includes(layout) ? layout : layouts[0], profile = desktop ? "desktop" : "compact", box = bounds[profile];
    return Object.freeze({ id, profile, ...box, src: `assets/streets/${id}-${profile}-v2.png` });
  };
  const markup = (layout, options = {}) => {
    const item = asset(layout, options);
    return `<image data-street-ground="${item.id}-${item.profile}" href="${item.src}" x="${item.x}" y="${item.y}" width="${item.width}" height="${item.height}" preserveAspectRatio="none" style="stroke:none;pointer-events:none"/>`;
  };
  const pinMarkup = (id, kind = "general") => {
    if (kind === "wall") return null;
    const safe = String(id).replace(/[^a-z0-9-]/gi, ""), label = kind === "harbour" ? "C" : kind === "freighter" ? "F" : "";
    return `<svg class="empty-plot-art town-site-pin" viewBox="0 0 320 270" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-town-site-pin="${safe}"><ellipse cx="164" cy="172" rx="22" ry="7" fill="#60442d" opacity=".22"/><path d="M155 170V105" fill="none" stroke="#704a2c" stroke-width="8"/><path d="M158 106l43 14-43 23Z" fill="#2f8279" stroke="#f0d89f" stroke-width="4"/><circle cx="155" cy="174" r="8" fill="#b77e42"/>${label ? `<text x="174" y="129" font-family="Arial,sans-serif" font-size="18" font-weight="700" fill="#fff1ce">${label}</text>` : ""}</svg>`;
  };
  window.AzmaraStreetGround = Object.freeze({ asset, markup, pinMarkup, bounds, layouts });
})();
