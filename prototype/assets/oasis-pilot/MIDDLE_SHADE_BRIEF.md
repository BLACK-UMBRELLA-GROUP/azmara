# Developing shade — exact25 pilot

12 October 2026 (Europe/London), DEC-078. Static original raster scenery for
desktop/Staggered25 only. Not an animation, owned building, wall repair,
phone export or published asset.

One built-in ImageGen call, one attempt of the permitted two. Text-only
generation; no other-game or screenshot input. Full prompt is in
`shade-middle-prompts.json`. Original generated source remains unchanged at
`<LOCAL_HOME>/.codex/generated_images/01a110d7-7840-71d3-b4bb-ec945e585d0b/exec-0645b55a-2eb3-4992-a9fb-af4e2ad3cc75.png`.

Runtime `shade-middle-v1.png`:1254×1254 RGBA,1,052,711 bytes compressed,
6,290,064 RGBA pixel bytes (6.00MiB) before caches. Runtime SHA-256:
`e3176b32288a12d5e0a372321d356b56cbd36c564011b884f9ca6538255dc325`.
Original SHA-256:
`cb5e520f0e267c8faf99155e908a7de174d96ad4565f093e66baa4c71e78fb03`.

## Registration

| Motif | Complete source component | Padded source crop | Maximum world envelope |
| --- | --- | --- | --- |
| M1, two modest palms/dry scrub/low timber seat | 45,353,711,569 | 37,345,727,585 | Center1580,1297;250×160 |
| M2, one modest palm/dry scrub/bare soil | 821,473,408,449 | 813,465,424,465 | Center2910,1156;174×152 |

The eight-connected nonzero-alpha audit includes complete crowns, ground and
shadow feather down to alpha1. Crops are disjoint and padded by8 pixels, not
equal atlas cells or alpha>8 body trimming. Exact crop clips and a single
uniform `meet` fit keep each whole motif inside its reserve; no separate X/Y
stretch, enlarged anchor or clipped planter base. Each motif owns its baked
warm lower-right shadow/contact; no extra shadow is added.

6,661 detached alpha1 noise pixels lie outside registered crops and are not
displayed; they remain unchanged in the source. `fullMotifOwnership` is true,
but `fullAtlasAlphaOwnership` is deliberately false. Original dimensions and
all visible paint are retained. Metadata/audit/byte counts are in
`shade-middle-v1.metadata.json`.

The already Owner-authorized `prototype/tools/clean-atlas-edges.py` method
clears only exterior/isolated exact-red/yellow alpha1–8 matte fringe:11,442
selected alpha values. All RGB, all noncandidate RGBA and every alpha>8 pixel
remain unchanged; the cleanup is idempotent. Protected low-alpha fringe is
not removed by a broader mask. Judge the game composite, not the image
viewer's display of transparent RGB. The registrar reproducibly reuses that
unchanged helper; it does not edit the old helper or any prior asset.

Reproduce with the existing bundled Python:
`evidence/2026-10-12-oasis-level-25-build/register-middle-art.py --source <original> --version 1`.
No new dependencies or generation calls are made by registration.

## Scope and rollback

Only a rendered developing25 frame requests this atlas. Existing0/1/50 use
their original atlas; other layouts/levels and compact views retain the prior
renderer. A desktop session may retain the image after leaving25. These
source-pixel counts are not measured process RAM or phone acceptance.

Existing ground-start/street-stone and the closed-fountain crop are reused.
No new ground map, river/rill, market building, actor, motion, collision or
economic effect. The proposal's generated whole-town PNG is never loaded by
the game. Existing wall/back/front/gate art and source are untouched.

Restore only scoped module/index copies from
`evidence/2026-10-12-oasis-level-25-build/before-source/` after checking unrelated
later edits, and stop referencing this atlas. Retain evidence/originals; no
save reset/migration or whole-repository rollback.
