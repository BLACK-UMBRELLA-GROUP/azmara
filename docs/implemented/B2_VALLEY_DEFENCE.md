# Revised B2 valley defence implementation

Implemented 14 October 2026 under DEC-093.

## Delivered

- The Town wall is no longer a detached gate placed on flat sand. Three
  original transparent scenes integrate timber, adobe and sandstone defences
  into the existing canyon and preserve a wide open caravan gate.
- Completed wall level controls the scene: no wall at level0, timber at1–10,
  adobe at11–32 and sandstone at33–50. Town Hall level does not build it.
- The baked main boulevard is150 world units wide on desktop and104 on compact
  for all five layouts. Existing lanes remain52/38. Every layout keeps21/21
  movable-plot side contacts and the two approved isometric axes.
- Town buildings remain at55%. Plot IDs and positions, saves, queues, five
  layouts, fixed-role anchors and the held Levels24/26 work are unchanged.

## Art and source

Runtime art lives in `prototype/assets/valley-wall/` as the three
`azmara-valley-defence-*-v3.png` files. Exact prompts, input files, hashes and
registration are recorded in `B2_ART_PROVENANCE.json`. No Ikariam image was
used as generation input. The previous wall atlas and all v1 street layers are
retained for rollback.

The ten wider ground layers are `prototype/assets/streets/*-v2.png` and are
selected by `prototype/street-ground.js`. `prototype/town-wall.js` registers
the integrated scene placements and suppresses the separate bare canyon only
while a built defence is active.

## Verification and limits

`evidence/2026-10-14-b2-valley-wall/verification.json` records144 passing
source, hash, alpha, stage, gate, tower, road-contact and evidence checks.
Sixteen labelled offline Staggered renders cover desktop/compact, wall
levels0/1/11/33 and Fit/MAX. No browser was opened, so live Chrome/device
appearance, interaction and performance remain for Owner review.

## Rollback

For web, redeploy private version24. Locally, restore `app.js`, `index.html`,
`preview.html`, `street-ground.js`, `town-wall.js` and the streets manifest to
their pre-DEC-093 state. Retained v1 street images and prior wall files make the
visual rollback independent of saved-town data; do not clear browser storage.
