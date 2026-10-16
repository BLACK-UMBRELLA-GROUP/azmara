"use strict";

// Actual rendered lesser-building approach proof, never a user's saved town.
const {chromium}=require(process.argv[2]||"playwright");
const q=require("./building-harness.cjs");
const {assert,fixture,create,raw,saved,settle,openPlot,click,close,picture}=q;

async function approach(page,quality,lastColour){
  const evidence=await page.evaluate(async()=>{
    const overlay=document.querySelector("#town-terrain-overlay"),original=overlay.getAttribute("href");
    const doc=new DOMParser().parseFromString(decodeURIComponent(original.split(",").slice(1).join(",")),"image/svg+xml");
    const group=doc.querySelector('[data-scenery-road="approach-general-10-local"]');
    if(!group)throw new Error("Exact approved test plot lacks a safe painted local approach");
    const stops=[...group.querySelectorAll("stop")].map(n=>n.getAttribute("stop-color"));
    const paths=[...group.querySelectorAll("path")],numbers=paths[0].getAttribute("d").match(/-?\d+(?:\.\d+)?/g).map(Number),last=numbers.slice(-2);
    const image=document.createElement("img");image.src=original;await image.decode();
    const box=overlay.getBoundingClientRect(),native=doc.documentElement.getAttribute("viewBox").split(/\s+/).map(Number);
    const width=native[2],height=native[3],matrix=overlay.getScreenCTM().inverse(),plot=document.querySelector('[data-plot="general-10"]').getBoundingClientRect();
    const fromScreen=(x,y)=>{const p=new DOMPoint(x,y).matrixTransform(matrix);return{x:(p.x-overlay.x.baseVal.value)/overlay.width.baseVal.value*width,y:(p.y-overlay.y.baseVal.value)/overlay.height.baseVal.value*height};};
    const a=fromScreen(plot.x,plot.y),b=fromScreen(plot.right,plot.bottom);
    const result={quality:Number(group.dataset.roadQuality),owner:group.dataset.plotOwner,stops,last,plot:{x:a.x,y:a.y,right:b.x,bottom:b.y},original};
    group.remove();result.without="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(new XMLSerializer().serializeToString(doc));
    return result;
  });
  assert.equal(evidence.quality,quality);assert.equal(evidence.owner,"general-10");
  assert.deepEqual(evidence.stops,["#ebdebf",lastColour],"Local paving does not blend from Hall50 to the lesser completed building material");
  const [x,y]=evidence.last,r=evidence.plot;
  assert(x<r.x||x>r.right||y<r.y||y>r.bottom,"Local road endpoint crosses its full actual plot footprint");
  const visible=await page.screenshot({scale:"css"});
  await page.locator("#town-terrain-overlay").evaluate(async(node,uri)=>{const image=new Image();image.src=uri;await image.decode();node.setAttribute("href",uri);},evidence.without);await settle(page);
  let absent;
  try{absent=await page.screenshot({scale:"css"});}
  finally{await page.locator("#town-terrain-overlay").evaluate((node,uri)=>node.setAttribute("href",uri),evidence.original);await settle(page);}
  const changed=await page.evaluate(async({visible,absent})=>{
    const read=async(source)=>{const i=new Image();i.src="data:image/png;base64,"+source;await i.decode();const c=document.createElement("canvas");c.width=i.naturalWidth;c.height=i.naturalHeight;const ctx=c.getContext("2d");ctx.drawImage(i,0,0);return ctx.getImageData(0,0,c.width,c.height).data;};
    const a=await read(visible),b=await read(absent);let changed=0;for(let i=0;i<a.length;i+=4)if([0,1,2].some(k=>Math.abs(a[i+k]-b[i+k])>=8))changed++;return changed;
  },{visible:visible.toString("base64"),absent:absent.toString("base64")});
  assert(changed>=5,"Local approach exists in SVG metadata but is not actually painted: "+changed);
  return evidence;
}

(async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    const seed=fixture({hallLevel:50,buildings:{"general-10":{typeId:"trading-post",level:5}}});
    const {page,context,errors}=await create(browser,seed);
    try{
      const before=await saved(page),bytes=await raw(page);
      await approach(page,5,"#aa8654");assert.equal(await raw(page),bytes,"Read-only local approach inspection changed the actual save");
      await picture(page,"oct11-local-building5-hall50-1440x900");
      await openPlot(page,"general-10");await page.locator("#test-building-level").selectOption("50");await click(page,"#set-test-level");await close(page);
      const after=await saved(page);
      assert.deepEqual(after.resources,before.resources);assert.equal(after.construction,before.construction);assert.equal(after.hallLevel,50);assert.deepEqual(after.buildings["general-10"],{typeId:"trading-post",level:50});
      await approach(page,50,"#ebdebf");const final=await raw(page);
      await picture(page,"oct11-local-building50-hall50-1440x900");
      await page.reload();await settle(page);assert.equal(await raw(page),final);await approach(page,50,"#ebdebf");
      assert.deepEqual(errors,[]);console.log("PASS actual Hall50+building5 local quality5/earth material→direct50/marble material; painted SVG group removal proof, outside-footprint endpoint, no charge/queue and stable reload bytes");
    }finally{await context.close();}
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
