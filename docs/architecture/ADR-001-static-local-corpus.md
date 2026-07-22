# ADR-001: Static Astro Application with a Local Validated Corpus

- **Status:** Accepted
- **Date:** 2026-07-21

## Context

The prototype is a single HTML document containing a minified D3 bundle, untyped data, one generic relationship concept, and all interaction code. The first production foundation needs permanent routes, evidence-aware relationships, reproducible releases, and a maintainable graph without introducing collaboration infrastructure prematurely.

## Decision

Use Astro with static output for pages and build orchestration. Store the canonical Blues corpus as local JSON records validated by TypeScript and Zod. Load Svelte and D3 only for graph surfaces. Generate a compact presentation graph payload and separate public exports at build time.

Domain schemas, validation, graph transformations, route helpers, and public-record filtering remain independent from Astro and Svelte.

## Consequences

- Public pages work without a server runtime.
- Canonical records are reviewable in Git and invalid references fail validation.
- Draft records can be retained for editorial work and are excluded from permanent routes and public exports; ADR-004 defines their limited, labeled graph visibility.
- The explorer ships JavaScript only on its route and does not contain the full citation corpus.
- Curatorial edits require a rebuild in this phase.
- A future database must produce the same validated domain model rather than exposing table shapes to the frontend.

## Deferred

- PostgreSQL or another database
- Authentication and curator roles
- CMS and contribution workflows
- Generalized server rendering
- Graph database
- Runtime third-party corpus APIs
