"use strict";

// Independent CSS-cover sampling diagnostic, isolated from user browser state.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(process.argv[2] || "playwright");
const base = process.argv[3] || "http://127.0.0.1:4317";
assert(["localhost", "127.0.0.1", "[::1]"].includes(new URL(base).hostname));
const directory = process.env.AZMARA_QA_SCREENSHOTS;
const settle = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    try {
      const page = await context.newPage(), errors = [];
      page.on("pageerror", error => errors.push(error.message));
      page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
      page.on("requestfailed", request => errors.push(request.url()));
      await page.goto(base);
      await page.waitForFunction(() => document.querySelectorAll("#town-core .plot-marker").length === 23);
      const results = [];
      for (const view of ["island", "world"]) {
        await page.locator(`.desktop-hud [data-map-navigation="${view}"]`).click();
        await page.locator("#atlas-view img").evaluateAll(images => Promise.all(images.map(image => image.decode())));
        await settle(page);
        const source = await page.locator(".atlas-scenery").evaluate(async img => {
          await img.decode(); const r = img.getBoundingClientRect(), style = getComputedStyle(img);
          const canvas = document.createElement("canvas"); canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d"); ctx.drawImage(img, 0, 0);
          const cover = document.createElement("canvas"); cover.width = innerWidth; cover.height = innerHeight;
          const covered = cover.getContext("2d");
          const scale = Math.max(r.width / img.naturalWidth, r.height / img.naturalHeight), offsetX = r.x + (r.width - img.naturalWidth * scale) / 2, offsetY = r.y + (r.height - img.naturalHeight * scale) / 2;
          covered.drawImage(img, offsetX, offsetY, img.naturalWidth * scale, img.naturalHeight * scale);
          const points = [[8, 495], [1432, 495], [8, 675], [1432, 675]].map(([x, y]) => {
            const sx = (x - offsetX) / scale, sy = (y - offsetY) / scale;
            const native = [...ctx.getImageData(Math.floor(sx), Math.floor(sy), 1, 1).data];
            const neighbours = [];
            for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) neighbours.push({ dx, dy, colour: [...ctx.getImageData(Math.floor(sx) + dx, Math.floor(sy) + dy, 1, 1).data] });
            return { x, y, sx, sy, native, covered: [...covered.getImageData(x, y, 1, 1).data], neighbours, elements: document.elementsFromPoint(x, y).map(node => ({ tag: node.tagName, id: node.id, class: node.className?.baseVal ?? node.className })) };
          });
          return { source: img.currentSrc, width: img.naturalWidth, height: img.naturalHeight, rect: r.toJSON(), style: { objectFit: style.objectFit, objectPosition: style.objectPosition, opacity: style.opacity, filter: style.filter, mask: style.maskImage, imageRendering: style.imageRendering }, scale, offsetX, offsetY, painting: document.querySelector(".atlas-island-terrain, .atlas-world-terrain").getBoundingClientRect().toJSON(), points };
        });
        const before = await page.screenshot({ scale: "css" });
        await page.locator(".atlas-scenery").evaluate(img => { img.style.visibility = "hidden"; }); await settle(page);
        const hidden = await page.screenshot({ scale: "css" });
        await page.locator(".atlas-scenery").evaluate(img => { img.style.removeProperty("visibility"); }); await settle(page);
        const pixels = await page.evaluate(async ({ before, hidden, points }) => {
          const decode = async base64 => { const img = new Image(); img.src = "data:image/png;base64," + base64; await img.decode(); const canvas = document.createElement("canvas"); canvas.width = img.naturalWidth; canvas.height = img.naturalHeight; const ctx = canvas.getContext("2d"); ctx.drawImage(img, 0, 0); return ctx; };
          const actual = await decode(before), absent = await decode(hidden);
          return points.map(p => ({ ...p, actual: [...actual.getImageData(p.x, p.y, 1, 1).data], hidden: [...absent.getImageData(p.x, p.y, 1, 1).data] }));
        }, { before: before.toString("base64"), hidden: hidden.toString("base64"), points: source.points });
        results.push({ view, ...source, points: pixels });
        if (directory) await page.screenshot({ path: path.join(directory, `diagnostic-backing-${view}-1440x900.png`), scale: "css" });
      }
      assert.deepEqual(errors, []);
      if (directory) fs.writeFileSync(path.join(directory, "backing-cover-diagnostic.json"), JSON.stringify({ results, errors }, null, 2) + "\n");
      console.log(JSON.stringify({ results, errors }, null, 2));
    } finally { await context.close(); }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
