# Hotel Berlin, Berlin — Nachbarschaft Seed Data v2 (addendum)

Builds on `HotelBerlin_Nachbarschaft_SeedData_v1.md` — adds 12 places to the
existing 8, for 20 total. Design-phase batch, not a full-91 seed. Same
conventions as v1: `_`-prefixed fields are handoff annotations to strip
before import, `[TBC]` quotes are placeholders never to be treated as real.

---

## Updated findings (read before seeding)

**Kristiane Kegelmann's room — new evidence shifts the likely answer.**
v1 flagged xlsx (1185) vs. partner-selection roster (1514) as unresolved.
Pulling more of her picks surfaced **three additional xlsx rows** —
Einsunternull, Lokal, Nobelhart & Schmutzig — all independently listing room
**1185**, and all three match the actual restaurants named in her own
welcome letter. Four independent xlsx entries agreeing beats one
roster entry disagreeing. I'd now lean toward **1185 being correct**, which
is the opposite lean from v1. Still not a substitute for hotel-team
confirmation — just flagging that the evidence shifted, not asserting it's
settled.

**New mismatch found: Katja Morkel.** Partner-selection roster: room 1515.
xlsx (Einar & Bert Bookshop pick): room 1190. Same shape as the Kristiane
and Gita cases.

**Pattern worth naming explicitly:** of the people who appear in both
sources so far, some match cleanly (Dr. Iris Berndt — 1171/1171; Christiane
Fritsch-Weith — 1169/1169; Jennifer Oeser — 1314/1314) and some don't
(Kristiane, Gita, Katja — all mismatched). That's roughly half. This reads
less like isolated typos and more like the two source documents were
assembled at different times or from different passes. **Worth one
reconciliation conversation covering all overlapping names at once with the
hotel team, rather than resolving each mismatch as a one-off** — there are
likely more of these in the full 91/roster overlap that haven't surfaced
yet simply because this batch hasn't touched those names.

---

## New `people` (9 records — 3 link to the partner-selection roster, 6 are minimal)

```json
[
  {
    "slug": "katja-morkel",
    "name": "Katja Morkel",
    "jobTitle": "Jewelry maker",
    "website": "http://www.morkel.de",
    "roomNumber": "1515",
    "_roomNumberFlag": "xlsx says 1190 (Einar & Bert Bookshop pick) — confirm before publishing",
    "type": "artist",
    "status": "draft"
  },
  {
    "slug": "christiane-fritsch-weith",
    "name": "Christiane Fritsch-Weith",
    "jobTitle": "Third-generation owner, Buchladen Bayerischer Platz (est. 1919)",
    "website": "https://buchladen-bayerischer-platz.de/",
    "roomNumber": "1169",
    "type": "host",
    "status": "draft",
    "_note": "Clean match — room agrees across both sources."
  },
  {
    "slug": "jennifer-oeser",
    "name": "Jennifer Oeser",
    "jobTitle": "Track & field, Olympic medalist",
    "roomNumber": "1314",
    "type": "host",
    "status": "draft",
    "_note": "Clean match — room agrees across both sources."
  },
  { "slug": "ellen-garry", "name": "Ellen Garry", "type": "local", "status": "draft", "_note": "Not in partner-selection roster." },
  { "slug": "eva-hoefsloot-schmeink", "name": "Eva Höfsloot Schmeink", "type": "local", "status": "draft", "_note": "Not in partner-selection roster." },
  { "slug": "ellen-katja-jaeckel", "name": "Ellen Katja Jaeckel", "type": "local", "status": "draft", "_note": "Not in partner-selection roster." },
  { "slug": "mathias-wolf", "name": "Mathias Wolf", "type": "local", "status": "draft", "_note": "Not in partner-selection roster." },
  { "slug": "jascha-mueller", "name": "Jascha Müller", "type": "local", "status": "draft", "_note": "Not in partner-selection roster." },
  { "slug": "benson", "name": "Benson", "type": "local", "status": "draft", "_note": "First name only in xlsx — confirm surname before publishing." }
]
```

