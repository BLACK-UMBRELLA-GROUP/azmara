"use strict";

// Isolated loopback acceptance checks for the full-screen desert atlas,
// south tool bar and Hall-led city scenery. Never touches a user's browser.
const qa = require("./building-harness.cjs");
const { chromium } = require(process.argv[2] || "playwright");
const { markerPoints, assertDrawnMarkers } = require("./marker-proof.cjs");
const { assert, ids, fixture, create, settle, raw, saved, key, legacyKey,
  legacyRaw, close, openPlot, click, mode, menu, picture } = qa;
const layouts = ["staggered", "grid", "circle", "avenues", "garden-quarters"];
const milestones = [1,5,8,12,17,22,28,34,41,45,50];
const coordinates = {
  "qamar-cove": [12, 7], "narin-shoals": [17, 10], "saffron-reach": [22, 6], "tamar-bay": [28, 9],
  "ashar-coast": [10, 15], "luma-atoll": [16, 18], "darya-sound": [23, 15], "farun-haven": [29, 19],
  "miran-keys": [11, 24], "sahir-cape": [18, 28], "suna-strand": [24, 25], "zafir-isle": [30, 27]
};
let groups = 0;
const errors = [];

function pass(label) { groups += 1; console.log("PASS " + label); }
async function bytes(page) { return [await raw(page), await raw(page, legacyKey)]; }
function mixedFixture(hallLevel=1){
  const ordinary=qa.types.filter(type=>type.role==="general"&&type.id!=="town-hall"),buildings={};
  for(let i=2;i<=19;i++)buildings[`general-${String(i).padStart(2,"0")}`]={typeId:ordinary[i-2].id,level:50};
  for(const[id,typeId]of[["wall-01","town-wall"],["harbour-01","trading-port"],["harbour-02","trading-port"],["freighter-01","dockyard"]])buildings[id]={typeId,level:50};
  return fixture({hallLevel,buildings});
}

async function targets(page, selector, { fit = true, overlap = true } = {}) {
  const result = await page.locator(selector).evaluateAll(nodes => nodes.map(node => {
    const r = node.getBoundingClientRect(), x = r.x + r.width / 2, y = r.y + r.height / 2;
    // Plots guarantee a full44px square. Rounded/circular UI targets guarantee
    // ≥44px bounds and an unobstructed44px diameter, not their cut-out corners.
    const samples = node.dataset.plot ? [[0, 0], [-21, -21], [21, -21], [-21, 21], [21, 21]] : [[0,0],[-21,0],[21,0],[0,-21],[0,21]];
    return { id: node.dataset.plot || node.dataset.atlasIsland || node.dataset.location || node.getAttribute("aria-label"),
      rect: r.toJSON(), named: Boolean(node.getAttribute("aria-label") || node.textContent.trim()),
      exposed: samples.every(([dx,dy]) => { const hit = document.elementFromPoint(x+dx,y+dy); return hit === node || node.contains(hit); }) };
  }));
  const { width, height } = page.viewportSize();
  for (const t of result) {
    assert(t.named && t.rect.width >= 43.9 && t.rect.height >= 43.9, "Unnamed/sub44 target: " + JSON.stringify(t));
    if (fit) assert(t.rect.x >= -.5 && t.rect.y >= -.5 && t.rect.right <= width + .5 && t.rect.bottom <= height + .5 && t.exposed, "Fit target is clipped/intercepted: " + JSON.stringify(t));
  }
  if (overlap) for (let a=0; a<result.length; a++) for (let b=a+1; b<result.length; b++) {
    const r=result[a].rect,s=result[b].rect;
    assert(!(Math.min(r.right,s.right)-Math.max(r.x,s.x)>.5 && Math.min(r.bottom,s.bottom)-Math.max(r.y,s.y)>.5), "Targets overlap: " + result[a].id + "/" + result[b].id);
  }
  return result;
}

