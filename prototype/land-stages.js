/* Locked AZMARA land-stage registry. Runtime selection only; no rendering. */
(() => {
  "use strict";

  const buildingArt = window.AzmaraBuildingArt;
  if (!buildingArt?.milestonesFor) throw new Error("AZMARA land stages require building-art.js");

  const width = 1536;
  const height = 1024;
  const milestones = Object.freeze([...buildingArt.milestonesFor("town-hall")]);
  const sources = Object.freeze(Array.from(
    { length: milestones.length },
    (_, index) => `assets/land/land-stage-${String(index + 1).padStart(2, "0")}.png`
  ));

  if (milestones.length !== 11) throw new Error(`Expected 11 Town Hall looks, received ${milestones.length}`);

  const normalizedBox = (left, top, right, bottom) => Object.freeze({
    left: left / width,
    top: top / height,
    right: right / width,
    bottom: bottom / height,
    width: (right - left) / width,
    height: (bottom - top) / height
  });
  const pixelBox = (left, top, right, bottom) => Object.freeze({
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: bottom - top
  });
  const box = (left, top, right, bottom) => Object.freeze({
    pixels: pixelBox(left, top, right, bottom),
    normalized: normalizedBox(left, top, right, bottom)
  });

  const stages = Object.freeze(milestones.map((minLevel, index) => Object.freeze({
    stage: index + 1,
    look: index + 1,
    minLevel,
    width,
    height,
    src: sources[index]
  })));
  const byMilestone = Object.freeze(Object.fromEntries(stages.map((stage) => [stage.minLevel, stage])));

  function forStage(value) {
    const stage = Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : 1;
    return stages[Math.max(1, Math.min(stages.length, stage)) - 1];
  }

  function forHallLevel(value) {
    const level = Number.isFinite(Number(value)) ? Math.max(1, Math.min(50, Math.floor(Number(value)))) : 1;
    return [...stages].reverse().find((stage) => stage.minLevel <= level) || stages[0];
  }

  window.AzmaraLandStages = Object.freeze({
    width,
    height,
    aspectRatio: width / height,
    milestones,
    sources,
    stages,
    byMilestone,
    boxes: Object.freeze({
      townHall: box(668, 375, 858, 512),
      townWall: box(740, 95, 820, 140)
    }),
    forStage,
    forHallLevel
  });
})();
