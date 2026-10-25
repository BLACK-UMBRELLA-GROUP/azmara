---
id: DOC-AZM-0003
type: REPORT
status: CURRENT
feature: BUILT AND DELIVERED
purpose: Baked streets and 80% town scale
links: []
owner: AZMARA chat
---

# Baked streets and 80% town scale

Completed locally on14 October2026 under DEC-091. Publication is recorded in a
separate web delivery note after the private deployment reaches a terminal state.

## Implemented

- Ten transparent road/ground PNGs cover five layouts × desktop/compact. Only
  the active layout/profile is loaded; each file is below1MB.
- A wider sandstone main street joins the valley gate to the Town Hall square.
  Packed-earth lanes use only the two plot-edge axes and meet all21 non-Hall,
  non-wall sites along a side. There is no perimeter ring.
- Small turquoise stakes replace permanent empty-plot diamonds. Interactive
  controls still enforce44px minimum targets and reveal their state separately.
- Runtime art defaults to80% scale. Dev Appearance has a transient1–100% slider
  and keeps the100/80/65 comparison presets; it never enters saved state.
- The active town no longer draws the old Oasis roads, entrances or separate
  wall-approach line. Buildings/pins use the same base anchors as the baked art.

## Verification

`evidence/2026-10-13-street-build/verification.json` passes all source, asset,
axis, contact, pixel-bound and budget checks. Eight inspected offline images
cover Grid start/50 on desktop and compact at Fit/close equivalents. The images
are labelled offline QA; no browser was started under the Owner's standing rule.

Checklist:

- [x] Roads only follow the two plot-edge directions.
- [x] Every movable plot meets a road along one side.
- [x] The gate-to-square main street is clearly wider than lanes.
- [x] No ring road; every generated branch terminates at a valid destination.
- [x] Baked painted surfaces have texture, shadow and irregular sand edges.
- [x] Junctions are flattened into one PNG layer.
- [x] Eight planted pockets on desktop and six on compact break up bare ground.
- [x] The implementation retains the approved target's scale, materials and
  route hierarchy; all-layout geometry is deterministic from the same rules.

Actual web rendering, input, safe areas and device performance still need the
Owner's manual review. Geometry and offline visuals are not claimed as browser
acceptance.

## Files and rollback

Runtime changes are `prototype/app.js`, `oasis-town.js`, `styles.css`,
`index.html`, new `street-ground.js`, and `assets/streets/`. The deterministic
build source is `prototype/tools/build-street-grounds.cjs`. Remove the new module
and assets, restore web22 versions of the four existing files and redeploy web22
to roll back. Do not delete saves or reset plot/layout data.

During this round old redundant raw debug SVGs in the historical valley-wall
evidence folder were gzip-compressed to recover disk space. Their PNG evidence,
receipts and source were untouched; `gunzip` restores each SVG exactly.
