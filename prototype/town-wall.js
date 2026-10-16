/* Original AZMARA rear valley pass. Pure world-space presentation; no state. */
(() => {
  "use strict";
  const deepFreeze = (value) => {
    if (value && typeof value === "object" && !Object.isFrozen(value)) { Object.values(value).forEach(deepFreeze); Object.freeze(value); }
    return value;
  };
  const profiles = deepFreeze({
    desktop: {gate: [2100,400], span: 900, approachLength: 160, approachWidth: 35},
    compact: {gate: [3150,1620], span: 600, approachLength: 110, approachWidth: 25}
  });
  const routes = deepFreeze(Object.fromEntries(Object.entries(profiles).map(([profile,p]) =>
    [profile, [[p.gate[0]-p.span/2,p.gate[1]],[p.gate[0]+p.span/2,p.gate[1]]]])));
  const approaches = deepFreeze(Object.fromEntries(Object.entries(profiles).map(([profile,p]) =>
    [profile, [p.gate,[p.gate[0],p.gate[1]+p.approachLength]]])));
  const artLevels = deepFreeze([1,5,10,15,20,25,30,35,40,45,50]);
  const fallbackMilestones = deepFreeze([1,6,11,15,20,24,30,33,40,44,50]);
  const materials = deepFreeze(["timber","adobe","grandstone"]);
  // DEC-093: approved B2 canyon defences. Each stage is a complete,
  // cliff-integrated transparent layer. Keeping the canyon and fortification in
  // one painting prevents a freestanding gate from looking pasted over sand.
  // The crop deliberately excludes generator-only sub-alpha padding beneath the
  // illustrated ridge; all alpha >= 8 is contained inside it.
  const integratedDefences = deepFreeze({
    timber: {
      src: "assets/valley-wall/azmara-valley-defence-timber-v3.png",
      width: 1536, height: 1024,
      crop: { x: 0, y: 130, width: 1536, height: 390 },
      alphaBounds: { x: 12, y: 169, width: 1514, height: 328 },
      gateSource: { x: 768, y: 430, openingWidth: 184, height: 142 },
      towers: [{ x: 600, y: 252, width: 126, height: 228 }, { x: 810, y: 252, width: 126, height: 228 }]
    },
    adobe: {
      src: "assets/valley-wall/azmara-valley-defence-adobe-v3.png",
      width: 1536, height: 1024,
      crop: { x: 0, y: 130, width: 1536, height: 390 },
      alphaBounds: { x: 12, y: 148, width: 1514, height: 329 },
      gateSource: { x: 768, y: 430, openingWidth: 190, height: 146 },
      towers: [{ x: 598, y: 246, width: 130, height: 232 }, { x: 808, y: 246, width: 130, height: 232 }]
    },
    grandstone: {
      src: "assets/valley-wall/azmara-valley-defence-sandstone-v3.png",
      width: 1536, height: 1024,
      crop: { x: 0, y: 130, width: 1536, height: 390 },
      alphaBounds: { x: 11, y: 149, width: 1514, height: 326 },
      gateSource: { x: 768, y: 430, openingWidth: 194, height: 148 },
      towers: [{ x: 598, y: 244, width: 130, height: 234 }, { x: 808, y: 244, width: 130, height: 234 }]
    }
  });
  const integratedPlacement = deepFreeze({
    desktop: { x: -204, y: -890, scale: 3 },
    compact: { x: 1883, y: 910, scale: 1.65 }
  });
  // Retain prior registrations for rollback, not an active fallback. Missing
  // new art must never restore the perimeter ring.
  const legacyArtwork = deepFreeze({
    desktop:{timber:{image:{src:"assets/town-wall-desktop-timber-v19.png",width:1536,height:1024,x:250,y:24,scale:2.5390625,alphaBounds:{x:25,y:15,width:1471,height:985}},splitY:1900},adobe:{image:{src:"assets/town-wall-desktop-adobe-v19.png",width:1536,height:1024,x:250,y:95,scale:2.5390625,alphaBounds:{x:47,y:32,width:1433,height:992}},splitY:1900},grandstone:{image:{src:"assets/town-wall-desktop-sandstone-v19.png",width:1536,height:1024,x:250,y:24,scale:2.5390625,alphaBounds:{x:17,y:21,width:1449,height:969}},splitY:1900}},
    compact:{timber:{image:{src:"assets/town-wall-compact-timber-v19.png",width:1024,height:1536,x:1980,y:816,scale:2.1484375,alphaBounds:{x:25,y:9,width:981,height:1503}},splitY:2790},adobe:{image:{src:"assets/town-wall-compact-adobe-v19.png",width:1024,height:1536,x:1980,y:784,scale:2.1484375,alphaBounds:{x:23,y:15,width:997,height:1521}},splitY:2790},grandstone:{image:{src:"assets/town-wall-compact-sandstone-v19.png",width:1024,height:1536,x:1980,y:784,scale:2.1484375,alphaBounds:{x:0,y:31,width:996,height:1481}},splitY:2790}}
  });
  // Only inspected real source pixels may be registered. Complete rectangular
  // crops own each atlas row including shadows/alpha. gateSource is the
  // observed doorway centre, never an assumed whole-frame centre.
  let atlas = null, valleyArt = null;
  const cache = new Map(), terrainCache = new Map(), renderCache = new WeakMap();
  const xml = (value) => String(value).replace(/[&<>"']/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"})[c]);
  const union = (boxes) => {
    const valid=boxes.filter(Boolean); if(!valid.length)return null;
    const x=Math.floor(Math.min(...valid.map((b)=>b.x))),y=Math.floor(Math.min(...valid.map((b)=>b.y)));
    return {x,y,width:Math.ceil(Math.max(...valid.map((b)=>b.x+b.width)))-x,height:Math.ceil(Math.max(...valid.map((b)=>b.y+b.height)))-y};
  };
  const centred = (id,b) => ({id,x:b.x+b.width/2,y:b.y+b.height/2,width:b.width,height:b.height});
  const translated = (b,image) => ({x:image.x+b.x*image.scale,y:image.y+b.y*image.scale,
    width:b.width*image.scale,height:b.height*image.scale});
  const sourceImage = (entry,label) => {
    if (!/^assets\/[A-Za-z0-9_./-]+\.png$/.test(entry?.src||"") || entry.src.includes("..") ||
      ![entry.width,entry.height].every((n)=>Number.isInteger(n)&&n>0)) {
      throw new TypeError(label+" needs a local PNG and positive integer source dimensions");
    }
    return {src:entry.src,width:entry.width,height:entry.height};
  };
  const sourceRect = (b,image,label) => {
    if(!b || ![b.x,b.y,b.width,b.height].every(Number.isInteger) || b.x<0 || b.y<0 || b.width<=0 || b.height<=0 ||
      b.x+b.width>image.width || b.y+b.height>image.height) throw new TypeError(label+" must belong to the source PNG");
    return {x:b.x,y:b.y,width:b.width,height:b.height};
  };
  const contains = (outer,inner) => inner.x>=outer.x && inner.y>=outer.y &&
    inner.x+inner.width<=outer.x+outer.width && inner.y+inner.height<=outer.y+outer.height;
  const worldRect = (b,label) => {
    if(!b || ![b.x,b.y,b.width,b.height].every(Number.isFinite) || b.width<=0 || b.height<=0) {
      throw new TypeError(label+" needs finite world-space bounds");
    }
    return {x:b.x,y:b.y,width:b.width,height:b.height};
  };
  function validateAtlas(entry) {
    if(entry===null)return null;
    const image=sourceImage(entry,"Valley wall atlas"),variants={};
    for(const material of materials) {
      const row=entry.variants?.[material];
      const crop=sourceRect(row?.crop,image,material+" complete crop"),alphaBounds=sourceRect(row?.alphaBounds||crop,image,material+" alpha bounds");
      if(!contains(crop,alphaBounds))throw new TypeError(material+" paint must remain inside its complete crop");
      const gate=row.gateSource;
      if(!gate || ![gate.x,gate.y,gate.openingWidth,gate.height].every(Number.isFinite) ||
        gate.x<crop.x || gate.x>crop.x+crop.width || gate.y<crop.y || gate.y>crop.y+crop.height ||
        gate.openingWidth<=0 || gate.height<=0)throw new TypeError(material+" needs its measured doorway threshold and opening size");
      if(!Array.isArray(row.towers)||row.towers.length!==2)throw new TypeError(material+" needs exactly two measured gate towers");
      const towers=row.towers.map((tower,index)=>{
        const box=sourceRect(tower,image,material+" tower "+index);
        if(!contains(crop,box))throw new TypeError(material+" tower lies outside its complete crop");
        return {id:index?"gate-east":"gate-west",...box};
      });
      variants[material]={crop,alphaBounds,gateSource:{x:gate.x,y:gate.y,openingWidth:gate.openingWidth,height:gate.height},towers};
    }
    const scales={};
    for(const profile of ["desktop","compact"]) {
      const scale=entry.scales?.[profile];
      if(!Number.isFinite(scale)||scale<=0)throw new TypeError("Valley wall atlas needs one uniform scale per profile");
      scales[profile]=scale;
    }
    return deepFreeze({...image,variants,scales});
  }
  function validateTerrain(entry) {
    if(entry===null)return null;
    const image=sourceImage(entry,"Valley cliff art"),crop=sourceRect(entry.crop||{x:0,y:0,width:image.width,height:image.height},image,"Valley cliff crop");
    const alphaBounds=sourceRect(entry.alphaBounds||crop,image,"Valley cliff alpha bounds");
    if(!contains(crop,alphaBounds))throw new TypeError("Valley cliff paint must remain inside its complete crop");
    const placements={};
    for(const profile of ["desktop","compact"]) {
      const p=entry[profile];
      if(!p || ![p.x,p.y].every(Number.isInteger)||!Number.isFinite(p.scale)||p.scale<=0) {
        throw new TypeError("Valley cliff placement needs integer world x/y and one uniform scale per profile");
      }
      const focusBounds=p.focusBounds?worldRect(p.focusBounds,"Near-pass focus"):null;
      if(!Array.isArray(p.decorExclusions))throw new TypeError("Valley cliff shoulders need measured world-space decor exclusions");
      const decorExclusions=p.decorExclusions.map((b,index)=>({id:b.id||"valley-shoulder-"+index,...worldRect(b,"Valley shoulder")}));
      placements[profile]={x:p.x,y:p.y,scale:p.scale,focusBounds,decorExclusions};
    }
    return deepFreeze({...image,crop,alphaBounds,...placements});
  }
  // Validate both entries before either is committed. Registration clears only
  // presentation caches; it cannot modify buildings, queues or storage.
  function registerArt(registry) {
    const hasAtlas=Object.hasOwn(registry||{},"atlas"),hasTerrain=Object.hasOwn(registry||{},"valleyArt");
    const nextAtlas=hasAtlas?validateAtlas(registry.atlas):atlas,nextTerrain=hasTerrain?validateTerrain(registry.valleyArt):valleyArt;
    if(hasAtlas)atlas=nextAtlas;if(hasTerrain)valleyArt=nextTerrain;
    cache.clear();terrainCache.clear();return Number(hasAtlas)+Number(hasTerrain);
  }
  const registerTerrain=(entry)=>registerArt({valleyArt:entry});
  function terrainLayout({desktop=false}={}) {
    const profile=desktop?"desktop":"compact";if(terrainCache.has(profile))return terrainCache.get(profile);
    const placement=valleyArt?.[profile],image=placement?{src:valleyArt.src,width:valleyArt.width,height:valleyArt.height,
      x:placement.x,y:placement.y,scale:placement.scale}:null;
    const imageBounds=image?translated(valleyArt.crop,image):null,alphaBounds=image?translated(valleyArt.alphaBounds,image):null;
    const decorExclusions=placement?placement.decorExclusions.map((b)=>centred(b.id,b)):[];
    // Broad rear painting is scenery, not an explorable settlement frame.
    // Only the explicitly measured pass opening may influence camera Fit.
    const scene=deepFreeze({profile,coordinateSpace:"world",artRegistered:Boolean(image),image,imageBounds,alphaBounds,
      sourceCrop:valleyArt?.crop||null,focusBounds:placement?.focusBounds||null,decorExclusions});
    terrainCache.set(profile,scene);return scene;
  }
  function layout(level,{desktop=false,plots=[]}={}) {
    const parsed=Number(level),completed=Number.isFinite(parsed)?Math.max(0,Math.min(50,Math.floor(parsed))):0,profile=desktop?"desktop":"compact",p=profiles[profile];
    const valid=plots.filter((b)=>[b.x,b.y,b.width,b.height].every(Number.isFinite)&&b.width>0&&b.height>0)
      .map(({id,x,y,width,height})=>({id,x,y,width,height}));
    const key=JSON.stringify([completed,profile,valid]);if(cache.has(key))return cache.get(key);
    const milestones=window.AzmaraBuildingArt?.milestonesFor("town-wall")||fallbackMilestones;
    const stageIndex=completed?Math.max(0,milestones.findLastIndex((n)=>n<=completed)):0;
    const rowIndex=completed>=33?2:completed>=11?1:0,material=completed?materials[rowIndex]:"none",row=completed?integratedDefences[material]:null;
    const placement=integratedPlacement[profile],scale=placement.scale,image=row?{src:row.src,width:row.width,height:row.height,scale,
      x:placement.x,y:placement.y}:null;
    const imageBounds=image?translated(row.crop,image):null,alphaBounds=image?translated(row.alphaBounds,image):null;
    const openingWidth=row?row.gateSource.openingWidth*scale:desktop?140:94,gateHeight=row?row.gateSource.height*scale:desktop?110:74;
    const gate=completed?{x:p.gate[0],y:p.gate[1],width:openingWidth,height:gateHeight,openingWidth,
      controlWidth:340,controlHeight:145,approachWidth:p.approachWidth,
      approachPoints:approaches[profile],sourceAnchor:row?row.gateSource:null}:null;
    const towers=row?row.towers.map((tower)=>{
      const box=translated(tower,image);return {id:tower.id,x:box.x+box.width/2,y:box.y+box.height,width:box.width,
        height:box.height,depth:0,layer:"back",sourceBounds:{x:tower.x,y:tower.y,width:tower.width,height:tower.height},worldBounds:box};
    }):[];
    const gateBounds=gate?{x:gate.x-gate.controlWidth/2,y:gate.y-gate.controlHeight/2,width:gate.controlWidth,height:gate.controlHeight+22}:null;
    const approachBounds=gate?{x:gate.x-p.approachWidth/2,y:gate.y,width:p.approachWidth,height:p.approachLength+p.approachWidth/2}:null;
    const decorExclusions=alphaBounds?[centred("wall-rear-span",alphaBounds)]:[];
    if(approachBounds)decorExclusions.push(centred("wall-gate-approach",approachBounds));
    const terrain=terrainLayout({desktop}),layerBounds={back:alphaBounds?union([alphaBounds]):null,front:null};
    const worldBounds=union([alphaBounds,gateBounds,approachBounds]),focusBounds=union([worldBounds,terrain.focusBounds]);
    const contour=completed?routes[profile]:[];
    const scene=deepFreeze({completed,minLevel:completed?milestones[stageIndex]:0,artLevel:completed?artLevels[stageIndex]:0,
      stageIndex,rowIndex,material,profile,coordinateSpace:"world",frontOnly:false,backOnly:true,closed:false,
      contour,backContours:completed?[contour]:[],frontContour:[],gate,towers,dimensions:completed?{gateWidth:openingWidth,gateHeight}:null,
      exclusions:valid,decorExclusions,worldBounds,focusBounds,paintedBounds:alphaBounds,layerBounds,imageBounds,alphaBounds,
      artRegistered:Boolean(image),image,sourceCrop:row?.crop||null,sourceGate:row?.gateSource||null,splitY:null,frontPolygon:[],enclosure:null});
    if(cache.size>=32)cache.delete(cache.keys().next().value);cache.set(key,scene);return scene;
  }
  function rasterMarkup(scene,kind) {
    if(!scene.image)return "";
    const image=scene.image,b=scene.imageBounds,id="azmara-"+kind+"-"+scene.profile+(scene.material?"-"+scene.material:"")+"-crop";
    // Rectangles only select complete source pixels. No SVG path draws a fake
    // wall, cliff, gate or shadow; neither source dimension is stretched.
    return '<defs><clipPath id="'+id+'" clipPathUnits="userSpaceOnUse"><rect x="'+b.x+'" y="'+b.y+'" width="'+b.width+'" height="'+b.height+'"/></clipPath></defs><image href="'+xml(image.src)+
      '" x="'+image.x+'" y="'+image.y+'" width="'+image.width*image.scale+'" height="'+image.height*image.scale+
      '" preserveAspectRatio="xMinYMin meet" clip-path="url(#'+id+')" data-uniform-scale="'+image.scale+'" style="stroke:none;pointer-events:none"/>';
  }
  function renderBack(level,options={}) {
    const scene=layout(level,options);if(!scene.completed||!scene.image)return "";
    if(renderCache.has(scene))return renderCache.get(scene);
    const markup='<g id="azmara-wall-back-body" data-town-wall-layer="back" data-town-wall-level="'+scene.completed+
      '" data-town-wall-stage="'+scene.minLevel+'" data-town-wall-art-level="'+scene.artLevel+'" data-town-wall-material="'+scene.material+
      '" data-wall-coordinate-space="world" data-wall-closed="false" data-wall-composition="rear-pass" data-wall-contour=\''+JSON.stringify(scene.contour)+
      '\' aria-hidden="true" style="stroke:none;pointer-events:none">'+rasterMarkup(scene,"valley-wall")+'</g>';
    renderCache.set(scene,markup);return markup;
  }
  // There is no actor sorting. The complete rear pass stays below every town
  // building in the SVG/DOM stack; it has no front-wall paint layer.
  const renderFront=()=>"";
  function renderTerrain(options={}) {
    // A built stage already contains the complete cliff painting. Suppress the
    // unfortified ridge beneath it so the two near-identical silhouettes cannot
    // ghost at their alpha edges. Empty towns retain the original bare valley.
    if ((Number(options.wallLevel) || 0) > 0) return "";
    const scene=terrainLayout(options);if(!scene.image)return "";
    return '<g data-valley-terrain="rear-cliffs" data-wall-coordinate-space="world" aria-hidden="true" style="stroke:none;pointer-events:none">'+rasterMarkup(scene,"valley-terrain")+'</g>';
  }
  function renderPreview(level,className="building-art") {
    const scene=layout(Math.max(1,Number(level)||1),{desktop:true});
    if(!scene.image)return "";
    const c=scene.sourceCrop,image=scene.image;
    return '<svg class="'+xml(className)+'" viewBox="'+[c.x,c.y,c.width,c.height].join(" ")+'" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style="width:100%;height:100%;overflow:hidden;pointer-events:none"><image href="'+xml(image.src)+'" width="'+image.width+'" height="'+image.height+'"/></svg>';
  }
  // Inspected original art: complete row ownership, exact door-centre anchors,
  // one uniform scale per profile. Original PNG and edge-cleanup receipt retained.
  registerArt(
{
  "atlas": {
    "src": "assets/valley-wall/azmara-town-wall-stages-v2.png",
    "width": 1254,
    "height": 1254,
    "scales": {
      "desktop": 0.75,
      "compact": 0.5
    },
    "variants": {
      "timber": {
        "crop": {
          "x": 40,
          "y": 55,
          "width": 1200,
          "height": 342
        },
        "alphaBounds": {
          "x": 40,
          "y": 55,
          "width": 1200,
          "height": 342
        },
        "gateSource": {
          "x": 632,
          "y": 286,
          "openingWidth": 240,
          "height": 150
        },
        "towers": [
          {
            "x": 302,
            "y": 62,
            "width": 184,
            "height": 316
          },
          {
            "x": 778,
            "y": 62,
            "width": 185,
            "height": 316
          }
        ]
      },
      "adobe": {
        "crop": {
          "x": 35,
          "y": 440,
          "width": 1200,
          "height": 345
        },
        "alphaBounds": {
          "x": 35,
          "y": 440,
          "width": 1200,
          "height": 345
        },
        "gateSource": {
          "x": 632,
          "y": 678,
          "openingWidth": 240,
          "height": 145
        },
        "towers": [
          {
            "x": 276,
            "y": 449,
            "width": 224,
            "height": 323
          },
          {
            "x": 770,
            "y": 449,
            "width": 207,
            "height": 323
          }
        ]
      },
      "grandstone": {
        "crop": {
          "x": 35,
          "y": 822,
          "width": 1200,
          "height": 353
        },
        "alphaBounds": {
          "x": 35,
          "y": 822,
          "width": 1200,
          "height": 353
        },
        "gateSource": {
          "x": 632,
          "y": 1062,
          "openingWidth": 240,
          "height": 144
        },
        "towers": [
          {
            "x": 277,
            "y": 833,
            "width": 229,
            "height": 323
          },
          {
            "x": 770,
            "y": 833,
            "width": 230,
            "height": 323
          }
        ]
      }
    }
  },
  "valleyArt": {
    "src": "assets/valley-wall/rear-valley-cliffs-v1.png",
    "width": 1536,
    "height": 1024,
    "crop": {
      "x": 0,
      "y": 130,
      "width": 1536,
      "height": 362
    },
    "alphaBounds": {
      "x": 10,
      "y": 148,
      "width": 1516,
      "height": 326
    },
    "desktop": {
      "x": -204,
      "y": -846,
      "scale": 3,
      "focusBounds": {
        "x": 1660,
        "y": 140,
        "width": 880,
        "height": 440
      },
      "decorExclusions": [
        {
          "id": "valley-west-shoulder",
          "x": -174,
          "y": -402,
          "width": 1794,
          "height": 980
        },
        {
          "id": "valley-east-shoulder",
          "x": 2580,
          "y": -402,
          "width": 1794,
          "height": 980
        }
      ]
    },
    "compact": {
      "x": 1883,
      "y": 940,
      "scale": 1.65,
      "focusBounds": {
        "x": 2840,
        "y": 1380,
        "width": 620,
        "height": 350
      },
      "decorExclusions": [
        {
          "id": "valley-west-shoulder",
          "x": 1899.5,
          "y": 1184.2,
          "width": 950,
          "height": 540
        },
        {
          "id": "valley-east-shoulder",
          "x": 3450,
          "y": 1184.2,
          "width": 950,
          "height": 540
        }
      ]
    }
  }
}
  );
  window.AzmaraTownWall=Object.freeze({layout,renderBack,renderFront,render:renderBack,registerArt,registerTerrain,renderPreview,
    terrainLayout,renderTerrain,routes,approaches,
    get artRegistry(){return deepFreeze(JSON.parse(JSON.stringify({atlas,valleyArt,integratedDefences})));},
    get legacyArtRegistry(){return legacyArtwork;}});
})();
