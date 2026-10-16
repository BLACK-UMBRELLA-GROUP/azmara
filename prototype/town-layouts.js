"use strict";

// Original render-only arrangements. Stable plot identities own the buildings;
// choosing an arrangement never moves the Hall or any dedicated reserve.
(() => {
  const ids = Object.freeze(Array.from({ length: 18 }, (_, index) => "general-" + String(index + 2).padStart(2, "0")));
  const map = (pairs) => Object.freeze(Object.fromEntries(ids.map((id, index) => [id, Object.freeze({ x: pairs[index][0], y: pairs[index][1] })])));
  const regular = (xs, ys, omit = []) => ys.flatMap((y, row) => xs.filter((_, column) => !omit.some(([r, c]) => r === row && c === column)).map((x) => [x, y]));
  const compactGrid = regular([2350, 2600, 2850, 3100, 3350, 3600], [2010, 2250, 2490, 2740], [[1, 2], [1, 3], [2, 2], [2, 3], [3, 0], [3, 1]]);
  const definitions = [
    {
      id: "staggered", label: "Staggered", description: "The original uneven settlement clusters, with open space around the civic centre.",
      desktop: [[1250,880],[1250,1150],[1050,1400],[1550,860],[1550,1150],[1550,1440],[2650,860],[2950,1420],[3150,900],[2100,1600],[2100,700],[2650,1150],[2950,1150],[2650,1440],[1850,890],[1850,1410],[2350,1410],[2350,890]],
      compact: [[2475,1870],[2410,2105],[2460,2340],[2425,2580],[2740,1980],[2705,2265],[2705,2540],[3550,1880],[3005,1850],[3015,2110],[3000,2655],[3265,1960],[3320,2230],[3260,2515],[3280,2800],[3575,2180],[3560,2480],[3565,2745]]
    },
    {
      id: "grid", label: "Grid", description: "Orderly building rows, with a clear civic gap and room for the dedicated transport reserves.",
      desktop: [[1200,740],[1650,740],[2100,950],[2550,740],[3000,740],[1200,1010],[1650,1010],[2550,1010],[3000,1010],[1200,1290],[1650,1290],[2550,1290],[3000,1290],[1200,1570],[1650,1570],[2100,1570],[2550,1570],[3000,1570]],
      compact: compactGrid
    },
    {
      id: "circle", label: "Circle", description: "Two open civic rings: smaller inner clusters and a wider outer crescent around the Hall.",
      desktop: [[2600,1150],[2454,1341],[2100,1420],[1746,1341],[1600,1150],[1746,959],[2100,950],[2454,959],[3150,1150],[2950,1409],[2424,1568],[1776,1568],[1250,1409],[1050,1150],[1250,891],[1776,732],[2424,732],[2950,891]],
      // Compact civic rings are deliberately angular/open rather than forcing
      // small overlapping targets into a mathematically exact ellipse.
      compact: [[2590,2250],[2590,2490],[3370,2250],[3370,2490],[2340,2010],[2610,2010],[2880,2010],[3150,2010],[3420,2010],[3690,2010],[2300,2250],[2300,2490],[3740,2250],[3740,2490],[2830,2740],[3130,2740],[3430,2740],[3730,2740]]
    },
    {
      id: "avenues", label: "Avenues", description: "Long parallel blocks face a spacious central civic corridor, leaving room for future overland scenery.",
      desktop: regular([1100,1450,1800,2400,2750,3100], [760,1130,1530]),
      compact: [[2360,2005],[2610,2020],[2860,2005],[3120,2020],[3380,2005],[3630,2020],[2360,2260],[2610,2260],[3370,2260],[3620,2260],[2360,2500],[2610,2500],[3370,2500],[3620,2500],[2850,2740],[3110,2740],[3370,2740],[3630,2740]]
    },
    {
      id: "garden-quarters", label: "Garden quarters", description: "Four neighbourhood groups leave shared open courtyards around the central Hall.",
      desktop: [[1230,760],[1580,760],[1230,1020],[1580,1020],[2620,760],[2970,760],[2620,1020],[2970,1020],[1230,1310],[1580,1310],[1230,1570],[1580,1570],[2620,1310],[2970,1310],[2620,1570],[2970,1570],[2100,950],[2100,1570]],
      compact: [[2360,2010],[2640,2010],[2360,2250],[2640,2250],[3320,2010],[3600,2010],[3320,2250],[3600,2250],[2360,2490],[2640,2490],[2700,2750],[2990,2740],[3320,2490],[3600,2490],[3320,2750],[3600,2750],[3060,1850],[2980,2110]]
    }
  ];
  const layouts = Object.freeze(definitions.map((definition) => Object.freeze({
    id: definition.id, label: definition.label, description: definition.description,
    anchors: Object.freeze({ desktop: map(definition.desktop), compact: map(definition.compact) })
  })));
  const get = (id) => layouts.find((layout) => layout.id === id) || layouts[0];
  const valid = (id) => layouts.some((layout) => layout.id === id);
  const anchor = (id, layout = "staggered", { desktop = false } = {}) => {
    const anchors = get(layout).anchors[desktop ? "desktop" : "compact"];
    return Object.hasOwn(anchors, id) ? anchors[id] : null;
  };
  window.AzmaraTownLayouts = Object.freeze({ layouts, ids, get, valid, anchor });
})();
