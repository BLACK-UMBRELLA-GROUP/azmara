"use strict";

// Step 2: owned loopback server + disposable browser + inspected PNG.
// No persistent profile, remote URL, game-code change or package installation.
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const http = require("node:http");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const root = fs.realpathSync(path.resolve(__dirname, ".."));
const layouts = ["staggered", "grid", "circle", "avenues", "garden-quarters"];
const landMilestones = [1, 5, 8, 12, 17, 22, 28, 34, 41, 45, 50];
const options = { width: 1440, height: 900, level: null, landStage: null, layout: "staggered", view: "town", debug: false };
const args = process.argv.slice(2);
const help = `Usage: ./prototype/tools/capture-game.sh [--level 1..50] [--layout ${layouts.join("|")}]
       [--land-stage ${landMilestones.join("|")}]
       [--width 1440] [--height 900] [--view town|region|world] [--debug]
Default: a fresh starting town, not your saved town.
--level: all 23 sites occupied at that level in disposable test storage.
--land-stage: only the Town Hall is built, at a locked land milestone.
--debug: local Town planning grid, toggled on with G for this capture.
Writes a unique PNG and JSON receipt under prototype/debug/, then closes.
Existing Node/Playwright can be selected with AZMARA_NODE/AZMARA_PLAYWRIGHT.`;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--help") { console.log(help); process.exit(0); }
  if (args[i] === "--debug") { options.debug = true; continue; }
  const rawKey = args[i].replace(/^--/, "");
  const key = rawKey === "land-stage" ? "landStage" : rawKey;
  if (!args[i].startsWith("--") || !Object.hasOwn(options, key) || args[i + 1] == null) {
    console.error(help); process.exit(2);
  }
  options[key] = ["width", "height", "level", "landStage"].includes(key) ? Number(args[++i]) : args[++i];
}
assert(Number.isInteger(options.width) && options.width >= 320 && options.width <= 3840, "Width must be 320..3840");
assert(Number.isInteger(options.height) && options.height >= 320 && options.height <= 2160, "Height must be 320..2160");
assert(options.level === null || Number.isInteger(options.level) && options.level >= 1 && options.level <= 50, "Level must be 1..50");
assert(options.landStage === null || landMilestones.includes(options.landStage), "Land stage must be a locked Town Hall milestone");
assert(options.level === null || options.landStage === null, "Choose --level or --land-stage, not both");
assert(layouts.includes(options.layout), "Unknown plot layout");
assert(["town", "region", "world"].includes(options.view), "Unknown view");
assert(!options.debug || options.view === "town", "The current debug grid is Town-only");

function loadPlaywright() {
  if (process.env.AZMARA_PLAYWRIGHT) return require(process.env.AZMARA_PLAYWRIGHT);
  try { return require("playwright"); }
  catch (error) {
    if (error.code !== "MODULE_NOT_FOUND") throw error;
    const bundled = path.join(os.homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
    if (!fs.existsSync(bundled)) throw new Error("Existing Playwright unavailable. Set AZMARA_PLAYWRIGHT to an installed module. Nothing was installed.");
    return require(bundled);
  }
}
const { chromium } = loadPlaywright();
const mimes = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json", ".ico": "image/x-icon" };
const server = http.createServer((req, res) => {
  try {
    if (!["GET", "HEAD"].includes(req.method)) { res.writeHead(405).end(); return; }
    const url = new URL(req.url, "http://127.0.0.1");
    const file = path.resolve(root, "." + decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname));
    // Serve only prototype assets, not tests/tools/debug or project documents.
    const relative = path.relative(root, file);
    if (relative.startsWith("..") || path.isAbsolute(relative) || !/^(assets\/|[^/]+\.(html|js|css|ico)$)/.test(relative)) {
      res.writeHead(403).end(); return;
    }
    const actual = fs.realpathSync(file);
    if (!actual.startsWith(root + path.sep) || !fs.statSync(actual).isFile()) { res.writeHead(403).end(); return; }
    res.writeHead(200, { "Content-Type": mimes[path.extname(actual)] || "application/octet-stream", "Cache-Control": "no-store" });
    if (req.method === "HEAD") res.end();
    else {
      const stream = fs.createReadStream(actual);
      stream.on("error", error => res.destroy(error));
      stream.pipe(res);
    }
  } catch (error) { res.writeHead(error.code === "ENOENT" ? 404 : 400).end(); }
});
const sourceHashes = () => Object.fromEntries(fs.readdirSync(root).filter(name => /\.(html|js|css)$/.test(name)).sort()
  .map(name => [name, crypto.createHash("sha256").update(fs.readFileSync(path.join(root, name))).digest("hex")]));
