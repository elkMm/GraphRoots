import { z } from "zod";
import { isoDateSchema } from "./shared";

export const corpusMetadataSchema = z
  .object({
    name: z.literal("GraphRoots Blues corpus"),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    lastUpdated: isoDateSchema,
    license: z
      .object({
        id: z.string().min(1),
        name: z.string().min(1),
      })
      .strict(),
    methodologyPath: z.string().startsWith("/"),
  })
  .strict();

export type CorpusMetadata = z.infer<typeof corpusMetadataSchema>;
