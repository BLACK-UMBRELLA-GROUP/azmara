# Original AZMARA building development artwork

Status: all 30 non-Hall raster atlases and all 11 Hall PNGs are ready for first-draft DEV testing. Renderer metadata is frozen; final in-game visual QA is handled separately. Not a publication claim.

## Scope and provenance

These are original, first-draft DEV test illustrations for 31 building roles at
eleven completed-level milestones: 1, 5, 10, 15, 20, 25, 30, 35, 40, 45 and 50.
They are appearance proposals, not final historical claims, balance values or
implemented economic, religious, military or shipping effects.

All building illustrations use the built-in ImageGen tool. They do not use copied
Ikariam pixels, an external image API or SVG building stand-ins. The Founder then
explicitly approved narrowly scoped local edge-only alpha cleanup, documented
below; raw generated originals remain unchanged. The Town Hall uses eleven separate transparent PNGs; each other role
uses one transparent 4-column × 3-row stage atlas. Cells 0–10 map to the eleven
milestones in row-major order. The final cell repeats level 50 for layout stability
and is deliberately not consumed by the renderer; it is not a twelfth stage.

The pre-existing Hall and terrain artwork through level 20 remains preserved.
Late Hall illustrations and their exact prompts are recorded in `hall-brief.md`.
Original terrain edits and their exact prompts remain in `terrain-brief.md`.
The original beyond-level-20 terrain proposal uses the unchanged level-20 raster plus a transparent,
original code-native infrastructure overlay: additional paths, low gardens,
flush water trim and paving details. The overlay never moves the coast, anchors,
forests or plot ground, and adds no buildings, perimeter walls or religious art.
Subsequent DEC-057 desert terrain and Region changes are owned by the main agent;
this record does not freeze those later terrain decisions.

## Material and structural direction

Level 1 starts with a rough, modest timber structure or shelter appropriate to
the role. Level 5 develops sound timber framing. Level 10 introduces brick.
Levels 15–20 introduce plaster and stone with better construction. Later stages
add role-specific functional wings, roofs, gates, bays, loading facilities or
workyards in stronger masonry. Progression must alter construction and layout,
not merely tint or enlarge the same sprite. Docks, storage and industry retain
low practical silhouettes; Prayer Area stays a quiet shaded courtyard.

No gods, miracles, sacred text or sacred figures appear. Chronos’ Forge is a
secular timekeeping and construction-planning workshop. Prayer Area is modest
and respectful; its proposed satisfaction role has no numeric implementation.

## Role identity matrix

| Role | Persistent visual identity |
| --- | --- |
| Town Hall | Central civic courtyard; timber shelter develops into refined masonry civic wings |
| Academy | Study courtyard, books, scrolls, shaded learning galleries |
| Warehouse | Broad protected enclosed storage; heavy doors and reinforcement |
| Provision House | Grain-distribution counter, sacks, bins and shaded provision court |
| Palace | Dignified secular administration; formal gate and reception wings |
| Governor’s Residence | Smaller domestic/administrative courtyard and reception lodge |
| Museum | Display galleries with pottery and nonsacred artefacts |
| Embassy | Welcoming guest/reception court with neutral cloth pennants |
| Prayer Area | Quiet low colonnade, shade and modest basin; no towers or sacred art |
| Trading Port | Merchant loading pier, cargo halls, quay and practical hoist |
| Trading Post | Low covered bazaar, market stalls, canopies and display baskets |
| Depot | Open bulk-stock yard and grouped low stores; less protection than Warehouse |
| Military Exchange | Low exchange hall, equipment display and open muster court |
| Route Chart Archive | Chart tables, rolled maps, archive galleries and navigation instruments; stable ID `sea-chart-archive`, originally generated under the earlier working name |
| Dockyard | Broad freighter cargo/service yard, long pier and bulky merchant hull |
| Intelligence House | Discreet closed rooms, shaded lattice and understated gate |
| Shipyard | Practical shipbuilding yard, ship hull, slips and cranes |
| Barracks | Training/muster court, low quarters and orderly equipment racks |
| Town Wall | Local palisade-to-masonry wall segment and gate, never a new perimeter |
| Workshop | Troop/ship equipment benches, forge and low practical workshop roofs |
| Forester’s House | Log stacks, saw bench, timber racks and working shelter |
| Silver Refinery | Crucibles, silver ingot trays, vents and refining workrooms |
| Iron Foundry | Robust forge, chimney, dark ingots and iron stock racks |
| Grain Estate | Agricultural workyard, grain handling and estate shelters |
| Clayworks | Clay stacks, drying/processing beds and kiln/work shelters |
| Carpenter’s Workshop | Joinery benches, timber stock, saws and low carpentry roofs |
| Precision Workshop | Fine instrument/tool benches and orderly small workshop bays |
| Materials Workshop | Metal-stock preparation/reuse and broad practical work bays |
| Grain Store | Covered grain handling, bins, sacks and storage halls |
| Architect’s Office | Drafting shelter, plans and a modest design-office courtyard |
| Chronos’ Forge | Secular timekeeping/work planning, measuring and construction workshop |

## Renderer contract

`AzmaraBuildingArt.forBuilding(id, level)` resolves the completed visual milestone
and returns a frozen object. Hall returns a local PNG `src` with `atlas: false`.
Other roles return `src`, `atlas: true`, `cols: 4`, `rows: 3`, zero-based `cell`,
`atlasWidth`, `atlasHeight`, a frozen `[x,y,width,height]` `rect` and
`cellAspect = rect.width / rect.height`. `render(id, level, className)` returns a plain
Hall image or a `.building-frame > .building-sprite` pair with CSS background
cropping. No source image is physically cropped, resized or resampled. Background
size is `(atlasWidth/rect.width)*100% (atlasHeight/rect.height)*100%`, and position
is `x/(atlasWidth-rect.width)*100% y/(atlasHeight-rect.height)*100%`.

The existing map wrappers, ground anchors and accessible hit targets are unchanged.
Catalogue and dialog artwork use bounded frames. All 30 non-Hall sheets are native
1254 × 1254 RGBA. All 11 Hall PNGs are 1536 × 1024 RGBA. Full-body rectangles use
read-only alpha>30 connected-component bounds plus 5px padding, clamped to the
source edge; important detached functional props are included. Isolated sprite
bodies may extend into an unused nominal-cell gutter, but no crop includes a
neighbouring body. Workshop's low-alpha connections include its detached crane
and tool details in the complete full-body bounds.

## Exact prompts, generated paths and inspection

Academy's four-generation pilot chain is recorded exactly in `academy-brief.md`.
The twelve delegated role generations are recorded exactly in
`../../building-atlas-runtime-brief.md`; their source paths remain preserved.
Hall generation is recorded in `hall-brief.md`. The seventeen coordinator-owned
roles and all targeted repairs are recorded below. All image calls used
`transparent_background: true`; references were original AZMARA art, never
Ikariam pixels.

## Founder-authorized edge cleanup and source audit

The Founder explicitly approved: “Yes, clean the edges.” Raw generated v1 PNGs
are preserved byte-identical. Runtime v2 siblings remove only exact
RGB(255,0,0) or RGB(255,255,0) matte pixels with alpha1–8, subject to an
exterior/isolated component gate, by setting selected alpha to0. All RGB,
noncandidate RGBA, alpha>8 and dimensions remain unchanged. The operation is
idempotent and does not resample, crop, redraw, recolour or alter building paint.
The main agent owns `../../tools/clean-atlas-edges.py` and
`edge-cleanup-report.json`, which records all30 source/output hashes and
decoded-pixel invariants, with 509,827 selected alpha-only pixel changes. Hall
and terrain files are outside its scope. The rejected merged-layout Sea/Intelligence
v1 files remain preserved; their accepted raw repairs use `stages-layout-v1.png`
and are the cleanup sources for the corresponding final v2 files.

