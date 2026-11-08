"""Memory-only regression tests for the atlas matte-selection contract.

No real atlas is opened or changed. Pillow fixtures, NumPy arrays and the
simulated alpha removal remain in memory; the cleaner's file/CLI entry points
are never called.
"""

import importlib.util
from pathlib import Path
import unittest

import numpy as np
from PIL import Image


SOURCE = Path(__file__).resolve().parents[1] / "tools" / "clean-atlas-edges.py"
SPEC = importlib.util.spec_from_file_location("atlas_edge_cleanup", SOURCE)
CLEANER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(CLEANER)

PAINT = (42, 80, 120, 255)
CLEAR = (0, 0, 0, 0)
RED = (255, 0, 0, 8)
YELLOW = (255, 255, 0, 8)


def rgba(size, pixels, background=PAINT):
    """Build an owned image in memory from explicit (x, y) pixel positions."""
    with Image.new("RGBA", size, background) as image:
        for position, color in pixels.items():
            image.putpixel(position, color)
        return np.array(image)


class AtlasEdgeCleanupTests(unittest.TestCase):
    def assert_selection(self, image, positions, counts):
        before = image.copy()
        selected, actual_counts = CLEANER.eligible_mask(image)
        expected = np.zeros(image.shape[:2], dtype=bool)
        for x, y in positions:
            expected[y, x] = True
        np.testing.assert_array_equal(selected, expected)
        np.testing.assert_array_equal(image, before)
        self.assertEqual(selected.dtype, np.dtype(bool))
        self.assertEqual(actual_counts, counts)
        return selected

    def test_only_exact_matte_rgb_with_alpha_one_through_eight_is_eligible(self):
        image = rgba((9, 1), {
            (0, 0): (255, 0, 0, 1),
            (1, 0): RED,
            (2, 0): (255, 255, 0, 1),
            (3, 0): YELLOW,
            (4, 0): (255, 0, 0, 0),
            (5, 0): (255, 255, 0, 9),
            (6, 0): (254, 0, 0, 8),
            (7, 0): (255, 100, 0, 8),
            (8, 0): (255, 0, 0, 255),
        })
        self.assert_selection(image, {(0, 0), (1, 0), (2, 0), (3, 0)}, {
            "red": {"candidates": 2, "cleared": 2, "protected": 0},
            "yellow": {"candidates": 2, "cleared": 2, "protected": 0},
        })

    def test_enclosed_matte_touching_paint_is_protected(self):
        image = rgba((7, 7), {(3, 3): RED, (4, 3): YELLOW})
        self.assert_selection(image, set(), {
            "red": {"candidates": 1, "cleared": 0, "protected": 1},
            "yellow": {"candidates": 1, "cleared": 0, "protected": 1},
        })

    def test_exterior_flood_needs_a_four_connected_low_alpha_path(self):
        # The transparent diagonal reaches toward the edge, but cannot carry
        # the exterior flood across its corner-only connections.
        pixels = {
            (0, 1): CLEAR, (1, 1): CLEAR,
            (2, 2): CLEAR, (3, 3): CLEAR,
            (4, 4): RED,
        }
        self.assert_selection(rgba((9, 9), pixels), set(), {
            "red": {"candidates": 1, "cleared": 0, "protected": 1},
            "yellow": {"candidates": 0, "cleared": 0, "protected": 0},
        })
        # These two low-alpha bridge pixels make an orthogonal route. The
        # candidate beside its end can now be removed despite nearby paint.
        pixels.update({(2, 1): (80, 90, 100, 8), (3, 2): CLEAR})
        self.assert_selection(rgba((9, 9), pixels), {(4, 4)}, {
            "red": {"candidates": 1, "cleared": 1, "protected": 0},
            "yellow": {"candidates": 0, "cleared": 0, "protected": 0},
        })

    def test_diagonal_mixed_color_component_clears_together_and_is_idempotent(self):
        # Only the first red pixel borders exterior transparency. Both colors
        # share one diagonal candidate component; the distant yellow stays.
        image = rgba((9, 9), {
            (0, 0): CLEAR, (1, 1): RED,
            (2, 2): YELLOW, (3, 3): (255, 0, 0, 1),
            (6, 6): YELLOW, (7, 6): (255, 255, 0, 9),
            (5, 1): (255, 100, 0, 8),
        })
        selected = self.assert_selection(image, {(1, 1), (2, 2), (3, 3)}, {
            "red": {"candidates": 2, "cleared": 2, "protected": 0},
            "yellow": {"candidates": 2, "cleared": 1, "protected": 1},
        })
        edited = image.copy()
        edited[:, :, 3][selected] = 0
        np.testing.assert_array_equal(edited[:, :, :3], image[:, :, :3])
        np.testing.assert_array_equal(edited[~selected], image[~selected])
        np.testing.assert_array_equal(
            edited[image[:, :, 3] > 8], image[image[:, :, 3] > 8],
        )
        self.assert_selection(edited, set(), {
            "red": {"candidates": 0, "cleared": 0, "protected": 0},
            "yellow": {"candidates": 1, "cleared": 0, "protected": 1},
        })

    def test_isolated_matte_inside_a_sealed_clear_cavity_is_removed(self):
        pixels = {(x, y): CLEAR for y in range(2, 7) for x in range(2, 7)}
        pixels.update({(4, 4): RED, (2, 2): YELLOW})
        # Neither component reaches exterior transparency. The red is isolated
        # from paint; the yellow at the cavity's corner touches paint.
        self.assert_selection(rgba((9, 9), pixels), {(4, 4)}, {
            "red": {"candidates": 1, "cleared": 1, "protected": 0},
            "yellow": {"candidates": 1, "cleared": 0, "protected": 1},
        })

    def test_single_pixel_and_thin_image_boundaries(self):
        cases = [
            ((1, 1), {(0, 0): RED}, {(0, 0)}, 1, 0),
            ((1, 3), {(0, 0): RED, (0, 2): YELLOW}, {(0, 0), (0, 2)}, 1, 1),
            ((3, 1), {(0, 0): RED, (2, 0): YELLOW}, {(0, 0), (2, 0)}, 1, 1),
            ((1, 1), {(0, 0): (255, 0, 0, 0)}, set(), 0, 0),
        ]
        for size, pixels, positions, red_count, yellow_count in cases:
            with self.subTest(size=size, pixels=pixels):
                self.assert_selection(rgba(size, pixels), positions, {
                    "red": {"candidates": red_count, "cleared": red_count, "protected": 0},
                    "yellow": {"candidates": yellow_count, "cleared": yellow_count, "protected": 0},
                })


if __name__ == "__main__":
    unittest.main()
