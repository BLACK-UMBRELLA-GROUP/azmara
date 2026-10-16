"use strict";
// Native-alpha diagnosis only. Original PNGs and runtime registry are untouched.
const { chromium }=require(process.argv[2]||"playwright");
const q=require("./building-harness.cjs");
(async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    const {context,page,errors}=await q.create(browser,q.fixture({hallLevel:50,buildings:{"general-02":{typeId:"museum",level:50}}}));
    try{
      const result=await page.evaluate(async()=>{
        const visual=window.AzmaraBuildingArt.forBuilding("museum",50),image=new Image();image.src=visual.src;await image.decode();
        const canvas=document.createElement("canvas");canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;const ctx=canvas.getContext("2d",{willReadFrequently:true});ctx.drawImage(image,0,0);
        const data=ctx.getImageData(0,0,canvas.width,canvas.height).data,labels=new Int32Array(canvas.width*canvas.height),queue=new Int32Array(labels.length),components=[];let next=0;
        for(let index=0;index<labels.length;index++){
          if(labels[index]||data[index*4+3]<=30)continue;let head=0,tail=0,count=0,minX=canvas.width,minY=canvas.height,maxX=0,maxY=0;queue[tail++]=index;labels[index]=++next;
          while(head<tail){const p=queue[head++],x=p%canvas.width,y=Math.floor(p/canvas.width);count++;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
            for(const n of [x? p-1:-1,x<canvas.width-1?p+1:-1,y?p-canvas.width:-1,y<canvas.height-1?p+canvas.width:-1])if(n>=0&&!labels[n]&&data[n*4+3]>30){labels[n]=next;queue[tail++]=n;}
          }components.push({id:next,count,bounds:[minX,minY,maxX,maxY]});
        }
        const major=components.sort((a,b)=>b.count-a.count).slice(0,12);major.sort((a,b)=>(a.bounds[1]+a.bounds[3])-(b.bounds[1]+b.bounds[3]));for(let row=0;row<3;row++){const group=major.slice(row*4,row*4+4).sort((a,b)=>(a.bounds[0]+a.bounds[2])-(b.bounds[0]+b.bounds[2]));major.splice(row*4,4,...group);}
        const [x,y,w,h]=visual.rect,cellX=visual.cell%4*canvas.width/4,cellY=Math.floor(visual.cell/4)*canvas.height/3;
        let outside=0,paintedOutside=0,maxAlphaOutside=0,foreign=0;const outsideComponents={};
        for(let py=y;py<y+h;py++)for(let px=x;px<x+w;px++){
          const index=py*canvas.width+px,alpha=data[index*4+3];if(px<cellX||py<cellY||px>=cellX+canvas.width/4||py>=cellY+canvas.height/3){outside++;maxAlphaOutside=Math.max(maxAlphaOutside,alpha);if(alpha>30){paintedOutside++;outsideComponents[labels[index]]=(outsideComponents[labels[index]]||0)+1;}}
          if(alpha>30&&major.some((component,cell)=>component.id===labels[index]&&cell!==visual.cell))foreign++;
        }
        const crop=document.createElement("canvas");crop.width=w;crop.height=h;crop.getContext("2d").drawImage(image,x,y,w,h,0,0,w,h);crop.id="qa-native-crop";crop.style.cssText="position:fixed;left:30px;top:250px;z-index:99999;background:#ccc";document.body.append(crop);
        return {visual,major,outside,paintedOutside,maxAlphaOutside,outsideComponents,foreign};
      });
      console.log(JSON.stringify(result));await q.picture(page,"DIAGNOSTIC-museum50-native-crop");await page.locator("#qa-native-crop").evaluate(node=>node.remove());q.assert.deepEqual(errors,[]);
    }finally{await context.close();}
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
