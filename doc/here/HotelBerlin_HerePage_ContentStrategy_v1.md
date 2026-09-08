# Hotel Berlin, Berlin — `/here` Content Strategy v1
*Merges: old site guest-info directory (`gast-info-verzeichnis`) + new homepage guest-hub bridge (`hotel-berlin.bernardbolter.com`) + `HotelBerlin_HerePage_BuildBrief.md` + `HotelBerlin_HereHero_Addendum.md`*
*Decisions confirmed 2026-08-20: practical A-Z info gets its own dedicated card/section, not folded into the FAQ accordion. Fingerboard ramps is a new, separate in-house feature — content not yet gathered.*

---

## 1. Build order

1. **Content audit** (this doc) — merge all three sources into one map, tag each item with a status.
2. **New card — "Good to know" practical info** — absorb the old site's A-Z guest directory that doesn't already fit in Stay Info.
3. **New card — Fingerboard ramps** — blocked until content is sourced from the hotel team.
4. **Gap-fill sourcing pass** — confirm Wundermart, "Alle Restaurants" (plural), Bett & Bike, Sauna & Fitness, Lütze-Garten with the client before deciding whether each gets a card.
5. **Build against the existing wireframe + brief** — everything below slots into the 13-card structure already speced; this is a content-fill and one-card-addition exercise, not a redesign.

---

## 2. Content map — existing `/here` cards

| Card (from build brief) | Where the content comes from | Status |
|---|---|---|
| Hero (greeting, clock, live event subline) | `hereHero` Payload global + event resolver | Speced in brief + addendum. Wireframe hero subline still shows the older single-line format — needs a refresh pass to match the addendum's two-line live-event resolver. |
| Stay Info (check-out, breakfast, WiFi, parking, luggage) | Old site A-Z directory (subset) + `hotel` global | Speced. Old site has exact values ready to migrate: check-out 12:00, breakfast 06:30–10:00 (weekdays) / 06:30–11:00 (weekends), WiFi login `HBB-GUESTCONNECT`, parking €4/hr or €25/day, 208 spaces, 1.80m max height. |
| Tonight (FKKB current show) | `exhibitions` collection | Speced. Content = current exhibition (Anna Taut + Czarnobyl per wireframe). |
| KTTK + Lütze half-cards | Venue records | Speced. KTTK hours/pricing confirmed from old site: Mon–Sun, €5/30min, 4 JOOLA tables, bats at Lütze bar. |
| Art current show | `exhibitions` collection | Speced. |
| Floor-location cards ×4 | `artworks.locationInBuilding` (field not yet added to collection per brief) | Blocked on schema field + hotel team providing floor/wing per piece. |
| Neighbourhood map | `neighbourhoodPlaces` collection | Speced, separate build brief exists. |
| KTTK + Wallride basement cards | Venue records | Speced. Wallride confirmed permanent, curated by Jürgen Blümlein / Skateboardmuseum Berlin, Cold War Berlin skate history theme. |
| FAQ accordion | `FAQAccordion pageContext="here"` | Speced, reused from homepage. |

---

## 3. New card — "Good to know" (practical info)

**Why a new card, not folded into Stay Info:** Stay Info is deliberately short — the four things a just-arrived guest needs in the first 60 seconds. The old site's A-Z directory is much deeper and belongs one layer down, but as its own visible card rather than buried in the FAQ accordion.

**Suggested position:** full-width, directly after Stay Info — the two together read as "the essentials" then "everything else," before the page moves into Tonight/events content.

**Content groups (from the old site A-Z directory), suggested groupings:**

- **Getting settled** — check-in 15:00, luggage storage (before check-in / after check-out), room safes + lockboxes, housekeeping, iron on request, adapters on request
- **Money & connectivity** — payment is cards/contactless only (no cash), ATM on site, free WiFi hotel-wide, business center
- **Health & comfort** — pharmacy & doctor on request via concierge, pets €30/day, non-smoking (€250 violation fee), climate control, water treatment note (chlorine dioxide system — probably skip, too technical for guest-facing copy)
- **Getting around** — taxi, jogging routes, EV charging (8 × Type 2 stations), links out to `/here/getting-around` for the fuller version
- **24/7 support** — Guest Care Center / concierge

**Data source recommendation:** this is mostly static, rarely-changing hotel-ops data — a good candidate for its own field group on the `hotel` Payload global, the same place WiFi credentials already live, rather than a new collection.

---

## 4. New card — Fingerboard ramps

**Status: blocked.** Nothing in any project doc references fingerboarding specifically — the existing skate content (Sissi Skateboard Club mini-ramp, Wallride exhibition) is about full-size skateboarding and museum content, and per your confirmation this is a distinct, separate feature.

**Needed from the hotel team before a card can be built:**
- Exact location within the hotel (same room as Sissi/Wallride, or elsewhere?)
- Description copy — what it is, who it's for
- Photos
- Access model — walk-in, equipment provided or bring-your-own, any cost
- Hours / availability
- Whether it's permanent or a rotating installation

**Suggested placement once content exists:** likely alongside KTTK + Wallride in the "In the basement" section if co-located, or its own half-card wherever it physically sits.

---

## 5. Other open items to confirm with the hotel team

These appear on the old site and/or the new homepage's guest-hub links but have no card, section, or mention anywhere in the current `/here` build brief:

- **Wundermart** — shop/kiosk. Referenced on the old site under Essen & Trinken and in the new homepage's "Schon hier?" footer column. No `/here` card exists.
- **"Alle Restaurants" (plural)** — the new homepage footer implies more than one dining venue; the build brief only accounts for Lütze. Confirm whether this is just Lütze + Wundermart, or something more.
- **Bett & Bike** (bike rental) — old site only, not carried into any new-site content seen so far.
- **Sauna & Fitness** — old site links to a dedicated page; the A-Z directory confirms a Finnish sauna + Sanarium (45 min advance notice) and a 24/7 gym. Confirm current status post-renovation before building.
- **Lütze-Garten** (summer garden) — listed as an old-site amenity, not mentioned anywhere in the `/here` brief.

---

## 6. Mural / "On the Walls" section

"On the Walls" is already named in the original `/here` URL table (`/here/art` = "Art programme — FKKB + On the Walls"), and the four floor-location cards (Somari, deerBLN, Pisa73, plus the B2/Wallride card) are effectively the mural/wall-art content already.

Worth confirming directly with the team: do the four floor cards fully satisfy "the on-the-wall mural section," or is a more dedicated presentation wanted (e.g., its own full-width section between Art-current-show and the floor cards, rather than the floor cards being the only representation)? Flagging this because it was called out separately from the existing card list, which suggests it may not feel sufficiently represented yet in the current wireframe.

---

## Open items — do not silently resolve

1. Practical info card — final content grouping and copy, once client confirms which old-site amenities still exist
2. Fingerboard ramps — full content brief needed from hotel team
3. Wundermart / restaurant count / Bett & Bike / Sauna & Fitness / Lütze-Garten — confirm current status
4. Whether "On the Walls" needs a more dedicated section beyond the four floor cards
5. Hero subline — wireframe still shows single-line format, brief+addendum specs two-line live-event format
