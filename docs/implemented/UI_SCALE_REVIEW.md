---
id: DOC-AZM-0010
type: REPORT
status: CURRENT
feature: BUILT AND DELIVERED
purpose: Sidebar cleanup and building size review
links: []
owner: AZMARA chat
---

# Sidebar cleanup and building size review

13 October 2026. Parts 1 and 2 were implemented locally under DEC-087 and later
delivered as private web22 at the Owner's request under DEC-088.
See [delivery and rollback](WEB_PUBLICATION_22.md).
The canyon study is proposal only; native and Levels24/26 remain unchanged.

Recommend **80%** for the next visual decision, not a default rollout.
The Appearance tool retains current 100%, 80% and 65% views with the same camera
and plot positions. Exiting it restores the actual town without saving a scale.

## Sidebar and camera changes

Desktop width is **228px**, down from 304px: exactly 25% narrower. The permanent
compact/phone rail remains 56px; the open drawer is up to 320px for readable
menus and 44px targets. The game begins at the reserved sidebar/rail edge in
Town, Region and World.

Capacity uses four icon-and-number cells; resources use a compact three-by-two
grid. Names are available on hover, focus and phone tap. Section titles and
padding are reduced, while Council buttons keep their small icons and names.
Help and Options belong to a separate Player controls footer. The Dev workbench
and empty-plot/local-preview line remain Dev-only. Gameplay headings say
Resources, with neutral availability messages in unfinished player panels.

Town and Region no longer show a bottom zoom bar. Ordinary wheel/trackpad input
zooms the map; Ctrl/Meta wheel and native pinch remain available to the browser
for accessibility zoom. Clicking Town again restores centred Fit. World alone
keeps minus, **Overview**, numeric zoom and plus; no duplicate Fit or ambiguous
Close label. Real-device native pinch and maximum-zoom behavior remain manual
verification items.

## Actual sidebar screenshots

These four screenshots are from the one approved, now-closed headless pass.
They verify the narrower panel and player split, not the later fixes below.

Desktop before:

![Desktop sidebar before](../../evidence/2026-10-13-ui-scale-study/headless-2026-10-12T23-35-39-162Z/before-desktop-gameplay.png)

Desktop after:

![Desktop sidebar after](../../evidence/2026-10-13-ui-scale-study/headless-2026-10-12T23-35-39-162Z/after-desktop-gameplay.png)

Phone drawer before:

![Phone drawer before](../../evidence/2026-10-13-ui-scale-study/headless-2026-10-12T23-35-39-162Z/before-phone-gameplay-drawer.png)

Phone drawer after:

![Phone drawer after](../../evidence/2026-10-13-ui-scale-study/headless-2026-10-12T23-35-39-162Z/after-phone-gameplay-drawer.png)

The phone after image shows a transient toast covering footer text.
It has since been hidden visually while the compact drawer is open; the separate
screen-reader announcer is unchanged. That repair needs a new screenshot check.

## Appearance comparison

In local Dev, open **Appearance**, then the size comparison. Desktop offers
three passive cards and Inspect controls. Phone offers one preview at a time,
with 100%, 80% and 65% buttons. Inspect preserves the captured camera and all
23 positions; inactive cards are inert. Return to town or exit review restores
normal art. The scale/pin experiment is not saved and does not change Gameplay.

The test reuses accepted Oasis ground textures, paved public courts, streets,
shadows and entrance treatments instead of the thin fallback roads. This is an
explicit comparison-only branch for unsupported profiles/layouts. Actual scenery
eligibility is unchanged; actual Levels 24/26 are still not enabled.

Empty sites use original small stake-and-teal-banner pins rather than green
diamonds. Visible pin viewport is 16×26px; the independent target remains at
least 44px on phone. Plot outlines are shown on hover, keyboard focus,
selection or the Sites placement-review control. Default town plots have not
been replaced outside the experiment.

Actual phone Ideal 50 comparison, same camera and positions:

| Current 100% | Test 80% | Test 65% |
| --- | --- | --- |
| ![Phone 100 percent](../../evidence/2026-10-13-ui-scale-study/headless-2026-10-12T23-35-39-162Z/comparison-phone-ideal50-size100.png) | ![Phone 80 percent](../../evidence/2026-10-13-ui-scale-study/headless-2026-10-12T23-35-39-162Z/comparison-phone-ideal50-size80.png) | ![Phone 65 percent](../../evidence/2026-10-13-ui-scale-study/headless-2026-10-12T23-35-39-162Z/comparison-phone-ideal50-size65.png) |

Desktop Ideal 50 comparison below is **offline**, not browser UI proof.
It uses the real captured camera and anchors and the existing render functions.
The browser's desktop trio was blocked by the header defect in the first pass.

