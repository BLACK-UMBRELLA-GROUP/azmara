# Rear valley wall — implemented draft

12 October 2026. DEC-086 authorizes the preferred option A, including only
wall-01's rear-anchor relocation and private web publication. This is an
illustrated town, not a new 3D engine or defence simulation. Browser acceptance
remains manual under DEC-084; no Chrome, headless browser or server was launched.

## Composition and registration

One short wall with a central gate and exactly two painted gate towers sits
between rear sandstone cliff shoulders. The foreground remains open; no side
returns, front curtain or ring is active. Original ring assets and pre-change
source remain available for rollback. New original art uses AZMARA references
only, not Ikariam imagery.

World gate centres are desktop `(2100,400)` and compact `(3150,1620)`.
The compact core-local wall anchor is `(850,-120)`. Atlas crops are registered
by the measured doorway centre, without stretching. Complete crop/body/shadow
bounds, gate target and a short approach feed the presentation envelope.
The broad cliff image is not the Fit envelope: only its bounded near-pass
focus area is included, leaving the playable town dominant.

Wall art follows its own completed level: timber1–10, adobe11–32,
sandstone33–50. The existing uneven level milestones remain. An unbuilt wall
does not appear just because the Hall is high level. The start has only the
wooden Hall and an open pass; Dev Ideal town can temporarily show a built wall.
Dev building review and catalogue use the new cropped material art as well.

Ground, roads and scenery render first, then rear cliff terrain and the
back-only wall raster; ordinary DOM buildings remain above the landscape.
There is no new foreground wall layer, walking actor or collision system.
No other building overlaps the reserved wall/terrain envelopes in the checked
five-layout desktop/compact geometries. Actual browser stacking is a manual
check, not established by the offline renderer.

## Art and scope

Two runtime PNGs live in `prototype/assets/valley-wall/`: the original cliff
strip and cleaned three-material wall atlas. Their prompts, source references,
original paths and registration are in `ART_PROVENANCE.json`. One generation
attempt was used for each. The existing owner-authorized edge cleaner clears
only eligible exterior red/yellow pixels at alpha1–8; original bytes and all
other pixels remain preserved. The runtime clips complete measured source
rows, not arbitrary fragments pasted along a route.

The Town backdrop now uses quieter existing ground, rather than a photo-like
canyon behind the isometric sprites. A valley-specific Oasis option suppresses
only the baked northern mountain band; without that option the historical
Oasis outputs are byte-identical. Accepted desktop/Staggered0/1/25/50 scenery
eligibility, source sockets and levels remain unchanged. Phone and other
layouts keep their historical street/scenery fallback; this is not a full
Oasis rollout. Levels24/26 remain approved but held, with a fresh placement
check and separate Level24 Caravan entrance check required before resuming.

All23 plot IDs and the other22 base anchors remain exact. Necessary responsive
presentation packing can move rendered controls, not saved identities or base
layout definitions. Save, queue, refund, storage and timer functions/constants
remain unchanged; no Owner browser data was accessed or reset. Native files,
existing art and historical evidence remain frozen.

## Offline evidence — not browser screenshots

The filesystem-only renderer embeds actual PNG bytes and invokes the real
pure wall/Oasis/building modules plus extracted Fit/packing functions. It
reserves the sidebar space but does not execute DOM/CSS, input, real screen
CTM, safe areas, device orientation or GPU/RAM behavior. These images establish
an inspected placement/art draft, not live-browser or phone acceptance.

Before, desktop ideal50:

![Offline before desktop50](../../evidence/2026-10-12-valley-wall-build/before-offline-2026-10-12T20-49-19-581Z/before-offline-desktop-staggered-hall50-wall50.png)

After, desktop ideal50, final frozen source:

![Offline after desktop50](../../evidence/2026-10-12-valley-wall-build/after-offline-2026-10-12T21-24-05-575Z/after-offline-desktop-staggered-hall50-wall50.png)

After, phone ideal50:

![Offline after phone50](../../evidence/2026-10-12-valley-wall-build/after-offline-2026-10-12T21-24-05-575Z/after-offline-phone-staggered-hall50-wall50.png)

Final frozen-source analytical checks:55 geometry groups plus220 responsive
Fit/MAX probes across110 narrow-desktop fixtures pass. The latter use11 widths
1024–1200,600/720 heights and all five layouts. All23 target pairs,44px minimum
dimensions and all-material wall/cliff reservations clear. Failed greedy
packing was corrected with exact obstacle-edge candidates, bounded alternate
orders and, only on failure, a6% Fit cap; at most one framing retry occurred
in those probes. Compact keeps its existing eight-iteration camera branch.
Twenty-six model/queue functions, eight storage/timing constants and nine
JavaScript parser checks pass. Pre-staging guard passes1,346 protected records.
These are static/pure-model results, not a live browser test suite.

Root inspected the final ten layout/profile images, desktop/phone start/50,
the constrained1024×600Circle render and the material examples. Complete
final render sets:
[ten states](../../evidence/2026-10-12-valley-wall-build/after-offline-2026-10-12T21-24-05-575Z/offline-receipt.json),
[ten layouts](../../evidence/2026-10-12-valley-wall-build/after-offline-2026-10-12T21-24-04-511Z/offline-receipt.json),
[constrained desktop](../../evidence/2026-10-12-valley-wall-build/after-offline-2026-10-12T21-26-19-287Z/after-offline-desktop-circle-hall50-wall50.png).
The [final QA summary](../../evidence/2026-10-12-valley-wall-build/QA_SUMMARY.md)
retains source hashes, passing/failing receipts and all21 final PNG records.
After authorized Site synchronization, the guard separates1,262 unchanged
non-staging records from84 touched Site runtime records; the publication audit
checks their actual committed bytes, not just a permissive staging exclusion.

Confirmed delivery: private [web21](WEB_PUBLICATION_21.md) is live at
[azmara.app](https://azmara.app). This confirms deployment, not manual art/input
acceptance. The previous web20 remains available for requested rollback.

The old phone render omits its historical DOM margin pattern; that unpainted
outer margin is an offline-render limitation, not proof of a live-game bug.
Failure receipts are retained alongside subsequent corrections. Static target
checks caught overlapping desktop packing candidates before publication;
those are not erased or relabeled as passes.

## Remaining manual review and rollback

Open the existing site manually and refresh, without clearing browser storage.
Inspect Town Fit/maximum zoom, wall gate clicks, all five layouts, compact/phone
drawer, sidebar split, touch orientation and actual paint/target alignment.
In Dev, Appearance → Ideal town50 is a temporary review, not a saved upgrade.
Exit review or switch Gameplay to return to actual progress. The draft uses
full-alpha bounds and the existing pixel-registration correction, but actual
CSS/device-pixel alignment is not screenshot-verified on this final source.

Rollback copies of the nine scoped existing files are in
`evidence/2026-10-12-valley-wall-build/before-source/`; only six actually changed
runtime files need restoring. The two new art files can stay inert when the
old source is restored. Do not delete old wall art or reset player storage.
For hosting, preserve the previous saved version20/source
`63914fb459517d1dcd22ef72aa67b8556bbea1ef` for an explicitly requested rollback.
Publication provenance is recorded separately after confirmed deployment.
