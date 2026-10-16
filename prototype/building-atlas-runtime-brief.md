# AZMARA — runtime agent building-atlas generation record

Date: 10 October 2026. Assignment: twelve original non-Hall building stage sheets for DEC-056. Runtime source stayed frozen during this generation batch.

## Status and review boundary

All twelve raw sheets were generated with built-in ImageGen, visually inspected as complete role-specific atlases, and copied unchanged into the canonical project. The original generated files remain intact. At generation acceptance there was no pixel editing, cropping, normalization or alpha cleanup. Read-only PNG decoding measured native dimensions, real alpha and separated opaque bodies; a byte equality check confirmed all twelve project copies match their originals.

Subsequently the Founder explicitly approved local edge-only cleanup. Runtime v2 siblings remove only eligible exact RGB(255,0,0) or RGB(255,255,0) matte pixels with alpha1–8, setting their alpha to0. An exterior/isolated component gate protects interior paint. The final report in `assets/progression/edge-cleanup-report.json` records source/output hashes and decoded-pixel invariants; all RGB, noncandidate RGBA, alpha>8, dimensions and original files remain unchanged. `tools/clean-atlas-edges.py` reproduces this operation. This does not crop, resample or redesign the buildings.

Each square sheet has twelve small sprites in four columns and three rows: levels 1, 5, 10, 15; 20, 25, 30, 35; 40, 45, 50, 50. The last cell is the requested duplicate level 50. These are structural building-development stages, not animation frames.

Parent-approved acceptance permits a complete isolated sprite to extend slightly beyond a nominal cell into unused transparent gutter. The art coordinator must use full tight sprite rectangles, including detached functional props, and must not clip the source or retain only the largest connected component. The opaque-body audit below is a diagnostic at alpha ≥160 and component size ≥300 pixels, not the final low-alpha shadow/prop crop registry. Eleven sheets have twelve such bodies; Workshop has eighteen components including functional detached props.

**Outstanding visual issue:** pure-red cutout-edge speckles/halos are visible on several raw sheets. This was reported to the parent, who is assessing a built-in ImageGen edge-only repair. These files are raw reviewed drafts, not proof of final in-game acceptance or publication. No edge cleanup was applied by this agent.

## Reference and exact prompt set

Style/layout reference only, not an edit target and not proprietary Ikariam artwork:

`<LOCAL_HOME>/.codex/generated_images/01a110d7-7840-71d3-b4bb-ec945e585d0b/exec-dabfb5e3-2baa-4bfc-9c4e-d697a74b61df.png`

Every call used `transparent_background: true` and this single reference. The full exact prompt for each ID is the common prompt below, followed by a newline and its exact `Subject:` text in the table.

```text
Use case: stylized-concept.
Asset type: original AZMARA transparent building-development atlas.
Input images: Image 1 is LAYOUT/STYLE reference only, not an edit target; replace ALL academy sprites with the specified single building role.
Composition: SQUARE canvas, strict FOUR equal columns × THREE equal rows: exactly TWELVE SMALL independently centred complete THUMBNAIL sprites. Each sprite only 50% cell width, generous real-alpha gutters on all sides; full footprint and shadow inside its own cell. No overlap, merged cells or cutoff.
Order: row 1 levels 1,5,10,15; row 2 levels 20,25,30,35; row 3 levels 40,45,50,50 (duplicate level50 last cell).
Development: eleven structural milestones: weak rough wood at1, sturdy wood5, small brick10, plaster/stone15, maintained masonry20, then25/30/35/40/45/50 increasingly refined role-specific functional wings, roofs, gates, bays and work yards. Each milestone has material AND structural change, not recolour or scale alone.
Style: rich original ivory/terracotta/dark timber/restrained teal painterly isometric textures, upper-left light. Do NOT copy Academy courtyard or towers onto unrelated roles. Industrial roles stay low and practical, not generic civic tower-palaces.
Constraints: genuine transparent background. No labels, letters, numbers, grid, borders, backdrop, surrounding scenery, people, gods, miracles, sacred writing or symbols.
```

