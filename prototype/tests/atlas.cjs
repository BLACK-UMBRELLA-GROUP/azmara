"use strict";

// Local isolated visual-atlas regression; no user Chrome or hosted credentials.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const buildingQa = require("./building-harness.cjs");
const { chromium } = require(process.argv[2] || "playwright");
const base = process.argv[3] || "http://127.0.0.1:4317";
assert(["localhost", "127.0.0.1", "[::1]"].includes(new URL(base).hostname), "Atlas QA is local-only");
const shots = process.env.AZMARA_QA_SCREENSHOTS;
if (shots) assert(fs.statSync(shots).isDirectory(), "Screenshot folder must already exist");
const key = "azmara-town-layout-v3";
const legacyKey = "azmara-town-design-v1";
const errors = [];
let groups = 0;

function observe(page) {
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => errors.push(request.url()));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("response", (response) => { if (response.status() >= 400) errors.push(response.status() + " " + response.url()); });
}

async function settle(page) {
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function decoded(page) {
  await page.locator("#atlas-view img").evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
  await settle(page);
}

async function worldOverview(page) {
  // Short viewports keep a minimum readable coordinate plane in Overview,
  // so its accessible label truthfully describes finite panning instead.
  await page.locator('.atlas-camera-button').filter({ hasText: /^Overview$/ }).click();
  await decoded(page);
  assert.equal(await page.locator("#atlas-view").getAttribute("data-world-overview"), "true");
}

async function load(context) {
  const page = await context.newPage();
  observe(page);
  assert.equal((await page.goto(base))?.status(), 200);
  await page.waitForFunction(() => Boolean(window.AzmaraAtlas && document.querySelector("#atlas-view")));
  await page.locator("#town-core img").evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
  await settle(page);
  return page;
}

async function open(page, view) {
  const desktop = await page.locator(`.desktop-hud [data-map-navigation="${view}"]`).first().isVisible();
  if (desktop) await page.locator(`.desktop-hud [data-map-navigation="${view}"]`).first().click();
  else {
    await page.locator("#toggle-actions").click();
    await page.locator(`#actions-menu [data-map-navigation="${view}"]`).click();
  }
  await page.waitForFunction((view) => document.querySelector("#atlas-view").dataset.atlasView === view && !document.querySelector("#atlas-view").hidden, view);
  await decoded(page);
  assert.equal(await page.locator("#atlas-camera").evaluate(camera=>!camera.hidden&&!camera.inert),true,"Escaped atlas camera did not follow active view visibility");
}

async function screenshot(page, filename) {
  if (await page.locator("#toast").isVisible()) await page.locator("#toast").waitFor({state:"hidden",timeout:10000});
  if (shots) await page.screenshot({ path: path.join(shots, filename + ".png"), scale: "css" });
}

async function assertAtlasIdentity(page) {
  const result=await page.locator(".atlas-identity").evaluate(identity=>{
    const box=identity.getBoundingClientRect();
    const panels=[...document.querySelectorAll(".desktop-resource-panel,.desktop-advisers")].filter(node=>node.getClientRects().length).map(node=>node.getBoundingClientRect());
    return{box:box.toJSON(),panels:panels.map(r=>r.toJSON()),title:identity.querySelector(".atlas-title").textContent};
  });
  assert(result.box.x>=0&&result.box.y>=0&&result.box.right<=page.viewportSize().width+.5&&result.box.bottom<=page.viewportSize().height+.5,"Atlas identity is clipped: "+JSON.stringify(result));
  for(const panel of result.panels)if(Math.min(result.box.right,panel.right)>Math.max(result.box.x,panel.x))assert(result.box.y-panel.bottom>=9.5,"Atlas identity is hidden beneath desktop HUD or lacks10px separation: "+JSON.stringify(result));
  assert(result.title.trim(),"Atlas lacks its geographical title");
}

async function assertPaintedCamera(page) {
  const camera=page.locator(".atlas-camera"),box=await camera.boundingBox(),style=await camera.getAttribute("style");
  const visible=await page.screenshot({scale:"css"});
  await camera.evaluate(node=>node.style.setProperty("visibility","hidden","important"));
  let hidden;try{hidden=await page.screenshot({scale:"css"});}finally{await camera.evaluate((node,style)=>style===null?node.removeAttribute("style"):node.setAttribute("style",style),style);}
  const changed=await page.evaluate(async({visible,hidden,box})=>{
    const decode=async(source)=>{const image=new Image();image.src="data:image/png;base64,"+source;await image.decode();const c=document.createElement("canvas");c.width=image.naturalWidth;c.height=image.naturalHeight;const ctx=c.getContext("2d");ctx.drawImage(image,0,0);return ctx;};
    const a=await decode(visible),b=await decode(hidden);let changed=0;
    for(let y=Math.max(0,Math.ceil(box.y));y<Math.min(innerHeight,Math.floor(box.y+box.height));y++)for(let x=Math.max(0,Math.ceil(box.x));x<Math.min(innerWidth,Math.floor(box.x+box.width));x++){const p=a.getImageData(x,y,1,1).data,q=b.getImageData(x,y,1,1).data;if([0,1,2].some(i=>Math.abs(p[i]-q[i])>=8))changed++;}
    return changed;
  },{visible:visible.toString("base64"),hidden:hidden.toString("base64"),box});
  assert(changed>=200,"Atlas camera is clickable in DOM but painted beneath another overlay: "+changed);
}

async function assertRegionPainting(page) {
  const samples = await page.locator(".atlas-island-terrain").evaluate(async image => {
    await image.decode();
    const native=document.createElement("canvas"); native.width=image.naturalWidth; native.height=image.naturalHeight;
    const nc=native.getContext("2d",{willReadFrequently:true}); nc.drawImage(image,0,0);
    const rgba=nc.getImageData(0,0,native.width,native.height).data;
    if (rgba.some((value,index)=>index%4===3&&value!==255)) throw new Error("Continental Region terrain is not fully opaque");
    const box=image.getBoundingClientRect(), origin={x:Math.floor(box.x),y:Math.floor(box.y)};
    const canvas=document.createElement("canvas"); canvas.width=Math.ceil(box.width)+2;canvas.height=Math.ceil(box.height)+2;
    const context=canvas.getContext("2d",{willReadFrequently:true});context.imageSmoothingQuality="high";
    context.drawImage(image,box.x-origin.x,box.y-origin.y,box.width,box.height);
    const stage=image.closest(".atlas-stage");
    const paintedOverlays=[...document.querySelectorAll(".atlas-identity,.atlas-node-label,#toast")].filter(node=>{
      const style=getComputedStyle(node);return !node.hidden&&style.display!=="none"&&style.visibility!=="hidden"&&Number(style.opacity)>0;
    }).map(node=>node.getBoundingClientRect());
    const selected=[];
    for (const [fx,fy] of [[.25,.35],[.7,.35],[.25,.7],[.7,.7]]) {
      const candidates=[];
      for(let y=Math.max(2,Math.ceil(-origin.y+2));y<Math.min(canvas.height-2,innerHeight-origin.y-2);y+=6)for(let x=Math.max(2,Math.ceil(-origin.x+2));x<Math.min(canvas.width-2,innerWidth-origin.x-2);x+=6){
        const sx=origin.x+x,sy=origin.y+y;
        // The outer6% intentionally blends the main Region into the full-screen
        // painted desert. Source-colour proof belongs to its unmasked interior;
        // separate acceptance proves the backing fills those blended edges.
        if(sx<box.x+box.width*.08||sx>box.right-box.width*.08||sy<box.y+box.height*.08||sy>box.bottom-box.height*.08)continue;
        // The decorative image deliberately has pointer-events:none. Uncovered
        // terrain therefore hits its stage, not the bitmap itself; exclude all
        // visible pointer-transparent labels/toasts independently as well.
        if(document.elementFromPoint(sx,sy)!==stage||paintedOverlays.some(r=>sx>=r.x-2&&sx<=r.right+2&&sy>=r.y-2&&sy<=r.bottom+2)||selected.some(p=>Math.hypot(p.x-sx,p.y-sy)<12))continue;
        candidates.push({x:sx,y:sy,colour:[...context.getImageData(x,y,1,1).data].slice(0,3),distance:Math.hypot(sx-innerWidth*fx,sy-innerHeight*fy)});
      }
      candidates.sort((a,b)=>a.distance-b.distance);if(!candidates[0])throw new Error("No exposed Region terrain material sample");selected.push(candidates[0]);
    }
    return selected;
  });
  const visible=await page.screenshot({scale:"css"});
  const art=page.locator(".atlas-island-terrain"), style=await art.getAttribute("style");
  await art.evaluate(image=>image.style.setProperty("visibility","hidden","important"));
  let hidden;try{hidden=await page.screenshot({scale:"css"});}finally{await art.evaluate((image,style)=>style===null?image.removeAttribute("style"):image.setAttribute("style",style),style);}
  const result=await page.evaluate(async({visible,hidden,samples})=>{
    const decode=async source=>{const image=new Image();image.src="data:image/png;base64,"+source;await image.decode();const canvas=document.createElement("canvas");canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;const ctx=canvas.getContext("2d");ctx.drawImage(image,0,0);return ctx;};
    const a=await decode(visible),b=await decode(hidden);let changed=0;const mismatch=[];
    for(const sample of samples){let match=false;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const p=a.getImageData(sample.x+dx,sample.y+dy,1,1).data;if(sample.colour.every((value,index)=>Math.abs(value-p[index])<=32))match=true;}
      if(!match)mismatch.push(sample);const p=a.getImageData(sample.x,sample.y,1,1).data,h=b.getImageData(sample.x,sample.y,1,1).data;if([0,1,2].some(i=>Math.abs(p[i]-h[i])>=10))changed++;
    }return{changed,mismatch};
  },{visible:visible.toString("base64"),hidden:hidden.toString("base64"),samples});
  assert.deepEqual(result.mismatch,[],"Region source material does not match the actual composite");
  assert(result.changed>=2,"Region terrain is in DOM but not visibly painted: "+JSON.stringify(result));
}

