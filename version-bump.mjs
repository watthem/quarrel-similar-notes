import { promises as fs } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const packagePath = path.join(repoRoot, "package.json");
const manifestPath = path.join(repoRoot, "manifest.json");
const versionsPath = path.join(repoRoot, "versions.json");

function isSemver(value) {
  return /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(value);
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function writeJson(filePath, data) {
  const serialized = `${JSON.stringify(data, null, 2)}\n`;
  await fs.writeFile(filePath, serialized, "utf8");
}

async function main() {
  const pkg = await readJson(packagePath);
  if (!isSemver(pkg.version)) {
    throw new Error(`package.json version is not semver: ${pkg.version}`);
  }

  const manifest = await readJson(manifestPath);
  manifest.version = pkg.version;
  await writeJson(manifestPath, manifest);

  const versions = await readJson(versionsPath);
  versions[pkg.version] = manifest.minAppVersion;
  await writeJson(versionsPath, versions);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
