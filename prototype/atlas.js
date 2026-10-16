"use strict";

// Original visual atlas only: no ownership, economy, backend or saved state.
(() => {
  const TERRAIN = "assets/azmara-region-terrain-v2.png";
  const WORLD_TERRAIN = "assets/azmara-world-relief-v1.png";
  const HOME = "qamar-cove";
  const islands = [
    { id: HOME, name: "Qamar Basin", type: "clay", coordinate: "12:7" },
    { id: "narin-shoals", name: "Narin Oasis", type: "silver", coordinate: "17:10" },
    { id: "saffron-reach", name: "Saffron Reach", type: "grain", coordinate: "22:6" },
    { id: "tamar-bay", name: "Tamar Vale", type: "iron", coordinate: "28:9" },
    { id: "ashar-coast", name: "Ashar Plain", type: "grain", coordinate: "10:15" },
    { id: "luma-atoll", name: "Luma Gardens", type: "clay", coordinate: "16:18" },
    { id: "darya-sound", name: "Darya Crossing", type: "iron", coordinate: "23:15" },
    { id: "farun-haven", name: "Farun Wells", type: "silver", coordinate: "29:19" },
    { id: "miran-keys", name: "Miran Plateau", type: "silver", coordinate: "11:24" },
    { id: "sahir-cape", name: "Sahir Pass", type: "iron", coordinate: "18:28" },
    { id: "suna-strand", name: "Suna Flats", type: "clay", coordinate: "24:25" },
    { id: "zafir-isle", name: "Zafir Valley", type: "grain", coordinate: "30:27" }
  ];
  const resources = {
    timber: { name: "Timber", site: "Timber site", icon: "timber", description: "The shared forest site supplies timber for town construction. Each town would assign its own available citizens and keep its own timber output." },
    clay: { name: "Clay", site: "Clay pit", icon: "stone", description: "This region's specialist site is intended to supply clay for advanced construction. Shared access does not combine different towns' resources or workers." },
    silver: { name: "Silver", site: "Silver mine", icon: "silver", description: "This region's specialist site is intended to supply silver for scholarship and advanced equipment. Exact research and equipment costs remain undecided." },
    grain: { name: "Grain", site: "Grain site", icon: "grain", description: "This region's specialist resource is grain, intended to support civic satisfaction. The final production source, provision system and quantities remain undecided." },
    iron: { name: "Iron", site: "Iron mine", icon: "iron", description: "This region's specialist site is intended to supply iron for military development. No troops, military production or combat are implemented." }
  };
  // DEC-051: 16 ordinary review locations, including home at location 8,
  // plus a separate locked premium preview. None creates or owns a new town.
  // Original dry desert flats, clear of the painted sandstone ridges.
  // Location identities and the home index stay stable across the visual move.
  const settlementAnchors = [[14, 26], [44, 10], [70, 24], [87, 28], [13, 58], [24, 42], [89, 50], [46, 77], [85, 76], [29, 26], [56, 11], [24, 62], [34, 70], [77, 40], [73, 58], [61, 88]];
  const premiumAnchor = [32, 85];
  // A finite first-draft chart, not the size of a production multiplayer world.
  // One coordinate step is always the same distance on both chart axes.
  const worldBounds = Object.freeze({ left: 4, top: 0, right: 36, bottom: 34 });
  const coordinateUnit = 100;
  const icon = (name) => `<svg aria-hidden="true"><use href="#icon-${name}"/></svg>`;
  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const resourceIllustrations = Object.freeze({ timber: "foresters-house", clay: "clayworks", silver: "silver-refinery", grain: "grain-estate", iron: "iron-foundry" });

  function create({ onTown, onDetail, onViewChange, getTownName, getHallLevel, announce } = {}) {
    if (document.querySelector("#atlas-view")) throw new Error("AZMARA atlas already mounted");
    const root = node("section", "atlas-view");
    root.id = "atlas-view";
    root.hidden = true;
    root.inert = true;
    root.setAttribute("aria-label", "AZMARA Region and World maps");
    const scenery = node("img", "atlas-scenery");
    scenery.src = TERRAIN;
    scenery.alt = "";
    scenery.draggable = false;
    scenery.setAttribute("aria-hidden", "true");
    scenery.dataset.sceneryOnly = "true";
    const viewport = node("div", "atlas-viewport");
    viewport.id = "atlas-viewport";
    viewport.tabIndex = 0;
    viewport.setAttribute("aria-label", "Atlas map. Select a region, town or resource site. Use arrow keys, scroll or drag to explore. World regions have X:Y coordinates. Native browser zoom remains available.");
    const surface = node("div", "atlas-surface");
    const stage = node("div", "atlas-stage");
    surface.append(stage);
    viewport.append(surface);
    const identity = node("div", "atlas-identity");
    const kicker = node("span", "atlas-kicker", "Visual map preview");
    kicker.setAttribute("data-dev-only", "");
    const heading = node("h2", "atlas-title");
    heading.id = "atlas-title";
    const description = node("span", "atlas-subtitle");
    identity.append(kicker, heading, description);
    const nav = node("nav", "atlas-navigation");
    nav.setAttribute("aria-label", "Atlas navigation");
    const worldButton = node("button", "atlas-nav-button", "World");
    worldButton.dataset.atlasAction = "world";
    const islandButton = node("button", "atlas-nav-button", "Region");
    islandButton.dataset.atlasAction = "island";
    const townButton = node("button", "atlas-nav-button atlas-town-return", "Town");
    townButton.dataset.atlasAction = "town";
    townButton.setAttribute("aria-label", "Return to your saved town");
    nav.append(townButton, islandButton, worldButton);
    const camera = node("nav", "atlas-camera");
    camera.id = "atlas-camera";
    camera.hidden = true;
    camera.inert = true;
    camera.setAttribute("aria-label", "World camera controls");
    camera.setAttribute("aria-controls", viewport.id);
    const out = node("button", "atlas-camera-button");
    out.innerHTML = icon("minus");
    out.setAttribute("aria-label", "Zoom out World map");
    const fit = node("button", "atlas-camera-button", "Overview");
    fit.setAttribute("aria-label", "Show the complete World coordinate chart");
    const zoomLabel = node("output", "atlas-zoom-label", "100%");
    zoomLabel.setAttribute("aria-label", "World zoom");
    const plus = node("button", "atlas-camera-button");
    plus.innerHTML = icon("plus");
    plus.setAttribute("aria-label", "Zoom in World map");
    camera.append(out, fit, zoomLabel, plus);
    const position = node("output", "atlas-world-position");
    position.setAttribute("aria-label", "Coordinates at the centre of the world map");
    position.hidden = true;
    root.append(scenery, viewport, nav);
    const sidebarContext = document.querySelector("#sidebar-atlas-context");
    if (sidebarContext) sidebarContext.append(identity, position);
    else root.append(identity, position);
    identity.hidden = true;
    // Share the sidebar's chrome context so its modal drawer/backdrop always
    // cover map controls; only the terrain belongs in the lower body layer.
    document.body.append(root);
    (document.querySelector("#desktop-hud") || document.body).append(camera);

    let view = "town";
    let selected = islands[0];
    let zoom = 1;
    let stageSize = { width: 2200, height: 2200 / 1.5 };
    let scale = 1;
    let overview = false;
    let worldOverview = false;
    let stageOffset = { left: 0, top: 0 };
    let drag = null;
    let suppressClickUntil = 0;
    const compact = () => innerWidth < 1024 || innerHeight < 600;
    const modalOpen = () => Boolean(document.querySelector("dialog[open]")) || document.body.dataset.sidebarOpen === "true";
    const canPan = () => zoom > 1 || overview || (view === "world" && !worldOverview);
    const notice = (message) => { if (typeof announce === "function") announce(message); };

    function inspect(detail, trigger) {
      endDrag();
      if (typeof onDetail === "function") onDetail(detail, trigger);
    }

    function actualHomeAppearance() {
      const requested = typeof getHallLevel === "function" ? getHallLevel() : 1;
      const level = Number.isInteger(requested) && requested >= 0 && requested <= 50 ? requested : 1;
      const art = window.AzmaraBuildingArt?.forBuilding("town-hall", Math.max(1, level));
      // At reset this wooden icon still identifies the town, not a built Hall.
      return { level, stage: art?.stage || 1, src: art?.src || "assets/progression/azmara-hall-level-1.png" };
    }

    function syncTownAppearance() {
      if (root.hidden || view !== "world" && (view !== "island" || selected.id !== HOME)) return;
      const home = view === "world" ? stage.querySelector(`[data-atlas-island="${HOME}"]`) : stage.querySelector('[data-atlas-town="home"]');
      if (!home) return;
      const appearance = actualHomeAppearance();
      const image = home.querySelector(view === "world" ? ".atlas-world-home-art" : ".atlas-settlement-art");
      if (image.getAttribute("src") !== appearance.src) image.setAttribute("src", appearance.src);
      home.dataset.hallLevel = String(appearance.level);
      home.dataset.hallPlaced = String(appearance.level > 0);
      home.dataset.artStage = String(appearance.stage);
      if (view === "world") return;
      const label = home.querySelector(".atlas-node-label");
      label.textContent = typeof getTownName === "function" ? getTownName() : "Your town";
      home.setAttribute("aria-label", "Open your town: " + label.textContent);
    }

    function makeSettlement(index) {
      const own = selected.id === HOME && index === 7;
      const button = node("button", "atlas-settlement" + (own ? " atlas-owned-town" : ""));
      button.dataset.atlasTown = own ? "home" : "empty";
      button.dataset.location = String(index + 1);
      button.dataset.settlementKind = "ordinary";
      button.style.setProperty("--x", settlementAnchors[index][0] + "%");
      button.style.setProperty("--y", settlementAnchors[index][1] + "%");
      const image = node("img", "atlas-settlement-art");
      image.src = own ? actualHomeAppearance().src : "assets/azmara-empty-plot-v4.png";
      image.alt = "";
      image.draggable = false;
      const label = node("span", "atlas-node-label", own ? (typeof getTownName === "function" ? getTownName() : "Your town") : "Open location");
      button.setAttribute("aria-label", own ? "Open your town: " + label.textContent : "Inspect open settlement location " + (index + 1));
      const ground = node("span", "atlas-site-grounding");
      ground.setAttribute("aria-hidden", "true");
      button.append(ground, image, label);
      button.addEventListener("click", (event) => {
        if (own) { endDrag(); if (typeof onTown === "function") onTown(); }
        else inspect({ title: "Open settlement location", icon: "plot", description: "An illustrative place where a future town could be located in " + selected.name + ".", note: "This shared-region draft has 16 ordinary locations and one separate locked premium preview. It is not a final regional capacity or a working settlement. Expansion, ownership, other players, costs and construction are not implemented.", playerDescription: "An open settlement location in " + selected.name + ".", playerNote: "Settling a new town is not available yet." }, event.currentTarget);
      });
      return button;
    }

    function makePremiumSettlement() {
      const button = node("button", "atlas-settlement atlas-premium-location");
      button.dataset.atlasTown = "premium";
      button.dataset.location = "17";
      button.dataset.settlementKind = "premium";
      button.style.setProperty("--x", premiumAnchor[0] + "%");
      button.style.setProperty("--y", premiumAnchor[1] + "%");
      button.setAttribute("aria-label", "Inspect locked premium settlement location in " + selected.name);
      const image = node("img", "atlas-settlement-art");
      image.src = "assets/azmara-empty-plot-v4.png";
      image.alt = "";
      image.draggable = false;
      const lock = node("span", "atlas-premium-lock");
      lock.setAttribute("aria-hidden", "true");
      lock.innerHTML = '<svg viewBox="0 0 24 24"><path d="M7 10V7a5 5 0 0 1 10 0v3"/><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M12 14v3"/></svg>';
      const ground = node("span", "atlas-site-grounding");
      ground.setAttribute("aria-hidden", "true");
      button.append(ground, image, lock, node("span", "atlas-node-label", "Premium · Locked"));
      button.addEventListener("click", (event) => inspect({ title: "Locked premium location", icon: "plot", description: "A separate reserved location in " + selected.name + ", shown only to review the shared region layout.", note: "Informational preview only. Purchasing, unlocking, pricing, premium currency, ownership and settlement expansion are not implemented. Selecting this location does not spend anything or change your saved town.", playerDescription: "A locked settlement location in " + selected.name + ".", playerNote: "Unlocking this location is not available yet." }, event.currentTarget));
      return button;
    }

    function makeResource(type, x, y) {
      const resource = resources[type];
      const button = node("button", "atlas-resource-site atlas-resource-" + type);
      button.dataset.atlasResource = type;
      button.style.setProperty("--x", x + "%");
      button.style.setProperty("--y", y + "%");
      const emblem = node("span", "atlas-resource-emblem");
      emblem.setAttribute("aria-hidden", "true");
      emblem.dataset.illustrationOnly = "true";
      // A static original camp/source illustration, not a constructed building,
      // production state, worker assignment or another player's settlement.
      emblem.innerHTML = window.AzmaraBuildingArt?.render(resourceIllustrations[type], 1, "atlas-resource-illustration") || icon(resource.icon);
      const symbol = node("span", "atlas-resource-symbol");
      symbol.setAttribute("aria-hidden", "true");
      symbol.innerHTML = icon(resource.icon);
      const label = node("span", "atlas-node-label", resource.site);
      button.setAttribute("aria-label", "Inspect " + resource.site + " on " + selected.name);
      button.append(emblem, symbol, label);
      button.addEventListener("click", (event) => inspect({ title: resource.site, icon: resource.icon, description: resource.description, note: "Assigning workers and Contribute Timber are agreed design directions, not working controls here. Capacity sharing, worker limits, production rates, expansion costs and timing remain undecided. No resources are produced or spent by this preview.", playerDescription: resource.site + " in " + selected.name + ".", playerNote: "Worker assignment and resource production are not available yet." }, event.currentTarget));
      return button;
    }

    function makeWorldIsland(island, index) {
      const button = node("button", "atlas-world-island atlas-resource-" + island.type);
      button.dataset.atlasIsland = island.id;
      button.dataset.islandType = island.type;
      const [x, y] = island.coordinate.split(":").map(Number);
      button.dataset.coordinateX = String(x);
      button.dataset.coordinateY = String(y);
      button.style.setProperty("--x", ((x - worldBounds.left) / (worldBounds.right - worldBounds.left) * 100) + "%");
      button.style.setProperty("--y", ((y - worldBounds.top) / (worldBounds.bottom - worldBounds.top) * 100) + "%");
      const basin = node("span", "atlas-region-silhouette");
      basin.setAttribute("aria-hidden", "true");
      const relief = node("span", "atlas-world-relief-patch");
      relief.style.backgroundImage = `url("${WORLD_TERRAIN}")`;
      relief.style.backgroundPosition = ((x - worldBounds.left) / (worldBounds.right - worldBounds.left) * 100) + "% " + ((y - worldBounds.top) / (worldBounds.bottom - worldBounds.top) * 100) + "%";
      // Soft local raster relief, never another flat token or a miniature island.
      // Empty raster grounds below mean unowned preview locations, not live towns.
      const settlement = node("img", island.id === HOME ? "atlas-world-home-art" : "atlas-world-ground-art");
      settlement.src = island.id === HOME ? actualHomeAppearance().src : "assets/azmara-empty-plot-v4.png";
      settlement.alt = "";
      settlement.draggable = false;
      settlement.setAttribute("aria-hidden", "true");
      basin.append(relief, settlement);
      const title = node("span", "atlas-island-name", island.name);
      const resource = node("span", "atlas-island-resource");
      resource.innerHTML = icon("timber") + "<span>Timber + " + resources[island.type].name + "</span>";
      const coordinate = node("span", "atlas-coordinate", "[" + island.coordinate + "]" + (island.id === HOME ? " · Home region" : ""));
      if (island.id !== HOME) {
        const previewNote = node("span", "", " · Preview");
        previewNote.setAttribute("data-dev-only", "");
        coordinate.append(previewNote);
      }
      button.setAttribute("aria-label", "Open " + island.name + " region, Timber and " + resources[island.type].name + ", fictional coordinates " + island.coordinate);
      button.append(basin, title, resource, coordinate);
      button.addEventListener("click", () => show("island", island.id));
      button.dataset.atlasIndex = String(index);
      return button;
    }

    function makeWorldChart() {
      const chart = node("div", "atlas-world-chart");
      chart.setAttribute("aria-hidden", "true");
      const lines = [];
      const width = (worldBounds.right - worldBounds.left) * coordinateUnit;
      const height = (worldBounds.bottom - worldBounds.top) * coordinateUnit;
      for (let x = worldBounds.left; x <= worldBounds.right; x += 2) {
        const px = (x - worldBounds.left) * coordinateUnit;
        lines.push(`<path d="M${px} 0V${height}"/><text x="${px + 12}" y="36">${x}</text><text x="${px + 12}" y="${height - 16}">${x}</text>`);
      }
      for (let y = worldBounds.top; y <= worldBounds.bottom; y += 2) {
        const py = (y - worldBounds.top) * coordinateUnit;
        lines.push(`<path d="M0 ${py}H${width}"/><text x="12" y="${py + 34}">${y}</text><text x="${width - 50}" y="${py + 34}">${y}</text>`);
      }
      chart.innerHTML = `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"><g class="atlas-chart-trail"><path d="M380-60Q130 420 770 810T1360 1660T2100 2430T2800 3460"/></g><g class="atlas-chart-grid">${lines.join("")}</g><g class="atlas-chart-landmarks"><text x="1800" y="520">EASTERN DUNES</text><text x="300" y="2100">SANDSTONE RIDGES</text><text x="1940" y="3000">SOUTHERN BASINS</text></g></svg>`;
      return chart;
    }

    function updateWorldPosition() {
      if (root.hidden || view !== "world") return;
      const x = worldBounds.left + (viewport.scrollLeft + viewport.clientWidth / 2 - stageOffset.left) / scale / coordinateUnit;
      const y = worldBounds.top + (viewport.scrollTop + viewport.clientHeight / 2 - stageOffset.top) / scale / coordinateUnit;
      const coordinate = Math.round(Math.max(worldBounds.left, Math.min(worldBounds.right, x))) + ":" + Math.round(Math.max(worldBounds.top, Math.min(worldBounds.bottom, y)));
      position.textContent = "Map centre [" + coordinate + "] · Drag / scroll";
      position.dataset.coordinate = coordinate;
    }

    function render() {
      stage.replaceChildren();
      root.dataset.atlasView = view;
      root.dataset.islandId = selected.id;
      root.dataset.islandLabel = selected.name;
      root.dataset.islandType = selected.type;
      root.dataset.regionId = selected.id;
      root.dataset.regionLabel = selected.name;
      root.dataset.regionType = selected.type;
      stage.className = "atlas-stage atlas-" + view + "-stage";
      scenery.src = view === "world" ? WORLD_TERRAIN : TERRAIN;
      identity.hidden = false;
      position.hidden = view !== "world";
      heading.textContent = view === "world" ? "AZMARA World" : selected.name;
      description.textContent = view === "world" ? "Desert regions · X:Y coordinates" : "Shared region · Timber + " + resources[selected.type].name + " · [" + selected.coordinate + "]";
      if (view === "world") {
        const draftNote = node("span", "", " · Coordinate-map draft");
        draftNote.setAttribute("data-dev-only", "");
        description.append(draftNote);
      }
      worldButton.setAttribute("aria-current", view === "world" ? "page" : "false");
      islandButton.setAttribute("aria-current", view === "island" ? "page" : "false");
      islandButton.setAttribute("aria-label", "Open region " + selected.name);
      if (view === "world") {
        const terrain = node("img", "atlas-world-terrain");
        terrain.src = WORLD_TERRAIN;
        terrain.alt = "";
        terrain.draggable = false;
        terrain.setAttribute("aria-hidden", "true");
        stage.append(terrain, makeWorldChart());
        islands.forEach((island, index) => stage.append(makeWorldIsland(island, index)));
        const compass = node("div", "atlas-sea-compass", "N");
        compass.setAttribute("aria-hidden", "true");
        stage.append(compass);
      } else {
        const terrain = node("img", "atlas-island-terrain");
        terrain.src = TERRAIN;
        terrain.alt = "Original fictional dry desert region with sandstone ridges, palm groves, resource sites and open settlement clearings.";
        terrain.draggable = false;
        stage.append(terrain);
        settlementAnchors.forEach((_, index) => stage.append(makeSettlement(index)));
        stage.append(makePremiumSettlement(), makeResource("timber", 52, 38), makeResource(selected.type, 61, 54));
      }
      syncTownAppearance();
      layout(true);
    }

    function layout(recenter = false) {
      if (root.hidden) return;
      const width = viewport.clientWidth;
      const height = viewport.clientHeight;
      const small = compact();
      const viewportBox = viewport.getBoundingClientRect();
      const cameraBox = camera.getBoundingClientRect();
      const cameraInside = cameraBox.width && cameraBox.height && cameraBox.right > viewportBox.left && cameraBox.left < viewportBox.right && cameraBox.top < viewportBox.bottom;
      const top = 12;
      const bottom = cameraInside ? Math.max(12, viewportBox.bottom - cameraBox.top + 12) : 12;
      root.style.setProperty("--atlas-footer-height", "0px");
      stageSize = view === "world" ? { width: (worldBounds.right - worldBounds.left) * coordinateUnit, height: (worldBounds.bottom - worldBounds.top) * coordinateUnit } : { width: 2200, height: 2200 / 1.5 };
      const availableWidth = Math.max(1, width - 24);
      const availableHeight = Math.max(80, height - top - bottom);
      const fitScale = Math.min(availableWidth / stageSize.width, availableHeight / stageSize.height);
      // On compact regions, fitting all 17 locations into a postage stamp
      // would overlap native 44px targets. Keep the painting's true aspect and
      // expose a bounded, pannable Overview instead of promising complete Fit.
      const minimumIslandScale = 600 / 2200;
      const minimumDesktopRegionScale = 450 / 2200;
      const regionMinimum = small ? minimumIslandScale : minimumDesktopRegionScale;
      // World opens as a chart that can genuinely scroll on both axes. Overview
      // deliberately fits the finite draft instead; it does not change geography.
      const worldExploreScale = Math.max(.5, width * 1.35 / stageSize.width, height * 1.35 / stageSize.height);
      const baseScale = view === "world" ? (worldOverview ? Math.max(fitScale, .11) : worldExploreScale) : Math.max(fitScale, regionMinimum);
      overview = (view === "island" || worldOverview) && baseScale > fitScale + .00001;
      scale = baseScale * zoom;
      const renderedWidth = stageSize.width * scale;
      const renderedHeight = stageSize.height * scale;
      const surfaceWidth = Math.max(width, renderedWidth + 24);
      const surfaceHeight = Math.max(height, renderedHeight + top + bottom);
      surface.style.width = surfaceWidth + "px";
      surface.style.height = surfaceHeight + "px";
      stage.style.width = renderedWidth + "px";
      stage.style.height = renderedHeight + "px";
      stageOffset = { left: (surfaceWidth - renderedWidth) / 2, top: top + Math.max(0, (surfaceHeight - top - bottom - renderedHeight) / 2) };
      stage.style.left = stageOffset.left + "px";
      stage.style.top = stageOffset.top + "px";
      stage.style.setProperty("--settlement-width", Math.max(44, 200 * scale) + "px");
      stage.style.setProperty("--town-width", Math.max(54, 285 * scale) + "px");
      stage.style.setProperty("--resource-width", Math.max(44, 190 * scale) + "px");
      stage.style.setProperty("--island-width", Math.max(44, Math.min(160, 320 * scale)) + "px");
      root.dataset.zoom = String(zoom);
      root.dataset.worldOverview = String(view === "world" && worldOverview);
      root.dataset.coordinateBounds = view === "world" ? "4:0–36:34 (fictional draft)" : "";
      root.dataset.atlasFraming = view === "world" && !worldOverview && zoom === 1 ? "explore" : overview && zoom === 1 ? "overview" : zoom === 1 ? "fit" : "close";
      viewport.dataset.fit = String(zoom === 1 && !overview && (view !== "world" || worldOverview));
      fit.textContent = "Overview";
      fit.setAttribute("aria-label", view === "world" ? overview ? "Reset the finite world overview; pan to explore every coordinate" : "Show the complete finite world coordinate chart" : overview ? "Reset region overview; pan to explore all locations" : "Fit the complete atlas view");
      out.disabled = zoom <= 1 && (view !== "world" || worldOverview);
      plus.disabled = zoom >= 2.5;
      fit.setAttribute("aria-pressed", String(zoom === 1 && (view !== "world" || worldOverview)));
      zoomLabel.textContent = Math.round(zoom * 100) + "%";
      if (recenter) {
        if (view === "world" && !worldOverview) {
          const [x, y] = selected.coordinate.split(":").map(Number);
          viewport.scrollTo({ left: stageOffset.left + (x - worldBounds.left) * coordinateUnit * scale - width / 2, top: stageOffset.top + (y - worldBounds.top) * coordinateUnit * scale - (top + availableHeight / 2), behavior: "instant" });
        } else viewport.scrollTo({ left: Math.max(0, (surfaceWidth - width) / 2), top: Math.max(0, (surfaceHeight - height) / 2), behavior: "instant" });
      }
      updateWorldPosition();
    }

    function changeZoom(direction, clientPoint = null, factor = null) {
      if (root.hidden || modalOpen()) return;
      endDrag();
      const box = viewport.getBoundingClientRect();
      const anchor = clientPoint && scale > 0 ? {
        x: (viewport.scrollLeft + clientPoint.x - box.left - stageOffset.left) / scale,
        y: (viewport.scrollTop + clientPoint.y - box.top - stageOffset.top) / scale
      } : null;
      const finish = (recenter) => {
        layout(recenter);
        if (anchor) viewport.scrollTo({
          left: stageOffset.left + anchor.x * scale - (clientPoint.x - box.left),
          top: stageOffset.top + anchor.y * scale - (clientPoint.y - box.top),
          behavior: "instant"
        });
      };
      const previous = zoom;
      if (view === "world") {
        if (direction === 0 || (direction < 0 && zoom <= 1)) { worldOverview = true; zoom = 1; finish(true); return; }
        if (worldOverview) { worldOverview = false; zoom = 1; finish(true); return; }
      }
      zoom = Math.max(1, Math.min(2.5, direction === 0 ? 1 : zoom * (factor ?? (direction > 0 ? 1.12 : 1 / 1.12))));
      if (zoom <= 1.001) zoom = 1;
      finish(zoom === 1 || previous === 1);
    }

    function endDrag() {
      if (!drag) return;
      const ended = drag;
      drag = null;
      viewport.dataset.dragging = "false";
      if (ended.moved) suppressClickUntil = performance.now() + 350;
      if (viewport.hasPointerCapture(ended.id)) viewport.releasePointerCapture(ended.id);
    }

    function show(next, islandId) {
      if (next === "region") next = "island"; // Compatibility-only internal view key.
      if (next !== "world" && next !== "island") return;
      if (modalOpen()) return;
      endDrag();
      if (islandId) selected = islands.find((island) => island.id === islandId) || islands[0];
      view = next;
      zoom = 1;
      worldOverview = false;
      root.hidden = false;
      root.inert = false;
      viewport.inert = false;
      camera.hidden = view !== "world";
      camera.inert = camera.hidden;
      document.body.dataset.mapView = view;
      render();
      if (typeof onViewChange === "function") onViewChange(view);
      viewport.focus({ preventScroll: true });
      const dev = document.body.dataset.previewMode === "dev";
      notice(dev
        ? view === "world" ? "World coordinate-map preview. Drag, scroll or use arrow keys to explore the finite fictional chart. Select a region at its X:Y coordinates to inspect its timber and specialist resource. Overview shows the whole chart." : selected.name + ", shared region with Timber and " + resources[selected.type].name + ". " + (overview ? "Pan the region overview to inspect all locations. " : "") + "Visual preview only; other players, production and settlement expansion are not implemented."
        : view === "world" ? "World map. Use the mouse wheel or trackpad to zoom; drag or use arrow keys to explore. Select a region at its X:Y coordinates to inspect its locations and resource sites. Overview shows the complete chart." : "Shared region: " + selected.name + ". Select a location or resource site. Drag or swipe to explore; use the mouse wheel or trackpad to zoom.");
    }

    function hide() {
      endDrag();
      root.hidden = true;
      root.inert = true;
      viewport.inert = true;
      camera.hidden = true;
      camera.inert = true;
      identity.hidden = true;
      position.hidden = true;
      view = "town";
      document.body.dataset.mapView = "town";
      if (typeof onViewChange === "function") onViewChange(view);
    }

    worldButton.addEventListener("click", () => show("world"));
    islandButton.addEventListener("click", () => show("island"));
    townButton.addEventListener("click", () => { endDrag(); if (typeof onTown === "function") onTown(); });
    plus.addEventListener("click", () => changeZoom(1));
    out.addEventListener("click", () => changeZoom(-1));
    fit.addEventListener("click", () => changeZoom(0));
    viewport.addEventListener("keydown", (event) => {
      suppressClickUntil = 0;
      if (root.hidden || modalOpen() || event.target !== viewport || event.ctrlKey || event.metaKey || event.altKey) return;
      if (["+", "=", "-"].includes(event.key)) { event.preventDefault(); changeZoom(event.key === "-" ? -1 : 1); }
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key) && canPan()) {
        event.preventDefault();
        viewport.scrollBy({ left: event.key === "ArrowLeft" ? -100 : event.key === "ArrowRight" ? 100 : 0, top: event.key === "ArrowUp" ? -100 : event.key === "ArrowDown" ? 100 : 0, behavior: "instant" });
      }
    });
    viewport.addEventListener("pointerdown", (event) => {
      suppressClickUntil = 0;
      if (root.hidden || !canPan() || modalOpen() || event.pointerType === "touch" || !event.isPrimary || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey) return;
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop, moved: false };
    });
    viewport.addEventListener("pointermove", (event) => {
      if (!drag || drag.id !== event.pointerId) return;
      if (!(event.buttons & 1) || modalOpen()) { endDrag(); return; }
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 5) return;
      if (!drag.moved) {
        drag.moved = true;
        viewport.dataset.dragging = "true";
        viewport.setPointerCapture(event.pointerId);
        viewport.focus({ preventScroll: true });
      }
      event.preventDefault();
      viewport.scrollTo({ left: drag.left - dx, top: drag.top - dy, behavior: "instant" });
    });
    for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) viewport.addEventListener(type, (event) => { if (drag?.id === event.pointerId) endDrag(); });
    viewport.addEventListener("click", (event) => {
      if (event.detail !== 0 && performance.now() < suppressClickUntil) { suppressClickUntil = 0; event.preventDefault(); event.stopImmediatePropagation(); }
    }, { capture: true });
    const guardAtlasClick = (event) => {
      if (root.hidden || modalOpen()) { event.preventDefault(); event.stopImmediatePropagation(); }
    };
    root.addEventListener("click", guardAtlasClick, { capture: true });
    camera.addEventListener("click", guardAtlasClick, { capture: true });
    viewport.addEventListener("dragstart", (event) => event.preventDefault());
    viewport.addEventListener("scroll", updateWorldPosition, { passive: true });
    viewport.addEventListener("focusin", (event) => {
      const target = event.target.closest?.(".atlas-world-island");
      if (!target || !target.matches(":focus-visible") || !canPan() || modalOpen()) return;
      const box = target.getBoundingClientRect();
      const viewBox = viewport.getBoundingClientRect(), cameraBox = camera.getBoundingClientRect();
      const bottom = cameraBox.top > viewBox.top + viewBox.height / 2 ? Math.min(viewBox.bottom, cameraBox.top - 12) : viewBox.bottom - 12;
      viewport.scrollBy({ left: box.x + box.width / 2 - (viewBox.left + viewport.clientWidth / 2), top: box.y + box.height / 2 - (viewBox.top + 12 + (bottom - viewBox.top - 12) / 2), behavior: "instant" });
    });
    viewport.addEventListener("wheel", (event) => {
      // Browser accessibility zoom and native trackpad pinch keep their own
      // Ctrl/Meta gesture. Ordinary vertical wheel motion zooms this map.
      if (event.ctrlKey || event.metaKey) return;
      if (document.body.dataset.sidebarOpen === "true") { event.preventDefault(); return; }
      if (root.hidden || modalOpen() || !event.deltaY || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      const pixels = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1);
      const factor = Math.exp(-Math.max(-100, Math.min(100, pixels)) * .002);
      changeZoom(pixels < 0 ? 1 : -1, { x: event.clientX, y: event.clientY }, factor);
    }, { passive: false });
    window.addEventListener("blur", endDrag);
    new ResizeObserver(() => { endDrag(); layout(true); }).observe(viewport);
    function setInteractionBlocked(blocked) {
      if (blocked) endDrag();
      root.inert = Boolean(blocked) || root.hidden;
      viewport.inert = Boolean(blocked) || root.hidden;
      camera.inert = Boolean(blocked) || camera.hidden;
    }
    return Object.freeze({ show, hide, syncTownAppearance, setInteractionBlocked, currentView: () => view, currentRegion: () => selected.id, currentRegionName: () => selected.name, currentIsland: () => selected.id, currentIslandName: () => selected.name });
  }

  window.AzmaraAtlas = Object.freeze({ create });
})();
