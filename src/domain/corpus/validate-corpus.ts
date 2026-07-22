import type { Corpus } from "./load-corpus";
import type { Entity, Relationship } from "../types";

export interface ValidationIssue {
  severity: "error" | "warning";
  code: string;
  message: string;
  recordId?: string;
}

export interface ValidationReport {
  corpusVersion: string;
  generatedAt: string;
  valid: boolean;
  counts: {
    entities: number;
    relationships: number;
    publicRelationships: number;
    sources: number;
    entitiesByType: Record<string, number>;
    relationshipsByType: Record<string, number>;
    relationshipsByEvidenceCategory: Record<string, number>;
  };
  citationCoverage: {
    citedPublicRelationships: number;
    publicRelationships: number;
    percentage: number;
  };
  unresolvedWarnings: number;
  issues: ValidationIssue[];
}

function duplicateIssues(
  records: Array<{ id: string; slug?: string }>,
  field: "id" | "slug",
  code: string,
): ValidationIssue[] {
  const values = new Map<string, string[]>();

  for (const record of records) {
    const value = record[field];
    if (!value) continue;
    values.set(value, [...(values.get(value) ?? []), record.id]);
  }

  return [...values.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([value, ids]) => ({
      severity: "error" as const,
      code,
      message: `Duplicate ${field} '${value}' used by ${ids.join(", ")}`,
    }));
}

function countBy<T>(
  records: T[],
  getKey: (record: T) => string,
): Record<string, number> {
  return records.reduce<Record<string, number>>((counts, record) => {
    const key = getKey(record);
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}

function relationshipIssues(
  relationships: Relationship[],
  entities: Entity[],
  sourceIds: Set<string>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const entityIds = new Set(entities.map((entity) => entity.id));
  const semanticEdges = new Map<string, string[]>();

  for (const relationship of relationships) {
    if (!entityIds.has(relationship.entityAId)) {
      issues.push({
        severity: "error",
        code: "missing_entity_a",
        message: `Entity A '${relationship.entityAId}' does not exist`,
        recordId: relationship.id,
      });
    }
    if (!entityIds.has(relationship.entityBId)) {
      issues.push({
        severity: "error",
        code: "missing_entity_b",
        message: `Entity B '${relationship.entityBId}' does not exist`,
        recordId: relationship.id,
      });
    }

    for (const citationId of relationship.citationIds) {
      if (!sourceIds.has(citationId)) {
        issues.push({
          severity: "error",
          code: "missing_citation",
          message: `Citation '${citationId}' does not exist`,
          recordId: relationship.id,
        });
      }
    }

    if (
      relationship.reviewStatus === "reviewed" &&
      relationship.citationIds.length === 0
    ) {
      issues.push({
        severity: "error",
        code: "uncited_public_relationship",
        message: "Public relationships must contain at least one citation",
        recordId: relationship.id,
      });
    }

    if (
      relationship.evidenceCategory === "directly_documented" &&
      relationship.citationIds.length === 0
    ) {
      issues.push({
        severity: "error",
        code: "uncited_documented_relationship",
        message: "Directly documented relationships must contain a citation",
        recordId: relationship.id,
      });
    }

    if (relationship.reviewStatus === "provisional") {
      issues.push({
        severity: "warning",
        code: "provisional_relationship_excluded",
        message:
          "Provisional relationship is retained for review and excluded from the reviewed public dataset",
        recordId: relationship.id,
      });
    }

    const endpointIds =
      relationship.orientation === "symmetric"
        ? [relationship.entityAId, relationship.entityBId].sort()
        : [relationship.entityAId, relationship.entityBId];
    const edgeKey = [...endpointIds, relationship.relationshipType].join("|");
    semanticEdges.set(edgeKey, [
      ...(semanticEdges.get(edgeKey) ?? []),
      relationship.id,
    ]);
  }

  for (const [edgeKey, ids] of semanticEdges) {
    if (ids.length > 1) {
      issues.push({
        severity: "error",
        code: "duplicate_semantic_edge",
        message: `Duplicate semantic edge '${edgeKey}' used by ${ids.join(", ")}`,
      });
    }
  }

  return issues;
}

export function validateCorpus(
  corpus: Corpus,
  generatedAt = new Date().toISOString(),
): ValidationReport {
  const issues: ValidationIssue[] = [
    ...duplicateIssues(corpus.entities, "id", "duplicate_entity_id"),
    ...duplicateIssues(corpus.entities, "slug", "duplicate_entity_slug"),
    ...duplicateIssues(corpus.relationships, "id", "duplicate_relationship_id"),
    ...duplicateIssues(
      corpus.relationships,
      "slug",
      "duplicate_relationship_slug",
    ),
    ...duplicateIssues(corpus.sources, "id", "duplicate_source_id"),
  ];
  const sourceIds = new Set(corpus.sources.map((source) => source.id));

  issues.push(
    ...relationshipIssues(corpus.relationships, corpus.entities, sourceIds),
  );

  for (const entity of corpus.entities) {
    for (const sourceId of entity.sourceIds) {
      if (!sourceIds.has(sourceId)) {
        issues.push({
          severity: "error",
          code: "missing_entity_source",
          message: `Entity source '${sourceId}' does not exist`,
          recordId: entity.id,
        });
      }
    }
  }

  const publicRelationships = corpus.relationships.filter(
    (relationship) => relationship.reviewStatus === "reviewed",
  );
  const citedPublicRelationships = publicRelationships.filter(
    (relationship) => relationship.citationIds.length > 0,
  ).length;

  return {
    corpusVersion: corpus.metadata.version,
    generatedAt,
    valid: !issues.some((issue) => issue.severity === "error"),
    counts: {
      entities: corpus.entities.length,
      relationships: corpus.relationships.length,
      publicRelationships: publicRelationships.length,
      sources: corpus.sources.length,
      entitiesByType: countBy(corpus.entities, (entity) => entity.entityType),
      relationshipsByType: countBy(
        corpus.relationships,
        (relationship) => relationship.relationshipType,
      ),
      relationshipsByEvidenceCategory: countBy(
        corpus.relationships,
        (relationship) => relationship.evidenceCategory,
      ),
    },
    citationCoverage: {
      citedPublicRelationships,
      publicRelationships: publicRelationships.length,
      percentage:
        publicRelationships.length === 0
          ? 100
          : Math.round(
              (citedPublicRelationships / publicRelationships.length) * 100,
            ),
    },
    unresolvedWarnings: issues.filter((issue) => issue.severity === "warning")
      .length,
    issues,
  };
}
