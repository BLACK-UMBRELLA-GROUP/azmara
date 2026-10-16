"use strict";

// Shared drawn-reserve proof. Sample opaque pixels from the actual scaled
// artwork, check screenshot colours, and compare a temporary image-hidden
// screenshot. Neither DOM presence nor a transparent button centre proves art.
const assert = require("node:assert/strict");
const {assertNativeCrops}=require("./crop-isolation.cjs");

async function markerPoints(target, includeOccupied = false) {
  const crops=await target.locator(includeOccupied ? '#town-core .plot-marker' : '#town-core .plot-marker[data-occupied="false"]').evaluateAll(plots=>plots.flatMap(plot=>{
    const sprite=plot.querySelector(".marker .building-sprite"),frame=sprite?.closest(".building-frame");if(!sprite)return[];
    const style=getComputedStyle(sprite),src=style.backgroundImage.match(/^url\("?(.*?)"?\)$/)?.[1];
    return[{src,cell:Number(frame.dataset.artCell),rect:frame.dataset.artRect.split(",").map(Number)}];
  }));
  if(crops.length)await assertNativeCrops(target,crops);
  return target.locator(includeOccupied ? '#town-core .plot-marker' : '#town-core .plot-marker[data-occupied="false"]').evaluateAll((plots) => Promise.all(plots.map(async (plot) => {
    const layer = plot.querySelector(".marker img, .marker .building-sprite");
    const atlas = layer?.classList.contains("building-sprite");
    let image = layer;
    if (atlas) {
      image = new Image();
      image.src = getComputedStyle(layer).backgroundImage.match(/^url\("?(.*?)"?\)$/)?.[1] || "";
      await image.decode();
    }
    if (!image?.complete || !image.naturalWidth || plot.querySelector(".empty-slot-plus, .plot-plus")) throw new Error("Plot lacks decoded artwork or retains a removed plus: " + plot.dataset.plot);
    const button = plot.getBoundingClientRect();
    const imageBox = layer.getBoundingClientRect();
    const ratio = Math.min(imageBox.width / image.naturalWidth, imageBox.height / image.naturalHeight);
    const art = atlas ? { width: imageBox.width, height: imageBox.height } : { width: image.naturalWidth * ratio, height: image.naturalHeight * ratio };
    art.x = imageBox.x + (imageBox.width - art.width) / 2;
    art.y = imageBox.y + (imageBox.height - art.height) / 2;
    const style = getComputedStyle(layer);
    if (art.width < 24 || art.height < 16 || !atlas && style.objectFit !== "contain" || style.visibility === "hidden") throw new Error("Plot artwork is hidden, distorted or unreadably small: " + plot.dataset.plot);
    const origin = { x: Math.floor(art.x), y: Math.floor(art.y) };
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(art.width) + 2; canvas.height = Math.ceil(art.height) + 2;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    // Browser img rendering uses high-quality minification. Match it when a
    // 1536px textured sprite is reduced to a small phone-scale reserve.
    context.imageSmoothingQuality = "high";
    if (atlas) {
      const cell = Number(layer.closest(".building-frame").dataset.artCell);
      const actualPosition = style.backgroundPosition.split(" ").map(parseFloat);
      const backgroundSize = style.backgroundSize.split(" ").map(parseFloat);
      // Derive the sampled native rectangle from actual computed CSS. This
      // validates both whole cells and approved tighter per-stage crops without
      // trusting the renderer's metadata or a background URL alone.
      const crop = { width: image.naturalWidth * 100 / backgroundSize[0], height: image.naturalHeight * 100 / backgroundSize[1] };
      crop.x = actualPosition[0] / 100 * (image.naturalWidth - crop.width);
      crop.y = actualPosition[1] / 100 * (image.naturalHeight - crop.height);
      const declared=layer.closest(".building-frame").dataset.artRect.split(",").map(Number);
      if (!Number.isInteger(cell) || cell < 0 || cell > 10 || !style.backgroundSize.split(" ").every((value) => value.endsWith("%")) || ![crop.x,crop.y,crop.width,crop.height].every(Number.isFinite) || crop.width <= 0 || crop.height <= 0 || crop.x < -.01 || crop.y < -.01 || crop.x + crop.width > image.naturalWidth + .01 || crop.y + crop.height > image.naturalHeight + .01 || ![crop.x,crop.y,crop.width,crop.height].every((value,index)=>Math.abs(value-declared[index])<.01)) throw new Error("Atlas computed native crop escapes its exact registered rectangle/source: " + plot.dataset.plot + " " + JSON.stringify({ crop, declared }));
      if (Math.abs(art.width / art.height - crop.width / crop.height) > .01) throw new Error("Atlas crop is visibly stretched " + plot.dataset.plot);
      context.drawImage(image, crop.x, crop.y, crop.width, crop.height, art.x - origin.x, art.y - origin.y, art.width, art.height);
    } else context.drawImage(image, art.x - origin.x, art.y - origin.y, art.width, art.height);
    const candidates = [];
    for (let y = 1; y < canvas.height - 1; y += 1) for (let x = 1; x < canvas.width - 1; x += 1) {
      const colour = [...context.getImageData(x, y, 1, 1).data];
      if (colour[3] < 250) continue;
      const neighbourhood = context.getImageData(x - 1, y - 1, 3, 3).data;
      if ([...Array(9).keys()].some((index) => neighbourhood[index * 4 + 3] < 245)) continue;
      // Compare local colour means, not a single source texel: the browser's
      // downsampled img layer and canvas can phase fine dirt texture differently.
      const mean = [0, 1, 2].map((channel) => [...Array(9).keys()].reduce((sum, index) => sum + neighbourhood[index * 4 + channel], 0) / 9);
      candidates.push({ x: origin.x + x + .5, y: origin.y + y + .5, colour: mean, localX: x, localY: y });
    }
    const samples = [];
    // Retain four fixed interior regions. Add source-determined material
    // extremes, not screenshot-selected points: brown earth interiors can
    // coincidentally match sandy terrain even while the drawn border/shadow is
    // clear. All six still require fully opaque 3x3 material and real hits.
    for (const [fx, fy] of [[.35, .5], [.65, .5], [.5, .35], [.5, .7]]) {
      const sorted = [...candidates].sort((a, b) => Math.hypot(a.localX - art.width * fx, a.localY - art.height * fy) - Math.hypot(b.localX - art.width * fx, b.localY - art.height * fy));
      const sample = sorted.find((candidate) => samples.every((point) => Math.hypot(point.x - candidate.x, point.y - candidate.y) >= 3));
      if (!sample) throw new Error("Reserve has insufficient visible opaque material: " + plot.dataset.plot);
      samples.push(sample);
    }
    for (const direction of [1, -1]) {
      const sorted = [...candidates].sort((a, b) => direction * (a.colour.reduce((sum,value)=>sum+value,0) - b.colour.reduce((sum,value)=>sum+value,0)) || a.localY-b.localY || a.localX-b.localX);
      const sample = sorted.find(candidate=>samples.every(point=>Math.hypot(point.x-candidate.x,point.y-candidate.y)>=3));
      if (!sample) throw new Error("Reserve has insufficient distinct opaque material extrema: " + plot.dataset.plot);
      samples.push(sample);
    }
    const centre = samples[0];
    const inside = samples.every((point) => point.x >= button.x && point.x <= button.right && point.y >= button.y && point.y <= button.bottom);
    const exposed = samples.every((point) => document.elementFromPoint(point.x, point.y)?.closest(".plot-marker") === plot);
    return {
      id: plot.dataset.plot, kind: plot.dataset.kind, occupied: plot.dataset.occupied,
      x: centre.x, y: centre.y, samples, inside, insideTarget: inside, exposed,
      imageDx: Math.abs(imageBox.x + imageBox.width / 2 - button.x - button.width / 2),
      imageDy: Math.abs(imageBox.y + imageBox.height / 2 - button.y - button.height / 2),
      artWidth: art.width, artHeight: art.height,
      source: image.currentSrc, art, rect: button.toJSON()
    };
  })));
}

