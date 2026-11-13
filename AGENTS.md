# AZMARA mobile strategy game project

<!-- CORE-RULES v2 (short) — full rules: BLACK UMBRELLA GROUP/SYSTEM/DOCUMENTS/MASTER_GOVERNANCE/AGENT_CORE_RULES_CURRENT_VERSION_V4.md -->
**Core rules:** Only Shakeel approves. Only Codex runs git, within core rule 2 (AD-AIOS-114); Claude chats never do. Never touch `PRIVATE — API KEYS — DO NOT SYNC`. Never delete. Move unwanted files only to `~/_to_delete/<WHAT>_<date>/` on the Mac (core rule 4). Fable = Lead Architect and admin; the AZMARA chat (Claude) is lead designer; Codex builds only from LOCKed files (core rule 11, AD-AIOS-115). AGENTS.md = standing rules only (under 16 KB). Every finished task ends in a commit by Codex (core rule 10). **BUILD FREEZE (24 Oct 2026) still on for AZMARA: no feature building until Shakeel lifts it in writing; review, docs and one-by-one approved fixes only (OA-AIOS-406). Lifted for ZYRA only, 29 Oct.** These win on any conflict.
<!-- /CORE-RULES -->

## Backend readiness (AD-AIOS-142)

Read `BLACK UMBRELLA GROUP/SYSTEM/DOCUMENTS/MASTER_STANDARDS/BACKEND_READINESS_STANDARD_CURRENT_VERSION_V1.md` (DOC-BUG-0057) when your trigger in its §2 may be met. No server while frozen. Its trigger: the Founder lifts the freeze in writing and multiplayer or game accounts are LOCKed. One server per business, never shared. AIs write plans only; every account, cost, key and live connection waits for the Founder's own yes.

## Public repository (AD-AIOS-121, Founder 2 Nov 2026)

This repository is public on GitHub under Apache 2.0. Every push is visible to anyone. Before and after each push:

| Step | When | What |
|---|---|---|
| A. Secret scan | Before every push | Run `gitleaks detect --source . --log-opts="origin/main..HEAD"` (read-only scanner, AD-AIOS-120). Any finding that is not the Supabase public anon key: do not push; file it in QUESTIONS.md and mark the line QUESTION. Never print the secret in a report. |
| B. Private material | Before every push | No business, pricing, legal, finance or personal documents in this repo - they live in BLACK UMBRELLA GROUP/BUSINESS/AZMARA/. If a task creates one here, move it there and leave nothing behind. Never anything from the keys folder. |
| C. Roadmap | After a task that finishes a ROADMAP.md row | Tick the row (add "Done <date>" in its Intended result cell), close the matching GitHub roadmap issue with `gh issue close <n> --comment "Done in <commit>"`, and push. Never add new rows or change hours - that is Fable's job on the Founder's word. |
| D. Release | When the app version in pubspec.yaml (or the repo's version file) changes | Create a GitHub pre-release with `gh release create v<version>-build<n> --target main --prerelease --notes "<one line per finished queue line>"`. No local git tag commands. |
| E. Wording | Every document you write or edit | Neutral community wording only - never "Muslim" or "Islamic" (DOC-BUG-0038 table). App text members see is design: list it for the business chat, do not change it. |
| F. README | When a task changes what the app does or how to run it | Update the README in the same push. |

Record A-F in the task note's Commit line ("public checks: A ok, B ok, C row n / none, D none, E ok, F none").


Next read `MAP.md`: every live AZMARA document by ID, and the **task routes** saying which
2–5 documents to open for your kind of task. Open only those. Read it only down to "Route paths" (the file paths); search the rest by ID. `docs/approved/DECISIONS.md`
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

| Step | Who | Where |
|---|---|---|
| Queue start and dispatch | Codex | GO and 01:00 receivers only dispatch each eligible WAITING line to one new normal owner chat; never reuse a conversation or build in the receiver. If native fresh-chat creation fails, file QUESTION and continue independent work. Each owner runs `python3 "../BLACK UMBRELLA GROUP/SYSTEM/TOOLS/start_pack.py" "AZMARA" "<DEVELOPMENT-relative brief path>"`, then reads only brief-named files. Task note: start_pack total bytes and named reads; `Conversation: new (started HH:MM)`; actual line tokens from read-only usage records. Verify its note and commit before archiving under standing authority (OA-AIOS-426). |

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

- Same system as ZYRA (charters V6 rule 11, Founder 31 Oct 2026): after each LOCK the AZMARA chat writes a build brief
  in `docs/approved/<FEATURE>/BUILD_BRIEF_<YYYY-MM-DD>.md` and one WAITING line in `docs/approved/BUILD_QUEUE.md`;
  Codex builds the queue at 01:00 or at once on any message from Shakeel in the AZMARA Codex chat (rule 9) and never
  asks Shakeel - a question goes in `docs/approved/QUESTIONS.md` and the line waits as QUESTION (rule 10). The AZMARA
  chat keeps one interactive prototype page (Artifact) of the game's screens, updated with every LOCK; chosen option
  only; a change in one place applied everywhere. Fable sets up the morning check task when the freeze is lifted.

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
- Theme (DEC-011): a fictional world inspired by the golden age of Abbasid Baghdad.
  Respect the community's religious sources and sacred material, research historical claims, and keep the
  exclusion of deities, polytheism, divine powers and miracles.
- Originality: never copy proprietary code, art, text, datasets, balancing, maps or names.
  Keep research sources and proposals distinct; never claim legal or name clearance without evidence.
- Ideas are not approvals. Approval does not prove implementation; tests do not prove
  Shakeel's acceptance. Record the actual files, checks and remaining limitations.
- Keep one canonical live document per subject. Preserve decision history through explicit
  supersession in `DECISIONS.md`, not silent rewrites.
- Use Chrome for user-facing browser work; never the ChatGPT/Codex in-app browser (9 Oct 2026).
- Version control: the repo's GitHub remote (`BLACK-UMBRELLA-GROUP/azmara`, moved from
  `ZYRA-APP-LAB` on 25 Oct) was set up by Shakeel on 24 Oct 2026. Only Codex runs git, within core rule 2 (AD-AIOS-114). The private-preview checkout in `sites/azmara-private-preview/`
  is separate and gitignored — never nest it, push it or attach it to this repo.
