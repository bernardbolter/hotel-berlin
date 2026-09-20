# Hotel Berlin, Berlin — Amenities: Build Brief (Handoff H.1)

*For Cursor · 20 September 2026*
*Grounded in: `docs/audit/2026-09-20-amenities-step0.md` (§ references below point there)*
*Pilot for the handoff kit: `HotelBerlin_LaunchChecklist_v1.md`, Handoff workstream*

---

## Kick-off prompt

```
Build the Amenities handoff per claude/HotelBerlin_Amenities_BuildBrief.md
(read docs/audit/2026-09-20-amenities-step0.md first for the file:line map).

Goal: the hotel adds, edits, reorders, hides and removes amenities in Payload
with no code change, and the same records drive the /hier "Im Haus" grid,
the /ausstattung page and the Hotel JSON-LD amenityFeature.

Order of work:
  1. Shared field: specialHours (§3) — venues gets it too.
  2. Amenities collection (§2) + migration seed from current i18n (§6).
  3. Resolver + hours formatter with tests (§4).
  4. Rewire InTheHouseSection; delete the stand-in photo machinery (§5.1).
  5. /ausstattung page (§5.2) + JSON-LD (§5.3).
  6. Room amenity tags: DE names, icon fallback, seed fix (§7).
  7. FAQ drift link (§2, relatedFaqs) — data only; the view is H.13.

Do not restyle AmenityCard beyond what §5.1 says. The /hier page is
signed off. Stop and report if Payload 3.85 lacks `orderable` (§2.3).
```

---

## 1. Decisions (20 Sept)

