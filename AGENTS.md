# AZMARA mobile strategy game project

Read `README.md`, `docs/CONCEPT.md`, `docs/WORKFLOW.md`,
`docs/approved/DECISIONS.md` and `docs/implemented/STATUS.md` before substantive
project work. Read other documents only as relevant to the task.

## Locked design workflow

- This workflow governs all future design implementation and supersedes any
  lower historical note that treats chat or a handover alone as build authority.
- A design or decision is a draft until Shakeel explicitly says `LOCK` and its
  exact supplied text and/or file is recorded under `docs/approved/`. Chat
  approval and handover-only material are not build authority. When Shakeel
  says `LOCK`, record the supplied material and reply with its repository path;
  do not implement it before that approved record exists.
- Shakeel locks decisions. Claude owns game-rule, UX, layout, art-direction,
  master-image and specification design and does not edit code. Codex implements
  only from the locked files and must not invent, redraw or "improve" designs,
  layouts or art.
- Every locked image master belongs in `docs/approved/art/` under Shakeel's
  chosen filename, for example `TOWN_MASTER_CURRENT_VERSION_V1.png`. When a
  master is replaced, rename the previous master with its archive date while
  preserving its version number. Only Shakeel may replace a master.
- Build only from approved documents and approved art masters. If required art
  or design is missing, use a plain, clearly identified placeholder and ask for
  the missing approved source. Never generate, repaint or restyle art or layout.
- Before reporting visual work done, run `prototype/tools/capture-game.sh` and
  provide its screenshot beside the approved master it should match for Claude's
  check. This does not override DEC-084: obtain fresh explicit Owner permission
  before any automated/headless browser run, and never auto-open visible Chrome.

## Current live visual round — DEC-095/096

- The Owner authorizes Codex to build AZMARA's final visual design locally from
  the15 October handover and approved Concept1; Claude owns later gameplay rules.
- A floating town bar, desktop dock, phone dock, responsive panels and an
  original building-free oasis foundation are implemented for manual review.
  Preserve all save/queue/plot/layout data and do not invent gameplay effects.
- No browser was launched and the composition is not yet visually accepted.
  Never auto-open Chrome; the Owner will review manually.
- The Owner subsequently authorized private publication under DEC-096. Private
  web27 was published from source e4cf8ded. DEC-097 then fixes the reported
  desktop side bands by mapping the oasis foundation to the full art plane.
  Private web28 is terminal succeeded at azmara.app from source0c545620; the
  same one-owner/no-group/no-external audience is preserved. Web27 remains
  rollback. Native and held Levels24/26 remain paused.

## Current delivered round — DEC-094

- Appearance is a bounded, dismissible Dev review dialog in private web26.
  It no longer occupies the full game area; backdrop, × and both Return to town
  controls use the town-restoration path. Manual Chrome interaction is pending.
- Revised B2 is implemented and private web25 is live: timber/adobe/sandstone
  defences are constructed into the valley cliffs, with an open pass when wall
  level is zero and a broader open gate/caravan boulevard when built.
- The baked main boulevard is150 desktop/104 compact in every layout. Town
  buildings remain55%. All23 identities, saves, queues, five layout records and
  fixed-role base anchors remain unchanged; prior wall/v1 streets remain rollback.
- Held24/26 and native stay paused. Do not resume them implicitly.
- Never open Chrome. Use saved offline Fit/close renders and source/asset checks;
  accurately leave real-browser/device verification manual.
- Private web26 is terminal succeeded at azmara.app with the same owner-only
  audience. Preserve source commit954a9a82 and web25 for rollback. Hosting
  success is not live-browser visual acceptance.

## Visual implementation rules — DEC-066/067

- Current publication override DEC-088: Owner explicitly requests PUBLISH PLEASE.
  Deliver only implemented DEC-087 Parts1/2 and cache refresh to the existing
  owner-private web Site using its dedicated source workflow. Canyon mock-ups,
  default80% rollout,24/26 and native remain excluded. No visible/in-app/headless
  browser launch; final repairs still need manual review. Keep priorweb21/source
  for rollback and record terminal deployment before claiming published.
  Delivery is now confirmed privateweb22; see WEB_PUBLICATION_22.md. No browser
  was opened; manual verification gaps remain. Do not automatically resume
  canyon/24/26/native work.

