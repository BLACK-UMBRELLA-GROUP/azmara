"use strict";
// Reuses the project's offline Canvas screenshot-annotation method.
// Does not load the game, edit source art or touch any browser save.
const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto"), assert = require("node:assert/strict");
const dependencyRoot = process.env.AZMARA_NODE_MODULES;
const { chromium } = dependencyRoot ? require(path.join(dependencyRoot, "playwright")) : require("playwright");
const root = path.resolve(__dirname, "../../.."), hash = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
const measurement = JSON.parse(fs.readFileSync(path.join(root, "evidence/2026-10-11-oasis-pocket-proposal/measurement-receipt.json"), "utf8"));
const spec = JSON.parse(fs.readFileSync(path.join(__dirname, "annotation-spec.json"), "utf8"));
const runtimeHashes = () => Object.fromEntries(fs.readdirSync(path.join(root, "prototype")).filter(name => /\.(js|css|html)$/.test(name)).sort().map(name => [name, hash(fs.readFileSync(path.join(root, "prototype", name)))]));
assert(measurement.passed && measurement.sourcesStable && measurement.browserClosed && measurement.serverClosed);
assert.deepEqual(runtimeHashes(), measurement.sourceHashesAfter);
const report = { createdAt: new Date().toISOString(), purpose: "Pockets/entrances proposal only", method: "1:1 unchanged screenshots plus deterministic offline Canvas marks and appended side legend; no generative editing", images: [], browserClosed: false };
let browser;
(async () => {
  try {
    browser = await chromium.launch({ headless: true });
    for (const item of spec) {
      const fixture = measurement.fixtures.find(f => f.level === item.level); assert(fixture);
      const source = fs.readFileSync(fixture.screenshot); assert.equal(hash(source), fixture.screenshotSha256);
      const context = await browser.newContext({ viewport: { width: 1830, height: 900 }, deviceScaleFactor: 1 });
      await context.route("**/*", route => route.abort());
      const page = await context.newPage();
      const result = await page.evaluate(async ({ source, ctm, item }) => {
        const image = new Image(); image.src = source; await image.decode();
        const w = image.naturalWidth, h = image.naturalHeight, sidebar = 390;
        const canvas = document.createElement("canvas"); canvas.width = w + sidebar; canvas.height = h;
        const base = canvas.getContext("2d", { willReadFrequently: true }); base.drawImage(image, 0, 0);
        base.fillStyle = "#f5efdf"; base.fillRect(w, 0, sidebar, h);
        const original = base.getImageData(0, 0, w + sidebar, h).data;
        const overlay = document.createElement("canvas"); overlay.width = w + sidebar; overlay.height = h;
        const ink = overlay.getContext("2d", { willReadFrequently: true });
        const colours = { garden: "#28794e", entry: "#c47a18", neutral: "#4b5b66" };
        const project = ([x,y]) => [ctm.a*x+ctm.c*y+ctm.e, ctm.b*x+ctm.d*y+ctm.f];
        function wrap(text, x, y, width, lineHeight) {
          let line = "";
          for (const word of text.split(" ")) {
            const next = line ? line + " " + word : word;
            if (ink.measureText(next).width > width && line) { ink.fillText(line, x, y); y += lineHeight; line = word; } else line = next;
          }
          if (line) ink.fillText(line, x, y); return y + lineHeight;
        }
        function line(points, colour, width = 2, dashed = false) {
          ink.save(); ink.strokeStyle = colour; ink.lineWidth = width; ink.lineJoin = "round"; ink.lineCap = "round";
          if (dashed) ink.setLineDash([5,4]); ink.beginPath(); points.forEach(([x,y],i) => i ? ink.lineTo(x,y) : ink.moveTo(x,y)); ink.stroke(); ink.restore();
        }
        for (const p of item.pockets) {
          const [left,top] = project([p.x-p.width/2,p.y-p.height/2]), [right,bottom] = project([p.x+p.width/2,p.y+p.height/2]);
          ink.fillStyle = "rgba(40,121,78,.12)"; ink.fillRect(left,top,right-left,bottom-top);
          ink.save(); ink.strokeStyle = colours.garden; ink.lineWidth = 2; ink.setLineDash([5,4]); ink.strokeRect(left,top,right-left,bottom-top); ink.restore();
        }
        for (const r of item.routes) { const pts = r.points.map(project); line(pts,"rgba(255,250,230,.95)",4); line(pts,colours.entry,2,true); }
        ink.font = "bold 22px Arial"; ink.fillStyle = "#263f3c"; ink.fillText(item.title,w+22,39);
        ink.font = "14px Arial"; ink.fillText("LEVEL " + item.level + " · PLACEMENT PROPOSAL ONLY",w+22,67);
        ink.fillText("Original screenshot preserved at 1:1 scale",w+22,91);
        const spacing = item.notes.length > 4 ? 105 : 158;
        for (let i=0; i<item.notes.length; i++) {
          const note = item.notes[i], point = project(note.point), sy = 142 + i*spacing, colour = colours[note.colour];
          // Short leaders stay local; the sidebar number provides the match.
          ink.beginPath(); ink.arc(point[0],point[1],11,0,Math.PI*2); ink.fillStyle = colour; ink.fill(); ink.strokeStyle = "#fff9e8"; ink.lineWidth = 2; ink.stroke();
          ink.textAlign = "center"; ink.font = "bold 13px Arial"; ink.fillStyle = "white"; ink.fillText(String(i+1),point[0],point[1]+4); ink.textAlign = "left";
          ink.fillStyle = colour; ink.font = "bold 16px Arial"; ink.fillText((i+1)+". "+note.heading,w+22,sy);
          ink.fillStyle = "#454b40"; ink.font = "15px Arial"; wrap(note.text,w+22,sy+24,sidebar-44,19);
        }
        ink.fillStyle = "#655b48"; ink.font = "13px Arial"; wrap(item.footer,w+22,h-105,sidebar-44,17);
        const marks = ink.getImageData(0,0,w+sidebar,h).data;
        base.drawImage(overlay,0,0);
        const final = base.getImageData(0,0,w+sidebar,h).data;
        let checkedPixels=0, changedOutsideMarkup=0;
        for(let y=0;y<h;y++)for(let x=0;x<w;x++) {
          const k=(y*(w+sidebar)+x)*4; if(marks[k+3])continue; checkedPixels++;
          if(final[k]!==original[k]||final[k+1]!==original[k+1]||final[k+2]!==original[k+2]||final[k+3]!==original[k+3])changedOutsideMarkup++;
        }
        if(changedOutsideMarkup)throw new Error("Unmarked screenshot pixels changed");
        return { png:canvas.toDataURL("image/png").split(",")[1],width:w+sidebar,height:h,sourceWidth:w,checkedPixels,changedOutsideMarkup,ctm };
      }, { source:"data:image/png;base64,"+source.toString("base64"),ctm:fixture.measurement.screenCTM,item });
      const output = path.join(__dirname,item.output); fs.writeFileSync(output,Buffer.from(result.png,"base64"));
      const { png,...verification }=result;
      report.images.push({level:item.level,source:fixture.screenshot,sourceSha256:fixture.screenshotSha256,output,outputSha256:hash(fs.readFileSync(output)),verification});
      await context.close();
    }
  } finally {
    if(browser)await browser.close(); report.browserClosed=!browser?.isConnected();
    assert.deepEqual(runtimeHashes(),measurement.sourceHashesAfter,"Runtime changed during offline annotation");
    fs.writeFileSync(path.join(__dirname,"annotation-receipt.json"),JSON.stringify(report,null,2)+"\n");
    console.log(JSON.stringify({images:report.images.map(i=>i.output),browserClosed:report.browserClosed}));
  }
})().catch(error=>{console.error(error.stack);process.exitCode=1;});
