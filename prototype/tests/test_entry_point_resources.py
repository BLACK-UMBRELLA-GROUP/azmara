"""Check local script, stylesheet and frame URLs in the prototype entry pages."""

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

            self.assertTrue(local_references, f"{entry_point} has no local resource URLs")
            for line, url, path in local_references:
                with self.subTest(entry_point=entry_point, line=line, url=url):
                    self.assertTrue(has_exact_file(path), f"Missing file with exact path: {path}")


if __name__ == "__main__":
    unittest.main()
