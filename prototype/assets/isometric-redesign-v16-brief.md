# Original isometric redesign assets — 11 October 2026

DEC-063. Built-in ImageGen produced these original versioned raster siblings. The user-supplied game reference informs cohesion/depth only; no reference pixels or composition are copied. Town edits preserve broad original registration and outer landforms, removing central clutter. No production engine migration, backend, economy or native changes. Original files remain preserved.

Runtime paths below are relative to prototype/. The generated PNGs were copied byte-for-byte; no local pixel edit or alpha cleanup has been applied. Only six independently verified full-body transparent crops are used from the twelve-item scenery atlas; overlapping middle-row pieces are deliberately excluded. Roads remain original code-native rendering around full responsive plot footprints. Decorations are cosmetic, not owned buildings.

Byte-exact SHA-256 values:

- Scenery atlas v1: `e01e84474e8776e0deba378d5f44bfabf833397115cb2ff849caf83925ebf916`.
- World relief v1: `bf6e3483f161b60f16d70eb7abb9a1f96ec6690f987807053f8c4c406c1e1f64`.
- Desktop town v3: `a28b5299fca1ccd79e2249875a8909a5029bb037b8dacf32bc517b5fea07cbef`.
- Compact town v3: `6de5e0859095ab2bd5547c159b383014307ecfe1bce7d34f1113dbf961aada85`.

Runtime uses explicit full-body source-coordinate clipping for palm, cypress,
garden, fountain, planter and lamp. Native ownership checks are read-only.
The generated low-alpha fringe remains in the preserved source; local cleanup
of these new scenery pixels has not been authorised or performed.

## Transparent scenery atlas

Generated source: `<LOCAL_HOME>/.codex/generated_images/01a110d7-7840-71d3-b4bb-ec945e585d0b/exec-1d5d11fd-ac3c-440f-a8e1-85209c9d1496.png`.
Runtime: `assets/azmara-scenery-atlas-v1.png`.

Exact submitted prompt:

```text
Use case: stylized-concept
Asset type: original production transparent game scenery sprite atlas for AZMARA, a fictional classical desert strategy settlement.
Primary request: precisely twelve separate decorative assets in a strict 4-column by 3-row equal-cell grid on a genuinely transparent square canvas, generously separated, no labels. Each entire asset and its faint contact shadow must stay fully inside its own cell with 12% blank margins. Row-major: row1 date palm with detailed fronds and raised tiny stone planting bed; slender cypress in sandstone planter; rectangular walled flower garden; octagonal carved stone tier fountain with tiny turquoise basin. Row2 carved sandstone bench in three-quarter view; paved courtyard with low edging and two potted citrus trees; dense cluster of realistic desert shrubs; small shaded garden pergola with timber lattice (decorative, not occupied building). Row3 terracotta planter cluster with flowering shrubs; simple decorative teal shade canopy above a tiny empty paved rest area; period bronze street lantern on sandstone post; small dry rock garden with agave and sandstone border.
Style/medium: richly detailed pre-rendered isometric 3D game assets, realistic dimensional miniature craftsmanship, same quality as a detailed sandstone and terracotta civic building. Not flat icon, not vector clip art. Architectural surfaces have clear top surfaces, darker side faces, occlusion, beveled edges, fine stone texture and dimensional leaves.
Camera: consistent orthographic isometric viewed from southeast at roughly 35 degrees downward; horizontal ground compressed into diamonds, vertical palms stand upright. No perspective drift across cells.
Lighting: warm daylight from upper left, soft cast shadows to lower right. Ivory sandstone, restrained terracotta, olive/cypress green, turquoise accents. Crisp material detail.
Constraints: truly transparent backdrop, preserve natural alpha at fronds; no checkerboard drawn into image, no bright matte fringe, no text, flags, boats, rivers, people, buildings, deities, modern objects, logos or watermarks. This is new original art, no reference game assets or copied composition. Render all twelve as separately usable native sprites.
```

## World geographic relief

Generated source: `<LOCAL_HOME>/.codex/generated_images/01a110d7-7840-71d3-b4bb-ec945e585d0b/exec-42235d6f-da72-4da4-b195-9ab327fc1c7b.png`.
Runtime: `assets/azmara-world-relief-v1.png`.

Exact submitted prompt:

```text
Use case: stylized-concept
Asset type: original broad geographic world-map terrain background for AZMARA browser strategy game.
Primary request: a seamless-looking edge-to-edge wide continental desert panorama with convincing dimensional relief, suitable for coordinate scrolling and placing independent region markers. This is a miniature geographic map seen from a consistent high orthographic isometric camera, NOT a close town board and NOT a top-down flat diagram.
Scene: connected inland sandy plains broken by several sandstone mountain chains, eroded mesas with clearly visible lit top surfaces and shaded south/east cliff faces, dune fields, dry wadi depressions with NO WATER, sparse palm clusters marking isolated green pockets. Plenty of uncluttered broad tan basins between ridges for selectable geographic markers. All edges remain opaque painted continental land, no island cutout.
Style: sophisticated detailed pre-rendered 3D strategy-game terrain; natural fine texture, believable elevation, coherent scale across whole image. Long but soft directional shadows give depth. Desaturated warm honey sand, ivory rock, terracotta cliffs, restrained olive green. Daylight from upper left. Subtle atmospheric depth but crisp readable terrain.
Composition: wide landscape roughly 3:2, entire continent patch visible, no horizon, no sky, no large foreground object. Land fills100%ofcanvas.
Avoid: sea, rivers, lakes, boats, snow, functional buildings or towns, people, monsters, icons, route lines, roads baked in, grids, text, labels, logos, borders, UI, deities. Fictional geography and original composition; do not copy any reference map.
```

## Desktop bare ground refinement

Generated source: `<LOCAL_HOME>/.codex/generated_images/01a110d7-7840-71d3-b4bb-ec945e585d0b/exec-18c441dd-c63a-4043-996e-cd84a85e201f.png`.
Runtime: `assets/progression/azmara-desert-desktop-level-1-v3.png`.

Exact submitted prompt:

```text
Use case: precise-object-edit
Asset type: original AZMARA town terrain background, versioned visual refinement.
Input image1 edit target.
Change only the central open settlement plain and overall surface finesse. Keep the broad landform arrangement, original outer sandstone ridges/palms, warm daylight from upper left, high orthographic isometric camera and landscape aspect ratio.
The central 75%ofthispainting must become smooth level sandy ground with very fine natural granularity and subtle compacted-earth colour variation, rather than oversized cracked stones, weeds and lumpy rocks. Remove all scattered central bushes/stones so buildings and narrow cobbled streets can be placed naturally on level foundations. Retain a convincing dimensional sculpted perimeter with shaded cliff faces and detailed date-palm groves. Improve fine material detail and visual depth without noisy repeated patterns. Maintain restrained warm honey/ochre/ivory palette matching original sandstone and terracotta miniature building sprites.
This is the empty starting level1 plain, not a developed city. No roads baked into terrain, no paving grid, no buildings, no plots, no text, no people. Everything stays inland dry desert, no water, river, boats, deities, borders or UI. Land fills every edge; crisp sophisticated pre-rendered3D game environment, not photographic aerial terrain. Preserve original framing for exact overlay registration.
```

## Compact bare ground refinement

Generated source: `<LOCAL_HOME>/.codex/generated_images/01a110d7-7840-71d3-b4bb-ec945e585d0b/exec-912b64aa-5f77-45cd-80d3-47528103444b.png`.
Runtime: `assets/progression/azmara-desert-compact-level-1-v3.png`.

Exact submitted prompt:

```text
Use case: precise-object-edit
Asset type: original AZMARA town terrain background, versioned visual refinement.
Input image1 edit target.
Change only the central open settlement plain and overall surface finesse. Keep the broad landform arrangement, original outer sandstone ridges/palms, warm daylight from upper left, high orthographic isometric camera and square aspect ratio.
The central 75%ofthispainting must become smooth level sandy ground with very fine natural granularity and subtle compacted-earth colour variation, rather than oversized cracked stones, weeds and lumpy rocks. Remove all scattered central bushes/stones so buildings and narrow cobbled streets can be placed naturally on level foundations. Retain a convincing dimensional sculpted perimeter with shaded cliff faces and detailed date-palm groves. Improve fine material detail and visual depth without noisy repeated patterns. Maintain restrained warm honey/ochre/ivory palette matching original sandstone and terracotta miniature building sprites.
This is the empty starting level1 plain, not a developed city. No roads baked into terrain, no paving grid, no buildings, no plots, no text, no people. Everything stays inland dry desert, no water, river, boats, deities, borders or UI. Land fills every edge; crisp sophisticated pre-rendered3D game environment, not photographic aerial terrain. Preserve original framing for exact overlay registration.
```
