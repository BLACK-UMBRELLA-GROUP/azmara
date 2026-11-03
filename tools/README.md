---
id: DOC-AZM-0043
type: GUIDE
status: CURRENT
feature: DESIGN TOOLS
purpose: The AZMARA chat's picture-editing scripts and the working images they need to rebuild the land stages
links: [DEC-099, DEC-100]
owner: AZMARA chat
---

# AZMARA design tools

These are the AZMARA design chat's picture tools, saved here on 29 Oct 2026 at the Founder's request
("Yes to saving your tools"). They made the Level 1 master and the 11 land stages.
**These tools are not build authority.** Anything they produce is a draft until the Founder says LOCK
and the file is recorded in `docs/approved/`. Codex never builds from this folder.

## What is here

| Folder | What it holds |
|---|---|
| `scripts/` | Python scripts (15). Each one reads pictures and writes new ones; none of them touch `docs/approved/` |
| `images/` | Only the working images the scripts need: masks, sprite cut-outs and in-between bases |

| Script | What it does | Needs the LaMa model |
|---|---|---|
| `land_ladder.py` | Rebuilds all 11 land stages. Output matches the locked pictures pixel for pixel (checked 29 Oct) | No |
| `caption_stages.py` | Adds the "what got better" panel under each stage, for review in chat only | No |
| `lama.py` | Shared helper: fills masked areas with LaMa and changes only those pixels | Yes |
| `inpaint_palms.py`, `palms_v2.py`, `fix_ghost.py` | Removed palms from the oasis (V1 → 5-palm draft) | Yes |
| `road_palms.py` | Removed the six road palms | Yes |
| `make_bases.py`, `build_options.py`, `worse_lib.py` | Made the five "worse Level 1" options; option 4 became master V2 | `make_bases.py` only |
| `deswamp.py` | Cleared lily pads and reeds from the pool (stage 6 onward) | Yes |
| `homes.py`, `sprites.py`, `growth_lib.py` | Shared helpers: background homes, palm and shrub cut-outs, paving, greening, water | No |
| `review_views.py` | Before/after/mask side-by-side crops for checking an edit | No |

## How to run

Python 3 with `opencv-python`, `numpy`, `pillow` and `scipy`; `torch` only for the LaMa scripts.
Rebuild the land stages (reads the locked masters V1 and V2 from `docs/approved/art/ARCHIVE/`):

`cd "/Users/shakeelahmad/Developer/DEVELOPMENT/AZMARA" && python3 -I tools/scripts/land_ladder.py tools/images`

The stages are written to `tools/images/land/stages/`. That folder is generated and gitignored.

## Not stored here

| Item | Why |
|---|---|
| LaMa model `big-lama.pt` (205 MB, sha256 `344c77bbcb158f17dd143070d1e789f38a66c04202311ae3a258ef66667a9ea9`) | Too big for git (50 MB rule). It is the public LaMa "big-lama" TorchScript file; download it again when needed, check the sha256, keep it outside the repo and pass its path to the scripts |
| Locked masters and stage pictures | Already in `docs/approved/`; the scripts read them there instead of keeping copies |
| Review crops, test renders, captioned review copies and older explorations (canyon, UI, roads) | One-off checks shown in chat, or superseded by later locks |
| Land redesign drafts (Weave inputs and results) | Unlocked AI-made drafts stay out of the public repo. They are kept with the business files (`BLACK UMBRELLA GROUP/BUSINESS/AZMARA/DESIGN DRAFTS/`) until a LOCK puts the chosen picture in `docs/approved/` |
| `shrink_land.py` | Abandoned 19 Oct: the shrink-and-collage attempt looked cut-and-pasted. The land redesign moved to Weave instead |

## Change log

| Date | Change |
|---|---|
| 2026-11-02 | Weave drafts moved out of the repo (public repository rule) |
| 2026-10-29 | Created. Scripts saved from the AZMARA chat's workspace; `land_ladder.py` now reads the masters from `docs/approved/art/ARCHIVE/` |
