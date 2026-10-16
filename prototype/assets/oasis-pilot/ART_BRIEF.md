# Oasis Town — bounded endpoint pilot

Original AZMARA presentation experiment, 11 October 2026, DEC-072. This is
not approved final art, the full 40-ground-plate rollout, a wall repair, an
animation implementation, or a published/native update.

## Provenance

Three built-in ImageGen calls, one attempt per output. Maximum permitted
attempts was two per image; no local pixel edits, resampling or cleanup were
performed. Runtime copies are byte-exact. Exact prompts are retained in
`generation-prompts.json`.

Start generation used only AZMARA's existing
`../progression/azmara-hall-level-50.png` to guide camera/material/light, not
another game's image. Mature generation edited only the newly generated start
ground. Street material was generated independently without an image input.
No Ikariam art or screenshots were input to generation.

All originals are below
`<LOCAL_HOME>/.codex/generated_images/01a110d7-7840-71d3-b4bb-ec945e585d0b/`:

| Runtime file | Original filename | Pixels | Bytes | SHA-256 |
| --- | --- | --- | ---: | --- |
| ground-start-v1.png | exec-742b8cff-1952-48be-9990-04019e68e084.png | 1660×948 | 3,085,122 | 3250671e339578a356de3c6a3d0e2b9d49fea477f1738637b5f058cef96603c0 |
| ground-mature-v1.png | exec-fdde70a3-5d8c-4da2-8126-01d2227ef132.png | 1659×948 | 2,749,149 | 11fb1a3c7808096c9604573aa2eb7bc7894cc09631084b5fdfce5bfc4778f29a |
| street-stone-v1.png | exec-be1d15d2-f059-4a45-94df-6dcc02933e2b.png | 1254×1254 | 3,194,029 | 3bcb58a3344f8189da27d8ff535c46689280a4a8ada11d1137a9c9f94dae7674 |

## Registration and ownership

- Ground is uniformly cover-cropped (`xMidYMid slice`) into world rectangle
  `(0,0,4200,2400)`, not stretched independently on X/Y. Its outside edge is
  feathered into a same-density central-soil crop covering camera margins.
- The mature stone sample uses a uniform 300×300 world-unit repeat.
  Shared public floors, soft edges, contact aprons and local cosmetic streets
  are composed from live projected plot rectangles, rather than baked into
  guessed building positions. These are presentation geometry, not collision,
  navigation or functional infrastructure.
- Ground contains no buildings, owned plots, walls, streets, fountains or
  baked palms. Existing building pixels and the existing checked scenery atlas
  survive; scenery crops are explicitly clipped, uniformly scaled and placed
  only in available pockets. No rills, rivers or navigable water are present.
- Existing wall art/source/depth/control/camera logic stays unchanged. Its
  known tower/gate/phone deficiencies are deliberately not repaired here.
- Both endpoint ground images are deliberately static. Ambient details and
  authored per-building doorway/baseline calibration remain later work.

## Memory and scope limits

The three PNGs total 9,028,300 bytes (about 8.61 MiB compressed). Their combined
RGBA pixel storage alone is 18,875,712 bytes (about 18.00 MiB), excluding texture
copies, caches, SVG surfaces and existing atlases. This is not measured process
RAM, a phone performance pass, or shipping compression. The pilot does not
request these images on compact views or unsupported layouts/levels. A desktop
session visiting both endpoints can retain both plates in its image cache.

The recommended phone budget in the direction study remains a future export/
current-stage loading task. Do not ship these desktop source PNGs to phone as
proof that that budget has been met.

## Rollback

`evidence/2026-10-11-oasis-pilot/before-source/` holds the four prior wiring
files, recovered from the untouched hosted staging copy and verified against
the pre-pilot hash receipt before copying. Restore only those specific
`app.js`, `styles.css`, `progression.js`, `index.html` files, then stop loading
the new `oasis-town.js` module/assets. No saves or queue migration/reset is
needed. Preserve these pilot sources/evidence for comparison. Do not use a
whole-repository reset or overwrite unrelated later edits.