- Current round DEC-087: LOCAL ONLY UI cleanup + transient Appearance100/80/65
  size/pin/Oasis comparison; canyon/wall redesign is MOCK-UPS ONLY. Keep the
  live rear wall/art,23IDs/saves/queues/five layouts/all fixed anchors/native/
  Sites untouched.24/26 remains held. One explicitly approved short isolated
  HEADLESS screenshot pass was allowed and is now SPENT/CLOSED (27 captures).
  Later header/wording/toast fixes have static checks only. A second runner is
  prepared but UNRUN; fresh explicit Owner permission is required, not inferred.
  No visible Chrome. That is not permission for repeated automation,
  future browser launches or publication. Report Parts1/2 + Part3 images and
  scoped rollback, then STOP for Owner OK. New proposal art belongs only in
  docs/ideas/canyon-defences-study/, max two attempts per image.

- Current delivery is private web21; see docs/implemented/REAR_VALLEY_WALL.md
  and WEB_PUBLICATION_21.md. DEC-086 below has precedence over conflicting
  historical pause/proposal-only bullets. Final-source analytical/labelled
  offline renders are inspected; live browser/phone acceptance remains manual.
  Keep held24/26, native and old wall art/evidence untouched unless authorized.
  Current wall depth is rear SVG raster only, behind ordinary DOM buildings;
  no front curtain/player/collision system. Original Step5 depth below is history.

- DEC-086 authorizes chosen rear-valley optionA implementation and private
  publication, including moving only wall-01's presentation/base anchor to
  the registered rear gate. Old route/art stays for rollback. Preserve the
  other22 base anchors, five layouts, saves/queues, owner-private access and
  paused native/24/26. Original cliff/wall assets and bounded terrain/depth/
  gate/camera integration are allowed. No browser/headless launch; inspect
  assets and explicitly labeled OFFLINE placement renders, run static/pure
  checks and keep actual-browser/phone verification pending manual review.
- DEC-085 explicitly authorizes publishing the current implemented prototype
  to the existing owner-private web Site, superseding the hosting/staging pause
  only for that delivery. Refresh stale script/review cache labels and sync
  sanitized runtime files, including accepted Oasis0/1/25/50 and the sidebar.
  No valley-wall implementation,24/26 rollout, native update, new libraries,
  audience change or automated browser opening. Preserve manual QA gaps.
- DEC-083 prefers rear-pass optionA for valley concepts, not its runtime route
  or a wall-01 anchor relocation. Keep current wall code/art/targets untouched.
- DEC-084: NEVER auto-open Chrome for the Owner. Do not launch more automatic/
  headless browser tests without fresh explicit permission; Owner tests manually
  to limit RAM. Close only sessions this task owns. Existing capture command is
  available for an authorized run, not permission to invoke it automatically.
  File/static checks and viewing saved images are allowed. Mark latest uncaptured
  UI fixes pending manual verification; no invented final screenshot/all-pass claim.
- Current priority DEC-080/081/082: neighbouring24/26 scenery is APPROVED BUT
  HELD. Build the dedicated local sidebar and its necessary Town/Region/World
  viewport/camera/drawer integration first; this narrowly overrides the previous
  UI/camera freeze, not the wall repair pause. Keep all artwork/Oasis/wall source,
  IDs/saves/queues/five layouts/fixed-role base anchors unchanged. Desktop sidebar
  and phone/compact reserved strip are outside game area. Check Fit and maximum
  zoom using the actual remaining viewport. Dev bar is Dev-only. No native,
  staged sync or publishing. Then prepare desktop/phone start/50 valley-wall
  paint-overs only in docs/ideas, using original AZMARA captures; do not implement
  a new wall route or delete the ring art. Stop after report for Owner OK.
- Current override (DEC-071/072/073/074/075/076/077/078/079): Step 5 wall fixes are PAUSED. Do not fix
  towers, gate hit area or phone Fit, change wall art, publish, or update native.
  The visual-direction study is complete. Owner's subsequent “ok continue”
  is being used narrowly for an Oasis Town desktop/Staggered endpoint pilot
  (Hall 0/1 and 50), not all layouts/levels or wall-work resumption. Closed
  fountain basins only; ornamental rills remain unapproved. Keep the five
  layouts, fixed-role anchors, plot IDs, saves and queues. Owner's subsequent
  “yes looks fine” accepts the shown ground direction (DEC-073), not a full
  rollout, final art, wall repair or publication. Obtain OK for the next bounded
  extension before implementing it. Preserve the original pilot QA receipts
  and `evidence/2026-10-11-wall-build/` byte-exact.
