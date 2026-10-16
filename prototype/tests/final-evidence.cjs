"use strict";

// Clean final screenshots from explicit isolated fixtures, never Founder data.
// These refresh evidence only; do not add duplicate regression-group counts.
const {chromium}=require(process.argv[2]||"playwright");
const q=require("./building-harness.cjs");
const {assert}=q;
const six={"general-02":{typeId:"academy",level:50},"wall-01":{typeId:"town-wall",level:50},"harbour-01":{typeId:"trading-port",level:50},"harbour-02":{typeId:"shipyard",level:50},"freighter-01":{typeId:"dockyard",level:50}};
(async()=>{
  const browser=await chromium.launch({headless:true});let captures=0;
  try{
    for(const viewport of[{width:1440,height:900},{width:390,height:844}])for(const [name,state]of[
      ["hall1-bare",q.fixture({townName:"Isolated QA",resources:{coins:2400,timber:760,stone:540}})],
      ["hall50-developed",q.fixture({townName:"Isolated QA",hallLevel:50})],
      ["six-role50-developed",q.fixture({townName:"Isolated QA",hallLevel:50,buildings:six})]
    ]){
      const fixture=" \n"+JSON.stringify(state,null,2)+" \n";
      const {context,page,errors}=await q.create(browser,fixture,{viewport});
      try{
        await q.settle(page);
        assert.equal(await page.locator("body").getAttribute("data-town-level"),String(state.hallLevel));
        assert.equal(await page.locator("body").getAttribute("data-town-stage-source"),"actual");
        assert.equal(await page.locator("#town-core .plot-marker").count(),23);
        if(await page.locator("#toast").isVisible())await page.locator("#toast").waitFor({state:"hidden",timeout:10000});
        await q.picture(page,`final-isolated-town-${name}-${viewport.width}x${viewport.height}`);
        assert.equal(await q.raw(page),fixture,"Read-only evidence capture changed valid raw progress");
        assert.equal(await q.raw(page,q.legacyKey),q.legacyRaw);
        assert.deepEqual(errors,[]);captures++;
      }finally{await context.close();}
    }
    console.log(JSON.stringify({cleanEvidenceCaptures:captures,browserErrors:0,addedRegressionGroups:0}));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