| Current 100% offline | Test 80% offline | Test 65% offline |
| --- | --- | --- |
| ![Desktop offline 100 percent](../../evidence/2026-10-13-ui-scale-study/offline-captured-desktop-2026-10-12T23-56-58-357Z/offline-desktop-ideal50-size100.png) | ![Desktop offline 80 percent](../../evidence/2026-10-13-ui-scale-study/offline-captured-desktop-2026-10-12T23-56-58-357Z/offline-desktop-ideal50-size80.png) | ![Desktop offline 65 percent](../../evidence/2026-10-13-ui-scale-study/offline-captured-desktop-2026-10-12T23-56-58-357Z/offline-desktop-ideal50-size65.png) |

80% gives the streets and courts more breathing room while retaining more roof,
tool and courtyard detail than 65%. At phone Fit, 65% makes the small industrial
props hard to distinguish. Some early wooden workshop types already have similar
silhouettes even at 100%; scale alone cannot fix that. Keep hover names and review
distinctive silhouettes later rather than claiming all types are obvious.

All 30 active types at three sizes, with full source crops, are in these
**offline contact sheets**:
[Level 1](../../evidence/2026-10-13-ui-scale-study/offline-contact-sheets-2026-10-12T23-42-14-059Z/all30-level1-100-80-65.png),
[Level 25](../../evidence/2026-10-13-ui-scale-study/offline-contact-sheets-2026-10-12T23-42-14-059Z/all30-level25-100-80-65.png),
[Level 50](../../evidence/2026-10-13-ui-scale-study/offline-contact-sheets-2026-10-12T23-42-14-059Z/all30-level50-100-80-65.png).

## Canyon proposal

Four desktop/phone start/50 paint-overs and the timber/adobe/sandstone specification:
[Canyon defence study](../ideas/CANYON_DEFENCES_STUDY.md).
Recommend the same rear pass, with an asymmetric left shoulder, rock-embedded
ends, two grounded towers and an open gate road. No new wall art or canyon change
has been installed. The real starting wall remains unbuilt.

## Verification and remaining checks

One isolated headless pass produced 27 actual screenshots and closed its owned
browser/server. No visible Chrome or Owner browser profile was opened.
Sidebar width/split, normal Gameplay, desktop wheel/World controls, repeated
Town-tab Fit, phone same-camera comparisons and a ten-second legacy queue
byte/deadline check passed. Captured phone comparison targets are at least
44px, non-overlapping and exposed.

The first pass **did not pass as a whole**. Its Appearance header covered
desktop controls and displaced one desktop target by 48px. The higher-specificity
header is now a standalone absolute 44px Close button; the game spatial data
was not moved. The phone toast and remaining player-panel developer wording
were also repaired afterward. Those final fixes have static checks only,
not final-source browser acceptance.

Native pinch, compact/MAX review, full outline interactions and the paid queue
review/exit/reload check remain unverified. A short second headless verification
runner is prepared but not launched; fresh Owner permission is required because
the single approved pass is spent. The old failed receipt is preserved.

Integrity checks pass 26 unchanged model/queue functions, eight storage/timing
constants, seven model/anchor sets and nine JavaScript parsers. Pure rendering
checks pass 60 normal Oasis equivalence cases, 120 scale/camera/anchor cases and
270 identity/crop cases. The guard checks 1,640 protected records. No plot IDs,
five layouts, fixed-role anchors, saves, queues, current wall art, old evidence,
native files or Sites staging changed.

Full receipts, exact source hashes and limitations:
[QA summary](../../evidence/2026-10-13-ui-scale-study/QA_SUMMARY.md).

## Files and rollback

Runtime edits are limited to eight existing files:
`prototype/index.html`, `desktop.css`, `styles.css`, `atlas.js`, `atlas.css`,
`app.js`, `oasis-town.js` and `building-art.css`. `preview.html` was snapshotted
but was unchanged during the local review. Publication later refreshes its
iframe cache token. No new runtime library or engine is introduced.

Documentation adds this review, the canyon proposal/provenance and DEC-087;
README, status and AGENTS describe the local-only stop. Tests, source snapshots
and screenshots live in `evidence/2026-10-13-ui-scale-study/`.

To undo this local round, restore only the eight changed runtime files from
[before-source](../../evidence/2026-10-13-ui-scale-study/before-source/) after checking
for newer Owner edits. Retain evidence and mark the documentation as superseded;
do not reset the repository, clear browser saves, remove old art or roll back
unrelated work. Web21 is retained as the saved-version rollback target for
the later web22 delivery; consult the publication record for hosting rollback.

Stop for Owner visual review. No default scale, canyon integration, Levels24/26
or native update is approved by this report. DEC-088 separately authorized
publication of implemented Parts1/2 only.
