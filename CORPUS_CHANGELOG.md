# Blues Corpus Changelog

## 0.7.1 — 2026-07-22

### Added

- Added Ry Cooder and Rory Block with individual profile sources and public YouTube embeds checked for availability.
- Added 15 provisional relationships and two revision-specific biography citation records discovered after matching the new artists against the existing corpus.
- Added Cooder's recording connection with the Rolling Stones from his revision-pinned biography.

### Changed

- Expanded the corpus to 296 entities, 282 artists, 519 sources, and 1,196 relationships.
- Classified Robert Johnson → Rory Block and Tommy Johnson → Rory Block as provisional `covered_work_by` paths using the corpus-wide originator-to-covering-artist direction.
- Classified Rory Block's album connection with Taj Mahal as `recorded_with`, Ry Cooder's links with Eric Clapton as `performed_with` and the Rolling Stones as `recorded_with`, and Eric Clapton → Joe Bonamassa as provisional `influenced_style`.

### Review Notes

- Ry Cooder now has 10 graph relationships; Rory Block has 5; Joe Bonamassa already had 12, including two reviewed records.
- No relationship was promoted to reviewed. The reviewed public dataset remains at 43 relationships with 100% citation coverage.

## 0.7.0 — 2026-07-22

### Added

- Added Willie “Big Eyes” Smith, Johnny Williams, and Jack Owens with individual source records and public YouTube embeds checked for availability.
- Added 250 revision-specific English Wikipedia biography citation records and 1,064 unique provisional artist-to-artist pathways found in article paragraphs.
- Added 81 narrowly typed provisional relationships where the biography wording explicitly supports performance, recording, stylistic influence, or learning context; retained the other 983 as untyped co-mentions.

### Changed

- Expanded the corpus from 291 to 294 entities, from 277 to 280 artists, from 261 to 514 sources, and from 117 to 1,181 total relationships.
- Reduced artists without any graph connection from 209 to 17 while leaving the reviewed public dataset at 43 relationships with 100% citation coverage.

### Review Notes

- Every imported pathway is `provisional`, cites an exact Wikipedia biography revision, and records one or more paragraph locators for editorial follow-up.
- Article navigation, reference lists, tables, and list-page co-membership were not used to create relationships. A linked paragraph mention can be indirect or incidental and is not presented as reviewed evidence of influence.
- D.K. Harrell had no English Wikipedia biography at the requested title during this crawl; no claim was created for that record.

## 0.6.0 — 2026-07-22

### Changed

- Migrated all 117 relationships from directional `sourceId` and `targetId` fields to neutral `entityAId` and `entityBId` endpoints with explicit orientation.
- Separated evidence category, editorial review status, and dispute status. The historical-parallel record is now simultaneously `reviewed`, `contested`, and `symmetric`.
- Reclassified `performed_with`, `recorded_with`, and `historical_parallel` records as symmetric so they no longer carry arbitrary arrows.
- Migrated all 74 untyped legacy paths from `draft` to `provisional` with `undetermined` orientation; they remain excluded from public relationship routes and downloads.
- Renamed `documented_direct` to `directly_documented` and conservatively mapped `strongly_attested` to `contextual_or_inferential`. No record was promoted to `historically_corroborated` without substantially independent support.

### Review Notes

- No endpoints were reversed and no historical claim, explanation, citation, relationship type, or covered-work convention changed in this schema migration.
- The reviewed public corpus remains 43 cited relationships with 100% citation coverage.
- The complete corpus may contain cycles; only eligible reviewed relationships with structured temporal order enter the derived transmission DAG.

## 0.5.0 — 2026-07-22

### Added

- Added 209 Blues artist records selected from 420 deduplicated human candidates in the audited Wikipedia blues-musician roster.
- Added an individual English Wikipedia profile source for every imported artist, with structured identity fields cross-checked against Wikidata.
- Added School of Rock, Carnegie Hall, and Blues Foundation source records only to imported artists explicitly named by those pages.
- Added a public, embeddable YouTube selection for every imported artist, checked on 2026-07-22.

### Changed

- Expanded the corpus from 82 to 291 entities and from 68 to 277 artists.
- Expanded canonical sources from 49 to 261 while preserving 100% citation coverage for public relationships.
- Left all 117 relationships unchanged; no relationship was inferred from list membership, shared genre, geography, or source co-occurrence.

### Review Notes

