#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const path = require("node:path");

const argv = process.argv.slice(2);

const hasCoverageArg = argv.some((arg) => arg === "--coverage" || arg.startsWith("--coverage="));
const hasShardArg = argv.some((arg, index) => {
  if (arg.startsWith("--shard=")) {
    return true;
  }
  return arg === "--shard" && index < argv.length - 1;
});

let shard = process.env.VITEST_SHARD;
if (!shard && process.env.VITEST_SHARD_INDEX && process.env.VITEST_SHARD_TOTAL) {
  shard = `${process.env.VITEST_SHARD_INDEX}/${process.env.VITEST_SHARD_TOTAL}`;
}

if (shard) {
  const match = shard.match(/^(\d+)\/(\d+)$/);
  if (!match) {
    console.error(
      `[vitest-shard] Invalid shard value "${shard}". Expected format "<index>/<total>", e.g. "1/4".`
    );
    process.exit(1);
  }

  const index = Number(match[1]);
  const total = Number(match[2]);
  if (!Number.isInteger(index) || !Number.isInteger(total) || index < 1 || total < 1 || index > total) {
    console.error(
      `[vitest-shard] Invalid shard value "${shard}". Index and total must be positive integers with index <= total.`
    );
    process.exit(1);
  }
}

const vitestArgs = ["run", "--reporter=dot"];
if (!hasCoverageArg) {
  vitestArgs.push("--no-coverage");
}
if (shard && !hasShardArg) {
  vitestArgs.push("--shard", shard);
}
vitestArgs.push(...argv);

const vitestPackagePath = require.resolve("vitest/package.json");
const vitestCli = path.join(path.dirname(vitestPackagePath), "vitest.mjs");
const result = spawnSync(process.execPath, [vitestCli, ...vitestArgs], {
  stdio: "inherit",
  env: process.env,
});

if (result.error) {
  console.error(`[vitest-shard] Failed to execute Vitest: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
