import type { Relationship } from "./types";

export const relationshipTypeLabels: Record<
  Relationship["relationshipType"],
  string
> = {
  influenced_style: "Influenced style",
  mentored: "Mentored",
  learned_from: "Learned from",
  performed_with: "Performed with",
  recorded_with: "Recorded with",
  member_of: "Member of",
  covered_work_by: "Work covered by",
  adapted_composition: "Adapted composition",
  shared_scene: "Shared scene",
  recorded_by_label: "Recorded by label",
  associated_with_place: "Associated with place",
  migrated_to: "Migrated to",
  revived_or_reintroduced: "Revived or reintroduced",
  historical_parallel: "Historical parallel",
  provisional_unspecified: "Provisional relationship",
};

export const evidenceCategoryLabels: Record<
  Relationship["evidenceCategory"],
  string
> = {
  directly_documented: "Directly documented",
  historically_corroborated: "Historically corroborated",
  contextual_or_inferential: "Contextual or inferential",
  interpretive_or_debated: "Interpretive or debated",
};

export const relationshipReviewStatusLabels: Record<
  Relationship["reviewStatus"],
  string
> = {
  draft: "Draft",
  provisional: "Provisional",
  reviewed: "Reviewed",
  withdrawn: "Withdrawn",
};

export function relationshipSymbol(relationship: Relationship): string {
  if (relationship.orientation === "symmetric") return "↔";
  if (relationship.orientation === "undetermined") return "—";
  return "→";
}

export function describeDirection(relationship: Relationship): string {
  const directions: Record<Relationship["relationshipType"], string> = {
    influenced_style: "The claim runs from entity A to entity B.",
    mentored: "Entity A is the mentor and entity B is the person mentored.",
    learned_from: "Entity A learned from entity B.",
    performed_with:
      "The entities performed together; this relationship is symmetric.",
    recorded_with:
      "The entities recorded together; this relationship is symmetric.",
    member_of: "Entity A is a member and entity B is the ensemble.",
    covered_work_by: "Entity B covered a work by entity A.",
    adapted_composition:
      "Entity A adapted the composition represented by entity B.",
    shared_scene:
      "The entities shared a scene; this relationship is symmetric.",
    recorded_by_label: "Entity A was recorded by entity B, the label.",
    associated_with_place: "Entity A is associated with entity B, the place.",
    migrated_to: "Entity A migrated to entity B, the place.",
    revived_or_reintroduced: "Entity A revived or reintroduced entity B.",
    historical_parallel:
      "The record proposes a symmetric historical comparison, not proven causation.",
    provisional_unspecified:
      "The relationship type and orientation remain undetermined pending editorial review.",
  };

  return directions[relationship.relationshipType];
}