Read-only source VM/PNG verification passed all341 API combinations: 41 decoded
PNG sources, frozen descriptors, expected milestones, all30 v2 atlas references,
finite bounded rectangles and at least1000 alpha>30 pixels in every active crop.
This is source-level proof, not a substitute for final browser screenshot and
cross-milestone pixel QA.

## Coordinator-owned exact generation records

### warehouse

#### Original generation

- Reference (style/layout only): `<LOCAL_HOME>/.codex/generated_images/01a110d7-7840-71d3-b4bb-ec945e585d0b/exec-dabfb5e3-2baa-4bfc-9c4e-d697a74b61df.png`
- Generated original: `<LOCAL_HOME>/.codex/generated_images/01a122b5-86d6-7ad2-917c-aebe7c10f4ab/exec-bb27da99-c3b8-4cad-94f8-6110897de4bf.png`
- Native output: 1254 × 1254 PNG RGBA, true alpha.

Exact final tool prompt for this call:

```text
Use case: stylized-concept. Asset type: original AZMARA transparent building-development sprite atlas for a browser strategy game. Image 1 is LAYOUT and STYLE reference only, not an edit target: replace ALL academy sprites with the requested single building role, retaining the accepted spacious sprite-sheet arrangement and painterly quality. Canvas must be SQUARE with strict FOUR equal columns and THREE equal rows: exactly TWELVE SMALL, independently centred, complete THUMBNAIL sprites. Each sprite occupies only 50% of its cell width, with generous genuinely transparent gutters on every side; its whole building footprint and soft shadow must stay inside its own cell. No overlap, merged cells or cut-off feet/roofs. Read left-to-right, top-to-bottom: row1 levels1,5,10,15; row2 levels20,25,30,35; row3 levels40,45,50,50 (lastcell duplicatelevel50, not a new design). Eleven distinct structural milestones: level1 weak rough timber shelter;5 sturdier timber;10 small brick/masonry;15 plaster/stone;20 better maintained masonry;25/30/35/40/45/50 progressively refined role-specific wings, roofs, gates, bays, or workyards. Make genuine material and architectural changes at every milestone, not recolouring or uniformly scaling one design. Retain rich original ivory plaster, warm terracotta, dark timber and restrained teal accents, tactile painterly isometric illustration and upper-left light. Strong role-specific silhouette; do not copy Academy courtyard/towers onto unrelated roles. No labels, lettering, numbers, grid lines, cell borders, backdrop, scenery, people, gods, miracles, sacred writing or sacred symbols. Genuinely transparent background, including all gutters and corners. SUBJECT ROLE: warehouse. Protected storage: a broad enclosed warehouse, heavy locked doors, orderly crate shelves, loading canopy and later reinforced stone buttresses. Retain a low practical storage silhouette; no palace towers.
```

- Accepted raw canonical copy: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-warehouse-stages-v1.png`
- Runtime edge-cleaned sibling: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-warehouse-stages-v2.png`
- Inspection: twelve complete, independently isolated bodies in row-major order; active cells0–10 represent eleven material/structural milestones. Cell11 is unused duplicate50. Real alpha gutters and corners; final source-level crop checks passed. Strong role identity retained; first-draft historical/art details remain refinable.

### provision-house

#### Original generation

- Reference (style/layout only): `<LOCAL_HOME>/.codex/generated_images/01a110d7-7840-71d3-b4bb-ec945e585d0b/exec-dabfb5e3-2baa-4bfc-9c4e-d697a74b61df.png`
- Generated original: `<LOCAL_HOME>/.codex/generated_images/01a122b5-86d6-7ad2-917c-aebe7c10f4ab/exec-c431eb6d-0a12-4ffb-aab0-3c9cbb7627be.png`
- Native output: 1254 × 1254 PNG RGBA, true alpha.

Exact final tool prompt for this call:

```text
Use case: stylized-concept. Asset type: original AZMARA transparent building-development sprite atlas for a browser strategy game. Image 1 is LAYOUT and STYLE reference only, not an edit target: replace ALL academy sprites with the requested single building role, retaining the accepted spacious sprite-sheet arrangement and painterly quality. Canvas must be SQUARE with strict FOUR equal columns and THREE equal rows: exactly TWELVE SMALL, independently centred, complete THUMBNAIL sprites. Each sprite occupies only 50% of its cell width, with generous genuinely transparent gutters on every side; its whole building footprint and soft shadow must stay inside its own cell. No overlap, merged cells or cut-off feet/roofs. Read left-to-right, top-to-bottom: row1 levels1,5,10,15; row2 levels20,25,30,35; row3 levels40,45,50,50 (lastcell duplicatelevel50, not a new design). Eleven distinct structural milestones: level1 weak rough timber shelter;5 sturdier timber;10 small brick/masonry;15 plaster/stone;20 better maintained masonry;25/30/35/40/45/50 progressively refined role-specific wings, roofs, gates, bays, or workyards. Make genuine material and architectural changes at every milestone, not recolouring or uniformly scaling one design. Retain rich original ivory plaster, warm terracotta, dark timber and restrained teal accents, tactile painterly isometric illustration and upper-left light. Strong role-specific silhouette; do not copy Academy courtyard/towers onto unrelated roles. No labels, lettering, numbers, grid lines, cell borders, backdrop, scenery, people, gods, miracles, sacred writing or sacred symbols. Genuinely transparent background, including all gutters and corners. SUBJECT ROLE: provision house. Public grain distribution: modest provision house with sacks, baskets, grain bins and shaded serving counter, becoming an orderly arcaded provision courtyard. Its identity is nourishment and distribution, not a palace.
```

- Accepted raw canonical copy: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-provision-house-stages-v1.png`
- Runtime edge-cleaned sibling: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-provision-house-stages-v2.png`
- Inspection: twelve complete, independently isolated bodies in row-major order; active cells0–10 represent eleven material/structural milestones. Cell11 is unused duplicate50. Real alpha gutters and corners; final source-level crop checks passed. Strong role identity retained; first-draft historical/art details remain refinable.

### palace

#### Original generation

- Reference (style/layout only): `<LOCAL_HOME>/.codex/generated_images/01a110d7-7840-71d3-b4bb-ec945e585d0b/exec-dabfb5e3-2baa-4bfc-9c4e-d697a74b61df.png`
- Generated original: `<LOCAL_HOME>/.codex/generated_images/01a122b5-86d6-7ad2-917c-aebe7c10f4ab/exec-364feabb-0d21-4d71-b79a-a5803e8fc5e1.png`
- Native output: 1254 × 1254 PNG RGBA, true alpha.

Exact final tool prompt for this call:

```text
Use case: stylized-concept. Asset type: original AZMARA transparent building-development sprite atlas for a browser strategy game. Image 1 is LAYOUT and STYLE reference only, not an edit target: replace ALL academy sprites with the requested single building role, retaining the accepted spacious sprite-sheet arrangement and painterly quality. Canvas must be SQUARE with strict FOUR equal columns and THREE equal rows: exactly TWELVE SMALL, independently centred, complete THUMBNAIL sprites. Each sprite occupies only 50% of its cell width, with generous genuinely transparent gutters on every side; its whole building footprint and soft shadow must stay inside its own cell. No overlap, merged cells or cut-off feet/roofs. Read left-to-right, top-to-bottom: row1 levels1,5,10,15; row2 levels20,25,30,35; row3 levels40,45,50,50 (lastcell duplicatelevel50, not a new design). Eleven distinct structural milestones: level1 weak rough timber shelter;5 sturdier timber;10 small brick/masonry;15 plaster/stone;20 better maintained masonry;25/30/35/40/45/50 progressively refined role-specific wings, roofs, gates, bays, or workyards. Make genuine material and architectural changes at every milestone, not recolouring or uniformly scaling one design. Retain rich original ivory plaster, warm terracotta, dark timber and restrained teal accents, tactile painterly isometric illustration and upper-left light. Strong role-specific silhouette; do not copy Academy courtyard/towers onto unrelated roles. No labels, lettering, numbers, grid lines, cell borders, backdrop, scenery, people, gods, miracles, sacred writing or sacred symbols. Genuinely transparent background, including all gutters and corners. SUBJECT ROLE: palace. Major civic administration: a dignified courtyard palace, early timber council shelter becoming brick then refined plaster/stone reception wings, formal gate, covered galleries, planted court and later modest corner pavilions. Original secular architecture.
```