| ID | Exact subject suffix |
| --- | --- |
| shipyard | Subject: Shipyard: a low shipbuilding yard with visible warship hull, slips, covered hull work bay and cranes. |
| barracks | Subject: Barracks: low quarters around a training/muster court, equipment racks and neutral standards. |
| town-wall | Subject: Town Wall: a LOCAL wall segment only, progressing from palisade to brick to stone gate and buttresses; NO full perimeter. |
| workshop | Subject: Workshop: a low troop and ship-equipment workshop, benches, anvil, crates and a restrained forge. |
| grain-estate | Subject: Grain Estate: an agricultural work yard with grain baskets, threshing/handling area and estate work bays; NO surrounding fields. |
| clayworks | Subject: Clayworks: a clay processing work yard, clay stacks, drying beds, kiln and work shelters. |
| carpenters-workshop | Subject: Carpenter’s Workshop: joinery benches, timber stock, saws and low carpentry workshop roofs. |
| precision-workshop | Subject: Precision Workshop: fine instrument/tool benches, orderly small workshop bays and precision measuring details. |
| materials-workshop | Subject: Materials Workshop: metal stock preparation and reuse yard, broad practical work bays, ingots and material racks. |
| grain-store | Subject: Grain Store: covered grain handling, bins, sacks and low broad storage halls. |
| architects-office | Subject: Architect’s Office: a modest drafting office and plan courtyard, rolled plans, drafting table and measurement tools. |
| chronos-forge | Subject: Chronos’ Forge: a SECULAR timekeeping, work-planning and construction workshop, with mechanical clock and measurement devices and work benches. NO deity or magic. |

## Generated originals, saved paths and visual notes

All native outputs are **1254 × 1254 PNG, 8-bit RGBA**, with genuine zero-alpha pixels. Canonical destination directory:

`<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/`

### shipyard

- Original: `<LOCAL_HOME>/.codex/generated_images/01a125f7-ba96-7ae0-8559-f8b7d04b82df/exec-c374adbd-98aa-4ac6-8dba-0e7650bdee6a.png`
- Saved: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-shipyard-stages-v1.png`
- Native dimensions: 1254 × 1254; zero-alpha pixels: 64.4%.
- Visual role acceptance: Low naval yard with visible hulls, slips, covered work bays and cranes; distinct timber-to-masonry progress.
- Layout: twelve separated complete sprites and structurally changing milestones; duplicate 50 retained. No rejected/repair generation was used.

### barracks

- Original: `<LOCAL_HOME>/.codex/generated_images/01a125f7-ba96-7ae0-8559-f8b7d04b82df/exec-2ac82c6a-6a6f-484c-8068-14d93a90f514.png`
- Saved: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-barracks-stages-v1.png`
- Native dimensions: 1254 × 1254; zero-alpha pixels: 65.24%.
- Visual role acceptance: Quarters with equipment and muster/training court; neutral standards and no people.
- Layout: twelve separated complete sprites and structurally changing milestones; duplicate 50 retained. No rejected/repair generation was used.

### town-wall

- Original: `<LOCAL_HOME>/.codex/generated_images/01a125f7-ba96-7ae0-8559-f8b7d04b82df/exec-c1cdd132-3400-41cb-ad2b-21fa5bd3958a.png`
- Saved: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-town-wall-stages-v1.png`
- Native dimensions: 1254 × 1254; zero-alpha pixels: 67.3%.
- Visual role acceptance: Local palisade-to-masonry gate/wall segment only; no full town perimeter.
- Layout: twelve separated complete sprites and structurally changing milestones; duplicate 50 retained. No rejected/repair generation was used.

### workshop

- Original: `<LOCAL_HOME>/.codex/generated_images/01a125f7-ba96-7ae0-8559-f8b7d04b82df/exec-bb2f1829-a7b3-4146-99ad-5cd7a6cd1135.png`
- Saved: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-workshop-stages-v1.png`
- Native dimensions: 1254 × 1254; zero-alpha pixels: 60.95%.
- Visual role acceptance: Practical low equipment yard with benches, anvil, forge and crane props; keep detached functional props in display bounds.
- Layout: twelve separated complete sprites and structurally changing milestones; duplicate 50 retained. No rejected/repair generation was used.

### grain-estate

- Original: `<LOCAL_HOME>/.codex/generated_images/01a125f7-ba96-7ae0-8559-f8b7d04b82df/exec-a213b2dc-2efe-417f-b1d4-8257401230e1.png`
- Saved: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-grain-estate-stages-v1.png`
- Native dimensions: 1254 × 1254; zero-alpha pixels: 62.78%.
- Visual role acceptance: Grain baskets, piles, handling/threshing yard and estate work bays; no surrounding fields.
- Layout: twelve separated complete sprites and structurally changing milestones; duplicate 50 retained. No rejected/repair generation was used.

### clayworks

- Original: `<LOCAL_HOME>/.codex/generated_images/01a125f7-ba96-7ae0-8559-f8b7d04b82df/exec-8e20bd70-b386-4ab8-b7b4-98d5d19ea3c9.png`
- Saved: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-clayworks-stages-v1.png`
- Native dimensions: 1254 × 1254; zero-alpha pixels: 60.38%.
- Visual role acceptance: Clay stacks, drying/work areas, kilns and workshelters; practical industrial yard.
- Layout: twelve separated complete sprites and structurally changing milestones; duplicate 50 retained. No rejected/repair generation was used.

