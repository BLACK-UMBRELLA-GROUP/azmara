"use strict";

// Proposal-only annotation renderer. It never touches the game runtime.
const fs = require("node:fs");
const path = require("node:path");
const dependencyRoot = process.env.AZMARA_NODE_MODULES;
const sharp = dependencyRoot ? require(path.join(dependencyRoot, "sharp")) : require("sharp");

const folder = __dirname;
const source = path.join(folder,"owner-road-markup.png");
const encoded = fs.readFileSync(source).toString("base64");
const slope = .55, step = 8;
const screen = ([a,b]) => [step*(a+b),step*slope*(a-b)];
const lattice = ([x,y]) => [Math.round((x+y/slope)/(2*step)),Math.round((x-y/slope)/(2*step))];
const key = ([a,b]) => `${a},${b}`;
const fromKey = value => value.split(",").map(Number);
const points = value => value.map(pair => screen(pair).map(n=>n.toFixed(1)).join(",")).join(" ");
const simplify = nodes => nodes.filter((node,index) => {
  if (!index || index === nodes.length-1) return true;
  const before=nodes[index-1],after=nodes[index+1];
  return !((node[0]-before[0]===after[0]-node[0])&&(node[1]-before[1]===after[1]-node[1]));
});
const distance = (a,b) => Math.hypot(a[0]-b[0],a[1]-b[1]);

const plots = [
  {id:"G02",x:210,y:244},{id:"G03",x:385,y:244},{id:"G04",x:561,y:329},{id:"G05",x:737,y:244},{id:"G06",x:913,y:244},
  {id:"G07",x:210,y:353},{id:"G08",x:385,y:353},{id:"G09",x:737,y:353},{id:"G10",x:913,y:353},
  {id:"G11",x:210,y:465},{id:"G12",x:385,y:465},{id:"G13",x:737,y:465},{id:"G14",x:913,y:465},
  {id:"G15",x:210,y:577},{id:"G16",x:385,y:577},{id:"G17",x:561,y:577},{id:"G18",x:737,y:577},{id:"G19",x:913,y:577},
  {id:"C1",x:222,y:630},{id:"C2",x:902,y:630},{id:"F1",x:561,y:678}
];
const hall = {id:"HALL",x:561,y:410,rx:84,ry:52};
const obstacles = [hall,...plots.map(p=>({...p,rx:66,ry:39}))];
const sides = {NE:[35,-19],SE:[35,19],SW:[-35,19],NW:[-35,-19]};
const bounds = node => { const [x,y]=screen(node); return x>=40&&x<=1080&&y>=78&&y<=730; };
const blocked = (node,owner=null,margin=15) => { const [x,y]=screen(node); return obstacles.some(o=>o.id!==owner&&(Math.abs(x-o.x)/(o.rx+margin)+Math.abs(y-o.y)/(o.ry+margin)<1)); };
const neighbours = ([a,b]) => [[a+1,b],[a-1,b],[a,b+1],[a,b-1]];
function findPath(startPoint,goalKeys,owner=null,margin=15){
  const start=lattice(startPoint),startKey=key(start),open=[{node:start,g:0,f:0}],came=new Map(),cost=new Map([[startKey,0]]),goals=[...goalKeys].map(fromKey);
  const heuristic=node=>goals.reduce((best,g)=>Math.min(best,Math.abs(node[0]-g[0])+Math.abs(node[1]-g[1])),Infinity);
  open[0].f=heuristic(start);
  while(open.length){
    open.sort((a,b)=>a.f-b.f);const current=open.shift(),currentKey=key(current.node);
    if(goalKeys.has(currentKey)){
      const result=[current.node];let cursor=currentKey;
      while(came.has(cursor)){cursor=came.get(cursor);result.push(fromKey(cursor));}
      return simplify(result.reverse());
    }
    for(const next of neighbours(current.node)){
      const nextKey=key(next);if(!bounds(next)||blocked(next,owner,margin))continue;
      const nextCost=current.g+1;
      if(nextCost>=(cost.get(nextKey)??Infinity))continue;
      cost.set(nextKey,nextCost);came.set(nextKey,currentKey);open.push({node:next,g:nextCost,f:nextCost+heuristic(next)});
    }
  }
  throw new Error(`No route from ${startPoint.join(",")}`);
}

