# Hotel Berlin, Berlin — Neighbourhood Teaser: Live-Build Feedback & Addendum
*For Cursor*
*Addendum to `HotelBerlin_NeighbourhoodMap_BuildBrief.md` — read that first, this covers what changed after reviewing the first live build.*

---

## Context

The teaser is live and mostly matches the brief — hover labels, hotel marker, floating card are all working. This addendum covers six adjustments identified from reviewing the live build (`Hotel-Berlin-Berlin_map3.png`), plus a taxonomy issue the previous brief left unresolved.

---

## 1. Photo in the info card

`neighbourhoodPlaces.image` already exists in the schema — it's populated for at least the seed places but wasn't wired into `PlaceInfoCard`. Add it: fixed-height image block at the top of the card, above the category label, same treatment as the design reference. No schema change.

**Temp/placeholder photos for testing:** don't source real photos of these places via ad-hoc image search — licensing is unknown and it's easy to accidentally ship a copyrighted photo past the testing phase. Two better options:
- **Pure layout testing:** `picsum.photos/{width}/{height}?random={id}` — free, no auth, obviously placeholder.
- **Closer to real, for the actual 5 launch places:** check Wikimedia Commons for photos tied to each place's Wikidata entity where one exists — several of these places likely already have or will get Wikidata identifiers as part of the existing AEO authority-identifier work, and Commons often has CC-licensed images against the same entity. This needs an `imageCredit`/`imageLicense` field added to the schema (CC-BY requires visible attribution near the image), and won't cover smaller independent spots without a Commons presence — those need real photography regardless, this isn't a permanent substitute.

## 2. "Recommended by" label

Add a small uppercase label above the recommender chip, same visual treatment as the category label ("Shopping"). Without it, an avatar + name reads ambiguous — could be mistaken for an author byline. One line of markup, no schema change.

## 3. Transit row — confirm bug vs. missing data before fixing anything

The transit row (Section 1, previous brief) is optional by design — it only renders if `transit.minutes`/`transit.station` are populated for that place, since the data doesn't exist for most of the dataset yet. Before treating this as a bug: check whether KaDeWe's record actually has transit data filled in.
- If the field is empty → this is expected behavior, not a bug. Populate the data if it's wanted for this specific place, since it's one of only 5 in the teaser and worth prioritizing.
- If the field is populated and still not rendering → real bug in the conditional render logic, fix it.

## 4. Category legend — scoped, not exhaustive

