# Application Changelog

All notable application changes are documented here. The application version is independent from the Blues corpus version.

## 0.6.0 — 2026-07-22

### Added

- Added a GitHub Actions workflow that verifies pull requests and deploys passing `main` builds to GitHub Pages.
- Added a GitHub Pages-compatible 404 page, `.nojekyll` marker, pull-request template, issue-template configuration, and repository package metadata.
- Added post-build validation for required artifacts and project-subpath URL leaks.

### Changed

- Made navigation, graph data, entity routes, downloads, canonical metadata, sitemap entries, robots metadata, and client-side graph links deployment-base aware.
- Replaced the fixed placeholder deployment origin with GitHub repository-derived `site` and `base` configuration plus explicit custom-domain overrides.

### Architecture

- Recorded project-site deployment and base-path handling in `docs/architecture/ADR-011-github-pages-deployment.md`.

## 0.5.2 — 2026-07-22

### Changed

- Moved each entity's featured song beside the profile at the top of the page.
- Placed the relationships section below the profile and featured media, with a stacked mobile layout.

## 0.5.1 — 2026-07-22

### Fixed

- Fixed sparse artist pages such as Rory Block by displaying the same reviewed and provisional connections available in the exploratory graph.

### Changed

- Added visible review status and relationship explanations to entity-page connection lists.
- Kept provisional records excluded from permanent relationship routes and public corpus exports; their entity-page links lead to the connected entity instead.

### Architecture

- Added ADR-010 to align static entity pages with the exploratory graph while retaining the reviewed publication boundary.

## 0.5.0 — 2026-07-22

### Added

- Added a reproducible English Wikipedia biography crawler that discovers explicit linked artist mentions in article paragraphs and records page revisions and paragraph locators.
- Added a bounded patch emitter for importing validated source and relationship records without coupling runtime behavior to third-party APIs.

### Changed

- Expanded the exploratory graph from 117 to 1,181 pathways while preserving the 43-record reviewed dataset, reviewed exports, permanent relationship routes, and transmission DAG.
- Preserved relationship-specific provisional explanations in the graph payload instead of replacing them with one generic message.
- Kept typed directed provisional relationships visibly arrowed, symmetric relationships undirected, and untyped provisional pathways arrowless.

### Architecture

- Added ADR-009 to define biography co-mentions as revision-pinned provisional discovery records rather than reviewed historical claims.

## 0.4.3 — 2026-07-22

### Added

- Added the MIT License under the copyright of Elkaïoum M. Moutuou and exposed it through a static `/legal/license` page.
- Added About to the primary navigation.

### Changed

- Added the copyright holder's legal name and year to the global footer.
- Clarified on the About page that third-party media and source materials retain their own rights and terms.

## 0.4.2 — 2026-07-22

### Changed

- Rewrote the About page around the project's independent identity, Blues-first scope, network model, corpus limitations, open development, and correction process.
- Replaced internal release language with the visitor-facing phrase “an early, curated release.”
- Added metadata-driven repository and correction URLs, including a concrete GitHub corpus-correction issue template.
- Made the About page's Methodology link respect Astro's configured base path.

## 0.4.1 — 2026-07-22

### Changed

- Made the exploratory homepage and full graph display all 117 existing pathways by default instead of limiting the initial view to 43 reviewed relationships.
- Kept all 74 provisional pathways dashed, muted, arrowless, and explicitly labeled as under review.
- Replaced the opt-in provisional control with a reviewed-only control so visitors can tighten the graph when desired.
- Left the 43-record reviewed public dataset, permanent relationship routes, citations, and transmission DAG unchanged.

### Architecture

- Added ADR-008 to separate exploratory graph visibility from publication and analytical eligibility.

## 0.4.0 — 2026-07-22

### Added

- Added a comprehensive methodology page covering qualification, source policy, disagreement, archival limits, missing edges, review workflow, and reproducible releases.
- Added a conservative transmission-DAG projection generated independently from the complete knowledge graph.
- Added regression coverage for reviewed-contested records, symmetric relationships, opt-in provisional paths, and cyclic full-corpus data.

### Changed

- Separated relationship type, orientation, evidence category, review status, and dispute status throughout canonical schemas, graph payloads, routes, and exports.
- Replaced directional source/target storage with neutral entity endpoints and removed arrowheads from symmetric and undetermined relationships.
- Hid provisional relationships by default behind an explicit graph-layer control while preserving all 291 nodes and 117 optional relationships.

### Architecture

- Added ADR-007 to establish independent relationship dimensions, reviewed-only public exports, and a derived temporally ordered transmission DAG.
- Superseded ADR-004's default provisional arrows without adding a database, server rendering, authentication, CMS, or graph database.

