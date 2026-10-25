---
id: DOC-AZM-0022
type: REPORT
status: SUPERSEDED
feature: BUILT AND DELIVERED
purpose: Simplified Dev workbench and midpoint camera private web delivery
links: []
owner: AZMARA chat
---

# Simplified Dev workbench and midpoint camera private web delivery

18 October 2026 (Europe/London). DEC-102–104. Private web version 31 is live at
[azmara.app](https://azmara.app).

## Delivered

- The saved Academy is removed and the Dev session begins temporarily at Land
  Stage 1 without changing real progress.
- Dev now exposes separate Land Stage and approved-building dropdowns, bounded
  manual Coins/Timber/Clay test inputs, and the unchanged Reset Plots control.
  Appearance Review is removed.
- The town starts at the true cover/minimum zoom centred on the land picture's
  midpoint. Wide-screen crop is shared between the top and bottom; phones fill
  height and begin centred for sideways panning. Manual panning can reach every
  image edge without revealing a margin.
- Locked art, saves, queues, plot IDs, layouts, Gameplay mode and the native app
  are unchanged.

## Publication record

- Site source commit:
  `2af1191ff6084172f9478d7a9708e92459a648ae`.
- Saved version:
  `appgprj_6ac7643d3f588191ba2157dfe1972c3d~appgver_a8beaf8b835081918084e4a4187ef8bf`.
- Deployment: `appgdep_6ad49be8bfd08191a11eb3d951a369fa`, terminal
  `succeeded`.
- The audited game runtime contains exactly 76 files / 122,212,481 bytes. The
  hosted archive contains those files plus `.openai/hosting.json`: 77 files /
  122,212,587 uncompressed bytes. Its compressed archive is 121,610,940 bytes
  with content hash
  `sha256:f3b20316b4b0d48dd22189a6022bf3bebfdef4f8cb46a9e1ee99b6721b25bc4e`.
- The Site remains custom owner-only: one owner, no viewers, groups or external
  visitors. No Site automation or auto-deploy is configured.

## Verification and rollback

DEC-102/103 source, land-runtime, locked-land and town-bar checks pass. The
Owner-authorised local 3420×2069 capture was inspected before publication and
showed the lower oasis, fields and palms with the cover crop shared across the
top and bottom. Publication did not open visible or headless Chrome; live
acceptance remains the Owner's manual refresh.

Private web30 is the immediate rollback version:
`appgprj_6ac7643d3f588191ba2157dfe1972c3d~appgver_18700c5694208191bffeda5f1e9f349c`.
Do not clear browser storage when switching versions.

Known locked-scope gaps remain: non-Hall plot targets await the spot-map
decision; built-wall looks await final art; 1536×1024 masters can soften at
extreme zoom. These are not repaired by guessing.
