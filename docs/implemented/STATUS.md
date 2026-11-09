---
id: DOC-AZM-0009
type: REPORT
status: CURRENT
feature: BUILT AND DELIVERED
purpose: What actually exists
links: []
owner: AZMARA chat
---

# What actually exists

As of: 19 October 2026. Phase: **DEC-107 implemented locally; private web32 and native build 3 unchanged**.
Current authority: `DEC-011` through `DEC-107`. Foundation records below
describe earlier delivery stages.

## Current locked local work — return to ordinary 100% presentation

DEC-107 removes the temporary `View zoom (test)` control, its transient state,
styles and alternate map-scaling path. Dev and Gameplay now share only the
ordinary 100% town presentation. The Land stage and Building dropdowns, Test
supplies, Reset plots, protected start framing, normal zoom/panning, approved
55% building-art scale, art, saves, queues, plots, layouts and gameplay remain
unchanged. V3 of the land specification is byte-preserved as
`docs/approved/ARCHIVE/LAND_STAGES_2026-10-19_V3.md`; V4 is current.

JavaScript syntax, DEC-107 source-absence checks, protected framing, camera
geometry and diff checks pass without a browser. DEC-084 still requires fresh
Owner permission before a screenshot/headless run. This change is local only;
private web32 still contains the temporary slider until a later explicit
publication instruction.

## Current private delivery — protected start frame and Dev view-size test web32

DEC-105 protects the painted gate/Town Wall label and Town Hall/label from the
floating town bar, computer/phone docks and Dev button in the initial 100% view.
Ordinary land remains full-screen; unavoidable initial cropping is biased to
the bottom so the gate stays visible. It also authorises a transient Dev-only
50–100% whole-map view slider, in 5% steps, with normal-size labels and 44px
phone targets. Below 100%, temporary sand margins are allowed for this test.
The value is unsaved, independent of normal zoom and the approved 55% building
scale, and resets to 100% for Gameplay. Owner-authorised headless release QA
also verified touch taps, native pinch, orientation, active queues and compact
landscape presentation. The exact 76-file runtime is live as private web32;
one owner remains the only audience and no automation or auto-deploy exists.
See [web32 delivery](WEB_PUBLICATION_32.md).

## Previous delivery — simplified Dev workbench and midpoint land camera

DEC-103 replaces Town Hall-centred Fit with the exact midpoint of the approved
land picture. The start view now uses the true cover/minimum scale, so a wide
screen shares unavoidable vertical cropping between the top and bottom. Phone
cover is height-led and starts at the same midpoint, retaining sideways travel.
The first manual arrow, mouse drag or touch pan releases Fit without changing
zoom, after which the exact picture bounds permit reaching every image edge
without revealing a margin. Frame width comes from registered artwork metadata
while current scene height/scale stays fixed, ready for a later wider master.

The V1 land specification is byte-preserved as
`docs/approved/ARCHIVE/LAND_STAGES_2026-10-18_V1.md`; V3 is current, with the
byte-preserved V2 archived as `docs/approved/ARCHIVE/LAND_STAGES_2026-10-18_V2.md`.
The DEC-103 runtime changes were
limited to `prototype/app.js` and `prototype/styles.css`. Static land, Dev-shell,
JavaScript and pure camera-geometry checks pass. After fresh Owner permission,
one isolated 3420 × 2069 capture passed and was visually checked against the
Owner's existing 3420 × 2214 screen image: the oasis, both lower fields and the
bottom palms are now visible; the remaining cover crop is shared between cliff
tops and a thin lower strip, with no margin or stretch. The capture browser and
loopback server closed successfully. Evidence:
`prototype/debug/2026-10-18T09-11-29-413Z-town-land-stage-1-staggered-3420x2069-f811bab6.png`
and its adjacent JSON receipt. DEC-102/103 are now live in private web31; the
native app remains unchanged.

## Previous private web31 and current native build 3

DEC-100's exact eleven land masters were retained in private web31. The completed
Town Hall look selects the land at levels 1, 5, 8, 12, 17, 22, 28, 34, 41, 45
and 50. DEC-102 removes the saved Academy, starts each temporary Dev session at
Stage 1, replaces the old Dev surface with separate dropdowns and bounded test
supplies, and removes Appearance Review. DEC-103 centres the minimum-cover town
camera on the picture midpoint and lets panning reach all image edges.

The official Sites workflow pushed
`2af1191ff6084172f9478d7a9708e92459a648ae` and delivered a terminal-success
77-file archive as Site version 31. The custom domain and one-owner/no-viewer/
no-group/no-external audience are unchanged; there is no auto-deploy or Site
automation. No publication browser was opened; the Owner will refresh manually.
See [web31 delivery](WEB_PUBLICATION_31.md).

The independent iPhone wrapper is prepared and signed as AZMARA `0.1.0 (3)`.
Its exact 77-file embedded runtime and updated save/startup bridge pass 14 Node
tests, 53 Flutter tests, clean analysis, signature/profile/identity checks and
target-device membership. The paired phone was unavailable during preparation,
so the artifact remains ready without altering existing phone data. See
[native build 3](NATIVE_BUILD_3.md). No installation heartbeat remains active;
a future install requires a fresh explicit action and must not uninstall or
clear data.

## Previous delivery — full-screen private web30

Web30 delivered the locked land stages with the complete full-screen shell and
is the immediate rollback for web31; see [web30 delivery](WEB_PUBLICATION_30.md).

## Previous delivery — locked land stages private web29

DEC-100's exact land masters first went live in web29 with full-viewport Town,
Region and World. It is the immediate rollback for web30; see
[web29 delivery](WEB_PUBLICATION_29.md).

## Previous delivery — full-bleed oasis private web28

DEC-097 removes the desktop foundation's300-unit left/right insets and maps the
same approved painting to the full4200×2400 desktop art plane. A centred cover
crop fills the playfield without distorting the source aspect ratio. HUD, wall,
buildings, click targets, saves, queues, layouts and rules are unchanged.

The exact1536×878 cover crop was rendered and inspected offline. JavaScript,
source dependency, byte-exact staging and archive checks pass. The official
Sites workflow pushed commit `0c545620bde3328eda6efdc985421816e776485f`.
Private version28 is terminal `succeeded` at azmara.app with the same custom
one-owner/no-group/no-external audience. No browser or native app was opened;
manual live appearance and input review remain required. Web27 is rollback.
See [delivery](WEB_PUBLICATION_28.md).

## Previous delivery — final visual shell v1 private web27

DEC-095 begins the Owner-approved visual build without implementing Claude's
future gameplay rules, and DEC-096 publishes that implemented slice privately.
A new floating48px town bar exposes town navigation,
population, six resources and Pearls/Shop. A collapsible70×62 desktop dock
opens Town, Military, Trade, Diplomacy, Discoveries, Shop, Inventory, Help and
Options; screens below700px use a six-button bottom dock. Existing native
dialogs are restyled as480px desktop content panels beside the dock and bottom
sheets above the phone dock. The old full-height sidebar remains in source for
rollback but is not the active presentation.

The approved Concept1 reference was used through built-in ImageGen to make one
original1536×1024 building-free foundation. It keeps the canyon, central pass,
wide avenue, civic square, palms, gardens, oasis and fields, while separate
existing building/click and current wall layers remain interactive above it.
The previous live road/scenery strips are presentation-hidden, not deleted.
Prompt/provenance and a pre-change source snapshot are retained locally.

Changed runtime files: `prototype/index.html`, `prototype/app.js`, new
`prototype/design-shell.css`, new `prototype/design-shell.js`, and new
`prototype/assets/azmara-oasis-foundation-v1.png`. The save/load function block
is byte-identical to its snapshot. Both changed JavaScript files pass syntax
checking using the bundled Node runtime; HTML landmark counts are balanced and
the PNG is1536×1024. The official Sites workflow pushed source commit
`e4cf8dedc609110976a47fe7e9e2af088272dde6` and packaged114 byte-exact runtime
files. Private version27 is terminal `succeeded` at azmara.app with the same
custom one-owner/no-group/no-external audience. Web26 remains rollback.

No browser, server, native build, package installation or Figma write was
performed during delivery. Actual responsive composition, wall/background
registration, clicks and maximum zoom remain pending the Owner's manual Chrome
review; hosting success is not visual acceptance. See
[delivery](WEB_PUBLICATION_27.md).

## Previous delivery — Appearance dialog repair private web26

DEC-094 restores Appearance to a bounded1120×880 maximum dialog inside the
game area. The town remains visible around it and a dimmed clickable surround,
the × button and both Return to town controls all reach the existing restoration
path. The review's scale tools and all town/game data are unchanged.

Seventeen source assertions and JavaScript syntax checks pass without launching
a browser. Private version26 is terminal `succeeded` at azmara.app with the same
custom one-owner/no-group/no-external audience. Source commit is
`954a9a82158895da723159494a45cbfd6dcb8274`; web25 remains rollback. Live
appearance/click acceptance is manual. See [delivery](WEB_PUBLICATION_26.md).

## Previous delivery — B2 valley defences private web25

DEC-093 implements the approved revised B2 composition. Original timber,
adobe and sandstone defence scenes now grow from the canyon itself at wall
levels1–10,11–32 and33–50; level0 keeps the valley open. The two principal
towers frame a visibly broader open gate. The baked main boulevard is widened
to150 desktop/104 compact for all five layouts while lanes and all plot data
remain unchanged. The55% building default continues.

Static/source/art checks and16 inspected offline Staggered wall/material Fit/MAX
renders pass144 checks. No browser was started. Private version25 is terminal
`succeeded` at azmara.app with the same custom one-owner/no-group/no-external
audience. Source commit is `63079a585e538b1ff0ba2260f60001379f5e3dcb`;
web24 remains the rollback. See [implementation](B2_VALLEY_DEFENCE.md),
[delivery](WEB_PUBLICATION_25.md) and
`evidence/2026-10-14-b2-valley-wall/`.

## Previous delivery — 55% town scale private web24

DEC-092 makes55% the normal Town building presentation while retaining the
unsaved Dev Appearance1–100% slider,100/80/65 presets and44px targets. It does
not change plot IDs/positions, saves, queues, five layouts, fixed anchors,
current wall, native or held24/26.

Static checks and eight inspected offline Grid start/50 Fit/close equivalents
pass without a browser. Private version24 is terminal `succeeded` at azmara.app
with the same custom one-owner/no-group/no-external audience. Source commit is
`678621756c1d91f7d99023753bef001524866f62`; web23 remains the rollback.
The wall study is not published: the Owner prefers revised B's cliff-integrated
defence and requested B2's wider caravan route, which remains review-only until
the next explicit implementation approval. See
[delivery](WEB_PUBLICATION_24.md) and
`evidence/2026-10-14-scale55-wall-options/`.

## Previous delivery — baked streets private web23

DEC-091 implements the approved manual street target across all five layouts in
desktop and compact profiles. Ten flattened transparent PNG layers replace the
active live line-rendered roads; every profile has21 side contacts, approved
axes only, a wider gate-to-Hall route and planted pockets. Town art defaults to
80%; Dev Appearance now tests every whole1–100% without saving the value.

Static/source checks and eight inspected offline Grid start/50 Fit/close images
pass. No browser was started. Real browser/device visual, input and performance
acceptance remains manual. Private version23 is terminal `succeeded` at
azmara.app with the same one-owner/no-group/no-external audience. Source commit
is `9f90424daa4a5dcac8ded430ae6e7eef5db80cf0`; web22 remains the rollback.
See [implementation](BAKED_STREETS.md), [delivery](WEB_PUBLICATION_23.md) and
`evidence/2026-10-13-street-build/`.

## Previous delivery private web22

DEC-088 requests publication of implemented DEC-087 Parts1/2. Version22 is
confirmed live at azmara.app, still one owner/no groups/external visitors.
The228px sidebar and unsaved Appearance100/80/65 comparison are delivered;
80% is not the default. Nine existing runtime files change, with86 runtime
files and unchanged assets/manifest. Canyon proposals, held24/26 and native
are excluded. Saves/queues, plots/layouts/fixed anchors and old art remain exact.

Official helper pushedf8dbbc64ec7310df2524544abffb058a405f1cd0; the87-file archive
and final authorized-staging guard pass. Deployment is terminal succeeded, and
fresh Site metadata confirms22/currentcustomdomain. No browser/server/native
app was launched for publication. Manual repaired-UI/touch/paidqueue gaps remain;
hosting success is not visual acceptance. See [delivery](WEB_PUBLICATION_22.md).

## UI and size review before publication

DEC-087 implements the228px desktop sidebar/player footer/World-only camera bar
and transient Appearance100/80/65% building/pin/Oasis comparison. Normal default
art,23 IDs/saves/queues/five layouts/fixed anchors/current wall/native/Sites stay
unchanged.80% is recommended, not approved as a default. Canyon defence images
are proposal-only;24/26 remains held and privateweb21 remains live unchanged.

One expressly approved isolated headless pass captured27 images and closed its
browser/server. The sidebar split and phone scale comparisons are verified;
the receipt reports failure because a desktop Appearance header blocked controls
and displaced a target. Subsequent header/player wording/toast repairs pass
static checks but have no final-source browser verification. A prepared
follow-up is unrun and requires fresh permission. Keep manual pinch/compact/MAX,
outline interaction and paid-queue exit/reload gaps explicit.

Checks preserve26 model functions,8 constants,7 model/anchor sets,9 parsers and
1,640 protected file records. Pure tests cover60 unchanged normal Oasis cases,
120 scale/layout/camera cases and270 identities/crops. See
[review and rollback](UI_SCALE_REVIEW.md),
[canyon concepts](../ideas/CANYON_DEFENCES_STUDY.md) and
[QA summary](../../evidence/2026-10-13-ui-scale-study/QA_SUMMARY.md).
Stop for Owner approval; no publication or next-band rollout.

## Previous delivery — rear valley private web21, manual review pending

DEC-086 authorizes the selected rear-pass valley, only wall-01's rear-anchor
relocation and private publication. Version21 is confirmed live at azmara.app,
still one owner/no groups/external visitors. One short wall with two gate towers
uses timber1–10, adobe11–32 and sandstone33–50. The start remains an open pass
when the wall is unbuilt; Hall upgrades don't secretly build it. New original
cliffs/atlas, registered gate/complete paint bounds, bounded terrain focus,
quiet Town ground and necessary responsive packing are implemented. No ring
or foreground curtain is active. Old ring art/source stays for rollback.

All23 IDs, other22 base anchors, five layouts, saves/queues, native and historical
evidence remain preserved. Accepted desktop/Staggered0/1/25/50 Oasis source
registrations stay intact; only its valley-specific northern ground mask changes.
Phone/other layouts retain historical street/scenery fallback.24/26 remains held.

Final frozen-source checks pass55 pure geometry groups and220 independent
responsive Fit/MAX probes, all-material wall/cliff/full-target clearances and
44px minima.26 model/queue slices,8 storage/timing constants and9 parsers pass;
pre-staging guard checks1,346 records. Earlier failure receipts remain. Root
inspected labeled offline state/layout/narrow-desktop renders; these are not
browser screenshots or live input/safe-area/RAM acceptance. No browser/server
was launched. Actual gate clicks, CTM/pixel alignment, Fit/MAX and touch need
Owner manual review.

Official helper pushed0cfda1b0ce8d3a7a5e22156ab5804601420ba9cb and packaged86
byte-exact runtime files plus unchanged hosting configuration. Raw archive and
server saved-version checks pass87 files; terminal private deployment succeeded.
See [wall review](REAR_VALLEY_WALL.md) and
[web21 provenance/manual review/rollback](WEB_PUBLICATION_21.md).

## Historical delivery — private web20

Owner explicitly requests the current web update under DEC-085. Version20 is
confirmed live at https://azmara.app, still owner-only. It publishes the
implemented sidebar and accepted Oasis desktop/Staggered0/1/25/50 pilots, not
the valley concepts or held24/26 extension. Only canonical index/preview cache
labels change for this delivery; the sanitized Sites checkout is synchronized.
Native, saves/queues, wall art/route, role anchors and historical evidence stay
unchanged. No browser was opened; last sidebar fixes and prior wall/phone
defects still need manual review, not a claimed final screenshot/all-pass check.

Official helper pushed63914fb459517d1dcd22ef72aa67b8556bbea1ef and packaged84
byte-exact runtime files plus unchanged hosting configuration. Raw archive
and server saved-version checks pass85 files. Terminal private deployment
succeeded; fresh Site metadata confirms one owner and no groups/external
visitors. Packaging/audit failures remain recorded separately.
See [web20 delivery, provenance and rollback](WEB_PUBLICATION_20.md).

## Sidebar implementation and proposal-time valley status

DEC-081's full-height304px desktop sidebar and56px compact/phone strip/drawer
are implemented locally across Town/Region/World. The game physically begins
to the right; cameras use the remaining viewport. Portrait/right duplicate
controls are removed; Council, menus and Dev workbench are inside the panel.
Help/Options remain at its bottom and camera controls over the game.
No plot IDs, fixed-role anchors, saves/queues, art, Oasis/wall source, native
or staged delivery changed. Six existing UI/camera files only were edited.

24 core browser groups passed, followed by a separate passing responsive
focus check, not a final single25/25 pass. After Owner requested no automatic
Chrome/testing (DEC-084), only static checks/saved-image inspection continued.
The last Options/focus/coordinate-visibility fixes remain uncaptured and need
manual verification. No final-source screenshot acceptance is claimed.
Final static checks pass1192 protected records,45 unchanged model/art/wall
function slices and9 JS parsers. Existing phone scenery/seam/MAX softness and
wall Step5 defects remain; no native device/performance acceptance or publishing.
See [sidebar review, before/after and rollback](SIDEBAR_VALLEY_REVIEW.md).

DEC-082's valley concepts are complete; DEC-083 prefers A, one short rear/
northern gate between cliff shoulders with an open foreground. Four start/50
desktop/phone paint-overs and the front-closure alternative remain proposal
art only in [the valley proposal](../ideas/VALLEY_WALL_PROPOSAL.md). Current
front wall-01 control alignment conflicts with a rear gate; flag and obtain
explicit approval, never silently move fixed anchors or add hidden targets.
Ring-wall code/art/evidence remains intact. That was the proposal-time stop;
DEC-086 above subsequently authorizes the rear-wall relocation/implementation.

## Next approved but held test — neighbouring24/26

DEC-079 records acceptance of the shown exact25 direction and continuation to
a defined next proposal. [Neighbouring24/26](../ideas/OASIS_LEVEL_24_26_PROPOSAL.md)
is approved under DEC-080 but explicitly held during sidebar/valley review.
Do not resume automatically. New viewport and possible future valley reserves
need fresh clearance checks. No new images are proposed.24 uses Caravan art20, requiring separate source/
route checks that must not leak into accepted25 mixed/review outputs. This is
not a full intermediate-band rollout or a fix for the inconclusive older raster
captures. No24/26 runtime/art change was made. Wall work remains paused.

