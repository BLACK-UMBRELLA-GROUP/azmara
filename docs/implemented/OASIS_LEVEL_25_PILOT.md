# Oasis Town — Level25 local pilot

12 October 2026 (Europe/London) · DEC-078/079 · **Implemented locally; shown direction accepted**

- Desktop/Staggered completed or temporary review25 only: maintained earth,
  a small Hall/Depot forecourt, two developing shade groups and one closed basin.
- Original buildings and actual source-stage schedules survive. No broad marble
  carpet, perimeter road circuit, river, new gameplay or moving details.
- Wall work, phone/layout/band rollout, native updates and publication stay paused.

## Owner acceptance — separate from capture-time checks

Owner's subsequent “continue” answers the shown25 Close image and “Does this
middle-stage direction look right?” DEC-079 accepts that bounded local visual
direction. Original inspection/QA receipts remain unchanged; their capture-time
`ownerArtAccepted:false` is historical, not rewritten. Older fallback raster
stability and all documented limits remain open. No runtime/image/save/delivery
change follows this acknowledgement. The next24/26 extension is proposal-only
in `docs/ideas/OASIS_LEVEL_24_26_PROPOSAL.md`, requiring its own implementation OK.

## Actual before and after

These are isolated1440×900 game captures, not generated whole-town pictures
or changes to Owner progress. The original proposal image is never a runtime
asset. Fit shows the full town; Close shows the existing camera's central view.

### Before — Fit

![Actual previous Level25 Fit](../../evidence/2026-10-12-oasis-level-25-build/qa-2026-10-12T00-40-12-270Z/before-level-25-fit.png)

### After — Fit

![Actual Level25 pilot Fit](../../evidence/2026-10-12-oasis-level-25-build/qa-2026-10-12T00-40-12-270Z/after-level-25-fit.png)

### Before — Close

![Actual previous Level25 Close](../../evidence/2026-10-12-oasis-level-25-build/qa-2026-10-12T00-40-12-270Z/before-level-25-close.png)

### After — Close

![Actual Level25 pilot Close](../../evidence/2026-10-12-oasis-level-25-build/qa-2026-10-12T00-40-12-270Z/after-level-25-close.png)

## What changed

Only `prototype/oasis-town.js` and its cache string in `prototype/index.html`
changed existing runtime bytes. The entire app, styles, progression, building
art, layouts, controls and camera remain frozen. Exact25 joins the accepted
0/1/50 pilot gate; all other levels/layouts and compact frames retain the prior
renderer. This is a single middle-state test, not a smooth2–49 rollout.

The accepted founding ground/street texture and existing closed-fountain crop
are reused. Two smaller, dry developing pockets replace scattered old props:
west center1580,1297 in250×160 world units; east2910,1156 in174×152. Complete
cropped crown/body/contact/shadow fits those envelopes uniformly. Both clear
full protected reserves by24WU. The single northern fountain is2380,730,
132×122WU; there is no second southern basin.

An irregular public forecourt occupies at most1830,1190,570,470WU around the
Hall and adjacent completed Depot, not the whole civic quarter. Its real SVG
mask removes padded full nonmember plots, ornaments, HUD and wall reserves:
50 cutouts in the ideal25 fixture,8WU except shade24WU. It is cosmetic ground,
not a collider or functional road. With a missing/low-level Depot it narrows
to the Hall-only treatment. Work yards stay dusty.

Root rejected the first runtime's detached lane bars and nearly hidden paving.
One bounded refinement removed those three bars and softened the four selected
landings strictly inside their complete measured paint envelopes. No endpoint
or wall art changed. The straight strip at the front gate is the pre-existing
wall-owned approach and remains untouched under the pause.

## New source-specific entrances

All measurements use the live SVG CTM and actual fitted source bodies. Source
art25 is not synonymous with completed25: Hall/Warehouse use art25 from logical
milestone22; Caravan art25 starts at25. Eight other roles still show art20 in
the ideal25 fixture. No progression mapping was changed.

| Source | Padded crop | Source UV | Actual world threshold | Paint width |
| --- | --- | --- | --- | --- |
| Hall25 | Whole1536×1024 | .57,.93 | 2132.2,1281.8667 | 28WU |
| Warehouse25 | 307,544,313,220 | .22,.80 | 1160.4,1360.5797 | 36WU |
| West Caravan25 | 316,485,307,268 | .50,.95 | 1230,1821.5 | 28WU |
| East Caravan25 | Same source crop | .50,.95 | 2970,1821.5 | 28WU |

Each full paint width has8WU neighbour clearance. The two Caravan routes are
independently checked, not blindly mirrored. The18.563-WU Hall/Depot gap still
cannot take a broad frontage street; Hall uses a shallow lateral landing.
Freight remains ambiguous and has no invented socket. Other sources retain
conservative contacts, not a universal doorway guarantee. Mixed quality uses
actual completed levels, never a queued target; visible review source keys
select only registrations matching the exact source/stage/crop.

Calibration and marked source/scene images:
[source evidence](../../evidence/2026-10-12-oasis-level-25-build/calibration-2026-10-12T00-09-07-919Z/source-envelope-validation.json).
The accepted four endpoint registrations remain unchanged and the three new
source25 registrations are separate, restricted to the developing state.

