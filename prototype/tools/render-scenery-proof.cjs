"use strict";

// Deterministic native SVG material proof, not a browser/interaction test.
// Writes a temporary rendered PNG only; never modifies a game asset.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const os = require("node:os");
const dependencyRoot = process.env.AZMARA_NODE_MODULES;
const sharp = dependencyRoot ? require(path.join(dependencyRoot, "sharp")) : require("sharp");
const prototype = path.resolve(__dirname, "..");
const realm = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(prototype, "building-art.js"), "utf8"), realm);
vm.runInNewContext(fs.readFileSync(path.join(prototype, "progression.js"), "utf8"), realm);
const art = realm.window.AzmaraBuildingArt;
const fixturePath = process.argv[2] || path.join(prototype, "tests/fixtures/desktop-grid50-footprints.json");
const profile = JSON.parse(fs.readFileSync(fixturePath, "utf8")).profiles[0];
const level = Number(process.argv[3]) || 50;
const options = { desktop: profile.desktop, plots: profile.plots, decorExclusions: profile.decorExclusions || [] };
const layout = art.terrainOverlay.layout(level, options);
const uri = art.terrainOverlay(level, options);
const svg = uri && decodeURIComponent(uri.slice(uri.indexOf(",") + 1));
const output = fs.mkdtempSync(path.join(os.tmpdir(), "azmara-native-scenery-"));
const terrain = path.join(prototype, realm.window.AzmaraProgression.forLevel(level, options).terrainAsset);
(async () => {
  const result = path.join(output, "material-level-" + level + ".png");
  const overlays = svg ? [{ input: await sharp(Buffer.from(svg)).png().toBuffer() }] : [];
  const decor = art.sceneryDecor?.(level, options);
  if (decor) {
    // Embed only into this temporary read-only proof; real inline SVG uses local
    // hrefs. Keep the application's two-layer rendering/security split intact.
    const atlas = art.sceneryDecor.atlas;
    const data = "data:image/png;base64," + fs.readFileSync(path.join(prototype, atlas.src)).toString("base64");
    const standalone = '<svg xmlns="http://www.w3.org/2000/svg" width="' + layout.width + '" height="' + layout.height + '" viewBox="0 0 ' + layout.width + ' ' + layout.height + '">' + decor.replaceAll(atlas.src, data) + '</svg>';
    overlays.push({ input: await sharp(Buffer.from(standalone)).png().toBuffer() });
  }
  await sharp(terrain).resize(layout.width, layout.height).composite(overlays).png().toFile(result);
  console.log(JSON.stringify({ result, fixturePath, level, roads: layout.roads.length, ornaments: layout.ornaments.length, browserCertification: false }));
})();
