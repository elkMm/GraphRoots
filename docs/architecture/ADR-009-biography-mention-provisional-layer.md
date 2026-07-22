# ADR-009: Biography mentions in the provisional layer

- Status: Accepted
- Date: 2026-07-22

## Context

The expanded artist roster contained 209 artists with no graph connection. The reviewed publication rules correctly prevent weak or semantically vague claims from entering public exports, but applying those same rules to exploratory discovery made the default network too sparse to navigate.

English Wikipedia biographies often contain linked artist mentions that expose collaboration, recording, repertoire, family, comparison, and scene contexts. These mentions are useful discovery leads, but a single encyclopedia page does not establish independent corroboration or a precise relationship type.

## Decision

An explicit linked mention in an artist biography paragraph may create a provisional exploratory pathway when both endpoints already exist in the GraphRoots corpus.

Each discovered pathway must:

- cite the biography page used for discovery;
- pin the page revision and paragraph locator;
- use `provisional` review status and `contextual_or_inferential` evidence;
- remain outside reviewed exports, permanent relationship routes, and the transmission DAG;
- use a controlled type only when narrow wording supports that type;
- otherwise use `provisional_unspecified` with `undetermined` orientation;
- explain that a co-mention is not itself a reviewed influence claim.

The crawler examines article paragraphs only. It does not infer relationships from navigation, reference lists, tables, categories, list-page membership, shared genres, or shared geography. Existing entity pairs are not duplicated.

## Consequences

The exploratory network becomes substantially more connected while the reviewed corpus remains unchanged. Typed provisional paths may carry semantic arrows; symmetric paths and untyped co-mentions do not.

The new records form an editorial research queue. Their presence indicates a revision-pinned biography context, not verified causation, historical importance, or publication readiness. Records may later be corroborated, reclassified, rewritten, or removed independently.
