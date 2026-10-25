---
id: DOC-AZM-0038
type: SPEC
status: DRAFT
feature: IDEAS AND PROPOSALS
purpose: Town wall — approved Step 4 proposal; Step 5 draft unfinished
links: []
owner: AZMARA chat
---

# Town wall — approved Step 4 proposal; Step 5 draft unfinished

11 October 2026. Step 4 approved for build under DEC-069. DEC-070 permits
publication of the current unfinished draft, not visual acceptance.
Historical Step 4 scope: the Founder approved Step 3 and authorised:
illustrated-town route/depth/art proposal and screenshot markups only. No tiles,
collision, walking-player sorting, text map, game code changes or final art.
That proposal-only gate was subsequently approved under DEC-069. Coordinates
and art choices below are the approved build brief, not functional defence
rules or changes to saved towns.

## Two audit answers

1. Local grid debug requires literal hostname `localhost`, `127.0.0.1` or
   `[::1]` and query `debug=1`; G shows it only with the Town viewport visible
   and `body.dataset.previewMode === "dev"`, outside dialogs/editable controls.
   Dev and Town themselves are **not** gated: the published private v18 copy
   defaults to them. The currently paused native v0.1.0+2 contains neither
   feature, but a future localhost wrapper carrying this debug module could
   satisfy its hostname/query test. Thus this is not a release-build guarantee.
2. The game source is `prototype/` in the canonical Developer project. The
   Flutter shell is in `mobile/`; its generated `mobile/assets/game/` copy is
   bundled into the native build and must not be edited separately. Native is
   older and paused. Its legacy sync manifest is not sufficient to package the
   current multi-script web game; do not run sync/build as part of this proposal.

Audit pointers: `prototype/app.js:123–125,454,777–792,1719–1724`,
`prototype/debug-overlay.js`, `sites/azmara-private-preview/dist/app.js:125,454`,
`mobile/README.md:13–15`, `mobile/tool/sync_game.dart`,
`mobile/lib/main.dart:122`, `mobile/lib/save_contract.dart:86–100`.
The current native generated/built app scripts match at SHA-256
`668c81fc7b9a40bf7962f22936dc1d982d7ae391c576d98aeb4b9a932848dab5`.

Before any future release/sync, a separate approved safety change should omit
developer modules/tools from release/native bundles and default release to
Gameplay. An explicit development-build target is safer than assuming localhost
means a debug browser. This Step 4 makes no such code change.

## Role and progression

Keep one saved City/Town Wall building on `wall-01`, levels 1–50. The continuous
wall is its field presentation, not a collection of extra owned buildings.
Only its own completed level changes its appearance; Hall upgrades and queued
targets do not strengthen it. With no completed wall, show the reserved control,
not completed fortifications. Dev artwork/Ideal review remains transient.

Current field art has three material families: timber 1–10, adobe/brick 11–32,
stone 33–50. Its existing deterministic milestones are
`1,6,11,15,20,24,30,33,40,44,50`; intermediate integer levels need not have
independent art. Preserve these rules for the first corrected route. Further
structural detailing at each existing milestone can follow after the base wall
composition is accepted, rather than commissioning fifty unrelated images.
It is visually cosmetic today: no defensive stats, combat or transport blocking
is implemented or proposed by this visual step.

## Route — fixed per presentation profile

Use an open-rear U: rear mountains form the visual backdrop; short rear/side
returns end in two new rock/earth abutments below that band. The foreground
curtain wraps the front and joins both side returns. Do **not** add a giant wall across the mountain
range. This follows the mountain-backed direction, not the rejected complete
rectangular ring. It does not claim the mountains form a gameplay barrier.

All numbers below are logical world units, in the exact coordinate plane used
by the Step 3 grid/landscape SVG, not PNG-source pixels. X right, Y down. The
desktop and compact engine already use different town arrangements, so they
need two registered routes, not one screenshot-sized image stretched to both.
Route points run from the west terrain-abutment anchor around the front to the
east terrain-abutment anchor.
Connect with gentle, authored bends; these are ground-baseline control points,
not tall wall silhouettes, game tiles or collision vertices.

