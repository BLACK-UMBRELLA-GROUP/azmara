# Shade pockets — bounded original art pilot

12 October 2026 (Europe/London), DEC-075. Local desktop/Staggered Hall0/1 and50
only. Static pointer-transparent scenery, not a building, gameplay feature,
animation, phone rollout, wall repair or publication.

## Art and provenance

Exactly two built-in ImageGen attempts for one three-motif transparent atlas.
Attempt1 was text-only original AZMARA art; attempt2 edited that output only.
No reference-game art/screenshots were inputs. Original generated files remain
unchanged in the generated-images folder. Prompts are recorded separately in
`shade-pockets-prompts.json` and `shade-pockets-attempt-2.json`.

Runtime source: `shade-pockets-v2.png`, 1254×1254 RGBA, 1,711,825 bytes compressed,
6,290,064 bytes (6.00MiB) RGBA pixels before caches. SHA-256:
`c10e6e055792312ba35df9c644695b27ec881f97cec3334128dd3f0a9e7742f2`.
Original attempt2 SHA-256:
`b9754e7bf8fe745f402de183de2b43e09c5937ce437f44921fcc134d56d821fd`.
Attempt1's cleaned copy is retained for audit, not referenced by the renderer.

The Owner-authorized existing `tools/clean-atlas-edges.py` method clears only
selected exterior/isolated exact-red/yellow alpha1–8 fringe. 19,089 alpha values
were cleared; all RGB, all noncandidate RGBA and every alpha>8 pixel remain
unchanged. Some protected low-alpha fringe remains in source, deliberately not
removed by a broader mask. No resampling, repainting or opaque-body trimming.
Final game composites, not the image viewer's transparent-RGB presentation,
are the visual check for visible fringe.

## Complete motif ownership

Equal-cell cropping failed. The independent eight-connected nonzero-alpha
audit finds three large components, including every connected shadow/feather
pixel down to alpha1. Each receives an eight-pixel padded crop:

| Motif | Source crop x,y,w,h | Complete world envelope |
| --- | --- | --- |
| S0 young palm, dry scrub, bare earth | 21,150,502,441 | Center1580,1297;176×152 |
| S1 two-palm community shade court | 556,49,698,570 | Center1580,1297;288×184 |
| S2 palm, muted-teal shade and low seat | 47,630,693,583 | Center2910,1156;220×192 |

The source retains detached near-transparent noise. 2,126 alpha1 pixels fall
outside the registered crops and are not displayed. This is **complete motif
ownership**, not a claim that every source-atlas alpha pixel is owned. No
connected crown, trunk, floor or shadow component is omitted. Reproduce with
`evidence/2026-10-11-oasis-pockets-build/register-shade-art.py` using the bundled
Python; exact bounds/audit/cleanup are in `shade-pockets-v2.metadata.json`.

Runtime uses an exact crop clip and one uniform `meet` scale. Full envelope,
not only the soil contact, must clear protected plots/HUD/wall by24 world units.
Unsafe placements are omitted with a reason, never accommodated by moving a
plot, shrinking a control or clipping a palm base. No extra SVG/CSS shadow is
added: each motif owns its baked ground contact and warm lower-right shadow.
Mature uses only these two courts and the two unchanged closed fountains;
founding has no paving/stone planter/fountain.

## Scope and budget

One new atlas is requested only by the eligible desktop endpoint SVG renderer;
compact/unsupported-layout/intermediate-level frames do not request it. A
desktop session can retain it in the image cache after leaving an endpoint.
This is source pixel cost, not measured browser RAM or phone performance.
No moving details, rills, rivers, actors, extra controls or economic effects.
Existing ground/street/building/wall art survives unchanged.

Rollback restores only the saved `oasis-town.js`, `app.js` and `index.html` from
`evidence/2026-10-11-oasis-pockets-build/before-source/`, after checking for
unrelated later edits. Stop referencing the atlas; retain all evidence and
originals. No save migration/reset, native update or whole-repository reset.
