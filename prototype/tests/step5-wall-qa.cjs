"use strict";

// DEC-069: bounded, isolated wall checks, not a production simulation or save.
// Uses the installed Playwright runtime; owns and closes its loopback server.
// argv[2] may point to an existing Playwright module. No packages are installed.
const fs = require("node:fs"), path = require("node:path"), http = require("node:http"), crypto = require("node:crypto"), assert = require("node:assert/strict");
const root = fs.realpathSync(path.resolve(__dirname, ".."));
const output = path.resolve(process.env.AZMARA_QA_SCREENSHOTS || path.join(root, "..", "evidence", "2026-10-11-wall-build"));
assert(output.startsWith(path.join(root, "..", "evidence") + path.sep), "QA evidence must stay in the canonical evidence directory");
fs.mkdirSync(output, { recursive: true });
const startedAt = new Date().toISOString(), stem = "step5-" + startedAt.replace(/[:.]/g, "-");
const filter=process.env.AZMARA_STEP5_FILTER || "";
const profiles = [{ id: "desktop", width: 1440, height: 900 }, { id: "phone", width: 390, height: 844 }];
const layouts = ["staggered", "grid", "circle", "avenues", "garden-quarters"];
const expectedRoutes = {
  desktop: [[850,340],[520,760],[470,1300],[520,1900],[740,2380],[1430,2460],[2100,2490],[2780,2460],[3510,2380],[3720,1900],[3760,1300],[3680,760],[3440,340]],
  compact: [[2320,1250],[2140,1770],[2120,2350],[2120,2790],[2280,3340],[2670,3390],[3150,3420],[3570,3390],[3780,3340],[3920,2790],[3920,2350],[3900,1770],[3610,1250]]
};
const runtimeFiles = ["app.js", "town-wall.js", "building-art.js", "town-layouts.js", "progression.js", "index.html", "styles.css", "desktop.css", "debug-overlay.js"];
const hash = file => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, file))).digest("hex");
const hashes = () => Object.fromEntries(runtimeFiles.map(file => [file, hash(file)]));
const initialSources = hashes(), results = [], failures = [], artHashes = new Map();
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon" };
const server = http.createServer((req, res) => {
  try {
    if (!["GET", "HEAD"].includes(req.method)) return res.writeHead(405).end();
    const url = new URL(req.url, "http://127.0.0.1");
    const file = path.resolve(root, "." + decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname));
    const relative = path.relative(root, file);
    if (relative.startsWith("..") || path.isAbsolute(relative) || !/^(assets\/|[^/]+\.(html|js|css|ico)$)/.test(relative)) return res.writeHead(403).end();
    const actual = fs.realpathSync(file);
    if (!actual.startsWith(root + path.sep) || !fs.statSync(actual).isFile()) return res.writeHead(403).end();
    res.writeHead(200, { "Content-Type": mime[path.extname(actual)] || "application/octet-stream", "Cache-Control": "no-store" });
    if (req.method === "HEAD") return res.end();
    const stream = fs.createReadStream(actual); stream.on("error", error => res.destroy(error)); stream.pipe(res);
  } catch (error) { res.writeHead(error.code === "ENOENT" ? 404 : 400).end(); }
});
let browser, activeRun, q, cleanupTask, currentEvidence;
const cleanup = () => cleanupTask ||= (async () => {
  try { if (activeRun) await activeRun.context.close(); }
  finally {
    try { if (browser) await browser.close(); }
    finally { if (server.listening) await new Promise(resolve => { server.close(resolve); server.closeAllConnections?.(); }); }
  }
})();
for (const [signal, code] of [["SIGINT", 130], ["SIGTERM", 143]]) process.once(signal, () => cleanup().finally(() => process.exit(code)));

