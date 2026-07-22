# GraphRoots

[![Verify and deploy GitHub Pages](https://github.com/elkaioum/GraphRoots/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/elkaioum/GraphRoots/actions/workflows/deploy-pages.yml)

GraphRoots begins with **Blues / Roots & Branches**, a curated and evolving public network of relationships among artists, ensembles, and traditions. Its architecture can support other musical domains later without diluting the Blues-first launch.

GraphRoots is an independent public research and visualization project. Optional individual creator credit is configured with `PUBLIC_CREATOR_CREDIT`; it is not hardcoded into the application.

Public project links are centralized in `src/config/project.ts`. `PUBLIC_REPOSITORY_URL` can override the repository destination, and `PUBLIC_CORRECTIONS_URL` can override the default repository issue-template URL.

This repository contains a working Blues-first vertical slice: a static Astro platform, a validated local corpus, stable entity and relationship routes, public exports, a homepage network preview, header search, checked artist videos, and an isolated Svelte/D3 graph explorer.

## Requirements

- Node.js 22 or newer
- pnpm 11

## Development

```sh
pnpm install
pnpm run dev
```

## Quality Commands

```sh
pnpm run format:check
pnpm run lint
pnpm run check
pnpm run validate:corpus
pnpm run test
pnpm run test:e2e
pnpm run build
```

`pnpm run build` validates the corpus, regenerates the compact graph and public exports, and creates a static production build.

`pnpm run verify` runs formatting checks, linting, type checks, corpus validation, and unit tests as one command.

## GitHub Pages

The repository includes `.github/workflows/deploy-pages.yml`. Pull requests run the complete verification, browser-test, and production-build gate. Pushes to `main` run the same gate and deploy `dist/` to GitHub Pages.

For the `elkaioum/GraphRoots` repository, the default production URL is:

<https://elkaioum.github.io/GraphRoots/>

The Astro `site` and `base` settings are derived from GitHub Actions metadata, so forks and repository renames receive the appropriate project path automatically. Root-relative application links, metadata, graph data requests, sitemap entries, robots metadata, and the 404 page all honor that base path.

To publish:

1. Push the repository to GitHub with `main` as the default branch.
2. Open **Settings → Pages** and choose **GitHub Actions** as the source.
3. Run **Verify and deploy GitHub Pages**, or push to `main`.

See `docs/deployment.md` for local simulation, custom-domain variables, and troubleshooting.

## Architecture

- **Astro static output** owns layouts, metadata, content pages, and permanent routes.
- **Svelte + D3** is loaded only for the homepage network and `/blues/explore` graph interaction.
- **TypeScript + Zod** define canonical records independently from UI components.
- **Local JSON files** under `src/data/` are the canonical corpus for this phase.
- **Build scripts** validate references and generate public JSON/CSV artifacts under `public/data/generated/`.
- **Relationship type, orientation, evidence category, review status, and dispute status** are independent canonical fields.
- **Provisional relationships** remain excluded from permanent routes and public exports, but their dashed pathways are visible in the default exploratory graph and can be hidden with the reviewed-only control. Typed directed paths retain arrows; untyped paths remain arrowless.
- **Entity pages** show reviewed and provisional graph connections together with explicit status labels; provisional records link to their other entity rather than receiving permanent claim routes.
- **The complete graph may contain cycles**; a conservative transmission DAG is derived only from reviewed, directed, temporally ordered transmission claims.

See `docs/architecture/ADR-001-static-local-corpus.md`, `docs/architecture/ADR-005-internal-import-provenance.md`, `docs/architecture/ADR-006-audited-encyclopedia-expansion.md`, `docs/architecture/ADR-007-independent-relationship-dimensions.md`, `docs/architecture/ADR-008-exploratory-graph-default.md`, `docs/architecture/ADR-009-biography-mention-provisional-layer.md`, `docs/architecture/ADR-010-exploratory-entity-pages.md`, and `docs/architecture/ADR-011-github-pages-deployment.md` for rationale and limitations.

## Current Corpus

- 296 entities, including 282 Blues artists
- 1,196 relationships: 43 reviewed and 1,153 provisional
- 43 cited public relationships
- 1,153 provisional relationships visible as dashed exploratory pathways and removable with a reviewed-only control
- 209 newly imported artist profiles from an audited 420-candidate encyclopedia roster
- 282 artist records, each with a YouTube video checked for public embed availability on 2026-07-22
- 519 canonical source records, including revision-specific biography citation records
- Blues corpus version `0.7.1`
- Application version `0.6.0`

## Project Status

- Phase 0: Astro foundation and quality tooling — complete
- Phase 1: extraction, schemas, and corpus validation — complete
- Phase 2: static platform shell and stable routes — complete for the vertical slice
- Phase 3: accessible graph explorer — working vertical slice
- Phase 4: evidence pages — complete for 43 cited public relationships
- Phase 5: GitHub quality gate and static Pages deployment — complete

No database, authentication, CMS, graph database, or generalized server rendering is used.

## License

GraphRoots software and associated documentation are available under the MIT License. Copyright © 2026 Elkaïoum M. Moutuou. Third-party media and source materials retain their own rights and terms.