- Generated folders (for example `mobile/assets/game/`, made by `mobile/tool/sync_game.dart`)
  and throwaway captures (`prototype/debug/`) stay out of git. Edit the canonical prototype assets,
  never the generated copy.
- Never access `PRIVATE — API KEYS — DO NOT SYNC`. Keep secrets and personal data out of
  source control, reports and conversations.

## Public check before you finish (AD-AIOS-146)
This is a public repo. Before ending any session (business chat or Codex line owner), run
`BLACK UMBRELLA GROUP/SYSTEM/TOOLS/fable_public_check.py` on every file you wrote or changed here, and move or reword any
hit first (private material goes to `BLACK UMBRELLA GROUP/BUSINESS/<BUSINESS>/`). Founder, 12 Nov 2026: "Yes, make it
required (Recommended)".

## Blockers found mid-run: hand them to Claude at once (AD-AIOS-147)
Founder, 12 Nov 2026: "all codex chats ... if they find issues that block anything mid process ... show me what to paste
to claude so they can continue working ... rather than showing at end of the run. i want every codex chat to learn this."
1. The moment you find something that blocks, or will block, any line (a gap or clash in a brief or LOCK, a missing server
   contract, an unclear design detail), **stop only that part** and at once show Shakeel, in the chat, a ready-to-paste
   message headed **"Paste this to <name> Claude chat"**: **AZMARA Claude chat** for design, LOCK, spec, app-brief and
   wording questions; **Fable - BLACK UMBRELLA GROUP Claude chat** for server-design questions (scoring, storage, data
   protection, server briefs) - Founder 12 Nov "Fable answers server (Recommended)". Plain words, exact questions, the file and line it is about.
2. Also file the `QUESTIONS.md` row as usual, then **keep working** on every line and step that is not blocked. Never wait
   for the end of the run to report a blocker.
3. When the Claude chat's answer lands (row ANSWERED, brief updated), pick the blocked part back up in the same run.
4. Unattended runs (01:00, nobody watching): put every paste message in the first lines of the report, under
   "Paste to Claude", before anything else.