### carpenters-workshop

- Original: `<LOCAL_HOME>/.codex/generated_images/01a125f7-ba96-7ae0-8559-f8b7d04b82df/exec-4701557a-146b-43be-ac78-d36450e9be39.png`
- Saved: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-carpenters-workshop-stages-v1.png`
- Native dimensions: 1254 × 1254; zero-alpha pixels: 66.77%.
- Visual role acceptance: Visible joinery benches, timber stock and carpentry roof/bay structures.
- Layout: twelve separated complete sprites and structurally changing milestones; duplicate 50 retained. No rejected/repair generation was used.

### precision-workshop

- Original: `<LOCAL_HOME>/.codex/generated_images/01a125f7-ba96-7ae0-8559-f8b7d04b82df/exec-af32d11a-fc1a-412a-a0c9-826e6bff4025.png`
- Saved: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-precision-workshop-stages-v1.png`
- Native dimensions: 1254 × 1254; zero-alpha pixels: 60.88%.
- Visual role acceptance: Instrument and tool benches, measuring devices and increasingly organised work bays.
- Layout: twelve separated complete sprites and structurally changing milestones; duplicate 50 retained. No rejected/repair generation was used.

### materials-workshop

- Original: `<LOCAL_HOME>/.codex/generated_images/01a125f7-ba96-7ae0-8559-f8b7d04b82df/exec-3dadf222-7153-458e-92e3-673d1a335d3b.png`
- Saved: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-materials-workshop-stages-v1.png`
- Native dimensions: 1254 × 1254; zero-alpha pixels: 63.83%.
- Visual role acceptance: Metal stock, ingots, racks, preparation forge and practical work bays.
- Layout: twelve separated complete sprites and structurally changing milestones; duplicate 50 retained. No rejected/repair generation was used.

### grain-store

- Original: `<LOCAL_HOME>/.codex/generated_images/01a125f7-ba96-7ae0-8559-f8b7d04b82df/exec-a496697a-2554-4752-bbac-3e5be1075cdf.png`
- Saved: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-grain-store-stages-v1.png`
- Native dimensions: 1254 × 1254; zero-alpha pixels: 62.77%.
- Visual role acceptance: Grain sacks and bins with handling yards and broad storage halls.
- Layout: twelve separated complete sprites and structurally changing milestones; duplicate 50 retained. No rejected/repair generation was used.

### architects-office

