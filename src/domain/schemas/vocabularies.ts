import { z } from "zod";

export const entityTypes = [
  "artist",
  "ensemble",
  "tradition",
  "technique",
  "instrument",
  "composition",
  "recording",
  "place",
  "label",
  "institution",
  "event",
] as const;

export const relationshipTypes = [
  "influenced_style",
  "mentored",
  "learned_from",
  "performed_with",
  "recorded_with",
  "member_of",
  "covered_work_by",
  "adapted_composition",
  "shared_scene",
  "recorded_by_label",
  "associated_with_place",
  "migrated_to",
  "revived_or_reintroduced",
  "historical_parallel",
  "provisional_unspecified",
] as const;

export const relationshipOrientations = [
  "directed",
  "symmetric",
  "undetermined",
] as const;

export const evidenceCategories = [
  "directly_documented",
  "historically_corroborated",
  "contextual_or_inferential",
  "interpretive_or_debated",
] as const;

export const entityReviewStatuses = [
  "draft",
  "reviewed",
  "needs_revision",
  "disputed",
] as const;

export const relationshipReviewStatuses = [
  "draft",
  "provisional",
  "reviewed",
  "withdrawn",
] as const;

export const disputeStatuses = ["none", "contested"] as const;

export const sourceTypes = [
  "book",
  "journal_article",
  "archive",
  "interview",
  "liner_notes",
  "museum_or_library",
  "reputable_reference",
  "primary_recording",
  "other",
] as const;

export const entityTypeSchema = z.enum(entityTypes);
export const relationshipTypeSchema = z.enum(relationshipTypes);
export const relationshipOrientationSchema = z.enum(relationshipOrientations);
export const evidenceCategorySchema = z.enum(evidenceCategories);
export const entityReviewStatusSchema = z.enum(entityReviewStatuses);
export const relationshipReviewStatusSchema = z.enum(
  relationshipReviewStatuses,
);
export const disputeStatusSchema = z.enum(disputeStatuses);
export const sourceTypeSchema = z.enum(sourceTypes);
