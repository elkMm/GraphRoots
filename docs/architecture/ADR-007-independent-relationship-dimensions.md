# ADR-007: Separate Relationship Dimensions and Derive the Transmission DAG

- Status: accepted; graph visibility amended by ADR-008
- Date: 2026-07-22

## Context

The first corpus schema used directed `sourceId` and `targetId` fields for every relationship. It also mixed evidence basis, editorial workflow, and disagreement by using a shared review-status vocabulary and a separate optional disputed flag. That structure made symmetric collaboration appear causal, prevented a relationship from being both reviewed and contested, and risked treating the complete knowledge graph as a transmission DAG.

## Decision

- Store neutral `entityAId` and `entityBId` endpoints with an explicit orientation of `directed`, `symmetric`, or `undetermined`.
- Store relationship type, evidence category, editorial review status, and dispute status as independent fields.
- Reserve `provisional_unspecified` for draft or provisional records and prevent it from entering the reviewed dataset.
- Publish only reviewed relationships. Keep draft records internal, expose provisional records only through the graph presentation layer, and exclude withdrawn records from the active graph. ADR-008 governs whether that presentation layer is initially visible.
- Render arrowheads only for directed relationships. Render symmetric and undetermined relationships without arrows.
- Permit cycles in the complete corpus. Derive the transmission DAG from reviewed, directed transmission predicates whose endpoint activity starts establish a strict temporal order.
- Reverse the analytical transmission direction for predicates whose grammar points from receiver to antecedent, such as `learned_from` and `adapted_composition`.
- Conservatively migrate the former `strongly_attested` evidence label to `contextual_or_inferential`; do not relabel those records as historically corroborated without substantially independent support.

## Consequences

Public pages and exports can represent a reviewed-contested relationship without contradiction, collaboration no longer acquires an arbitrary arrow, and missing graph edges remain absence of a published claim rather than evidence of no historical connection. The compact graph payload still contains a separately styled provisional layer for the Svelte/D3 explorer, while public relationship exports contain only reviewed records. The derived transmission DAG is intentionally smaller than the complete GraphRoots graph and excludes records without sufficient structured chronology.
