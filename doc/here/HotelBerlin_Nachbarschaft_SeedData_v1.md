# Hotel Berlin, Berlin — Nachbarschaft Seed Data v1

First real batch for seeding `people` + `neighbourhood-places`, pulled directly
from `curated_Tipps.xlsx` and `YM_B_Partner_Selection_Auswahl.pdf`. Chosen
specifically to smoke-test the JSON-LD graph builders against real data before
seeding the full 91-row set: covers the single-endorser case, the confirmed
many-to-many case (Schloss Charlottenburg), and two unattributed places.

**Before seeding this, fix one thing in the Payload schema** — see Section 0.
Everything else below is data.

---

## Section 0 — Schema correction found while pulling this data

`associatedRoom` was specced as a single field on `neighbourhood-places`
(place-level). The real data proves that's wrong: **Schloss Charlottenburg**
is recommended by two people, and each has a *different* room number —
Alessandra Botts' letter is in room 1337, Maike's is in room 1273. The room
belongs to the endorsement (whose letter is it, physically), not to the
place.

**Fix before seeding:** move `associatedRoom` off the place and into each
`endorsements[]` array item:

```ts
{
  name: 'endorsements',
  type: 'array',
  fields: [
    { name: 'person', type: 'relationship', relationTo: 'people', required: true },
    { name: 'quote', type: 'text', required: true },
    { name: 'associatedRoom', type: 'text', admin: { description: 'xlsx "Room" column — this endorsement\'s letter location.' } }, // moved here
  ],
},
```

Remove the top-level `associatedRoom` field from `neighbourhood-places`
entirely — it doesn't have a single correct value once a place has more than
one endorser.

---

## Section 1 — Data-quality flags (confirm with hotel team before full seed)

These surfaced from cross-referencing the two source documents. None are
blocking for this small batch (worked around below), but the full 91-row
seed shouldn't proceed without resolving them — silently picking one value
over another risks baking a wrong fact into a citable, machine-readable
page.

| Issue | Detail |
|---|---|
| **Room number mismatch — Kristiane Kegelmann** | xlsx: room 1185 (König Galerie pick). Partner-selection roster: room 1514. Same person, same website (`kristianekegelmann.com`), two different room numbers across sources. |
| **Room number mismatch — Gita Kudpoor/Kurdpoor** | xlsx spells "Gita Kurdpoor", room 1186 (two picks: Holocaust Memorial, Anjoy). Partner-selection roster spells "Gita Kudpoor", room 1654. Name spelling *and* room differ — confirm these are the same person before merging into one `people` record. |
| **Duplicate rows — same place, same person, two categories** | Confirmed in two places so far: **Käthe-Kollwitz-Museum** (listed under both "Art" and "Museum", same room/person, near-identical description) and **Britzer Garten** (listed under both "Kids" and "Parks and Nature", same room/person). Likely more exist in the full 91 rows. Recommend the seed script dedupe by (place name + person) pair and keep the more specific category rather than importing both rows as separate places. |
| **"Guiseppe" spelling** | Only a first name given, no surname, not in the partner-selection roster at all. Confirm spelling (Giuseppe?) and whether a surname/bio exists before this becomes a public-facing `people` record. |
| **No geo/walking-distance data in the xlsx** | The spreadsheet has `Bezirk` (district) only — no street address, no lat/long, no walking minutes. Every place below ships with `address.streetAddress`, `geo`, and `walkingMinutes` **empty**. The map and the walkable/further-out filter will not work correctly until a geocoding pass happens (Mapbox geocoding API from name + district, or manual entry). This is a real gap, not just missing-for-now polish — flagging so it doesn't get discovered later as "why are there no pins." |

---

## Section 2 — `people` seed (7 records)

Two have real bios/websites from the partner-selection roster. Three are
minimal — `type: local`, no bio — because they only exist as a `User` name
in the xlsx and aren't in the roster. **Do not invent bios or quotes for
these three.** Leave them minimal until the hotel team confirms who they are.