## Current — Level25 local middle-stage pilot, direction accepted

DEC-078 approves the bounded Level25 implementation after the draft below.
Desktop/Staggered completed or temporary review25 now reuses the accepted quiet
ground, adds a small Hall/Depot public forecourt, four measured source25 entrance
instances, two modest dry shade groups and one closed northern fountain. Existing
0/1/50 outputs and all unsupported levels/layouts/compact frames stay unchanged.
All23 IDs/role anchors, complete targets, deterministic source-art schedules,
actual saves and paid/legacy construction receipts remain in scope for checks.

Only `prototype/oasis-town.js` and its index cache string change existing runtime
bytes; app/UI/styles/camera/progression/building art/wall stay frozen. One original
two-motif atlas used one of the permitted two generation attempts and the existing
authorized exact fringe cleanup, adding1.00MiB compressed/6.00MiB RGBA pixels
before caches. No phone/process-RAM acceptance is claimed. Root opened actual
before/after Fit/Close, mixed-level scenes, relevant fallbacks and the successful
standard command capture. Save/paid/valid10s queue, target/source-stage and real
SVG paint checks pass on frozen source.29 distinct case names are covered across
receipts, not a single29/29 full-run pass: old fallback raster equality remains
intermittent/inconclusive despite exact independent repeat controls. Failures
and corrected invalid legacy-fixture evidence are preserved; no assertion was
relaxed or app validation changed. Guard passes1,011 protected records including
whole app/native/staged/historical evidence. Those checks did not themselves
establish Owner acceptance; the subsequent “continue” records that separately
under DEC-079. Preserve original capture-time receipts and remaining limitations.

Actual before/after, source calibration, asset provenance, checks, limits and
scoped rollback: [Level25 local review](OASIS_LEVEL_25_PILOT.md). New evidence is
in `evidence/2026-10-12-oasis-level-25-build/`. Historical evidence and previous
draft images remain unchanged. Wall Step5 fixes, phone/all-layout/band expansion,
native updates, staged sync and publication remain paused. Obtain OK for the
defined next extension before making runtime changes.

## Historical next-step draft — Level25 middle-stage proposal only

DEC-077's “continue” approves drafting one Level25 desktop/Staggered mock-up,
not implementation. The proposal is in `docs/ideas/OASIS_LEVEL_25_PROPOSAL.md`:
maintained earth, partial civic paving, two modest shade pockets and one closed
fountain between the accepted bare start and mature city. Two original built-in
ImageGen attempts use AZMARA-only captures; the final paint-over is approximate,
not a runtime asset or measured placement. Palm positions remain inaccurate
against the tentative world envelopes, stated explicitly in the draft.

Actual25 uses the prior scenery; its capture reports23 occupied IDs,27 decoded
images, zero errors and owned browser/server closure. Existing deterministic
source stages are retained, including art20 on eight roles at logical25. No
endpoint UV is claimed calibrated for25. This draft does not implement a new
appearance band or fix any wall/camera defect. Separate new evidence preserves
runtime/art/native/staged and historical receipts unchanged:999 protected files/
links pass the final guard; three PNG copies/provenance and two-attempt limit
check out. Root opened the actual source and both concepts, including the final
saved copy; no placement/phone/runtime acceptance is claimed. Stop for Owner
direction/implementation OK; no game, saved-progress or publication change.

## Current — shade pockets/selected entrances implemented, visually accepted

DEC-075 approves the bounded proposal's implementation, not broader rollout.
Desktop/Staggered Hall0/1 and50 now have one sparse founding refuge or two
composed mature shade courts, the two unchanged fountains, and source-keyed
threshold landings for Hall1/50, Warehouse50 and both Caravan Station50 sites.
Freight's doorway remains unresolved. One original atlas used two generation
attempts, authorized edge cleanup and checked complete connected-body/shadow
crops; no existing art changed. New runtime cost is1.63MiB compressed/6.00MiB
RGBA pixels before caches, not phone/process-RAM approval.

The renderer and cache strings changed; a scoped `appearanceFor` metadata fix
also makes source-stage sockets follow review sprites while actual levels
retain local material quality. Its pre-change app copy is retained, and the
guard verifies all app bytes outside that function unchanged. No save/queue,
plot/anchor/control, CSS, camera, engine/library, wall or native changes.

Root opened all eight final current images. Final focused QA passed32 isolated
groups (12 baselines plus20 current), with zero captured errors, stable hashes,
exact save/legacy/paidqueue bytes/deadlines and owned browser/server closure.
Guard confirms64 whole runtime files plus app bytes outside `appearanceFor`,
156 pre-existing art/support records plus the new immutable prompt,325 native
files,78 staged Site files and original wall/pilot/proposal/study evidence unchanged.
Detailed before/after, calibrated thresholds, provenance, limitations and
rollback: [local review](OASIS_POCKETS_ENTRANCES.md). Fresh evidence stays in
`evidence/2026-10-11-oasis-pockets-build/`; historical receipts remain intact.

Owner's subsequent “yes” accepts the shown local pass under DEC-076, after the
Level50 Close image and linked before/after report. This is separate from the
capture-time checks; original evidence/receipts remain unchanged. This reply
changes documentation only, not runtime, assets, saves or delivery.
Obtain approval for a defined next extension before implementing it. Still no
all-level/layout/phone rollout, rills, movement, wall fixes, native update,
staging sync or publication. Known old Close-camera, tower/gate/phone and
source-softness defects stay open; this is not production-final art approval.

## Historical next-step draft — shaded pockets and entrances, proposal only

DEC-074 approves drafting, not implementation. The bounded proposal is in
`docs/ideas/OASIS_POCKETS_ENTRANCES_PROPOSAL.md`, with two current desktop/
Staggered endpoint PNGs annotated offline at1:1 scale. It proposes one modest
founding shade refuge, two small mature composed gardens, and four source-art
entrance calibrations (Hall1/50, Warehouse50, Caravan Station50). Freight yard
socket remains unresolved; other types retain current shared floors. A normal
front road cannot fit the18.563-WU Hall/Depot gap: the draft uses a shallow
landing with a lateral connection, without moving either target.

New read-only measurements/evidence use isolated fixtures and the actual SVG
CTM/fitted sprite bodies. They report zero errors, stable runtime hashes,
unchanged isolated save bytes and owned browser/server closure. Both original
captures and final marked PNGs were opened by Root. Offline annotation verifies
zero altered source pixels outside its marks. The proposal guard confirms696
unchanged protected files/links across runtime/tests/art, native, staged Site,
wall/pilot evidence and original study assets. Hall, Warehouse and west Caravan
guides pass declared paint-width/margin checks, but ports remain provisional.
Green boxes are complete art
reserves, not rectangular garden art; amber guides are not finished roads.
No final art was generated, no game code/assets/anchors/saves/queues were
changed, and no wall/native/hosted operation occurred. Historical wall/pilot/
study evidence and original QA receipts remain unchanged. Stop for Owner's
separate implementation OK; accepted ground direction stays DEC-073.

## Current: Oasis Town endpoint pilot — ground direction accepted, local only

Owner's “yes looks fine” accepts the shown ground/material direction under
DEC-073. It does not approve a full levels/layouts/phone rollout, final wall art,
wall repairs or publication. This acknowledgement changes records only; runtime,
images, historical QA receipts, saves, hosted/native versions stay unchanged.

DEC-071 pauses Step 5 wall work, including towers, gate hit area and phone Fit,
and prohibits publication. The visual-direction study is complete in
`docs/ideas/VISUAL_DIRECTION_STUDY.md`, with annotated diagnostics and four
desktop endpoint paint-overs. It is a proposal, not final generated wall art.
Its original evidence remains historical; the subsequent pilot is separate.

DEC-072 records narrow continuation after Owner's “ok continue”: desktop/
Staggered Hall 0/1 and 50 only. Three original byte-exact PNGs and a pure
`prototype/oasis-town.js` presentation module provide quieter founding ground,
live-anchor-derived shared mature public floors, short civic/trade street
accents, contact aprons and localized existing raster palms/gardens/closed
fountains. No ornamental rills, actors or ambient movement were added. This
remains static 2.5D, not a new engine or the full five-layout/band redesign.

Original buildings, progression schedules, all 23 IDs/roles, actual projected
anchors, fixed-role base anchors, five layout choices, saves and construction
rules remain. Other layouts/levels and compact views retain the previous
renderer. Four existing runtime files have scoped integration hooks: app.js,
index.html, progression.js and styles.css. Wall source/art/camera/controls,
native, hosted staging and the preserved wall-build evidence stay unchanged.

Root opened both before and both final after screenshots. Initial hard ground
edges, inherited oval site outlines and perimeter-like routing were rejected
and refined before the final captures. Final 1440×900 fresh-start and all-built
50 receipts report zero errors, stable source hashes and owned browser/server
closure. The final module hash is
`60984caa2b6d9ec6aa9478f647c731921816972775f8202b4d866415e5be2680`.
All nine root runtime JS files compile. Guard checks confirm unchanged 14 wall
records, one layout source, 325 native files/links, 78 staged Site files,
21 preserved Step 5 evidence files and declared anchors/timers. Four scoped
pre-pilot wiring files were recovered from untouched staging and verified
against pre-change hashes before copying into the new pilot evidence folder.

Evidence and before/after comparisons are in
`evidence/2026-10-11-oasis-pilot/` and `docs/ideas/OASIS_TOWN_PILOT.md`.
The independent legacy modes suite reproduces a pre-existing Hall4 Close
Dev→Gameplay pan shift (scrollLeft180→176) identically on unchanged staged-v19
and current source. That suite is not claimed passed or fixed. Separately,
15 focused pilot groups passed on frozen source: Hall0/1 gate/markers, eight
unsupported-layout endpoint checks, two compact fallbacks, exact v3/legacy/
paid-queue preservation across review/modes/reload, five-layout save semantics
in both modes, and maximum zoom registration. They report zero captured errors,
stable hashes and closed owned browsers/servers. Root also opened the final
compact1/50 and maximum-zoom50 images. The main inspection receipt lists all
seven opened images; those checks alone did not establish art acceptance.
The later direction acceptance is recorded separately above under DEC-073;
the original inspection receipt remains unchanged as capture-time evidence.

Known limitations: broad shade/market activity, calibrated door sockets,
complete local-road coverage, intermediate bands, remaining layouts and phone
exports are unfinished. Ground loses detail at extreme close zoom. Existing
wall tower/gate/phone defects stay open and paused. The three new source PNGs
add about 8.61 MiB compressed/18 MiB RGBA pixels before caches; no shipping phone
performance budget or physical-device acceptance is claimed. No new libraries,
engine, native update, staging sync or publication occurred. Ground-direction
review is accepted; stop for approval of the next bounded extension before
expanding the pilot. Wall work remains paused.

## Step 5 illustrated wall — published draft, not complete

DEC-069 authorises building the Step 4 proposal. DEC-070 separately requests
publication of the current unfinished draft. This is not Step 5 completion or
Founder visual acceptance. A cohesive original raster now wraps the sides/front
of the town with an open mountainous rear, complementary back/front layers,
stable world-unit routes and a narrow cosmetic central-gate approach.

Own completed-wall level still selects timber1–10, adobe11–32 or sandstone33–50.
Before publication, four already-generated low-level PNGs were connected to
avoid the empty registry making completed walls1–32 invisible. Six byte-exact
originals and their known deficiencies are recorded in
`prototype/assets/town-wall-v19-draft-brief.md`. Original terrain/v18wall hashes
remain unchanged; source rollback and before images are retained in
`evidence/2026-10-11-wall-build/`.

Focused checks: all eight root JS files compile; all 102 level/profile states
have correct registered art/no-wall behaviour; all six PNG dimensions/files
match. Four new level1/11 desktop/phone boot captures have zero reported errors,
closed owned browsers/servers, and were opened by root. Earlier sandstone
desktop alpha/target/gate/label/transform checks passed. Phone checks did NOT
pass target exposure: five target pairs overlap. Faint alpha fringe expands
Fit's foreground, gate target alignment remains unfinished, and some artwork
has eight painted towers instead of the proposed six. Full all-layout and
maximum-zoom acceptance is not claimed. The wall has no defence/collision or
true 3D geometry. Tests do not establish art approval.

Publication stages only the 78 selected byte-exact browser runtime files plus
the existing hosting manifest. No project documents, tests/tools, debug
screenshots, player progress or mobile bundle enter that archive. Native
remains paused; source/progress identities and existing owner-private audience
are unchanged. Official packaging initially lacked Node on its child PATH;
retry reused the installed runtime without installation. Archive checks were
corrected to the official dist-root layout, then verified all 79 regular
members (78 runtime plus manifest), four directories, no links and byte-exact
runtime hashes. Archive SHA-256:
`bb8704ca209991a30b3ba16d4680490758d2a5ea1c9dfd6c11074211ae862f5e`.

The helper pushed commit `f228ec0e903ed9fa95d891677f1671878041cf1a` and packaged
`/tmp/azmara-wall-draft-publish.fQlObn/azmara-wall-draft-v19.tar.gz`.
Private save-and-deploy succeeded for version
`appgprj_6ac7643d3f588191ba2157dfe1972c3d~appgver_956da913121881918094857f046018e9`,
deployment `appgdep_6acbd75357888191b5fb56f9f4cf2961`, at
`https://azmara-private-preview.blackumbreallagroup.chatgpt.site`.
Connected `https://azmara.app` and owner-only access remain unchanged. This
confirms draft delivery, not a full browser/visual acceptance pass on hosting.
Saved-version verification confirms user-facing version19, the exact pushed
commit above and79 stored files, content hash
`sha256:0abb55d56799d9eb977ae1c32e734756702a6bb0dd386afac4725334a7fd9cc5`.
Fresh Site metadata confirms one owner, no external visitors/groups and
`https://azmara.app` as the live URL. Browser connector handoff was unavailable;
native Chrome was used instead, a new AZMARA tab was opened and its accessibility
state/screenshot showed the loaded starting town. No plot actions, resets,
Updates or user-save edits were performed in that live tab.

## Visual workflow Step 4 — report/proposal only

DEC-068 records approval of Step 3 and the revised illustrated-town Step 4.
The unapproved [wall proposal](../ideas/TOWN_WALL_PROPOSAL.md) audits current
layering and gives logical-world routes, terrain tie-ins, gate/tower budgets,
art alternatives and the phone Fit tradeoff. It does not implement a wall.

The audit corrects an important distinction: local debug requires a literal
loopback host and `?debug=1`, but Dev/Town themselves are not release gated and
the published private v18 copy defaults to them. Current paused native v0.1.0+2
contains neither feature, loads file assets rather than localhost, and bundles
the generated `mobile/assets/game/` copy from canonical `prototype/` source.
A future localhost wrapper carrying current source could pass the debug gate;
explicit release/native build exclusion needs separate approval before delivery.
The legacy native sync manifest must also be reviewed before packaging current
multi-script web source. No sync, build or publication was performed here.

Read-only geometry checks cover all five layouts on desktop and phone, plus
fresh Staggered all-built-50 screenshot fixtures. Capture contexts are isolated,
owned browsers/servers closed, and receipts report zero errors. The geometry
check found no current non-wall target overlap with the registered front wall;
its issue is detached composition and drawing behind every building, not proven
collision gaps. No game source, artwork, saved progress or hosted/native version
has changed in this step. Await separate approval before Step 5.

Step 4 evidence is complete after the Founder instructed “finish step 4”.
Deterministic offline line/label markups and byte-exact source screenshots are
saved in `evidence/2026-10-11-wall-proposal/`; the existing Playwright runtime
was reused without installation, game loading or a new server. Root opened
and inspected both final images. The phone's grey columns explicitly mark
outside-current-viewport diagram space, not invented terrain or changed Fit.
The annotations read P0–P12 directly from the proposal and use measured SVG
CTMs. Pixel checks report zero changes outside markup; all sixteen runtime
source hashes and both current wall/terrain PNG hashes remain unchanged.
The receipt records source/output hashes and closed browser ownership. The
earlier generator-distorted annotation attempts were rejected, not presented
as accurate game evidence. The proposal remains unaccepted and unimplemented.

## Visual workflow Step 3 — local G-toggle diagnostics and AGENTS rules

Implemented under DEC-067 after the direct “STEP 3 PROCEED”. A gated loader in
`prototype/app.js` requests `debug-overlay.js` only on literal loopback hosts
with `?debug=1`; the module independently enforces the same gate. The overlay
starts off, toggles with G only in Dev/Town, hides in Region/World and resets on
Gameplay/reload. Typing, open dialogs, composition, repeat and modifier keys
do not toggle it. It is pointer-transparent and does not write saved progress.

This engine has no gameplay tilemap: the diagnostic planning cells are
100×100 logical world units, with origin upper-left, X right and Y down. Grid,
cell labels, actual plot-button centre coordinates and cursor readout use the
current landscape viewBox and SVG screen CTM, including zoom/scroll/compact
placement. A stationary cursor readout also refreshes when the camera moves.
No plots or artwork are snapped, resized or relocated by diagnostics.

There is no real gameplay collision system. The collision group is deliberately
empty and the legend states “not implemented · no red shapes”; UI hit boxes,
wall art and decoration reservations are not represented as physics. Adding
physics or actor depth sorting is not part of this step. AGENTS.md now records
engine/grid/coordinates/draw order, run and capture instructions, the five-step
gate and mandatory screenshot inspection before reporting visual work done.

`capture-game.sh --level 50 --debug` uses the normal G toggle and checks the
overlay viewBox before capture. Focused isolated QA covers default-off/normal
loading, G/input/dialog guards, exact v3/legacy saved-byte preservation, unchanged
camera/plot geometry, Close/zoom/keyboard pan/compact alignment, pointer
transparency and Gameplay/Region/reload behaviour. Four groups passed on the
final source, including stationary-pointer coordinates after keyboard pan, after
a test-only return-navigation selector repair. Local image connection failures
were treated as failed runs, not suppressed; test navigation now waits for
late-painted assets before reload. Final QA used a fresh loopback Python server
with a larger connection backlog and reported zero errors. Root inspected
desktop and compact overlay PNGs, shortened crowded plot
labels, then recaptured and inspected the final outputs. Debug-disabled all-built
50 PNGs before/after the addition are byte-identical. Capture receipts/images
are in the ignored `prototype/debug/` directory.

Changed files: new `prototype/debug-overlay.js` and focused debug test, the small
gated loader in `prototype/app.js`, the capture runner's `--debug` option,
`prototype/README.md`, `AGENTS.md`, this status and the decision register.
No wall source/art, engine/library, Founder saves, hosted Site, native build,
audience/login/DNS or gameplay system changes. Stop for OK before Step 4.

