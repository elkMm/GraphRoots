import { mkdir, writeFile } from "node:fs/promises";
import { getBuildTimestamp } from "../src/domain/build-time";
import { loadCorpus } from "../src/domain/corpus/load-corpus";
import { getPublicCorpus } from "../src/domain/corpus/public-records";
import { validateCorpus } from "../src/domain/corpus/validate-corpus";

function csvCell(value: unknown): string {
  const text = Array.isArray(value)
    ? value.join("; ")
    : value !== null && typeof value === "object"
      ? JSON.stringify(value)
      : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function toCsv(records: Array<Record<string, unknown>>): string {
  if (records.length === 0) return "";
  const columns = Object.keys(records[0] ?? {});
  return [
    columns.map(csvCell).join(","),
    ...records.map((record) =>
      columns.map((column) => csvCell(record[column])).join(","),
    ),
  ].join("\n");
}

const corpus = await loadCorpus();
const generatedAt = getBuildTimestamp();
const report = validateCorpus(corpus, generatedAt);
if (!report.valid) throw new Error("Cannot export an invalid corpus");

const publicCorpus = getPublicCorpus(corpus);
const exportMetadata = {
  corpusVersion: publicCorpus.metadata.version,
  generatedAt,
  license: publicCorpus.metadata.license,
  methodologyUrl: publicCorpus.metadata.methodologyPath,
};

const entities = publicCorpus.entities.map((record) => {
  const entity = { ...record };
  delete entity.migration;
  return entity;
});
const relationships = publicCorpus.relationships.map((record) => {
  const relationship = { ...record };
  delete relationship.curatorNote;
  delete relationship.migration;
  return relationship;
});
const referencedSourceIds = new Set([
  ...entities.flatMap((entity) => entity.sourceIds),
  ...relationships.flatMap((relationship) => relationship.citationIds),
]);
const sources = publicCorpus.sources.filter((source) =>
  referencedSourceIds.has(source.id),
);

const commonCsvFields = {
  corpus_version: publicCorpus.metadata.version,
  generated_at: generatedAt,
  license: `${publicCorpus.metadata.license.id}: ${publicCorpus.metadata.license.name}`,
  methodology_url: publicCorpus.metadata.methodologyPath,
};
const entityCsv = entities.map((entity) => ({ ...commonCsvFields, ...entity }));
const relationshipCsv = relationships.map((relationship) => ({
  ...commonCsvFields,
  ...relationship,
}));

const directory = "public/data/generated";
await mkdir(directory, { recursive: true });
await Promise.all([
  writeFile(
    `${directory}/graphroots-blues-entities.json`,
    `${JSON.stringify({ metadata: exportMetadata, records: entities }, null, 2)}\n`,
  ),
  writeFile(
    `${directory}/graphroots-blues-relationships.json`,
    `${JSON.stringify({ metadata: exportMetadata, records: relationships }, null, 2)}\n`,
  ),
  writeFile(
    `${directory}/graphroots-blues-sources.json`,
    `${JSON.stringify({ metadata: exportMetadata, records: sources }, null, 2)}\n`,
  ),
  writeFile(
    `${directory}/graphroots-blues-entities.csv`,
    `${toCsv(entityCsv)}\n`,
  ),
  writeFile(
    `${directory}/graphroots-blues-relationships.csv`,
    `${toCsv(relationshipCsv)}\n`,
  ),
  writeFile(
    `${directory}/graphroots-blues-schema.json`,
    `${JSON.stringify(
      {
        metadata: exportMetadata,
        descriptions: {
          entity:
            "A person, ensemble, tradition, or other stable object in the corpus.",
          relationship:
            "A typed connection with neutral endpoints, explicit orientation, evidence category, editorial review status, and dispute status.",
          source:
            "A bibliographic or archival reference cited by a public record.",
          relationshipReviewStatus:
            "Only reviewed relationships are public; draft, provisional, and withdrawn records are excluded.",
        },
      },
      null,
      2,
    )}\n`,
  ),
]);

console.log(
  `Exported ${entities.length} entities, ${relationships.length} relationships, and ${sources.length} sources.`,
);
