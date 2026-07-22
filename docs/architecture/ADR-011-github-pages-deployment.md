# ADR-011: Deploy the static application through GitHub Pages

- Status: accepted
- Date: 2026-07-22

## Context

GraphRoots is a static Astro application intended for public review. GitHub Pages provides a suitable first hosting target, but project sites are mounted below a repository-name path. The existing root-relative application links, graph data requests, canonical URLs, sitemap, and robots metadata would therefore break or point to the host root when deployed as `elkaioum/GraphRoots`.

## Decision

- Keep Astro's static output and deploy the generated `dist/` artifact through GitHub Actions.
- Derive the production origin and base path from GitHub repository metadata while allowing explicit `SITE_URL` and `PUBLIC_BASE_PATH` overrides.
- Apply the deployment base at the presentation boundary rather than changing canonical corpus route values.
- Run source, corpus, browser, build, and built-artifact validation before deployment.
- Generate sitemap and robots metadata from the same deployment configuration used by page metadata and internal links.
- Include a static 404 page and `.nojekyll` marker in the deployment artifact.

## Consequences

The same repository can run at `/` during local development, at `/GraphRoots/` as a GitHub project site, under a renamed fork, or at a custom domain without editing application routes. Corpus records remain host-independent. Deployment stays static and does not introduce a database, generalized server rendering, authentication, CMS, or graph database.
