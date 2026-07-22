# Wikipedia Blues Roster Audit

- Audit date: 2026-07-22
- Discovery page: <https://en.wikipedia.org/wiki/List_of_blues_musicians>
- Table entries observed: 462
- Corpus release: 0.5.0

## Scope

The Wikipedia list was audited as a discovery and Blues-classification index. It does not establish dates, biographies, relationships, or relationship direction.

GraphRoots does not infer an edge from co-listing, stylistic similarity, shared geography, or a general genre label. Each published relationship requires an independent source that directly supports the selected semantic type and direction.

## Expansion Batch

The expansion pipeline resolved list entries to Wikidata, retained only human entities with individual English Wikipedia profiles, deduplicated them against the canonical corpus, and evaluated 420 candidates. It imported 209 artists after excluding 11 ambiguous media or identity matches.

Every imported artist has an individual encyclopedia profile source and structured identity fields cross-checked against Wikidata. The concise profiles are marked `needs_revision`; no graph relationship was added or inferred from the roster.

## Video Check

Every artist currently in the canonical corpus has one YouTube selection whose public availability and embed permission were checked on 2026-07-22. Gare du Nord also has a checked selection. Video metadata is presentation material and does not serve as evidence for graph relationships.

See `docs/research/blues-artist-expansion-2026-07-22.md` for source-use and exclusion details.
