# ADR-003: Blues-First Discovery and Reviewed Artist Video

- Status: accepted; graph visibility decisions superseded by ADR-004
- Date: 2026-07-22

## Context

The initial public experience should lead with Blues and make the network immediately visible. Search must remain compatible with static output, and artist pages should support one playable song without turning media availability into a historical claim.

## Decision

- Show a compact homepage network containing only nodes connected by public relationships. This decision was superseded by ADR-004.
- Keep draft relationships out of the homepage and explorer payloads. This decision was superseded by ADR-004.
- Route the global header search to the client-side Blues explorer through a static query parameter.
- Use IBM Plex Mono for typewriter-style search and graph interface text while retaining the prototype's Bebas Neue and Lora roles.
- Store optional reviewed YouTube metadata on entity records and embed it through `youtube-nocookie.com`.
- Treat featured video metadata as presentation media, not citation evidence.

## Consequences

Search needs no server or database, and videos can be added incrementally after URL review without requiring every artist record to carry media. ADR-004 records the later decision to show provisional migrated pathways in the graph without publishing them as reviewed relationship records.