let browser, context, page, cleanupTask;
function cleanup() {
  if (!cleanupTask) cleanupTask = (async () => {
    try { if (context) await context.close(); }
    finally {
      try { if (browser) await browser.close(); }
      finally {
        if (server.listening) await new Promise(resolve => { server.close(resolve); server.closeAllConnections?.(); });
      }
    }
  })();
  return cleanupTask;
}
for (const [signal, code] of [["SIGINT", 130], ["SIGTERM", 143]]) process.once(signal, () => {
  cleanup().finally(() => process.exit(code));
});

async function ready() {
  await page.waitForFunction(() => document.querySelector("#town-map")?.dataset.presentation &&
    document.querySelectorAll("#town-core .plot-marker").length === 23 &&
    document.querySelector("#town-map").dataset.cameraAnimating !== "true");
  await page.waitForLoadState("networkidle");
  return page.evaluate(async () => {
    const decode = async () => {
      await document.fonts.ready;
      const visible = node => node.getClientRects().length && getComputedStyle(node).display !== "none";
      const urls = new Set();
      for (const node of document.querySelectorAll("img, svg image")) {
        if (!visible(node)) continue;
        const url = node.currentSrc || node.src || node.getAttribute("href") || node.getAttribute("xlink:href");
        if (url) urls.add(url);
      }
      for (const node of document.querySelectorAll("*")) {
        if (!visible(node)) continue;
        for (const match of getComputedStyle(node).backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g)) urls.add(match[1]);
      }
      await Promise.all([...urls].map(async url => {
        const image = new Image(); image.src = url; await image.decode();
        if (!image.naturalWidth) throw new Error("Unpainted image: " + url.slice(0, 200));
      }));
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return { decodedImages: urls.size, presentation: document.querySelector("#town-map").dataset.presentation,
        plots: document.querySelectorAll("#town-core .plot-marker").length };
    };
    let timer;
    try { return await Promise.race([decode(), new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("Image readiness exceeded 20 seconds")), 20000); })]); }
    finally { clearTimeout(timer); }
  });
}