## Visual workflow Step 2 — local launch/capture/close

Implemented under DEC-066 after the report-only Step 1 and direct “proceed”.
`prototype/tools/capture-game.sh` invokes `capture-game.cjs` using installed
Node/Playwright/Chrome for Testing; no packages or browsers were installed.
One command owns a loopback-only server on an ephemeral port and a disposable
headless browser context, waits for fonts, camera completion and decoded
HTML/SVG/CSS raster assets, writes a unique PNG/JSON pair to `prototype/debug/`,
then closes its browser/context/server in the normal and handled failure paths.
The optional all-built level/layout fixture is explicitly synthetic and never
uses a persistent browser profile or the Founder's localhost/hosted storage.
External requests are blocked. Source hashes are checked unchanged per capture.

Shell and Node syntax checks passed. Six captures passed with zero reported
browser/asset errors and closed owned browser/server: desktop starting town,
desktop all-built50, phone starting town, phone Grid all-built50, desktop Region
and desktop World. All six PNGs were opened for visual inspection; they show
actual rendered scenes rather than loading frames. The screenshot runner is
verified, not an approval of existing artwork. Current wall shortcomings from
Step 1 remain unfixed by request. The runner README records mandatory screenshot
inspection after future visual changes; its generated debug folder is ignored
by Git. AGENTS.md was deliberately unchanged in Step 2; the approved Step 3
update is recorded above.

Changed files: both new capture tools, `prototype/README.md`, `.gitignore`, this
status and the decision register. No runtime game source/art, wall, saved
progress, native build, hosted Site, login/audience or DNS changes. Step 3
subsequently received its own approval; later steps remain separately gated.

## Mountain-backed town and painted front wall — private version 18

DEC-065 supersedes the v17 enclosing-ring presentation after the Founder
rejected its repetitive appearance and undersized playfield. Version 18
uses a large open desert plain with mountains only across the rear band and
one original painted front fortification. Larger desktop ordinary and Hall footprints
give town buildings more visual presence without adding sites. Wall-01 and the three dedicated land-transport
reserves are recomposed near the front with layout-independent identities.

Two new built-in ImageGen assets are copied byte-exact: the 1672×941 RGB town
painting and 1536×1024 RGBA three-row front-wall sheet. Exact prompts, generated
source paths, SHA-256 hashes and transparent row ownership are recorded in
`prototype/assets/mountain-front-wall-v18-brief.md`. The sheet's actual unequal
native row rectangles are registered separately; equal-thirds cropping would
clip neighboring towers. No pixel cleanup, resampling or original overwrite
was performed. Eleven existing deterministic logical wall milestones remain,
with three field-art material groups: timber, adobe/brick and sandstone.

Runtime retains completed-wall ownership rather than using Hall or queued
target strength. Temporary Appearance/Ideal review remains unsaved. The gate
control projects from the planned front illustration, rather than floating
above it. Compact web footprints keep the earlier sizes to preserve clearance.
The ground painting extends beyond the bounded camera; no rectangular
base/margin edge remains in the checked desktop or phone views.

Fourteen bounded checks passed on app `3c0974d2…64412`: all five layouts at
1440×900 and 390×844, two level-1 views, temporary Appearance/mode/reload save
ownership and representative maximum-zoom Hall/site/wall access. Ideal checks
are distinguished from unobstructed isolated all-built fixtures. Every Fit
target is at least 44px, all 23 are reachable, the front raster stays below all 22
non-wall footprints, and the gate hits actual wall alpha. The final cosmetic
extent change did not alter Fit, targets, state or construction. Four additional
Grid/Staggered desktop/phone checks passed on final app
`c2f5b8e0bdfb18066bdb47677324203da0e58c7f882efbce62983d6f52335a20`,
with terrain edges offscreen, zero captured errors and exact saves unchanged.
Receipts and final captures are in `evidence/2026-10-11-front-wall-draft/`.
Root inspected the assets and final desktop compositions before publication.
No previous large suite is counted as rerun or as Founder aesthetic acceptance.

The source helper pushed `9d3e401e0e3192e3ae2f67325fde62a87e9b1607`. Its immutable final archive
`/tmp/azmara-front-town-delivery.3BiQDY/azmara-front-town-v18-final.tar.gz` passed the explicit71-file runtime audit: seven parsed scripts,
17 scanned text files,72 regular archive files including the manifest, all
byte-exact with canonical source, and no links or macOS metadata. Local gzip
SHA-256: `f89b056b174e3919b858b2441970c51b20a4c934f34106f8fd42afa93666e4f2`.
Sites saved version18, ID `appgprj_6ac7643d3f588191ba2157dfe1972c3d~appgver_b5e13cc8839881918b451e94c4f069cd`, verified its exact pushed commit,
and succeeded deployment `appgdep_6acb9aef62f08191ac8cc5d7c5bff15f`. Stored tar content hash:
`sha256:9c4e7ad23cf9e2daf12b372f246ad0d462370a0e3bcdf70910fa252447557049`. The generated origin is
`https://azmara-private-preview.blackumbreallagroup.chatgpt.site`; the connected live address remains `https://azmara.app`.
Owner-only access is unchanged: one allowed user, zero external visitors/groups.
Chrome is opened to the published town without resetting or upgrading its save.

Preserve all 23 stable plot IDs, five layouts, valid v3/legacy bytes, actual
stocks, paid receipts and project deadlines. Native 0.1.0+2 remains paused;
owner-private audience, login, domain/DNS and backend remain unchanged. This
pass adds no defence, route collision, tree clearing, production economy,
combat, research, satisfaction, trade simulation or multiplayer.

## Enclosing city wall — private version 17 history

DEC-064 implements the Founder's next one-element visual pass: a built City
Wall now surrounds all 23 sites, including empty plots and the three dedicated
land-transport sites, in every selectable layout. The original wall-01 reserve
remains its selectable control. A closed continuous contour has raised shaded
curtains, caps, corner towers and a northern decorative doorway. Its own
completed level controls the existing uneven timber/adobe/brick/sandstone
milestones through level 50; Hall level does not create or strengthen it.
An unfinished first build has no completed wall, and an unfinished Update
retains the old strength. Appearance and Ideal overrides are temporary.
This supersedes the earlier deferred-perimeter visual limit only. Defensive
effects, collision/routing rules and terrain-tree clearing remain unimplemented.

Whole-wall Fit framing now includes maximum-strength caps/shadows, the full
44px plot targets and persistent desktop panels/footer. Responsive projection
keeps plots separated; finite closer framing and mirrored painted margins
prevent the perimeter being cropped in the tested profiles. Level/occupancy
changes do not shift the Fit geometry. Original decorative props reserve
bounded full-height wall corridors, so whole palms/cypress/courts remain clear
without treating the empty interior of a diagonal wall bounding box as blocked.
The strongest-wall reservations are stable across material updates. This plans
cosmetic props only; it does not erase trees from the base painting.

Frozen corrected source passed 32 browser groups: all five layouts at 1440×900,
1024×600, 390×844, 844×390 and 2560×900 with wooden1/strong50 walls (50 poses),
two full-metropolis50 captures, three state groups and two max-zoom groups.
There are 1,196 independently rasterized full-plot paint/enclosure checks and
46 maximum-zoom plot inspections. All 23 exposed Fit cores stay at least 44px.
A separately bounded Staggered1440×900 scenery regression passed its original
road/full-plot/crop palette/hide-show checks after a real cypress/wall overlap
was corrected. No target, crop, alpha or viewport tolerance was weakened.
Accepted groups captured zero browser errors. Source review reran 25 Fit
cases/275 milestone envelopes, 6,325 pair-gap and25,300 corner checks; the new
corridor reservations also passed enclosure and stage-stability properties.
Exact receipts, reviewed desktop/phone screenshots and retained diagnostic
failures are in `evidence/2026-10-11-city-wall/`. Historical construction,
full atlas/HUD and artwork-gallery suites were not silently counted as rerun.
These checks do not establish Founder aesthetic acceptance or device certification.

The supported Sites helper pushed exact corrected commit
`6dd8e7e85db977f5b971db8bcc5d928bdcfe30d6` and packaged69 byte-exact runtime
files plus the normalized manifest (70 regular files/74 ustar headers), with
no metadata/PAX/AppleDouble, links, extras or secret-like runtime text.
Local gzip SHA256:
`6f481bc8a0247ed18855df41589862d3b03fcc2c539cde4ab8555121c685f2e8`.
The pre-decoration-fix pushed draft/archive remains recoverable and was never
published. One native private publication succeeded, creating version17 and
deployment `appgdep_6acb92b718d08191b5298f6c6aa932cc`. Saved-version provenance
confirms the corrected commit and separately records the stored tar hash.
The generated Site origin and live `https://azmara.app` binding are unchanged.
Audience remains owner-private: one allowed user, no external visitors/groups.
Chrome shows all seven `20261011-city-wall-v17` scripts and23 plots without
building, resetting, refilling or otherwise changing Founder progress.

Valid v3/legacy bytes, paid receipts and queued deadlines remain preserved.
All 23 stable site IDs, five layouts and30 active designs remain. No economy,
combat, research, satisfaction, trade simulation, backend or multiplayer is
added. Native0.1.0+2, login and DNS are unchanged; canonical foundation Git
was not committed/pushed. All QA-owned browsers and the root preview server
are closed; the published Chrome preview remains open.

## Dimensional desert redesign — private version 16 history

DEC-063 follows the Founder's explicit rejection of v15's flat ribbon streets
and inconsistent scene. The published next draft has smoother bare town paintings,
narrow warm textured paving, original shaded palms/cypress/planted courts,
smaller fountains, lanterns and planters. Ordinary building footprints are
taller so complete crop silhouettes have room, with the same horizontal scale.
World now uses a distinct mountain/mesa/dune relief painting; Region replaces
giant resource coins with explicitly illustrative original resource-camp art.
These are pre-rendered isometric/2.5D visuals, not a new 3D engine.

Explicit native source clipping prevents adjacent atlas pieces leaking through
letterboxing. Decorative placement protects full live plot rectangles and
persistent UI/viewport envelopes at Fit, independent of current pan/zoom.
Roads do not receive HUD exclusions. Narrow compositions may omit secondary
planters, lamps or cypress; primary fountain/garden/palm need visible safe space.
No crop safety tolerance or target size is weakened for composition.

Four byte-exact built-in ImageGen assets, exact prompts and source paths are in
`prototype/assets/isometric-redesign-v16-brief.md`. No local pixel cleanup of
the new scenery atlas was authorised/performed. All older asset siblings remain
in the canonical project. Only sanitized runtime files are staged for delivery.

Fresh frozen-source browser QA passed 24 bounded groups: all five layouts at
1440×900, 1024×600 and 390×844 (15 uninterrupted scene groups), two maximum-zoom
profiles inspecting all 23 plots each, one mixed Hall50/building5 approach,
three state/capture groups and three full-screen atlas/coordinate groups.
This covers 30 level poses, 345 full road/plot exclusions, 192 exactly clipped
raster bodies with native-colour plus hide/show paint proof, and 46 maximum-zoom
plots. Accepted groups report zero captured errors and unchanged source hashes.
Separate Atlas15/HUD13 checks have explicit scope qualifications; v15 smoke43,
330 native artwork crops/3,000 gallery selections and construction suites are
historical, not silently rerun or counted here. Final pure geometry passed187
cases/17profiles, 221,651 road/plot checks, 22,241 full prop/plot checks and6,194
full fountain/road checks. The independent source review checked8 Fit mappings
and22 road/exclusion/cache cases. Receipts, pre-freeze failures and reviewed
screenshots are in `evidence/2026-10-11-isometric-redesign/`.

Actual failures were corrected: a HUD-hidden fountain, adjacent atlas paint in
letterbox gutters, offscreen compact gardens, and a misplaced in-progress
Fit-exclusion block that threw on startup. The final full15 browser rerun uses
the corrected frozen source. An invalid paid test fixture was corrected without
altering the app's validation. Secondary props are optional on narrow layouts;
complete core crop visibility and all target/crop/paint checks stay strict.
All QA-owned contexts/browsers and the root preview server were closed; Chrome
is left open on the published site. Screenshots are isolated test towns, not
changed Founder progress. Street routing remains schematic rather than fully
painted urban fabric; finer art/composition polish remains open. Tests do not
establish Founder aesthetic acceptance or physical-device certification.

The supported Sites helper pushed exact commit
`70772d2129e48c65c51948def759f55a7bd5ce1b` and packaged 68 byte-exact runtime
files plus its normalized hosting manifest (69 regular files/73 ustar headers).
Raw-header checks reject metadata/PAX/AppleDouble, links, extras and secret-like
text. Local gzip SHA256:
`e5ab17af2e3203a836198acc1f9c16d792127b5c4a65a84e25d3899476360207`.
The first package subhelper lacked Node on PATH; the same supported workflow
completed after including the bundled Node bin. Two subsequent archive uploads
failed before saving; read-only history confirmed v15 still live. The exact
unchanged package succeeded on the third upload, creating one v16. Deployment
`appgdep_6acb8262d8bc819186aee252d50a37b4` returned succeeded with
`https://azmara-private-preview.blackumbreallagroup.chatgpt.site`; the live
binding remains `https://azmara.app`. The saved-version receipt confirms the
same source commit and separately records its stored tar serialization/hash.
Chrome displays cache tag `20261011-isometric-depth-v16`, the v3 town painting
and 23 selectable plots. Audience remains owner-private: one allowed user, no
external visitors or groups. Canonical foundation Git was not committed/pushed.

Valid v3/legacy raw bytes, paid receipts and queued deadlines are preserved in
the isolated checks. All 23 IDs, five layouts and30 active designs remain.
Native0.1.0+2, DNS and login remain unchanged. No backend, production economy,
research, satisfaction, army combat, trade simulation or multiplayer is added.

## Full-screen land atlas, town layouts and uneven development — private v15 history

Implemented under DEC-058–062 and published as owner-private version 15 on
11 October 2026. Historical receipts below are not counts for this revision.

- Region fills the viewport with dry desert scenery around its main painting;
  World is a finite scrollable/drag/touch/keyboard coordinate map, not cards.
  All twelve draft Regions retain stable IDs and geographic coordinates.
- The desktop toolbar and camera controls share the bottom edge. The town HUD
  and adviser portraits start at the top; the requested provisional footer line
  is removed. Truthful prototype limitations remain in Help.
- Wall reserve is original elongated earth at the marked upper central clearing.
  Responsive presentation clears the HUD and other full-size targets. The
  camera's closer bounds contain the wall and permit inspection below the HUD.
  Full perimeter construction and tree clearing remain deferred.
- Advisor offers Staggered, Grid, Circle, Avenues and Garden quarters. Only
  general-02–19 move; Hall, wall and three dedicated transport identities stay
  fixed. Optional validated v3 `plotLayout` persists the preference. View-only
  loads preserve old save bytes; changing layout changes no level, stock or job.
- Land-only direction replaces active Trading Port/Dockyard with Caravan
  Station/Freight Depot, and sea charts with Route Archive. Pack caravans are
  the faster small-load concept; heavy wagon convoys the slower bulk concept.
  No cargo capacities, route timings or army balance are invented. Workshop
  retains equipment improvement; no duplicate Siege Works is added. Thirty
  active types remain; the 31-entry compatibility registry validates historical
  Shipyard buildings/queues and displays land-only art without erasing the save.
- All types reuse their eleven original art stages at deterministic per-type
  uneven thresholds from 1 to 50. Hall's draft thresholds are
  1/5/8/12/17/22/28/34/41/45/50. Actual levels and source-art labels are separate.
  This is varied cosmetic cadence, not re-randomisation on Update or reload.
- Bare dry terrain remains the base at all levels. Original SVG streets route
  around the actual responsive full footprints; scenery adds paving, gardens,
  palms, isolated fountains and benches as Hall develops. Local approaches
  blend down to the lesser Hall/building quality and stop outside the footprint.
  No connecting river/canal remains. All occupied plots have registered contact
  beds and proportional shadows; no blue selection box returns.
- Dev Appearance has every integer level 1–50 and an Ideal town slider. The
  latter temporarily fills all 23 compatible sites. The catalogue separately
  compares all 30 active designs at every level. Closing review or Gameplay
  restores actual buildings; actual queues continue on their original rules.

Built-in ImageGen produced three dry v2 terrain edits and two land-v3 trade
atlases. Originals are retained. Exact prompts, generated-source paths, runtime
paths and hashes are in `prototype/assets/land-only-terrain-v2-brief.md` and
`prototype/assets/progression/land-trade-v3-brief.md`. Previously authorised
edge-only cleanup changes only demonstrable low-alpha fringe in new siblings;
native crop ownership and cleanup proof are retained in the land-trade report.
No local pixel edits were applied to the terrain.

Changed runtime includes `app.js`, `styles.css`, `desktop.css`, `atlas.js/css`,
`town-layouts.js`, `building-art.js`, `progression.js/css`, `catalogue.js`,
`index.html`, `preview.html`, original wall/freight earth SVGs and versioned PNGs.
The sanitized delivery comprises 66 runtime files; it excludes docs, tests,
tools, raw originals and the paused native app.

Final browser acceptance is documented in
`evidence/2026-10-11-land-layouts/oct11-final-qa-receipt.json`: HUD 13, smoke 43,
Region/World 15, artwork/gallery 37, modes 9, progression 12 and local-road 1.
Construction covers 83 unique groups as 79 functional groups plus a focused
four-profile geometry rerun. Expanded scenery covers 26 unique groups as 20
accepted groups plus seven focused final groups with one duplicate. Neither is
claimed as one uninterrupted full-suite run. Accepted groups report zero
captured page/console/request/HTTP errors. Artwork covers 330 native designs and
3,000 exact-level gallery selections across desktop/compact. Fresh scenery
covers five layouts × three profiles × eleven Hall milestones (165 poses),
345 actual maximum-zoom plot groundings, and 100 transient Ideal levels across
two profiles. Pure geometry separately passes 176 groups and 226,573 road/plot
checks; it is not browser or physical-device certification.

Actual QA defects were repaired rather than hidden: short-screen Hall/wall and
freight/footer overlap, ultrawide wall cropping, missing full-size fountains in
some layouts, and camera controls painted beneath the footer. Final probes use
full 44px plot cores, complete target exclusions and actual source-pixel plus
hide/show painted proof. An independent resampled-source oracle corrected a
nearest-native-pixel assumption for CSS cover without changing its tolerance;
old naval test wording was corrected to the implemented land-trade wording.
The obsolete disclaimer is absent from both the HUD and Dev menu. Earlier
Python-server socket failures are failed attempts, not accepted results; final
browser checks use the owned Node keep-alive preview, now stopped. All owned
headless browsers are closed. Founder storage and the native app were not used
by the isolated suites.