const rawSeed = state => " \n" + JSON.stringify(state, null, 2) + " \n";
const complete = (level, plotLayout = "staggered") => {
  const ordinary = q.types.filter(type => type.role === "general" && type.id !== "town-hall");
  const buildings = Object.fromEntries(ordinary.slice(0, 18).map((type, index) => [`general-${String(index + 2).padStart(2, "0")}`, { typeId: type.id, level }]));
  for (const [id, typeId] of [["wall-01","town-wall"],["harbour-01","trading-port"],["harbour-02","trading-port"],["freighter-01","dockyard"]]) buildings[id] = { typeId, level };
  return q.fixture({ hallLevel: level, plotLayout, buildings });
};
const bytes = async page => [await q.raw(page), await q.raw(page, q.legacyKey)];
async function ready(page) {
  await q.settle(page);
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    await document.fonts.ready;
    const urls = new Set([...document.querySelectorAll("#town-wall-perimeter image, #town-wall-front image, #town-terrain-art")].map(node => node.getAttribute("href")).filter(Boolean));
    await Promise.all([...urls].map(async url => { const image = new Image(); image.src = url; await image.decode(); }));
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}
async function screenshot(page, name) {
  await ready(page); await page.mouse.move(0, 0);
  const file = path.join(output, `${stem}-${name}.png`);
  await page.screenshot({ path: file, scale: "css" });
  return { file, sha256: crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex") };
}
async function seed(page, state) {
  await ready(page);
  await page.evaluate(({ key, seed }) => localStorage.setItem(key, seed), { key: q.key, seed: rawSeed(state) });
  await page.reload(); await ready(page);
}
async function inspect(page, expectedLevel, { fit = false, targets = true } = {}) {
  await ready(page);
  const evidence = await page.evaluate(async () => {
    const terrain = document.querySelector("#world-landscape"), map = document.querySelector("#town-map");
    const back = document.querySelector("#town-wall-perimeter"), front = document.querySelector("#town-wall-front"), frontCanvas = document.querySelector("#town-wall-front-layer");
    const rect = node => node.getBoundingClientRect().toJSON();
    const matrix = node => { const m = node.getScreenCTM(); return [m.a,m.b,m.c,m.d,m.e,m.f]; };
    const targets = [...document.querySelectorAll("#town-core .plot-marker")].map(node => {
      const box = rect(node), x = box.x + box.width / 2, y = box.y + box.height / 2;
      return { id: node.dataset.plot, name: node.getAttribute("aria-label"), level: Number(node.dataset.buildingLevel), rect: box,
        exposed: [[0,0],[-21,-21],[21,-21],[-21,21],[21,21]].every(([dx,dy]) => { const hit = document.elementFromPoint(x+dx,y+dy); return hit === node || node.contains(hit); }),
        z: getComputedStyle(node).zIndex, label: rect(node.querySelector(".hotspot-label")), labelVisible: getComputedStyle(node.querySelector(".hotspot-label")).display !== "none" };
    });
    const level = Number(back.dataset.wallLevel), desktop = map.dataset.presentation === "desktop";
    const scene = window.AzmaraTownWall.layout(level, { desktop });
    const result = { level, source: back.dataset.wallSource, scene, targets, viewport: rect(document.querySelector("#map-viewport")),
      layers: { backImages: back.querySelectorAll("image").length, frontImages: front.querySelectorAll("image").length,
        frontZ: getComputedStyle(frontCanvas).zIndex, frontParent: frontCanvas.parentElement.id,
        pointerEvents: getComputedStyle(frontCanvas).pointerEvents, frontGroupPointer: getComputedStyle(front).pointerEvents,
        matrix: matrix(terrain), frontMatrix: matrix(frontCanvas), backMatrix: matrix(back), frontGroupMatrix: matrix(front),
        viewBox: terrain.getAttribute("viewBox"), frontViewBox: frontCanvas.getAttribute("viewBox"),
        backHref: back.querySelector("image")?.getAttribute("href"), frontHref: front.querySelector("image")?.getAttribute("href") },
      painting: rect(document.querySelector("#town-terrain-art")), zoom: Number(map.dataset.zoom) };
    if (!level) return result;
    if (!scene.image) throw new Error("Completed wall has no registered original PNG art");
    const img = new Image(); img.src = scene.image.src; await img.decode();
    const canvas = document.createElement("canvas"); canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true }); ctx.drawImage(img,0,0);
    const rgba = ctx.getImageData(0,0,canvas.width,canvas.height).data;
    const m = back.getScreenCTM(), targetRects = targets.filter(t => t.id !== "wall-01");
    const overlap = Object.fromEntries(targetRects.map(t => [t.id, { pixels: 0, maxAlpha: 0 }]));
    const labelOverlap = Object.fromEntries(targetRects.filter(t=>t.labelVisible).map(t=>[t.id,{pixels:0,maxAlpha:0}]));
    const alpha = { pixels: 0, max: 0, extent: { left: canvas.width, top: canvas.height, right: 0, bottom: 0 }, screen: { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity }, gatePaint: 0 };
    for (let y=0;y<canvas.height;y++) for (let x=0;x<canvas.width;x++) {
      const a = rgba[(y*canvas.width+x)*4+3]; alpha.max = Math.max(alpha.max,a); if (!a) continue;
      alpha.pixels++; alpha.extent.left = Math.min(alpha.extent.left,x); alpha.extent.top = Math.min(alpha.extent.top,y); alpha.extent.right = Math.max(alpha.extent.right,x+1); alpha.extent.bottom = Math.max(alpha.extent.bottom,y+1);
      const worldX = scene.image.x + (x+.5)*scene.image.scale, worldY = scene.image.y + (y+.5)*scene.image.scale;
      const p = new DOMPoint(worldX,worldY).matrixTransform(m);
      const halfX = Math.abs(m.a*scene.image.scale)/2, halfY = Math.abs(m.d*scene.image.scale)/2;
      alpha.screen.left = Math.min(alpha.screen.left,p.x-halfX); alpha.screen.top = Math.min(alpha.screen.top,p.y-halfY); alpha.screen.right = Math.max(alpha.screen.right,p.x+halfX); alpha.screen.bottom = Math.max(alpha.screen.bottom,p.y+halfY);
      if (a > 30 && worldX >= scene.gate.x-scene.gate.width/2 && worldX <= scene.gate.x+scene.gate.width/2 && worldY >= scene.gate.y-scene.gate.height && worldY <= scene.gate.y+35) alpha.gatePaint++;
      // This tests actual source paint projected through the live SVG transform,
      // never its broad U bounding box or an invented collision shape.
      if (a > 30) for (const t of targetRects) {
        const r=t.rect;
        if (p.x >= r.left && p.x < r.right && p.y >= r.top && p.y < r.bottom) { overlap[t.id].pixels++; overlap[t.id].maxAlpha=Math.max(overlap[t.id].maxAlpha,a); }
        const l=t.label;
        if(t.labelVisible&&p.x>=l.left&&p.x<l.right&&p.y>=l.top&&p.y<l.bottom){labelOverlap[t.id].pixels++;labelOverlap[t.id].maxAlpha=Math.max(labelOverlap[t.id].maxAlpha,a);}
      }
    }
    result.alpha = alpha; result.overlap = Object.entries(overlap).filter(([,e])=>e.pixels).map(([id,e])=>({id,...e}));
    result.labelOverlap=Object.entries(labelOverlap).filter(([,e])=>e.pixels).map(([id,e])=>({id,...e})); result.native = [img.naturalWidth,img.naturalHeight];
    result.registration = { x: scene.image.x, y: scene.image.y, scale: scene.image.scale,
      rendered: ["x","y","width","height"].map(attr => Number(back.querySelector("image").getAttribute(attr))),
      backTransform: back.getAttribute("transform"), frontTransform: front.getAttribute("transform") };
    return result;
  });
  currentEvidence=evidence;
  assert.equal(evidence.level, expectedLevel, "Wall uses Hall or pending target instead of its completed/transient level");
  assert.equal(evidence.targets.length, 23); assert.equal(evidence.layers.frontZ,"3"); assert.equal(evidence.layers.frontParent,"map-hotspots");
  assert.equal(evidence.layers.pointerEvents,"none"); assert.equal(evidence.layers.frontGroupPointer,"none");
  assert.equal(evidence.targets.find(t=>t.id==="wall-01").z,"4", "Gate target/label are not above foreground wall");
  assert.equal(evidence.layers.frontViewBox,evidence.layers.viewBox,"Front wall is not in the landscape world coordinate plane");
  evidence.layers.frontMatrix.forEach((n,i)=>assert(Math.abs(n-evidence.layers.matrix[i]) < .1,"Front SVG/world transform disagrees with landscape"));
  if (targets) {
    for (const t of evidence.targets) {
      assert(t.name && t.rect.width >= 43.9 && t.rect.height >= 43.9,"Unnamed/sub44 target: "+JSON.stringify(t));
      if(fit) assert(t.rect.left >= -.5 && t.rect.top >= -.5 && t.rect.right <= page.viewportSize().width+.5 && t.rect.bottom <= page.viewportSize().height+.5 && t.exposed,"Fit target clipped/intercepted: "+JSON.stringify(t));
    }
    if(fit) for(let i=0;i<evidence.targets.length;i++) for(let j=i+1;j<evidence.targets.length;j++) {
      const a=evidence.targets[i],b=evidence.targets[j];
      assert(!(Math.min(a.rect.right,b.rect.right)-Math.max(a.rect.left,b.rect.left)>.5 && Math.min(a.rect.bottom,b.rect.bottom)-Math.max(a.rect.top,b.rect.top)>.5),"Full Fit targets overlap: "+a.id+"/"+b.id);
    }
  }
  if(!expectedLevel) { assert.equal(evidence.layers.backImages,0);assert.equal(evidence.layers.frontImages,0);return evidence; }
  assert(evidence.scene.artRegistered); assert.deepEqual(evidence.scene.contour,expectedRoutes[evidence.scene.profile]);
  assert.deepEqual(evidence.native,[evidence.scene.image.width,evidence.scene.image.height],"PNG registration dimensions differ from actual asset");
  assert.equal(evidence.scene.towers.length,6); assert.equal(evidence.scene.gate.openingWidth,140); assert.equal(evidence.scene.gate.width,340);
  assert.equal(evidence.layers.backImages,1); assert.equal(evidence.layers.frontImages,1); assert.equal(evidence.layers.backHref,evidence.layers.frontHref,"Split layers must share identical registered paint");
  assert(evidence.alpha.pixels > 10000 && evidence.alpha.max >= 200,"PNG has no meaningful transparent wall paint");
  assert(evidence.alpha.pixels < evidence.native[0]*evidence.native[1]*.9,"Wall background is opaque rather than transparent");
  assert(evidence.alpha.gatePaint > 100,"Registered gate has no actual art");
  assert.deepEqual(evidence.overlap,[],"Actual wall alpha crosses complete non-wall sprite/target bounds: "+JSON.stringify(evidence.overlap));
  assert.deepEqual(evidence.labelOverlap,[],"Actual wall alpha crosses visible non-wall labels: "+JSON.stringify(evidence.labelOverlap));
  assert.equal(evidence.registration.backTransform,evidence.registration.frontTransform,"Depth split received independent pixel corrections");
  assert(evidence.registration.x === Math.round(evidence.registration.x) && evidence.registration.y === Math.round(evidence.registration.y),"Wall PNG anchors are not whole world units");
  assert(Math.abs(evidence.registration.rendered[2]/evidence.native[0]-evidence.registration.rendered[3]/evidence.native[1]) < 1e-7,"Wall image is stretched differently in X/Y");
  const gate = evidence.targets.find(t=>t.id==="wall-01").rect;
  assert(Math.abs(gate.x+gate.width/2-Math.round(gate.x+gate.width/2))<.01 && Math.abs(gate.y+gate.height/2-Math.round(gate.y+gate.height/2))<.01,"Gate ground anchor is not whole CSS pixels");
  if(fit) {
    const r=evidence.alpha.screen,size=page.viewportSize();
    assert(r.left>=-.5&&r.top>=-.5&&r.right<=size.width+.5&&r.bottom<=size.height+.5,"Full PNG wall paint cropped at Fit: "+JSON.stringify(r));
    if(size.width>=1024) assert(r.bottom<=size.height-64+.5,"Foreground wall covered by footer");
  }
  const art = evidence.scene.image.src, currentArtHash=hash(art);
  if(artHashes.has(art))assert.equal(currentArtHash,artHashes.get(art),"Registered PNG changed during QA");
  else artHashes.set(art,currentArtHash);
  return evidence;
}
async function gateClick(page) {
  const gate=page.locator('#town-core [data-plot="wall-01"]'); await gate.click();
  assert(await page.locator("#detail-panel").evaluate(node=>node.open));
  assert.match((await page.locator("#panel-title").textContent()).trim(),/wall/i,"Gate selected a different building");
  await q.close(page);
}
async function ideal(page, level) {
  await q.menu(page,'[data-panel="appearance"]'); await page.locator("#ideal-town-enabled").check();
  await page.locator("#ideal-town-level").evaluate((node,level)=>{node.value=String(level);node.dispatchEvent(new Event("input",{bubbles:true}));},level);
  await ready(page); assert.equal(await page.locator('#town-core [data-occupied="true"]').count(),23);
}
async function action(page,name) {
  const direct=page.locator(`[data-desktop-action="${name}"]:visible`).first();
  if(await direct.count()) await direct.click(); else {
    const opener=await page.locator('[data-desktop-action="options"]').isVisible()?'[data-desktop-action="options"]':"#toggle-actions";
    await page.locator(opener).click();
    const menuName={close:"toggle-map-view",fit:"toggle-map-view","zoom-in":"zoom-in",labels:"toggle-labels"}[name] || name;
    await page.locator("#"+menuName).scrollIntoViewIfNeeded();await page.locator("#"+menuName).click();
    if(await page.locator("#actions-menu").isVisible()) await page.locator("#close-actions").click();
  }
  await ready(page);
}
async function debugAligned(page) {
  await page.locator("#map-viewport").focus(); await page.keyboard.press("g");
  await page.locator('#town-debug-grid[data-enabled="true"]').waitFor({state:"visible"}); await ready(page);
  const data=await page.evaluate(()=>{
    const grid=document.querySelector("#town-debug-grid"),landscape=document.querySelector("#world-landscape"),front=document.querySelector("#town-wall-front-layer");
    const mat=node=>{const m=node.getScreenCTM();return [m.a,m.b,m.c,m.d,m.e,m.f];};
    return {box:grid.getAttribute("viewBox"),landscapeBox:landscape.getAttribute("viewBox"),frontBox:front.getAttribute("viewBox"),
      gridMatrix:mat(grid),landscapeMatrix:mat(landscape),frontMatrix:mat(front),collisions:document.querySelector("#debug-real-collisions").childElementCount,
      info:document.querySelector("#town-debug-info").textContent,pointerEvents:getComputedStyle(grid).pointerEvents};
  });
  assert.equal(data.box,data.landscapeBox);assert.equal(data.box,data.frontBox);
  for(const key of ["gridMatrix","frontMatrix"]) data[key].forEach((n,i)=>assert(Math.abs(n-data.landscapeMatrix[i])<.1,"Debug/front coordinate plane differs from live landscape"));
  assert.equal(data.collisions,0);assert.match(data.info,/not implemented/i);assert.equal(data.pointerEvents,"none");
  return data;
}

