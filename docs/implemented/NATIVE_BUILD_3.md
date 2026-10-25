---
id: DOC-AZM-0004
type: REPORT
status: CURRENT
feature: BUILT AND DELIVERED
purpose: AZMARA iPhone build 3
links: []
owner: AZMARA chat
---

# AZMARA iPhone build 3

17 October 2026 (Europe/London). DEC-101.

## Prepared app

- Display name: AZMARA.
- Bundle ID: `com.shakeelahmad.azmara.preview`.
- Version/build: `0.1.0 (3)`.
- Signing team: `9Y7Z8F36SJ`.
- Minimum iOS: 15.0.
- Signed artifact:
  `mobile/build/ios/iphoneos/Runner.app` (145.3 MB).
- The development profile includes the paired iPhone and expires on
  9 October 2027. Strict/deep signature verification passes.

The native package uses the same deterministic web-runtime manifest: 76 game
files plus the native save bridge, exactly 77 files and byte-identical to the
generated bundle (122,244,404 bytes). It includes all eleven locked land
stages, compact atlas/Options repairs, active building art and the Shipyard
compatibility atlas for older saves.

## Save and startup compatibility

The native bridge now accepts the current level 1–50 town schema, optional
unbuilt Hall, up to 22 placed buildings, all five plot layouts, current two-
minute paid construction jobs and valid older ten-second Hall jobs. Optional
future metadata is normalised like the web loader while building shape, role,
level and paid-cost checks remain strict. Startup checks the real saved
occupancy and sequentially decodes its active building atlases, the selected
locked land stage and HTML images before reporting ready. It still fails closed
on malformed data and does not repair or clear it.

Fourteen native JavaScript tests and 53 Flutter tests pass; Flutter analysis is
clean. Packaging verifies the exact manifest, no extras, the app identity,
build number, signature, profile expiry and device membership.

## Installation status and rollback

The paired iPhone was unavailable during packaging, so no device was modified.
The signed build is ready for an in-place install when that same phone is
available and unlocked. Never uninstall the existing app and never use a path
that clears its native save. The prior build-2 source remains in Git history;
the phone's currently installed data is untouched. The quiet
`finish-azmara-iphone-install` heartbeat checks every 15 minutes, remains silent
while the phone is unavailable or locked, and may only verify and install this
exact build in place before disabling itself.
