import { z } from "zod";
import {
  identifierSchema,
  isoDateSchema,
  mediaReferenceSchema,
  migrationMetadataSchema,
  slugSchema,
  videoReferenceSchema,
  yearSchema,
} from "./shared";
import { entityReviewStatusSchema, entityTypeSchema } from "./vocabularies";

export const entitySchema = z
  .object({
    id: identifierSchema,
    slug: slugSchema,
    name: z.string().min(1),
    aliases: z.array(z.string().min(1)).optional(),
    entityType: entityTypeSchema,
    summary: z.string().min(20),
    description: z.string().min(20).optional(),
    activeStart: yearSchema.optional(),
    activeEnd: yearSchema.optional(),
    dateDisplay: z.string().min(1).optional(),
    regions: z.array(z.string().min(1)),
    places: z.array(identifierSchema).optional(),
    styles: z.array(z.string().min(1)),
    roles: z.array(z.string().min(1)).optional(),
    instruments: z.array(z.string().min(1)).optional(),
    sourceIds: z.array(identifierSchema),
    image: mediaReferenceSchema.optional(),
    featuredVideo: videoReferenceSchema.optional(),
    reviewStatus: entityReviewStatusSchema,
    lastReviewed: isoDateSchema.optional(),
    migration: migrationMetadataSchema.optional(),
  })
  .strict()
  .superRefine((entity, context) => {
    if (
      entity.activeStart !== undefined &&
      entity.activeEnd !== undefined &&
      entity.activeStart > entity.activeEnd
    ) {
      context.addIssue({
        code: "custom",
        path: ["activeEnd"],
        message: "activeEnd must not precede activeStart",
      });
    }
  });

export type Entity = z.infer<typeof entitySchema>;
