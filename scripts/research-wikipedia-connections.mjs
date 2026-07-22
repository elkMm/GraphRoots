// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* global process */
import { readFile, readdir, writeFile } from "node:fs/promises";

const accessDate = "2026-07-22";
const outputPath =
  process.argv[2] ?? "/tmp/graphroots-wikipedia-connections.json";
const apiHeaders = {
  "User-Agent":
    "GraphRoots/0.6 provisional relationship research (contact via project repository)",
};
const wikipediaTitleOverrides = new Map([
  ["big-mama-thornton", "Big Mama Thornton"],
  ["christone-kingfish-ingram", "Christone Ingram"],
]);
const sentenceSegmenter = new Intl.Segmenter("en", {
  granularity: "sentence",
});

function normalize(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function decodeHtml(value) {
  const namedEntities = new Map([
    ["amp", "&"],
    ["apos", "'"],
    ["gt", ">"],
    ["hellip", "…"],
    ["ldquo", "“"],
    ["lsquo", "‘"],
    ["lt", "<"],
    ["mdash", "—"],
    ["nbsp", " "],
    ["ndash", "–"],
    ["quot", '"'],
    ["rdquo", "”"],
    ["rsquo", "’"],
  ]);
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, codePoint) =>
      String.fromCodePoint(Number.parseInt(codePoint, 16)),
    )
    .replace(/&#(\d+);/g, (_, codePoint) =>
      String.fromCodePoint(Number(codePoint)),
    )
    .replace(
      /&([a-z]+);/gi,
      (entity, name) => namedEntities.get(name.toLowerCase()) ?? entity,
    );
}

function wikipediaTitleFromUrl(urlValue) {
  try {
    const url = new URL(urlValue);
    if (
      url.hostname !== "en.wikipedia.org" ||
      !url.pathname.startsWith("/wiki/")
    ) {
      return undefined;
    }
    return decodeURIComponent(url.pathname.slice("/wiki/".length)).replace(
      /_/g,
      " ",
    );
  } catch {
    return undefined;
  }
}

function htmlAttribute(attributes, name) {
  const match = attributes.match(
    new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i"),
  );
  return match?.[1] ?? match?.[2];
}

async function loadJsonDirectory(directory) {
  const files = (await readdir(directory))
    .filter((file) => file.endsWith(".json"))
    .sort();
  return Promise.all(
    files.map(async (file) => ({
      file,
      record: JSON.parse(await readFile(`${directory}/${file}`, "utf8")),
    })),
  );
}

async function fetchArticleHtml(url, attempts = 4) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, { headers: apiHeaders });
      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = Number(response.headers.get("retry-after"));
          const waitTime = Number.isFinite(retryAfter)
            ? Math.max(10_000, retryAfter * 1_000)
            : 10_000;
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
        throw new Error(`${response.status} ${response.statusText}`);
      }
      return { html: await response.text(), finalUrl: response.url };
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 1_500 * 2 ** attempt));
    }
  }
  throw lastError;
}

async function mapConcurrent(values, concurrency, mapper) {
  const results = new Array(values.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < values.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(values[index], index);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}

function pageTitleForEntity(entity, sourcesById, rosterTitles) {
  for (const sourceId of entity.sourceIds) {
    const source = sourcesById.get(sourceId);
    const title = source?.url ? wikipediaTitleFromUrl(source.url) : undefined;
    if (title) return title;
  }
  for (const name of [entity.name, ...(entity.aliases ?? [])]) {
    const rosterTitle = rosterTitles.get(normalize(name));
    if (rosterTitle) return rosterTitle;
  }
  return entity.name;
}

function linkedTitlesFromHtml(html) {
  const linkedTitles = new Map();
  const anchorPattern = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = anchorPattern.exec(html))) {
    const title = htmlAttribute(match[1], "title");
    if (!title) continue;
    const displayText = decodeHtml(match[2].replace(/<[^>]+>/g, ""))
      .replace(/\s+/g, " ")
      .trim();
    if (!displayText) continue;
    linkedTitles.set(normalize(displayText), decodeHtml(title));
  }
  return linkedTitles;
}