- Accepted raw canonical copy: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-palace-stages-v1.png`
- Runtime edge-cleaned sibling: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-palace-stages-v2.png`
- Inspection: twelve complete, independently isolated bodies in row-major order; active cells0–10 represent eleven material/structural milestones. Cell11 is unused duplicate50. Real alpha gutters and corners; final source-level crop checks passed. Strong role identity retained; first-draft historical/art details remain refinable.

### governors-residence

#### Original generation

- Reference (style/layout only): `<LOCAL_HOME>/.codex/generated_images/01a110d7-7840-71d3-b4bb-ec945e585d0b/exec-dabfb5e3-2baa-4bfc-9c4e-d697a74b61df.png`
- Generated original: `<LOCAL_HOME>/.codex/generated_images/01a122b5-86d6-7ad2-917c-aebe7c10f4ab/exec-a4ec3517-e5b6-44e5-af66-d835ead07604.png`
- Native output: 1254 × 1254 PNG RGBA, true alpha.

Exact final tool prompt for this call:

```text
Use case: stylized-concept. Asset type: original AZMARA transparent building-development sprite atlas for a browser strategy game. Image 1 is LAYOUT and STYLE reference only, not an edit target: replace ALL academy sprites with the requested single building role, retaining the accepted spacious sprite-sheet arrangement and painterly quality. Canvas must be SQUARE with strict FOUR equal columns and THREE equal rows: exactly TWELVE SMALL, independently centred, complete THUMBNAIL sprites. Each sprite occupies only 50% of its cell width, with generous genuinely transparent gutters on every side; its whole building footprint and soft shadow must stay inside its own cell. No overlap, merged cells or cut-off feet/roofs. Read left-to-right, top-to-bottom: row1 levels1,5,10,15; row2 levels20,25,30,35; row3 levels40,45,50,50 (lastcell duplicatelevel50, not a new design). Eleven distinct structural milestones: level1 weak rough timber shelter;5 sturdier timber;10 small brick/masonry;15 plaster/stone;20 better maintained masonry;25/30/35/40/45/50 progressively refined role-specific wings, roofs, gates, bays, or workyards. Make genuine material and architectural changes at every milestone, not recolouring or uniformly scaling one design. Retain rich original ivory plaster, warm terracotta, dark timber and restrained teal accents, tactile painterly isometric illustration and upper-left light. Strong role-specific silhouette; do not copy Academy courtyard/towers onto unrelated roles. No labels, lettering, numbers, grid lines, cell borders, backdrop, scenery, people, gods, miracles, sacred writing or sacred symbols. Genuinely transparent background, including all gutters and corners. SUBJECT ROLE: governors residence. Local civic residence and administration: modest domestic courtyard with entry canopy and office wing, becoming a refined but smaller low-rise residence with shaded upper gallery and orderly reception court. Distinct from grand Palace.
```

- Accepted raw canonical copy: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-governors-residence-stages-v1.png`
- Runtime edge-cleaned sibling: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-governors-residence-stages-v2.png`
- Inspection: twelve complete, independently isolated bodies in row-major order; active cells0–10 represent eleven material/structural milestones. Cell11 is unused duplicate50. Real alpha gutters and corners; final source-level crop checks passed. Strong role identity retained; first-draft historical/art details remain refinable.

### museum

#### Original generation

- Reference (style/layout only): `<LOCAL_HOME>/.codex/generated_images/01a110d7-7840-71d3-b4bb-ec945e585d0b/exec-dabfb5e3-2baa-4bfc-9c4e-d697a74b61df.png`
- Generated original: `<LOCAL_HOME>/.codex/generated_images/01a122b5-86d6-7ad2-917c-aebe7c10f4ab/exec-0f3cf9f7-fec8-449a-8eaf-b74fdb669392.png`
- Native output: 1254 × 1254 PNG RGBA, true alpha.
- Rejected for final runtime: figurative display props; changed only those to nonsacred pottery, textiles, fragments and scientific objects.

Exact final tool prompt for this call:

```text
Use case: stylized-concept. Asset type: original AZMARA transparent building-development sprite atlas for a browser strategy game. Image 1 is LAYOUT and STYLE reference only, not an edit target: replace ALL academy sprites with the requested single building role, retaining the accepted spacious sprite-sheet arrangement and painterly quality. Canvas must be SQUARE with strict FOUR equal columns and THREE equal rows: exactly TWELVE SMALL, independently centred, complete THUMBNAIL sprites. Each sprite occupies only 50% of its cell width, with generous genuinely transparent gutters on every side; its whole building footprint and soft shadow must stay inside its own cell. No overlap, merged cells or cut-off feet/roofs. Read left-to-right, top-to-bottom: row1 levels1,5,10,15; row2 levels20,25,30,35; row3 levels40,45,50,50 (lastcell duplicatelevel50, not a new design). Eleven distinct structural milestones: level1 weak rough timber shelter;5 sturdier timber;10 small brick/masonry;15 plaster/stone;20 better maintained masonry;25/30/35/40/45/50 progressively refined role-specific wings, roofs, gates, bays, or workyards. Make genuine material and architectural changes at every milestone, not recolouring or uniformly scaling one design. Retain rich original ivory plaster, warm terracotta, dark timber and restrained teal accents, tactile painterly isometric illustration and upper-left light. Strong role-specific silhouette; do not copy Academy courtyard/towers onto unrelated roles. No labels, lettering, numbers, grid lines, cell borders, backdrop, scenery, people, gods, miracles, sacred writing or sacred symbols. Genuinely transparent background, including all gutters and corners. SUBJECT ROLE: museum. Collections and cultural exchange: early timber exhibition shelter with pottery/crate display, evolving into a distinctive low courtyard museum with display galleries, shaded exhibition canopy and recognisable pots or nonsacred artefacts. No sacred figures/text.
```

#### Targeted repair

- Reference (edit target): `<LOCAL_HOME>/.codex/generated_images/01a122b5-86d6-7ad2-917c-aebe7c10f4ab/exec-0f3cf9f7-fec8-449a-8eaf-b74fdb669392.png`
- Generated original: `<LOCAL_HOME>/.codex/generated_images/01a122b5-86d6-7ad2-917c-aebe7c10f4ab/exec-c0c32ae5-8e2a-46fc-ac40-c1baf3c77c7a.png`
- Native output: 1254 × 1254 PNG RGBA, true alpha.

Exact final tool prompt for this call:

```text
Use case: precise-object-edit. Asset type: original AZMARA Museum progression sprite atlas. Image1 is the EDIT TARGET. Change ONLY the figurative display props: remove EVERY human-shaped statue, figure, idol, person or carved person/animal, and replace each with a ceramic jar, geometric nonfigurative textile exhibit, plain architectural fragment or secular measuring instrument. Remove any letterlike inscriptions on exhibit plaques. Preserve all twelve Museum building designs, their timber-to-masonry progression, exact4×3 row-major arrangement including duplicatelevel50 inlastcell, sprite dimensions/positions, architecture, painterly isometric texture, upper-leftlight and truealpha gutters. Do not add a new background, labels, text, sacred symbols, gods, miracles, human figures or animal sculptures. Keep every complete building separately isolated.
```

