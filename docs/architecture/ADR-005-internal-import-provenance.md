# ADR-005: Keep Import Provenance Internal

- Status: accepted
- Date: 2026-07-22

## Context

The original source HTML and its one-time extractor were development artifacts. Displaying that import history on entity pages or in public downloads distracts from the published records and exposes an implementation detail that is not a historical source.

## Decision

- Remove the source HTML and obsolete extraction command from the repository.
- Keep review status, evidence level, and provisional-path safeguards unchanged.
- Strip import metadata, internal curator notes, and the internal provenance source from public pages and generated corpus exports.
- Convert the internal grouping field to neutral `networkGroup` metadata in the compact graph payload.
- Retain internal import metadata in canonical editorial records until each record completes independent source review.

## Consequences

Visitors see the record, its review state, and its historical sources without a development-history disclaimer. Editors retain enough internal provenance to continue systematic review, while no development artifact is distributed with the public application.
