# Town markers and atlas artwork — visual pass 1

Date: 10 October 2026. Authority: DEC-046/DEC-047. Built-in ImageGen mode.
Original inputs only; no reference-game pixels, maps or labels were reused.

## Marker

`assets/azmara-empty-plot-v4.png`: transparent 1536×1024 edit of our original
`azmara-empty-plot-v3.png`, removing its flag/pole while preserving the ground.
The plus symbol is accessible code-native SVG, not baked into the raster.
DEC-050 subsequently removes that overlay; the transparent ground remains.
`wall-reserve-v1.svg` and `freighter-dock-reserve-v1.svg` are original native
vector scenery, not constructed infrastructure.

Generator output: `<LOCAL_HOME>/.codex/generated_images/01a110d7-7840-71d3-b4bb-ec945e585d0b/exec-ab327ea8-0bac-45d2-a395-8743db9235b4.png`.

## Island

`assets/azmara-island-terrain-v1.png`: opaque 1536×1024 illustration generated
using original `azmara-desktop-terrain-v2.png` only as a palette/style reference.
The atlas repeats this first terrain across fictional island previews. Placements,
resource badges and labels are native UI. The sea-only edge mask is a CSS blend;
it does not crop the island's geography. More terrain variants remain future art.

Generator output: `<LOCAL_HOME>/.codex/generated_images/01a110d7-7840-71d3-b4bb-ec945e585d0b/exec-3ed6d017-108a-4fce-8d64-50c5431ccd2e.png`.

### Seamless coastline revision — DEC-051

`assets/azmara-island-terrain-v2.png` is a built-in ImageGen background-extraction
edit of our v1 terrain, not a new reference-game import. It retains the original
land geometry and a narrow irregular shallow-water fringe, with genuine alpha
transparency offshore. This supersedes the v1 rectangular sea/CSS edge-mask
approach. The 1536×1024 RGBA image has fully transparent corners and 551,208
fully transparent pixels. The original v1 remains preserved. Settlement counts,
positions and labels are code-native rather than baked into the illustration.

Generator output: `<LOCAL_HOME>/.codex/generated_images/01a110d7-7840-71d3-b4bb-ec945e585d0b/exec-5d2073c1-98eb-44bb-b66c-82af83834951.png`.

Exact final prompt (built-in tool mode):

```text
Use case: background-extraction
Asset type: original AZMARA browser-strategy-game island terrain sprite
Input images: Image 1 is the edit target, our existing original island art.
Primary request: Remove only the rectangular deep-blue offshore ocean background. Return the SAME island as a clean irregular cutout on genuinely transparent pixels, not a painted checkerboard. Keep a narrow irregular turquoise shallow-water and foam fringe hugging all coastlines and offshore rocks; fade that fringe smoothly to full transparency before any rectangular canvas edge. Deep offshore water must be transparent, including water in bays beyond the narrow shoreline fringe.
Invariants: Preserve the island's exact silhouette, mountains, trees, clearings, beaches, offshore rocks, painterly style, scale, position and 3:2 canvas composition. Keep the full coastline uncropped. Preserve the original warm sunlit palette and all land geometry. The image will be composited over a continuous blue ocean in code.
Avoid: No new buildings, roads, markers, text, UI, plus symbols, flags, gods, decorations, borders or opaque rectangular ocean patch. No restyling. Actual alpha transparency required.
```

## Exact final prompts

### plot

```text
Use case: precise-object-edit. Asset type: transparent isometric game plot sprite for AZMARA. Input image is the edit target: the original soil-and-grass diamond reserve. Remove ONLY the tall blue flag and its tall pole. Replace that corner with an ordinary short stake matching the other three stakes. Keep the soil diamond footprint, short corner stakes, all ground texture, grassy edges, isometric camera, warm upper-left lighting and scale unchanged. Fully transparent background and no baked background colour, no flag, no labels, no plus icon, no new buildings. Output landscape 3:2 sprite composition with all ground fitting inside the canvas.
```

### island

```text
Use case: stylized-concept. Asset type: original browser strategy game island terrain for AZMARA, landscape 3:2 image. Input image is a style reference ONLY, not a scene to reproduce. Create one complete irregular lush island, seen from high oblique isometric viewpoint, surrounded by vivid deep blue sea on ALL four sides, with bright turquoise shallows and little ivory rocky cliffs. Fictional Islamic Golden Age-inspired geography, painterly 2.5D game scenery in the reference's warm sunlit green, ochre and blue palette. Wide mainland broken into natural peninsulas and bays, trees, palms, rocky upland in middle. Leave broad grass clearings around the periphery for about ten settlement sprites and two separate unobstructed interior clearings for a forest work site and mineral work site. Island takes approximately 80 percent width and 78 percent height with substantial sea margin. Rich textured grass and water, clean readable silhouette. Terrain ONLY: NO buildings, plots, houses, people, animals, ships, flags, gods, shrines, miracles, statues, text, labels, HUD or borders. Entire island visible, no cropping. It must be an original geography, not any existing game's island.
```