| Point / purpose | Desktop world (x,y) | Phone world (x,y) |
|---|---:|---:|
| P0 west terrain-abutment anchor | (850,340) | (2320,1250) |
| P1 west rear tower | (520,760) | (2140,1770) |
| P2 west return bend | (470,1300) | (2120,2350) |
| P3 west back/front split | (520,1900) | (2120,2790) |
| P4 southwest front tower | (740,2380) | (2280,3340) |
| P5 left front bend | (1430,2460) | (2670,3390) |
| P6 gate centre | (2100,2490) | (3150,3420) |
| P7 right front bend | (2780,2460) | (3570,3390) |
| P8 southeast front tower | (3510,2380) | (3780,3340) |
| P9 east front/back split | (3720,1900) | (3920,2790) |
| P10 east return bend | (3760,1300) | (3920,2350) |
| P11 east rear tower | (3680,760) | (3900,1770) |
| P12 east terrain-abutment anchor | (3440,340) | (3610,1250) |

Back PNG: P0→P3 and P9→P12. Front PNG: P3→P9. Avoid seams at P3/P9 with
registered overlapping return faces and shadows belonging to only one layer.
Small authored rock/earth abutments at P0/P12 blend the ends into the ground
below the rear mountain band. Those exact anchors are currently open ground,
not existing rock faces: the back-layer art needs these two terrain caps. The
mountains remain a visual backdrop, not a claimed physically continuous seal.
No mountain redraw, outer terrain enclosure or tree-clearing system is needed.

The route reserves room for the measured full site envelopes across all five
layout choices, without changing plot IDs or saved layout selections:

| Current all-built-50 target envelope | X range | Y range |
|---|---:|---:|
| Desktop, five-layout union | 608–3611 | 313–2130 |
| Phone, five-layout union | 2190–3850 | 1755–3110 |

These are measurements of current layouts, not proof of future PNG clearance.
New Fit framing can affect the existing HUD-clearance projection, so Step 5
must remeasure all five layouts after rendering rather than rely on this union
as permanent. Registered alpha/shadow/label envelopes must stay outside sites.

## Gate and towers

Gate centre is P6; flanking tower centres are `(P6.x−120,P6.y)` and
`(P6.x+120,P6.y)`. Four other towers sit at P1, P4, P8 and P11: six total,
with variation in roof/cap/wear rather than duplicated decorative tower rows.

Proposed strongest-stage budgets (same logical units in either profile):
curtain ground thickness about 35, illustrated face height up to 140;
tower base about 100×70, illustrated height up to 200; complete gate assembly
about 340 wide with a 140-wide opening and illustrated height up to 200.
These are appearance/clearance budgets, not military or caravan capacity.
Timber uses lower rough curtains and modest lookout posts; adobe is intermediate.
Ground anchors stay fixed as the wall strengthens.

No main-road entrance exists today. Propose these **new cosmetic approach
connections**, from the gate to the district avenue, not a functional route:

- Desktop: `(2100,2490) → (2100,2320) → (2100,2145)`.
- Phone: `(3150,3420) → (3150,3200) → (3210,3090) → (3210,3000)`.

Keep the approach's painted width at or below 35 world units. Conservative
straight-segment/curtain/tower budget checks clear current full target rectangles
in all ten desktop/phone layout samples, including at a 60-unit approach width.
This is not final curved-art/shadow/label proof.

The phone approach goes between Caravan Station 2 (right edge ≈3100) and the
Freight Depot (left edge ≈3445) in the Staggered sample. Road-end/art alignment
must be checked against the chosen layout during Step 5; do not paint through
a building or pretend the current road already passes through the new gate.

## Depth: current facts and proposed change

Current SVG paint order is terrain → roads → scenery → whole front-wall PNG →
contact pads; compact also paints dirt paths after the wall. DOM plot buttons
are above that SVG in `.map-hotspots` at z-index 1. Stable DOM order is Hall,
general-02–19, wall, Caravan 1, Caravan 2, Freight Depot. Normal plot buttons
have z-index auto; hover/focus raises them to 2. There is no ground-Y sorting.
Thus the current “front” wall is actually behind every building.

