"use strict";

// Deterministic build-time compositor for AZMARA's decorative town streets.
// The browser receives only flattened PNG layers: no live road strokes,
// filters, path finding, plot movement, or saved-state changes.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const dependencyRoot = process.env.AZMARA_NODE_MODULES;
const sharp = dependencyRoot ? require(path.join(dependencyRoot, "sharp")) : require("sharp");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "assets", "streets");
const layoutContext = vm.createContext({ window: {} });
vm.runInContext(fs.readFileSync(path.join(root, "town-layouts.js"), "utf8"), layoutContext, { filename: "town-layouts.js" });
const layouts = layoutContext.window.AzmaraTownLayouts.layouts;
const atlasFile = path.join(root, "assets", "oasis-pilot", "shade-pockets-v2.png");
const atlasData = `data:image/png;base64,${fs.readFileSync(atlasFile).toString("base64")}`;

const profiles = {
  desktop: {
    bounds: { x: 0, y: 0, width: 4200, height: 2400 },
    routeBounds: { left: 690, top: 330, right: 3510, bottom: 2070 },
    gate: [2100, 400], hall: [2100, 1150], dedicated: { "harbour-01": [1230, 1700], "harbour-02": [2970, 1700], "freighter-01": [2100, 1820] },
    step: 20, plotRadius: [110, 62], hallRadius: [150, 85], contact: [82, 48], laneWidth: 52, mainWidth: 150, squareRadius: [188, 103], gardenWidth: 150
  },
  compact: {
    bounds: { x: 1600, y: 960, width: 2800, height: 2800 },
    routeBounds: { left: 2200, top: 1560, right: 3880, bottom: 3190 },
    gate: [3150, 1620], hall: [2980, 2380], dedicated: { "harbour-01": [2445, 2830], "harbour-02": [2990, 2985], "freighter-01": [3555, 3010] },
    step: 14, plotRadius: [76, 48], hallRadius: [110, 65], contact: [58, 34], laneWidth: 38, mainWidth: 104, squareRadius: [132, 74], gardenWidth: 104
  }
};
const slope = .55;
const xml = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]);
const n = value => Number(value).toFixed(2).replace(/\.00$/, "");
const nodeKey = ([a, b]) => `${a},${b}`;
const fromKey = value => value.split(",").map(Number);
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const segmentDistance = (point, a, b) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], length = dx * dx + dy * dy;
  const t = length ? Math.max(0, Math.min(1, ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / length)) : 0;
  return Math.hypot(point[0] - a[0] - t * dx, point[1] - a[1] - t * dy);
};

