"use strict";

// Actual game compositing comparison; temporary isolated DOM URL swap only.
const { chromium } = require(process.argv[2] || "playwright");
const { assert,fixture,create,settle,raw,picture }=require("./building-harness.cjs");
const { markerPoints,assertDrawnMarkers }=require("./marker-proof.cjs");
const path=require("node:path");
async function compare(page,a,b){
  return page.evaluate(async([a,b])=>{
    const decode=async(bytes)=>{const img=new Image();img.src="data:image/png;base64,"+bytes;await img.decode();const c=document.createElement("canvas");c.width=img.naturalWidth;c.height=img.naturalHeight;const x=c.getContext("2d");x.drawImage(img,0,0);return x.getImageData(0,0,c.width,c.height).data;};
    const aa=await decode(a),bb=await decode(b);let changed=0,maxChannelDelta=0,redPixelsV1=0,redPixelsV2=0;
    for(let i=0;i<aa.length;i+=4){const delta=Math.max(...[0,1,2].map((j)=>Math.abs(aa[i+j]-bb[i+j])));if(delta>0)changed+=1;maxChannelDelta=Math.max(maxChannelDelta,delta);
      if(aa[i]>220&&aa[i+1]<70&&aa[i+2]<70)redPixelsV1+=1;if(bb[i]>220&&bb[i+1]<70&&bb[i+2]<70)redPixelsV2+=1;}
    return{changed,maxChannelDelta,redPixelsV1,redPixelsV2};
  },[a.toString("base64"),b.toString("base64")]);
}
(async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    const{context,page,errors}=await create(browser,fixture({hallLevel:50,buildings:{"general-02":{typeId:"academy",level:50}}}));
    try{
      const before=await raw(page), sprite=page.locator('[data-plot="general-02"] .building-sprite');
      const initial=await sprite.getAttribute("style");
      const v1="assets/progression/azmara-academy-stages-v1.png",v2="assets/progression/azmara-academy-stages-v2.png";
      const result=[];
      for(const profile of["Fit","Close"]){
        if(profile==="Close"){
          await page.locator('[data-desktop-action="close"]').click();await settle(page);
          await page.locator("#map-viewport").evaluate((viewport)=>viewport.scrollBy(-500,-200));await settle(page);
        }
        const shots=[];
        for(const[source,version]of[[v1,"v1"],[v2,"v2"]]){
          await sprite.evaluate(async(node,source)=>{node.style.backgroundImage=`url("${source}")`;const img=new Image();img.src=source;await img.decode();},source);
          await settle(page);await picture(page,`DIAGNOSTIC-academy50-${version}-${profile}-1440x900`);
          const point=(await markerPoints(page,true)).find((point)=>point.id==="general-02");
          assert(point.insideTarget&&point.exposed&&point.rect.width>=44&&point.rect.height>=44,"Academy comparison target is not exposed");
          await assertDrawnMarkers(page,[point],true);
          shots.push(await page.locator('[data-plot="general-02"]').screenshot(process.env.AZMARA_QA_SCREENSHOTS?{path:path.join(process.env.AZMARA_QA_SCREENSHOTS,`DIAGNOSTIC-academy50-${version}-${profile}-target.png`),scale:"css"}:{scale:"css"}));
        }
        result.push({profile,...await compare(page,...shots)});
      }
      await sprite.evaluate((node,style)=>style===null?node.removeAttribute("style"):node.setAttribute("style",style),initial);
      assert.equal(await raw(page),before);assert.deepEqual(errors,[]);
      console.log(JSON.stringify({diagnosticOnly:true,actualSourceScreenshotChecks:4,composites:result,errors}));
    }finally{await context.close();}
  }finally{await browser.close();}
})().catch((error)=>{console.error(error);process.exitCode=1;});
