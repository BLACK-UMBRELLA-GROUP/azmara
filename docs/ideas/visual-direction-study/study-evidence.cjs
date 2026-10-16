"use strict";

// Proposal evidence only. Does not load or change the game or player storage.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "../../..");
const hash = b => crypto.createHash("sha256").update(b).digest("hex");
function scan(directory, prefix = directory) {
  return fs.readdirSync(path.join(root, directory), { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name)).flatMap(entry => {
    const relative = path.join(directory, entry.name);
    if (entry.isDirectory()) return scan(relative, prefix);
    if (!entry.isFile()) return [];
    const stat = fs.statSync(path.join(root, relative));
    return [{ path: relative, bytes: stat.size, sha256: hash(fs.readFileSync(path.join(root, relative))), mtimeMs: stat.mtimeMs }];
  });
}
function guarded() {
  const files = fs.readdirSync(path.join(root, "prototype")).filter(f => /\.(js|css|html)$/.test(f)).sort().map(f => {
    const relative = "prototype/" + f, stat = fs.statSync(path.join(root, relative));
    return { path: relative, bytes: stat.size, sha256: hash(fs.readFileSync(path.join(root, relative))), mtimeMs: stat.mtimeMs };
  });
  for (const dir of ["prototype/assets", "evidence/2026-10-11-wall-build", "sites/azmara-private-preview/dist", "mobile/assets/game", "mobile/lib", "mobile/tool"]) {
    if (fs.existsSync(path.join(root, dir))) files.push(...scan(dir));
  }
  return files;
}
async function main() {
  const mode = process.argv[2], receiptPath = path.join(__dirname, "unchanged-scope-receipt.json");
  if (mode === "begin") {
    fs.writeFileSync(receiptPath, JSON.stringify({ startedAt: new Date().toISOString(), scope: "Proposal only; runtime/art, Step 5 evidence, staged Site and native source/bundle remain unchanged", before: guarded() }, null, 2) + "\n", { flag: "wx" });
    console.log(JSON.stringify({ guardedFiles: guarded().length, receiptPath })); return;
  }
  if (mode === "verify") {
    const receipt = JSON.parse(fs.readFileSync(receiptPath));
    assert.deepEqual(guarded(), receipt.before, "A protected source/art/evidence file changed");
    receipt.verifiedAt = new Date().toISOString(); receipt.unchanged = true;
    fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + "\n");
    console.log(JSON.stringify({ unchanged: true, guardedFiles: receipt.before.length })); return;
  }
  if (mode !== "annotate") throw new Error("Use begin, annotate <spec.json>, or verify");
  const spec = JSON.parse(fs.readFileSync(process.argv[3], "utf8"));
  const dependencyRoot = process.env.AZMARA_NODE_MODULES;
  const { chromium } = dependencyRoot ? require(path.join(dependencyRoot, "playwright")) : require("playwright");
  let browser;
  const receipts = [];
  try {
    browser = await chromium.launch({ headless: true });
    for (const item of spec) {
      const capture = JSON.parse(fs.readFileSync(item.source.replace(/\.png$/, ".json"), "utf8"));
      assert(capture.passed && capture.browserClosed && capture.serverClosed && capture.errors.length === 0);
      const buffer = fs.readFileSync(item.source); assert.equal(hash(buffer), capture.screenshotSha256);
      const baseFile = path.join(__dirname, item.base); fs.copyFileSync(item.source, baseFile, fs.constants.COPYFILE_EXCL);
      fs.copyFileSync(item.source.replace(/\.png$/, ".json"), baseFile.replace(/\.png$/, ".json"), fs.constants.COPYFILE_EXCL);
      const page = await browser.newPage();
      await page.route("**/*", route => route.abort());
      const png = await page.evaluate(async ({ source, item }) => {
        const img = new Image(); img.src = source; await img.decode();
        const w = img.naturalWidth, h = img.naturalHeight, sidebar = 380;
        const canvas = document.createElement("canvas"); canvas.width = w + sidebar; canvas.height = h;
        const c = canvas.getContext("2d"); c.drawImage(img, 0, 0); c.fillStyle = "#f5efdf"; c.fillRect(w, 0, sidebar, h);
        c.fillStyle = "#263f3c"; c.font = "bold 23px Arial"; c.fillText(item.title, w + 24, 40);
        c.font = "14px Arial"; c.fillText("CURRENT GAME — DIAGNOSIS ONLY", w + 24, 67);
        c.fillText("Original screenshot kept at 1:1 scale", w + 24, 91);
        function wrap(text, x, y, maxWidth, lineHeight) {
          const words = text.split(" "); let line = "";
          for (const word of words) {
            const next = line ? line + " " + word : word;
            if (c.measureText(next).width > maxWidth && line) { c.fillText(line, x, y); y += lineHeight; line = word; }
            else line = next;
          }
          c.fillText(line, x, y); return y + lineHeight;
        }
        for (let i = 0; i < item.notes.length; i++) {
          const note = item.notes[i], n = i + 1, [x,y] = note.point, sy = 140 + i * 110;
          c.strokeStyle = "#be4933"; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 12, y); c.lineTo(w - 10, sy - 7); c.lineTo(w + 10, sy - 7); c.stroke();
          c.fillStyle = "#be4933"; c.beginPath(); c.arc(x, y, 15, 0, Math.PI * 2); c.fill(); c.strokeStyle = "white"; c.stroke();
          c.fillStyle = "white"; c.font = "bold 16px Arial"; c.textAlign = "center"; c.fillText(String(n), x, y + 6); c.textAlign = "left";
          c.fillStyle = "#263f3c"; c.font = "bold 16px Arial"; c.fillText(n + ". " + note.heading, w + 24, sy);
          c.font = "15px Arial"; c.fillStyle = "#4e4b40"; wrap(note.text, w + 24, sy + 25, sidebar - 48, 21);
        }
        c.fillStyle = "#655d4d"; c.font = "13px Arial"; wrap(item.footer, w + 24, h - 72, sidebar - 48, 18);
        return canvas.toDataURL("image/png").split(",")[1];
      }, { source: "data:image/png;base64," + buffer.toString("base64"), item });
      const output = path.join(__dirname, item.output); fs.writeFileSync(output, Buffer.from(png, "base64"), { flag: "wx" });
      receipts.push({ source: item.source, originalSha256: hash(buffer), originalCopy: item.base, output: item.output, outputSha256: hash(fs.readFileSync(output)), method: "Canvas leader lines, numbered marks and side legend only; original screenshot not resized" });
      await page.close();
    }
  } finally { if (browser) await browser.close(); }
  fs.writeFileSync(path.join(__dirname, "annotation-receipt.json"), JSON.stringify({ createdAt: new Date().toISOString(), browserClosed: !browser?.isConnected(), images: receipts }, null, 2) + "\n", { flag: "wx" });
  console.log(JSON.stringify({ images: receipts.map(r => r.output), browserClosed: !browser?.isConnected() }));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
