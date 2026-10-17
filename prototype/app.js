"use strict";

// Pure, unsaved Appearance study renderer. It accepts a captured live camera
// and registered plot/art metadata; it never owns packing, input or storage.
(() => {
  const xml = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]);
  const scales = Object.freeze([1, .8, .65]);
  const scaleBounds = Object.freeze({ min: .01, max: 1 });
  const normalizedScale = value => Number.isFinite(Number(value)) ? Math.max(scaleBounds.min, Math.min(scaleBounds.max, Number(value))) : 1;
  const freeze = value => { if (value && typeof value === "object" && !Object.isFrozen(value)) { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
  function scene(input = {}) {
    const camera = input.camera;
    if (!camera || ![camera.x,camera.y,camera.width,camera.height].every(Number.isFinite) || camera.width <= 0 || camera.height <= 0) throw new TypeError("Appearance comparison needs the captured live world view");
    const scale = normalizedScale(input.scale);
    const plots = (input.plots || []).map(p => {
      if (![p.x,p.y,p.width,p.height].every(Number.isFinite) || p.width <= 0 || p.height <= 0) throw new TypeError("Comparison plot geometry must be finite");
      const art = p.buildingId ? p.sourceArt || window.AzmaraBuildingArt.forBuilding(p.buildingId,p.level) : null;
      const width = p.width * scale, height = p.height * scale;
      const aspect = art?.cellAspect || (p.buildingId === "town-hall" ? 1.5 : width / height);
      const bodyWidth = Math.min(width,height * aspect), bodyHeight = Math.min(height,width / aspect);
      return { ...JSON.parse(JSON.stringify(p)), sourceArt: art ? JSON.parse(JSON.stringify(art)) : null, artBounds: { x: p.x-bodyWidth/2,y:p.y-bodyHeight/2,width:bodyWidth,height:bodyHeight }, scale };
    });
    if (plots.length !== 23 || new Set(plots.map(p=>p.id)).size !== 23) throw new TypeError("Appearance town comparison retains all23 unique plot IDs");
    const hallLevel = Number.isInteger(input.hallLevel) ? input.hallLevel : 1;
    const layoutId = input.layout || "staggered";
    const landFrame = input.landFrame;
    if (!landFrame || ![landFrame.x,landFrame.y,landFrame.width,landFrame.height].every(Number.isFinite)) throw new TypeError("Appearance comparison needs the locked land frame");
    const land = window.AzmaraLandStages.forHallLevel(hallLevel);
    return freeze({ camera: { ...camera }, cssWidth: input.cssWidth || camera.width, cssHeight: input.cssHeight || camera.height, scale, desktop: input.desktop === true, hallLevel, layout: layoutId, plots,
      landFrame: { ...landFrame }, land: { ...land }, scenerySourceLevel: land.stage, testOnly: true, saved: false });
  }
  function sprite(plot) {
    const art = plot.sourceArt, b = plot.artBounds;
    if (!art) return "";
    if (!art.atlas) return `<image href="${xml(art.src)}" x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}" preserveAspectRatio="xMidYMid meet"/>`;
    const [x,y,width,height] = art.rect;
    return `<svg x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}" viewBox="${x} ${y} ${width} ${height}" overflow="hidden" style="width:${b.width}px;height:${b.height}px;overflow:hidden;stroke:none"><image href="${xml(art.src)}" width="${art.atlasWidth}" height="${art.atlasHeight}"/></svg>`;
  }
  function pinMarkup() {
    return '<svg class="comparison-pin-art" viewBox="0 0 22 34" aria-hidden="true" focusable="false"><ellipse cx="12" cy="30" rx="8" ry="2.4" fill="#745837" opacity=".2"/><path d="M8 3l3-1 1 28-3 2Z" fill="#81603c"/><path d="M8 3l2-2 2 1-1 2Z" fill="#d3ac6a"/><path d="M11 5q6-3 10 0l-3 5 3 5q-5-3-10 0Z" fill="#3a7770" stroke="#ebd69d" stroke-width=".8"/><path d="M13 7l4 1-3 3" fill="none" stroke="#ecd8ab" stroke-width=".8"/></svg>';
  }
  function markup(input) {
    const data = input?.testOnly ? input : scene(input), c = data.camera;
    const bodies = data.plots
      .filter((plot) => plot.buildingId && plot.id !== "general-01" && plot.kind !== "wall")
      .map((plot) => `<g data-study-building="${xml(plot.id)}" data-study-type="${xml(plot.buildingId)}" data-study-scale="${data.scale}" data-study-art-bounds="${Object.values(plot.artBounds).join(",")}">${sprite(plot)}</g>`)
      .join("");
    let content = `<image href="${xml(data.land.src)}" x="${data.landFrame.x}" y="${data.landFrame.y}" width="${data.landFrame.width}" height="${data.landFrame.height}" preserveAspectRatio="xMidYMid meet"/>${bodies}`;
    const prefix = "study-" + Math.round(data.scale*100) + "-";
    content = content.replace(/id="([^"]+)"/g,(_,id)=>`id="${prefix}${id}"`).replace(/url\(#([^)]+)\)/g,(_,id)=>`url(#${prefix}${id})`);
    return `<svg class="comparison-world" xmlns="http://www.w3.org/2000/svg" viewBox="${c.x} ${c.y} ${c.width} ${c.height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Temporary ${Math.round(data.scale*100)} percent building-size comparison" data-study-scale="${data.scale}" data-study-camera="${Object.values(c).join(",")}" data-study-scenery-level="${data.scenerySourceLevel}" style="stroke:none;pointer-events:none">${content}</svg>`;
  }
  function contactSheet(level = 50, scale = .8) {
    const entries = window.AzmaraCatalogue.entries;
    return entries.map(entry => {
      const wall = entry.id === "town-wall" ? window.AzmaraTownWall.layout(Math.max(1,level),{desktop:true}) : null;
      return { id: entry.id,name: entry.name,level,scale,
        sourceArt: wall ? { ...wall.image,rect:Object.values(wall.sourceCrop),artLevel:wall.artLevel,activeWall:true } : window.AzmaraBuildingArt.forBuilding(entry.id,level),
        markup: wall ? window.AzmaraTownWall.renderPreview(level,"study-type-art") : window.AzmaraBuildingArt.render(entry.id,level,"study-type-art") };
    });
  }
  window.AzmaraAppearanceStudy = Object.freeze({ scales, scaleBounds, scene, markup, pinMarkup, contactSheet });
})();