```json
[
  {
    "slug": "kristiane-kegelmann",
    "name": "Kristiane Kegelmann",
    "jobTitle": "Artist / Sculptor",
    "shortBio": "Berlin-based artist and sculptor.",
    "quote": "I hope you have a great time!",
    "website": "https://kristianekegelmann.com/",
    "roomNumber": "1514",
    "_roomNumberFlag": "xlsx says 1185 — see Section 1, confirm before publishing",
    "basedIn": "Prenzlauer Berg / Neukölln",
    "type": "host",
    "status": "draft"
  },
  {
    "slug": "iris-berndt",
    "name": "Dr. Iris Berndt",
    "jobTitle": "Director, Käthe Kollwitz Museum",
    "shortBio": "Art historian and director of the Käthe Kollwitz Museum.",
    "website": "http://www.irisberndt.de/",
    "roomNumber": "1171",
    "type": "host",
    "status": "draft"
  },
  {
    "slug": "maike",
    "name": "Maike",
    "type": "local",
    "status": "draft",
    "_note": "Not in partner-selection roster — no bio/room/website available yet."
  },
  {
    "slug": "alessandra-botts",
    "name": "Alessandra Botts",
    "type": "local",
    "status": "draft",
    "_note": "Not in partner-selection roster — no bio/room/website available yet."
  },
  {
    "slug": "gita-kudpoor",
    "name": "Gita Kudpoor",
    "jobTitle": "Artist",
    "website": "http://www.gitakurdpoor.com",
    "roomNumber": "1654",
    "_nameSpellingFlag": "xlsx spells 'Gita Kurdpoor', room 1186 — see Section 1, confirm same person before merging",
    "type": "artist",
    "status": "draft"
  },
  {
    "slug": "mascha-kuchejda",
    "name": "Mascha Kuchejda",
    "type": "local",
    "status": "draft",
    "_note": "Not in partner-selection roster — no bio/room/website available yet."
  },
  {
    "slug": "guiseppe",
    "name": "Guiseppe",
    "type": "local",
    "status": "draft",
    "_note": "First name only, no surname or bio available. Confirm spelling (Giuseppe?) before publishing."
  }
]
```

