import { z } from "zod";
import { identifierSchema, isoDateSchema, yearSchema } from "./shared";
import { sourceTypeSchema } from "./vocabularies";

export const sourceSchema = z
  .object({
    id: identifierSchema,
    sourceType: sourceTypeSchema,
    title: z.string().min(1),
    authors: z.array(z.string().min(1)).optional(),
    publisher: z.string().min(1).optional(),
    year: yearSchema.optional(),
    url: z.url().optional(),
    accessDate: isoDateSchema.optional(),
    locator: z.string().min(1).optional(),
    note: z.string().min(1).optional(),
  })
  .strict();

export type Source = z.infer<typeof sourceSchema>;