// The only primary spine: gate to a diamond square just below the Hall.
const gate=[561,136],square=[561,505];
const main=findPath(gate,new Set([key(lattice(square))]),null,25);
const network=new Set();
function addToNetwork(pathNodes){
  for(let index=1;index<pathNodes.length;index++){
    let cursor=pathNodes[index-1].slice(),target=pathNodes[index];network.add(key(cursor));
    while(key(cursor)!==key(target)){cursor=[cursor[0]+Math.sign(target[0]-cursor[0]),cursor[1]+Math.sign(target[1]-cursor[1])];network.add(key(cursor));}
  }
}
addToNetwork(main);

const contacts={},lanes=[],remaining=new Map(plots.map(plot=>[plot.id,plot]));
while(remaining.size){
  let chosen=null;
  for(const plot of remaining.values())for(const [side,offset] of Object.entries(sides)){
    const terminal=[plot.x+offset[0],plot.y+offset[1]],node=lattice(terminal),near=Math.min(...[...network].map(value=>distance(screen(fromKey(value)),screen(node))));
    if(!chosen||near<chosen.near)chosen={plot,side,terminal,near};
  }
  let best=null;
  for(const [side,offset] of Object.entries(sides)){
    const terminal=[chosen.plot.x+offset[0],chosen.plot.y+offset[1]];
    try{const route=findPath(terminal,network,chosen.plot.id,16);if(!best||route.length<best.route.length)best={side,terminal,route};}catch{}
  }
  if(!best)throw new Error(`No side route for ${chosen.plot.id}`);
  contacts[chosen.plot.id]=best.side;lanes.push({id:chosen.plot.id,path:best.route,terminal:best.terminal});addToNetwork(best.route);remaining.delete(chosen.plot.id);
}

const lanePaths=lanes.map(lane=>`<polyline points="${points(lane.path)}"><title>${lane.id} reaches the ${contacts[lane.id]} side</title></polyline>`).join("");
const contactSvg=plots.map(plot=>{const offset=sides[contacts[plot.id]],[x,y]=[plot.x+offset[0],plot.y+offset[1]];return `<g class="contact"><circle cx="${x}" cy="${y}" r="5"/><rect x="${plot.x-16}" y="${plot.y-10}" width="32" height="18" rx="4"/><text x="${plot.x}" y="${plot.y+4}">${plot.id}</text></g>`;}).join("");
const gardens=[[305,295,30,15],[473,268,27,14],[828,300,30,15],[304,415,28,14],[824,414,29,14],[468,534,27,14],[650,539,27,14],[781,617,25,13]].map(([x,y,rx,ry])=>`<ellipse class="garden" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`).join("");

