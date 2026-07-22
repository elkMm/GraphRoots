import { mkdir, writeFile } from "node:fs/promises";
import { loadCorpus } from "../src/domain/corpus/load-corpus";
import { validateCorpus } from "../src/domain/corpus/validate-corpus";
import { getBuildTimestamp } from "../src/domain/build-time";

const corpus = await loadCorpus();
const report = validateCorpus(corpus, getBuildTimestamp());

await mkdir("reports", { recursive: true });
await writeFile(
  "reports/corpus-validation.json",
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8",
);

console.log(
  [
    `Corpus ${report.corpusVersion}: ${report.valid ? "valid" : "invalid"}`,
    `${report.counts.entities} entities (${JSON.stringify(report.counts.entitiesByType)})`,
    `${report.counts.relationships} relationships; ${report.counts.publicRelationships} public`,
    `${report.citationCoverage.percentage}% public citation coverage`,
    `${report.unresolvedWarnings} unresolved warnings`,
  ].join("\n"),
);

if (!report.valid) process.exitCode = 1;
