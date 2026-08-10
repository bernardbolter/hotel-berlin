# Hotel Berlin, Berlin — Room Seed Data QA
*For Cursor*
*Collection: `rooms` · Process brief — reusable for all 11 room entries, Individual completed below as the worked example*
*Source: live site (`hotel-berlin.de/en/sleep-relax/rooms-suites/[slug]`) cross-checked against seeded Payload entries and actual gallery photos*

---

## Why this exists

Seeding from the live site's copy and the Addendum's data isn't a straight copy job — the live site itself contains internal inconsistencies (see below), the Addendum's amenity tagging can carry over defaults that don't match a specific room's actual photos, and alt text needs real eyes on the images, not a templated pattern. This is the checklist to run per room before considering an entry "seeded," using **Individual** as the completed example.

**Per-room QA checklist:**
1. Pull the live page's room-specific spec bullets + prose description
2. Cross-check every claim against the room's actual photos
3. Flag (don't silently resolve) any contradiction between prose / bullet list / generic amenity block
4. Write real alt text per image, from what's actually visible
5. Confirm every amenity tag against the photos — pull anything that doesn't match, add anything visible but missing
6. Note anything that needs a real answer from the hotel rather than a guessed default

---

## Individual — completed

## Individual — status

**Resolved:** gallery file numbering (renaming was intentional, not a live-site mismatch — no action needed), `desk` added, `berlin-doors` removed, `teaserImage` corrected to `individual-room-1.jpg`, `description` populated both languages, `socialImage` correctly left empty to fall back to `gallery[0]`, all 5 alt texts in place.

**Still open:**
1. **`featuredAmenities` empty** — homepage teaser needs a curated 3–4 subset per Homepage V2 brief. Suggested: `double-bed`, `free-wifi`, `nespresso`, `tv-42` — confirm or swap.
2. **`bedConfiguration`** — still unresolved by design, not silently picked. This is the one to actually raise with the hotel (see bed-size section below).
3. **`ymb-map`** — tag present, no map visible in any of the 5 photos. Same "tag vs. photo" mismatch pattern that caught `berlin-doors` — worth a quick visual re-check before treating the amenity list as final.

### 1. Gallery — resolved

Live site's actual gallery: `individual-room-1, -3, -4, -5, -6` (note: no `-2` on the live site). Seeded Payload gallery uses your own renamed files, `-1` through `-5` — this was an intentional rename before seeding, not a mismatch with the live site's set. No action needed.

### 2. Alt text — finalized from actual photos

| # | Alt text |
|---|---|
| 1 | Individual room at Hotel Berlin, Berlin — bed with yellow headboard against a turquoise street-art mural wall |
| 2 | Individual room at Hotel Berlin, Berlin — bed and window seating area with wall-mounted TV and sheer curtains |
| 3 | Individual room at Hotel Berlin, Berlin — open wardrobe with Nespresso machine and mini-fridge beside the bed |
| 4 | Individual room at Hotel Berlin, Berlin — full room view with window, desk chair, and mural headboard wall |
| 5 | Individual room bathroom at Hotel Berlin, Berlin — walk-in shower with brown mosaic tile and white sink |

Note: images 2 and 4 are near-duplicate framing. Not blocking, but worth a look — a shot the room doesn't currently have (desk close-up, second bathroom angle) may serve the gallery better than the duplicate.

### 3. Bed size — live site contradicts itself, needs a real answer

Three different claims on the same live page, plus a fourth data point from the photos:

| Source | Claim |
|---|---|
| Intro paragraph | "plush double bed" |
| Room-specific spec bullet | "queen size bed (140x200cm)" |
| Generic amenity icon block (shared across all rooms) | "Queen-size-bed (160x200cm)" |
| Actual photos | Reads visually closer to a single/twin than any of the above |

Current Payload entry: `bedConfiguration.type: "double"`, no dimensions — matches none of the four exactly.

**⚠️ Open — raise with the hotel**, alongside the other data-quality flags already queued from the Nachbarschaft/You Me & Berlin work (Kristiane Kegelmann's room number, the Gita name/room mismatch). Don't resolve silently by picking one of the four.

### 4. Amenity tags — corrections

- **Add `desk`.** Live page's room-specific bullet says "small desk," visible in the photos (console + chair, images 3–4), not currently tagged.
- **Remove or confirm `berlin-doors`.** This tag is meant for the "Berlin door headboards" feature (repurposed old apartment doors as bedheads, per the Addendum's amenity glossary). The actual headboard in these photos is a plain yellow lacquered panel — no door motif visible. Likely a default carried over rather than a per-room check. Pull unless someone confirms the yellow panel is intentionally standing in for that feature.
- **`ymb-map` unconfirmed** — no You, Me & Berlin map visible in any of the 5 photos. Not conclusive (could be out of frame), but worth a visual double-check rather than assuming it's present because it's tagged.
- Everything else on the room-specific bullet list checks out against the photos and current tags: `air-conditioning`, `shower`, `tv-42`, `refrigerator`, `room-safe` all confirmed present and correctly tagged.

### 5. Long description — source available, needs voice-guide rewrite

The live page has real prose to work from (not reproduced here — paraphrase, don't port it verbatim). It should get the same treatment `shortDescription` already got: native `du`-register German, not translated, matching `HotelBerlin_VoiceToneGuide_v2.md` — not a straight copy of the old corporate-voice paragraph into the new `description` field.

---

## Remaining 10 rooms — run the same 5 checks

For each: Cosy Small, Standard, Superior, Family, Premium Family, Premium, Junior Suite, Suite – One Bedroom, Corner Suite, Studio 45.

Given the pattern found here, worth checking specifically on each:
- Does the live page's bed-size claim conflict across sections the way Individual's did? (Likely — the generic amenity block causing Individual's third conflicting number is shared across all 11 pages, so the same contradiction probably repeats.)
- Does `berlin-doors` actually match that room's headboard, or was it applied as a default? (Check photos before trusting the tag.)
- Gallery file-number continuity — confirm seeded files match the live site's actual set for that room, same check as Individual's missing `-2`/extra `-6`.

---

*Hotel Berlin, Berlin — Room Seed QA · August 2026*
*Companion to: `HotelBerlin_RoomsHero_Addendum.md`, `HotelBerlin_RoomsPages_BuildBrief.md`*
