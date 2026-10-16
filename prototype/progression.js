/* Original appearance stages; no saves, levels, costs or gameplay mutations. */
(() => {
  "use strict";
  const milestones = window.AzmaraBuildingArt?.milestonesFor("town-hall") || Object.freeze([1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]);
  function forLevel(level, { desktop = false, plots = [], decorExclusions = [], scenery = true } = {}) {
    const completed = Number.isFinite(level) ? Math.max(0, Math.min(50, Math.floor(level))) : 0;
    const minLevel = milestones.filter((value) => value <= Math.max(1, completed)).at(-1);
    const stage = milestones.indexOf(minLevel) + 1;
    const artLevel = window.AzmaraBuildingArt?.artLevels[stage - 1] || [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50][stage - 1];
    // Baked roads on the historical level-20 painting crossed live plot
    // anchors. One bare painting plus registered scenery keeps every stage
    // coherent with responsive plot footprints, including at maximum zoom.
    const terrainBaseLevel = 1;
    return Object.freeze({
      stage, minLevel, artLevel,
      hallAsset: window.AzmaraBuildingArt?.forBuilding("town-hall", minLevel)?.src || `assets/progression/azmara-hall-level-${artLevel}.png`,
      terrainBaseLevel,
      terrainAsset: `assets/progression/azmara-desert-${desktop ? "desktop" : "compact"}-level-${terrainBaseLevel}-v3.png`,
      terrainOverlay: scenery ? window.AzmaraBuildingArt?.terrainOverlay(completed, { desktop, plots }) || null : null,
      terrainDecor: scenery ? window.AzmaraBuildingArt?.sceneryDecor?.(completed, { desktop, plots, decorExclusions }) || "" : "",
      sceneryDescription: artLevel < 5 ? "Bare desert plain" : artLevel < 15 ? "Worn lanes and a growing settlement" : artLevel < 30 ? "Stone streets and maintained planted courts" : artLevel < 45 ? "Palm-lined boulevards, fountains and dry outer avenues" : "Marble-paved desert metropolis with formal gardens and fountains"
    });
  }
  window.AzmaraProgression = Object.freeze({ forLevel, milestones });
})();
