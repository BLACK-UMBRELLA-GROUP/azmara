# AZMARA strategy game

Provisional game name: **AZMARA** (`DEC-009`). Final branding remains undecided.
Current phase: **locked land-stage delivery alongside rule definition**
(`DEC-028`, narrowly updating the visual pause in `DEC-015`).
The first local town-screen prototype remains available (`DEC-012`, `DEC-013`).
The current private web and prepared native package are tracked under
`DEC-100`/`DEC-101`; physical app installation remains in-place only.

Target platforms: **iOS, Android and web browsers** (`DEC-010`). Engine,
architecture, cross-platform account behaviour and launch order remain open.

`APP GAME PROJECT - IKARIAM` is an internal working-folder name, not approved
branding. Ikariam is an inspiration and research reference only.

The intended direction is an original, mobile-first, persistent online
multiplayer strategy game inspired primarily by the Abbasid era, Baghdad at
its height and the Islamic Golden Age. The world is fictional (`DEC-011`) and
the player owns a town (`DEC-012`). Detailed gameplay, final art direction and
production technology remain undecided. Under `DEC-048`, trade, war and
economics are the main strategic emphasis. The current original visual building
catalogue has 30 active types, with a 31-entry compatibility registry preserving
retired Shipyard saves; it is not a completed construction/economy model.
The current geography draft (`DEC-057`/`DEC-058`/`DEC-061`) is **Town → Region → World**:
an original land-only desert settlement within a shared continental basin.
Region describes the shared area without implying a single player's ownership.
Pack Caravans are the smaller/faster transport direction; Heavy Wagon Convoys
are slower bulk transport. Caravan Station, Freight Depot and Route Archive
replace active naval names, while Workshop remains equipment-focused. No
actual rivers, sea, boats or naval combat are in this draft; tiny decorative
pools/fountains are allowed. Transport numbers and simulation remain undecided.
Earlier coastal/island descriptions below record previous iterations.
See the [current concept](docs/CONCEPT.md) and
[approved decisions](docs/approved/DECISIONS.md).

The exclusion of deities, polytheism and miracles is a firm content and gameplay
constraint recorded in `DEC-007`. The broad settlement-building strategy concept
and recorded qualitative rules are approved; detailed balance and production
implementation remain undecided.

A browser design is available in [prototype/](prototype/README.md), with
owner-private hosted delivery approved under `DEC-029`.
It is not the production game: its buildings, values and local interactions
are illustrative. No backend, multiplayer or production engine has been selected.
`DEC-039` authorises packaging this prototype in an independent Flutter iPhone
app; build, installation and device verification are tracked in the status.

## Try the prototype

