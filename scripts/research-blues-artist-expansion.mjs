// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* global process */
import { execFile } from "node:child_process";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { promisify } from "node:util";

const run = promisify(execFile);
const accessDate = "2026-07-22";
const targetCount = Number(process.argv[2] ?? 209);
const outputPath = process.argv[3] ?? "/tmp/graphroots-blues-expansion.json";
const youtubeExecutable = process.env.YT_DLP ?? "yt-dlp";
const apiHeaders = {
  "User-Agent": "GraphRoots/0.5 corpus research (local editorial import)",
};
const excludedCandidates = new Set(
  [
    "Baby Tate",
    "Dan Sane",
    "Ed Bell",
    "Guitar Slim",
    "Jimmy Rogers",
    "Johnny Williams",
    "L.V. Banks",
    "Lovie Lee",
    "Miller Freeman",
    "Odie Payne",
    "Sam Taylor",
  ].map(normalize),
);
let earliestRequestTime = 0;

function chunks(values, size) {
  const result = [];
  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size));
  }
  return result;
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalize(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function titleCase(value) {
  return value.replace(/(^|[\s/-])\p{L}/gu, (letter) => letter.toUpperCase());
}

function joinWords(values) {
  if (values.length <= 1) return values[0] ?? "musician";
  return `${values.slice(0, -1).join(", ")} and ${values.at(-1)}`;
}

function stableScore(value) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

async function fetchJson(url, attempts = 4) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const delay = Math.max(0, earliestRequestTime - Date.now());
      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
      earliestRequestTime = Date.now() + 750;
      const response = await fetch(url, { headers: apiHeaders });
      if (!response.ok) {
        const retryAfter = Number(response.headers.get("retry-after"));
        if (response.status === 429 && Number.isFinite(retryAfter)) {
          earliestRequestTime = Date.now() + retryAfter * 1_000;
        }
        throw new Error(`${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 2_000 * 2 ** attempt));
    }
  }
  throw lastError;
}

async function existingArtists() {
  const directory = "src/data/entities";
  const files = (await readdir(directory)).filter((file) =>
    file.endsWith(".json"),
  );
  const entities = await Promise.all(
    files.map(async (file) =>
      JSON.parse(await readFile(`${directory}/${file}`, "utf8")),
    ),
  );
  return {
    names: new Set(entities.map((entity) => normalize(entity.name))),
    slugs: new Set(entities.map((entity) => entity.slug)),
  };
}

async function wikipediaPages() {
  const parseUrl = new URL("https://en.wikipedia.org/w/api.php");
  parseUrl.search = new URLSearchParams({
    action: "parse",
    page: "List of blues musicians",
    prop: "links",
    format: "json",
    formatversion: "2",
  });
  const parsed = await fetchJson(parseUrl);
  const titles = parsed.parse.links
    .filter((link) => link.ns === 0 && !link.missing)
    .map((link) => link.title);
  const pages = [];
  for (const titleBatch of chunks(titles, 50)) {
    const queryUrl = new URL("https://en.wikipedia.org/w/api.php");
    queryUrl.search = new URLSearchParams({
      action: "query",
      prop: "pageprops|info",
      ppprop: "wikibase_item",
      inprop: "url",
      redirects: "1",
      titles: titleBatch.join("|"),
      format: "json",
      formatversion: "2",
    });
    const queried = await fetchJson(queryUrl);
    pages.push(
      ...queried.query.pages.filter(
        (page) =>
          !page.missing && page.pageprops?.wikibase_item && page.fullurl,
      ),
    );
  }
  return pages;
}

async function wikidataEntities(ids) {
  const entities = {};
  for (const idBatch of chunks(ids, 50)) {
    const url = new URL("https://www.wikidata.org/w/api.php");
    url.search = new URLSearchParams({
      action: "wbgetentities",
      ids: idBatch.join("|"),
      props: "labels|descriptions|claims|aliases",
      languages: "en",
      format: "json",
    });
    const result = await fetchJson(url);
    Object.assign(entities, result.entities);
  }
  return entities;
}

function claimEntityIds(entity, property) {
  return (entity.claims?.[property] ?? [])
    .map((claim) => claim.mainsnak?.datavalue?.value?.id)
    .filter(Boolean);
}

function claimYear(entity, property) {
  const time = (entity.claims?.[property] ?? [])
    .map((claim) => claim.mainsnak?.datavalue?.value?.time)
    .find(Boolean);
  const match =
    typeof time === "string" ? time.match(/^[-+](\d{4,})-/) : undefined;
  return match ? Number(match[1]) : undefined;
}

function relevantRoles(labels) {
  const rolePattern =
    /(singer|musician|guitarist|pianist|songwriter|harmonica|composer|bandleader|drummer|bassist|vocalist|instrumentalist)/i;
  const roles = [...new Set(labels.filter((label) => rolePattern.test(label)))];
  return (roles.length > 0 ? roles : ["musician"]).slice(0, 4).map(titleCase);
}

function stylesFrom(labels) {
  const styles = labels.filter((label) => /blues/i.test(label)).map(titleCase);
  return [...new Set(["Blues", ...styles])].slice(0, 5);
}

function videoMatchScore(name, value) {
  const tokens = normalize(name)
    .split(" ")
    .filter((token) => token.length > 1 && token !== "the");
  if (tokens.length === 0) return 0;
  const haystack = normalize(value);
  return (
    tokens.filter((token) => haystack.includes(token)).length / tokens.length
  );
}

async function verifyVideo(videoId) {
  try {
    const { stdout } = await run(
      youtubeExecutable,
      [
        "--skip-download",
        "--ignore-no-formats-error",
        "--no-warnings",
        "--dump-single-json",
        `https://www.youtube.com/watch?v=${videoId}`,
      ],
      { maxBuffer: 8_000_000, timeout: 90_000 },
    );
    const video = JSON.parse(stdout);
    if (video.availability !== "public" || video.playable_in_embed !== true)
      return undefined;
    return {
      platform: "youtube",
      videoId: video.id,
      title: video.title,
      sourceUrl: `https://www.youtube.com/watch?v=${video.id}`,
      lastChecked: accessDate,
    };
  } catch {
    return undefined;
  }
}

