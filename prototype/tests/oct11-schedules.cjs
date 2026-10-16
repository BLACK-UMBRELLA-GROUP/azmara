"use strict";

// Published first-draft threshold fixture, independent of the schedule builder.
// Art labels remain eleven stable source cells while completed-level bands
// differ by building. Retired shipyard intentionally aliases Caravan Station.
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const expected={
  "town-hall":[1,5,8,12,17,22,28,34,41,45,50],"academy":[1,6,10,14,20,27,33,36,41,45,50],
  "warehouse":[1,4,8,13,18,22,27,33,40,44,50],"provision-house":[1,8,13,17,22,26,32,36,39,45,50],
  "palace":[1,6,11,18,24,28,32,36,42,45,50],"governors-residence":[1,5,10,16,22,27,34,38,41,46,50],
  "museum":[1,5,9,13,20,23,29,34,40,45,50],"embassy":[1,5,11,14,19,23,27,34,40,45,50],
  "prayer-area":[1,5,9,14,18,23,28,31,38,44,50],"trading-port":[1,5,9,14,20,25,29,32,37,43,50],
  "trading-post":[1,6,13,17,23,27,32,37,41,47,50],"depot":[1,6,10,14,17,22,28,32,39,45,50],
  "military-exchange":[1,5,9,15,19,25,30,35,40,47,50],"sea-chart-archive":[1,7,13,18,23,27,31,38,43,46,50],
  "dockyard":[1,6,10,13,18,22,28,35,40,46,50],"intelligence-house":[1,5,9,16,20,25,28,33,38,44,50],
  "shipyard":[1,5,9,14,20,25,29,32,37,43,50],"barracks":[1,4,9,15,20,24,31,35,40,46,50],
  "town-wall":[1,6,11,15,20,24,30,33,40,44,50],"workshop":[1,5,10,15,19,22,26,33,39,45,50],
  "foresters-house":[1,5,11,17,22,27,30,34,41,45,50],"silver-refinery":[1,5,10,14,20,26,33,38,42,47,50],
  "iron-foundry":[1,5,10,15,21,25,32,35,41,45,50],"grain-estate":[1,6,10,17,23,27,33,38,42,47,50],
  "clayworks":[1,4,8,13,20,24,29,35,39,44,50],"carpenters-workshop":[1,4,9,14,20,25,29,33,40,46,50],
  "precision-workshop":[1,6,10,16,22,26,29,34,38,45,50],"materials-workshop":[1,5,10,14,17,22,28,34,41,45,50],
  "grain-store":[1,6,11,15,19,22,29,35,41,46,50],"architects-office":[1,6,10,15,21,24,29,35,39,43,50],
  "chronos-forge":[1,6,10,14,20,26,33,37,40,45,50]
};
const artLevels=[1,5,10,15,20,25,30,35,40,45,50];
module.exports={expected,artLevels};
const snapshots=[];
for(let repeat=0;repeat<2;repeat++){
  const realm={window:{}};
  for(const source of["building-art.js","progression.js"])vm.runInNewContext(fs.readFileSync(path.join(__dirname,"..",source),"utf8"),realm);
  const art=realm.window.AzmaraBuildingArt;
  assert.deepEqual([...art.buildingIds],Object.keys(expected));assert.deepEqual([...art.artLevels],artLevels);
  const snapshot=[];
  for(const[id,schedule]of Object.entries(expected)){
    assert.deepEqual([...art.milestonesFor(id)],schedule,"Published schedule changed: "+id);assert(Object.isFrozen(art.milestonesFor(id)));
    for(let level=1;level<=50;level++){
      const minLevel=schedule.filter(n=>n<=level).at(-1),index=schedule.indexOf(minLevel),visual=art.forBuilding(id,level);
      assert(Object.isFrozen(visual));assert.equal(visual.stage,index+1);assert.equal(visual.minLevel,minLevel);assert.equal(visual.artLevel,artLevels[index]);
      if(id==="town-hall")assert.equal(visual.src,`assets/progression/azmara-hall-level-${artLevels[index]}.png`);
      else{assert.equal(visual.cell,index);assert.equal(visual.rect.length,4);assert(Object.isFrozen(visual.rect));}
      if(id==="shipyard")assert.strictEqual(visual,art.forBuilding("trading-port",level),"Legacy naval ID did not alias original land Caravan artwork");
      assert.strictEqual(visual,art.forBuilding(id,level),"Stable level reshuffles its art/cache");
      snapshot.push(JSON.stringify([id,level,visual]));
    }
  }
  assert.equal(new Set(Object.entries(expected).filter(([id])=>id!=="shipyard").map(([,schedule])=>schedule.join(","))).size,30);
  snapshots.push(snapshot);
}
assert.deepEqual(snapshots[0],snapshots[1],"Reloading a fresh realm reshuffles building appearances");
console.log("PASS30 distinct published irregular schedules;31 compatible IDs×50 completed levels×2 fresh realms; immutable eleven-source-cell mapping and stable retired-land alias");
