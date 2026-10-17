# Full-screen private web delivery 30

17 October 2026 (Europe/London). DEC-101. Private web version 30 is live at
[azmara.app](https://azmara.app).

## Delivered

- Town, Region and World fill the complete browser viewport on computers and
  phones. The game has no outer border, page margin or reserved sidebar strip;
  the town bar, dock and Dev button float above it.
- Compact Region and World targets now begin below the floating town bar, so
  northern locations remain reachable in short phone-landscape windows while
  the painted terrain remains full-bleed behind the controls.
- Every Options/More trigger now reports the dialog's open state correctly.
- The eleven exact locked land stages, completed-Town-Hall rule, Dev picker,
  save format, plot IDs and queues remain unchanged.

## Publication record

- Site source commit:
  `38385508a478049c7a9ef7b25430f7bf87707193`.
- Saved version:
  `appgprj_6ac7643d3f588191ba2157dfe1972c3d~appgver_18700c5694208191bffeda5f1e9f349c`.
- Deployment: `appgdep_6ad3c8a3bbbc8191abb6fc786c8ed772`, terminal
  `succeeded`.
- The audited game runtime contains exactly 76 files / 122,235,513 bytes. The
  hosted archive contains those files plus `.openai/hosting.json`: 77 files /
  122,296,320 bytes, content hash
  `sha256:39d8e132234b77cd3a8c6a3f60470c609809a0dba8435ad76a4166c72fdb0f4f`.
- The Site remains custom owner-only: one owner, no groups and no external
  visitors. No auto-deploy or Site automation is configured.

## Verification and rollback

Static, save, construction, camera, presentation, atlas, locked-land and
responsive smoke suites pass. An expressly authorised isolated headless check
then loaded the actual private custom domain at 1440×900 and 390×844. Town,
Region and World reached all four viewport edges with zero CSS border, page
overflow, page error, console error, failed request or HTTP asset error. The
six inspected captures are in
`evidence/2026-10-17-fullscreen-delivery/`. Visible Chrome was never opened.

Private web29 is the immediate rollback version:
`appgprj_6ac7643d3f588191ba2157dfe1972c3d~appgver_3841fcbd51288191b0d753270dbde061`.
Do not clear browser storage when switching versions.

Known locked-scope gaps remain: non-Hall plot targets await the spot-map
decision; built-wall looks await final art; 1536×1024 masters can soften at
extreme zoom. These are not repaired by guessing.
