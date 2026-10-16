"use strict";

// Proposal-only compositor. It writes static review images and never touches
// the game runtime, saves, plot anchors, camera, or published Site.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const dependencyRoot = process.env.AZMARA_NODE_MODULES;
const sharp = dependencyRoot ? require(path.join(dependencyRoot, "sharp")) : require("sharp");

const folder = __dirname;
const root = path.resolve(folder, "../../..");
const prototype = path.join(root, "prototype");
const asset = (...parts) => path.join(prototype, "assets", ...parts);
const data = (file) => `data:image/png;base64,${fs.readFileSync(file).toString("base64")}`;
const xml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character]);
const n = (value) => Number(value).toFixed(2).replace(/\.00$/, "");

const context = vm.createContext({ window: {}, console });
vm.runInContext(fs.readFileSync(path.join(prototype, "building-art.js"), "utf8"), context, { filename: "building-art.js" });
const artApi = context.window.AzmaraBuildingArt;

const slope = .55;
const latticeStep = 8;
const screen = ([a, b]) => [latticeStep * (a + b), latticeStep * slope * (a - b)];
const lattice = ([x, y]) => [Math.round((x + y / slope) / (2 * latticeStep)), Math.round((x - y / slope) / (2 * latticeStep))];
const key = ([a, b]) => `${a},${b}`;
const fromKey = (value) => value.split(",").map(Number);
const simplify = (nodes) => nodes.filter((node, index) => {
  if (!index || index === nodes.length - 1) return true;
  const before = nodes[index - 1], after = nodes[index + 1];
  return !((node[0] - before[0] === after[0] - node[0]) && (node[1] - before[1] === after[1] - node[1]));
});
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

// The 21 movable Grid anchors are copied from the approved plan. Hall and gate
// remain fixed. These coordinates are review-canvas pixels, not gameplay tiles.
const plots = [
  { id: "G02", x: 210, y: 244 }, { id: "G03", x: 385, y: 244 }, { id: "G04", x: 561, y: 329 }, { id: "G05", x: 737, y: 244 }, { id: "G06", x: 913, y: 244 },
  { id: "G07", x: 210, y: 353 }, { id: "G08", x: 385, y: 353 }, { id: "G09", x: 737, y: 353 }, { id: "G10", x: 913, y: 353 },
  { id: "G11", x: 210, y: 465 }, { id: "G12", x: 385, y: 465 }, { id: "G13", x: 737, y: 465 }, { id: "G14", x: 913, y: 465 },
  { id: "G15", x: 210, y: 577 }, { id: "G16", x: 385, y: 577 }, { id: "G17", x: 561, y: 577 }, { id: "G18", x: 737, y: 577 }, { id: "G19", x: 913, y: 577 },
  { id: "C1", x: 222, y: 630 }, { id: "C2", x: 902, y: 630 }, { id: "F1", x: 561, y: 678 }
];
const hall = { id: "HALL", x: 561, y: 410, rx: 84, ry: 52 };
const obstacles = [hall, ...plots.map((plot) => ({ ...plot, rx: 66, ry: 39 }))];
const sides = { NE: [35, -19], SE: [35, 19], SW: [-35, 19], NW: [-35, -19] };
const bounds = (node) => { const [x, y] = screen(node); return x >= 42 && x <= 1080 && y >= 78 && y <= 730; };
const blocked = (node, owner = null, margin = 15) => {
  const [x, y] = screen(node);
  return obstacles.some((obstacle) => obstacle.id !== owner && (Math.abs(x - obstacle.x) / (obstacle.rx + margin) + Math.abs(y - obstacle.y) / (obstacle.ry + margin) < 1));
};
const neighbours = ([a, b]) => [[a + 1, b], [a - 1, b], [a, b + 1], [a, b - 1]];

