# Academy design-stage atlas — original AZMARA draft

Built-in image generation only; no CLI, external API key or copied Ikariam artwork. The selected original is preserved unchanged as `azmara-academy-stages-v1.png`, 1254×1254 RGBA, with true transparent background. It has twelve independently isolated sprites in a 4×3 layout. The first eleven represent levels1/5/10/15/20/25/30/35/40/45/50; cell12 duplicates50 and is unused. CSS extracts tight padded per-stage regions so the transparent sheet gutters do not make the buildings too small. All levels1–50 are supported; intermediate levels retain the previous completed visual milestone.

On 10 October the Founder explicitly approved local edge-only pixel cleanup after a built-in cleanup attempt did not reliably remove the generated matte noise. Runtime sibling `azmara-academy-stages-v2.png` clears only the alpha of eligible exact neon-red/yellow pixels with alpha1–8. Exterior/isolated topology protects interior paint; all RGB values, other RGBA pixels, alpha above8, dimensions and original bytes remain unchanged. The reproducible script is `../../tools/clean-atlas-edges.py`; the complete final batch report is `edge-cleanup-report.json`. This is not a new generation, recolour, crop or resample.

Final original output: `<LOCAL_HOME>/.codex/generated_images/01a110d7-7840-71d3-b4bb-ec945e585d0b/exec-dabfb5e3-2baa-4bfc-9c4e-d697a74b61df.png`

The initial wide sheet was rejected for a double-width final sprite. Its first grid correction still touched row boundaries; a square-grid edit improved spacing, and the final thumbnail-spacing correction isolated all sprites. Original outputs remain intact and rejected variants are not shipped. The exact prompt chain follows.

## Initial generation

Original: `<LOCAL_HOME>/.codex/generated_images/01a110d7-7840-71d3-b4bb-ec945e585d0b/exec-88aa4d86-dfd3-479c-aed6-54435ad24720.png`

Use case: stylized-concept
Asset type: transparent strategy-game building sprite atlas for AZMARA
Primary request: Create one Academy progression atlas: eleven individually isolated Academy buildings on a genuinely transparent canvas. Input images are STYLE REFERENCES ONLY, not a layout to copy.
Style: match the reference's richly textured painterly 2.5D isometric game illustration, ivory plaster, warm terracotta brick, dark timber, restrained teal fabric, upper-left sunlight. Original architecture, no copied game assets.
Exact atlas layout: wide canvas, 4 equal-width columns and 3 equal-height rows. Exactly eleven sprites in reading order. Row1 levels1,5,10,15; row2 levels20,25,30,35; row3 levels40,45,50, with the bottom-right cell completely transparent and empty. Each sprite centered independently inside its own equal cell, ground/base centered near75% cell height; ample transparent padding on every side, no sprite touching a cell boundary or another sprite. No grid lines.
Academy identity: reading desks, book shelves, scroll racks and an astronomy instrument; educational courtyard buildings, never generic towers.
Stage progression: level1 a flimsy weathered wooden study shack with a single desk and scrolls;5 sturdy timber study house with tiled lean-to;10 small ivory classroom with timber porch;15 masonry school around a tiny reading courtyard;20 scholarly courtyard academy with library wing;25 larger library arcades and lecture wing;30 two clearly distinct lecture wings around reading court;35 expanded vaulted library halls and roof observatory;40 grand scholarly quad with arcades and study terraces;45 richer multi-wing academy with scholarly ornament and observatory;50 imposing but low-rise educational complex, large reading court and varied lecture/library wings, visibly more sophisticated than45.
Maintain consistent isometric orientation and grounded silhouette; progression changes structure and craftsmanship, not just decoration. Sprites should fit the same cell bounds; later complexes may fill more of the cell. No people, labels, numbers, lettering, borders, frames, scenery outside the small building base, checkerboard, white fill, logos, gods, sacred symbols, or high-rise tower clusters. Preserve real alpha everywhere outside the isolated buildings and their modest soft contact shadows.

## Equal-cell correction

Original: `<LOCAL_HOME>/.codex/generated_images/01a110d7-7840-71d3-b4bb-ec945e585d0b/exec-05a69175-2478-460f-8891-3f6515d7f017.png`

Use case: precise-object-edit
Asset type: transparent AZMARA Academy progression sprite atlas
Input image: EDIT TARGET, the Academy progression sheet.
Change only the layout and scale, preserve every building's design, materials, painterly isometric style and lighting. Correct this to a STRICT 4-column by3-row sprite sheet with TWELVE equal cells. Every cell contains exactly one independently centered complete sprite, with its entire footprint and shadow contained inside the central80% of that cell's width and central75% of its height. No sprite crosses the equal cell boundaries. Use these EXACT reading-order stages: row1:1,5,10,15; row2:20,25,30,35; row3:40,45,50,50. The two final cells each contain a separate duplicate of the complete level50 building, scaled down individually to fit the same single-cell width as every other sprite. Do NOT use a double-width final building. Overall canvas landscape1536×1024; each cell384×341.33. Cell centres X192,576,960,1344 and Y170.67,512,853.33. Scale sprites to fit around those centres with ample transparent gutters. No grid lines or labels.
Keep true transparent alpha outside sprites; no text, frames, backdrop, checkerboard, scenery, people, watermarks, gods or sacred symbols.

## Square canvas correction

Original: `<LOCAL_HOME>/.codex/generated_images/01a110d7-7840-71d3-b4bb-ec945e585d0b/exec-8b06f542-3fd3-463f-aee7-064c6aaeccea.png`

Use case: precise-object-edit
Asset type: production-ready transparent Academy sprite sheet
Input image: edit target.
Change ONLY spacing and canvas shape. Keep all twelve existing building designs exactly, but rearrange on a SQUARE canvas with four equal columns and three equal rows. Each cell is portrait shaped (cell width:height =3:4). This extra height must create clear transparent space between rows. Every complete building must be independently reduced to80% or less of its own cell width, with at least10% of a cell width of transparent padding to its left and right, and ample clear transparent padding above roofs and below ground bases. Each sprite is centred in its exact equal cell. No building, roof, foundation or shadow may touch or cross a cell boundary. STRICT4×3: row1 current first4; row2 current next4; row3 current last4 including two copies of final grand Academy. Do NOT resize later buildings larger than their available cell.
True alpha-transparent canvas and all gutters, no grid, no colour wash, no background, no text, no labels. Preserve painterly isometric architecture and lighting; no new objects or people.

## Final thumbnail spacing

Original: `<LOCAL_HOME>/.codex/generated_images/01a110d7-7840-71d3-b4bb-ec945e585d0b/exec-dabfb5e3-2baa-4bfc-9c4e-d697a74b61df.png`

Use case: precise-object-edit
Asset type: sprite atlas with LARGE empty gutters
Input image: edit target. Preserve the twelve Academy designs and their reading order.
Make ALL TWELVE sprites HALF THEIR CURRENT SIZE. This is a zoom-out/spacing correction, not a design change. Every building must look like a SMALL THUMBNAIL surrounded by lots of transparent space. SQUARE canvas, exact4 columns ×3 rows. Each building may occupy only50% of one cell width, never more than half. Leave the other50% width empty around it. Buildings stay centred in their own cells, NOT stretched to fill gaps. The last four grand Academies MUST shrink to the same small thumbnail width as the first wooden shack, including foundations/shadows. The large empty gutters are essential for sprite extraction. No sprite can touch another sprite or any cell edge. Preserve true alpha everywhere in the empty areas. No grids, borders, lettering, backdrop, glow, new props or people.
