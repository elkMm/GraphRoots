# ADR-002: Independent Identity and Prototype Visual Parity

- Status: accepted; artifact-retention details superseded by ADR-005
- Date: 2026-07-22

## Context

GraphRoots is an independent public research and visualization project. The preserved single-file prototype remains the visual and interaction reference, while the Astro application remains the production architecture.

Public identity and optional individual creator credit must not be duplicated across pages. The graph must preserve the prototype's typography, palette, era colors, directional arrows, force layout character, hover highlighting, and overlay panel without coupling canonical corpus records to presentation concerns.

## Decision

- Keep public project identity in `src/config/project.ts`.
- Read optional creator credit from `PUBLIC_CREATOR_CREDIT`.
- Preserve the prototype's visual tokens in the shared stylesheet and graph component.
- Keep prototype grouping colors as presentation metadata, not canonical historical classifications.
- Continue using static Astro pages with one Svelte/D3 explorer island.

## Consequences

Visual parity can evolve independently from corpus semantics. Identity changes have one configuration point, and no database, CMS, authentication system, graph database, or generalized server rendering is introduced.