- DEC-075's subsequent “yes” approves implementing the bounded shaded-pockets/
  entrances proposal in `docs/ideas/OASIS_POCKETS_ENTRANCES_PROPOSAL.md`, not
  broader rollout. One original three-motif atlas, at most two generation
  attempts; four selected source-art entrance calibrations, complete paint/
  canopy/shadow clearances and the same desktop/Staggered endpoint gate.
  Preserve scoped rollback and all historical evidence; screenshot-check the
  final result and stop for Owner review. Wall fixes/native/publishing remain
  paused. DEC-074 below is historical drafting authority, not the current stop.
- The DEC-075 pass is implemented locally and screenshot-checked on12 October
  2026. Owner's subsequent “yes” visually accepts the shown pass under DEC-076;
  define the next bounded extension and obtain its OK before implementation. See
  `docs/implemented/OASIS_POCKETS_ENTRANCES.md` and the new pockets-build evidence.
  Preserve the checked source/art/crop/socket metadata; do not resume wall work,
  expand layouts/bands/phone, publish or update native without fresh authority.
- DEC-077's “continue” now authorises the next draft only: one Level25 desktop/
  Staggered middle-stage mock-up and proposal, between the accepted endpoints.
  Use current AZMARA art only, at most two generation attempts. No runtime or
  final game-asset changes, new socket calibration claims, wall/phone/native/
  publishing work or broader rollout. Preserve historical evidence and stop
  after the draft for implementation OK.
  The draft is now `docs/ideas/OASIS_LEVEL_25_PROPOSAL.md`; its generated palm
  positions are approximate, not measured runtime registration. Level25 source
  art needs its own threshold/clearance checks; never reuse endpoint UVs as proof.
- DEC-078's subsequent “continue” approves that bounded Level25 implementation:
  desktop/Staggered25 only, measured placement/selected source25 sockets, partial
  public paving/earth lanes, two modest shade groups and one closed fountain.
  Reuse accepted art; one new two-motif shade atlas with at most two attempts.
  Keep0/1/50 and all other fallback states unchanged, including actual saved/queued
  levels and roles. No app/save/UI/camera/engine/library or wall/native/hosting
  changes are planned. Retain rollback, screenshot-check and stop for art review.
  DEC-077's draft-only stop is historical, not the current implementation scope.
- The DEC-078 exact25 pilot is now implemented locally in `oasis-town.js`, with
  one new registered shade atlas and only its index cache string changed. Final
  verification/review is recorded in `docs/implemented/OASIS_LEVEL_25_PILOT.md`.
  Actual screenshots are checked; save/queue/geometry checks pass. Old fallback
  raster equality remains inconclusive, not a29/29 suite pass. Preserve those
  failure/control receipts. Keep the runtime frozen and stop for Owner art review;
  no next-band/layout/phone expansion, wall work, native update or publication.
- DEC-079 records Owner's subsequent “continue” as acceptance of the shown25
  direction and preparation of the next defined proposal only. The capture-time
  stop above is historical; preserve its original receipts and inconclusive
  fallback raster results. `docs/ideas/OASIS_LEVEL_24_26_PROPOSAL.md` proposes
  reuse at24/26 only and needs separate implementation OK. No runtime/art/native/
  staged change is made now. In any later approved pass, gate a new Caravan20
  registration away from accepted25 mixed/review outputs; never append it to
  the shared25 registry or treat source match as new world-clearance proof.
- Follow the Founder's five-step gate: one step per reply, stop for their OK.
  Steps 1–3 do not authorise changing the wall; Step 4 proposes it without
  implementation; Step 5 requires approval of that proposal. Before a major
  engine/library/plugin/tool or file-structure change, explain what/why,
  affected files, risks and rollback. Do not silently change the architecture.
