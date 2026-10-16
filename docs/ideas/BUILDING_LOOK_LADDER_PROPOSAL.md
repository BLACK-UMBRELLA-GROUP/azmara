> **12-look draft withdrawn by Claude; recommendation is to keep the existing 11-look system. Awaiting Shakeel's decision.**

# Building Look Ladder Proposal

**Status: PENDING — design proposal only**
**Date recorded:** 15 October 2026
**Authority:** Owner-approved principles and unapproved draft details supplied through design review.

This document records a proposed visual-progression model. It changes no code,
art, saves, live-site behaviour or approved decisions. In particular, the
current approved Town Wall bands remain in force until the Owner explicitly
replaces them.

## Approved direction

- Every building begins low and wooden at Level 1.
- Building looks improve at different levels, generally every 3–6 levels, so
  the whole town does not transform at once.
- The Owner's examples are Town Hall changing at Levels 3 then 8, and Prayer
  Garden changing at Levels 4 then 7.
- The visual ladder continues through Level 50. After Level 50, the intended
  cadence is one visual change every 10 levels.

## Pending choices — do not build yet

- Twelve looks per building: six material families with two visibly different
  looks in each family.
- Every building's twelfth and finest look landing exactly at Level 50.
- One fixed per-building schedule shared by all players. It should feel varied,
  but it would not be randomly rolled at runtime.
- Shared post-Level-50 decorations: Level 60 banners, 70 lanterns, 80 flag,
  90 planters and 100 crest.
- Moving Town Wall and Hospital onto this ladder. This would replace their
  approved timber/adobe/sandstone bands; those bands remain authoritative until
  the Owner decides otherwise.
- The exact levels in the draft schedule below.
- Final maximum levels. Each building would need to support at least Level 50
  for all twelve looks, and Level 100 for the complete proposed decoration set.

## Proposed twelve looks

| Looks | Material | First look → second look |
|---|---|---|
| L1–L2 | Wooden | Timber frame, canvas → solid timber, palm thatch |
| L3–L4 | Mud-brick | Plain brick → beams, awnings |
| L5–L6 | Whitewash | White walls → terracotta roofs, arches |
| L7–L8 | Sandstone | Carved stone → columns, towers |
| L9–L10 | Tiled | Tile bands, small dome → bigger dome |
| L11–L12 | Grand | Big dome or towers → gold trim, finest detail |

Concept 1's painted town represents a grown settlement, approximately L5–L12.
A new town would use the same painted ground with wooden buildings.

## Draft schedule

Each number is the completed building level at which that look begins. L1 begins
at Level 1 for every building. This table is the source of truth for this draft,
not the accompanying chart image.

| Building | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9 | L10 | L11 | L12 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Garrison | 4 | 7 | 11 | 16 | 22 | 26 | 31 | 37 | 43 | 47 | 50 |
| Cavalry Yard | 4 | 7 | 10 | 15 | 20 | 25 | 29 | 35 | 41 | 44 | 50 |
| Hospital | 3 | 6 | 10 | 14 | 20 | 25 | 30 | 33 | 39 | 44 | 50 |
| Armoury | 5 | 10 | 13 | 18 | 22 | 27 | 31 | 34 | 38 | 44 | 50 |
| Town Wall | 4 | 7 | 12 | 15 | 21 | 26 | 32 | 36 | 40 | 46 | 50 |
| Caravan Yard | 4 | 8 | 12 | 15 | 20 | 25 | 30 | 34 | 40 | 46 | 50 |
| Haulage Yard | 5 | 8 | 11 | 15 | 20 | 24 | 30 | 35 | 38 | 44 | 50 |
| Trading Post | 3 | 7 | 10 | 14 | 19 | 24 | 30 | 36 | 39 | 44 | 50 |
| Vault | 5 | 9 | 13 | 17 | 21 | 25 | 30 | 36 | 39 | 44 | 50 |
| Town Hall | 3 | 8 | 11 | 16 | 22 | 27 | 31 | 35 | 39 | 45 | 50 |
| Royal Palace | 4 | 8 | 12 | 16 | 21 | 26 | 30 | 36 | 42 | 46 | 50 |
| Royal Lodge | 3 | 6 | 10 | 15 | 19 | 23 | 28 | 34 | 40 | 44 | 50 |
| University | 4 | 7 | 11 | 14 | 18 | 24 | 30 | 36 | 39 | 44 | 50 |
| School | 3 | 7 | 10 | 15 | 19 | 24 | 29 | 35 | 41 | 46 | 50 |
| Library | 5 | 9 | 13 | 18 | 23 | 28 | 32 | 37 | 40 | 46 | 50 |
| Bazaar | 3 | 7 | 11 | 15 | 21 | 25 | 29 | 34 | 38 | 44 | 50 |
| Prayer Garden | 4 | 7 | 12 | 17 | 21 | 27 | 32 | 35 | 39 | 45 | 50 |
| Courtyard Homes | 3 | 7 | 12 | 15 | 20 | 26 | 31 | 37 | 41 | 44 | 50 |
| Toolmaker | 5 | 10 | 14 | 18 | 23 | 27 | 32 | 37 | 41 | 46 | 50 |
| Architect's Office | 4 | 8 | 13 | 18 | 24 | 29 | 33 | 38 | 41 | 46 | 50 |
| Warehouse | 3 | 7 | 11 | 16 | 21 | 27 | 32 | 38 | 41 | 45 | 50 |

