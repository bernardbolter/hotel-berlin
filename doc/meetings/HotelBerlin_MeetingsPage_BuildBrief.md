# Hotel Berlin, Berlin — Meet & Work — Cursor Build Brief
*For Cursor*
*Pages: `/meetings` (`/tagungen`), `/meetings/[slug]` × 22 (`/tagungen/[slug]`), `/meetings/request` (`/tagungen/anfrage`)*
*Stack: Next.js 15 · Payload CMS 3 · Tailwind CSS · next-intl v4 · Lucide React · Resend*
*Design source: `HotelBerlin_MeetingsPage_Wireframe.html` (approved) · Visual system: `DESIGN.md`*
*Content source: live site `hotel-berlin.de/tagungen-arbeiten` + `/tagungen-arbeiten/anfrage` — restructured, not ported as-is*

---

## Context & scope

Replaces the live "Tagungen & Arbeiten" page and its separate "Anfrage" form with three pages:

- **`/meetings`** — overview. Hero, document library, room finder (filter + area tabs + grid), event-type tiles, hybrid meetings teaser, food & drink teaser, facilities grid, closing CTA. Carries no `MeetingRoom` schema of its own — see Section 5.
- **`/meetings/[slug]`** — one per meeting room (22 total). Full gallery, full capacity table, full description, own canonical URL, own `MeetingRoom` + `Offer`-equivalent JSON-LD. This is the actual AEO payoff — mirrors why `/rooms/[slug]` exists as separate pages rather than one long page.
- **`/meetings/request`** — the inquiry form, kept as its own page (not a modal) so it stays linkable, bookmarkable, and crawlable, matching how the live site already separates "browse" from "submit."

**Color — read this before styling anything:** this entire section (all three page types) uses **teal**, not the outside-context default of amber. This extends the existing homepage "Meet & Work" block exception (already teal) to the full page tree. Apply it the same way `/here` swaps its accent — a context-level wrapper/class around this route group, not per-component overrides. **This needs its own line added to `DESIGN.md`** once built (Section 1, "Two contexts" table currently only documents outside=amber/`/here`=teal — add a third row or a footnote for the Meetings exception) — flag this as a doc update, don't skip it silently.

Everything is Payload-editable. No hardcoded room content, document titles, event-type copy, or facility copy in any template.

---

## Global build requirements (apply throughout)

- Semantic HTML: `<main>`, `<section>`, `<nav aria-label="Meeting rooms">`, `<figure>`/`<figcaption>` for gallery images, one `<h1>` per page.
- WCAG 2.1 AA at build time: contrast per `DESIGN.md` (teal on white = 5.0:1, white on teal = 5.0:1 — both pass, safe to use either direction unlike amber/coral), full keyboard nav, visible focus states, `aria-live="polite"` on the room-finder result count, `prefers-reduced-motion` respected.
- Archivo only, site-wide — no Archivo Narrow.
- `/de` primary, `localePrefix: 'always'`, every field a `{ de, en }` pair, `du` register, written natively per the voice guide.
- Filter state (Section 3) lives in the URL as query params (`?size=21-50&layout=theater&guests=51-100&features=screen&area=bereich-a`), same mechanic as `/nachbarschaft` — makes filtered views shareable and gives the finder a real crawlable default state (unfiltered) for AEO.

---

## Section 1 — Payload schema

### 1.1 `meeting-rooms` collection