- Accepted raw canonical copy: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-museum-stages-v1.png`
- Runtime edge-cleaned sibling: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-museum-stages-v2.png`
- Inspection: twelve complete, independently isolated bodies in row-major order; active cells0–10 represent eleven material/structural milestones. Cell11 is unused duplicate50. Real alpha gutters and corners; final source-level crop checks passed. Strong role identity retained; first-draft historical/art details remain refinable.

### embassy

#### Original generation

- Reference (style/layout only): `<LOCAL_HOME>/.codex/generated_images/01a110d7-7840-71d3-b4bb-ec945e585d0b/exec-dabfb5e3-2baa-4bfc-9c4e-d697a74b61df.png`
- Generated original: `<LOCAL_HOME>/.codex/generated_images/01a122b5-86d6-7ad2-917c-aebe7c10f4ab/exec-59362028-80cd-4dc7-bd82-49774c3e82ac.png`
- Native output: 1254 × 1254 PNG RGBA, true alpha.

Exact final tool prompt for this call:

```text
Use case: stylized-concept. Asset type: original AZMARA transparent building-development sprite atlas for a browser strategy game. Image 1 is LAYOUT and STYLE reference only, not an edit target: replace ALL academy sprites with the requested single building role, retaining the accepted spacious sprite-sheet arrangement and painterly quality. Canvas must be SQUARE with strict FOUR equal columns and THREE equal rows: exactly TWELVE SMALL, independently centred, complete THUMBNAIL sprites. Each sprite occupies only 50% of its cell width, with generous genuinely transparent gutters on every side; its whole building footprint and soft shadow must stay inside its own cell. No overlap, merged cells or cut-off feet/roofs. Read left-to-right, top-to-bottom: row1 levels1,5,10,15; row2 levels20,25,30,35; row3 levels40,45,50,50 (lastcell duplicatelevel50, not a new design). Eleven distinct structural milestones: level1 weak rough timber shelter;5 sturdier timber;10 small brick/masonry;15 plaster/stone;20 better maintained masonry;25/30/35/40/45/50 progressively refined role-specific wings, roofs, gates, bays, or workyards. Make genuine material and architectural changes at every milestone, not recolouring or uniformly scaling one design. Retain rich original ivory plaster, warm terracotta, dark timber and restrained teal accents, tactile painterly isometric illustration and upper-left light. Strong role-specific silhouette; do not copy Academy courtyard/towers onto unrelated roles. No labels, lettering, numbers, grid lines, cell borders, backdrop, scenery, people, gods, miracles, sacred writing or sacred symbols. Genuinely transparent background, including all gutters and corners. SUBJECT ROLE: embassy. Diplomatic residence: early timber reception lodge with neutral cloth pennants, evolving into welcoming arcaded guest courtyard, multiple shaded reception wings and a formal gate. No text/emblems or copied flags.
```

- Accepted raw canonical copy: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-embassy-stages-v1.png`
- Runtime edge-cleaned sibling: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-embassy-stages-v2.png`
- Inspection: twelve complete, independently isolated bodies in row-major order; active cells0–10 represent eleven material/structural milestones. Cell11 is unused duplicate50. Real alpha gutters and corners; final source-level crop checks passed. Strong role identity retained; first-draft historical/art details remain refinable.

### prayer-area

#### Original generation

- Reference (style/layout only): `<LOCAL_HOME>/.codex/generated_images/01a110d7-7840-71d3-b4bb-ec945e585d0b/exec-dabfb5e3-2baa-4bfc-9c4e-d697a74b61df.png`
- Generated original: `<LOCAL_HOME>/.codex/generated_images/01a122b5-86d6-7ad2-917c-aebe7c10f4ab/exec-a1d5ab51-e716-4d15-a630-338dea7da44f.png`
- Native output: 1254 × 1254 PNG RGBA, true alpha.

Exact final tool prompt for this call:

```text
Use case: stylized-concept. Asset type: original AZMARA transparent building-development sprite atlas for a browser strategy game. Image 1 is LAYOUT and STYLE reference only, not an edit target: replace ALL academy sprites with the requested single building role, retaining the accepted spacious sprite-sheet arrangement and painterly quality. Canvas must be SQUARE with strict FOUR equal columns and THREE equal rows: exactly TWELVE SMALL, independently centred, complete THUMBNAIL sprites. Each sprite occupies only 50% of its cell width, with generous genuinely transparent gutters on every side; its whole building footprint and soft shadow must stay inside its own cell. No overlap, merged cells or cut-off feet/roofs. Read left-to-right, top-to-bottom: row1 levels1,5,10,15; row2 levels20,25,30,35; row3 levels40,45,50,50 (lastcell duplicatelevel50, not a new design). Eleven distinct structural milestones: level1 weak rough timber shelter;5 sturdier timber;10 small brick/masonry;15 plaster/stone;20 better maintained masonry;25/30/35/40/45/50 progressively refined role-specific wings, roofs, gates, bays, or workyards. Make genuine material and architectural changes at every milestone, not recolouring or uniformly scaling one design. Retain rich original ivory plaster, warm terracotta, dark timber and restrained teal accents, tactile painterly isometric illustration and upper-left light. Strong role-specific silhouette; do not copy Academy courtyard/towers onto unrelated roles. No labels, lettering, numbers, grid lines, cell borders, backdrop, scenery, people, gods, miracles, sacred writing or sacred symbols. Genuinely transparent background, including all gutters and corners. SUBJECT ROLE: prayer area. A calm respectful prayer courtyard: at level1 a simple small timber shade shelter and clean plain ground; evolving into a low quiet colonnaded garden with shaded open court, modest water/ablution basin and simple reed or fabric shade. No towers, statues, sacred writing, figures, deities or miracles; do not make a palace.
```

- Accepted raw canonical copy: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-prayer-area-stages-v1.png`
- Runtime edge-cleaned sibling: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-prayer-area-stages-v2.png`
- Inspection: twelve complete, independently isolated bodies in row-major order; active cells0–10 represent eleven material/structural milestones. Cell11 is unused duplicate50. Real alpha gutters and corners; final source-level crop checks passed. Strong role identity retained; first-draft historical/art details remain refinable.

### trading-port

#### Original generation

- Reference (style/layout only): `<LOCAL_HOME>/.codex/generated_images/01a110d7-7840-71d3-b4bb-ec945e585d0b/exec-dabfb5e3-2baa-4bfc-9c4e-d697a74b61df.png`
- Generated original: `<LOCAL_HOME>/.codex/generated_images/01a122b5-86d6-7ad2-917c-aebe7c10f4ab/exec-c51e338a-a588-4f34-bd83-c9111c9d5437.png`
- Native output: 1254 × 1254 PNG RGBA, true alpha.

Exact final tool prompt for this call:

```text
Use case: stylized-concept. Asset type: original AZMARA transparent building-development sprite atlas for a browser strategy game. Image 1 is LAYOUT and STYLE reference only, not an edit target: replace ALL academy sprites with the requested single building role, retaining the accepted spacious sprite-sheet arrangement and painterly quality. Canvas must be SQUARE with strict FOUR equal columns and THREE equal rows: exactly TWELVE SMALL, independently centred, complete THUMBNAIL sprites. Each sprite occupies only 50% of its cell width, with generous genuinely transparent gutters on every side; its whole building footprint and soft shadow must stay inside its own cell. No overlap, merged cells or cut-off feet/roofs. Read left-to-right, top-to-bottom: row1 levels1,5,10,15; row2 levels20,25,30,35; row3 levels40,45,50,50 (lastcell duplicatelevel50, not a new design). Eleven distinct structural milestones: level1 weak rough timber shelter;5 sturdier timber;10 small brick/masonry;15 plaster/stone;20 better maintained masonry;25/30/35/40/45/50 progressively refined role-specific wings, roofs, gates, bays, or workyards. Make genuine material and architectural changes at every milestone, not recolouring or uniformly scaling one design. Retain rich original ivory plaster, warm terracotta, dark timber and restrained teal accents, tactile painterly isometric illustration and upper-left light. Strong role-specific silhouette; do not copy Academy courtyard/towers onto unrelated roles. No labels, lettering, numbers, grid lines, cell borders, backdrop, scenery, people, gods, miracles, sacred writing or sacred symbols. Genuinely transparent background, including all gutters and corners. SUBJECT ROLE: trading port. Merchant cargo landing: a low harbour warehouse and modest timber loading pier, evolving into strong stone quay, long practical piers, covered cargo halls, stacked crates and compact hoist/crane. No tall palace; no surrounding ocean or terrain beyond the small sprite ground/quay.
```

