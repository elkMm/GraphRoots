# Initial Import Notes

## Internal Provenance

The source artifact used for the initial development import was removed from the repository and public outputs in release 0.4.1. Canonical records retain internal import metadata only for editorial traceability.

- Imported entities: 49
- Imported links: 78

## Entity Migration

Initial records were classified only where their own identity made the class explicit: six traditions, seven ensembles, and 36 artists. Their summaries and classifications carry `needs_revision` until independent review.

Initial grouping values are stored only as internal import metadata. They are exposed in the explorer as **Network grouping**, not treated as a canonical field that merges chronology, geography, style, and technology.

## Relationship Migration

The initial development graph represented every link as generic directed influence. Each original note remains internal import metadata, but the canonical endpoints are neutral and the unresolved orientation is not treated as historical direction.

The default migrated record uses:

- relationship type `provisional_unspecified`;
- orientation `undetermined`;
- evidence category `interpretive_or_debated` as a conservative placeholder;
- review status `provisional`;
- no citations;
- exclusion from all public outputs.

Four migrated relationships have completed evidence review:

1. Son House → Muddy Waters: `mentored`, `directly_documented`, reviewed, cited to the Library of Congress.
2. Eric Clapton → The Yardbirds: `member_of`, `directly_documented`, reviewed, cited to Eric Clapton's official biography.
3. Kora & Ngoni String Traditions ↔ Field Hollers: `historical_parallel`, `interpretive_or_debated`, reviewed and contested, cited to a Smithsonian Folkways resource that supports only the broad connection. The record states that the specific timbral mechanism is not established by that source.
4. Skip James → Cream: `covered_work_by`, `contextual_or_inferential`, reviewed, cited to the Mississippi Encyclopedia. Covered-work arrows run from the originator to the covering artist.

The other 74 initial claims remain provisional, unpublished relationship records pending independent evidence review.
