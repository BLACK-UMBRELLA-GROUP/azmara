"use strict";

// Isolated original-art review. Passing geometry never implies aesthetic approval.
const qa=require("./building-harness.cjs");
const scene=require("./oct11-scenery.cjs");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {chromium}=require(process.argv[2]||"playwright");
const {assert,create,fixture,settle,raw,saved,legacyKey,close,menu,picture,mode,openPlot,click}=qa;
const scope=process.env.AZMARA_V16_SCOPE||"visual";
assert(["visual","acceptance","diagnostic","atlas","max","local","state"].includes(scope));
const layouts=["staggered","grid","circle","avenues","garden-quarters"];
const profiles=[[1440,900],[1024,600],[390,844]];
const crops={palm:[21,33,288,436],cypress:[367,23,192,440],garden:[580,58,372,382],fountain:[954,132,286,294],planter:[22,834,291,366],lamp:[704,826,188,378]};
const sourceFiles=["app.js","building-art.js","progression.js","atlas.js","atlas.css","desktop.css","styles.css","index.html","assets/azmara-scenery-atlas-v1.png","assets/azmara-world-relief-v1.png","assets/azmara-region-terrain-v2.png","assets/progression/azmara-desert-desktop-level-1-v3.png","assets/progression/azmara-desert-compact-level-1-v3.png"];
const sourceHashes=()=>Object.fromEntries(sourceFiles.map(f=>[f,crypto.createHash("sha256").update(fs.readFileSync(path.resolve(__dirname,"..",f))).digest("hex")]));
const startedAt=new Date().toISOString(),initialSources=sourceHashes();
const results=[];
let groups=0;
const pass=label=>{groups++;console.log("PASS "+label);};
const bytes=async page=>[await raw(page),await raw(page,legacyKey)];
async function loaded(page){
  await settle(page);
  await page.locator("#town-scenery-decor image").evaluateAll(images=>Promise.all([...new Set(images.map(image=>image.getAttribute("href")))].map(async src=>{const image=new Image();image.src=src;await image.decode();})));
}
async function cleanShot(page,name){
  if(await page.locator("#toast").isVisible())await page.locator("#toast").waitFor({state:"hidden",timeout:10000});
  await loaded(page);await picture(page,name);
}
// This derives footprints from the actual CTM, then checks independently
// rasterized road-only alpha and the separately painted inline atlas crops.
async function paint(page,level){
  const result=await page.evaluate(async()=>{
    const overlay=document.querySelector("#town-terrain-overlay"),decor=document.querySelector("#town-scenery-decor"),base=document.querySelector("#town-terrain-art");
    const shown=overlay&&getComputedStyle(overlay).display!=="none"&&overlay.getAttribute("href");
    if(!shown)return{base:base.getAttribute("href"),bare:true,decorCount:decor.children.length};
    const doc=new DOMParser().parseFromString(decodeURIComponent(shown.split(",").slice(1).join(",")),"image/svg+xml"),svg=doc.documentElement;
    const [,,width,height]=svg.getAttribute("viewBox").split(/\s+/).map(Number);
    const roads=[...svg.querySelectorAll("[data-scenery-road]")].map(n=>({id:n.dataset.sceneryRoad,owner:n.dataset.plotOwner,quality:Number(n.dataset.roadQuality),material:Number(n.dataset.roadMaterial),width:Number(n.dataset.roadPaintedWidth)}));
    svg.querySelectorAll("[data-scenery-ground]").forEach(n=>n.remove());
    const img=new Image();img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(new XMLSerializer().serializeToString(svg));await img.decode();
    const c=document.createElement("canvas");c.width=width;c.height=height;const ctx=c.getContext("2d",{willReadFrequently:true});ctx.drawImage(img,0,0);const pixels=ctx.getImageData(0,0,width,height).data;
    const inv=overlay.getScreenCTM().inverse(),toNative=(x,y)=>{const p=new DOMPoint(x,y).matrixTransform(inv);return{x:(p.x-overlay.x.baseVal.value)/overlay.width.baseVal.value*width,y:(p.y-overlay.y.baseVal.value)/overlay.height.baseVal.value*height};};
    const footprints=[...document.querySelectorAll("#town-core .plot-marker")].map(n=>{const r=n.getBoundingClientRect(),a=toNative(r.x,r.y),b=toNative(r.right,r.bottom);let painted=0;for(let y=Math.max(0,Math.ceil(a.y));y<Math.min(height,Math.floor(b.y));y++)for(let x=Math.max(0,Math.ceil(a.x));x<Math.min(width,Math.floor(b.x));x++)if(pixels[(y*width+x)*4+3])painted++;return{id:n.dataset.plot,painted,x:a.x,y:a.y,width:b.x-a.x,height:b.y-a.y};});
    const blockers=[...document.querySelectorAll(".desktop-resource-panel,.desktop-advisers,.desktop-header,.desktop-compass,.desktop-rail,.town-identity,.actions-toggle")].filter(n=>n.getClientRects().length&&getComputedStyle(n).display!=="none").map(n=>({kind:n.className,rect:n.getBoundingClientRect().toJSON()}));
    const ornaments=[...decor.querySelectorAll("[data-scenery-ornament]")].map(n=>{
      const bounds=n.dataset.decorBounds.split(",").map(Number),renderBounds=n.dataset.decorRenderBounds.split(",").map(Number),nested=n.querySelector("svg"),ground=n.dataset.decorGround.split(",").map(Number);
      // getBoundingClientRect on nested SVG includes the full atlas image's
      // unpainted overflow extent. The actual crop viewport is its explicit
      // native render rectangle transformed by its parent, not that extent.
      const matrix=decor.getScreenCTM(),a=new DOMPoint(renderBounds[0],renderBounds[1]).matrixTransform(matrix),z=new DOMPoint(renderBounds[0]+renderBounds[2],renderBounds[1]+renderBounds[3]).matrixTransform(matrix);
      const r={x:a.x,y:a.y,width:z.x-a.x,height:z.y-a.y,right:z.x,bottom:z.y,toJSON(){return{x:this.x,y:this.y,width:this.width,height:this.height,right:this.right,bottom:this.bottom};}};
      const clipped=blockers.filter(b=>Math.min(r.right,b.rect.right)>Math.max(r.x,b.rect.x)&&Math.min(r.bottom,b.rect.bottom)>Math.max(r.y,b.rect.y));
      return{kind:n.dataset.sceneryOrnament,source:n.dataset.decorSource,crop:n.dataset.decorRect.split(",").map(Number),bounds,renderBounds,ground,viewBox:nested.getAttribute("viewBox"),aspect:nested.getAttribute("preserveAspectRatio"),screen:r.toJSON(),blockers:clipped.map(b=>b.kind),onScreen:r.x>=0&&r.y>=0&&r.right<=innerWidth&&r.bottom<=innerHeight};
    });
    let painted=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i])painted++;
    return{base:base.getAttribute("href"),bare:false,width,height,roads,footprints,ornaments,painted,blockers:blockers.map(b=>{const a=toNative(b.rect.x,b.rect.y),z=toNative(b.rect.right,b.rect.bottom);return{...b,native:{x:(a.x+z.x)/2,y:(a.y+z.y)/2,width:z.x-a.x,height:z.y-a.y}};}),canals:svg.querySelectorAll("[data-scenery-canal]").length};
  });
  assert.match(result.base,/azmara-desert-(desktop|compact)-level-1-v3\.png$/);
  if(level===1){assert(result.bare&&result.decorCount===0,"Bare1 already has civic streets/decor");return result;}
  assert(!result.bare&&result.roads.length>0&&result.painted>100);
  assert.equal(result.canals,0);assert.equal(result.footprints.length,23);
  assert.deepEqual(result.footprints.filter(p=>p.painted),[],"Actual painted roads cross full actual plot footprints");
  for(const road of result.roads)assert(road.width<=12,"Road exceeds final restrained maximum width: "+JSON.stringify(road));
  for(const o of result.ornaments){
    assert.deepEqual(o.crop,crops[o.kind],"Crop differs from independently approved six source bodies");
    assert.match(o.source,/azmara-scenery-atlas-v[12]\.png$/);assert.equal(o.aspect,"xMidYMax meet");
    assert.equal(o.viewBox,o.crop.join(" "));
    const [x,y,w,h]=o.bounds,[rx,ry,rw,rh]=o.renderBounds;
    assert(rx>=x-.01&&ry>=y-.01&&rx+rw<=x+w+.01&&ry+rh<=y+h+.01,"Paint exceeds conservative decor reserve");
    assert(Math.abs(o.ground[0]-(rx+rw/2))<.02&&Math.abs(o.ground[1]-(ry+rh))<.02,"Raster body loses its native bottom-centre grounding");
    for(const p of result.footprints)assert(!(Math.min(x+w,p.x+p.width)-Math.max(x,p.x)>.1&&Math.min(y+h,p.y+p.height)-Math.max(y,p.y)>.1),"Full decor reserve overlaps actual plot: "+o.kind+"/"+p.id);
  }
  if(level===50&&scope!=="diagnostic"){
    for(const kind of ["garden","palm","fountain"])assert(result.ornaments.some(o=>o.kind===kind),"Metropolis missing core raster "+kind);
    if(scope==="acceptance"){
      assert.deepEqual(result.ornaments.filter(o=>o.blockers.length),[],"Actual decorative crop viewport is painted beneath persistent HUD/footer/rail");
      for(const kind of ["garden","palm","fountain"])assert(result.ornaments.some(o=>o.kind===kind&&o.onScreen&&!o.blockers.length),"Default Fit metropolis has no fully visible core raster "+kind);
    }
  }
  return result;
}
async function decorPaint(page){
  const original=await page.locator("#town-scenery-decor").getAttribute("style");
  const visible=await page.screenshot({scale:"css"});
  await page.locator("#town-scenery-decor").evaluate(n=>n.style.setProperty("visibility","hidden","important"));
  let hidden;try{hidden=await page.screenshot({scale:"css"});}finally{await page.locator("#town-scenery-decor").evaluate((n,s)=>s===null?n.removeAttribute("style"):n.setAttribute("style",s),original);}
  const changed=await page.evaluate(async({visible,hidden})=>{
    const read=async s=>{const i=new Image();i.src="data:image/png;base64,"+s;await i.decode();const c=document.createElement("canvas");c.width=i.naturalWidth;c.height=i.naturalHeight;const ctx=c.getContext("2d");ctx.drawImage(i,0,0);return ctx.getImageData(0,0,c.width,c.height).data;};
    const a=await read(visible),b=await read(hidden);let changed=0;for(let i=0;i<a.length;i+=4)if([0,1,2].some(k=>Math.abs(a[i+k]-b[i+k])>=8))changed++;return changed;
  },{visible:visible.toString("base64"),hidden:hidden.toString("base64")});
  assert(changed>100,"Inline atlas decor exists in metadata but contributes no actual paint: "+changed);return changed;
}
async function decorMaterials(page){
  const materials=await page.evaluate(async()=>{
    const parent=document.querySelector("#town-scenery-decor"),matrix=parent.getScreenCTM();
    const blockers=[...document.querySelectorAll(".desktop-resource-panel,.desktop-advisers,.desktop-header,.desktop-compass,.desktop-rail,.town-identity,.actions-toggle,#toast")].filter(n=>!n.hidden&&n.getClientRects().length&&getComputedStyle(n).display!=="none").map(n=>n.getBoundingClientRect());
    const cache=new Map(),out=[];
    for(const node of parent.querySelectorAll("[data-scenery-ornament]")){
      const rect=node.dataset.decorRect.split(",").map(Number),bounds=node.dataset.decorRenderBounds.split(",").map(Number),source=node.dataset.decorSource;
      const clip=node.querySelector("clipPath rect"),image=node.querySelector("image");
      const clipping=clip?[["x",0],["y",1],["width",2],["height",3]].every(([key,i])=>Number(clip.getAttribute(key))===rect[i])&&/^url\(#.+\)$/.test(image.getAttribute("clip-path")||""):false;
      if(!cache.has(source)){const img=new Image();img.src=source;await img.decode();cache.set(source,img);}
      const img=cache.get(source),a=new DOMPoint(bounds[0],bounds[1]).matrixTransform(matrix),z=new DOMPoint(bounds[0]+bounds[2],bounds[1]+bounds[3]).matrixTransform(matrix);
      const ratio=Math.min(bounds[2]/rect[2],bounds[3]/rect[3]),nativeOrigin=new DOMPoint(bounds[0]+(bounds[2]-rect[2]*ratio)/2,bounds[1]+bounds[3]-rect[3]*ratio).matrixTransform(matrix),nativeEnd=new DOMPoint(bounds[0]+(bounds[2]+rect[2]*ratio)/2,bounds[1]+bounds[3]).matrixTransform(matrix);
      const paint={x:nativeOrigin.x,y:nativeOrigin.y,width:nativeEnd.x-nativeOrigin.x,height:nativeEnd.y-nativeOrigin.y};
      const origin={x:Math.floor(paint.x),y:Math.floor(paint.y)},c=document.createElement("canvas");c.width=Math.ceil(paint.width)+2;c.height=Math.ceil(paint.height)+2;
      const ctx=c.getContext("2d",{willReadFrequently:true});ctx.imageSmoothingQuality="high";ctx.drawImage(img,...rect,paint.x-origin.x,paint.y-origin.y,paint.width,paint.height);
      const candidates=[];for(let y=2;y<c.height-2;y++)for(let x=2;x<c.width-2;x++){
        const sx=origin.x+x+.5,sy=origin.y+y+.5;if(sx<2||sy<2||sx>=innerWidth-2||sy>=innerHeight-2||blockers.some(r=>sx>=r.x-2&&sx<=r.right+2&&sy>=r.y-2&&sy<=r.bottom+2))continue;
        const rgba=ctx.getImageData(x-1,y-1,3,3).data;if([...Array(9).keys()].some(i=>rgba[i*4+3]<245))continue;
        const colour=[0,1,2].map(k=>[...Array(9).keys()].reduce((sum,i)=>sum+rgba[i*4+k],0)/9);candidates.push({x:sx,y:sy,colour});
      }
      const samples=[];for(const dir of [1,-1]){candidates.sort((a,b)=>dir*(a.colour.reduce((s,v)=>s+v,0)-b.colour.reduce((s,v)=>s+v,0)));const p=candidates.find(p=>samples.every(s=>Math.hypot(s.x-p.x,s.y-p.y)>3));if(p)samples.push(p);}
      out.push({kind:node.dataset.sceneryOrnament,clipping,source,native:[img.naturalWidth,img.naturalHeight],samples});
    }return out;
  });
  for(const m of materials){assert(m.clipping,"Owned native source rectangle lacks explicit clip: "+m.kind);assert.deepEqual(m.native,[1254,1254]);}
  const visible=await page.screenshot({scale:"css"}),style=await page.locator("#town-scenery-decor").getAttribute("style");
  await page.locator("#town-scenery-decor").evaluate(n=>n.style.setProperty("visibility","hidden","important"));
  let hidden;try{hidden=await page.screenshot({scale:"css"});}finally{await page.locator("#town-scenery-decor").evaluate((n,s)=>s===null?n.removeAttribute("style"):n.setAttribute("style",s),style);}
  const proof=await page.evaluate(async({visible,hidden,materials})=>{
    const read=async s=>{const i=new Image();i.src="data:image/png;base64,"+s;await i.decode();const c=document.createElement("canvas");c.width=i.naturalWidth;c.height=i.naturalHeight;const ctx=c.getContext("2d");ctx.drawImage(i,0,0);return ctx;};
    const a=await read(visible),b=await read(hidden);return materials.map(m=>({...m,proof:m.samples.map(p=>{let difference=Infinity;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const r=a.getImageData(Math.floor(p.x)+dx-1,Math.floor(p.y)+dy-1,3,3).data,mean=[0,1,2].map(k=>[...Array(9).keys()].reduce((sum,i)=>sum+r[i*4+k],0)/9);difference=Math.min(difference,Math.max(...p.colour.map((v,i)=>Math.abs(v-mean[i]))));}const v=a.getImageData(Math.floor(p.x),Math.floor(p.y),1,1).data,h=b.getImageData(Math.floor(p.x),Math.floor(p.y),1,1).data;return{...p,difference,changed:[0,1,2].some(k=>Math.abs(v[k]-h[k])>=10)};})}));
  },{visible:visible.toString("base64"),hidden:hidden.toString("base64"),materials});
  assert(proof.some(m=>m.proof.length===2),"No complete native raster material samples are visible");
  for(const m of proof.filter(m=>m.proof.length===2)){assert(m.proof.every(p=>p.difference<=32),"Actual crop does not match source palette: "+JSON.stringify(m));assert(m.proof.some(p=>p.changed),"Actual raster body is covered/absent: "+m.kind);}
  return proof;
}
async function localApproach(page,quality){
  const evidence=await page.evaluate(()=>{
    const overlay=document.querySelector("#town-terrain-overlay"),original=overlay.getAttribute("href"),doc=new DOMParser().parseFromString(decodeURIComponent(original.split(",").slice(1).join(",")),"image/svg+xml"),group=doc.querySelector('[data-scenery-road="approach-general-10-local"]');
    if(!group)throw new Error("Fixed mixed-quality fixture lacks its safe general10 local approach");
    const numbers=group.querySelector("path").getAttribute("d").match(/-?\d+(?:\.\d+)?/g).map(Number),last=numbers.slice(-2),inv=overlay.getScreenCTM().inverse(),[,,width,height]=doc.documentElement.getAttribute("viewBox").split(/\s+/).map(Number),r=document.querySelector('[data-plot="general-10"]').getBoundingClientRect();
    const native=(x,y)=>{const p=new DOMPoint(x,y).matrixTransform(inv);return{x:(p.x-overlay.x.baseVal.value)/overlay.width.baseVal.value*width,y:(p.y-overlay.y.baseVal.value)/overlay.height.baseVal.value*height};},a=native(r.x,r.y),b=native(r.right,r.bottom);
    const evidence={owner:group.dataset.plotOwner,quality:Number(group.dataset.roadQuality),material:Number(group.dataset.roadMaterial),width:Number(group.dataset.roadPaintedWidth),last,footprint:{x:a.x,y:a.y,right:b.x,bottom:b.y},stops:[...group.querySelectorAll("stop")].map(n=>n.getAttribute("stop-color")),original};
    group.remove();evidence.without="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(new XMLSerializer().serializeToString(doc));return evidence;
  });
  assert.equal(evidence.owner,"general-10");assert.equal(evidence.quality,quality);assert(evidence.width<=5);
  const [x,y]=evidence.last,r=evidence.footprint;assert(x<r.x||x>r.right||y<r.y||y>r.bottom,"Local approach terminates under complete actual building footprint");
  assert.deepEqual(evidence.stops,["black","white"],"Local material lacks its endpoint blend mask");
  if(quality===5)assert(evidence.material<50,"Local building5 incorrectly inherits Hall50 marble");else assert.equal(evidence.material,50);
  const visible=await page.screenshot({scale:"css"});
  await page.locator("#town-terrain-overlay").evaluate(async(n,uri)=>{const i=new Image();i.src=uri;await i.decode();n.setAttribute("href",uri);},evidence.without);await settle(page);
  let hidden;try{hidden=await page.screenshot({scale:"css"});}finally{await page.locator("#town-terrain-overlay").evaluate((n,uri)=>n.setAttribute("href",uri),evidence.original);await settle(page);}
  const changed=await page.evaluate(async({visible,hidden})=>{const read=async s=>{const i=new Image();i.src="data:image/png;base64,"+s;await i.decode();const c=document.createElement("canvas");c.width=i.naturalWidth;c.height=i.naturalHeight;const ctx=c.getContext("2d");ctx.drawImage(i,0,0);return ctx.getImageData(0,0,c.width,c.height).data;};const a=await read(visible),b=await read(hidden);let changed=0;for(let i=0;i<a.length;i+=4)if([0,1,2].some(k=>Math.abs(a[i+k]-b[i+k])>=8))changed++;return changed;},{visible:visible.toString("base64"),hidden:hidden.toString("base64")});
  assert(changed>=5,"Mixed-quality approach is metadata-only, not actual native paint: "+changed);
  return{...evidence,original:undefined,without:undefined,changed};
}
async function capture(browser,state,size,name,layout="staggered"){
  const run=await create(browser,state,{viewport:{width:size[0],height:size[1]}});
  try{
    if(layout!=="staggered")await scene.chooseLayout(run.page,layout);
    await loaded(run.page);await scene.footer(run.page);
    await scene.targets(run.page,"#town-core .plot-marker",{fit:size[0]>=1024&&size[1]>=600});
    await cleanShot(run.page,name);assert.deepEqual(run.errors,[]);
    pass("review capture "+name+"; geometry/asset errors only, not aesthetic acceptance");
  }finally{await run.context.close();}
}

