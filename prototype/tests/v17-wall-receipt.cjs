"use strict";

// Summarises completed isolated QA only; no browser or runtime mutations.
const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto"), assert = require("node:assert/strict");
const project = path.resolve(__dirname, "../.."), directory = path.join(project, "evidence/2026-10-11-city-wall");
const names = ["acceptance", "state", "max"], expected = [27, 3, 2];
const receipts = names.map(name => JSON.parse(fs.readFileSync(path.join(directory, `v17-wall-${name}-receipt.json`))));
const scenery = JSON.parse(fs.readFileSync(path.join(directory, "v16-acceptance-receipt.json")));
const hash = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
for (let i = 0; i < receipts.length; i++) {
  assert.equal(receipts[i].groupsPassed, expected[i]); assert.equal(receipts[i].browserErrors, 0);
  assert.deepEqual(receipts[i].sourceHashes, receipts[0].sourceHashes, "Scopes ran against different runtime source");
}
for (const [file, sha] of Object.entries(receipts[0].sourceHashes)) assert.equal(hash(path.join(project, "prototype", file)), sha, "Runtime changed after QA: " + file);
assert.equal(scenery.groupsPassed, 1); assert.equal(scenery.browserErrors, 0);
for (const [file, sha] of Object.entries(scenery.sourceHashes)) assert.equal(hash(path.join(project, "prototype", file)), sha, "Bounded scenery source changed after QA: " + file);
const cases = receipts[0].results, matrix = cases.filter(c => !c.fullMetropolis);
assert.equal(matrix.length, 50); assert.equal(cases.filter(c => c.fullMetropolis).length, 2);
assert.equal(new Set(matrix.map(c => c.layout + "@" + c.profile.join("x"))).size, 25);
const screenshots = fs.readdirSync(directory).filter(name => /^(v17-(wall(?:1|50)|metropolis50)|oct11-max-).+\.png$/.test(name));
const failureFiles = fs.readdirSync(directory).filter(name => /^(v17-wall-.+|v16-acceptance)-failed-\d+\.json$/.test(name));
const counts = { finalBrowserGroups: 32, layoutProfileCombinations: 25, woodenAndMasonryMatrixPoses: 50, fullMetropolisCaptures: 2,
  acceptanceFullPlotAlphaExclusions: cases.reduce((n, c) => n + c.evidence.footprints.length, 0), maximumZoomInspectedPlots: 46,
  boundedSceneryRegressionGroups: 1, acceptedBrowserErrors: 0 };
const nativeCentreDrifts = receipts[2].results.flatMap(c => c.panned.footprints.map(p => {
  const f = c.fit.footprints.find(f => f.id === p.id); return Math.max(Math.abs(p.x + p.width / 2 - f.x - f.width / 2), Math.abs(p.y + p.height / 2 - f.y - f.height / 2));
}));
counts.maximumMeasuredNativeCentreDrift = Math.max(...nativeCentreDrifts);
const output = { version: 17, createdAt: new Date().toISOString(), authority: "DEC-064", status: "passed bounded technical QA; not aesthetic acceptance or device certification",
  aestheticApprovalClaimed: false, sourceHashes: receipts[0].sourceHashes, counts,
  suites: names.map((name, i) => ({ scope: name, groups: expected[i], receipt: `v17-wall-${name}-receipt.json`, sha256: hash(path.join(directory, `v17-wall-${name}-receipt.json`)), uninterruptedFrozenSource: true, browserErrors: 0 })),
  boundedSceneryRegression: { status: "passed", groups: 1, scope: "Staggered1440×900 Hall50 roads/full23 footprints, source-native decorated crops and hide/show actual paint; Hall1 bare", receipt: "v16-acceptance-receipt.json", sha256: hash(path.join(directory, "v16-acceptance-receipt.json")), browserErrors: 0 },
  coverage: ["All five layouts at1440×900,1024×600,390×844,844×390,2560×900 show a fully visible wooden1/strong50 enclosing wall, above desktop footer.",
    "Actual SVG group is rasterized over expanded full curtain/tower/stroke/shadow bounds; all23 actual complete CTM-derived plot rectangles are alpha-clear and every corner enclosed.",
    "Actual screen hide/show differences prove wall paint; all23 fully exposed44px Fit selection cores remain accessible.",
    "Hall50 never creates/strengthens an absent/Wall1 perimeter; unfinished build has no finished wall, unfinished Update keeps completed strength.",
    "Paid Skip, Ideal1/50, Gameplay restoration, reset and reload preserve unaffected exact v3/legacy bytes and original paid receipt/deadlines.",
    "At maximum2.4 all23 native material/hit checks pass in desktop and phone; contour/centres remain fixed and full actual zoom footprints stay inside conservative Fit envelopes."],
  preFreeze: { failureFiles, qualification: "These are diagnostic failures, not accepted final-source results.", explanations: [
    "Initial geometry revealed cropped phone sidewalls and footer-covered desktop wall; root added full max-strength Fit framing without reducing44px targets.",
    "An initial queued test seed incorrectly retained capped100000 resources plus its refundable receipt; fixture now deducts paid cost, no runtime validation weakened.",
    "An exact wrapper-size zoom oracle incorrectly ignored existing44px minimum envelopes; replaced with fixed native centre and containment inside unchanged full Fit reserve.",
    "An initial raster export assumed native image clipping, but actual wall is an unclipped SVG group; expanded raster now includes complete component bounds and gutter with strict actual alpha/viewport checks.",
    "The first bounded scenery regression found a cypress tip covered by the wall. Final max-strength wall corridors protect complete ornamental footprints; the same unweakened source-palette/hide-show regression now passes."] },
  browserTeardown: { allOwnedContextsClosed: true, allOwnedBrowsersClosed: true, userBrowserOrFounderStorageAccessed: false },
  notRerun: ["Historical full construction/cancellation suites", "Historical330 artwork crops/3000 catalogue level selections", "Full Atlas/v16 visual suites; atlas.js and atlas.css are unchanged by the wall task"],
  reviewedCaptures: ["v17-wall1-staggered-1440x900.png", "v17-metropolis50-staggered-1440x900.png", "v17-metropolis50-staggered-390x844.png", "v17-wall50-circle-390x844.png"],
  evidence: screenshots.map(file => ({ file, sha256: hash(path.join(directory, file)) })) };
const target = path.join(directory, "v17-final-qa-receipt.json"); fs.writeFileSync(target, JSON.stringify(output, null, 2));
console.log(JSON.stringify({ receipt: target, sha256: hash(target), counts, screenshots: screenshots.length, failedDiagnosticsRetained: failureFiles.length }));
