# AZMARA land stages — CURRENT VERSION V1

- Locked by Shakeel on 17 October 2026 ("OK lets lock it all in"). Recorded as DEC-099 and DEC-100.
- Designed by Claude. Codex builds it exactly as written here.
- Only this file is CURRENT_VERSION for the land. Older pictures are archive, for reference only.

## 1. Purpose

The town's land (everything around the buildings: canyon, sand, oasis, fields, palms, background homes) gets better as the Town Hall grows. There is one picture for each Town Hall look, so the land changes at the same moment as the Town Hall's look.

## 2. Scope

| In this document | Not in this document (comes later) |
|---|---|
| The 11 land pictures and when each one shows | The looks of each building, including the Town Hall's own looks |
| How the land fills the screen | The spot map: where each of the 23 game plots sits on the land |
| What is painted into the pictures | The Town Wall's looks on this land |
| The Dev option to check every stage | Higher-resolution copies of the same pictures |

## 3. Decisions

1. There are 11 land stages. Land stage *k* shows while the Town Hall is on look *k* (its completed level, not one under construction).
2. The pictures are copied exactly. No repainting, restyling, recolouring, filters, extra scenery, cropping (other than the full-screen fit in section 6) or "improvements".
3. A new town starts on land stage 1 (DEC-098: Town Hall only, Town Wall not built).
4. The background homes are scenery only and cannot be tapped. They start as wooden shacks and get better with the land.
5. From Town Hall look 6 (Level 22 today) the swamp clears step by step, and the oasis keeps getting better.
6. There is no stone edge around the pool and there are no shrubs along the avenue. Both were tried and removed by Shakeel.

## 4. The 11 stages

Town Hall levels below are the Town Hall's look levels in `prototype/building-art.js` today. If those levels ever change, the land follows the Town Hall's look number, not the level.

| Stage | Town Hall look | Town Hall level today | File | What got better (compared with the stage before) |
|---|---|---|---|---|
| 1 | 1 | 1 | `docs/approved/art/TOWN_MASTER_CURRENT_VERSION_V3.png` | Starting point: dying oasis (pond half mud, waterfall dry), dead crops, dried-out plants, homes are rough wooden shacks |
| 2 | 2 | 5 | `docs/approved/art/land/LAND_STAGE_02.png` | Waterfall flows again and the pond is refilling; 4 palms grow back on the left and right edges; crops and plants start to recover; first home rebuilt in mud-brick |
| 3 | 3 | 8 | `docs/approved/art/land/LAND_STAGE_03.png` | Pond full again, the mud has gone; plants turning green, wheat golden again; 2 more homes rebuilt in mud-brick |
| 4 | 4 | 12 | `docs/approved/art/land/LAND_STAGE_04.png` | Oasis green again, water clearer; fields healthy; last 2 homes rebuilt, every home is mud-brick |
| 5 | 5 | 17 | `docs/approved/art/land/LAND_STAGE_05.png` | 6 palms planted along the road to the Town Hall; 2 palms grow back by the oasis (7 in total); oasis greener, water clearer |
| 6 | 6 | 22 | `docs/approved/art/land/LAND_STAGE_06.png` | Swamp starts to clear: lily pads and reed clumps gone from the water; 2 more palms by the oasis (9 in total); water cleaner |
| 7 | 7 | 28 | `docs/approved/art/land/LAND_STAGE_07.png` | Dry yellow reeds turn fresh green; palm grove planted inside the gate (4 palms); first 2 homes whitewashed |
| 8 | 8 | 34 | `docs/approved/art/land/LAND_STAGE_08.png` | Avenue paved from the gate to the Town Hall; pool water clearer; 3rd home whitewashed |
| 9 | 9 | 41 | `docs/approved/art/land/LAND_STAGE_09.png` | Pool water clear turquoise; all 5 homes whitewashed; town plants greener |
| 10 | 10 | 45 | `docs/approved/art/land/LAND_STAGE_10.png` | Flowering bushes all round the pool; a garden beside every home; oasis and fields at their richest |
| 11 | 11 | 50 | `docs/approved/art/land/LAND_STAGE_11.png` | Flowering bushes at the avenue and the plaza; warm golden light over the whole town; the finest the land gets |

All 11 files are 1536 × 1024 PNG and line up pixel for pixel: the canyon, fence, gate, plaza, Town Hall, homes, spots, fields and oasis are in the same place in every stage.

## 5. What is painted into the pictures

