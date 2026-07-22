# GraphRoots

[![Verify and deploy GitHub Pages](https://github.com/elkMm/GraphRoots/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/elkMm/GraphRoots/actions/workflows/deploy-pages.yml)

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
