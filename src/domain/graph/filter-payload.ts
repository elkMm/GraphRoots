import type { GraphPayload } from "../types";

export interface GraphFilters {
  entityType: string;
  relationshipType: string;
  evidenceCategory: string;
  networkGroups: string[];
  includeProvisional: boolean;
}

export function filterGraphPayload(graph: GraphPayload, filters: GraphFilters) {
  const nodes = graph.nodes.filter(
    (node) =>
      (filters.entityType === "all" ||
        node.entityType === filters.entityType) &&
      (!node.networkGroup || filters.networkGroups.includes(node.networkGroup)),
  );
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = graph.edges.filter(
    (edge) =>
      nodeIds.has(edge.entityAId) &&
      nodeIds.has(edge.entityBId) &&
      (edge.reviewStatus === "reviewed" || filters.includeProvisional) &&
      (filters.relationshipType === "all" ||
        edge.relationshipType === filters.relationshipType) &&
      (filters.evidenceCategory === "all" ||
        edge.evidenceCategory === filters.evidenceCategory),
  );

  return { nodes, edges };
}