| Painted item | How the game treats it |
|---|---|
| Town Hall (Level 1 hut, with banner, tent, people and camel) | Do not draw any Town Hall art on top. Put the Town Hall's click area and label over the painted Town Hall: box x 668–858, y 375–512 in picture pixels. The Town Hall's own looks are designed later as separate art |
| Rope fence and gate flag at the top | Scenery. The Town Wall's spot (click area and label) goes at the gate: box x 740–820, y 95–140 in picture pixels |
| Five background homes and their stalls | Scenery only. Not tappable |
| Empty building spots (sand with corner stones) and the two blue spot flags | The spot look. Do not draw your own spot markers or flags on top of the land. The spot map (next design step) will set where each game spot goes |
| Canyon, sand, palms, oasis, fields, farmers | Scenery |

Nothing else is drawn on top of the land: no old oasis foundation, terrain overlay, scenery decor, roads, water channels, fountains or canyon wall art.

## 6. Full screen

1. The land picture always fills the whole game area, edge to edge, on every screen size and at every zoom. No plain sand margins, no hard edges, no letterboxing.
2. Fit it like "cover": scale it until it fills the screen, keep it centred on the Town Hall, and crop what overflows. Never stretch it.
3. Zooming out stops at the cover size. Panning stops at the picture's edges, so its edges never come into view.
4. The town bar, side dock (phone: bottom dock) and Dev button float on top of the land, as in handover section 6.7. The land does not shrink to make room for them.
5. Keep positions as fractions of the picture (x ÷ 1536, y ÷ 1024), so higher-resolution copies can be swapped in later without moving anything.

## 7. Dev option

Inside the existing Dev button (dev mode only, hidden in Gameplay mode):

| Item | Rule |
|---|---|
| Land stage picker | Buttons for the 11 Town Hall looks: 1, 5, 8, 12, 17, 22, 28, 34, 41, 45, 50 |
| What it changes | It sets the test town's Town Hall to that level, through the existing Dev test-level tools. The land changes because the Town Hall level changed, the same rule players get. It is not a separate picture switch |
| Default | The town's real Town Hall level |
| Reset | Returns the Town Hall and the land to the real level, fully |
| Saves | Never saved into real progress, like the other temporary Dev reviews |

## 8. Requirements

| ID | Requirement |
|---|---|
| L1 | Show land stage *k* for Town Hall look *k*, from the files in section 4, copied exactly |
| L2 | Switch the land when a Town Hall upgrade completes, not when it starts |
| L3 | Fill the whole game area as in section 6, on computers and phones |
| L4 | Town Hall and Town Wall click areas and labels at the boxes in section 5. No Town Hall art drawn on top of the painted one |
| L5 | No extra drawing on top of the land (section 5) |
| L6 | Dev land stage picker as in section 7 |
| L7 | Keep all spot IDs, saves, queues and data unchanged. Do not move, add or remove spots until the spot map arrives |
| L8 | Keep the old foundation and art for rollback. Delete nothing |

## 9. Workflow

1. Codex checks this file and the pictures, and reports any problem before building.
2. Codex builds locally and checks each stage beside its locked picture. Ask Shakeel before running the screenshot tool (DEC-084).
3. Codex reports with screenshots: all 11 stages, on a computer screen and a phone screen.
4. Shakeel and Claude review.
5. Publishing to azmara.app only with Shakeel's explicit OK.

## 10. Risks and known gaps

| Risk or gap | What happens now | Fix |
|---|---|---|
| Game spots don't line up with the painted spots | Spot data stays as it is this round; empty-spot markers are not drawn on top | Spot map from Claude (next step) |
| The pictures paint about 15 empty spots, but a new town has 22 empty plots among its 23 game plots | Not solved this round | Spot map decides where the rest go |
| The five layout choices (DEC-060) don't fit one painted land | Leave the layout data untouched | Decided with the spot map |
| Town Hall looks 2–11 not designed yet | The painted Level 1 hut stays at every stage | Each building's looks (later step) |
| Town Wall on this land not designed yet | Click area and label at the gate only | Town Wall looks (later step) |
| 1536 × 1024 can look soft on large screens | Accept for now | Higher-resolution copies of the same pictures, swapped in place |

## 11. Dependencies

- DEC-098 (a new town starts with only the Town Hall).
- Town Hall look levels in `prototype/building-art.js`.
- Handover section 6.7 and `AZMARA_info_panel_layout.pdf` (town bar, side dock, phone dock, Dev button).
- Dev tool rules in handover section 4: a toggle must change real behaviour; defaults predictable; reset fully resets.
