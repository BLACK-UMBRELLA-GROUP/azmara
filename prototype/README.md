---
id: DOC-AZM-0025
type: GUIDE
status: CURRENT
feature: CODE AND RUNNING
purpose: AZMARA town screen design preview
links: []
owner: AZMARA chat
---

# AZMARA town screen design preview

## Current local build — not published

DEC-107 removes the temporary Dev `View zoom (test)` slider and its alternate
map-scaling path. Dev and Gameplay now use only the ordinary 100% presentation.
The protected start frame, Land stage and Building dropdowns, Test supplies,
Reset plots, normal zoom/panning, art, saves, queues, plots and gameplay remain
unchanged. Private web32 below still contains the temporary slider until the
Owner explicitly approves a later publication.

## Current private delivery

Private web32 is live at [azmara.app](https://azmara.app/). It uses the eleven
locked land masters and a protected 100% start frame that keeps the Town Wall
gate and Town Hall clear of the floating controls. Dev → Dev workbench includes
the unsaved `View zoom (test)` slider from 50% to 100% in 5% steps; Gameplay
resets it to 100%. Normal Town, Region and World presentation remains
edge-to-edge on desktop and phone with no outer game border. See
[`WEB_PUBLICATION_32.md`](../docs/implemented/WEB_PUBLICATION_32.md).

## Historical Oasis pilot — superseded

DEC-072 tests the recommended Oasis Town ground direction on desktop/Staggered
at Hall 0/1 and 50 only. The original PNG buildings remain; mature quarters
share subdued paved public floors and closed fountains, while founding ground
stays bare with low-key stake clearings. No rills or moving actors were added.
Other levels/layouts and compact views use the previous renderer. Wall source/
art/controls are unchanged; Step 5 fixes and native updates remain paused.

This section records the earlier bounded Oasis art pilot. Its former Dev →
Appearance review surface no longer exists; DEC-102 replaced it with the
simplified Dev workbench. Current land-stage behaviour is documented in
[`LAND_STAGES_CURRENT_VERSION_V4.md`](../docs/approved/LAND_STAGES_CURRENT_VERSION_V4.md),
and the historical pilot remains in
[`OASIS_TOWN_PILOT.md`](../docs/ideas/OASIS_TOWN_PILOT.md).

## Previous published artwork

Private version 18 (`DEC-065`) replaces v17's enclosing repeated wall with
one original painted front fortification and a wide desert clearing backed by
distant mountains. Larger building footprints give the playable town more
screen space. The wall's own completed level retains eleven stable logical
milestones, selecting three field-art materials: timber, adobe/brick and
sandstone. It does not receive strength from the Hall. All 23 identities and
five layouts remain; wall-01 is its selectable control, recomposed at the front
with the dedicated transport reserves. Ideal review remains temporary and a
queued first build creates no finished wall. Fourteen focused interaction
checks plus four final terrain-only checks passed. Version 18 is published;
Founder visual acceptance remains outstanding. Desktop footprints are enlarged,
while compact footprints retain their earlier size to prevent overlapping targets.
Defence, tree clearing, economy and native changes remain excluded.
Two byte-exact original built-in ImageGen assets, their prompts, source paths,
hashes and native wall-row crop registration are in
[the v18 asset brief](assets/mountain-front-wall-v18-brief.md).

The preceding dimensional desert redesign (`DEC-063`) replaces v15's rejected
flat ribbon roads and vector decoration with narrow textured streets, original
shaded raster scenery, smoother bare town ground and a separate World relief
painting. This is pre-rendered isometric/2.5D presentation, not a true 3D engine.
Scenery stays cosmetic; five layouts, all 23 plot identities, original building
stages, saves, paid receipts and queued deadlines are retained. Exact built-in
ImageGen prompts and saved assets are in
[the v16 asset brief](assets/isometric-redesign-v16-brief.md). Historical test
passes below do not imply acceptance of the earlier artwork.

This draft explores the player-owned town screen under `DEC-012` and
`DEC-013`, with phone/browser iteration resumed under `DEC-028` and the full
starting-town visual authorised by `DEC-032`. It runs locally
without a domain, account, backend or installation of a game engine. Building
names, quantities, costs and local actions remain illustrative; the primary
resource labels follow the agreed AZMARA set.

## Open the private preview

[Open AZMARA](https://azmara.app/)
in a phone or desktop browser and sign in with the Founder's ChatGPT account.
Owner-private Site delivery is approved under `DEC-029`. The Mac does not
need to be running. No other viewers or public access are configured.

On the Mac, the [design review page](https://azmara-private-preview.blackumbreallagroup.chatgpt.site/preview.html)
switches the same interactive frame between Phone and Desktop layouts without
reloading the town. On a real phone, use the main link above for the full screen.

This is the responsive phone-browser version, not a native installed
iOS/Android app. Site sign-in protects access but is not a game account:
progress does not synchronise between browsers or devices, and the hosted
address has separate storage from localhost.

## Run locally

From the project root:

```sh
python3 -m http.server 4317 --bind 127.0.0.1 --directory prototype
```

Open `http://127.0.0.1:4317` in a browser. Binding to loopback keeps this draft
on the Mac; it does not make it available to other devices over Wi-Fi.

The local review switch is at `http://127.0.0.1:4317/preview.html`.
Do not widen the hosted Site's audience or expose the Mac through a public
tunnel without separate approval.

### One-command screenshot check

Get fresh, explicit permission from the Founder before running an automated
capture. Open visible Chrome manually. See
[DEC-084 in the project rules](../AGENTS.md#browser-and-screenshots).

From the project root:

```sh
./prototype/tools/capture-game.sh
```

This starts its own loopback-only server on an available port, launches an
isolated headless test browser, waits for fonts and actual image decoding,
saves a unique PNG and JSON receipt under `prototype/debug/`, then closes the
browser and server. It reuses installed Node/Playwright; it installs nothing.
No existing browser profile, saved town or hosted preview is changed. A failed
capture exits nonzero and records diagnostics rather than claiming success.

For a complete synthetic town at level 50 (not player progress):

```sh
./prototype/tools/capture-game.sh --level 50
```

Options include `--level 1..50`, `--layout grid` (or any existing layout),
`--width 390 --height 844`, and `--view region|world`. Use `--help` for all
options. Optional `AZMARA_NODE` and `AZMARA_PLAYWRIGHT` select existing local
runtime/module paths. Generated captures are ignored by Git.

Once the Founder has approved a capture run, capture the visual change, open
and inspect its PNG, and correct visual defects before reporting completion.
A successful command proves capture/readiness, not aesthetic quality or user acceptance.

### Local debug grid (G)

On the local server above, open `http://127.0.0.1:4317/?debug=1` and press G.
The planning grid starts off. G toggles it in Dev/Town only; typing in forms,
dialogs and shortcut modifiers do not activate it. Gameplay hides/resets it,
and hosted origins never load its module. The grid follows the actual camera
and labels world cells/plot anchors without snapping or moving anything.
Cells are 100×100 world units, origin upper-left, X right and Y down. This is
a diagnostic convention, not a tilemap engine or an approved wall layout.

The [capture permission](#one-command-screenshot-check) also applies to grid screenshots.

```sh
./prototype/tools/capture-game.sh --level 50 --debug
```

The capture command opens an explicit local debug session and presses G before
capturing. `AGENTS.md` records the coordinate, draw-order and screenshot rules.
**Gameplay collision is not implemented.** The overlay says so and draws no
red fake colliders. UI hit targets and decoration reserves are not collision
shapes; future red collision outlines must come from real gameplay physics.

Run the debug module's activation regression from the repository root with
Node.js and its built-in modules:

```sh
node prototype/tests/debug-activation.cjs
```

This browser-free check uses in-memory fixtures to cover rejected hosts,
explicit local opt-in, missing map elements, default-off initialization and
duplicate execution. It does not open a browser, read saves or modify images;
rendering and the app's script loader remain covered by the browser checks.

## Starting-town arrangement

### Current visual catalogue and atlas

Current DEC-057/058/061 navigation is **Town → Region → World**. Region is shared
geographic space for future independent towns, not a city, country or island.
The current draft uses original land-only continental desert-basin artwork
and a dry sandy town. Visible island/sea labels are replaced; stable internal
IDs are retained for save/API compatibility. Route Archive is the current
navigation-building label. No actual rivers, sea, boats or naval combat remain;
tiny decorative oasis pools/fountains are cosmetic only. Other towns and premium locations remain informational,
not working multiplayer, colonies or purchases. Original coastal art is retained
historically. Exact desert-generation prompts and selected paths are in
`assets/progression/terrain-brief.md`.

Town ground starts with an original bare desert painting. Registered original
code-native scenery adds increasingly maintained lanes, paving, palms, planted
courts and fountains around full live sprite footprints. These are cosmetic,
not functional roads or irrigation. Hall and each active type retain eleven
original raster appearance stages through level 50; DEC-062 maps them to stable
uneven per-type thresholds rather than a universal five-level cadence. All 23
town roles and the Region's 16 ordinary plus locked premium locations remain.

DEC-061 replaces active naval roles with Pack Caravans for smaller/faster
loads and Heavy Wagon Convoys for slower bulk carriage. Caravan Station keeps
`trading-port`/`harbour`, Freight Depot keeps `dockyard`/`freighter`, and Route
Archive keeps `sea-chart-archive` for compatibility. Workshop remains equipment
upgrades; no duplicate Siege Works is added. Shipyard is retired from new-build
choices/gallery, while its lookup and compatible saved buildings/queues remain.
There are 30 active types and 31 compatibility registry entries. No transport
capacity/speed values, military balance or route/economy simulation are implied.

In Dev mode, open Options (desktop) or the four-dot menu, then Building catalogue. Its 30
read-only design cards include Prayer Area (possible satisfaction benefit) and
Chronos’ Forge (secular construction efficiency). DEC-056 makes every included
role test-buildable in Dev through level 50, but no functional economic/military
effect or unlock model is implemented. Cards retain working purposes and a
level selector covering every integer 1–50. Each card identifies its actual
artwork threshold separately from the selected review level. Opening the gallery
never populates the saved town. Original
concept sheets stay in source for comparison; their built-in prompts are in
`assets/building-catalogue-v1-brief.md`. The expanded first-draft stage design
contract is in `assets/progression/building-designs.md`. Each non-Hall role uses
an original transparent raster stage atlas; tight, padded per-stage CSS regions
keep the artwork legible without cropping or resampling it. Original v1 sheets
are preserved. With the Founder's explicit approval, runtime v2 siblings remove
only exact low-alpha exterior/isolated matte noise; RGB, painted detail and all
other pixels remain unchanged. The script and invariant report are
`tools/clean-atlas-edges.py` and `assets/progression/edge-cleanup-report.json`.
Eleven standalone
Hall PNGs preserve the established illustrated style. The exact Academy prompt
and layout-repair chain is in `assets/progression/academy-brief.md`; other role
prompts/provenance are recorded with the expanded design brief. The historical
batch contains 341 visual milestones including the now-retired role; 330 belong
to the thirty active types. These are not 1,500 independent final paintings.

### Five persistent town layouts

Advisor provides Staggered, Grid, Circle, Avenues and Garden quarters in both
Dev and Gameplay (`DEC-060`). Their stable values are `staggered`, `grid`,
`circle`, `avenues` and `garden-quarters`. Only general-02–19 are movable;
Hall/general-01, wall-01 and all three dedicated transport sites retain their
layout-independent base anchors and role IDs. Responsive presentation can
resolve HUD collisions without changing those identities or adding slots.
The choice is optional v3 `plotLayout`, with Staggered for missing values.
Selecting a layout preserves buildings, levels, resources and paid project
receipts/deadlines. Reading an old valid save does not rewrite its raw bytes
simply to add the field, and separate legacy storage remains untouched.

### Dev and Gameplay modes

Desktop bottom-toolbar tools are Dev, Gameplay, Reset plots, Appearance, Preview, Help,
Options, plus a Dev test-supplies refill. All testing controls are Dev-only. The coloured
mode buttons show their active state; compact screens offer both in the town
menu. The owner-private workbench starts in Dev on every page load, without a
persisted mode setting. Dev keeps the gallery, preview guide, all-building
build/Update, Skip, direct test levels, test-plot clearing and confirmed reset.
Gameplay hides and rejects those tests and keeps player-facing
town information, map/adviser navigation, resources, camera and rename controls.
Switching closes an open dialog without changing its town save, legacy storage,
map view or camera. Existing valid queues continue normally. This is presentation
separation only—not a second simulation, sandbox, admin boundary or finished game.

Dev Appearance also offers an ideal-town level control from 1–50. It temporarily
shows compatible buildings across all 23 plots, without creating them in the
actual save. The catalogue can review all thirty active types at every level;
not all alternatives can coexist in one town. Exiting Appearance or switching
to Gameplay restores the actual buildings and scenery. Resources, actual levels,
save bytes and queued receipts/deadlines are unaffected by either review.
DEC-062 uses stable deterministic per-type thresholds, not a new random draw
on every Update. Hall level governs main-road quality; a building's local
approach uses `min(Hall level, building level)`. Full sprite footprints remain
protected from scenery. This is a first-draft visual interpretation, not a
final balancing decision or Founder acceptance of the resulting appearance.

Town, Region and World navigate the original preview maps. Regional locations
and resource sites open informational panels; Town returns to the same save.
The first terrain repeats across fictional regional examples. Resource types are
Timber with Clay, Silver, Grain or Iron; there are no mines producing resources,
connected players, attacks, shipments or colony construction.
DEC-051/057 retain 16 ordinary settlement positions in each Region (including
home in Qamar Basin) plus one locked premium preview, separate from the town's 23 plots.
The premium panel is informational, with no purchase, price or unlock action.
Original opaque desert terrain replaces the historical coastal painting.
Region and World fill the viewport with painted desert scenery (`DEC-058`).
World is a finite coordinate plane containing the same twelve fictional Regions,
with geographic markers positioned by their X:Y coordinates, not a card gallery.
Drag, scroll, touch and keyboard controls respect modal input gates. Peripheral
scenery is not extra playable land; short Overview can remain bounded/pannable
to protect distinct 44px targets.
Compact Region Overview allows finite panning so all 17 locations and both
resource sites remain distinct 44px targets. Desktop retains complete Region Fit;
the town's own Fit behaviour and fixed camera bounds are unchanged.

The desktop HUD exposes Pack caravans/Heavy convoys/population/action-point placeholders,
inventory/shop notes and Coins-first resources. Counters are not configured.
The left rail is removed; retained tools live in Options. Neutral unmarked
ground and dedicated wall/transport reserves replace flags. Prompts and asset
provenance are in `assets/town-atlas-art-v1-brief.md`. Native remains paused.
DEC-050 expands the ordinary desktop plot field around its central Hall and
narrows the town/HUD panel. DEC-054 now widens the full desktop panel to at most
700px while keeping a 176px name section, using horizontal navigation and
roomier actions/resources. The adviser strip is 344px wide at the same height.
On shorter desktop screens, ordinary sites can project beneath the HUD while
keeping the Hall central and protecting full marker footprints. The wall-only
plot receives measured clearance when needed; its layout-independent base
anchor remains unchanged. These are responsive presentation offsets, separate
from the explicitly persisted choice among the five ordinary-plot layouts.
Dedicated transport anchors remain layout-independent; no larger town or new
building capacity is introduced.
Clicked plots have no rectangular focus box;
keyboard selection uses a warm silhouette glow and visible name. Zoom +/− stays.
DEC-055 replaced the grey wall reserve with ordinary-looking plain earth.
DEC-056 then allowed a staged wall sample on wall-01. DEC-064 expanded that
sample to the enclosing v17 perimeter; DEC-065 now replaces its visible ring
with a single painted front wall and rear mountain backdrop. The wall-only role,
all plot IDs and stable level milestones remain. The field has three painted
wall material groups; the read-only catalogue retains the original staged
building artwork. Route clearing and defence remain deferred; scenery is cosmetic.

The town is the main screen, with 23 selectable plots:

- 19 general plots, including the occupied Town Hall at level 1;
- one empty wall-only plot;
- two empty Caravan Station plots (legacy `harbour` role);
- one empty Freight Depot plot (legacy `freighter` role).

That is one occupied plot and 22 empty plots, not 23 empty plots plus a Hall.
The terrain contains no other built-up town. Empty-plot panels explain their
allowed roles, with eligible Dev test-build choices. The gallery itself remains
read-only. General 01 stays exclusive to Hall; other ordinary buildings use
the other 18 general sites. Harbour/freighter/wall restrictions stay intact.
All 30 active types cannot coexist within 23 plots: clear an eligible test plot to
review alternatives. Dev duplicates are allowed, not a final uniqueness rule.
The Buildings list also provides access to every plot.

Historical art iterations under `DEC-033` and `DEC-034` used bare-earth clearings
with wooden stakes and blue flags, not numbered circular board tokens. Original
uneven plot clusters follow the riverbank around a more prominent Town Hall.
Terrain, vacant sites and Hall use a coordinated painted isometric/2.5D style,
with rocky banks, vegetation and water, plus soft native worn-earth paths.
Under `DEC-037`, the active v3 artwork adds fresher olive/emerald vegetation,
richer blue water, ivory and terracotta Hall materials with teal awnings,
and clearer cobalt blue-flag clearings. DEC-046 now supersedes those flags with
original neutral ground and plus marks; DEC-050 then removes those plus overlays
and expands desktop spacing. Stable IDs and compact anchors remain unchanged;
historical artwork remains in source for comparison. This is the
historical starting-town art pass. DEC-053 now adds original Hall/terrain
appearance stages at completed levels 1, 5, 10, 15 and 20. Level 1 is a rough wooden
shack on bare earth. The original Hall/terrain bytes serve as level 10.
DEC-056 extends building/field review to 50 with milestones 1/5/10/.../50.
Paving and planting improve later, without adding functional buildings.
Exact prompts and source/output provenance are recorded in
`assets/progression/hall-brief.md` and `assets/progression/terrain-brief.md`.
This is a static illustrated scene, not a true 3D engine. Under `DEC-035`, the
camera stays around the illustrated settlement; the unused procedural outer
world is removed. Painted scenery covers fixed margins needed for differing
screen proportions, without adding camera travel into those margins.

Under `DEC-036`, the narrow/short illustrated map fills the app viewport. A compact town
name sits at the top left, with a four-dot actions button at the top right.
Open it for resources, rename, advisers, Buildings, Overview and all camera
tools. The menu closes when an action is chosen, returning the space to the
map. Escape, its close button or the backdrop dismisses it. Details use a
separate responsive modal panel; focus returns to the visible menu trigger.
The wall plot is now on the inland perimeter at core `(440, 25)`. General
plot 09 leaves the crowded harbour area and reuses the former wall site at
`(1250, 140)`. IDs and the 19/1/2/1 role counts are unchanged.

Under `DEC-043`, desktop widths ≥1024px with height ≥600px use a separate
wide original wooded coastal composition, parchment resource/navigation block,
four original advisor portraits, narrow side shortcuts and bottom compass.
The same 23 plot IDs are projected into the clearing without changing saves.
Fit includes the full layout; Close/zoom is bounded to the settlement.
DEC-047 now replaces the World/Island notes with navigable original visual
previews. They do not implement colonisation, production or other players. Native
phone development is paused; the installed Flutter build remains unchanged.

`DEC-045` replaces only the desktop backdrop with original terrain v2 and
explicitly spaces desktop anchors across a wider/deeper clearing. General
plots 05, 08, 12, 16 and 19 are inland; the wall is isolated; two harbour
reserves occupy separate coves and the freighter its own headland. The general
plot anchor bounding area is about 30% larger, without adding plots or
changing gameplay capacity. The finite desktop settlement frame is now
`(650,600)` with size `3150×1630`. Fit keeps all 23 sites exposed, including
ultrawide layouts; Close and fine zoom retain bounded exploration.
Compact anchors, native assets and all saved-state contracts are unchanged.
Original art inputs, both generation prompts and provenance are recorded in
`assets/desktop-art-v2-brief.md`; v1 stays in canonical source.

Built-in ImageGen produced the new desktop terrain and advisor strip; prompts,
original input and provenance are in `assets/desktop-art-v1-brief.md`. Earlier
art stays in source. There are no copied reference portraits or map textures.

Select an occupied building to inspect its local Update test or set an exact
test level. Select an empty plot to choose one of its eligible designs in Dev.
Nothing sends commands to
Ikariam or to a live AZMARA server. Local demo progress is not a real account.

The Advisor, Forces, Knowledge and Diplomacy advisers open local panels. Forces,
Knowledge and Diplomacy are explicitly future design areas, not implemented
systems. Rename the town from the four-dot menu. In Dev, Reset plots asks before
clearing all 23 plots including Hall, restoring test stocks and preserving the
name/legacy save. Rebuild Hall 1 on its original central plot; other eligible
roles can now be built under DEC-056. Update replaces Preview upgrade and starts a two-minute
illustrative project. It saves only in this browser, with the exact paid cost.
The first 60 seconds permit full-refund cancellation; from 60 seconds onward only
30% returns, rounded down per whole resource, with confirmation. Due projects
complete before cancellation. Existing valid ten-second queues retain their
original deadlines. Dev Skip finishes the current project instantly once,
without refund or a second charge. Direct levels 1–50 bypass costs/timers for
testing, blocked while a project is pending. Refill test supplies restores room
for further tests (retaining refund room for an active receipt). Clear this test
plot confirms removal of a non-Hall sample, without a refund. These are developer
shortcuts, not production rules. Appearance and the read-only catalogue review
30 active types at every level 1–50. Eleven original stages are now mapped to
stable uneven per-type thresholds (`DEC-062`), superseding the former universal
1/5/10/.../50 cadence. Ideal-town review fills compatible visual samples on all
23 sites without saving them. All review restores actual progress on exit or Gameplay.

Coins, Timber and Clay have illustrative quantities for the construction
demo. Silver, Grain and Iron are labelled but not simulated. This layout uses
`azmara-town-layout-v3`, version 3, layout ID `town-23-v1`. Its internal `stone`
field is displayed as Clay. When no new-layout state exists, only a valid town
name may carry across from the old `azmara-town-design-v1` state. Old resources,
building levels and queues are not imported. The old key is never rewritten,
including on reset. A valid new-layout Hall upgrade persists on reload; level 1
is the normal fresh starting state, not a forced reset on every visit. Explicit
Dev reset adds `hallPlaced:false` with Hall level 1 retained only as its build
price seed; omitted/true means occupied, preserving earlier v3 saves.
DEC-056 adds an optional `buildings` map of plot IDs to `{typeId,level}` for
non-Hall samples and optional queue `typeId`. Levels validate through 50;
plot-role/receipt/target validation rejects forged data. Untouched old saves
are not rewritten merely to add these fields. The Hall keeps its existing
`hallLevel`/`hallPlaced` representation. Semantic no-op reads preserve raw
saved bytes, including key order/formatting. Dev bypasses are not an access
security boundary or permission to introduce a server economy.
DEC-060 adds optional `plotLayout` only when a layout is explicitly selected;
absent fields use Staggered and old raw saves remain unchanged on read.
Retired shipyard samples and queues stay valid under DEC-061, while new choices
exclude that type. The transport IDs keep their dedicated roles with land-only
visible names, without a storage migration or lost receipt.
No worker, Grain
consumption, satisfaction or population simulation is present. Phone and
desktop progress stay separate in each browser; there is no shared account.

The map begins at Fit, framing the complete 23-plot town core. Open the menu
and tap Close for a
closer view centred on Town Hall; the same control changes to Fit to restore the
full town. This mode adapts to phone/desktop resizing without changing saved
progress. Fit is a stable overview: swiping or arrow keys cannot move the town
out of frame. Close and + enlarge buildings and enable bounded mouse dragging,
native swiping or scrolling around the settlement. Under `DEC-044`, desktop
zoom now changes by 10% with a 180ms eased transition under DEC-046; rapid
clicks retarget smoothly.
Reduced-motion preferences skip animation. Desktop Close is 1.5× Fit, rather
than the previous much larger jump. Dragging beyond five pixels moves the map
without opening a plot on release; normal clicks still select plots.
+/− changes camera zoom; zooming all the
way out returns to Fit. The compact explorable frame is 1720 × 1640 world pixels around
the unchanged 1400 × 1320 core. If one axis is smaller than the viewport it gets
fixed, painted padding, not an additional scroll range. The centre button
recentres at the current zoom. Arrow keys move the focused, zoomed-in map, and +/− keys
zoom while the map itself is focused; browser zoom shortcuts are not overridden.
Camera settings are temporary and do not modify or reset saved town progress.
Desktop intermediate zoom adds small pan margins inside the original 4200×2400
painting while enclosing the complete 3150×1630 settlement frame. This enables
dragging even when the town itself still fits on screen, with no extra off-art
terrain. Native bundled files are unchanged.
The Phone/Desktop review frame retains its camera and adapts on resize.
Labels appear on hover or keyboard focus by default, leaving the scene clear.
The label control can pin them on; that explicit choice remains in effect when
zooming. Each target covers its actual sprite with a minimum size of 44 pixels
and a full accessible name. Opening the menu does not change map framing or
saved progress. Closing it leaves only the compact title and four-dot trigger
over the playfield. Current exposure is measured separately from historical
versions below; extremely small viewports still need practical device review.

## Verification

Get fresh, explicit permission from the Founder before running any automated
or headless browser suite described here. See
[DEC-084](../AGENTS.md#browser-and-screenshots).

`tests/construction.cjs` verifies reset/build recovery, exact 60-second refund
boundaries, completion priority, persisted receipts, legacy ten-second queues
and Gameplay mutation guards. `tests/progression.cjs` checks Hall/terrain artwork,
transient review, source pixels, alpha/decode and save preservation. These use
isolated Chromium and controlled clocks, not the Founder's live save.

`tests/all-buildings.cjs` exercises every included type through eligible Dev
build/Skip/Update/exact-level50, role restrictions, refunds, refill/clear guards,
malformed and old saves, stale controls and mixed full-town selection geometry.
Expanded rendered-art checks independently inspect atlas crop pixels, source
alpha/decode, eleven stage identities and transient gallery/appearance state.
Native connected-component ownership checks preserve whole painted bodies and
meaningful props with no neighbouring sprite pixels; transparent padding need
not stay inside an ideal grid cell. Screenshot proof retains interior material
points and adds source-defined opaque colour extremes for sandy backgrounds.
Stable-view measurements wait for transient notifications to clear normally,
without suppressing notifications or changing the application.
The status document separates preliminary checks from final verified delivery.

`tests/hud-markers.cjs` independently verifies responsive HUD clearance at
1024×600/768, 1280×720, 1366×600, 1500×600, 1440×900, 1864×977 and 2560×900.
It checks every full 44px selection core and opaque ground pixels, not just
transparent button centres. `tests/desktop-projection.cjs` derives the north
and wall offsets from registered Fit/HUD geometry; its ≤0.55-screen-pixel
oracle tolerance accounts for integer browser scroll rounding only. Actual
target exposure and screenshot-material assertions are not relaxed.

`tests/smoke.cjs` checks layouts and controls across 14 viewport sizes,
including 1440 × 900, 390 × 844, 320 × 720, 844 × 390, 390 × 1066 and
2560 × 900, plus the 23-plot starting state,
Town Hall persistence, safe names, reset, legacy-data preservation and malformed
or blocked storage. Run it with an installed
Node and Playwright runtime while the local server is running:

```sh
node prototype/tests/smoke.cjs /absolute/path/to/playwright
```

The additional camera suite in `tests/map-controls.cjs` uses the same runtime
and optional server URL arguments. It also covers 375 × 600, 390 × 640,
320 × 568 and 601 × 390, zoom bounds, Fit, marker targeting, manual labels,
two-axis movement, resize, actual plot exposure and new-layout persistence:

```sh
node prototype/tests/map-controls.cjs /absolute/path/to/playwright
```

This verification uses isolated headless Chromium contexts, not the Founder's
saved preview state. It is not an iPhone, Android or Safari certification.
The camera suite retains all 14 viewports by default; set
`AZMARA_QA_VIEWPORTS=representative` to run four representative viewport groups
and all eight other functional groups. Any other selector fails before launch.

`tests/camera-input.cjs` adds normal-motion/reduced-motion checks, fine and rapid
zoom retargeting, full-range finite bounds, mouse dragging at three desktop
sizes, drag/click separation, pointer cancellation, modal interruption, resize,
native browser zoom and untouched saved queues/legacy bytes. Use the same Node,
Playwright and base-URL arguments as the suites above. `desktop-overview.cjs`
checks the wide HUD, all plot targets and compact fallback separately.

`tests/plot-layout.cjs` checks the broader anchor area, separation, inland
footprints, all 23 real selections, full Fit exposure across six desktop
sizes, compact anchor preservation and exact saved queue/legacy bytes. It
uses the same runtime/base-URL arguments. Geometry checks complement visual
review of the painted shoreline; they are not a geographic water mask.

`tests/plot-spacing.cjs` checks the DEC-050/051 town revision in both modes:
23 exposed targets, visible unmarked reserve pixels, actual panel selection,
central Hall, safe smaller name panel and warm keyboard focus without a box.
It also preserves an exact queued save and legacy bytes in isolated contexts.
`tests/atlas.cjs` covers the current desert Region's 16+1 locations, four resource
types, navigation, actual opaque terrain/source-material proof, compact bounded
Overview reachability, premium-only notes and the home icon following completed
Hall levels rather than transient Appearance review. Desktop Region/World title
badges retain at least 10px clearance below the wider HUD.

Earlier versions: the review switch was separately checked for a 390 × 844 phone frame and
responsive desktop frame; switching retains the same frame, name and runtime
state. Final local tests passed after the resource and phone guidance update.
The same eight regression groups passed against hosted version 1 with
platform service access. Anonymous root requests returned HTTP 401 instead
of the town HTML. This does not prove the Founder's real-phone sign-in or
Safari compatibility; that remains the next hands-on check.

After the camera update, eight smoke groups and twelve camera groups passed
locally and against hosted version 2 across ten layouts. Phone Fit marker taps,
short-view control spacing, v1 construction compatibility and the same titled
review iframe were checked. Hosted QA uses platform service access, limited to
the Site origin and never stored in application code. Owner-only access remains
unchanged; anonymous root access returned HTTP 401. These checks still do not
establish a real-phone sign-in session or Safari compatibility.

Starting-layout version 3: 36 smoke groups and 16 camera groups passed
locally against unchanged final source. Checks cover twelve standard layouts,
plus a separate 390 × 1066 layout with a reachable 56% camera step. All 23 plot
centres are directly tappable at Fit on the checked portraits and tablets,
including 320 × 568, 768 × 900 and 1024 × 768. At 844 × 390, 22 centres are
exposed; at 601 × 390, 15 are exposed. Buildings still reaches all 23. The
remaining cases check painted terrain coverage at every reachable zoom and pan
extreme, 44-pixel non-overlapping targets, orientation, keyboard controls,
simulated two-axis gestures, native page pinch and the same titled review iframe.

Private Site version 3 was deployed from the exact checked source. No additional
viewer or public access was configured. Hosted verification is recorded in the
project implementation status. These are Chromium emulations, not real-device
or Safari certification.

Earlier art refinement (`DEC-033`): the same 36 smoke and 16 camera groups
passed locally after replacing board tokens with sprites. Checks additionally
decode all 22 flag images and the Hall, verify the backdrop's fixed world bounds,
map actual blue pixels into screenshot coordinates and tap them, and verify
hover/focus and pinned labels. Existing valid v3 state is preserved exactly.
Private Site version 4 was deployed; hosted verification is recorded separately
in the implementation status. Normal Fit and close views show the detailed
artwork; distant outer terrain is continuous but less detailed.

Settlement composition (`DEC-034`): 38 smoke and 18 camera groups passed
locally against the final source after a screenshot-based path correction.
Checks cover all three new image assets, irregular anchors, the larger Hall,
dedicated roles, all actual drawn flags, and the temporary Close/Fit mode at
390 × 844 and 1440 × 900 while preserving valid v3 progress byte-for-byte.
All 12 tested layouts keep non-overlapping targets of at least 44 pixels.
Checked portrait/tablet Fit views expose all 23 centres and 22 flags.
Short landscape exposes 21/23 centres and 21/22 flags at 844 × 390,
and 16/23 centres and 15/22 flags at 601 × 390; Buildings and panning still
reach every plot. No captured browser, console or request errors were found.
These remain simulated Chromium checks, not physical-device or Safari proof.

Private Site version 5 was deployed from that final source, with the existing
owner-only audience unchanged. The same 38 smoke and 18 camera groups passed
against the hosted version; anonymous root access returned HTTP 401 with no
town HTML. Full verification is recorded in the implementation status.

The later camera correction (`DEC-035`) is deployed as private Site version 6.
All 40 smoke and 22 camera groups passed locally against its final source,
including 390 × 1066 and 2560 × 900. Native-size visible-viewport raster checks
cover every reachable zoom and finite pan edge, not a downsampled surrogate.
Fit remains fixed under scrolling, gestures, arrows and focus changes; Close
enlarges the Hall and preserves active queues and v3 state. In 12 portrait,
tablet and desktop sizes, all 23 centres and 22 actual flags are exposed at Fit.
At 844 × 390, 19 centres and 20 flags are exposed; at 601 × 390, 16 centres and
15 flags are exposed. Buildings and zoomed exploration provide the remaining
entries on cramped landscape screens. Native browser pinch remains enabled.
Hosted version 6 passed all 40 smoke groups and 12 camera groups: four
representative viewport groups with all eight other camera regressions retained.
Anonymous access returned HTTP 401 without town HTML. Detailed verification
is recorded separately in the implementation status.
That historical version used Fit for the complete layout,
then Close/+ to inspect buildings. These are simulated Chromium checks, not a
physical iPhone or Safari certification. Fixed extreme-ratio margins use
reflected scenery, which can look symmetrical or invert edge vegetation; they
are not additional playable land.

The inland-wall and four-dot-menu refinement (`DEC-036`) is deployed as private
Site version 7. Local verification covers 42 smoke groups and 22 camera
functional groups, with camera coverage split into 18 + 4 passes after a
test-only iframe-coordinate correction. All 14 tested Fit sizes expose every
plot centre and every blue flag, with non-overlapping targets of at least
44 pixels. Hosted verification passed all 42 smoke groups plus 12 camera
groups (four representative viewport groups and the eight other regressions),
including both final zero-captured-error gates. Anonymous root access returned
HTTP 401 without town HTML; owner-only access is unchanged. Detailed evidence
and remaining physical-device/Safari limitations are recorded in the project
implementation status.

The richer palette pass (`DEC-037`) is private Site version 8. Local and hosted
checks each passed 42 smoke plus 12 representative camera groups, with final
zero-captured-error gates. Four camera viewports expose every centre and blue
flag; all eight remaining camera regressions are retained. The full default
14-viewport camera matrix was not rerun for this artwork-only pass. PNG alpha,
3:2 sprites, registration and canonical app-produced saved bytes pass. Screenshots
were reviewed at phone/desktop Fit, Close and menu. Real devices/Safari and
Founder aesthetic acceptance remain separate. See implementation status.

## Assets

Current land-only source uses `assets/azmara-region-terrain-v2.png` and bare
`assets/progression/azmara-desert-desktop-level-1-v2.png` /
`azmara-desert-compact-level-1-v2.png`, with registered code-native development
scenery rather than baked roads crossing live plots. Caravan Station and
Freight Depot use versioned `azmara-trading-port-stages-land-v3.png` and
`azmara-dockyard-stages-land-v3.png` atlases. Historical filename levels for
the eleven original paintings identify source stages; DEC-062's current review
thresholds are per-type metadata, not inferred from those filenames.
Current provenance and verification are recorded separately in asset briefs
and `docs/implemented/STATUS.md`; the existence of art does not prove Founder
acceptance or native delivery.

The following retains the earlier DEC-037 asset receipt. Its then-active assets were
`assets/azmara-town-hall-v3.png`,
`assets/azmara-starting-terrain-v3.png` and `assets/azmara-empty-plot-v3.png`.
The richer colour pass is recorded under `DEC-037` in
`assets/palette-refinement-art-brief.txt`; previous v2 assets remain historical.
These are three original built-in image-generation outputs, copied without
post-generation pixel editing. The Hall and clearing have verified transparent
backgrounds; the terrain is opaque. The earlier v2 composition prompts and
provenance are recorded in `assets/settlement-composition-art-brief.txt`.
The square backdrop is placed
at world `(1600, 960)` with size 2800 × 2800, preserving aspect ratio. The
Hall's nominal footprint is 320 world pixels wide versus 220 for a vacant site.
Plot render anchors changed under `DEC-034`; the town core, IDs, roles and
storage format remain unchanged. SVG supplies soft, static paths; these are
scenery, not functional infrastructure. The same existing terrain image also
backs fixed screen-ratio margins through reflected SVG copies at the same
world scale; no pixel edits or new assets were required
for the camera correction.

The earlier v1 Hall, terrain and vacant-site assets and their prompt briefs
remain historical originals, not the active starting-town scene.

The earlier `assets/azmara-town-v1.png` and `assets/town-art-brief.txt` remain
historical concept references, not the active starting-town scene. The artwork
depicts a fictional civilisation inspired by the golden age of Abbasid Baghdad, not an
authenticated historical reconstruction.

No third-party game artwork, code, character portraits, icons or datasets are
included. Generated concept art and UI styling still need Founder review.

## Limits

- This is a visual and interaction prototype, not the production game.
- No live resource simulation, multiplayer, game authentication, server persistence,
  anti-cheat or store integration exists.
- The separate iPhone prototype has a signed `0.1.0+3` package containing this
  runtime. It is not yet installed because the paired phone was unavailable;
  any later installation must be in place and retain the native save.
- Sample resource values, costs and timing do not establish game balance.
- Desktop and responsive browser checks do not establish real-device support.
- Site access is owner-private. Only the sanitised browser delivery copy and
  hosting manifest were pushed to its dedicated Sites source repository; the
  full project and its documentation were not published.