function makePlan(layout, profileName) {
  const profile = profiles[profileName], desktop = profileName === "desktop", anchors = layout.anchors[profileName];
  const plots = Object.entries(anchors).map(([id, point]) => ({ id, x: point.x, y: point.y }))
    .concat(Object.entries(profile.dedicated).map(([id, [x, y]]) => ({ id, x, y })));
  const hall = { id: "general-01", x: profile.hall[0], y: profile.hall[1], rx: profile.hallRadius[0], ry: profile.hallRadius[1] };
  const obstacles = [hall, ...plots.map(plot => ({ ...plot, rx: profile.plotRadius[0], ry: profile.plotRadius[1] }))];
  const screen = ([a, b]) => [profile.step * (a + b), profile.step * slope * (a - b)];
  const lattice = ([x, y]) => [Math.round((x + y / slope) / (2 * profile.step)), Math.round((x - y / slope) / (2 * profile.step))];
  const inside = node => { const [x, y] = screen(node), b = profile.routeBounds; return x >= b.left && x <= b.right && y >= b.top && y <= b.bottom; };
  const blocked = (node, owner = null, margin = 0) => {
    const [x, y] = screen(node);
    return obstacles.some(obstacle => obstacle.id !== owner && Math.abs(x - obstacle.x) / (obstacle.rx + margin) + Math.abs(y - obstacle.y) / (obstacle.ry + margin) < 1);
  };
  const neighbours = ([a, b]) => [[a + 1, b], [a - 1, b], [a, b + 1], [a, b - 1]];
  const simplify = nodes => nodes.filter((node, index) => {
    if (!index || index === nodes.length - 1) return true;
    const before = nodes[index - 1], after = nodes[index + 1];
    return !((node[0] - before[0] === after[0] - node[0]) && (node[1] - before[1] === after[1] - node[1]));
  });

  function findPath(startPoint, goals, owner = null, margin = 0) {
    const start = lattice(startPoint), startKey = nodeKey(start), goalNodes = [...goals].map(fromKey);
    const heap = [], costs = new Map([[startKey, 0]]), parents = new Map(), closed = new Set();
    const heuristic = node => goalNodes.reduce((best, goal) => Math.min(best, Math.abs(node[0] - goal[0]) + Math.abs(node[1] - goal[1])), Infinity);
    const push = item => { heap.push(item); let at = heap.length - 1; while (at) { const parent = (at - 1) >> 1; if (heap[parent].f <= item.f) break; heap[at] = heap[parent]; at = parent; } heap[at] = item; };
    const pop = () => { const first = heap[0], tail = heap.pop(); if (heap.length) { let at = 0; while (at * 2 + 1 < heap.length) { let child = at * 2 + 1; if (child + 1 < heap.length && heap[child + 1].f < heap[child].f) child++; if (heap[child].f >= tail.f) break; heap[at] = heap[child]; at = child; } heap[at] = tail; } return first; };
    push({ node: start, g: 0, f: heuristic(start) });
    while (heap.length) {
      const current = pop(), currentKey = nodeKey(current.node);
      if (closed.has(currentKey)) continue;
      if (goals.has(currentKey)) {
        const route = [current.node]; let cursor = currentKey;
        while (parents.has(cursor)) { cursor = parents.get(cursor); route.push(fromKey(cursor)); }
        return simplify(route.reverse());
      }
      closed.add(currentKey);
      for (const next of neighbours(current.node)) {
        const nextKey = nodeKey(next); if (closed.has(nextKey) || !inside(next) || blocked(next, owner, margin)) continue;
        const cost = current.g + 1; if (cost >= (costs.get(nextKey) ?? Infinity)) continue;
        costs.set(nextKey, cost); parents.set(nextKey, currentKey); push({ node: next, g: cost, f: cost + heuristic(next) });
      }
    }
    throw new Error(`No ${profileName}/${layout.id} street route from ${startPoint.join(",")}`);
  }

  // The civic square sits immediately at the Hall's public face. Keeping it
  // close avoids consuming the fixed southern plot in the Circle arrangement.
  const square = [profile.hall[0], profile.hall[1] + (desktop ? 130 : 92)];
  const main = findPath(profile.gate, new Set([nodeKey(lattice(square))]), null, profileName === "desktop" ? 16 : 12);
  const network = new Set();
  const addToNetwork = nodes => {
    for (let index = 1; index < nodes.length; index++) {
      let cursor = nodes[index - 1].slice(), target = nodes[index]; network.add(nodeKey(cursor));
      while (nodeKey(cursor) !== nodeKey(target)) { cursor = [cursor[0] + Math.sign(target[0] - cursor[0]), cursor[1] + Math.sign(target[1] - cursor[1])]; network.add(nodeKey(cursor)); }
    }
  };
  addToNetwork(main);
  const offsets = { NE: [profile.contact[0], -profile.contact[1]], SE: [profile.contact[0], profile.contact[1]], SW: [-profile.contact[0], profile.contact[1]], NW: [-profile.contact[0], -profile.contact[1]] };
  const contacts = {}, lanes = [], remaining = new Map(plots.map(plot => [plot.id, plot]));
  while (remaining.size) {
    let chosen = null;
    for (const plot of remaining.values()) for (const [side, offset] of Object.entries(offsets)) {
      const terminal = [plot.x + offset[0], plot.y + offset[1]], at = lattice(terminal);
      const near = Math.min(...[...network].map(value => distance(screen(fromKey(value)), screen(at))));
      if (!chosen || near < chosen.near) chosen = { plot, side, terminal, near };
    }
    let best = null;
    for (const [side, offset] of Object.entries(offsets)) {
      const terminal = [chosen.plot.x + offset[0], chosen.plot.y + offset[1]];
      try {
        const route = findPath(terminal, network, chosen.plot.id, profileName === "desktop" ? 10 : 7);
        const length = route.slice(1).reduce((sum, node, index) => sum + distance(screen(route[index]), screen(node)), 0);
        if (!best || length < best.length) best = { side, terminal, route, length };
      } catch {}
    }
    if (!best) throw new Error(`No side contact for ${profileName}/${layout.id}/${chosen.plot.id}`);
    contacts[chosen.plot.id] = best.side; lanes.push({ id: chosen.plot.id, nodes: best.route, terminal: best.terminal }); addToNetwork(best.route); remaining.delete(chosen.plot.id);
  }
  const routes = [main, ...lanes.map(lane => lane.nodes)];
  const segments = routes.flatMap(nodes => nodes.slice(1).map((node, index) => [screen(nodes[index]), screen(node)]));
  const candidates = [];
  for (let y = profile.routeBounds.top + 80; y <= profile.routeBounds.bottom - 80; y += desktop ? 135 : 105) for (let x = profile.routeBounds.left + 90; x <= profile.routeBounds.right - 90; x += desktop ? 155 : 120) {
    if (obstacles.some(obstacle => Math.abs(x - obstacle.x) / (obstacle.rx + profile.gardenWidth * .62) + Math.abs(y - obstacle.y) / (obstacle.ry + profile.gardenWidth * .45) < 1)) continue;
    if (segments.some(([a, b]) => segmentDistance([x, y], a, b) < profile.gardenWidth * .58)) continue;
    const separation = candidates.reduce((best, p) => Math.min(best, distance([x, y], p)), Infinity);
    candidates.push([x, y, separation]);
  }
  candidates.sort((a, b) => b[2] - a[2] || a[1] - b[1] || a[0] - b[0]);
  const gardens = [];
  for (const candidate of candidates) {
    if (gardens.some(p => distance(candidate, p) < profile.gardenWidth * 1.7)) continue;
    gardens.push(candidate.slice(0, 2)); if (gardens.length === (desktop ? 8 : 6)) break;
  }
  const validAxes = segments.every(([a, b]) => { const dx = Math.abs(b[0] - a[0]), dy = Math.abs(b[1] - a[1]); return dx > 0 && Math.abs(dy / dx - slope) < .0001; });
  return { profileName, layout: layout.id, profile, screen, plots, hall, main, lanes, square, contacts, gardens, segmentCount: segments.length, validAxes };
}