The dedicated Sites helper pushed exact source commit
`d0b27953eed6556a6d6f97679af4308760735f09`; canonical foundation Git was not
committed or pushed. Its unchanged package passed a raw-header audit: 71 ustar
headers, 67 regular files (66 byte-exact runtime files plus the helper's
normalized hosting manifest), no metadata/PAX/AppleDouble, links or extras.
Local gzip SHA-256 is
`d05bd94432870fe1ae3566b2c99672c6f2045f5349d5dd6b746a5036c2584642`.
The native saved-version receipt separately reports its stored tar hash/size;
no equality of archive serializations is claimed. Private deployment
`appgdep_6acb1933298c819197ecbe84f34612fb` succeeded for version 15, whose source
commit matches the pushed package. Returned production URL is
`https://azmara-private-preview.blackumbreallagroup.chatgpt.site`; the existing
live binding remains `https://azmara.app`. Owner-private access is unchanged:
one allowed user, no external visitors or groups. Live Chrome shows the current
cache tag `20261011-land-layouts-50`, land counters and bottom tools, and is kept
open for the Founder. Detailed publication provenance and reviewed desktop,
compact, ultrawide, Ideal and mixed-quality screenshots are retained beside the
QA receipt. Screenshots depict isolated Dev test towns, not altered progress.

No production economy, research, satisfaction, army combat, trade simulation,
backend or multiplayer is added. Native 0.1.0+2, domain/DNS, login and private
audience remain unchanged. This is an implemented first visual draft, not
Founder acceptance of its final artwork or balance.

## All-building level-50 Dev and desert Region draft — private version 14

DEC-056 expands the first-draft workbench to all 31 included building roles at
levels 1–50. DEC-057 replaces visible island geography with an original desert
**Town → Region → World** hierarchy. Region means a geographic shared area for
future independently owned towns, not a single city, country or player estate.
Qamar Basin is the home-region draft; World contains fictional desert regions.
The current preview has no working other-player ownership or multiplayer.

- All 23 town plots retain their IDs and roles: 19 general sites including the
  exclusive central Hall, one wall, two harbours and one freighter site. The 31
  catalogue roles are alternatives, not 31 simultaneous plots. Dev permits
  repeated eligible roles for testing only. The wall has a staged local sample;
  the full town-wide perimeter, route tree clearing and defence remain deferred.
- Dev offers build, Update, one-time Skip of the current project, direct test
  levels 1–50, replenishable illustrative stocks, confirmed individual clearing
  and confirmed Reset of all 23 plots. Gameplay hides and rejects every test
  mutation, including stale controls. It is a presentation mode sharing the
  same browser-local town, not a second save or an authentication boundary.
- New illustrative projects last 120 seconds. Cancellation before 60000ms
  returns 100% of the exact paid receipt; at/after 60000ms it requires confirmation
  and returns 30%, floored per resource. Completion settles before cancellation.
  Skip settles once without charging/refunding again. Job-object identity guards
  prevent stale same-millisecond controls from settling a replacement project.
- Valid old v3 Hall saves, ten-second queues and separate legacy bytes survive
  non-mutating reads unchanged. The optional additive non-Hall `buildings` record
  validates IDs, eligibility and levels strictly; no-op reads preserve raw JSON
  formatting/order. Refilling reserves room for the active project's full refund.
- Eleven visual milestones at 1/5/10/15/20/25/30/35/40/45/50 give **341 distinct
  first-draft designs**, not 1,550 independent paintings. Level 1 begins rough
  and timber-built; higher milestones add masonry and role-specific detail.
  Completed Hall level drives actual field development; Appearance and catalogue
  review remain transient. Prayer Area is respectful; Chronos’ Forge is secular.
- Desktop HUD is wider and horizontal, up to 700px, while the name section is
  176px and the adviser strip 344px. Plain ground plots have no plus overlay or
  rectangular blue focus box. A final visual check found Region/World title
  overlap under the wider HUD; the sole repair moves the desktop badge from
  194px to 235px, giving 10.9375px clearance. Compact layout and targets do not move.

Five new original opaque desert PNGs were copied byte-for-byte: Town 1/20 desktop
1672×941, compact 1254 square, Region 1536×1024. Town is inland riverbank scenery
with land on both sides, not an island. River access keeps the existing port
roles coherent without inventing new transport rules. Levels 5/10/15 add original
cosmetic paths over bare ground; levels 25–50 develop the level-20 base. Region
is contiguous inland desert with dunes, sandstone ridges and palm oases, not
water-surrounded land or a blue framed cutout. It retains 16 ordinary locations
including home, one locked premium preview and two resource markers. Desktop
Fit shows the full Region; compact Overview is explicitly bounded and pannable.
Old internal island keys remain solely for save/API compatibility. Visible
Sea Chart Archive becomes Route Chart Archive. Prior coastal artwork is retained.

Original Hall/Academy assets and 30 non-Hall atlases have exact submitted prompts,
generated-source paths and saved filenames in `prototype/assets/progression/`
briefs. Built-in ImageGen is the generation/edit method. The Founder-authorized
edge cleanup creates versioned v2 atlases, retaining every v1 original. Its exact
low-alpha exterior-fringe gate clears 509,827 alpha bytes only. Independent checks
preserve all RGB, all noncandidate RGBA, 206 genuine warm details and 14,103,109
alpha>8 painted pixels; all 30 input/output hashes match and cleanup is idempotent.
Actual Academy 50 browser comparison confirms opaque terracotta remains intact.
Hidden RGB in transparent-image viewers is not evidence of visible paint damage.
New terrain and Hall sprites receive no local pixel cleanup.

Final isolated browser QA passes **211 distinct groups**, with zero captured
page, console, request or HTTP errors: all-building 81, artwork 38, smoke 43,
Dev/Gameplay modes 9, HUD 13, progression 12 and Region/World 15. The building
count is the cumulative 77 functional groups plus a focused rerun of four
mixed-town geometry groups, not a single uninterrupted 81-group run. The artwork
suite covers all 341 actual designs, exact CSS/native crop registration, distinct
material stages, complete role props and zero foreign neighboring painted pixels.
Desktop/compact gallery, actual six-role stages and all-23 mixed level-50 towns
are verified. Six extra clean evidence captures add no regression counts.
All owned headless browsers are closed and their process slot released.

Three harness corrections were evidence-led, not relaxed runtime requirements:

- Bare ground 16 was demonstrably drawn/exposed (885 changed pixels, peak RGB
  difference 197), but four brown interior samples had low contrast against sand.
  Added independent darkest/brightest fully opaque source-material samples;
  retained original points, the ≥10 RGB threshold, two distinct changed points,
  sample separation, ≥44px target, real hit testing and source/composite proof.
- Museum 50's crop extends five pixels beyond an ideal grid cell into transparent
  padding: only 1,310 outside pixels, maximum alpha 28, none above 30. Replaced
  invalid equal-cell assumptions with actual registered source rectangles and
  an independent alpha-connected ownership oracle for 12 row-major main bodies,
  full props and zero neighboring material. No clipping/corner/material proof
  was waived; all 341 designs pass the stronger ownership checks.
- A normal timed Gameplay toast temporarily overlaid one new Shipyard sample.
  The harness waits for its natural hidden state only when its painted bounds
  intersect a stable screenshot sample. It never suppresses the toast or changes
  runtime; live exposure/hit/nonoverlap checks remain required. Smoke also uses
  current River-port labels and exact accessible role-option names, not a regex
  over concatenated adjacent text nodes.

Fresh visually reviewed evidence is retained in
`evidence/2026-10-10-desert-region-level50/`: bare Hall 1, developed Hall 50,
six-role 50, all-23 mixed 50, desktop/compact Region and World, gallery and reset.
These are isolated test fixtures, not screenshots of altered Founder progress.
Root accepts the first-draft wood-to-masonry and bare-to-maintained desert stages,
continental Region and readable corrected badge; this is not Founder acceptance
or exhaustive certification of every device/ultrawide ratio.

Final source SHA-256: `app.js`
`3045f1d81dde596846accf43ece3daa662e16ee2103cd6a36be176b6c4169471`;
`atlas.css` `2ab6d5d6302651f3b5b3a149a5eb6c4c0100b55d27d792dd98a0b5233f3eab0e`.
The dedicated Sites source helper pushed exact commit
`7b9caa3638278613df010ab9f0c5109a8b1c42af`; canonical foundation Git was not
committed or pushed. Source transport recovery used process-only HTTP/1.1 and
postBuffer settings, with no force push, reset, SSL bypass or persistent config.
One packaging retry corrected the helper subprocess's missing Node PATH without
changing source. An independent raw-header audit then rejected macOS AppleDouble
and PAX/xattr-bearing candidate archives. The unmodified helper was rerun with a
temporary create-only system-tar wrapper using documented ustar/no-metadata flags,
limited to that process's PATH; no system/plugin/canonical metadata was changed.

The accepted helper archive is
`/tmp/azmara-desert-region-delivery.Vw2Oe3/azmara-private-preview-ustar.tar.gz`,
SHA-256 `537e52c97e233d5df44f7c44f8d1790db5bd188c226037632e4b37289678a5e2`.
Independent audit finds exactly 72 raw ustar headers: 67 byte-identical runtime
files, the correct `dist/.openai/hosting.json`, and four expected directories.
No extra/missing payloads, AppleDouble, PAX/global headers, xattrs, links, unsafe
paths, docs/tests/tools/raw-v1/native material or secret patterns. Thirteen
obsolete delivery coastal copies were recoverably moved to
`/tmp/azmara-desert-region-delivery.Vw2Oe3/previous-delivery/`; every canonical
original remains. Metadata-bearing candidate archives are retained but rejected.

Native owner-private save/deploy succeeded on 10 October 2026 at 17:50:50 UTC:
deployment `appgdep_6aca7adb64188191b08ffc05c5318833`, saved version
`appgprj_6ac7643d3f588191ba2157dfe1972c3d~appgver_679125b849d88191ba432daecf0cc55a`.
Native deployment URL:
`https://azmara-private-preview.blackumbreallagroup.chatgpt.site`.
Post-publication Site metadata confirms version **14**, live custom URL
`https://azmara.app`, owner role, active status and unchanged owner-private custom
audience (one allowed user, zero groups, zero external visitors). No login,
domain/DNS, sharing, backend or schedule changes were made.

Chrome had been closed during the long local pass; it was reopened through the
supported native app API, its restored existing AZMARA tab reconnected and left
on Region as a retained deliverable. Live visible DOM confirms the final cache
tag, desert terrain, Region terminology and wooden Hall 1. The same visible
name Your town and 2400/760/540 resources remain; no Dev build/reset/refill/test
level was clicked. Captured live console errors: zero. Save-byte proof is from
isolated regression contexts, not access to the Founder's browser storage.
The owned local QA server was stopped after verification; port 4317 has no
remaining listener. No user browser tab or unrelated process was closed.

Earlier results below are explicitly historical Hall-only baselines, not the
expanded draft's final QA. Native 0.1.0+2 remains paused and untouched. No native
sync/build/install, functional economy, satisfaction, research, troops, trade,
transport, production balance, backend or multiplayer is implemented by this pass.

## Dev reset, cancellable Updates, staged art and wider HUD — baseline verification

Implementation under DEC-052/053/054/055 completed locally before the DEC-056
expansion; it was not published separately. Its baseline checks follow.

- Confirmed Dev Reset plots clears all 23 sites including Hall and queued work,
  preserves the name/legacy bytes, and restores illustrative 2400/760/540 stocks.
  Only the central Hall has a Dev build recovery; the other 30 catalogue roles
  remain read-only concepts and all other 22 plots remain non-buildable.
- Update replaces Preview upgrade. New local projects last 120 seconds and store
  an exact paid-cost receipt. Before 60000ms cancellation returns 100%; from
  60000ms it returns 30%, floored per whole resource, after confirmation.
  Completion settles first. A single timestamp makes each cancellation decision
  atomic, and removed confirmation controls restore focus to Close.
- Valid old ten-second v3 queues retain their deadlines and unchanged raw save
  bytes. A semantic saved-state fingerprint suppresses no-op startup writes,
  while fresh/invalid/unavailable storage and legitimate completion remain safe.
  Explicit empty reset is additive `hallPlaced:false`; existing saves still
  mean occupied Hall when that field is omitted/true. Gameplay stays read-only.
- Original Hall sprites and desktop/compact terrain use completed-level stages
  1/5/10/15/20. Level 1 is a rough wooden shack on bare ground; later stages
  improve civic craftsmanship, paving and landscaping. Queued/cancelled Updates
  do not advance appearance. Appearance is a labelled transient Dev review,
  restored on exit/Gameplay without changing actual levels/resources/save.
- Desktop HUD width is `min(700px,100vw -386px)`, name section 176px, horizontal
  navigation and roomier 48px actions/resources. Advisers widen to 344px without
  adding height. Short desktop profiles use a measured HUD-clearance projection
  bounded by full marker height plus 1px between the closest rows. The Hall
  stays geometrically central. The wall-only earth plot receives a separate
  southward visual clearance offset where needed; its base anchor stays intact.
  Four Hall-adjacent plots separate symmetrically and two middle edge sites shift
  inward only when required to keep full marker boxes apart by 1px. General
  outer extents and all original base anchors remain unchanged. Reset uses the
  nominal Hall footprint so clearing/rebuilding cannot move these plots.
  Coastal reserves and compact anchors do not move.
  Bounds are measured once per viewport size, not every animation frame.
  Compact anchors, all 23 IDs/roles, finite camera and island 16+1
  remain intact. Original artwork/historical versions are preserved.
- The late DEC-055 addition replaces the grey wall sprite with the same original
  earth plot as ordinary sites, retaining wall-01, its wall-only role and anchor.
  The Founder explicitly chose construction later. Town-wide water-ending
  wooden-to-stronger walls and route tree clearing are recorded, not simulated.
  Grey historical source remains intact; the unused delivery SVG is omitted.

Assets/provenance: `prototype/assets/progression/` contains 15 runtime PNGs and
Hall/terrain exact-prompt briefs. Built-in ImageGen edited original AZMARA art
for four Hall stages and eight terrain variants; level 10 copies are byte-exact
historical originals. All Hall files are 1536×1024 RGBA; compact 1254 square;
desktop 1672×941 except generated 5/20 at 1671×941. The native one-pixel difference
is retained, not silently resampled; scene geometry is independent of bitmaps.
These are visual stages, not economic bonuses or functioning infrastructure.
Native 0.1.0+2 remains unchanged and paused; no native sync/build/installation.

Final strict `construction.cjs` passes 20 deterministic groups with zero browser,
console, request or HTTP errors: exact 59999/60000/119999/120000 boundaries,
advancing-clock decision checks, reload/keep/double click/completion focus,
old 10s byte preservation, forged receipts/safe fallback, unavailable storage,
and all 23 actual empty grounds exposed in Dev/Gameplay desktop and compact.
The final source has refreshed desktop/compact all-empty screenshots, including
the plain wall ground. Further appearance/regression results and publication
are recorded after completion; these local checks are not device proof.

Final-source HUD checks pass 13 groups at eight desktop profiles: 1024×600/768,
1280×720, 1366×600, 1500×600, 1440×900, 1864×977 and 2560×900. They prove all
23 full sprite-aligned rectangles do not overlap, all full 44px selection cores
are exposed, and actual opaque ground pixels are drawn and selectable. The
larger HUD initially intercepted the fixed wall at two short profiles, and the
north projection initially crowded six Hall/edge pairs. Those were real
failures, fixed through the bounded responsive offsets above; no exposure or
non-overlap assertion was waived. Independent geometry-oracle comparison alone
permits ≤0.55 screen pixel for integer scroll rounding (observed 0.286px at
1280×720), not for actual clicks, material proof or marker separation.
The 350-world-unit wall-isolation test independently retains the exact ideal
anchor floor; recovered CSS geometry permits only one 1/64px browser layout
quantum. At 2560×900, the ideal distance is 350 while box recovery is
349.9943603 world units (0.00344 screen pixel). This is numerical quantisation,
not a reduced design spacing requirement.

The source-only extreme-ratio audit is not general browser certification:
1536×600/1920×600 fall outside the historical 350-world-unit wall-isolation
composition envelope, although their computed full targets remain separate.
At 3000×600 the wall-spacing guard reports `data-wall-clearance="limited"`;
top-HUD clearance and full-marker separation cannot both be promised in that
extreme Fit pose. No claim is made for every possible ultrawide ratio.

Final core suites pass 100 groups: 13 HUD, 12 plot geometry, 20 construction,
12 progression and 43 smoke, with zero captured browser, console or request
errors. Smoke covers 14 viewport layouts, dialogs/input gating, actual sprites,
all-empty reset/build recovery, new controlled two-minute completion, malformed
or blocked storage and expired old-queue reconciliation.
Progression checks prove all 15 assets decode, their alpha/opacity contracts,
byte-exact historical level 10, actual stage pixel differences, completed-level
boundaries, transient review cleanup/profile changes and unchanged pretty-save
bytes. All 23 actual role selections and strict full-wrapper separation pass;
compact anchors and saved queued/legacy data remain intact. Fresh reset and
level 1/20 desktop/compact screenshots are retained in
`evidence/2026-10-10-dev-updates-progression/`. Root visual review accepts the
wood-to-masonry Hall and bare-to-maintained field, with a consistent coastline.
The complete frozen Hall-only local baseline passed 178 groups with zero
captured browser/console/request errors: construction 20, progression 12,
HUD 13, geometry 12, smoke 43, desktop 8, spacing 16, camera 11, modes 9,
Atlas 13, catalogue 9 and representative map controls 12. Its app SHA-256 is
`3c4a5bb3a2c045652f48b8ac3764233941484fda995d78da9eb3fbd416ef4913`.
The isolated browser/process was closed before the DEC-056 implementation edits.
These results are a baseline only; expanded all-building verification and
private delivery follow separately. No baseline draft was published.

## Plain town plots and seamless 16+1 island — private version 13

Implementation under DEC-050/051 is delivered as owner-private version 13.
`app.js` removes plot plus overlays and expands the ordinary desktop field
around its geometrically central Hall. Aspect-aware upper clearance retains
the fixed painting and full-art Fit; compact anchors and all 23 IDs/roles stay
intact. The closer desktop camera frame has 50 world pixels more northern
headroom (`650,600,3150,1630`, southern edge still 2230), enclosing the complete
highest reserve at closer zooms. Animation progress is clamped to [0,1] because
a first animation-frame timestamp can precede its performance.now() start.
`desktop.css` narrows the HUD to 420px and caps the town-name area at 220px.
`styles.css` replaces rectangular plot focus with warm silhouette highlights.
Non-plot controls keep their keyboard focus rings; camera +/− stays available.

