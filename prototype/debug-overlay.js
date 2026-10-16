/* Local-only planning grid. It is not a tilemap or a physics implementation. */
(() => {
  "use strict";
  if (!["localhost", "127.0.0.1", "[::1]"].includes(location.hostname) ||
      new URLSearchParams(location.search).get("debug") !== "1") return;
  const viewport = document.querySelector("#map-viewport");
  const map = document.querySelector("#town-map");
  const landscape = document.querySelector("#world-landscape");
  if (!viewport || !map || !landscape || document.querySelector("#town-debug-grid")) return;
  const CELL = 100; // World units; no existing plot, artwork or save is snapped.
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.id = "town-debug-grid";
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("aria-hidden", "true");
  svg.dataset.cellSize = String(CELL);
  svg.dataset.enabled = "false";
  svg.dataset.collisionSource = "not-implemented";
  svg.style.cssText = "position:absolute;inset:0;width:100%;height:100%;z-index:2;pointer-events:none;fill:none;stroke:none;display:none";
  const info = document.createElement("div");
  info.id = "town-debug-info";
  info.hidden = true;
  info.setAttribute("aria-live", "off");
  const title = document.createElement("strong");
  title.textContent = "LOCAL DEBUG · G to hide";
  const description = document.createElement("div");
  description.textContent = "Planning cells: 100×100 world units · not a tilemap";
  const axes = document.createElement("div");
  axes.textContent = "Origin (0,0): scene upper-left · X → · Y ↓";
  const collisions = document.createElement("div");
  collisions.id = "debug-collision-status";
  collisions.textContent = "Gameplay collisions: not implemented · no red shapes";
  collisions.style.color = "#ffaaa4";
  const cursor = document.createElement("div");
  cursor.id = "debug-grid-cursor";
  cursor.textContent = "Move over the map for exact cell coordinates";
  info.append(title, description, axes, collisions, cursor);
  const style = document.createElement("style");
  style.textContent = `#town-debug-info{position:absolute;left:12px;bottom:78px;z-index:3;max-width:calc(100% - 24px);padding:8px 11px;border:1px solid #69c8c8;border-radius:4px;background:#13282eef;color:#d7ffff;font:11px/1.55 ui-monospace,SFMono-Regular,monospace;pointer-events:none}
    #town-debug-info[hidden]{display:none!important}#town-debug-info strong{display:block;color:#fff}
    body[data-preview-mode="gameplay"] #town-debug-grid,body[data-preview-mode="gameplay"] #town-debug-info{display:none!important}
    @media(max-width:1023px),(max-height:599px){#town-debug-info{bottom:12px;font-size:10px}}`;
  document.head.append(style);
  map.append(svg);
  document.querySelector(".scene").append(info);
  let enabled = false, frame = 0, lastPointer = null;
  const available = () => !viewport.hidden && document.body.dataset.previewMode === "dev";
  const node = (tag, attributes, text) => {
    const result = document.createElementNS(ns, tag);
    Object.entries(attributes).forEach(([key, value]) => result.setAttribute(key, String(value)));
    if (text !== undefined) result.textContent = text;
    return result;
  };
  function draw() {
    frame = 0;
    if (document.body.dataset.previewMode !== "dev") enabled = false;
    svg.dataset.enabled = String(enabled);
    const shown = enabled && available();
    svg.style.display = shown ? "block" : "none";
    info.hidden = !shown;
    if (!shown) return;
    // The authoritative world viewBox/CTM already includes actual camera zoom,
    // responsive world origin and native browser scrolling. Never copy fit logic.
    const viewBox = landscape.getAttribute("viewBox");
    svg.setAttribute("viewBox", viewBox);
    const matrix = svg.getScreenCTM();
    if (!matrix) return;
    const inverse = matrix.inverse(), rect = viewport.getBoundingClientRect();
    const a = new DOMPoint(rect.left, rect.top).matrixTransform(inverse);
    const b = new DOMPoint(rect.right, rect.bottom).matrixTransform(inverse);
    const scale = Math.min(Math.hypot(matrix.a, matrix.b), Math.hypot(matrix.c, matrix.d));
    if (!Number.isFinite(scale) || scale <= 0) return;
    const left = Math.floor(a.x / CELL), top = Math.floor(a.y / CELL);
    const right = Math.ceil(b.x / CELL), bottom = Math.ceil(b.y / CELL);
    let stride = 1;
    while (CELL * scale * stride < 60) stride *= 2;
    svg.dataset.labelStride = String(stride);
    description.textContent = `Planning cells: 100×100 units · labels every ${stride} cell${stride === 1 ? "" : "s"}`;
    const fragment = document.createDocumentFragment();
    const lines = node("g", { id: "debug-grid-lines" });
    for (let x = left; x <= right; x++) lines.append(node("line", { x1: x * CELL, y1: a.y, x2: x * CELL, y2: b.y,
      stroke: x % 5 === 0 ? "#277777" : "#8ad8d8", "stroke-opacity": x % 5 === 0 ? ".85" : ".55", "stroke-width": x % 5 === 0 ? "1.5" : "1", "vector-effect": "non-scaling-stroke" }));
    for (let y = top; y <= bottom; y++) lines.append(node("line", { x1: a.x, y1: y * CELL, x2: b.x, y2: y * CELL,
      stroke: y % 5 === 0 ? "#277777" : "#8ad8d8", "stroke-opacity": y % 5 === 0 ? ".85" : ".55", "stroke-width": y % 5 === 0 ? "1.5" : "1", "vector-effect": "non-scaling-stroke" }));
    fragment.append(lines);
    const labels = node("g", { id: "debug-grid-coordinates", fill: "#ecffff", stroke: "#173339", "stroke-width": 2.5 / scale,
      "paint-order": "stroke", "font-size": 10 / scale, "font-family": "ui-monospace,monospace", "text-anchor": "middle" });
    for (let x = Math.ceil(left / stride) * stride; x < right; x += stride)
      for (let y = Math.ceil(top / stride) * stride; y < bottom; y += stride)
        labels.append(node("text", { x: (x + .5) * CELL, y: (y + .5) * CELL, "data-cell": `${x},${y}` }, `${x},${y}`));
    fragment.append(labels);
    const anchors = node("g", { id: "debug-plot-coordinates", fill: "#ffe598", stroke: "#231b0f", "stroke-width": 3 / scale,
      "paint-order": "stroke", "font-size": 11 / scale, "font-family": "ui-monospace,monospace", "text-anchor": "middle" });
    for (const plot of document.querySelectorAll("#town-core .plot-marker")) {
      const r = plot.getBoundingClientRect();
      const anchor = new DOMPoint(r.left + r.width / 2, r.top + r.height / 2).matrixTransform(inverse);
      const label = new DOMPoint(r.left + r.width / 2, r.top - 5).matrixTransform(inverse);
      const cell = [Math.floor(anchor.x / CELL), Math.floor(anchor.y / CELL)];
      const short = plot.dataset.plot.startsWith("general-") ? plot.dataset.plot.slice(-2)
        : plot.dataset.plot === "wall-01" ? "W" : plot.dataset.plot.startsWith("harbour-") ? "C" + plot.dataset.plot.slice(-1) : "F";
      anchors.append(node("text", { x: label.x, y: label.y, "data-plot-id": plot.dataset.plot,
        "data-world-x": anchor.x, "data-world-y": anchor.y, "data-cell": cell.join(",") }, `${short} [${cell.join(",")}]`));
    }
    fragment.append(anchors);
    // There is NO gameplay collision world in this prototype. Deliberately
    // empty: neither clickable plot rectangles nor scenic wall contours are
    // colliders. Future physics must expose its live shapes, not a debug copy.
    fragment.append(node("g", { id: "debug-real-collisions", stroke: "#ff2525", fill: "#ff252520", "data-source": "not-implemented", "data-count": "0" }));
    svg.replaceChildren(fragment);
    updateCursor();
  }
  function updateCursor() {
    const matrix = svg.getScreenCTM(), rect = viewport.getBoundingClientRect();
    if (!lastPointer || !matrix || lastPointer.x < rect.left || lastPointer.x > rect.right ||
        lastPointer.y < rect.top || lastPointer.y > rect.bottom) {
      cursor.textContent = "Move over the map for exact cell coordinates";
      return;
    }
    const p = new DOMPoint(lastPointer.x, lastPointer.y).matrixTransform(matrix.inverse());
    cursor.textContent = `Cell (${Math.floor(p.x / CELL)},${Math.floor(p.y / CELL)}) · world (${p.x.toFixed(1)},${p.y.toFixed(1)})`;
  }
  function refresh() { if (!frame) frame = requestAnimationFrame(draw); }
  document.addEventListener("keydown", event => {
    if (event.key.toLowerCase() !== "g" || event.repeat || event.isComposing || event.ctrlKey || event.metaKey || event.altKey ||
        !available() || document.querySelector("dialog[open]") ||
        event.target.closest?.("input,textarea,select,[contenteditable]:not([contenteditable='false'])")) return;
    event.preventDefault(); enabled = !enabled; draw();
  });
  viewport.addEventListener("pointermove", event => {
    if (!enabled || !available()) return;
    lastPointer = { x: event.clientX, y: event.clientY };
    updateCursor();
  }, { passive: true });
  viewport.addEventListener("pointerleave", () => { lastPointer = null; updateCursor(); }, { passive: true });
  viewport.addEventListener("scroll", refresh, { passive: true });
  new ResizeObserver(refresh).observe(viewport);
  const observer = new MutationObserver(records => {
    if (records.some(record => record.target === document.body)) enabled = false;
    refresh();
  });
  observer.observe(landscape, { attributes: true, attributeFilter: ["viewBox"] });
  observer.observe(viewport, { attributes: true, attributeFilter: ["hidden"] });
  observer.observe(document.body, { attributes: true, attributeFilter: ["data-preview-mode"] });
  observer.observe(map, { attributes: true, attributeFilter: ["data-plot-layout", "data-presentation"] });
})();