## New art and cost

One text-only built-in ImageGen call produced a static two-motif atlas—one of
the allowed two attempts. No other-game or screenshot inputs were used.
Existing buildings and their shadows were not regenerated. The existing,
Owner-authorized exact matte-fringe cleanup changed only selected exterior/
isolated exact-red/yellow alpha1–8 values; all RGB and alpha>8 stayed unchanged.

Runtime atlas1254×1254:1,052,711 compressed bytes,6,290,064 RGBA pixel bytes
(6.00MiB) before caches. This meets the9MiB source-pixel ceiling, not a measured
process-RAM or physical-phone budget. Whole connected motifs include alpha1
feathered shadows; disjoint padded crops own both complete motifs. Detached
alpha1 noise outside them remains in the source but is not rendered. Full
atlas-alpha ownership is deliberately not claimed.

Exact prompt, crop/cleanup provenance and rollback:
[asset brief](../../prototype/assets/oasis-pilot/MIDDLE_SHADE_BRIEF.md),
[prompt](../../prototype/assets/oasis-pilot/shade-middle-prompts.json),
[metadata](../../prototype/assets/oasis-pilot/shade-middle-v1.metadata.json).

## Verification

Root directly opened the actual before/after25 Fit/Close, mixed25/Academy5
Fit/Close, representative0/1/50 and24/26/compact fallbacks, source-calibration
images, new atlas and successful standard command capture. Restrained paving
is visible, shade remains grounded, landings register to the selected source
thresholds, and no coloured fringe is visible in the game composite. This is
capture-time inspection, not Owner art acceptance.

Focused checks cover29 distinct case names across two frozen-source receipts:
25 completed cases in `qa-2026-10-12T00-37-43-406Z`, then four independently
passed remaining cases in `qa-2026-10-12T00-43-41-043Z`. They check real SVG
court paint/cutouts, complete entrances/pockets, all23 keyboard targets, exact
v3/legacy/paid-queue bytes/deadlines through review/modes/reload, visible25/50
source binding with saved quality1, endpoint serialization and atlas ownership/
budget. The ideal forecourt raster audit finds233,775 painted pixels,95,502
outside its own member bodies, and zero inside protected nonmember interiors.
Captured errors are zero in completed cases, sources are stable, and all owned
browsers/servers are closed. **No single29/29 full-run pass is claimed.**

Strict paired0/1/50 endpoint captures passed. Old fallback PNG equality passed
in one recorded run but intermittently failed in Grid25/Level24 old palm/garden/
fountain pixels in other runs; their scene/DOM/camera/wall output stayed equal.
Eight independent software-rendering controls (16PNGs) were exact, including
retained-before→before, but did not establish a lasting fix. Existing Chromium
`--disable-gpu` is test-only, not a game dependency or shipped setting.
Cross-context old-raster pixel stability remains **inconclusive**, with strict
failures retained and no tolerance/masking added. The first legacy fixture was
also invalid (old10s Hall25→26 is forbidden by unchanged app validation); the
correct Hall4→5 fixture passes with exact raw bytes during temporary review25.
Neither issue prompted a runtime or save-validation change.

Evidence and exact case/failure links:
[QA summary](../../evidence/2026-10-12-oasis-level-25-build/QA_SUMMARY.md).
Final guard passes1,011 protected records:65 other runtime/test/tool records,
162 prior art/support,325 native,78 staged Site,353 historical evidence and28
old study/proposal image-folder records. Entire `app.js` is byte-exact. The
[Root inspection receipt](../../evidence/2026-10-12-oasis-level-25-build/root-inspection.json)
lists15 directly opened scene images, five source/scene calibrations and the
atlas. All51 local links checked resolve; historical receipts remain untouched.

The existing command also passes on frozen source:
`./prototype/tools/capture-game.sh --level 25`, with owned browser/server closed.
Its capture/receipt are in `prototype/debug/2026-10-12T00-39-13-862Z-town-all-built-25-staggered-1440x900-6a08ecd8.*`.
All nine root runtime JS files compile.

Module SHA256:
`9bfde31a90fdefdfe2a7b0bf572d6bbb0f593db177a45935635e5d48c42183f6`.
Index SHA256:
`50b0603300f89edc07295993850bbfac43aab519a53cbabeeb9eee36eb70a359`.

## Limits, rollback and stop

Still open: abrupt24/25/26 fallback, uncalibrated source doors including Freight,
extreme-close source softness, other layouts/bands/phone, animation and broader
neighbourhood richness. The known old Hall4 Close Dev→Gameplay pan shift,
wall towers/gate hit area/phone Fit and existing gate strip remain unchanged.
This pass does not claim the old comprehensive suites or wall work completed.

Scoped pre-change module/index copies are in
`evidence/2026-10-12-oasis-level-25-build/before-source/`. To undo, first check
for later unrelated changes, restore only this module and cache-string scope,
and stop referencing the new atlas. Retain originals, evidence and records;
never reset town progress or roll back the entire repository.

**Shown direction accepted under DEC-079; obtain OK for the defined next pass.**
No native build/update, staged Site sync, publication, engine/library change
or next-band rollout. Capture-time checks alone did not establish acceptance.
