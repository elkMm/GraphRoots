import { mkdir, writeFile } from "node:fs/promises";
import { getBuildTimestamp } from "../src/domain/build-time";
import { loadCorpus } from "../src/domain/corpus/load-corpus";
import { validateCorpus } from "../src/domain/corpus/validate-corpus";
import { buildGraphPayload } from "../src/domain/graph/build-payload";

const corpus = await loadCorpus();
const generatedAt = getBuildTimestamp();
const report = validateCorpus(corpus, generatedAt);
if (!report.valid)
  throw new Error("Cannot build graph payload from an invalid corpus");

const payload = buildGraphPayload(corpus, generatedAt);
await mkdir("public/data/generated", { recursive: true });
await writeFile(
  "public/data/generated/graphroots-blues-graph.json",
  `${JSON.stringify(payload, null, 2)}\n`,
  "utf8",
);

console.log(
  `Built graph payload with ${payload.nodes.length} nodes and ${payload.edges.length} edges.`,
);
