---
id: DOC-AZM-0020
type: REPORT
status: SUPERSEDED
feature: BUILT AND DELIVERED
purpose: Locked land stages private web delivery
links: []
owner: AZMARA chat
---

# Locked land stages private web delivery

17 October 2026 (Europe/London). DEC-100 and DEC-101. Private web version 29
is live at [azmara.app](https://azmara.app).

## Delivered

- The eleven locked land pictures now follow the completed Town Hall look at
  levels 1, 5, 8, 12, 17, 22, 28, 34, 41, 45 and 50.
- The locked picture is the complete land layer. Old foundation, road, scenery,
  water-channel and canyon overlays are not drawn over it.
- Town Hall and Town Wall targets remain registered to the approved painted
  positions. Other plot targets intentionally retain their current IDs and
  positions until the spot map is locked.
- Town, Region and World occupy the full viewport on desktop and phone. There
  is no outer game border or reserved sidebar strip; the town bar, dock and Dev
  button float above the game.
- The Dev land picker changes the temporary Town Hall test level through the
  real milestone rule and does not save the override.

## Publication record

- Site source commit:
  `c2ad0e5ada719c3d131aa5f9df23bd7518e26a01`.
- Saved version:
  `appgprj_6ac7643d3f588191ba2157dfe1972c3d~appgver_3841fcbd51288191b0d753270dbde061`.
- Deployment: `appgdep_6ad3a6193d408191830b1f84216bf5a8`, terminal
  `succeeded`.
- The audited game runtime contains exactly 76 files / 122,235,026 bytes. The
  hosted archive contains those files plus `.openai/hosting.json`: 77 files /
  122,296,320 bytes, content hash
  `sha256:e7dbf67be2be4f3c4cdb1903aa24e30e0ca325f450514a06de278b4bf3fee5de`.
- The deployment remains custom owner-only: one owner, no groups and no
  external visitors. No auto-deploy is configured.

## Verification and rollback

All eleven locked stage files, the stage rule, transient Dev picker, completed-
upgrade timing, script parsing and exact publication allowlist pass. A permitted
isolated headless check verified the live custom domain at 1440×900 and 390×844:
Town, Region and World each reach all four viewport edges with zero CSS border,
page error or console error. Visible Chrome was never opened.

Private web28 remains the immediate rollback version:
`appgprj_6ac7643d3f588191ba2157dfe1972c3d~appgver_009626dc44d88191ac3ee9c1f11b0472`.
Do not clear browser storage when switching versions.

Known locked-scope gaps remain: non-Hall plot targets await the spot-map
decision; built-wall looks await final art; 1536×1024 masters can soften at
extreme zoom. These are not repaired by guessing.
