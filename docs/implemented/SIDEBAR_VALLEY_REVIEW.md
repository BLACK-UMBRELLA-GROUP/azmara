# Left sidebar and valley concepts — local review

12 October 2026. DEC-080–084. **Sidebar built locally; final manual verification pending. Valley is proposal-only. Nothing published or copied to the native app.**

Subsequent delivery: Owner requests publication under DEC-085. The implemented
sidebar/Oasis runtime is now private web20; this original capture-time report
and its manual gaps are retained. Valley concepts are not implemented.
See [web20 release](WEB_PUBLICATION_20.md). Native remains unchanged.

## Sidebar outcome

The parchment desktop panel is 304px wide and full-height at window widths
≥1024px and heights ≥600px. Town, Region and World start physically to its
right; their viewport dimensions, Fit, zoom, panning and camera limits use that
remaining space. The old top-right portraits and right icon rail are removed.
That rail duplicated Forces, Knowledge, Diplomacy and re-centre; the first
three remain Council buttons and re-centre remains in the game camera controls.

Town/rename, map navigation, Pack caravans, Heavy convoys, Population, Action
points, Inventory, Shop, resources and all four Council buttons are in one
internally scrolling panel. Help/Options stay at its bottom. The Dev workbench
is inside that panel and hidden in Gameplay. Camera controls remain over the
game, with 44px controls. No new resource/economy simulation is implied.

Compact/phone reserve a 56px strip outside the game. Menu opens a 320px drawer,
with 44px action targets, backdrop, close/Escape, keyboard focus containment
and inert game/camera controls. Opening it does not refit or resize the game.
Short windows use this compact treatment too. Desktop detail/actions panels
stay inside the sidebar; compact details are temporary modal panels.

## Before / after — actual game, not mock-ups

These Level50/Staggered test fixtures are not the Owner's saved town.
The final full capture packet predates the last two input fixes and one CSS
visibility fix described below. Screens therefore document the implemented
composition, not final-source visual acceptance.

| Profile / camera | Before | After |
|---|---|---|
| Desktop 1440×900 / Fit | [Before](../../evidence/2026-10-12-sidebar-valley/before-2026-10-12T10-20-49-156Z/before-town50-desktop-fit.png) | [After](../../evidence/2026-10-12-sidebar-valley/after-2026-10-12T10-47-15-018Z/after-town50-desktop-fit.png) |
| Desktop / maximum | [Before](../../evidence/2026-10-12-sidebar-valley/before-2026-10-12T10-20-49-156Z/before-town50-desktop-max.png) | [After](../../evidence/2026-10-12-sidebar-valley/after-2026-10-12T10-47-15-018Z/after-town50-desktop-max.png) |
| Compact 900×700 / Fit | [Before](../../evidence/2026-10-12-sidebar-valley/before-2026-10-12T10-20-49-156Z/before-town50-compact-fit.png) | [After](../../evidence/2026-10-12-sidebar-valley/after-2026-10-12T10-47-15-018Z/after-town50-compact-fit.png) |
| Compact / maximum | [Before](../../evidence/2026-10-12-sidebar-valley/before-2026-10-12T10-20-49-156Z/before-town50-compact-max.png) | [After](../../evidence/2026-10-12-sidebar-valley/after-2026-10-12T10-47-15-018Z/after-town50-compact-max.png) |
| Phone 390×844 / Fit | [Before](../../evidence/2026-10-12-sidebar-valley/before-2026-10-12T10-20-49-156Z/before-town50-phone-fit.png) | [After](../../evidence/2026-10-12-sidebar-valley/after-2026-10-12T10-47-15-018Z/after-town50-phone-fit.png) |
| Phone / maximum | [Before](../../evidence/2026-10-12-sidebar-valley/before-2026-10-12T10-20-49-156Z/before-town50-phone-max.png) | [After](../../evidence/2026-10-12-sidebar-valley/after-2026-10-12T10-47-15-018Z/after-town50-phone-max.png) |

![Local desktop sidebar at Fit](../../evidence/2026-10-12-sidebar-valley/after-2026-10-12T10-47-15-018Z/after-town50-desktop-fit.png)

Additional actual views: [phone drawer](../../evidence/2026-10-12-sidebar-valley/after-2026-10-12T10-47-15-018Z/after-town50-phone-drawer.png),
[scrolled drawer / Dev workbench](../../evidence/2026-10-12-sidebar-valley/after-2026-10-12T10-47-15-018Z/after-town50-phone-drawer-scrolled.png),
[compact drawer](../../evidence/2026-10-12-sidebar-valley/after-2026-10-12T10-47-15-018Z/after-town50-compact-drawer-scrolled.png),
[Region](../../evidence/2026-10-12-sidebar-valley/after-2026-10-12T10-47-15-018Z/after-island-desktop-fit.png),
[World](../../evidence/2026-10-12-sidebar-valley/after-2026-10-12T10-47-15-018Z/after-world-desktop-fit.png)
and [phone World](../../evidence/2026-10-12-sidebar-valley/after-2026-10-12T10-47-15-018Z/after-world-phone-fit.png).
The older internal filename “island” means Region; no naval presentation was added.

