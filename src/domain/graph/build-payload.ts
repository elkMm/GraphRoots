import type { Corpus } from "../corpus/load-corpus";
import { graphPayloadSchema } from "../schemas";
import type { GraphPayload } from "../types";

export function buildGraphPayload(
  corpus: Corpus,
  generatedAt = new Date().toISOString(),
): GraphPayload {
  const graphEntities = corpus.entities.filter(
    (entity) => entity.reviewStatus !== "draft",
  );
  const graphEntityIds = new Set(graphEntities.map((entity) => entity.id));
  const graphRelationships = corpus.relationships.filter(
    (relationship) =>
      (relationship.reviewStatus === "reviewed" ||
        relationship.reviewStatus === "provisional") &&
      graphEntityIds.has(relationship.entityAId) &&
      graphEntityIds.has(relationship.entityBId),
  );
  const connectionCounts = new Map(
    graphEntities.map((entity) => [entity.id, 0]),
  );

  for (const relationship of graphRelationships) {
    connectionCounts.set(
      relationship.entityAId,
      (connectionCounts.get(relationship.entityAId) ?? 0) + 1,
    );
    connectionCounts.set(
      relationship.entityBId,
      (connectionCounts.get(relationship.entityBId) ?? 0) + 1,
    );
  }

  return graphPayloadSchema.parse({
    corpusVersion: corpus.metadata.version,
    generatedAt,
    nodes: graphEntities.map((entity) => ({
      id: entity.id,
      slug: entity.slug,
      name: entity.name,
      entityType: entity.entityType,
      dateDisplay: entity.dateDisplay,
      primaryRegion: entity.regions.at(0),
      networkGroup: entity.migration?.originalEra,
      connectionCount: connectionCounts.get(entity.id) ?? 0,
      summary: entity.summary,
      reviewStatus: entity.reviewStatus,
    })),
    edges: graphRelationships.map((relationship) => ({
      id: relationship.id.startsWith("relationship:prototype:")
        ? `relationship:${relationship.slug}`
        : relationship.id,
      slug: relationship.slug,
      entityAId: relationship.entityAId,
      entityBId: relationship.entityBId,
      relationshipType: relationship.relationshipType,
      orientation: relationship.orientation,
      evidenceCategory: relationship.evidenceCategory,
      explanation: relationship.explanation,
      reviewStatus: relationship.reviewStatus,
      disputeStatus: relationship.disputeStatus,
    })),
  });
}
