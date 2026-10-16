/* Original first-draft building metadata/gallery. Never reads or writes town state. */
(() => {
  "use strict";

  const groups = [
    {
      id: "civic", title: "Civic life", description: "Learning, provision and the places that bring a town together.",
      buildings: [
        ["academy", "Academy", "A place for scholars to study, exchange methods and shape future discoveries."],
        ["warehouse", "Warehouse", "Covered stores intended to protect part of the town’s materials. The protected amount and storage rules come later."],
        ["provision-house", "Provision House", "A provision courtyard for distributing grain and supporting a contented town."],
        ["palace", "Palace", "A centre for major civic decisions and future expansion planning."],
        ["governors-residence", "Governor’s Residence", "A local seat of administration for a future town beyond the capital."],
        ["museum", "Museum", "A house for collections, shared learning and cultural exchange."],
        ["embassy", "Embassy", "A meeting place for envoys and agreements with neighbours."],
        ["prayer-area", "Prayer Area", "A calm communal courtyard with shade and an ablution basin. Possible satisfaction benefit—details later."]
      ]
    },
    {
      id: "trade", title: "Trade & journeys", description: "Markets, storage and the planning behind future routes.",
      buildings: [
        ["trading-port", "Caravan Station", "A loading courtyard for preparing pack caravans and goods for future overland trade.", "harbour"],
        ["trading-post", "Trading Post", "A market hub where local stocks could meet wider trade."],
        ["depot", "Depot", "Larger yards for bulk storage, intended to offer less protection than a Warehouse. Exact storage rules come later."],
        ["military-exchange", "Military Exchange", "A specialist exchange for future trading of military units. Eligible units and trading rules come later."],
        ["sea-chart-archive", "Route Archive", "A collection of overland maps and route records for planning future caravan journeys."],
        ["dockyard", "Freight Depot", "A dedicated staging yard for future long-haul heavy convoys.", "freighter"],
        ["intelligence-house", "Intelligence House", "An office for gathering information and planning future discreet missions."]
      ]
    },
    {
      id: "war", title: "Defence & resources", description: "Future forces, their equipment and the materials behind them.",
      buildings: [
        ["shipyard", "Retired Caravan Yard", "A retired land-transport design retained only for compatibility with existing saved buildings and construction. New towns use the Caravan Station and Freight Depot.", "harbour", true],
        ["barracks", "Barracks", "A muster courtyard for organising and training future land forces."],
        ["town-wall", "Town Wall", "A short gate wall across the rear valley pass between sandstone cliffs. Timber develops into adobe and sandstone with the wall's own completed level; defensive rules remain future work.", "wall"],
        ["workshop", "Workshop", "A workshop for improving future troop equipment and military tools."],
        ["foresters-house", "Forester’s House", "A base for managing timber work and supporting future timber output."],
        ["silver-refinery", "Silver Refinery", "A place to refine silver for scholarly instruments and advanced equipment."],
        ["iron-foundry", "Iron Foundry", "A forge yard preparing iron for the town’s future military needs."]
      ]
    },
    {
      id: "industry", title: "Craft & efficiency", description: "Careful making, material use and future construction planning.",
      buildings: [
        ["grain-estate", "Grain Estate", "Cultivated land and work yards intended to support future grain output."],
        ["clayworks", "Clayworks", "A practical yard for processing clay for advanced construction."],
        ["carpenters-workshop", "Carpenter’s Workshop", "Careful joinery and reuse could make timber go further in future construction."],
        ["precision-workshop", "Precision Workshop", "Fine toolmaking and measured work could reduce silver needed in future projects."],
        ["materials-workshop", "Materials Workshop", "Efficient preparation and reuse could reduce future iron requirements."],
        ["grain-store", "Grain Store", "Organised storage and handling could make the town’s grain supplies last longer."],
        ["architects-office", "Architect’s Office", "Design and planning could make future buildings use clay more efficiently."],
        ["chronos-forge", "Chronos’ Forge", "A secular workshop for timekeeping, work planning and coordinated construction. A possible future role is faster construction; rules later."]
      ]
    }
  ];

  const plotLabels = {
    general: "General plot", wall: "Wall-only plot", harbour: "Caravan plot", freighter: "Heavy-convoy plot"
  };
  const positions = ["0%", "33.333333%", "66.666667%", "100%"];
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  // Retired IDs remain discoverable for saved towns and queues, never as new choices.
  const registry = Object.freeze([
    Object.freeze({ id: "town-hall", name: "Town Hall", purpose: "The civic courtyard at the centre of your town, intended to provide housing space as it develops. Population growth is a separate satisfaction-led system.", role: "general", group: "civic", index: -1 }),
    ...groups.flatMap((group) => group.buildings.map(([id, name, purpose, role = "general", retired = false], index) => Object.freeze({ id, name, purpose, role, retired, group: group.id, index })))
  ]);
  const entries = Object.freeze(registry.filter((entry) => !entry.retired));
  const byType = new Map(registry.map((entry) => [entry.id, entry]));
  const get = (id) => byType.get(id);
  const reviewLevel = (level) => Number.isFinite(Number(level)) ? Math.max(1, Math.min(50, Math.floor(Number(level)))) : 1;

  function card(group, building, index, level) {
    const [id, name, purpose, role = "general"] = building;
    const position = `${positions[index % 4]} ${index < 4 ? "0%" : "100%"}`;
    const visual = window.AzmaraBuildingArt?.forBuilding(id, level);
    const illustration = id === "town-wall" && window.AzmaraTownWall?.renderPreview
      ? window.AzmaraTownWall.renderPreview(level, "catalogue-stage-art")
      : window.AzmaraBuildingArt?.render
      ? window.AzmaraBuildingArt.render(id, level, "catalogue-stage-art")
      : visual
      ? `<img class="catalogue-stage-art" src="${escapeHtml(visual.src)}" data-art-stage="${visual.stage}" alt="" draggable="false" decoding="async">`
      : `<div class="catalogue-art catalogue-sheet-${group}" data-art-sheet="${group}" data-sheet-cell="${index}" style="background-position:${position}" aria-hidden="true"></div>`;
    return `<article class="catalogue-card" data-building-concept="${id}" data-plot-role="${role}" aria-labelledby="catalogue-${id}-name">
      <div class="catalogue-illustration" data-art-sheet="${group}" data-sheet-cell="${index}" role="img" aria-label="Original proposed ${escapeHtml(name)} illustration">
        ${illustration}
      </div>
      <div class="catalogue-card-copy"><h4 id="catalogue-${id}-name">${escapeHtml(name)}</h4><span class="catalogue-role">${plotLabels[role]}</span><p>${escapeHtml(purpose)}</p><span class="catalogue-status">Level ${level} review · Artwork stage ${visual?.minLevel || window.AzmaraProgression?.forLevel(level).minLevel || 1}</span></div>
    </article>`;
  }

  function render(selectedLevel = 1) {
    const level = reviewLevel(selectedLevel);
    const hallVisual = window.AzmaraBuildingArt?.forBuilding("town-hall", level);
    const levels = Array.from({ length: 50 }, (_, index) => index + 1);
    return `<div class="building-catalogue">
      <div class="panel-heading"><span class="panel-emblem"><svg aria-hidden="true"><use href="#icon-buildings"/></svg></span><div><h2 id="panel-title">Building catalogue</h2><span class="building-type">Original visual draft · ${entries.length} building concepts</span></div></div>
      <p class="panel-description catalogue-intro">First-draft designs for all ${entries.length} active roles through level 50. Working names and designs can change as we review. Functional effects and final balance come later.</p>
      <label class="rename-label" for="catalogue-level">Compare every building at any level</label><select id="catalogue-level">${levels.map((value) => `<option value="${value}" ${value === level ? "selected" : ""}>Level ${value}</option>`).join("")}</select>
      <aside class="catalogue-notice"><strong>Read-only design gallery.</strong><p>Changing this gallery changes no plots, resources or saved levels. To test a build, close it and select an eligible plot in Dev. Review every level from 1–50; each type uses stable first-draft artwork milestones, with intermediate levels retaining its preceding design.</p></aside>
      <section class="catalogue-starting" aria-labelledby="catalogue-starting-title"><h3 class="catalogue-section-heading" id="catalogue-starting-title">Your starting building</h3>
        <article class="catalogue-card catalogue-hall" data-building-concept="town-hall" data-plot-role="general" aria-labelledby="catalogue-town-hall-name"><div class="catalogue-illustration" role="img" aria-label="Original Town Hall illustration"><img class="catalogue-hall-art catalogue-stage-art" src="${escapeHtml(hallVisual?.src || "assets/azmara-town-hall-v3.png")}" data-art-stage="${hallVisual?.stage || 1}" alt="" draggable="false" decoding="async"></div><div class="catalogue-card-copy"><h4 id="catalogue-town-hall-name">Town Hall</h4><span class="catalogue-role">General plot 01 · Central civic site</span><p>${entries[0].purpose}</p><span class="catalogue-status">Level ${level} review · Artwork stage ${hallVisual?.minLevel || window.AzmaraProgression?.forLevel(level).minLevel || 1}</span></div></article>
      </section>
      ${groups.map((group) => `<section class="catalogue-group catalogue-group-${group.id}" aria-labelledby="catalogue-${group.id}-title"><header class="catalogue-group-header"><h3 id="catalogue-${group.id}-title">${group.title}<span>${group.buildings.filter((building) => !building[4]).length} designs</span></h3><p>${group.description}</p></header><div class="catalogue-grid">${group.buildings.map((building, index) => building[4] ? "" : card(group.id, building, index, level)).join("")}</div></section>`).join("")}
      <p class="panel-note catalogue-final-note">These are original first-draft design proposals, not historical claims or final rules. One town still has 23 role-restricted plots; clear an eligible Dev test plot to review alternatives.</p>
    </div>`;
  }

  window.AzmaraCatalogue = Object.freeze({ render, entries, registry, get });
})();