```typescript
{
  slug: 'meeting-rooms',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'area', 'sizeM2', 'displayOrder'],
  },
  fields: [
    { name: 'name', type: 'group', fields: [
      { name: 'en', type: 'text', required: true },
      { name: 'de', type: 'text', required: true },
    ]},
    { name: 'slug', type: 'text', required: true, unique: true, admin: { description: 'Same slug used for both /meetings/[slug] and /tagungen/[slug].' } },
    { name: 'area', type: 'select', required: true, options: [
      { label: 'Berlin Ballroom', value: 'saal' },
      { label: 'Area A',          value: 'bereich-a' },
      { label: 'Area B',          value: 'bereich-b' },
      { label: 'Area C',          value: 'bereich-c' },
      { label: 'Meeting Island',  value: 'sonderflaeche' },
    ]},
    { name: 'displayOrder', type: 'number', required: true },
    { name: 'sizeM2', type: 'number', required: true },
    { name: 'ceilingHeightM', type: 'number' },
    { name: 'hasDaylight', type: 'checkbox', defaultValue: false },
    { name: 'isDivisible', type: 'checkbox', defaultValue: false },
    { name: 'hasScreen', type: 'checkbox', defaultValue: false },
    { name: 'hasProjector', type: 'checkbox', defaultValue: false },
    { name: 'combinableWith', type: 'relationship', relationTo: 'meeting-rooms', hasMany: true,
      admin: { description: 'Self-referencing — e.g. Berlin 1 combinable with Berlin 2 + Berlin 3.' } },
    { name: 'capacities', type: 'group', fields: [
      { name: 'theater', type: 'number' },
      { name: 'classroom', type: 'number' },
      { name: 'banquet', type: 'number' },
      { name: 'uShape', type: 'number' },
      { name: 'cabaret', type: 'number' },
      { name: 'reception', type: 'number' },
      { name: 'block', type: 'number' },
    ], admin: { description: 'Leave any field blank if that layout isn\'t offered in this room — renders as "–" in the capacity table, not 0.' }},
    { name: 'gallery', type: 'array', fields: [
      { name: 'image', type: 'upload', relationTo: 'media', required: true },
      { name: 'altText', type: 'group', fields: [
        { name: 'en', type: 'text', required: true },
        { name: 'de', type: 'text', required: true },
      ]},
    ]},
    { name: 'teaserImage', type: 'upload', relationTo: 'media' },
    { name: 'shortDescription', type: 'group', fields: [
      { name: 'en', type: 'textarea', required: true },
      { name: 'de', type: 'textarea', required: true },
    ]},
    { name: 'description', type: 'group', fields: [
      { name: 'en', type: 'richText', required: true },
      { name: 'de', type: 'richText', required: true },
    ]},
    { name: '_status', type: 'select', options: ['draft', 'published'], defaultValue: 'draft' },
  ],
}
```

### 1.2 `meeting-documents` collection

```typescript
{
  slug: 'meeting-documents',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'category', 'area', 'sortOrder'] },
  fields: [
    { name: 'title', type: 'group', fields: [
      { name: 'en', type: 'text', required: true },
      { name: 'de', type: 'text', required: true },
    ]},
    { name: 'file', type: 'upload', relationTo: 'media', required: true, admin: { description: 'PDF only.' } },
    { name: 'category', type: 'select', required: true, options: [
      { label: 'General',        value: 'general' },
      { label: 'Floor plan',     value: 'floor-plan' },
      { label: 'Hybrid',         value: 'hybrid' },
      { label: 'Sustainability', value: 'sustainability' },
    ]},
    { name: 'area', type: 'select', options: [
      { label: 'Berlin Ballroom', value: 'saal' },
      { label: 'Area A',          value: 'bereich-a' },
      { label: 'Area B',          value: 'bereich-b' },
      { label: 'Area C',          value: 'bereich-c' },
    ], admin: { description: 'Only set for floor-plan documents — used to auto-link a room\'s matching floor plan on its detail page. Leave blank for general/hybrid/sustainability docs.', condition: (data) => data.category === 'floor-plan' } },
    { name: 'sortOrder', type: 'number', required: true },
  ],
}
```

### 1.3 `meeting-inquiries` collection

Stores every submission server-side — not a fire-and-forget email — so there's an audit trail. Access control: create-only from the public form; read/update restricted to admin roles.

