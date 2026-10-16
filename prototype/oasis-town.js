/* Original Oasis Town endpoint/exact25 pilot. Pure paint: no state, saves or gameplay. */
(() => {
  "use strict";
  const freeze = (value) => {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
      Object.values(value).forEach(freeze); Object.freeze(value);
    }
    return value;
  };
  const groundBounds = freeze({ x: 0, y: 0, width: 4200, height: 2400 });
  const assets = freeze({ start: "assets/oasis-pilot/ground-start-v1.png", mature: "assets/oasis-pilot/ground-mature-v1.png", stone: "assets/oasis-pilot/street-stone-v1.png" });
  // Source-stage sockets describe visible pixels, never a generic plot edge.
  // Other crops/stages deliberately have no newly authored entrance in this pass.
  const entranceSources = freeze([
    { id: "hall-1", buildingId: "town-hall", artLevel: 1, src: "assets/progression/azmara-hall-level-1.png", rect: null, uv: [.61, .72], paintedWidth: 24 },
    { id: "hall-50", buildingId: "town-hall", artLevel: 50, src: "assets/progression/azmara-hall-level-50.png", rect: null, uv: [.56, .95], paintedWidth: 28 },
    { id: "warehouse-50", buildingId: "warehouse", artLevel: 50, src: "assets/progression/azmara-warehouse-stages-v2.png", rect: [627, 875, 306, 258], uv: [.78, .90], paintedWidth: 40 },
    { id: "caravan-50", buildingId: "trading-port", artLevel: 50, src: "assets/progression/azmara-trading-port-stages-land-v3.png", rect: [625, 797, 316, 311], uv: [.30, .90], paintedWidth: 32 }
  ]);
  // The exact25 study has separate registrations. These cannot change the
  // accepted endpoint socket registry or leak into another appearance band.
  const middleEntranceSources = freeze([
    { id: "hall-25", buildingId: "town-hall", artLevel: 25, src: "assets/progression/azmara-hall-level-25.png", rect: null, uv: [.57, .93], paintedWidth: 28 },
    { id: "warehouse-25", buildingId: "warehouse", artLevel: 25, src: "assets/progression/azmara-warehouse-stages-v2.png", rect: [307, 544, 313, 220], uv: [.22, .80], paintedWidth: 36 },
    { id: "caravan-25", buildingId: "trading-port", artLevel: 25, src: "assets/progression/azmara-trading-port-stages-land-v3.png", rect: [316, 485, 307, 268], uv: [.50, .95], paintedWidth: 28 }
  ]);
  const shadeDefinitions = freeze([
    { id: "S0", band: "start", x: 1580, y: 1297, width: 176, height: 152 },
    { id: "S1", band: "mature", x: 1580, y: 1297, width: 288, height: 184 },
    { id: "S2", band: "mature", x: 2910, y: 1156, width: 220, height: 192 }
  ]);
  // Padded ownership rectangles include each complete connected motif and its
  // translucent baked shadow. Detached alpha<=4 background speckles are not art.
  const shadeAtlas = freeze({ src: "assets/oasis-pilot/shade-pockets-v2.png", width: 1254, height: 1254,
    rects: { S0: [21, 150, 502, 441], S1: [556, 49, 698, 570], S2: [47, 630, 693, 583] } });
  const middleShadeDefinitions = freeze([
    { id: "M1", band: "developing", x: 1580, y: 1297, width: 250, height: 160 },
    { id: "M2", band: "developing", x: 2910, y: 1156, width: 174, height: 152 }
  ]);
  // Verified connected-motif crops include complete alpha1 body/shadow and
  // eight-pixel padding. Detached alpha1 atlas noise is not rendered artwork.
  // No proposal PNG, opaque-body crop or independently stretched motif.
  const middleShadeAtlas = freeze({ src: "assets/oasis-pilot/shade-middle-v1.png", width: 1254, height: 1254,
    rects: { M1: [37, 345, 727, 585], M2: [813, 465, 424, 465] } });
  const cache = new Map(), renderCache = new WeakMap();
  const n = value => Number(value).toFixed(2).replace(/\.00$/, "");
  const xml = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]);
  const path = points => points.map(([x, y], i) => (i ? "L" : "M") + n(x) + " " + n(y)).join(" ");
  const boundedLevel = level => Number.isFinite(Number(level)) ? Math.max(0, Math.min(50, Math.floor(Number(level)))) : -1;
  const eligible = (level, options) => options.desktop === true && options.layout === "staggered" && Number.isInteger(Number(level)) &&
    ([0, 1, 50].includes(Number(level)) || Number(level) === 25 && middleShadeAtlas !== null);
  const rectangles = list => (list || []).filter(p => [p.x, p.y, p.width, p.height].every(Number.isFinite) && p.width > 0 && p.height > 0)
    .map(p => ({ id: String(p.id || "reserve"), x: p.x, y: p.y, width: p.width, height: p.height, level: boundedLevel(p.level), buildingId: p.buildingId || null,
      sourceArt: p.sourceArt ? { src: String(p.sourceArt.src), artLevel: boundedLevel(p.sourceArt.artLevel), rect: p.sourceArt.rect ? p.sourceArt.rect.slice() : null,
        cellAspect: Number(p.sourceArt.cellAspect) || (p.sourceArt.rect ? p.sourceArt.rect[2] / p.sourceArt.rect[3] : null) } : null }));
  const box = (p, pad = 0) => ({ left: p.x - p.width / 2 - pad, top: p.y - p.height / 2 - pad, right: p.x + p.width / 2 + pad, bottom: p.y + p.height / 2 + pad });
  function segmentHits(a, b, rectangle, pad = 0) {
    const r = box(rectangle, pad), low = [r.left, r.top], high = [r.right, r.bottom];
    let enter = 0, leave = 1;
    for (let axis = 0; axis < 2; axis++) {
      const d = b[axis] - a[axis];
      if (Math.abs(d) < 1e-8) { if (a[axis] < low[axis] || a[axis] > high[axis]) return false; }
      else {
        const t0 = (low[axis] - a[axis]) / d, t1 = (high[axis] - a[axis]) / d;
        enter = Math.max(enter, Math.min(t0, t1)); leave = Math.min(leave, Math.max(t0, t1));
        if (enter > leave) return false;
      }
    }
    return true;
  }
  const overlap = (a, b, pad = 0) => Math.abs(a.x - b.x) < (a.width + b.width) / 2 + pad && Math.abs(a.y - b.y) < (a.height + b.height) / 2 + pad;
  function contactFor(plot) {
    const hall = plot.id === "general-01", art = plot.sourceArt || plot.buildingId && window.AzmaraBuildingArt?.forBuilding(plot.buildingId, Math.max(1, plot.level));
    const aspect = art?.cellAspect || (hall ? 1.5 : plot.width / plot.height);
    const width = Math.min(plot.width, plot.height * aspect), height = Math.min(plot.height, plot.width / aspect);
    // Hall source metadata owns its contact baseline. Other crops have checked
    // padded full bodies; keep their ground contact conservatively within them.
    const baseline = hall ? 900 / 1024 : .92;
    const y = plot.y - height / 2 + height * baseline;
    return { id: plot.id, x: plot.x, y, width: width * .82, height: height * .22, hall,
      buildingId: plot.buildingId, level: plot.level,
      bodyBounds: { x: plot.x - width / 2, y: plot.y - height / 2, width, height },
      sourceArt: art ? { src: art.src, artLevel: art.artLevel, rect: art.rect ? art.rect.slice() : null } : null };
  }
  function socketFor(contact, developing = false) {
    const art = contact.sourceArt;
    if (!art || contact.buildingId === "town-hall" && contact.id !== "general-01" ||
      contact.buildingId === "trading-port" && !["harbour-01", "harbour-02"].includes(contact.id)) return null;
    const registry = developing ? entranceSources.concat(middleEntranceSources) : entranceSources;
    const source = registry.find(entry => entry.buildingId === contact.buildingId && entry.src === art.src &&
      entry.artLevel === art.artLevel && JSON.stringify(entry.rect) === JSON.stringify(art.rect));
    if (!source) return null;
    const body = contact.bodyBounds, port = [body.x + source.uv[0] * body.width, body.y + source.uv[1] * body.height];
    return { sourceId: source.id, plotOwner: contact.id, buildingId: contact.buildingId,
      sourceArt: art, sourceUV: source.uv.slice(), bodyBounds: { ...body }, port,
      paintedWidth: source.paintedWidth, safetyMargin: 8 };
  }
  function entranceGuide(socket, plot) {
    const at = (dx, dy) => [plot.x + dx, plot.y + dy];
    if (socket.sourceId === "hall-1") return [socket.port, at(77, 130)];
    if (socket.sourceId === "hall-50") return [socket.port, at(130, 138), at(220, 140), at(270, 190)];
    if (socket.sourceId === "warehouse-50") return [socket.port, at(120, 156.896311153615), at(190, 156.896311153615)];
    if (socket.sourceId === "caravan-50" && plot.id === "harbour-01") return [socket.port, at(-67, 120), at(-170, 120), at(-200, 170)];
    // Independent east route: leave its own station to the east before turning,
    // rather than mirroring west into a neighboring building or fountain.
    if (socket.sourceId === "caravan-50" && plot.id === "harbour-02") return [socket.port, at(120, 108), at(160, 140)];
    if (socket.sourceId === "hall-25") return [socket.port, [plot.x + 130, socket.port[1]], at(220, 140), at(270, 190)];
    if (socket.sourceId === "warehouse-25") return [socket.port, [socket.port[0], plot.y + 156.896311153615], at(130, 156.896311153615)];
    if (socket.sourceId === "caravan-25" && plot.id === "harbour-01") return [socket.port, [plot.x - 110, socket.port[1]], at(-170, 140), at(-170, 170)];
    if (socket.sourceId === "caravan-25" && plot.id === "harbour-02") return [socket.port, [plot.x + 150, socket.port[1]], at(210, 150), at(210, 190)];
    return [];
  }
  function planEntrances(contacts, plots, ornaments, decorExclusions, completed, developing = false) {
    const entrances = [], omissions = [], authoredOwners = new Set();
    for (const contact of contacts) {
      const socket = socketFor(contact, developing);
      if (!socket) {
        omissions.push({ plotOwner: contact.id, reason: contact.buildingId === "dockyard" ? "freight-yard-source-ambiguous" : "source-stage-not-calibrated" });
        continue;
      }
      authoredOwners.add(contact.id);
      const plot = plots.find(p => p.id === contact.id), points = entranceGuide(socket, plot), pad = socket.paintedWidth / 2 + socket.safetyMargin;
      const reserves = plots.filter(p => p.id !== contact.id).concat(ornaments, decorExclusions);
      const conflicts = [...new Set(points.slice(1).flatMap((p, i) => reserves.filter(r => segmentHits(points[i], p, r, pad)).map(r => r.id || r.kind)))];
      if (points.length < 2 || conflicts.length) {
        omissions.push({ ...socket, reason: points.length < 2 ? "no-authored-guide" : "complete-paint-envelope-blocked", conflicts });
        continue;
      }
      entrances.push({ ...socket, points, quality: contact.hall ? completed : Math.min(completed, Math.max(1, contact.level)),
        material: socket.sourceId === "hall-1" || developing && ["warehouse-25", "caravan-25"].includes(socket.sourceId) ? "earth" : "stone" });
    }
    return { entrances, omissions, authoredOwners };
  }
  function makeRouter(exclusions, bounds = { left: 650, top: 385, right: 3500, bottom: 2185 }) {
    // This is a cosmetic clearance lattice, not tiles, navigation or collision.
    // Sparse designed district links are simplified to long clear runs; the
    // lattice is never drawn and cannot change a plot position or accessible box.
    const step = 25;
    const cols = Math.floor((bounds.right - bounds.left) / step) + 1, rows = Math.floor((bounds.bottom - bounds.top) / step) + 1;
    const point = index => [bounds.left + index % cols * step, bounds.top + Math.floor(index / cols) * step];
    const gridCache = new Map();
    const blockedSegment = (a, b, pad) => exclusions.some(p => segmentHits(a, b, p, pad));
    function grid(pad) {
      if (!gridCache.has(pad)) gridCache.set(pad, Array.from({ length: cols * rows }, (_, i) => blockedSegment(point(i), point(i), pad)));
      return gridCache.get(pad);
    }
    function closest(p, pad) {
      const blocked = grid(pad); let best = -1, distance = Infinity;
      for (let i = 0; i < blocked.length; i++) if (!blocked[i]) {
        const q = point(i), d = (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2;
        if (d < distance) { best = i; distance = d; }
      }
      return best;
    }
    function route(from, to, width) {
      const pad = width / 2 + 8;
      if (!blockedSegment(from, to, pad)) return [from, to];
      const start = closest(from, pad), end = closest(to, pad), blocked = grid(pad);
      if (start < 0 || end < 0 || start === end) return [];
      const target = point(end), scores = new Map([[start, 0]]), parent = new Map(), closed = new Set(), heap = [];
      const heuristic = i => { const p = point(i); return Math.hypot(p[0] - target[0], p[1] - target[1]); };
      function push(index, priority) {
        const item = { index, priority }; heap.push(item); let at = heap.length - 1;
        while (at > 0) { const up = (at - 1) >> 1; if (heap[up].priority <= priority) break; heap[at] = heap[up]; at = up; } heap[at] = item;
      }
      function pop() {
        const first = heap[0], tail = heap.pop();
        if (heap.length) { let at = 0;
          while (at * 2 + 1 < heap.length) { let child = at * 2 + 1; if (child + 1 < heap.length && heap[child + 1].priority < heap[child].priority) child++;
            if (heap[child].priority >= tail.priority) break; heap[at] = heap[child]; at = child; } heap[at] = tail; }
        return first.index;
      }
      push(start, heuristic(start));
      while (heap.length) {
        const at = pop(); if (closed.has(at)) continue;
        if (at === end) {
          const raw = []; for (let i = end; i !== undefined; i = parent.get(i)) raw.push(point(i)); raw.reverse();
          const result = [raw[0]]; let i = 0;
          while (i < raw.length - 1) { let next = raw.length - 1; while (next > i + 1 && blockedSegment(raw[i], raw[next], pad)) next--; result.push(raw[next]); i = next; }
          // Closest-free endpoints are accepted only where an exact extension
          // clears the same complete street envelope. Never force a crossing.
          if (!blockedSegment(from, result[0], pad)) result.unshift(from);
          if (!blockedSegment(result.at(-1), to, pad)) result.push(to);
          return result.filter((p, index) => !index || Math.hypot(p[0] - result[index - 1][0], p[1] - result[index - 1][1]) > .01);
        }
        closed.add(at); const x = at % cols, y = Math.floor(at / cols), a = point(at);
        for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1],[2,1],[-2,1],[2,-1],[-2,-1],[1,2],[-1,2],[1,-2],[-1,-2]]) {
          const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
          const next = ny * cols + nx; if (closed.has(next) || blocked[next] || blockedSegment(a, point(next), pad)) continue;
          const score = scores.get(at) + Math.hypot(dx, dy) * step;
          if (score < (scores.get(next) ?? Infinity)) { scores.set(next, score); parent.set(next, at); push(next, score + heuristic(next)); }
        }
      }
      return [];
    }
    return { route, blockedSegment };
  }
  function project(p, a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1], length = dx * dx + dy * dy;
    const t = length ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / length)) : 0;
    return [a[0] + t * dx, a[1] + t * dy];
  }
  function planPockets(mature, plots, decorExclusions, developing = false) {
    const ornaments = [], occupied = [...plots, ...decorExclusions], pocketReserves = [], omissions = [];
    function reserve(kind, target, width, height, maximumDistance = 210) {
      let best = null, distance = Infinity;
      for (let y = target[1] - maximumDistance; y <= target[1] + maximumDistance; y += 20)
        for (let x = target[0] - maximumDistance; x <= target[0] + maximumDistance; x += 20) {
          const p = { kind, x, y, width, height }, d = (x - target[0]) ** 2 + (y - target[1]) ** 2;
          if (d >= distance || d > maximumDistance ** 2 || x - width / 2 < 700 || x + width / 2 > 3500 || y - height / 2 < 420 || y + height / 2 > 2200) continue;
          if (occupied.some(q => overlap(p, q, 14)) || ornaments.some(q => overlap(p, q, 18))) continue;
          best = p; distance = d;
        }
      if (best) ornaments.push({ ...best, id: "retained-fountain-" + (ornaments.length + 1) });
    }
    // Preserve the two accepted basins at their existing safe positions. The
    // scattered old palms, gardens and planters are replaced, not added to.
    if (mature) {
      reserve("fountain", [2390,740], 132, 122, 210);
      reserve("fountain", [2800,1900], 108, 100, 210);
    }
    if (developing) reserve("fountain", [2390,740], 132, 122, 210);
    const definitions = developing ? middleShadeDefinitions : shadeDefinitions.filter(p => p.band === (mature ? "mature" : "start"));
    const atlas = developing ? middleShadeAtlas : shadeAtlas;
    for (const definition of definitions) {
      const p = { ...definition, kind: "shade", safetyMargin: 24 }, conflicts = occupied.concat(ornaments).filter(q => overlap(p, q, p.safetyMargin)).map(q => q.id || q.kind);
      pocketReserves.push(p);
      const rect = atlas?.rects?.[p.id];
      if (conflicts.length || !rect) {
        omissions.push({ id: p.id, reason: conflicts.length ? "complete-crown-shadow-envelope-blocked" : "owned-source-crop-unavailable", conflicts });
        continue;
      }
      // Uniform meet fits the whole padded crop inside the approved envelope;
      // it never clips a crown/shadow or shrinks the accessible plot reserves.
      const scale = Math.min(p.width / rect[2], p.height / rect[3]), width = rect[2] * scale, height = rect[3] * scale;
      ornaments.push({ ...p, source: atlas.src, sourceWidth: atlas.width, sourceHeight: atlas.height, rect: rect.slice(),
        fullBounds: { x: p.x - p.width / 2, y: p.y - p.height / 2, width: p.width, height: p.height },
        bodyBounds: { x: p.x - width / 2, y: p.y + p.height / 2 - height, width, height } });
    }
    return { ornaments, pocketReserves, omissions };
  }
  function hull(points) {
    const sorted = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cross = (a, b, p) => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
    const lower = [], upper = [];
    for (const p of sorted) { while (lower.length > 1 && cross(lower.at(-2), lower.at(-1), p) <= 0) lower.pop(); lower.push(p); }
    for (const p of sorted.reverse()) { while (upper.length > 1 && cross(upper.at(-2), upper.at(-1), p) <= 0) upper.pop(); upper.push(p); }
    return lower.slice(0, -1).concat(upper.slice(0, -1));
  }
  function courtPath(points) {
    if (points.length < 3) return "";
    const midpoint = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const start = midpoint(points.at(-1), points[0]);
    return "M" + start.map(n).join(" ") + points.map((p, i) => "Q" + p.map(n).join(" ") + " " + midpoint(p, points[(i + 1) % points.length]).map(n).join(" ")).join(" ") + "Z";
  }
  function planCourts(plots) {
    const groups = [
      ["west-quarter", ["general-02","general-03","general-04","general-05","general-06","general-07","general-16","general-17","harbour-01"]],
      ["civic-quarter", ["general-01","general-11","general-12","freighter-01"]],
      ["east-quarter", ["general-08","general-09","general-10","general-13","general-14","general-15","general-18","general-19","harbour-02"]]
    ];
    return groups.map(([id, members]) => {
      const points = plots.filter(p => members.includes(p.id)).flatMap(p => {
        const contact = contactFor(p), x = contact.x, y = contact.y;
        const rx = Math.max(155, contact.width * .8), ry = Math.max(110, contact.height * 1.7);
        return [[x-rx,y-ry],[x+rx,y-ry],[x+rx,y+ry],[x-rx,y+ry]];
      }).map(([x,y]) => [Math.max(750,Math.min(3400,x)),Math.max(450,Math.min(2200,y))]);
      const outline = hull(points);
      return { id, members, points: outline, path: courtPath(outline) };
    }).filter(c => c.points.length >= 3);
  }
  function planMiddleCourts(contacts, plots, ornaments, decorExclusions, completed) {
    const hall = contacts.find(c => c.hall); if (!hall) return [];
    const depot = contacts.find(c => c.id === "general-11" && c.buildingId === "depot" && Math.min(completed, c.level) >= 20);
    const members = [hall.id].concat(depot ? [depot.id] : []), hallPlot = plots.find(p => p.id === hall.id);
    const fullBounds = { x: hall.x - 270, y: hallPlot.y + 40, width: 570, height: depot ? 470 : 245 };
    const x = hall.x, top = fullBounds.y, bottom = top + fullBounds.height;
    const points = [[x-220,top+24],[x+190,top],[x+300,top+100],[x+280,bottom-100],
      [x+135,bottom],[x-180,bottom-20],[x-270,bottom-110],[x-245,top+110]];
    // This is shared decorative floor under its own civic/store members, not
    // a route across their tight frontage. All other authoritative full target
    // rectangles and complete ornament/HUD/wall reserves cut the floor out.
    const excluded = plots.filter(p => !members.includes(p.id)).map(p => ({ ...p, reserveKind: "nonmember-plot", safetyMargin: 8 }))
      .concat(ornaments.map(p => ({ ...p, reserveKind: "ornament", safetyMargin: p.kind === "shade" ? 24 : 8 })),
        decorExclusions.map(p => ({ ...p, reserveKind: "hud-wall", safetyMargin: 8 })));
    const exclusions = excluded.map(p => { const b = box(p, p.safetyMargin);
      return { id: p.id || p.kind, reserveKind: p.reserveKind, safetyMargin: p.safetyMargin,
        bounds: { x: b.left, y: b.top, width: b.right - b.left, height: b.bottom - b.top } }; });
    return [{ id: "middle-civic-forecourt", members, points, path: courtPath(points), fullBounds, exclusions, cosmeticGroundOnly: true }];
  }
  function layout(level, options = {}) {
    if (options.comparisonOptions?.enabled === true && options.comparisonOptions.purpose === "appearance-scale") return comparisonLayout(level, options);
    if (!eligible(level, options)) return null;
    const completed = boundedLevel(level), band = completed === 50 ? "mature" : completed === 25 ? "developing" : "start", mature = band === "mature", developing = band === "developing";
    const plots = rectangles(options.plots), decorExclusions = rectangles(options.decorExclusions);
    const key = JSON.stringify([completed, plots, decorExclusions]); if (cache.has(key)) return cache.get(key);
    const ordinary = plots.filter(p => p.id !== "wall-01"), contacts = ordinary.filter(p => p.buildingId).map(contactFor);
    const pocketPlan = planPockets(mature, plots, decorExclusions, developing), ornaments = pocketPlan.ornaments;
    const entrancePlan = planEntrances(contacts, plots, ornaments, decorExclusions, completed, developing);
    const router = makeRouter(plots.concat(ornaments.map((p, index) => ({ ...p, id: "pocket-" + index })), developing ? decorExclusions : [])), roads = [];
    if (mature) {
      // Shared quarter floors are the primary urban ground. Only three useful
      // civic/trade spines cross them; there is deliberately NO perimeter ring.
      // The existing wall/gate approach remains separately owned.
      const links = [
        ["west-civic-street", [1480,650], [1480,950], 70],
        ["east-civic-street", [2910,740], [2910,980], 70],
        ["southern-trade-street", [2100,2040], [2100,2180], 75]
      ];
      for (const [id, from, to, width] of links) {
        const points = router.route(from, to, width);
        if (points.length > 1) roads.push({ id, width, points, kind: "district", quality: completed });
      }
      const mains = roads.slice();
      for (const p of ordinary) {
        if (entrancePlan.authoredOwners.has(p.id)) continue;
        const width = p.id === "general-01" ? 65 : 55, r = box(p, width / 2 + 9);
        const endpoints = [[p.x, r.bottom], [r.left, p.y], [r.right, p.y], [p.x, r.top]];
        const candidates = endpoints.flatMap(end => mains.flatMap(road => road.points.slice(1).map((b, i) => {
          const start = project(end, road.points[i], b); return { start, end, distance: Math.hypot(start[0] - end[0], start[1] - end[1]) };
        }))).filter(candidate => candidate.distance > 6).sort((a, b) => a.distance - b.distance);
        const direct = candidates.find(c => !router.blockedSegment(c.start, c.end, width / 2 + 8));
        // Broad shared courts provide continuity. Do not trace long boundary
        // detours merely to attach every rectangle to a short civic street.
        const points = direct ? [direct.start, direct.end] : [];
        if (points.length > 1 && points.slice(1).reduce((total, q, i) => total + Math.hypot(q[0] - points[i][0], q[1] - points[i][1]), 0) < 180)
          roads.push({ id: "approach-" + p.id, width, points, kind: "approach", plotOwner: p.id, quality: Math.min(completed, Math.max(1, p.level)), material: p.buildingId ? "stone" : "earth" });
      }
    }
    // Developing uses only measured threshold/loading approaches. The three
    // detached accent runs were omitted after screenshot review, not extended
    // into unmeasured streets or another perimeter circuit.
    const paintedRoads = roads.map(road => ({ ...road, paintedWidth: road.width + 13 }));
    const aprons = contacts.map(contact => {
      const approach = paintedRoads.find(road => road.plotOwner === contact.id), end = approach?.points.at(-1);
      const points = end ? [end, [contact.x, contact.y]] : [];
      // The public floor may enter its OWN building apron beneath the sprite;
      // never cut a neighbour's body or a reserved decorative pocket to do so.
      const safe = !entrancePlan.authoredOwners.has(contact.id) && points.length && !plots.filter(p => p.id !== contact.id).some(p => segmentHits(points[0], points[1], p, 28)) &&
        !ornaments.some(p => segmentHits(points[0], points[1], p, 28)) && !decorExclusions.some(p => segmentHits(points[0], points[1], p, 28));
      return { ...contact, connector: safe ? points : [], quality: Math.min(completed, Math.max(1, contact.level)) };
    });
    const courts = mature ? planCourts(ordinary) : developing ? planMiddleCourts(contacts, plots, ornaments, decorExclusions, completed) : [];
    const result = freeze({ band, completed, coordinateSpace: "world", groundBounds, terrainAsset: developing ? assets.start : assets[band], plots, decorExclusions, contacts: aprons, roads: paintedRoads, ornaments, courts,
      entrances: entrancePlan.entrances, entranceOmissions: entrancePlan.omissions,
      pocketReserves: pocketPlan.pocketReserves, pocketOmissions: pocketPlan.omissions,
      closedBasinsOnly: true, movingDetails: 0 });
    if (cache.size >= 12) cache.delete(cache.keys().next().value); cache.set(key, result); return result;
  }
  function comparisonLayout(level, options) {
    // Explicit Dev study only. This does not extend actual24/26 eligibility or
    // any normal profile/layout. Source textures and motifs are existing art.
    const completed = boundedLevel(level), sourceLevel = completed >= 50 ? 50 : completed >= 25 ? 25 : 1;
    const band = sourceLevel === 50 ? "mature" : sourceLevel === 25 ? "developing" : "start";
    const mature = band === "mature", developing = band === "developing";
    const requestedScale = Number(options.comparisonOptions.artScale);
    const artScale = Number.isFinite(requestedScale) ? Math.max(.01,Math.min(1,requestedScale)) : 1;
    const plots = rectangles(options.plots), decorExclusions = rectangles(options.decorExclusions);
    const key = "comparison:" + JSON.stringify([completed, artScale, plots, decorExclusions]);
    if (cache.has(key)) return cache.get(key);
    const ordinary = plots.filter(p => p.id !== "wall-01"), built = ordinary.filter(p => p.buildingId);
    const baseContacts = built.map(contactFor), contacts = built.map(p => contactFor({ ...p, width: p.width * artScale, height: p.height * artScale }));
    const pocketPlan = planPockets(mature, plots, decorExclusions, developing), ornaments = pocketPlan.ornaments;
    const entrancePlan = planEntrances(contacts, plots, ornaments, decorExclusions, completed, developing);
    const left = Math.min(...ordinary.map(p => p.x - p.width / 2)) - 100;
    const top = Math.min(...ordinary.map(p => p.y - p.height / 2)) - 100;
    const right = Math.max(...ordinary.map(p => p.x + p.width / 2)) + 100;
    const bottom = Math.max(...ordinary.map(p => p.y + p.height / 2)) + 100;
    const courtBounds = { x: left, y: top, width: right - left, height: bottom - top };
    const hall = ordinary.find(p => p.id === "general-01"), centre = hall?.x ?? (left + right) / 2;
    const groups = [ordinary.filter(p => p.x < centre - 250), ordinary.filter(p => Math.abs(p.x - centre) <= 250), ordinary.filter(p => p.x > centre + 250)];
    const courts = sourceLevel === 1 ? [] : groups.map((members, index) => {
      const points = hull(members.flatMap(p => {
        const contact = contactFor(p), rx = Math.max(120, contact.width * .75), ry = Math.max(85, contact.height * 1.5);
        return [[p.x-rx,contact.y-ry],[p.x+rx,contact.y-ry],[p.x+rx,contact.y+ry],[p.x-rx,contact.y+ry]];
      }));
      return { id: "study-quarter-" + index, members: members.map(p => p.id), points, path: courtPath(points), fullBounds: courtBounds, exclusions: [] };
    }).filter(c => c.points.length >= 3);
    const roads = [];
    if (sourceLevel > 1) {
      const router = makeRouter(plots.concat(ornaments, decorExclusions), { left: left - 150, top: top - 150, right: right + 150, bottom: bottom + 150 });
      const width = options.desktop ? mature ? 65 : 45 : mature ? 45 : 32;
      const pairs = ordinary.flatMap((a, i) => ordinary.slice(i + 1).map(b => ({ a, b, distance: Math.hypot(a.x-b.x,a.y-b.y) })))
        .filter(pair => pair.distance < 700).sort((a,b) => a.distance - b.distance);
      for (const { a, b } of pairs) {
        if (roads.length >= 8) break;
        const ends = p => { const r = box(p, width / 2 + 10); return [[p.x,r.bottom],[r.left,p.y],[r.right,p.y],[p.x,r.top]]; };
        const candidates = ends(a).flatMap(from => ends(b).map(to => ({ from, to, distance: Math.hypot(from[0]-to[0],from[1]-to[1]) })))
          .filter(pair => pair.distance > 8).sort((a,b) => a.distance - b.distance);
        const direct = candidates.find(pair => !router.blockedSegment(pair.from,pair.to,width / 2 + 8));
        const points = direct ? [direct.from,direct.to] : [];
        if (points.length > 1) roads.push({ id: "study-street-" + a.id + "-" + b.id, width, paintedWidth: width + 13, points,
          kind: "district", quality: sourceLevel, material: mature ? "stone" : "earth" });
      }
    }
    const result = freeze({ band, completed, comparison: true, comparisonSourceLevel: sourceLevel, artScale, coordinateSpace: "world", groundBounds,
      terrainAsset: mature ? assets.mature : assets.start, plots, decorExclusions, contacts: contacts.map(contact => ({ ...contact, connector: [], quality: Math.min(completed,Math.max(1,contact.level)) })),
      baseContacts, roads, ornaments, courts, courtBounds, entrances: entrancePlan.entrances, entranceOmissions: entrancePlan.omissions,
      pocketReserves: pocketPlan.pocketReserves, pocketOmissions: pocketPlan.omissions, closedBasinsOnly: true, movingDetails: 0 });
    if (cache.size >= 12) cache.delete(cache.keys().next().value); cache.set(key,result); return result;
  }
  function ornamentMarkup(ornament, index) {
    if (ornament.kind === "shade") {
      const { id, source, sourceWidth, sourceHeight, rect, bodyBounds, fullBounds } = ornament, clip = "oasis-shade-owned-" + id;
      return '<g data-oasis-ornament="shade" data-oasis-pocket="' + id + '" data-decor-source="' + xml(source) + '" data-decor-rect="' + rect.join(",") + '" data-decor-bounds="' + Object.values(fullBounds).map(n).join(",") + '" data-decor-body-bounds="' + Object.values(bodyBounds).map(n).join(",") + '" data-decor-clearance="' + ornament.safetyMargin + '"><svg x="' + n(bodyBounds.x) + '" y="' + n(bodyBounds.y) + '" width="' + n(bodyBounds.width) + '" height="' + n(bodyBounds.height) + '" viewBox="' + rect.join(" ") + '" preserveAspectRatio="xMidYMid meet" overflow="hidden" style="width:' + n(bodyBounds.width) + 'px;height:' + n(bodyBounds.height) + 'px;overflow:hidden"><defs><clipPath id="' + clip + '" clipPathUnits="userSpaceOnUse"><rect x="' + rect[0] + '" y="' + rect[1] + '" width="' + rect[2] + '" height="' + rect[3] + '" fill="white"/></clipPath></defs><image href="' + xml(source) + '" width="' + sourceWidth + '" height="' + sourceHeight + '" clip-path="url(#' + clip + ')"/></svg></g>';
    }
    const atlas = window.AzmaraBuildingArt?.sceneryDecor?.atlas, rect = atlas?.rects?.[ornament.kind];
    if (!rect) return "";
    const { x, y, width, height, kind } = ornament, left = x - width / 2, top = y - height / 2, clip = "oasis-owned-" + kind + "-" + index;
    return '<g data-oasis-ornament="' + kind + '" data-decor-source="' + xml(atlas.src) + '" data-decor-rect="' + rect.join(",") + '" data-decor-bounds="' + [left, top, width, height].map(n).join(",") + '"><svg x="' + n(left) + '" y="' + n(top) + '" width="' + n(width) + '" height="' + n(height) + '" viewBox="' + rect.join(" ") + '" preserveAspectRatio="xMidYMax meet" overflow="hidden" style="width:' + n(width) + 'px;height:' + n(height) + 'px;overflow:hidden"><defs><clipPath id="' + clip + '" clipPathUnits="userSpaceOnUse"><rect x="' + rect[0] + '" y="' + rect[1] + '" width="' + rect[2] + '" height="' + rect[3] + '" fill="white"/></clipPath></defs><image href="' + xml(atlas.src) + '" width="' + atlas.width + '" height="' + atlas.height + '" clip-path="url(#' + clip + ')"/></svg></g>';
  }
  function middleLanding(entrance, id, definitionsOnly = false) {
    const key = id + "-" + entrance.plotOwner + "-landing", d = path(entrance.points), half = entrance.paintedWidth / 2;
    const left = Math.min(...entrance.points.map(p => p[0])) - half, top = Math.min(...entrance.points.map(p => p[1])) - half;
    const width = Math.max(...entrance.points.map(p => p[0])) + half - left, height = Math.max(...entrance.points.map(p => p[1])) + half - top;
    const boundAttributes = ' x="' + n(left) + '" y="' + n(top) + '" width="' + n(width) + '" height="' + n(height) + '"';
    const first = entrance.points[0], last = entrance.points.at(-1);
    if (definitionsOnly) return '<filter id="' + key + '-soft" filterUnits="userSpaceOnUse"' + boundAttributes + ' color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="3"/></filter><linearGradient id="' + key + '-fade" gradientUnits="userSpaceOnUse" x1="' + n(first[0]) + '" y1="' + n(first[1]) + '" x2="' + n(last[0]) + '" y2="' + n(last[1]) + '"><stop stop-color="white"/><stop offset=".65" stop-color="white"/><stop offset="1" stop-color="black"/></linearGradient><mask id="' + key + '-full-width" maskUnits="userSpaceOnUse"' + boundAttributes + '><path d="' + d + '" fill="none" stroke="url(#' + key + '-fade)" stroke-width="' + entrance.paintedWidth + '" stroke-linejoin="round" stroke-linecap="round"/></mask>';
    const stone = entrance.material !== "earth" && entrance.quality >= 20;
    return '<g data-oasis-entrance="' + xml(entrance.plotOwner) + '" data-entrance-source="' + xml(entrance.sourceId) + '" data-entrance-art="' + xml(entrance.sourceArt.src) + '" data-entrance-art-level="' + entrance.sourceArt.artLevel + '" data-entrance-art-crop="' + (entrance.sourceArt.rect || []).join(",") + '" data-entrance-uv="' + entrance.sourceUV.join(",") + '" data-entrance-port="' + entrance.port.map(n).join(",") + '" data-entrance-body-bounds="' + Object.values(entrance.bodyBounds).map(n).join(",") + '" data-entrance-points="' + entrance.points.map(p => p.map(n).join(",")).join(";") + '" data-entrance-painted-width="' + entrance.paintedWidth + '" data-entrance-clearance="' + entrance.safetyMargin + '" data-entrance-paint-bounds="' + [left,top,width,height].map(n).join(",") + '" data-entrance-width-mask="' + key + '-full-width" mask="url(#' + key + '-full-width)"><g filter="url(#' + key + '-soft)" stroke-linecap="round" stroke-linejoin="round"><path d="' + d + '" stroke="#d2ac78" stroke-width="' + (entrance.paintedWidth - 4) + '" opacity=".2"/><path d="' + d + '" stroke="url(#' + id + (stone ? '-stone' : '-soil') + ')" stroke-width="' + (entrance.paintedWidth - 8) + '" opacity="' + (stone ? '.46' : '.32') + '"/>' + (stone ? '' : '<path d="' + d + '" stroke="url(#' + id + '-stone)" stroke-width="' + (entrance.paintedWidth - 10) + '" opacity=".08"/>') + '</g></g>';
  }
  function markerMarkup(id, kind, band = "start") {
    if (kind === "wall") return null;
    const safe = String(id).replace(/[^a-z0-9-]/gi, ""), soil = band === "mature" ? "#bca176" : "#be945c";
    // Quiet irregular open earth, not an isometric lawn tile or ownership icon.
    // Existing button sizes/labels/keyboard focus remain with the caller.
    return '<svg class="empty-plot-art oasis-empty-site" viewBox="0 0 320 270" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-oasis-empty="' + safe + '" style="width:100%;height:100%;pointer-events:none;overflow:visible;stroke:none"><defs><radialGradient id="oasis-clearing-' + safe + '"><stop stop-color="' + soil + '" stop-opacity=".22"/><stop offset=".7" stop-color="' + soil + '" stop-opacity=".12"/><stop offset="1" stop-color="' + soil + '" stop-opacity="0"/></radialGradient></defs><path d="M34 150Q44 127 72 119L118 103Q156 96 186 104L251 126Q283 141 278 163Q258 181 218 190L142 196Q90 195 58 180Q31 169 34 150Z" fill="url(#oasis-clearing-' + safe + ')"/><path d="M71 152l5 2 2 21-6-1Z" fill="#82613d"/><path d="M71 152l5-2 3 4-3 2Z" fill="#b78e57"/><path d="M241 139l5 2 1 19-5-1Z" fill="#82613d"/><path d="M241 139l5-2 3 4-3 2Z" fill="#b78e57"/><path d="M76 175l13 4m158-19 11 4" fill="none" stroke="#765836" stroke-width="3" opacity=".18"/></svg>';
  }
  function render(level, options = {}) {
    const scene = layout(level, options); if (!scene) return null;
    const valleyBackdrop = options.valleyBackdrop === true, bakedStreets = options.bakedStreets === true;
    const variant = (valleyBackdrop ? "valley" : "historical") + (scene.comparison ? ":comparison" : "") + (bakedStreets ? ":baked-streets" : "");
    const cached = renderCache.get(scene); if (cached?.[variant]) return cached[variant];
    const mature = scene.band === "mature", developing = scene.band === "developing", id = "oasis-" + scene.band, terrainAsset = scene.terrainAsset;
    const output = ['<g data-oasis-pilot="' + scene.band + '" data-oasis-coordinate-space="world" aria-hidden="true" style="stroke:none;pointer-events:none"><defs>'];
    const soilSample = '<svg width="2100" height="1200" viewBox="1000 850 2100 1200" preserveAspectRatio="xMidYMid slice" overflow="hidden" style="width:2100px;height:1200px"><image href="' + terrainAsset + '" width="4200" height="2400" preserveAspectRatio="xMidYMid slice"/></svg>';
    // Alternating reflected tiles meet at identical source edge samples. This
    // keeps the calm soil density without a hard seam at each repeated crop.
    output.push('<pattern id="' + id + '-soil" width="4200" height="2400" patternUnits="userSpaceOnUse">' + soilSample + '<g transform="translate(4200 0) scale(-1 1)">' + soilSample + '</g><g transform="translate(0 2400) scale(1 -1)">' + soilSample + '</g><g transform="translate(4200 2400) scale(-1 -1)">' + soilSample + '</g></pattern>');
    if (mature) output.push('<pattern id="' + id + '-stone" width="300" height="300" patternUnits="userSpaceOnUse"><image href="' + assets.stone + '" width="300" height="300" preserveAspectRatio="xMidYMid slice"/></pattern>');
    if (developing) output.push('<pattern id="' + id + '-stone" width="300" height="300" patternUnits="userSpaceOnUse"><image href="' + assets.stone + '" width="300" height="300" preserveAspectRatio="xMidYMid slice"/></pattern>');
    output.push('<linearGradient id="' + id + '-edge-x"><stop stop-color="black"/><stop offset=".07143" stop-color="white"/><stop offset=".92857" stop-color="white"/><stop offset="1" stop-color="black"/></linearGradient><linearGradient id="' + id + '-edge-y" x2="0" y2="1"><stop stop-color="black"/><stop offset=".125" stop-color="white"/><stop offset=".875" stop-color="white"/><stop offset="1" stop-color="black"/></linearGradient><mask id="' + id + '-feather-x" maskUnits="userSpaceOnUse" x="0" y="0" width="4200" height="2400"><rect width="4200" height="2400" fill="url(#' + id + '-edge-x)"/></mask><mask id="' + id + '-feather-y" maskUnits="userSpaceOnUse" x="0" y="0" width="4200" height="2400"><rect width="4200" height="2400" fill="url(#' + id + '-edge-y)"/></mask>');
    // The valley owns its northern cliffs. Suppress only the ground raster's
    // baked northern mountain band, feathering onto the same sampled soil.
    // Floors, contacts, roads, pockets, sockets and eligibility stay unchanged.
    if (valleyBackdrop) output.push('<linearGradient id="' + id + '-valley-north-fade" gradientUnits="userSpaceOnUse" x1="0" y1="600" x2="0" y2="850"><stop stop-color="black"/><stop offset="1" stop-color="white"/></linearGradient><mask id="' + id + '-valley-north" maskUnits="userSpaceOnUse" x="0" y="0" width="4200" height="2400"><rect width="4200" height="2400" fill="url(#' + id + '-valley-north-fade)"/></mask>');
    const courtBounds = scene.comparison ? scene.courtBounds : { x: 650, y: 350, width: 2900, height: 1950 };
    if (mature) output.push('<filter id="' + id + '-court-soft" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="28"/></filter><mask id="' + id + '-courts" maskUnits="userSpaceOnUse" x="' + n(courtBounds.x) + '" y="' + n(courtBounds.y) + '" width="' + n(courtBounds.width) + '" height="' + n(courtBounds.height) + '"><g fill="white" filter="url(#' + id + '-court-soft)">' + scene.courts.map(c => '<path data-oasis-court-outline="' + c.id + '" d="' + c.path + '"/>').join("") + '</g></mask>');
    if (developing) output.push('<filter id="' + id + '-court-soft" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="18"/></filter>' + scene.courts.map(c => '<mask id="' + id + '-' + c.id + '-reserve" maskUnits="userSpaceOnUse" x="' + n(c.fullBounds.x) + '" y="' + n(c.fullBounds.y) + '" width="' + n(c.fullBounds.width) + '" height="' + n(c.fullBounds.height) + '"><path d="' + c.path + '" fill="white" filter="url(#' + id + '-court-soft)"/>' + c.exclusions.map(r => '<rect data-court-exclusion="' + xml(r.id) + '" data-court-reserve-kind="' + r.reserveKind + '" data-court-clearance="' + r.safetyMargin + '" x="' + n(r.bounds.x) + '" y="' + n(r.bounds.y) + '" width="' + n(r.bounds.width) + '" height="' + n(r.bounds.height) + '" fill="black"/>').join("") + '</mask>').join("") + scene.entrances.map(e => middleLanding(e, id, true)).join(""));
    output.push('<radialGradient id="' + id + '-contact"><stop stop-color="#654b30" stop-opacity=".19"/><stop offset=".5" stop-color="#654b30" stop-opacity=".075"/><stop offset="1" stop-color="#654b30" stop-opacity="0"/></radialGradient>');
    output.push('</defs><rect x="-12000" y="-12000" width="28000" height="28000" fill="url(#' + id + '-soil)"/>' + (valleyBackdrop ? '<g data-oasis-valley-ground="true" mask="url(#' + id + '-valley-north)">' : '') + '<g mask="url(#' + id + '-feather-x)"><image data-oasis-ground="' + scene.band + '" href="' + terrainAsset + '" x="0" y="0" width="4200" height="2400" preserveAspectRatio="xMidYMid slice" mask="url(#' + id + '-feather-y)"/></g>' + (valleyBackdrop ? '</g>' : ''));
    if (mature) output.push('<g data-oasis-shared-courts="3" mask="url(#' + id + '-courts)"><rect x="' + n(courtBounds.x) + '" y="' + n(courtBounds.y) + '" width="' + n(courtBounds.width) + '" height="' + n(courtBounds.height) + '" fill="#d6bd92" opacity=".22"/><rect x="' + n(courtBounds.x) + '" y="' + n(courtBounds.y) + '" width="' + n(courtBounds.width) + '" height="' + n(courtBounds.height) + '" fill="url(#' + id + '-stone)" opacity=".34"/></g>');
    if (developing) output.push('<g data-oasis-selective-courts="' + scene.courts.length + '">' + scene.courts.map(c => '<g data-oasis-court-outline="' + c.id + '" data-court-members="' + c.members.join(",") + '" data-court-full-bounds="' + Object.values(c.fullBounds).map(n).join(",") + '" data-court-reserve-mask="' + id + '-' + c.id + '-reserve" data-court-cosmetic-ground="true" mask="url(#' + id + '-' + c.id + '-reserve)"><rect x="' + n(c.fullBounds.x) + '" y="' + n(c.fullBounds.y) + '" width="' + n(c.fullBounds.width) + '" height="' + n(c.fullBounds.height) + '" fill="#d6bd92" opacity=".12"/><rect x="' + n(c.fullBounds.x) + '" y="' + n(c.fullBounds.y) + '" width="' + n(c.fullBounds.width) + '" height="' + n(c.fullBounds.height) + '" fill="url(#' + id + '-stone)" opacity=".34"/></g>').join("") + '</g>');
    // Shared courts merge neighbouring foundations into the same material.
    // Irregular dust shoulders and subdued stone texture do the work; no hard
    // cream outlines, giant rounded kerbs or raised board-game plinths.
    for (const contact of scene.contacts) {
      const width = contact.width * (contact.hall ? 1.3 : 1.18), height = contact.height * (contact.hall ? 1.4 : 1.2), x = contact.x, y = contact.y;
      output.push('<g data-oasis-apron="' + xml(contact.id) + '" data-oasis-ground-anchor="' + [x, y].map(n).join(",") + '"><ellipse cx="' + n(x + 8) + '" cy="' + n(y + 9) + '" rx="' + n(width * .63) + '" ry="' + n(height * .75) + '" fill="#b48e5a" opacity=".12"/>');
      if (mature) {
        const material = contact.quality >= 50 ? 'url(#' + id + '-stone)' : "#bba177";
        if (!bakedStreets && contact.connector.length) output.push('<path data-oasis-apron-connector="' + xml(contact.id) + '" d="' + path(contact.connector) + '" fill="none" stroke="' + material + '" stroke-width="55" opacity=".58"/>');
        output.push('<path d="' + path([[x - width / 2, y - height * .45], [x + width * .46, y - height * .43], [x + width / 2, y + height * .34], [x + width * .32, y + height * .52], [x - width * .38, y + height * .53], [x - width * .53, y + height * .12]]) + 'Z" fill="' + material + '" opacity=".24"/>');
      }
      output.push('<ellipse cx="' + n(x + 5) + '" cy="' + n(y) + '" rx="' + n(contact.width * .52) + '" ry="' + n(contact.height * .5) + '" fill="url(#' + id + '-contact)"/></g>');
    }
    output.push('<g fill="none" stroke-linejoin="bevel" stroke-linecap="butt">');
    if (!bakedStreets) for (const road of scene.roads) {
      const d = path(road.points), material = road.material === "earth" || road.quality < 50 ? "#bba177" : 'url(#' + id + '-stone)';
      output.push('<g data-oasis-street="' + xml(road.id) + '" data-road-painted-width="' + road.paintedWidth + '" data-road-surface-width="' + road.width + '" data-road-quality="' + road.quality + '"' + (road.plotOwner ? ' data-plot-owner="' + xml(road.plotOwner) + '"' : '') + '><path d="' + d + '" stroke="#c7a475" stroke-width="' + road.paintedWidth + '" opacity=".08"/><path d="' + d + '" stroke="' + material + '" stroke-width="' + road.width + '" opacity="' + (road.kind === "district" ? ".52" : ".3") + '"/></g>');
    }
    if (!bakedStreets) for (const entrance of scene.entrances) {
      if (developing) { output.push(middleLanding(entrance, id)); continue; }
      const d = path(entrance.points), material = developing ? entrance.material === "earth" || entrance.quality < 20 ? "#bba177" : 'url(#' + id + '-stone)' : entrance.material === "earth" || entrance.quality < 50 ? "#bba177" : 'url(#' + id + '-stone)';
      output.push('<g data-oasis-entrance="' + xml(entrance.plotOwner) + '" data-entrance-source="' + xml(entrance.sourceId) + '" data-entrance-art="' + xml(entrance.sourceArt.src) + '" data-entrance-art-level="' + entrance.sourceArt.artLevel + '" data-entrance-art-crop="' + (entrance.sourceArt.rect || []).join(",") + '" data-entrance-uv="' + entrance.sourceUV.join(",") + '" data-entrance-port="' + entrance.port.map(n).join(",") + '" data-entrance-body-bounds="' + Object.values(entrance.bodyBounds).map(n).join(",") + '" data-entrance-points="' + entrance.points.map(p => p.map(n).join(",")).join(";") + '" data-entrance-painted-width="' + entrance.paintedWidth + '" data-entrance-clearance="' + entrance.safetyMargin + '"><path d="' + d + '" stroke="#c7a475" stroke-width="' + entrance.paintedWidth + '" stroke-linejoin="round" opacity=".14"/><path d="' + d + '" stroke="' + material + '" stroke-width="' + (entrance.paintedWidth - 6) + '" stroke-linejoin="round" opacity="' + (entrance.material === "earth" ? ".4" : ".66") + '"/></g>');
    }
    output.push('</g>', scene.ornaments.slice().sort((a, b) => a.y + a.height / 2 - b.y - b.height / 2).map(ornamentMarkup).join(""), '</g>');
    const result = freeze({ markup: output.join(""), band: scene.band, terrainAsset, groundBounds, markerMarkup: (plotId, kind) => markerMarkup(plotId, kind, scene.band), layout: scene });
    renderCache.set(scene, { ...cached, [variant]: result }); return result;
  }
  window.AzmaraOasisTown = freeze({ render, layout, markerMarkup, assets, groundBounds, entranceSources, shadeDefinitions, shadeAtlas,
    middleEntranceSources, middleShadeDefinitions, middleShadeAtlas });
})();