async function footer(page) {
  const size = page.viewportSize();
  assert.doesNotMatch((await page.locator("#actions-menu").textContent()).replace(/\s+/g," "),/Browser-local demo.*Coins provisional/,"Removed duplicate disclaimer remains in the actions menu DOM");
  if (size.width < 1024 || size.height < 600) return;
  const geometry = await page.evaluate(() => {
    const r = selector => document.querySelector(selector).getBoundingClientRect().toJSON();
    return { bar:r(".desktop-header"), hud:r(".desktop-resource-panel"), advisers:r(".desktop-advisers"), camera:r(".desktop-compass"),
      footnote:document.querySelector(".desktop-resource-footnote")?getComputedStyle(document.querySelector(".desktop-resource-footnote")).display:"removed" };
  });
  assert.equal(geometry.bar.bottom, size.height);
  assert.equal(geometry.bar.height,64);
  assert.equal(geometry.hud.y,6); assert.equal(geometry.advisers.y,6);
  assert(["none","removed"].includes(geometry.footnote));
  assert(geometry.camera.y >= geometry.bar.y && geometry.camera.bottom <= size.height, "Zoom controls do not live in the south toolbar");
  const buttons = await targets(page, ".desktop-header button:visible, .desktop-compass button:visible");
  assert.equal(buttons.length,13,"Entire existing toolbar and five camera actions must remain accessible");
}

async function roadPixels(page, expectedLevel) {
  const result = await page.evaluate(async (expectedLevel) => {
    const overlay = document.querySelector("#town-terrain-overlay");
    const base = document.querySelector("#town-terrain-art");
    if (expectedLevel === 1) return { hidden:!overlay || getComputedStyle(overlay).display === "none", base:base.getAttribute("href") };
    const uri = overlay.getAttribute("href");
    if (!uri?.startsWith("data:image/svg+xml")) throw new Error("Missing actual rendered scenery SVG");
    const doc = new DOMParser().parseFromString(decodeURIComponent(uri.split(",").slice(1).join(",")),"image/svg+xml");
    const svg = doc.documentElement;
    const native = svg.getAttribute("viewBox").split(/\s+/).map(Number);
    const [,, width,height] = native;
    const counts = { roads:svg.querySelectorAll("[data-scenery-road]").length, canals:svg.querySelectorAll("[data-scenery-canal]").length };
    for (const kind of ["garden","palm","fountain","bench"]) counts[kind] = svg.querySelectorAll(`[data-scenery-ornament="${kind}"]`).length;
    svg.querySelectorAll("[data-scenery-ground], [data-scenery-ornament]").forEach(node=>node.remove());
    const image = new Image(); image.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(new XMLSerializer().serializeToString(svg)); await image.decode();
    const canvas=document.createElement("canvas"); canvas.width=width; canvas.height=height;
    const ctx=canvas.getContext("2d",{willReadFrequently:true}); ctx.drawImage(image,0,0,width,height);
    const data=ctx.getImageData(0,0,width,height).data;
    const matrix=overlay.getScreenCTM().inverse();
    const world={x:overlay.x.baseVal.value,y:overlay.y.baseVal.value,width:overlay.width.baseVal.value,height:overlay.height.baseVal.value};
    const aspect=overlay.getAttribute("preserveAspectRatio")||"xMidYMid meet";
    const ratio=aspect.includes("slice") ? Math.max(world.width/width,world.height/height) : Math.min(world.width/width,world.height/height);
    const scaleX=aspect==="none"?world.width/width:ratio,scaleY=aspect==="none"?world.height/height:ratio;
    const offset=aspect==="none"?{x:world.x,y:world.y}:{x:world.x+(world.width-width*ratio)/2,y:world.y+(world.height-height*ratio)/2};
    const convert=(x,y)=> { const p=new DOMPoint(x,y).matrixTransform(matrix); return {x:(p.x-offset.x)/scaleX,y:(p.y-offset.y)/scaleY}; };
    const footprints=[...document.querySelectorAll("#town-core .plot-marker")].map(node=>{
      const r=node.getBoundingClientRect(),a=convert(r.x,r.y),b=convert(r.right,r.bottom);
      let painted=0,maximumAlpha=0;
      for(let y=Math.max(0,Math.ceil(a.y));y<Math.min(height,Math.floor(b.y));y++) for(let x=Math.max(0,Math.ceil(a.x));x<Math.min(width,Math.floor(b.x));x++) {
        const alpha=data[(y*width+x)*4+3]; if(alpha){painted++;maximumAlpha=Math.max(maximumAlpha,alpha);}
      }
      return{id:node.dataset.plot,painted,maximumAlpha,rect:{x:a.x,y:a.y,width:b.x-a.x,height:b.y-a.y}};
    });
    let painted=0;for(let i=3;i<data.length;i+=4)if(data[i])painted++;
    return { base:base.getAttribute("href"),counts,footprints,painted,width,height,aspect };
  }, expectedLevel);
  assert.match(result.base,/azmara-desert-(desktop|compact)-level-1-v2\.png$/, "Old river/baked roads returned in the actual base painting");
  if(expectedLevel===1)assert(result.hidden,"Bare level1 already has urban scenery");
  else {
    assert(result.counts.roads>0 && result.painted>100,"City streets are not actually painted");
    assert.equal(result.footprints.length,23);
    assert.deepEqual(result.footprints.filter(p=>p.painted),[],"Actual road/canal alpha crosses actual plot footprints: "+JSON.stringify(result.footprints.filter(p=>p.painted)));
    assert.equal(result.counts.canals,0,"Land-only city still paints a connecting watercourse");
    if(expectedLevel===50) for(const kind of ["garden","palm","fountain","bench"])assert(result.counts[kind]>0,"Metropolis missing painted "+kind+": "+JSON.stringify(result.counts));
  }
  return result;
}