## Checks and remaining gaps

24 core groups passed in the last complete core run, which failed its additional
responsive-focus case. A subsequent isolated responsive case passed after
repair. **This is not a single final 25/25 pass.** The real hidden-Town
zero-size Fit issue was fixed by retaining its last valid fit while Atlas is
visible. Failed receipts and corrected stale test expectations remain intact.

Final filesystem-only checks pass: 1,192 protected records, 45 unchanged
model/art/wall function slices, and nine JavaScript files parsing. Raw save/
legacy bytes and paid/valid historical 10s queues were checked in the earlier
isolated browser fixtures, not read from the Owner's browser.
All 23 plot IDs, five layouts and fixed-role base anchors remain unchanged.

Owner asked to keep Chrome closed. No further browser sessions were launched;
only owned tests were closed. Root inspected the saved before/after Town
Fit/MAX images, drawers, start and representative Atlas views independently.
Final source has three static-reviewed, **uncaptured** corrections:

- Options reports expanded state on the actual Options button.
- Modal return-focus avoids hidden/inert/disconnected controls across breakpoints.
- Hidden World coordinate text cannot override its hidden state on Town/Region.

These fixes and a final-source desktop/compact/phone Fit/MAX/navigation pass
remain manual checks. No native touch/safe-area/orientation, device RAM or
production acceptance is claimed. The old compact scenery seam, photo-like
backdrop and extreme-zoom source softness remain visible; this is a sidebar
pass, not a phone scenery or wall repair. Compact Region remains a pannable
Overview with readable sites, not a promise that every site fits on a phone.

Detailed hashes/receipts: [QA summary](../../evidence/2026-10-12-sidebar-valley/QA_SUMMARY.md),
[final static audit](../../evidence/2026-10-12-sidebar-valley/static-invariants-2026-10-12T11-17-31-680Z.json)
and [protected-record guard](../../evidence/2026-10-12-sidebar-valley/guard-2026-10-12T11-17-33-955Z.json).
Root's saved-image inspection, eight byte-exact concept copies and70 checked
local document links are recorded in [the review receipt](../../evidence/2026-10-12-sidebar-valley/root-review.json).

## Valley recommendation — not implemented

Owner prefers **A: one short gate wall across the rear/northern pass**, with
cliff shoulders extending toward the town and an open foreground. Four
desktop/phone start/50 concepts and the alternative front-closure composition
are in [the valley proposal](../ideas/VALLEY_WALL_PROPOSAL.md).

The current front wall control anchor conflicts with A's rear gate. That is
explicitly unresolved: no anchor was moved, target hidden or second wall added.
The old ring/U-wall art, route and depth registration remain untouched.
Concepts show the desired composition, not registered geometry or final art.

## Levels24/26

The approved reuse-only desktop/Staggered plan **still stands but stays held**.
The new actual viewport invalidates old screen/HUD clearance assumptions;
future approved valley cliff/wall reserves may also alter world exclusions.
Remeasure those envelopes before resuming. Level24 still needs independent
Caravan source-art20 doorway/entrance checks; they must not leak into accepted
25 source mappings or outputs. No new artwork or broader band/phone rollout
is authorized. See [held plan](../ideas/OASIS_LEVEL_24_26_PROPOSAL.md).

## Files affected / rollback

Existing runtime edits only:

- `prototype/index.html`: sidebar markup, removed duplicate/portrait controls.
- `prototype/styles.css`, `desktop.css`, `atlas.css`: split, drawer and shared map UI.
- `prototype/app.js`, `atlas.js`: viewport, camera, navigation and focus integration.

Live documentation: AGENTS, README, STATUS, DECISIONS, BACKLOG, held24/26
proposal, this review and new valley proposal. New evidence stays under
`evidence/2026-10-12-sidebar-valley/`; eight proposal PNGs and their exact
prompts stay under `docs/ideas/valley-wall-study/`. No existing artwork,
Oasis/wall module, layout catalogue, native/staged file or historical evidence
was changed; no engine/new library added.

Rollback uses only this task's six [before-source copies](../../evidence/2026-10-12-sidebar-valley/before-source/),
matched to the six prototype files above. Review later edits before restoring
them; do not replace the whole project or use an older pre-Level25 copy.
Keep evidence/concepts as history. Saves/queues and native/hosting need no rollback.

## Manual local review

Do not run an automatic browser-opening or screenshot command. If a local
server is needed, this command serves files only; open the address manually in
the browser you choose:

```sh
python3 -m http.server 4317 --bind 127.0.0.1 --directory "<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype"
```

Manual address: `http://127.0.0.1:4317/`. Close the server with Ctrl+C afterwards.
Do not reset the Owner's saved town just to reproduce synthetic pictures.
Check Town→Region→World→Town coordinate visibility; Options opens/closes;
phone drawer Escape/close and return focus after resizing; Fit/MAX/drag stay
right of the sidebar; Gameplay hides the Dev workbench. Then return feedback.

Stop here for Owner review. No wall implementation or24/26 resumption.
