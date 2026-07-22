# Wikipedia biography connection crawl — 2026-07-22

## Scope

The crawl requested the English Wikipedia biography associated with each of 280 GraphRoots artist records. It fetched 279 pages; D.K. Harrell had no page at the requested title.

The crawler examined linked artist names in biography paragraphs and matched them only to existing artist entities. It found 1,628 raw mentions and consolidated them into 1,064 new entity pairs after excluding existing pairs and duplicate mentions.

## Imported records

- 1,064 provisional relationships
- 250 revision-specific biography source records
- 983 untyped co-mentions with undetermined orientation
- 42 provisional `performed_with` relationships
- 28 provisional `recorded_with` relationships
- 10 provisional `influenced_style` relationships
- 1 provisional `learned_from` relationship

The resulting corpus contains 294 entities, including 280 artists, and 1,181 relationships. The reviewed public dataset remains unchanged at 43 relationships. Artist records with zero connections fell from 209 to 17.

## Named follow-up

Willie “Big Eyes” Smith, Johnny Williams, and Jack Owens were added as artist entities with individual Wikipedia profile sources and public YouTube embeds checked on 2026-07-22. The corrected crawl now captures Arthur “Big Boy” Spires' article links to Lightnin' Hopkins, Willie “Big Eyes” Smith, Johnny Williams, and Tommy Johnson.

## Safeguards

- Every imported relationship is provisional and uses `contextual_or_inferential` evidence.
- Every citation stores a page URL, access date, exact revision, and biography-paragraph locator.
- Navigation, references, tables, categories, and list-page co-membership are excluded.
- Existing entity pairs are skipped rather than duplicated.
- Narrow lexical rules assign types only for explicit recording, performance, influence, or learning wording.
- All other linked mentions remain arrowless and untyped.
- Reviewed exports, stable relationship routes, and the transmission DAG exclude the imported records.

An article link can be indirect, incidental, comparative, or mediated through another person. It is therefore a discovery lead rather than a verified claim of influence. Editorial review must inspect the pinned paragraph and seek appropriate corroboration before publication.

## Reproduction

Run `pnpm research:wikipedia-connections -- /tmp/graphroots-wikipedia-connections.json` from the repository root. The command requires network access and writes a manifest; it does not modify canonical corpus files directly.
