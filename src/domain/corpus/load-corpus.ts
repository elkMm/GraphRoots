import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { ZodType } from "zod";
import {
  corpusMetadataSchema,
  entitySchema,
  relationshipSchema,
  sourceSchema,
} from "../schemas";
import type { CorpusMetadata, Entity, Relationship, Source } from "../types";

export interface Corpus {
  metadata: CorpusMetadata;
  entities: Entity[];
  relationships: Relationship[];
  sources: Source[];
}

async function readJson<T>(filePath: string, schema: ZodType<T>): Promise<T> {
  let value: unknown;

  try {
    value = JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Unable to read JSON at ${filePath}`, { cause: error });
  }

  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw new Error(
      `Invalid corpus record at ${filePath}\n${parsed.error.message}`,
    );
  }

  return parsed.data;
}

async function readDirectory<T>(
  directory: string,
  schema: ZodType<T>,
): Promise<T[]> {
  const files = (await readdir(directory))
    .filter((file) => file.endsWith(".json"))
    .sort();
  return Promise.all(
    files.map((file) => readJson(path.join(directory, file), schema)),
  );
}

export async function loadCorpus(root = process.cwd()): Promise<Corpus> {
  const dataDirectory = path.join(root, "src/data");

  const [metadata, entities, relationships, sources] = await Promise.all([
    readJson(path.join(dataDirectory, "corpus.json"), corpusMetadataSchema),
    readDirectory(path.join(dataDirectory, "entities"), entitySchema),
    readDirectory(
      path.join(dataDirectory, "relationships"),
      relationshipSchema,
    ),
    readDirectory(path.join(dataDirectory, "sources"), sourceSchema),
  ]);

  return { metadata, entities, relationships, sources };
}
