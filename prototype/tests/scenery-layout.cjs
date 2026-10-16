"use strict";

// Pure geometry checks, not browser/screenshot certification. An independent
// browser harness can supply {profiles:[{name,desktop,plots:[{id,x,y,width,height}]}]}
// via argv[2], recovering plots through the terrain image's actual CTM.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const project = path.resolve(__dirname, "..");
const realm = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(project, "building-art.js"), "utf8"), realm);
vm.runInNewContext(fs.readFileSync(path.join(project, "progression.js"), "utf8"), realm);
vm.runInNewContext(fs.readFileSync(path.join(project, "town-layouts.js"), "utf8"), realm);
const art = realm.window.AzmaraBuildingArt, progression = realm.window.AzmaraProgression;
const decorAtlas = art.sceneryDecor.atlas;
assert(Object.isFrozen(decorAtlas) && Object.isFrozen(decorAtlas.rects));
assert.equal(decorAtlas.width, 1254); assert.equal(decorAtlas.height, 1254);
assert(fs.existsSync(path.join(project, decorAtlas.src)), "real original local decor atlas");
assert.deepEqual(Object.keys(decorAtlas.rects).sort(), ["cypress", "fountain", "garden", "lamp", "palm", "planter"]);
for (const [kind, rect] of Object.entries(decorAtlas.rects)) {
  assert(Object.isFrozen(rect), kind + " readonly native crop");
  const [x, y, width, height] = rect;
  assert(x >= 0 && y >= 0 && width > 0 && height > 0 && x + width <= decorAtlas.width && y + height <= decorAtlas.height, kind + " complete native atlas crop");
}
assert.equal(art.buildingIds.length, 31);
assert.equal(art.milestonesFor("__proto__"), art.milestonesFor("town-hall"));
assert.equal(art.milestonesFor("constructor"), art.milestonesFor("town-hall"));
const schedules = new Set();
for (const id of art.buildingIds) {
  const schedule = art.milestonesFor(id);
  assert.equal(schedule.length, 11); assert.equal(schedule[0], 1); assert.equal(schedule.at(-1), 50);
  assert(Object.isFrozen(schedule), "fixed render-only schedule");
  for (let index = 1; index < schedule.length; index++) assert(schedule[index] - schedule[index - 1] >= 3 && schedule[index] - schedule[index - 1] <= 7, "unequal bounded milestone gaps");
  if (id !== "shipyard") schedules.add(schedule.join(","));
}
assert.equal(schedules.size, 30, "different stable schedules for all active original building roles");
// Validate every completed level without changing save data. Legacy Shipyard
// remains a readable identifier, but can only return the land Caravan art.
let buildingChecks = 0;
for (const id of art.buildingIds) for (let level = 1; level <= 50; level++) {
  const descriptor = art.forBuilding(id, level);
  assert.equal(descriptor.minLevel, art.milestonesFor(id).filter((milestone) => milestone <= level).at(-1));
  assert.equal(descriptor.artLevel, art.artLevels[descriptor.stage - 1]);
  assert(fs.existsSync(path.join(project, descriptor.src)), id + " registered local asset");
  if (descriptor.atlas) {
    const [x, y, width, height] = descriptor.rect;
    assert(x >= 0 && y >= 0 && width > 0 && height > 0 && x + width <= descriptor.atlasWidth && y + height <= descriptor.atlasHeight, id + " full native crop");
  }
  if (id === "shipyard") assert.equal(descriptor, art.forBuilding("trading-port", level), "retired naval art cannot appear through a legacy save");
  if (id === "trading-port" || id === "dockyard" || id === "shipyard") assert(descriptor.src.endsWith("-stages-land-v3.png"));
  buildingChecks++;
}