```typescript
{
  slug: 'meeting-inquiries',
  admin: { useAsTitle: 'contactPerson', defaultColumns: ['contactPerson', 'company', 'eventType', 'startDate', 'createdAt'] },
  access: {
    create: () => true,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'company', type: 'text' },
    { name: 'contactPerson', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text', required: true },
    { name: 'startDate', type: 'date', required: true },
    { name: 'endDate', type: 'date', required: true },
    { name: 'eventType', type: 'text', required: true, admin: { description: 'Free text mirroring the eventTypes global options — kept as text here so historical submissions aren\'t affected if the options list changes later.' } },
    { name: 'guestCount', type: 'number' },
    { name: 'roomOfInterest', type: 'relationship', relationTo: 'meeting-rooms', admin: { description: 'Pre-filled when the form is reached via a room detail page CTA.' } },
    { name: 'isRoomBlock', type: 'checkbox', defaultValue: false, label: '10+ rooms as a block' },
    { name: 'notes', type: 'textarea' },
    { name: 'consentGiven', type: 'checkbox', required: true },
    { name: 'locale', type: 'select', options: ['en', 'de'], required: true },
  ],
  hooks: {
    afterChange: [
      // send via Resend: notification to conference inbox + confirmation to submitter
      // see Section 4.4
    ],
  },
}
```

### 1.4 `meetings` global

Event-type tiles and the facilities grid — both small, hand-curated editorial lists, not database-driven collections.

```typescript
{
  slug: 'meetings',
  fields: [
    { name: 'eventTypes', type: 'array', maxRows: 6, fields: [
      { name: 'label', type: 'group', fields: [
        { name: 'en', type: 'text', required: true },
        { name: 'de', type: 'text', required: true },
      ]},
      { name: 'description', type: 'group', fields: [
        { name: 'en', type: 'textarea', required: true },
        { name: 'de', type: 'textarea', required: true },
      ]},
      { name: 'lucideIcon', type: 'text', required: true },
    ]},
    { name: 'facilities', type: 'array', maxRows: 12, fields: [
      { name: 'label', type: 'group', fields: [
        { name: 'en', type: 'text', required: true },
        { name: 'de', type: 'text', required: true },
      ]},
      { name: 'description', type: 'group', fields: [
        { name: 'en', type: 'textarea', required: true },
        { name: 'de', type: 'textarea', required: true },
      ]},
      { name: 'lucideIcon', type: 'text', required: true },
    ]},
    { name: 'contactPhone', type: 'text', required: true },
    { name: 'contactEmail', type: 'text', required: true },
  ],
}
```

Seed content for `eventTypes` (4) and `facilities` (9) ports from the live site's "event types" tiles and "Leistungen" grid — pull the copy from the live page at build time and rewrite to voice-guide standard; not reproduced verbatim here since it's straightforward editorial content, not structural.

---

## Section 2 — `/meetings` overview page

### 2.1 Hero