async function setHall(page,level) {
  await openPlot(page,"general-01");
  await page.locator("#test-building-level").selectOption(String(level));
  await click(page,"#set-test-level"); await close(page);
  assert.equal((await saved(page)).hallLevel,level);
}

async function chooseLayout(page,value) {
  await close(page);
  const advisor=page.locator('.desktop-adviser[data-panel="overview"]');
  if(await advisor.isVisible())await advisor.click();else await menu(page,'[data-panel="overview"]');
  const select=page.locator("#town-layout");
  assert.deepEqual(await select.locator("option").evaluateAll(nodes=>nodes.map(n=>n.value)),layouts,"Advisor does not offer exactly the five approved layouts");
  await select.selectOption(value); await click(page,"#apply-town-layout");await close(page);
  assert.equal((await saved(page)).plotLayout||"staggered",value);
  assert.equal(await page.locator("#town-map").getAttribute("data-plot-layout"),value);
}

async function openAtlas(page,view) {
  await close(page);
  const desktop=page.locator(`.desktop-hud [data-map-navigation="${view}"]`);
  if(await desktop.isVisible())await desktop.click(); else await menu(page,`[data-map-navigation="${view}"]`);
  await page.locator("#atlas-view img").evaluateAll(images=>Promise.all(images.map(image=>image.decode()))); await settle(page);
  assert.equal(await page.locator("#atlas-view").getAttribute("data-atlas-view"),view);
}

