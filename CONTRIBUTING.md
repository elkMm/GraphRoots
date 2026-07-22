# Contributing to GraphRoots

GraphRoots treats each public relationship as a reviewable historical claim.

## Data Rules

1. Do not add or upgrade a claim without a source that directly supports the wording.
2. Preserve uncertainty; use `interpretive_or_debated` and `disputed` when appropriate.
3. Keep relationship direction consistent with `src/domain/relationships.ts`.
4. Use stable IDs and URL-safe slugs. Do not use display names as primary identifiers.
5. Keep draft records out of public output until citations and semantic review are complete.
6. Do not add media without rights, attribution, and license fields.

## Workflow

1. Edit records under `src/data/`.
2. Increment `src/data/corpus.json` and update `CORPUS_CHANGELOG.md` for corpus changes.
3. Run `pnpm run validate:corpus`.
4. Run the complete quality command set documented in `README.md`.
5. Update architectural documentation when a decision changes system boundaries.

Edit canonical records directly under `src/data/` and run the full quality commands before opening a change.
