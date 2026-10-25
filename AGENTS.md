# AZMARA mobile strategy game project

<!-- CORE-RULES v2 (short) — full rules: BLACK UMBRELLA GROUP/SYSTEM/DOCUMENTS/MASTER_GOVERNANCE/AGENT_CORE_RULES_CURRENT_VERSION_V2.md -->
**Core rules:** Only Shakeel approves. No AI runs git — ever. Never touch `PRIVATE — API KEYS — DO NOT SYNC`. Never delete — move to `_to_delete`. Fable = Lead Architect and admin; Codex = design and implementation only. AGENTS.md = standing rules only (under 16 KB). End every session with a commit line for Shakeel. **BUILD FREEZE (24 Oct 2026): no feature building until Shakeel lifts it; review, docs and one-by-one approved fixes only (OA-AIOS-406).** These win on any conflict.
<!-- /CORE-RULES -->

Next read `MAP.md`: every live AZMARA document by ID, and the **task routes** saying which
2–5 documents to open for your kind of task. Open only those. `docs/approved/DECISIONS.md`
and `docs/implemented/STATUS.md` are never read whole — start from
`docs/approved/DECISIONS_INDEX.md`, and search STATUS for what you need. After adding or
renaming a document run `python3 "../BLACK UMBRELLA GROUP/SYSTEM/TOOLS/generate_map.py" .`

**How this file works (24 Oct 2026):** this file holds standing rules only. Every decision,
with its full wording, is in `docs/approved/DECISIONS.md` (DEC-001 onward). What is built,
published, held or paused right now is in `docs/implemented/STATUS.md` and the
`docs/implemented/WEB_PUBLICATION_*.md` records. Never add round-by-round status here —
record it there and keep this file well under 16 KB (Codex stops reading at 32 KiB).
The previous long version, with its round notes, is `docs/archive/AGENTS_2026-10-24_V1.md`.

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
  preserving its version number, and move it into `docs/approved/art/ARCHIVE/`
  (old approved documents go to `docs/approved/ARCHIVE/`). Only Shakeel may replace a master.
- Build only from approved documents and approved art masters. If required art
  or design is missing, use a plain, clearly identified placeholder and ask for
  the missing approved source. Never generate, repaint or restyle art or layout.
- Before reporting visual work done, run `prototype/tools/capture-game.sh` and
  provide its screenshot beside the approved master it should match for Claude's
  check. This does not override DEC-084: obtain fresh explicit Owner permission
  before any automated/headless browser run, and never auto-open visible Chrome.

## Standing holds — check before every task

- Anything `DECISIONS.md` or `STATUS.md` marks HELD or PAUSED (for example native
  updates and neighbouring levels 24/26) stays held until Shakeel lifts it in a
  new recorded decision. A "continue" or "yes" applies only to the step it answered.
- Preserve the 23 town role IDs, plot IDs, saves, queues, layouts and fixed base
  anchors unless a locked decision says otherwise.
- The owner-private web preview (azmara.app) keeps its owner-only audience. Publish
  only on an explicit request, through its dedicated source workflow, and record the
  terminal deployment before saying it is published.
- Do not implement an unapproved economy, population, production gameplay, backend,
  multiplayer or store setup.

## Browser and screenshots

- DEC-084: NEVER auto-open Chrome for the Owner. Do not launch more automatic/
  headless browser tests without fresh explicit permission; Owner tests manually
  to limit RAM. Close only sessions this task owns. Existing capture command is
  available for an authorized run, not permission to invoke it automatically.
  File/static checks and viewing saved images are allowed. Mark latest uncaptured
  UI fixes pending manual verification; no invented final screenshot/all-pass claim.
- Follow the Founder's five-step gate: one step per reply, stop for their OK.
  Steps 1–3 do not authorise changing the wall; Step 4 proposes it without
  implementation; Step 5 requires approval of that proposal. Before a major
  engine/library/plugin/tool or file-structure change, explain what/why,
  affected files, risks and rollback. Do not silently change the architecture.
- **Every visual change must be screenshot-checked before it is reported done.**
  With Shakeel's fresh permission for a capture run (DEC-084), run the relevant capture,
  open the PNG yourself, inspect it and fix defects. Without it, report the change as
  pending manual check.
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

- Work on this game only. Do not modify ZYRA or copy its assets, credentials or data.
  Do not import another venture's roles, approval routing, registers or schedules.
- AZMARA is the provisional name (DEC-009); final branding and name clearance are unresolved.
  Ikariam is a research reference, not branding or a product to clone.
- Theme (DEC-011): a fictional world inspired by Abbasid-era Baghdad and the Islamic Golden
  Age. Respect Islamic sources and sacred material, research historical claims, and keep the
  exclusion of deities, polytheism, divine powers and miracles.
- Originality: never copy proprietary code, art, text, datasets, balancing, maps or names.
  Keep research sources and proposals distinct; never claim legal or name clearance without evidence.
- Ideas are not approvals. Approval does not prove implementation; tests do not prove
  Shakeel's acceptance. Record the actual files, checks and remaining limitations.
- Keep one canonical live document per subject. Preserve decision history through explicit
  supersession in `DECISIONS.md`, not silent rewrites.
- Use Chrome for user-facing browser work; never the ChatGPT/Codex in-app browser (9 Oct 2026).
- Version control: the repo's GitHub remote (`BLACK-UMBRELLA-GROUP/azmara`, moved from
  `ZYRA-APP-LAB` on 25 Oct) was set up by Shakeel on 24 Oct 2026. No AI runs git. The private-preview checkout in `sites/azmara-private-preview/`
  is separate and gitignored — never nest it, push it or attach it to this repo.
- Generated folders (for example `mobile/assets/game/`, made by `mobile/tool/sync_game.dart`)
  and throwaway captures (`prototype/debug/`) stay out of git. Edit the canonical prototype assets,
  never the generated copy.
- Never access `PRIVATE — API KEYS — DO NOT SYNC`. Keep secrets and personal data out of
  source control, reports and conversations.
