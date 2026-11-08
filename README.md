# AZMARA

AZMARA is an original strategy-game project about building a settlement, developing its economy, trading and navigating conflict in a fictional world inspired by Abbasid-era Baghdad and its golden age. AZMARA is a provisional name; final branding and name clearance remain open.

The intended direction is a mobile-first, persistent multiplayer game for iOS, Android and web browsers. The precise audience, daily play pattern and production technology are still being defined.

This repository currently contains a town-screen visual and interaction prototype, project documentation and a separate Flutter iPhone preview shell. The prototype demonstrates Town, Region and World navigation, a building catalogue, local town saves and development review controls. Its sample resources, costs and timers do not establish game balance. Live resource simulation, multiplayer, game accounts, server persistence, anti-cheat and store integration are not implemented.

Feature development is paused while the Founder's first product (ZYRA) reaches launch; review, documentation and individually approved fixes continue, and new features start from locked designs when the pause is lifted.

## Run the browser prototype

From the repository root, with Python 3 available:

```sh
python3 -m http.server 4317 --bind 127.0.0.1 --directory prototype
```

Open `http://127.0.0.1:4317/` manually in your browser. The review switch is at `http://127.0.0.1:4317/preview.html`. The loopback binding serves this computer only.

The browser runtime uses vanilla JavaScript, HTML, CSS, SVG landscapes and pre-rendered PNG sprites. It has no production game engine or backend dependency. See [prototype/README.md](prototype/README.md) for controls, local saves, review modes and known limits.

With Node.js available, run the static land-stage check from the repository root:

```sh
node prototype/tests/land-stages.cjs
```

It checks stage selection, input boundaries and the checked-in land images without starting a browser or installing packages.

With Python 3, Pillow and NumPy already available, check the atlas crop inspector:

```sh
python3 -B prototype/tests/test_land_atlas_inspection.py
```

These tests use PNGs held in memory to check crop ordering, alpha and prop-size boundaries, edge padding and foreign-paint diagnostics. They do not read or modify game artwork.

With the same Python dependencies, check the atlas edge cleaner's pixel-selection rules:

```sh
python3 -B prototype/tests/test_atlas_edge_cleanup.py
```

The in-memory fixtures check exact matte colors and alpha limits, exterior connectivity, enclosed-paint protection and repeat-cleaning stability. They do not run the file-writing cleaner or access game artwork.

## Optional iPhone preview shell

The separate Flutter shell bundles the browser prototype in a WKWebView. It is a local preview, not the selected production architecture. Its Dart constraint is `^3.12.2`; the mobile guide documents Flutter 3.44.2 as checked on 17 October 2026. Package versions remain defined by [mobile/pubspec.yaml](mobile/pubspec.yaml) and its lockfile.

With the documented Dart and Flutter tools available on your `PATH`, refresh the allowlisted bundled runtime from the repository root:

```sh
dart mobile/tool/sync_game.dart
```

Then run the documented checks from `mobile/`:

```sh
cd mobile
flutter pub get
flutter analyze
flutter test
```

Signing, installation, launch and updates use the separate approved workflow in [mobile/README.md](mobile/README.md). Native progress is separate from browser progress. Preserve existing app data during updates.

## Repository guide

| Path | Purpose |
|---|---|
| [prototype/](prototype/README.md) | Canonical browser runtime and original visual assets |
| [mobile/](mobile/README.md) | Flutter iPhone preview shell and runtime-bundling tool |
| [docs/CONCEPT.md](docs/CONCEPT.md) | Product direction and unresolved game rules |
| [docs/approved/](docs/approved/BUILD_QUEUE.md) | Locked material and the implementation queue |
| [docs/ideas/](docs/ideas/BACKLOG.md) | Proposals and reference research, with their approval states |
| [docs/architecture/](docs/architecture/OPEN_QUESTIONS.md) | Open production and delivery choices |
| [docs/implemented/](docs/implemented/STATUS.md) | Recorded implementation and verification evidence |
| [ROADMAP.md](ROADMAP.md) | Estimated future review and specification work |
| [AGENTS.md](AGENTS.md), [MAP.md](MAP.md) | Standing contributor rules and routes to canonical documents |

Edit canonical prototype assets rather than generated mobile copies. Hosting delivery is managed separately; a local change does not update a hosted or installed preview.

## Design and contribution workflow

The Founder, Shakeel Ahmad, approves scope. The AZMARA design lead records a design only after an explicit `LOCK`, including the actual screens, states, specification and the Founder's words. The design lead then adds its build brief to [docs/approved/BUILD_QUEUE.md](docs/approved/BUILD_QUEUE.md). Codex implements from that locked material after the applicable holds are lifted, records checks and hands over the result.

Ideas, roadmaps and research do not authorise implementation. Questions go beside the queue in [docs/approved/QUESTIONS.md](docs/approved/QUESTIONS.md) and the affected line waits for an answer. Preserve existing saves, plot identities and approved assets. Follow [AGENTS.md](AGENTS.md) before working in the repository; automated browser runs require fresh explicit permission.

Use reference games to study high-level player needs. Do not copy their code, artwork, text, maps, branding or game datasets. Keep observed research, inferences and original proposals distinct.

## Licence

Copyright © 2026 Shakeel Ahmad. The repository's licensed material is provided under [Apache License 2.0](LICENSE). The AZMARA name, logos and domains are excluded from the licence; no trademark or branding rights are granted.
