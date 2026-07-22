# ADR-008: Show the Exploratory Graph by Default

- Status: accepted
- Date: 2026-07-22

## Context

The reviewed-only graph contains 43 relationships across 291 entities. Although this is the correct publication boundary, using it as the initial visualization makes the network appear nearly empty and hides 74 existing provisional pathways that are useful for exploration when their uncertainty is explicit.

## Decision

- Display reviewed and provisional relationships in the homepage and explorer by default.
- Keep provisional relationships dashed, muted, labeled as under review, and excluded from permanent relationship routes.
- Render no arrowhead when a provisional relationship has undetermined orientation.
- Provide a prominent `Show reviewed only` control that removes provisional pathways without removing entities.
- Keep public relationship exports, citation requirements, review workflow, and the derived transmission DAG restricted to eligible reviewed records.
- Add no inferred or unsourced relationships merely to increase graph density.

## Consequences

The default graph displays all 117 existing pathways, including 30 reviewed directional arrows, 13 reviewed symmetric links, and 74 provisional arrowless pathways. Visitors can explore a fuller network without mistaking provisional paths for reviewed historical claims, and researchers can still obtain the strict 43-relationship public dataset or reviewed-only graph view.
