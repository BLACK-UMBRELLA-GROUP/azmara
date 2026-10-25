---
id: DOC-AZM-0014
type: REPORT
status: SUPERSEDED
feature: BUILT AND DELIVERED
purpose: Baked-streets private web delivery
links: []
owner: AZMARA chat
---

# Baked-streets private web delivery

14 October2026 (Europe/London). DEC-091. Version23 is confirmed live at
[azmara.app](https://azmara.app), with the same custom owner-only access: one
owner, no groups and no external visitors. No browser or native app was opened.

## Delivered

-80% default town-building presentation and the unsaved Dev Appearance1–100%
slider, retaining100/80/65 presets and44px minimum plot controls.
- Ten baked street PNGs: five layouts × desktop/compact. The active layout uses
one flattened image instead of live SVG route strokes/filters.
- Wider gate-to-Hall main street, side-connected packed-earth lanes for all21
movable sites, planted pockets and small empty-site stakes.
- Suppressed active legacy Oasis roads/entrances and the separate wall-approach
line so they do not double-paint the baked streets.

The current rear wall is unchanged. Levels24/26, road-material progression,
native app, saves/queues, plot IDs and fixed-role saved anchors are unchanged.

## Provenance

- Pushed source: `9f90424daa4a5dcac8ded430ae6e7eef5db80cf0`.
- Saved version23:
  `appgprj_6ac7643d3f588191ba2157dfe1972c3d~appgver_e825c8382f348191bd7a58f3e0b8d82a`.
- Deployment: `appgdep_6acebaf0f76c8191a1d317f478588913`, terminal
  `succeeded`.
- Native Sites URL:
  `https://azmara-private-preview.blackumbreallagroup.chatgpt.site`.
- Custom live URL: `https://azmara.app`.
- Archive: `/tmp/azmara-streets-publish.JkPACR/azmara-web23.tar.gz`.
- Archive SHA256:
  `bfe500976d42470453fc135f6f6e4d472c309cc7c84e1ce6e39440db4ca12603`.

The official Sites helper opened the existing source, committed/pushed and
packaged106 archive entries. A first packaging attempt occurred after the same
source commit was pushed but failed because the child package script could not
locate its bundled Node runtime. No deployment occurred from that failure. The
helper was rerun against the clean retained commit with that runtime on PATH;
packaging then succeeded and the exact commit was deployed.

## Verification and rollback

Source/assets pass the checks in
`evidence/2026-10-13-street-build/verification.json`. Eight inspected offline
renders cover desktop/compact start/50 Fit/close equivalents. These are not live
browser or device acceptance; the Owner tests manually under the no-Chrome rule.

Web22 remains the rollback version:
`appgprj_6ac7643d3f588191ba2157dfe1972c3d~appgver_69b7c5049174819190f9cfcae0428247`,
source `f8dbbc64ec7310df2524544abffb058a405f1cd0`. Redeploy it only if the Owner asks.
Do not clear browser storage or alter saved towns to roll back visuals.
