# Original illustrated wall — v19 draft, not Step 5 completion

11 October 2026. Implemented under DEC-069; draft publication requested under
DEC-070. Cohesive ImageGen PNGs are rendered twice at one uniform registration,
with complementary back/front clip masks. Masks do not draw wall faces. No
local pixel cleanup, warp, repeated-piece assembly or source overwrite was used.
The existing terrain and v18 wall remain unchanged for rollback.

Generated originals are preserved under
`<LOCAL_HOME>/.codex/generated_images/01a110d7-7840-71d3-b4bb-ec945e585d0b/`.
New runtime copies are byte-exact. Native dimensions are desktop1536×1024 and
compact1024×1536. Exact hashes and all 102 wall-level/profile checks are in
`evidence/2026-10-11-wall-build/publish-runtime-audit.json` at the project root.

| Runtime asset | Original filename |
| --- | --- |
| town-wall-desktop-timber-v19.png | exec-282e2f51-9d90-4056-80dc-3645aee05fde.png |
| town-wall-desktop-adobe-v19.png | exec-66875318-7099-4000-8daf-fe30c1da1932.png |
| town-wall-desktop-sandstone-v19.png | exec-bbe0db62-1182-4390-b9b5-b80a17cfc3e1.png |
| town-wall-compact-timber-v19.png | exec-51712d04-5917-47fe-8b75-266ad8a9816f.png |
| town-wall-compact-adobe-v19.png | exec-39e05ffd-23e0-4924-8dd3-6d05d3932dd7.png |
| town-wall-compact-sandstone-v19.png | exec-f49a7b41-816f-483a-8e0e-6350d20df823.png |

The art brief requested the approved open-rear U route, upper-left lighting,
small coherent dimensional towers/gate, timber1–10, adobe11–32 and sandstone
33–50, and transparent empty ground. Material edits requested preservation of
ground registration and removal of distant low-alpha haze. The generator did
not meet every constraint: visible tower count exceeds the proposed six,
heights/registration are approximate and very faint transparency fringe remains.
Rejected oversized first candidates and two unselected sandstone cleanup edits
were not copied into the published runtime.

Root opened all six selected source images and desktop/phone material captures.
The PNG centre is genuinely alpha0; the brown backing in a direct image viewer
is not an opaque background. Source alpha bounds are recorded in town-wall.js.
The phone remains cramped, with overlapping targets and excess foreground at
Fit; gate hit-area alignment and full maximum-zoom acceptance are unfinished.
No assertion that Step 5 is complete, the six-tower spec is satisfied, or art
has Founder acceptance is made. This wall is cosmetic, not collision/defence.

Rollback source copies: `evidence/2026-10-11-wall-build/before-source/`.
Private Site version18 is retained independently; no native sync/build occurred.