async function runCase(name,profile,state,callback,{debug=false}={}) {
  if(filter&&!name.includes(filter))return;
  currentEvidence=null;
  let run;
  try {
    run=activeRun=await q.create(browser,rawSeed(state),{viewport:{width:profile.width,height:profile.height}});
    run.page.setDefaultTimeout(20000);
    if(debug){await ready(run.page);await run.page.goto(q.base+"/?debug=1");await ready(run.page);}
    const original=await bytes(run.page),data=await callback(run.page,original);
    assert.deepEqual(run.errors,[],"Captured browser/asset errors");assert.deepEqual(await bytes(run.page),data?.finalBytes || original,"Fixture/legacy raw saved bytes changed");
    results.push({name,profile,status:"passed",...data,errors:run.errors});console.log("PASS "+name);
  } catch(error) {
    const diagnostic=run ? await screenshot(run.page,name+"-FAILED").catch(()=>null):null;
    const finding={name,profile,status:"failed",error:error.stack,diagnostic,evidence:currentEvidence,errors:run?.errors||[]};
    failures.push(finding);results.push(finding);console.error("FAIL "+name+": "+error.message);
  } finally {if(run)await run.context.close();activeRun=null;}
}

(async()=>{
  let fatal;
  try {
    await new Promise((resolve,reject)=>{server.once("error",reject);server.listen(0,"127.0.0.1",resolve);});
    process.argv[3]=`http://127.0.0.1:${server.address().port}`;
    q=require("./building-harness.cjs");
    const {chromium}=require(process.argv[2]||path.join(require("node:os").homedir(),".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright"));
    browser=await chromium.launch({headless:true,timeout:20000});
    for(const profile of profiles) for(const layout of layouts) await runCase(`${profile.id}-${layout}-50-fit`,profile,complete(50,layout),async(page)=>{
      const evidence=await inspect(page,50,{fit:true});await gateClick(page);
      let pinnedLabels;
      if(layout==="staggered"){await action(page,"labels");pinnedLabels=await inspect(page,50,{fit:true});await action(page,"labels");}
      const picture=await screenshot(page,`${profile.id}-${layout}-50-fit`);
      return {evidence,pinnedLabels,picture,scenario:"Isolated all-built-50 fixture, not saved Founder progress"};
    });
    await runCase("desktop-strength-and-transient",profiles[0],complete(1),async(page)=>{
      const timber=await inspect(page,1,{fit:true});assert.equal(timber.scene.material,"timber");const timberPicture=await screenshot(page,"desktop-timber1-fit");
      await seed(page,complete(20));const adobeBytes=await bytes(page),adobe=await inspect(page,20,{fit:true});assert.equal(adobe.scene.material,"adobe");const adobePicture=await screenshot(page,"desktop-adobe20-fit");
      const cost=q.cost(32),state=q.fixture({hallLevel:50,resources:q.subtract(q.supplies,cost),buildings:{"wall-01":{typeId:"town-wall",level:32}},
        construction:{buildingId:"wall-01",typeId:"town-wall",toLevel:33,startedAt:q.epoch-1000,endsAt:q.epoch+119000,paidCost:cost}});
      await seed(page,state);const original=await bytes(page),pending=await inspect(page,32);assert.equal(pending.scene.material,"adobe");
      await ideal(page,50);const idealEvidence=await inspect(page,50,{targets:false});assert.equal(idealEvidence.source,"ideal");assert.deepEqual(await bytes(page),original);
      await q.close(page);await inspect(page,32);await q.mode(page,"gameplay");await inspect(page,32);await q.mode(page,"dev");
      await q.menu(page,'[data-panel="appearance"]');await page.locator("#appearance-type").selectOption("town-wall");await page.locator("#appearance-level").selectOption("50");
      const preview=await inspect(page,50,{targets:false});assert.equal(preview.source,"preview");assert.deepEqual(await bytes(page),original);
      await q.close(page);await inspect(page,32);await page.reload();await ready(page);await inspect(page,32);
      return {timber,adobe,pending,idealLevel:idealEvidence.level,previewLevel:preview.level,pictures:[timberPicture,adobePicture],finalBytes:original,adobeSeedBytesRetained:!!adobeBytes[0],scenario:"Own completed wall32/Hall50/paid wall33 queue; temporary tests do not mutate raw v3 or legacy"};
    });
    await runCase("phone-materials-and-unbuilt",profiles[1],complete(1),async(page)=>{
      const timber=await inspect(page,1,{fit:true});assert.equal(timber.scene.material,"timber");const timberPicture=await screenshot(page,"phone-timber1-fit");
      await seed(page,complete(20));const adobe=await inspect(page,20,{fit:true});assert.equal(adobe.scene.material,"adobe");const adobePicture=await screenshot(page,"phone-adobe20-fit");
      const cost=q.cost(0),state=q.fixture({hallLevel:50,resources:q.subtract(q.supplies,cost),construction:{buildingId:"wall-01",typeId:"town-wall",toLevel:1,startedAt:q.epoch-1000,endsAt:q.epoch+119000,paidCost:cost}});
      await seed(page,state);const finalBytes=await bytes(page),unbuilt=await inspect(page,0,{fit:true});const unbuiltPicture=await screenshot(page,"phone-unfinished-first-wall-fit");
      return {timber,adobe,unbuilt,pictures:[timberPicture,adobePicture,unbuiltPicture],finalBytes};
    });
    await runCase("fresh-town-debug-plane",profiles[0],q.fixture(),async(page)=>{
      const fresh=await inspect(page,0,{fit:true}),original=await bytes(page),desktopGrid=await debugAligned(page),desktopPicture=await screenshot(page,"desktop-fresh-debug");
      await page.setViewportSize({width:390,height:844});await ready(page);await page.waitForFunction(()=>document.querySelector("#town-map").dataset.presentation==="compact");
      // Grid is still on after resize; toggle it off before the normal G assertion.
      await page.locator("#map-viewport").focus();await page.keyboard.press("g");await ready(page);
      const phoneFresh=await inspect(page,0,{fit:true}),phoneGrid=await debugAligned(page),phonePicture=await screenshot(page,"phone-fresh-debug");
      assert.deepEqual(await bytes(page),original);return {fresh,phoneFresh,desktopGrid,phoneGrid,pictures:[desktopPicture,phonePicture]};
    },{debug:true});
    await runCase("close-and-max-gate",profiles[0],complete(50),async(page)=>{
      const original=await bytes(page),poses=[];
      for(const profile of profiles){
        await page.setViewportSize({width:profile.width,height:profile.height});await ready(page);
        await action(page,"close");const closeEvidence=await inspect(page,50,{targets:false});
        for(let i=0;i<40;i++){
          const max=await page.locator("#town-map").getAttribute("data-zoom");if(Number(max)>=2.4)break;await action(page,"zoom-in");
        }
        assert.equal(Number(await page.locator("#town-map").getAttribute("data-zoom")),2.4);
        await page.locator('#town-core [data-plot="wall-01"]').evaluate(node=>{const viewport=document.querySelector("#map-viewport"),r=node.getBoundingClientRect(),v=viewport.getBoundingClientRect();viewport.scrollTo({left:viewport.scrollLeft+r.x+r.width/2-v.x-v.width/2,top:viewport.scrollTop+r.y+r.height/2-v.y-v.height/2,behavior:"instant"});});
        await ready(page);const maxEvidence=await inspect(page,50,{targets:false});const r=maxEvidence.targets.find(t=>t.id==="wall-01").rect;
        assert(r.width>=44&&r.height>=44&&maxEvidence.targets.find(t=>t.id==="wall-01").exposed,"Max gate cannot be selected");
        await gateClick(page);const picture=await screenshot(page,`${profile.id}-max-gate`);
        const p=maxEvidence.painting,v=maxEvidence.viewport;assert(p.left<v.left&&p.top<v.top&&p.right>v.right&&p.bottom>v.bottom,"Terrain image edge visible in close/max viewport");
        poses.push({profile,closeZoom:closeEvidence.zoom,maxZoom:maxEvidence.zoom,evidence:maxEvidence,picture});
      }
      assert.deepEqual(await bytes(page),original);return {poses};
    });
    assert(results.length>0,"No QA cases matched the requested filter");
    assert.deepEqual(hashes(),initialSources,"Runtime source changed during final QA; freeze it before rerun");
    for(const [file,value]of artHashes)assert.equal(hash(file),value,"Registered PNG changed during QA");
  } catch(error){fatal=error.stack;console.error(error);}
  finally{
    await cleanup();
    const receipt={status:fatal||failures.length?"failed":"passed",decision:"DEC-069",filter,startedAt,finishedAt:new Date().toISOString(),groups:results.length,
      passed:results.filter(r=>r.status==="passed").length,failed:failures.length,initialSources,finalSources:hashes(),artHashes:Object.fromEntries(artHashes),results,fatal,
      browserClosed:!browser||!browser.isConnected(),serverClosed:!server.listening,limitations:"Simulated Chromium, not physical phone, Safari, defence/collision or Founder aesthetic acceptance. Screenshot files require human/agent opening; assertions are not art approval."};
    const file=path.join(output,stem+"-receipt.json");fs.writeFileSync(file,JSON.stringify(receipt,null,2)+"\n",{flag:"wx"});
    console.log(JSON.stringify({status:receipt.status,groups:receipt.groups,passed:receipt.passed,failed:receipt.failed,receipt:file,browserClosed:receipt.browserClosed,serverClosed:receipt.serverClosed}));
    if(receipt.status!=="passed")process.exitCode=1;
  }
})();