- Original: `<LOCAL_HOME>/.codex/generated_images/01a125f7-ba96-7ae0-8559-f8b7d04b82df/exec-77e12002-1d91-49d5-a919-01eb882401cc.png`
- Saved: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-architects-office-stages-v1.png`
- Native dimensions: 1254 × 1254; zero-alpha pixels: 60.99%.
- Visual role acceptance: Drafting tables, rolled plans, measuring props and an office/work courtyard.
- Layout: twelve separated complete sprites and structurally changing milestones; duplicate 50 retained. No rejected/repair generation was used.

### chronos-forge

- Original: `<LOCAL_HOME>/.codex/generated_images/01a125f7-ba96-7ae0-8559-f8b7d04b82df/exec-102b3313-5028-49aa-8571-fc287ea54da4.png`
- Saved: `<LOCAL_HOME>/Developer/DEVELOPMENT/APP GAME PROJECT - IKARIAM/prototype/assets/progression/azmara-chronos-forge-stages-v1.png`
- Native dimensions: 1254 × 1254; zero-alpha pixels: 61.9%.
- Visual role acceptance: Secular mechanical clocks, measurement devices and planning/work benches; no gods, miracle or magic.
- Layout: twelve separated complete sprites and structurally changing milestones; duplicate 50 retained. No rejected/repair generation was used.

## Read-only opaque-body diagnostics

Bounding boxes are inclusive source-pixel rectangles. `cell` is the nominal 1–12 layout slot. A negative `minGutter` indicates only nominal-cell crossing; it does not mean another body's pixels were touched. Use the coordinator's final complete-body/prop crop registry for runtime rendering.

```json
[
  {
    "id": "shipyard",
    "width": 1254,
    "height": 1254,
    "alphaZeroPct": 64.4,
    "largeComponents": 12,
    "components": [
      {
        "cell": 1,
        "bbox": [
          44,
          218,
          261,
          386
        ],
        "minGutter": 31
      },
      {
        "cell": 2,
        "bbox": [
          355,
          214,
          577,
          397
        ],
        "minGutter": 20
      },
      {
        "cell": 3,
        "bbox": [
          660,
          208,
          892,
          398
        ],
        "minGutter": 19
      },
      {
        "cell": 4,
        "bbox": [
          971,
          190,
          1222,
          400
        ],
        "minGutter": 17
      },
      {
        "cell": 5,
        "bbox": [
          21,
          538,
          293,
          762
        ],
        "minGutter": 19.5
      },
      {
        "cell": 6,
        "bbox": [
          320,
          551,
          608,
          759
        ],
        "minGutter": 6.5
      },
      {
        "cell": 7,
        "bbox": [
          639,
          533,
          929,
          768
        ],
        "minGutter": 10.5
      },
      {
        "cell": 8,
        "bbox": [
          946,
          529,
          1238,
          761
        ],
        "minGutter": 5.5
      },
      {
        "cell": 9,
        "bbox": [
          19,
          888,
          292,
          1137
        ],
        "minGutter": 19
      },
      {
        "cell": 10,
        "bbox": [
          321,
          892,
          618,
          1139
        ],
        "minGutter": 7.5
      },
      {
        "cell": 11,
        "bbox": [
          634,
          894,
          929,
          1142
        ],
        "minGutter": 7
      },
      {
        "cell": 12,
        "bbox": [
          948,
          894,
          1242,
          1142
        ],
        "minGutter": 7.5
      }
    ]
  },
  {
    "id": "barracks",
    "width": 1254,
    "height": 1254,
    "alphaZeroPct": 65.24,
    "largeComponents": 12,
    "components": [
      {
        "cell": 1,
        "bbox": [
          58,
          205,
          284,
          383
        ],
        "minGutter": 28.5
      },
      {
        "cell": 2,
        "bbox": [
          352,
          199,
          596,
          386
        ],
        "minGutter": 30
      },
      {
        "cell": 3,
        "bbox": [
          664,
          176,
          911,
          388
        ],
        "minGutter": 28.5
      },
      {
        "cell": 4,
        "bbox": [
          955,
          180,
          1224,
          394
        ],
        "minGutter": 14.5
      },
      {
        "cell": 5,
        "bbox": [
          28,
          543,
          303,
          755
        ],
        "minGutter": 9.5
      },
      {
        "cell": 6,
        "bbox": [
          338,
          534,
          610,
          759
        ],
        "minGutter": 16
      },
      {
        "cell": 7,
        "bbox": [
          641,
          531,
          920,
          762
        ],
        "minGutter": 14
      },
      {
        "cell": 8,
        "bbox": [
          943,
          529,
          1245,
          764
        ],
        "minGutter": 2.5
      },
      {
        "cell": 9,
        "bbox": [
          18,
          905,
          312,
          1153
        ],
        "minGutter": 0.5
      },
      {
        "cell": 10,
        "bbox": [
          336,
          891,
          618,
          1148
        ],
        "minGutter": 8
      },
      {
        "cell": 11,
        "bbox": [
          635,
          877,
          932,
          1154
        ],
        "minGutter": 7.5
      },
      {
        "cell": 12,
        "bbox": [
          949,
          880,
          1245,
          1154
        ],
        "minGutter": 8
      }
    ]
  },
  {
    "id": "town-wall",
    "width": 1254,
    "height": 1254,
    "alphaZeroPct": 67.3,
    "largeComponents": 12,
    "components": [
      {
        "cell": 1,
        "bbox": [
          56,
          249,
          272,
          412
        ],
        "minGutter": 5
      },
      {
        "cell": 2,
        "bbox": [
          361,
          220,
          582,
          413
        ],
        "minGutter": 4
      },
      {
        "cell": 3,
        "bbox": [
          670,
          217,
          903,
          414
        ],
        "minGutter": 3
      },
      {
        "cell": 4,
        "bbox": [
          965,
          203,
          1216,
          415
        ],
        "minGutter": 2
      },
      {
        "cell": 5,
        "bbox": [
          25,
          549,
          301,
          762
        ],
        "minGutter": 11.5
      },
      {
        "cell": 6,
        "bbox": [
          345,
          543,
          609,
          762
        ],
        "minGutter": 17
      },
      {
        "cell": 7,
        "bbox": [
          641,
          528,
          916,
          764
        ],
        "minGutter": 14
      },
      {
        "cell": 8,
        "bbox": [
          951,
          539,
          1237,
          772
        ],
        "minGutter": 10.5
      },
      {
        "cell": 9,
        "bbox": [
          16,
          883,
          296,
          1121
        ],
        "minGutter": 16
      },
      {
        "cell": 10,
        "bbox": [
          328,
          872,
          617,
          1122
        ],
        "minGutter": 9
      },
      {
        "cell": 11,
        "bbox": [
          640,
          872,
          930,
          1122
        ],
        "minGutter": 9.5
      },
      {
        "cell": 12,
        "bbox": [
          954,
          872,
          1243,
          1122
        ],
        "minGutter": 10
      }
    ]
  },
  {
    "id": "workshop",
    "width": 1254,
    "height": 1254,
    "alphaZeroPct": 60.95,
    "largeComponents": 18,
    "components": [
      {
        "cell": 1,
        "bbox": [
          54,
          192,
          287,
          372
        ],
        "minGutter": 25.5
      },
      {
        "cell": 2,
        "bbox": [
          347,
          141,
          596,
          372
        ],
        "minGutter": 30
      },
      {
        "cell": 3,
        "bbox": [
          643,
          149,
          912,
          374
        ],
        "minGutter": 16
      },
      {
        "cell": 4,
        "bbox": [
          956,
          141,
          1231,
          377
        ],
        "minGutter": 15.5
      },
      {
        "cell": 5,
        "bbox": [
          22,
          526,
          298,
          759
        ],
        "minGutter": 14.5
      },
      {
        "cell": 6,
        "bbox": [
          329,
          515,
          611,
          768
        ],
        "minGutter": 15
      },
      {
        "cell": 7,
        "bbox": [
          642,
          527,
          916,
          771
        ],
        "minGutter": 15
      },
      {
        "cell": 7,
        "bbox": [
          895,
          602,
          919,
          631
        ],
        "minGutter": 20.5
      },
      {
        "cell": 8,
        "bbox": [
          949,
          519,
          1229,
          764
        ],
        "minGutter": 8.5
      },
      {
        "cell": 8,
        "bbox": [
          1194,
          578,
          1215,
          598
        ],
        "minGutter": 38
      },
      {
        "cell": 9,
        "bbox": [
          26,
          901,
          294,
          1137
        ],
        "minGutter": 18.5
      },
      {
        "cell": 9,
        "bbox": [
          263,
          968,
          283,
          992
        ],
        "minGutter": 29.5
      },
      {
        "cell": 10,
        "bbox": [
          329,
          898,
          613,
          1145
        ],
        "minGutter": 13
      },
      {
        "cell": 10,
        "bbox": [
          564,
          955,
          590,
          981
        ],
        "minGutter": 36
      },
      {
        "cell": 11,
        "bbox": [
          639,
          891,
          926,
          1148
        ],
        "minGutter": 12
      },
      {
        "cell": 11,
        "bbox": [
          879,
          939,
          904,
          982
        ],
        "minGutter": 35.5
      },
      {
        "cell": 12,
        "bbox": [
          952,
          891,
          1239,
          1148
        ],
        "minGutter": 11.5
      },
      {
        "cell": 12,
        "bbox": [
          1192,
          954,
          1218,
          981
        ],
        "minGutter": 35
      }
    ]
  },
  {
    "id": "grain-estate",
    "width": 1254,
    "height": 1254,
    "alphaZeroPct": 62.78,
    "largeComponents": 12,
    "components": [
      {
        "cell": 1,
        "bbox": [
          42,
          245,
          257,
          423
        ],
        "minGutter": -6
      },
      {
        "cell": 2,
        "bbox": [
          345,
          230,
          584,
          428
        ],
        "minGutter": -11
      },
      {
        "cell": 3,
        "bbox": [
          652,
          210,
          899,
          429
        ],
        "minGutter": -12
      },
      {
        "cell": 4,
        "bbox": [
          951,
          204,
          1216,
          433
        ],
        "minGutter": -16
      },
      {
        "cell": 5,
        "bbox": [
          20,
          530,
          303,
          761
        ],
        "minGutter": 9.5
      },
      {
        "cell": 6,
        "bbox": [
          326,
          518,
          612,
          774
        ],
        "minGutter": 12.5
      },
      {
        "cell": 7,
        "bbox": [
          635,
          519,
          931,
          772
        ],
        "minGutter": 8
      },
      {
        "cell": 8,
        "bbox": [
          949,
          515,
          1241,
          773
        ],
        "minGutter": 8.5
      },
      {
        "cell": 9,
        "bbox": [
          14,
          872,
          303,
          1126
        ],
        "minGutter": 9.5
      },
      {
        "cell": 10,
        "bbox": [
          321,
          853,
          618,
          1125
        ],
        "minGutter": 7.5
      },
      {
        "cell": 11,
        "bbox": [
          633,
          854,
          930,
          1124
        ],
        "minGutter": 6
      },
      {
        "cell": 12,
        "bbox": [
          945,
          854,
          1243,
          1124
        ],
        "minGutter": 4.5
      }
    ]
  },
  {
    "id": "clayworks",
    "width": 1254,
    "height": 1254,
    "alphaZeroPct": 60.38,
    "largeComponents": 12,
    "components": [
      {
        "cell": 1,
        "bbox": [
          52,
          229,
          272,
          393
        ],
        "minGutter": 24
      },
      {
        "cell": 2,
        "bbox": [
          361,
          209,
          583,
          397
        ],
        "minGutter": 20
      },
      {
        "cell": 3,
        "bbox": [
          666,
          189,
          914,
          412
        ],
        "minGutter": 5
      },
      {
        "cell": 4,
        "bbox": [
          971,
          180,
          1227,
          414
        ],
        "minGutter": 3
      },
      {
        "cell": 5,
        "bbox": [
          25,
          548,
          302,
          770
        ],
        "minGutter": 10.5
      },
      {
        "cell": 6,
        "bbox": [
          331,
          521,
          615,
          778
        ],
        "minGutter": 11
      },
      {
        "cell": 7,
        "bbox": [
          640,
          514,
          928,
          783
        ],
        "minGutter": 11.5
      },
      {
        "cell": 8,
        "bbox": [
          949,
          514,
          1246,
          780
        ],
        "minGutter": 7
      },
      {
        "cell": 9,
        "bbox": [
          21,
          872,
          307,
          1140
        ],
        "minGutter": 5.5
      },
      {
        "cell": 10,
        "bbox": [
          324,
          858,
          620,
          1144
        ],
        "minGutter": 6
      },
      {
        "cell": 11,
        "bbox": [
          635,
          870,
          933,
          1150
        ],
        "minGutter": 6.5
      },
      {
        "cell": 12,
        "bbox": [
          949,
          870,
          1246,
          1150
        ],
        "minGutter": 7
      }
    ]
  },
  {
    "id": "carpenters-workshop",
    "width": 1254,
    "height": 1254,
    "alphaZeroPct": 66.77,
    "largeComponents": 12,
    "components": [
      {
        "cell": 1,
        "bbox": [
          64,
          242,
          263,
          404
        ],
        "minGutter": 13
      },
      {
        "cell": 2,
        "bbox": [
          349,
          219,
          584,
          411
        ],
        "minGutter": 6
      },
      {
        "cell": 3,
        "bbox": [
          675,
          201,
          909,
          415
        ],
        "minGutter": 2
      },
      {
        "cell": 4,
        "bbox": [
          974,
          204,
          1228,
          418
        ],
        "minGutter": -1
      },
      {
        "cell": 5,
        "bbox": [
          36,
          540,
          298,
          755
        ],
        "minGutter": 14.5
      },
      {
        "cell": 6,
        "bbox": [
          338,
          539,
          614,
          755
        ],
        "minGutter": 12
      },
      {
        "cell": 7,
        "bbox": [
          640,
          535,
          924,
          756
        ],
        "minGutter": 13
      },
      {
        "cell": 8,
        "bbox": [
          955,
          534,
          1240,
          767
        ],
        "minGutter": 13
      },
      {
        "cell": 9,
        "bbox": [
          22,
          880,
          299,
          1121
        ],
        "minGutter": 13.5
      },
      {
        "cell": 10,
        "bbox": [
          332,
          892,
          608,
          1126
        ],
        "minGutter": 18
      },
      {
        "cell": 11,
        "bbox": [
          634,
          882,
          926,
          1120
        ],
        "minGutter": 7
      },
      {
        "cell": 12,
        "bbox": [
          943,
          882,
          1234,
          1119
        ],
        "minGutter": 2.5
      }
    ]
  },
  {
    "id": "precision-workshop",
    "width": 1254,
    "height": 1254,
    "alphaZeroPct": 60.88,
    "largeComponents": 12,
    "components": [
      {
        "cell": 1,
        "bbox": [
          59,
          234,
          298,
          427
        ],
        "minGutter": -10
      },
      {
        "cell": 2,
        "bbox": [
          347,
          210,
          599,
          429
        ],
        "minGutter": -12
      },
      {
        "cell": 3,
        "bbox": [
          653,
          213,
          907,
          436
        ],
        "minGutter": -19
      },
      {
        "cell": 4,
        "bbox": [
          940,
          207,
          1218,
          436
        ],
        "minGutter": -19
      },
      {
        "cell": 5,
        "bbox": [
          36,
          528,
          315,
          758
        ],
        "minGutter": -2.5
      },
      {
        "cell": 6,
        "bbox": [
          338,
          521,
          612,
          771
        ],
        "minGutter": 14
      },
      {
        "cell": 7,
        "bbox": [
          631,
          545,
          919,
          767
        ],
        "minGutter": 4
      },
      {
        "cell": 8,
        "bbox": [
          941,
          508,
          1230,
          791
        ],
        "minGutter": 0.5
      },
      {
        "cell": 9,
        "bbox": [
          30,
          889,
          315,
          1147
        ],
        "minGutter": -2.5
      },
      {
        "cell": 10,
        "bbox": [
          330,
          884,
          617,
          1150
        ],
        "minGutter": 9
      },
      {
        "cell": 11,
        "bbox": [
          631,
          882,
          929,
          1146
        ],
        "minGutter": 4
      },
      {
        "cell": 12,
        "bbox": [
          945,
          883,
          1243,
          1145
        ],
        "minGutter": 4.5
      }
    ]
  },
  {
    "id": "materials-workshop",
    "width": 1254,
    "height": 1254,
    "alphaZeroPct": 63.83,
    "largeComponents": 12,
    "components": [
      {
        "cell": 1,
        "bbox": [
          50,
          240,
          277,
          418
        ],
        "minGutter": -1
      },
      {
        "cell": 2,
        "bbox": [
          362,
          231,
          588,
          418
        ],
        "minGutter": -1
      },
      {
        "cell": 3,
        "bbox": [
          663,
          197,
          890,
          425
        ],
        "minGutter": -8
      },
      {
        "cell": 4,
        "bbox": [
          971,
          209,
          1221,
          431
        ],
        "minGutter": -14
      },
      {
        "cell": 5,
        "bbox": [
          32,
          539,
          293,
          769
        ],
        "minGutter": 19.5
      },
      {
        "cell": 6,
        "bbox": [
          348,
          538,
          605,
          762
        ],
        "minGutter": 21
      },
      {
        "cell": 7,
        "bbox": [
          646,
          535,
          912,
          778
        ],
        "minGutter": 19
      },
      {
        "cell": 8,
        "bbox": [
          948,
          520,
          1238,
          785
        ],
        "minGutter": 7.5
      },
      {
        "cell": 9,
        "bbox": [
          30,
          882,
          301,
          1127
        ],
        "minGutter": 11.5
      },
      {
        "cell": 10,
        "bbox": [
          342,
          871,
          607,
          1122
        ],
        "minGutter": 19
      },
      {
        "cell": 11,
        "bbox": [
          644,
          874,
          921,
          1124
        ],
        "minGutter": 17
      },
      {
        "cell": 12,
        "bbox": [
          948,
          874,
          1226,
          1125
        ],
        "minGutter": 7.5
      }
    ]
  },
  {
    "id": "grain-store",
    "width": 1254,
    "height": 1254,
    "alphaZeroPct": 62.77,
    "largeComponents": 12,
    "components": [
      {
        "cell": 1,
        "bbox": [
          59,
          244,
          275,
          418
        ],
        "minGutter": -1
      },
      {
        "cell": 2,
        "bbox": [
          356,
          223,
          588,
          416
        ],
        "minGutter": 1
      },
      {
        "cell": 3,
        "bbox": [
          661,
          219,
          903,
          418
        ],
        "minGutter": -1
      },
      {
        "cell": 4,
        "bbox": [
          962,
          201,
          1220,
          429
        ],
        "minGutter": -12
      },
      {
        "cell": 5,
        "bbox": [
          30,
          535,
          296,
          752
        ],
        "minGutter": 16.5
      },
      {
        "cell": 6,
        "bbox": [
          343,
          521,
          604,
          750
        ],
        "minGutter": 22
      },
      {
        "cell": 7,
        "bbox": [
          646,
          526,
          915,
          756
        ],
        "minGutter": 19
      },
      {
        "cell": 8,
        "bbox": [
          949,
          514,
          1236,
          763
        ],
        "minGutter": 8.5
      },
      {
        "cell": 9,
        "bbox": [
          20,
          883,
          314,
          1126
        ],
        "minGutter": -1.5
      },
      {
        "cell": 10,
        "bbox": [
          337,
          879,
          618,
          1133
        ],
        "minGutter": 8
      },
      {
        "cell": 11,
        "bbox": [
          636,
          873,
          926,
          1127
        ],
        "minGutter": 9
      },
      {
        "cell": 12,
        "bbox": [
          949,
          872,
          1239,
          1127
        ],
        "minGutter": 8.5
      }
    ]
  },
  {
    "id": "architects-office",
    "width": 1254,
    "height": 1254,
    "alphaZeroPct": 60.99,
    "largeComponents": 12,
    "components": [
      {
        "cell": 1,
        "bbox": [
          50,
          219,
          273,
          413
        ],
        "minGutter": 4
      },
      {
        "cell": 2,
        "bbox": [
          354,
          209,
          590,
          415
        ],
        "minGutter": 2
      },
      {
        "cell": 3,
        "bbox": [
          665,
          195,
          903,
          417
        ],
        "minGutter": 0
      },
      {
        "cell": 4,
        "bbox": [
          973,
          189,
          1223,
          413
        ],
        "minGutter": 4
      },
      {
        "cell": 5,
        "bbox": [
          25,
          523,
          305,
          761
        ],
        "minGutter": 7.5
      },
      {
        "cell": 6,
        "bbox": [
          337,
          510,
          614,
          761
        ],
        "minGutter": 12
      },
      {
        "cell": 7,
        "bbox": [
          647,
          510,
          923,
          767
        ],
        "minGutter": 16.5
      },
      {
        "cell": 8,
        "bbox": [
          961,
          506,
          1239,
          765
        ],
        "minGutter": 14
      },
      {
        "cell": 9,
        "bbox": [
          21,
          878,
          298,
          1138
        ],
        "minGutter": 14.5
      },
      {
        "cell": 10,
        "bbox": [
          330,
          874,
          621,
          1139
        ],
        "minGutter": 5
      },
      {
        "cell": 11,
        "bbox": [
          638,
          856,
          930,
          1136
        ],
        "minGutter": 9.5
      },
      {
        "cell": 12,
        "bbox": [
          951,
          856,
          1243,
          1135
        ],
        "minGutter": 10
      }
    ]
  },
  {
    "id": "chronos-forge",
    "width": 1254,
    "height": 1254,
    "alphaZeroPct": 61.9,
    "largeComponents": 12,
    "components": [
      {
        "cell": 1,
        "bbox": [
          63,
          246,
          269,
          418
        ],
        "minGutter": -1
      },
      {
        "cell": 2,
        "bbox": [
          365,
          225,
          581,
          420
        ],
        "minGutter": -3
      },
      {
        "cell": 3,
        "bbox": [
          664,
          219,
          895,
          425
        ],
        "minGutter": -8
      },
      {
        "cell": 4,
        "bbox": [
          973,
          205,
          1222,
          431
        ],
        "minGutter": -14
      },
      {
        "cell": 5,
        "bbox": [
          32,
          535,
          302,
          762
        ],
        "minGutter": 10.5
      },
      {
        "cell": 6,
        "bbox": [
          345,
          529,
          611,
          768
        ],
        "minGutter": 15
      },
      {
        "cell": 7,
        "bbox": [
          641,
          523,
          920,
          773
        ],
        "minGutter": 14
      },
      {
        "cell": 8,
        "bbox": [
          959,
          519,
          1243,
          768
        ],
        "minGutter": 10
      },
      {
        "cell": 9,
        "bbox": [
          12,
          876,
          312,
          1129
        ],
        "minGutter": 0.5
      },
      {
        "cell": 10,
        "bbox": [
          329,
          873,
          617,
          1137
        ],
        "minGutter": 9
      },
      {
        "cell": 11,
        "bbox": [
          630,
          866,
          931,
          1144
        ],
        "minGutter": 3
      },
      {
        "cell": 12,
        "bbox": [
          944,
          866,
          1244,
          1144
        ],
        "minGutter": 3.5
      }
    ]
  }
]
```
