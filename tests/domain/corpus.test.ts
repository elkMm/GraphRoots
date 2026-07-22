import { describe, expect, it } from "vitest";
import { normalizeBasePath, prefixBasePath } from "../../src/domain/base-path";
import { loadCorpus } from "../../src/domain/corpus/load-corpus";
import {
  getExploratoryRelationships,
  getPublicCorpus,
} from "../../src/domain/corpus/public-records";
import { validateCorpus } from "../../src/domain/corpus/validate-corpus";
import { buildGraphPayload } from "../../src/domain/graph/build-payload";
import { filterGraphPayload } from "../../src/domain/graph/filter-payload";
import { buildTransmissionDag } from "../../src/domain/graph/transmission-dag";
import { describeDirection } from "../../src/domain/relationships";
import { getEntityPath, getRelationshipPath } from "../../src/domain/routes";
import { entitySchema, relationshipSchema } from "../../src/domain/schemas";

describe("GraphRoots corpus", () => {
  it("prefixes internal paths for project-hosted deployments", () => {
    expect(normalizeBasePath("/GraphRoots/")).toBe("/GraphRoots");
    expect(prefixBasePath("/", "/GraphRoots/")).toBe("/GraphRoots/");
    expect(prefixBasePath("/artists/rory-block", "/GraphRoots/")).toBe(
      "/GraphRoots/artists/rory-block",
    );
    expect(
      prefixBasePath("/blues/explore?entity=rory-block", "/GraphRoots/"),
    ).toBe("/GraphRoots/blues/explore?entity=rory-block");
    expect(prefixBasePath("https://example.com", "/GraphRoots/")).toBe(
      "https://example.com",
    );
  });

  it("parses and validates the expanded corpus", async () => {
    const corpus = await loadCorpus();
    const report = validateCorpus(corpus, "2026-07-22T00:00:00.000Z");

    expect(report.valid).toBe(true);
    expect(report.counts.entities).toBe(296);
    expect(report.counts.entitiesByType.artist).toBe(282);
    expect(report.counts.relationships).toBe(1196);
    expect(report.counts.publicRelationships).toBe(43);
    expect(report.counts.sources).toBe(519);
    expect(report.citationCoverage.percentage).toBe(100);
  });

  it("provides a checked featured song for every artist", async () => {
    const corpus = await loadCorpus();
    const artistsWithoutVideo = corpus.entities.filter(
      (entity) => entity.entityType === "artist" && !entity.featuredVideo,
    );
    const gareDuNord = corpus.entities.find(
      (entity) => entity.slug === "gare-du-nord",
    );

    expect(artistsWithoutVideo).toEqual([]);
    expect(
      corpus.entities.filter((entity) => entity.entityType === "artist"),
    ).toHaveLength(282);
    expect(gareDuNord?.featuredVideo?.videoId).toBe("XrqDr2c-yxU");
  });

  it("rejects impossible date ordering", () => {
    const result = entitySchema.safeParse({
      id: "entity:test",
      slug: "test-entity",
      name: "Test Entity",
      entityType: "artist",
      summary: "A sufficiently long test summary for schema validation.",
      activeStart: 2000,
      activeEnd: 1900,
      regions: [],
      styles: [],
      sourceIds: [],
      reviewStatus: "draft",
    });

    expect(result.success).toBe(false);
  });

  it("rejects malformed featured video identifiers", () => {
    const result = entitySchema.safeParse({
      id: "entity:test",
      slug: "test-entity",
      name: "Test Entity",
      entityType: "artist",
      summary: "A sufficiently long test summary for schema validation.",
      regions: [],
      styles: [],
      sourceIds: [],
      featuredVideo: {
        platform: "youtube",
        videoId: "not-a-video-id",
        title: "Test song",
        sourceUrl: "https://www.youtube.com/watch?v=not-a-video-id",
        lastChecked: "2026-07-22",
      },
      reviewStatus: "draft",
    });

    expect(result.success).toBe(false);
  });

  it("keeps dispute status independent from editorial review", () => {
    const result = relationshipSchema.safeParse({
      id: "relationship:test:001",
      slug: "source--target",
      entityAId: "entity:source",
      entityBId: "entity:target",
      relationshipType: "historical_parallel",
      orientation: "symmetric",
      evidenceCategory: "interpretive_or_debated",
      explanation: "A long enough explanation for this test relationship.",
      citationIds: [],
      reviewStatus: "reviewed",
      disputeStatus: "contested",
    });

    expect(result.success).toBe(true);
  });

  it("prevents untyped influence links from entering the reviewed corpus", () => {
    const result = relationshipSchema.safeParse({
      id: "relationship:test:002",
      slug: "untyped-source--target",
      entityAId: "entity:source",
      entityBId: "entity:target",
      relationshipType: "provisional_unspecified",
      orientation: "undetermined",
      evidenceCategory: "interpretive_or_debated",
      explanation: "A long enough explanation for this test relationship.",
      citationIds: [],
      reviewStatus: "reviewed",
      disputeStatus: "none",
    });

    expect(result.success).toBe(false);
  });

  it("keeps provisional paths out of the reviewed public dataset", async () => {
    const corpus = await loadCorpus();
    const publicCorpus = getPublicCorpus(corpus);
    const exploratoryRelationships = getExploratoryRelationships(corpus);
    const graph = buildGraphPayload(corpus, "2026-07-21T00:00:00.000Z");
    const provisionalEdges = graph.edges.filter(
      (edge) => edge.reviewStatus === "provisional",
    );
    const biographyRelationships = corpus.relationships.filter((relationship) =>
      relationship.id.startsWith("relationship:wikipedia-"),
    );

    expect(publicCorpus.relationships).toHaveLength(43);
    expect(exploratoryRelationships).toHaveLength(1196);
    expect(
      exploratoryRelationships.every(
        (relationship) => !relationship.migration && !relationship.curatorNote,
      ),
    ).toBe(true);
    expect(
      publicCorpus.sources.some(
        (source) => source.id === "source:prototype-migration",
      ),
    ).toBe(false);
    expect(
      publicCorpus.entities.every(
        (entity) =>
          !entity.migration &&
          !entity.sourceIds.includes("source:prototype-migration"),
      ),
    ).toBe(true);
    expect(
      publicCorpus.relationships.every(
        (relationship) =>
          !relationship.id.includes("prototype") &&
          !relationship.migration &&
          !relationship.curatorNote,
      ),
    ).toBe(true);
    expect(graph.edges).toHaveLength(1196);
    expect(graph.edges.every((edge) => !edge.id.includes("prototype"))).toBe(
      true,
    );
    expect(provisionalEdges).toHaveLength(1153);
    expect(biographyRelationships).toHaveLength(1079);
    expect(
      biographyRelationships.every(
        (relationship) =>
          relationship.reviewStatus === "provisional" &&
          relationship.evidenceCategory === "contextual_or_inferential" &&
          relationship.citationIds.length > 0 &&
          relationship.citationIds.every((citationId) =>
            citationId.startsWith("source:wikipedia-biography-"),
          ),
      ),
    ).toBe(true);
    expect(
      biographyRelationships.filter(
        (relationship) =>
          relationship.relationshipType === "provisional_unspecified",
      ),
    ).toHaveLength(988);
    expect(
      graph.edges.find(
        (edge) =>
          edge.slug ===
          "wikipedia-arthur-big-boy-spires--willie-big-eyes-smith",
      )?.explanation,
    ).toContain('Arthur "Big Boy" Spires and Willie "Big Eyes" Smith');
  });

  it("filters nodes and typed edges independently", async () => {
    const graph = buildGraphPayload(
      await loadCorpus(),
      "2026-07-21T00:00:00.000Z",
    );
    const traditions = filterGraphPayload(graph, {
      entityType: "tradition",
      relationshipType: "historical_parallel",
      evidenceCategory: "interpretive_or_debated",
      networkGroups: [
        "roots",
        "delta",
        "texas_piedmont",
        "classic",
        "chicago",
        "rock_crossover",
        "british",
        "modern",
      ],
      includeProvisional: false,
    });

    expect(traditions.nodes).toHaveLength(6);
    expect(traditions.edges).toHaveLength(1);
    expect(traditions.edges[0]?.orientation).toBe("symmetric");
    expect(traditions.edges[0]?.disputeStatus).toBe("contested");
  });

  it("directs covered-work edges from originator to covering artist", async () => {
    const corpus = await loadCorpus();
    const coveredWorkRelationships = corpus.relationships
      .filter(
        (relationship) => relationship.relationshipType === "covered_work_by",
      )
      .map((relationship) => relationship.slug)
      .sort();

    expect(coveredWorkRelationships).toEqual([
      "blind-willie-johnson--led-zeppelin",
      "robert-johnson--gare-du-nord",
      "skip-james--cream",
      "wikipedia-robert-johnson--rory-block",
      "wikipedia-tommy-johnson--rory-block",
    ]);
    const relationship = corpus.relationships.find(
      (record) => record.slug === "robert-johnson--gare-du-nord",
    );
    if (!relationship) throw new Error("Expected covered-work fixture");
    expect(describeDirection(relationship)).toBe(
      "Entity B covered a work by entity A.",
    );
  });

  it("derives a temporally ordered DAG without rejecting corpus cycles", async () => {
    const corpus = await loadCorpus();
    const citationId = corpus.sources[0]?.id;
    if (!citationId) throw new Error("Expected a source fixture");
    const entityA = entitySchema.parse({
      id: "entity:cycle-a",
      slug: "cycle-a",
      name: "Cycle A",
      entityType: "artist",
      summary: "A sufficiently long summary for the first cycle fixture.",
      activeStart: 1900,
      regions: [],
      styles: [],
      sourceIds: [],
      reviewStatus: "draft",
    });
    const entityB = entitySchema.parse({
      id: "entity:cycle-b",
      slug: "cycle-b",
      name: "Cycle B",
      entityType: "artist",
      summary: "A sufficiently long summary for the second cycle fixture.",
      activeStart: 1920,
      regions: [],
      styles: [],
      sourceIds: [],
      reviewStatus: "draft",
    });
    const relationshipA = relationshipSchema.parse({
      id: "relationship:cycle:a-b",
      slug: "cycle-a--cycle-b",
      entityAId: entityA.id,
      entityBId: entityB.id,
      relationshipType: "mentored",
      orientation: "directed",
      evidenceCategory: "historically_corroborated",
      explanation: "A sufficiently long synthetic relationship explanation.",
      citationIds: [citationId],
      reviewStatus: "reviewed",
      disputeStatus: "none",
    });
    const relationshipB = relationshipSchema.parse({
      ...relationshipA,
      id: "relationship:cycle:b-a",
      slug: "cycle-b--cycle-a",
      entityAId: entityB.id,
      entityBId: entityA.id,
    });
    const cyclicCorpus = {
      ...corpus,
      entities: [...corpus.entities, entityA, entityB],
      relationships: [...corpus.relationships, relationshipA, relationshipB],
    };

    expect(validateCorpus(cyclicCorpus).valid).toBe(true);
    const projection = buildTransmissionDag(
      [relationshipA, relationshipB],
      [entityA, entityB],
    );
    expect(projection.edges).toEqual([
      expect.objectContaining({
        relationshipId: relationshipA.id,
        fromEntityId: entityA.id,
        toEntityId: entityB.id,
      }),
    ]);
  });

  it("detects duplicate entity IDs", async () => {
    const corpus = await loadCorpus();
    const duplicate = corpus.entities[0];
    if (!duplicate) throw new Error("Expected a corpus entity fixture");
    const report = validateCorpus(
      { ...corpus, entities: [...corpus.entities, { ...duplicate }] },
      "2026-07-21T00:00:00.000Z",
    );

    expect(report.valid).toBe(false);
    expect(
      report.issues.some((issue) => issue.code === "duplicate_entity_id"),
    ).toBe(true);
  });

  it("resolves route and direction helpers", async () => {
    const corpus = await loadCorpus();
    const relationship = corpus.relationships.find(
      (record) => record.slug === "eric-clapton--yardbirds",
    );
    const artist = corpus.entities.find(
      (record) => record.slug === "eric-clapton",
    );
    if (!relationship || !artist) throw new Error("Expected route fixtures");

    expect(getEntityPath(artist)).toBe("/artists/eric-clapton");
    expect(getRelationshipPath(relationship.slug)).toBe(
      "/relationships/eric-clapton--yardbirds",
    );
    expect(describeDirection(relationship)).toContain("member");
  });
});