## 0.3.0 — 2026-07-22

### Added

- Added 209 statically generated artist pages and source records to search, sitemap, data exports, and the graph payload.
- Added a reproducible research script for human-only encyclopedia discovery, deduplication, structured profile extraction, and YouTube embed verification.

### Changed

- Expanded the homepage and explorer from 82 to 291 entities while retaining all 117 visible directional paths and arrow markers.
- Updated corpus statistics and regression coverage for the larger Blues-first dataset.

### Architecture

- Added ADR-006 to keep high-volume corpus expansion in validated local JSON with one canonical file per entity and source, without adding a database or server-rendering layer.

## 0.2.5 — 2026-07-22

### Changed

- Reversed every `covered_work_by` arrow so direction now runs from the original artist to the artist or ensemble covering the work.
- Updated relationship labels, direction descriptions, permanent routes, graph output, and regression coverage to use the same originator-to-covering-artist convention.

## 0.2.4 — 2026-07-22

### Changed

- Removed the development-only HTML artifact and its obsolete one-time extraction command.
- Removed the import disclaimer and internal provenance source from public entity pages.
- Renamed the graph's visitor-facing grouping metadata and removed development terminology from public page copy and compact graph output.

### Architecture

- Added ADR-005 to keep import provenance available only inside canonical editorial records, not public pages or downloads.

## 0.2.3 — 2026-07-22

### Changed

- Expanded the homepage and explorer network to 82 entities and 117 visible directional paths.
- Added a checked privacy-enhanced YouTube embed to every artist page and enabled the same presentation for Gare du Nord's ensemble page.
- Added route and embed regression coverage for John Mayer, Gare du Nord, Blind Willie Johnson, and the updated Christone “Kingfish” Ingram selection.

## 0.2.2 — 2026-07-22

### Changed

- Expanded the homepage and explorer network to render the Blues corpus 0.3.0 release with 79 entities and 114 visible paths.
- Replaced stale explorer copy with counts computed from the canonical corpus at build time.
- Added route and embed regression coverage for Christone “Kingfish” Ingram and a reviewed influence record.

## 0.2.1 — 2026-07-22

### Changed

- Restored all 49 migrated entities and 78 prototype pathways to the homepage network and full explorer.
- Added larger, high-contrast arrowheads and distinct reviewed, debated, focused, and provisional edge styling.
- Kept the 75 draft relationships out of permanent relationship routes and public downloads while marking them as provisional graph-only records awaiting editorial review.

### Architecture

- Added ADR-004 to define the graph-only visibility boundary for provisional migrated relationships.

## 0.2.0 — 2026-07-22

### Added

- Added a compact public Blues network to the homepage using only entities connected by publishable relationships.
- Added a persistent header search that routes artist queries into the explorer and focuses matching nodes.
- Added privacy-enhanced YouTube embeds to artist pages when a reviewed video record is available.

### Changed

- Reframed launch copy around Blues while preserving a path to future musical domains.
- Increased edge contrast and made directional arrowheads gold so network direction remains visible.
- Kept IBM Plex Mono as the typewriter-style font for search, graph labels, controls, and metadata.

## 0.1.1 — 2026-07-22

### Changed

- Established GraphRoots as an independent public research and visualization project with optional creator credit supplied through project metadata.
- Restored the prototype's Bebas Neue, Lora, and IBM Plex Mono typography and exact brown, ink, gold, and clay design tokens.
- Aligned graph grouping colors, arrows, force settings, hover highlighting, node sizing, and overlay detail panel with the preserved prototype.

### Architecture

- Centralized public identity metadata in `src/config/project.ts` rather than hardcoding ownership or creator attribution in pages.
- Retained Astro static output and the isolated Svelte/D3 explorer island.

## 0.1.0 — 2026-07-21

### Added

- Astro 7 static application with strict TypeScript.
- Svelte/D3 graph explorer island with search, filtering, zoom, drag, reset, selection, URL focus, and keyboard-operable nodes.
- Static homepage, Blues landing page, methodology, data, sources, about, entity, ensemble, tradition, and relationship routes.
- Accessible graph list alternative and selected-neighbourhood summary.
- Zod schemas, corpus validation, graph indexing, and public JSON/CSV exports.
- ESLint, Prettier, Vitest, Playwright, Astro checks, and production build scripts.

### Architecture

- Kept all public rendering static except the explorer island.
- Kept canonical corpus access independent from Astro and Svelte components.
- Deferred PostgreSQL, authentication, CMS, graph database, and server rendering.
