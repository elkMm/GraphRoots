import type { Corpus } from "./load-corpus";

const internalSourceIds = new Set(["source:prototype-migration"]);

function preparePublicRelationship(
  relationship: Corpus["relationships"][number],
) {
  const publicRelationship = { ...relationship };
  delete publicRelationship.curatorNote;
  delete publicRelationship.migration;
  if (publicRelationship.id.startsWith("relationship:prototype:")) {
    publicRelationship.id = `relationship:${publicRelationship.slug}`;
  }
  return publicRelationship;
}

export function getExploratoryRelationships(corpus: Corpus) {
  const publicEntityIds = new Set(
    corpus.entities
      .filter((entity) => entity.reviewStatus !== "draft")
      .map((entity) => entity.id),
  );

  return corpus.relationships
    .filter(
      (relationship) =>
        (relationship.reviewStatus === "reviewed" ||
          relationship.reviewStatus === "provisional") &&
        publicEntityIds.has(relationship.entityAId) &&
        publicEntityIds.has(relationship.entityBId),
    )
    .map(preparePublicRelationship);
}

export function getPublicCorpus(corpus: Corpus): Corpus {
  return {
    ...corpus,
    entities: corpus.entities
      .filter((entity) => entity.reviewStatus !== "draft")
      .map((entity) => {
        const publicEntity = { ...entity };
        delete publicEntity.migration;
        publicEntity.sourceIds = publicEntity.sourceIds.filter(
          (sourceId) => !internalSourceIds.has(sourceId),
        );
        return publicEntity;
      }),
    relationships: corpus.relationships
      .filter((relationship) => relationship.reviewStatus === "reviewed")
      .map(preparePublicRelationship),
    sources: corpus.sources.filter(
      (source) => !internalSourceIds.has(source.id),
    ),
  };
}