function findPath(startPoint, goalKeys, owner = null, margin = 15) {
  const start = lattice(startPoint), startKey = key(start), open = [{ node: start, g: 0, f: 0 }], came = new Map(), cost = new Map([[startKey, 0]]), goals = [...goalKeys].map(fromKey);
  const heuristic = (node) => goals.reduce((best, goal) => Math.min(best, Math.abs(node[0] - goal[0]) + Math.abs(node[1] - goal[1])), Infinity);
  open[0].f = heuristic(start);
  while (open.length) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift(), currentKey = key(current.node);
    if (goalKeys.has(currentKey)) {
      const result = [current.node]; let cursor = currentKey;
      while (came.has(cursor)) { cursor = came.get(cursor); result.push(fromKey(cursor)); }
      return simplify(result.reverse());
    }
    for (const next of neighbours(current.node)) {
      const nextKey = key(next);
      if (!bounds(next) || blocked(next, owner, margin)) continue;
      const nextCost = current.g + 1;
      if (nextCost >= (cost.get(nextKey) ?? Infinity)) continue;
      cost.set(nextKey, nextCost); came.set(nextKey, currentKey); open.push({ node: next, g: nextCost, f: nextCost + heuristic(next) });
    }
  }
  throw new Error(`No route from ${startPoint.join(",")}`);
}

const gate = [561, 136], square = [561, 505];
const main = findPath(gate, new Set([key(lattice(square))]), null, 25);
const network = new Set();
function addToNetwork(nodes) {
  for (let index = 1; index < nodes.length; index++) {
    let cursor = nodes[index - 1].slice(), target = nodes[index]; network.add(key(cursor));
    while (key(cursor) !== key(target)) {
      cursor = [cursor[0] + Math.sign(target[0] - cursor[0]), cursor[1] + Math.sign(target[1] - cursor[1])]; network.add(key(cursor));
    }
  }
}
addToNetwork(main);

const contacts = {}, lanes = [], remaining = new Map(plots.map((plot) => [plot.id, plot]));
while (remaining.size) {
  let chosen = null;
  for (const plot of remaining.values()) for (const [side, offset] of Object.entries(sides)) {
    const terminal = [plot.x + offset[0], plot.y + offset[1]], node = lattice(terminal);
    const near = Math.min(...[...network].map((value) => distance(screen(fromKey(value)), screen(node))));
    if (!chosen || near < chosen.near) chosen = { plot, side, terminal, near };
  }
  let best = null;
  for (const [side, offset] of Object.entries(sides)) {
    const terminal = [chosen.plot.x + offset[0], chosen.plot.y + offset[1]];
    try {
      const route = findPath(terminal, network, chosen.plot.id, 16);
      if (!best || route.length < best.route.length) best = { side, terminal, route };
    } catch {}
  }
  if (!best) throw new Error(`No side route for ${chosen.plot.id}`);
  contacts[chosen.plot.id] = best.side;
  lanes.push({ id: chosen.plot.id, nodes: best.route, terminal: best.terminal });
  addToNetwork(best.route); remaining.delete(chosen.plot.id);
}

function ribbonSegment(a, b, width) {
  const dx = b[0] - a[0], dy = b[1] - a[1], length = Math.hypot(dx, dy) || 1;
  const ox = -dy / length * width / 2, oy = dx / length * width / 2;
  return [[a[0] + ox, a[1] + oy], [b[0] + ox, b[1] + oy], [b[0] - ox, b[1] - oy], [a[0] - ox, a[1] - oy]];
}
const polygon = (points, attrs) => `<polygon points="${points.map(([x, y]) => `${n(x)},${n(y)}`).join(" ")}" ${attrs}/>`;
function ribbon(nodes, width, attrs, joins = true) {
  const points = nodes.map(screen), parts = [];
  for (let index = 1; index < points.length; index++) parts.push(polygon(ribbonSegment(points[index - 1], points[index], width), attrs));
  if (joins) for (const [x, y] of points.slice(1, -1)) parts.push(polygon([[x, y - width * .42], [x + width * .72, y], [x, y + width * .42], [x - width * .72, y]], attrs));
  return parts.join("");
}