- **Every visual change must be screenshot-checked before it is reported done.**
  Run the relevant capture, open the PNG yourself, inspect it and fix defects.
  Successful DOM/geometry tests or image decoding do not establish art quality.
- Current engine: custom vanilla JavaScript + DOM/HTML/CSS, SVG landscapes
  and pre-rendered PNG sprites. No production engine, tilemap/map-file loader,
  walking actor, navmesh or gameplay collision system exists.
- Tile size: no gameplay tiles. The local debug **planning grid** uses
  100×100 logical world-unit cells; it neither snaps nor relocates artwork.
  Cell address is `(floor(worldX/100), floor(worldY/100))`. Do not treat this
  diagnostic convention as an approved wall layout or physical collision grid.
- Coordinates: scene-reference `(0,0)` is upper-left; X right, Y down.
  Desktop reference art spans `(0,0,4200,2400)`, with oversized scenery beyond
  it. Compact art has different placement/extents, but the same XY directions.
  Camera zoom/scroll converts world units to CSS pixels, not device pixels.
  Use the actual SVG viewBox/screen CTM, not an independent camera calculation.
  `mapMetrics.width/height` are CSS surface pixels, unlike its world `x/y`.
- Draw order in the Step 5 draft (DEC-069): SVG terrain → roads → scenery →
  back-wall raster → contact pads; DOM building/plot controls above landscape;
  pointer-transparent front-wall raster inside map-hotspots at z-index 3,
  wall-01 gate control/label at z-index 4; local debug grid above them
  (pointer-transparent); HUD/title/menu above the map and modal dialogs above
  HUD. No actor/wall Y-sorting exists. The split raster layer is not actor
  sorting or proof of finished wall art. Debug must never intercept plot input.
- Collision debug: there are currently **no real gameplay collision shapes**.
  Say “not implemented”; do not draw UI hit boxes, plot footprints, decoration
  reserves or painted wall contours as red colliders. When collision is
  implemented, its own authoritative live shapes must supply the red overlay;
  never maintain a separate debug copy. Do not add physics to fill this gap
  without approval of gameplay scope.
- Run the game locally from the canonical root:
  `python3 -m http.server 4317 --bind 127.0.0.1 --directory prototype`.
  Open `http://127.0.0.1:4317/` in Chrome. Local debug session:
  `http://127.0.0.1:4317/?debug=1`, then press G. Grid starts off on every
  reload, is Dev/Town-only, and hides/resets on Gameplay. Ignore G in editable
  controls, dialogs, modifier combinations and key-repeat. Hosted origins
  never load the debug module—even when supplied `?debug=1`.
- Screenshot command: `./prototype/tools/capture-game.sh`; fully built local
  fixture: `./prototype/tools/capture-game.sh --level 50`; overlay-on capture:
  `./prototype/tools/capture-game.sh --level 50 --debug`. Phone dimensions:
  `--width 390 --height 844`. Captures/receipts go into `prototype/debug/`,
  with isolated ephemeral storage and owned browser/server cleanup. They are
  synthetic fixtures, never screenshots of modified Founder progress.

## Project boundaries

- Work on this game only. Forked ZYRA/AIOS conversation history is background,
  not current work, authority, requirements or a task backlog. Do not resume
  those tasks or change their schedules. `DEC-038`/`DEC-039` are narrow direct-Founder
  exceptions: coordinate with ZYRA ADMIN on AZMARA's app-distribution process,
  not resume ZYRA execution or copy its assets, credentials or data.
- The Founder explicitly separated this project from the surrounding
  development tree. Do not import another venture's roles, approval routing,
  registers or operational instructions into it. Follow the current direct
  user request and this project's records.
