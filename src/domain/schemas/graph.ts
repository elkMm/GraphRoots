import { z } from "zod";
import { identifierSchema, slugSchema } from "./shared";
import {
  disputeStatusSchema,
  entityTypeSchema,
  evidenceCategorySchema,
  entityReviewStatusSchema,
  relationshipOrientationSchema,
  relationshipReviewStatusSchema,
  relationshipTypeSchema,
} from "./vocabularies";

export const graphNodePayloadSchema = z.object({
  id: identifierSchema,
  slug: slugSchema,
  name: z.string().min(1),
  entityType: entityTypeSchema,
  dateDisplay: z.string().optional(),
  primaryRegion: z.string().optional(),
  networkGroup: z.string().optional(),
  connectionCount: z.number().int().nonnegative(),
  summary: z.string().min(1),
  reviewStatus: entityReviewStatusSchema,
});

export const graphEdgePayloadSchema = z.object({
  id: identifierSchema,
  slug: slugSchema,
  entityAId: identifierSchema,
  entityBId: identifierSchema,
  relationshipType: relationshipTypeSchema,
  orientation: relationshipOrientationSchema,
  evidenceCategory: evidenceCategorySchema,
  explanation: z.string().min(1),
  reviewStatus: relationshipReviewStatusSchema,
  disputeStatus: disputeStatusSchema,
});

export const graphPayloadSchema = z.object({
  corpusVersion: z.string(),
  generatedAt: z.string(),
  nodes: z.array(graphNodePayloadSchema),
  edges: z.array(graphEdgePayloadSchema),
});

export type GraphNodePayload = z.infer<typeof graphNodePayloadSchema>;
export type GraphEdgePayload = z.infer<typeof graphEdgePayloadSchema>;
export type GraphPayload = z.infer<typeof graphPayloadSchema>;