async function seed(context, townName = "Atlas QA town") {
  const now = Date.now();
  const state = { version: 3, layoutId: "town-23-v1", townName, resources: { coins: 1900, timber: 610, stone: 400 }, hallLevel: 4, construction: { buildingId: "general-01", toLevel: 5, startedAt: now, endsAt: now + 10000 } };
  const saved = JSON.stringify(state);
  const legacy = JSON.stringify({ version: 1, townName: "Legacy unchanged", resources: { coins: 9000 } });
  await context.addInitScript(({ now, key, legacyKey, saved, legacy, origin }) => {
    Date.now = () => now;
    if (location.origin === origin) {
      localStorage.setItem(key, saved);
      localStorage.setItem(legacyKey, legacy);
    }
  }, { now, key, legacyKey, saved, legacy, origin: new URL(base).origin });
  return { saved, legacy };
}

async function bytes(page) {
  return page.evaluate(({ key, legacyKey }) => ({ saved: localStorage.getItem(key), legacy: localStorage.getItem(legacyKey) }), { key, legacyKey });
}

async function assertUnchanged(page, expected) {
  assert.deepEqual(await bytes(page), expected, "Atlas changed a valid queued v3 save or legacy bytes");
}

async function inspectGeometry(page, selector, checkOverlap = true, pannable = false) {
  const targets = await page.locator(selector).evaluateAll((buttons) => buttons.map((button) => {
    const r = button.getBoundingClientRect();
    const x = r.x + r.width / 2;
    const y = r.y + r.height / 2;
    const hit = document.elementFromPoint(x, y);
    return { label: button.getAttribute("aria-label") || button.textContent, x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom, exposed: button === hit || button.contains(hit) };
  }));
  const size = page.viewportSize();
  const stage = pannable ? await page.locator(".atlas-stage").boundingBox() : null;
  targets.forEach((target) => {
    assert(target.width >= 43.9 && target.height >= 43.9, "Target smaller than 44px: " + target.label + " " + JSON.stringify(target));
    if (pannable) assert(stage && target.x >= stage.x - .5 && target.y >= stage.y - .5 && target.right <= stage.x + stage.width + .5 && target.bottom <= stage.y + stage.height + .5, "Overview target escapes the finite island: " + target.label + " " + JSON.stringify(target));
    else {
      assert(target.x >= -.5 && target.y >= -.5 && target.right <= size.width + .5 && target.bottom <= size.height + .5, "Fit target is off-screen: " + target.label + " " + JSON.stringify(target));
      assert(target.exposed, "HUD or another target covers: " + target.label + " " + JSON.stringify(target));
    }
  });
  if (checkOverlap) targets.forEach((a, index) => targets.slice(index + 1).forEach((b) => {
    const overlap = Math.min(a.right, b.right) - Math.max(a.x, b.x) > .5 && Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y) > .5;
    assert(!overlap, "Atlas targets overlap: " + a.label + " / " + b.label);
  }));
  if (pannable) {
    const viewport = page.locator("#atlas-viewport");
    const initial = await viewport.evaluate((v) => ({ left: v.scrollLeft, top: v.scrollTop }));
    const buttons = page.locator(selector);
    for (let index = 0; index < targets.length; index += 1) {
      const button = buttons.nth(index);
      await button.evaluate((button) => {
        const v = document.querySelector("#atlas-viewport");
        const r = button.getBoundingClientRect();
        const bounds = v.getBoundingClientRect();
        v.scrollTo({ left: v.scrollLeft + r.x + r.width / 2 - bounds.x - v.clientWidth / 2, top: v.scrollTop + r.y + r.height / 2 - bounds.y - v.clientHeight * .55, behavior: "instant" });
      });
      await settle(page);
      const reachable = await button.evaluate((button) => {
        const r = button.getBoundingClientRect();
        const v = document.querySelector("#atlas-viewport");
        const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        return { x: r.x, y: r.y, right: r.right, bottom: r.bottom, exposed: hit === button || button.contains(hit), bounded: v.scrollLeft >= 0 && v.scrollTop >= 0 && v.scrollLeft <= v.scrollWidth - v.clientWidth + 1 && v.scrollTop <= v.scrollHeight - v.clientHeight + 1 };
      });
      assert(reachable.bounded && reachable.x >= -.5 && reachable.y >= -.5 && reachable.right <= size.width + .5 && reachable.bottom <= size.height + .5 && reachable.exposed, "Compact Overview target cannot be reached by finite pan: " + targets[index].label + " " + JSON.stringify(reachable));
    }
    await viewport.evaluate((v, p) => v.scrollTo({ left: p.left, top: p.top, behavior: "instant" }), initial);
    await settle(page);
  }
  return targets;
}

