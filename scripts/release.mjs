import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const releaseDir = path.join(repoRoot, "dist", "release");
const requiredAssets = ["main.js", "manifest.json", "styles.css"];

async function ensureAssetExists(asset) {
  const assetPath = path.join(repoRoot, asset);
  try {
    await fs.access(assetPath);
  } catch {
    throw new Error(`Missing required release asset: ${asset}`);
  }
}

async function copyAsset(asset) {
  const src = path.join(repoRoot, asset);
  const dest = path.join(releaseDir, asset);
  await fs.copyFile(src, dest);
}

async function main() {
  for (const asset of requiredAssets) {
    await ensureAssetExists(asset);
  }

  await fs.rm(releaseDir, { recursive: true, force: true });
  await fs.mkdir(releaseDir, { recursive: true });

  for (const asset of requiredAssets) {
    await copyAsset(asset);
  }

  const relativeOut = path.relative(repoRoot, releaseDir) || ".";
  console.log(`Release assets ready in ${relativeOut}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