(async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    if(scope==="visual"){
      await capture(browser,fixture({townName:"Qamar"}),[1440,900],"v16-bare1-1440x900");
      const actual=scene.mixedFixture(50);actual.townName="Qamar";
      await capture(browser,actual,[1440,900],"v16-actual50-staggered-1440x900");
      await capture(browser,actual,[1440,900],"v16-actual50-grid-1440x900","grid");
      await capture(browser,actual,[390,844],"v16-actual50-staggered-390x844");
      const run=await create(browser,fixture({townName:"Qamar"}));
      try{
        const before=await bytes(run.page);
        await menu(run.page,'[data-panel="appearance"]');await run.page.locator("#ideal-town-enabled").check();
        await run.page.locator("#ideal-town-level").evaluate(input=>{input.value="50";input.dispatchEvent(new Event("input",{bubbles:true}));});await loaded(run.page);
        assert.equal(await run.page.locator("#ideal-town-value").textContent(),"Level 50");
        assert.equal(await run.page.locator('#town-core [data-occupied="true"]').count(),23);
        assert.deepEqual(await bytes(run.page),before);await picture(run.page,"v16-ideal50-1440x900");
        await close(run.page);assert.deepEqual(await bytes(run.page),before);
        assert.equal(await run.page.locator('#town-core [data-occupied="true"]').count(),1);assert.deepEqual(run.errors,[]);
        pass("Ideal50 capture restores actual Hall1 and exact progress bytes");
      }finally{await run.context.close();}
    }else if(["acceptance","diagnostic"].includes(scope)){
      for(const size of profiles.filter(p=>!process.env.AZMARA_V16_PROFILE||p.join("x")===process.env.AZMARA_V16_PROFILE))for(const layout of layouts.filter(l=>!process.env.AZMARA_V16_LAYOUT||l===process.env.AZMARA_V16_LAYOUT)){
        const run=await create(browser,scene.mixedFixture(50),{viewport:{width:size[0],height:size[1]}});
        try{
          if(layout!=="staggered")await scene.chooseLayout(run.page,layout);await loaded(run.page);
          await scene.footer(run.page);const geometry=await scene.targets(run.page,"#town-core .plot-marker",{fit:size[0]>=1024});
          const before=await bytes(run.page),evidence=await paint(run.page,50),changed=await decorPaint(run.page),materials=scope==="acceptance"?await decorMaterials(run.page):[];
          assert.deepEqual(await bytes(run.page),before);assert.deepEqual(run.errors,[]);
          results.push({layout,profile:size,geometry,evidence,changed,materials,optionalPalette:Object.fromEntries(["planter","lamp","cypress"].map(k=>[k,evidence.ornaments.filter(o=>o.kind===k).length]))});
          await cleanShot(run.page,`v16-final50-${layout}-${size.join("x")}`);
          if(scope==="acceptance"){
            await scene.setHall(run.page,1);await loaded(run.page);await paint(run.page,1);
            await scene.targets(run.page,"#town-core .plot-marker",{fit:size[0]>=1024});
          }
          pass(`${layout} ${size.join("x")}: actual23 full footprints, road alpha, raster reserves/source, hide/show paint${scope==="acceptance"?", Hall1 bare":""}`);
        }finally{await run.context.close();}
      }
    }else if(scope==="max"){
      for(const size of [[1440,900],[390,844]]){const run=await create(browser,scene.mixedFixture(50),{viewport:{width:size[0],height:size[1]}});try{await loaded(run.page);await scene.maxZoom(run.page,paint);assert.deepEqual(run.errors,[]);pass("All23 maximum2.4 native material/grounding and44px selection cores "+size.join("x"));}finally{await run.context.close();}}
    }else if(scope==="atlas"){
      for(const size of profiles){const run=await create(browser,fixture(),{viewport:{width:size[0],height:size[1]}});try{const before=await bytes(run.page);await scene.atlasPlane(run.page);assert.deepEqual(await bytes(run.page),before);assert.deepEqual(run.errors,[]);pass("Continuous painted Region/World, actual coordinate plane, finite axes and exact navigation bytes "+size.join("x"));}finally{await run.context.close();}}
    }else if(scope==="state"){
      for(const size of [[1440,900],[390,844]]){
        const seed=fixture({hallLevel:4,resources:{coins:99040,timber:99480,stone:99600},construction:{buildingId:"general-01",toLevel:5,startedAt:qa.epoch,endsAt:qa.epoch+120000,paidCost:{coins:960,timber:520,stone:400}}});
        const run=await create(browser," \n"+JSON.stringify(seed,null,2)+" \n",{viewport:{width:size[0],height:size[1]}});
        try{const before=await bytes(run.page);await menu(run.page,'[data-panel="appearance"]');await run.page.locator("#ideal-town-enabled").check();for(const value of [1,22,50]){await run.page.locator("#ideal-town-level").evaluate((n,v)=>{n.value=String(v);n.dispatchEvent(new Event("input",{bubbles:true}));},value);await loaded(run.page);assert.equal(await run.page.locator('#town-core [data-occupied="true"]').count(),23);assert.deepEqual(await bytes(run.page),before);}await cleanShot(run.page,`v16-final-ideal50-${size.join("x")}`);await close(run.page);assert.deepEqual(await bytes(run.page),before);assert.equal(await run.page.locator('#town-core [data-occupied="true"]').count(),1);await mode(run.page,"gameplay");await mode(run.page,"dev");await run.page.setViewportSize({width:1024,height:600});await loaded(run.page);assert.deepEqual(await bytes(run.page),before);await scene.chooseLayout(run.page,"grid");const after=await saved(run.page);delete after.plotLayout;assert.deepEqual(after,seed);assert.equal(await raw(run.page,legacyKey),before[1]);assert.deepEqual(run.errors,[]);pass("Ideal1/22/50, modes, resize and layout preserve active paid project and exact untouched bytes "+size.join("x"));}finally{await run.context.close();}
      }
      await capture(browser,fixture({townName:"Qamar"}),[1440,900],"v16-final-bare1-1440x900");
    }else if(scope==="local"){
      const run=await create(browser,fixture({hallLevel:50,buildings:{"general-10":{typeId:"trading-post",level:5}}}));
      try{const before=await saved(run.page),original=await bytes(run.page),low=await localApproach(run.page,5);assert.deepEqual(await bytes(run.page),original);await cleanShot(run.page,"v16-mixed-hall50-building5-1440x900");await openPlot(run.page,"general-10");await run.page.locator("#test-building-level").selectOption("50");await click(run.page,"#set-test-level");await close(run.page);const after=await saved(run.page);assert.deepEqual(after.resources,before.resources);assert.equal(after.construction,before.construction);assert.equal(after.hallLevel,50);const high=await localApproach(run.page,50);const final=await bytes(run.page);await run.page.reload();await loaded(run.page);assert.deepEqual(await bytes(run.page),final);await localApproach(run.page,50);assert.deepEqual(run.errors,[]);results.push({low,high});pass("Actual Hall50/building5 local lesser material, native paint removal, complete footprint endpoint; direct50 no charge/queue and stable reload");}finally{await run.context.close();}
    }else throw new Error("Unimplemented scope "+scope);
    assert.deepEqual(sourceHashes(),initialSources,"Runtime source changed during this acceptance run");
    if(process.env.AZMARA_QA_SCREENSHOTS)fs.writeFileSync(path.join(process.env.AZMARA_QA_SCREENSHOTS,`v16-${scope}-receipt.json`),JSON.stringify({scope,startedAt,finishedAt:new Date().toISOString(),sourceHashes:initialSources,groupsPassed:groups,browserErrors:0,aestheticApprovalClaimed:false,results},null,2));
    console.log(JSON.stringify({scope,groupsPassed:groups,browserErrors:0,aestheticApprovalClaimed:false}));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);if(process.env.AZMARA_QA_SCREENSHOTS)fs.writeFileSync(path.join(process.env.AZMARA_QA_SCREENSHOTS,`v16-${scope}-failed-${Date.now()}.json`),JSON.stringify({scope,groupsPassed:groups,failure:error.message,results},null,2));process.exitCode=1;});