async function assertIslandSlots(page, home) {
  const anchors = [[14,26],[44,10],[70,24],[87,28],[13,58],[24,42],[89,50],[46,77],[85,76],[29,26],[56,11],[24,62],[34,70],[77,40],[73,58],[61,88],[32,85]];
  const actual = JSON.parse((await bytes(page)).saved);
  const hallLevel = actual.hallPlaced === false ? 0 : actual.hallLevel;
  const schedule=[1,5,8,12,17,22,28,34,41,45,50],artLevels=[1,5,10,15,20,25,30,35,40,45,50];
  const milestone = schedule.filter(level=>level<=Math.max(1,hallLevel)).at(-1),artLevel=artLevels[schedule.indexOf(milestone)];
  const slots = await page.locator(".atlas-settlement").evaluateAll((buttons) => buttons.map((button) => {
    const image = button.querySelector("img");
    return { location: button.dataset.location, kind: button.dataset.settlementKind, town: button.dataset.atlasTown, label: button.getAttribute("aria-label"), loaded: image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0, source: image?.getAttribute("src"), x: parseFloat(button.style.getPropertyValue("--x")), y: parseFloat(button.style.getPropertyValue("--y")) };
  }));
  assert.equal(slots.length, 17, "Island must show 16 ordinary locations plus one premium reserve");
  assert.deepEqual(slots.map((slot) => Number(slot.location)).sort((a, b) => a - b), Array.from({ length: 17 }, (_, i) => i + 1), "Island locations must be unique 1–17");
  const ordinary = slots.filter((slot) => slot.kind === "ordinary");
  assert.equal(ordinary.length, 16);
  assert(ordinary.every((slot) => Number(slot.location) <= 16 && ["empty", "home"].includes(slot.town)), "Ordinary slots have invalid roles");
  assert.equal(ordinary.filter((slot) => slot.town === "home").length, home ? 1 : 0);
  assert.equal(ordinary.filter((slot) => slot.town === "empty").length, home ? 15 : 16);
  if (home) assert.equal(ordinary.find((slot) => slot.town === "home").location, "8", "Existing home-town location must remain ordinary slot 8");
  if (home) {
    assert.equal(await page.locator('[data-atlas-town="home"]').getAttribute("data-hall-level"),String(hallLevel));
    assert.equal(await page.locator('[data-atlas-town="home"]').getAttribute("data-hall-placed"),String(hallLevel>0));
    assert.equal(await page.locator('[data-atlas-town="home"]').getAttribute("data-art-stage"),String(schedule.indexOf(milestone)+1));
  }
  assert.deepEqual(slots.filter((slot) => slot.kind === "premium").map((slot) => ({ location: slot.location, town: slot.town })), [{ location: "17", town: "premium" }]);
  assert(slots.every((slot) => slot.loaded && slot.label), "Island slot has missing artwork or accessible name");
  for (const slot of slots) {
    assert.deepEqual([slot.x, slot.y], anchors[Number(slot.location) - 1], "Island location anchor changed: " + slot.location);
    assert.equal(slot.source, slot.town === "home" ? `assets/progression/azmara-hall-level-${artLevel}.png` : "assets/azmara-empty-plot-v4.png", "Region slot draws the wrong actual saved Hall or empty illustration");
  }
  assert.equal(await page.locator('.atlas-premium-location .atlas-premium-lock svg').count(), 1, "Premium preview must show a lock rather than a plus or unlock action");
  assert.equal(await page.locator("#atlas-view .atlas-empty-plus, #atlas-view .plot-plus, #atlas-view .empty-slot-plus").count(), 0, "Island still draws removed plot-plus overlays");
}

