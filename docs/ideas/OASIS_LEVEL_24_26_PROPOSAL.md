# Oasis Town — neighbouring Levels24 and26

12 October 2026 (Europe/London) · IDEA-013/DEC-080 · **Approved, implementation held**

Owner approved this exact scope but explicitly put it on hold while the local
sidebar and valley-wall concepts are reviewed. The new play-area geometry and
any later approved valley art require fresh full entrance/plot/ornament/HUD
clearance checks. No24/26 runtime extension is implemented. The original
proposal below records its approved reuse scope, not permission to resume now.

- Extend the accepted Level25 ground direction to its immediate neighbours,
  desktop/Staggered24 and26 only. No new artwork or generation calls.
- Preserve every accepted0/1/25/50 output, including mixed and temporary-review
  cases. Keep all other levels/layouts/compact views on their existing renderer.
- Wall fixes, phone/native updates, movement, rills and publishing remain paused.

## Why this is the next small test

**Observed, AZMARA:** Level25 now has quieter ground, selective civic paving,
two modest shade groups and one closed northern basin.24 and26 still use the
older canyon, thin road circuit and scattered props. Root opened the three
existing actual Fit captures below; no new game screenshot or image was made.

| Current24 — unchanged fallback | Accepted25 — local pilot | Current26 — unchanged fallback |
| --- | --- | --- |
| [Actual24 Fit](../../evidence/2026-10-12-oasis-level-25-build/qa-2026-10-12T00-40-12-270Z/after-level-24-fit.png) | [Actual25 Fit](../../evidence/2026-10-12-oasis-level-25-build/qa-2026-10-12T00-37-43-406Z/after-level-25-fit.png) | [Actual26 Fit](../../evidence/2026-10-12-oasis-level-25-build/qa-2026-10-12T00-37-43-406Z/after-level-26-fit.png) |

**Inferred:** that immediate return to an older scenery family makes the
single-state pilot feel inconsistent during adjacent upgrades.
**Proposed:** reuse the accepted middle ground at24–26 without flattening the
buildings' existing uneven progression or inventing new gameplay thresholds.
This only removes the24↔25↔26 scenery switch. The23/24 and26/27 boundary problem
remains; it is not a full1–50 progression solution or continuous interpolation.

## Proposed appearance

At24 and26 use the same quiet ground, restrained irregular Hall/qualified-Depot
forecourt, dry outer work yards, two registered developing shade motifs and one
closed northern fountain. Reuse existing texture and atlas crops exactly. Do
not add formal lawns, broad marble floors, detached street bars or a perimeter
road. Keep present building footprints, shadows, plot anchors, HUD and camera.

Minor local paving/landing quality follows `min(completed Hall, completed local
building)`, not a queued target or the source-art label. A low-level/missing Depot
must not earn the expanded shared forecourt; retain the Hall-only treatment.
Do not scatter decorations over empty sites or shrink their accessible targets.

There is no planned new UI, slider or control: Dev's existing temporary Ideal
Town/appearance review already offers every level. Exiting review/Gameplay must
restore the actual saved town without changing levels, queues or raw bytes.

## Source art is not the completed level

Read-only evaluation of the current `building-art.js` establishes:

| Role | Completed24 | Completed25 | Completed26 |
| --- | --- | --- | --- |
| Hall | art25, milestone22 | Same | Same |
| Warehouse | art25, milestone22; crop307,544,313,220 | Same | Same |
| Both Caravan Stations | art20, milestone20; crop7,479,309,277 | art25, milestone25; crop316,485,307,268 | Same as25 |
| Freight Depot | art25, milestone22; crop317,488,306,263 | Same | Same |

Other normal artwork changes also survive:24→25 advances Military Exchange,
Intelligence House and Iron Foundry;25→26 advances Provision House/Silver
Refinery and takes Workshop from art25 to30. Do not force all buildings to art25.

Hall/Warehouse selected source25 registrations match the exact source/stage/
crop at24 and26; Caravan25 registrations match26. That match is **not** fresh
world-clearance verification. Recheck actual fitted bodies, full paint widths,
shade crowns/shadows, plot controls, HUD and wall reserves in both frames.

Caravan20 has **no checked doorway registration**. A later approved pass needs
one new source-specific calibration and independently checked west/east guides,
or must omit those authored approaches with a reason if ambiguous/unsafe. Do
not transplant art25 UVs. Freight remains unresolved; no new Freight socket.

Crucially, do not add Caravan20 to the shared existing middle registry: an
accepted25 frame may already show saved/review art20 and omit its new approach.
Any new20 registration must be available only to the newly proposed24/26
scenery branch. Existing25 registry/order/rendering stays exact, including
mixed saved24 Caravans and temporary review20. Other uncalibrated sources retain
their present conservative contacts; no universal door/road claim.

## Files, effort, risks and undo — if approved later

One small reuse/calibration/integration/check pass. Expected runtime edits:
`prototype/oasis-town.js` for tightly gated24/26 eligibility, developing-scene
selection and separate source20 registration; `prototype/index.html` for that
module's cache string only. New calibration/QA evidence and live docs accompany
it. No `app.js`, styles, progression, building-art, layout, wall or native edit.
No engine, library, plugin/tool replacement or file moves.

**New runtime images:0.** Existing middle atlas is1.00MiB compressed/6.00MiB
RGBA pixels before caches and is reused, not duplicated. This is not a new phone
or process-RAM acceptance. The concept PNG must never become a background.

Risks: source20 thresholds, overlapping whole paint/shadow envelopes, accidentally
changing25 mixed/review output, moving the scenery discontinuity to23/27, and
the existing inconsistent cross-context fallback PNG captures. Preserve that
known QA limitation and failed/control receipts; do not mark it fixed because
one rerun passes or spend this art pass changing the renderer/camera to cure it.

Before edits save a fresh accepted25 module/index baseline, not the old pre25
copies. Roll back only the new
24/26 branch/registration and cache change after checking unrelated later edits.
Retain evidence; do not reset saves, edit old receipts or revert the repository.

## Bounded verification and approval gate

After a separate implementation OK:

1. Capture/open24 and26 Fit/Close and mixed low-level-building/paid-queue scenes.
   Calibrate actual20 source and both Caravan routes; omit safely when needed.
2. Compare accepted0/1/25/50 scene/SVG/controls and screenshots. Include25 with
   a saved24 Caravan and review20 so the new registration cannot leak backward.
3. Check source20/25/50 review binding while preserving actual saved quality.
   Preserve every23 ID/role/anchor/44px target, actual `min` quality, raw v3/
   legacy bytes and paid/valid10s receipts/deadlines through review/modes/reload.
   Check full actual rendered masks/paint, not only declared centre lines.
4. Confirm23/27, other layouts and compact fallbacks are unchanged. Use paired
   repeat controls before attributing old raster pixel mismatches to this pass;
   report inconclusive comparisons honestly, without tolerance/masking.
5. Keep all old art, wall/source, native, staged Site and historical evidence
   byte-exact. Stop with actual screenshots for Owner art review, no publication.

**Approved under DEC-080 but HELD at Owner request.** Resume only after Owner
direction following the sidebar/valley report. Source20 still needs its own
registration check; remeasure with the new viewport and any approved terrain/
wall reserves rather than borrowing pre-sidebar clearances. No wall work is
authorized by this held scenery scope.
