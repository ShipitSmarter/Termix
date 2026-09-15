#!/usr/bin/env node
const { spawnSync } = require("node:child_process");
const { resolve } = require("node:path");

const storageFlag = "--no-experimental-webstorage";
const nodeOptions = process.env.NODE_OPTIONS ?? "";
const env = {
  ...process.env,
  NODE_OPTIONS: nodeOptions.includes(storageFlag)
    ? nodeOptions
    : `${nodeOptions} ${storageFlag}`.trim(),
};

const result = spawnSync(
  process.execPath,
  [resolve("node_modules/vitest/vitest.mjs"), ...process.argv.slice(2)],
  { stdio: "inherit", env },
);

if (result.error) {
  console.error(result.error);
  process.exit(1);
}
process.exit(result.status ?? 1);
