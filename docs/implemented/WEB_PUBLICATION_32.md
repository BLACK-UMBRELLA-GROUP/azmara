---
id: DOC-AZM-0023
type: REPORT
status: CURRENT
feature: BUILT AND DELIVERED
purpose: Protected start view and Dev view zoom private web delivery
links: []
owner: AZMARA chat
---

# Protected start view and Dev view zoom private web delivery

18 October 2026 (Europe/London). DEC-105–106. Private web version 32 is live at
[azmara.app](https://azmara.app).

## Delivered

- The ordinary 100% start frame keeps the Town Wall gate, Town Hall and both
  labels clear of the floating town bar, desktop/phone dock and Dev button.
  The land still covers the whole viewport without stretching; unavoidable
  start-view crop is taken from the bottom so the gate remains visible.
- Dev → Dev workbench now includes `View zoom (test)`, a transient 50–100%
  whole-map slider in 5% steps with an on-screen percentage. It resets to 100%,
  is hidden in Gameplay and is never stored in town progress.
- Lower test values may expose the approved temporary sand surround. Labels
  remain screen-sized, phone interaction targets remain at least 44×44 CSS
  pixels, and the approved 55% building-art scale is unchanged.
- Release QA also fixes a focused Dev-button position shift, preserves touch
  taps before a drag, keeps native pinch separate from the map camera, and uses
  the approved bottom dock in short landscape/compact views.
- Pictures, saves, queues, spots, plot IDs, layouts, gameplay and the native app
  are unchanged.

## Publication record

- Site source commit:
  `550b30ab47045c694b4b05ffbdf4c34dead735f2`.
- Saved version:
  `appgprj_6ac7643d3f588191ba2157dfe1972c3d~appgver_fe8db4ccd2588191bde0ea0610a13a9f`.
- Deployment: `appgdep_6ad4de7ca76881919d8e1cc59d333d30`, terminal
  `succeeded`.
- The audited game runtime contains exactly 76 files / 122,226,435 bytes. The
  hosted source contains those files plus `.openai/hosting.json`: 77 files /
  122,226,535 bytes. The compressed archive is 121,614,390 bytes with SHA-256
  `db2905134c1a322769a9d93829df3fe3821626d265879d1be3488fec4797dcdb`.
- The Site remains custom owner-only: one owner, no viewers, groups or external
  visitors. `azmara.app` and its SSL status are active. No Site automation or
  auto-deploy is configured.

## Verification and rollback

All DEC-102/103/105 static checks and JavaScript syntax checks pass. Isolated
headless QA passed 12 map-control groups, 11 camera/input groups, all locked-land
and Dev-picker checks, eight desktop-overview groups, and full-screen Town,
Region and World checks on desktop, compact and phone. It covered protected
Fit, all-edge panning, Inspect/Fit, rotation, touch taps, browser pinch, active
queues, raw saved bytes and zero page/console/request errors. Thirty-four stage
and zoom captures plus the final 844×390 compact landscape capture were
inspected locally; visible Chrome was never opened.

Private web31 is the immediate rollback version:
`appgprj_6ac7643d3f588191ba2157dfe1972c3d~appgver_a8beaf8b835081918084e4a4187ef8bf`.
Do not clear browser storage when switching versions.

Known locked-scope gaps remain: non-Hall plot targets await the spot-map
decision; built-wall looks await final art; 1536×1024 masters can soften at
extreme zoom. These are not repaired by guessing.