async function assertDrawnMarkers(page, points, includeOccupied = false) {
  // A pointer-events:none status toast can paint over a material point while
  // its underlying target remains clickable. Geometry/hits were already
  // checked above; wait for the real timed dismissal before stable pixel QA.
  // Do not hide overlays or change runtime state to manufacture visibility.
  const statusOverlay=await page.evaluate(points=>{
    const toast=document.querySelector("#toast");if(!toast||toast.hidden)return false;
    const box=toast.getBoundingClientRect();return points.some(point=>point.samples.some(sample=>sample.x>=box.left&&sample.x<=box.right&&sample.y>=box.top&&sample.y<=box.bottom));
  },points);
  if(statusOverlay)await page.locator("#toast").waitFor({state:"hidden",timeout:10000});
  const screenshot = await page.screenshot({ type: "png", scale: "css" });
  const selector = includeOccupied ? "#town-core .marker img, #town-core .marker .building-sprite" : "#town-core img.empty-plot-art";
  const originals = await page.locator(selector).evaluateAll((images) => images.map((image) => {
    const original = image.getAttribute("style"); image.style.setProperty("visibility", "hidden", "important"); return original;
  }));
  let hidden;
  try { hidden = await page.screenshot({ type: "png", scale: "css" }); }
  finally {
    await page.locator(selector).evaluateAll((images, originals) => images.forEach((image, index) => originals[index] === null ? image.removeAttribute("style") : image.setAttribute("style", originals[index])), originals);
  }
  const failures = await page.evaluate(async ({ base64, hiddenBase64, points }) => {
    const decode = async (base64) => {
      const image = new Image(); image.src = "data:image/png;base64," + base64; await image.decode();
      const canvas = document.createElement("canvas"); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d", { willReadFrequently: true }); context.drawImage(image, 0, 0); return { canvas, context };
    };
    const { canvas, context } = await decode(base64);
    const blank = (await decode(hiddenBase64)).context;
    return points.flatMap((point) => {
      let changed = 0;
      const mismatches = [];
      const missing = point.samples.some((sample) => {
        if (sample.x < 0 || sample.y < 0 || sample.x >= canvas.width || sample.y >= canvas.height) return true;
        const x = Math.floor(sample.x), y = Math.floor(sample.y);
        let painted = false;
        let nearestDifference = Infinity, nearestPixel;
        for (let dy = -1; dy <= 1; dy += 1) for (let dx = -1; dx <= 1; dx += 1) {
          const px = x + dx, py = y + dy;
          if (px < 0 || py < 0 || px >= canvas.width || py >= canvas.height) continue;
          if (px < 1 || py < 1 || px >= canvas.width - 1 || py >= canvas.height - 1) continue;
          const patch = context.getImageData(px - 1, py - 1, 3, 3).data;
          const mean = [0, 1, 2].map((channel) => [...Array(9).keys()].reduce((sum, index) => sum + patch[index * 4 + channel], 0) / 9);
          const difference = Math.max(...sample.colour.map((channel, index) => Math.abs(mean[index] - channel)));
          if (difference < nearestDifference) { nearestDifference = difference; nearestPixel = mean; }
          if (sample.colour.every((channel, index) => Math.abs(mean[index] - channel) <= 32)) painted = true;
        }
        const pixel = context.getImageData(x, y, 1, 1).data;
        const background = blank.getImageData(x, y, 1, 1).data;
        if ([0, 1, 2].some((index) => Math.abs(pixel[index] - background[index]) >= 10)) changed += 1;
        if (!painted) mismatches.push({ x: sample.x, y: sample.y, expected: sample.colour, nearestPixel, nearestDifference });
        return !painted;
      });
      return missing || changed < 2 ? [{ id: point.id, missing, changed, mismatches }] : [];
    });
  }, { base64: screenshot.toString("base64"), hiddenBase64: hidden.toString("base64"), points });
  assert.deepEqual(failures, [], "Actual reserve artwork is absent, hidden or fails its screenshot contrast proof: " + JSON.stringify(failures));
}

module.exports = { markerPoints, assertDrawnMarkers };