## Proposed runtime rules — pending

- A building displays the highest look whose start level is no greater than its
  completed level.
- A new look appears when an upgrade finishes, not when it starts.
- If a scheduled look is not drawn, use the best drawn look below it. This
  permits an art wave of L1–L6 followed by L7–L12 before players reach it.
- Every look for one building uses the same ground/base anchor. Later looks may
  be taller or slightly wider, but remain inside the building's visual envelope
  so its name, level label and tap area do not move.
- A second look must add a readable structural detail—such as an awning, extra
  floor, columns or larger dome—not merely recolour the previous image.
- Courtyard Homes share one set of looks.
- Saves continue to store building identity and completed level. The displayed
  look is derived from those values rather than stored separately.

## Current-build compatibility findings

- The current visual system already selects the highest per-building milestone
  at or below the completed level, so an explicit schedule table fits the
  architecture without an engine change or new library.
- The current catalogue uses 11 visual stages, not 12. Most buildings use one
  raster atlas containing 11 measured sprite rectangles; Town Hall uses 11
  separate PNGs.
- Current schedules are deterministic and per legacy building type, but are
  generated from each type ID rather than declared as the schedule above. They
  include one seven-level gap. For example, Town Hall currently changes at
  1, 5, 8, 12, 17, 22, 28, 34, 41, 45 and 50; Prayer Area at
  1, 5, 9, 14, 18, 23, 28, 31, 38, 44 and 50.
- The current runtime still uses the earlier 30-building catalogue and IDs. The
  21-building catalogue in this proposal is not yet represented in code.
- Town Wall is a special renderer with three complete cliff-integrated scenes:
  timber at Levels 1–10, adobe at 11–32 and sandstone at 33–50. It does not
  currently display eleven or twelve distinct wall pictures.
- Hospital has no current runtime ID, artwork or save entry. Its design bands
  may be approved outside the checked repository, but they are not present in
  the current canonical code or `docs/approved/DECISIONS.md`.
- Current town markers own their tap areas and labels independently of the
  sprite image. Keeping every look inside its marker envelope avoids hundreds
  of per-image hit-area and label placements.
- The current Dev/save validator caps every implemented building at Level 50.
  Levels 60–100 and their shared decorations would require a later explicit
  level-cap and save-validation decision.

## Open checks before approval or implementation

1. Decide whether all buildings truly need 12 looks, or whether some should use
   fewer strong structural steps.
2. Decide whether Town Wall and Hospital replace their three approved bands or
   keep them as exceptions.
3. Finalise the 21-building IDs and migration/alias map from the legacy
   catalogue before schedules are keyed to names.
4. Confirm maximum gameplay levels, especially whether Level 100 is real or
   whether post-50 decorations are a separate prestige track.
5. Define per-building normalized decoration sockets and occlusion rules before
   sharing banners, lanterns, flags, planters and crests across unlike shapes.
