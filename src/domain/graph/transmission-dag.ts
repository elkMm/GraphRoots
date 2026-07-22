import type { Entity, Relationship } from "../types";

type TransmissionDirection = "a_to_b" | "b_to_a";

const transmissionDirections: Partial<
  Record<Relationship["relationshipType"], TransmissionDirection>
> = {
  influenced_style: "a_to_b",
  mentored: "a_to_b",
  learned_from: "b_to_a",
  covered_work_by: "a_to_b",
  adapted_composition: "b_to_a",
};

export interface TransmissionDagEdge {
  relationshipId: string;
  relationshipType: Relationship["relationshipType"];
  fromEntityId: string;
  toEntityId: string;
  evidenceCategory: Relationship["evidenceCategory"];
  disputeStatus: Relationship["disputeStatus"];
}

export interface TransmissionDag {
  entityIds: string[];
  edges: TransmissionDagEdge[];
}

export function isTransmissionRelationship(
  relationshipType: Relationship["relationshipType"],
): boolean {
  return Object.hasOwn(transmissionDirections, relationshipType);
}

export function getTransmissionEndpoints(
  relationship: Relationship,
): { fromEntityId: string; toEntityId: string } | undefined {
  const direction = transmissionDirections[relationship.relationshipType];
  if (!direction) return undefined;

  return direction === "a_to_b"
    ? {
        fromEntityId: relationship.entityAId,
        toEntityId: relationship.entityBId,
      }
    : {
        fromEntityId: relationship.entityBId,
        toEntityId: relationship.entityAId,
      };
}

export function isTemporallyOrdered(
  relationship: Relationship,
  entityById: ReadonlyMap<string, Entity>,
): boolean {
  const endpoints = getTransmissionEndpoints(relationship);
  if (!endpoints) return false;

  const fromStart = entityById.get(endpoints.fromEntityId)?.activeStart;
  const toStart = entityById.get(endpoints.toEntityId)?.activeStart;
  return (
    fromStart !== undefined && toStart !== undefined && fromStart < toStart
  );
}

export function buildTransmissionDag(
  relationships: Relationship[],
  entities: Entity[],
): TransmissionDag {
  const entityById = new Map(entities.map((entity) => [entity.id, entity]));
  const edges = relationships.flatMap((relationship) => {
    if (
      relationship.orientation !== "directed" ||
      relationship.reviewStatus !== "reviewed" ||
      !isTransmissionRelationship(relationship.relationshipType) ||
      !isTemporallyOrdered(relationship, entityById)
    ) {
      return [];
    }

    const endpoints = getTransmissionEndpoints(relationship);
    if (!endpoints) return [];
    return [
      {
        relationshipId: relationship.id,
        relationshipType: relationship.relationshipType,
        ...endpoints,
        evidenceCategory: relationship.evidenceCategory,
        disputeStatus: relationship.disputeStatus,
      },
    ];
  });

  return {
    entityIds: [
      ...new Set(edges.flatMap((edge) => [edge.fromEntityId, edge.toEntityId])),
    ],
    edges,
  };
}