function roadMask(id, roads, width) {
  const bodies = roads.map((nodes) => ribbon(nodes, width, 'fill="white"')).join("");
  const bites = roads.flatMap((nodes, roadIndex) => {
    const points = nodes.map(screen), output = [];
    for (let index = 1; index < points.length; index++) {
      const a = points[index - 1], b = points[index], dx = b[0] - a[0], dy = b[1] - a[1], length = Math.hypot(dx, dy) || 1;
      const nx = -dy / length, ny = dx / length;
      for (const ratio of [.28, .68]) {
        if ((roadIndex + index + Math.round(ratio * 10)) % 3 === 0) continue;
        const side = (roadIndex + index + (ratio > .5 ? 1 : 0)) % 2 ? 1 : -1;
        const x = a[0] + dx * ratio + nx * width * .47 * side, y = a[1] + dy * ratio + ny * width * .47 * side;
        output.push(`<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(2.8 + (roadIndex + index) % 4)}" ry="${n(1.7 + index % 2)}" fill="black" transform="rotate(${n(Math.atan2(dy, dx) * 180 / Math.PI)} ${n(x)} ${n(y)})"/>`);
      }
    }
    return output;
  }).join("");
  return `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="1123" height="784"><rect width="1123" height="784" fill="black"/>${bodies}${bites}</mask>`;
}

function sprite(typeId, level, cx, cy, scale = .8) {
  const art = artApi.forBuilding(typeId, level);
  const baseWidth = typeId === "town-hall" ? 166 : 145, baseHeight = typeId === "town-hall" ? 120 : 116;
  const width = baseWidth * scale, height = baseHeight * scale;
  const dims = art.rect ? { width: art.rect[2], height: art.rect[3] } : { width: 1536, height: 1024 };
  const factor = Math.min(width / dims.width, height / dims.height), w = dims.width * factor, h = dims.height * factor;
  const href = data(path.join(prototype, art.src));
  const x = cx - w / 2, y = cy - h * .72;
  if (!art.rect) return `<image href="${href}" x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" preserveAspectRatio="xMidYMid meet"/>`;
  return `<svg x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" viewBox="${art.rect.join(" ")}" overflow="hidden"><image href="${href}" width="${art.atlasWidth}" height="${art.atlasHeight}"/></svg>`;
}

function pin(plot) {
  const label = plot.id.startsWith("C") ? "C" : plot.id === "F1" ? "F" : "";
  return `<g transform="translate(${plot.x} ${plot.y})" aria-label="${xml(plot.id)} empty site"><ellipse cx="3" cy="13" rx="12" ry="4" fill="#6a4930" opacity=".2"/><path d="M0 13V-10" fill="none" stroke="#6d4a2b" stroke-width="3"/><path d="M1-10l15 5-15 6Z" fill="#168c8d" stroke="#f3d9a4" stroke-width="1.5"/><circle cx="0" cy="14" r="4" fill="#b57d43"/>${label ? `<text x="7" y="-2" font-family="Arial,sans-serif" font-size="7" font-weight="700" fill="#fff3cf">${label}</text>` : ""}</g>`;
}

const types = ["academy", "warehouse", "provision-house", "palace", "governors-residence", "museum", "embassy", "prayer-area", "trading-port", "trading-post", "depot", "military-exchange", "sea-chart-archive", "dockyard", "intelligence-house", "barracks", "workshop", "foresters-house", "silver-refinery", "iron-foundry", "grain-estate"];
const matureAssignments = Object.fromEntries(plots.map((plot, index) => [plot.id, types[index]]));

const gardens = [[302, 296], [474, 270], [827, 300], [303, 416], [823, 416], [469, 534], [648, 540], [782, 617]];
const shadeAtlas = data(asset("oasis-pilot", "shade-pockets-v2.png"));
function shadeCrop(rect, cx, cy, width) {
  const height = width * rect[3] / rect[2];
  return `<svg x="${n(cx - width / 2)}" y="${n(cy - height * .72)}" width="${n(width)}" height="${n(height)}" viewBox="${rect.join(" ")}" overflow="hidden"><image href="${shadeAtlas}" width="1254" height="1254"/></svg>`;
}