const desktop = [[2100,1150],[1250,880],[1250,1150],[1050,1400],[1550,860],[1550,1150],[1550,1440],[2650,860],[2950,1420],[3150,900],[2100,1600],[2100,700],[2650,1150],[2950,1150],[2650,1440],[1850,890],[1850,1410],[2350,1410],[2350,890],[2100,350],[1230,1760],[2760,1820],[3630,2040]];
const compact = [[680,640],[175,130],[110,365],[160,600],[125,840],[440,240],[405,525],[405,800],[1250,140],[705,110],[715,370],[700,915],[965,220],[1020,490],[960,775],[980,1060],[1275,440],[1260,740],[1265,1005],[440,25],[145,1090],[690,1245],[1255,1270]];
function nativePlots(points, wide, minimum = 0) {
  return points.map(([x, y], index) => ({
    id: index < 19 ? "general-" + String(index + 1).padStart(2, "0") : ["wall-01", "harbour-01", "harbour-02", "freighter-01"][index - 19],
    x: wide ? x / 4200 * 1672 : (2300 + x - 1600) / 2800 * 1254,
    y: wide ? y / 2400 * 941 : (1740 + y - 960) / 2800 * 1254,
    width: Math.max(minimum, (index === 0 ? 320 : index === 19 && wide ? 360 : 220) * (wide ? 1672 / 4200 : 1254 / 2800)),
    height: Math.max(minimum, (index === 0 ? 320 : 220) * 2 / 3 * (wide ? 941 / 2400 : 1254 / 2800))
  }));
}
// The defaults are explicit stress fixtures, not claims about actual runtime
// layout choices or responsive anchors. Live recovered profiles are separate.
const sourceProfiles = realm.window.AzmaraTownLayouts.layouts.flatMap((layout) => [true, false].map((wide) => {
  const base = wide ? desktop : compact;
  const points = base.map(([x, y], index) => {
    if (index < 1 || index > 18) return [x, y];
    const id = "general-" + String(index + 1).padStart(2, "0");
    const anchor = realm.window.AzmaraTownLayouts.anchor(id, layout.id, { desktop: wide });
    return wide ? [anchor.x, anchor.y] : [anchor.x - 2300, anchor.y - 1740];
  });
  return { name: (wide ? "desktop" : "compact") + "-" + layout.id + "-source-anchor-fixture", desktop: wide, plots: nativePlots(points, wide) };
}));
const recoveredProfiles = ["compact-ideal50-footprints.json", "desktop-grid50-footprints.json", "compact-v16-fit50-footprints.json"].flatMap((filename) => JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures", filename), "utf8")).profiles);
const profiles = process.argv[2] ? JSON.parse(fs.readFileSync(process.argv[2], "utf8")).profiles : [
  ...sourceProfiles,
  ...recoveredProfiles,
  { name: "desktop-staggered-native", desktop: true, plots: nativePlots(desktop, true) },
  { name: "desktop-expanded-target-stress", desktop: true, plots: nativePlots(desktop, true, 92) },
  { name: "compact-staggered-native", desktop: false, plots: nativePlots(compact, false) },
  { name: "compact-expanded-target-stress", desktop: false, plots: nativePlots(compact, false, 150) }
];
assert(profiles.length > 0);

// Liang–Barsky intersection, independently expressed from runtime routing.
function intersectsSegment(a, b, rectangle, padding) {
  const edges = [rectangle.x - rectangle.width / 2 - padding, rectangle.x + rectangle.width / 2 + padding, rectangle.y - rectangle.height / 2 - padding, rectangle.y + rectangle.height / 2 + padding];
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const p = [-dx, dx, -dy, dy], q = [a[0] - edges[0], edges[1] - a[0], a[1] - edges[2], edges[3] - a[1]];
  let entering = 0, leaving = 1;
  for (let edge = 0; edge < 4; edge++) {
    if (p[edge] === 0) { if (q[edge] < 0) return false; continue; }
    const ratio = q[edge] / p[edge];
    if (p[edge] < 0) entering = Math.max(entering, ratio); else leaving = Math.min(leaving, ratio);
    if (entering > leaving) return false;
  }
  return true;
}
const digest = (value) => crypto.createHash("sha256").update(value).digest("hex");
let groups = 0, segments = 0, ornamentChecks = 0, approachChecks = 0, fountainRoadChecks = 0, uiReserveCases = 0, renderedDecorCropChecks = 0, fitExposureChecks = 0;
for (const profile of profiles) {
  assert.equal(profile.plots.length, 23, profile.name + " exact count");
  const hashes = new Set();
  for (const level of art.milestones) {
    const plots = profile.plots.map((plot, index) => ({ ...plot, level: plot.id === "general-01" ? level : plot.level || (index * 7 % 50 + 1), buildingId: plot.buildingId || art.buildingIds[index % art.buildingIds.length] }));
    const options = { desktop: profile.desktop, plots, decorExclusions: profile.decorExclusions || [] };
    const layout = art.terrainOverlay.layout(level, options), visual = progression.forLevel(level, options);
    const decor = art.sceneryDecor(level, options);
    assert(Object.isFrozen(layout) && Object.isFrozen(layout.roads) && Object.isFrozen(layout.ornaments), "readonly shared layout");
    assert.equal(visual.terrainDecor, decor, "progression exposes the actual separate raster layer");
    if (level === 50) assert(layout.ornaments.some((ornament) => ornament.kind === "fountain"), profile.name + " metropolis retains at least one full-size safe fountain");
    if (level === 50 && profile.requireCoreDecor) for (const kind of ["fountain", "garden", "palm"]) assert(layout.ornaments.some((ornament) => ornament.kind === kind), profile.name + " retains safely exposed principal " + kind);
    if (profile.visibleBounds) for (const ornament of layout.ornaments) {
      const bounds = profile.visibleBounds;
      assert(ornament.x - ornament.rx >= bounds.left && ornament.x + ornament.rx <= bounds.right && ornament.y - ornament.ry >= bounds.top && ornament.y + ornament.ry <= bounds.bottom, profile.name + " complete prop body stays inside independent Fit-visible native rectangle");
      fitExposureChecks++;
    }
    assert.equal(visual.terrainBaseLevel, 1, "registered native scenery, no baked road image");
    assert(visual.terrainAsset.endsWith("-level-1-v3.png"), "maintained dry land revision");
    assert.equal(layout.exclusions.length, 23);
    assert.equal(Boolean(visual.terrainOverlay), level !== 1);
    if (level === 1) {
      assert.equal(layout.roads.length, 0); assert.equal(layout.ornaments.length, 0); assert.equal(layout.canal, null);
      assert.equal(decor, "", "bare town has no planted raster props");
    } else {
      const svg = decodeURIComponent(visual.terrainOverlay.split(",").slice(1).join(","));
      assert(svg.includes('data-scenery-level="' + level + '"'));
      assert(svg.includes('mask="url(#urban-plot-clear)"'));
      assert(svg.includes('data-scenery-ground="maintained-field"'));
      assert(!svg.includes("<image"), "self-contained road image; external raster decor belongs to inline native SVG");
      assert(svg.includes('stroke-linecap="butt"') && svg.includes('stroke-linejoin="bevel"'), "no rounded pill roads or approaches");
      assert(!svg.includes('stroke-linecap="round"') && !svg.includes('urban-slabs'), "no legacy pill caps or broad cream slab ribbons");
      assert(svg.includes('id="urban-lane-50"') && svg.includes('data-road-material="'), "fine granular stone/earth texture and per-road material diagnostic");
      assert(!svg.includes('data-scenery-ornament="'), "raster ornaments are not hidden inside image-document SVG");
      assert(!svg.includes("data-scenery-canal"), "no connecting watercourse in the land-only scene");
      assert.equal(art.terrainOverlay(level, options), visual.terrainOverlay, "cache byte identity");
      assert.equal((decor.match(/data-scenery-ornament=/g) || []).length, layout.ornaments.length, "every safe ornament uses its real raster crop");
      if (layout.ornaments.length) {
        assert(decor.includes('<image href="' + decorAtlas.src + '"'), "real local PNG is loaded by inline SVG, not by data SVG");
        assert(decor.includes('preserveAspectRatio="xMidYMax meet"') && decor.includes('style="width:'), "complete aspect-preserved bottom-grounded sprite and explicit SVG size");
      }
      for (const ornament of layout.ornaments) {
        assert(decorAtlas.rects[ornament.kind], "only alpha-owned safe decor kinds used");
        const number = (value) => Number(value).toFixed(2).replace(/\.00$/, "");
        const bounds = [ornament.x - ornament.rx, ornament.y - ornament.ry, ornament.rx * 2, ornament.ry * 2].map(number).join(",");
        assert(decor.includes('data-decor-bounds="' + bounds + '"'), "full rendered instance bounds are explicitly exposed");
        const rect = decorAtlas.rects[ornament.kind];
        assert(decor.includes('<rect x="' + rect[0] + '" y="' + rect[1] + '" width="' + rect[2] + '" height="' + rect[3] + '" fill="white" stroke="none"/>'), "exact native source crop clip prevents neighboring paint in meet gutters");
        const scale = ornament.kind === "fountain" ? .62 : 1;
        const w = ornament.rx * 2 * scale, h = ornament.ry * 2 * scale;
        const rendered = [ornament.x - w / 2, ornament.y + ornament.ry - h, w, h].map(number).join(",");
        assert(decor.includes('data-decor-render-bounds="' + rendered + '"'), "real visible viewport stays bottom-grounded within the conservative full reserve");
        renderedDecorCropChecks++;
      }
      const nextMilestone = art.milestones.find((milestone) => milestone > level) || 51;
      assert.equal(progression.forLevel(Math.min(50, nextMilestone - 1), options).artLevel, visual.artLevel, "preceding completed Hall milestone retains its source-art label");
      hashes.add(digest(svg));
    }
    const roads = [...layout.roads, ...(layout.canal?.points.length ? [layout.canal] : [])];
    for (const road of roads) {
      assert(road.points.length >= 2);
      assert(road.width > 0 && road.width <= (road.plotOwner ? 5 : road.id === "outer-avenue" ? 9 : 12), "narrow full paint/kerb envelope");
      const shadowOffset = Math.min(.65, road.width * .12), shadowWidth = Math.max(.5, road.width - shadowOffset * 2 - .8);
      assert(shadowOffset + shadowWidth / 2 <= road.width / 2, "every translated road shadow stays inside its full declared envelope");
      for (const point of road.points) assert(point.every(Number.isFinite) && point[0] >= 0 && point[0] <= layout.width && point[1] >= 0 && point[1] <= layout.height, "native painting bounds");
      for (let index = 1; index < road.points.length; index++) for (const plot of plots) {
        assert(!intersectsSegment(road.points[index - 1], road.points[index], plot, road.width / 2 + 4.99), profile.name + " level " + level + " full kerb envelope + 5px clears " + plot.id); segments++;
      }
      if (road.transition) {
        const owner = plots.find((plot) => plot.id === road.plotOwner);
        assert(owner, "approach carries its exact plot owner");
        assert.equal(road.quality, Math.min(level, owner.level));
        const descriptor = art.forBuilding(owner.buildingId, road.quality);
        assert.equal(road.artLevel, Math.min(layout.artLevel, descriptor.artLevel));
        const end = road.points.at(-1);
        assert(Math.abs(end[0] - owner.x) > owner.width / 2 + road.width / 2 + 5 || Math.abs(end[1] - owner.y) > owner.height / 2 + road.width / 2 + 5, "approach stops outside the full painted footprint");
        approachChecks++;
      }
    }
    for (const ornament of layout.ornaments) for (const plot of plots) {
      assert(Math.abs(ornament.x - plot.x) >= ornament.rx + plot.width / 2 + 5.99 || Math.abs(ornament.y - plot.y) >= ornament.ry + plot.height / 2 + 5.99, profile.name + " ornament clears " + plot.id); ornamentChecks++;
    }
    for (const ornament of layout.ornaments) for (const reserve of options.decorExclusions) assert(Math.abs(ornament.x - reserve.x) >= ornament.rx + reserve.width / 2 + 5.99 || Math.abs(ornament.y - reserve.y) >= ornament.ry + reserve.height / 2 + 5.99, "complete ornament clears caller's native HUD/footer envelope plus6px");
    if (level === 50) {
      const fountain = layout.ornaments.find((ornament) => ornament.kind === "fountain");
      const reserve = { id: "synthetic-ui-occupies-old-principal", x: fountain.x, y: fountain.y, width: fountain.rx * 2, height: fountain.ry * 2 };
      const reserved = art.terrainOverlay.layout(level, { ...options, decorExclusions: [...options.decorExclusions, reserve] });
      assert.equal(JSON.stringify(reserved.roads), JSON.stringify(layout.roads), "UI-only reserves do not reroute roads or fake plots");
      assert.notEqual(reserved, layout, "exact UI geometry participates in cache identity");
      for (const ornament of reserved.ornaments) assert(Math.abs(ornament.x - reserve.x) >= ornament.rx + reserve.width / 2 + 5.99 || Math.abs(ornament.y - reserve.y) >= ornament.ry + reserve.height / 2 + 5.99, "synthetic UI reserve genuinely relocates or omits occupied props");
      uiReserveCases++;
    }
    for (const fountain of layout.ornaments.filter((ornament) => ornament.kind === "fountain")) {
      assert.equal(fountain.rx, 45); assert.equal(fountain.ry, 42); // No footprint shrinking to evade safety standards.
      for (const road of roads) for (let index = 1; index < road.points.length; index++) {
        assert(!intersectsSegment(road.points[index - 1], road.points[index], { x: fountain.x, y: fountain.y, width: fountain.rx * 2, height: fountain.ry * 2 }, road.width / 2 + 2.99), profile.name + " complete fountain/shadow clears roadway envelope + 3px");
        fountainRoadChecks++;
      }
    }
    groups++;
  }
  assert.equal(hashes.size, 10, profile.name + " ten distinct developed scenery stages");
  console.log("PASS " + profile.name + ": 11 original scenery milestones; complete roadway/ornament plot clearance");
}
console.log(JSON.stringify({ groups, profiles: profiles.length, activeStableSchedules: schedules.size, buildingLevelChecks: buildingChecks, roadSegmentPlotChecks: segments, ornamentPlotChecks: ornamentChecks, localApproachChecks: approachChecks, fullFountainRoadChecks: fountainRoadChecks, renderedDecorCropChecks, uiReserveCases, fitExposureChecks, browserCertification: false }));