- Current phase is desktop/web visual iteration alongside rule definition
  under `DEC-028`. This narrowly relaxes the visual pause from `DEC-015` for
  the existing responsive local town-screen prototype and demonstration
  interactions. Do not implement an unapproved economy or population model.
  `DEC-029` permits an owner-private ChatGPT Site preview, with only sanitised
  browser source in `sites/azmara-private-preview/`; preserve owner-only access.
  The five primary resource identities are confirmed under `DEC-019`; consult
  `docs/CONCEPT.md` and the decision register for current roles and open rules.
  The town plot structure is a working rule under `DEC-031` (19 general plus
  wall, two harbour and freighter plots). `DEC-032` authorises the original
  full starting-town visual layout: Town Hall level 1 inside those 19 general
  plots and 22 empty plots, with continuous terrain throughout map zoom.
  Keep prior six-building demo data untouched in its separate storage key;
  this is not permission to invent an empty-plot construction catalogue.
  `DEC-033` authorises richer original isometric/2.5D artwork and blue-flagged
  empty sites instead of flat-board tokens. This is an art refinement, not a
  true 3D engine decision or a reset of valid v3 preview progress.
  `DEC-034` permits recomposing original plot anchors, matching the illustrated
  terrain/sprite style, improving the Hall's prominence and phone framing with
  Fit/close camera views. Keep plot IDs, roles and valid v3 progress unchanged;
  paths are scenery, not new functional infrastructure or buildings.
  `DEC-035` removes traversable outer filler: Fit holds the full town steady,
  while Close/+ allow exploration within a finite settlement frame. Use fixed
  painted scenery for screen-ratio margins, not an enlarged explorable world.
  `DEC-036` moves the wall inland and relocates General plot 09 while keeping
  stable plot IDs and counts. The map fills the viewport; only the town name
  and four-dot menu trigger remain persistent. All other controls live in
  the accessible actions dialog, without changing progress or gameplay.
  `DEC-037` permits the coordinated richer riverside colour/material art pass
  with the same anchors, roles, camera and saves. Show the visual iteration;
  it does not implement all future town-level appearance stages.
  `DEC-039` authorises a separate local Flutter/WKWebView prototype, development
  signing and actual installation on the Founder's paired iPhone. Bundle the
  existing original game locally; preserve the independent browser preview.
  It also permits read-only ZYRA ADMIN coordination on the business baseline.
  `DEC-040` extends only the native town surface beneath status/home areas;
  keep OS affordances and safely positioned controls, with in-place updates
  that retain the same app identity and native progress.
  `DEC-041` permits connecting the purchased `azmara.app` domain to the existing
  owner-private web prototype, with exact-zone Cloudflare routing/validation
  records only. Preserve its audience and the independent native app; no mail
  changes, backend or public launch are implied.
  `DEC-042` authorises replacement of the exposed Site preview key without
  login/audience changes. `DEC-043` now prioritises desktop/web presentation
  and pauses native updates. Desktop ≥1024px and ≥600px uses a wider wooded
  coastline and original reference-style HUD; narrow/short views retain the
  compact interface. Preserve plot identities, saves and truthful placeholders.
  `DEC-044` permits gentler web zoom and mouse-drag exploration. Respect reduced
  motion, suppress drag-generated plot clicks and keep intermediate desktop
  pan margins inside the painting while enclosing the full settlement frame.
  Fit remains stable; native assets/build/install stay paused.
  `DEC-045` authorises a broader original desktop clearing and more spacious
  desktop anchors: ordinary plots inland, an isolated wall and three separated
  coastal reserved sites. Preserve IDs, role restrictions, compact anchors,
  saved progress and the paused native build. New scenery is not constructed
  infrastructure or an approved expansion of gameplay/economy.
  `DEC-046` adds truthful HUD placeholders, Coins-first resources, plus-marked
  ground, distinct wall/dock reserves and faster fine desktop zoom. `DEC-047`
  permits original navigable Island/World preview maps, without multiplayer,
  colonisation, output or transfers. `DEC-048` permits a read-only original
  31-role building catalogue, labels the Town adviser Advisor and prioritises
  trade, war and economics for later mechanics. Prayer Area replaces Temple
  with a possible civic satisfaction benefit; Chronos’ Forge is secular
  construction planning/timekeeping. No gods, divine powers or miracles.
  Do not auto-place catalogue buildings, invent reference balance or change
  the native bundle. Preserve all plot IDs and existing local saves.
  `DEC-049` adds Dev/Gameplay presentation modes. Dev exposes existing tests;
  Gameplay hides catalogue, toy upgrades and reset tools. The private workbench
  starts in Dev on reload. Mode is transient UI state, not permissions, a new
  game or separate save. Switching must preserve town/legacy bytes and cameras.
  `DEC-050` removes plot plus overlays, expands desktop ordinary-plot spacing
  around the central Hall and narrows the town-name/HUD panel. Keep the 23 town
  roles, compact anchors, 44px targets and actual grounds selectable.
  `DEC-051` uses transparent island terrain over continuous sea and selects
  16 ordinary island settlement positions including home plus one locked
  premium preview. This is not the town's building capacity or a purchase rule.
  Plot focus uses a warm silhouette highlight, not a rectangular blue box.
  Preserve keyboard labels, ordinary UI focus rings, saves and paused native.
  `DEC-052` adds confirmed Dev Reset plots clearing all 23 including Hall,
  preserving the town name/legacy bytes and restoring illustrative stocks.
  Only the central Hall can be rebuilt. New Hall Updates take two illustrative
  minutes: cancel before 60 seconds for 100%, then 30% rounded down per resource.
  Preserve valid old ten-second queues; completed projects settle first.
  `DEC-053` adds Hall/terrain artwork stages at completed levels 1/5/10/15/20:
  a rough wooden shack and bare field first, progressively improved later.
  Dev appearance review is transient; other catalogue roles remain non-buildable.
  `DEC-054` widens the desktop HUD horizontally while keeping the name small,
  and modestly widens advisers. Preserve accessible plot exposure and cameras.
  `DEC-055` replaces the grey wall reserve with the same plain earth as other
  plots, retaining wall-01 and its dedicated role/anchor. Founder explicitly
  selected plot now, construction later: future walls surround the town to the
  water with route trees cleared, starting weak/wooden and improving by level.
  Do not implement tree clearing, town-wide perimeter or defence in that pass.
  `DEC-056` subsequently expands Dev first-draft build/Update to all 31 roles
  and levels 1–50, with Skip, direct test levels and replenishable test stocks.
  Preserve all 23 role-restricted plots, the central Hall, old v3/raw legacy
  saves and queues. Use original stages 1/5/10/.../50, not imported reference
  art or balance. This supersedes the Hall-only construction/level-20 limits
  above and permits a wall sample on wall-01, not its deferred full perimeter.
  Gameplay hides and rejects all test mutations. No functional economy,
  satisfaction, research, military, transport or native changes are implied.
  `DEC-057` authorises a first-draft original desert river/oasis town and shared
  Region replacing visible Island terminology/art. Region is geographic, not
  owned by one player; future independent towns do not imply working multiplayer.
  Keep old internal IDs for compatibility where useful, all 23 town roles,
  16 ordinary regional locations plus locked premium preview, saves/queues,
  accessible targets, private audience and paused native. Preserve coastal art.
  `DEC-058` fills Region/World with painted desert and replaces World cards
  with finite coordinate geography; scenic margins are not new playable sites.
  `DEC-059` develops cosmetic metropolis scenery around actual plot footprints,
  relocates the rectangular wall reserve north and moves desktop tools/zoom
  to the bottom. Hall/plots remain separate from decorative landscape.
  `DEC-060` adds five persistent Advisor layout choices in both modes:
  staggered, grid, circle, avenues and garden-quarters. Only general-02–19
  move; Hall/wall/three transport base anchors and all role IDs stay fixed.
  Optional v3 plotLayout preserves old raw saves on read and all timer receipts.
  Responsive presentation may resolve HUD collisions without altering identity.
  `DEC-061` now supersedes active coastal/river/naval direction above: land-only
  desert Town/Region/World, Pack Caravans for smaller/faster loads and Heavy
  Wagon Convoys for slower bulk transport. Caravan Station retains trading-port/
  harbour, Freight Depot retains dockyard/freighter, and Route Archive retains
  sea-chart-archive. Shipyard is retired from new choices/gallery, not deleted
  from valid saves/queues: 30 active types, 31-entry compatibility registry.
  Workshop already covers equipment; do not add a duplicate Siege Works.
  No rivers, sea, boats or naval combat; tiny decorative pools/fountains are
  allowed, without functional water infrastructure. Dev ideal-town review may
  temporarily fill all 23 compatible sites at any level 1–50; all 30 catalogue
  types are reviewable at each level. Never save that preview or change queues.
  Restore actual view on exit/Gameplay. `DEC-062` maps the existing eleven art
  stages to deterministic uneven per-type milestones spanning 1–50, superseding
  the earlier universal five-level cadence for this first visual draft. Never
  randomise a fresh appearance on each Update/reload. Hall drives main-road
  quality; local approaches use min(Hall level, building level), cosmetic only.
  Protect full live sprite footprints. This recommended interpretation is not
  game balance or proof of Founder acceptance of its resulting appearance.
  `DEC-063` authorises the next original dimensional desert visual pass after
  the Founder rejected v15's flat ribbon roads and mismatched scenery. Use
  narrow textured streets, shaded raster scenery and geographic relief, with
  complete crop ownership, full target protection and persistent HUD clearance.
  This is pre-rendered isometric/2.5D presentation, not a production 3D-engine
  decision. Keep v15 receipts historical: functional checks are not art approval.
  `DEC-064` now authorises the cosmetic built city wall to enclose all 23 sites
  in every layout. Completed wall level (not Hall or queued target) controls
  timber-to-masonry strength; temporary review stays unsaved. Keep wall-01
  selectable. This supersedes the earlier deferred perimeter-visual limit,
  not the restrictions on tree clearing, defence rules or native changes.
  `DEC-065` supersedes that visible ring after Founder rejection: mountains
  form the rear visual barrier and original painted fortifications cover the
  front. Give the playable town/buildings more screen space, not outer filler.
  Wall-01 and fixed land-transport presentation may be recomposed; identities,
  role restrictions, own completed-wall strength and all saves remain intact.
  Use focused proportionate visual QA, not unrelated exhaustive reruns.
  The complete economy remains undecided. Production gameplay, backend, multiplayer,
  infrastructure, production framework selection and store setup still require further
  authority. `DEC-012` narrowly
  superseded the earlier foundation-only boundary for the first local design.
