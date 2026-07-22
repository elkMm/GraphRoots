// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* global process */
import { readFile } from "node:fs/promises";

const manifestPath = process.argv[2];
const start = Number(process.argv[3] ?? 0);
const end = Number(process.argv[4] ?? Number.POSITIVE_INFINITY);
const mode = process.argv[5] ?? "add";

if (!manifestPath) {
  throw new Error(
    "Usage: node scripts/emit-blues-expansion-patch.mjs <manifest> [start] [end]",
  );
}

const contextualSources = new Map([
  [
    "source:school-of-rock-history-blues",
    new Set([
      "Bessie Smith",
      "Big Joe Williams",
      "Bobby Bland",
      "Earl King",
      "Fred McDowell",
      "Josh White",
      "Mamie Smith",
      "Rory Gallagher",
    ]),
  ],
  [
    "source:carnegie-hall-rhythm-blues",
    new Set([
      "Amos Milburn",
      "Charles Brown",
      "Ike Turner",
      "Johnny Otis",
      "Louis Jordan",
      "Wynonie Harris",
    ]),
  ],
  [
    "source:blues-foundation-hall-of-fame",
    new Set([
      "Bob Margolin",
      "Kenny Neal",
      "Luther Allison",
      "Pee Wee Crayton",
      "Ronnie Baker Brooks",
      "Sista Monica Parker",
    ]),
  ],
]);

function joinWords(values) {
  if (values.length <= 1) return values[0] ?? "musician";
  return `${values.slice(0, -1).join(", ")} and ${values.at(-1)}`;
}

function summaryFor(entity) {
  const roles = entity.roles
    .slice(0, 3)
    .map((role) => role.toLowerCase().replace(/^blues\s+/, ""));
  return `${entity.name} ${entity.activeEnd ? "was" : "is"} a blues ${joinWords(roles)}.`;
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
const records = manifest.records.slice(start, end);
let patch = "*** Begin Patch\n";

for (const record of records) {
  if (mode === "reuse-discovery-source") {
    const hasContextualSource = [...contextualSources.values()].some((names) =>
      names.has(record.entity.name),
    );
    const comma = hasContextualSource ? "," : "";
    patch += `*** Update File: src/data/entities/${record.entity.slug}.json\n@@\n-    "source:wikipedia-list-blues-musicians"${comma}\n+    "source:wikipedia-list-blues-musicians-discovery"${comma}\n`;
    continue;
  }

  if (mode === "remove-active-dates") {
    if (
      record.entity.activeStart === undefined &&
      record.entity.activeEnd === undefined
    )
      continue;
    const lines = [
      "*** Update File: src/data/entities/" + record.entity.slug + ".json",
      "@@",
    ];
    if (record.entity.activeStart !== undefined) {
      lines.push(`-  "activeStart": ${record.entity.activeStart},`);
    }
    if (record.entity.activeEnd !== undefined) {
      lines.push(`-  "activeEnd": ${record.entity.activeEnd},`);
    }
    patch += `${lines.join("\n")}\n`;
    continue;
  }

  const profile = { ...record.entity };
  delete profile.activeStart;
  delete profile.activeEnd;
  const entity = {
    ...profile,
    summary: summaryFor(record.entity),
    sourceIds: [
      record.source.id,
      "source:wikipedia-list-blues-musicians-discovery",
    ],
  };

  for (const [sourceId, names] of contextualSources) {
    if (names.has(entity.name)) entity.sourceIds.push(sourceId);
  }

  patch += addFile(`src/data/entities/${entity.slug}.json`, entity);
  patch += addFile(
    `src/data/sources/source-encyclopedia-${entity.slug}.json`,
    record.source,
  );
}

patch += "*** End Patch\n";
process.stdout.write(patch);