async function atlasPlane(page) {
  for(const view of ["island","world"]) {
    await openAtlas(page,view);
    const backing=await page.locator(".atlas-scenery").evaluate(async img=>{
      await img.decode();const r=img.getBoundingClientRect();
      const canvas=document.createElement("canvas");canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
      const ctx=canvas.getContext("2d");ctx.drawImage(img,0,0);const p=ctx.getImageData(0,0,canvas.width,canvas.height).data;
      let transparent=0;for(let i=3;i<p.length;i+=4)if(p[i]!==255)transparent++;
      const style=getComputedStyle(img);
      const painting=document.querySelector(".atlas-island-terrain, .atlas-world-terrain").getBoundingClientRect();
      const scale=Math.max(r.width/img.naturalWidth,r.height/img.naturalHeight),offsetX=r.x+(r.width-img.naturalWidth*scale)/2,offsetY=r.y+(r.height-img.naturalHeight*scale)/2;
      // CSS object-fit cover interpolates native material onto viewport pixels.
      // Sampling floor(nativeCoordinate) instead is wrong at high-contrast edges:
      // independently captured1440×900 native[61,39,15] renders[98,71,33],
      // exactly matching this CSS-sized source resample, not a recoloured map.
      const covered=document.createElement("canvas");covered.width=innerWidth;covered.height=innerHeight;
      const material=covered.getContext("2d");material.drawImage(img,offsetX,offsetY,img.naturalWidth*scale,img.naturalHeight*scale);
      const samples=[[8,innerHeight*.55],[innerWidth-8,innerHeight*.55],[8,innerHeight*.75],[innerWidth-8,innerHeight*.75]].filter(([x,y])=>x<painting.x-2||x>painting.right+2||y<painting.y-2||y>painting.bottom+2).map(([x,y])=>({x,y,colour:[...material.getImageData(Math.floor(x),Math.floor(y),1,1).data].slice(0,3),nativeFloor:[...ctx.getImageData(Math.floor((x-offsetX)/scale),Math.floor((y-offsetY)/scale),1,1).data].slice(0,3)}));
      return{rect:r.toJSON(),fit:style.objectFit,position:style.objectPosition,filter:style.filter,mask:style.maskImage,visible:style.display!=="none"&&style.visibility!=="hidden"&&Number(style.opacity)===1,transparent,samples};
    });
    const size=page.viewportSize();
    assert(backing.rect.x<=0&&backing.rect.y<=0&&backing.rect.right>=size.width&&backing.rect.bottom>=size.height&&backing.fit==="cover"&&backing.visible&&backing.transparent===0,"Painted desert fails to fill viewport");
    assert.equal(backing.position,"50% 50%");assert.equal(backing.filter,"none");assert.equal(backing.mask,"none");
    if(backing.samples.length){
      const shot=await page.screenshot({scale:"css"});
      await page.locator(".atlas-scenery").evaluate(img=>{img.style.visibility="hidden";});await settle(page);
      const hidden=await page.screenshot({scale:"css"});
      await page.locator(".atlas-scenery").evaluate(img=>{img.style.removeProperty("visibility");});await settle(page);
      const painted=await page.evaluate(async({base64,hidden,samples})=>{
        const decode=async data=>{const img=new Image();img.src="data:image/png;base64,"+data;await img.decode();const c=document.createElement("canvas");c.width=img.naturalWidth;c.height=img.naturalHeight;const ctx=c.getContext("2d");ctx.drawImage(img,0,0);return ctx;};
        const ctx=await decode(base64),absent=await decode(hidden);
        return samples.map(p=>({...p,actual:[...ctx.getImageData(Math.floor(p.x),Math.floor(p.y),1,1).data].slice(0,3),hidden:[...absent.getImageData(Math.floor(p.x),Math.floor(p.y),1,1).data].slice(0,3)}));
      },{base64:shot.toString("base64"),hidden:hidden.toString("base64"),samples:backing.samples});
      for(const p of painted)assert(p.colour.every((n,i)=>Math.abs(n-p.actual[i])<35),"Outer desert is not actually drawn from the original painted backing: "+JSON.stringify(p));
      assert(painted.some(p=>p.actual.some((n,i)=>Math.abs(n-p.hidden[i])>10)),"Native backing source is covered rather than actually exposed at the outer material samples");
    }
    if(view==="world") {
      const world=await page.locator("[data-atlas-island]").evaluateAll(nodes=>nodes.map(node=>({id:node.dataset.atlasIsland,r:node.getBoundingClientRect().toJSON()})));
      assert.deepEqual(world.map(n=>n.id).sort(),Object.keys(coordinates).sort());
      const byId=Object.fromEntries(world.map(n=>[n.id,n.r]));
      const centre=id=>({x:byId[id].x+byId[id].width/2,y:byId[id].y+byId[id].height/2});
      const start=centre("qamar-cove"), end=centre("narin-shoals"),unitX=(end.x-start.x)/5,unitY=(end.y-start.y)/3;
      assert(Math.abs(unitX-unitY)<.55,"World coordinate grid has unequal axes");
      for(const [id,[x,y]]of Object.entries(coordinates)){const c=centre(id);assert(Math.abs(c.x-start.x-(x-12)*unitX)<.6&&Math.abs(c.y-start.y-(y-7)*unitY)<.6,"Region is not placed at its actual world coordinates: "+id);}
      const bounds=await page.locator("#atlas-viewport").evaluate(v=>({x:v.scrollWidth-v.clientWidth,y:v.scrollHeight-v.clientHeight}));
      assert(bounds.x>0&&bounds.y>0,"Explore must scroll on both finite coordinate axes");
      await targets(page,"[data-atlas-island]",{fit:false});
      await page.locator("#atlas-viewport").evaluate(v=>v.scrollTo(1e9,1e9));await settle(page);
      const finite=await page.locator("#atlas-viewport").evaluate(v=>({x:v.scrollLeft,y:v.scrollTop,maxX:v.scrollWidth-v.clientWidth,maxY:v.scrollHeight-v.clientHeight}));
      assert(Math.abs(finite.x-finite.maxX)<=1&&Math.abs(finite.y-finite.maxY)<=1,"World camera escapes finite bounds");
      await page.locator(".atlas-camera-button").filter({hasText:/^Overview$/}).click();await settle(page);
      assert.equal(await page.locator("#atlas-view").getAttribute("data-world-overview"),"true");
      await targets(page,"[data-atlas-island]",{fit:await page.locator("#atlas-viewport").getAttribute("data-fit")==="true"});
    }
    await picture(page,`oct11-${view}-${size.width}x${size.height}`);
  }
}

