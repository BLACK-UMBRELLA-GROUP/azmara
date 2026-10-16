"use strict";
// Independent native-alpha ownership: tight full-body crops may cross an
// ideal grid line through transparent padding. They must never include a
// neighboring painted sprite or clip meaningful connected material.
const assert=require("node:assert/strict");
async function assertNativeCrops(target,crops) {
  const results=await target.evaluate(async crops=>{
    window.__qaNativeSpriteSources ||= new Map();
    async function source(src) {
      if(!window.__qaNativeSpriteSources.has(src))window.__qaNativeSpriteSources.set(src,(async()=>{
        const image=new Image();image.src=src;await image.decode();
        const width=image.naturalWidth,height=image.naturalHeight,canvas=document.createElement("canvas");canvas.width=width;canvas.height=height;
        const context=canvas.getContext("2d",{willReadFrequently:true});context.drawImage(image,0,0);
        const rgba=context.getImageData(0,0,width,height).data,labels=new Int32Array(width*height),queue=new Int32Array(labels.length),components=[];let next=0;
        for(let index=0;index<labels.length;index++){
          if(labels[index]||rgba[index*4+3]<=30)continue;let head=0,tail=0,count=0,minX=width,minY=height,maxX=0,maxY=0;queue[tail++]=index;labels[index]=++next;
          while(head<tail){const p=queue[head++],x=p%width,y=Math.floor(p/width);count++;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
            for(const n of [x?p-1:-1,x<width-1?p+1:-1,y?p-width:-1,y<height-1?p+width:-1])if(n>=0&&!labels[n]&&rgba[n*4+3]>30){labels[n]=next;queue[tail++]=n;}
          }components.push({id:next,count,minX,minY,maxX,maxY});
        }
        const major=[...components].sort((a,b)=>b.count-a.count).slice(0,12);
        if(major.length!==12||major.some(c=>c.count<1000))throw new Error("Atlas lacks12 distinct complete painted bodies: "+src);
        major.sort((a,b)=>(a.minY+a.maxY)-(b.minY+b.maxY));
        for(let row=0;row<3;row++){const group=major.slice(row*4,row*4+4).sort((a,b)=>(a.minX+a.maxX)-(b.minX+b.maxX));major.splice(row*4,4,...group);}
        const owner=new Int32Array(next+1);owner.fill(-1);
        for(const c of components){
          const direct=major.findIndex(m=>m.id===c.id);
          owner[c.id]=direct>=0?direct:major.map((m,index)=>({index,distance:Math.hypot((c.minX+c.maxX-m.minX-m.maxX)/2,(c.minY+c.maxY-m.minY-m.maxY)/2)})).sort((a,b)=>a.distance-b.distance)[0].index;
        }
        return{width,height,rgba,labels,components,major,owner};
      })());
      return window.__qaNativeSpriteSources.get(src);
    }
    return Promise.all(crops.map(async crop=>{
      const data=await source(crop.src),[x,y,w,h]=crop.rect;
      if(!Number.isInteger(crop.cell)||crop.cell<0||crop.cell>10||![x,y,w,h].every(Number.isFinite)||x<0||y<0||w<=0||h<=0||x+w>data.width+.01||y+h>data.height+.01)throw new Error("Native crop escapes source bounds: "+JSON.stringify(crop));
      let painted=0,foreign=0;
      for(let py=Math.ceil(y);py<y+h;py++)for(let px=Math.ceil(x);px<x+w;px++){const index=py*data.width+px;if(data.rgba[index*4+3]>30){painted++;if(data.owner[data.labels[index]]!==crop.cell)foreign++;}}
      const clipped=data.components.filter(c=>c.count>=30&&data.owner[c.id]===crop.cell&&(c.minX<x-.01||c.minY<y-.01||c.maxX>=x+w+.01||c.maxY>=y+h+.01)).map(c=>({count:c.count,bounds:[c.minX,c.minY,c.maxX,c.maxY]}));
      return{src:crop.src,cell:crop.cell,rect:crop.rect,painted,foreign,clipped};
    }));
  },crops);
  for(const result of results){assert(result.painted>100,"Native crop has no meaningful painted body: "+JSON.stringify(result));assert.equal(result.foreign,0,"Native crop contains neighboring painted sprite material: "+JSON.stringify(result));assert.deepEqual(result.clipped,[],"Native crop clips complete main body or meaningful connected props: "+JSON.stringify(result));}
  return results;
}
module.exports={assertNativeCrops};
