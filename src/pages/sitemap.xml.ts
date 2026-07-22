import type { APIRoute } from "astro";
import { loadCorpus } from "../domain/corpus/load-corpus";
import { getPublicCorpus } from "../domain/corpus/public-records";
import { withBase } from "../domain/base-path";
import { getEntityPath, getRelationshipPath } from "../domain/routes";

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const corpus = getPublicCorpus(await loadCorpus());
  const origin = site ?? new URL("https://graphroots.example");
  const staticPaths = [
    "/",
    "/about",
    "/blues",
    "/blues/explore",
    "/changelog",
    "/data",
    "/legal/license",
    "/methodology",
    "/sources",
  ];
  const paths = [
    ...staticPaths,
    ...corpus.entities.map(getEntityPath),
    ...corpus.relationships.map((relationship) =>
      getRelationshipPath(relationship.slug),
    ),
  ];
  const urls = paths
    .map(
      (path) =>
        `  <url><loc>${new URL(withBase(path), origin).href}</loc></url>`,
    )
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>\n`,
    {
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    },
  );
};
