"""Crop-registration regressions using in-memory PNGs, without real assets."""

from io import BytesIO
from pathlib import Path
import runpy
import unittest

from PIL import Image


# The tool's CLI is guarded by __main__; loading definitions writes no files.
inspect_atlas = runpy.run_path(
    str(Path(__file__).resolve().parents[1] / "tools" / "inspect-land-atlases.py")
)["inspect"]


def atlas():
    image = Image.new("RGBA", (260, 200))
    for y in (10, 75, 140):
        for x in (10, 75, 140, 205):
            image.paste((80, 120, 160, 255), (x, y, x + 32, y + 32))
    return image


def inspect_image(image):
    # Fixtures stay in memory throughout encoding, inspection and cleanup.
    with BytesIO() as source:
        image.save(source, format="PNG")
        original = source.getvalue()
        source.seek(0)
        result = inspect_atlas(source)
        if source.getvalue() != original:
            raise AssertionError("Inspection changed the source PNG")
        return result


class LandAtlasInspectionTests(unittest.TestCase):
    def test_grid_order_and_reserved_twelfth_cell(self):
        with atlas() as image:
            result = inspect_image(image)

        self.assertEqual(result["rects"], [
            [5, 5, 42, 42], [70, 5, 42, 42], [135, 5, 42, 42], [200, 5, 42, 42],
            [5, 70, 42, 42], [70, 70, 42, 42], [135, 70, 42, 42], [200, 70, 42, 42],
            [5, 135, 42, 42], [70, 135, 42, 42], [135, 135, 42, 42],
        ])
        self.assertEqual(result["majorBodies"], [1024] * 12)
        self.assertEqual(result["diagnostics"], [
            dict(cell=cell, padding=5, fullBody=True, fullProps=True, foreignPixels=0)
            for cell in range(11)
        ])

    def test_alpha_and_detached_prop_size_boundaries(self):
        cases = [
            (30, False, [5, 5, 42, 42]),
            (31, False, [5, 5, 53, 42]),
            (255, True, [5, 5, 42, 42]),
        ]
        for alpha, remove_pixel, expected in cases:
            with self.subTest(alpha=alpha, prop_pixels=29 if remove_pixel else 30):
                with atlas() as image:
                    image.paste((80, 120, 160, alpha), (47, 20, 53, 25))
                    if remove_pixel:
                        image.putpixel((52, 24), (0, 0, 0, 0))
                    result = inspect_image(image)
                self.assertEqual(result["rects"][0], expected)
                self.assertEqual(result["rects"][1], [70, 5, 42, 42])

    def test_padding_shrinks_to_exclude_foreign_prop(self):
        with atlas() as image:
            # The long prop belongs to the next body, but reaches into cell 0's
            # five-pixel margin. Four pixels leave its full body uncontaminated.
            image.paste((80, 120, 160, 255), (45, 46, 80, 47))
            result = inspect_image(image)

        self.assertEqual(result["rects"][0], [6, 6, 40, 40])
        self.assertEqual(result["diagnostics"][0], dict(
            cell=0, padding=4, fullBody=True, fullProps=True, foreignPixels=0,
        ))

    def test_overlapping_body_bounds_report_failure_instead_of_clipping(self):
        with atlas() as image:
            # A U-shaped first body surrounds a channel occupied by a connected
            # arm of the next body. No rectangular full-body crop can isolate it.
            image.paste((0, 0, 0, 0), (10, 10, 42, 42))
            image.paste((80, 120, 160, 255), (10, 10, 50, 50))
            image.paste((0, 0, 0, 0), (30, 20, 50, 40))
            image.paste((80, 120, 160, 255), (32, 26, 80, 28))
            result = inspect_image(image)

        self.assertIsNone(result["rects"][0])
        diagnostic = result["diagnostics"][0]
        self.assertEqual(diagnostic["cell"], 0)
        self.assertEqual(diagnostic["error"], "foreign paint overlaps full-body bounds")
        self.assertEqual(diagnostic["body"], [10, 10, 50, 50])
        self.assertEqual(len(diagnostic["foreignComponents"]), 1)
        foreign = diagnostic["foreignComponents"][0]
        self.assertEqual(
            [foreign[key] for key in ("count", "left", "top", "right", "bottom")],
            [1110, 32, 10, 106, 41],
        )

    def test_padding_clamps_to_image_edges(self):
        with atlas() as image:
            image.paste((0, 0, 0, 0), (10, 10, 42, 42))
            image.paste((80, 120, 160, 255), (0, 0, 32, 32))
            result = inspect_image(image)

        self.assertEqual(result["rects"][0], [0, 0, 37, 37])
        self.assertEqual(result["corners"], [255, 0, 0, 0])

    def test_non_rgba_and_incomplete_atlases_are_rejected(self):
        with Image.new("RGB", (260, 200)) as image:
            with self.assertRaises(AssertionError):
                inspect_image(image)
        with atlas() as image:
            image.paste((0, 0, 0, 0), (205, 140, 237, 172))
            with self.assertRaises(AssertionError):
                inspect_image(image)


if __name__ == "__main__":
    unittest.main()