(async () => {
  const startedAt = new Date().toISOString(), initialSources = sourceHashes(), errors = [];
  const debug = path.join(root, "debug");
  fs.mkdirSync(debug, { recursive: true });
  const scenarioId = options.landStage !== null ? `land-stage-${options.landStage}` : options.level === null ? "start" : "all-built-" + options.level;
  const stem = `${startedAt.replace(/[:.]/g, "-")}-${options.view}-${scenarioId}-${options.layout}-${options.width}x${options.height}${options.debug ? "-debug-on" : ""}-${crypto.randomUUID().slice(0, 8)}`;
  const screenshot = path.join(debug, stem + ".png"), receipt = path.join(debug, stem + ".json");
  const report = { startedAt, options, screenshot, receipt, sourceHashes: initialSources,
    scenario: options.landStage !== null ? "Synthetic Town Hall-only locked land-stage check; not player progress" : options.level === null ? "Fresh isolated starting town" : "Synthetic all-built town; not player progress",
    browserClosed: false, serverClosed: false, passed: false };
  try {
    await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
    const base = `http://127.0.0.1:${server.address().port}`;
    report.url = base;
    browser = await chromium.launch({ headless: true, timeout: 20000 });
    context = await browser.newContext({ viewport: { width: options.width, height: options.height }, reducedMotion: "reduce", deviceScaleFactor: 1 });
    page = await context.newPage(); page.setDefaultTimeout(20000); page.setDefaultNavigationTimeout(20000);
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text().slice(0, 500)); });
    page.on("requestfailed", request => errors.push(request.url().slice(0, 200) + ": " + request.failure()?.errorText));
    page.on("response", response => { if (response.status() >= 400) errors.push(response.status() + " " + response.url()); });
    // Do not permit external requests or use hosted credentials/browser storage.
    await context.route("**/*", route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
    assert.equal((await page.goto(base + (options.debug ? "/?debug=1" : "/")))?.status(), 200);
    await ready();
    if (options.level !== null || options.landStage !== null || options.layout !== "staggered") {
      // Catalogue defines compatible roles; synthetic data exists only in this
      // disposable context, not the Founder's Chrome/localhost/hosted save.
      report.fixture = await page.evaluate(({ level, landStage, layout }) => {
        const seed = { version: 3, layoutId: "town-23-v1", townName: "Visual test", hallLevel: landStage || level || 1,
          plotLayout: layout, resources: { coins: 2400, timber: 760, stone: 540 }, construction: null };
        if (level !== null) {
          const ordinary = window.AzmaraCatalogue.entries.filter(entry => entry.role === "general" && entry.id !== "town-hall");
          if (ordinary.length < 18) throw new Error("Catalogue cannot populate 18 ordinary test sites");
          seed.buildings = Object.fromEntries(ordinary.slice(0, 18).map((entry, i) => [`general-${String(i + 2).padStart(2, "0")}`, { typeId: entry.id, level }]));
          for (const [id, typeId] of [["wall-01", "town-wall"], ["harbour-01", "trading-port"], ["harbour-02", "trading-port"], ["freighter-01", "dockyard"]]) seed.buildings[id] = { typeId, level };
        }
        localStorage.setItem("azmara-town-layout-v3", JSON.stringify(seed));
        return seed;
      }, options);
      await page.reload(); await ready();
      if (options.level !== null) assert.equal(await page.locator('#town-core .plot-marker[data-occupied="true"]').count(), 23);
      if (options.landStage !== null) {
        assert.equal(await page.locator('#town-core .plot-marker[data-occupied="true"]').count(), 1);
        const expectedStage = landMilestones.indexOf(options.landStage) + 1;
        assert.equal(await page.locator("#azmara-land-stage").getAttribute("href"), `assets/land/land-stage-${String(expectedStage).padStart(2, "0")}.png`);
      }
    }
    if (options.view !== "town") {
      const navigation = options.view === "region" ? "island" : "world";
      if (!await page.locator(`[data-map-navigation="${navigation}"]:visible`).count()) await page.locator("#toggle-actions").click();
      await page.locator(`[data-map-navigation="${navigation}"]:visible`).first().click();
    }
    await page.mouse.move(0, 0);
    report.readiness = await ready();
    if (options.debug) {
      await page.locator('#town-debug-grid[data-enabled="false"]').waitFor({ state: "attached" });
      await page.keyboard.press("g");
      await page.locator('#town-debug-grid[data-enabled="true"]').waitFor({ state: "visible" });
      assert.equal(await page.locator("#town-debug-grid").getAttribute("viewBox"), await page.locator("#world-landscape").getAttribute("viewBox"));
      report.debug = { cellSize: 100, collisionSource: "not-implemented", collisionShapes: 0 };
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    }
    assert.deepEqual(sourceHashes(), initialSources, "Runtime source changed during capture");
    assert.deepEqual(errors, [], "Browser/asset failures during capture");
    await page.screenshot({ path: screenshot, scale: "css", timeout: 20000 });
    report.screenshotSha256 = crypto.createHash("sha256").update(fs.readFileSync(screenshot)).digest("hex");
    report.passed = true;
  } catch (error) {
    report.failure = error.stack || String(error);
    if (page && !page.isClosed()) {
      report.failureScreenshot = path.join(debug, stem + "-FAILED.png");
      await page.screenshot({ path: report.failureScreenshot, scale: "css", timeout: 5000 }).catch(() => {});
    }
    process.exitCode = 1;
  } finally {
    try { await cleanup(); report.browserClosed = !browser || !browser.isConnected(); report.serverClosed = !server.listening; }
    catch (error) { report.cleanupFailure = String(error); report.passed = false; process.exitCode = 1; }
    report.errors = errors; report.finishedAt = new Date().toISOString();
    fs.writeFileSync(receipt, JSON.stringify(report, null, 2) + "\n", { flag: "wx" });
  }
  console.log(JSON.stringify({ passed: report.passed, screenshot: report.passed ? screenshot : report.failureScreenshot,
    receipt, browserClosed: report.browserClosed, serverClosed: report.serverClosed }, null, 2));
  if (report.failure) console.error(report.failure);
})().catch(async error => { console.error(error); process.exitCode = 1; await cleanup(); });
