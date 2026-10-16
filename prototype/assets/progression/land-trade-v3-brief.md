# AZMARA land-trade artwork — first draft, 11 October 2026

These two original illustrated atlases replace the active naval-looking trade art with land-only roles. Fictional AZMARA design; not a historical reconstruction. The previous raw originals and runtime v1/v2 PNGs remain untouched.

## Scope and integration

- Caravan Station keeps stable compatibility ID `trading-port`; new runtime `azmara-trading-port-stages-land-v3.png`.
- Freight Depot keeps stable compatibility ID `dockyard`; new runtime `azmara-dockyard-stages-land-v3.png`.
- Retired `shipyard` saves resolve to Caravan Station art at the same completed level. This is compatibility, not an active naval role or a second workshop.
- Eleven source-art labels remain: 1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50. Four columns by three rows; twelfth unused cell repeats the final design. Completed-level thresholds now differ deterministically by building, with fixed3–7 level gaps from1 to50; they do not reshuffle on reload. `milestonesFor(id)` supplies the actual thresholds, descriptor `minLevel` is the actual threshold, and `artLevel` remains the old source-cell label. Caravan thresholds are1,5,9,14,20,25,29,32,37,43,50; Freight thresholds are1,6,10,13,18,22,28,35,40,46,50. Legacy Shipyard uses the Caravan schedule.
- The first stage is a rough timber shelter. Later structures develop masonry, covered receiving bays, loading courtyards and cargo detail. No boats, docks, canals, maritime props or divine references are used.
- Both native sources are 1254 × 1254 RGBA with transparent corners. Crops register complete owned architectural bodies and cargo props; every active crop contains zero foreign painted pixels at alpha>30. Freight level40/45 use1px transparent padding and level50 uses3px, rather than including neighbouring sprites through forced5px padding.
- Existing explicitly authorized edge-only cleanup makes NEW sibling runtime files. The exact low-alpha gate clears33,475 Caravan and33,943 Freight noise pixels. All RGB, alpha>8 paint and every noncandidate pixel are unchanged; originals are preserved and cleanup is idempotent.
- Native crop and cleanup proof is in [land-trade-v3-report.json](land-trade-v3-report.json). Read-only inspection: `prototype/tools/inspect-land-atlases.py`. Runtime registration: `prototype/building-art.js`.
- Scene progression now uses the dry v2 native level1 painting at all milestones, plus original code-native roads, palm courts, gardens and isolated decorative fountains. The connecting watercourse is removed; a dry outer avenue replaces it. The Hall's fixed threshold schedule controls main-road quality, while each plot's last45native pixels of approach blend toward the lesser Hall/building quality and stop outside its full footprint. These scene details remain cosmetic, not resource or gameplay bonuses.

## Generation provenance

Tool: built-in ImageGen, transparent_background=true. Generation with one inspected local STYLE reference, not an edit of the old trading building:
`prototype/assets/progression/azmara-hall-level-20.png`.
No historical or copyrighted game asset was used as an image-generation reference.

Caravan generated source:
`<LOCAL_HOME>/.codex/generated_images/01a12906-4488-7673-add3-dce847d0dafb/exec-a239a13c-e79d-4b45-a24b-95fa3ee116ab.png`.
Byte-exact repository raw sibling:
`azmara-trading-port-stages-land-v3-original.png`.

Freight generated source:
`<LOCAL_HOME>/.codex/generated_images/01a12906-4488-7673-add3-dce847d0dafb/exec-2bf51eea-f4d7-4ea5-a64e-dac100da177d.png`.
Byte-exact repository raw sibling:
`azmara-dockyard-stages-land-v3-original.png`.

### Exact Caravan Station prompt

