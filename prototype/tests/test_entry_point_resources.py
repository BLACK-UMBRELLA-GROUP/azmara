"""Check entry-page resources in the checkout and the native bundle manifest."""

from html.parser import HTMLParser
from pathlib import Path
import posixpath
import unittest
from urllib.parse import unquote, urlsplit


PROTOTYPE = Path(__file__).resolve().parents[1]
ENTRY_POINTS = ("index.html", "preview.html")


class EntryPointResources(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ("script", "iframe"):
            url = attrs.get("src")
        elif tag == "link" and "stylesheet" in (attrs.get("rel") or "").lower().split():
            url = attrs.get("href")
        else:
            return
        if url:
            self.references.append((self.getpos()[0], url))


def local_resource_paths(entry_point):
    parser = EntryPointResources()
    parser.feed((PROTOTYPE / entry_point).read_text(encoding="utf-8"))
    parser.close()

    local_references = []
    for line, url in parser.references:
        parts = urlsplit(url)
        if parts.scheme or parts.netloc or not parts.path:
            continue
        # Both HTML pages are served at the prototype root.
        path = posixpath.normpath("/" + unquote(parts.path).lstrip("/"))
        local_references.append((line, url, path.lstrip("/")))
    return local_references


def has_exact_file(path):
    current = PROTOTYPE
    for name in path.split("/"):
        # A case-insensitive checkout can resolve a path that fails on the host.
        if not current.is_dir() or name not in {child.name for child in current.iterdir()}:
            return False
        current /= name
        if current.is_symlink():
            return False
    return current.is_file()


class EntryPointResourceTest(unittest.TestCase):
    def test_local_resource_paths(self):
        for entry_point in ENTRY_POINTS:
            local_references = local_resource_paths(entry_point)
            self.assertTrue(local_references, f"{entry_point} has no local resource URLs")
            for line, url, path in local_references:
                with self.subTest(entry_point=entry_point, line=line, url=url):
                    self.assertTrue(has_exact_file(path), f"Missing file with exact path: {path}")

    def test_native_entry_point_resources_are_bundled(self):
        manifest = (PROTOTYPE / "runtime-manifest.txt").read_text(encoding="utf-8")
        bundled_paths = {line.strip() for line in manifest.splitlines()}
        self.assertIn(
            "index.html", bundled_paths, "Native entry page missing from runtime-manifest.txt"
        )
        for line, url, path in local_resource_paths("index.html"):
            with self.subTest(line=line, url=url):
                self.assertIn(
                    path, bundled_paths, f"Native resource missing from runtime-manifest.txt: {path}"
                )


if __name__ == "__main__":
    unittest.main()