async function maxZoom(page, inspectRoads=roadPixels) {
  if(page.viewportSize().width>=1024) {
    const zoom=page.locator('[data-desktop-action="zoom-in"]');
    for(let n=0;n<35&&!await zoom.isDisabled();n++)await zoom.click();
  } else {
    for(let n=0;n<35;n++) { await page.locator("#toggle-actions").click();const zoom=page.locator("#zoom-in");if(await zoom.isDisabled()){await page.keyboard.press("Escape");break;}await zoom.click();await page.keyboard.press("Escape"); }
  }
  await settle(page);assert.equal(Number(await page.locator("#town-map").getAttribute("data-zoom")),2.4);
  await inspectRoads(page,50);
  // Native material/crop samples only need deriving once at this fixed scale;
  // panning translates them, it cannot change a crop or sprite size.
  const sourcePoints=await markerPoints(page,true);
  assert.equal(sourcePoints.length,23);
  for(const id of ids) {
    await page.locator(`[data-plot="${id}"]`).evaluate(node=>{
      const v=document.querySelector("#map-viewport"),r=node.getBoundingClientRect();
      v.scrollTo({left:v.scrollLeft+r.x+r.width/2-v.clientWidth/2,top:v.scrollTop+r.y+r.height/2-v.clientHeight*.58,behavior:"instant"});
    });await settle(page);
    // At the maximum inspection zoom, a large Hall may exceed a compact
    // viewport. Its entire44px selection core must still remain reachable.
    const button=page.locator(`[data-plot="${id}"]`);
    const hit=await button.evaluate(node=>{const r=node.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return[[0,0],[-21,-21],[21,-21],[-21,21],[21,21]].every(([dx,dy])=>x+dx>=0&&y+dy>=0&&x+dx<innerWidth&&y+dy<innerHeight&&document.elementFromPoint(x+dx,y+dy)?.closest(".plot-marker")===node);});
    assert(hit,"Maxzoom native44px plot core is unreachable: "+id);
    const original=sourcePoints.find(p=>p.id===id);
    const actual=await page.locator(`[data-plot="${id}"]`).boundingBox();
    const dx=actual.x-original.rect.x,dy=actual.y-original.rect.y;
    const translated=original.samples.map(p=>({...p,x:p.x+dx,y:p.y+dy}));
    const visible=await button.evaluate((node,samples)=>samples.filter(p=>p.x>=2&&p.y>=2&&p.x<innerWidth-2&&p.y<innerHeight-2&&document.elementFromPoint(p.x,p.y)?.closest(".plot-marker")===node),translated);
    assert(visible.length>=2,"Maxzoom inspection has fewer than two real native material samples visible: "+id);
    const point={...original,samples:visible};
    const exposed=await page.locator(`[data-plot="${id}"]`).evaluate((node,samples)=>samples.every(p=>document.elementFromPoint(p.x,p.y)?.closest(".plot-marker")===node),point.samples);
    const points=[point];assert(original.inside&&exposed,"Native artwork samples are not inside their actual maxzoom target: "+id);
    await assertDrawnMarkers(page,points,true);
    if(["general-01","general-02","wall-01","harbour-01","freighter-01"].includes(id))await picture(page,`oct11-max-${id}-${page.viewportSize().width}x${page.viewportSize().height}`);
  }
}

