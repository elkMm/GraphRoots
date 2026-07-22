# ADR-004: Provisional Relationship Visibility in the Graph

- Status: superseded by ADR-007
- Date: 2026-07-22

## Context

The initial development graph contributed 78 directional pathways, but only three relationships initially had publishable review states and citations. Limiting the visualization to those records made the graph sparse and obscured its directional interaction model. Unreviewed pathways still need editorial review and must not be presented as verified historical claims.

## Decision

- Include draft relationships in the generated graph payload when both endpoint entities are publishable.
- Render draft relationships as dashed, muted provisional pathways with visible arrowheads and editorial-review language.
- Do not generate permanent relationship routes for draft records or include them in public JSON and CSV corpus exports.
- Do not change relationship types, evidence levels, citations, or review states merely to increase graph density.
- Keep reviewed and disputed relationships visually distinct and linked to their permanent evidence records.

## Consequences

The homepage and explorer can present the full initial 49-node, 78-pathway network without converting uncertain records into published historical assertions. The graph payload is a presentation index rather than a public evidence export, so consumers needing reviewed records must use the public corpus downloads or permanent relationship routes.

ADR-007 replaced arbitrary provisional arrows with undetermined orientation. ADR-008 later restored default provisional visibility while retaining arrowless styling and a reviewed-only control.