async function assertTown(page) {
  await page.waitForFunction(() => document.body.dataset.mapView === "town");
  assert.equal(await page.locator("#atlas-view").evaluate((root) => root.hidden && root.inert), true);
  assert.equal(await page.locator("#atlas-camera").evaluate(camera=>camera.hidden&&camera.inert),true,"Escaped camera retained visible/interactive controls in Town");
  const zoom=await page.locator("#atlas-view").getAttribute("data-zoom");
  await page.locator('[aria-label="Zoom in atlas"]').dispatchEvent("click");
  assert.equal(await page.locator("#atlas-view").getAttribute("data-zoom"),zoom,"Hidden camera forged click changed inactive atlas");
  assert.equal(await page.locator("#map-viewport").evaluate((viewport) => !viewport.hidden && !viewport.inert), true);
  assert.equal(await page.locator(".plot-marker").count(), 23);
  assert.equal(await page.locator('.plot-marker[data-occupied="true"]').count(), 1);
  assert.equal(await page.locator("#detail-panel").evaluate((dialog) => dialog.open), false);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    try {
      const expected = await seed(context);
      const page = await load(context);
      await assertTown(page);
      await open(page, "world");
      assert.equal(await page.locator("#map-viewport").evaluate((viewport) => viewport.hidden && viewport.inert), true);
      assert.equal(await page.locator("#atlas-view").evaluate((root) => !root.hidden && !root.inert), true);
      assert.equal(await page.locator("[data-atlas-island]").count(), 12);
      for (const type of ["clay", "silver", "grain", "iron"]) assert.equal(await page.locator(`[data-atlas-island][data-island-type="${type}"]`).count(), 3);
      assert((await page.locator(".atlas-island-resource").allTextContents()).every((text) => text.startsWith("Timber + ")));
      assert((await page.locator(".atlas-world-island").allTextContents()).every((text) => /Preview|Home region/.test(text)));
      assert.match(await page.locator(".atlas-subtitle").textContent(), /Fictional desert regions/);
      assert.equal(await page.locator('[data-atlas-action="island"]').textContent(), "Region");
      await assertUnchanged(page, expected);
      console.log("PASS hidden/inert view switching, 12 fictional islands, four categories and Timber everywhere"); groups += 1;

      const examples = { clay: "qamar-cove", silver: "narin-shoals", grain: "saffron-reach", iron: "tamar-bay" };
      for (const [type, id] of Object.entries(examples)) {
        if (await page.locator("#atlas-view").getAttribute("data-atlas-view") !== "world") await page.locator('[data-atlas-action="world"]').click();
        await page.locator(`[data-atlas-island="${id}"]`).click();
        await decoded(page);
        assert.equal(await page.locator("#atlas-view").getAttribute("data-atlas-view"), "island");
        assert.equal(await page.locator('.desktop-hud [data-map-navigation="island"]').getAttribute("aria-current"), "page", "Internal atlas navigation left the desktop active state stale");
        assert.equal(await page.locator("#atlas-view").getAttribute("data-island-id"), id);
        assert.equal(await page.locator("#atlas-view").getAttribute("data-island-type"), type);
        assert.equal(await page.locator("#atlas-view").getAttribute("data-region-id"), id);
        assert.equal(await page.locator("#atlas-view").getAttribute("data-region-type"), type);
        assert.equal(await page.locator("#atlas-view").getAttribute("data-region-label"), await page.locator("#atlas-title").textContent());
        assert.match(await page.locator(".atlas-subtitle").textContent(), /Shared region/);
        assert.deepEqual((await page.locator("[data-atlas-resource]").evaluateAll((nodes) => nodes.map((node) => node.dataset.atlasResource))).sort(), [type, "timber"].sort());
        await assertIslandSlots(page, type === "clay");
        await page.locator(`[data-atlas-resource="${type}"]`).click();
        await page.waitForFunction(() => document.querySelector("#detail-panel").open);
        const panelText = await page.locator("#panel-content").textContent();
        assert(panelText.includes("not working controls here") && panelText.includes("No resources are produced or spent"));
        assert.equal(await page.locator("#detail-panel input, #detail-panel select, #detail-panel form").count(), 0);
        await page.keyboard.press("Escape");
        await settle(page);
        assert.equal(await page.locator("#detail-panel").evaluate((dialog) => dialog.open), false);
        assert.equal(await page.evaluate(() => document.activeElement?.dataset.atlasResource), type, "Panel did not restore focus to the atlas site");
      }
      await assertUnchanged(page, expected);
      console.log("PASS all four island types, per-island two sites, truthful details and local focus restoration"); groups += 1;

      const premium = page.locator('[data-atlas-town="premium"][data-location="17"]');
      assert.match(await premium.getAttribute("aria-label"), /locked premium settlement preview/i);
      await premium.focus();
      assert.equal(await page.evaluate(() => document.activeElement?.dataset.location), "17", "Locked premium reserve cannot receive keyboard focus");
      await page.keyboard.press("Enter");
      await page.waitForFunction(() => document.querySelector("#detail-panel").open);
      assert.equal(await page.locator("#panel-title").textContent(), "Locked premium location");
      const premiumText = await page.locator("#panel-content").textContent();
      assert(premiumText.includes("Informational preview only") && premiumText.includes("Purchasing, unlocking, pricing, premium currency, ownership and settlement expansion are not implemented") && premiumText.includes("does not spend anything or change your saved town"));
      assert.equal(await page.locator("#panel-content button, #panel-content a, #panel-content input, #panel-content select, #panel-content form").count(), 0, "Premium preview must have no purchase, unlock, construction or submission controls");
      const premiumPose = await page.locator("#atlas-view").getAttribute("data-atlas-view");
      await page.locator('[data-atlas-action="town"]').dispatchEvent("click");
      assert.equal(await page.locator("#atlas-view").getAttribute("data-atlas-view"), premiumPose, "Premium informational modal did not gate atlas navigation");
      await assertUnchanged(page, expected);
      await page.keyboard.press("Escape");
      await settle(page);
      assert.equal(await page.evaluate(() => document.activeElement?.dataset.location), "17", "Premium modal did not restore focus to its locked reserve");
      console.log("PASS 16 ordinary locations plus unique locked premium reserve; keyboard-opened information only, no purchase or state mutation"); groups += 1;

      await page.locator('[data-atlas-town="empty"]').first().click();
      assert((await page.locator("#panel-content").textContent()).includes("not a final regional capacity"));
      const viewBefore = await page.locator("#atlas-view").getAttribute("data-atlas-view");
      const zoomBefore = await page.locator("#atlas-view").getAttribute("data-zoom");
      await page.locator('[aria-label="Zoom in atlas"]').dispatchEvent("click");
      await page.locator('[data-atlas-action="town"]').dispatchEvent("click");
      await page.locator('[data-atlas-action="world"]').dispatchEvent("click");
      assert.equal(await page.locator("#atlas-view").getAttribute("data-zoom"), zoomBefore);
      assert.equal(await page.locator("#atlas-view").getAttribute("data-atlas-view"), viewBefore);
      assert.equal(await page.locator("#detail-panel").evaluate((dialog) => dialog.open), true);
      await page.keyboard.press("Escape");
      await page.locator('[data-atlas-action="town"]').click();
      await assertTown(page);
      await assertUnchanged(page, expected);
      console.log("PASS illustrative locations, all atlas clicks gated by modal, saved-town return"); groups += 1;

      await open(page, "island");
      await page.locator('[data-atlas-action="world"]').click();
      await page.locator('[data-atlas-island="qamar-cove"]').click();
      await page.locator('[data-atlas-town="home"]').click();
      await assertTown(page);
      assert.equal(await page.locator("#desktop-town-name").textContent(), "Atlas QA town");
      assert.equal(await page.locator('[data-plot="general-01"] small').textContent(), "4");
      await assertUnchanged(page, expected);
      console.log("PASS own-town island marker opens the same saved town and active Hall queue"); groups += 1;

      await open(page, "world");
      const fitting = await page.locator("#atlas-view").getAttribute("data-zoom");
      await page.locator('[aria-label="Zoom in atlas"]').click();
      const close = Number(await page.locator("#atlas-view").getAttribute("data-zoom"));
      assert(close > Number(fitting) && close <= 1.13);
      for (let index = 0; index < 5; index += 1) await page.locator('[aria-label="Zoom in atlas"]').click();
      const pose = () => page.locator("#atlas-viewport").evaluate((v) => ({ left: v.scrollLeft, top: v.scrollTop, maxLeft: v.scrollWidth - v.clientWidth, maxTop: v.scrollHeight - v.clientHeight, dragging: v.dataset.dragging }));
      const before = await pose();
      const ground = await page.evaluate(() => {
        const viewport = document.querySelector("#atlas-viewport");
        for (const y of [.5, .65, .4, .75]) for (const x of [.5, .4, .6, .3, .7]) {
          const hit = document.elementFromPoint(innerWidth * x, innerHeight * y);
          if (hit && viewport.contains(hit) && !hit.closest("button")) return { x: innerWidth * x, y: innerHeight * y };
        }
        throw new Error("No open ocean drag start");
      });
      await page.mouse.move(ground.x, ground.y); await page.mouse.down();
      await page.mouse.move(ground.x - 70, ground.y - 60, { steps: 5 });
      assert.equal((await pose()).dragging, "true");
      await page.mouse.up();
      const after = await pose();
      assert(after.left > before.left && after.top > before.top, "Atlas drag did not pan both axes");
      assert(after.left >= 0 && after.left <= after.maxLeft && after.top >= 0 && after.top <= after.maxTop);
      assert.equal(after.dragging, "false");
      await page.locator("#atlas-viewport").focus();
      await page.keyboard.press("ArrowLeft");
      assert((await pose()).left < after.left);
      await page.evaluate(() => {
        window.__atlasNative = [];
        const viewport = document.querySelector("#atlas-viewport");
        for (const type of ["keydown", "wheel"]) {
          const event = type === "keydown" ? new KeyboardEvent(type, { key: "+", ctrlKey: true, bubbles: true, cancelable: true }) : new WheelEvent(type, { deltaY: -10, ctrlKey: true, bubbles: true, cancelable: true });
          viewport.dispatchEvent(event);
          window.__atlasNative.push(event.defaultPrevented);
        }
      });
      assert.deepEqual(await page.evaluate(() => window.__atlasNative), [false, false]);
      await worldOverview(page);
      assert.equal(await page.locator("#atlas-viewport").getAttribute("data-fit"), "true");
      await page.locator('[data-desktop-action="options"]').click();
      await page.waitForFunction(() => document.querySelector("#actions-menu").open);
      await page.locator('[aria-label="Zoom in atlas"]').dispatchEvent("click");
      await page.locator('[data-atlas-action="town"]').dispatchEvent("click");
      assert.equal(await page.locator("#atlas-viewport").getAttribute("data-fit"), "true", "Actions menu did not gate atlas zoom");
      assert.equal(await page.locator("#atlas-view").getAttribute("data-atlas-view"), "world", "Actions menu did not gate atlas view switching");
      await page.keyboard.press("Escape");
      await assertUnchanged(page, expected);
      console.log("PASS bounded zoom/drag/keyboard exploration, Fit and unmodified native Ctrl zoom"); groups += 1;
    } finally { await context.close(); }

    for (const [width, height] of [[1440, 900], [1864, 977], [1024, 600], [390, 844], [320, 568], [844, 390]]) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
      try {
        const page = await load(context);
        const initial = await bytes(page);
        await open(page, "world");
        await assertAtlasIdentity(page);
        assert.equal(await page.locator("#atlas-viewport").getAttribute("data-fit"), "false", "World must initially be a scrollable coordinate chart, not a static gallery");
        await inspectGeometry(page, "#atlas-view .atlas-world-island", true, true);
        await worldOverview(page);
        const worldPan = await page.locator("#atlas-viewport").getAttribute("data-fit") === "false";
        await inspectGeometry(page, "#atlas-view .atlas-world-island", true, worldPan);
        await inspectGeometry(page, "#atlas-view .atlas-nav-button, #atlas-camera .atlas-camera-button");
        await assertPaintedCamera(page);
        await screenshot(page, `atlas-world-${width}x${height}-fresh`);
        await page.locator('[data-atlas-island="qamar-cove"]').click();
        await decoded(page);
        await assertAtlasIdentity(page);
        await assertIslandSlots(page, true);
        const overview = await page.locator("#atlas-view").getAttribute("data-atlas-framing") === "overview";
        if (width < 1024 || height < 600) assert(overview, "Compact regions need a bounded Overview to keep44px targets separate");
        assert.equal(await page.locator("#atlas-viewport").getAttribute("data-fit"), String(!overview));
        assert.equal(await page.locator(".atlas-camera-button").filter({ hasText: overview ? "Overview" : /^Fit$/ }).getAttribute("aria-label"), overview ? "Reset region overview; pan to explore all locations" : "Fit the complete atlas view");
        const islandGeometry = await inspectGeometry(page, "#atlas-view .atlas-settlement, #atlas-view .atlas-resource-site", true, overview);
        assert.equal(islandGeometry.length, 19);
        await inspectGeometry(page, "#atlas-view .atlas-nav-button, #atlas-camera .atlas-camera-button");
        await assertPaintedCamera(page);
        if (overview) {
          const viewport = page.locator("#atlas-viewport");
          const pose = () => viewport.evaluate((v) => ({ left: v.scrollLeft, top: v.scrollTop, maxLeft: v.scrollWidth - v.clientWidth, maxTop: v.scrollHeight - v.clientHeight }));
          const before = await pose();
          assert(before.maxLeft > 0 || before.maxTop > 0, "Pannable Overview has no accessible scroll range");
          await viewport.focus();
          await page.keyboard.press("ArrowRight");
          await page.keyboard.press("ArrowDown");
          const after = await pose();
          if (before.maxLeft > 1) assert(after.left > before.left, "Overview cannot pan horizontally at minimum zoom");
          if (before.maxTop > 1) assert(after.top > before.top, "Overview cannot pan vertically at minimum zoom");
          assert(after.left >= 0 && after.left <= after.maxLeft && after.top >= 0 && after.top <= after.maxTop, "Overview keyboard pan escaped finite island bounds");
          await page.locator('[aria-label="Reset region overview; pan to explore all locations"]').click();
          const reset = await pose();
          assert(Math.abs(reset.left - before.left) <= 1 && Math.abs(reset.top - before.top) <= 1, "Overview reset did not restore its original bounded framing");
        }
        const islandArt = await page.locator(".atlas-island-terrain").evaluate((image) => ({ source: image.getAttribute("src"), naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight, width: image.getBoundingClientRect().width, height: image.getBoundingClientRect().height }));
        assert.equal(islandArt.source, "assets/azmara-region-terrain-v2.png");
        assert.equal(islandArt.naturalWidth,1536); assert.equal(islandArt.naturalHeight,1024);
        assert(islandArt.naturalWidth > 0 && islandArt.naturalHeight > 0 && Math.abs(islandArt.width / islandArt.height - islandArt.naturalWidth / islandArt.naturalHeight) < .001, "Island painting is missing or stretched");
        await assertRegionPainting(page);
        const emblems = await page.locator(".atlas-resource-emblem").evaluateAll((nodes) => nodes.map((node) => {
          const r = node.getBoundingClientRect();
          const button = node.closest("button").getBoundingClientRect();
          const frame=node.querySelector(".building-frame"),sprite=frame?.querySelector(".building-sprite"),painting=frame?.getBoundingClientRect();
          return { width: r.width, height: r.height, parentWidth: button.width, parentHeight: button.height,
            resource:node.closest("button").dataset.atlasResource,building:frame?.dataset.buildingArt,stage:frame?.dataset.artStage,
            source:sprite&&getComputedStyle(sprite).backgroundImage,painting:painting?.toJSON(),button:button.toJSON() };
        }));
        const camps={timber:"foresters-house",clay:"clayworks",silver:"silver-refinery",grain:"grain-estate",iron:"iron-foundry"};
        assert.equal(emblems.length,2,"Shared Region lacks its two resource camp illustrations");
        for(const r of emblems){
          assert.equal(r.building,camps[r.resource]);assert.equal(r.stage,"1");
          assert(r.source?.includes(`azmara-${r.building}-stages-v2.png`),"Resource camp is not the registered original raster artwork");
          assert(r.height<=r.parentHeight+.5&&r.width<=r.parentWidth+.5&&r.painting.x>=r.button.x-.5&&r.painting.y>=r.button.y-.5&&r.painting.right<=r.button.right+.5&&r.painting.bottom<=r.button.bottom+.5,"Raster resource camp escapes its full accessible target: "+JSON.stringify(r));
        }
        await screenshot(page, `atlas-island-${width}x${height}-fresh`);
        await page.locator('[data-atlas-action="town"]').click();
        await assertTown(page);
        await screenshot(page, `atlas-town-${width}x${height}-fresh`);
        await assertUnchanged(page, initial);
        console.log(`PASS coordinate-world Explore/Overview, ${overview ? "bounded Region Overview" : "complete Region Fit"}, all 19 accessible loaded targets, town return and no save at ${width}x${height}`); groups += 1;
      } finally { await context.close(); }
    }

    for (const viewport of [{width:1440,height:900},{width:390,height:844}]) {
      const {context,page,errors:localErrors}=await buildingQa.create(browser,buildingQa.fixture(),{viewport});
      observe(page);
      try {
        await open(page,"island"); await assertIslandSlots(page,true);
        const initial=await buildingQa.raw(page);
        await buildingQa.menu(page,'[data-panel="appearance"]');
        await page.locator("#appearance-level").selectOption("50");await buildingQa.settle(page);
        assert.equal(await page.locator('[data-atlas-town="home"] img').getAttribute("src"),"assets/progression/azmara-hall-level-1.png","Transient appearance leaked into shared Region identity");
        assert.equal(await buildingQa.raw(page),initial);await buildingQa.close(page);
        await buildingQa.openPlot(page,"general-01");
        await page.locator("#test-building-level").selectOption("50");await buildingQa.click(page,"#set-test-level");
        assert.equal(await page.locator("#atlas-view").getAttribute("data-atlas-view"),"island","Local Hall tool unexpectedly switched the active Region");
        await buildingQa.close(page);await decoded(page);await assertIslandSlots(page,true);
        assert.equal(await page.locator('[data-atlas-town="home"] img').getAttribute("src"),"assets/progression/azmara-hall-level-50.png");
        const completed=await buildingQa.raw(page);await screenshot(page,`final-region-hall50-${viewport.width}x${viewport.height}`);
        await buildingQa.menu(page,'[data-panel="appearance"]');await page.locator("#appearance-level").selectOption("1");await buildingQa.settle(page);
        assert.equal(await page.locator('[data-atlas-town="home"] img').getAttribute("src"),"assets/progression/azmara-hall-level-50.png");
        assert.equal(await buildingQa.raw(page),completed);await buildingQa.close(page);
        await buildingQa.menu(page,'[data-panel="overview"]');await buildingQa.click(page,"#request-reset");await buildingQa.click(page,"#confirm-reset");
        await decoded(page);await assertIslandSlots(page,true);
        assert.equal(await page.locator('[data-atlas-town="home"]').getAttribute("data-hall-level"),"0","Reset Region icon falsely claims a built Hall");
        assert.equal(await page.locator('[data-atlas-town="home"]').getAttribute("data-hall-placed"),"false");
        const reset=await buildingQa.raw(page);await page.locator('[data-atlas-action="world"]').click();await page.locator('[data-atlas-island="qamar-cove"]').click();await decoded(page);await assertIslandSlots(page,true);
        assert.equal(await buildingQa.raw(page),reset);assert.equal(await buildingQa.raw(page,buildingQa.legacyKey),buildingQa.legacyRaw);assert.deepEqual(localErrors,[]);
        console.log(`PASS Region home follows only actual Hall1→50/reset0, never transient Dev art, and no navigation save at${viewport.width}x${viewport.height}`);groups++;
      }finally{await context.close();}
    }

    const context2 = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    try {
      const hostile = '<img src=x>';
      assert(hostile.length <= 20);
      const expected = await seed(context2, hostile);
      const page = await load(context2);
      await open(page, "island");
      assert.equal(await page.locator('[data-atlas-town="home"] .atlas-node-label').textContent(), hostile);
      assert.equal(await page.locator('[data-atlas-town="home"] .atlas-node-label img').count(), 0);
      await page.locator('[data-atlas-action="world"]').click();
      await page.locator('[aria-label="Zoom in atlas"]').click();
      await page.setViewportSize({ width: 390, height: 844 });
      await worldOverview(page);
      await settle(page);
      await inspectGeometry(page, "#atlas-view .atlas-world-island", true, await page.locator("#atlas-viewport").getAttribute("data-fit") === "false");
      await page.locator('[data-atlas-action="town"]').click();
      await assertTown(page);
      await assertUnchanged(page, expected);
      console.log("PASS safe user text, zoomed desktop-to-phone resize and unchanged save bytes"); groups += 1;
    } finally { await context2.close(); }

    assert.deepEqual(errors, [], "Console/page/network errors occurred");
    console.log(`PASS ${groups} atlas regression groups; no page, console or network errors`);
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
