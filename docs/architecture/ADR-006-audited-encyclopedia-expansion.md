# ADR-006: Keep Audited Encyclopedia Expansion in the Local Corpus

- Status: accepted
- Date: 2026-07-22

## Context

The Blues corpus needed to grow by hundreds of artists without weakening source traceability or introducing infrastructure that the current static phase does not require. Bulk list membership alone cannot establish relationships, and names shared by multiple performers create a material risk for automated video matching.

## Decision

- Keep one canonical JSON file per entity and source under `src/data/`.
- Use the Wikipedia blues-musician list for candidate discovery and Blues classification, then require a human Wikidata item and an individual English Wikipedia profile before import.
- Mark concise structured profiles as `needs_revision` so identity-validated records can receive richer editorial treatment incrementally.
- Require every imported artist to have a YouTube video checked as public and playable in an embed on the audit date.
- Exclude ambiguous identity or media matches rather than importing them provisionally.
- Attach institutional overview sources only when the retrieved page explicitly names the artist.
- Infer no graph relationship from co-listing, shared genre, shared geography, or source co-occurrence.

## Consequences

The static corpus grows to 291 entities and remains compatible with the existing Zod validation, generated exports, search, routes, and Svelte/D3 graph. The network has more discoverable artists without manufacturing unsupported edges. PostgreSQL, generalized server rendering, authentication, a CMS, and a graph database remain unnecessary for this phase.