async function fetchBiographyPage(entity, requestedTitle) {
  const title = wikipediaTitleOverrides.get(entity.slug) ?? requestedTitle;
  const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(
    title.replace(/ /g, "_"),
  )}`;
  try {
    const result = await fetchArticleHtml(url);
    const resolvedTitle = wikipediaTitleFromUrl(result.finalUrl) ?? title;
    const revisionMatch = result.html.match(/oldid=(\d+)/);
    return {
      entity,
      requestedTitle,
      title: resolvedTitle,
      revid: revisionMatch ? Number(revisionMatch[1]) : 0,
      pageUrl: result.finalUrl,
      html: result.html,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      entity,
      requestedTitle,
      error: message,
    };
  }
}

function markerFor(targetTitle, displayText) {
  return `[[${encodeURIComponent(targetTitle)}::${displayText}]]`;
}

function paragraphTextFromHtml(html) {
  return decodeHtml(
    html
      .replace(/<sup\b[\s\S]*?<\/sup>/gi, "")
      .replace(/<style\b[\s\S]*?<\/style>/gi, "")
      .replace(
        /<a\b([^>]*)>([\s\S]*?)<\/a>/gi,
        (anchor, attributes, displayHtml) => {
          const title = htmlAttribute(attributes, "title");
          const href = htmlAttribute(attributes, "href");
          const hrefMatch = href?.match(
            /^(?:https:\/\/en\.wikipedia\.org)?\/wiki\/([^?#]+)/i,
          );
          const targetTitle = title
            ? decodeHtml(title)
            : hrefMatch?.[1]
              ? decodeURIComponent(hrefMatch[1]).replace(/_/g, " ")
              : undefined;
          const displayText = decodeHtml(
            displayHtml.replace(/<[^>]+>/g, ""),
          ).trim();
          if (
            !targetTitle ||
            /^(?:Category|File|Help|Portal|Special|Template|Wikipedia):/i.test(
              targetTitle,
            )
          ) {
            return displayText;
          }
          return markerFor(targetTitle, displayText);
        },
      )
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function extractBiographyParagraphs(html) {
  const paragraphs = [];
  const paragraphPattern = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  while ((match = paragraphPattern.exec(html))) {
    const text = paragraphTextFromHtml(match[1]);
    if (text.length >= 30) paragraphs.push(text);
  }
  return paragraphs;
}

function markersFromSentence(sentence) {
  return [...sentence.matchAll(/\[\[([^:\]]+)::([^\]]+)\]\]/g)].map(
    (match) => ({
      marker: match[0],
      title: decodeURIComponent(match[1]),
      display: match[2],
      index: match.index ?? 0,
    }),
  );
}

function cleanSentence(sentence) {
  return sentence
    .replace(/\[\[[^:\]]+::([^\]]+)\]\]/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function classifyMention(subject, target, sentence, marker) {
  const clean = cleanSentence(sentence);
  const normalizedSentence = normalize(clean);
  const normalizedTarget = normalize(marker.display || target.name);
  const targetIndex = normalizedSentence.indexOf(normalizedTarget);
  const beforeTarget =
    targetIndex >= 0 ? normalizedSentence.slice(0, targetIndex) : "";
  const afterTarget =
    targetIndex >= 0
      ? normalizedSentence.slice(targetIndex + normalizedTarget.length)
      : "";
  const beforeTargetTail = beforeTarget.slice(-90);
  const afterTargetHead = afterTarget.slice(0, 90);

  if (
    /\b(recorded|recording|session|studio)\b.{0,55}\b(with|featur|including|alongside|backed by)\s*$/.test(
      beforeTargetTail,
    ) ||
    /^\s*(recorded|recording|session|studio)\b.{0,55}\b(with|featur|including|alongside)\b/.test(
      afterTargetHead,
    )
  ) {
    return {
      relationshipType: "recorded_with",
      orientation: "symmetric",
      entityAId: subject.id,
      entityBId: target.id,
      confidence: 4,
      discoveryKind: "recording context",
    };
  }

  if (
    /\b(perform|performed|play|played|work|worked|tour|toured|touring|collaborate|collaborated|record|recorded)\s+(?:extensively\s+)?with\s*$/.test(
      beforeTargetTail,
    ) ||
    /\b(accompanied|backed|supported)\s+by\s*$/.test(beforeTargetTail) ||
    /\b(alongside|band included|group included|lineup included)\s*$/.test(
      beforeTargetTail,
    ) ||
    /^\s*(?:and\s+)?(?:performed|played|worked|toured|collaborated)\s+with\b/.test(
      afterTargetHead,
    )
  ) {
    return {
      relationshipType: "performed_with",
      orientation: "symmetric",
      entityAId: subject.id,
      entityBId: target.id,
      confidence: 3,
      discoveryKind: "performance context",
    };
  }

  const targetBeforeInfluence =
    /^\s+(?:(?:was|is|became|remained)\s+)?(?:(?:a|an|the|major|strong|primary|musical|early)\s+)*influence\b/.test(
      afterTargetHead,
    ) ||
    /\b(?:learned from|studied)\s+(?:the\s+)?(?:music|recordings|records|songs|work)\s+(?:of|by)\s*$/.test(
      beforeTargetTail,
    ) ||
    beforeTarget.endsWith("influenced by ") ||
    beforeTarget.endsWith("inspired by ") ||
    beforeTarget.endsWith("modeled after ");
  if (targetBeforeInfluence) {
    return {
      relationshipType: "influenced_style",
      orientation: "directed",
      entityAId: target.id,
      entityBId: subject.id,
      confidence: 4,
      discoveryKind: "influence wording",
    };
  }

  if (
    /\b(learned from|studied under|was taught by|lessons from)\b/.test(
      beforeTarget.slice(-60),
    )
  ) {
    return {
      relationshipType: "learned_from",
      orientation: "directed",
      entityAId: subject.id,
      entityBId: target.id,
      confidence: 4,
      discoveryKind: "learning context",
    };
  }

  return {
    relationshipType: "provisional_unspecified",
    orientation: "undetermined",
    entityAId: subject.id,
    entityBId: target.id,
    confidence: 1,
    discoveryKind: "explicit biography mention",
  };
}

function relationPairKey(entityAId, entityBId) {
  return [entityAId, entityBId].sort().join("::");
}

function explanationFor(candidate, entitiesById) {
  const entityA = entitiesById.get(candidate.entityAId);
  const entityB = entitiesById.get(candidate.entityBId);
  if (!entityA || !entityB) throw new Error("Candidate endpoint missing");

  switch (candidate.relationshipType) {
    case "recorded_with":
      return `A Wikipedia biography explicitly places ${entityA.name} and ${entityB.name} in the same recording context. The precise session details await independent review.`;
    case "performed_with":
      return `A Wikipedia biography explicitly places ${entityA.name} and ${entityB.name} in the same performance, touring, or band context. The precise relationship awaits independent review.`;
    case "influenced_style":
      return `The Wikipedia biography for ${entityB.name} explicitly describes ${entityA.name} as a musical influence. The claim awaits independent review.`;
    case "learned_from":
      return `The Wikipedia biography for ${entityA.name} explicitly describes learning from ${entityB.name}. The claim awaits independent review.`;
    default:
      return `A Wikipedia biography explicitly connects ${entityA.name} and ${entityB.name} in a career, recording, repertoire, family, or scene context. The precise relationship type awaits editorial review.`;
  }
}

function mergeCandidates(candidates, entitiesById, existingPairKeys) {
  const candidatesByPair = new Map();
  for (const candidate of candidates) {
    const pairKey = relationPairKey(candidate.entityAId, candidate.entityBId);
    if (existingPairKeys.has(pairKey)) continue;
    const values = candidatesByPair.get(pairKey) ?? [];
    values.push(candidate);
    candidatesByPair.set(pairKey, values);
  }

  const relationships = [];
  for (const [pairKey, pairCandidates] of candidatesByPair) {
    const strongestConfidence = Math.max(
      ...pairCandidates.map((candidate) => candidate.confidence),
    );
    const strongest = pairCandidates.filter(
      (candidate) => candidate.confidence === strongestConfidence,
    );
    const signatures = new Set(
      strongest.map(
        (candidate) =>
          `${candidate.relationshipType}:${candidate.orientation}:${candidate.entityAId}:${candidate.entityBId}`,
      ),
    );
    const sortedIds = pairKey.split("::");
    const selected =
      signatures.size === 1
        ? strongest[0]
        : {
            ...strongest[0],
            relationshipType: "provisional_unspecified",
            orientation: "undetermined",
            entityAId: sortedIds[0],
            entityBId: sortedIds[1],
            discoveryKind: "conflicting biography contexts",
          };
    const endpointSlugs = [
      entitiesById.get(selected.entityAId)?.slug,
      entitiesById.get(selected.entityBId)?.slug,
    ];
    if (endpointSlugs.some((slug) => !slug)) continue;
    const slug = `wikipedia-${endpointSlugs.join("--")}`;
    const citations = [
      ...new Set(
        pairCandidates.map(
          (candidate) => `source:wikipedia-biography-${candidate.subjectSlug}`,
        ),
      ),
    ].sort();
    const contexts = [
      ...new Set(
        pairCandidates.map(
          (candidate) =>
            `${candidate.subjectSlug}@${candidate.revid}:${candidate.paragraphNumber}`,
        ),
      ),
    ].sort();
    relationships.push({
      id: `relationship:${slug}`,
      slug,
      entityAId: selected.entityAId,
      entityBId: selected.entityBId,
      relationshipType: selected.relationshipType,
      orientation: selected.orientation,
      evidenceCategory: "contextual_or_inferential",
      explanation: explanationFor(selected, entitiesById),
      citationIds: citations,
      reviewStatus: "provisional",
      disputeStatus: "none",
      curatorNote: `Automatically discovered from explicit linked mentions in Wikipedia biography text (${contexts.join(", ")}). Verify the cited page context and an independent source before review.`,
    });
  }
  return relationships.sort((left, right) =>
    left.slug.localeCompare(right.slug),
  );
}

const entityFiles = await loadJsonDirectory("src/data/entities");
const sourceFiles = await loadJsonDirectory("src/data/sources");
const relationshipFiles = await loadJsonDirectory("src/data/relationships");
const artists = entityFiles
  .map(({ record }) => record)
  .filter((entity) => entity.entityType === "artist")
  .sort((left, right) => left.slug.localeCompare(right.slug));
const sourcesById = new Map(
  sourceFiles.map(({ record }) => [record.id, record]),
);
const entitiesById = new Map(
  entityFiles.map(({ record }) => [record.id, record]),
);
const existingPairKeys = new Set(
  relationshipFiles.map(({ record }) =>
    relationPairKey(record.entityAId, record.entityBId),
  ),
);
const rosterPage = await fetchArticleHtml(
  "https://en.wikipedia.org/wiki/List_of_blues_musicians",
);
const rosterTitles = linkedTitlesFromHtml(rosterPage.html);

console.error(`Fetching ${artists.length} artist biographies from Wikipedia`);
const fetchedPages = await mapConcurrent(artists, 4, async (entity, index) => {
  if (index % 25 === 0) {
    console.error(`Fetched ${index}/${artists.length} artist biographies`);
  }
  return fetchBiographyPage(
    entity,
    pageTitleForEntity(entity, sourcesById, rosterTitles),
  );
});
const pages = fetchedPages.filter((page) => !page.error);
const failures = fetchedPages
  .filter((page) => page.error)
  .map((page) => ({
    slug: page.entity.slug,
    name: page.entity.name,
    requestedTitle: page.requestedTitle,
    error: page.error,
  }));

const titleToEntity = new Map();
for (const entity of artists) {
  for (const title of [
    entity.name,
    pageTitleForEntity(entity, sourcesById, rosterTitles),
    ...(entity.aliases ?? []),
  ]) {
    titleToEntity.set(normalize(title), entity);
  }
}
for (const page of pages) {
  for (const title of [page.title, page.requestedTitle, page.entity.name]) {
    titleToEntity.set(normalize(title), page.entity);
  }
}

const rawCandidates = [];
const unresolvedMentions = new Map();
const pagesWithCandidates = new Set();
for (const page of pages) {
  const paragraphs = extractBiographyParagraphs(page.html);
  paragraphs.forEach((paragraph, paragraphIndex) => {
    for (const segment of sentenceSegmenter.segment(paragraph)) {
      const sentence = segment.segment;
      for (const marker of markersFromSentence(sentence)) {
        const target = titleToEntity.get(normalize(marker.title));
        if (!target) {
          const key = marker.title;
          const unresolved = unresolvedMentions.get(key) ?? {
            title: marker.title,
            count: 0,
            mentionedBy: [],
          };
          unresolved.count += 1;
          if (!unresolved.mentionedBy.includes(page.entity.slug)) {
            unresolved.mentionedBy.push(page.entity.slug);
          }
          unresolvedMentions.set(key, unresolved);
          continue;
        }
        if (target.id === page.entity.id) continue;
        const classification = classifyMention(
          page.entity,
          target,
          sentence,
          marker,
        );
        rawCandidates.push({
          ...classification,
          subjectSlug: page.entity.slug,
          targetSlug: target.slug,
          revid: page.revid,
          paragraphNumber: paragraphIndex + 1,
        });
        pagesWithCandidates.add(page.entity.slug);
      }
    }
  });
}

const relationships = mergeCandidates(
  rawCandidates,
  entitiesById,
  existingPairKeys,
);
const citedSubjectSlugs = new Set(
  relationships.flatMap((relationship) =>
    relationship.citationIds.map((citationId) =>
      citationId.replace("source:wikipedia-biography-", ""),
    ),
  ),
);
const sources = pages
  .filter((page) => citedSubjectSlugs.has(page.entity.slug))
  .map((page) => ({
    id: `source:wikipedia-biography-${page.entity.slug}`,
    sourceType: "reputable_reference",
    title: `Wikipedia biography: ${page.entity.name}`,
    publisher: "Wikipedia",
    url: page.pageUrl,
    accessDate,
    locator: `Revision ${page.revid}; biography paragraphs`,
    note: "Used to document explicit artist-to-artist mentions for provisional relationship discovery. This source alone does not make a relationship reviewed.",
  }))
  .sort((left, right) => left.id.localeCompare(right.id));
const unresolved = [...unresolvedMentions.values()]
  .sort(
    (left, right) =>
      right.count - left.count || left.title.localeCompare(right.title),
  )
  .slice(0, 2_000);

await writeFile(
  outputPath,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      accessDate,
      artistsRequested: artists.length,
      pagesFetched: pages.length,
      failures,
      pagesWithCandidates: pagesWithCandidates.size,
      rawCandidateMentions: rawCandidates.length,
      relationships,
      sources,
      unresolved,
    },
    null,
    2,
  )}\n`,
);

console.log(
  JSON.stringify({
    outputPath,
    artistsRequested: artists.length,
    pagesFetched: pages.length,
    failures: failures.length,
    pagesWithCandidates: pagesWithCandidates.size,
    rawCandidateMentions: rawCandidates.length,
    relationships: relationships.length,
    sources: sources.length,
    unresolved: unresolved.length,
  }),
);