| # | Decision | Consequence |
|---|---|---|
| A1 | **New `amenities` collection** is the home for hotel facilities and services. | Replaces the hard-coded eight in `getInHouseAmenities.ts` (§1.3) and the `here.inHouse.items.*` i18n copy. `venues` stays for restaurant, bar, gallery, KTTK-as-venue. |
| A2 | **No borrowed photos.** A card without its own photo shows the designed icon block. | Delete the stand-in pool (§1.1, `assignAmenityStandIns.ts`). The pending hatch on Fingerboard then shows as designed (§27, contradiction 11). |
| A3 | **`/ausstattung` is built from the same collection:** facilities + services. | The scaffold goes. The Galaxy redirects already land here (§22). |
| A4 | **FAQs stay as they are**, but an amenity links to its related FAQs, and a change to the amenity flags those FAQs for review. | No automatic rewriting of FAQ text. The flag feeds the *Needs attention* view (H.13). `hotel.guestStay.more.saunaFitness` / `hotel.amenityFeature` are kept (hide-don't-delete) but are no longer read by new code. |
| A5 | **Card shape follows the signed-off hub:** square card, 3:2 photo (`globals.css:2042-2047`). Heading stays the unlinked serif "Im Haus". | The 16:9 in the HubCards brief and the 2:1 bands in HomeHereReconciliation §4 are superseded (contradictions 1, 10). *Flag to Bernard for confirmation.* |

---

## 2. Schema — `src/collections/Amenities.ts`

```ts
export const Amenities: CollectionConfig = {
  slug: 'amenities',
  labels: {
    singular: { de: 'Ausstattung', en: 'Amenity' },
    plural:   { de: 'Ausstattung & Services', en: 'Amenities & services' },
  },
  ...collectionCacheHooks('amenities'),       // + revalidate /[locale]/here and /[locale]/amenities
  access: publicReadStaffWrite,
  orderable: true,                            // §2.3 — drag to reorder in the list view
  admin: {
    useAsTitle: 'name',
    group: { de: 'Hotel', en: 'Hotel' },
    defaultColumns: ['name', 'kind', 'status', 'showInHub', 'lastChecked'],
    description: {
      de: 'Alles, was Gäste im Haus nutzen können. Reihenfolge per Drag & Drop. Anleitung: …',
      en: 'Everything guests can use in the building. Drag to reorder. Guide: …',
    },
  },
  fields: [ /* table below */ ],
}
```

| Field | Type | Req | Loc | Editor help (DE — EN in the same shape) |
|---|---|---|---|---|
| `name` | text | ✓ | ✓ | „Name wie auf der Karte, z. B. Sauna & Sanarium." |
| `slug` | text, unique | ✓ | | auto from EN name on create, read-only after (`admin.readOnly` once set) |
| `kind` | select `facility` \| `service` | ✓ | | „Einrichtung = ein Ort im Haus (Gym, Sauna). Service = eine Leistung (Wäscheservice, Babybett)." |
| `status` | select `live` \| `pending` \| `hidden`, default `live` | ✓ | | „Wartet = Karte mit gestricheltem Rand als Hinweis, dass Inhalte fehlen. Ausgeblendet = nirgends sichtbar, bleibt gespeichert." |
| `showInHub` | checkbox, default `true`; `condition: kind === 'facility'` | | | „Als Karte im Gästebereich (/hier, Abschnitt Im Haus) zeigen." |
| `location` | text, max 40 | | ✓ | „Wo im Haus, kurz: Untergeschoss B2 · Lobby · Tiefgarage." |
| `icon` | text + `LucideIconPicker` (reuse, `Tags.ts:28-35`) | ✓ | | „Symbol, das erscheint, solange es kein Foto gibt." |
| `image` | upload → media | | | „Foto im Querformat 3:2, mind. 1200 × 800 px. Ohne Foto erscheint das Symbol." — validate: warn (not block) if width < 1200 |
| `summary` | textarea, max 90 | ✓ | ✓ | „Eine Zeile unter dem Titel, z. B. 4 JOOLA-Platten · Schläger an der Bar." |
| `hours` | group | | | see below |
| `specialHours` | `specialHoursField()` §3 | | | |
| `price` | group `{ mode: 'free' \| 'text' \| 'none', text (loc, max 40, condition mode==='text') }` | | | „Kostenlos, ein Preis wie ‚5 € / 30 Min.', oder nichts anzeigen." |
| `details` | richText | | ✓ | „Nur für die Seite Ausstattung & Services. Längere Erklärung, optional." |
| `link` | group `{ type: 'none' \| 'page' \| 'venue', page: select of allowed routes, venue: relationship → venues }` | | | „Wohin die Karte führt. Ohne Ziel ist die Karte nicht klickbar." |
| `relatedFaqs` | relationship → faqs, hasMany | | | „FAQs, die dieselben Infos nennen. Ändert sich diese Karte, werden sie zur Prüfung markiert." |
| `lastChecked` | date, default today | ✓ | | „Wann zuletzt mit dem Haus abgeglichen? Wird nach 180 Tagen als ‚prüfen' markiert." — `beforeChange`: set to today when `hours`, `specialHours` or `price` change |

**`hours` group**

| Field | Type | Notes |
|---|---|---|
| `mode` | select `always` \| `schedule` \| `onRequest` \| `unknown`, default `unknown` | `always` → „24/7" · `onRequest` → „Auf Anfrage" · `unknown` → no Wann row |
| `schedule` | `openingHoursArrayField()` (existing, `src/fields/openingHours.ts`); `condition: mode === 'schedule'` | reuse as is |
| `note` | text, loc, max 60 | e.g. „45 Min. Vorlauf an der Rezeption" |

**`link.page` allowed values:** `here/wallride`, `here/art`, `here/dining`, `restaurant`, `meetings`, `neighbourhood` — keys from `i18n/pathnames.ts`, resolved through next-intl `Link`. No free-text URLs.

### 2.3 Ordering

Use Payload's collection-level `orderable: true` if 3.85 supports it (it writes a sort key and gives drag handles in the list view). **Check first; if not supported, stop and report** — fallback is a `displayOrder` number with `defaultSort: 'displayOrder'`, but drag-to-reorder is part of the handoff, so we decide together.

---

## 3. Shared field — `specialHoursField()` in `src/fields/openingHours.ts`

Added to **both** `amenities` and `venues` (unblocks H.5 for Lütze, KTTK, Wundermart).

```ts
{ name: 'specialHours', type: 'array', admin: { description: { de: 'Ausnahmen: Feiertage, Reparatur, Sommerzeiten. Vergangene Einträge werden ignoriert.', en: '…' } },
  fields: [
    { name: 'from', type: 'date', required: true },
    { name: 'to',   type: 'date', required: true },   // same as from for one day
    { name: 'closed', type: 'checkbox', defaultValue: false },
    { name: 'opens',  type: 'text', admin: { condition: (_, s) => !s.closed } },
    { name: 'closes', type: 'text', admin: { condition: (_, s) => !s.closed } },
    { name: 'note',   type: 'text', localized: true },  // „wegen Reparatur"
  ] }
```

Validation: `to >= from`. Dates are Berlin calendar days (use `venue-time` helpers; no UTC day shifts).

---

## 4. Resolvers — `src/lib/amenities/`

```ts
type AmenityView = {
  key: string                      // slug
  kind: 'facility' | 'service'
  pending: boolean
  title: string
  eyebrow: string | null           // location
  icon: string                     // Lucide name
  image: AmenityCardImage | null   // own photo only — never a stand-in
  specs: { label: string; value: string }[]   // Wann / Preis
  notice: string | null            // from specialHours, see below
  subline: string
  href: string | null
  details?: RichText               // page only
}

getAmenities(opts: { locale: 'de' | 'en'; context: 'hub' | 'page'; now?: Date }): Promise<AmenityView[]>
formatAmenityHours(a: Amenity, locale, now): { when: string | null; notice: string | null }
```

- **hub:** `kind = facility`, `showInHub`, `status ≠ hidden`, orderable order.
- **page:** `status ≠ hidden`, split by `kind` (facilities, then services).
- **`when`:** `always` → „24/7" / "24/7"; `onRequest` → „Auf Anfrage" (+ note); `schedule` → compact string from rows (e.g. „Mo–So 13:00–23:00"); `unknown` → no Wann row.
- **`notice`** (pure, `venue-time` Berlin time): a special-hours entry covering *today* → „Heute geschlossen – {note}" / „Heute {opens}–{closes}". Covering one of the *next 7 days* → „Geschlossen am Di, 24.9." / „Am Sa, 28.9.: 15:00–23:00". Nothing within 7 days → null.
- **Empty grid:** zero hub amenities → the section does not render (no heading over nothing).
- **Tests** (`tests/int/amenities.int.spec.ts`): each hours mode both locales; special-hours today / in 3 days / in 8 days / past; DST boundary (last Sunday of March and October); hidden excluded; pending flagged; ordering; link resolution; empty list.

---

## 5. Front end

### 5.1 `/hier` — Im Haus

- `InTheHouseSection.tsx`: calls `getAmenities({ context: 'hub' })`. Only section labels (`title`, `specWhen`, `specPrice`) stay in i18n.
- `AmenityCard`: add an optional `notice` line (Archivo 11, `--amber-deep`, above the spec grid). Resolve `icon` by name through the same lookup as `AmenityIcon`. Otherwise **unchanged** (signed off).
- **Delete:** `getInHouseAmenities.ts`, `assignAmenityStandIns.ts`, `HINT_FILENAMES`, the amenity branches of `HERE_IMAGES`, and `here.inHouse.items.*` in both message files, after the migration seed (§6) has run.
- Result checks: KTTK eyebrow reads „Untergeschoss B2" on `/de` (it's English today, §2), and Fingerboard shows the dashed card **with** the hatch.

### 5.2 `/ausstattung` · `/amenities`

Replace `createScaffoldPage('amenities')` with a real page. Same shell and rhythm as the signed-off pages.

1. h1 „Ausstattung & Services" / "Amenities & services" + intro (i18n, written by Bernard).
2. **Im Haus**: every live/pending facility, same `AmenityCard` grid (`hub-row`), with `details` expandable below the grid only if any exist.
3. **Services**: a two-column definition list per service: name · Wann · Preis · summary. `details` in a disclosure (`<details>`), not a modal.
4. The related links from the scaffold catalog (accessibility, fees, contact, rooms, guest FAQ), kept.

Keep the existing `generateMetadata`, canonical and hreflang pattern. Add a footer link in the *Stay* column (Footer global + seed). **Open item O-A1**.

### 5.3 JSON-LD

The layout Hotel node gets `amenityFeature` built from live amenities: `LocationFeatureSpecification { name (locale), value: true }`. Add a pure builder in `src/lib/aeo-schema` with tests. No hours in schema for amenities in v1 (avoid asserting times that are „auf Anfrage"). Keep the no-fabrication guard: `pending` items are excluded.

---

## 6. Migration seed — `src/seed/amenities.ts`

One-off, idempotent by slug, production-guarded (checklist 1.11). It carries over **exactly** what renders today (§2 table), so nothing visibly changes except the photos and the KTTK eyebrow:

| slug | kind | status | location DE / EN | icon | hours | price | summary source | link |
|---|---|---|---|---|---|---|---|---|
| kttk | facility | live | Untergeschoss B2 / B2 Basement | Table2 | schedule Mo-Su 13:00–23:00 | text „5 € / 30 Min." | `de.json:117` / `en.json:117` | venue → kttk |
| wallride | facility | live | from `de.json:120` | Waves | unknown (note: „Dauerhaft" as summary) | free | `:123` | page → here/wallride |
| fingerboard | facility | **pending** | from `:126` | LayoutGrid | unknown | none | `:128` | none |
| gym | facility | live | from `:130` | Dumbbell | always | free | `:133` | none |
| sauna | facility | live | from `:136` | Flame | **unknown**, note „Zeiten werden bestätigt" | free | `:138-139` **minus the "two schedules" sentence** | none |
| bett-and-bike | facility | live | from `:141` | Bike | unknown | none | `:143` | none |
| business-center | facility | live | from `:146` | Briefcase | unknown | none | `:148` | none |
| e-laden | facility | live | from `:151` | Plug | unknown | none | `:153-154` | none |

Services, seeded as **`status: pending`** with name + icon only, for Bernard to fill from the Galaxy page (§22): check-in/check-out, breakfast, parking, room service, laundry service, baby cribs, pets, payment, languages spoken.

`relatedFaqs` seed links: sauna → `guest-sauna`; gym → `guest-gym`; business-center → `guest-business-center`; e-laden → `guest-ev-charging`; bett-and-bike → `guest-bike-garage`.

Also: **remove the unused `venues` seed rows** for wallride / gym / sauna / bett-and-bike / business-center / e-laden from `venuesSeed` and `here-amenities.ts` (they never reached the DB, §11). Delete the orphaned `here.goodToKnow` keys (§33.12).

---

## 7. Room amenity tags (the second meaning)

These already work for editors (§29). They need three fixes:

1. **German names.** Apply the table in §7.1 to `tags_locales` (de). Fix the seed so `name.de` is written from `amenity-tags.json` rather than copying EN (contradiction 9). `wellness-bathroom`: fill it (DE „Wellness-Bad", EN "Wellness bathroom", icon `Bath`).
2. **Icon fallback.** `AmenityIcon.tsx:18-25` returns null for an unknown name. Render the `Check` glyph instead, so a new tag never shows a gap.
3. **Admin list:** `defaultColumns: ['name', 'type', 'lucideIcon']`, and help text on `name` and `type`.

### 7.1 DE names — *Bernard to review before applying*

| slug | DE | slug | DE |
|---|---|---|---|
| accessible | Rollstuhlgerecht | parquet | Parkettboden |
| adjoining-rooms | Verbindungszimmer | pet-friendly | Haustiere willkommen |
| adjustable-ac | Regulierbare Klimaanlage | private-sauna | Eigene Sauna |
| air-conditioning | Klimaanlage | queen-bed | Queensize-Bett |
| balcony | Balkon | rain-shower | Regendusche |
| bath-shower | Badewanne & Dusche | refrigerator | Kühlschrank |
| berlin-doors | Kopfteil aus Berliner Türen | room-safe | Zimmersafe |
| books | Bücher | seating-area | Sitzecke |
| bunk-beds | Etagenbett | separate-living | Separater Wohnbereich |
| desk | Schreibtisch | separate-wc | Separates Gäste-WC |
| dimmable-lighting | Dimmbares Licht | shower | Dusche |
| dj-deck | DJ-Pult | soundproof-windows | Schallschutzfenster |
| double-bed | Doppelbett | spa-bathroom | Spa-Badezimmer |
| foldout-sofa | Schlafsofa | tea | Teezubereitung |
| free-wifi | Kostenloses WLAN | teufel-sound | Teufel-Soundsystem |
| ftc-windows | Bodentiefe Fenster | tv-42 | 42-Zoll-TV |
| garden-view | Gartenblick | tv-49 | 49-Zoll-TV |
| hair-dryer | Haartrockner | tv-55 | 55-Zoll-TV |
| hifi-sound | High-End-Soundsystem | tv-dual | Zwei Fernseher |
| instruments | Instrumente | twin-beds | Zwei Einzelbetten |
| king-bed | Kingsize-Bett | vinyl-collection | 200 Schallplatten |
| king-bed-freestanding | Freistehendes Kingsize-Bett | wellness-bathroom | Wellness-Bad |
| luetzowplatz-view | Blick auf den Lützowplatz | work-dining | Arbeits- & Essbereich |
| minibar | Minibar | ymb-map | You, Me & Berlin-Karte |
| nespresso | Nespresso-Maschine | non-smoking | Nichtraucherzimmer |

---

## 8. Photo spec — for the hotel visit

The card photo is 3:2 inside a square card. The largest rendered width is about 520 CSS px (1-up at < 560). **Minimum 1200 × 800, ideal 2400 × 1600, landscape.** Leave some air around the subject for the focal-point crop.

Shot list: **Gym · Sauna/Sanarium · bike garage (Bett & Bike) · Business Center · EV chargers in the garage · Fingerboard ramps (if they exist yet) · Wallride · KTTK in use**. Plus, for services: breakfast room, lobby/reception. No recognisable guests without consent.

---

## 9. Handoff kit deliverables

- [ ] Field help texts per §2, DE + EN.
- [ ] Editor guide `docs/editor/ausstattung.md` (DE, with an EN copy). **Bernard + Claude write it after the build**; Cursor links it from the collection's `admin.description`. Outline: *Was ist das? · Wo erscheint es? · Neue Karte anlegen · Reihenfolge ändern · Ausblenden statt löschen · Öffnungszeiten & Ausnahmen · Foto-Vorgaben · Häufige Fehler.*
- [ ] Needs-attention rules for H.13 (data only in this brief):
  - `lastChecked` older than 180 days
  - `status: pending`
  - facility with no `image`
  - `hours.mode: unknown` on a live facility
  - related FAQ whose `updatedAt` is before the amenity's last hours/price change

---

## 10. Open items — do not resolve silently

- **O-A1** Footer link to `/ausstattung` in the *Stay* column: yes/no? Recommended yes.
- **O-A2** Does Payload 3.85 support `orderable`? (§2.3.) Stop if not.
- **O-A3** A5 card shape: Bernard to confirm that signed-off square/3:2 beats the older 16:9 and 2:1 briefs.
- **Hotel facts** (go on the hotel list, **not** into the seed):
  - sauna hours (Galaxy publishes two)
  - KTTK open play still daily 13–23 at 5 €/30 min?
  - gym free for guests?
  - Bett & Bike: is rental still running?
  - Business Center: location and what's in it
  - EV charging: on site (8 × Type 2) or nearby, and the price (both are on the site today)
  - Fingerboard ramps: do they exist?
  - the services list

---

## Definition of done

- [ ] `amenities` collection exists with every field in §2, help text DE + EN, `defaultColumns`, admin group „Hotel"
- [ ] Drag-to-reorder in the list view changes the order on `/hier` and `/ausstattung` after save (revalidation works)
- [ ] An editor account (not admin) can add a ninth amenity, hide one, reorder, and change hours — each visible on the site with **no code change**
- [ ] `specialHours` on amenities **and** venues; notice renders today / within 7 days; past entries ignored
- [ ] `formatAmenityHours` + `getAmenities` tests pass, DST cases included
- [ ] `getInHouseAmenities.ts`, `assignAmenityStandIns.ts` and `here.inHouse.items.*` are gone; no amenity card shows a borrowed photo; the icon block renders for cards without a photo; Fingerboard shows the dashed card with the hatch
- [ ] `/de/hier` Im Haus visually unchanged except photos → icons, KTTK eyebrow in German and the notice line; order and copy identical to the seed table
- [ ] `/de/ausstattung` and `/en/amenities` render facilities + services from the collection; the scaffold is removed; the Galaxy redirects still land here
- [ ] Hotel JSON-LD `amenityFeature` from live amenities, pending excluded, builder tested
- [ ] 50/50 amenity tags have a German name (after Bernard's review of §7.1); `AmenityIcon` falls back to `Check`
- [ ] Unused venue seed rows and `here.goodToKnow` removed
- [ ] Both locales throughout; axe clean on `/hier` and `/ausstattung`

## Do not

- Do not restyle `AmenityCard` or the Im Haus section beyond the `notice` line.
- Do not pick a sauna schedule or seed unconfirmed hotel facts.
- Do not delete `hotel.guestStay.more.saunaFitness` or `hotel.amenityFeature` (hide-don't-delete; A4).
- Do not add stand-in or stock photos anywhere in amenities.
- Do not allow free-text URLs in `link`.