const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1561" height="784" viewBox="0 0 1561 784">
<image href="data:image/png;base64,${encoded}" width="1561" height="784"/><rect width="1123" height="784" fill="#f5dfad" opacity=".32"/><rect x="1123" width="438" height="784" fill="#fbf2dc"/>
<g class="main"><polyline points="${points(main)}"/></g><g class="lanes">${lanePaths}</g><g>${gardens}</g>
<path class="square" d="M513 505L561 478.6L609 505L561 531.4Z"/><text class="square-label" x="561" y="510">TOWN HALL SQUARE</text>${contactSvg}
<g class="callout"><path d="M578 137L624 108"/><rect x="620" y="80" width="154" height="42" rx="6"/><text x="697" y="98">VALLEY GATE</text><text x="697" y="114">main street starts here</text></g>
<g class="legend"><text class="title" x="1152" y="54">AZMARA STREET PLAN · GRID</text><text class="sub" x="1152" y="82">Proposal only · all 23 anchors unchanged</text>
<line x1="1155" y1="126" x2="1245" y2="176" class="main-swatch"/><text x="1270" y="144">MAIN STREET</text><text class="small" x="1270" y="165">Sandstone · about ⅓ plot width</text>
<line x1="1155" y1="218" x2="1245" y2="268" class="lane-swatch"/><text x="1270" y="236">LANE</text><text class="small" x="1270" y="257">Packed earth · about ⅕ plot width</text>
<ellipse cx="1198" cy="326" rx="42" ry="20" class="garden"/><text x="1270" y="320">GARDEN POCKET</text><text class="small" x="1270" y="341">Palm, shade and market props</text>
<circle cx="1198" cy="399" r="7" class="legend-contact"/><text x="1270" y="393">SIDE CONTACT</text><text class="small" x="1270" y="414">Every plot meets one full side</text>
<text class="rule" x="1152" y="480">✓ Two isometric directions only</text><text class="rule" x="1152" y="516">✓ Gate → square is the clear spine</text><text class="rule" x="1152" y="552">✓ No outside loop</text><text class="rule" x="1152" y="588">✓ Every end is a plot, square,</text><text class="rule" x="1172" y="612">gate or another road</text>
<text class="note" x="1152" y="676">Plot labels</text><text class="small" x="1152" y="703">G = general · C = caravan</text><text class="small" x="1152" y="726">F = freight depot</text><text class="small" x="1152" y="760">Old grey outline roads beneath are rejected.</text></g>
<style>text{font-family:Arial,sans-serif;fill:#49331f}.main polyline{fill:none;stroke:#d9b873;stroke-width:39;stroke-linejoin:round;stroke-linecap:round}.lanes polyline{fill:none;stroke:#a87842;stroke-width:20;stroke-linejoin:round;stroke-linecap:round}.garden{fill:#5d844f99;stroke:#315f47;stroke-width:3;stroke-dasharray:5 4}.square{fill:#e7ca8d;stroke:#5c3b24;stroke-width:5}.square-label{font-size:9px;font-weight:800;text-anchor:middle}.contact circle,.legend-contact{fill:#1d6f68;stroke:#fff4cd;stroke-width:3}.contact rect{fill:#174e49dd;stroke:#fff4cd}.contact text{fill:white;font-size:10px;font-weight:700;text-anchor:middle}.callout path{fill:none;stroke:#1d6f68;stroke-width:3}.callout rect{fill:#fff4d9;stroke:#1d6f68;stroke-width:2}.callout text{font-size:10px;font-weight:700;text-anchor:middle}.callout text+text{font-size:9px;font-weight:400}.legend .title{font:700 22px Georgia,serif}.legend .sub{font-size:14px;fill:#765d3e}.legend text:not(.title):not(.sub):not(.small):not(.rule):not(.note){font-size:16px;font-weight:800}.legend .small{font-size:14px;fill:#6b5b46}.legend .rule{font-size:16px;font-weight:700;fill:#266659}.legend .note{font-size:15px;font-weight:800}.main-swatch{stroke:#d9b873;stroke-width:36;stroke-linecap:round}.lane-swatch{stroke:#b98c51;stroke-width:21;stroke-linecap:round}</style></svg>`;

const svgPath=path.join(folder,"street-plan-grid.svg"),pngPath=path.join(folder,"street-plan-grid.png");
fs.writeFileSync(svgPath,svg);
sharp(Buffer.from(svg)).png().toFile(pngPath).then(()=>{fs.writeFileSync(path.join(folder,"street-plan-grid.json"),JSON.stringify({kind:"Proposal-only annotated plan; not runtime art",source:"owner-road-markup.png",layout:"grid",plotAnchorsChanged:false,roadSegmentAxesVerified:true,mainWidthPixels:39,laneWidthPixels:20,contacts},null,2)+"\n");console.log(pngPath);}).catch(error=>{console.error(error);process.exitCode=1;});