```text
Use case: stylized-concept. Asset type: original AZMARA transparent building-development sprite atlas for a land-only browser strategy game. Image 1 is STYLE reference only, not an edit target: use its warm ivory plaster, terracotta, timber, restrained teal cloth, tactile painterly isometric 2.5D illustration and upper-left illumination, but do not copy its civic Hall shape. Create a SQUARE high-resolution sprite atlas with strict FOUR equal columns and THREE equal rows: exactly TWELVE complete, separately centered small building sprites, read left-to-right top-to-bottom: row1 levels1,5,10,15; row2 levels20,25,30,35; row3 levels40,45,50,50. Last cell duplicates level50 for unused layout stability. The first ELEVEN are distinct architectural milestones. Entire building, ground footprint, cargo props and soft contact shadow fit within their own cell with generous truly transparent gutters; no merged cells or cut-off roofs, wheels, animals or feet. Level1 is a small weak rough wooden shack/shelter on bare earth, level5 sound timber framing, level10 brick, level15 plaster/stone, level20 substantial maintained masonry; levels25,30,35,40,45,50 progressively improve structure, materials, practical wings, loading court and role-specific details. Make real structural differences, not only recoloring or rescaling. Final50 is a substantial but low practical warm stone trade complex, not a palace or tower. All stages remain on DRY LAND. No boats, ships, hulls, masts, anchors, ocean, rivers, canals, docks, quays, piers, slipways, water or blue patches. No people, weapons, modern vehicles, text, numbers, labels, cell borders, grid lines, painted background, logos, gods, miracles, sacred text or symbols. GENUINELY TRANSPARENT background with clean natural edges, including all gutters and corners, no colored matte/fringe speckles. SUBJECT: Caravan Station. A merchant's land-trade loading and arrival court, with a timber receiving shelter evolving into an arched stone caravanserai court, practical covered bays, crates, woven bundles, grain sacks, a small pack-camel or pack-mule with saddlebags and a simple wheeled handcart. Animals and cargo are miniature integral props, not dominant character portraits. Keep a clearly distinct open courtyard and shaded unloading area. No ships or water at any stage.
```

### Exact Freight Depot prompt

```text
Use case: stylized-concept. Asset type: original AZMARA transparent building-development sprite atlas for a land-only browser strategy game. Image 1 is STYLE reference only, not an edit target: use its warm ivory plaster, terracotta, timber, restrained teal cloth, tactile painterly isometric 2.5D illustration and upper-left illumination, but do not copy its civic Hall shape. Create a SQUARE high-resolution sprite atlas with strict FOUR equal columns and THREE equal rows: exactly TWELVE complete, separately centered small building sprites, read left-to-right top-to-bottom: row1 levels1,5,10,15; row2 levels20,25,30,35; row3 levels40,45,50,50. Last cell duplicates level50 for unused layout stability. The first ELEVEN are distinct architectural milestones. Entire building, ground footprint, cargo props and soft contact shadow fit within their own cell with generous truly transparent gutters; no merged cells or cut-off roofs, wheels, animals or feet. Level1 is a small weak rough wooden shack/shelter on bare earth, level5 sound timber framing, level10 brick, level15 plaster/stone, level20 substantial maintained masonry; levels25,30,35,40,45,50 progressively improve structure, materials, practical wings, loading court and role-specific details. Make real structural differences, not only recoloring or rescaling. Final50 is a substantial but low practical warm stone trade complex, not a palace or tower. All stages remain on DRY LAND. No boats, ships, hulls, masts, anchors, ocean, rivers, canals, docks, quays, piers, slipways, water or blue patches. No people, weapons, modern vehicles, text, numbers, labels, cell borders, grid lines, painted background, logos, gods, miracles, sacred text or symbols. GENUINELY TRANSPARENT background with clean natural edges, including all gutters and corners, no colored matte/fringe speckles. SUBJECT: Freight Depot. A heavy overland cargo dispatch and service yard, with a rough timber cargo shed evolving into a broad reinforced stone depot with roomy loading entrances, flat cargo platforms, stout wooden cargo wagons, grouped bulk crates, stacked sacks, ramps and practical hoists on dry land. Heavy wagons and storage dominate, no camel courtyard; distinguish this sturdy low industrial logistical facility from the Caravan Station, ordinary Warehouse, palace and market. No ships or water at any stage.
```

## Verification boundary

The pure geometry suite checks all eleven scenery milestones against five source layout choices and explicit compact/desktop stress fixtures, and all31 readable building IDs at completed levels1–50. It is not browser certification: responsive CTM, maximum-zoom grounding and final visual composition are separately checked by the browser QA owner. No saved town, construction timer, resources, level, native runtime or published site is mutated by these appearance assets.
