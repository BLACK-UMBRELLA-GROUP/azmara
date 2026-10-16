"use strict";

// Independent safety oracle for the responsive five-layout projection.
// Reported diagnostic offsets are not an oracle: nearest-free placement can
// legitimately move individual plots. Verify actual boxes, hits and fixed
// civic/waterfront anchors instead of reproducing the implementation search.
const assert = require("node:assert/strict");

async function safety(target) {
  const result=await target.evaluate(()=>{
    const map=document.querySelector("#town-map"),view=document.querySelector("#map-viewport"),core=document.querySelector("#town-core").getBoundingClientRect();
    const scale=core.width/2500;
    const plots=[...document.querySelectorAll("#town-core .plot-marker")].map(node=>{
      const r=node.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;
      return{id:node.dataset.plot,rect:r.toJSON(),x:900+(x-core.x)/scale,y:700+(y-core.y)/scale,
        exposed:[[0,0],[-21,-21],[21,-21],[-21,21],[21,21]].every(([dx,dy])=>document.elementFromPoint(x+dx,y+dy)?.closest(".plot-marker")===node)};
    });
    const overlays=[...document.querySelectorAll(".desktop-resource-panel,.desktop-advisers,.desktop-header")].map(node=>node.getBoundingClientRect().toJSON());
    return{presentation:map.dataset.presentation,fit:view.dataset.fit,width:innerWidth,height:innerHeight,scale,plots,overlays};
  });
  assert.equal(result.presentation,"desktop");assert.equal(result.fit,"true","Projection safety requires actual Fit");
  assert.equal(result.plots.length,23);
  for(const plot of result.plots){
    const r=plot.rect;
    assert(r.width>=43.9&&r.height>=43.9&&r.x>=-.5&&r.y>=-.5&&r.right<=result.width+.5&&r.bottom<=result.height+.5&&plot.exposed,"Actual full44px plot core is clipped/intercepted: "+JSON.stringify(plot));
    for(const overlay of result.overlays)assert(!(Math.min(r.right,overlay.right)-Math.max(r.x,overlay.x)>.5&&Math.min(r.bottom,overlay.bottom)-Math.max(r.y,overlay.y)>.5),"Plot footprint overlaps a north HUD or south toolbar: "+plot.id);
  }
  for(let a=0;a<result.plots.length;a++)for(let b=a+1;b<result.plots.length;b++){
    const p=result.plots[a],q=result.plots[b],r=p.rect,s=q.rect;
    assert(!(Math.min(r.right,s.right)-Math.max(r.x,s.x)>.5&&Math.min(r.bottom,s.bottom)-Math.max(r.y,s.y)>.5),"Responsive full footprints overlap: "+p.id+"/"+q.id);
  }
  for(const [id,x,y]of[["general-01",2100,1150],["harbour-01",1230,1760],["harbour-02",2760,1820],["freighter-01",3630,2040]]){
    const p=result.plots.find(p=>p.id===id);assert(Math.abs(p.x-x)*result.scale<=.55,"Fixed civic/transport lane moved horizontally: "+JSON.stringify(p));
    if(id==="general-01")assert(p.y>=y-.55/result.scale,"Hall moves north into the reserved wall lane");
    else assert(p.y<=y+.55/result.scale,"Transport reserve moves south beneath the footer");
  }
  const wall=result.plots.find(p=>p.id==="wall-01");assert(Math.abs(wall.x-2100)*result.scale<=.55&&wall.y>=350,"Wall does not occupy its top-centre dry-land lane");
}

async function northInset(target,_anchors,checkFit=false){
  const actual=await target.locator("#town-map").evaluate(map=>Number(map.dataset.northInset||0));
  assert(Number.isFinite(actual)&&actual>=0&&actual<900,"Northern projection is not finite/bounded");
  if(checkFit)await safety(target);return actual;
}
async function wallInset(target,checkFit=false){
  const actual=await target.locator("#town-map").evaluate(map=>Number(map.dataset.wallInset||0));
  assert(Number.isFinite(actual)&&actual>=0&&actual<900,"Wall lane projection is not finite/bounded");
  if(checkFit)await safety(target);return actual;
}
async function horizontalInsets(target,checkFit=false){
  const actual=await target.locator("#town-map").evaluate(map=>({hallOutset:Number(map.dataset.hallOutset||0),edgeInset:Number(map.dataset.edgeInset||0)}));
  for(const value of Object.values(actual))assert(Number.isFinite(value)&&value>=0&&value<900,"Horizontal projection diagnostic is not finite/bounded");
  if(checkFit)await safety(target);return actual;
}
module.exports={northInset,wallInset,horizontalInsets,safety};