- Accepted raw canonical copy: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-trading-port-stages-v1.png`
- Runtime edge-cleaned sibling: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-trading-port-stages-v2.png`
- Inspection: twelve complete, independently isolated bodies in row-major order; active cells0–10 represent eleven material/structural milestones. Cell11 is unused duplicate50. Real alpha gutters and corners; final source-level crop checks passed. Strong role identity retained; first-draft historical/art details remain refinable.

### trading-post

#### Original generation

- Reference (style/layout only): `<LOCAL_HOME>/.codex/generated_images/01a110d7-7840-71d3-b4bb-ec945e585d0b/exec-dabfb5e3-2baa-4bfc-9c4e-d697a74b61df.png`
- Generated original: `<LOCAL_HOME>/.codex/generated_images/01a122b5-86d6-7ad2-917c-aebe7c10f4ab/exec-5fd923f3-4a43-4ed1-8c5c-09c06057618a.png`
- Native output: 1254 × 1254 PNG RGBA, true alpha.

Exact final tool prompt for this call:

```text
Use case: stylized-concept. Asset type: original AZMARA transparent building-development sprite atlas for a browser strategy game. Image 1 is LAYOUT and STYLE reference only, not an edit target: replace ALL academy sprites with the requested single building role, retaining the accepted spacious sprite-sheet arrangement and painterly quality. Canvas must be SQUARE with strict FOUR equal columns and THREE equal rows: exactly TWELVE SMALL, independently centred, complete THUMBNAIL sprites. Each sprite occupies only 50% of its cell width, with generous genuinely transparent gutters on every side; its whole building footprint and soft shadow must stay inside its own cell. No overlap, merged cells or cut-off feet/roofs. Read left-to-right, top-to-bottom: row1 levels1,5,10,15; row2 levels20,25,30,35; row3 levels40,45,50,50 (lastcell duplicatelevel50, not a new design). Eleven distinct structural milestones: level1 weak rough timber shelter;5 sturdier timber;10 small brick/masonry;15 plaster/stone;20 better maintained masonry;25/30/35/40/45/50 progressively refined role-specific wings, roofs, gates, bays, or workyards. Make genuine material and architectural changes at every milestone, not recolouring or uniformly scaling one design. Retain rich original ivory plaster, warm terracotta, dark timber and restrained teal accents, tactile painterly isometric illustration and upper-left light. Strong role-specific silhouette; do not copy Academy courtyard/towers onto unrelated roles. No labels, lettering, numbers, grid lines, cell borders, backdrop, scenery, people, gods, miracles, sacred writing or sacred symbols. Genuinely transparent background, including all gutters and corners. SUBJECT ROLE: trading post. Commercial market: a few simple timber stalls and awnings, becoming a lively covered arcaded bazaar with tiled/plaster roofs, varied merchant canopies and display baskets/crates. Keep broad horizontal market silhouette.
```

- Accepted raw canonical copy: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-trading-post-stages-v1.png`
- Runtime edge-cleaned sibling: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-trading-post-stages-v2.png`
- Inspection: twelve complete, independently isolated bodies in row-major order; active cells0–10 represent eleven material/structural milestones. Cell11 is unused duplicate50. Real alpha gutters and corners; final source-level crop checks passed. Strong role identity retained; first-draft historical/art details remain refinable.

### depot

#### Original generation

- Reference (style/layout only): `<LOCAL_HOME>/.codex/generated_images/01a110d7-7840-71d3-b4bb-ec945e585d0b/exec-dabfb5e3-2baa-4bfc-9c4e-d697a74b61df.png`
- Generated original: `<LOCAL_HOME>/.codex/generated_images/01a122b5-86d6-7ad2-917c-aebe7c10f4ab/exec-09c56590-76b5-4b24-914a-5aa229c1243d.png`
- Native output: 1254 × 1254 PNG RGBA, true alpha.

Exact final tool prompt for this call:

```text
Use case: stylized-concept. Asset type: original AZMARA transparent building-development sprite atlas for a browser strategy game. Image 1 is LAYOUT and STYLE reference only, not an edit target: replace ALL academy sprites with the requested single building role, retaining the accepted spacious sprite-sheet arrangement and painterly quality. Canvas must be SQUARE with strict FOUR equal columns and THREE equal rows: exactly TWELVE SMALL, independently centred, complete THUMBNAIL sprites. Each sprite occupies only 50% of its cell width, with generous genuinely transparent gutters on every side; its whole building footprint and soft shadow must stay inside its own cell. No overlap, merged cells or cut-off feet/roofs. Read left-to-right, top-to-bottom: row1 levels1,5,10,15; row2 levels20,25,30,35; row3 levels40,45,50,50 (lastcell duplicatelevel50, not a new design). Eleven distinct structural milestones: level1 weak rough timber shelter;5 sturdier timber;10 small brick/masonry;15 plaster/stone;20 better maintained masonry;25/30/35/40/45/50 progressively refined role-specific wings, roofs, gates, bays, or workyards. Make genuine material and architectural changes at every milestone, not recolouring or uniformly scaling one design. Retain rich original ivory plaster, warm terracotta, dark timber and restrained teal accents, tactile painterly isometric illustration and upper-left light. Strong role-specific silhouette; do not copy Academy courtyard/towers onto unrelated roles. No labels, lettering, numbers, grid lines, cell borders, backdrop, scenery, people, gods, miracles, sacred writing or sacred symbols. Genuinely transparent background, including all gutters and corners. SUBJECT ROLE: depot. Bulk storage yard with less protected storage: open timber stockyard and tarp-covered piles, becoming a broad practical yard with grouped low store blocks, loading shelter and bulky crates/sacks. Distinct from secure enclosed Warehouse; no palace towers.
```

- Accepted raw canonical copy: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-depot-stages-v1.png`
- Runtime edge-cleaned sibling: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-depot-stages-v2.png`
- Inspection: twelve complete, independently isolated bodies in row-major order; active cells0–10 represent eleven material/structural milestones. Cell11 is unused duplicate50. Real alpha gutters and corners; final source-level crop checks passed. Strong role identity retained; first-draft historical/art details remain refinable.

### military-exchange

#### Original generation

- Reference (style/layout only): `<LOCAL_HOME>/.codex/generated_images/01a110d7-7840-71d3-b4bb-ec945e585d0b/exec-dabfb5e3-2baa-4bfc-9c4e-d697a74b61df.png`
- Generated original: `<LOCAL_HOME>/.codex/generated_images/01a122b5-86d6-7ad2-917c-aebe7c10f4ab/exec-167594ee-07a1-48ab-8e72-7420c3c513a2.png`
- Native output: 1254 × 1254 PNG RGBA, true alpha.

Exact final tool prompt for this call:

