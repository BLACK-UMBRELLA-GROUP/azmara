# Full-bleed oasis private web delivery

15 October 2026 (Europe/London). DEC-097. Version28 is confirmed live at
[azmara.app](https://azmara.app), with the same custom owner-only access: one
owner, no groups and no external visitors. No browser or native app was opened.

## Repair

- Removed the foundation's desktop `x=300`, `width=3600` inset rectangle.
- Registered the painting to the full desktop art plane: `x=0`, `y=0`,
  `width=4200`, `height=2400`.
- Used centred `xMidYMid slice` cropping to fill edge-to-edge without stretching.
- Changed only `app.js` and `index.html`; the latter supplies a fresh cache key.
- HUD, dock, current wall, buildings, click areas, saves, queues, layouts,
  gameplay rules, native app and held Levels24/26 are unchanged.

## Provenance

- Pushed source: `0c545620bde3328eda6efdc985421816e776485f`.
- Saved version28:
  `appgprj_6ac7643d3f588191ba2157dfe1972c3d~appgver_009626dc44d88191ac3ee9c1f11b0472`.
- Deployment: `appgdep_6ad0c024f15881919c2b957815edfe1b`, terminal
  `succeeded`.
- Custom live URL: `https://azmara.app`.
- Archive:
  `/LOCAL_TEMP_PATH`.
- Archive SHA256:
  `1ebe44008c57c9109657f7a2fa68c8bf3d4c39e24f3e7f285a4ea14e773a2e29`.
- Runtime files:114; hosting manifest unchanged.

## Verification and rollback

The exact centred1536×878 cover crop was rendered from the source painting and
inspected locally. JavaScript parsing, full-art-plane assertions, byte-exact
staging, archive content and cache-key checks passed. Sites returned terminal
success and fresh metadata confirms version28 with the unchanged audience.

The standing no-auto-Chrome rule means live visual, click, touch, Fit and zoom
acceptance remain manual. Web27 remains the immediate rollback version:
`appgprj_6ac7643d3f588191ba2157dfe1972c3d~appgver_3f7bfa411600819190b89bff1d5b60c0`,
source `e4cf8dedc609110976a47fe7e9e2af088272dde6`. Redeploy it only if requested;
do not clear browser storage.
