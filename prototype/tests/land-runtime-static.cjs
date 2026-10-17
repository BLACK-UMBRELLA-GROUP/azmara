"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const prototype = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(prototype, "app.js"), "utf8");
const index = fs.readFileSync(path.join(prototype, "index.html"), "utf8");
const styles = fs.readFileSync(path.join(prototype, "styles.css"), "utf8");

function section(source, from, to) {
  const start = source.indexOf(from);
  assert.notEqual(start, -1, `Missing source marker: ${from}`);
  const end = source.indexOf(to, start + from.length);
  assert.notEqual(end, -1, `Missing source marker: ${to}`);
  return source.slice(start, end);
}

// Registry must exist before app.js evaluates.
const registryScript = index.indexOf('<script src="land-stages.js');
const appScript = index.indexOf('<script src="app.js');
assert(registryScript >= 0 && appScript > registryScript, "land-stages.js must load before app.js");

// Locked source coordinates are consumed as normalized picture fractions.
const frameSource = section(app, "function landFrame(", "function paintedControl(");
const controlSource = section(app, "function paintedControl(", "// DEC-050");
assert.match(frameSource, /boxes\.townHall\.normalized/);
assert.match(frameSource, /width \* window\.AzmaraLandStages\.height \/ window\.AzmaraLandStages\.width/);
assert.match(controlSource, /boxes\[kind === "hall" \? "townHall" : "townWall"\]\.normalized/);
assert.match(controlSource, /box\.left \+ box\.width \/ 2/);
assert.match(controlSource, /box\.top \+ box\.height \/ 2/);

// The live landscape is exactly one locked bitmap; no legacy scenery layers
// are instantiated by the active renderer.
const landscape = section(app, "function renderLandscape(", "function syncWallCanvas(");
assert.match(landscape, /window\.AzmaraLandStages|appearanceFor\(\)/);
assert.match(landscape, /id="azmara-land-stage"/);
assert.match(landscape, /href="\$\{visual\.src\}"/);
assert.match(landscape, /preserveAspectRatio="xMidYMid meet"/);
for (const legacy of ["azmara-oasis-foundation", "town-terrain-overlay", "town-street-ground", "town-scenery-decor", "town-valley-terrain", "town-wall-perimeter"]) {
  assert(!landscape.includes(legacy), `Active landscape still creates ${legacy}`);
}

const appearance = section(app, "function effectiveHallLevel(", "function buildingVisual(");
assert.match(appearance, /devHallLevelOverride \?\? idealTownLevel/);
assert.match(appearance, /appearanceLevel \?\? actualHallLevel\(\)/);
assert.match(appearance, /AzmaraLandStages\.forHallLevel\(level\)/);

// Hall and Wall remain interactive but their art is painted into the land.
// Empty sites likewise draw no extra pin or flag.
const markers = section(app, "function renderMarkers(", "function updateHud(");
assert.match(markers, /painted = plot\.id === HALL_ID \|\| plot\.kind === "wall"/);
assert.match(markers, /building && !painted \? buildingArtMarkup/);
assert.match(markers, /: "";/);
assert.match(markers, /"painted-empty-site"/);
assert(!markers.includes("pinMarkup"), "Active marker renderer must not add site pins");
assert(!markers.includes("town-wall-front-layer"), "Active marker renderer must not add the old wall layer");
assert.match(styles, /body\[data-land-stages="on"\] \.plot-marker\[data-occupied="true"\] \.marker::before \{ display: none; \}/);

// Appearance review uses the same locked land and does not reconstruct the
// retired foundation, streets, scenery or wall stack.
const appearanceStudy = section(app, "function scene(input = {})", "function sprite(");
assert.match(appearanceStudy, /AzmaraLandStages\.forHallLevel\(hallLevel\)/);
const appearanceMarkup = section(app, "function markup(input)", "function contactSheet(");
assert.match(appearanceMarkup, /href="\$\{xml\(data\.land\.src\)\}"/);
assert.match(appearanceMarkup, /plot\.id !== "general-01" && plot\.kind !== "wall"/);
for (const legacy of ["OasisFoundation", "StreetGround", "SceneryDecor", "TownWallLayers"]) {
  assert(!appearanceMarkup.includes(legacy), `Appearance review still creates ${legacy}`);
}

// Cover is the minimum zoom, the locked picture is the only pan boundary,
// and Fit targets the registered painted Town Hall.
const initialFit = section(app, "function initialFitArea(", "function fitArea(");
assert.match(initialFit, /const coverScale = Math\.max\(lockedWidth \/ lockedFrame\.width, lockedHeight \/ lockedFrame\.height\)/);
assert.match(initialFit, /const hallCentredScale = Math\.max\(lockedWidth \/ \(2 \* horizontalReach\), lockedHeight \/ \(2 \* verticalReach\)\)/);
assert.match(initialFit, /scale: Math\.max\(coverScale, hallCentredScale\)/);
const completeFrame = section(app, "function completeTownFrame(", "function closeZoom(");
assert.match(completeFrame, /return landFrame\(desktop\)/);
const layout = section(app, "function layoutMap(", "function stopCameraAnimation(");
assert.match(layout, /const coverScale = Math\.max\(viewportWidth \/ core\.width, viewportHeight \/ core\.height\)/);
assert.match(layout, /const minimumZoom = fit\.scale \/ coverScale/);
assert.match(layout, /const target = fitMap \? plotPosition\(byId\[HALL_ID\], core\) : focus/);
assert.match(layout, /const worldWidth = frame\.width/);
assert.match(layout, /const worldHeight = frame\.height/);
assert.match(layout, /x: frame\.x/);
assert.match(layout, /y: frame\.y/);

// Dev projection is transient: picker levels use real Town Hall milestones,
// saveState cannot persist the override, and Gameplay/reset restore reality.
assert.match(app, /let devHallLevelOverride = null/);
assert.match(app, /AzmaraLandStages\.milestones\.map/);
assert.match(app, /data-land-stage-level/);
assert.match(app, /id="reset-land-stage"/);
const save = section(app, "function saveState(", "function announce(");
assert(!save.includes("devHallLevelOverride"), "Dev land-stage override leaked into saved progress");
const mode = section(app, "function setPreviewMode(", "function panelHeading(");
assert.match(mode, /mode === "gameplay"[\s\S]*devHallLevelOverride = null/);
const picker = section(app, "const landStageButton =", 'if (event.target.closest("#apply-town-layout")');
assert.match(picker, /AzmaraLandStages\.milestones\.includes\(level\)/);
assert.match(picker, /devHallLevelOverride = level/);
assert.match(picker, /devHallLevelOverride = null/);
assert(!picker.includes("saveState()"), "Dev stage picker must not save its projection");
assert.match(index, /class="azmara-dev-button[^"]*" data-panel="dev-tools"/);

// Queuing leaves the completed Hall level unchanged. The level is written
// only after the finish guard accepts elapsed time (or explicit Dev skip).
const startConstruction = section(app, "function startConstruction(", "function finishConstruction(");
assert(!startConstruction.includes("writeBuilding("), "Starting a job must not switch the land stage");
const finishConstruction = section(app, "function finishConstruction(", "function cancellationQuote(");
assert.match(finishConstruction, /if \(!state\.construction \|\| !skip && now < state\.construction\.endsAt\) return false/);
assert.match(finishConstruction, /writeBuilding\(job\.buildingId, jobType\(job\), job\.toLevel\)/);
assert(finishConstruction.indexOf("writeBuilding(") > finishConstruction.indexOf("return false"), "Hall level changed before completion guard");

console.log("PASS locked land runtime source invariants");