module.exports={targets,footer,mixedFixture,setHall,chooseLayout,openAtlas,atlasPlane,maxZoom};

if(require.main===module)(async()=>{
  const browser=await chromium.launch({headless:true});
  try {
    const queued=fixture({hallLevel:4,resources:{coins:99040,timber:99480,stone:99600},construction:{buildingId:"general-01",toLevel:5,startedAt:qa.epoch,endsAt:qa.epoch+120000,paidCost:{coins:960,timber:520,stone:400}}});
    if(process.env.AZMARA_QA_SCOPE!=="atlas") {
    const retained=await create(browser," \n"+JSON.stringify(queued,null,2)+" \n");
    try {
      const original=await bytes(retained.page);
      await chooseLayout(retained.page,"staggered");assert.deepEqual(await bytes(retained.page),original,"Applying the already-active default rewrites valid save bytes");
      await chooseLayout(retained.page,"grid");
      let current=await saved(retained.page);delete current.plotLayout;assert.deepEqual(current,queued,"Layout changed levels, buildings, resources or active receipt/deadline");
      await mode(retained.page,"gameplay");await chooseLayout(retained.page,"circle");
      current=await saved(retained.page);delete current.plotLayout;assert.deepEqual(current,queued,"Gameplay layout choice changed simulation state");
      assert.equal(await raw(retained.page,legacyKey),legacyRaw);assert.deepEqual(retained.errors,[]);
      pass("Advisor layouts work in both modes while preserving queued project, paid receipt, levels, resources and legacy bytes");
    }finally{await retained.context.close();}
    for(const invalid of ["unapproved",{},["grid"],null]){
      const original=JSON.stringify(fixture({plotLayout:invalid})),run=await create(browser,original);
      try{
        assert.equal(await run.page.locator("#town-map").getAttribute("data-plot-layout"),"staggered");
        assert.equal(await raw(run.page),original,"Loading an invalid optional presentation field rewrites its saved document");
        assert.deepEqual(run.errors,[]);
      }finally{await run.context.close();}
    }
    pass("Unknown/malformed optional layouts fall back safely without polluting or rewriting saved progress");
    for(const viewport of[{width:1280,height:720},{width:390,height:844}]){
      const run=await create(browser,queued,{viewport});
      try{
        const before=await bytes(run.page),actualPose=await run.page.locator("#town-core .plot-marker").evaluateAll(nodes=>nodes.map(n=>({id:n.dataset.plot,r:n.getBoundingClientRect().toJSON(),occupied:n.dataset.occupied})));
        await menu(run.page,'[data-panel="appearance"]');await run.page.locator("#ideal-town-enabled").check();
        for(let level=1;level<=50;level++){
          await run.page.locator("#ideal-town-level").evaluate((input,level)=>{input.value=String(level);input.dispatchEvent(new Event("input",{bubbles:true}));},level);await settle(run.page);
          assert.equal(await run.page.locator("#ideal-town-value").textContent(),`Level ${level}`);
          const markers=await run.page.locator("#town-core .plot-marker").evaluateAll(nodes=>nodes.map(n=>({id:n.dataset.plot,type:n.dataset.buildingType,level:Number(n.dataset.buildingLevel),stage:Number(n.dataset.buildingStage)})));
          assert.equal(markers.length,23);assert(markers.every(n=>n.type&&n.level===level&&n.stage>=1&&n.stage<=11),"Ideal slider did not fill all23 at its exact completed level");
          if(milestones.includes(level))await roadPixels(run.page,level);
          assert.deepEqual(await bytes(run.page),before,"Ideal town changed saved progress, resources, receipt or construction deadline");
        }
        await picture(run.page,`oct11-ideal50-${viewport.width}x${viewport.height}`);
        await run.page.locator("#ideal-town-enabled").uncheck();await settle(run.page);
        assert.equal(await run.page.locator('#town-core [data-occupied="true"]').count(),1);
        await close(run.page);assert.deepEqual(await bytes(run.page),before);
        assert.deepEqual(await run.page.locator("#town-core .plot-marker").evaluateAll(nodes=>nodes.map(n=>({id:n.dataset.plot,r:n.getBoundingClientRect().toJSON(),occupied:n.dataset.occupied}))),actualPose,"Closing Ideal changed actual target registration");
        assert.deepEqual(run.errors,[]);pass(`all50 transient Ideal levels fill23 compatible sites and restore exact actual pose/queued-save bytes ${viewport.width}x${viewport.height}`);
      }finally{await run.context.close();}
    }
    for(const viewport of [{width:1280,height:720},{width:1500,height:600},{width:390,height:844}])for(const layout of layouts){
      const run=await create(browser,mixedFixture(),{viewport});
      try {
        const {page}=run;errors.push(...run.errors);
        await chooseLayout(page,layout);
        for(const level of milestones){
          await setHall(page,level);await footer(page);await targets(page,"#town-core .plot-marker",{fit:viewport.width>=1024});
          await roadPixels(page,level);
        }
        const before=await bytes(page);await page.reload();await settle(page);assert.deepEqual(await bytes(page),before);assert.equal((await saved(page)).plotLayout||"staggered",layout);
        await maxZoom(page);assert.deepEqual(await bytes(page),before,"Camera/scenery changed saved levels/resources/layout");
        assert.deepEqual(run.errors,[]);pass(`${layout}: all11 Hall scenery stages and23 maxzoom groundings ${viewport.width}x${viewport.height}`);
      }finally{await run.context.close();}
    }
    }
    for(const viewport of [{width:1024,height:600},{width:1440,height:900},{width:1920,height:1080},{width:2560,height:900},{width:390,height:844}]){
      const run=await create(browser,fixture({hallLevel:50}),{viewport});
      try {
        const {page}=run;await footer(page);await targets(page,"#town-core .plot-marker",{fit:viewport.width>=1024});await roadPixels(page,50);
        await picture(page,`oct11-town50-${viewport.width}x${viewport.height}`);
        const before=await bytes(page);await atlasPlane(page);await mode(page,"gameplay");await mode(page,"dev");
        await page.setViewportSize({width:viewport.width+1,height:viewport.height});await page.setViewportSize(viewport);await settle(page);
        assert.deepEqual(await bytes(page),before,"Read-only atlas/modes/resizing changed progress");
        await page.locator('[data-atlas-action="town"]').click();await settle(page);
        await setHall(page,1);await picture(page,`oct11-town1-${viewport.width}x${viewport.height}`);
        assert.deepEqual(run.errors,[]);pass(`full-screen Region/coordinate World, south toolbar and byte-stable exploration ${viewport.width}x${viewport.height}`);
      }finally{await run.context.close();}
    }
    const delivery=await create(browser,mixedFixture(50),{viewport:{width:1440,height:900}});
    try{
      await footer(delivery.page);await targets(delivery.page,"#town-core .plot-marker");await roadPixels(delivery.page,50);
      const native=await markerPoints(delivery.page,true);assert.equal(native.length,23);await assertDrawnMarkers(delivery.page,native,true);
      assert.equal(await delivery.page.locator('#town-core [data-occupied="true"]').count(),23);
      await picture(delivery.page,"oct11-all23-actual50-1440x900");assert.deepEqual(delivery.errors,[]);
      pass("uncluttered all23 actual level50 town preserves full targets and native material");
    }finally{await delivery.context.close();}
    assert.deepEqual(errors,[]);pass("zero browser, console or asset errors");
    console.log(`${groups} October11 scenery acceptance groups passed`);
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
