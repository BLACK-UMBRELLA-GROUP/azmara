---
id: DOC-AZM-0017
type: REPORT
status: SUPERSEDED
feature: BUILT AND DELIVERED
purpose: Appearance dialog repair private web delivery
links: []
owner: AZMARA chat
---

# Appearance dialog repair private web delivery

14 October 2026 (Europe/London). DEC-094. Version26 is confirmed live at
[azmara.app](https://azmara.app), with the same custom owner-only access: one
owner, no groups and no external visitors. No browser or native app was opened.

## Repair

- Appearance is bounded to at most1120×880 CSS pixels and centred within the
  game area with visible town around it.
- Its dimmed surround is clickable; backdrop, ×, Return to actual town and
  Return to town all use the existing close/restoration lifecycle.
- The55% default, unsaved comparison controls and all game/save data are
  unchanged. Only `styles.css`, `index.html` and `preview.html` changed.

## Provenance

- Pushed source: `954a9a82158895da723159494a45cbfd6dcb8274`.
- Saved version26:
  `appgprj_6ac7643d3f588191ba2157dfe1972c3d~appgver_37e2bcf7ce308191802bb3a59c83d33d`.
- Deployment: `appgdep_6aced5d8b0388191ad34aa215b8f028f`, terminal
  `succeeded`.
- Custom live URL: `https://azmara.app`.
- Archive: `/tmp/azmara-appearance-web26.TIRsUO/azmara-web26.tar.gz`.
- Archive SHA256:
  `dc088d1ac570f92f8da886a128a619741e7177e203442912201186ed6223c1fd`.

## Verification and rollback

`evidence/2026-10-14-appearance-modal-fix/verify.cjs` passes17 source and exit
path assertions. The staging receipt records three byte-exact changed files,
111 retained runtime files and an unchanged hosting manifest. The Owner's
no-auto-Chrome rule means live click, phone and visual acceptance remain manual.

Web25 remains the rollback version:
`appgprj_6ac7643d3f588191ba2157dfe1972c3d~appgver_7cc3a919a53c8191938763269526c515`,
source `63079a585e538b1ff0ba2260f60001379f5e3dcb`. Redeploy it only if requested;
do not clear browser storage.
