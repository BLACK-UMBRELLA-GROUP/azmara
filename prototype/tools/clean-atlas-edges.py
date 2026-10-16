"""User-authorized, alpha-only cleanup of exact low-alpha atlas matte noise.

Never modifies originals, dimensions, RGB channels, warm paint, or alpha > 8.
Run with the bundled Python (Pillow + NumPy). No image generation or API calls.
"""
from argparse import ArgumentParser
from collections import deque
from hashlib import sha256
import json
from pathlib import Path

import numpy as np
from PIL import Image


TYPES = (
    "academy", "warehouse", "provision-house", "palace", "governors-residence",
    "museum", "embassy", "prayer-area", "trading-port", "trading-post", "depot",
    "military-exchange", "sea-chart-archive", "dockyard", "intelligence-house",
    "shipyard", "barracks", "town-wall", "workshop", "foresters-house",
    "silver-refinery", "iron-foundry", "grain-estate", "clayworks",
    "carpenters-workshop", "precision-workshop", "materials-workshop",
    "grain-store", "architects-office", "chronos-forge",
)
MATTE_COLORS = {"red": (255, 0, 0), "yellow": (255, 255, 0)}


def digest(path):
    return sha256(path.read_bytes()).hexdigest()


def eligible_mask(rgba):
    height, width, _ = rgba.shape
    alpha = rgba[:, :, 3]
    masks = {
        name: np.all(rgba[:, :, :3] == rgb, axis=2) & (alpha > 0) & (alpha <= 8)
        for name, rgb in MATTE_COLORS.items()
    }
    candidate = np.logical_or.reduce(list(masks.values())).ravel()
    low = (alpha <= 8).ravel()
    exterior = bytearray(width * height)
    queue = deque()

    def seed(index):
        if low[index] and not exterior[index]:
            exterior[index] = 1
            queue.append(index)

    for x in range(width):
        seed(x)
        seed((height - 1) * width + x)
    for y in range(1, height - 1):
        seed(y * width)
        seed(y * width + width - 1)
    while queue:
        index = queue.popleft()
        x = index % width
        if x:
            seed(index - 1)
        if x + 1 < width:
            seed(index + 1)
        if index >= width:
            seed(index - width)
        if index + width < len(exterior):
            seed(index + width)

    visited = bytearray(len(exterior))
    selected = np.zeros(len(exterior), dtype=bool)
    alpha_flat = alpha.ravel()
    for root in np.flatnonzero(candidate):
        root = int(root)
        if visited[root]:
            continue
        visited[root] = 1
        queue.append(root)
        component = []
        touches_exterior = False
        touches_paint = False
        while queue:
            index = queue.popleft()
            component.append(index)
            x, y = index % width, index // width
            touches_exterior |= bool(exterior[index])
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    if not (dx or dy):
                        continue
                    nx, ny = x + dx, y + dy
                    if not (0 <= nx < width and 0 <= ny < height):
                        touches_exterior = True
                        continue
                    neighbor = ny * width + nx
                    touches_exterior |= bool(exterior[neighbor])
                    if candidate[neighbor]:
                        if not visited[neighbor]:
                            visited[neighbor] = 1
                            queue.append(neighbor)
                    elif alpha_flat[neighbor] > 8:
                        touches_paint = True
        if touches_exterior or not touches_paint:
            selected[component] = True
    selected = selected.reshape(height, width)
    counts = {
        name: {
            "candidates": int(mask.sum()),
            "cleared": int((mask & selected).sum()),
            "protected": int((mask & ~selected).sum()),
        }
        for name, mask in masks.items()
    }
    return selected, counts


def clean(type_id, source, destination):
    original_hash = digest(source)
    with Image.open(source) as image:
        assert image.mode == "RGBA", f"Expected native RGBA: {source}"
        rgba = np.array(image)
    selected, counts = eligible_mask(rgba)
    edited = rgba.copy()
    edited[:, :, 3][selected] = 0
    assert np.array_equal(edited[:, :, :3], rgba[:, :, :3]), "RGB changed"
    assert np.array_equal(edited[~selected], rgba[~selected]), "Noncandidate pixel changed"
    assert np.array_equal(edited[rgba[:, :, 3] > 8], rgba[rgba[:, :, 3] > 8]), "Paint changed"
    # The gate depends on alpha <=8, unchanged by this operation. This is idempotent.
    second_selected, _ = eligible_mask(edited)
    assert not second_selected.any(), "Cleanup is not idempotent"
    if destination.exists():
        with Image.open(destination) as image:
            assert image.mode == "RGBA" and np.array_equal(np.array(image), edited), \
                f"Refusing to overwrite a different existing asset: {destination}"
    else:
        Image.fromarray(edited, "RGBA").save(destination)
    with Image.open(destination) as image:
        assert image.mode == "RGBA" and np.array_equal(np.array(image), edited), "Output verification failed"
    assert digest(source) == original_hash, "Original file changed"
    return {
        "typeId": type_id, "source": source.name, "runtime": destination.name,
        "width": int(rgba.shape[1]), "height": int(rgba.shape[0]),
        "sourceSha256": original_hash, "runtimeSha256": digest(destination),
        "mattePixels": counts, "changedPixels": int(selected.sum()),
        "originalPreserved": True, "noncandidateRgbaUnchanged": True,
        "allRgbUnchanged": True, "alphaAbove8Unchanged": True, "idempotent": True,
    }


def main():
    parser = ArgumentParser(description=__doc__)
    parser.add_argument("--asset-dir", type=Path, required=True)
    parser.add_argument("--report", type=Path, required=True)
    parser.add_argument("--types", nargs="+", choices=TYPES, default=list(TYPES))
    parser.add_argument("--source", action="append", default=[], metavar="TYPE=FILENAME")
    args = parser.parse_args()
    asset_dir = args.asset_dir.resolve(strict=True)
    overrides = {}
    for value in args.source:
        type_id, filename = value.split("=", 1)
        assert type_id in TYPES and Path(filename).name == filename and filename.endswith(".png")
        overrides[type_id] = filename
    files = []
    for type_id in args.types:
        source = asset_dir / overrides.get(type_id, f"azmara-{type_id}-stages-v1.png")
        destination = asset_dir / f"azmara-{type_id}-stages-v2.png"
        assert source != destination and source.resolve(strict=True).parent == asset_dir
        result = clean(type_id, source, destination)
        files.append(result)
        print(f"PASS {type_id}: {result['changedPixels']} fringe pixels cleared; body/RGB/original unchanged", flush=True)
    report = {
        "authority": "Founder explicitly approved edge-only local pixel cleanup, 10 October 2026",
        "method": "Exact RGB red(255,0,0) or yellow(255,255,0), alpha1–8 only. Four-connected exterior flood through alpha<=8; eight-connected candidate components clear only if exterior-adjacent or isolated from noncandidate alpha>8 paint. Set only selected alpha to0.",
        "scope": "30 nonHall generated atlases only; Hall and terrain never selected",
        "files": files, "totalChangedPixels": sum(item["changedPixels"] for item in files),
    }
    args.report.write_text(json.dumps(report, indent=2) + "\n")


if __name__ == "__main__":
    main()