function ribbonSegment(a, b, width) {
  const dx = b[0] - a[0], dy = b[1] - a[1], length = Math.hypot(dx, dy) || 1, ox = -dy / length * width / 2, oy = dx / length * width / 2;
  return [[a[0] + ox, a[1] + oy], [b[0] + ox, b[1] + oy], [b[0] - ox, b[1] - oy], [a[0] - ox, a[1] - oy]];
}
const polygon = (points, attrs) => `<polygon points="${points.map(([x, y]) => `${n(x)},${n(y)}`).join(" ")}" ${attrs}/>`;
function ribbon(plan, nodes, width, attrs) {
  const points = nodes.map(plan.screen), output = [];
  for (let index = 1; index < points.length; index++) output.push(polygon(ribbonSegment(points[index - 1], points[index], width), attrs));
  for (const [x, y] of points.slice(1, -1)) output.push(polygon([[x, y - width * .42], [x + width * .72, y], [x, y + width * .42], [x - width * .72, y]], attrs));
  return output.join("");
}
function roadMask(plan, id, roads, width) {
  const bodies = roads.map(nodes => ribbon(plan, nodes, width, 'fill="white"')).join("");
  const bites = roads.flatMap((nodes, roadIndex) => nodes.map(plan.screen).slice(1).flatMap((b, index, points) => {
    const a = nodes.map(plan.screen)[index], dx = b[0] - a[0], dy = b[1] - a[1], length = Math.hypot(dx, dy) || 1, nx = -dy / length, ny = dx / length;
    return [.27, .71].flatMap((ratio, biteIndex) => {
      if ((roadIndex + index + biteIndex) % 4 === 0) return [];
      const side = (roadIndex + index + biteIndex) % 2 ? 1 : -1, x = a[0] + dx * ratio + nx * width * .48 * side, y = a[1] + dy * ratio + ny * width * .48 * side;
      return `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(3 + (roadIndex + index) % 5)}" ry="${n(2 + index % 3)}" fill="black" transform="rotate(${n(Math.atan2(dy, dx) * 180 / Math.PI)} ${n(x)} ${n(y)})"/>`;
    });
  })).join("");
  const b = plan.profile.bounds;
  return `<mask id="${id}" maskUnits="userSpaceOnUse" x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}"><rect x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}" fill="black"/>${bodies}${bites}</mask>`;
}
function gardenMarkup(plan) {
  const crops = [[21,150,502,441],[556,49,698,570],[47,630,693,583]];
  return plan.gardens.map((point, index) => {
    const crop = crops[index % crops.length], width = plan.profile.gardenWidth * (.78 + index % 3 * .09), height = width * crop[3] / crop[2];
    return `<svg x="${n(point[0] - width / 2)}" y="${n(point[1] - height * .68)}" width="${n(width)}" height="${n(height)}" viewBox="${crop.join(" ")}" overflow="hidden"><image href="${atlasData}" width="1254" height="1254"/></svg>`;
  }).join("");
}
function svgFor(plan) {
  const p = plan.profile, b = p.bounds, laneRoads = plan.lanes.map(lane => lane.nodes), stone = path.join(root, "assets", "oasis-pilot", "street-stone-v1.png");
  const stoneData = `data:image/png;base64,${fs.readFileSync(stone).toString("base64")}`;
  const defs = `<defs>
    ${roadMask(plan, "lane-edge", laneRoads, p.laneWidth + 14)}${roadMask(plan, "lane-surface", laneRoads, p.laneWidth)}
    ${roadMask(plan, "main-edge", [plan.main], p.mainWidth + 18)}${roadMask(plan, "main-surface", [plan.main], p.mainWidth)}
    <pattern id="earth" width="72" height="38" patternUnits="userSpaceOnUse" patternTransform="rotate(29)"><rect width="72" height="38" fill="#b9824c"/><path d="M0 10H72V14H0ZM0 26H72V30H0Z" fill="#6f4b31" opacity=".14"/><circle cx="12" cy="20" r="2" fill="#d6a163" opacity=".75"/><circle cx="49" cy="7" r="1.5" fill="#70492f" opacity=".55"/></pattern>
    <pattern id="stone" width="108" height="108" patternUnits="userSpaceOnUse" patternTransform="rotate(29)"><rect width="108" height="108" fill="#c99d5d"/><image href="${stoneData}" width="126" height="126" opacity=".58"/><rect width="108" height="108" fill="#e0b877" opacity=".16"/></pattern>
  </defs>`;
  const layers = `<g data-baked-streets="${xml(plan.layout)}-${plan.profileName}">
    <rect x="${b.x + 7}" y="${b.y + 8}" width="${b.width}" height="${b.height}" fill="#59402c" opacity=".16" mask="url(#lane-edge)"/>
    <rect x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}" fill="url(#earth)" opacity=".82" mask="url(#lane-surface)"/>
    <rect x="${b.x + 8}" y="${b.y + 9}" width="${b.width}" height="${b.height}" fill="#533a28" opacity=".2" mask="url(#main-edge)"/>
    <rect x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}" fill="url(#stone)" opacity=".94" mask="url(#main-surface)"/>
    ${polygon([[plan.square[0],plan.square[1]-p.squareRadius[1]],[plan.square[0]+p.squareRadius[0],plan.square[1]],[plan.square[0],plan.square[1]+p.squareRadius[1]],[plan.square[0]-p.squareRadius[0],plan.square[1]]], 'fill="#5a3c28" opacity=".18" transform="translate(7 8)"')}
    ${polygon([[plan.square[0],plan.square[1]-p.squareRadius[1]],[plan.square[0]+p.squareRadius[0],plan.square[1]],[plan.square[0],plan.square[1]+p.squareRadius[1]],[plan.square[0]-p.squareRadius[0],plan.square[1]]], 'fill="url(#stone)" opacity=".98"')}
    ${gardenMarkup(plan)}
  </g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${b.width}" height="${b.height}" viewBox="${b.x} ${b.y} ${b.width} ${b.height}">${defs}${layers}</svg>`;
}

async function build() {
  fs.mkdirSync(outDir, { recursive: true });
  const manifest = { version: 2, generatedBy: "prototype/tools/build-street-grounds.cjs", generatedAt: new Date().toISOString(), axes: [.55, -.55], layouts: {} };
  for (const layout of layouts) {
    manifest.layouts[layout.id] = {};
    for (const profileName of Object.keys(profiles)) {
      const plan = makePlan(layout, profileName), svg = svgFor(plan), file = `${layout.id}-${profileName}-v2.png`, target = path.join(outDir, file);
      await sharp(Buffer.from(svg)).png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(target);
      manifest.layouts[layout.id][profileName] = { file, bounds: profiles[profileName].bounds, plotCount: plan.plots.length, sideContacts: plan.contacts, sideContactCount: Object.keys(plan.contacts).length, segmentCount: plan.segmentCount, validAxes: plan.validAxes, mainWidth: plan.profile.mainWidth, laneWidth: plan.profile.laneWidth, gardens: plan.gardens.length };
    }
  }
  fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
}

build().catch(error => { console.error(error); process.exitCode = 1; });