function renderRoads(level) {
  const mainWidth = 39, laneWidth = 20;
  const mainSurface = level >= 50 ? "url(#mainStoneMature)" : "url(#mainStoneStart)";
  const laneSurface = level >= 50 ? "url(#laneEarthMature)" : "url(#laneEarthStart)";
  const laneNetworks = lanes.map((lane) => lane.nodes);
  const masks = `<defs>${roadMask("manual-main", [main], mainWidth)}${roadMask("manual-main-shadow", [main], mainWidth + 8)}${roadMask("manual-lanes", laneNetworks, laneWidth)}${roadMask("manual-lanes-shadow", laneNetworks, laneWidth + 7)}</defs>`;
  const laneRoads = `<g><rect x="3" y="4" width="1123" height="784" fill="#68482e" opacity=".16" mask="url(#manual-lanes-shadow)"/><rect width="1123" height="784" fill="${laneSurface}" opacity="${level >= 50 ? .82 : .72}" mask="url(#manual-lanes)"/><rect x="-2" y="-2" width="1123" height="784" fill="#f2c886" opacity=".09" mask="url(#manual-lanes)"/></g>`;
  const mainRoad = `<g><rect x="4" y="5" width="1123" height="784" fill="#654329" opacity=".2" mask="url(#manual-main-shadow)"/><rect width="1123" height="784" fill="${mainSurface}" opacity=".88" mask="url(#manual-main)"/><rect x="-2" y="-2" width="1123" height="784" fill="#ffe0a6" opacity=".1" mask="url(#manual-main)"/></g>`;
  const squareShadow = polygon([[561, 462], [624, 497], [561, 532], [498, 497]], 'fill="#76502f" opacity=".18"');
  const civicSquare = polygon([[561, 466], [619, 498], [561, 530], [503, 498]], `fill="${mainSurface}" opacity=".98"`);
  return `<g data-manual-roads="proposal">${masks}${laneRoads}${mainRoad}${squareShadow}${civicSquare}</g>`;
}

function defs() {
  const stone = data(asset("oasis-pilot", "street-stone-v1.png"));
  return `<defs>
    <pattern id="mainStoneStart" width="82" height="82" patternUnits="userSpaceOnUse" patternTransform="rotate(29)"><rect width="82" height="82" fill="#c79a58"/><image href="${stone}" width="112" height="112" opacity=".46"/><rect width="82" height="82" fill="#d7ad6a" opacity=".25"/></pattern>
    <pattern id="mainStoneMature" width="68" height="68" patternUnits="userSpaceOnUse" patternTransform="rotate(29)"><rect width="68" height="68" fill="#cdaa6d"/><image href="${stone}" width="96" height="96" opacity=".58"/><rect width="68" height="68" fill="#e1bf7f" opacity=".18"/></pattern>
    <pattern id="laneEarthStart" width="54" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(29)"><rect width="54" height="26" fill="#b98650"/><path d="M0 7H54V10H0ZM0 18H54V21H0Z" fill="#755035" opacity=".1"/><circle cx="11" cy="14" r="1.5" fill="#d7a565" opacity=".8"/><circle cx="38" cy="5" r="1.1" fill="#7b5537" opacity=".55"/></pattern>
    <pattern id="laneEarthMature" width="50" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(29)"><rect width="50" height="24" fill="#bc905a"/><path d="M0 6H50V9H0ZM0 17H50V20H0Z" fill="#795436" opacity=".08"/><circle cx="9" cy="13" r="1.2" fill="#e0b77b"/><circle cx="35" cy="4" r="1.2" fill="#8b623e" opacity=".5"/></pattern>
    <linearGradient id="canyonFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="white"/><stop offset=".8" stop-color="white"/><stop offset="1" stop-color="black"/></linearGradient>
    <mask id="canyonMask" maskUnits="objectBoundingBox"><rect width="1123" height="230" fill="url(#canyonFade)"/></mask>
  </defs>`;
}

function ground(level) {
  const file = asset("oasis-pilot", level >= 50 ? "ground-mature-v1.png" : "ground-start-v1.png");
  return `<image href="${data(file)}" x="0" y="0" width="1123" height="784" preserveAspectRatio="xMidYMid slice"/>`;
}

function canyon(level) {
  const file = path.join(root, "docs", "ideas", "canyon-defences-study", level >= 50 ? "desktop-level50-v1.png" : "desktop-start-v1.png");
  return `<g mask="url(#canyonMask)"><svg x="0" y="0" width="1123" height="230" viewBox="250 0 1336 250" preserveAspectRatio="none" overflow="hidden"><image href="${data(file)}" width="1586" height="992"/></svg></g>`;
}