(() => {
  const STORAGE_KEY = "azmara-town-layout-v3";
  const LEGACY_KEY = "azmara-town-design-v1";
  const LAYOUT_ID = "town-23-v1";
  const LEGACY_CONSTRUCTION_MS = 10000;
  const CONSTRUCTION_MS = 120000;
  const FREE_CANCEL_MS = 60000;
  const MAX_TEST_LEVEL = 50;
  const MAX_RESOURCE = 100000;
  const ART_MILESTONES = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
  const CORE = { x: 2300, y: 1740, width: 1400, height: 1320 };
  // Only the settlement and a small scenic border are explorable. Screen-ratio
  // padding fills the viewport but must not create additional camera travel.
  const TOWN_FRAME = { x: 2080, y: 1580, width: 1840, height: 1960 };
  const TERRAIN_ART = { x: 1600, y: 960, width: 2800, height: 2800 };
  const DESKTOP_CORE = { x: 900, y: 700, width: 2500, height: 1050 };
  const DESKTOP_ART = { x: 0, y: 0, width: 4200, height: 2400 };
  // Enclose the full upper reserve sprite at every closer scale (DEC-050).
  const DESKTOP_FRAME = { x: 650, y: 0, width: 3150, height: 2230 };
  const desktopQuery = matchMedia("(min-width: 1024px) and (min-height: 600px)");
  const LAND_WIDTHS = Object.freeze({ desktop: 4200, compact: 2800 });
  const LAND_HALL_ANCHORS = Object.freeze({
    desktop: Object.freeze({ x: 2100, y: 1150 }),
    compact: Object.freeze({ x: CORE.x + 680, y: CORE.y + 640 })
  });
  function landFrame(desktop = desktopQuery.matches) {
    const profile = desktop ? "desktop" : "compact";
    const width = LAND_WIDTHS[profile];
    const height = width * window.AzmaraLandStages.height / window.AzmaraLandStages.width;
    const hall = window.AzmaraLandStages.boxes.townHall.normalized;
    const anchor = LAND_HALL_ANCHORS[profile];
    return Object.freeze({
      x: anchor.x - (hall.left + hall.width / 2) * width,
      y: anchor.y - (hall.top + hall.height / 2) * height,
      width,
      height
    });
  }
  function paintedControl(kind, desktop = desktopQuery.matches) {
    const frame = landFrame(desktop);
    const box = window.AzmaraLandStages.boxes[kind === "hall" ? "townHall" : "townWall"].normalized;
    return Object.freeze({
      x: frame.x + (box.left + box.width / 2) * frame.width,
      y: frame.y + (box.top + box.height / 2) * frame.height,
      width: box.width * frame.width,
      height: box.height * frame.height
    });
  }
  // DEC-050: a larger, staggered civilian field uses the upper clearing.
  // Hall is its geometric centre; the dedicated river-port sites stay separate.
  // Compact anchors and saved plot identities remain unchanged.
  const desktopAnchors = {
    "general-01": { x: 2100, y: 1150 },
    "general-02": { x: 1250, y: 880 },
    "general-03": { x: 1250, y: 1150 },
    "general-04": { x: 1050, y: 1400 },
    "general-05": { x: 1550, y: 860 },
    "general-06": { x: 1550, y: 1150 },
    "general-07": { x: 1550, y: 1440 },
    "general-08": { x: 2650, y: 860 },
    "general-09": { x: 2950, y: 1420 },
    "general-10": { x: 3150, y: 900 },
    "general-11": { x: 2100, y: 1600 },
    "general-12": { x: 2100, y: 700 },
    "general-13": { x: 2650, y: 1150 },
    "general-14": { x: 2950, y: 1150 },
    "general-15": { x: 2650, y: 1440 },
    "general-16": { x: 1850, y: 890 },
    "general-17": { x: 1850, y: 1410 },
    "general-18": { x: 2350, y: 1410 },
    "general-19": { x: 2350, y: 890 },
    "wall-01": { x: 2100, y: 400 },
    "harbour-01": { x: 1230, y: 1700 },
    "harbour-02": { x: 2970, y: 1700 },
    "freighter-01": { x: 2100, y: 1820 }
  };
  // Native building crops are taller than the old generic 3:2 ground token.
  // Preserve their horizontal spacing but give roof/vertical faces enough room
  // to fill the site; the same enlarged bounds protect roads and HUD clearance.
  const DEFAULT_BUILDING_SCALE = .55;
  const PLOT_ART = { get width() { return (desktopQuery.matches ? 320 : 220) * DEFAULT_BUILDING_SCALE; }, get height() { return (desktopQuery.matches ? 270 : 190) * DEFAULT_BUILDING_SCALE; } };
  const HALL_ART = { get width() { return paintedControl("hall").width; }, get height() { return paintedControl("hall").height; } };
  const WALL_ART = { get width() { return paintedControl("wall").width; }, get height() { return paintedControl("wall").height; } };
  const footprintFor = (plot) => plot.id === "general-01" ? HALL_ART : plot.kind === "wall" ? WALL_ART : PLOT_ART;
  const MAX_MAP_ZOOM = 2.4;
  const MAP_ZOOM_FACTOR = 1.10;
  const CAMERA_TRANSITION_MS = 180;
  const reducedMotionQuery = matchMedia("(prefers-reduced-motion: reduce)");
  const HALL_ID = "general-01";
  // Legacy stone is displayed as Clay; these are toy stocks, not an economy.
  const resourceLabels = { coins: "Coins", timber: "Timber", stone: "Clay" };
  const plotRoleLabels = { general: "General", wall: "Wall", harbour: "Caravan", freighter: "Freight Depot" };
  const plots = [{ id: HALL_ID, kind: "general", name: "Town Hall", icon: "town", x: 680, y: 640, occupied: true, short: "Hall" }];
  // Original uneven clusters leave room for paths and follow the riverbank.
  // These are render anchors only; plot identities and saved state stay fixed.
  const generalAnchors = [
    [175, 130], [110, 365], [160, 600], [125, 840],
    [440, 240], [405, 525], [405, 800], [1250, 140],
    [705, 110], [715, 370], [700, 915],
    [965, 220], [1020, 490], [960, 775], [980, 1060],
    [1275, 440], [1260, 740], [1265, 1005]
  ];
  generalAnchors.forEach(([x, y], index) => {
    const n = String(index + 2).padStart(2, "0");
    plots.push({ id: `general-${n}`, kind: "general", name: `General plot ${n}`, icon: "plot", x, y, occupied: false, short: n });
  });
  plots.push(
    { id: "wall-01", kind: "wall", name: "Wall plot", icon: "wall", x: 850, y: -120, occupied: false, short: "W" },
    { id: "harbour-01", kind: "harbour", name: "Caravan plot 1", icon: "caravan", x: 145, y: 1090, occupied: false, short: "C1" },
    { id: "harbour-02", kind: "harbour", name: "Caravan plot 2", icon: "caravan", x: 690, y: 1245, occupied: false, short: "C2" },
    { id: "freighter-01", kind: "freighter", name: "Freight depot plot", icon: "convoy", x: 1255, y: 1270, occupied: false, short: "F" }
  );
  const byId = Object.fromEntries(plots.map((plot) => [plot.id, plot]));
  const plotUses = {
    general: { title: "General building plot", description: "An empty place for an ordinary town building. Explore the original building designs in the catalogue; unlocks, costs and construction choices will be refined later. Nothing can be constructed here in this visual preview." },
    wall: { title: "City wall plot", description: "A single gate wall crosses the rear valley pass between two cliff shoulders. It starts as a weak wooden palisade and strengthens as the wall is updated. This is cosmetic; defensive rules are not implemented." },
    harbour: { title: "Caravan Station plot", description: "A fixed overland loading yard for light pack caravans. Ordinary buildings cannot occupy this plot. Land trade, ownership, costs and journey rules are not implemented." },
    freighter: { title: "Freight Depot plot", description: "A fixed yard for heavy wagon convoys: larger loads, slower journeys than pack caravans. Capacity, costs and travel rules remain design questions; this is a visual sample only." }
  };
  const adviserNotes = {
    forces: { title: "Military", icon: "forces", description: "Foot soldiers, riders, spies, equipment and the defence of your towns.", note: "The approved military buildings and discoveries are shown as design areas only. Claude's rules pass will own training, morale, medicine, combat and costs." },
    trade: { title: "Trade", icon: "caravan", description: "Pack caravans, heavy convoys, markets and long-distance desert routes.", note: "This design surface will later hold routes, loads, escorts, delivery jobs and player trading. No journey or economy is simulated in this visual pass." },
    knowledge: { title: "Discoveries", icon: "knowledge", description: "Choose what your scholars pursue across Military, Trade, Diplomacy, Knowledge, Town and Maps.", note: "The approved discovery groups are presentation-ready, but research points, requirements and effects remain Claude's rules work." },
    diplomacy: { title: "Diplomacy", icon: "diplomacy", description: "Allies, envoys, agreements and relationships beyond your town.", note: "The Royal Palace will anchor this area. There are no connected players, messages, alliances or agreements in this visual build." }
  };
  const playerAvailability = {
    forces: "Army management and combat are not available yet.",
    trade: "Caravan routes, markets and player trading are not available yet.",
    knowledge: "Research and discoveries are not available yet.",
    diplomacy: "Diplomatic contacts, messages and agreements are not available yet.",
    "merchant-ships": "Pack caravans are not available yet. Capacity, loading and route rules are still being developed.",
    "freighter-ships": "Heavy wagon convoys are not available yet. Capacity, loading and travel rules are still being developed.",
    inventory: "Inventory and item management are not available yet.",
    shop: "The Shop and Pearls are not available yet. No purchases can be made.",
    population: "Population and housing rules are still being developed.",
    "action-points": "Action-point allowances and regeneration are still being developed."
  };
  const hudNotes = {
    "merchant-ships": { title: "Pack caravans", icon: "caravan", description: "Light pack-animal caravans carry small loads quickly along overland trade routes.", note: "A first design direction, not balanced gameplay. Ownership, capacity, loading, travel times and costs remain undecided; no caravans can be bought or sent yet." },
    "freighter-ships": { title: "Heavy wagon convoys", icon: "convoy", description: "Heavy freight wagons carry much larger loads, with slower journeys than pack caravans.", note: "Freight Depot is their proposed town facility. Capacity, availability and route rules will be refined later; this preview does not run trade journeys." },
    inventory: { title: "Inventory", icon: "inventory", description: "A place for future items and belongings, separate from your town's material stocks.", note: "Inventory is not configured. There are no item grants, purchases or equipment systems here yet. The existing demo stocks remain in the town resource bar." },
    shop: { title: "Shop", icon: "bazaar", description: "The shop entry is ready for a later design discussion.", note: "No products, premium currency, prices or payments are configured. This preview cannot make purchases." },
    population: { title: "Town population", icon: "population", description: "This counter will show the population of your selected town, not an empire-wide total.", note: "Population is not configured. The agreed direction is that Town Hall increases housing capacity and satisfaction controls growth or departure. Exact capacity, satisfaction and growth rules have not been approved or implemented." },
    "action-points": { title: "Action points", icon: "action-points", description: "A future counter for the actions available from your selected town.", note: "Action points are not configured. Starting allowance, regeneration and which actions use points remain undecided; no number is invented for this preview." }
  };

  const $ = (selector) => document.querySelector(selector);
  const all = (selector) => [...document.querySelectorAll(selector)];
  const panel = $("#detail-panel");
  const content = $("#panel-content");
  const viewport = $("#map-viewport");
  const townMap = $("#town-map");
  const townCore = $("#town-core");
  const mapSurface = $("#map-surface");
  const landscape = $("#world-landscape");
  const actionsMenu = $("#actions-menu");
  const actionsToggle = $("#toggle-actions");
  const sidebar = $("#town-sidebar");
  const sidebarToggle = $("#sidebar-toggle");
  const sidebarClose = $("#sidebar-close");
  const sidebarBackdrop = $("#sidebar-backdrop");
  const number = (value) => new Intl.NumberFormat("en-GB").format(value);
  const icon = (name) => `<svg aria-hidden="true"><use href="#icon-${name}"/></svg>`;
  const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  let storageAvailable = true;
  let lastSavedState = null;
  // Presentation only: the private workbench starts in Dev on each load.
  // Neither mode owns, copies or resets the saved town.
  let previewMode = "dev";
  let openView = null;
  let returnFocus = null;
  let toastTimer;
  let mapZoom = 1;
  let fitMap = true;
  let closeMap = false;
  let mapMetrics = null;
  let mapFocus = { x: CORE.x + CORE.width / 2, y: CORE.y + CORE.height / 2 };
  let manualMapLabels = null;
  let cameraAnimation = null;
  let cameraFrame = 0;
  let mapDrag = null;
  let suppressMapClickUntil = 0;
  let landscapeProfile = null;
  let appearanceLevel = null;
  let appearanceType = "town-hall";
  let idealTownLevel = null;
  let catalogueLevel = 1;
  let appearanceCamera = null;
  let appearanceComparisonScale = .55;
  let appearanceComparisonSolo = false;
  let appearanceScaleFrame = 0;
  let appearanceSelectedPlot = null;
  let appearanceBuildSites = false;
  // Unsaved Dev-only level projection. This drives the same Town Hall
  // milestone rule as real progress; it is never written to localStorage.
  let devHallLevelOverride = null;
  let buildChoice = null;
  let clearConfirmation = null;
  let cancelConfirmation = false;
  // Receipt identity stays private and transient; same-millisecond replacement
  // projects must not inherit authority from a remembered old button.
  const jobControlOwners = new WeakMap();
  let desktopNorthInset = 0;
  let desktopHallOutset = 0;
  let desktopEdgeInset = 0;
  let desktopWallInset = 0;
  let desktopWallClearanceLimited = false;
  let desktopInsetSize = "";
  let projectedAnchors = {};
  let compactProjectedAnchors = {};
  let compactInsetSize = "";
  let completeTownFit = null;
  let sidebarOpen = false;
  const townLayout = () => state.plotLayout || "staggered";
  const baseAnchor = (plot, desktop = desktopQuery.matches) => window.AzmaraTownLayouts.anchor(plot.id, townLayout(), { desktop }) || (desktop ? desktopAnchors[plot.id] : { x: CORE.x + plot.x, y: CORE.y + plot.y });
  const activeCore = () => landFrame();
  const actionsTrigger = () => all('[data-desktop-action="options"]').find((node) => node.getClientRects().length) || sidebarToggle || actionsToggle;
  const mapInteractionBlocked = () => panel.open || actionsMenu.open || sidebarOpen;
  function returnToControl(target) {
    const available = (node) => node?.isConnected && node.getClientRects().length && !node.closest("[hidden], [inert]") &&
      getComputedStyle(node).visibility !== "hidden" && getComputedStyle(node).display !== "none";
    const fallback = desktopQuery.matches ? sidebar?.querySelector(".desktop-town-selector") : sidebarToggle;
    const control = available(target) ? target : available(fallback) ? fallback : null;
    control?.focus({ preventScroll: true });
  }
  // Only chrome painted inside the real playfield reserves camera space.
  // The sidebar is physically outside this viewport, not an overlay to dodge.
  function playfieldChrome() {
    const scene = viewport.getBoundingClientRect();
    return all(".desktop-compass").flatMap((node) => {
      const box = node.getBoundingClientRect();
      if (!box.width || !box.height || box.right <= scene.left || box.left >= scene.right || box.bottom <= scene.top || box.top >= scene.bottom) return [];
      return [{ left: Math.max(0, box.left - scene.left), right: Math.min(scene.width, box.right - scene.left),
        top: Math.max(0, box.top - scene.top), bottom: Math.min(scene.height, box.bottom - scene.top) }];
    });
  }
  function townUsableArea() {
    const width = viewport.clientWidth, height = viewport.clientHeight;
    const bottomControls = playfieldChrome().filter((box) => box.top > height / 2);
    return { top: 12, bottom: bottomControls.length ? Math.min(...bottomControls.map((box) => box.top)) - 12 : height - 12,
      left: 10, right: width - 10 };
  }
  function syncSidebar() {
    if (!sidebar) return;
    const drawer = !desktopQuery.matches;
    const open = drawer && sidebarOpen;
    document.body.dataset.sidebarOpen = String(open);
    sidebar.inert = drawer && !open;
    sidebar.setAttribute("aria-hidden", String(drawer && !open));
    if (open) { sidebar.setAttribute("role", "dialog"); sidebar.setAttribute("aria-modal", "true"); }
    else { sidebar.removeAttribute("role"); sidebar.removeAttribute("aria-modal"); }
    sidebarToggle?.setAttribute("aria-expanded", String(open));
    if (sidebarBackdrop) sidebarBackdrop.hidden = !open;
    viewport.inert = open || atlas.currentView() !== "town";
    atlas.setInteractionBlocked(open);
    const camera = $(".desktop-compass");
    if (camera) camera.inert = open || atlas.currentView() !== "town";
  }
  function closeSidebar(restoreFocus = true) {
    if (!sidebarOpen) return;
    sidebarOpen = false;
    syncSidebar();
    if (restoreFocus && !desktopQuery.matches) sidebarToggle?.focus({ preventScroll: true });
  }
  function openSidebar() {
    if (!sidebar || desktopQuery.matches || panel.open || actionsMenu.open) return;
    stopCameraAnimation();
    endMapDrag();
    sidebarOpen = true;
    syncSidebar();
    sidebarClose?.focus({ preventScroll: true });
  }
  function wallControlAnchor(desktop) {
    // The only relocated role is wall-01 (DEC-086). Empty and built controls
    // share the real rear gate's source-registered door centre, never a proxy.
    const gate = window.AzmaraTownWall?.layout(50, { desktop }).gate;
    return gate ? { x: gate.x, y: gate.y } : baseAnchor(byId["wall-01"], desktop);
  }
  function wallPresentationEnvelope(desktop, worldPlots = []) {
    const scenes = [1, 11, 33].map((level) => window.AzmaraTownWall?.layout(level, { desktop, plots: worldPlots })).filter(Boolean);
    const union = (boxes) => {
      const valid = boxes.filter(Boolean); if (!valid.length) return null;
      const x = Math.floor(Math.min(...valid.map((b) => b.x))), y = Math.floor(Math.min(...valid.map((b) => b.y)));
      return { x, y, width: Math.ceil(Math.max(...valid.map((b) => b.x + b.width))) - x,
        height: Math.ceil(Math.max(...valid.map((b) => b.y + b.height))) - y };
    };
    return { worldBounds: union(scenes.map((scene) => scene.worldBounds)),
      paintedBounds: union(scenes.map((scene) => scene.paintedBounds)),
      decorExclusions: scenes.flatMap((scene) => scene.decorExclusions || []) };
  }
  function wallPackingReserves(fit, desktop) {
    // Every material's complete paint is reserved even when unbuilt, so construction/review
    // cannot make an ordinary target jump into the gate or cliff shoulder.
    const wall = wallPresentationEnvelope(desktop);
    const terrain = window.AzmaraTownWall?.terrainLayout?.({ desktop });
    const gate = wallControlAnchor(desktop), target = footprintFor(byId["wall-01"]);
    const paint = wall?.paintedBounds || wall?.worldBounds;
    return (paint ? [{ id: "rear-wall-paint", x: paint.x + paint.width / 2, y: paint.y + paint.height / 2,
      width: paint.width, height: paint.height }] : []).concat(terrain?.decorExclusions || [],
      [{ id: "rear-wall-target", x: gate.x, y: gate.y, width: Math.max(target.width, 44 / fit.scale),
        height: Math.max(target.height, 44 / fit.scale) }]);
  }
  function updateDesktopNorthInset(width, height, fit) {
    const size = `${width}:${height}:${townLayout()}:${fit.scale}:${fit.centerX}:${fit.centerY}`;
    if (desktopInsetSize === size) return;
    desktopInsetSize = size;
    const usable = townUsableArea();
    const overlays = playfieldChrome().filter((box) => box.top < height / 2);
    const center = { x: DESKTOP_CORE.x + DESKTOP_CORE.width / 2, y: DESKTOP_CORE.y + DESKTOP_CORE.height / 2 };
    const fitLeft = center.x * fit.scale - fit.centerX;
    const fitTop = center.y * fit.scale - fit.centerY;
    let required = 0;
    plots.filter((plot) => plot.kind === "general").forEach((plot) => {
      const anchor = baseAnchor(plot, true);
      const shift = (1600 - anchor.y) / 900;
      if (shift <= 0) return;
      const art = plot.id === HALL_ID ? HALL_ART : PLOT_ART;
      const halfWidth = Math.max(44, art.width * fit.scale) / 2;
      const halfHeight = Math.max(44, art.height * fit.scale) / 2;
      const x = (anchor.x - DESKTOP_ART.x) * fit.scale - fitLeft;
      const y = (anchor.y - DESKTOP_ART.y) * fit.scale - fitTop;
      overlays.forEach((overlay) => {
        if (x + halfWidth <= overlay.left || x - halfWidth >= overlay.right) return;
        required = Math.max(required, (overlay.bottom + 4 + halfHeight - y) / (fit.scale * shift));
      });
    });
    const aspectInset = Math.min(180, Math.max(0, width / height - 2.1) * 260);
    // Keep the closest 270-world-unit rows separated by a complete marker
    // plus one pixel. Larger Fit scales can safely clear a taller HUD envelope.
    const markerHeight = Math.max(44, PLOT_ART.height * fit.scale);
    const safeInset = Math.max(0, 900 * (1 - (markerHeight + 1) / (270 * fit.scale)));
    desktopNorthInset = Math.min(safeInset, Math.max(aspectInset, required));
    const markerWidth = Math.max(44, PLOT_ART.width * fit.scale);
    const hallWidth = Math.max(44, HALL_ART.width * fit.scale);
    const hallHeight = Math.max(44, HALL_ART.height * fit.scale);
    const projectedY = (anchor) => anchor.y + desktopNorthInset * (1600 - anchor.y) / 900;
    const hall = desktopAnchors[HALL_ID];
    desktopHallOutset = 0;
    // Preserve the nominal Hall footprint even after Reset, so only a resize
    // can adjust these symmetric interior rows, not an occupancy change.
    ["general-16", "general-17", "general-18", "general-19"].forEach((id) => {
      const anchor = baseAnchor(byId[id], true);
      if (Math.abs(projectedY(anchor) - projectedY(hall)) * fit.scale >= (markerHeight + hallHeight) / 2 + 1) return;
      desktopHallOutset = Math.max(desktopHallOutset, ((markerWidth + hallWidth) / 2 + 1) / fit.scale - Math.abs(anchor.x - hall.x));
    });
    desktopEdgeInset = 0;
    [["general-03", "general-04"], ["general-14", "general-10"]].forEach(([id, outerId]) => {
      const anchor = baseAnchor(byId[id], true);
      const outer = baseAnchor(byId[outerId], true);
      if (Math.abs(projectedY(anchor) - projectedY(outer)) * fit.scale >= markerHeight + 1) return;
      desktopEdgeInset = Math.max(desktopEdgeInset, (markerWidth + 1) / fit.scale - Math.abs(anchor.x - outer.x));
    });
    // The rear gate stays registered to the pass. Fit reserves its complete
    // paint and target instead of pushing the control toward the town centre.
    desktopWallInset = 0;
    desktopWallClearanceLimited = false;
    // A responsive presentation may need more space than the nominal drawing.
    // Keep the civic/dedicated anchors fixed, then find the nearest clear place
    // for each movable target. This never changes the saved plot identity.
    const screen = (p) => ({ x: p.x * fit.scale - fitLeft, y: p.y * fit.scale - fitTop });
    const boundsFor = (plot, point) => {
      const footprint = footprintFor(plot), p = screen(point);
      const w = Math.max(44, footprint.width * fit.scale), h = Math.max(44, footprint.height * fit.scale);
      return { left: p.x - w / 2, right: p.x + w / 2, top: p.y - h / 2, bottom: p.y + h / 2 };
    };
    const overlaps = (a, b) => a.left < b.right + 2 && a.right > b.left - 2 && a.top < b.bottom + 2 && a.bottom > b.top - 2;
    // Keep dedicated sites independent of the selected layout, but register
    // their complete Fit targets inside the usable short-screen envelope.
    const fixed = { [HALL_ID]: { ...hall }, "wall-01": wallControlAnchor(true) };
    for (const plot of plots.filter((p) => p.kind === "harbour" || p.kind === "freighter")) {
      const point = { ...baseAnchor(plot, true) };
      const box = boundsFor(plot, point);
      point.y -= Math.max(0, box.bottom - usable.bottom) / fit.scale;
      fixed[plot.id] = point;
    }
    projectedAnchors = { ...fixed };
    const occupiedBoxes = plots.filter((p) => p.id === HALL_ID || p.kind !== "general").map((p) => {
      return boundsFor(p, fixed[p.id]);
    });
    occupiedBoxes.push(...wallPackingReserves(fit, true).map((reserve) => {
      const point = screen(reserve);
      return { left: point.x - reserve.width * fit.scale / 2, right: point.x + reserve.width * fit.scale / 2,
        top: point.y - reserve.height * fit.scale / 2, bottom: point.y + reserve.height * fit.scale / 2 };
    }));
    const hudBoxes = overlays.map((o) => ({ ...o, top: 0 }));
    const movable = plots.filter((p) => p.kind === "general" && p.id !== HALL_ID);
    // Keep the outer crescent available before fitting its denser inner ring.
    // Otherwise early inner targets can consume every late outer candidate.
    if (townLayout() === "circle") movable.sort((a, b) => {
      const distance = (plot) => { const anchor = baseAnchor(plot, true); return (anchor.x - hall.x) ** 2 + (anchor.y - hall.y) ** 2; };
      return distance(b) - distance(a) || a.id.localeCompare(b.id);
    });
    const fixedBoxes = occupiedBoxes.slice();
    const pack = (order) => {
      const occupiedBoxes = fixedBoxes.slice(), anchors = { ...fixed };
      let valid = true;
      order.forEach((plot) => {
      const anchor = baseAnchor(plot, true);
      const desired = { x: anchor.x, y: anchor.y + desktopNorthInset * (1600 - anchor.y) / 900 };
      const obstacles = occupiedBoxes.concat(hudBoxes);
      const clear = (p) => {
        const b = boundsFor(plot, p);
        return b.left >= usable.left && b.right <= usable.right && b.top >= usable.top && b.bottom <= usable.bottom && !obstacles.some((obstacle) => overlaps(b, obstacle));
      };
      let point = desired;
      if (!clear(point)) {
        const candidates = [];
        const halfWidth = Math.max(44, PLOT_ART.width * fit.scale) / 2;
        const halfHeight = Math.max(44, PLOT_ART.height * fit.scale) / 2;
        const gap = 2.05;
        // Test exact rectangle-edge candidates instead of a coarse half-plot
        // lattice. The old lattice could miss a perfectly clear narrow gap,
        // then leave a late Circle/Grid/Avenues target on an occupied site.
        // This is render packing only: every saved/base anchor stays intact.
        const xs = [...new Set([screen(desired).x, usable.left + halfWidth, usable.right - halfWidth,
          ...obstacles.flatMap((b) => [b.left - halfWidth - gap, b.right + halfWidth + gap])])]
          .filter((x) => x >= usable.left + halfWidth && x <= usable.right - halfWidth);
        const ys = [...new Set([screen(desired).y, usable.top + halfHeight, usable.bottom - halfHeight,
          ...obstacles.flatMap((b) => [b.top - halfHeight - gap, b.bottom + halfHeight + gap])])]
          .filter((y) => y >= usable.top + halfHeight && y <= usable.bottom - halfHeight);
        for (const x of xs) for (const y of ys) {
          const p = { x: (x + fitLeft) / fit.scale, y: (y + fitTop) / fit.scale };
          if (p.x < 650 || p.x > 3800 || p.y < 350 || p.y > 2100 || !clear(p)) continue;
          candidates.push({ ...p, distance: (p.x - desired.x) ** 2 + (p.y - desired.y) ** 2 });
        }
        candidates.sort((a, b) => a.distance - b.distance || a.y - b.y || a.x - b.x);
        if (candidates.length) point = { x: candidates[0].x, y: candidates[0].y };
      }
      if (!clear(point)) valid = false;
      anchors[plot.id] = point;
      occupiedBoxes.push(boundsFor(plot, point));
      });
      return { anchors, valid };
    };
    const primary = pack(movable);
    let packed = primary;
    // Narrow desktop space can starve a late target even with exact edges.
    // Retry only a failed primary arrangement, in seven deterministic orders;
    // successful frames never change and no retry alters any base/save data.
    if (!primary.valid) {
      const byY = (a, b) => baseAnchor(a, true).y - baseAnchor(b, true).y || baseAnchor(a, true).x - baseAnchor(b, true).x || a.id.localeCompare(b.id);
      const byX = (a, b) => baseAnchor(a, true).x - baseAnchor(b, true).x || byY(a, b);
      const radius = (plot) => { const p = baseAnchor(plot, true); return (p.x - hall.x) ** 2 + (p.y - hall.y) ** 2; };
      const byRadius = (a, b) => radius(a) - radius(b) || a.id.localeCompare(b.id);
      const retries = [movable.slice().reverse(), movable.slice().sort(byY), movable.slice().sort(byY).reverse(),
        movable.slice().sort(byX), movable.slice().sort(byX).reverse(), movable.slice().sort(byRadius), movable.slice().sort(byRadius).reverse()];
      for (const order of retries) { const candidate = pack(order); if (candidate.valid) { packed = candidate; break; } }
    }
    projectedAnchors = packed.anchors;
    desktopWallClearanceLimited = !packed.valid;
  }
  function plotPosition(plot, core = activeCore()) {
    // The two locked controls are registered to source-picture fractions so
    // a later higher-resolution master can replace this one without drift.
    if (plot.id === HALL_ID) {
      const control = paintedControl("hall");
      return { x: control.x, y: control.y };
    }
    if (plot.kind === "wall") {
      const control = paintedControl("wall");
      return { x: control.x, y: control.y };
    }
    // The baked street layer and every building/pin must share one coordinate
    // source. Responsive packing used to move controls away from their saved
    // layout anchors, leaving painted streets pointing at empty ground. The
    // smaller 80% artwork keeps the approved anchors readable without that
    // presentation-only relocation; 44px targets remain enforced separately.
    if (window.AzmaraStreetGround) return baseAnchor(plot, desktopQuery.matches);
    if (desktopQuery.matches && desktopAnchors[plot.id]) {
      const position = baseAnchor(plot, true);
      if (projectedAnchors[plot.id]) return projectedAnchors[plot.id];
      if (plot.kind === "wall") return { x: position.x, y: position.y + desktopWallInset };
      if (plot.kind !== "general") return position;
      if (plot.id === HALL_ID) return position;
      return projectedAnchors[plot.id] || position;
    }
    return compactProjectedAnchors[plot.id] || baseAnchor(plot, false);
  }
  function updateCompactAnchors(fit) {
    const key = `${viewport.clientWidth}:${viewport.clientHeight}:${townLayout()}:${fit.scale}`;
    if (compactInsetSize === key) return;
    compactInsetSize = key;
    compactProjectedAnchors = {};
    const rectangle = (plot, p) => {
      const f = footprintFor(plot), w = Math.max(f.width, 44 / fit.scale), h = Math.max(f.height, 44 / fit.scale);
      return { left: p.x - w / 2, right: p.x + w / 2, top: p.y - h / 2, bottom: p.y + h / 2 };
    };
    const margin = 2 / fit.scale;
    const overlaps = (a, b) => a.left < b.right + margin && a.right > b.left - margin && a.top < b.bottom + margin && a.bottom > b.top - margin;
    compactProjectedAnchors["wall-01"] = wallControlAnchor(false);
    const occupiedBoxes = plots.filter((p) => p.id === HALL_ID || p.kind !== "general").map((p) =>
      rectangle(p, p.kind === "wall" ? compactProjectedAnchors[p.id] : baseAnchor(p, false)));
    occupiedBoxes.push(...wallPackingReserves(fit, false).map((reserve) => ({ left: reserve.x - reserve.width / 2,
      right: reserve.x + reserve.width / 2, top: reserve.y - reserve.height / 2, bottom: reserve.y + reserve.height / 2 })));
    plots.filter((p) => p.kind === "general" && p.id !== HALL_ID).forEach((plot) => {
      const desired = baseAnchor(plot, false), clear = (p) => {
        const b = rectangle(plot, p);
        return b.left >= TOWN_FRAME.x && b.right <= TOWN_FRAME.x + TOWN_FRAME.width && b.top >= TOWN_FRAME.y && b.bottom <= TOWN_FRAME.y + TOWN_FRAME.height && !occupiedBoxes.some((o) => overlaps(b, o));
      };
      let p = desired;
      if (!clear(p)) {
        const candidates = [];
        for (let row = -12; row <= 12; row++) for (let column = -12; column <= 12; column++) {
          const q = { x: desired.x + column * 24, y: desired.y + row * 24 };
          if (clear(q)) candidates.push({ ...q, distance: (q.x - desired.x) ** 2 + (q.y - desired.y) ** 2 });
        }
        candidates.sort((a, b) => a.distance - b.distance || a.y - b.y || a.x - b.x);
        if (candidates.length) p = { x: candidates[0].x, y: candidates[0].y };
      }
      compactProjectedAnchors[plot.id] = p;
      occupiedBoxes.push(rectangle(plot, p));
    });
  }

  function defaultState(townName = "Your town") {
    return { version: 3, layoutId: LAYOUT_ID, townName, resources: { coins: 2400, timber: 760, stone: 540 }, hallLevel: 1, construction: null };
  }

  function validName(value) {
    return typeof value === "string" && value.trim().length > 0 && value.length <= 20;
  }

  const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  const metadataFor = (typeId) => window.AzmaraCatalogue.get(typeId);
  function acceptsType(plotId, typeId) {
    if (!Object.hasOwn(byId, plotId)) return false;
    const entry = metadataFor(typeId);
    if (!entry) return false;
    return plotId === HALL_ID ? typeId === "town-hall" : typeId !== "town-hall" && entry.role === byId[plotId].kind;
  }
  function illustrativeCost(level) {
    const multiplier = Math.max(1, level);
    return { coins: 240 * multiplier, timber: 130 * multiplier, stone: 100 * multiplier };
  }
  function buildingIn(saved, plotId) {
    if (plotId === HALL_ID) return saved.hallPlaced === false ? null : { typeId: "town-hall", level: saved.hallLevel };
    return saved.buildings && Object.hasOwn(saved.buildings, plotId) ? saved.buildings[plotId] : null;
  }

  function loadState() {
    let raw;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) {
        // Historical layout is read-only: carry a name, never levels or stock.
        try {
          const old = JSON.parse(localStorage.getItem(LEGACY_KEY));
          if (validName(old?.townName)) return defaultState(old.townName.trim());
        } catch { /* Bad old data does not disable otherwise working storage. */ }
        return defaultState();
      }
    } catch {
      storageAvailable = false;
      return defaultState();
    }
    try {
      const saved = JSON.parse(raw);
      const isQuantity = (value) => Number.isInteger(value) && value >= 0 && value <= MAX_RESOURCE;
      if (saved?.version !== 3 || saved.layoutId !== LAYOUT_ID || !validName(saved.townName)) return defaultState();
      if (!["coins", "timber", "stone"].every((key) => isQuantity(saved.resources?.[key]))) return defaultState();
      if (!Number.isInteger(saved.hallLevel) || saved.hallLevel < 1 || saved.hallLevel > MAX_TEST_LEVEL) return defaultState();
      if (Object.hasOwn(saved, "hallPlaced") && typeof saved.hallPlaced !== "boolean") return defaultState();
      if (saved.hallPlaced === false && saved.hallLevel !== 1) return defaultState();
      if (Object.hasOwn(saved, "buildings")) {
        if (!isRecord(saved.buildings) || Object.keys(saved.buildings).length > 22) return defaultState();
        for (const [plotId, building] of Object.entries(saved.buildings)) {
          if (plotId === HALL_ID || !Object.hasOwn(byId, plotId) || !isRecord(building)) return defaultState();
          if (Object.keys(building).length !== 2 || !Object.hasOwn(building, "typeId") || !Object.hasOwn(building, "level")) return defaultState();
          if (!acceptsType(plotId, building.typeId) || !Number.isInteger(building.level) || building.level < 1 || building.level > MAX_TEST_LEVEL) return defaultState();
        }
      }
      if (saved.construction !== null) {
        const job = saved.construction;
        if (!isRecord(job) || !Object.hasOwn(byId, job.buildingId)) return defaultState();
        const building = buildingIn(saved, job.buildingId);
        const typeId = Object.hasOwn(job, "typeId") ? job.typeId : job.buildingId === HALL_ID ? "town-hall" : null;
        const targetLevel = building ? building.level + 1 : 1;
        if (!acceptsType(job.buildingId, typeId) || building && building.typeId !== typeId || job.toLevel !== targetLevel || job.toLevel > MAX_TEST_LEVEL || !Number.isFinite(job.endsAt) || !Number.isFinite(job.startedAt)) return defaultState();
        const duration = job.endsAt - job.startedAt;
        if (duration === LEGACY_CONSTRUCTION_MS) {
          // Existing valid preview queues finish on their original deadline.
          if (job.buildingId !== HALL_ID || saved.hallPlaced === false || job.toLevel > 20 || Object.hasOwn(job, "paidCost")) return defaultState();
        } else if (duration === CONSTRUCTION_MS) {
          const expected = illustrativeCost(building?.level ?? 0);
          if (!isRecord(job.paidCost) || Object.keys(job.paidCost).length !== 3 || !Object.keys(expected).every((key) => Object.hasOwn(job.paidCost, key) && job.paidCost[key] === expected[key] && saved.resources[key] + job.paidCost[key] <= MAX_RESOURCE)) return defaultState();
        } else return defaultState();
      }
      const retained = { version: 3, layoutId: LAYOUT_ID, townName: saved.townName, resources: { coins: saved.resources.coins, timber: saved.resources.timber, stone: saved.resources.stone }, hallLevel: saved.hallLevel, construction: saved.construction };
      if (Object.hasOwn(saved, "hallPlaced")) retained.hallPlaced = saved.hallPlaced;
      if (Object.hasOwn(saved, "buildings")) retained.buildings = saved.buildings;
      if (Object.hasOwn(saved, "plotLayout") && window.AzmaraTownLayouts.valid(saved.plotLayout)) retained.plotLayout = saved.plotLayout;
      // Remember the validated semantic state, not its whitespace or key order.
      // Read-only startup/review must leave the original storage bytes intact.
      lastSavedState = JSON.stringify(retained);
      return retained;
    } catch {
      return defaultState();
    }
  }

  let state = loadState();
  document.body.dataset.mapView = "town";
  const atlas = window.AzmaraAtlas.create({
    onTown: () => switchMapView("town"),
    onDetail: (detail) => openPanel({ type: "atlas-detail", detail }),
    getTownName: () => state.townName,
    getHallLevel: () => state.hallPlaced === false ? 0 : state.hallLevel,
    onViewChange: (view) => setNav(view),
    announce
  });

  function switchMapView(view) {
    if (view === "region") view = "island"; // Retain the original internal view key.
    if (!["town", "island", "world"].includes(view)) return;
    stopCameraAnimation();
    endMapDrag();
    closeSidebar(false);
    closePanel();
    if (actionsMenu.open) actionsMenu.close();
    if (view === "town") {
      atlas.hide();
      viewport.hidden = false;
      viewport.inert = false;
      fitMap = true; closeMap = false;
      layoutMap();
      viewport.focus({ preventScroll: true });
      announce("Returned to your town. Your saved progress is unchanged.");
    } else {
      viewport.hidden = true;
      viewport.inert = true;
      atlas.show(view);
    }
    syncSidebar();
    setNav(view);
    updateHud();
  }

  function saveState() {
    try {
      const serialized = JSON.stringify(state);
      if (storageAvailable && serialized === lastSavedState) return;
      localStorage.setItem(STORAGE_KEY, serialized);
      lastSavedState = serialized;
      storageAvailable = true;
    } catch {
      storageAvailable = false;
    }
  }

  function announce(message, visible = false) {
    $("#announcer").textContent = message;
    if (!visible) return;
    clearTimeout(toastTimer);
    $("#toast").textContent = message;
    $("#toast").hidden = false;
    toastTimer = setTimeout(() => { $("#toast").hidden = true; }, 4500);
  }

  const hasHall = () => state.hallPlaced !== false;
  const buildingFor = (plotId) => buildingIn(state, plotId);
  function shownBuildingFor(plotId) {
    if (previewMode === "dev" && plotId === HALL_ID && devHallLevelOverride !== null) {
      const hall = buildingFor(plotId);
      return hall ? { ...hall, level: devHallLevelOverride } : null;
    }
    if (previewMode !== "dev" || idealTownLevel === null) return buildingFor(plotId);
    const plot = byId[plotId];
    const existing = buildingFor(plotId);
    const ordinary = window.AzmaraCatalogue.entries.filter((entry) => entry.role === "general" && entry.id !== "town-hall");
    const typeId = existing?.typeId || (plotId === HALL_ID ? "town-hall" : plot.kind === "wall" ? "town-wall" : plot.kind === "harbour" ? "trading-port" : plot.kind === "freighter" ? "dockyard" : ordinary[(Number(plotId.slice(-2)) - 2) % ordinary.length].id);
    return { typeId, level: idealTownLevel };
  }
  const shownPlotName = (plot) => shownBuildingFor(plot.id) ? metadataFor(shownBuildingFor(plot.id).typeId).name : plotName(plot);
  const shownLevelLabel = (id) => shownBuildingFor(id) ? `Level ${shownBuildingFor(id).level}${id === HALL_ID && devHallLevelOverride !== null ? " · temporary Dev preview" : idealTownLevel !== null ? " · temporary ideal preview" : ""}` : levelLabel(id);
  const occupied = (plot) => Boolean(buildingFor(plot.id));
  const occupiedCount = () => plots.filter(occupied).length;
  const plotName = (plot) => buildingFor(plot.id) ? metadataFor(buildingFor(plot.id).typeId).name : plot.id === HALL_ID ? "Town Hall plot" : plot.name;
  const actualHallLevel = () => hasHall() ? state.hallLevel : 0;
  function sceneryHudExclusions(desktop, fit, art, native) {
    const width = viewport.clientWidth, height = viewport.clientHeight;
    if (!width || !height || !Number.isFinite(fit.scale) || fit.scale <= 0) return [];
    const core = desktop ? DESKTOP_CORE : CORE;
    const frame = desktop ? DESKTOP_ART : TOWN_FRAME;
    const worldWidth = Math.max(frame.width, width / fit.scale);
    const worldHeight = Math.max(frame.height, height / fit.scale);
    const center = { x: core.x + core.width / 2, y: core.y + core.height / 2 };
    const origin = {
      x: worldWidth > frame.width ? center.x - fit.centerX / fit.scale : frame.x,
      y: worldHeight > frame.height ? center.y - fit.centerY / fit.scale : frame.y
    };
    origin.x += Math.max(0, Math.min(worldWidth * fit.scale - width, (center.x - origin.x) * fit.scale - fit.centerX)) / fit.scale;
    origin.y += Math.max(0, Math.min(worldHeight * fit.scale - height, (center.y - origin.y) * fit.scale - fit.centerY)) / fit.scale;
    const viewportBox = viewport.getBoundingClientRect();
    const visible = {
      left: Math.max(0, Math.min(native.width, (origin.x - art.x) / art.width * native.width)),
      top: Math.max(0, Math.min(native.height, (origin.y - art.y) / art.height * native.height)),
      right: Math.max(0, Math.min(native.width, (origin.x + width / fit.scale - art.x) / art.width * native.width)),
      bottom: Math.max(0, Math.min(native.height, (origin.y + height / fit.scale - art.y) / art.height * native.height))
    };
    // The painting extends beyond Fit on compact/cover-cropped screens. Keep
    // ornamental focal points exposed in that stable overview, not offscreen.
    const offscreen = [
      { id: "fit-west", x: visible.left / 2, y: native.height / 2, width: visible.left, height: native.height },
      { id: "fit-east", x: (visible.right + native.width) / 2, y: native.height / 2, width: native.width - visible.right, height: native.height },
      { id: "fit-north", x: native.width / 2, y: visible.top / 2, width: native.width, height: visible.top },
      { id: "fit-south", x: native.width / 2, y: (visible.bottom + native.height) / 2, width: native.width, height: native.height - visible.bottom }
    ].filter((reserve) => reserve.width > 0 && reserve.height > 0);
    // Reserve persistent chrome at Fit, not at the current zoom/pan. Decorative
    // courts must not jump around while inspecting a building or opening a menu.
    const selectors = ".desktop-compass";
    return offscreen.concat(all(selectors).flatMap((node, index) => {
      const box = node.getBoundingClientRect();
      if (!box.width || !box.height) return [];
      const left = Math.max(0, box.left - viewportBox.left - 6);
      const top = Math.max(0, box.top - viewportBox.top - 6);
      const right = Math.min(width, box.right - viewportBox.left + 6);
      const bottom = Math.min(height, box.bottom - viewportBox.top + 6);
      if (right <= left || bottom <= top) return [];
      return [{ id: `hud-${index}`, x: (origin.x + (left + right) / 2 / fit.scale - art.x) / art.width * native.width,
        y: (origin.y + (top + bottom) / 2 / fit.scale - art.y) / art.height * native.height,
        width: (right - left) / fit.scale / art.width * native.width,
        height: (bottom - top) / fit.scale / art.height * native.height }];
    }));
  }
  function effectiveHallLevel() {
    return devHallLevelOverride ?? idealTownLevel ??
      (appearanceType === "town-hall" ? appearanceLevel ?? actualHallLevel() : actualHallLevel());
  }
  function appearanceFor(level = effectiveHallLevel()) {
    const land = window.AzmaraLandStages.forHallLevel(level);
    const wall = shownBuildingFor("wall-01");
    return Object.freeze({
      ...land,
      minLevel: land.minLevel,
      terrainAsset: land.src,
      wallLevel: wall?.level || 0
    });
  }
  function buildingVisual(typeId, level, preview = true) {
    const visualLevel = preview && idealTownLevel !== null ? idealTownLevel : preview && appearanceType === typeId && appearanceLevel !== null ? appearanceLevel : level;
    if (typeId === "town-hall") {
      const visual = window.AzmaraBuildingArt.forBuilding(typeId, visualLevel);
      return { stage: visual.stage, minLevel: visual.minLevel, src: visual.src };
    }
    return window.AzmaraBuildingArt.forBuilding(typeId, visualLevel);
  }
  function buildingArtMarkup(typeId, level, className, preview = true) {
    const visualLevel = preview && idealTownLevel !== null ? idealTownLevel : preview && appearanceType === typeId && appearanceLevel !== null ? appearanceLevel : level;
    if (typeId === "town-wall" && window.AzmaraTownWall?.renderPreview) return window.AzmaraTownWall.renderPreview(visualLevel, className);
    return window.AzmaraBuildingArt.render(typeId, visualLevel, className);
  }
  function reviewLevel() {
    if (appearanceLevel !== null) return appearanceLevel;
    if (appearanceType === "town-hall") return actualHallLevel() || 1;
    return plots.map((plot) => buildingFor(plot.id)).find((building) => building?.typeId === appearanceType)?.level || 1;
  }
  function syncAppearance() {
    const visual = appearanceFor();
    const townPreview = devHallLevelOverride !== null || idealTownLevel !== null || appearanceLevel !== null && appearanceType === "town-hall";
    document.body.dataset.landStages = "on";
    document.body.dataset.townStage = String(visual.stage);
    document.body.dataset.townStageSource = devHallLevelOverride !== null ? "dev" : townPreview ? "preview" : "actual";
    document.body.dataset.townLevel = String(actualHallLevel());
    document.body.dataset.appearanceType = appearanceType;
    all(".plot-marker").forEach((marker) => {
      const building = shownBuildingFor(marker.dataset.plot);
      const painted = marker.dataset.plot === HALL_ID || marker.dataset.kind === "wall";
      marker.dataset.buildingLevel = String(building?.level || 0);
      marker.dataset.buildingType = building?.typeId || "";
      marker.dataset.buildingStageSource = idealTownLevel !== null ? "ideal" : building && appearanceType === building.typeId && appearanceLevel !== null ? "preview" : "actual";
      marker.dataset.buildingStage = building ? String(buildingVisual(building.typeId, building.level).stage) : "0";
      if (!building || painted) {
        marker.querySelector(".marker").replaceChildren();
        marker.dataset.renderedArt = painted ? `painted:${marker.dataset.kind}` : "painted-empty-site";
        return;
      }
      const key = `${building.typeId}:${buildingVisual(building.typeId, building.level).minLevel}`;
      if (marker.dataset.renderedArt !== key) {
        const className = `${marker.dataset.plot === HALL_ID ? "town-hall-art" : "building-art"} ${marker.dataset.kind}-reserve-art`;
        marker.querySelector(".marker").innerHTML = buildingArtMarkup(building.typeId, building.level, className);
        marker.dataset.renderedArt = key;
      }
    });
    const land = $("#azmara-land-stage");
    if (land && land.getAttribute("href") !== visual.src) land.setAttribute("href", visual.src);
    landscape.setAttribute("aria-label", `Locked illustrated town land stage ${visual.stage}, from completed Town Hall level ${visual.minLevel}${townPreview ? ", temporary Dev review" : ""}.`);
    if ($("#appearance-review-status")) $("#appearance-review-status").textContent = idealTownLevel !== null ? `Ideal town at level ${idealTownLevel}: 23 temporary compatible samples. Your saved town and construction are unchanged.` : appearanceLevel === null ? "Showing actual saved appearance where built; this illustration does not place a building." : `Temporary ${metadataFor(appearanceType).name} level ${appearanceLevel} artwork review. Actual levels, occupied plots and resources are unchanged; nothing is saved.`;
    if ($("#appearance-milestones")) $("#appearance-milestones").textContent = `Stable visual milestones for ${metadataFor(appearanceType).name}: ${window.AzmaraBuildingArt.milestonesFor(appearanceType).join(" · ")}. Levels in between retain the last completed design.`;
    const preview = $("#appearance-art-container");
    if (preview) {
      const key = `${appearanceType}:${buildingVisual(appearanceType, reviewLevel(), false).minLevel}`;
      if (preview.dataset.renderedArt !== key) {
        preview.innerHTML = buildingArtMarkup(appearanceType, reviewLevel(), "appearance-art", false);
        preview.firstElementChild.id = "appearance-hall-preview";
        preview.dataset.renderedArt = key;
      }
      const art = preview.firstElementChild;
      const label = `${metadataFor(appearanceType).name} artwork at level ${reviewLevel()}`;
      art.removeAttribute("aria-hidden");
      if (art.tagName === "IMG") art.setAttribute("alt", label);
      else { art.setAttribute("role", "img"); art.setAttribute("aria-label", label); }
    }
    renderAppearanceComparison();
  }
  function restoreAppearance() {
    const ideal = idealTownLevel !== null;
    const changed = ideal || appearanceLevel !== null || appearanceType !== "town-hall";
    idealTownLevel = null;
    appearanceLevel = null;
    appearanceType = "town-hall";
    appearanceCamera = null;
    appearanceComparisonSolo = false;
    appearanceSelectedPlot = null;
    appearanceBuildSites = false;
    panel.classList.remove("appearance-tool", "appearance-solo");
    if (ideal) { renderMarkers(); layoutMap(); }
    if (changed) syncAppearance();
  }
  function levelLabel(id) { return buildingFor(id) ? `Level ${buildingFor(id).level}` : "Empty · reserved plot"; }
  function costForHall() { return illustrativeCost(hasHall() ? state.hallLevel : 0); }
  function canAfford(cost) { return Object.keys(cost).every((key) => state.resources[key] >= cost[key]); }

  function renderMarkers() {
    const returnPlot = returnFocus?.classList?.contains("plot-marker") ? returnFocus.dataset.plot : null;
    $("#map-hotspots").innerHTML = plots.map((plot) => {
      const building = shownBuildingFor(plot.id);
      const isOccupied = Boolean(building);
      const markerClass = !building ? "empty-hotspot" : plot.id === HALL_ID ? "occupied-hotspot" : "built-hotspot";
      const artClass = !building ? "empty-plot-art" : plot.id === HALL_ID ? "town-hall-art" : "building-art";
      const painted = plot.id === HALL_ID || plot.kind === "wall";
      const art = building && !painted ? buildingArtMarkup(building.typeId, building.level, `${artClass} ${plot.kind}-reserve-art`) : "";
      const renderedArt = painted ? `painted:${plot.kind}` : building ? `${building.typeId}:${buildingVisual(building.typeId, building.level).minLevel}` : "painted-empty-site";
      return `<button class="building-hotspot plot-marker ${markerClass}" data-plot="${plot.id}" data-building="${plot.id}" data-kind="${plot.kind}" data-occupied="${isOccupied}" data-building-type="${building?.typeId || ""}" data-building-level="${building?.level || 0}" data-building-stage="${building ? buildingVisual(building.typeId, building.level).stage : 0}" data-rendered-art="${renderedArt}" data-x="${plot.x}" data-y="${plot.y}" data-label-edge="${plot.x < 200 ? "left" : plot.x > 1200 ? "right" : "center"}" style="--x:${plot.x / CORE.width * 100}%;--y:${plot.y / CORE.height * 100}%" aria-label="Open ${escapeHtml(shownPlotName(plot))}, ${shownLevelLabel(plot.id)}"><span class="marker">${art}</span><span class="hotspot-label"><span class="hotspot-title">${escapeHtml(shownPlotName(plot))}</span><span class="compact-title" aria-hidden="true">${building ? escapeHtml(plot.id === HALL_ID ? "Hall" : shownPlotName(plot)) : plot.short}</span><small>${building?.level || "Empty"}</small></span></button>`;
    }).join("");
    if (returnPlot) returnFocus = $(`.plot-marker[data-plot="${returnPlot}"]`);
  }

  function updateHud() {
    $("#town-name").textContent = state.townName;
    if ($("#desktop-town-name")) $("#desktop-town-name").textContent = state.townName;
    document.title = `AZMARA — ${state.townName}`;
    ["coins", "timber", "stone"].forEach((key) => {
      $(`#resource-${key}`).textContent = number(state.resources[key]);
      if ($(`#desktop-resource-${key}`)) $(`#desktop-resource-${key}`).textContent = number(state.resources[key]);
    });
    all(".plot-marker").forEach((hotspot) => {
      const plot = byId[hotspot.dataset.plot];
      hotspot.setAttribute("aria-label", `Open ${shownPlotName(plot)}, ${shownLevelLabel(plot.id)}`);
      hotspot.querySelector("small").textContent = shownBuildingFor(plot.id)?.level || "Empty";
      hotspot.classList.toggle("constructing", state.construction?.buildingId === plot.id);
      hotspot.classList.toggle("selected", openView?.buildingId === plot.id);
    });
    syncAppearance();
    atlas.syncTownAppearance();
    updateCountdown();
  }

  function setNav(view) {
    all('[data-map-navigation], [data-desktop-action="town"]').forEach((button) => {
      const active = (button.dataset.mapNavigation || "town") === atlas.currentView();
      button.classList.toggle("active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    all(".dock-button").forEach((button) => {
      const active = view === "town" ? button.id === "show-town" : button.dataset.panel === view;
      button.classList.toggle("active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    all(".adviser").forEach((button) => { button.classList.toggle("active", button.dataset.panel === view || (view === "town" && button.dataset.panel === "overview")); });
  }

  function openPanel(view, trigger = document.activeElement) {
    const type = typeof view === "string" ? view : view.type;
    if (previewMode !== "dev" && ["catalogue", "appearance", "dev-tools", "reset"].includes(type)) return;
    if (type === "appearance" && atlas.currentView() !== "town") switchMapView("town");
    const drawerTrigger = sidebarOpen && sidebar?.contains(trigger);
    closeSidebar(false);
    if (type !== "appearance") restoreAppearance();
    else {
      restoreAppearance();
      appearanceType = metadataFor(view?.reviewType) ? view.reviewType : "town-hall";
    }
    buildChoice = null;
    clearConfirmation = null;
    cancelConfirmation = false;
    stopCameraAnimation();
    endMapDrag();
    if (type === "appearance") captureAppearanceCamera();
    if (!panel.open) returnFocus = drawerTrigger ? sidebarToggle : actionsMenu.contains(trigger) ? actionsTrigger() : trigger;
    if (actionsMenu.open) actionsMenu.close();
    openView = typeof view === "string" ? { type: view } : view;
    renderPanel();
    if (!panel.open) panel.showModal();
    panel.scrollTop = 0;
    setNav(openView.type === "building" ? "buildings" : openView.type);
    updateHud();
    if (openView.type === "rename") $("#town-name-input").focus();
    else $("#close-panel").focus();
  }
  function captureAppearanceCamera() {
    const matrix = landscape.getScreenCTM(), box = viewport.getBoundingClientRect();
    if (!matrix || !matrix.a || !matrix.d || !box.width || !box.height) return;
    const origin = new DOMPoint(box.left,box.top).matrixTransform(matrix.inverse());
    appearanceCamera = { camera: { x: origin.x,y:origin.y,width:viewport.clientWidth/matrix.a,height:viewport.clientHeight/matrix.d },
      cssWidth: viewport.clientWidth,cssHeight: viewport.clientHeight,desktop:desktopQuery.matches,layout:townLayout(),
      plots: plots.map(plot => { const p = plotPosition(plot), f = footprintFor(plot), marker = $(`.plot-marker[data-plot="${plot.id}"]`), painted = marker?.getBoundingClientRect(), basis = plot.kind === "wall" ? 1 : DEFAULT_BUILDING_SCALE;
        return { id:plot.id,kind:plot.kind,name:plot.name,x:p.x,y:p.y,width:painted?.width/matrix.a/basis || Math.max(f.width/basis,44/matrix.a),
          height:painted?.height/matrix.d/basis || Math.max(f.height/basis,44/matrix.d) }; }) };
  }
  function appearanceComparisonInput(scale) {
    if (!appearanceCamera) captureAppearanceCamera();
    if (!appearanceCamera) return null;
    const worldPlots = appearanceCamera.plots.map(plot => {
      const building = shownBuildingFor(plot.id), visibleLevel = building && appearanceType === building.typeId && appearanceLevel !== null && idealTownLevel === null ? appearanceLevel : building?.level;
      return { ...plot,level:visibleLevel || 1,buildingId:building?.typeId || null,name:building ? metadataFor(building.typeId).name : plot.name,
        sourceArt:building ? window.AzmaraBuildingArt.forBuilding(building.typeId,visibleLevel) : null };
    });
    return { ...appearanceCamera,scale,plots:worldPlots,landFrame: { ...landFrame(appearanceCamera.desktop) },hallLevel:idealTownLevel ?? (appearanceType === "town-hall" ? appearanceLevel ?? actualHallLevel() : actualHallLevel()),
      decorExclusions: wallPresentationEnvelope(appearanceCamera.desktop,worldPlots).decorExclusions.concat(window.AzmaraTownWall.terrainLayout({desktop:appearanceCamera.desktop}).decorExclusions) };
  }
  function comparisonToolMarkup() {
    return `<section class="appearance-comparison" id="appearance-comparison" data-dev-only><div class="comparison-toolbar"><strong>Building size · test only</strong><label class="comparison-size-slider" for="comparison-size-slider"><span>Custom size</span><input id="comparison-size-slider" type="range" min="1" max="100" step="1" value="${Math.round(appearanceComparisonScale*100)}"><output id="comparison-size-value" for="comparison-size-slider">${Math.round(appearanceComparisonScale*100)}%</output></label><nav aria-label="Choose a full-size comparison frame">${[100,80,65].map(percent=>`<button data-comparison-solo="${percent}" id="comparison-solo-${percent}">${percent}%</button>`).join("")}<button data-comparison-solo="0" id="comparison-show-all">Compare all</button><button id="comparison-toggle-sites" aria-pressed="false">Sites</button><button id="comparison-return-town">Return to town</button></nav></div><p class="panel-note comparison-explanation">The town now uses 55% artwork by default. This unsaved slider still tests every whole size from 1% to 100%; the 100% / 80% / 65% presets remain available for comparison. Saves, queues and plot positions stay untouched. Plot controls retain a 44px minimum target even when the artwork is smaller.</p><label class="comparison-build-choice"><input type="checkbox" id="comparison-build-chooser"> Show empty build-site outlines</label><output id="comparison-selection" aria-live="polite">Choose a pin in an inspected frame.</output><div class="comparison-grid">${[100,80,65].map(percent=>`<article class="comparison-card" data-comparison-percent="${percent}"><h3>${percent}% size</h3><div class="comparison-stage"><div class="comparison-paint"></div><div class="comparison-targets"></div></div></article>`).join("")}<article class="comparison-card comparison-card-custom" data-comparison-custom="true" data-comparison-percent="${Math.round(appearanceComparisonScale*100)}"><h3>Current default · ${Math.round(appearanceComparisonScale*100)}%</h3><div class="comparison-stage"><div class="comparison-paint"></div><div class="comparison-targets"></div></div></article></div><details class="comparison-identities"><summary>Check all 30 building identities</summary><div id="comparison-contact-sheet"></div></details></section>`;
  }
  function renderAppearanceComparison() {
    if (previewMode !== "dev" || openView?.type !== "appearance" || !panel.open || !appearanceCamera || !$("#appearance-comparison")) return;
    panel.classList.add("appearance-tool");
    panel.classList.toggle("appearance-solo",appearanceComparisonSolo);
    const stage = $("#appearance-comparison"), input = appearanceComparisonInput(1);
    if (!input) return;
    stage.style.setProperty("--study-aspect",String(input.cssWidth/input.cssHeight));
    const key = JSON.stringify([input.camera,input.plots,input.hallLevel,input.layout]);
    const customPercent = Math.round(appearanceComparisonScale*100);
    const customCard = stage.querySelector("[data-comparison-custom]");
    if (customCard) {
      customCard.dataset.comparisonPercent = String(customPercent);
      customCard.querySelector("h3").textContent = `Custom ${customPercent}% size`;
    }
    for (const card of stage.querySelectorAll(".comparison-card")) {
      const scale = Number(card.dataset.comparisonPercent)/100;
      const renderKey = `${key}:${scale}`;
      if (card.dataset.sceneKey !== renderKey) {
        card.dataset.sceneKey = renderKey;
        const data = window.AzmaraAppearanceStudy.scene({ ...input,scale });
        card.querySelector(".comparison-paint").innerHTML = window.AzmaraAppearanceStudy.markup(data);
        card.dataset.sceneryLevel = String(data.scenerySourceLevel);
        card.querySelector(".comparison-targets").innerHTML = data.plots.map(p=>`<button class="comparison-hit" data-comparison-plot="${p.id}" data-empty="${!p.buildingId}" aria-label="Select ${escapeHtml(p.name)} in ${Math.round(scale*100)} percent test"><svg class="comparison-outline" viewBox="0 0 320 270" aria-hidden="true"><path d="${p.kind==='wall'?'M30 125L250 80L294 144L70 195Z':'M28 150L151 82L293 148L155 219Z'}"/></svg></button>`).join("");
      }
    }
    if (stage.dataset.sceneKey !== key) {
      stage.dataset.sceneKey = key;
      const level = idealTownLevel ?? reviewLevel();
      $("#comparison-contact-sheet").innerHTML = window.AzmaraAppearanceStudy.contactSheet(level,appearanceComparisonScale).map(entry=>`<figure data-study-identity="${entry.id}"><div class="study-type-frame" style="--study-size:${appearanceComparisonScale}">${entry.markup}</div><figcaption>${escapeHtml(entry.name)}</figcaption></figure>`).join("");
    }
    const presetScale = window.AzmaraAppearanceStudy.scales.includes(appearanceComparisonScale);
    for (const card of stage.querySelectorAll(".comparison-card")) {
      const custom = card.dataset.comparisonCustom === "true";
      const active = Number(card.dataset.comparisonPercent)/100 === appearanceComparisonScale && (custom ? !presetScale : true);
      card.dataset.active = String(active);
      card.hidden = custom && !appearanceComparisonSolo && desktopQuery.matches;
      card.querySelector(".comparison-targets").inert = !appearanceComparisonSolo || !active;
      card.querySelector(".comparison-targets").setAttribute("aria-hidden",String(!appearanceComparisonSolo || !active));
    }
    $("#comparison-show-all").textContent = desktopQuery.matches ? "Compare all" : "Controls";
    stage.dataset.chooseBuild = String(appearanceBuildSites);
    $("#comparison-toggle-sites")?.setAttribute("aria-pressed",String(appearanceBuildSites));
    stage.querySelectorAll(".study-type-frame").forEach(node=>node.style.setProperty("--study-size",String(appearanceComparisonScale)));
    const sizeSlider = $("#comparison-size-slider"), sizeValue = $("#comparison-size-value");
    if (sizeSlider && document.activeElement !== sizeSlider) sizeSlider.value = String(customPercent);
    if (sizeValue) sizeValue.textContent = `${customPercent}%`;
    stage.querySelectorAll(".comparison-hit").forEach(button=>{ button.classList.toggle("selected",button.dataset.comparisonPlot===appearanceSelectedPlot); button.setAttribute("aria-pressed",String(button.dataset.comparisonPlot===appearanceSelectedPlot)); });
    stage.querySelectorAll("[data-comparison-solo]").forEach(button=>button.setAttribute("aria-pressed",String(Number(button.dataset.comparisonSolo)/100===appearanceComparisonScale && (appearanceComparisonSolo || !desktopQuery.matches))));
    requestAnimationFrame(positionComparisonTargets);
  }
  function positionComparisonTargets() {
    if (previewMode !== "dev" || openView?.type !== "appearance" || !panel.open || !appearanceCamera) return;
    for (const card of content.querySelectorAll(".comparison-card")) {
      const svg = card.querySelector(".comparison-world"), matrix = svg?.getScreenCTM(), stage = card.querySelector(".comparison-stage");
      if (!matrix || !matrix.a || !matrix.d || !stage.getBoundingClientRect().width || !appearanceCamera) continue;
      const box = stage.getBoundingClientRect();
      for (const button of card.querySelectorAll(".comparison-hit")) {
        const plot = appearanceCamera.plots.find(p=>p.id===button.dataset.comparisonPlot), point = new DOMPoint(plot.x,plot.y).matrixTransform(matrix);
        button.style.left = `${point.x-box.left}px`; button.style.top = `${point.y-box.top}px`;
        button.style.width = `${Math.max(44,plot.width*matrix.a)}px`; button.style.height = `${Math.max(44,plot.height*matrix.d)}px`;
      }
    }
  }
  window.AzmaraAppearanceReview = Object.freeze({ frameInput: scale => previewMode === "dev" && openView?.type === "appearance" ? appearanceComparisonInput(scale) : null });

  function closePanel() { if (panel.open) panel.close(); }
  function syncModeControls() {
    document.body.dataset.previewMode = previewMode;
    all("[data-preview-mode]").filter((node) => node.tagName === "BUTTON").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.previewMode === previewMode));
    });
    $("#resources-title").textContent = "Resources";
  }

  function setPreviewMode(mode, trigger) {
    if (!["dev", "gameplay"].includes(mode) || mode === previewMode) return;
    stopCameraAnimation();
    endMapDrag();
    const drawerTrigger = sidebarOpen && sidebar?.contains(trigger);
    closeSidebar(false);
    previewMode = mode;
    if (mode === "gameplay") {
      devHallLevelOverride = null;
      restoreAppearance();
      renderMarkers();
      layoutMap();
    }
    cancelConfirmation = false;
    clearConfirmation = null;
    buildChoice = null;
    syncModeControls();
    const focusTarget = drawerTrigger ? sidebarToggle : actionsMenu.contains(trigger) ? actionsTrigger() : trigger;
    if (panel.open) { returnFocus = focusTarget; panel.close(); }
    if (actionsMenu.open) actionsMenu.close();
    updateCountdown();
    focusTarget?.focus({ preventScroll: true });
    announce(mode === "dev" ? "Dev mode. Preview tools and demonstration tests are available." : "Gameplay view. Your town progress is unchanged.", true);
  }
  function panelHeading(title, emblem, subtitle = "") { return `<div class="panel-heading"><span class="panel-emblem">${icon(emblem)}</span><div><h2 id="panel-title">${escapeHtml(title)}</h2>${subtitle ? `<span class="building-type">${escapeHtml(subtitle)}</span>` : ""}</div></div>`; }
  function townLayoutControls() {
    const selected = window.AzmaraTownLayouts.get(townLayout());
    return `<section class="town-layout-controls" aria-labelledby="town-layout-title"><h3 id="town-layout-title">Town layout</h3><p>Arrange the 18 ordinary sites. Town Hall, the wall reserve and all three transport yards stay fixed. Roads and landscaping follow your choice.</p><label class="rename-label" for="town-layout">Your default design</label><select id="town-layout">${window.AzmaraTownLayouts.layouts.map((layout) => `<option value="${layout.id}" ${layout.id === selected.id ? "selected" : ""}>${escapeHtml(layout.label)}</option>`).join("")}</select><p id="town-layout-description">${escapeHtml(selected.description)}</p><button class="secondary-button" id="apply-town-layout">Apply layout</button><p class="panel-note">Saved in this browser. Buildings, levels, resources and construction timing do not change.</p></section>`;
  }

  function jobType(job = state.construction) { return job && Object.hasOwn(job, "typeId") ? job.typeId : "town-hall"; }
  function jobControlData(job) { return `data-job-plot="${job.buildingId}" data-job-type="${jobType(job)}" data-job-start="${job.startedAt}" data-job-level="${job.toLevel}"`; }
  function matchesJobControl(button) {
    const job = state.construction;
    return job && jobControlOwners.get(button) === job && openView?.type === "building" && openView.buildingId === job.buildingId && ["jobPlot", "jobType", "jobStart", "jobLevel"].every((key) => Object.hasOwn(button.dataset, key)) && button.dataset.jobPlot === job.buildingId && button.dataset.jobType === jobType(job) && Number(button.dataset.jobStart) === job.startedAt && Number(button.dataset.jobLevel) === job.toLevel;
  }
  function constructionCard(job) {
    return `<div class="construction-card"><span class="construction-title">${escapeHtml(metadataFor(jobType(job)).name)} ${buildingFor(job.buildingId) ? "update" : "build"} underway · Level ${job.toLevel}</span><span class="construction-time" id="construction-time"></span><progress class="construction-progress" id="construction-progress" value="0" max="100" aria-label="Construction test progress"></progress><button class="primary-button" id="skip-construction" ${jobControlData(job)} data-dev-only>Skip · Complete now in Dev</button><p class="free-cancel-countdown" id="free-cancel-time"></p><p class="cancel-refund" id="cancel-refund"></p><button class="secondary-button" id="request-cancel-construction" ${jobControlData(job)} data-dev-only>Cancel construction</button><div class="reset-confirm" id="construction-cancel-confirm" ${cancelConfirmation ? "" : "hidden"}><p id="paid-cancel-warning"></p><button class="danger-button" id="confirm-cancel-construction" ${jobControlData(job)} data-dev-only>Cancel and return 30%</button><button class="secondary-button" id="keep-construction" ${jobControlData(job)} data-dev-only>Keep building</button></div></div>`;
  }
  function costMarkup(cost) {
    return `<h3 class="panel-subheading">Illustrative test cost</h3><div class="costs">${Object.entries(cost).map(([key, value]) => `<span class="cost-item ${state.resources[key] < value ? "short" : ""}" aria-label="${number(value)} ${resourceLabels[key]}">${icon(key)}<span><span class="cost-label">${resourceLabels[key]}</span><strong>${number(value)}</strong></span></span>`).join("")}</div>`;
  }

  function renderBuilding(id) {
    const plot = byId[id];
    if (!plot || !Object.hasOwn(byId, id)) return;
    const building = buildingFor(id);
    if (previewMode === "gameplay") {
      content.innerHTML = building
        ? `${panelHeading(metadataFor(building.typeId).name, plot.icon, `${plotRoleLabels[plot.kind]} plot · ${levelLabel(id)}`)}<p class="panel-description">This building belongs to your town.</p><dl class="overview-facts"><div><dt>Current level</dt><dd>${building.level}</dd></div></dl><p class="panel-note">Building updates are not available yet. Economic, civic, trade and military systems are still being developed.</p><button class="secondary-button" data-panel="buildings">${icon("buildings")} Town plots</button>`
        : `${panelHeading(plotName(plot), plot.icon, "Empty plot")}<div class="empty-plot-card">${icon(plot.icon)}<span>Open ground</span></div><h3 class="panel-subheading">${id === HALL_ID ? "Town Hall site" : plotUses[plot.kind].title}</h3><p class="panel-description">This site is reserved for ${id === HALL_ID ? "your Town Hall" : plot.kind === "general" ? "an ordinary town building" : plot.kind === "wall" ? "your town wall" : plot.kind === "harbour" ? "a Caravan Station" : "a Freight Depot"}. Building choices are not available yet.</p><button class="secondary-button" data-panel="buildings">${icon("plot")} Town plots</button>`;
      return;
    }
    const eligible = window.AzmaraCatalogue.entries.filter((entry) => acceptsType(id, entry.id));
    const queuedHere = state.construction?.buildingId === id;
    const chosenId = building?.typeId || (queuedHere ? jobType() : buildChoice?.plotId === id && acceptsType(id, buildChoice.typeId) ? buildChoice.typeId : eligible[0].id);
    const entry = metadataFor(chosenId);
    const level = building?.level || 0;
    const cost = illustrativeCost(level);
    const maxLevel = level >= MAX_TEST_LEVEL;
    let action;
    if (queuedHere) {
      action = constructionCard(state.construction);
    } else if (state.construction) {
      action = `<p class="design-note">One local construction test can run at a time. Finish or cancel the current ${escapeHtml(metadataFor(jobType()).name)} project first.</p><button class="secondary-button" data-building="${state.construction.buildingId}">Open current construction</button>`;
    } else {
      const choices = !building && id !== HALL_ID ? `<label class="rename-label" for="building-type">Compatible building</label><select id="building-type">${eligible.map((candidate) => `<option value="${candidate.id}" ${candidate.id === chosenId ? "selected" : ""}>${escapeHtml(candidate.name)}</option>`).join("")}</select>` : "";
      action = `${choices}${building ? `<div class="level-block"><div><span>Current level</span><strong>${level}</strong></div><span class="level-arrow" aria-hidden="true">→</span><div class="next-level"><span>Next level</span><strong>${maxLevel ? "—" : level + 1}</strong></div></div>` : `<div class="empty-plot-card">${icon("plot")}<span>Open ground · Build level 1</span></div>`}${costMarkup(cost)}<button class="primary-button" id="${building ? "upgrade-building" : id === HALL_ID ? "build-hall" : "build-selected"}" data-target-plot="${id}" data-type-id="${chosenId}" data-dev-only ${!canAfford(cost) || maxLevel ? "disabled" : ""}>${maxLevel ? "Level 50 test limit reached" : !canAfford(cost) ? "Refill test supplies to continue" : building ? "Update" : `Build ${escapeHtml(entry.name)}`}</button>`;
    }
    const directLevel = building ? `<section class="dev-level-tools" data-dev-only><label class="rename-label" for="test-building-level">Exact Dev test level</label><select id="test-building-level" ${state.construction ? "disabled" : ""}>${Array.from({ length: MAX_TEST_LEVEL }, (_, index) => index + 1).map((value) => `<option value="${value}" ${value === level ? "selected" : ""}>Level ${value}</option>`).join("")}</select><button class="secondary-button" id="set-test-level" data-target-plot="${id}" ${state.construction ? "disabled" : ""}>Apply test level · Dev bypass</button><p class="panel-note">No cost or timer. Disabled while any project is pending.</p>${id !== HALL_ID ? `<button class="secondary-button dev-reset-control" id="request-clear-plot" data-target-plot="${id}" ${state.construction ? "disabled" : ""}>Clear this test plot</button><div class="reset-confirm" id="clear-plot-confirm" ${clearConfirmation === id ? "" : "hidden"}><p>Remove this ${escapeHtml(entry.name)} sample with no resource refund? Other plots stay unchanged.</p><button class="danger-button" id="confirm-clear-plot" data-target-plot="${id}">Clear this plot · No refund</button><button class="secondary-button" id="keep-plot">Keep this building</button></div>` : ""}</section>` : "";
    const purpose = chosenId === "town-wall" ? "A dimensional gate wall across the rear valley pass between sandstone cliffs. It develops from timber to adobe and sandstone with its own completed level. Defensive effects remain future work." : entry.purpose;
    content.innerHTML = `${panelHeading(building ? entry.name : plotName(plot), plot.icon, `${plotRoleLabels[plot.kind]} plot · ${levelLabel(id)}`)}<p class="panel-description">${escapeHtml(purpose)}</p>${buildingArtMarkup(chosenId, level || 1, "building-panel-preview", false)}${action}${directLevel}<button class="secondary-button" id="refill-test-supplies" data-dev-only>Refill test supplies</button><p class="panel-note">Dev draft: levels 1–50, one 2-minute illustrative project at a time. Cancel before 60 seconds for 100% of paid resources; afterwards confirm a 30% refund, rounded down per resource. Skip settles once without refund or recharge. Costs are common test prices, not final balance. Older ten-second Hall queues retain their deadline. No production, civic, trade or combat effects are simulated.<br>${storageAvailable ? "Progress is saved only in this browser." : "Browser storage is unavailable; progress lasts for this visit."}</p><div class="panel-divider"></div><button class="secondary-button" data-panel="appearance" data-review-type="${chosenId}" data-dev-only>Review appearance stages</button><button class="secondary-button" data-panel="buildings">${icon("buildings")} All 23 plots</button>`;
    const panelArt = content.querySelector(".building-panel-preview");
    panelArt.removeAttribute("aria-hidden");
    if (panelArt.tagName === "IMG") panelArt.setAttribute("alt", `${entry.name} first-draft artwork`);
    else { panelArt.setAttribute("role", "img"); panelArt.setAttribute("aria-label", `${entry.name} first-draft artwork`); }
    content.querySelectorAll("#upgrade-building, #build-hall, #build-selected, #set-test-level, #request-clear-plot, #confirm-clear-plot").forEach((button) => {
      button.dataset.targetPlot = id;
      button.dataset.typeId = chosenId;
      button.dataset.currentLevel = String(level);
    });
    if (queuedHere) content.querySelectorAll("#skip-construction, #request-cancel-construction, #confirm-cancel-construction, #keep-construction").forEach((button) => jobControlOwners.set(button, state.construction));
  }

  function renderPanel() {
    if (!openView) return;
    $("#panel-kicker").textContent = openView.type === "building" ? "Your town · Plot" : previewMode === "dev" ? "Town design preview" : "Your town";
    if (openView.type === "building") {
      renderBuilding(openView.buildingId);
    } else if (openView.type === "dev-tools") {
      const actual = actualHallLevel();
      const selected = devHallLevelOverride ?? actual;
      const blocked = Boolean(state.construction) || !hasHall();
      content.innerHTML = `${panelHeading("Dev workbench", "town", "Temporary local tests")}<p class="panel-description">Preview each locked land stage through the Town Hall's real visual milestone rule.</p><section class="land-stage-picker" data-dev-only><h3>Land stage</h3><p>Current test Town Hall level: <strong>${selected}</strong>${devHallLevelOverride === null ? " · actual" : " · temporary"}</p><div class="land-stage-buttons" role="group" aria-label="Temporary Town Hall test level">${window.AzmaraLandStages.milestones.map((level) => `<button class="secondary-button" data-land-stage-level="${level}" aria-pressed="${selected === level}" ${blocked ? "disabled" : ""}>${level}</button>`).join("")}</div><button class="secondary-button" id="reset-land-stage" ${devHallLevelOverride === null ? "disabled" : ""}>Reset to actual level ${actual}</button><p class="panel-note">Unsaved and Dev-only. It changes the land through the same completed Town Hall look rule as normal progress. ${blocked ? !hasHall() ? "Build the Town Hall before testing its land stages." : "Finish or cancel the active construction first." : "Gameplay mode and reload restore the actual level."}</p></section><div class="panel-divider"></div><button class="secondary-button" data-panel="appearance">Appearance review</button><button class="secondary-button" data-panel="catalogue">Building catalogue</button><button class="secondary-button" id="refill-test-supplies">Refill test supplies</button><button class="secondary-button dev-reset-control" id="request-reset">Reset plots</button>`;
    } else if (openView.type === "catalogue") {
      content.innerHTML = window.AzmaraCatalogue.render(catalogueLevel);
      content.querySelector(".catalogue-notice p").textContent = "Gallery level changes only these illustrations. Use a compatible empty plot in Dev to build a local sample. Economic, civic, trade and military effects are not simulated.";
      content.querySelector(".catalogue-final-note").textContent = `Illustrations are design proposals, not completed structures, historical claims or final rules. Your actual town has ${occupiedCount()} occupied and ${23 - occupiedCount()} empty plots.`;
    } else if (openView.type === "reset") {
      content.innerHTML = `${panelHeading("Reset all plots", "plot", "Dev tool · This browser only")}<div class="reset-confirm" id="reset-confirm" data-dev-only><p>Clear all 23 plots, including the Town Hall, and stop any construction? Your town name stays the same. Demo resources return to their starting amounts. This cannot be undone; the separate historical preview is not changed.</p><button class="danger-button" id="confirm-reset">Clear all 23 plots</button><button class="secondary-button" id="cancel-reset">Keep my progress</button></div>`;
    } else if (openView.type === "appearance") {
      const visual = buildingVisual(appearanceType, reviewLevel(), false);
      content.innerHTML = `<div class="appearance-controls">${panelHeading("Appearance review", "town", "Dev tool · Temporary artwork only")}<p class="panel-description">Review all 30 original first-draft building types at every level 1–50, with eleven stable uneven visual milestones. Early timber construction gains richer materials and role-specific details. Town Hall review changes the scenery; Ideal town fills every plot temporarily.</p><label class="rename-label" for="appearance-type">Building type</label><select id="appearance-type">${window.AzmaraCatalogue.entries.map((entry) => `<option value="${entry.id}" ${appearanceType === entry.id ? "selected" : ""}>${escapeHtml(entry.name)}</option>`).join("")}</select><label class="rename-label" for="appearance-level">Artwork stage</label><select id="appearance-level">${ART_MILESTONES.map((level) => `<option value="${level}" ${visual.minLevel === level ? "selected" : ""}>Level ${level} appearance</option>`).join("")}</select><p class="appearance-preview-note" id="appearance-review-status"></p><div id="appearance-art-container">${buildingArtMarkup(appearanceType, reviewLevel(), "appearance-art", false)}</div><p class="panel-note">Existing buildings of the selected type show the temporary stage; empty plots stay empty. Actual levels, resources and construction do not change. Close or switch to Gameplay to restore all actual artwork.</p><button class="secondary-button" id="finish-appearance-review">Return to actual town</button></div>${comparisonToolMarkup()}`;
      syncAppearance();
      const levelSelector = $("#appearance-level");
      const typeSelector = $("#appearance-type");
      if (metadataFor(appearanceType)?.retired) typeSelector.insertAdjacentHTML("afterbegin", `<option value="${appearanceType}" selected>${escapeHtml(metadataFor(appearanceType).name)} · saved compatibility sample</option>`);
      levelSelector.innerHTML = Array.from({ length: 50 }, (_, i) => i + 1).map((level) => `<option value="${level}" ${reviewLevel() === level ? "selected" : ""}>Level ${level}</option>`).join("");
      levelSelector.insertAdjacentHTML("afterend", '<p class="panel-note" id="appearance-milestones"></p>');
      const ideal = document.createElement("section");
      ideal.className = "ideal-town-controls";
      ideal.setAttribute("data-dev-only", "");
      ideal.innerHTML = `<h3>Ideal town · every level</h3><label class="ideal-toggle"><input id="ideal-town-enabled" type="checkbox" ${idealTownLevel !== null ? "checked" : ""}> Fill all 23 plots temporarily</label><label class="rename-label" for="ideal-town-level">Development level · <output id="ideal-town-value">Level ${idealTownLevel ?? reviewLevel()}</output></label><input id="ideal-town-level" type="range" min="1" max="50" step="1" value="${idealTownLevel ?? reviewLevel()}"><p class="panel-note">A complete example using compatible building types, not your actual town. All 30 designs can be compared in the catalogue. Closing this review restores your buildings; no levels, resources or timers are saved.</p>`;
      levelSelector.closest("#panel-content").querySelector('label[for="appearance-type"]').before(ideal);
      syncAppearance();
    } else if (openView.type === "buildings") {
      content.innerHTML = `${panelHeading("Town plots", "buildings")}<p class="panel-description">23 plots: 19 general (including the exclusive central Hall site), one wall, two caravan and one freight-depot plot. ${occupiedCount()} occupied; ${23 - occupiedCount()} empty.</p>${["general", "wall", "harbour", "freighter"].map((kind) => `<h3 class="panel-subheading plot-group-heading">${kind === "general" ? "General plots · 19" : kind === "wall" ? "Town wall · 1" : kind === "harbour" ? "Caravan Station plots · 2" : "Freight Depot plot · 1"}</h3><div class="building-list">${plots.filter((plot) => plot.kind === kind).map((plot) => `<button class="building-list-button" data-building="${plot.id}" data-plot="${plot.id}">${icon(plot.icon)}<div><strong>${escapeHtml(plotName(plot))}</strong><small>${state.construction?.buildingId === plot.id ? previewMode === "dev" ? "Construction test in progress" : "Construction in progress" : levelLabel(plot.id)}</small></div>${icon("chevron")}</button>`).join("")}</div>`).join("")}<p class="panel-note">${previewMode === "dev" ? "All 30 catalogue types can be tested in their compatible roles, through level 50. Dev Skip, exact levels and clear-plot tools are illustrative bypasses." : "Building updates are not available yet."} Economic, civic and military effects remain future work.</p>`;
    } else if (openView.type === "overview") {
      if (previewMode === "gameplay") {
        content.innerHTML = `${panelHeading("Town overview", "overview")}<p class="panel-description">${hasHall() ? "Your civic courtyard, with room for a town to grow." : "Open ground, ready for a town to grow."}</p><dl class="overview-facts"><div><dt>Your town</dt><dd id="overview-town-name"></dd></div><div><dt>Total plots</dt><dd>23</dd></div><div><dt>Occupied / empty</dt><dd>${occupiedCount()} / ${23 - occupiedCount()}</dd></div><div><dt>Town Hall</dt><dd>${hasHall() ? `Level ${state.hallLevel}` : "Not built"}</dd></div></dl><p class="panel-note">More town systems are still being developed.</p><button class="secondary-button" data-panel="buildings">${icon("buildings")} Town plots</button>`;
        $("#overview-town-name").textContent = state.townName;
        content.insertAdjacentHTML("beforeend", townLayoutControls());
        return;
      }
      content.innerHTML = `${panelHeading("Town overview", "overview")}<p class="panel-description">${hasHall() ? "Your civic courtyard, with room for a town to grow." : occupiedCount() ? "A developing town with its central Hall site still empty." : "All 23 plots are open ground after the Dev reset."}</p><dl class="overview-facts"><div><dt>Your town</dt><dd id="overview-town-name"></dd></div><div><dt>Total plots</dt><dd>23</dd></div><div><dt>Occupied / empty</dt><dd>${occupiedCount()} / ${23 - occupiedCount()}</dd></div><div><dt>Town Hall</dt><dd>${hasHall() ? `Level ${state.hallLevel}` : "Not built"}</dd></div><div><dt>Construction test</dt><dd>${state.construction ? "In progress" : "Ready"}</dd></div><div><dt>Saved progress</dt><dd>${storageAvailable ? "This browser only" : "This visit only"}</dd></div></dl><section class="preview-guide" aria-labelledby="guide-title"><h3 id="guide-title">Try this preview</h3><ol><li><strong>Explore the plots.</strong> Choose any of the 23 sites. Fit shows the complete town; Inspect supports dragging, wheel zoom and swiping. Region and World open the shared-area and world previews; no other players are connected.</li><li><strong>Build and update.</strong> Test all 30 catalogue types in compatible plots, through level 50. New jobs take 2 minutes, or choose Skip. Cancel before 60 seconds for a full refund; afterwards confirmation returns 30% of paid resources.</li><li><strong>Change a test level.</strong> On a built plot, apply an exact level from 1 to 50 with no cost or timer while no project is pending. Supplies refills illustrative stocks. Clear an individual non-Hall test plot after confirmation, without a refund.</li><li><strong>Review the designs.</strong> Appearance review temporarily shows any type at every level 1–50, with eleven stable uneven visual milestones without changing saved progress. Hall review also changes the playfield; Ideal town shows a complete temporary settlement.</li><li><strong>Start with empty ground.</strong> Reset plots clears all 23 sites, including the Hall, after confirmation. Your town name and the earlier demo are preserved; test resources return to their starting amounts.</li></ol></section><aside class="progress-warning" aria-labelledby="progress-title"><h3 id="progress-title">About your progress</h3><p>${storageAvailable ? "Progress is saved only in this browser at this preview address. A phone or another browser has its own preview. Clearing browser data removes saved progress." : "Browser storage is unavailable. Changes last only for this visit and may be lost on reload."} The earlier six-building preview is retained separately and is not changed by these tools.</p></aside><p class="design-note">A local visual prototype, not a production economy. Silver, Grain and Iron are not simulated; Coins and all building prices are illustrative. Production, population, satisfaction, research, transport and military effects are not implemented. A completed wall crosses the rear valley pass between two cliff shoulders; its appearance is cosmetic, with no defensive simulation. There is no multiplayer or connected server.</p><div class="panel-divider"></div><button class="secondary-button" data-panel="appearance" data-dev-only>Appearance review</button><button class="secondary-button" id="refill-test-supplies" data-dev-only>Refill test supplies</button><button class="secondary-button dev-reset-control" id="request-reset">Reset plots</button>`;
      $("#overview-town-name").textContent = state.townName;
      content.insertAdjacentHTML("beforeend", townLayoutControls());
      const catalogueEntry = document.createElement("button");
      catalogueEntry.className = "secondary-button";
      catalogueEntry.dataset.panel = "catalogue";
      catalogueEntry.innerHTML = `${icon("buildings")} Building catalogue`;
      content.querySelector(".preview-guide").before(catalogueEntry);
    } else if (openView.type === "rename") {
      content.innerHTML = `${panelHeading("Name your town", "town")}<p class="panel-description">Give your settlement a name of its own.</p><form id="rename-form"><label class="rename-label" for="town-name-input">Town name</label><input class="rename-input" id="town-name-input" name="townName" maxlength="20" required autocomplete="off"><p class="rename-help">Up to 20 characters · ${storageAvailable ? "saved only in this browser" : "this visit only"}</p><button class="primary-button" type="submit">Save town name</button></form>`;
      $("#town-name-input").value = state.townName;
    } else if (adviserNotes[openView.type]) {
      const adviser = adviserNotes[openView.type];
      content.innerHTML = `${panelHeading(adviser.title, adviser.icon, previewMode === "dev" ? "Future design area" : "")}<p class="panel-description">${adviser.description}</p><p class="design-note">${previewMode === "dev" ? adviser.note : playerAvailability[openView.type]}</p><div class="panel-divider"></div><button class="secondary-button" data-panel="buildings">Explore town plots</button>`;
    } else if (hudNotes[openView.type] || openView.type === "atlas-detail") {
      const detail = hudNotes[openView.type] || openView.detail;
      content.innerHTML = `${panelHeading(detail.title, detail.icon, previewMode === "dev" ? "Design preview" : "")}<p class="panel-description">${escapeHtml(previewMode === "dev" ? detail.description : detail.playerDescription || detail.description)}</p><p class="design-note">${escapeHtml(previewMode === "dev" ? detail.note : detail.playerNote || playerAvailability[openView.type] || "This feature is not available yet.")}</p>`;
    }
    content.querySelectorAll('[data-panel="catalogue"], [data-panel="appearance"], #request-reset, #reset-confirm, .preview-guide').forEach((node) => node.setAttribute("data-dev-only", ""));
    updateCountdown();
  }

  function writeBuilding(plotId, typeId, level) {
    if (plotId === HALL_ID) {
      state.hallLevel = level;
      delete state.hallPlaced;
    } else {
      if (!state.buildings) state.buildings = {};
      state.buildings[plotId] = { typeId, level };
    }
  }
  function startConstruction(id, typeId, expectedLevel) {
    if (previewMode !== "dev") return;
    finishConstruction();
    if (!Object.hasOwn(byId, id) || !acceptsType(id, typeId)) return;
    const building = buildingFor(id);
    if (!building && metadataFor(typeId)?.retired) return;
    const level = building?.level || 0;
    if (expectedLevel !== level || building && building.typeId !== typeId) return;
    const cost = illustrativeCost(level);
    if (state.construction || !canAfford(cost) || level >= MAX_TEST_LEVEL) return;
    Object.keys(cost).forEach((key) => { state.resources[key] -= cost[key]; });
    const startedAt = Date.now();
    state.construction = { buildingId: id, typeId, toLevel: level + 1, startedAt, endsAt: startedAt + CONSTRUCTION_MS, paidCost: { ...cost } };
    cancelConfirmation = false;
    clearConfirmation = null;
    saveState();
    renderPanel();
    updateHud();
    $("#close-panel").focus();
    announce(`${metadataFor(typeId).name} construction test started. You can cancel for a full refund during the first minute.`, true);
  }

  function finishConstruction(notify = true, now = Date.now(), skip = false) {
    if (!state.construction || !skip && now < state.construction.endsAt) return false;
    const job = state.construction;
    writeBuilding(job.buildingId, jobType(job), job.toLevel);
    state.construction = null;
    cancelConfirmation = false;
    clearConfirmation = null;
    saveState();
    renderMarkers();
    layoutMap();
    if (panel.open && ["building", "buildings", "overview", "catalogue", "appearance", "dev-tools"].includes(openView?.type)) {
      const focusId = document.activeElement?.id;
      renderPanel();
      const focusTarget = focusId && document.getElementById(focusId);
      (focusTarget || $("#close-panel")).focus();
    }
    updateHud();
    if (notify) announce(`${metadataFor(jobType(job)).name} reached level ${job.toLevel}.${skip ? " Dev Skip completed the paid project once; no refund or extra charge." : ""}`, true);
    return true;
  }

  function refillTestSupplies() {
    if (previewMode !== "dev") return;
    finishConstruction();
    const receipt = state.construction ? state.construction.paidCost || costForHall() : { coins: 0, timber: 0, stone: 0 };
    Object.keys(state.resources).forEach((key) => { state.resources[key] = MAX_RESOURCE - receipt[key]; });
    saveState();
    if (panel.open) renderPanel();
    updateHud();
    announce("Dev test supplies refilled. Paid receipts retain room for their exact cancellation refund; no production was simulated.", true);
  }
  function matchesBuildingControl(button) {
    const id = button?.dataset.targetPlot;
    const building = Object.hasOwn(byId, id || "") ? buildingFor(id) : null;
    return building && openView?.type === "building" && openView.buildingId === id && button.dataset.typeId === building.typeId && Number(button.dataset.currentLevel) === building.level;
  }
  function applyTestLevel(button) {
    if (previewMode !== "dev" || !matchesBuildingControl(button) || state.construction) return;
    const level = Number($("#test-building-level")?.value);
    if (!Number.isInteger(level) || level < 1 || level > MAX_TEST_LEVEL) return;
    writeBuilding(button.dataset.targetPlot, button.dataset.typeId, level);
    clearConfirmation = null;
    saveState();
    renderMarkers();
    layoutMap();
    renderPanel();
    updateHud();
    $("#set-test-level")?.focus();
    announce(`Dev bypass: ${metadataFor(button.dataset.typeId).name} set directly to level ${level}. No resources or timer were used.`, true);
  }
  function clearTestPlot(button) {
    if (previewMode !== "dev" || !matchesBuildingControl(button) || state.construction || button.dataset.targetPlot === HALL_ID || clearConfirmation !== button.dataset.targetPlot) return;
    const id = button.dataset.targetPlot;
    delete state.buildings[id];
    if (!Object.keys(state.buildings).length) delete state.buildings;
    clearConfirmation = null;
    buildChoice = null;
    saveState();
    renderMarkers();
    layoutMap();
    renderPanel();
    updateHud();
    $("#building-type")?.focus();
    announce("Dev sample cleared from this plot, with no refund. Other buildings and resources are unchanged.", true);
  }

  function cancellationQuote(job = state.construction, now = Date.now()) {
    if (!job) return null;
    const elapsed = Math.max(0, now - job.startedAt);
    const free = elapsed < FREE_CANCEL_MS;
    // The historical Hall-only preview used this same deterministic price.
    // Derive its receipt without rewriting an existing 10-second queue.
    const paidCost = job.paidCost || costForHall();
    const refund = Object.fromEntries(Object.entries(paidCost).map(([key, amount]) => [key, Math.min(MAX_RESOURCE - state.resources[key], free ? amount : Math.floor(amount * 30 / 100))]));
    return { free, refund, freeRemaining: Math.max(0, Math.ceil((FREE_CANCEL_MS - elapsed) / 1000)) };
  }

  function refundText(refund) {
    return Object.entries(refund).map(([key, amount]) => `${number(amount)} ${resourceLabels[key]}`).join(" · ");
  }

  function cancelConstruction(confirmed = false) {
    if (previewMode !== "dev") return;
    // Use one instant for deadline reconciliation and the refund boundary.
    // A clock tick between the two checks must not produce a mixed decision.
    const now = Date.now();
    if (finishConstruction(true, now)) {
      announce("Construction has already completed. No cancellation or refund was applied.", true);
      return;
    }
    const quote = cancellationQuote(state.construction, now);
    if (!quote) return;
    if (!quote.free && (!confirmed || !cancelConfirmation)) {
      cancelConfirmation = true;
      renderPanel();
      updateCountdown();
      $("#confirm-cancel-construction")?.focus();
      return;
    }
    Object.keys(quote.refund).forEach((key) => { state.resources[key] += quote.refund[key]; });
    state.construction = null;
    cancelConfirmation = false;
    saveState();
    renderPanel();
    updateHud();
    $(buildingFor(openView?.buildingId) ? "#upgrade-building" : openView?.buildingId === HALL_ID ? "#build-hall" : "#build-selected")?.focus();
    announce(`Construction cancelled. ${quote.free ? "Full refund" : "30% refund"}: ${refundText(quote.refund)}.`, true);
  }

  function updateCountdown() {
    const job = state.construction;
    const now = Date.now();
    const remaining = job ? Math.max(0, Math.ceil((job.endsAt - now) / 1000)) : 0;
    $("#queue-chip").classList.toggle("busy", Boolean(job));
    $("#queue-label").textContent = job ? `${metadataFor(jobType(job)).name} · ${remaining}s${previewMode === "dev" ? " test" : ""}` : `${23 - occupiedCount()} empty plots${previewMode === "dev" ? " · Local preview" : ""}`;
    if ($("#construction-time") && job) $("#construction-time").textContent = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")} remaining · local construction test`;
    if ($("#construction-progress") && job) $("#construction-progress").value = Math.min(100, Math.max(0, (now - job.startedAt) / (job.endsAt - job.startedAt) * 100));
    if (job && $("#free-cancel-time")) {
      const quote = cancellationQuote(job, now);
      $("#free-cancel-time").textContent = quote.free ? `Free cancellation · ${Math.floor(quote.freeRemaining / 60)}:${String(quote.freeRemaining % 60).padStart(2, "0")} left` : "Free cancellation ended · 30% resource refund";
      $("#free-cancel-time").classList.add("cancel-window");
      $("#cancel-refund").textContent = `If cancelled now: ${refundText(quote.refund)} (${quote.free ? "100%" : "30%"}).`;
      $("#cancel-refund").classList.add("refund-summary");
      $("#request-cancel-construction").textContent = quote.free ? "Cancel for free" : "Cancel · 30% refund";
      if ($("#paid-cancel-warning")) $("#paid-cancel-warning").textContent = `The free minute has ended. Cancel now and return only ${refundText(quote.refund)}. The remaining 70% will not be returned.`;
    }
  }

  function sampledSoilBackdrop(bounds, asset) {
    const sample = `<svg width="2100" height="1200" viewBox="1000 850 2100 1200" preserveAspectRatio="xMidYMid slice" overflow="hidden" style="width:2100px;height:1200px"><image class="painted-margin-art" href="${asset}" width="4200" height="2400" preserveAspectRatio="xMidYMid slice"/></svg>`;
    // Reflected samples share their source edge on every join. One continuous
    // material fills desktop/compact screen-ratio margins without stretching a
    // photographic canyon or rolling Oasis ornamentation out to other states.
    return `<defs><pattern id="town-valley-soil" width="4200" height="2400" patternUnits="userSpaceOnUse">${sample}<g transform="translate(4200 0) scale(-1 1)">${sample}</g><g transform="translate(0 2400) scale(1 -1)">${sample}</g><g transform="translate(4200 2400) scale(-1 -1)">${sample}</g></pattern></defs><rect class="painted-margin" x="${bounds.x}" y="${bounds.y}" width="${bounds.width}" height="${bounds.height}" fill="url(#town-valley-soil)"/>`;
  }
  function syncOasisFoundationBounds(bounds) {
    const foundation = $("#azmara-oasis-foundation");
    if (!foundation) return;
    for (const key of ["x", "y", "width", "height"]) foundation.setAttribute(key, bounds[key]);
  }
  function renderLandscape(bounds) {
    const { x, y, width, height } = bounds;
    const visual = appearanceFor();
    const frame = landFrame();
    landscape.setAttribute("viewBox", `${x} ${y} ${width} ${height}`);
    const key = `${desktopQuery.matches ? "desktop" : "compact"}:${visual.stage}`;
    const image = $("#azmara-land-stage");
    if (landscapeProfile !== key || !image) {
      landscapeProfile = key;
      landscape.innerHTML = `<image id="azmara-land-stage" href="${visual.src}" x="${frame.x}" y="${frame.y}" width="${frame.width}" height="${frame.height}" preserveAspectRatio="xMidYMid meet" aria-hidden="true"/>`;
    } else {
      if (image.getAttribute("href") !== visual.src) image.setAttribute("href", visual.src);
      for (const [name, value] of Object.entries(frame)) image.setAttribute(name, String(value));
    }
    syncAppearance();
  }

  function syncWallCanvas(bounds, width, height, core, scale) {
    const front = $("#town-wall-front-layer");
    if (!front) return;
    front.setAttribute("viewBox", `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`);
    // Hotspots are core-local; the wall uses the very same whole-world SVG
    // plane as the landscape. Never apply the native-art scenery transform.
    front.style.left = `${(bounds.x - core.x) * scale}px`;
    front.style.top = `${(bounds.y - core.y) * scale}px`;
    front.style.width = `${width}px`;
    front.style.height = `${height}px`;
  }

  function syncWallPixelRegistration() {
    const control = $('.plot-marker[data-plot="wall-01"]');
    if (control) {
      control.style.setProperty("--wall-snap-x", "0px");
      control.style.setProperty("--wall-snap-y", "0px");
    }
  }

  function currentMapFocus() {
    if (!mapMetrics) return mapFocus;
    return { x: mapMetrics.x + (viewport.scrollLeft + mapMetrics.viewportWidth / 2) / mapMetrics.scale, y: mapMetrics.y + (viewport.scrollTop + mapMetrics.viewportHeight / 2) / mapMetrics.scale };
  }

  function updateMapLabels() {
    const compact = townMap.classList.contains("compact-map");
    const visible = manualMapLabels ?? false;
    townMap.classList.toggle("labels-hidden", !visible);
    const button = $("#toggle-labels");
    button.setAttribute("aria-pressed", String(visible));
    button.setAttribute("aria-label", visible ? "Hide building labels" : "Show building labels");
    all('[data-desktop-action="labels"]').forEach((control) => {
      control.setAttribute("aria-pressed", String(visible));
      control.setAttribute("aria-label", visible ? "Hide desktop plot labels" : "Show desktop plot labels");
    });
  }

  function initialFitArea() {
    const lockedFrame = landFrame();
    const lockedWidth = viewport.clientWidth;
    const lockedHeight = viewport.clientHeight;
    const lockedHall = paintedControl("hall");
    const horizontalReach = Math.min(lockedHall.x - lockedFrame.x,
      lockedFrame.x + lockedFrame.width - lockedHall.x);
    const verticalReach = Math.min(lockedHall.y - lockedFrame.y,
      lockedFrame.y + lockedFrame.height - lockedHall.y);
    // A normal cover scale can run out of picture before this deliberately
    // off-centre painted Hall reaches the viewport centre. Give the Hall equal
    // painted reach on both sides, then crop the extra exactly as DEC-100 asks.
    const coverScale = Math.max(lockedWidth / lockedFrame.width, lockedHeight / lockedFrame.height);
    const hallCentredScale = Math.max(lockedWidth / (2 * horizontalReach), lockedHeight / (2 * verticalReach));
    return { scale: Math.max(coverScale, hallCentredScale),
      centerX: lockedWidth / 2, centerY: lockedHeight / 2 };
    /* istanbul ignore next -- retained rollback algorithm, unreachable while DEC-100 is active */
    const width = viewport.clientWidth;
    const height = viewport.clientHeight;
    const usable = townUsableArea();
    if (desktopQuery.matches) {
      // The viewport is the game area to the right of the separate sidebar.
      const scale = Math.max(width / DESKTOP_ART.width, height / DESKTOP_ART.height);
      // Very wide windows crop more of the painting vertically. Bias their
      // overview toward the expanded waterfront, keeping every reserved site
      // visible, without changing the zoom scale or adding unpainted margins.
      const overviewY = DESKTOP_ART.height / 2 + Math.min(185, Math.max(0, width / height - 2.1) * 245);
      return { scale, centerX: width / 2, centerY: height / 2 + (DESKTOP_CORE.y + DESKTOP_CORE.height / 2 - overviewY) * scale };
    }
    // Compact keeps a reserved rail; opening its drawer must not refit the map.
    const top = usable.top;
    const bottom = usable.bottom;
    const availableWidth = width - 48;
    const availableHeight = Math.max(0, bottom - top);
    const minimumScale = 44 / 215 + 0.001;
    let scale = Math.min(availableWidth / CORE.width, availableHeight / CORE.height);
    // Preserve distinct 44px targets on unusually short displays.
    if (scale < minimumScale) scale = Math.min((width - 24) / CORE.width, (height - 24) / CORE.height);
    let centerY = (top + bottom) / 2;
    centerY = Math.max(scale * CORE.height / 2 + 12, Math.min(height - scale * CORE.height / 2 - 12, centerY));
    return { scale, centerX: width / 2, centerY };
  }

  function fitArea() {
    const lockedWidth = viewport.clientWidth, lockedHeight = viewport.clientHeight;
    if ((!lockedWidth || !lockedHeight) && completeTownFit?.value) return completeTownFit.value;
    const lockedKey = `${lockedWidth}:${lockedHeight}:${desktopQuery.matches}:land-v1`;
    if (completeTownFit?.key === lockedKey) return completeTownFit.value;
    const lockedValue = { ...initialFitArea(), wallBounds: null, packingRetries: 0, packingLimited: false };
    completeTownFit = { key: lockedKey, value: lockedValue };
    return lockedValue;
    /* istanbul ignore next -- retained rollback algorithm, unreachable while DEC-100 is active */
    const width = viewport.clientWidth, height = viewport.clientHeight;
    // Atlas hides this DOM viewport. HUD/gallery updates must retain the last
    // real Town registration, not turn 44px targets into infinite world units.
    // Returning to Town refreshes the cache from its actual visible dimensions.
    if ((!width || !height) && completeTownFit?.value) return completeTownFit.value;
    const desktop = desktopQuery.matches;
    const key = `${width}:${height}:${townLayout()}:${desktop}`;
    if (completeTownFit?.key === key) return completeTownFit.value;
    let fit = initialFitArea();
    if (!window.AzmaraTownWall || !width || !height) return fit;
    const core = desktop ? DESKTOP_CORE : CORE;
    const usable = townUsableArea();
    const top = usable.top;
    // Leave room for the gate's pinned/keyboard label too, even when hidden.
    // Label toggles must not change Fit or cover the southern toolbar.
    const bottom = usable.bottom;
    let wallBounds, lastFeasibleFit = null, packingRetries = 0, packingScaleLimit = Infinity;
    // The union of all three material rows is reserved even in an empty town.
    // A build, Update or unsaved review must not change overview framing.
    for (let iteration = 0; iteration < (desktop ? 12 : 8); iteration++) {
      if (desktop) updateDesktopNorthInset(width, height, fit); else updateCompactAnchors(fit);
      if (desktop && desktopWallClearanceLimited) {
        // A tightly cropped narrow desktop can have no legal packing at this
        // optimistic scale. Expand only that failed view by 6%, keeping the
        // same world centre and 44px targets; never oscillate upward again.
        packingScaleLimit = Math.min(packingScaleLimit, fit.scale * .94);
        const factor = packingScaleLimit / fit.scale, middle = (top + bottom) / 2;
        fit = { ...fit, scale: packingScaleLimit, centerX: width / 2 + (fit.centerX - width / 2) * factor,
          centerY: middle + (fit.centerY - middle) * factor };
        packingRetries++;
        continue;
      }
      const envelopes = plots.map(plot => {
        const p = plotPosition(plot), f = footprintFor(plot);
        return { id: plot.id, x: p.x, y: p.y,
          width: Math.max(f.width, 44 / fit.scale), height: Math.max(f.height, 44 / fit.scale) };
      });
      const scene = wallPresentationEnvelope(desktop, envelopes);
      const wall = scene.worldBounds || scene.paintedBounds;
      if (!wall) return fit;
      // Only the nearby cliff/pass focus joins are relevant to Fit, not the
      // full transparent strip or distant painted peaks outside the playfield.
      const focus = window.AzmaraTownWall.terrainLayout?.({ desktop }).focusBounds;
      const boxes = [wall].concat(focus ? [focus] : []);
      const left = Math.min(...boxes.map(b => b.x), ...envelopes.map(p => p.x - p.width / 2));
      const topEdge = Math.min(...boxes.map(b => b.y), ...envelopes.map(p => p.y - p.height / 2));
      const right = Math.max(...boxes.map(b => b.x + b.width), ...envelopes.map(p => p.x + p.width / 2));
      const lower = Math.max(...boxes.map(b => b.y + b.height), ...envelopes.map(p => p.y + p.height / 2));
      wallBounds = { x: left, y: topEdge, width: right - left, height: lower - topEdge };
      if (desktop) lastFeasibleFit = { ...fit, wallBounds: { ...wallBounds } };
      const scale = Math.min((width - 12) / wallBounds.width, (bottom - top) / wallBounds.height, packingScaleLimit);
      const next = { scale, centerX: width / 2 + (core.x + core.width / 2 - wallBounds.x - wallBounds.width / 2) * scale,
        centerY: (top + bottom) / 2 + (core.y + core.height / 2 - wallBounds.y - wallBounds.height / 2) * scale };
      const stable = Math.abs(next.scale - fit.scale) < .000001 && Math.abs(next.centerX - fit.centerX) < .01 && Math.abs(next.centerY - fit.centerY) < .01;
      fit = next;
      if (stable) break;
    }
    if (desktop) updateDesktopNorthInset(width, height, fit); else updateCompactAnchors(fit);
    if (desktop && desktopWallClearanceLimited && lastFeasibleFit) {
      // The loop is finite. If its final optimistic candidate fails, retain
      // the last measured legal view rather than a colliding arrangement.
      fit = lastFeasibleFit; wallBounds = lastFeasibleFit.wallBounds;
      updateDesktopNorthInset(width, height, fit);
    }
    completeTownFit = { key, value: { ...fit, wallBounds, packingRetries,
      packingLimited: desktop && desktopWallClearanceLimited } };
    return completeTownFit.value;
  }

  function completeTownFrame(desktop, fit) {
    return landFrame(desktop);
    /* istanbul ignore next -- retained rollback algorithm, unreachable while DEC-100 is active */
    const frame = desktop ? DESKTOP_FRAME : TOWN_FRAME, wall = fit.wallBounds;
    if (!wall) return frame;
    const x = Math.min(frame.x, wall.x - 12), y = Math.min(frame.y, wall.y - 12);
    return { x, y, width: Math.max(frame.x + frame.width, wall.x + wall.width + 12) - x,
      height: Math.max(frame.y + frame.height, wall.y + wall.height + 12) - y };
  }

  function closeZoom() {
    const core = activeCore();
    const fit = fitArea();
    const coverScale = Math.max(viewport.clientWidth / core.width, viewport.clientHeight / core.height);
    // A modest desktop inspection view, not the former abrupt 2x-ish jump.
    // The paused compact/native presentation keeps its existing Close framing.
    const scale = desktopQuery.matches ? fit.scale * 1.5
      : Math.max(fit.scale * 1.65, Math.min(viewport.clientWidth / 850, viewport.clientHeight / 750, 0.78));
    return Math.min(MAX_MAP_ZOOM, scale / coverScale);
  }

  function layoutMap(focus = mapFocus) {
    if (viewport.hidden) return;
    const viewportWidth = viewport.clientWidth;
    const viewportHeight = viewport.clientHeight;
    if (!viewportWidth || !viewportHeight) return;
    const core = activeCore();
    const desktop = desktopQuery.matches;
    if (mapMetrics && mapMetrics.desktop !== desktop) {
      const previous = mapMetrics.core;
      focus = { x: core.x + (focus.x - previous.x) / previous.width * core.width, y: core.y + (focus.y - previous.y) / previous.height * core.height };
    }
    const coverScale = Math.max(viewportWidth / core.width, viewportHeight / core.height);
    const fit = fitArea();
    const frame = completeTownFrame(desktop, fit);
    // DEC-100 uses one locked picture plane. Presentation packing must not
    // move controls or grow a synthetic world outside that picture.
    projectedAnchors = {};
    compactProjectedAnchors = {};
    townMap.dataset.northInset = String(desktop ? desktopNorthInset : 0);
    townMap.dataset.hallOutset = String(desktop ? desktopHallOutset : 0);
    townMap.dataset.edgeInset = String(desktop ? desktopEdgeInset : 0);
    townMap.dataset.wallInset = String(desktop ? desktopWallInset : 0);
    townMap.dataset.wallClearance = desktop && desktopWallClearanceLimited ? "limited" : "clear";
    const minimumZoom = fit.scale / coverScale;
    if (closeMap && !fitMap) mapZoom = closeZoom();
    mapZoom = fitMap ? minimumZoom : Math.max(minimumZoom, Math.min(MAX_MAP_ZOOM, mapZoom));
    const scale = coverScale * mapZoom;
    const target = fitMap ? plotPosition(byId[HALL_ID], core) : focus;
    // At gentle desktop zoom the whole settlement still fits the viewport.
    // Allow a small scenic pan margin instead of making that view feel locked;
    // it is always bounded by the existing painting, never new outer terrain.
    const worldWidth = frame.width;
    const worldHeight = frame.height;
    // Larger screen-ratio margins have no scroll range along that axis.
    // Fit aligns the core below the compact title without stretching the art.
    const bounds = {
      x: frame.x,
      y: frame.y,
      width: worldWidth, height: worldHeight
    };
    if (desktop && !fitMap) {
      // The scenic window must contain the whole settlement frame, including
      // the off-centre freighter, even while the viewport padding shrinks.
      bounds.x = Math.max(frame.x + frame.width - worldWidth, Math.min(frame.x, bounds.x));
      bounds.y = Math.max(frame.y + frame.height - worldHeight, Math.min(frame.y, bounds.y));
    }
    const width = worldWidth * scale;
    const height = worldHeight * scale;
    mapSurface.style.width = `${width}px`;
    mapSurface.style.height = `${height}px`;
    townMap.style.width = `${width}px`;
    townMap.style.height = `${height}px`;
    townCore.style.left = `${(core.x - bounds.x) * scale}px`;
    townCore.style.top = `${(core.y - bounds.y) * scale}px`;
    townCore.style.width = `${core.width * scale}px`;
    townCore.style.height = `${core.height * scale}px`;
    townCore.dataset.coreWidth = String(core.width);
    townCore.dataset.coreHeight = String(core.height);
    all(".plot-marker").forEach((marker) => {
      const position = plotPosition(byId[marker.dataset.plot], core);
      marker.style.setProperty("--x", `${(position.x - core.x) / core.width * 100}%`);
      marker.style.setProperty("--y", `${(position.y - core.y) / core.height * 100}%`);
    });
    townCore.style.setProperty("--plot-width", `${Math.max(44, PLOT_ART.width * scale)}px`);
    townCore.style.setProperty("--plot-height", `${Math.max(44, PLOT_ART.height * scale)}px`);
    townCore.style.setProperty("--hall-width", `${Math.max(44, HALL_ART.width * scale)}px`);
    townCore.style.setProperty("--hall-height", `${Math.max(44, HALL_ART.height * scale)}px`);
    townCore.style.setProperty("--wall-width", `${Math.max(44, WALL_ART.width * scale)}px`);
    townCore.style.setProperty("--wall-height", `${Math.max(44, WALL_ART.height * scale)}px`);
    townMap.classList.toggle("compact-map", core.width * scale < 740);
    townMap.dataset.presentation = desktop ? "desktop" : "compact";
    townMap.dataset.plotLayout = townLayout();
    townMap.dataset.zoom = String(mapZoom);
    townMap.dataset.minZoom = String(minimumZoom);
    townMap.dataset.fit = String(fitMap);
    townMap.dataset.view = fitMap ? "fit" : closeMap ? "close" : "custom";
    viewport.dataset.fit = String(fitMap);
    viewport.dataset.dragging = String(Boolean(mapDrag?.moved));
    updateMapLabels();
    syncWallCanvas(bounds, width, height, core, scale);
    renderLandscape(bounds);
    const left = Math.max(0, Math.min(width - viewportWidth, (target.x - bounds.x) * scale - fit.centerX));
    const top = Math.max(0, Math.min(height - viewportHeight, (target.y - bounds.y) * scale - (fitMap ? fit.centerY : viewportHeight / 2)));
    mapMetrics = { ...bounds, core, desktop, width, height, scale, viewportWidth, viewportHeight, minimumZoom, fitLeft: left, fitTop: top };
    viewport.scrollTo({ left, top, behavior: "instant" });
    syncWallPixelRegistration();
    mapFocus = currentMapFocus();
    $("#zoom-in").disabled = mapZoom >= MAX_MAP_ZOOM - 0.001;
    $("#zoom-out").disabled = mapZoom <= minimumZoom + 0.001;
    // Do not stream dozens of live-region announcements during an animation.
    if (!cameraAnimation) {
      $("#map-zoom-level").textContent = fitMap ? "Fit" : `${Math.round(mapZoom * 100)}%`;
      if ($("#desktop-map-zoom-level")) $("#desktop-map-zoom-level").textContent = fitMap ? "Fit" : `${Math.round(mapZoom * 100)}%`;
    }
    all('[data-desktop-action="zoom-in"]').forEach((control) => { control.disabled = mapZoom >= MAX_MAP_ZOOM - 0.001; });
    all('[data-desktop-action="zoom-out"]').forEach((control) => { control.disabled = mapZoom <= minimumZoom + 0.001; });
    all('[data-desktop-action="fit"]').forEach((control) => { control.setAttribute("aria-pressed", String(fitMap)); });
    all('[data-desktop-action="close"]').forEach((control) => { control.setAttribute("aria-pressed", String(closeMap)); });
    const viewButton = $("#toggle-map-view");
    viewButton.textContent = fitMap ? "Inspect" : "Fit";
    viewButton.setAttribute("aria-label", fitMap ? "Inspect town detail" : "Fit all 23 plots");
    viewButton.setAttribute("aria-pressed", String(!fitMap));
    viewButton.title = fitMap ? "Inspect the Town Hall" : "Fit all 23 plots";
  }

  function stopCameraAnimation() {
    cancelAnimationFrame(cameraFrame);
    cameraFrame = 0;
    cameraAnimation = null;
    townMap.dataset.cameraAnimating = "false";
    if (mapMetrics) layoutMap(currentMapFocus());
  }

  function animateCamera(zoom, focus, fit = false, close = false) {
    const startFocus = currentMapFocus();
    stopCameraAnimation();
    endMapDrag();
    const fromZoom = mapZoom;
    const finish = () => {
      cameraAnimation = null;
      cameraFrame = 0;
      townMap.dataset.cameraAnimating = "false";
      mapZoom = zoom;
      fitMap = fit;
      closeMap = close;
      layoutMap(focus);
    };
    // Desktop transitions are visual only. Reduced motion and the compact web
    // presentation keep immediate changes; no installed native assets are synced.
    if (!desktopQuery.matches || reducedMotionQuery.matches || Math.abs(zoom - fromZoom) < 0.00001) {
      finish();
      return;
    }
    fitMap = false;
    closeMap = false;
    cameraAnimation = { toZoom: zoom, focus, fit, close, startedAt: performance.now() };
    townMap.dataset.cameraAnimating = "true";
    const step = (time) => {
      // A first rAF timestamp can precede performance.now() within its frame.
      const progress = Math.max(0, Math.min(1, (time - cameraAnimation.startedAt) / CAMERA_TRANSITION_MS));
      const eased = progress * progress * (3 - 2 * progress);
      mapZoom = fromZoom + (zoom - fromZoom) * eased;
      layoutMap({ x: startFocus.x + (focus.x - startFocus.x) * eased, y: startFocus.y + (focus.y - startFocus.y) * eased });
      if (progress < 1) cameraFrame = requestAnimationFrame(step);
      else finish();
    };
    cameraFrame = requestAnimationFrame(step);
  }

  function changeMapZoom(direction) {
    if (!mapMetrics || mapInteractionBlocked()) return;
    // Accumulate rapid clicks against the pending target, not a half-drawn frame.
    const nextZoom = (cameraAnimation?.toZoom ?? mapZoom) * (direction > 0 ? MAP_ZOOM_FACTOR : 1 / MAP_ZOOM_FACTOR);
    const focus = currentMapFocus();
    animateCamera(Math.max(mapMetrics.minimumZoom, Math.min(MAX_MAP_ZOOM, nextZoom)), focus, nextZoom <= mapMetrics.minimumZoom + 0.001);
  }

  function centerMap(animate = true) {
    if (!mapMetrics) return;
    stopCameraAnimation();
    endMapDrag();
    if (fitMap) {
      viewport.scrollTo({ left: mapMetrics.fitLeft, top: mapMetrics.fitTop, behavior: "instant" });
      return;
    }
    const fit = fitArea();
    const hall = plotPosition(byId[HALL_ID]);
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    viewport.scrollTo({ left: (hall.x - mapMetrics.x) * mapMetrics.scale - viewport.clientWidth / 2, top: (hall.y - mapMetrics.y) * mapMetrics.scale - (fitMap ? fit.centerY : viewport.clientHeight / 2), behavior: animate && !reducedMotion ? "smooth" : "instant" });
  }

  function useMapView(close) {
    if (!mapMetrics || mapInteractionBlocked()) return;
    animateCamera(close ? closeZoom() : mapMetrics.minimumZoom, plotPosition(byId[HALL_ID]), !close, close);
    announce(!close ? "All 23 plots fitted to the town view." : "Inspect town detail. Click and drag, wheel to zoom, swipe or use arrow keys to explore.");
  }

  function toggleMapLabels() {
    manualMapLabels = $("#toggle-labels").getAttribute("aria-pressed") !== "true";
    updateMapLabels();
    announce(`Building labels ${manualMapLabels ? "shown" : "hidden"}.`);
  }

  function showActionsMenu() {
    stopCameraAnimation();
    endMapDrag();
    closeSidebar(false);
    actionsMenu.showModal();
    actionsMenu.scrollTop = 0;
    $('[data-desktop-action="options"]')?.setAttribute("aria-expanded", "true");
    $("#close-actions").focus();
  }

  document.addEventListener("click", (event) => {
    const metric = event.target.closest(".sidebar-metric-button");
    if (metric) metric.focus({preventScroll:true});
    const modeButton = event.target.closest("button[data-preview-mode]");
    if (modeButton) { setPreviewMode(modeButton.dataset.previewMode, modeButton); return; }
    if (previewMode !== "dev" && event.target.closest("[data-dev-only]")) return;
    const devAction = event.target.closest("[data-dev-action]");
    if (devAction) {
      if (previewMode === "dev" && devAction.dataset.devAction === "reset") openPanel("reset", devAction);
      if (previewMode === "dev" && devAction.dataset.devAction === "refill") refillTestSupplies();
      return;
    }
    const buildingButton = event.target.closest("[data-building]");
    if (buildingButton && Object.hasOwn(byId, buildingButton.dataset.building)) {
      openPanel({ type: "building", buildingId: buildingButton.dataset.building }, buildingButton);
      return;
    }
    const panelButton = event.target.closest("[data-panel]");
    if (panelButton) { openPanel(panelButton.dataset.panel === "appearance" ? { type: "appearance", reviewType: panelButton.dataset.reviewType } : panelButton.dataset.panel, panelButton); return; }
    const mapNavigation = event.target.closest("[data-map-navigation]");
    if (mapNavigation) { switchMapView(mapNavigation.dataset.mapNavigation); return; }
    const hudAction = event.target.closest("[data-action]");
    if (hudAction && hudNotes[hudAction.dataset.action]) { openPanel(hudAction.dataset.action, hudAction); return; }
    const desktopButton = event.target.closest("[data-desktop-action]");
    if (!desktopButton) return;
    switch (desktopButton.dataset.desktopAction) {
      case "zoom-in": changeMapZoom(1); break;
      case "zoom-out": changeMapZoom(-1); break;
      case "fit": useMapView(false); break;
      case "close": useMapView(true); break;
      case "labels": toggleMapLabels(); break;
      case "center": centerMap(); break;
      case "town": switchMapView("town"); centerMap(); break;
      case "help": openPanel("overview", desktopButton); break;
      case "options": showActionsMenu(); break;
    }
  });
  $("#close-panel").addEventListener("click", closePanel);
  panel.addEventListener("click", (event) => { if (event.target === panel) { const box = panel.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closePanel(); } });
  panel.addEventListener("close", () => {
    restoreAppearance();
    cancelConfirmation = false;
    clearConfirmation = null;
    buildChoice = null;
    openView = null;
    setNav(atlas.currentView());
    updateHud();
    returnToControl(returnFocus);
    returnFocus = null;
  });
  $("#rename-town").addEventListener("click", (event) => openPanel("rename", event.currentTarget));
  $("#show-town").addEventListener("click", () => { switchMapView("town"); centerMap(); announce("Town map centered."); });
  $("#center-map").addEventListener("click", () => { centerMap(); announce("Town map centered."); });
  $("#zoom-in").addEventListener("click", () => changeMapZoom(1));
  $("#zoom-out").addEventListener("click", () => changeMapZoom(-1));
  $("#toggle-map-view").addEventListener("click", () => useMapView(fitMap));
  $("#toggle-labels").addEventListener("click", toggleMapLabels);
  actionsToggle.addEventListener("click", showActionsMenu);
  sidebarToggle?.addEventListener("click", () => sidebarOpen ? closeSidebar() : openSidebar());
  sidebarClose?.addEventListener("click", () => closeSidebar());
  sidebarBackdrop?.addEventListener("click", () => closeSidebar());
  sidebar?.addEventListener("keydown", (event) => {
    if (!sidebarOpen) return;
    if (event.key === "Escape") { event.preventDefault(); closeSidebar(); return; }
    if (event.key !== "Tab") return;
    const controls = [...sidebar.querySelectorAll("button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), [tabindex='0']")].filter((node) => node.getClientRects().length && !node.closest("[hidden]"));
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });
  desktopQuery.addEventListener("change", () => {
    const wasOpen = sidebarOpen;
    const focusInside = sidebar?.contains(document.activeElement);
    sidebarOpen = false;
    syncSidebar();
    if ((wasOpen || focusInside) && !desktopQuery.matches) sidebarToggle?.focus({ preventScroll: true });
    else if (wasOpen && desktopQuery.matches) requestAnimationFrame(() => {
      // CSS can blur the drawer-only Close button before this media event.
      // Preserve a still-visible sidebar control; recover BODY/hidden focus.
      if (!desktopQuery.matches || sidebarOpen || panel.open || actionsMenu.open) return;
      const active = document.activeElement;
      const visibleSidebarFocus = active !== sidebarClose && sidebar.contains(active) && active.getClientRects().length;
      if (!visibleSidebarFocus) sidebar.querySelector(".desktop-town-selector")?.focus({ preventScroll: true });
    });
  });
  $("#close-actions").addEventListener("click", () => actionsMenu.close());
  // Close before an action's own handler runs, so map actions reveal the town
  // and detail actions do not stack two native modal dialogs.
  actionsMenu.addEventListener("click", (event) => {
    if (event.target.closest("button")) actionsMenu.close();
    else if (event.target === actionsMenu) {
      const box = actionsMenu.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) actionsMenu.close();
    }
  }, { capture: true });
  actionsMenu.addEventListener("close", () => {
    actionsToggle.setAttribute("aria-expanded", "false");
    $('[data-desktop-action="options"]')?.setAttribute("aria-expanded", "false");
    if (!panel.open) returnToControl(actionsTrigger());
  });
  actionsMenu.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const buttons = [...actionsMenu.querySelectorAll("button:not(:disabled)")];
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  content.addEventListener("click", (event) => {
    if (previewMode === "dev" && openView?.type === "appearance") {
      if (event.target.closest("#comparison-toggle-sites")) {
        appearanceBuildSites = !appearanceBuildSites;
        $("#comparison-build-chooser").checked = appearanceBuildSites;
        renderAppearanceComparison(); return;
      }
      const size = event.target.closest("[data-comparison-solo]");
      if (size) {
        const percent = Number(size.dataset.comparisonSolo);
        appearanceComparisonSolo = percent !== 0;
        if (percent) appearanceComparisonScale = percent/100;
        renderAppearanceComparison(); panel.scrollTop = 0; return;
      }
      const pin = event.target.closest("[data-comparison-plot]");
      if (pin && appearanceComparisonSolo) {
        appearanceSelectedPlot = pin.dataset.comparisonPlot;
        const plot = byId[appearanceSelectedPlot];
        $("#comparison-selection").textContent = `${shownPlotName(plot)} · ${shownLevelLabel(plot.id)} · test selection only`;
        announce($("#comparison-selection").textContent);
        renderAppearanceComparison(); return;
      }
    }
    const landStageButton = event.target.closest("[data-land-stage-level]");
    if (landStageButton && previewMode === "dev" && openView?.type === "dev-tools" && !state.construction && hasHall()) {
      const level = Number(landStageButton.dataset.landStageLevel);
      if (!window.AzmaraLandStages.milestones.includes(level)) return;
      devHallLevelOverride = level;
      renderMarkers();
      updateHud();
      layoutMap();
      renderPanel();
      content.querySelector(`[data-land-stage-level="${level}"]`)?.focus();
      announce(`Temporary Town Hall level ${level}; locked land stage ${appearanceFor().stage}. Nothing was saved.`);
      return;
    }
    if (event.target.closest("#reset-land-stage") && previewMode === "dev" && openView?.type === "dev-tools") {
      devHallLevelOverride = null;
      renderMarkers();
      updateHud();
      layoutMap();
      renderPanel();
      $("#reset-land-stage")?.focus();
      announce(`Land restored to the actual completed Town Hall level ${actualHallLevel()}.`);
      return;
    }
    if (event.target.closest("#apply-town-layout") && openView?.type === "overview") {
      const choice = $("#town-layout")?.value;
      if (!window.AzmaraTownLayouts.valid(choice) || choice === townLayout()) return;
      state.plotLayout = choice;
      saveState();
      desktopInsetSize = "";
      layoutMap(currentMapFocus());
      syncAppearance();
      announce(`${window.AzmaraTownLayouts.get(choice).label} layout saved. Buildings, resources and construction are unchanged.`, true);
      return;
    }
    if (previewMode !== "dev") return;
    const buildButton = event.target.closest("#upgrade-building, #build-hall, #build-selected");
    if (buildButton && openView?.type === "building" && openView.buildingId === buildButton.dataset.targetPlot) {
      const id = buildButton.dataset.targetPlot;
      const building = Object.hasOwn(byId, id) ? buildingFor(id) : null;
      const actionMatches = building ? buildButton.id === "upgrade-building" : buildButton.id === (id === HALL_ID ? "build-hall" : "build-selected");
      const choiceMatches = building || id === HALL_ID || $("#building-type")?.value === buildButton.dataset.typeId;
      if (actionMatches && choiceMatches && !buildButton.disabled) startConstruction(id, buildButton.dataset.typeId, Number(buildButton.dataset.currentLevel));
    }
    const skipButton = event.target.closest("#skip-construction");
    if (skipButton && matchesJobControl(skipButton)) finishConstruction(true, Date.now(), true);
    const cancelButton = event.target.closest("#request-cancel-construction");
    if (cancelButton && matchesJobControl(cancelButton)) cancelConstruction();
    const confirmCancelButton = event.target.closest("#confirm-cancel-construction");
    if (confirmCancelButton && matchesJobControl(confirmCancelButton)) cancelConstruction(true);
    const setLevelButton = event.target.closest("#set-test-level");
    if (setLevelButton) applyTestLevel(setLevelButton);
    if (event.target.closest("#refill-test-supplies")) refillTestSupplies();
    const clearButton = event.target.closest("#request-clear-plot");
    if (clearButton && matchesBuildingControl(clearButton) && !state.construction && clearButton.dataset.targetPlot !== HALL_ID) {
      clearConfirmation = clearButton.dataset.targetPlot;
      renderPanel();
      $("#confirm-clear-plot")?.focus();
    }
    const confirmClearButton = event.target.closest("#confirm-clear-plot");
    if (confirmClearButton) clearTestPlot(confirmClearButton);
    if (event.target.closest("#keep-plot")) {
      clearConfirmation = null;
      renderPanel();
      $("#request-clear-plot")?.focus();
    }
    const keepButton = event.target.closest("#keep-construction");
    if (keepButton && matchesJobControl(keepButton)) {
      cancelConfirmation = false;
      renderPanel();
      $("#request-cancel-construction")?.focus();
    }
    if (event.target.closest("#finish-appearance-review, #comparison-return-town")) closePanel();
    if (event.target.closest("#request-reset")) {
      openPanel("reset", event.target.closest("#request-reset"));
    }
    if (event.target.closest("#cancel-reset")) {
      closePanel();
    }
    if (event.target.closest("#confirm-reset") && openView?.type === "reset") {
      const selectedLayout = state.plotLayout;
      state = { ...defaultState(state.townName), hallPlaced: false };
      devHallLevelOverride = null;
      if (selectedLayout) state.plotLayout = selectedLayout;
      restoreAppearance();
      cancelConfirmation = false;
      clearConfirmation = null;
      buildChoice = null;
      saveState();
      renderMarkers();
      updateHud();
      layoutMap();
      closePanel();
      announce("All 23 plots cleared, including the Town Hall. Town name and historical demo preserved; test resources restored.", true);
    }
  });
  content.addEventListener("change", (event) => {
    if (event.target.id === "comparison-size-slider" && previewMode === "dev" && openView?.type === "appearance") {
      const percent = Number(event.target.value);
      if (!Number.isInteger(percent) || percent < 1 || percent > 100) return;
      announce(`Temporary building size ${percent} percent. Plot positions and saved progress are unchanged.`);
      return;
    }
    if (event.target.id === "comparison-build-chooser" && previewMode === "dev" && openView?.type === "appearance") {
      appearanceBuildSites = event.target.checked; renderAppearanceComparison(); return;
    }
    if (event.target.id === "town-layout" && openView?.type === "overview" && window.AzmaraTownLayouts.valid(event.target.value)) {
      $("#town-layout-description").textContent = window.AzmaraTownLayouts.get(event.target.value).description;
      return;
    }
    if (previewMode !== "dev") return;
    if (event.target.id === "catalogue-level" && openView?.type === "catalogue") {
      const level = Number(event.target.value);
      if (!Number.isInteger(level) || level < 1 || level > 50) return;
      catalogueLevel = level;
      renderPanel();
      $("#catalogue-level")?.focus();
    } else if (event.target.id === "building-type" && openView?.type === "building" && !state.construction && !buildingFor(openView.buildingId)) {
      if (!acceptsType(openView.buildingId, event.target.value)) return;
      buildChoice = { plotId: openView.buildingId, typeId: event.target.value };
      renderPanel();
      $("#building-type")?.focus();
    } else if (event.target.id === "appearance-type" && openView?.type === "appearance") {
      if (!metadataFor(event.target.value)) return;
      const level = Number($("#appearance-level")?.value);
      appearanceType = event.target.value;
      appearanceLevel = Number.isInteger(level) && level >= 1 && level <= 50 ? level : 1;
      renderPanel();
      $("#appearance-type")?.focus();
      announce(`Temporary ${metadataFor(appearanceType).name} artwork review. Nothing is saved.`);
    } else if (event.target.id === "appearance-level" && openView?.type === "appearance") {
      const level = Number(event.target.value);
      if (!Number.isInteger(level) || level < 1 || level > 50) return;
      appearanceLevel = level;
      syncAppearance();
      announce(`Temporary ${metadataFor(appearanceType).name} level ${level} artwork review. Your actual town progress is unchanged.`);
    } else if (event.target.id === "ideal-town-enabled" && openView?.type === "appearance") {
      idealTownLevel = event.target.checked ? Number($("#ideal-town-level").value) : null;
      if (idealTownLevel === null) { appearanceLevel = null; $("#appearance-level").value = String(reviewLevel()); }
      renderMarkers();
      updateHud();
      layoutMap();
      announce(idealTownLevel === null ? "Actual saved town restored." : `Ideal town at level ${idealTownLevel}. Temporary compatible buildings fill all 23 plots; nothing is saved.`);
    }
  });
  content.addEventListener("submit", (event) => {
    if (event.target.id !== "rename-form") return;
    event.preventDefault();
    const input = $("#town-name-input");
    const townName = input.value.trim().replace(/\s+/g, " ").slice(0, 20);
    if (!townName) { input.setCustomValidity("Enter a town name."); input.reportValidity(); return; }
    state.townName = townName;
    saveState();
    updateHud();
    closePanel();
    announce(`Town renamed to ${townName}.`, true);
  });
  content.addEventListener("input", (event) => {
    if (event.target.id === "town-name-input") event.target.setCustomValidity("");
    if (event.target.id === "comparison-size-slider" && previewMode === "dev" && openView?.type === "appearance") {
      const percent = Number(event.target.value);
      if (!Number.isInteger(percent) || percent < 1 || percent > 100) return;
      appearanceComparisonScale = percent/100;
      appearanceComparisonSolo = true;
      $("#comparison-size-value").textContent = `${percent}%`;
      cancelAnimationFrame(appearanceScaleFrame);
      appearanceScaleFrame = requestAnimationFrame(() => { appearanceScaleFrame = 0; renderAppearanceComparison(); });
      return;
    }
    if (event.target.id === "ideal-town-level" && previewMode === "dev" && openView?.type === "appearance") {
      const level = Number(event.target.value);
      if (!Number.isInteger(level) || level < 1 || level > 50) return;
      $("#ideal-town-value").textContent = `Level ${level}`;
      if (!$("#ideal-town-enabled").checked) return;
      idealTownLevel = level;
      renderMarkers();
      updateHud();
      layoutMap();
    }
  });
  viewport.addEventListener("keydown", (event) => {
    suppressMapClickUntil = 0;
    if (mapInteractionBlocked()) return;
    if (event.target !== viewport || event.ctrlKey || event.metaKey || event.altKey) return;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      stopCameraAnimation();
      if (fitMap) return;
      viewport.scrollBy({ left: event.key === "ArrowLeft" ? -100 : event.key === "ArrowRight" ? 100 : 0, top: event.key === "ArrowUp" ? -100 : event.key === "ArrowDown" ? 100 : 0, behavior: "instant" });
    }
    if (["+", "=", "-"].includes(event.key)) {
      event.preventDefault();
      changeMapZoom(event.key === "-" ? -1 : 1);
    }
  });
  function endMapDrag() {
    if (!mapDrag) return;
    const drag = mapDrag;
    mapDrag = null;
    if (drag.moved) suppressMapClickUntil = performance.now() + 350;
    viewport.dataset.dragging = "false";
    if (viewport.hasPointerCapture(drag.id)) viewport.releasePointerCapture(drag.id);
    mapFocus = currentMapFocus();
  }
  viewport.addEventListener("pointerdown", (event) => {
    suppressMapClickUntil = 0;
    if (event.pointerType === "touch" || !event.isPrimary || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || mapInteractionBlocked() || fitMap) return;
    stopCameraAnimation();
    mapDrag = { id: event.pointerId, x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop, moved: false };
  });
  viewport.addEventListener("pointermove", (event) => {
    if (!mapDrag || event.pointerId !== mapDrag.id) return;
    if (!(event.buttons & 1) || mapInteractionBlocked()) { endMapDrag(); return; }
    const dx = event.clientX - mapDrag.x;
    const dy = event.clientY - mapDrag.y;
    if (!mapDrag.moved && Math.hypot(dx, dy) < 5) return;
    if (!mapDrag.moved) {
      mapDrag.moved = true;
      viewport.setPointerCapture(event.pointerId);
      viewport.dataset.dragging = "true";
      viewport.focus({ preventScroll: true });
    }
    event.preventDefault();
    viewport.scrollTo({ left: mapDrag.left - dx, top: mapDrag.top - dy, behavior: "instant" });
  });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
    viewport.addEventListener(type, (event) => { if (mapDrag?.id === event.pointerId) endMapDrag(); });
  }
  viewport.addEventListener("dragstart", (event) => event.preventDefault());
  viewport.addEventListener("click", (event) => {
    if (event.detail !== 0 && performance.now() < suppressMapClickUntil) {
      suppressMapClickUntil = 0;
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, { capture: true });
  viewport.addEventListener("wheel", (event) => {
    // Ctrl/meta wheel and native touch pinch remain browser accessibility zoom.
    if (event.ctrlKey || event.metaKey) return;
    if (mapInteractionBlocked()) { event.preventDefault(); return; }
    if (event.shiftKey) { if (cameraAnimation) stopCameraAnimation(); return; }
    if (!event.deltaY || !mapMetrics) return;
    event.preventDefault();
    const box = viewport.getBoundingClientRect(), matrix = landscape.getScreenCTM();
    if (!matrix || !matrix.a) return;
    const at = new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());
    const pixels = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1);
    const step = Math.log(MAP_ZOOM_FACTOR), factor = Math.exp(-Math.max(-step,Math.min(step,pixels * .002)));
    const nextZoom = Math.max(mapMetrics.minimumZoom,Math.min(MAX_MAP_ZOOM,(cameraAnimation?.toZoom ?? mapZoom) * factor));
    const core = activeCore(), scale = Math.max(viewport.clientWidth/core.width,viewport.clientHeight/core.height) * nextZoom;
    const focus = { x:at.x + (fitArea().centerX-(event.clientX-box.left))/scale,
      y:at.y + (viewport.clientHeight/2-(event.clientY-box.top))/scale };
    animateCamera(nextZoom,focus,nextZoom <= mapMetrics.minimumZoom + .001);
  }, { passive: false });
  window.addEventListener("blur", endMapDrag);
  viewport.addEventListener("scroll", () => {
    if (fitMap && mapMetrics && (Math.abs(viewport.scrollLeft - mapMetrics.fitLeft) > 1 || Math.abs(viewport.scrollTop - mapMetrics.fitTop) > 1)) {
      viewport.scrollTo({ left: mapMetrics.fitLeft, top: mapMetrics.fitTop, behavior: "instant" });
    }
    mapFocus = currentMapFocus();
    syncWallPixelRegistration();
  }, { passive: true });
  new ResizeObserver(() => { stopCameraAnimation(); endMapDrag(); layoutMap(); positionComparisonTargets(); }).observe(viewport);
  reducedMotionQuery.addEventListener("change", () => {
    if (reducedMotionQuery.matches && cameraAnimation) {
      const target = cameraAnimation;
      animateCamera(target.toZoom, target.focus, target.fit, target.close);
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { stopCameraAnimation(); endMapDrag(); }
    else { finishConstruction(); updateCountdown(); }
  });
  syncModeControls();
  syncSidebar();
  renderMarkers();
  saveState();
  finishConstruction(false);
  updateHud();
  layoutMap();
  setInterval(() => { if (!finishConstruction()) updateCountdown(); }, 500);
  // Local opt-in debug session only; the hosted game never loads this module.
  if (["localhost", "127.0.0.1", "[::1]"].includes(location.hostname) &&
      new URLSearchParams(location.search).get("debug") === "1") {
    const debugScript = document.createElement("script");
    debugScript.src = "debug-overlay.js";
    document.head.append(debugScript);
  }
})();