**Current delivery, private web30 (DEC-100/DEC-101):** all eleven locked land
stages are live. Town, Region and World fill the browser viewport edge-to-edge
with no outer game border; compact Region/World locations remain reachable
below the floating town bar, and phone More/Options state is repaired. The Site
remains owner-only and is not connected to auto-deploy. Refresh manually at
[azmara.app](https://azmara.app). See the
[web delivery](docs/implemented/WEB_PUBLICATION_30.md).

**Prepared iPhone build, AZMARA 0.1.0 (3):** the signed app contains the same
current runtime and supports the current save/construction schema. It is ready
for an in-place installation when the paired iPhone is available and unlocked;
the phone was not modified while unavailable. See
[native build 3](docs/implemented/NATIVE_BUILD_3.md).

**Previous delivery, private web29 (DEC-100/DEC-101):** the exact locked land
stages first went live with the full-viewport shell. It is the immediate web
rollback. See [delivery](docs/implemented/WEB_PUBLICATION_29.md).

**Previous delivery, private web28 (DEC-097):** the oasis foundation first
filled the complete desktop playfield with a centred cover crop. It is the
earlier rollback. See
[delivery](docs/implemented/WEB_PUBLICATION_28.md).

**Previous delivery, private web27 (DEC-096):** the final-design shell v1 is live
for owner review. It adds the floating town bar, responsive desktop/phone docks,
presentation panels and an original building-free oasis foundation while
preserving the existing buildings, current wall, plot identities, saves, queues
and layouts. Claude's future gameplay rules are not implemented. The Site is
still owner-only. No browser was opened; refresh manually at
at [azmara.app](https://azmara.app). It is the immediate rollback. See
[delivery](docs/implemented/WEB_PUBLICATION_27.md).

**Previous delivery, private web26 (DEC-094):** Appearance is again a bounded,
dismissible review dialog rather than a full-game page. Clicking its dimmed
surround, × or either Return to town control restores the town. The approved
revised B2 defence from web25 remains: the defence is built into the valley
cliffs and the caravan boulevard is wider in every layout. Town buildings stay
at55%. See [repair delivery](docs/implemented/WEB_PUBLICATION_26.md),
[wall implementation](docs/implemented/B2_VALLEY_DEFENCE.md) and
[web25 provenance](docs/implemented/WEB_PUBLICATION_25.md). Offline source
checks passed without launching Chrome; live visual/input acceptance is manual.
It remains the immediate rollback. Do not clear saved browser data.

**Previous delivery, private web25 (DEC-093):** the approved revised B2 defence
is built into the valley cliffs in timber, adobe and sandstone stages. The
central gate remains open and the baked caravan boulevard is wider in every
layout. Town buildings remain at the approved55% default. Plot identities,
positions, saves, queues and fixed anchors are unchanged; native and held24/26
stay paused. See [implementation](docs/implemented/B2_VALLEY_DEFENCE.md) and
[delivery and rollback](docs/implemented/WEB_PUBLICATION_25.md). Offline checks
passed without launching Chrome; live visual/input acceptance remains manual.

**Previous private web version21** was delivered at [azmara.app](https://azmara.app) under
DEC-086. Refresh manually; do not clear saved browser data. It adds the chosen
rear valley cliffs and short levelled gate wall to the sidebar and accepted
Oasis0/1/25/50 desktop/Staggered pilots. Only wall-01's base anchor relocates;
the other22 base anchors,23 IDs, saves/queues and five layouts are retained.
Held24/26 and broader scenery are not implemented. Native stays unchanged.
See [delivery details and rollback](docs/implemented/WEB_PUBLICATION_21.md) and
[wall implementation / offline images](docs/implemented/REAR_VALLEY_WALL.md).
Statements below that a pilot was local/unpublished describe its earlier
review stage; the accepted pilots were delivered in20 and retained in21.

The delivered **sidebar** pass (DEC-081) places information and menus
in a304px full-height parchment panel, with the game physically to its right.
Compact/phone use a56px strip and drawer. The same split applies to Town,
Region and World. Portrait/right duplicate controls are removed, not their
underlying menu functions. Actual before/after Fit/MAX images and rollback:
[sidebar review](docs/implemented/SIDEBAR_VALLEY_REVIEW.md).
Final small focus/Options/coordinate-visibility fixes need manual verification;
older captures are not a final-source acceptance claim. Owner tests manually:
**never auto-open Chrome or start automated/headless browser checks without
fresh permission** (DEC-084). Delivered in20 and retained in21; native is unchanged.

The [valley-wall proposal](docs/ideas/VALLEY_WALL_PROPOSAL.md) retains eight
desktop/phone start/50 concepts. DEC-086 authorizes preferred rear/northern A
and only wall-01's anchor relocation. The registered rear gate/cliffs and new
material atlas are now implemented and delivered in21. Root inspected labeled
offline placement renders; actual browser/touch/CTM and phone verification
remain manual. An unbuilt wall leaves the pass open; Dev Ideal town50 can show
the complete temporary draft without changing saved progress.

Local source includes the accepted **Oasis Town endpoints** (DEC-072): desktop/
Staggered Hall0/1 and50, plus the exact25 extension below. Shared mature public
floors, quieter founding clearings and original ground material are being tested
with the existing buildings and wall. States outside those endpoints/exact25
and phone retain the previous renderer. This has NOT been published; Step 5 wall repairs and native updates
remain paused. See [pilot review](docs/ideas/OASIS_TOWN_PILOT.md) and the
[visual-direction study](docs/ideas/VISUAL_DIRECTION_STUDY.md).

The approved small shade/entrance extension (DEC-075) is now local and
screenshot-checked: one founding refuge, two mature shade courts, and four
source-stage entrance calibrations including both Caravan stations. It keeps
the same endpoint/layout gate; the shown treatment is now visually accepted
under DEC-076. Approval of a defined next extension is still needed. See the
[before/after review](docs/implemented/OASIS_POCKETS_ENTRANCES.md). Nothing has
been published or copied to the native app; wall work remains paused.

The approved Level25 extension (DEC-078) is now implemented locally and
screenshot-checked, with the shown direction accepted under DEC-079: maintained
earth, limited civic paving, two smaller shade groups and one closed fountain. It is exact25 desktop/
Staggered only; all other fallbacks and accepted endpoints remain unchanged.
See the [actual before/after review](docs/implemented/OASIS_LEVEL_25_PILOT.md).
Save/queue checks pass; old fallback raster pixel comparisons remain inconclusive.
The [original draft](docs/ideas/OASIS_LEVEL_25_PROPOSAL.md) remains historical.
Nothing has been published; wall fixes and native updates are still paused.

The [next24/26-only reuse proposal](docs/ideas/OASIS_LEVEL_24_26_PROPOSAL.md)
would remove the immediate return to older scenery beside25. It is approved
but HELD (DEC-080), not implemented. Remeasure the new play area and any future
valley reserves, including separate Level24 Caravan20 entrance checks, before
resuming. No new artwork, all-band rollout or wall work is authorized.

Private version 19 is the historical **unfinished wall draft**, published at the
Founder's request under DEC-070. Its cohesive timber/adobe/sandstone U-shaped
wall has separate back/front depth layers. Phone spacing/framing, gate target
alignment and extra painted towers remain open; Step 5 is not complete.
See [implementation status](docs/implemented/STATUS.md) and
[draft art notes](prototype/assets/town-wall-v19-draft-brief.md).
Native remains unchanged; version18 below describes the previous published art.

Private version 18, under `DEC-065`, prioritises a larger playable
town with mountains only behind it and one original painted front wall,
replacing v17's repeated-looking enclosing ring. Buildings have larger visual
footprints; the 23 plot identities and five layout choices remain. Two new
original raster assets and exact prompts are in
[the v18 asset brief](prototype/assets/mountain-front-wall-v18-brief.md).
Version 18 is published at the same private address. Fourteen focused interaction
checks plus four final terrain checks passed; this is a draft for Founder art
review, not a new 3D engine or a rerun of all historical suites.

[Open AZMARA at azmara.app](https://azmara.app/) on a phone or desktop browser.
The custom domain is connected under `DEC-041`; HTTPS and owner-private access
remain in place. Sign in with the Founder's ChatGPT account. This is the same
illustrative web game, not a public multiplayer release. Each browser origin
has its own local town: old preview and installed-app saves are not migrated.

[Open the private AZMARA prototype](https://azmara-private-preview.blackumbreallagroup.chatgpt.site)
on a phone or desktop browser and sign in with the Founder's account.
The Mac need not be running. For comparing layouts on the Mac, use the
[Phone/Desktop review switch](https://azmara-private-preview.blackumbreallagroup.chatgpt.site/preview.html).

The starting-layout update (`DEC-032`) provides 23 selectable plots,
with only Town Hall occupied at level 1 and 22 plots empty. The map opens at Fit,
supports +/− zoom, and fills the playfield with painted terrain. Under
`DEC-035`, Fit holds the complete town steady; Close/+ enable bounded swiping
around the actual settlement, without unused outer filler. Under `DEC-036`,
the narrow/short browser map fills the screen with only the town name at top left and a four-dot
menu at top right. Open the menu for resources, advisers, rename and camera
tools. The wall sits inland; General plot 09 leaves the harbour area and
reuses the former wall location, without changing plot counts or saved progress.
The current verified private version is recorded in the implementation status.
DEC-057/061 replace the coastal Town and Island presentation with original
land-only desert Town and Region artwork. Town plots, saves and camera controls
are preserved; the Region retains 16 ordinary locations and one locked premium
preview. DEC-058 fills Region/World scenery to the viewport and positions the
twelve fictional draft Regions on a finite scrollable coordinate World.
Route Archive is the current display name for the navigation building.
These maps remain visual previews, not implemented multiplayer or transport.
Advisor now offers five persistent layouts in both modes: Staggered, Grid,
Circle, Avenues and Garden quarters (`DEC-060`). They rearrange only the eighteen
ordinary sites general-02–19, retaining Hall, wall and three transport base
anchors. Responsive clearance remains presentation, not extra sites. Selecting
a layout adds optional v3 `plotLayout`; old saves read without rewriting raw
bytes, and levels, resources and exact construction receipts/deadlines survive.
DEC-059 places desktop tools/zoom along the bottom and the town HUD/advisers at
the top. Earlier presentation iterations are summarised below.
The `DEC-037` colour pass enriches greenery, water and material separation
without changing the plot layout or saved progress.
The preceding `DEC-063` redesign replaces v15's oversized flat ribbon roads with
narrow textured streets, original shaded palm/garden/fountain sprites and
smoother town ground. World has separate mountain-and-dune relief artwork.
These are pre-rendered isometric/2.5D visuals, not a new 3D engine. The five
layouts, progression, construction receipts and browser saves are preserved;
visual acceptance remains the Founder's review.
The `DEC-043` desktop presentation (≥1024px wide and ≥600px tall) adds a wide
original forested coast, parchment resources/navigation, four original advisor
portraits and a bottom camera compass. DEC-046 removes the left rail, adds a
smaller Coins-first town HUD with truthful capacity/ship placeholders, replaces
flags with plus-marked ground and labels the Town adviser Advisor. Fit shows all
23 sites; Close/zoom explores a finite settlement area. DEC-047 replaces the
Island/World notes with original navigable visual maps, returning to the same
saved town; other locations are illustrative. No native assets are changed.
DEC-050 removes plot plus overlays, broadens desktop spacing around a central
Hall and reduces the town-name panel. DEC-051 blends transparent island terrain
into continuous sea, adds 16 ordinary island locations plus one locked premium
preview, and removes rectangular plot-focus boxes. The town keeps its 23 building
plots; premium purchases and colonisation are not implemented.
DEC-054 corrects the whole-panel narrowing: the desktop HUD is now wider and
more horizontal with a smaller name section and roomier actions/resources;
the adviser strip is modestly wider.
In Dev, Reset plots asks before clearing all 23 sites (including the Hall).
It preserves the name and restores illustrative test stocks. Build Town Hall
on its original plot to start again. Update projects now last two illustrative
minutes: cancellation is free for the first minute, then refunds only 30% of
spent resources, rounded down. Existing valid ten-second queues are preserved.
The current DEC-056/061 expansion makes all 30 active types test-buildable in Dev
through level 50, with Skip to complete a project instantly and direct test-level
selection. Designs start weak/timber, then use eleven original art stages
through 50. DEC-062 maps those stages to stable, uneven per-type milestones,
superseding the previous universal five-level cadence. Appearance offers a temporary review without changing saved
progress. Ideal-town review temporarily shows compatible buildings on all 23
plots at any chosen level 1–50; the read-only catalogue also offers every level
for all 30 active types. Closing review or switching to Gameplay restores the
actual town without changing save bytes or queued receipts. Intermediate levels
share their type's preceding artwork milestone, never a fresh random upgrade
result. Hall sets main-road quality; each building's local approach follows
`min(Hall level, building level)`. Full sprite footprints stay protected. This
is first-draft cosmetic progression, not production balance or Founder acceptance.
Test supplies can be replenished; these are development controls,
not a production economy. Gameplay hides and rejects test mutations.
DEC-064's complete enclosing wall is retained as v17 history. DEC-065 supersedes
that visible ring with a mountain-backed town and a painted front fortification.
The wall's own completed level still controls strength; its eleven stable
logical milestones select three field-art material groups: timber, adobe/brick
and sandstone. Hall upgrades do not strengthen it. The dedicated wall control,
temporary Ideal review and unfinished-build safeguards remain. Tree clearing,
defence and functional infrastructure are still unimplemented.
Under `DEC-046`, desktop +/− uses 10% steps eased over 180ms; Close is
1.5× the Fit scale. Click and drag the closer map to explore, or use scrolling
and arrow keys. Fit restores the full town. Reduced motion skips animation.
Under `DEC-045`, desktop uses a broader original clearing with ordinary plots
set inland, an isolated wall site, two separate harbour coves and a freighter
headland. All 23 IDs and saved progress remain unchanged; compact browser
anchors and the paused native app are untouched. Coordinated painted
terrain/sprites, worn-earth paths and a prominent Town Hall remain. Tap Close for a detailed
Hall-centred view, then Fit for the full town. Hover/focus shows plot names;
the label control can pin them on. Verification details and remaining limits
are recorded in the status document. Progress is stored in each browser at that address;
Site sign-in does not synchronise it. The hosted draft has separate progress
from the localhost preview. No native app installation is involved.
Downloadable-prototype preparation is authorised under `DEC-038`; the
[mobile delivery assessment](docs/architecture/OPEN_QUESTIONS.md#downloadable-prototype-assessment--9-october-2026)
records ZYRA ADMIN's delivery lessons and the proposed independent AZMARA route.
The subsequent `DEC-039` authorises local iPhone delivery using the installed
Flutter/Xcode tools. This does not authorise a store upload or public release.

An independent **AZMARA** app (`0.1.0+3`) is now built and signed for the
Founder's paired iPhone. Build 3 packages the locked land runtime and current
save schema; the phone was unavailable, so it has not yet replaced the earlier
installed build. Installation must be in place and preserve the native save;
full touch, orientation, changed-save and offline acceptance remain separate.
See the [native delivery runbook](mobile/README.md) and
[current verification status](docs/implemented/STATUS.md). Native progress is
separate from the browser preview, and uninstalling may erase it.

## Originality

Study high-level design principles, not a product to reproduce. Do not copy
Ikariam's code, assets, text, lore, names, branding, maps,
balancing or resource/building/unit datasets. `DEC-013` permits the supplied
reference screen's arrangement for the first draft with original AZMARA UI.
Research notes must identify their sources and distinguish observations from
our own proposals. Inspiration
does not establish permission to reuse material or clearance for a name.

## Where to start

| Purpose | Canonical document |
|---|---|
| Current concept and thematic direction | [Game concept](docs/CONCEPT.md) |
| Working rules and status changes | [Workflow](docs/WORKFLOW.md) |
| Exploratory possibilities | [Ideas](docs/ideas/BACKLOG.md) |
| Live reference tour and design questions | [Ikariam Okeanos research](docs/ideas/IKARIAM_RESEARCH.md) |
| Explicit Founder decisions | [Approved decisions](docs/approved/DECISIONS.md) |
| What exists and what was verified | [Implementation status](docs/implemented/STATUS.md) |
| Unresolved design/technical questions | [Open questions](docs/architecture/OPEN_QUESTIONS.md) |
| Foundation inspection and handover | [Foundation report](docs/FOUNDATION_REPORT.md) |
| Instructions for future agent sessions | [AGENTS.md](AGENTS.md) |

## Project boundaries

The project home is this directory under `Developer/DEVELOPMENT`.
The empty checkout with the same working name under `Documents/ChatGPT` was
not modified and is not a second source of truth for this foundation.

This project is independent of ZYRA and AIOS. Reusable development lessons may
inform our process, but their code, accounts, credentials, databases, schedules,
approvals, registers, product logic and release processes are not inherited.

Documentation lives in `docs/`. The standalone `prototype/` is a lightweight
browser design, not a commitment to the eventual game engine. See its README
for local launch and interaction instructions. It does not require a domain.
`sites/azmara-private-preview/` is the dedicated sanitised delivery checkout,
not a second editable game source or the production game's architecture.

## Next design review

The Founder now wants to develop the game together through a responsive
phone/browser prototype (`DEC-028`). Visual iteration resumes without treating
unfinished gameplay rules or demonstration quantities as a production economy.
The confirmed primary resource set is timber, clay, silver, grain and iron
(`DEC-019`). Resources are intended to come from shared Region sites
(`DEC-020`, geography renamed by `DEC-057`), with shared
access but separate town output and stores (`DEC-021`). Town worker sliders
are limited by available population and site capacity; unassigned citizens
provide hourly income (`DEC-022`). Timber contributions expand shared sites
and increase their worker capacity (`DEC-023`). Capacity sharing, expansion
costs and timing, production and income rates, transport details and grain's
production source remain open.
The main civic building sets population capacity; satisfaction determines
growth within that space (`DEC-025`). Inadequate satisfaction slows growth;
sufficiently low satisfaction causes departures (`DEC-026`). Provision demand
follows actual residents, not empty housing capacity (`DEC-027`). Exact capacity,
demand quantities, thresholds and rates remain open.
Silver replaces the earlier paper direction; detailed economic rules are open.
The working town structure is 19 general plots plus one wall plot, two Caravan
Station plots and one Freight Depot plot (`DEC-031`/`DEC-061`); dedicated plots
restrict building choices, retaining legacy harbour/freighter IDs for saves.
`DEC-032` authorises the complete visual layout, 22 initially empty
plots and continuous terrain throughout zoom; the construction catalogue and
production systems remain open. DEC-048 adds a read-only Building catalogue
via Options or the four-dot menu, including a Prayer Area and a secular
Chronos’ Forge. Exact satisfaction, construction, research and military rules
remain undecided. See implementation status for verified delivery.
Choose the coloured Dev/Gameplay buttons before Preview, Help and Options.
Dev exposes these review tools; Gameplay hides developer tests for a cleaner
player-facing view. Compact browsers offer the same choices in the menu.
This private workbench opens in Dev on reload, with the same saved town in both
modes; the switch does not reset progress or implement new gameplay (`DEC-049`).
See the [current rules discussion](docs/CONCEPT.md#gameplay-rules-in-discussion).

The Founder likes the first visual draft and wants the underlying strategy
experience understood deeply (`DEC-014`). Develop the original starting town while
reviewing touch/browser interactions and developing the connected population,
production and progression rules. See the
[core-loop research and proposed next slice](docs/ideas/IKARIAM_RESEARCH.md).
Prototype content remains illustrative; production architecture is still open.
