import type { Corpus } from "../corpus/load-corpus";
import {
  getExploratoryRelationships,
  getPublicCorpus,
} from "../corpus/public-records";
import type { Entity } from "../types";

export function buildEntityPageEntries(
  corpus: Corpus,
  entityType: Entity["entityType"],
) {
  const publicCorpus = getPublicCorpus(corpus);
  const exploratoryRelationships = getExploratoryRelationships(corpus);

  return publicCorpus.entities
    .filter((entity) => entity.entityType === entityType)
    .map((entity) => ({
      params: { slug: entity.slug },
      props: {
        entity,
        relationships: exploratoryRelationships,
        entities: publicCorpus.entities,
        sources: publicCorpus.sources,
      },
    }));
}