Propose keeping back/return art in the landscape SVG, below plot paint, and
placing a pointer-transparent front-wall layer inside `.map-hotspots` at z-index
3, above normal and hovered plot paint. Keep wall-01's real gate control and
its label at 4, with existing screen HUD/title/dialog layers above the map.
Do not enlarge invisible hit areas or make wall artwork intercept plot input.
Keeping the front inside the hotspot stacking context avoids a hovered building
incorrectly popping in front of it.

No non-wall building is intended to be covered. The current registered wall
rectangle also covers no full non-wall targets. The nearest Staggered cases
are Forester’s House general-17, Silver Refinery general-18, Museum general-07
and Freight Depot on desktop; Freight Depot and both Caravan Stations on phone.
Their current complete bounds, not just visual centres, informed the clearance.
Labels cannot escape a parent stacking context by raising only their own
z-index: keep foreground art clear of non-wall labels too, and verify pinned
and hover labels. If overlap is later deliberately introduced, a separate
above-wall label/UI layer needs explicit design; it is not silently assumed.

## Art choices

| Choice | Advantage | Cost/risk | Recommendation |
|---|---|---|---|
| A. Authored PNG, split back/front | Cohesive perspective, continuous material/shadow, no obvious repeated modules | Fixed route; separate desktop/compact registration; more artwork if every level were unique | **Choose A per current appearance band, not fifty integer levels.** |
| B. Modular PNG curtain/tower/gate | Flexible for arbitrary future routes | Proper direction/corner variants and perfect ground seams needed; repetition/rotation can look pasted | Useful if routes become editable later, not the first correction. |
| C. SVG path/pattern | Fast and adaptable | Flat appearance and lighting/material mismatch with shaded PNG buildings | Planning markup only; not finished wall art. |

Missing art: the current three-row PNG has one front elevation only, no back
returns, terrain tie-ins or depth-separated layers. The older building atlas
contains local gate samples, not ready-to-assemble perimeter art. Neither is a
complete source for this proposal.

For A, commission original AZMARA transparent PNG back/front pairs for timber,
adobe/brick and sandstone, in the two registered profiles: twelve layer images
(or four registered three-band sheets). Start by validating one stone pair per
profile before producing the other materials. Use the existing original Hall,
nearby buildings and terrain as style references in the same built-in image
pipeline; no Ikariam pixels, downloaded art, new rendering engine or art plugin.
Match the elevated oblique/isometric building angle, warm upper-left light,
lower-right soft contact shadows, ivory/sandstone/terracotta/dark timber palette
and restrained teal details. Tower door/storey scale should match ordinary
320-world-unit desktop / 220-unit compact buildings, not the large Hall alone.
Render the correct perspective into each pair; use uniform scale and registered
ground anchors, never skew/rotate vertical faces or independently stretch X/Y
to force a fit. Choose source resolution for maximum supported zoom, not Fit
alone. Enforce clean alpha and shared baseline/shadow ownership at joins.

## Screens and phone framing limitation

Original checked captures (canonical `prototype/debug/`, ignored generated
evidence; matching `.json` receipts record zero errors and closed browser/server):

- Desktop: `2026-10-11T16-45-10-349Z-town-all-built-50-staggered-1440x900-6911a076.png`.
- Phone: `2026-10-11T16-45-11-295Z-town-all-built-50-staggered-390x844-f6db05e2.png`.
- Ten-profile/layout geometry receipt: `step4-depth-metrics-1791737073124.json`.

The base screenshots are current local Staggered all-built-50 synthetic fixtures,
not altered Founder progress. Blue marks back art, magenta front art, yellow
tower bases, orange gate and proposed road approach. Existing wall art remains
in the screenshot: annotations are the proposed replacement, not another wall
to add alongside it. No final-art rendering is part of Step 4.

