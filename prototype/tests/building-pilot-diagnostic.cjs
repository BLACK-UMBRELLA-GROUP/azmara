"use strict";

// Read-only diagnostic, not a passing-test substitute; only isolated local saves.
const { chromium } = require(process.argv[2] || "playwright");
const { assert, fixture, create, picture, milestones, raw } = require("./building-harness.cjs");
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const { context, page, errors } = await create(browser, fixture({ hallLevel: 50, buildings: { "general-02": { typeId: "academy", level: 50 } } }));
    try {
      const before = await raw(page);
      const evidence = await page.evaluate(async (milestones) => {
        const image = new Image(); image.src = window.AzmaraBuildingArt.forBuilding("academy", 1).src; await image.decode();
        const canvas = document.createElement("canvas"); canvas.width = 384; canvas.height = 256;
        const ctx = canvas.getContext("2d", { willReadFrequently: true }); ctx.imageSmoothingQuality = "high";
        const native = document.createElement("canvas"); native.width=image.naturalWidth; native.height=image.naturalHeight;
        const nativeContext = native.getContext("2d", { willReadFrequently:true }); nativeContext.drawImage(image,0,0);
        const crops = milestones.map((level) => {
          const art = window.AzmaraBuildingArt.forBuilding("academy", level);
          ctx.clearRect(0,0,384,256); ctx.drawImage(image,...art.rect,0,0,384,256);
          const rgba = ctx.getImageData(0,0,384,256).data;
          let opaque = 0, transparent = 0, redOpaque = 0;
          for (let offset = 0; offset < rgba.length; offset += 4) {
            if (rgba[offset+3] >= 240) { opaque += 1; if (rgba[offset] > 200 && rgba[offset+1] < 70 && rgba[offset+2] < 70) redOpaque += 1; }
            if (rgba[offset+3] === 0) transparent += 1;
          }
          const [x,y,width,height]=art.rect;
          const nativePixels=nativeContext.getImageData(x,y,width,height).data;
          const exactPureRedAlpha={}; let nativeWarmOpaque=0;
          for(let offset=0;offset<nativePixels.length;offset+=4){
            const [r,g,b,a]=nativePixels.slice(offset,offset+4);
            if(r===255&&g===0&&b===0&&a>0) exactPureRedAlpha[a]=(exactPureRedAlpha[a]||0)+1;
            if(a>=240&&r>200&&g<70&&b<70)nativeWarmOpaque+=1;
          }
          return { level, rect:art.rect, opaque, transparent, redOpaque,
            exactPureRedAlpha,nativeWarmOpaque,
            nativeCorners:[[x,y],[x+width-1,y],[x,y+height-1],[x+width-1,y+height-1]].map(([x,y])=>[...nativeContext.getImageData(x,y,1,1).data]),
            corners:[0,383*4,255*384*4,(384*256-1)*4].map((offset)=>[...rgba.slice(offset,offset+4)]) };
        });
        const plot = document.querySelector('[data-plot="general-02"]'), sprite = plot.querySelector(".building-sprite");
        return { width:image.naturalWidth,height:image.naturalHeight,crops,plot:plot.getBoundingClientRect().toJSON(),sprite:sprite.getBoundingClientRect().toJSON(),filter:getComputedStyle(plot.querySelector(".marker")).filter };
      }, milestones);
      await picture(page, "DIAGNOSTIC-isolated-academy50-hall50-1440x900");
      if (process.env.AZMARA_QA_SCREENSHOTS) await page.locator('[data-plot="general-02"]').screenshot({ path: process.env.AZMARA_QA_SCREENSHOTS + "/DIAGNOSTIC-academy50-rendered-target.png", scale:"css" });
      assert.equal(await raw(page), before); assert.deepEqual(errors,[]);
      console.log(JSON.stringify({ diagnosticOnly:true,...evidence,errors }));
    } finally { await context.close(); }
  } finally { await browser.close(); }
})().catch((error)=>{console.error(error);process.exitCode=1;});