Original transparent island terrain v2 is saved beside historical v1; offshore
pixels are genuinely transparent. Exact built-in ImageGen prompt/provenance is
in `prototype/assets/town-atlas-art-v1-brief.md`. `atlas.js`/`atlas.css` provide 16
ordinary island locations including home plus one locked premium preview, not
changes to the town's 23 building plots. No purchasing, unlocks or colonisation.
Compact island Overview uses a 600px minimum true-aspect stage with finite
panning so all 19 map targets remain distinct 44px controls. Desktop retains
complete-island Fit and World framing stays unchanged. Home is ordinary location
8; the gold locked premium preview is location 17 on the southern islet. Other
ordinary names appear on hover/focus. The sea has no rectangular image mask.
`index.html` versions changed JS/CSS URLs so a cached prior script cannot retain
the old nine-location composition after the revised HTML loads.

The focused spacing/selection suite passes 16 groups with zero captured errors:
both modes, 23 exposed 44px roles, 22 visible reserves, 92 actual panel clicks,
central Hall, smaller safe name box, warm keyboard focus and exact active v3/
legacy-save preservation. Desktop profiles are 1024×600, 1440×900 and 2560×900,
plus compact 390×844. Local Chrome also confirms the town composition and Hall
click/close focus restoration without a rectangular outline. Final town suites
pass 89 groups: 43 smoke, 8 desktop, 12 plot, 10 HUD and 16 spacing/selection.
All final runs capture zero browser/console/request errors. An earlier smoke
run had a localhost catalogue connection reset; no assertion was waived. A
strict rerun after increasing the isolated QA server's listen backlog to 64
passed cleanly. This is test-server housekeeping, not a game runtime change.
The corrected source subsequently passes 11 camera, 9 mode, 13 Atlas and a
repeated 12 plot-layout groups (45 in this final batch), all with zero captured
page/console/request errors. The earlier 89 town groups plus camera/mode/Atlas
represent 122 distinct regression groups; the complete town batch was not rerun
after the two-line camera correction. Its targeted plot rerun confirms all 23
actual role clicks and 22 ground/reserve pixel proofs. Camera checks cover 37
fine zoom samples, complete northern reserve enclosure and a deterministic
first-rAF timestamp before its start. Valid queued v3 and legacy bytes remain
exactly unchanged. These are isolated local Chromium checks, not native,
cross-browser or Founder acceptance.

Fresh unseeded Hall 1 town Fit/focus and Island Fit/compact Overview screenshots
are retained in `evidence/2026-10-10-plain-plots-island/`. Root and independent
visual review confirm seamless coastline compositing, distinct ground plots,
central Hall and no blue rectangular plot outline. Compact Overview deliberately
pans; at the smallest profiles the premium caption can require a pan away from
fixed controls, while all 19 targets are individually reachable.

The supported Sites helper pushed and packaged exact source commit
`93bcb96ce77cc7852e97727fa0a7b8afb641d4a4`. All 21 delivered runtime files match
canonical source byte-for-byte; the package excludes tests, documents, native
code and secrets. The first package attempt stopped because its child shell
could not find Node; rerunning the supported helper with the bundled Node on
PATH completed without another source change or manual history manipulation.
Archive SHA-256:
`e46dd832dd77baad5c34ccdc56f1ee4b8a9af9d9aca1e1e075eabbd021f75e77`.
The obsolete delivery-only island v1 was moved recoverably to
`/tmp/azmara-plain-plots.nWyh4y/previous-delivery-island-terrain-v1.png`;
canonical original v1 remains preserved.

Owner-private version 13 succeeded as
`appgdep_6aca34926214819183b6d145c18bff94`, saved version
`appgprj_6ac7643d3f588191ba2157dfe1972c3d~appgver_9882c5c63db081919edbb584b90c7413`.
The primary address remains `https://azmara.app/`. A post-delivery access read
confirms owner/custom policy, one allowed user, zero groups and zero external
visitors. Normal login, audience, preview key, domains and DNS are unchanged.
An authenticated Chrome review confirmed the central unmarked town, smaller
HUD, Hall click/close restoring focus with outline:none, and the decoded v2
island with 16 ordinary locations plus premium 17. Premium opens only the
informational locked-location note; the live island tab is retained for review.
No town was reset, renamed or upgraded. Native `0.1.0+2` remains unchanged,
paused; no native build, installation or asset sync was performed.
The owned loopback QA server was stopped after testing; the live Chrome tab
now points at the private deployment rather than localhost.
The version-12 results below describe the previous source, not this revision.

## Town HUD, atlas, catalogue and Dev/Gameplay modes — private version 12

Implemented under DEC-046/047/048 in `prototype/`: smaller desktop town
HUD, Coins-first resource rows, ship/population/action-point placeholders and
inventory/shop notes; left rail removed with tools retained in Options; centred
Hall, flag-free plus-marked ground, original wall and dock reserves; 10%/180ms
desktop fine zoom. All new counters are explicitly not configured. The draft
merchant 300 / freighter 50,000 cargo distinction is informational, not transport.

`atlas.js`/`atlas.css` provide original World → Island → same saved Town preview
navigation, four resource pairings, resource/location details and bounded camera
controls. Twelve fictional islands reuse one original terrain. Other towns/sites
are preview locations, not connected players, colonies or productive mines.

`catalogue.js`/`catalogue.css` provide a read-only 31-design catalogue from Options,
the compact menu, empty-plot notes and Advisor overview. Four original transparent
1774×887 contact sheets hold 30 new designs; the existing Hall provides the 31st.
All use original AZMARA architecture, descriptions and UI. Temple becomes Prayer
Area (possible satisfaction benefit later); Chronos’ Forge is secular work
planning/timekeeping. No gods, divine powers, miracles or imported reference costs.
The Town adviser label is Advisor; Town navigation and Town Hall are unchanged.
Trade, war and economics are recorded as the eventual strategic emphasis.

DEC-049 adds coloured Dev and Gameplay buttons before Preview/Help/Options,
with compact equivalents in the town menu. Dev exposes the existing catalogue,
guide, demo Hall upgrade and reset. Gameplay hides these test tools, retaining
ordinary town/map/adviser navigation and read-only building information. The
private workbench reloads in Dev; mode is transient UI state, not persisted town
data or an access boundary. A switch preserves saves, map/camera and any valid
timer. No sandbox, testing cheats or additional gameplay rules are implemented.

Built-in ImageGen mode, full prompts, inputs and saved asset paths are recorded in
`assets/building-catalogue-v1-brief.md` and `assets/town-atlas-art-v1-brief.md`.
Original native SVG reserves supplement raster ground. Historical art is retained.
The desktop wall anchor is now `(900,1000)` and dock `(3630,2040)`; an ultrawide
Fit bias ensures the entire dock target fits below the HUD and above the viewport
edge. This is a render-only correction, not a save or plot-role change.

Fresh starts remain Hall 1 + 22 empty plots. Catalogue/map browsing does not place
buildings or implement economy, research, population, military, trade, purchases,
backend or multiplayer. Valid v3 progress/queues and legacy storage remain intact.
The independent native app stays unchanged at `0.1.0+2`, paused. Local Chrome review
visibly verified Advisor, town markers, Island navigation and all 31 catalogue
titles/illustrations. This source is now delivered as owner-private Site version 12.