*(Fields prefixed `_` — `_roomNumberFlag`, `_nameSpellingFlag`, `_note` — are
handoff annotations, not Payload fields. Strip them before import; they're
here so the flag travels with the record instead of living only in this
doc's prose.)*

---

## Section 3 — `neighbourhood-places` seed (8 records)

Covers: single endorser (König Galerie), clean cross-source match (Käthe-
Kollwitz-Museum — deduped from its two xlsx rows), the confirmed many-to-many
case (Schloss Charlottenburg), two unattributed places (Hamburger Bahnhof,
Neue Nationalgalerie), and three category-diverse single-endorser places
(893 Ryotei Bar, Britzer Garten — deduped, Anjoy).

**Every `quote` below is real where we have it (Kristiane's, sourced from her
letter) and explicitly marked TBC where we don't.** The xlsx's
`Kurzbeschreibung` column is editorial-but-generic third-person copy, not a
first-person endorsement — it's used as the place `description`, not
smuggled in as a fabricated personal quote.

```json
[
  {
    "slug": "koenig-galerie",
    "name": "König Galerie",
    "category": "Art",
    "schemaType": "TouristAttraction",
    "address": { "addressLocality": "Berlin" },
    "geo": null,
    "walkingMinutes": null,
    "indoorOutdoor": "indoor",
    "targetAudience": ["Kunstinteressierte"],
    "description": "Galerie für zeitgenössische Kunst.",
    "endorsements": [
      { "person": "kristiane-kegelmann", "quote": "Its spaces are unbelievable.", "associatedRoom": "1185" }
    ],
    "status": "active"
  },
  {
    "slug": "kaethe-kollwitz-museum",
    "name": "Käthe-Kollwitz-Museum",
    "category": "Museum",
    "schemaType": "Museum",
    "address": { "addressLocality": "Berlin", "addressCountry": "DE" },
    "_dedupeNote": "xlsx has this twice — 'Art' and 'Museum' categories, same person/room, near-identical description. Kept 'Museum' as the more specific category.",
    "geo": null,
    "walkingMinutes": null,
    "indoorOutdoor": "indoor",
    "targetAudience": ["Alle"],
    "description": "Museum mit starkem künstlerischem Profil.",
    "endorsements": [
      { "person": "iris-berndt", "quote": "[TBC — no personal quote sourced yet]", "associatedRoom": "1171" }
    ],
    "status": "active"
  },
  {
    "slug": "schloss-charlottenburg",
    "name": "Schloss Charlottenburg",
    "category": "Sightseeing",
    "schemaType": "TouristAttraction",
    "address": { "addressLocality": "Berlin" },
    "_note": "The confirmed many-to-many case. Two different xlsx rows (categorised 'Museum' and 'Sightseeing' respectively) merged into one place with two endorsements.",
    "geo": null,
    "walkingMinutes": null,
    "indoorOutdoor": "both",
    "targetAudience": ["Alle"],
    "description": "Historisches Schloss mit Gartenanlage.",
    "endorsements": [
      { "person": "maike", "quote": "[TBC — no personal quote sourced yet]", "associatedRoom": "1273" },
      { "person": "alessandra-botts", "quote": "[TBC — no personal quote sourced yet]", "associatedRoom": "1337" }
    ],
    "status": "active"
  },
  {
    "slug": "hamburger-bahnhof",
    "name": "Hamburger Bahnhof",
    "category": "Art",
    "schemaType": "Museum",
    "address": { "addressLocality": "Berlin" },
    "geo": null,
    "walkingMinutes": null,
    "indoorOutdoor": "indoor",
    "targetAudience": ["Alle"],
    "description": "Museum für Gegenwartskunst.",
    "endorsements": [],
    "status": "active"
  },
  {
    "slug": "neue-nationalgalerie",
    "name": "Neue Nationalgalerie",
    "category": "Art",
    "schemaType": "Museum",
    "address": { "addressLocality": "Berlin" },
    "geo": null,
    "walkingMinutes": null,
    "indoorOutdoor": "indoor",
    "targetAudience": ["Alle"],
    "description": "Architektur und Kunst in einem.",
    "endorsements": [],
    "status": "active"
  },
  {
    "slug": "893-ryotei-bar",
    "name": "893 Ryotei Bar",
    "category": "Bar",
    "schemaType": "BarOrPub",
    "address": { "addressLocality": "Berlin" },
    "geo": null,
    "walkingMinutes": null,
    "indoorOutdoor": "indoor",
    "targetAudience": ["Paare", "Business"],
    "description": "Schicke Bar mit besonderem Dinner- und Cocktailgefühl.",
    "endorsements": [
      { "person": "mascha-kuchejda", "quote": "[TBC — no personal quote sourced yet]", "associatedRoom": "1296" }
    ],
    "status": "active"
  },
  {
    "slug": "britzer-garten",
    "name": "Britzer Garten",
    "category": "Parks and Nature",
    "schemaType": "Park",
    "address": { "addressLocality": "Berlin" },
    "_dedupeNote": "xlsx has this twice — 'Kids' and 'Parks and Nature' categories, same person/room, near-identical description. Kept 'Parks and Nature' as the more specific category.",
    "geo": null,
    "walkingMinutes": null,
    "indoorOutdoor": "outdoor",
    "targetAudience": ["Alle", "Familien"],
    "description": "Großer Garten für Spaziergänge und Familienzeit.",
    "endorsements": [
      { "person": "guiseppe", "quote": "[TBC — no personal quote sourced yet]", "associatedRoom": "1292" }
    ],
    "status": "active"
  },
  {
    "slug": "anjoy",
    "name": "Anjoy",
    "category": "Restaurant",
    "schemaType": "Restaurant",
    "address": { "addressLocality": "Berlin" },
    "geo": null,
    "walkingMinutes": null,
    "indoorOutdoor": "indoor",
    "targetAudience": ["Freunde", "Paare"],
    "description": "Vietnamesische Küche in entspannter Umgebung.",
    "endorsements": [
      { "person": "gita-kudpoor", "quote": "[TBC — no personal quote sourced yet]", "associatedRoom": "1186" }
    ],
    "status": "active"
  }
]
```

*(Same annotation convention — strip `_dedupeNote`/`_note` before import.)*

---

## Section 4 — Smoke-test sequence against this batch

This is the exact order from the earlier conversation, now with concrete
targets:

1. Seed `people` (Section 2) first — `neighbourhood-places` endorsements
   reference them by slug.
2. Seed `neighbourhood-places` (Section 3).
3. `getResolvedPlace('koenig-galerie')` with `depth: 2` → confirm
   `endorsements[0].person` is a resolved object with `name: "Kristiane
   Kegelmann"`, not a bare id.
4. `getResolvedPlace('schloss-charlottenburg')` → confirm **two**
   `endorsements`, resolving to **two distinct** people, each with their own
   `associatedRoom` (1273 vs 1337) now that Section 0's fix is in.
5. Render both place pages, view source, confirm two `Review` nodes on
   Schloss Charlottenburg with two different `author`s and the same
   `itemReviewed` `@id`.
6. Confirm `hamburger-bahnhof` and `neue-nationalgalerie` render with **no**
   `review` key at all (not an empty array — `prune()` should drop it
   entirely).
7. Run all four seeded place pages through Google's Rich Results Test.

Every `status: "draft"` on the `people` records and every `[TBC]` quote is
deliberate — this batch is for testing the pipe, not for going live. Flip to
`published`/real quotes only once Section 1's flags are resolved with the
hotel team.
