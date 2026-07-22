import type { APIRoute } from "astro";
import { withBase } from "../domain/base-path";

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL("https://graphroots.example");
  const sitemapUrl = new URL(withBase("/sitemap.xml"), origin);

  return new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl.href}\n`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
};