The current phone Fit exposes only world X≈2254–3729, so both new side returns
extend offscreen. The phone markup adds labelled grey **outside-viewport diagram
margins**, not extra in-game terrain. This makes the entire proposed route
visible without editing the game or pretending its camera already fits it.
Step 5 must include the whole strongest-stage art in Fit. A full-wall phone
Overview would zoom out relative to this sample; retain minimum 44px controls
and Close inspection. This framing tradeoff needs acceptance with the route,
not a hidden promise of unchanged phone scale. Desktop has sufficient existing
horizontal space; do not add outer scenery or shrink its playing field to make
the wall feel grander.

Exact current Staggered projection for reproducing annotations:

- Desktop1440×900: screen X = 0.2747850144×world X +165.9343079;
  screen Y = 0.2747850093×world Y +90.2939951.
- Phone390×844: screen X = 0.2643936821×world X −595.9388587;
  screen Y = 0.2643990558×world Y −233.0671867. Markup diagram adds 120px to
  screen X, with the untouched screenshot centred in a 630×844 canvas.

The coordinate table is authoritative for the proposal. The image generator's
first annotation attempts shifted screenshot geometry; these were rejected as
evidence. After direct annotation was offered, the Founder instructed “finish
step 4”. The final markups use the existing local Playwright/Canvas runtime,
not generative editing, and preserve the originals at 1:1 pixel scale. They are
planning drawings, not finished wall art or screenshots of an implemented wall.

Checked deliverables, stored under `evidence/2026-10-11-wall-proposal/`:

- [Desktop route markup](../../evidence/2026-10-11-wall-proposal/desktop-wall-route.png), 1440×900.
- [Phone route markup](../../evidence/2026-10-11-wall-proposal/phone-wall-route.png), 630×844,
  with the original 390×844 screenshot centred between two 120px diagram margins.
- Byte-exact `desktop-original.png` and `phone-original.png` preserve the inputs.
- `annotate-screenshots.cjs` reads P0–P12 from this proposal and projects them
  through the recorded Staggered SVG CTMs; it never loads the game or storage.
- `annotation-receipt.json` records source/output hashes, projected points,
  pixel verification, unchanged runtime/art hashes and owned browser closure.
  Its proposal hash identifies the input document snapshot at generation time,
  before these evidence links were added; route coordinates are unchanged.

Root opened and inspected both final PNGs. The desktop preserves 1,185,331
unmarked source pixels; phone preserves 302,218. Zero pixels changed outside
the annotation mask. All sixteen runtime HTML/CSS/JS hashes match the checked
capture receipts, and both existing wall/terrain PNG hashes are unchanged.
The native bundle, hosted private version and player progress were not touched.

![Desktop proposed wall route](../../evidence/2026-10-11-wall-proposal/desktop-wall-route.png)

![Phone proposed wall route, with outside-viewport diagram margins](../../evidence/2026-10-11-wall-proposal/phone-wall-route.png)

## Scope, risks and undo before any build

No engine switch, libraries, plugins, installs, file moves, gameplay systems,
native sync or publication are proposed. If approved, anticipated implementation
touches `prototype/town-wall.js`, the layer/camera integration in
`prototype/app.js`, relevant `prototype/styles.css` stacking, and new versioned
wall PNGs under `prototype/assets/`. A gate-approach hook may also touch
`prototype/building-art.js`. These are prospective files, not changed now.

Risks: art seams/halos, incorrect independent scaling, phone Fit reducing detail,
HUD-induced reprojected plots, hover labels crossing foreground art and shadow
double-darkening. Test timber/stone, all five layouts, desktop/phone Fit and
maximum zoom; screenshot-capture and inspect every final visual change.

Undo: preserve the complete pre-change source snapshot and all v18 originals;
restore the old wall/layer/camera hooks and point back to its original asset.
No save migration or plot-ID change should be needed. Any final art cost or
future release/native debug exclusion remains separate from this proposal.

Route, depth, art A and phone framing were approved for Step 5 under DEC-069.
The implementation remains a draft: phone exposure/framing, gate target
alignment and painted tower count still require corrections and final checks.