- Use AZMARA as the provisional game name under `DEC-009`; final branding and
  name clearance remain unresolved. The existing folder name is internal and
  unchanged. Ikariam is a research reference, not branding or a product to clone.
- Target iOS, Android and playable web browsers under `DEC-010`. Engine,
  architecture, cross-platform accounts and launch order remain undecided;
  asking how to start does not itself authorise gameplay implementation.
- Apply `DEC-011`: a fictional world inspired by Abbasid-era Baghdad and the
  Islamic Golden Age. Example systems remain proposals. Respect Islamic sources and
  sacred material, research specific historical claims, and preserve the
  exclusion of deities, polytheism and miracles. Do not treat the theme as a
  reskin of Ikariam or as authorisation to implement gameplay.
- Preserve originality: do not copy proprietary code, art, text, datasets,
  balancing, maps or names. `DEC-013` permits the supplied reference screen's
  broad arrangement for the first draft, with original AZMARA UI and artwork.
  Keep research sources and proposals
  distinct; do not claim legal/name clearance without evidence.
- Ideas are not approvals. Only explicit Founder decisions enter the approved
  register. Approval does not prove implementation; tests do not prove Founder
  acceptance. Record actual files, checks and remaining limitations.
- Do not modify ZYRA. Inspect its non-sensitive development conventions only
  when relevant and authorised; never copy its credentials or member data.
- Never access `PRIVATE — API KEYS — DO NOT SYNC`. Keep secrets and personal
  data out of source control, reports and conversations. No shared backend or
  production credentials are configured for this project.
- Keep one canonical live document for each subject. Preserve decision history
  through explicit supersession, not silent rewrites. Avoid duplicate registers
  and empty scaffolding without a clear purpose.
- Preserve unrelated changes. Do not delete, move or overwrite existing work
  casually. Use the project's actual root, not the empty Documents checkout.
- Use Chrome for all user-facing browser work. The Founder explicitly rejected
  the ChatGPT/Codex in-app browser on 9 October 2026; do not open or use it for
  AZMARA, account administration or sign-in. Isolated automated game QA is not
  a replacement for the Founder's Chrome session.
- Version control is local only for now. Do not create an external repository,
  add a remote, publish, push or rewrite history without a direct instruction.
  The sole current exception is the dedicated private Sites source checkout
  under `DEC-029`; do not attach its remote to the canonical project root.
- For the first design use a lightweight local browser preview, not a framework
  commitment, with owner-private Site delivery under `DEC-029`. Verify
  navigation, building interactions, desktop/phone layouts,
  accessible controls and documentation accuracy. Record prototype limitations.
