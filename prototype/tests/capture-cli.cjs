"use strict";

// Exercise the real CLI in child processes. Fixtures and output stay in memory.
// Guard dependency loading and server creation even if preflight regresses.
const assert = require("node:assert/strict");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const capture = path.resolve(__dirname, "../tools/capture-game.cjs");
const dependencyGuard = "__azmara_capture_preflight_dependency_guard__";
const guardMarker = "CAPTURE_PREFLIGHT_GUARD_REACHED";
const bootstrap = `
  const Module = require("node:module");
  const http = require("node:http");
  const stop = () => {
    process.stderr.write(${JSON.stringify(guardMarker)});
    process.exit(97);
  };
  const originalLoad = Module._load;
  Module._load = function (request, parent, isMain) {
    if (request === ${JSON.stringify(dependencyGuard)} || request === "playwright") stop();
    return originalLoad.apply(this, arguments);
  };
  http.createServer = stop;
  process.argv = [process.execPath, ...process.argv.slice(1)];
  require(process.argv[1]);
`;

const cases = [
  { name: "help", args: ["--help"], status: 0, message: "Usage:", stream: "stdout" },
  { name: "unknown option", args: ["--unknown", "1"], status: 2, message: "Usage:" },
  { name: "positional argument", args: ["town"], status: 2, message: "Usage:" },
  { name: "equals syntax", args: ["--width=800"], status: 2, message: "Usage:" },
  ...["width", "height", "level", "land-stage", "layout", "view"].map(option => ({
    name: `missing ${option}`, args: [`--${option}`], status: 2, message: "Usage:",
  })),
  ...["319", "3841", "640.5", "wide"].map(value => ({
    name: `invalid width ${value}`, args: ["--width", value], status: 1, message: "Width must be 320..3840",
  })),
  ...["319", "2161", "480.5", "tall"].map(value => ({
    name: `invalid height ${value}`, args: ["--height", value], status: 1, message: "Height must be 320..2160",
  })),
  ...["0", "51", "2.5", "high"].map(value => ({
    name: `invalid level ${value}`, args: ["--level", value], status: 1, message: "Level must be 1..50",
  })),
  ...["0", "2", "51", "5.5", "high"].map(value => ({
    name: `invalid land stage ${value}`, args: ["--land-stage", value], status: 1,
    message: "Land stage must be a locked Town Hall milestone",
  })),
  {
    name: "conflicting fixture selectors", args: ["--level", "1", "--land-stage", "5"], status: 1,
    message: "Choose --level or --land-stage, not both",
  },
  { name: "unknown layout", args: ["--layout", "unknown"], status: 1, message: "Unknown plot layout" },
  { name: "unknown view", args: ["--view", "unknown"], status: 1, message: "Unknown view" },
  ...["region", "world"].map(view => ({
    name: `debug outside town: ${view}`, args: ["--debug", "--view", view], status: 1,
    message: "The current debug grid is Town-only",
  })),
];

for (const scenario of cases) {
  const result = spawnSync(process.execPath, ["-e", bootstrap, capture, ...scenario.args], {
    encoding: "utf8",
    env: { ...process.env, AZMARA_PLAYWRIGHT: dependencyGuard },
    timeout: 5000,
    maxBuffer: 256 * 1024,
  });
  assert.ifError(result.error);
  assert.equal(result.signal, null, `${scenario.name}: child must finish normally`);
  assert(!result.stderr.includes(guardMarker), `${scenario.name}: reached browser/server initialization`);
  assert.equal(result.status, scenario.status, `${scenario.name}: ${result.stderr}`);
  assert((result[scenario.stream || "stderr"]).includes(scenario.message), `${scenario.name}: missing diagnostic`);
  assert.equal(result[scenario.stream === "stdout" ? "stderr" : "stdout"], "", `${scenario.name}: unexpected output stream`);
}

console.log(`Capture CLI preflight: ${cases.length} cases passed; no browser, server or disk fixtures.`);
