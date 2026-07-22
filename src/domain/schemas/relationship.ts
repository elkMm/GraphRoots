import { z } from "zod";
import {
  identifierSchema,
  isoDateSchema,
  migrationMetadataSchema,
  slugSchema,
  yearSchema,
} from "./shared";
import {
  disputeStatusSchema,
  evidenceCategorySchema,
  relationshipOrientationSchema,
  relationshipReviewStatusSchema,
  relationshipTypeSchema,
} from "./vocabularies";

const symmetricRelationshipTypes = new Set([
  "performed_with",
  "recorded_with",
  "shared_scene",
  "historical_parallel",
]);

export const relationshipSchema = z
  .object({
    id: identifierSchema,
    slug: slugSchema,
    entityAId: identifierSchema,
    entityBId: identifierSchema,
    relationshipType: relationshipTypeSchema,
    orientation: relationshipOrientationSchema,
    evidenceCategory: evidenceCategorySchema,
    title: z.string().min(1).optional(),
    explanation: z.string().min(10),
    startYear: yearSchema.optional(),
    endYear: yearSchema.optional(),
    dateDisplay: z.string().min(1).optional(),
    citationIds: z.array(identifierSchema),
    reviewStatus: relationshipReviewStatusSchema,
    disputeStatus: disputeStatusSchema,
    curatorNote: z.string().min(1).optional(),
    lastReviewed: isoDateSchema.optional(),
    migration: migrationMetadataSchema.optional(),
  })
  .strict()
  .superRefine((relationship, context) => {
    if (
      relationship.startYear !== undefined &&
      relationship.endYear !== undefined &&
      relationship.startYear > relationship.endYear
    ) {
      context.addIssue({
        code: "custom",
        path: ["endYear"],
        message: "endYear must not precede startYear",
      });
    }

    if (relationship.relationshipType === "provisional_unspecified") {
      if (relationship.orientation !== "undetermined") {
        context.addIssue({
          code: "custom",
          path: ["orientation"],
          message:
            "provisional_unspecified relationships must have undetermined orientation",
        });
      }
      if (
        relationship.reviewStatus !== "draft" &&
        relationship.reviewStatus !== "provisional"
      ) {
        context.addIssue({
          code: "custom",
          path: ["reviewStatus"],
          message:
            "provisional_unspecified relationships must remain draft or provisional",
        });
      }
      return;
    }

    const expectedOrientation = symmetricRelationshipTypes.has(
      relationship.relationshipType,
    )
      ? "symmetric"
      : "directed";
    if (relationship.orientation !== expectedOrientation) {
      context.addIssue({
        code: "custom",
        path: ["orientation"],
        message: `${relationship.relationshipType} relationships must be ${expectedOrientation}`,
      });
    }
  });

export type Relationship = z.infer<typeof relationshipSchema>;