function props(level) {
  const crop = level >= 50
    ? shadeCrop([556, 49, 698, 570], 300, 540, 112) + shadeCrop([47, 630, 693, 583], 826, 522, 104) + shadeCrop([556, 49, 698, 570], 470, 662, 82) + shadeCrop([21, 150, 502, 441], 84, 430, 58) + shadeCrop([21, 150, 502, 441], 1036, 430, 58)
    : shadeCrop([21, 150, 502, 441], 303, 533, 76) + shadeCrop([21, 150, 502, 441], 823, 520, 68) + shadeCrop([21, 150, 502, 441], 470, 670, 52) + shadeCrop([21, 150, 502, 441], 84, 430, 48) + shadeCrop([21, 150, 502, 441], 1036, 430, 48);
  return `<g data-manual-gardens="proposal">${crop}</g>`;
}

function scene(level) {
  const title = level >= 50 ? "LEVEL 50 TARGET" : "START TARGET";
  const buildings = level >= 50
    ? plots.map((plot) => sprite(matureAssignments[plot.id], 50, plot.x, plot.y, .8)).join("")
    : plots.map(pin).join("");
  const hallArt = sprite("town-hall", level >= 50 ? 50 : 1, hall.x, hall.y, .8);
  const shadows = level >= 50
    ? plots.map((plot) => `<ellipse cx="${plot.x + 4}" cy="${plot.y + 18}" rx="42" ry="13" fill="#4e3220" opacity=".13"/>`).join("") + `<ellipse cx="${hall.x + 5}" cy="${hall.y + 20}" rx="52" ry="16" fill="#4e3220" opacity=".15"/>`
    : `<ellipse cx="${hall.x + 4}" cy="${hall.y + 18}" rx="42" ry="13" fill="#4e3220" opacity=".15"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1123" height="784" viewBox="0 0 1123 784">${defs()}${ground(level)}${canyon(level)}${renderRoads(level)}${props(level)}<g data-building-footprints="proposal">${shadows}</g>${buildings}${hallArt}</svg>`;
  return svg;
}

async function write() {
  const outputs = [];
  for (const [level, name] of [[1, "manual-start-v1"], [50, "manual-level50-v1"]]) {
    const svg = scene(level), svgFile = path.join(folder, `${name}.svg`), pngFile = path.join(folder, `${name}.png`);
    fs.writeFileSync(svgFile, svg);
    await sharp(Buffer.from(svg)).png().toFile(pngFile);
    outputs.push({ level, svg: path.basename(svgFile), png: path.basename(pngFile) });
  }
  const axisSegments = [main, ...lanes.map((lane) => lane.nodes)].flatMap((nodes) => nodes.slice(1).map((node, index) => {
    const a = screen(nodes[index]), b = screen(node), dx = Math.abs(b[0] - a[0]), dy = Math.abs(b[1] - a[1]);
    return { dx, dy, slope: dx ? Number((dy / dx).toFixed(4)) : null, valid: dx > 0 && Math.abs(dy / dx - slope) < .001 };
  }));
  const verifiedPlan = JSON.parse(fs.readFileSync(path.join(folder, "street-plan-grid.json"), "utf8"));
  const manifest = {
    kind: "Proposal-only manual composition; no runtime code or saved state changed",
    sourceComposition: "Approved canyon top layers plus original AZMARA ground/building/scenery assets",
    canvas: { width: 1123, height: 784, origin: "upper-left", yDirection: "down" },
    layout: "grid", buildingScale: .8, fixedHall: hall, fixedGate: gate,
    plotAnchorsChanged: false, plots, contacts,
    verification: {
      sideContactCount: Object.keys(contacts).length,
      expectedSideContactCount: plots.length,
      verifiedPlanContactsMatch: JSON.stringify(contacts) === JSON.stringify(verifiedPlan.contacts),
      segmentCount: axisSegments.length
    },
    streetRules: { axes: [slope, -slope], allSegmentsValid: axisSegments.every((segment) => segment.valid), mainWidth: 39, laneWidth: 20, ringRoad: false, bareSandDeadEnds: false },
    art: { main: "sandstone paving", lanes: "packed earth with wheel ruts", levelUpgrade: "reserved for a later approved implementation", movingDetails: 0 },
    outputs
  };
  fs.writeFileSync(path.join(folder, "manual-street-target.json"), JSON.stringify(manifest, null, 2) + "\n");
  console.log(JSON.stringify(manifest, null, 2));
}

write().catch((error) => { console.error(error.stack); process.exitCode = 1; });