Final-source feature checks: 9 mode, 9 catalogue and 12 atlas regression groups
passed sequentially, with zero captured browser/console/request errors. They
cover keyboard and 44px mode controls, exact queued/legacy-save preservation,
stale Dev-action guards, modal/focus cleanup, town/atlas camera preservation,
all 31 cards and original sprite cells, and map navigation across compact and
desktop sizes. Final town checks also passed: 43 smoke, 8 desktop, 12 plot-layout,
10 HUD, 12 representative map and 11 camera groups. Total: 126 automated groups
passed, plus six responsive UI profiles (1024×600, 1440×900, 2560×900, 390×844,
320×568 and 844×390), with zero captured errors in completed final runs. All 23
Fit targets and 22 drawn plus marks are exposed, including ultrawide. These are
isolated Chromium checks, not native, cross-browser or Founder acceptance.
One review-iframe startup failure did not reproduce in ten direct starts or the
strict full rerun. Failure-only resource/DOM diagnostics remain in the harness;
no startup assertion was waived and no runtime fix was made for that event.
The 44px desktop header uses an inset lower border; town/adviser panels start
at 50px with town spacing tightened to preserve the previous lower HUD boundary.
Fresh unseeded local evidence (Hall 1, not the Founder's save) is retained in
`evidence/2026-10-10-town-atlas-catalogue/fresh-dev-catalogue-qa.png` and
`fresh-gameplay-town-qa.png`, with Prayer Area, Forge and Island evidence beside
them. The original atlas still reuses one island terrain; its sea-edge texture
blend is a first visual draft, not final varied world geography.

The supported Sites helper pushed and packaged exact source commit
`95a907244c7c986bb5cc152a03228d4c40600d16`. All 21 delivered runtime files match
canonical source byte-for-byte; the archive excludes tests, documents, native
code and secrets. Archive SHA-256:
`0ea66f599e50a8c1d87f579b34c32bd42fc7f21e6b5d3f21b49e36a36225d977`.
The obsolete delivery-only empty-plot v3 copy was moved recoverably to
`/tmp/azmara-catalogue-delivery.sdgobx/previous-delivery-empty-plot-v3.png`;
canonical historical art remains. Owner-private version 12 succeeded as
`appgdep_6aca25a498208191a1fbccd88d6c06cb`, saved version
`appgprj_6ac7643d3f588191ba2157dfe1972c3d~appgver_fe9566aaf5808191929776a45c5daa48`.
The primary address remains `https://azmara.app/`. Owner/custom policy is still
one allowed user, zero groups and zero external visitors; normal login, audience,
preview key, domains and DNS were not changed.

An actual authenticated Chrome reload on azmara.app visibly confirmed all five
desktop tools, teal Dev and gold Gameplay, Advisor, 23 plots and unchanged Hall 1
resources. Switching to Gameplay hid Preview/Help/private notes and showed a
read-only Hall with no upgrade action. Returning to Dev restored the tools;
Options opened the complete 31-concept catalogue, including Prayer Area and
secular Chronos’ Forge. The live catalogue/colours were visually reviewed and
the Chrome tab retained. Founder progress was not reset, renamed or upgraded.

## Spacious desktop land and separated sites — private version 11

Implemented under `DEC-045`: desktop-only rendering in `prototype/app.js` and
new `assets/azmara-desktop-terrain-v2.png` (1672×941, opaque). Built-in ImageGen
edited our original desktop terrain twice; the first candidate's shore was
too high, so a second edit deepened the civilian land. Exact prompts, original
inputs and generator output paths are in `assets/desktop-art-v2-brief.md`.
No Ikariam pixels, art or map coordinates were imported. Canonical v1 remains.

The general anchor bounding area is now 1,248,000 world-unit squared, about
30.1% larger than the previous 959,170.7; nearest general spacing is 200 rather
than 175.6 world units. The new civilian core is `(900,700)`, size `2500×1050`;
the finite settlement frame is `(650,650)`, size `3150×1580`. General 05/08/12/
16/19 are well inland. Wall reserve is `(900,950)`; harbour reserves are
`(1230,1760)` and `(2760,1820)` on distinct dry coves; freighter is `(3630,1950)`
on its own rocky headland. No wall, port or freighter is actually constructed.
Adaptive ultrawide Fit framing keeps every target exposed without blank edges.
The isolated interactive wall reserve sits beside, not directly on, the larger
painted northwest bare patch: a remaining cosmetic alignment limitation.

All 23 IDs, 19/1/2/1 restrictions, fresh Hall 1 + 22 empty sites, v3 save schema,
existing valid progress/queues and read-only legacy bytes remain unchanged.
Compact browser anchors/art and native source/assets/build/install are untouched;
the installed native build remains `0.1.0+2`, paused. Gentle zoom, Close and
bounded drag controls remain. No economy, backend, multiplayer or public launch.

Final verification: 43 smoke groups across 14 viewports, 12 representative
map-control groups, 8 desktop-overview groups, 11 camera-input groups and 12 new
plot-layout groups: 86 passed, zero captured errors. Tests cover all 23 actual
selections, 22 drawn blue flags, exposed/nonoverlapping ≥44px targets at Fit,
six desktop sizes including 1024×600 and 2560×900, finite zoom/pan painted
coverage, two-axis drag/touch, keyboard, browser pinch, modal gating, responsive
review frame, real 10-second demo upgrade and exact save preservation.
An initial swipe harness used too few background candidates at maximum zoom;
expanding its actual unobstructed-ground search fixed that test-only issue,
without removing any movement or overlay assertion. Source hashes remained
unchanged through final tests. These are isolated Chromium checks, not native
device, cross-browser or Founder aesthetic acceptance.

Visually reviewed Fit at minimum, standard and ultrawide desktop sizes and
Close/intermediate zoom. Saved fresh-town QA evidence matching the final source:
`evidence/2026-10-09-spacious-land/fresh-town-fit-qa.png`.
Additional evidence: `/tmp/azmara-plot-layout-qa.yVaTCL/` and
`/tmp/azmara-land-regression.lHJHUI/`.

Supported Sites helper pushed commit
`cb9fe2b709817a2e7ec25cd4e25d7f261ad89e9d` and packaged that exact source.
All ten delivered runtime files matched canonical files byte-for-byte;
archive inspection excluded tests, documents, native code, old art and secrets.
The obsolete v1 delivery copy was moved to
`/tmp/azmara-spacious-land-qa.92dzRm/previous-delivery-desktop-terrain-v1.png`;
canonical original v1 remains available. Owner-private version 11 succeeded as
`appgdep_6ac96b5f11f08191ac0a09023dbd611f`, keeping `https://azmara.app/` primary.
Owner/custom policy remains one allowed user, zero groups/external visitors;
no audience, normal login, preview-key or DNS changes.

Actual authenticated Chrome reload on azmara.app confirmed terrain v2,
2500×1050 core, all 23 targets and 22 empty flags, with the published Fit
composition visibly reviewed. Close mouse drag changed scroll `(240,11)` to
`(360,91)`, without opening a dialog. Fit was restored and the live Chrome tab
retained. Founder progress was not reset, renamed or upgraded for verification.
The independent compact/native app remains unchanged.

## Gentle web camera and mouse dragging — private version 10

Implemented under `DEC-044`: `prototype/app.js`, `styles.css` and `index.html`.
Desktop zoom buttons now change scale by 8% per step with a 420 ms eased
transition. Close is 1.5× Fit, rather than the previous abrupt close-up.
Repeated clicks accumulate safely; Fit returns to the exact overview.
Reduced-motion preferences remove the animation, and browser zoom shortcuts
and native touch pan/pinch remain available.

Primary-button mouse/pen dragging moves the map horizontally and vertically
after a five-pixel threshold. Ordinary plot clicks remain clicks; dragging
does not accidentally open a plot. Pointer cancellation, blur, resize and
modal opening safely interrupt the camera. HUD controls and open modals do
not initiate map dragging. Intermediate desktop zoom has a modest finite pan
allowance inside the original painted landscape, enclosing the whole
settlement frame; Fit remains anchored. No blank background is introduced.

All 23 plot IDs/roles, Hall 1 fresh starts, v3 save schema, existing valid
progress/queues and read-only legacy saves remain unchanged. No game rules,
economy, artwork, backend, audience, DNS or native app changes were made.
The independent installed phone app remains build `0.1.0+2` and is paused.

Final verification: 43 smoke groups across 14 viewport sizes, 12 camera-control
groups using four representative raster-heavy viewports plus all remaining
regressions, 8 desktop-overview groups and 11 focused camera-input groups:
74 groups passed with zero browser errors. Focused checks include animation
timing/retargeting, reduced motion, click-versus-drag, cancellation, modal
gating, both-axis pan bounds, browser zoom and exact save preservation.
Forty-seven fine-zoom poses from Fit to maximum and back also verified the
whole settlement frame stays inside painted bounds and all plot targets stay
reachable. An initial intermediate-zoom freighter overflow was found and
corrected before all final suites passed. Automated checks are isolated
Chromium tests, not physical iPhone or cross-browser acceptance.

Source commit `834cfb0200aaedf8028ed83bc11b20515c934b3f` was pushed and packaged
by the supported Sites helper. The sanitised bundle contains the same ten
runtime files; tests, documents, native code and credentials are excluded.
An expired short-lived source-write credential was renewed without changing
the preview-access key or normal login. Owner-private version 10 deployed
successfully as `appgdep_6ac961cc5a448191ab18d4ff3d057aa0` to the same Site,
with `https://azmara.app/` retained as its primary URL.

Actual authenticated Chrome verification on the live domain confirmed one
zoom step at 1.08× Fit, Close at 1.5× Fit, and a mouse drag changing horizontal
scroll from 120 to 210 px and vertical scroll from 70 to 150 px, without
opening a plot dialog. The updated playfield was visibly checked and its
Chrome tab retained. A separate fresh-town QA image was visually reviewed:
`/tmp/azmara-camera-delivery.EoQBVF/fresh-town-gentle-close-drag.png`.
Additional isolated evidence: `/tmp/azmara-camera-input-qa.9BdVfh/`.
This is verified private delivery, not Founder acceptance or a public launch.

## Desktop wooded-coast overview — web-only visual iteration

Implemented under `DEC-043`: `prototype/index.html`, new `desktop.css` and
profile-aware `app.js`. At ≥1024px width and ≥600px height, the town uses a wide
original forest/coast overview with a parchment resource/navigation panel,
four original fictional advisor portraits, side shortcuts and bottom camera
compass. Narrow/short browsers retain the compact name/four-dot interface.
Native assets, Flutter source, build/install and app progress were not changed.

Built-in ImageGen created `assets/azmara-desktop-terrain-v1.png` (1672×941,
opaque) and `assets/azmara-advisors-v1.png` (1983×793, transparent strip).
The terrain was derived from our original v3 landscape; advisor portraits
were text-generated. Prompts/provenance: `assets/desktop-art-v1-brief.md`.
Historical assets remain. No reference screenshot pixels or faces are shipped.

The same 23 IDs/roles and v3 save contract remain. Fresh starts show Hall 1
and 22 empty flags; existing valid levels/queues are not reset. Desktop render
projection and coast anchors differ, without save-layout changes. Fit shows
all sites within the scenic overview; Close/zoom explores the finite 2200×1370
world-unit settlement frame. World/Island buttons explicitly open planned,
not-implemented notes. No other towns, roads, production or multiplayer added.

Verification: 43 smoke groups across 14 viewport sizes; 12 camera groups
using four representative raster-heavy viewport groups plus all remaining
camera regressions; 8 independent desktop-overview groups plus zero-error gate.
Checks include all 23 semantic targets and 22 actually drawn blue flags,
minimum/nonoverlapping targets, real 10-second demo upgrade, safe rename,
resource sync, modal focus/input gating, zoom/pan coverage, native browser pinch,
Phone/Desktop iframe switching, valid v3 queues and legacy byte preservation.
Observed defects corrected: half-pixel header clipping, two overlapping harbour
targets, and the freighter's 10-world-unit overflow beyond the close frame.
All final suites passed. Initial full camera run stopped at that overflow;
the complete representative suite passed after the correction. These are
isolated Chromium/simulated gestures, not native-device or cross-browser proof.

Final fresh-town Fit/Close images were visually reviewed. Harbour empty-site
art still overlaps some shoreline rock/shallow water; this is a known cosmetic
alignment limitation, not an implemented quay or constructed port. Future
appearance stages remain unimplemented. Evidence:
`/tmp/azmara-desktop-overview-qa.lZUpxI/` and
`/tmp/azmara-desktop-regression.mm0dCu/`.

Delivery: sanitised static bundle contains 10 runtime files, 13,646,826 bytes;
docs, tests, historical art, native code and credentials are excluded. Source
commit `b5b002676cce9ddc4c3a1d64c58f0cf01b16b060` was pushed by the supported
Sites helper and packaged from that exact commit. The helper's initial
packaging attempt lacked Node on its child-process PATH; rerunning with the
bundled runtime on PATH succeeded without source changes. A short-lived source
write credential was renewed separately; this did not change the preview key.

Owner-private Site version 9 deployed successfully, deployment
`appgdep_6ac94d94433481919ae7fa2b9a01fc4a`. The retained Chrome tab was reloaded
at `https://azmara.app/`; its actual desktop HUD, forest/coast, 23 plots and
Hall 1 were visibly verified in the authenticated owner's session. Game
artwork and UI are live; this is not Founder acceptance or a production launch.
Normal login and the independent installed phone app remain unchanged.

## Purchased domain — private web game connected at azmara.app

Security follow-up, 9 October 2026: the Founder explicitly authorised replacing
the accidentally disclosed Site service-access key. The supported Sites token
rotation returned a different key; exact-origin, trusted-TLS verification returned
HTTP 401 for the exposed key, HTTP 200 for the replacement, and HTTP 401 without
a key. Only status codes were logged; credentials stayed in hidden stdin/session
memory. Version 8, the live URL and one-owner/no-external-visitor policy were
unchanged by rotation. The old value must not be reused or reproduced.

Implemented under `DEC-041` on 9 October 2026. The Founder's domain is now the
same Site's primary live URL: `https://azmara.app`. No new Site, source version,
game build, backend, native update or public audience was created. Version 8
and its verified source are unchanged. The earlier preview address is retained.

Cloudflare Registrar confirms Active registration, expiry 9 October 2027 and
enabled auto-renew for 9 September 2027; displayed renewal price (in the private group record).
The domain is in the existing account named Zyra Connect, ID
`f2c1a6060e5ca076b42bb379db235bc9`, its own zone
`227315e0f0ab385900af348b17331eae`. The empty AZMARA zone received exactly
four provider-required records through its Cloudflare DNS page:

- Apex A: `162.159.143.30` and `172.66.3.26`, DNS-only, automatic TTL.
- TXT: `_openai-site-verification.azmara.app` and
  `_cf-custom-hostname.azmara.app`, with the exact provider-returned values.

Sites custom-domain ID `appgdom_6ac92d6feb5c8191a48f47b33b38f621` reached
**active**, provider **active**, certificate **active**, no last error at
18:22 UTC. Both authoritative nameservers and public 1.1.1.1 / 8.8.8.8
return both routing addresses. Trusted-TLS anonymous access returns HTTP 401,
not game HTML; Site access remains one owner, zero groups/external visitors.
Chrome reached the new domain's ChatGPT sign-in flow with the existing owner
account. The passkey/security-key challenge was left to the Founder; a later
observation confirms the authenticated game loaded at `https://azmara.app/`,
showing Town Hall level 1 and all 22 empty plot controls. The live Chrome tab
is retained as the deliverable. The Founder's Chrome-only browser preference
is recorded in `AGENTS.md`; no in-app browser sign-in was completed.

Browser progress at this new origin is separate from the old preview and the
installed app. No existing save was reset or migrated. The native app remains
bundled/offline and is not updated by a domain change. All original game
rules, 23 plots, artwork, source hashes and private audience are unchanged.
No ZYRA zone, mail, accounts, security settings, purchases or paid upgrades
were changed. Domain acquisition is not name/legal clearance or incorporation.

Verification: the 42-group isolated Chromium smoke suite passed against the new
domain. Nine camera groups passed across 390×844, 390×1066, 1440×900 and 2560×900:
Fit coverage, all 23 plot centres/22 drawn flags, Close/framing, controls,
orientation and preserved v3 progress. Eleven Fit/menu/Close screenshots were
saved and the desktop Fit image was visually inspected. The camera suite did
not complete: the separate `/preview.html` review wrapper returned HTTP 401,
before its iframe test; later intermediate-zoom/pinch groups and the final
browser-error gate therefore remain unverified on this domain. A subsequent
status-only authenticated check returned 200 for `/` and 307 for both
`/preview.html` and `/index.html`; the test transport deliberately does not
forward credentials through redirects. Do not report the complete camera suite
as passed or substitute a local wrapper as live proof.
The Mac's ordinary resolver retained an earlier negative DNS cache, so the
isolated QA process uses the provider-supplied IP with the original hostname
and normal certificate verification. No OS DNS/network changes were made.
Early harness requests failed on that cached resolution before game testing;
the transient test transport was corrected, not the game. A provider service
credential appeared in one failed request's diagnostic output; it was not
written to files or source. Subsequent diagnostic output is redacted, and
authenticated QA requests are restricted to this exact Site domain without
credential forwarding through redirects. Evidence: `/tmp/azmara-domain-qa.ru0U3K/`.

## Native edge-to-edge update — build 2 installed

Implemented under `DEC-040` on 9 October 2026. The Founder supplied a screenshot
of the actual installed native town, establishing visible native game/artwork
loading after build 1; the screenshot exposed separate green top/bottom strips.
Those were the wrapper's Flutter `SafeArea`, not the game's painted map.

`mobile/lib/native_frame.dart` now lets WKWebView occupy the whole Scaffold
body beneath the OS status bar and home indicator. SafeArea applies only to
native loading/error controls. Existing `viewport-fit=cover` and CSS safe-area
offsets remain the control protection; no immersive-mode hiding or WKWebView
plugin modification was introduced. `main.dart` uses this frame. Browser
HTML/CSS/JS, active artwork, save adapter and game rules are byte-unchanged.

Build `0.1.0+2` passed Flutter analysis, 45 Dart tests (42 save/navigation plus
three portrait/landscape/no-inset frame tests), and the existing 12 Node bridge
tests. Signed PROFILE artifact succeeded, 31.0 MB; independent AZMARA identity,
team, exact build 2, deep signature, profile/device membership and expiry passed.
In-place `devicectl` install succeeded, database sequence 6888. Exact v3 native
save value before and immediately after installation matched byte-for-byte
(146 bytes, Hall 1, no construction); no uninstall or reset. This establishes
update retention of the current native save, not changed-town or cloud recovery.
Real-device edge-to-edge, CSS notch insets, input/orientation and offline
acceptance are still being checked separately from widget-test evidence.
An unattached build-2 process launch succeeded, but the one post-update phone
capture showed another foreground app, not AZMARA. It is not visual game QA;
request a reopened-app screenshot instead of repeatedly capturing unrelated
phone content. The Founder must still confirm the updated native view.

## Native iPhone prototype — first install and startup checks

Implemented under `DEC-039` on 9 October 2026 in `mobile/`. This independent
Flutter 3.44.2 shell bundles the existing original HTML/CSS/JS town and three
current PNGs in WKWebView. It does not load the private Site or require its
login. The browser source and owner-private version 8 deployment are unchanged.
Local identity: `com.shakeelahmad.azmara.preview`, display name AZMARA,
`0.1.0+1`, development team `9Y7Z8F36SJ`, minimum iOS 15.0. This is not a
production engine selection or store release.

`lib/main.dart`, `lib/save_contract.dart` and `native-bootstrap.js` provide
native hydration before game startup, strict v3 validation, sequential writes
with fresh native readback before acknowledgement, and preserved-data error/
retry screens. Progress belongs to this installed app, independently of Safari
and the Site; removing it may erase progress. A legacy key is read-only.
`tool/sync_game.dart` copies only the current delivery assets; generated copies
are not a second editable game source. `tool/render_icon.swift` generates an
original provisional AZMARA monogram icon. `tool/verify_ios.dart` checks the
artifact identity, deep signature, development profile, expiry and exact
paired-device membership. The local delivery runbook is `mobile/README.md`.

Completed verification:

- Flutter analysis: no issues. 42 Dart save/navigation tests and 12 Node
  bootstrap tests passed; Dart tool analysis and iOS property-list checks passed.
- Signed PROFILE build succeeded, 31.0 MB. The initially generated iOS 13
  target was updated to 15.0 for the installed Xcode 27 toolchain.
- Strict deep signature and independent AZMARA development identity/profile
  passed, including actual device membership. Profile expiry:
  9 October 2027, 13:36:16 UTC.
- In-place `devicectl` installation succeeded on the Founder's paired iPhone
  15 Pro Max. A running process was matched to the exact installed AZMARA
  executable, not merely a generic Flutter `Runner` process.

At that initial check, visible game readiness was **not yet confirmed**. A correctly ordered console
launch timed out after 25 seconds without the opt-in game health/save logs and
reported a sandbox-extension warning; one bounded 45-second diagnostic also
returned no game health logs. These results are inconclusive, not a diagnosed
sandbox defect. Read-only review confirmed generated Flutter scene wiring,
plugin registration, bundled asset paths and the audit flag; no source startup
defect was found. An installation or process launch alone
does not prove WKWebView, game input or persistence works. Captured phone
foreground was another app, so those captures are not game QA. Founder has been
asked to open AZMARA manually and leave it visible. His subsequent screenshot
confirmed the native town and artwork loaded; build 2's update-retention result
is recorded above. Touch/menu/zoom, changed-save restoration, deliberate Home
Screen cold launch and genuine offline checks remain pending. No uninstall, storage
reset, phone reboot or network-setting change was performed.

Non-secret installation/launch receipts are under
`/tmp/azmara-ios-20261009.EgZnW9/`; temporary evidence is not a durable backup.
Do not use `flutter install` for updates: its installed default uninstalls the
previous app. Keep the identity stable and install in place with `devicectl`.

ZYRA ADMIN was consulted within the Founder's explicit scope; no ZYRA app,
source, backend or settings were changed. No TestFlight/App Store upload,
external testers, Android install, purchases, new backend or live DNS/email
changes occurred. The separate domain/business checklist is in
`docs/architecture/OPEN_QUESTIONS.md`; exact domain and operator remain open.

## Latest artwork: richer riverside palette — private version 8

Implemented under `DEC-037` on 9 October 2026. Original v2 assets were edited
with built-in image generation; no Ikariam pixels were supplied. Active assets:
`azmara-starting-terrain-v3.png` (1254 square RGB, opaque) and
`azmara-town-hall-v3.png` / `azmara-empty-plot-v3.png` (1536 × 1024 RGBA,
3:2, transparent corners). Full prompts and output provenance are recorded in
`prototype/assets/palette-refinement-art-brief.txt`. Historical originals remain.

The pass enriches olive/emerald vegetation, blue-turquoise water, ivory/terracotta
Hall surfaces and teal awnings, and cobalt flags on clay-earth clearings.
Only the three active image names changed in `app.js`; replacing them with v2
names reproduces the previous frozen source hash. HTML and CSS are unchanged.
All 23 IDs, role counts, anchors, runtime sprite dimensions, camera bounds,
menu controls, storage contract, demo costs and 10-second Hall queue remain.

Local verification passed, exit 0: 42 smoke groups and one uninterrupted
12-group representative camera run, both reaching their final zero-captured
browser/console/request-error gates. Smoke retains all 14 UI sizes. Camera
uses 390 × 844, 390 × 1066, 1440 × 900 and 2560 × 900, plus all eight other
functional groups. All four Fit views expose 23 centres and 22 actual blue
flags. Native PNG alpha, 3:2 proportions, Hall footprint, target registration,
canonical app-produced v3 save bytes, active queues and untouched legacy bytes
passed. Arbitrary JSON whitespace preservation is not claimed; the app has
always normalised validated state on load.

Fresh phone/desktop Fit, Close and menu composites were reviewed with no
blocking visual/UI issue or opaque sprite halo. Screenshots:
`/tmp/azmara-v8-qa.vUk7p5/`. These remain Chromium emulations, not physical
iPhone/Android or Safari acceptance. Reflected extreme-ratio scenery remains
a known cosmetic limitation. Future Hall-level art stages are not implemented.

Private version 8 deployment succeeded from source commit
`6ff805e4999b6c7b857b56b7ff939a3b17b9fb9e`; deployment
`appgdep_6ac8c28b07b48191b2ed888ee4572321`, version
`appgprj_6ac7643d3f588191ba2157dfe1972c3d~appgver_00acc546e3708191897f6946f72fd2a5`.
Returned version source provenance matches the verified commit. Audience
remains one owner, no groups, no external viewers. Exactly seven current
delivery files match canonical source; the archive contains these plus hosting
metadata, not docs/tests/historical artwork. Superseded generated delivery copies
were moved to `/tmp/azmara-v8-delivery.SoWR2q/previous-delivery-assets/`;
canonical v2 originals are unchanged.

Hosted verification passed, exit 0: all 42 smoke and 12 representative camera
groups, with both final zero-captured-error gates reached. Anonymous root access
returned HTTP 401 without town HTML. Service access was limited to the exact Site
origin and not stored in source or files. The final audit confirmed 11 non-empty
Markdown files, 27 resolving local file links, 38 sequential decisions with next
DEC-039, seven byte-equal current delivery files and unchanged hosting identity.
The task-owned loopback server was stopped after verification; the private
hosted preview remains available.

## Downloadable preparation — not a native build

Under `DEC-038`, the exact ZYRA ADMIN chat was contacted at the Founder's request
and its completed reply read. It established quick paired-iPhone installs plus
batched internal TestFlight delivery; external approval and Android runtime/Play
delivery were not established. The concrete proposal and independent AZMARA
device checklist are in `docs/architecture/OPEN_QUESTIONS.md`.

At that research stage Capacitor was proposed and Flutter WebView was an
alternative; no implementation was then authorised. The later direct Founder
instruction `DEC-039` authorises local iPhone implementation with the already
installed Flutter/Xcode tools. Build/install outcomes will be recorded below.
Read-only checks found selected Xcode 27.0 and bundled Node 24.19.0; Android tools
were not found in usual inspected locations. Nothing was installed, natively
built, signed, uploaded, purchased or changed in ZYRA. Publisher identity, app
IDs, account/signing changes, test audience and uploads remain separate decisions.


## Latest refinement: inland wall and four-dot actions menu — private version 7

Implemented under `DEC-036` on 9 October 2026. `prototype/index.html`,
`styles.css` and `app.js` replace the persistent brand header, large town HUD,
side rails and bottom dock with a full-viewport map, compact town name at top
left and a 44-pixel four-dot menu trigger at top right. All resources, rename,
advisers, navigation and camera tools are in one native modal actions dialog.
Choosing an action closes it without refitting the map; detail panels return
focus to the visible trigger. Escape, backdrop and sticky close work; explicit
Tab/Shift-Tab wrapping keeps keyboard focus inside the menu.

General plot 09 moves from core `(435, 1095)` beside the harbour to the former
wall location `(1250, 140)`. The single wall site moves to inland `(440, 25)`.
Stable IDs and the 19 general / 1 wall / 2 harbour / 1 freighter structure are
unchanged. Fresh/reset state remains Hall 1 plus 22 empty sites. No asset,
storage schema, costs, queue timing or production gameplay changed.

Regression fixes: noninteractive status toasts no longer intercept taps;
Center uses screen-reader status without a redundant visible toast over a
flag. Test helpers account for native dialog close-event timing, park the
pointer over the menu rather than what is now playable ground, and distinguish
legitimate simultaneous hover/focus labels from pinned labels.

The two test files cover the hidden-until-open controls, full-screen playfield,
native modal access and focus, moved anchors and strict all-plot exposure,
retaining saved-state, original artwork, finite camera and native pinch checks.
Local verification: 42 smoke groups passed, exit 0. All 22 camera functional
groups passed across two runs: 18 viewport/Close groups, then the four original
compatibility groups after correcting a test-only iframe-coordinate comparison.
This is combined coverage, not one uninterrupted 22-group run. The 42-group
smoke and final four-group compatibility runs each reached their final check
for zero captured browser, console or request errors; the interrupted 18-group
run did not reach its global error gate.
All 14 tested viewport sizes expose 23/23 plot centres and 22/22 actual blue
flags at Fit, including 844 × 390 and 601 × 390. Minimum 44-pixel targets,
non-overlap, orientation, saved queues, the review iframe and native Chromium
pinch are checked. Screenshots: `/tmp/azmara-menu-qa.hDFMl8/`.

Private version 7 deployment succeeded from the verified source commit
`f27f881a2aa626a40f373df2c2a413c4bd9f281b`; deployment
`appgdep_6ac82fd022348191a974ca6520f84a39`, version
`appgprj_6ac7643d3f588191ba2157dfe1972c3d~appgver_6ecac9ed8c788191b1aa08ae697a0ea4`.
The version's returned source provenance matches that commit. Audience remains
owner-only: custom access, one owner, no groups or external viewers. Seven
current delivery files match canonical source; the archive contains these
files plus hosting metadata, not documentation, tests or historical artwork.

Hosted verification passed, exit 0: all 42 smoke groups and 12 camera groups,
with both final captured-error gates passed. The hosted camera run uses four
representative viewport groups (390 × 844, 390 × 1066, 1440 × 900 and
2560 × 900), retaining all eight other camera/queue/orientation/iframe/pinch
groups. It does not claim that all 22 local camera groups were repeated remotely.
Anonymous root access returned HTTP 401 without town HTML. Platform service
access was limited to this Site origin and never stored in source or files.
Final document/delivery audit: 11 non-empty Markdown files, 26 resolving local
file links, 36 unique sequential decisions, next DEC-037, seven byte-equal
delivery files and unchanged hosting identity. The task-owned loopback server
was stopped after verification; the hosted phone preview remains available.

These checks do not establish real iPhone/Android/Safari compatibility or
Founder aesthetic acceptance. The existing reflected-margin cosmetic limitation
remains; no new artwork was generated for this pass.

## Latest correction: bounded town camera — private version 6

Implemented under `DEC-035` on 8 October 2026, after the Founder's actual phone
screenshot showed the camera outside the illustrated town on repeated filler.

- `prototype/app.js`: replaced the 6000 × 4800 (or larger) explorable world
  with a 1720 × 1640 settlement frame at `(2140, 1580)`. A larger viewport axis
  gets only the fixed scenery space required to fill that axis, not new travel.
- Fit locks its stored camera pose under native/programmatic scrolling, arrow
  keys and focus. Close/+ unlock finite native exploration and enlarge the
  buildings; Close also enlarges on unusually large displays.
- Removed procedural outland, water-grid and palm patterns. Fixed margins use
  reflected original terrain at approximately the same world scale, with
  eight-world-pixel render overlap to avoid image-edge interpolation gutters.
  Primary artwork remains square, at `(1600, 960)`, size 2800 × 2800. No new
  bitmap, pixel edit, sprite relocation or game-state migration was needed.
- `prototype/styles.css` and `index.html`: Fit pan gating, updated guidance
  and accessible map description. `pan-x pan-y pinch-zoom` is preserved.
- Both test files now verify finite scroll extents and actual painted viewport
  coverage instead of requiring the discarded large world and procedural fill.
- Project instructions, concept, README and decision register reflect the
  narrower camera. The 23 plot IDs/roles, fresh Hall 1, v3 name/stocks/levels/
  queue and read-only legacy key remain unchanged.

Final local verification: 40 smoke plus 22 camera groups passed, both exit 0;
no captured page errors, console errors or failed requests. Fourteen viewport
sizes include 390 × 1066 and 2560 × 900. Tests cover native-size raster opacity
at all reachable zooms and corners, 44-pixel non-overlapping targets, actual
drawn-flag taps, Fit lock, Close enlargement, 10-second Hall queue, byte-exact
valid v3 preservation, orientation, same review iframe and native Chromium pinch.
A separate 3000 × 1800 check confirmed Close enlarges the core by at least 1.6×.

Fit exposure is 23/23 centres and 22/22 flags in the 12 non-short-landscape
layouts. At 844 × 390 it is 19/23 centres and 20/22 flags; at 601 × 390 it is
16/23 centres and 15/22 flags. Buildings lists all plots; zoomed exploration
also reaches them. Do not claim that every short-landscape centre is unobscured
at Fit. Fixed extreme-ratio scenery can look mirrored, including inverted
edge vegetation; this is a cosmetic limitation, not unused scrollable land.
Screenshots: `/tmp/azmara-finite-final-qa.6LnTsB/`.

Private version 6 deployment succeeded. Its source provenance matches commit
`6c4774e7b58415bbea526ada070865f4e4476418`; deployment
`appgdep_6ac80489766c81918ed8a4c49a56e536`, version
`appgprj_6ac7643d3f588191ba2157dfe1972c3d~appgver_db948174fd2c81918c0dfe0ab63c1183`.
Audience remains owner-only: custom access, one owner, no groups or external
viewers. Exactly seven current delivery files match canonical source; archive
contains those assets and hosting metadata, not docs/tests/historical artwork.
Hosted verification passed: all 40 smoke groups plus 12 camera groups, exit 0,
with no captured browser errors or failed requests. The hosted camera run used
four representative viewport groups (390 × 844, 390 × 1066, 1440 × 900,
2560 × 900), retaining all eight other camera/queue/orientation/iframe/pinch
groups. It is not a claim that all 22 local camera groups were repeated remotely.
Anonymous root access returned HTTP 401 without town HTML. Platform service
access was restricted to this Site origin and never entered source or files.
Final audit: 11 non-empty Markdown files, 26 resolving file links, 35 unique
sequential decisions, next DEC-036, seven byte-equal delivery files and unchanged
hosting identity. Physical iPhone/Android and Safari checks remain unperformed;
the Founder must confirm the actual phone experience. Publishing is not
aesthetic acceptance.

## Foundation

Created in the dedicated Development project directory:

- Project overview and navigation: `README.md`.
- Project-only agent instructions: `AGENTS.md`.
- Secret/generated-file exclusions: `.gitignore`.
- Lightweight status and approval process: `docs/WORKFLOW.md`.
- Initial idea and decision records: `docs/ideas/BACKLOG.md` and
  `docs/approved/DECISIONS.md`.
- Deliberately unresolved choices: `docs/architecture/OPEN_QUESTIONS.md`.
- Inspection and delivery record: `docs/FOUNDATION_REPORT.md`.

Local-only Git was initialised on branch `main`, with no template hooks, no
commits and no remote. No external repository was created or connected.

Foundation checks passed: eight non-empty Markdown documents, all seven local
Markdown links resolved, and an inventory containing only those documents and
`.gitignore` outside Git metadata. Representative secret/generated paths are
ignored; a placeholder-only `.env.example` would remain trackable. The Git root
is the dedicated Development project directory, not ZYRA or its parent tree.

These documents are delivered for Founder review; Founder acceptance has not
been asserted by Codex. No gameplay functionality was verified or promised.

## Production game functionality

**None implemented.** No production client, multiplayer server, database,
authentication, native app build or store configuration exists. A separate
local town-screen draft exists; its art and illustrative interactions
are not production functionality or an approved game economy.

## Reference research

Under `DEC-006`, a live Chrome tour of Ikariam Okeanos covered town and world
navigation, population, production, research, storage, trade, transport,
expansion, shared infrastructure, finances, military information and diplomacy.
The observations and untested flows are in `docs/ideas/IKARIAM_RESEARCH.md`,
linked from the README and idea backlog. The approved register records the
research scope, not approval of gameplay features.

Visited navigation paths loaded, town switching and restoration worked, and
the available browser log showed no captured warnings or errors at the end.
No resource or gameplay commands were submitted and no account settings were
changed. This was not an end-to-end gameplay, server, security or mobile audit.
No game functionality was added by this research.

Documentation verification passed after the research update: nine non-empty
Markdown documents, nine resolving local links and no trailing whitespace.
The inventory still contains only documentation and `.gitignore` outside Git
metadata; no remote, code or dependency configuration was added.

## Other projects

ZYRA was inspected only for relevant non-sensitive conventions and was not
modified. No AIOS files, schedules, accounts or mailboxes were changed in this
task. The empty Documents checkout was left untouched.

## Approved design constraints

`DEC-007` records the Founder's exclusion of deities, polytheism, miracles and
divine powers while retaining the broad strategy-game direction. The README
points to the approved register. Only documentation was updated; no gameplay,
screens, assets or replacement bonus system were implemented.

Under `DEC-008`, `docs/CONCEPT.md` now records the approved thematic inspiration,
unresolved historical fidelity, illustrative systems, cultural and historical
care and unchanged originality requirements. The README, agent instructions,
approved register, idea backlog, open questions, reference note and foundation
report were aligned with that direction. The initial foundation evidence was
preserved as a historical snapshot.

This is a concept-documentation update only. No game code, art, screens,
gameplay systems, architecture, dependencies or infrastructure were implemented
or selected. The examples remain ideas, not approved systems.

Verification after this update passed: ten non-empty Markdown documents,
21 resolving local links and no trailing whitespace. The consistency review
confirmed the chosen inspiration, undecided historical fidelity, ideas-only
examples, existing exclusions and documentation-only authority. The inventory
remains documentation and `.gitignore` outside local Git metadata; no remote
was added.

## Provisional name

Under `DEC-009`, AZMARA is now the provisional game name. The README, concept,
agent instructions, approved register and open questions were updated to
reflect that status. Existing folder paths and historical reference titles
remain unchanged. No name clearance, registrations, brand assets or gameplay
implementation were performed.

## Platform targets

Under `DEC-010`, AZMARA targets iOS, Android and playable web browsers. The
README, concept, agent instructions, decision register and open questions were
updated. Engine, architecture, cross-platform account behaviour and launch
order remain undecided. Starting-plan and prototype suggestions are not
approved gameplay requirements.

At that platform-documentation stage, no clients, game systems, dependencies,
backend, infrastructure or store configuration were created. The later local
design scope is recorded below.

## First local town design

Under `DEC-011`, the world is fictional and inspired by the golden age of Abbasid Baghdad.
Under `DEC-012`, the player owns a town and a first local interactive design is
authorised. `DEC-013` selects the supplied reference screen's arrangement for
this draft, using original AZMARA artwork, code, icons and wording.

Implemented files:

- `prototype/index.html`, `styles.css`, `app.js`: a standalone responsive
  browser design with a dominant illustrated town, parchment resource HUD,
  four adviser buttons, slim side controls and bottom dock.
- `prototype/assets/azmara-town-v1.png`: original concept artwork generated
  with the built-in image generation tool and copied into this project.
- `prototype/assets/town-art-brief.txt`: the exact generation brief.
- `prototype/README.md`: launch instructions, interactions and limitations.
- `prototype/tests/smoke.cjs`: repeatable isolated browser checks.

Working local interactions include six selectable places, a building list,
details dialog with close/Escape and focus restoration, town rename, a single
10-second demonstration construction queue, one-time resource deduction,
local persistence and timestamp reconciliation, reset confirmation, building
label visibility and map centering. Adviser categories beyond Town display
future design notes. They are not functional military, research or diplomacy.

Verified with headless Chromium at 1440 × 900, 390 × 844, 320 × 720,
844 × 390, 1920 × 900 and 768 × 1024. Eight regression groups passed, covering
responsive bounds, adviser and dock hit targets, map/asset aspect registration,
dialogs and focus restoration, 20-character names, literal markup safety,
construction reload/completion, single deduction, reset/cancel and malformed
or unavailable storage. No captured page or request errors occurred.

Independent QA also verified coarse taps, label controls, expired construction
completion, reset during construction and storage fallback. Findings about
dock hit areas, narrow adviser clipping, long names, landscape image cropping
and misleading invalid-storage wording were fixed and retested. Close controls
remain visible while scrolling a details panel; short-landscape side tools
do not overlap the resource HUD. JavaScript syntax checking passed.

The local server runs on loopback at `http://127.0.0.1:4317`. A request to show
it in Codex was queued by the app; that is not confirmation of a visible tab.
The link can be opened directly while the preview server is running.

Limitations: illustrative economy and buildings, browser-local untrusted state,
no production simulation, backend, multiplayer, native iOS/Android clients,
authentication or public deployment. No real-device or Safari checks have
been claimed. The prototype is delivered for iteration, not final Founder
acceptance or a production engine selection.

## Founder feedback and core loop research

The Founder confirmed that the first visual draft looks very nice and asked
for a deeper understanding of Ikariam's underlying concept. `DEC-014` records
that direction without treating it as final design acceptance or approval of
every reference feature.

The recorded systems reference and a 7 October read-only inspection of the
game's help informed the connected-economy analysis in
`docs/ideas/IKARIAM_RESEARCH.md`. Reference rules, design interpretations and a
proposed town-and-region slice remain separate. The concept, README and idea
backlog point to that next design focus.

No prototype code or artwork was changed during this follow-up. No production
economy, transport, combat or multiplayer was implemented. No resource,
purchase, allocation, recruitment, movement or account-setting action was
submitted in the reference game; it was left on the original town.

Documentation checks passed: eleven non-empty Markdown files, 24 resolving
local links and no trailing whitespace. Independent review checked evidence
labels, design scope and exclusions; it did not independently verify the live
help's rules or claim new gameplay testing.

## Resource rules discussion

`DEC-015` records the instruction to settle rules before further visual design.
`DEC-016` records the agreed grain and paper roles in `docs/CONCEPT.md`: grain
supports civic satisfaction through a grocery-style service, and paper is the
scholarly and technical resource. Final building names, rates, shortage effects,
research costs and equipment-improvement effects remain open. The complete
resource set is not selected; stone and iron were questioned, not rejected.

The README and agent instructions now reflect the rules-first phase. Only
documentation changed. The local prototype, artwork and gameplay are unchanged;
no code implements the two agreed resource roles yet.

## Town appearance progression

`DEC-017` records subtle improvements to the town scene as town level rises,
starting with a simpler level-1 settlement. The concept now includes this
direction, with exact stages, thresholds and infrastructure effects unresolved.
Future Founder screenshots can inform the original visual design.

Only the decision register, concept and this status record changed. No level
variants, artwork, town-level simulation or prototype changes were made.

## Updated resource direction

`DEC-018` records the Founder's timber, clay, silver and iron direction, their
sources and broad roles, with grain preferred for the unresolved civic resource.
Silver supersedes the earlier paper direction; costs, treasury distinctions,
production and population effects remain undecided.

The concept, README, agent instructions and decision register now reflect this
update. Only documentation changed. No resources, production sites, economy,
artwork or interface were changed in the prototype.

## Confirmed five resource identities

`DEC-019` confirms timber, clay, silver, grain and iron as the five primary
resources. The concept, README and agent instructions reflect that choice.
Grain's source, regional site distribution and the detailed economy remain open.

Only documentation changed. No prototype code, artwork, production sites,
simulation, balance or interface were implemented or revised.

## Island placement and map reference

`DEC-020` records the Founder's clarification that resource placement is per
island. The concept and README reflect that location; resource-site counts,
access and production remain open. The reference research now separates
observations from the four supplied screenshots, their interpretation and the
proposed World → Island → Town navigation for AZMARA.

Only the decision register, concept, README, reference research and this status
record changed. No screenshots were imported as game artwork, and no island
map, world map, resource sites or prototype code were implemented.

## Shared sites and separate town output

`DEC-021` records shared island-site access, separate output and stores for
each town, and deliberate shipping between owned towns. The concept and README
now reflect those distinctions. Reference research records the additional
production screenshots without adopting worker limits, contributions or boosts.

Only the decision register, concept, README, reference research and this status
record changed. No production, worker controls, inventories, transport,
multiplayer or interface changes were implemented in the prototype.

## First video transcript research

On 7 October 2026, the first Founder-supplied YouTube transcript was read in
full. `docs/ideas/IKARIAM_RESEARCH.md` records source-qualified lessons about
connected town budgets, starting-island viability, storage during absences,
logistics, building choices and combat feedback. `docs/WORKFLOW.md` records how
future transcripts will be distinguished from approvals and consolidated.

Only those two documentation files and this status record changed. The video
was not watched and its gameplay claims were not independently verified.
No game code, artwork, approved rules or decision identifiers changed.

Documentation checks passed: eleven non-empty Markdown files, 26 resolving
local links and no trailing whitespace. Independent transcript review agreed
on the main design lessons without claiming verification of the video.

## Town worker allocation and income rules

`DEC-022` records separate town worker sliders, constrained by available
population and the applicable site's maximum, with unassigned citizens
providing hourly income. The concept includes illustrative allocation examples;
the 250 plus 250 plus 500 example is explicitly interpreted as 1,000 people.
Site-capacity sharing and economic rates remain unresolved.

Only the decision register, concept, README, reference research and this status
record changed. No worker sliders, production, income simulation, artwork or
other prototype functionality was implemented. Independent review checked
the population constraint and flagged site-capacity sharing as undecided.

Documentation checks passed: eleven non-empty Markdown files, 26 resolving
local links and no trailing whitespace. Four illustrative population and
capacity calculations passed; these are arithmetic checks, not gameplay tests.

## Financial and government screenshot research

Five Founder-supplied screenshots received on 7 October 2026 informed the
financial and government observations in `docs/ideas/IKARIAM_RESEARCH.md`.
They distinguish town income and scientist expenses from modified military
upkeep, and government trade-offs from straight progression. Future AZMARA
budget displays, research costs and administrative styles remain proposals.

Only the research note and this status record changed. No approved rule,
decision identifier, prototype, account setting or gameplay command changed.
Independent review checked the supplied budget arithmetic and the distinction
between scientist expenses and research reductions on military upkeep; it did
not independently verify gameplay or the underlying modifier formulas.

Documentation checks passed: eleven non-empty Markdown files, 26 resolving
local links and no trailing whitespace. Three budget arithmetic checks passed;
these verify the displayed totals, not economic simulation or gameplay.

## Shared site expansion rules

`DEC-023` records timber contributions towards expanding shared timber and
specialist production sites. Higher site levels permit more workers, without
creating people or automatically allocating them. The Founder excludes
"Donate" wording; alternative labels remain proposals. Detailed contribution,
capacity and timing rules remain open.

Only the decision register, concept, README, reference research and this status
record changed. The close-up contribution panel was recorded as source evidence,
not imported artwork or proof of completed gameplay. Independent review checked
the distinction between greater capacity, greater population and productivity.
No contribution system, upgrade simulation, premium feature or prototype change
was implemented.

Documentation checks passed: eleven non-empty Markdown files, 26 resolving
local links, no trailing whitespace and one correctly numbered `DEC-023`.

## Contribution action wording

`DEC-024` confirms "Contribute Timber" as the contribution action label.
The concept and reference research now reflect that approval. "Site expansion"
remains proposed heading wording; detailed mechanics are unchanged.

Only the decision register, concept, reference research and this status record
changed. No prototype or external-account actions were taken. Independent
review confirmed that the next population-capacity question must remain a
proposal, distinct from growth rules and the town's visual progression.

Documentation checks passed: eleven non-empty Markdown files, 26 resolving
local links, no trailing whitespace and one correctly numbered `DEC-024`.

## Population capacity and satisfaction rules

`DEC-025` confirms that the main civic building provides population capacity,
while satisfaction determines growth within that capacity. The concept and
README reflect this relationship, and the reference research distinguishes
the Founder's wine and Museum examples from selected AZMARA features.
`IDEA-007` records player-controlled grain provision as the next proposal.

Only the decision register, concept, README, reference research, idea backlog
and this status record changed. No housing, satisfaction, grain consumption
or population simulation was implemented, and the prototype is unchanged.
Independent scope review checked the capacity-growth distinction and retained
the unresolved building name, numerical rules and visual-progression link.

Documentation checks passed: eleven non-empty Markdown files, 26 resolving
local links, no trailing whitespace, one `DEC-025` and one proposed `IDEA-007`.

## Civic provision and departures

`DEC-026` records provision needing to keep pace with a developing town,
inadequate satisfaction slowing growth, and sufficiently low satisfaction
causing departures. Example numbers remain illustrative. `IDEA-008` proposes
actual residents as the basis for demand; the Founder has not chosen it yet.

Only the decision register, concept, README, reference research, idea backlog
and this status record changed. No balance table, satisfaction formula, slider
or population simulation was implemented; the prototype is unchanged.
Independent scope review distinguished the approved qualitative relationship
from proposed demand calculations and unspecified departure thresholds.

Documentation checks passed: eleven non-empty Markdown files, 26 resolving
local links, no trailing whitespace, one `DEC-026` and one proposed `IDEA-008`.

## Resident based provision demand

`DEC-027` confirms actual residents as the basis for civic provision demand.
Housing upgrades provide room, not people; Grain supports growth through
satisfaction. `IDEA-008` now records the approved direction, while `IDEA-009`
proposes food-service upgrades increasing maximum provision capacity.

Only the decision register, concept, README, reference research, idea backlog
and this status record changed. No consumption controls, demand formula or
population simulation was implemented; the prototype is unchanged.
Independent scope review confirmed that service capacity should be discussed
separately from consumption controls and departure-allocation priorities.

Documentation checks passed: eleven non-empty Markdown files, 26 resolving
local links, no trailing whitespace and one correctly numbered `DEC-027`.
The backlog distinguishes approved `IDEA-008` from proposed `IDEA-009`.

## Phone and browser design iteration and private delivery

On 8 October 2026, `DEC-028` resumed bounded visual iteration and `DEC-029`
approved Founder-only ChatGPT Site hosting. The prototype remains a single
responsive browser design, not a native app or a production game engine.

Implemented:

- `prototype/index.html`, `styles.css`, `app.js`: the agreed Timber, Clay,
  Silver, Grain and Iron labels, with provisional Coins. Silver, Grain and
  Iron show accessible not-simulated placeholders, not invented balances.
- Clay-labelled demonstration costs preserve the existing internal `stone`
  field and v1 storage key, so old browser-local progress is not reset.
- Automatically stacked phone HUD/advisers, safe-area spacing, tap/swipe
  guidance, four-step Overview guide and a separate browser-progress warning.
- `prototype/preview.html`: Phone/Desktop design-review switch around the
  same interactive frame. Switching does not reload or fork the game source.
- `sites/azmara-private-preview/`: a dedicated Sites source checkout containing
  only the five sanitised delivery files and hosting manifest. Its `dist/`
  is mechanically copied from canonical `prototype/`, not a second game source.
- Project instructions, README, concept, workflow and decision records aligned
  with the limited private-hosting authority.

Verified locally: eight regression groups across six viewports, construction
persistence and one-time deduction, literal/safe town names, reset, malformed
and unavailable storage, updated resource labels, guide and progress warning.
Touch emulation moved the town map. Phone controls have a 10-pixel gap between
HUD and advisers; scrolled panels retain a visible, clickable close control.
The review frame switches 390 × 844 → 1414 × 798 → 390 × 844 at an outer
1440 × 900 viewport, retaining the same frame, runtime marker and town name.
No captured browser errors or page-wide horizontal overflow were found.

Private delivery:

- Site: `appgprj_6ac7643d3f588191ba2157dfe1972c3d`.
- Version: **1**; pushed source commit:
  `c9ed10d88c3a1bdb1203c2f9802ae5d39021b716`.
- Deployment: `appgdep_6ac7661d217481918633d8fec5705981`; native result
  **succeeded**, with no failure message.
- [Hosted AZMARA prototype](https://azmara-private-preview.blackumbreallagroup.chatgpt.site).
- [Phone/Desktop review](https://azmara-private-preview.blackumbreallagroup.chatgpt.site/preview.html).
- Access checked after deployment: custom owner-only policy, one owner,
  no groups and no external visitors. Anonymous root requests returned
  HTTP 401 and did not receive the town HTML.
- The same eight regression groups passed against the hosted origin using
  a platform service-access credential held only in session memory. It was
  sent only to this Site, not stored in source or browser code. No captured
  browser errors occurred. This is technical hosted QA, not verification of
  the Founder's phone sign-in session.

The first packaging attempt failed because a helper could not find Node on
PATH; rerunning the same Site workflow with the bundled Node directory fixed
that environment issue. No duplicate Site was created. The archive contained
only the browser delivery files and hosting metadata, not project documents,
tests, unrelated-project material or credentials. Opening the hosted URL in
Codex returned queued, not proof that its browser tab was visible.

Limits: no population, workers, satisfaction, Grain consumption, resource
production, multiplayer or real game accounts were implemented. Site sign-in
protects access but does not synchronise browser-local progress; phone,
desktop and localhost progress remain separate. No real-phone, Android or
Safari compatibility test, native install, domain purchase, store upload,
public launch or final Founder acceptance is claimed.

Final documentation checks passed: eleven non-empty Markdown files,
26 resolving local links, no trailing whitespace, unique `DEC-028`/`DEC-029`
entries and next identifier `DEC-030`. All five hosted delivery files match
canonical prototype source; the Site manifest retains the exact project ID.

## Two-axis map controls and working plot structure

On 8 October 2026, `DEC-030` approved two-axis finger movement and +/− map
zoom. `DEC-031` separately records the Founder's changeable 23-plot rule:
19 general plots, one wall-only plot, two harbour plots allowing Trading Port
or Shipyard, and one freighter-only facility plot. The counts are Founder
descriptions and approvals, not a new independent verification of Ikariam.

Implemented only in the existing six-place browser demonstration:

- `prototype/index.html`, `styles.css`, `app.js`: a native scrollable map
  surface with vertical and horizontal movement, a bounded camera from Fit
  to 240%, +/− controls, a visible zoom readout and recentring at current zoom.
- The illustration retains its 1672 × 941 coordinate ratio, with building
  hotspots anchored to the same art. Fit shows the entire illustration.
- At small rendered widths, Fit uses label-free 44-pixel building targets
  with full accessible names. Manual label controls can reveal compact names;
  explicit show/hide choices survive zoom changes during the visit.
- Short phone layouts place tools in lower horizontal groups to clear the
  HUD and advisers. Map-focused arrow keys and unmodified +/− keys work;
  native browser pinch and browser zoom shortcuts remain available.
- Camera changes are temporary. The v1 storage key, town name, resource
  values, construction queue, illustrative costs and six places are unchanged.
- `prototype/tests/map-controls.cjs`: isolated camera and compatibility
  regression checks. Existing `tests/smoke.cjs` remains unchanged.
- Project instructions, concept, decisions, reference evidence, backlog and
  READMEs distinguish the approved plot design from implemented demo features.

Verified locally: eight existing smoke groups and twelve camera groups
passed across ten viewport layouts, including 375 × 600, 390 × 640,
320 × 568 and 601 × 390. Checks cover two-axis scroll extents and simulated
finger gestures, Fit and maximum zoom bounds, art/hotspot registration,
44-pixel controls, keyboard movement, dialogs/focus restoration, orientation,
same-runtime Phone/Desktop frame switching and unchanged v1 construction
state. All six compact Fit markers were directly tappable in the checked
phone layouts at widths of 390 pixels or less. No captured browser errors,
page-wide horizontal overflow or tested tool/HUD/adviser/guidance collisions
were found. A separate simulated Chromium page-pinch check changed the native
page scale from 1 to approximately 1.25 without changing the camera readout.

Private delivery: version **2**, source commit
`dfc2f469f63fcc62bd6e694942927fcd3483c96e`, deployment
`appgdep_6ac770dfa1008191bd1b44dd2b1d3644`. The native result was
**succeeded** with the same private URL and no failure message. Access checked
again: one owner, no groups and no external visitors. The archive contains only
the five browser delivery files and hosting metadata, matching canonical
source. An expired source-write credential was renewed for the same Site;
no new Site or extra saved version was created. Browser handoff returned
queued, not proof of a visible tab.

Hosted verification: all eight smoke groups and all twelve camera groups
passed against version 2. Anonymous root access returned HTTP 401 and no town
HTML. A platform service-access credential remained in session memory and was
sent only to the matching Site origin, never written into source or files.
Initial hosted harness checks needed two test-only corrections: use a normal
Node module realm for strict object comparisons, and select the town's titled
review iframe rather than the platform's additional one-pixel iframe. App
source and the deployed version did not change for these corrections. The
titled-frame test also passed locally with an unrelated iframe present.

Final checks: eleven non-empty Markdown files, 26 resolving local links,
no trailing whitespace, unique decisions through `DEC-031`, next decision
`DEC-032`, and all five delivery files equal to canonical prototype source.

These are Chromium checks, not real iPhone, Android, Safari or Founder
acceptance tests. The short 601 × 390 view retains limited unobscured town
area because the existing stacked HUD occupies much of the height; Buildings
provides an alternative route to every place. A short-phone guide can sit over
part of the illustration but does not intercept the checked marker taps.

The full 23-plot layout and any wall, port, Shipyard, freighter, construction
catalogue, military or transport gameplay are **not implemented** by this
update. Plot placement and unresolved rules remain future design work; no
proprietary reference artwork, coordinates, code or balance tables were copied.

## Full starting-town layout and continuous terrain — private version 3

Implemented under `DEC-032` on 8 October 2026, replacing the earlier six-place
scene: 19 general plots including Town Hall at level 1, one wall-only plot,
two harbour plots and one freighter-only plot. That is 23 plots, one occupied
and 22 empty. Empty panels explain roles only; no construction catalogue,
production, military or transport gameplay was added.

Original SVG terrain extends beyond a 1400 × 1320 town core in a bounded
world, covering the viewport across camera scales and pan extremes instead
of leaving flat letterbox strips. Phone/tablet controls default collapsed
through width 1100 pixels or short-screen height 600 pixels, with explicit
expand/collapse available. All plot targets are at least 44 pixels. The
generated transparent civic building and its final prompt are retained at
`prototype/assets/azmara-town-hall-v1.png` and
`prototype/assets/town-hall-art-brief.txt`. Earlier concept artwork remains
historical and unused by the active scene.

The new `azmara-town-layout-v3` state uses version 3 and layout ID `town-23-v1`.
Only a validated name may carry across from the old v1 demo. Its stored bytes
remain untouched through upgrades, renaming, reload and reset. Existing new
layout upgrades persist; level 1 applies to fresh/reset state. The existing
10-second Town Hall interaction, toy costs and stocks are illustrative only.

Verification: 36 smoke groups and 16 camera groups passed locally and against
the exact hosted source. Twelve standard layouts include 1440 × 900,
390 × 844, 320 × 720, 844 × 390, 1920 × 900, 768 × 1024, 375 × 600,
390 × 640, 320 × 568, 601 × 390, 768 × 900 and 1024 × 768. A separate
390 × 1066 case verifies a reachable 56% camera step. Checks include actual
painted terrain coverage, plot registration, no target overlap, keyboard,
two-axis simulated gestures, native page pinch, orientation and same-runtime
titled review iframe with an unrelated iframe present. All 23 centres are
directly tappable on checked portraits/tablets. Very short landscape exposes
22/23 at 844 × 390 and 15/23 at 601 × 390; Buildings reaches every plot.
State checks cover all empty role panels, real 10-second Hall completion,
one resource charge, level persistence/scaling, safe names, reset and malformed
or blocked storage. No captured browser errors were found.

Private version **3**, source `213dd9344e768c117aeef53845fb61cdda6d9d31`,
deployment `appgdep_6ac77d37c08c8191bf5ef71cc8a25d79`, returned **succeeded**.
The five current browser delivery files and hosting metadata match canonical
source; documentation, tests, prompts and unrelated materials were excluded.
Only the generated delivery copy of the obsolete city illustration was moved
to the recoverable package directory, not the canonical original. Access
remains one owner, zero groups and zero external visitors. Anonymous root
requests returned HTTP 401 without town HTML. Hosted service access stayed
in session memory and was attached only to the Site origin. Browser handoff
returned queued, not proof of a visible browser tab.

These are isolated Chromium checks, not real iPhone/Android/Safari or Founder
acceptance certification. After viewing version 3, the Founder requested a
richer isometric visual under `DEC-033`; version 3 remains the last verified
delivery until that refinement is separately recorded.

## Illustrated isometric refinement — private version 4

Implemented under `DEC-033` on 8 October 2026. Original opaque terrain and
transparent blue-flag empty-site images replace the flat-board appearance.
The backdrop contains no buildings or marked plots; code separately positions
22 vacant sites and the existing single Town Hall. Original 23 plot IDs,
dedicated roles and core coordinates are unchanged. Terrain is placed square
at world `(1600, 1000)`, size 2800 × 2800, without image distortion. Warm
thin dirt paths remain native. Normal Fit and closer town views are richly
illustrated; distant pan extremes and parts of very short landscape views
outside the fixed backdrop remain simpler continuous SVG terrain, not blank.

Files: `prototype/index.html`, `styles.css`, `app.js`; assets
`prototype/assets/azmara-starting-terrain-v1.png` (1254 square, opaque),
`prototype/assets/azmara-empty-plot-v1.png` (1515 × 1038, RGBA, verified
alpha range 0–255 and transparent corner). Both are original built-in
image-generation outputs, copied without post-generation pixel editing.
Final prompts and provenance are in `prototype/assets/starting-town-art-brief.txt`.
No reference-game image was supplied to generation. The earlier Hall sprite
and historical concept originals remain retained.

Targets cover the actual scaled sprites with a minimum 44-pixel hit area,
rather than using invisible circular-token regions. Names appear on hover or
keyboard focus, with the label toggle able to pin them on. Existing valid v3
stocks, town name, Hall level and active demo queue are preserved; no new
schema, engine, gameplay or occupied building was introduced. Fresh/reset
state is still Hall 1 plus 22 empty sites.

Game Studio was added by the Founder during this work. Its local routing,
game-UI, foundation and playtest guidance was inspected; applicable guidance
influenced playfield protection, separate render/save state, sprite-aligned
selection and screenshot-based QA. Animation-normalisation guidance was
inspected but no animation pipeline or engine migration was needed or applied.

Verification: all 36 smoke and 16 camera groups passed locally and against
the deployed private version 4 (52/52 in each environment). Both hosted suites
finished successfully, with no captured browser, console or request errors.
New checks decode 22 flag sprites and one Hall, register the backdrop to fixed
world bounds, identify opaque blue-flag pixels and map them into screenshot
coordinates, verify they are visibly blue on screen, and tap each exposed
drawn flag to open its matching plot. Checks retain every state regression,
continuous world coverage, pan extremes, 56% zoom, keyboard, labels/focus,
orientation, native page pinch and the titled review iframe. Short-landscape
exposure remains 22/23 targets at 844 × 390 and 15/23 at 601 × 390, with
Buildings access to every plot. These are Chromium simulations, not actual
iPhone, Android, Safari or Founder aesthetic acceptance.

Private version **4**, source `e8a3d7b98e13737ef8d0b7993f70136960a8de4d`,
deployment `appgdep_6ac785b981548191aa83d150117af47c`, returned **succeeded**.
The archive contains seven checked browser files plus hosting metadata,
byte-equal to canonical source; no documentation, test files, prompt briefs,
credentials or other project material was packaged. Audience was rechecked:
one owner, zero groups, zero external visitors. Anonymous root access returned
HTTP 401 without town HTML. Browser handoff returned queued. Hosted QA uses
origin-limited platform service access from session memory, not a game login
or proof of the Founder's physical-device session.

## Settlement composition and Close/Fit framing — private version 5

Implemented under `DEC-034` on 8 October 2026. Original irregular plot clusters
replace the regular rows, with coastal anchors aligned to the inspected river
bank. All 23 plot identities and dedicated roles remain unchanged; fresh/reset
towns still contain only Hall 1 and 22 empty sites. The Hall has a more prominent
320-world-pixel nominal footprint versus 220 for a vacant clearing. Soft native
worn-earth paths replace the earlier thin line treatment. Paths are static
scenery, not completed functional infrastructure or an approved road system.

Three fresh original built-in image-generation outputs provide a coordinated
painted-isometric style: `prototype/assets/azmara-starting-terrain-v2.png`
(1254 × 1254, opaque RGB), `azmara-empty-plot-v2.png` and
`azmara-town-hall-v2.png` (both 1536 × 1024 RGBA with verified transparency).
Final prompts, original output paths and provenance are in
`prototype/assets/settlement-composition-art-brief.txt`. The assets were copied
without pixel editing; no proprietary reference-game image was supplied to
generation. The square terrain sits at world `(1600, 960)`, size 2800 × 2800,
with its aspect ratio preserved. Historical canonical originals remain intact.

The map starts at full-town Fit. The new Close button focuses a closer view on
Town Hall and changes to Fit to restore the whole core. This temporary camera
mode adapts on resizing; manual zoom remains available. Existing valid v3
town names, stocks, Hall levels and active demo queues are preserved, and the
legacy v1 key remains untouched. No storage migration, economy, construction
catalogue, additional occupied facility, animation, progression-art stages or
new game engine was introduced.

Final local verification: 38 smoke groups and 18 camera groups passed after the
bounded lane correction, with zero captured browser, console or request errors.
Checks cover asset dimensions/alpha and rendered blue pixels, irregular anchors,
larger Hall footprint, role restrictions, sprite-aligned non-overlapping targets
of at least 44 pixels across 12 layouts, continuous terrain, pan/zoom bounds,
keyboard, two-axis gestures, native page pinch, orientation and the same titled
review iframe with an extra unrelated iframe present. Close/Fit preserves active
v3 queue/resources/name/level and legacy bytes at 390 × 844 and 1440 × 900.
The existing actual 10-second Hall queue completes with only one resource charge.
All checked full-exposure portrait/tablet layouts expose 23 centres and 22 actual
flags opening their matching panels. Short landscape exposes 21/23 centres and
21/22 flags at 844 × 390, and 16/23 centres and 15/22 flags at 601 × 390;
Buildings and panning still reach every plot. Detailed artwork ends beyond the
fixed backdrop; continuous outer SVG terrain is simpler, and repeated vacant
clearing artwork is still noticeable in Fit. No P1/P2 test finding remained.

Private version **5**, source `0e161a0b54bda2685e2017f345aae980d9597ef1`,
deployment `appgdep_6ac7e403a2808191b753139640567cb1`, returned **succeeded**.
The archive contains seven active browser delivery files plus hosting metadata;
documentation, prompts, tests, historical images and credentials are excluded.
Three obsolete generated delivery copies were moved recoverably to
`/tmp/azmara-v5-package.QmgVxV/previous-generated-delivery`, with their canonical
originals retained. An expired source-write credential was renewed for the same
Site; a helper PATH issue was corrected using the bundled Node runtime without
changing the app. No duplicate Site or additional saved version was created.
Audience was rechecked: one owner, zero groups, zero external visitors. Browser
handoff returned queued, not proof of a visible tab.

Hosted verification: all 38 smoke and 18 camera groups passed against private
version 5, with no captured browser, console or request errors. Anonymous root
access returned HTTP 401 without town HTML. The platform service credential
stayed in session memory and was attached only to the exact Site origin. The
test-only hosted bootstrap was corrected to quote multiline code safely and
wrap only the top-level suite entry; no app source or deployed version changed.

Final handoff checks: all eleven project Markdown files are nonempty, all 25
relative file links resolve (plus one existing absolute attachment link), and
no trailing whitespace remains. Decisions are unique and sequential through
`DEC-034`, next `DEC-035`. Exactly seven current delivery files are byte-equal
to canonical source. The owned loopback preview server was stopped after QA;
the hosted preview does not depend on the Mac remaining on.

These checks use isolated simulated Chromium, not physical
iPhone/Android/Safari or Founder aesthetic acceptance.
