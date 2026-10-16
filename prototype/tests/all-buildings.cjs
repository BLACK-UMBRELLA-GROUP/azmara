"use strict";

// DEC056: UI-driven, local-only build/update/Skip, role, save and refund tests.
const { chromium } = require(process.argv[2] || "playwright");
const { markerPoints, assertDrawnMarkers } = require("./marker-proof.cjs");
const q = require("./building-harness.cjs");
const { assert, key, legacyKey, legacyRaw, epoch, supplies, ids, types, fixture, empty, cost, subtract, targetFor, building, settle, raw, saved, close, openPlot, click, at, mode, picture, create } = q;
let groups = 0;
let cases = 0;
const scope=process.env.AZMARA_QA_BUILDINGS_SCOPE||"all";
assert(["all","geometry"].includes(scope),"Unknown expanded QA scope");

async function run(browser, name, seed, verify, options) {
  const { context, page, errors } = await create(browser, seed, options);
  try {
    await verify(page);
    assert.equal(await raw(page, legacyKey), legacyRaw, "Separate historical save changed");
    assert.deepEqual(errors, [], "Browser/console/request/HTTP errors");
    groups += 1; console.log("PASS " + name);
  } finally { await context.close(); }
}
function placed(typeId, level, resources = supplies) {
  const type = types.find((entry) => entry.id === typeId), id = targetFor(type);
  return id === "general-01" ? fixture({ hallLevel: level, resources: { ...resources } }) : empty({ resources: { ...resources }, buildings: { [id]: { typeId, level } } });
}
function expectedQueue(id, typeId, level = 0, startedAt = epoch) {
  return { buildingId: id, typeId, toLevel: level + 1, startedAt, endsAt: startedAt + 120000, paidCost: cost(level) };
}
async function choose(page, type, id = targetFor(type)) {
  await openPlot(page, id);
  if (id !== "general-01") {
    const choices = await page.locator("#building-type option").evaluateAll((options) => options.map((option) => option.value));
    assert.deepEqual(choices, types.filter((entry) => entry.id !== "town-hall" && entry.role === type.role).map((entry) => entry.id), "Role-specific select changed");
    await page.locator("#building-type").selectOption(type.id); await settle(page);
  } else assert.equal(await page.locator("#building-type").count(), 0, "Hall site must be exclusive");
  return id;
}
async function start(page, type, id = targetFor(type), level = 0) {
  if (!level) await choose(page, type, id); else await openPlot(page, id);
  const before = await saved(page);
  const selector = level ? "#upgrade-building" : id === "general-01" ? "#build-hall" : "#build-selected";
  await click(page, selector);
  const after = await saved(page);
  assert.deepEqual(after.resources, subtract(before.resources, cost(level)));
  assert.deepEqual(after.construction, expectedQueue(id, type.id, level, epoch));
  assert.deepEqual(building(after, id), building(before, id), "Construction placed/upgraded before completion");
  assert.match(await page.locator("#construction-time").textContent(), /^2:00/);
  assert.match(await page.locator("#free-cancel-time").textContent(), /1:00/);
  return after;
}
async function fullGeometry(page, count = 23) {
  const points = await markerPoints(page, true);
  assert.equal(points.length, 23);
  assert.deepEqual(points.map((point) => point.id).sort(), [...ids].sort());
  const viewport = page.viewportSize();
  for (const point of points) {
    assert(point.insideTarget && point.exposed, "Opaque artwork is not clickable: " + JSON.stringify({ id: point.id, samples: point.samples }));
    const r = point.rect;
    assert(r.width >= 44 && r.height >= 44 && r.x >= -.5 && r.y >= -.5 && r.right <= viewport.width + .5 && r.bottom <= viewport.height + .5, "Full plot target is clipped or too small: " + JSON.stringify({ id: point.id, r }));
    assert(point.imageDx < .1 && point.imageDy < .1, "Artwork is not registered to its target " + point.id);
    for (const other of points) {
      if (other.id <= point.id) continue;
      const s = other.rect;
      assert(!(Math.min(r.right, s.right) - Math.max(r.x, s.x) > .05 && Math.min(r.bottom, s.bottom) - Math.max(r.y, s.y) > .05), "Full plot wrappers overlap: " + point.id + "/" + other.id);
    }
  }
  assert.equal(points.filter((point) => point.occupied === "true").length, count);
  assert.deepEqual(await page.locator(".plot-marker").evaluateAll((markers) => markers.reduce((total, marker) => ({ ...total, [marker.dataset.kind]: (total[marker.dataset.kind] || 0) + 1 }), {})), { general: 19, wall: 1, harbour: 2, freighter: 1 });
  await assertDrawnMarkers(page, points, true);
  return points;
}
function mixed(level = 50) {
  const ordinary = types.filter((type) => type.role === "general" && type.id !== "town-hall");
  const buildings = {};
  for (let index = 2; index <= 19; index++) buildings[`general-${String(index).padStart(2, "0")}`] = { typeId: ordinary[index - 2].id, level };
  buildings["wall-01"] = { typeId: "town-wall", level };
  buildings["harbour-01"] = { typeId: "trading-port", level };
  buildings["harbour-02"] = { typeId: "shipyard", level };
  buildings["freighter-01"] = { typeId: "dockyard", level };
  return fixture({ hallLevel: level, buildings });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    if(scope==="all") {
    for (const type of types) await run(browser, `${type.id}: eligible Build1, paid Skip once, Update2, exact49/Update50, direct50/cap and raw-byte reload`, empty(), async (page) => {
      const id = targetFor(type);
      const queued = await start(page, type);
      await page.locator("#skip-construction").evaluate((button) => { button.click(); button.click(); }); await settle(page);
      let after = await saved(page);
      assert.deepEqual(building(after, id), { typeId: type.id, level: 1 });
      assert.equal(after.construction, null); assert.deepEqual(after.resources, queued.resources, "Skip refunded or charged twice");
      assert.equal(await page.locator(`.plot-marker[data-plot="${id}"]`).getAttribute("data-building-type"), type.id);
      await click(page, "#upgrade-building");
      assert.deepEqual((await saved(page)).construction, expectedQueue(id, type.id, 1));
      await click(page, "#skip-construction");
      after = await saved(page); assert.deepEqual(building(after, id), { typeId: type.id, level: 2 });
      const resources = { ...after.resources };
      assert.equal(await page.locator("#test-building-level option").count(), 50);
      await page.locator("#test-building-level").selectOption("49"); await click(page, "#set-test-level");
      assert.deepEqual(building(await saved(page), id), { typeId: type.id, level: 49 });
      assert.deepEqual((await saved(page)).resources, resources, "Direct49 used resources");
      await click(page,"#upgrade-building");
      assert.deepEqual((await saved(page)).construction, expectedQueue(id,type.id,49));
      await click(page,"#skip-construction");
      const capResources = subtract(resources,cost(49));
      assert.deepEqual(building(await saved(page), id), { typeId:type.id,level:50 });
      assert.deepEqual((await saved(page)).resources,capResources,"Upper-bound Update50/Skip used the wrong receipt or charged twice");
      await page.locator("#test-building-level").selectOption("1"); await click(page,"#set-test-level");
      await page.locator("#test-building-level").selectOption("50"); await click(page, "#set-test-level");
      assert.deepEqual(building(await saved(page), id), { typeId: type.id, level: 50 });
      assert.deepEqual((await saved(page)).resources, capResources, "Direct level used resources");
      assert.equal(await page.locator("#upgrade-building").isDisabled(), true);
      const final = await raw(page);
      await page.locator("#upgrade-building").dispatchEvent("click"); assert.equal(await raw(page), final, "Level50 forged Update crossed cap");
      await close(page); await page.reload(); await settle(page);
      assert.equal(await raw(page), final, "Reload rewrote valid expanded save bytes");
      assert.deepEqual(building(await saved(page), id), { typeId: type.id, level: 50 });
      assert.equal(await page.locator(`.plot-marker[data-plot="${id}"]`).getAttribute("data-building-stage"), "11");
      cases += 1;
    });

    await run(browser,"saved retired transport identifier retains its level, exact bytes and original land art",empty({buildings:{"harbour-01":{typeId:"shipyard",level:7}}}),async(page)=>{
      const before=await raw(page);
      await openPlot(page,"harbour-01");await close(page);await mode(page,"gameplay");await mode(page,"dev");await page.reload();await settle(page);
      assert.equal(await raw(page),before);assert.deepEqual((await saved(page)).buildings["harbour-01"],{typeId:"shipyard",level:7});
      const art=await page.locator('[data-plot="harbour-01"] .building-sprite').evaluate(node=>getComputedStyle(node).backgroundImage);
      assert.match(art,/azmara-trading-port-stages-land-v3\.png/);
    });
    const legacyReceipt=cost(7),legacyQueue=empty({resources:subtract(supplies,legacyReceipt),buildings:{"harbour-01":{typeId:"shipyard",level:7}},construction:expectedQueue("harbour-01","shipyard",7)});
    await run(browser,"retired paid transport queue remains valid and Skip settles once without changing receipt or recharge",legacyQueue,async(page)=>{
      const before=await raw(page);await page.reload();await settle(page);assert.equal(await raw(page),before);
      await openPlot(page,"harbour-01");assert.deepEqual((await saved(page)).construction,legacyQueue.construction);
      await click(page,"#skip-construction");assert.equal((await saved(page)).construction,null);assert.deepEqual((await saved(page)).buildings["harbour-01"],{typeId:"shipyard",level:8});assert.deepEqual((await saved(page)).resources,legacyQueue.resources);
      const settled=await raw(page);await page.reload();await settle(page);assert.equal(await raw(page),settled);
    });
    await run(browser,"retired naval identifier cannot start a forged new transport project",empty(),async(page)=>{
      await openPlot(page,"harbour-01");const before=await raw(page);
      assert.deepEqual(await page.locator("#building-type option").evaluateAll(nodes=>nodes.map(n=>n.value)),["trading-port"]);
      await page.evaluate(()=>{const select=document.querySelector("#building-type");select.append(new Option("Retired","shipyard"));select.value="shipyard";document.querySelector("#build-selected").dataset.typeId="shipyard";document.querySelector("#build-selected").click();});await settle(page);
      assert.equal(await raw(page),before);assert.equal((await saved(page)).construction,null);
    });

    for (const viewport of [{width:1440,height:900},{width:390,height:844}]) await run(browser, `confirmed reset clears all23 mixed buildings and active receipt but preserves name/legacy at${viewport.width}x${viewport.height}`, mixed(5), async (page) => {
      await start(page,types.find((type)=>type.id==="academy"),"general-02",5);
      const before=await raw(page);
      await q.menu(page,'[data-panel="overview"]'); await click(page,"#request-reset"); await click(page,"#cancel-reset");
      assert.equal(await raw(page),before,"Declining all-building reset changed the queue or occupied map");
      await q.menu(page,'[data-panel="overview"]'); await click(page,"#request-reset"); await click(page,"#confirm-reset");
      assert.deepEqual(await saved(page),empty({resources:{coins:2400,timber:760,stone:540}}),"Reset retained expanded buildings or receipt");
      await fullGeometry(page,0); const final=await raw(page);
      await page.reload(); await settle(page); assert.equal(await raw(page),final);
      await fullGeometry(page,0); await picture(page,`isolated-expanded-all23-reset-${viewport.width}x${viewport.height}`);
    },{viewport});

    for (const typeId of ["academy", "town-wall", "trading-port", "dockyard"]) {
      const type = types.find((entry) => entry.id === typeId), id = targetFor(type);
      for (const elapsed of [0, 59999, 60000, 119999, 120000]) await run(browser, `${typeId} generic cancellation at ${elapsed}ms: atomic refund/completion and reload`, empty(), async (page) => {
        const queued = await start(page, type);
        await at(page, epoch + elapsed, "#request-cancel-construction");
        if (elapsed < 60000) {
          assert.deepEqual(await saved(page), empty(), "Free cancellation is not exact100%");
          assert.equal(await page.locator("#construction-cancel-confirm").count(), 0);
        } else if (elapsed < 120000) {
          assert.equal(await page.locator("#construction-cancel-confirm").isVisible(), true);
          assert.deepEqual(await saved(page), queued, "Quote mutated state");
          await page.locator("#confirm-cancel-construction").evaluate((button) => { button.click(); button.click(); }); await settle(page);
          const expected = subtract(supplies, cost(0));
          for (const resource of Object.keys(expected)) expected[resource] += Math.floor(cost(0)[resource] * .3);
          assert.deepEqual(await saved(page), empty({ resources: expected }), "Paid cancellation did not floor30% of receipt once");
        } else {
          const actual = await saved(page);
          assert.deepEqual(building(actual, id), { typeId, level: 1 });
          assert.equal(actual.construction, null); assert.deepEqual(actual.resources, queued.resources, "Exact completion incorrectly refunded");
        }
        const final = await raw(page);
        await page.reload(); await settle(page);
        await at(page, epoch + 180000); await page.waitForTimeout(550);
        assert.equal(await raw(page), final, "Completed/cancelled generic project reconciled twice on reload");
      });
    }

    await run(browser, "duplicate ordinary samples allowed; confirmed clear removes only selected nonHall without refund", mixed(5), async (page) => {
      const original = await saved(page);
      await openPlot(page, "general-02"); await click(page, "#request-clear-plot");
      assert.equal(await page.locator("#clear-plot-confirm").isVisible(), true);
      assert.deepEqual(await saved(page), original);
      await click(page, "#keep-plot"); assert.deepEqual(await saved(page), original);
      await click(page, "#request-clear-plot"); await click(page, "#confirm-clear-plot");
      const expected = structuredClone(original); delete expected.buildings["general-02"];
      assert.deepEqual(await saved(page), expected);
      const type = types.find((entry) => entry.id === expected.buildings["general-03"].typeId);
      await choose(page, type, "general-02"); await click(page, "#build-selected"); await click(page, "#skip-construction");
      assert.equal((await saved(page)).buildings["general-02"].typeId, (await saved(page)).buildings["general-03"].typeId);
      await openPlot(page, "general-01"); assert.equal(await page.locator("#request-clear-plot").count(), 0, "Clear-one-plot must not remove Hall");
    });

    await run(browser, "refill reserves exact receipt room; global queued-project guard disables set/clear/build", mixed(49), async (page) => {
      const type = types.find((entry) => entry.id === "academy");
      await start(page, type, "general-02", 49);
      await click(page, "#refill-test-supplies");
      assert.deepEqual((await saved(page)).resources, subtract(supplies, cost(49)));
      const before = await raw(page);
      await openPlot(page, "general-03");
      assert.equal(await page.locator("#set-test-level").isDisabled(), true);
      assert.equal(await page.locator("#request-clear-plot").isDisabled(), true);
      await page.locator("#set-test-level, #request-clear-plot").evaluateAll((buttons) => buttons.forEach((button) => button.dispatchEvent(new MouseEvent("click", { bubbles: true }))));
      assert.equal(await raw(page), before, "Queue bypass through another plot");
      await openPlot(page, "general-02"); await at(page, epoch + 59999, "#request-cancel-construction");
      assert.deepEqual((await saved(page)).resources, supplies, "Full cancellation after refill overflowed or lost receipt");
      assert.equal((await saved(page)).construction, null);
    });

    await run(browser, "forged incompatible Build, level0/51/fraction and prototype type/plot events do not mutate", placed("academy", 1), async (page) => {
      await openPlot(page, "general-02");
      let before = await raw(page);
      for (const value of ["0", "51", "1.5", "NaN"]) {
        await page.locator("#test-building-level").evaluate((select, value) => { const option = document.createElement("option"); option.value = value; select.append(option); select.value = value; }, value);
        await click(page, "#set-test-level"); assert.equal(await raw(page), before, "Invalid direct level accepted: " + value);
      }
      for (const [field, value] of [["targetPlot", "__proto__"], ["typeId", "constructor"], ["currentLevel", "50"]]) {
        await openPlot(page, "general-02");
        await page.locator("#upgrade-building").evaluate((button, args) => { button.dataset[args.field] = args.value; button.click(); }, { field, value });
        assert.equal(await raw(page), before, "Forged occupied identity accepted");
      }
      await openPlot(page, "wall-01");
      await page.locator("#build-selected").evaluate((button) => { button.dataset.typeId = "academy"; button.click(); });
      assert.equal(await raw(page), before, "Ordinary building placed on wall reserve");
    });

    await run(browser, "Gameplay hides and rejects stale Skip/refill/set/clear/Build/cancel; same save returns in Dev", placed("academy", 5), async (page) => {
      await openPlot(page, "general-02");
      await page.evaluate(() => { window.__staleDev = [...document.querySelectorAll("#upgrade-building,#set-test-level,#refill-test-supplies,#request-clear-plot")].map((node) => node.cloneNode(true)); });
      await click(page, "#upgrade-building");
      await page.evaluate(() => window.__staleDev.push(...[...document.querySelectorAll("#skip-construction,#request-cancel-construction")].map((node) => node.cloneNode(true))));
      const before = await raw(page);
      await mode(page, "gameplay"); await openPlot(page, "general-02");
      assert.equal(await page.locator("#build-hall,#build-selected,#upgrade-building,#skip-construction,#set-test-level,#refill-test-supplies,#request-clear-plot,#request-cancel-construction").count(), 0);
      await page.evaluate(() => { for (const node of window.__staleDev) { document.querySelector("#panel-content").append(node); node.dispatchEvent(new MouseEvent("click", { bubbles: true })); node.remove(); } });
      assert.equal(await raw(page), before, "Stale Gameplay Dev control changed state");
      await mode(page, "dev"); await openPlot(page, "general-02"); await click(page, "#skip-construction");
      assert.equal((await saved(page)).buildings["general-02"].level, 6);
    });

    await run(browser, "stale completed job controls cannot Skip/cancel a later project", placed("academy", 1), async (page) => {
      const type = types.find((entry) => entry.id === "academy");
      await start(page, type, "general-02", 1);
      await page.evaluate(() => { window.__oldJobs = [...document.querySelectorAll("#skip-construction,#request-cancel-construction")].map((node) => node.cloneNode(true)); });
      await click(page, "#skip-construction"); await at(page, epoch + 1); await click(page, "#upgrade-building");
      const before = await raw(page);
      await page.evaluate(() => { for (const node of window.__oldJobs) { document.querySelector("#panel-content").append(node); node.click(); node.remove(); } });
      assert.equal(await raw(page), before, "Old queue identity settled/refunded later queue");
    });

    await run(browser, "real retained queue buttons cannot settle a same-millisecond rebuilt identical job", placed("academy", 1), async (page) => {
      const type = types.find((entry) => entry.id === "academy");
      await start(page, type, "general-02", 1);
      await page.evaluate(() => { window.__retainedJobButtons = [...document.querySelectorAll("#skip-construction,#request-cancel-construction")]; });
      await at(page, epoch, "#request-cancel-construction");
      await click(page, "#upgrade-building");
      const before = await raw(page);
      await page.evaluate(() => {
        for (const button of window.__retainedJobButtons) {
          // Same old real node, not a clone. Every public tuple equals the new
          // job; only its captured receipt identity distinguishes the jobs.
          document.querySelector("#panel-content").append(button); button.click(); button.remove();
        }
      });
      assert.equal(await raw(page), before, "Old real button settled/refunded a same-ms replacement");
      await click(page, "#skip-construction"); assert.equal((await saved(page)).buildings["general-02"].level, 2);
    });

    for (const duration of [10000, 120000]) await run(browser, `pretty legacy untyped Hall${duration}ms and expanded saves retain exact raw bytes until mutation`, (() => {
      const receipt = cost(4);
      const job = { buildingId: "general-01", toLevel: 5, startedAt: epoch, endsAt: epoch + duration };
      if (duration === 120000) job.paidCost = receipt;
      return " \n" + JSON.stringify(fixture({ hallLevel: 4, resources: subtract(supplies, receipt), construction: job }), null, 2) + " \n";
    })(), async (page) => {
      const before = await raw(page); await openPlot(page, "general-01"); await close(page); await page.reload(); await settle(page);
      assert.equal(await raw(page), before, "Legacy startup/panel/reload rewrote bytes");
      await openPlot(page, "general-01"); await click(page, "#skip-construction");
      assert.equal((await saved(page)).hallLevel, 5); assert.equal((await saved(page)).construction, null);
    });

    const malformed = [
      ["Hall51", fixture({ hallLevel: 51 })], ["ordinary51", empty({ buildings: { "general-02": { typeId: "academy", level: 51 } } })],
      ["ordinary0", empty({ buildings: { "general-02": { typeId: "academy", level: 0 } } })],
      ["Hall in map", empty({ buildings: { "general-01": { typeId: "town-hall", level: 1 } } })],
      ["role mismatch", empty({ buildings: { "wall-01": { typeId: "academy", level: 1 } } })],
      ["prototype plot", ' {"version":3,"layoutId":"town-23-v1","townName":"Building QA","hallLevel":1,"resources":{"coins":100000,"timber":100000,"stone":100000},"construction":null,"buildings":{"__proto__":{"typeId":"academy","level":1}}} '],
      ["prototype type", empty({ buildings: { "general-02": { typeId: "constructor", level: 1 } } })],
      ["extra fields", empty({ buildings: { "general-02": { typeId: "academy", level: 1, effects: 999 } } })],
      ["array map", empty({ buildings: [] })],
      ["untyped ordinary queue", empty({ resources: subtract(supplies, cost(0)), construction: { ...expectedQueue("general-02", "academy"), typeId: undefined } })],
      ["null type queue", empty({ resources: subtract(supplies, cost(0)), construction: { ...expectedQueue("general-02", "academy"), typeId: null } })],
      ["incompatible queue", empty({ resources: subtract(supplies, cost(0)), construction: expectedQueue("wall-01", "academy") })],
      ["inflated receipt", empty({ resources: subtract(supplies, cost(0)), construction: { ...expectedQueue("general-02", "academy"), paidCost: { ...cost(0), coins: 241 } } })],
      ["overflow receipt", empty({ construction: expectedQueue("general-02", "academy") })],
      ["wrong target", placed("academy", 5, subtract(supplies, cost(5)))],
      ["nonHall legacy10s", empty({ resources: subtract(supplies, cost(0)), construction: { ...expectedQueue("general-02", "academy"), endsAt: epoch + 10000, paidCost: undefined } })]
    ];
    malformed.find(([name]) => name === "wrong target")[1].construction = expectedQueue("general-02", "academy", 1);
    for (const [name, value] of malformed) await run(browser, "malformed expanded save rejected safely: " + name, value, async (page) => {
      assert.deepEqual(await saved(page), fixture({ townName: "Your town", resources: { coins: 2400, timber: 760, stone: 540 } }));
      assert.equal(await page.locator('.plot-marker[data-occupied="true"]').count(), 1);
      assert.equal(await page.evaluate(() => Object.prototype.typeId), undefined);
    });

    }
    for (const viewport of [{ width: 1024, height: 600 }, { width: 1500, height: 600 }, { width: 1440, height: 900 }, { width: 390, height: 844 }]) await run(browser, `all23 mixed Level50 plots: exposed real art,44px, nonoverlap, role clicks and no save mutation at${viewport.width}x${viewport.height}`, " \n" + JSON.stringify(mixed(), null, 2) + " \n", async (page) => {
      const before = await raw(page); const points = await fullGeometry(page);
      await picture(page, `isolated-all-23-mixed-level50-${viewport.width}x${viewport.height}`);
      for (const point of points) {
        await page.mouse.click(point.x, point.y);
        assert.equal(await page.locator("#detail-panel").evaluate((dialog) => dialog.open), true, "Real-art click did not open " + point.id);
        const actual = building(await saved(page), point.id);
        assert.equal(await page.locator("#panel-title").textContent(), await page.evaluate((id) => window.AzmaraCatalogue.get(id).name, actual.typeId));
        await close(page);
      }
      assert.equal(await raw(page), before, "Reviewing mixed buildings changed save bytes");
      await mode(page, "gameplay"); await fullGeometry(page); assert.equal(await raw(page), before);
    }, { viewport });
    assert.equal(groups,scope==="all"?83:4);
    console.log(JSON.stringify({ scope,groupsPassed: groups, distinctTypesBuiltUpdatedAndCapped: cases, browserErrors: 0 }));
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