- All 209 concise structured profiles use `needs_revision` so richer editorial biographies can be developed incrementally without weakening identity and source validation.
- Eleven candidates with ambiguous artist/video identity matches were excluded rather than published with uncertain media attribution.
- The supplied Britannica page was not used because it could not be retrieved during this audit; the Joanne Dickinson reblog was evaluated but not used as evidence because it reproduces an unattributed genealogy image.

## 0.4.2 — 2026-07-22

### Changed

- Reversed all three `covered_work_by` relationships to follow musical transmission from originator to covering artist: Skip James → Cream, Robert Johnson → Gare du Nord, and Blind Willie Johnson → Led Zeppelin.
- Updated the three relationship slugs and routes to match their new source-to-target order.
- Historical claims, evidence levels, citations, and review statuses remain unchanged.

## 0.4.1 — 2026-07-22

### Changed

- Removed internal import provenance from public entities, relationships, sources, and generated downloads.
- Reworded two reviewed relationship explanations and one source note to describe the claims directly without referring to development history.
- Removed the development-only source HTML from the repository; canonical review statuses and historical claims remain unchanged.

## 0.4.0 — 2026-07-22

### Added

- Added reviewed records for John Mayer, Gare du Nord, and Blind Willie Johnson from independent institutional or official sources.
- Added three typed, cited relationships: Stevie Ray Vaughan's documented influence on John Mayer, Gare du Nord's use of a Robert Johnson recording, and Led Zeppelin's adaptation of a Blind Willie Johnson song.
- Added 64 new featured-song references so all 68 artist records now carry a YouTube video checked for public embed availability; Gare du Nord also carries a checked video.
- Added the Wikipedia list of blues musicians as a discovery-only source after auditing 462 table entries.

### Changed

- Replaced the unavailable Christone “Kingfish” Ingram video reference with a checked public, embeddable selection.
- Reviewed Skip James against the Mississippi Encyclopedia and promoted the migrated Cream pathway to a cited `covered_work_by` relationship.

### Review Notes

- Wikipedia list membership is not used as evidence for artist summaries, classifications, or graph relationships. Every candidate still requires independent research before publication.
- YouTube availability was checked on 2026-07-22 and recorded as presentation metadata, not evidence for historical claims.
- The remaining 74 provisional prototype pathways stay graph-only and marked for editorial review.

## 0.3.0 — 2026-07-22

### Added

- Added 30 reviewed Blues artists spanning classic, regional, revival, and contemporary scenes, including Christone “Kingfish” Ingram, Eric Gales, Shemekia Copeland, Cedric Burnside, Samantha Fish, Jontavious Willis, and D.K. Harrell.
- Added 36 typed and cited public relationships covering direct collaboration, mentorship, performance, revival, and explicitly documented stylistic influence.
- Added 39 source records drawn from official artist biographies, institutional profiles, public-radio and specialist interviews, label documentation, the Smithsonian, the Mississippi Blues Trail, the Recording Academy, and the Blues Foundation.
- Added a verified official-song video reference for Christone “Kingfish” Ingram.

### Review Notes

- New relationships are published only where the cited source directly supports the selected semantic type; collaboration and mentorship are not collapsed into generic influence.
- Direct artist testimony and documented recording or performance credits use `documented_direct`; explicit biographical attestations use `strongly_attested`.
- The 75 provisional prototype pathways remain unchanged, graph-only, and marked for editorial review.

## 0.2.0 — 2026-07-22

### Added

- Added an optional validated YouTube video reference to the entity schema.
- Added reviewed featured-song videos for Muddy Waters, Son House, Eric Clapton, and B.B. King.

### Review Notes

- Featured videos are presentation media, not citations for historical claims.
- No relationship types, evidence levels, review states, or historical assertions changed.

## 0.1.1 — 2026-07-22

### Changed

- Removed an incorrect organization publisher from the prototype migration provenance record.
- Left all migrated historical claims, classifications, evidence levels, review states, and citations unchanged.

## 0.1.0 — 2026-07-21

### Added

- Migrated 49 prototype nodes into typed entity records.
- Preserved all 78 prototype links with their original wording and migration checksum.
- Marked 75 semantically unreviewed and uncited links as drafts excluded from public output.
- Published two documented direct records: Son House mentoring Muddy Waters, and Eric Clapton's membership in the Yardbirds.
- Published one explicitly disputed historical parallel between West African string traditions and field hollers.
- Added four source records, including prototype migration provenance clearly identified as non-evidentiary.

### Review Notes

- Entity summaries remain `needs_revision` because they were migrated from the unsourced prototype.
- Prototype era labels remain migration metadata and are not canonical chronology, geography, style, or technology classifications.
- No public data license has been asserted yet.
