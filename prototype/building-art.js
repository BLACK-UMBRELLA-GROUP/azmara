/* Original AZMARA appearance stages. Raster atlases; no state or gameplay. */
(() => {
  "use strict";

  // Source-art labels are deliberately independent of completed-level thresholds.
  const artLevels = Object.freeze([1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]);
  const definitions = Object.freeze({
    "town-hall": ["courtyard", "civic", 0],
    "academy": ["courtyard", "books", 1],
    "warehouse": ["solid", "protected-store", 2],
    "provision-house": ["court", "provisions", 3],
    "palace": ["courtyard", "palatial", 4],
    "governors-residence": ["court", "administration", 5],
    "museum": ["court", "collections", 6],
    "embassy": ["court", "envoys", 7],
    "prayer-area": ["shade", "quiet-court", 8],
    "trading-port": ["yard", "caravan-cargo", 9],
    "trading-post": ["market", "market", 10],
    "depot": ["yard", "bulk-store", 11],
    "military-exchange": ["market", "military-trade", 12],
    "sea-chart-archive": ["courtyard", "charts", 13],
    "dockyard": ["yard", "wagon-freight", 14],
    "intelligence-house": ["solid", "discreet", 15],
    "shipyard": ["yard", "legacy-caravan", 16],
    "barracks": ["court", "training", 17],
    "town-wall": ["wall", "gate", 18],
    "workshop": ["shed", "equipment", 19],
    "foresters-house": ["shed", "logs", 20],
    "silver-refinery": ["shed", "silver", 21],
    "iron-foundry": ["shed", "iron", 22],
    "grain-estate": ["yard", "grain-fields", 23],
    "clayworks": ["yard", "clay", 24],
    "carpenters-workshop": ["shed", "joinery", 25],
    "precision-workshop": ["solid", "measured-tools", 26],
    "materials-workshop": ["shed", "metal-stock", 27],
    "grain-store": ["solid", "grain-storage", 28],
    "architects-office": ["court", "plans", 29],
    "chronos-forge": ["shed", "timekeeping", 30]
  });
  const ids = Object.freeze(Object.keys(definitions));
  function scheduleFor(id, attempt = 0) {
    let seed = 2166136261;
    for (const character of id + ":" + attempt) seed = Math.imul(seed ^ character.charCodeAt(0), 16777619) >>> 0;
    // Ten unequal gaps total49, producing exactly eleven stages from1 to50.
    const gaps = [3, 4, 4, 4, 5, 5, 5, 6, 6, 7];
    for (let index = gaps.length - 1; index > 0; index--) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const swap = seed % (index + 1); [gaps[index], gaps[swap]] = [gaps[swap], gaps[index]];
    }
    return Object.freeze(gaps.reduce((levels, gap) => [...levels, levels.at(-1) + gap], [1]));
  }
  const schedules = {}, usedSchedules = new Set();
  for (const id of ids) {
    let attempt = 0, schedule = scheduleFor(id);
    while (usedSchedules.has(schedule.join(","))) schedule = scheduleFor(id, ++attempt);
    schedules[id] = schedule; usedSchedules.add(schedule.join(","));
  }
  Object.freeze(schedules);
  const milestonesFor = (id) => {
    const compatibleId = id === "shipyard" ? "trading-port" : id;
    return Object.hasOwn(schedules, compatibleId) ? schedules[compatibleId] : schedules["town-hall"];
  };
  const milestones = milestonesFor("town-hall");
  // Native atlas sizes and padded full-sprite rectangles; raw originals are preserved.
  const atlasSizes = Object.freeze({
    "provision-house": {"width":1254,"height":1254,"rects":[[56,247,213,180],[356,231,227,194],[670,219,228,210],[974,213,254,216],[36,546,266,228],[346,545,265,228],[643,546,291,235],[958,535,283,248],[18,872,292,251],[320,861,298,269],[629,858,308,275]],"src":"assets/progression/azmara-provision-house-stages-v2.png"},
    "warehouse": {"width":1254,"height":1254,"rects":[[46,235,237,185],[342,215,247,207],[645,194,267,231],[953,190,284,231],[31,550,267,213],[307,544,313,220],[627,541,308,226],[936,531,309,241],[11,909,300,222],[319,886,300,241],[627,875,306,258]],"src":"assets/progression/azmara-warehouse-stages-v2.png"},
    "trading-port": {"width":1254,"height":1254,"rects":[[19,209,276,197],[316,177,309,232],[630,155,303,256],[955,147,290,263],[7,479,309,277],[316,485,307,268],[628,450,304,317],[937,470,313,310],[2,817,315,289],[315,790,313,316],[625,797,316,311]],"src":"assets/progression/azmara-trading-port-stages-land-v3.png"},
    "prayer-area": {"width":1254,"height":1254,"rects":[[68,238,182,150],[363,222,210,183],[678,212,218,195],[995,217,214,190],[31,552,260,199],[342,529,261,227],[651,530,269,227],[965,522,271,232],[22,893,279,229],[337,877,274,250],[645,876,285,250]],"src":"assets/progression/azmara-prayer-area-stages-v2.png"},
    "palace": {"width":1254,"height":1254,"rects":[[55,217,208,182],[368,210,224,192],[678,201,220,199],[982,191,233,210],[32,535,261,223],[330,522,283,240],[643,543,280,217],[962,518,276,252],[21,886,284,247],[325,870,292,264],[636,865,296,264]],"src":"assets/progression/azmara-palace-stages-v2.png"},
    "governors-residence": {"width":1254,"height":1254,"rects":[[59,231,216,182],[361,211,225,202],[671,203,230,210],[965,195,253,218],[41,523,258,233],[354,520,254,230],[653,528,263,213],[953,517,276,240],[33,882,268,244],[346,874,263,258],[650,870,274,262]],"src":"assets/progression/azmara-governors-residence-stages-v2.png"},
    "embassy": {"width":1254,"height":1254,"rects":[[76,233,185,157],[375,214,207,182],[685,213,197,188],[987,217,213,184],[53,548,234,190],[352,533,253,215],[650,542,272,204],[957,511,273,240],[36,884,266,211],[341,878,271,211],[642,878,283,222]],"src":"assets/progression/azmara-embassy-stages-v2.png"},
    "trading-post": {"width":1254,"height":1254,"rects":[[53,228,211,178],[361,212,233,195],[667,216,237,196],[979,211,257,207],[24,542,275,202],[332,533,287,218],[643,562,292,215],[953,516,298,257],[8,875,306,249],[324,887,296,238],[626,884,312,251]],"src":"assets/progression/azmara-trading-post-stages-v2.png"},
    "depot": {"width":1254,"height":1254,"rects":[[52,249,226,173],[348,223,244,200],[667,217,244,206],[967,216,253,207],[33,560,260,190],[340,536,270,218],[644,535,278,227],[956,531,280,231],[10,872,306,239],[319,867,306,243],[633,867,305,243]],"src":"assets/progression/azmara-depot-stages-v2.png"},
    "military-exchange": {"width":1254,"height":1254,"rects":[[55,225,216,179],[359,216,230,190],[669,211,225,202],[970,212,238,202],[27,542,279,209],[339,526,271,218],[637,530,288,224],[949,526,291,230],[16,876,295,241],[318,873,306,245],[631,873,307,244]],"src":"assets/progression/azmara-military-exchange-stages-v2.png"},
    "museum": {"width":1254,"height":1254,"rects":[[36,238,237,184],[355,214,231,203],[660,199,245,229],[950,195,269,233],[29,531,275,216],[322,515,281,240],[624,524,317,227],[947,516,302,245],[11,872,297,260],[320,880,298,258],[622,871,310,262]],"src":"assets/progression/azmara-museum-stages-v2.png"},
    "academy": {"width":1254,"height":1254,"rects":[[84,234,159,137],[388,224,176,151],[706,222,165,155],[996,217,187,158],[68,554,196,161],[375,542,197,176],[683,556,200,158],[989,534,203,190],[59,906,200,189],[376,895,196,200],[681,898,202,187]],"src":"assets/progression/azmara-academy-stages-v2.png"},
    "shipyard": {"width":1254,"height":1254,"rects":[[38,213,230,180],[349,208,235,196],[655,202,245,203],[965,184,264,223],[16,532,286,237],[314,545,301,222],[633,527,304,248],[940,523,305,245],[13,882,286,263],[315,886,310,260],[628,888,308,261]],"src":"assets/progression/azmara-shipyard-stages-v2.png"},
    "barracks": {"width":1254,"height":1254,"rects":[[52,199,239,191],[346,193,257,199],[658,170,260,224],[949,174,282,226],[22,537,288,224],[332,528,285,237],[636,525,291,244],[937,523,314,247],[12,899,307,261],[330,886,295,269],[630,871,309,290]],"src":"assets/progression/azmara-barracks-stages-v2.png"},
    "town-wall": {"width":1254,"height":1254,"rects":[[48,243,231,176],[355,214,235,206],[664,211,246,210],[959,197,264,225],[19,543,289,226],[339,537,277,232],[634,522,289,249],[945,533,299,245],[10,878,294,250],[321,866,303,263],[633,866,304,263]],"src":"assets/progression/azmara-town-wall-stages-v2.png"},
    "workshop": {"width":1254,"height":1254,"rects":[[48,186,246,193],[341,135,262,244],[638,143,281,238],[951,135,287,249],[16,520,290,246],[323,509,295,266],[636,521,290,257],[943,513,292,258],[21,895,280,249],[324,892,296,260],[633,885,300,270]],"src":"assets/progression/azmara-workshop-stages-v2.png"},
    "grain-estate": {"width":1254,"height":1254,"rects":[[36,239,228,191],[339,224,251,211],[646,205,260,231],[945,198,277,242],[15,524,295,243],[320,512,299,268],[629,513,309,266],[943,509,304,271],[8,866,302,267],[314,847,311,285],[627,848,310,283]],"src":"assets/progression/azmara-grain-estate-stages-v2.png"},
    "clayworks": {"width":1254,"height":1254,"rects":[[45,223,234,177],[355,203,235,201],[660,184,261,234],[965,174,269,247],[19,542,290,235],[325,515,297,270],[634,508,301,282],[943,508,310,279],[15,867,299,280],[318,852,309,299],[629,864,311,293]],"src":"assets/progression/azmara-clayworks-stages-v2.png"},
    "carpenters-workshop": {"width":1254,"height":1254,"rects":[[58,236,212,175],[343,214,248,203],[670,195,246,226],[968,198,267,227],[30,534,275,228],[332,533,288,228],[634,529,298,234],[949,528,297,246],[16,875,290,253],[326,886,289,247],[628,876,305,251]],"src":"assets/progression/azmara-carpenters-workshop-stages-v2.png"},
    "precision-workshop": {"width":1254,"height":1254,"rects":[[53,228,252,206],[341,205,264,231],[647,207,267,235],[934,201,291,242],[31,523,291,241],[332,516,286,262],[625,539,301,235],[935,502,302,296],[25,883,297,271],[324,879,299,278],[626,877,310,276]],"src":"assets/progression/azmara-precision-workshop-stages-v2.png"},
    "materials-workshop": {"width":1254,"height":1254,"rects":[[44,233,241,192],[356,225,239,200],[657,191,240,240],[965,203,263,235],[27,530,273,246],[342,532,270,237],[640,512,279,272],[942,514,302,278],[24,876,284,257],[336,865,278,264],[638,868,290,262]],"src":"assets/progression/azmara-materials-workshop-stages-v2.png"},
    "grain-store": {"width":1254,"height":1254,"rects":[[53,238,229,187],[350,217,245,206],[655,213,255,212],[956,195,271,241],[24,529,279,230],[337,516,274,241],[640,520,282,243],[943,508,300,262],[14,877,307,256],[331,874,294,266],[630,867,303,267]],"src":"assets/progression/azmara-grain-store-stages-v2.png"},
    "architects-office": {"width":1254,"height":1254,"rects":[[44,213,236,207],[349,204,248,218],[659,190,251,234],[967,183,263,237],[19,517,292,251],[331,504,290,264],[641,504,290,270],[955,501,291,272],[16,872,289,273],[324,868,304,278],[632,850,305,293]],"src":"assets/progression/azmara-architects-office-stages-v2.png"},
    "chronos-forge": {"width":1254,"height":1254,"rects":[[55,240,222,185],[359,220,231,207],[658,214,244,218],[967,199,261,239],[27,529,282,240],[339,523,279,252],[635,517,292,263],[953,513,297,262],[6,870,313,267],[323,867,300,277],[624,860,314,291]],"src":"assets/progression/azmara-chronos-forge-stages-v2.png"},
    "dockyard": {"width":1254,"height":1254,"rects":[[8,204,292,214],[314,169,305,245],[623,155,303,260],[944,139,307,277],[0,511,308,243],[317,488,306,263],[626,493,307,262],[934,482,320,272],[5,850,309,273],[313,849,309,278],[621,836,318,293]],"src":"assets/progression/azmara-dockyard-stages-land-v3.png"},
    "foresters-house": {"width":1254,"height":1254,"rects":[[51,194,241,197],[337,161,274,226],[646,143,271,248],[952,129,290,270],[12,526,298,257],[322,509,297,280],[628,505,308,284],[943,500,304,289],[9,908,300,255],[312,876,312,306],[626,872,313,315]],"src":"assets/progression/azmara-foresters-house-stages-v2.png"},
    "silver-refinery": {"width":1254,"height":1254,"rects":[[44,195,239,210],[349,169,246,233],[658,161,251,243],[964,158,262,253],[25,534,284,236],[328,517,288,253],[642,526,283,254],[940,510,305,269],[23,881,289,254],[334,860,285,273],[636,846,293,294]],"src":"assets/progression/azmara-silver-refinery-stages-v2.png"},
    "iron-foundry": {"width":1254,"height":1254,"rects":[[59,219,212,174],[361,212,220,187],[676,157,220,245],[980,160,245,238],[30,512,265,246],[339,507,270,254],[644,518,287,247],[958,508,288,265],[17,858,286,261],[335,846,283,277],[638,845,297,275]],"src":"assets/progression/azmara-iron-foundry-stages-v2.png"},
    "sea-chart-archive": {"width":1254,"height":1254,"rects":[[59,190,203,179],[363,160,233,214],[673,155,219,218],[989,145,234,238],[44,528,237,232],[353,527,247,233],[664,520,237,240],[974,499,249,268],[43,892,239,248],[351,884,252,262],[656,884,251,259]],"src":"assets/progression/azmara-sea-chart-archive-stages-v2.png"},
    "intelligence-house": {"width":1254,"height":1254,"rects":[[55,188,212,198],[365,185,216,201],[665,185,228,206],[985,181,228,214],[40,527,232,212],[353,526,243,220],[663,521,247,236],[987,517,237,245],[36,874,243,250],[351,871,246,244],[656,870,251,249]],"src":"assets/progression/azmara-intelligence-house-stages-v2.png"}
  });
  const cache = new Map();
  const terrainCache = new Map();
  const sceneryLayoutCache = new Map();
  const number = (value) => Number(value).toFixed(2).replace(/\.00$/, "");
  const xml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[character]));
  const circle = (x, y, radius, fill, stroke = "#604d35", width = 2) => '<circle cx="' + number(x) + '" cy="' + number(y) + '" r="' + number(radius) + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + width + '"/>';
  const ellipse = (x, y, rx, ry, fill, opacity = 1) => '<ellipse cx="' + number(x) + '" cy="' + number(y) + '" rx="' + number(rx) + '" ry="' + number(ry) + '" fill="' + fill + '" opacity="' + opacity + '"/>';
  function sceneryKey(completed, desktop, plots, decorExclusions = []) {
    return (desktop ? "desktop" : "compact") + ":" + completed + ":" + plots.map((plot) => [plot.id, plot.x, plot.y, plot.width, plot.height, plot.level || 1, plot.buildingId || ""].join(",")).join(";") + ":ui:" + decorExclusions.map((rect) => [rect.id, rect.x, rect.y, rect.width, rect.height].join(",")).join(";");
  }
  function stageFor(level, id = "town-hall") {
    const value = Number(level), completed = Number.isFinite(value) ? Math.max(1, Math.min(50, Math.floor(value))) : 1;
    const thresholds = milestonesFor(id), minLevel = thresholds.filter((milestone) => milestone <= completed).at(-1);
    const index = thresholds.indexOf(minLevel);
    return { stage: index + 1, minLevel, artLevel: artLevels[index], completed };
  }
  function forBuilding(id, level) {
    if (!Object.hasOwn(definitions, id)) return null;
    // Preserve old saved identifiers without rendering retired naval artwork.
    // The active catalogue, names and gameplay roles remain the caller's concern.
    if (id === "shipyard") return forBuilding("trading-port", level);
    const { stage, minLevel, artLevel } = stageFor(level, id), key = id + ":" + minLevel;
    if (!cache.has(key)) {
      if (id === "town-hall") {
        cache.set(key, Object.freeze({ stage, minLevel, artLevel, src: "assets/progression/azmara-hall-level-" + artLevel + ".png", atlas: false }));
      } else {
        const atlas = atlasSizes[id] || { width: 1536, height: 1024 };
        const { width, height } = atlas;
        const rect = Object.freeze(atlas.rects?.[stage - 1]?.slice() || [
          (stage - 1) % 4 * width / 4,
          Math.floor((stage - 1) / 4) * height / 3,
          width / 4, height / 3
        ]);
        cache.set(key, Object.freeze({
          stage, minLevel, artLevel, src: atlas.src || "assets/progression/azmara-" + id + "-stages-v2.png",
          atlas: true, cols: 4, rows: 3, cell: stage - 1,
          atlasWidth: width, atlasHeight: height, rect,
          cellAspect: rect[2] / rect[3]
        }));
      }
    }
    return cache.get(key);
  }

  function render(id, level, className = "") {
    const art = forBuilding(id, level);
    if (!art) return "";
    const classes = String(className).split(/\s+/).filter((value) => /^[a-zA-Z0-9_-]+$/.test(value)).join(" ");
    if (!art.atlas) return '<img class="building-art ' + classes + '" src="' + xml(art.src) + '" alt="" draggable="false" data-building-art="' + id + '" data-art-stage="' + art.stage + '" data-art-min-level="' + art.minLevel + '" data-art-level="' + art.artLevel + '">';
    const [x, y, width, height] = art.rect;
    const positionX = art.atlasWidth === width ? 0 : x / (art.atlasWidth - width) * 100;
    const positionY = art.atlasHeight === height ? 0 : y / (art.atlasHeight - height) * 100;
    return '<span class="building-frame ' + classes + '" aria-hidden="true" data-building-art="' + id + '" data-art-stage="' + art.stage + '" data-art-min-level="' + art.minLevel + '" data-art-level="' + art.artLevel + '" data-art-cell="' + art.cell + '" data-art-rect="' + art.rect.join(",") + '" style="--building-cell-aspect:' + art.cellAspect + '"><span class="building-sprite" style="background-image:url(&quot;' + xml(art.src) + '&quot;);background-size:' + (art.atlasWidth / width * 100) + '% ' + (art.atlasHeight / height * 100) + '%;background-position:' + positionX + '% ' + positionY + '%"></span></span>';
  }

  // Original cosmetic urban development. All geometry is in native painting
  // coordinates. The caller supplies the actual responsive sprite footprints;
  // neither progression nor this renderer owns gameplay or persistent state.
  function laneMaterialDefs() {
    const output = [];
    for (const quality of artLevels) {
      const earth = quality < 10, gravel = quality < 20;
      const palette = earth ? ["#a8895d", "#987c55", "#b4976a", "#a58962"] : gravel ? ["#bba177", "#a98e64", "#cbb387", "#b8a077"] : quality < 40 ? ["#c2a279", "#b5946c", "#d4b88f", "#c3a57f"] : ["#d4bb8f", "#b89d72", "#e4cfa7", "#cab184"];
      output.push('<pattern id="urban-lane-' + quality + '" width="24" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)"><rect width="24" height="12" fill="' + palette[0] + '"/>');
      if (gravel) {
        // Small varied grains, not a large repeating cream slab or centre stripe.
        for (let index = 0; index < 28; index++) {
          const x = (index * 7.13 + 1.2) % 24, y = (index * 3.71 + .9) % 12;
          output.push('<path d="M' + number(x) + ' ' + number(y) + 'l' + number(.6 + index % 3 * .25) + ' -.2 .3 .5 -.8 .25Z" fill="' + palette[index % 4] + '" opacity="' + (earth ? .58 : .86) + '"/>');
        }
        output.push('<path d="M2 4l5-1m8 5 4-1M7 10l3-.3" fill="none" stroke="#806b4c" stroke-width=".35" opacity=".3"/>');
      } else {
        // Fine individual setts with consistent upper-left light and lower edge.
        // A little uneven colour/shape keeps the illustrated lane from reading
        // as a flat UI ribbon at Fit, while the material still resolves at Close.
        for (let row = 0; row < 4; row++) for (let column = -1; column < 5; column++) {
          const x = column * 6 + (row % 2 ? 3 : 0), y = row * 3;
          const shade = palette[(column + row * 3 + 8) % 4], inset = .3 + (column + row + 5) % 3 * .07;
          output.push('<path d="M' + number(x + inset) + ' ' + number(y + .4) + 'l5.1-.12 .38.5 -.2 1.82 -4.95.17 -.4-.5Z" fill="' + shade + '"/><path d="M' + number(x + inset + .1) + ' ' + number(y + .5) + 'l4.9-.12" fill="none" stroke="#f0dec0" stroke-width=".28" opacity=".44"/><path d="M' + number(x + inset + .3) + ' ' + number(y + 2.6) + 'l4.6-.17" fill="none" stroke="#796c55" stroke-width=".32" opacity=".4"/>');
        }
      }
      output.push('</pattern>');
    }
    return output.join("");
  }

  function insetRoadEdge(points, distance, side) {
    return points.map((point, index) => {
      const before = points[Math.max(0, index - 1)], after = points[Math.min(points.length - 1, index + 1)];
      const dx = after[0] - before[0], dy = after[1] - before[1], length = Math.hypot(dx, dy) || 1;
      return [point[0] - dy / length * distance * side, point[1] + dx / length * distance * side];
    });
  }

  function terrainOverlay(level, { desktop = false, plots = [], decorExclusions = [] } = {}) {
    const { artLevel: minLevel, minLevel: actualMinLevel, completed } = stageFor(level);
    if (minLevel === 1) return null;
    const key = sceneryKey(completed, desktop, plots, decorExclusions);
    if (terrainCache.has(key)) return terrainCache.get(key);
    const layout = terrainOverlay.layout(level, { desktop, plots, decorExclusions });
    const { width, height, roads, exclusions, ground } = layout;
    const output = ['<defs>' + laneMaterialDefs() + '<radialGradient id="urban-clean"><stop stop-color="#d3b17e" stop-opacity="' + ground.opacity + '"/><stop offset="1" stop-color="#d3b17e" stop-opacity="0"/></radialGradient><mask id="urban-plot-clear" maskUnits="userSpaceOnUse" x="0" y="0" width="' + width + '" height="' + height + '"><rect width="' + width + '" height="' + height + '" fill="white"/>'];
    for (const rect of exclusions) output.push('<rect x="' + number(rect.x - rect.width / 2 - 3) + '" y="' + number(rect.y - rect.height / 2 - 3) + '" width="' + number(rect.width + 6) + '" height="' + number(rect.height + 6) + '" rx="4" fill="black"/>');
    output.push('</mask></defs><ellipse data-scenery-ground="maintained-field" cx="' + ground.x + '" cy="' + ground.y + '" rx="' + ground.rx + '" ry="' + ground.ry + '" fill="url(#urban-clean)"/>');
    output.push('<g mask="url(#urban-plot-clear)" stroke-linecap="butt" stroke-linejoin="bevel">');
    for (const road of roads) {
      const path = pathFor(road.points), alpha = minLevel < 15 ? .36 + minLevel / 120 : .84;
      const surfaceWidth = Math.max(1.2, road.width - 1.6), edgeWidth = Math.min(.6, road.width * .04);
      const shadowOffset = Math.min(.65, road.width * .12), shadowWidth = Math.max(.5, road.width - shadowOffset * 2 - .8);
      const material = road.artLevel || minLevel, clip = 'urban-lane-clip-' + xml(road.id);
      output.push('<g data-scenery-road="' + xml(road.id) + '" data-road-quality="' + (road.quality || completed) + '" data-road-material="' + material + '" data-road-painted-width="' + road.width + '"' + (road.plotOwner ? ' data-plot-owner="' + xml(road.plotOwner) + '"' : '') + ' opacity="' + alpha + '" fill="none"><defs><mask id="' + clip + '" maskUnits="userSpaceOnUse" x="0" y="0" width="' + width + '" height="' + height + '"><path d="' + path + '" fill="none" stroke="white" stroke-width="' + road.width + '"/></mask></defs>');
      // Shadow/kerb are strictly inset: the exposed diagnostic road.width is
      // the complete painted envelope, including every dimensional detail.
      output.push('<path d="' + path + '" stroke="#77694e" stroke-width="' + road.width + '" opacity=".38"/><path d="' + path + '" stroke="#66563e" stroke-width="' + number(shadowWidth) + '" opacity=".24" transform="translate(0 ' + number(shadowOffset) + ')"/><path d="' + path + '" stroke="url(#urban-lane-' + minLevel + ')" stroke-width="' + surfaceWidth + '"/>');
      if (road.transition) {
        const first = road.points[0], last = road.points.at(-1), gradient = "urban-approach-" + xml(road.id);
        output.push('<defs><linearGradient id="' + gradient + '" gradientUnits="userSpaceOnUse" x1="' + number(first[0]) + '" y1="' + number(first[1]) + '" x2="' + number(last[0]) + '" y2="' + number(last[1]) + '"><stop stop-color="black"/><stop offset="1" stop-color="white"/></linearGradient><mask id="' + gradient + '-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="' + width + '" height="' + height + '"><rect width="' + width + '" height="' + height + '" fill="url(#' + gradient + ')"/></mask></defs><path d="' + path + '" stroke="url(#urban-lane-' + material + ')" stroke-width="' + surfaceWidth + '" mask="url(#' + gradient + '-mask)"/>');
      }
      const first = road.points[0], last = road.points.at(-1), lightSide = last[1] - first[1] > last[0] - first[0] ? 1 : -1;
      output.push('<g mask="url(#' + clip + ')"><path data-road-edge="light" d="' + pathFor(insetRoadEdge(road.points, road.width * .35, lightSide)) + '" stroke="#ead6b3" stroke-width="' + edgeWidth + '" opacity="' + (material >= 20 ? .36 : .15) + '"/><path data-road-edge="shade" d="' + pathFor(insetRoadEdge(road.points, road.width * .35, -lightSide)) + '" stroke="#776a50" stroke-width="' + edgeWidth + '" opacity=".35"/></g>');
      output.push('</g>');
    }
    output.push('</g>');
    const src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '" data-scenery-level="' + actualMinLevel + '" data-scenery-art-level="' + minLevel + '">' + output.join("") + '</svg>');
    // Resizing may introduce new exclusion geometry. Bound cached SVGs rather
    // than retaining every transient camera/profile permutation forever.
    if (terrainCache.size >= 32) terrainCache.delete(terrainCache.keys().next().value);
    terrainCache.set(key, src);
    return src;
  }

  function pathFor(points) {
    return points.map(([x, y], index) => (index ? "L" : "M") + number(x) + " " + number(y)).join(" ");
  }

  // Real illustrated ornaments live in the inline world SVG, not in the
  // data-URI road image: image-document security blocks external atlas hrefs.
  // The atlas is registered only after native alpha/crop ownership is checked.
  const sceneryAtlas = Object.freeze({
    src: "assets/azmara-scenery-atlas-v1.png", width: 1254, height: 1254,
    // Independently alpha-owned full bodies, including native contact shadows.
    // Bench/court/shrub crops are intentionally absent: their source bodies
    // overlap adjacent opaque paint. No equal-cell assumption or clipping.
    rects: Object.freeze({
      palm: Object.freeze([21, 33, 288, 436]), cypress: Object.freeze([367, 23, 192, 440]),
      garden: Object.freeze([580, 58, 372, 382]), fountain: Object.freeze([954, 132, 286, 294]),
      planter: Object.freeze([22, 834, 291, 366]), lamp: Object.freeze([704, 826, 188, 378])
    }),
    cells: Object.freeze({ palm: 0, cypress: 1, garden: 2, fountain: 3, planter: 8, lamp: 10 })
  });
  function sceneryDecor(level, options = {}) {
    if (!sceneryAtlas || stageFor(level).stage === 1) return "";
    const { ornaments } = terrainOverlay.layout(level, options);
    return ornaments.slice().sort((a, b) => a.y + a.ry - b.y - b.ry).map(({ x, y, rx, ry, kind }, index) => {
      const rect = sceneryAtlas.rects[kind];
      if (!rect) return "";
      // A civic fountain is street furniture, not another dominant building.
      // Shrink only its visible viewport; keep the original full-size safety
      // reserve, and retain the same native bottom-centre contact anchor.
      const scale = kind === "fountain" ? .62 : 1, w = rx * 2 * scale, h = ry * 2 * scale;
      const renderBounds = [x - w / 2, y + ry - h, w, h];
      const clip = "urban-decor-owned-" + index + "-" + kind;
      // meet introduces transparent letterbox space. A viewport-only clip
      // would expose neighboring atlas art there; clip the image to the exact
      // checked source rectangle as well, before aspect-preserving placement.
      return '<g data-scenery-ornament="' + kind + '" data-decor-source="' + sceneryAtlas.src + '" data-decor-cell="' + sceneryAtlas.cells[kind] + '" data-decor-rect="' + rect.join(",") + '" data-decor-bounds="' + [x - rx, y - ry, rx * 2, ry * 2].map(number).join(",") + '" data-decor-render-bounds="' + renderBounds.map(number).join(",") + '" data-decor-ground="' + [x, y + ry].map(number).join(",") + '"><svg x="' + number(renderBounds[0]) + '" y="' + number(renderBounds[1]) + '" width="' + number(w) + '" height="' + number(h) + '" viewBox="' + rect.join(" ") + '" preserveAspectRatio="xMidYMax meet" overflow="hidden" style="width:' + number(w) + 'px;height:' + number(h) + 'px;overflow:hidden"><defs><clipPath id="' + clip + '" clipPathUnits="userSpaceOnUse"><rect x="' + rect[0] + '" y="' + rect[1] + '" width="' + rect[2] + '" height="' + rect[3] + '" fill="white" stroke="none"/></clipPath></defs><image href="' + sceneryAtlas.src + '" x="0" y="0" width="' + sceneryAtlas.width + '" height="' + sceneryAtlas.height + '" clip-path="url(#' + clip + ')"/></svg></g>';
    }).join("");
  }
  sceneryDecor.atlas = sceneryAtlas;

  // Exact segment/expanded-rectangle test, not center-point sampling. The road
  // envelope includes its subtle inset kerb/shadow. Caps are butt-ended, not
  // rounded pills. The same pure layout is exposed
  // for deterministic regression checks against rendered plot footprints.
  terrainOverlay.layout = function sceneryLayout(level, { desktop = false, plots = [], decorExclusions = [] } = {}) {
    const { artLevel: minLevel, minLevel: actualMinLevel, completed } = stageFor(level), step = 10;
    const key = sceneryKey(completed, desktop, plots, decorExclusions);
    if (sceneryLayoutCache.has(key)) return sceneryLayoutCache.get(key);
    const width = desktop ? 1672 : 1254, height = desktop ? 941 : 1254;
    const exclusions = plots.filter((plot) => [plot.x, plot.y, plot.width, plot.height].every(Number.isFinite) && plot.width > 0 && plot.height > 0).map((plot) => ({ id: plot.id, x: plot.x, y: plot.y, width: plot.width, height: plot.height, level: Math.max(1, Math.min(50, Number(plot.level) || 1)), buildingId: plot.buildingId || "town-hall" }));
    // Fit-native HUD/footer reserves protect complete decorative props only.
    // They never reroute roads or create fake plots; the caller owns UI layout.
    const reservedDecor = decorExclusions.filter((rect) => [rect.x, rect.y, rect.width, rect.height].every(Number.isFinite) && rect.width > 0 && rect.height > 0).map((rect) => ({ id: rect.id, x: rect.x, y: rect.y, width: rect.width, height: rect.height }));
    const bounds = desktop ? { left: 230, top: 210, right: 1430, bottom: 735 } : { left: 275, top: 340, right: 1140, bottom: 930 };
    // The central district stays fixed. Dry-land approaches may reach reserves
    // above/below it, but remain inside the native terrain painting.
    const routingBounds = { ...bounds };
    for (const rect of exclusions) {
      routingBounds.left = Math.max(20, Math.min(routingBounds.left, Math.floor((rect.x - rect.width / 2 - 35) / step) * step));
      routingBounds.top = Math.max(20, Math.min(routingBounds.top, Math.floor((rect.y - rect.height / 2 - 35) / step) * step));
      routingBounds.right = Math.min(width - 20, Math.max(routingBounds.right, Math.ceil((rect.x + rect.width / 2 + 35) / step) * step));
      routingBounds.bottom = Math.min(height - 20, Math.max(routingBounds.bottom, Math.ceil((rect.y + rect.height / 2 + 35) / step) * step));
    }
    const roadWidth = [0, 2.35, 3.65, 4.65, 6, 7.35, 8.35, 9.35, 10, 11, 12][artLevels.indexOf(minLevel)];
    const pointBlocked = (x, y, buffer = 0) => exclusions.some((rect) => Math.abs(x - rect.x) <= rect.width / 2 + buffer && Math.abs(y - rect.y) <= rect.height / 2 + buffer);
    function intersectsRect(a, b, rect, padX = 0, padY = padX) {
        const lo = [rect.x - rect.width / 2 - padX, rect.y - rect.height / 2 - padY];
        const hi = [rect.x + rect.width / 2 + padX, rect.y + rect.height / 2 + padY];
        let enter = 0, leave = 1;
        for (let axis = 0; axis < 2; axis++) {
          const delta = b[axis] - a[axis];
          if (Math.abs(delta) < 1e-8) { if (a[axis] < lo[axis] || a[axis] > hi[axis]) return false; }
          else {
            const first = (lo[axis] - a[axis]) / delta, second = (hi[axis] - a[axis]) / delta;
            enter = Math.max(enter, Math.min(first, second)); leave = Math.min(leave, Math.max(first, second));
            if (enter > leave) return false;
          }
        }
        return true;
    }
    const segmentBlocked = (a, b, buffer = 0) => exclusions.some((rect) => intersectsRect(a, b, rect, buffer));
    const cols = Math.floor((routingBounds.right - routingBounds.left) / step) + 1, rows = Math.floor((routingBounds.bottom - routingBounds.top) / step) + 1;
    const gridPoints = Array.from({ length: cols * rows }, (_, index) => [routingBounds.left + index % cols * step, routingBounds.top + Math.floor(index / cols) * step]);
    const nativePoint = (index) => gridPoints[index];
    const blockedGrids = new Map();
    function blockedGrid(buffer) {
      if (!blockedGrids.has(buffer)) blockedGrids.set(buffer, gridPoints.map((point) => pointBlocked(...point, buffer)));
      return blockedGrids.get(buffer);
    }
    function closestFree(point, buffer) {
      const blocked = blockedGrid(buffer); let nearest = null, distance = Infinity;
      for (let index = 0; index < cols * rows; index++) {
        if (blocked[index]) continue;
        const candidate = nativePoint(index), squared = (candidate[0] - point[0]) ** 2 + (candidate[1] - point[1]) ** 2;
        if (squared < distance) { nearest = index; distance = squared; }
      }
      return nearest;
    }
    function route(from, to, paintedWidth, exactEndpoints = false) {
      const buffer = paintedWidth / 2 + 5, start = closestFree(from, buffer), end = closestFree(to, buffer);
      if (start === null || end === null) return [];
      const blocked = blockedGrid(buffer), target = nativePoint(end), scores = new Map([[start, 0]]), parents = new Map(), closed = new Set(), heap = [];
      const estimate = (index) => { const point = nativePoint(index); return Math.hypot(point[0] - target[0], point[1] - target[1]); };
      function push(index, priority) {
        const item = { index, priority }; heap.push(item); let at = heap.length - 1;
        while (at > 0) { const parent = (at - 1) >> 1; if (heap[parent].priority <= priority) break; heap[at] = heap[parent]; at = parent; } heap[at] = item;
      }
      function pop() {
        const first = heap[0], tail = heap.pop(); if (heap.length) {
          let at = 0;
          while (at * 2 + 1 < heap.length) { let child = at * 2 + 1; if (child + 1 < heap.length && heap[child + 1].priority < heap[child].priority) child++; if (heap[child].priority >= tail.priority) break; heap[at] = heap[child]; at = child; } heap[at] = tail;
        } return first.index;
      }
      push(start, estimate(start));
      while (heap.length) {
        const at = pop(); if (closed.has(at)) continue;
        if (at === end) {
          const path = []; for (let cursor = end; cursor !== undefined; cursor = parents.get(cursor)) path.push(nativePoint(cursor)); path.reverse();
          // Simplify only where the complete painted-width segment is clear.
          const smooth = [path[0]]; let anchor = 0;
          while (anchor < path.length - 1) { let next = path.length - 1; while (next > anchor + 1 && segmentBlocked(path[anchor], path[next], buffer)) next--; smooth.push(path[next]); anchor = next; }
          if (exactEndpoints) {
            if (segmentBlocked(from, smooth[0], buffer) || segmentBlocked(smooth.at(-1), to, buffer)) return [];
            if (Math.hypot(from[0] - smooth[0][0], from[1] - smooth[0][1]) > .01) smooth.unshift(from);
            if (Math.hypot(to[0] - smooth.at(-1)[0], to[1] - smooth.at(-1)[1]) > .01) smooth.push(to);
          }
          return smooth;
        }
        closed.add(at);
        const x = at % cols, y = Math.floor(at / cols), fromPoint = nativePoint(at);
        for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]) {
          const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
          const next = ny * cols + nx; if (closed.has(next)) continue;
          const nextPoint = nativePoint(next); if (blocked[next] || segmentBlocked(fromPoint, nextPoint, buffer)) continue;
          const score = scores.get(at) + Math.hypot(dx, dy) * step;
          if (score < (scores.get(next) ?? Infinity)) { scores.set(next, score); parents.set(next, at); push(next, score + estimate(next)); }
        }
      }
      return []; // Never draw a crossing merely to force a decorative route.
    }
    const junctions = desktop
      ? [[420,260],[835,230],[1260,270],[330,445],[1300,465],[450,645],[835,670],[1240,690]]
      : [[385,420],[650,355],[1000,440],[305,585],[1070,635],[370,775],[650,800],[1020,865]];
    const connections = [[3,4],[1,6],[5,6],[6,7],[0,1],[1,2],[0,3],[3,5],[2,4],[4,7]];
    const count = minLevel < 10 ? 1 : minLevel < 15 ? 2 : minLevel < 20 ? 4 : connections.length;
    const roads = minLevel === 1 ? [] : connections.slice(0, count).map(([from, to], index) => ({ id: "district-" + (index + 1), width: roadWidth, points: route(junctions[from], junctions[to], roadWidth) })).filter((road) => road.points.length > 1);
    // The land-only revision replaces the connecting watercourse with a dry
    // outer avenue. Small ornamental fountain basins are not waterways.
    if (minLevel >= 35) {
      const outerWidth = minLevel >= 45 ? 9 : 7.5;
      const outer = { id: "outer-avenue", width: outerWidth, points: route(desktop ? [315,600] : [290,760], desktop ? [1150,725] : [1010,900], outerWidth) };
      if (outer.points.length > 1) roads.push(outer);
    }
    const mainRoads = roads.slice();
    const projection = (point, a, b) => {
      const dx = b[0] - a[0], dy = b[1] - a[1], length = dx * dx + dy * dy;
      const t = length ? Math.max(0, Math.min(1, ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / length)) : 0;
      return [a[0] + t * dx, a[1] + t * dy];
    };
    function terminalSections(points, distance) {
      let remaining = distance;
      for (let index = points.length - 1; index > 0; index--) {
        const a = points[index - 1], b = points[index], length = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (length > remaining) {
          const ratio = (length - remaining) / length, split = [a[0] + (b[0] - a[0]) * ratio, a[1] + (b[1] - a[1]) * ratio];
          return [points.slice(0, index).concat([split]), [split].concat(points.slice(index))];
        }
        remaining -= length;
      }
      return [[], points];
    }
    if (minLevel > 1) for (const rect of exclusions) {
      const approachWidth = Math.max(2.5, Math.min(5, roadWidth * .44)), buffer = approachWidth / 2 + 5.25;
      const quality = Math.min(completed, rect.level), localArt = Math.min(minLevel, stageFor(quality, rect.buildingId).artLevel);
      const endpoints = [[rect.x, rect.y - rect.height / 2 - buffer], [rect.x + rect.width / 2 + buffer, rect.y], [rect.x, rect.y + rect.height / 2 + buffer], [rect.x - rect.width / 2 - buffer, rect.y]].filter((point) => point[0] > 20 && point[0] < width - 20 && point[1] > 20 && point[1] < height - 20 && !pointBlocked(...point, approachWidth / 2 + 5));
      const candidates = endpoints.flatMap((end) => mainRoads.flatMap((road) => road.points.slice(1).map((point, index) => {
        const start = projection(end, road.points[index], point);
        return { start, end, distance: Math.hypot(start[0] - end[0], start[1] - end[1]) };
      }))).filter((candidate) => candidate.distance > 3).sort((a, b) => a.distance - b.distance);
      const direct = candidates.find((candidate) => !segmentBlocked(candidate.start, candidate.end, approachWidth / 2 + 5));
      let points = direct ? [direct.start, direct.end] : [];
      // One nearby routed alternative is enough; never force a crossing or
      // disconnect a tiny ornamental approach merely to increase density.
      if (!points.length && candidates[0]) points = route(candidates[0].start, candidates[0].end, approachWidth, true);
      if (points.length < 2) continue;
      const [main, terminal] = terminalSections(points, 45);
      if (main.length > 1) roads.push({ id: "approach-" + rect.id + "-main", width: approachWidth, points: main, quality: completed, artLevel: minLevel, plotOwner: rect.id });
      roads.push({ id: "approach-" + rect.id + "-local", width: approachWidth, points: terminal, quality, artLevel: localArt, plotOwner: rect.id, transition: true });
    }
    const canal = null;
    const ornaments = [], claimed = [];
    const scenicRoutes = roads;
    const ornamentReserves = [...exclusions, ...reservedDecor];
    const overlaps = (x, y, rx, ry) => ornamentReserves.some((rect) => Math.abs(x - rect.x) < rect.width / 2 + rx + 6 && Math.abs(y - rect.y) < rect.height / 2 + ry + 6) || claimed.some((other) => Math.abs(x - other.x) < rx + other.rx + 6 && Math.abs(y - other.y) < ry + other.ry + 5) || scenicRoutes.some((road) => road.points.slice(1).some((point, index) => intersectsRect(road.points[index], point, { x, y, width: rx * 2, height: ry * 2 }, road.width / 2 + 3)));
    function place(kind, target, rx, ry, { searchBounds = bounds, distanceLimit = 130 } = {}) {
      let chosen = null, best = Infinity;
      for (let y = searchBounds.top + ry; y <= searchBounds.bottom - ry; y += 10) for (let x = searchBounds.left + rx; x <= searchBounds.right - rx; x += 10) {
        const distance = (x - target[0]) ** 2 + (y - target[1]) ** 2;
        if (distance < best && !overlaps(x, y, rx, ry)) { best = distance; chosen = { x, y, rx, ry, kind }; }
      }
      // Moving an ornament too far from its intended district is less natural
      // than omitting it on unusually compressed responsive compositions.
      if (chosen && best < distanceLimit ** 2) { ornaments.push(chosen); claimed.push(chosen); return chosen; }
      return null;
    }
    const fountainTargets = desktop ? [[690,385],[1000,535],[770,665]] : [[570,535],[940,690],[740,855]];
    const desiredFountains = minLevel >= 45 ? 3 : minLevel >= 35 ? 2 : 1;
    if (minLevel >= 25) {
      // Reserve a principal basin before smaller courts in every arrangement.
      // If none fits its usual district, search only the finite dry-land
      // routing envelope, keeping identical full-body/road/plot clearances.
      for (const target of fountainTargets) if (place("fountain", target, 45, 42)) break;
      if (!ornaments.some((ornament) => ornament.kind === "fountain")) {
        for (const target of fountainTargets) if (place("fountain", target, 45, 42, { searchBounds: routingBounds, distanceLimit: 300 })) break;
      }
      if (!ornaments.some((ornament) => ornament.kind === "fountain")) {
        // A crowded layout may have no safe basin near a customary court.
        // The last fallback scans the same finite native dry-land envelope;
        // it never relaxes a clearance or paints outside that envelope.
        place("fountain", fountainTargets[0], 45, 42, { searchBounds: routingBounds, distanceLimit: Math.hypot(width, height) });
      }
    }
    const gardenTargets = desktop
      ? [[560,375],[1070,395],[710,595],[1130,590],[490,290],[1190,290],[370,580],[1280,590],[740,280],[960,290],[560,665],[1040,680]]
      : [[480,500],[860,500],[480,700],[875,760],[400,390],[1020,480],[345,720],[1060,785],[650,435],[830,435],[485,850],[855,875]];
    if (minLevel >= 15) for (const target of gardenTargets.slice(0, Math.min(12, Math.floor((minLevel - 10) / 5) + 1))) place("garden", target, 45, 42);
    // Fit-visible courts may be crowded even when a full garden fits safely
    // elsewhere in the same finite dry-land envelope. Reserve that principal
    // planting before optional small props, without shrinking its source body.
    if (minLevel >= 15 && !ornaments.some((ornament) => ornament.kind === "garden")) place("garden", gardenTargets[0], 45, 42, { searchBounds: routingBounds, distanceLimit: Math.hypot(width, height) });
    if (minLevel >= 25) for (const target of fountainTargets.slice(0, desiredFountains)) {
      if (ornaments.filter((ornament) => ornament.kind === "fountain").length >= desiredFountains) break;
      place("fountain", target, 45, 42);
    }
    if (minLevel >= 20) {
      const palmTargets = [];
      for (let x = bounds.left + 75; x < bounds.right - 50; x += 100) { palmTargets.push([x, bounds.top + 65], [x, bounds.bottom - 50]); }
      for (let y = bounds.top + 160; y < bounds.bottom - 90; y += 100) palmTargets.push([bounds.left + 65, y], [bounds.right - 65, y]);
      for (const [index, target] of palmTargets.slice(0, Math.min(palmTargets.length, Math.floor((minLevel - 15) / 5) * 4)).entries()) {
        const cypress = minLevel >= 30 && index % 3 === 2;
        place(cypress ? "cypress" : "palm", target, cypress ? 25 : 35, cypress ? 46 : 42);
      }
    }
    // Preserve one safely exposed native palm when the principal garden uses
    // its customary verge. Caller-provided Fit/UI reserves remain unchanged.
    if (minLevel >= 20 && !ornaments.some((ornament) => ornament.kind === "palm")) place("palm", [bounds.left + 75, bounds.bottom - 50], 35, 42, { searchBounds: routingBounds, distanceLimit: Math.hypot(width, height) });
    if (minLevel >= 40) for (const target of gardenTargets.slice(0, minLevel >= 50 ? 6 : 3)) place("planter", [target[0] + 50, target[1] + 24], 23, 31);
    if (minLevel >= 45) for (const target of fountainTargets.slice(0, 2)) place("lamp", [target[0] + 62, target[1] + 30], 14, 34);
    const layout = Object.freeze({ minLevel: actualMinLevel, artLevel: minLevel, width, height, exclusions: Object.freeze(exclusions.map(Object.freeze)), decorExclusions: Object.freeze(reservedDecor.map(Object.freeze)), roads: Object.freeze(roads.map((road) => Object.freeze({ ...road, points: Object.freeze(road.points.map(Object.freeze)) }))), canal, ornaments: Object.freeze(ornaments.map(Object.freeze)), ground: Object.freeze({ x: desktop ? 835 : 700, y: desktop ? 460 : 630, rx: desktop ? 660 : 510, ry: desktop ? 300 : 380, opacity: minLevel < 15 ? .035 : .06 + (minLevel - 15) * .004 }) });
    // Roads and inline decor share exactly the same layout. Cache at most32
    // complete geometries, keyed by unrounded live bounds/levels, so a camera
    // update cannot accidentally reuse different responsive plot positions.
    if (sceneryLayoutCache.size >= 32) sceneryLayoutCache.delete(sceneryLayoutCache.keys().next().value);
    sceneryLayoutCache.set(key, layout);
    return layout;
  };

  window.AzmaraBuildingArt = Object.freeze({
    forBuilding, render, milestones, milestonesFor, artLevels, buildingIds: ids, terrainOverlay, sceneryDecor,
    geometry: Object.freeze({ width: 1536, height: 1024, groundAnchor: Object.freeze({ x: 768, y: 900 }) })
  });
})();
