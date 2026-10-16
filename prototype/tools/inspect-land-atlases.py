"""Read-only native-alpha crop registration for original land-trade atlases."""
from array import array
from collections import deque
from pathlib import Path
import json
import numpy as np
from PIL import Image


def inspect(source):
    with Image.open(source) as image:
        rgba = np.array(image)
        width, height = image.size
        assert image.mode == "RGBA"
    paint = (rgba[:, :, 3] > 30).ravel().tobytes()
    labels = array("i", [0]) * len(paint)
    components = []
    for index, on in enumerate(paint):
        if not on or labels[index]:
            continue
        label_id = len(components) + 1
        queue = deque([index])
        labels[index] = label_id
        count, left, top, right, bottom = 0, width, height, 0, 0
        while queue:
            pixel = queue.popleft()
            x, y = pixel % width, pixel // width
            count += 1
            left, top = min(left, x), min(top, y)
            right, bottom = max(right, x), max(bottom, y)
            neighbors = (pixel - 1 if x else -1, pixel + 1 if x < width - 1 else -1,
                         pixel - width if y else -1, pixel + width if y < height - 1 else -1)
            for neighbor in neighbors:
                if neighbor >= 0 and paint[neighbor] and not labels[neighbor]:
                    labels[neighbor] = label_id
                    queue.append(neighbor)
        components.append(dict(id=label_id, count=count, left=left, top=top, right=right, bottom=bottom))
    bodies = sorted(components, key=lambda component: component["count"], reverse=True)[:12]
    bodies.sort(key=lambda component: component["top"] + component["bottom"])
    for row in range(3):
        bodies[row * 4:row * 4 + 4] = sorted(bodies[row * 4:row * 4 + 4], key=lambda component: component["left"] + component["right"])
    assert len(bodies) == 12 and min(body["count"] for body in bodies) > 1000
    owners = {
        component["id"]: min(range(12), key=lambda index:
            (component["left"] + component["right"] - bodies[index]["left"] - bodies[index]["right"]) ** 2 +
            (component["top"] + component["bottom"] - bodies[index]["top"] - bodies[index]["bottom"]) ** 2)
        for component in components
    }
    labels = np.array(labels).reshape(height, width)
    rectangles, diagnostics = [], []
    for cell in range(11):
        owned = [component for component in components if owners[component["id"]] == cell and component["count"] >= 30]
        body_left = min(component["left"] for component in owned)
        body_top = min(component["top"] for component in owned)
        body_right = max(component["right"] for component in owned) + 1
        body_bottom = max(component["bottom"] for component in owned) + 1
        accepted = None
        for padding in range(5, -1, -1):
            x, y = max(0, body_left - padding), max(0, body_top - padding)
            right, bottom = min(width, body_right + padding), min(height, body_bottom + padding)
            crop = labels[y:bottom, x:right]
            foreign_components = [int(component) for component in np.unique(crop) if component and owners[int(component)] != cell]
            foreign = sum(int((crop == component).sum()) for component in foreign_components)
            if not foreign:
                accepted = [x, y, right - x, bottom - y]
                diagnostics.append(dict(cell=cell, padding=padding, fullBody=True, fullProps=True, foreignPixels=0))
                break
        if accepted is None:
            diagnostics.append(dict(cell=cell, error="foreign paint overlaps full-body bounds", foreignComponents=[components[component - 1] for component in foreign_components], body=[body_left, body_top, body_right, body_bottom]))
        rectangles.append(accepted)
    return dict(source=str(source), width=width, height=height, rects=rectangles, diagnostics=diagnostics,
                corners=[int(rgba[y, x, 3]) for x, y in ((0, 0), (width - 1, 0), (0, height - 1), (width - 1, height - 1))],
                majorBodies=[body["count"] for body in bodies])


if __name__ == "__main__":
    import sys
    for filename in sys.argv[1:]:
        print(json.dumps(inspect(Path(filename))))
