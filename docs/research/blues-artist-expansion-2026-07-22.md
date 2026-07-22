# Blues Artist Expansion Audit — 2026-07-22

## Result

- Candidate human profiles evaluated: 420
- New artist records imported: 209
- Ambiguous candidates excluded: 11
- New relationship records: 0
- Video availability date: 2026-07-22

Every imported record has a unique canonical ID and slug, an individual encyclopedia profile, a Wikidata human identifier, structured roles and dates where available, and one YouTube selection checked as public and playable in an embed.

## Source Use

- The Wikipedia list of blues musicians supplied discovery and Blues classification only.
- Each imported artist links to an individual English Wikipedia profile; Wikidata supplied the human classification and structured identity fields.
- The School of Rock history was attached only to seven imported artists it explicitly names.
- The Carnegie Hall Rhythm & Blues history was attached only to six imported artists it explicitly names.
- The Blues Foundation Hall of Fame page was attached only to six imported artists found verbatim in the retrieved page content.
- The supplied Britannica page could not be retrieved during this audit and was not used.
- The Joanne Dickinson WordPress post reproduces an unattributed genealogy image and was not used as evidence.

The source audit did not treat co-listing, a shared style, a shared region, or appearance in the same overview as evidence of a directed relationship.

## Media Review

The research script searched YouTube, retrieved each selected video's metadata directly, and required both public availability and `playable_in_embed` status. Eleven candidates were removed after the title audit exposed homonyms, unrelated uploads, or uncertain performer attribution: Baby Tate, Dan Sane, Ed Bell, Guitar Slim, Jimmy Rogers, Johnny Williams, L.V. Banks, Lovie Lee, Miller Freeman, Odie Payne, and Sam Taylor.

Featured videos are presentation media. They do not support historical relationships or evidence categories.

## Reproduction

Run the read-only research pass with a local `yt-dlp` executable:

```sh
YT_DLP=yt-dlp node scripts/research-blues-artist-expansion.mjs 209 /tmp/graphroots-blues-expansion.json
```

After editorial review, `scripts/emit-blues-expansion-patch.mjs` emits bounded `apply_patch` batches rather than writing canonical corpus files directly.

## Editorial State

The 209 imported profiles are `needs_revision`. Their concise summaries contain only the structured artist roles supported by the cited profile data. Editors can enrich these records later with stronger biographical sources and relationship-specific evidence without changing the local-file architecture.