*(`kristiane-kegelmann` already exists from v1 — just gains more
endorsements below, no new person record needed.)*

---

## New `neighbourhood-places` (12 records)

```json
[
  {
    "slug": "einar-und-bert-bookshop",
    "name": "Einar & Bert Bookshop",
    "category": "Art",
    "schemaType": "LocalBusiness",
    "address": { "addressLocality": "Berlin" },
    "geo": null, "walkingMinutes": null,
    "indoorOutdoor": "indoor",
    "targetAudience": ["Alle"],
    "description": "Buchladen mit Kulturcharakter.",
    "endorsements": [{ "person": "katja-morkel", "quote": "[TBC]", "associatedRoom": "1190" }],
    "status": "active"
  },
  {
    "slug": "bayerischer-platz",
    "name": "Bayerischer Platz",
    "category": "Sightseeing",
    "schemaType": "TouristAttraction",
    "address": { "addressLocality": "Berlin" },
    "geo": null, "walkingMinutes": null,
    "indoorOutdoor": "outdoor",
    "targetAudience": ["Alle"],
    "description": "Ruhiger Platz mit schönem Kiezcharakter.",
    "endorsements": [{ "person": "christiane-fritsch-weith", "quote": "[TBC]", "associatedRoom": "1169" }],
    "status": "active"
  },
  {
    "slug": "nobelhart-und-schmutzig",
    "name": "Nobelhart & Schmutzig",
    "category": "Restaurant",
    "schemaType": "Restaurant",
    "address": { "addressLocality": "Berlin" },
    "geo": null, "walkingMinutes": null,
    "indoorOutdoor": "indoor",
    "targetAudience": ["Paare", "Business"],
    "description": "Anspruchsvolles Fine Dining mit regionalem Fokus.",
    "endorsements": [{ "person": "kristiane-kegelmann", "quote": "One of my suggestions for good informal restaurants.", "associatedRoom": "1185" }],
    "_note": "Real quote source: her letter names this restaurant directly. v1's Einsunternull and Lokal picks (same person, same room, same letter) exist in the xlsx too — not seeded here to avoid over-representing one person in a small design batch, available for the full seed.",
    "status": "active"
  },
  {
    "slug": "olympiastadion",
    "name": "Olympiastadion",
    "category": "Sightseeing",
    "schemaType": "TouristAttraction",
    "address": { "addressLocality": "Berlin" },
    "geo": null, "walkingMinutes": null,
    "indoorOutdoor": "both",
    "targetAudience": ["Alle"],
    "description": "Historischer Ort mit Führungs- und Besuchswert.",
    "endorsements": [{ "person": "jennifer-oeser", "quote": "[TBC]", "associatedRoom": "1314" }],
    "_note": "Strong authenticity signal — an Olympic athlete recommending the Olympic stadium. Worth prioritizing this one for a real quote first.",
    "status": "active"
  },
  {
    "slug": "vater-bar",
    "name": "Vater Bar",
    "category": "Bar",
    "schemaType": "BarOrPub",
    "address": { "addressLocality": "Berlin" },
    "geo": null, "walkingMinutes": null,
    "indoorOutdoor": "indoor",
    "targetAudience": ["Freunde", "Paare"],
    "description": "Moderne Bar mit urbanem Charakter.",
    "endorsements": [{ "person": "ellen-garry", "quote": "[TBC]", "associatedRoom": "1267" }],
    "status": "active"
  },
  {
    "slug": "viktoriapark",
    "name": "Viktoriapark",
    "category": "Parks and Nature",
    "schemaType": "Park",
    "address": { "addressLocality": "Berlin" },
    "geo": null, "walkingMinutes": null,
    "indoorOutdoor": "outdoor",
    "targetAudience": ["Alle"],
    "description": "Stadtpark mit Aussicht und Wasserfall.",
    "endorsements": [{ "person": "eva-hoefsloot-schmeink", "quote": "[TBC]", "associatedRoom": "1294" }],
    "status": "active"
  },
  {
    "slug": "kadewe",
    "name": "KaDeWe",
    "category": "Shopping",
    "schemaType": "ShoppingCenter",
    "address": { "addressLocality": "Berlin" },
    "geo": null, "walkingMinutes": null,
    "indoorOutdoor": "indoor",
    "targetAudience": ["Alle"],
    "description": "Berühmtes Kaufhaus mit Food- und Shoppingerlebnis.",
    "endorsements": [{ "person": "ellen-katja-jaeckel", "quote": "[TBC]", "associatedRoom": "1374" }],
    "status": "active"
  },
  {
    "slug": "teufelsberg",
    "name": "Teufelsberg",
    "category": "Sightseeing",
    "schemaType": "TouristAttraction",
    "address": { "addressLocality": "Berlin" },
    "geo": null, "walkingMinutes": null,
    "indoorOutdoor": "outdoor",
    "targetAudience": ["Freunde", "Paare"],
    "description": "Aussichtspunkt mit Berliner Geschichte und Street Art.",
    "endorsements": [{ "person": "mathias-wolf", "quote": "[TBC]", "associatedRoom": "1189" }],
    "status": "active"
  },
  {
    "slug": "tempelhofer-feld",
    "name": "Tempelhofer Feld",
    "category": "Kids",
    "schemaType": "Park",
    "address": { "addressLocality": "Berlin" },
    "geo": null, "walkingMinutes": null,
    "indoorOutdoor": "outdoor",
    "targetAudience": ["Familien", "Kinder"],
    "description": "Riesige Freifläche zum Radfahren, Skaten und Drachensteigen.",
    "endorsements": [{ "person": "jascha-mueller", "quote": "[TBC]", "associatedRoom": "1167" }],
    "_note": "Also Kristiane's personal favorite per her letter (\"at 6am, which I find completely liberating\") — but that's prose in a letter template, not a structured xlsx endorsement. Worth asking the hotel team whether to add her as a second formal endorser here, rather than assuming it.",
    "status": "active"
  },
  {
    "slug": "berghain-panorama-bar",
    "name": "Berghain / Panorama Bar",
    "category": "Party",
    "schemaType": "LocalBusiness",
    "address": { "addressLocality": "Berlin" },
    "geo": null, "walkingMinutes": null,
    "indoorOutdoor": "indoor",
    "targetAudience": ["Erwachsene"],
    "description": "Berühmter Club für lange Nächte.",
    "endorsements": [{ "person": "benson", "quote": "[TBC]", "associatedRoom": "1272" }],
    "_note": "Globally recognized entity — good stress-test for how a very-high-authority place (likely already has strong Wikidata/Wikipedia presence) interacts with the authority.identifier field once populated.",
    "status": "active"
  }
]
```

*(That's 10 written out above — Category note: dropped Einsunternull/Lokal
from the Kristiane cluster and one of the two remaining Party candidates to
keep this batch at a clean 12 total alongside the two you already have
in mind from the roster query. Adjust freely if you'd rather have all of
Kristiane's four picks in for a fuller single-person example — flagged
above where that trade-off is.)*

---

## Next: the intake pipeline

You mentioned wanting a place/person pipeline for new entries going forward
— agreed that's a real next deliverable, but a distinct one from this seed
batch. Once this 20-place set is in and you're happy with how it looks in
the design, worth scoping separately: probably a short intake
checklist/runbook (what fields are required before a place can go
`published`, who geocodes it, where quotes get sourced from) rather than new
code — the Payload admin UI is already the pipeline, this would just
formalize the steps so it's repeatable without re-deriving them each time.
Say when you want to work through that.
