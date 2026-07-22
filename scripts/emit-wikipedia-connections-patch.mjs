// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* global process */
import { readFile } from "node:fs/promises";

const manifestPath = process.argv[2];
const recordType = process.argv[3];
const start = Number(process.argv[4] ?? 0);
const end = Number(process.argv[5] ?? Number.POSITIVE_INFINITY);

if (!manifestPath || !["sources", "relationships"].includes(recordType)) {
  throw new Error(
    "Usage: node scripts/emit-wikipedia-connections-patch.mjs <manifest> <sources|relationships> [start] [end]",
  );
}

function addFile(filePath, value) {
  const content = `${JSON.stringify(value, null, 2)}\n`;
  return `*** Add File: ${filePath}\n${content
    .split("\n")
    .slice(0, -1)
    .map((line) => `+${line}`)
    .join("\n")}\n`;
}

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const records = manifest[recordType].slice(start, end);
let patch = "*** Begin Patch\n";
for (const record of records) {
  const slug = record.id.replace(
    recordType === "sources" ? "source:wikipedia-biography-" : "relationship:",
    "",
  );
  const directory =
    recordType === "sources" ? "src/data/sources" : "src/data/relationships";
  patch += addFile(`${directory}/${slug}.json`, record);
}
patch += "*** End Patch\n";
process.stdout.write(patch);
