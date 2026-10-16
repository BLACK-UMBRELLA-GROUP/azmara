"use strict";
// Read-only local compositor diagnostic; does not suppress failed acceptance.
const { chromium } = require(process.argv[2] || "playwright");
const q = require("./building-harness.cjs");
const { markerPoints } = require("./marker-proof.cjs");
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const { context, page, errors } = await q.create(browser, q.empty({ resources: { coins:2400, timber:760, stone:540 } }), {viewport:{width:390,height:844}});
    try {
      const before = await q.raw(page), points = await markerPoints(page,true);
      const shown = await page.screenshot({scale:"css"});
      await q.picture(page,"DIAGNOSTIC-final-desert-reset-390x844");
      const styles = await page.locator("#town-core .marker img").evaluateAll((images)=>images.map((image)=>{const style=image.getAttribute("style");image.style.visibility="hidden";return style;}));
      let hidden;
      try { hidden=await page.screenshot({scale:"css"}); }
      finally { await page.locator("#town-core .marker img").evaluateAll((images,styles)=>images.forEach((image,index)=>styles[index]===null?image.removeAttribute("style"):image.setAttribute("style",styles[index])),styles); }
      const result=await page.evaluate(async({shown,hidden,points})=>{
        const decode=async(base64)=>{const image=new Image();image.src="data:image/png;base64,"+base64;await image.decode();const canvas=document.createElement("canvas");canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;const context=canvas.getContext("2d");context.drawImage(image,0,0);return context;};
        const a=await decode(shown),b=await decode(hidden);
        return points.map(point=>{
          let changed=0,maxDelta=0; const samples=[];
          for(let y=Math.ceil(point.art.y);y<point.art.y+point.art.height;y++)for(let x=Math.ceil(point.art.x);x<point.art.x+point.art.width;x++){
            const p=a.getImageData(x,y,1,1).data,h=b.getImageData(x,y,1,1).data;
            const delta=Math.max(...[0,1,2].map(i=>Math.abs(p[i]-h[i])));maxDelta=Math.max(maxDelta,delta);if(delta>=10)changed++;
          }
          for(const s of point.samples){const x=Math.floor(s.x),y=Math.floor(s.y);const p=[...a.getImageData(x,y,1,1).data],h=[...b.getImageData(x,y,1,1).data];samples.push({x,y,visible:p,hidden:h,delta:Math.max(...[0,1,2].map(i=>Math.abs(p[i]-h[i])))});}
          return {id:point.id,exposed:point.exposed,art:point.art,rect:point.rect,changed,maxDelta,samples};
        });
      },{shown:shown.toString("base64"),hidden:hidden.toString("base64"),points});
      console.log(JSON.stringify(result));
      q.assert.equal(await q.raw(page),before);q.assert.deepEqual(errors,[]);
    }finally{await context.close();}
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
