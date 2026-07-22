import type { Entity } from "./types";

export function getEntityPath(
  entity: Pick<Entity, "entityType" | "slug">,
): string {
  switch (entity.entityType) {
    case "artist":
      return `/artists/${entity.slug}`;
    case "ensemble":
      return `/ensembles/${entity.slug}`;
    case "tradition":
      return `/traditions/${entity.slug}`;
    case "recording":
      return `/recordings/${entity.slug}`;
    case "place":
      return `/places/${entity.slug}`;
    default:
      return `/entities/${entity.slug}`;
  }
}

export function getRelationshipPath(slug: string): string {
  return `/relationships/${slug}`;
}
