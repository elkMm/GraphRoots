# ADR-010: Show exploratory connections on entity pages

- Status: accepted
- Date: 2026-07-22

## Context

The homepage and explorer display reviewed and provisional relationships together by default, but static entity pages previously received only the 43 reviewed relationships. Artists whose connections were all provisional, including Rory Block, therefore appeared to have no relationships even though their graph nodes had visible paths.

## Decision

- Display reviewed and provisional relationships on static entity pages.
- Sanitize both layers before rendering by removing internal migration metadata and curator notes.
- Label every connection with its relationship type, evidence category, and review status.
- Display provisional explanations so visitors can understand why an exploratory path appears.
- Link reviewed records to permanent relationship pages and provisional records to the connected entity.
- Keep provisional records excluded from permanent relationship routes, reviewed public exports, and the transmission DAG.

## Consequences

Entity pages now agree with the default exploratory graph and remain useful for artists whose current connections are provisional. The reviewed publication boundary remains unchanged, while provisional paths are visible without being presented as reviewed claims.
