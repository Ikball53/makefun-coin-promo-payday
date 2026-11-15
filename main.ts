// Payday Cheque ($PAYDAY) entrypoint for makefun-coin-promo-01.
// The coin itself is the entry; this program only hands its launch record
// to the grader by copying LAUNCH.json into the output directory.
import { copyFile, mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const repoRoot = process.env.MAKEFUN_BOT_DIR ?? ".";
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const sourcePath = join(repoRoot, "LAUNCH.json");

const raw = await readFile(sourcePath, "utf8");
const record = JSON.parse(raw);
if (typeof record !== "object" || record === null || Array.isArray(record)) {
  throw new Error("LAUNCH.json must be a JSON object");
}
for (const field of ["mint", "create_signature"]) {
  if (typeof record[field] !== "string" || record[field].length === 0) {
    throw new Error(`LAUNCH.json is missing a non-empty ${field}`);
  }
}
const BASE58 = /^[1-9A-HJ-NP-Za-km-z]+$/;
if (!BASE58.test(record.mint) || record.mint.length < 32 || record.mint.length > 44) {
  throw new Error("LAUNCH.json mint is not a base58 Solana address");
}
if (
  !BASE58.test(record.create_signature) ||
  record.create_signature.length < 64 ||
  record.create_signature.length > 88
) {
  throw new Error("LAUNCH.json create_signature is not a base58 transaction signature");
}

await mkdir(outDir, { recursive: true });
await copyFile(sourcePath, join(outDir, "LAUNCH.json"));
console.log(`copied LAUNCH.json (mint ${record.mint}) to ${outDir}`);