```text
Use case: stylized-concept. Asset type: original AZMARA transparent building-development sprite atlas for a browser strategy game. Image 1 is LAYOUT and STYLE reference only, not an edit target: replace ALL academy sprites with the requested single building role, retaining the accepted spacious sprite-sheet arrangement and painterly quality. Canvas must be SQUARE with strict FOUR equal columns and THREE equal rows: exactly TWELVE SMALL, independently centred, complete THUMBNAIL sprites. Each sprite occupies only 50% of its cell width, with generous genuinely transparent gutters on every side; its whole building footprint and soft shadow must stay inside its own cell. No overlap, merged cells or cut-off feet/roofs. Read left-to-right, top-to-bottom: row1 levels1,5,10,15; row2 levels20,25,30,35; row3 levels40,45,50,50 (lastcell duplicatelevel50, not a new design). Eleven distinct structural milestones: level1 weak rough timber shelter;5 sturdier timber;10 small brick/masonry;15 plaster/stone;20 better maintained masonry;25/30/35/40/45/50 progressively refined role-specific wings, roofs, gates, bays, or workyards. Make genuine material and architectural changes at every milestone, not recolouring or uniformly scaling one design. Retain rich original ivory plaster, warm terracotta, dark timber and restrained teal accents, tactile painterly isometric illustration and upper-left light. Strong role-specific silhouette; do not copy Academy courtyard/towers onto unrelated roles. No labels, lettering, numbers, grid lines, cell borders, backdrop, scenery, people, gods, miracles, sacred writing or sacred symbols. Genuinely transparent background, including all gutters and corners. SUBJECT ROLE: military exchange. Military-unit trading and assembly venue: low timber covered exchange and small open muster yard, becoming an arcaded exchange hall and orderly muster court with shield/helmet/horse-equipment display props and neutral cloth standards. No people, text, combat or palace towers.
```

- Accepted raw canonical copy: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-military-exchange-stages-v1.png`
- Runtime edge-cleaned sibling: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-military-exchange-stages-v2.png`
- Inspection: twelve complete, independently isolated bodies in row-major order; active cells0–10 represent eleven material/structural milestones. Cell11 is unused duplicate50. Real alpha gutters and corners; final source-level crop checks passed. Strong role identity retained; first-draft historical/art details remain refinable.

### Route Chart Archive (generation working name: Sea Chart Archive)

#### Original generation

- Reference (style/layout only): `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-hall-level-20.png`
- Generated original: `<LOCAL_HOME>/.codex/generated_images/01a122b5-86d6-7ad2-917c-aebe7c10f4ab/exec-f69f19a6-4434-4709-b0f8-f0c3bde5ca1a.png`
- Native output: 1254 × 1254 PNG RGBA, true alpha.
- Rejected for final runtime: merged neighbouring lower-row foundations/shadows; replaced by a half-size layout-only edit preserving stage order.

Exact final tool prompt for this call:

```text
Use case: stylized-concept. Asset type: original AZMARA transparent building-development sprite atlas for a browser strategy game. Image1 is STYLE REFERENCE ONLY, not an edit target: borrow only the rich painterly texture, isometric orientation and materials from the original Town Hall, not its courtyard shape. Generate the requested single building role as a strict stage atlas. Canvas must be SQUARE with strict FOUR equal columns and THREE equal rows: exactly TWELVE SMALL, independently centred, complete THUMBNAIL sprites. Each sprite occupies only 50% of its cell width, with generous genuinely transparent gutters on every side; its whole building footprint and soft shadow must stay inside its own cell. No overlap, merged cells or cut-off feet/roofs. Read left-to-right, top-to-bottom: row1 levels1,5,10,15; row2 levels20,25,30,35; row3 levels40,45,50,50 (lastcell duplicatelevel50, not a new design). Eleven distinct structural milestones: level1 weak rough timber shelter;5 sturdier timber;10 small brick/masonry;15 plaster/stone;20 better maintained masonry;25/30/35/40/45/50 progressively refined role-specific wings, roofs, gates, bays, or workyards. Make genuine material and architectural changes at every milestone, not recolouring or uniformly scaling one design. Retain rich original ivory plaster, warm terracotta, dark timber and restrained teal accents, tactile painterly isometric illustration and upper-left light. Strong role-specific silhouette; do not copy Academy courtyard/towers onto unrelated roles. No labels, lettering, numbers, grid lines, cell borders, backdrop, scenery, people, gods, miracles, sacred writing or sacred symbols. Genuinely transparent background, including all gutters and corners. SUBJECT ROLE: sea chart archive. Maritime chart archive: timber chartkeeper lodge with rolled maps and simple navigation instruments, becoming a distinctive shaded archive court with chart tables, scroll-storage galleries and a compact observational roof deck. No sacred writing, magical globe or supernatural features. CLEAN TRANSPARENT EDGES: absolutely no pure saturated red (#ff0000) fringe, outlines, speckles, halos, glow, matte, colour-key spill or coloured background. Warm roof terracotta is natural orange-brown, not pure red. Smooth genuine alpha around every building and shadow.
```

#### Targeted repair

- Reference (edit target): `<LOCAL_HOME>/.codex/generated_images/01a122b5-86d6-7ad2-917c-aebe7c10f4ab/exec-f69f19a6-4434-4709-b0f8-f0c3bde5ca1a.png`
- Generated original: `<LOCAL_HOME>/.codex/generated_images/01a122b5-86d6-7ad2-917c-aebe7c10f4ab/exec-7c7e721a-4b4a-45c7-a342-b90badd613fd.png`
- Native output: 1254 × 1254 PNG RGBA, true alpha.

Exact final tool prompt for this call:

```text
Use case: precise-object-edit. Asset type: transparent original AZMARA sea chart archive progression atlas. Image1 is the EDIT TARGET. Change ONLY layout and sprite size; preserve all twelve existing building designs, props, materials, light and painterly isometric texture. Make ALL TWELVE sprites HALF THEIR CURRENT SIZE. Exact SQUAREcanvas with FOUR equalcolumns and THREE equalrows. Each complete building occupies at most50% of its cell width with LARGE genuinely transparent gutters on all four sides. Independently recenter every sprite in its owncell; lastrow level40,45,50,50duplicate must remain FOUR complete separate SMALL thumbnails, never touching or merged. Keep reading order and all stage designs unchanged. Every roof, foundation, courtyard, prop and soft contactshadow must be inside its owncell, no sprite touches a neighbouring sprite or canvas edge. No labels, frames, lines, background, scenery, people or newobjects. Preserve true transparent alpha; no pure saturated red fringe, outlines, speckles, matte or halos.
```

- Accepted raw canonical copy: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-sea-chart-archive-stages-layout-v1.png`
- Runtime edge-cleaned sibling: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-sea-chart-archive-stages-v2.png`
- Inspection: twelve complete, independently isolated bodies in row-major order; active cells0–10 represent eleven material/structural milestones. Cell11 is unused duplicate50. Real alpha gutters and corners; final source-level crop checks passed. Strong role identity retained; first-draft historical/art details remain refinable.

### dockyard

#### Original generation

- Reference (style/layout only): `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-hall-level-20.png`
- Generated original: `<LOCAL_HOME>/.codex/generated_images/01a122b5-86d6-7ad2-917c-aebe7c10f4ab/exec-90c70a44-3055-4478-81a1-d6b9a9e52ac6.png`
- Native output: 1254 × 1254 PNG RGBA, true alpha.

Exact final tool prompt for this call:

```text
Use case: stylized-concept. Asset type: original AZMARA transparent building-development sprite atlas for a browser strategy game. Image1 is STYLE REFERENCE ONLY, not an edit target: borrow only the rich painterly texture, isometric orientation and materials from the original Town Hall, not its courtyard shape. Generate the requested single building role as a strict stage atlas. Canvas must be SQUARE with strict FOUR equal columns and THREE equal rows: exactly TWELVE SMALL, independently centred, complete THUMBNAIL sprites. Each sprite occupies only 50% of its cell width, with generous genuinely transparent gutters on every side; its whole building footprint and soft shadow must stay inside its own cell. No overlap, merged cells or cut-off feet/roofs. Read left-to-right, top-to-bottom: row1 levels1,5,10,15; row2 levels20,25,30,35; row3 levels40,45,50,50 (lastcell duplicatelevel50, not a new design). Eleven distinct structural milestones: level1 weak rough timber shelter;5 sturdier timber;10 small brick/masonry;15 plaster/stone;20 better maintained masonry;25/30/35/40/45/50 progressively refined role-specific wings, roofs, gates, bays, or workyards. Make genuine material and architectural changes at every milestone, not recolouring or uniformly scaling one design. Retain rich original ivory plaster, warm terracotta, dark timber and restrained teal accents, tactile painterly isometric illustration and upper-left light. Strong role-specific silhouette; do not copy Academy courtyard/towers onto unrelated roles. No labels, lettering, numbers, grid lines, cell borders, backdrop, scenery, people, gods, miracles, sacred writing or sacred symbols. Genuinely transparent background, including all gutters and corners. SUBJECT ROLE: dockyard. Freighter dockyard: low long timber cargo/ship-service yard with long pier and bulky merchant hull, becoming reinforced broad dock halls, deep cargo quays, practical hoists, stacks of freight and visible freighter hull. No palace towers, no surrounding sea canvas. CLEAN TRANSPARENT EDGES: absolutely no pure saturated red (#ff0000) fringe, outlines, speckles, halos, glow, matte, colour-key spill or coloured background. Warm roof terracotta is natural orange-brown, not pure red. Smooth genuine alpha around every building and shadow.
```

- Accepted raw canonical copy: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-dockyard-stages-v1.png`
- Runtime edge-cleaned sibling: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-dockyard-stages-v2.png`
- Inspection: twelve complete, independently isolated bodies in row-major order; active cells0–10 represent eleven material/structural milestones. Cell11 is unused duplicate50. Real alpha gutters and corners; final source-level crop checks passed. Strong role identity retained; first-draft historical/art details remain refinable.

### Intelligence House

#### Original generation

- Reference (style/layout only): `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-hall-level-20.png`
- Generated original: `<LOCAL_HOME>/.codex/generated_images/01a122b5-86d6-7ad2-917c-aebe7c10f4ab/exec-b3a645a7-e772-4dd7-9b79-a73638cf9382.png`
- Native output: 1254 × 1254 PNG RGBA, true alpha.
- Rejected for final runtime: merged neighbouring lower-row foundations/shadows; replaced by a half-size layout-only edit preserving stage order.

Exact final tool prompt for this call:

```text
Use case: stylized-concept. Asset type: original AZMARA transparent building-development sprite atlas for a browser strategy game. Image1 is STYLE REFERENCE ONLY, not an edit target: borrow only the rich painterly texture, isometric orientation and materials from the original Town Hall, not its courtyard shape. Generate the requested single building role as a strict stage atlas. Canvas must be SQUARE with strict FOUR equal columns and THREE equal rows: exactly TWELVE SMALL, independently centred, complete THUMBNAIL sprites. Each sprite occupies only 50% of its cell width, with generous genuinely transparent gutters on every side; its whole building footprint and soft shadow must stay inside its own cell. No overlap, merged cells or cut-off feet/roofs. Read left-to-right, top-to-bottom: row1 levels1,5,10,15; row2 levels20,25,30,35; row3 levels40,45,50,50 (lastcell duplicatelevel50, not a new design). Eleven distinct structural milestones: level1 weak rough timber shelter;5 sturdier timber;10 small brick/masonry;15 plaster/stone;20 better maintained masonry;25/30/35/40/45/50 progressively refined role-specific wings, roofs, gates, bays, or workyards. Make genuine material and architectural changes at every milestone, not recolouring or uniformly scaling one design. Retain rich original ivory plaster, warm terracotta, dark timber and restrained teal accents, tactile painterly isometric illustration and upper-left light. Strong role-specific silhouette; do not copy Academy courtyard/towers onto unrelated roles. No labels, lettering, numbers, grid lines, cell borders, backdrop, scenery, people, gods, miracles, sacred writing or sacred symbols. Genuinely transparent background, including all gutters and corners. SUBJECT ROLE: intelligence house. Discreet intelligence office: an understated timber lodge evolving into a small secure low courtyard office, shaded lattice screens, discreet closed rooms, one guarded-looking gate, concealed-looking side entrance and simple rolled-record props. No people, weapons spectacle or huge palace. CLEAN TRANSPARENT EDGES: absolutely no pure saturated red (#ff0000) fringe, outlines, speckles, halos, glow, matte, colour-key spill or coloured background. Warm roof terracotta is natural orange-brown, not pure red. Smooth genuine alpha around every building and shadow.
```

#### Targeted repair

- Reference (edit target): `<LOCAL_HOME>/.codex/generated_images/01a122b5-86d6-7ad2-917c-aebe7c10f4ab/exec-b3a645a7-e772-4dd7-9b79-a73638cf9382.png`
- Generated original: `<LOCAL_HOME>/.codex/generated_images/01a122b5-86d6-7ad2-917c-aebe7c10f4ab/exec-afb79ce6-c0af-408a-ba9a-98a22105e7d6.png`
- Native output: 1254 × 1254 PNG RGBA, true alpha.

Exact final tool prompt for this call:

```text
Use case: precise-object-edit. Asset type: transparent original AZMARA intelligence house progression atlas. Image1 is the EDIT TARGET. Change ONLY layout and sprite size; preserve all twelve existing building designs, props, materials, light and painterly isometric texture. Make ALL TWELVE sprites HALF THEIR CURRENT SIZE. Exact SQUAREcanvas with FOUR equalcolumns and THREE equalrows. Each complete building occupies at most50% of its cell width with LARGE genuinely transparent gutters on all four sides. Independently recenter every sprite in its owncell; lastrow level40,45,50,50duplicate must remain FOUR complete separate SMALL thumbnails, never touching or merged. Keep reading order and all stage designs unchanged. Every roof, foundation, courtyard, prop and soft contactshadow must be inside its owncell, no sprite touches a neighbouring sprite or canvas edge. No labels, frames, lines, background, scenery, people or newobjects. Preserve true transparent alpha; no pure saturated red fringe, outlines, speckles, matte or halos.
```

- Accepted raw canonical copy: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-intelligence-house-stages-layout-v1.png`
- Runtime edge-cleaned sibling: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-intelligence-house-stages-v2.png`
- Inspection: twelve complete, independently isolated bodies in row-major order; active cells0–10 represent eleven material/structural milestones. Cell11 is unused duplicate50. Real alpha gutters and corners; final source-level crop checks passed. Strong role identity retained; first-draft historical/art details remain refinable.

### foresters-house

#### Original generation

- Reference (style/layout only): `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-hall-level-20.png`
- Generated original: `<LOCAL_HOME>/.codex/generated_images/01a122b5-86d6-7ad2-917c-aebe7c10f4ab/exec-60f5c164-532d-4148-99d7-1fec13add891.png`
- Native output: 1254 × 1254 PNG RGBA, true alpha.

Exact final tool prompt for this call:

```text
Use case: stylized-concept. Asset type: original AZMARA transparent building-development sprite atlas for a browser strategy game. Image1 is STYLE REFERENCE ONLY, not an edit target: borrow only the rich painterly texture, isometric orientation and materials from the original Town Hall, not its courtyard shape. Generate the requested single building role as a strict stage atlas. Canvas must be SQUARE with strict FOUR equal columns and THREE equal rows: exactly TWELVE SMALL, independently centred, complete THUMBNAIL sprites. Each sprite occupies only 50% of its cell width, with generous genuinely transparent gutters on every side; its whole building footprint and soft shadow must stay inside its own cell. No overlap, merged cells or cut-off feet/roofs. Read left-to-right, top-to-bottom: row1 levels1,5,10,15; row2 levels20,25,30,35; row3 levels40,45,50,50 (lastcell duplicatelevel50, not a new design). Eleven distinct structural milestones: level1 weak rough timber shelter;5 sturdier timber;10 small brick/masonry;15 plaster/stone;20 better maintained masonry;25/30/35/40/45/50 progressively refined role-specific wings, roofs, gates, bays, or workyards. Make genuine material and architectural changes at every milestone, not recolouring or uniformly scaling one design. Retain rich original ivory plaster, warm terracotta, dark timber and restrained teal accents, tactile painterly isometric illustration and upper-left light. Strong role-specific silhouette; do not copy Academy courtyard/towers onto unrelated roles. No labels, lettering, numbers, grid lines, cell borders, backdrop, scenery, people, gods, miracles, sacred writing or sacred symbols. Genuinely transparent background, including all gutters and corners. SUBJECT ROLE: foresters house. Timber production support: timber forester lodge with log stacks, saw bench and lean-to, becoming a broad practical forestry works with covered log racks, carpentry shelter and later sturdy masonry base. Maintain timber-working identity, no towers. CLEAN TRANSPARENT EDGES: absolutely no pure saturated red (#ff0000) fringe, outlines, speckles, halos, glow, matte, colour-key spill or coloured background. Warm roof terracotta is natural orange-brown, not pure red. Smooth genuine alpha around every building and shadow.
```

- Accepted raw canonical copy: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-foresters-house-stages-v1.png`
- Runtime edge-cleaned sibling: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-foresters-house-stages-v2.png`
- Inspection: twelve complete, independently isolated bodies in row-major order; active cells0–10 represent eleven material/structural milestones. Cell11 is unused duplicate50. Real alpha gutters and corners; final source-level crop checks passed. Strong role identity retained; first-draft historical/art details remain refinable.

### silver-refinery

#### Original generation

- Reference (style/layout only): `<LOCAL_HOME>/.codex/generated_images/01a110d7-7840-71d3-b4bb-ec945e585d0b/exec-dabfb5e3-2baa-4bfc-9c4e-d697a74b61df.png`
- Generated original: `<LOCAL_HOME>/.codex/generated_images/01a122b5-86d6-7ad2-917c-aebe7c10f4ab/exec-c56a5455-8abb-4533-95f4-cbc393ff148c.png`
- Native output: 1254 × 1254 PNG RGBA, true alpha.

Exact final tool prompt for this call:

```text
Use case: stylized-concept. Asset type: original AZMARA transparent building-development sprite atlas for a browser strategy game. Image 1 is LAYOUT and STYLE reference only, not an edit target: replace ALL academy sprites with the requested single building role, retaining the accepted spacious sprite-sheet arrangement and painterly quality. Canvas must be SQUARE with strict FOUR equal columns and THREE equal rows: exactly TWELVE SMALL, independently centred, complete THUMBNAIL sprites. Each sprite occupies only 50% of its cell width, with generous genuinely transparent gutters on every side; its whole building footprint and soft shadow must stay inside its own cell. No overlap, merged cells or cut-off feet/roofs. Read left-to-right, top-to-bottom: row1 levels1,5,10,15; row2 levels20,25,30,35; row3 levels40,45,50,50 (lastcell duplicatelevel50, not a new design). Eleven distinct structural milestones: level1 weak rough timber shelter;5 sturdier timber;10 small brick/masonry;15 plaster/stone;20 better maintained masonry;25/30/35/40/45/50 progressively refined role-specific wings, roofs, gates, bays, or workyards. Make genuine material and architectural changes at every milestone, not recolouring or uniformly scaling one design. Retain rich original ivory plaster, warm terracotta, dark timber and restrained teal accents, tactile painterly isometric illustration and upper-left light. Strong role-specific silhouette; do not copy Academy courtyard/towers onto unrelated roles. No labels, lettering, numbers, grid lines, cell borders, backdrop, scenery, people, gods, miracles, sacred writing or sacred symbols. Genuinely transparent background, including all gutters and corners. SUBJECT ROLE: silver refinery. Silver refining support: simple timber refining shed with small furnace, shallow silver ingot trays and crucibles, becoming an orderly low masonry refining workshop with vents/chimney, instrument bench and cool silver-metal highlights. No fantasy crystal or palace towers. Clean alpha edges: no saturated pure-red outlines, speckles, halos, glow, colour-key spill or matte. No tiny false-colour artefacts.
```

- Accepted raw canonical copy: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-silver-refinery-stages-v1.png`
- Runtime edge-cleaned sibling: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-silver-refinery-stages-v2.png`
- Inspection: twelve complete, independently isolated bodies in row-major order; active cells0–10 represent eleven material/structural milestones. Cell11 is unused duplicate50. Real alpha gutters and corners; final source-level crop checks passed. Strong role identity retained; first-draft historical/art details remain refinable.

### iron-foundry

#### Original generation

- Reference (style/layout only): `<LOCAL_HOME>/.codex/generated_images/01a110d7-7840-71d3-b4bb-ec945e585d0b/exec-dabfb5e3-2baa-4bfc-9c4e-d697a74b61df.png`
- Generated original: `<LOCAL_HOME>/.codex/generated_images/01a122b5-86d6-7ad2-917c-aebe7c10f4ab/exec-be1995e2-59cc-49c0-a361-375869e0c8c5.png`
- Native output: 1254 × 1254 PNG RGBA, true alpha.

Exact final tool prompt for this call:

```text
Use case: stylized-concept. Asset type: original AZMARA transparent building-development sprite atlas for a browser strategy game. Image 1 is LAYOUT and STYLE reference only, not an edit target: replace ALL academy sprites with the requested single building role, retaining the accepted spacious sprite-sheet arrangement and painterly quality. Canvas must be SQUARE with strict FOUR equal columns and THREE equal rows: exactly TWELVE SMALL, independently centred, complete THUMBNAIL sprites. Each sprite occupies only 50% of its cell width, with generous genuinely transparent gutters on every side; its whole building footprint and soft shadow must stay inside its own cell. No overlap, merged cells or cut-off feet/roofs. Read left-to-right, top-to-bottom: row1 levels1,5,10,15; row2 levels20,25,30,35; row3 levels40,45,50,50 (lastcell duplicatelevel50, not a new design). Eleven distinct structural milestones: level1 weak rough timber shelter;5 sturdier timber;10 small brick/masonry;15 plaster/stone;20 better maintained masonry;25/30/35/40/45/50 progressively refined role-specific wings, roofs, gates, bays, or workyards. Make genuine material and architectural changes at every milestone, not recolouring or uniformly scaling one design. Retain rich original ivory plaster, warm terracotta, dark timber and restrained teal accents, tactile painterly isometric illustration and upper-left light. Strong role-specific silhouette; do not copy Academy courtyard/towers onto unrelated roles. No labels, lettering, numbers, grid lines, cell borders, backdrop, scenery, people, gods, miracles, sacred writing or sacred symbols. Genuinely transparent background, including all gutters and corners. SUBJECT ROLE: iron foundry. Iron production support: rough timber smith shelter with dark ingots/anvil and restrained forge furnace, becoming a robust broad brick/stone foundry with substantial chimney, covered iron stock racks and workshop roofs. No fantasy, no palace towers. Clean alpha edges: no saturated pure-red outlines, speckles, halos, glow, colour-key spill or matte. No tiny false-colour artefacts.
```

- Accepted raw canonical copy: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-iron-foundry-stages-v1.png`
- Runtime edge-cleaned sibling: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-iron-foundry-stages-v2.png`
- Inspection: twelve complete, independently isolated bodies in row-major order; active cells0–10 represent eleven material/structural milestones. Cell11 is unused duplicate50. Real alpha gutters and corners; final source-level crop checks passed. Strong role identity retained; first-draft historical/art details remain refinable.
