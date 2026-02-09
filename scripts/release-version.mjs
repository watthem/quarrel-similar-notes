import { spawnSync } from "node:child_process";

const allowed = new Set(["patch", "minor", "major", "prepatch", "preminor", "premajor", "prerelease"]);
const rawArg = process.argv[2];
const bump = rawArg && allowed.has(rawArg) ? rawArg : "patch";

const versionResult = spawnSync("npm", ["version", bump], { stdio: "inherit" });
if (versionResult.status !== 0) {
  process.exit(versionResult.status ?? 1);
}

const releaseResult = spawnSync("npm", ["run", "release"], { stdio: "inherit" });
if (releaseResult.status !== 0) {
  process.exit(releaseResult.status ?? 1);
}