Full-bleed photo, teal panel bottom-left (same reveal technique as the homepage Meet & Work block — reuse that component if it already supports a non-homepage context, don't fork it). Headline + intro pitch (2–3 sentences, from `meetings` global or hardcoded editorial — confirm which with the client), direct contact line reading `contactPhone`/`contactEmail` off the `meetings` global, primary CTA → `/meetings/request`.

```typescript
type MeetingsHeroProps = {
  headline: string;
  intro: string;
  contactPhone: string;
  contactEmail: string;
  image: { src: string; alt: string };
};
```

### 2.2 Document library

Query `meeting-documents`, grouped by `category`, sorted by `sortOrder` within each group. Renders as a grid of document cards — icon, title, category label. Each card links directly to the PDF (opens in new tab, `rel="noopener"`).

```typescript
type DocumentCardProps = {
  title: string;
  category: 'general' | 'floor-plan' | 'hybrid' | 'sustainability';
  fileUrl: string;
  fileSizeLabel?: string; // e.g. "2.4 MB" — derive from upload metadata if available, omit if not
};
```

### 2.3 Room finder

**Filter bar** — four filter groups (size, layout, guest count, features), each rendering as a chip row. Chips are real `<button aria-pressed>` elements, not decorative — same accessibility bar as the `/nachbarschaft` category chips.

**Area tabs** — six tabs (All + the 5 `area` enum values), driving both the filter and, implicitly, which floor-plan document a room card can cross-link to.

**Grid** — `RoomFinderCard` per matching room, sorted by `displayOrder` within the active area (or globally when "All" is active).

```typescript
type MeetingRoomFinderProps = {
  rooms: MeetingRoomSummary[]; // full unfiltered list — filtering happens client-side against URL query params
};

type MeetingRoomSummary = {
  slug: string;
  name: string;
  area: 'saal' | 'bereich-a' | 'bereich-b' | 'bereich-c' | 'sonderflaeche';
  sizeM2: number;
  teaserImage: { src: string; alt: string };
  capacities: { theater?: number; classroom?: number; banquet?: number; uShape?: number; cabaret?: number; reception?: number; block?: number };
  hasScreen: boolean;
  hasProjector: boolean;
  isDivisible: boolean;
  combinableWithNames: string[]; // resolved names, not raw relationship IDs
};
```

`RoomFinderCard` shows teaser image, name, size + area meta line, the top 3 non-empty capacity numbers (in a fixed priority order: theater → banquet → classroom → whichever else is populated), feature icons, and a "Combinable with X, Y" line only when `combinableWithNames.length > 0`. Whole card links to `/meetings/[slug]`.

**Empty state:** "No rooms match these filters" / "Keine Räume passen zu diesen Filtern" + a "Clear filters" action — same pattern as `/nachbarschaft`'s empty state.

### 2.4 Event-type tiles

Reads `meetings.eventTypes` (4 items, see Section 1.4). Icon + label + short description, static grid, no links in this pass. See Open Items for the "link to pre-filtered finder" enhancement — not built now.

```typescript
type EventTypeTileProps = { icon: string; label: string; description: string };
```

### 2.5 Hybrid meetings teaser

Same teaser-split component already used elsewhere on the site (Lütze homepage teaser, Rooms/Sleep & Relax homepage block) — image one side, kicker + headline + body + single line-CTA the other. CTA links to the hybrid factsheet document from the library (Section 2.2), by category, not a duplicated hardcoded URL — resolve it as `documents.find(d => d.category === 'hybrid')`.

### 2.6 Food & Drink teaser

Same component, reversed side for rhythm. CTA links to the banquet-folder document (`category: 'general'`, matched by a stable slug/identifier — confirm with the client which specific document this should resolve to, since "general" will contain more than one file) and/or `/restaurant`. **Open item — see below**, don't hardcode a guess.

### 2.7 Facilities grid

Reads `meetings.facilities` (9 items). Icon + label + short description, 3-column grid.

### 2.8 Closing CTA band

Teal, full-width, single headline + single CTA → `/meetings/request`. No new schema — headline/body can live on the `meetings` global if the client wants it editable, or be static copy; confirm before building (cheap either way, just don't leave it ambiguous in the commit).

---

## Section 3 — `/meetings/[slug]` detail page

### 3.1 Structure

```
Breadcrumb: Home / Meet & Work / [Room name]
<h1> [Room name]  ·  area label
Gallery (full image set, manual prev/next — same RoomGallery pattern as /rooms/[slug], reuse the component if its props generalize, don't fork)
Spec strip: size · daylight (yes/no) · ceiling height (if set) · combinable with (resolved names, linking to those rooms' own pages)
Capacity table: all 7 layout columns, "–" for any blank field (not 0 — a blank means "not offered," not "zero capacity")
Feature icons: divisible / screen / projector / daylight (only the ones that are true)
Full description (long-form, from meeting-rooms.description)
Related documents: auto-filtered to this room's area (meeting-documents where category = 'floor-plan' AND area = room.area)
CTA: "Request this room" → /meetings/request?room=[slug] (pre-fills roomOfInterest on the form)
← All meeting rooms (back to finder)
```

### 3.2 Capacity table component

```typescript
type CapacityTableProps = {
  capacities: { theater?: number; classroom?: number; banquet?: number; uShape?: number; cabaret?: number; reception?: number; block?: number };
};
```

Column labels (EN / DE): Theater/Theater, Classroom/Parlamentarisch, Banquet/Bankett, U-shape/U-Form, Cabaret/Kabarett, Reception/Empfang, Block/Blockbestuhlung.

### 3.3 Related documents resolver

```typescript
async function getRelatedFloorPlan(room: MeetingRoom) {
  const docs = await payload.find({
    collection: 'meeting-documents',
    where: { and: [{ category: { equals: 'floor-plan' } }, { area: { equals: room.area } }] },
    limit: 1,
  });
  return docs.docs[0] ?? null;
}
```

Berlin Ballroom (`saal`) rooms and Meeting Island (`sonderflaeche`) may not have a dedicated floor-plan document per the live site's document set — handle the `null` case gracefully (section simply doesn't render), don't show a broken/empty card.

---

## Section 4 — `/meetings/request` inquiry form

### 4.1 Structure

Three grouped sections matching the wireframe: Company information, Event details, consent + submit. Real `<label for>` on every field, `aria-required="true"` on required fields, inline validation errors announced via `aria-live="polite"` on submit attempt.

### 4.2 Pre-fill from room CTA

Read `?room=[slug]` from the URL on mount, resolve to the room's display name, pre-fill the "Room of interest" field (a `<select>` populated from all 22 rooms, not a free-text field — avoids typos breaking the `roomOfInterest` relationship on save).

### 4.3 Prop contract

```typescript
type MeetingInquiryFormProps = {
  eventTypeOptions: { value: string; label: string }[]; // from meetings.eventTypes, label-only reuse
  roomOptions: { slug: string; name: string }[];         // all meeting-rooms, for the select
  preselectedRoomSlug?: string;                          // from ?room= query param
};
```

### 4.4 Submission handling

On submit: create a `meeting-inquiries` document (Section 1.3), then in that collection's `afterChange` hook, send via Resend — one notification email to `meetings.contactEmail`, one confirmation email to the submitter's `email`. Both templates are simple transactional emails, not marketing-styled — confirm copy with the client, don't invent a tone for these.

GDPR consent checkbox is required (`consentGiven`), links to `/datenschutz` / `/privacy-policy`, submit button disabled until checked.

---

## Section 5 — JSON-LD

Use the existing `aeo-schema` composable builder pattern — don't hand-write JSON-LD inline in page components.

### 5.1 Detail page — `buildMeetingRoomSchema(room)`

```typescript
{
  "@type": "MeetingRoom",
  "@id": "https://hotel-berlin.de/meetings/berlin-3#room",
  "name": room.name,
  "description": room.description,        // NOT shortDescription
  "url": "https://hotel-berlin.de/meetings/berlin-3",
  "image": room.gallery.map(img => ({
    "@type": "ImageObject",
    "contentUrl": img.url,
    "description": img.altText,
  })),
  "floorSize": { "@type": "QuantitativeValue", "value": room.sizeM2, "unitCode": "MTK" },
  "occupancy": { "@type": "QuantitativeValue", "maxValue": Math.max(...Object.values(room.capacities).filter(Boolean)) },
  "amenityFeature": [
    room.hasDaylight  && { "@type": "LocationFeatureSpecification", "name": "Daylight", "value": true },
    room.hasScreen    && { "@type": "LocationFeatureSpecification", "name": "Screen", "value": true },
    room.hasProjector && { "@type": "LocationFeatureSpecification", "name": "Projector", "value": true },
    room.isDivisible  && { "@type": "LocationFeatureSpecification", "name": "Divisible", "value": true },
  ].filter(Boolean),
  "identifier": room.slug,
  "containedInPlace": { "@id": "https://hotel-berlin.de/#hotel" },   // ties back to the root Hotel entity, per the existing aeo-schema graph
}
```

No `Offer`/price node — meeting rooms don't have a public per-day rate the way guest rooms do (quote-based via the inquiry form), so don't force one. This is a deliberate difference from `buildOfferSchema` on `/rooms/[slug]` — not an oversight.

Plus `BreadcrumbList` (Home → Meet & Work → [room name]) and a canonical `<link rel="canonical">` on the detail URL.

### 5.2 Overview page — `ItemList`, reference only

Same rule as `/rooms`: the overview page emits an `ItemList` referencing detail-page `@id`s, never re-declares full `MeetingRoom` nodes.

```typescript
{
  "@type": "ItemList",
  "itemListElement": rooms.map((room, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "url": `https://hotel-berlin.de/meetings/${room.slug}`,
  })),
}
```

### 5.3 hreflang / canonical

`de`/`en` alternates via `localePrefix: 'always'` on all three page types. Detail-page canonical is per-locale, same convention as `/rooms/[slug]`.

---

## Section 6 — Routing

| Page | EN | DE |
|---|---|---|
| Overview | `/meetings` | `/tagungen` |
| Detail | `/meetings/[slug]` | `/tagungen/[slug]` |
| Inquiry | `/meetings/request` | `/tagungen/anfrage` |

**Slug mapping from the live site is not 1:1** — same caveat as the Rooms migration. Build an explicit slug mapping table before setting up redirects from the live URLs (`/tagungen-arbeiten/anfrage` → `/tagungen/anfrage`, etc.) rather than assuming a pattern.

---

## Build sequence

1. **`meeting-rooms` schema** (Section 1.1) — locks the data shape before anything is styled.
2. **`/meetings/[slug]` detail page** — full assembly (Section 3) + `MeetingRoom` JSON-LD (Section 5.1). Priority, same reasoning as the Rooms brief: this is the actual citable entity.
3. **`meeting-documents` schema + document library section** (Sections 1.2, 2.2) — needed before the detail page's related-documents block (3.3) can resolve to anything real.
4. **`/meetings` overview — room finder** (Section 2.3), then hero/tiles/teasers/facilities/CTA (2.1, 2.4–2.8) — a plain grid with working filters and links into real detail pages is a legitimate intermediate state; polish the teaser sections after.
5. **`meeting-inquiries` schema + `/meetings/request`** (Sections 1.3, 4) — can build in parallel with step 4 once step 2's room list exists (needed for the room-of-interest select).
6. **`meetings` global** (Section 1.4) — event tiles + facilities, lowest priority, purely editorial.

---

## Open items — do not silently resolve

1. **Food & Drink teaser CTA target** (Section 2.6) — needs a specific document/page confirmed with the client, not a guessed match against a `general`-category document.
2. **Closing CTA band copy** (Section 2.8) — confirm whether this lives in Payload or is static.
3. **Event-type tile linking** (Section 2.4) — pre-filtering the room finder by guest-count range per event type is real functionality not on the live site. Flagged as a future enhancement, not built in this pass.
4. **Transactional email copy** (Section 4.4) — needs client-approved wording for both the internal notification and the guest confirmation, not invented tone.
5. **`DESIGN.md` update** for the page-level teal exception — write this once the section ships, don't let it drift undocumented.
6. **22-room seed data** — this brief specs the schema and templates; the actual bilingual seed content per room (names, capacities, descriptions, gallery alt text) is a separate QA pass, same shape as the per-room QA already done for Individual and Cosy Small in the Rooms collection. Recommend the same one-room-at-a-time process once real photography/capacity data is available per room.

---

*Hotel Berlin, Berlin — Meet & Work Build Brief · August 2026*
*Design source: `HotelBerlin_MeetingsPage_Wireframe.html` · Pattern base: `HotelBerlin_RoomsPages_BuildBrief.md`*