async function findVideo(name) {
  try {
    const { stdout } = await run(
      youtubeExecutable,
      [
        "--flat-playlist",
        "--playlist-end",
        "5",
        "--no-warnings",
        "--dump-single-json",
        `ytsearch5:${name} blues official audio`,
      ],
      { maxBuffer: 8_000_000, timeout: 90_000 },
    );
    const search = JSON.parse(stdout);
    const entries = (search.entries ?? [])
      .map((entry) => ({
        ...entry,
        matchScore: Math.max(
          videoMatchScore(name, entry.channel ?? entry.uploader ?? ""),
          videoMatchScore(name, entry.title ?? ""),
        ),
      }))
      .filter((entry) => entry.id && entry.matchScore >= 0.67)
      .sort((left, right) => right.matchScore - left.matchScore);
    for (const entry of entries.slice(0, 3)) {
      const verified = await verifyVideo(entry.id);
      if (verified) return verified;
    }
  } catch {
    return undefined;
  }
  return undefined;
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

const existing = await existingArtists();
const pages = await wikipediaPages();
const wikiEntities = await wikidataEntities([
  ...new Set(pages.map((page) => page.pageprops.wikibase_item)),
]);
const humanPages = pages.filter((page) =>
  claimEntityIds(wikiEntities[page.pageprops.wikibase_item], "P31").includes(
    "Q5",
  ),
);
const referencedIds = new Set();
for (const page of humanPages) {
  const entity = wikiEntities[page.pageprops.wikibase_item];
  for (const property of ["P27", "P106", "P1303", "P136"]) {
    for (const id of claimEntityIds(entity, property)) referencedIds.add(id);
  }
}
const referenceEntities = await wikidataEntities([...referencedIds]);
const labelFor = (id) => referenceEntities[id]?.labels?.en?.value;
const candidates = humanPages
  .map((page) => {
    const wikidataId = page.pageprops.wikibase_item;
    const item = wikiEntities[wikidataId];
    const name = item.labels?.en?.value ?? page.title;
    const slug = slugify(name);
    const birthYear = claimYear(item, "P569");
    const deathYear = claimYear(item, "P570");
    const countries = claimEntityIds(item, "P27").map(labelFor).filter(Boolean);
    const occupations = claimEntityIds(item, "P106")
      .map(labelFor)
      .filter(Boolean);
    const instruments = claimEntityIds(item, "P1303")
      .map(labelFor)
      .filter(Boolean);
    const genres = claimEntityIds(item, "P136").map(labelFor).filter(Boolean);
    const roles = relevantRoles(occupations);
    const roleSummary = joinWords(
      roles
        .slice(0, 3)
        .map((role) => role.toLowerCase().replace(/^blues\s+/, "")),
    );
    const regionSummary = countries[0]
      ? ` associated with ${countries[0]}`
      : "";
    const summary = `${name} ${deathYear ? "was" : "is"} a blues ${roleSummary}${regionSummary}, documented in the audited English-language encyclopedia roster.`;
    return {
      wikidataId,
      pageUrl: page.fullurl,
      name,
      slug,
      birthYear,
      deathYear,
      countries: [...new Set(countries)].slice(0, 4),
      roles,
      instruments: [...new Set(instruments.map(titleCase))].slice(0, 6),
      styles: stylesFrom(genres),
      summary,
    };
  })
  .filter(
    (candidate) =>
      candidate.slug &&
      !excludedCandidates.has(normalize(candidate.name)) &&
      !existing.slugs.has(candidate.slug) &&
      !existing.names.has(normalize(candidate.name)),
  )
  .sort((left, right) => stableScore(left.name) - stableScore(right.name));

const selected = [];
for (const candidateBatch of chunks(candidates, 24)) {
  console.error(
    `Checking videos for ${selected.length}/${targetCount} selected artists`,
  );
  const checked = await mapConcurrent(candidateBatch, 6, async (candidate) => ({
    candidate,
    featuredVideo: await findVideo(candidate.name),
  }));
  selected.push(...checked.filter((result) => result.featuredVideo));
  if (selected.length >= targetCount) break;
}

if (selected.length < targetCount) {
  throw new Error(
    `Only ${selected.length} candidates passed video verification; needed ${targetCount}`,
  );
}

const records = selected
  .slice(0, targetCount)
  .map(({ candidate, featuredVideo }) => {
    const sourceId = `source:encyclopedia-${candidate.slug}`;
    const dateDisplay = candidate.birthYear
      ? `${candidate.birthYear} – ${candidate.deathYear ?? ""}`.trim()
      : undefined;
    return {
      entity: {
        id: `entity:${candidate.slug}`,
        slug: candidate.slug,
        name: candidate.name,
        entityType: "artist",
        summary: candidate.summary,
        ...(candidate.birthYear ? { activeStart: candidate.birthYear } : {}),
        ...(candidate.deathYear ? { activeEnd: candidate.deathYear } : {}),
        ...(dateDisplay ? { dateDisplay } : {}),
        regions: candidate.countries,
        styles: candidate.styles,
        roles: candidate.roles,
        ...(candidate.instruments.length > 0
          ? { instruments: candidate.instruments }
          : {}),
        sourceIds: [sourceId],
        featuredVideo,
        reviewStatus: "needs_revision",
      },
      source: {
        id: sourceId,
        sourceType: "reputable_reference",
        title: candidate.name,
        publisher: "Wikipedia and Wikidata",
        url: candidate.pageUrl,
        accessDate,
        note: `Basic identity and structured profile fields were cross-checked against Wikidata ${candidate.wikidataId}. This source does not establish graph relationships.`,
      },
    };
  });

await writeFile(
  outputPath,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      accessDate,
      discoveryUrl: "https://en.wikipedia.org/wiki/List_of_blues_musicians",
      candidatesEvaluated: candidates.length,
      records,
    },
    null,
    2,
  )}\n`,
);

console.log(
  JSON.stringify({
    outputPath,
    candidatesEvaluated: candidates.length,
    imported: records.length,
    first: records.slice(0, 5).map((record) => record.entity.name),
  }),
);
