# Original mountain-backed town and front-wall assets — v18

Generated 11 October 2026 using the built-in ImageGen tool and imagegen skill.
This is an original fictional desert art direction, not a historical factual
claim or reuse of reference-game artwork. No CLI fallback or API key was used.

## Saved assets and provenance

| Project asset | Generated source | Native pixels / format | SHA-256 |
|---|---|---|---|
| `azmara-mountain-town-v18.png` | `<LOCAL_HOME>/.codex/generated_images/01a12b06-df07-7742-8b15-a059d0ba77ae/exec-8d0d8485-9b0a-44da-a966-ec614c905a04.png` | 1672 × 941 RGB PNG | `8647023b8d3f64b25386c30623cc6cddc114dd0d6353d1b56dc62bb7faa4bc0e` |
| `azmara-front-wall-stages-v18.png` | `<LOCAL_HOME>/.codex/generated_images/01a12b06-df07-7742-8b15-a059d0ba77ae/exec-5f4a1567-1f55-4a2a-ac86-efa5f747b33f.png` | 1536 × 1024 RGBA PNG | `2f753b9853e059a75ae7c7ad7bda26658a1cb9715fd89d8d18bfa3f903921689` |

Copies are byte-exact; generated originals remain in place. No pixel edits,
resampling, local cropping, alpha cleanup or source overwrites were performed.

## Inspection and native wall-row registration

Both generated sources were opened with view_image. The terrain has mountains
confined to the upper/back band and a continuous broad central/lower dry plain,
with no water, built town, wall, roads or plot markers. Wall artwork has three
distinct continuous shallow-chevron FRONT elevations: timber, adobe/brick,
and rich sandstone, not a repeated SVG ring or full enclosing fortification.

The model did not place rows in exact equal thirds despite the submitted prompt.
Runtime must use these full-width, nonuniform native source rectangles:

| Row | Material | Native source rectangle x,y,width,height |
|---|---|---|
| 1 | Timber palisade | `[0, 0, 1536, 307]` |
| 2 | Adobe / brick | `[0, 307, 1536, 316]` |
| 3 | Sandstone | `[0, 623, 1536, 401]` |

Do not use 341⅓-pixel equal cells: those would clip/admit neighboring towers.
At alpha ≥16, principal painted intervals are y42–297, y313–612, y629–973.
Breaklines y307 and y623 have maximum alpha1. Exact native source-space clips
retain each complete wall and its attached soft shadow without adjacent bodies.
These are viewBox/source-clip registrations, not edited or cropped files.

Read-only PNG alpha audit: 782,655 pixels are alpha0 of 1,572,864 total;
maximum alpha254, with584 pixels at254 and no255. The tool's material pixels
remain nearly opaque (alpha200–254). Thus pixel-proof sampling should select
actual alpha ≥200, not require nonexistent alpha255. The brown backing visible
in the direct viewer includes hidden RGB in alpha0 pixels; it is not an opaque
painted scenic rectangle. A few very low-alpha gutter/noise pixels remain and
were not locally cleaned. Structural tower counts are approximate rather than
guaranteed equal to prompt counts. Render/browser acceptance belongs to the
integration QA, not these source-art checks.

## Exact submitted terrain prompt

```text
Use case: stylized-concept.
Asset type: production-ready original AZMARA desert strategy-game terrain background, landscape 16:9 composition.
Primary request: an expansive inland desert town playing field viewed from a high elevated orthographic isometric strategy camera. Only the distant BACK / UPPER band, approximately the top 22 percent of the image, has layered warm sandstone mountains and rugged mesas. These distant mountains create depth behind the future town. The remaining central and lower 78 percent is one enormous calm continuous gently graded open warm sandy settlement plain, extending openly off BOTH side edges and the front/bottom edge. Do not enclose the plain in a bowl or ring. No near mountains or rock banks on the sides or foreground.
Style/medium: richly hand-painted pre-rendered 3D/isometric game environment, polished believable depth and materials, fine restrained sand grain, softly worn hard-packed ochre soil with sparse pebbles, not a photorealistic photograph and not flat vector art. Match warm timber, adobe and sandstone building sprites lit from upper left; delicate shadows cast lower right. The central/lower field must have subtle quiet texture at building-scale, not big distracting stone patterns or bright dune strips. Sparse tiny vegetation only along the far upper foothills, no central obstacles.
Composition/framing: high camera looks mostly down over ground, no sky/horizon strip; distant upper mountains may recede in warm atmospheric haze but remain dimensional. Wide 16:9 with unobstructed broad contiguous playable clearing covering nearly all visible foreground. No ground-planning lines.
Constraints: original fictional desert geography, no copied game map or artwork, no actual rivers, lakes, sea or water, no buildings, roads, pavements, walls, slots, grid, houses, city, structures, characters, UI, labels, text, logos or watermark. No large foreground features. Do not put mountains around all sides; mountain range ONLY behind the town across the upper band.
```

## Exact submitted transparent-wall prompt

```text
Use case: stylized-concept.
Asset type: original AZMARA transparent game sprite sheet containing THREE complete continuous FRONT town-wall elevations, in three equally spaced horizontal rows.
Primary request: exactly three wide wall sprites, one in the top third, one in the middle third, one in the bottom third, with clean completely transparent gutters between. Each row contains ONE whole continuous long frontal city-wall elevation, spanning about 90 percent of image width, viewed from a high elevated isometric strategy-game camera. Its footprint is a very shallow chevron: broad left and right curtain wings meet at a central gate slightly nearer the viewer, outer ends only slightly farther back. This is ONLY the FRONT EDGE of a town, NOT a full enclosing ring, NOT rectangle, not back wall, no side returns. Each wall is one cohesive natural varied structure, not a row of identical copied modules.
Row 1: weak rough brown timber palisade, irregular weathered wooden stakes and horizontal braces, a simple closed wooden central gate, two low modest lookout posts, small attached ground shadow.
Row 2: stronger weathered warm adobe and fired brick curtain, wide closed wooden central gate, three modest different-sized fortified towers, dimensional battlements and worn edges, natural masonry details.
Row 3: rich strong warm cream sandstone fortification, sculpted shaded battlements, a detailed central arched wood-and-bronze gate, varied masonry towers with handsome brick accent courses, coherent deep relief, no religious symbols.
Style/medium: polished richly shaded hand-painted pre-rendered 3D game sprites, original fictional Golden Age desert architecture; believable scale and irregular materials, fine weathering, substantial lit top surfaces and shaded wall faces. Not flat vector ribbons and no black cartoon outlines. Upper-left sunlight with soft attached contact shadows toward lower right. All three rows share the same width and camera/perspective, centered with generous 5 percent left/right margins and no cropping.
Composition/framing: landscape sprite sheet; three equal-height row cells each about one third image height; complete wall silhouette entirely within its own row including towers, roof/gate tops and attached soft shadows, with transparent padding all around each wall and broad horizontal transparent gutters. No overlap or neighboring sprite paint in gutters.
Constraints: background must be genuinely transparent alpha, not checkerboard painted into the image and not a white or sand rectangle. No scenic ground/background, no mountains, no trees, no town buildings behind wall, no roads, no rivers, no water. Only three separate wall fronts and small attached soft shadows. No text, labels, numbers, UI, logos, watermark or gods. No full enclosing perimeter or circle.
```