Confirmed: no full category-filter legend on the teaser (previously agreed — a filter implies more content to filter through, which isn't true for 5 curated pins). Instead: a compact color-key legend showing **only the categories actually present** among the current 5 teaser places (e.g. just "Hotel / Shopping / Museum," not all 9 possible categories). This also sidesteps needing to finalize the full category→color mapping just for the teaser — see item 6.

## 5. Place list under the legend

Add a list below the legend: one row per teaser place, each with a thumbnail, name, a colored dot matching the legend above it, recommender name, and walking time. Clicking a row pans the map to that pin and opens its info card — functions as both a scannable index and a much easier tap target than a 32px pin, particularly on mobile where precise pin-tapping is harder.

## 6. CTA strip — move off the map canvas entirely

**The overlay-on-map idea for the "explore the full map" CTA can't ship as originally discussed** — Mapbox's terms require their logo and the "© Mapbox © OpenStreetMap · Improve this map" attribution to stay visible and unobscured on any embed, regardless of plan tier. A box covering that would be a terms violation, not just a style choice.

Fix: CTA lives in its own strip **below** the map container, own background color, in normal document flow — not `position: absolute` over the canvas. The Mapbox attribution stays on its own line below that, fully visible, untouched. See `HotelBerlin_NeighbourhoodTeaser_Revision_v5.html` for the exact layout.

## 7. Category taxonomy reconciliation — resolved, palette v2

The previous brief's six "category tokens" (art/sport/music/food/neighbourhood/partnerships) don't actually match `neighbourhoodPlaces.category`'s real nine options (Art, Bar, Kids, Museum, Parks and Nature, Party, Restaurant, **Shopping**, Sightseeing). A first pass at fixing this (heavily muted, reusing the six existing dark tokens) produced a real collision — Museum and Parks both landing on the same dark green — and left two categories with no color at all.

**Final palette — pulled back from full brand saturation, not all the way to muted.** Five of nine keep their exact existing brand hex; three new hues fill genuine gaps (Restaurant, Party, Kids never had a token to begin with); glyph is the real Lucide component to use, not the hand-approximated SVGs in the mockups.

| `category` value | Pin color | Lucide component | Note |
|---|---|---|---|
| *(Hotel marker)* | `#1A2B4A` (ink) | `Home` | Outside the category system entirely |
| Art | `#2C6B7A` | `Palette` | Exact brand teal, unchanged |
| Museum | `#A08C38` | `Landmark` | Exact brand gold, unchanged — distinct from Art |
| Shopping | `#5F4E68` | `ShoppingBag` | Brand purple, slightly deepened for separation from Party |
| Bar | `#D14A50` | `Martini` | Brand coral, pulled back ~15% (full-bright coral stays reserved for the hero/rooms CTA) |
| Restaurant | `#C1652F` | `UtensilsCrossed` | New — terracotta, no prior token existed |
| Parks and Nature | `#56674F` | `TreePine` | Exact brand forest green, unchanged |
| Sightseeing | `#E08A28` | `FerrisWheel` | Brand amber, pulled back slightly |
| Party | `#9B3F6B` | `PartyPopper` | New — raspberry, resolves the previous open item |
| Kids | `#4A90C4` | `Baby` | New, **provisional** — only build this if "Kids" stays a `category` value rather than moving to `targetAudience` per the still-open taxonomy question |

Two things not yet verified, flag before lock:
- **Contrast** of the white glyph against each hex hasn't been formally checked.
- **Bar/Restaurant/Sightseeing sit close together** in the warm orange-to-red family — color alone won't fully disambiguate them at a glance, the glyph is doing real work here, same principle as the hover-label accessibility note earlier in this brief.

The 5-pin teaser only needs 3 of these (Hotel, Shopping, Museum) — the full set only matters once `/nachbarschaft`'s full page ships with all 9 categories visible together.

## 8. `imageCredit` field — needed for production, not just this addendum's Commons-sourcing suggestion

```ts
// addition to collections/NeighbourhoodPlaces.ts
{
  name: 'imageCredit',
  type: 'group',
  admin: { description: 'Populate whenever image is not the hotel\'s own photography — required for any CC-licensed source (e.g. Wikimedia Commons), optional/blank for licensed stock or original photography where no visible credit is contractually required.' },
  fields: [
    { name: 'creditText', type: 'text', admin: { description: 'e.g. "Photo: Jane Doe, CC BY-SA 4.0"' } },
    { name: 'creditUrl', type: 'text', admin: { description: 'Link to the source/license page.' } },
    { name: 'license', type: 'select', options: ['CC-BY', 'CC-BY-SA', 'licensed-stock', 'original', 'other'] },
  ],
}
```

Render as a small, unobtrusive credit line on the image (or in the full detail page's caption once that's built) whenever `creditText` is populated — CC-BY/CC-BY-SA licenses require visible attribution, it's not optional once that source is used.

---

## Open items

1. Contrast-check the palette v2 white-glyph-on-color pairings before lock.
2. "Kids" category resolution — carried forward from the original Nachbarschaft brief, still unresolved; palette entry above is provisional pending that decision.
3. Confirm transit data status for KaDeWe specifically before writing the missing transit row off as a rendering bug.
4. `imageCredit` only needs populating where a non-owned photo source is actually used — don't block seeding on backfilling this for every place.
