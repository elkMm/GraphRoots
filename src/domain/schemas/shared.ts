import { z } from "zod";

export const identifierSchema = z
  .string()
  .min(3)
  .regex(/^[a-z0-9][a-z0-9:-]*$/, "Use lowercase stable identifiers");

export const slugSchema = z
  .string()
  .min(2)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*(?:--[a-z0-9]+(?:-[a-z0-9]+)*)*$/,
    "Use URL-safe slugs",
  );

export const yearSchema = z.number().int().min(100).max(2100);

export const isoDateSchema = z.iso.date();

export const mediaReferenceSchema = z
  .object({
    src: z.string().min(1),
    alt: z.string().min(1),
    credit: z.string().min(1),
    rightsHolder: z.string().min(1),
    license: z.string().min(1),
    sourceUrl: z.url().optional(),
  })
  .strict();

export const videoReferenceSchema = z
  .object({
    platform: z.literal("youtube"),
    videoId: z.string().regex(/^[A-Za-z0-9_-]{11}$/),
    title: z.string().min(1),
    sourceUrl: z.url(),
    lastChecked: isoDateSchema,
  })
  .strict();

export const migrationMetadataSchema = z
  .object({
    sourceFile: z.literal("reference/blues-graph.html"),
    sourceChecksum: z.string().regex(/^[a-f0-9]{64}$/),
    originalId: z.string().min(1).optional(),
    originalEra: z.string().min(1).optional(),
    originalRelationshipType: z.literal("generic_influence").optional(),
    originalNote: z.string().min(1).optional(),
  })
  .strict();
