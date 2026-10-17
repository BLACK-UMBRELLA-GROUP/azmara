# AZMARA local iPhone prototype

Authority: `DEC-039`. This independent Flutter/WKWebView shell packages the
existing original browser demonstration. It is not the production engine,
a public store release, multiplayer backend or a ZYRA client.

## Identity and source

- Display name: AZMARA; provisional local bundle ID:
  `com.shakeelahmad.azmara.preview`; first version `0.1.0+1`, current `0.1.0+3`.
- Existing authorised Apple development team: `9Y7Z8F36SJ`. Development
  provisioning is for AZMARA's separate identity, never a copied ZYRA profile.
- `../prototype/` remains the canonical game source. Generated `assets/game/`
  contains only the allowlisted current runtime closure plus the native save
  bootstrap. Do not edit the generated copy or include historical assets.
- `tool/render_icon.swift` generates an original provisional A-monogram from
  code. Its opaque PNGs replace the scaffold's Flutter icon; final branding
  remains unresolved.
- `lib/native_frame.dart` paints the game edge-to-edge beneath the iPhone's
  status and home-indicator areas. Only native loading/error controls use
  Flutter SafeArea; the bundled page's CSS safe-area offsets protect game UI.

## Build and install

Installed toolchain checked 17 October 2026: Flutter 3.44.2 / Dart 3.12.2,
Xcode 27.1, CocoaPods 1.16.2. Source pins/lockfile are the authority
for package versions. Run from the canonical project root:

```sh
/opt/homebrew/bin/dart mobile/tool/sync_game.dart
```

Then from `mobile/`:

```sh
/opt/homebrew/bin/flutter pub get
/opt/homebrew/bin/flutter analyze
/opt/homebrew/bin/flutter test
/opt/homebrew/bin/flutter build ios --profile --no-pub --dart-define=AZMARA_DEVICE_AUDIT=true
```

The signed Flutter command can perform automatic development provisioning
and device registration. This is within DEC-039 for the separate AZMARA local
prototype only. Do not use it for a new account/team or store distribution.
For an explicitly no-provisioning build, use `--no-codesign`, then the approved
direct Xcode signing workflow with compatible existing AZMARA assets.

Before delivery, verify the exact artifact's bundle/name/version/build,
strict deep signature, team, profile expiry and authorised device membership.
Recheck phone availability/lock. Use these commands with the verified actual
device ID and absolute artifact path; save non-secret receipts separately:

```sh
xcrun devicectl device info lockState --device DEVICE_ID --timeout 30
xcrun devicectl device install app --device DEVICE_ID /ABSOLUTE/AZMARA/mobile/build/ios/iphoneos/Runner.app --timeout 60
xcrun devicectl device process launch --device DEVICE_ID --timeout 30 com.shakeelahmad.azmara.preview
xcrun devicectl device info apps --device DEVICE_ID --bundle-id com.shakeelahmad.azmara.preview --timeout 30
```

**Do not use `flutter install` for updates**: the installed Flutter command
defaults to uninstalling the prior app, which can erase its data. Install in
place with `devicectl`; never intentionally uninstall or clear storage without
the Founder's approval. A web Site update does not update this bundled app.

## Saves and verification

Native progress is separate from Safari, localhost and the private Site.
Only the v3 town-layout save is mirrored into the app's native preferences;
hydrate it before starting unchanged `app.js`. Keep malformed native state
recoverable rather than overwriting it with a fresh town. Do not put real
credentials or member data into the bridge. Uninstalling may erase app data;
native save storage is not a cloud backup or cross-platform account.

Installation/native process evidence is distinct from game runtime checks
and Founder acceptance. Actual device verification should include:

- Bundled launch without Site sign-in, network or a running Mac; all artwork.
- Fresh state: 23 plots, Hall level 1, 22 empty; Fit/Close and plot selection.
- Finger scrolling/pinch, menu/dialog dismissal, rename keyboard, rotation
  and notch/home-indicator safe areas.
- Rename/upgrade, background completion, force quit/relaunch and an in-place
  second-build install retaining the same native save. Phone reboot and genuine
  offline/cold-launch acceptance should be checked by the Founder if not tested.
- No arbitrary remote navigation or general-purpose native commands.

Actual dated results and remaining gaps are recorded in
[`../docs/implemented/STATUS.md`](../docs/implemented/STATUS.md), not inferred
from these commands. No TestFlight/App Store upload is authorised here.
