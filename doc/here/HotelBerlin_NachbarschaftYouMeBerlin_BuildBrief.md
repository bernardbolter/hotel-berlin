# Hotel Berlin, Berlin — Nachbarschaft & You, Me & Berlin — Cursor Build Brief

## Context & scope

This brief covers two new pages and their supporting Payload collections:

- **`/nachbarschaft`** (EN: `/neighbourhood`) — place-centric neighbourhood guide. Map + filterable/searchable grid of curated places.
- **`/you-me-and-berlin`** (same slug both locales — brand name, not translated) — person-centric. The "You, Me & Berlin" network of named Berlin personalities, each with their own picks.

Both are **outside-context pages** (prospect-facing, not the guest hub). They are distinct pages, not two views of one page, but share components (map, `PlaceCard`, filter bar) — see Section 5.

The `aeo-schema` package (already built and unit-tested — see `/aeo-schema` in this handoff) supplies every JSON-LD builder referenced below. **Do not hand-write JSON-LD in page components.** Import from the package.

**Do not build yet:** individual place/person detail pages' visual design (agreed to be dedicated pages for AEO reasons, but layout is TBC — for now, stub `[slug]/page.tsx` with the JSON-LD wired up and a plain content render, so the schema output is live even before the polished layout lands).

---

## Section 1 — Payload collections

### 1.1 `people`

Note: this **replaces and folds in** the previously-planned `insiderStories` collection — one record per person, one profile page. Do not create `insiderStories` as a separate collection.

```ts
// collections/People.ts
import type { CollectionConfig } from 'payload';

export const People: CollectionConfig = {
  slug: 'people',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, admin: { position: 'sidebar' } },
    { name: 'jobTitle', type: 'text' },
    { name: 'shortBio', type: 'text', admin: { description: 'AI citation length — 2–3 sentences.' } },
    {
      name: 'bio',
      type: 'richText',
      localized: true,
      admin: { description: 'The full "You, Me & Berlin" letter/story. Write natively per locale, du register.' },
    },
    { name: 'quote', type: 'text', admin: { description: 'Pull quote / signature line.' } },
    { name: 'video', type: 'text', admin: { description: 'YouTube/Vimeo embed URL, optional.' } },
    {
      name: 'portrait',
      type: 'upload',
      relationTo: 'media',
      fields: [{ name: 'altText', type: 'text', required: true }],
    },
    { name: 'website', type: 'text' },
    { name: 'instagram', type: 'text' },
    { name: 'roomNumber', type: 'text', admin: { description: 'Physical room where their welcome letter is placed.' } },
    { name: 'basedIn', type: 'text', admin: { description: 'e.g. "Neukölln"' } },
    {
      name: 'type',
      type: 'select',
      options: ['artist', 'curator', 'host', 'partner', 'staff', 'local'],
      required: true,
    },
    { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
    { name: 'relatedVenue', type: 'relationship', relationTo: 'venues' },
    {
      name: 'authority',
      type: 'group',
      fields: [
        {
          name: 'identifier',
          type: 'array',
          fields: [
            { name: 'propertyID', type: 'select', options: ['Wikidata', 'GND', 'VIAF', 'GoogleKG'], required: true },
            { name: 'value', type: 'text', required: true },
          ],
        },
        { name: 'sameAs', type: 'array', fields: [{ name: 'url', type: 'text', required: true }] },
      ],
    },
    {
      name: 'picks',
      type: 'join',
      collection: 'neighbourhood-places',
      on: 'endorsements.person',
      admin: { description: 'Read-only — auto-populated from neighbourhoodPlaces.endorsements. Do not hand-maintain.' },
    },
    { name: 'status', type: 'select', options: ['draft', 'published'], defaultValue: 'draft', required: true },
  ],
};
```

**⚠️ Payload version check:** the `join` field type (used for `picks`) requires Payload 3.7+. Confirm the project's installed version supports it before building — if not, fall back to a manually-maintained `neighbourhoodPicks: relationship → neighbourhood-places (hasMany)` field on `people` and keep both sides in sync via an `afterChange` hook on `neighbourhood-places` instead. Flag this in the PR either way so we know which path was taken.

### 1.2 `neighbourhood-places`

```ts
// collections/NeighbourhoodPlaces.ts
import type { CollectionConfig } from 'payload';

export const NeighbourhoodPlaces: CollectionConfig = {
  slug: 'neighbourhood-places',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, admin: { position: 'sidebar' } },
    {
      name: 'category',
      type: 'select',
      options: ['Art', 'Bar', 'Kids', 'Museum', 'Parks and Nature', 'Party', 'Restaurant', 'Shopping', 'Sightseeing'],
      required: true,
    },
    {
      name: 'schemaType',
      type: 'select',
      options: ['TouristAttraction', 'LocalBusiness', 'Museum', 'Park', 'Restaurant', 'BarOrPub', 'ShoppingCenter'],
      required: true,
      admin: { description: 'Drives the JSON-LD @type — see category→schemaType mapping table below.' },
    },
    {
      name: 'address',
      type: 'group',
      fields: [
        { name: 'streetAddress', type: 'text' },
        { name: 'addressLocality', type: 'text', defaultValue: 'Berlin', required: true },
        { name: 'postalCode', type: 'text' },
      ],
    },
    {
      name: 'geo',
      type: 'group',
      fields: [
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
      ],
    },
    { name: 'walkingMinutes', type: 'number' },
    {
      name: 'distanceTier',
      type: 'select',
      options: ['walkable', 'short-transit', 'further-out'],
      admin: { description: 'Default filter on /nachbarschaft is "walkable". See distance-tier note below.' },
    },
    { name: 'indoorOutdoor', type: 'select', options: ['indoor', 'outdoor', 'both'] },
    {
      name: 'targetAudience',
      type: 'array',
      fields: [{ name: 'label', type: 'text' }],
      admin: { description: 'xlsx "Zielgruppe" column — e.g. Alle, Kunstinteressierte, Freunde & Paare.' },
    },
    { name: 'description', type: 'text', localized: true },
    {
      name: 'endorsements',
      type: 'array',
      admin: { description: 'hasMany by design — see Schloss Charlottenburg case in aeo-schema fixtures.' },
      fields: [
        { name: 'person', type: 'relationship', relationTo: 'people', required: true },
        { name: 'quote', type: 'text', required: true, admin: { description: 'Becomes reviewBody. Per-endorsement, not per-place.' } },
      ],
    },
    { name: 'website', type: 'text' },
    { name: 'openingHours', type: 'text' },
    { name: 'priceRange', type: 'text' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'authority',
      type: 'group',
      fields: [
        {
          name: 'identifier',
          type: 'array',
          fields: [
            { name: 'propertyID', type: 'select', options: ['Wikidata', 'GND', 'GoogleKG', 'GooglePlaceID'], required: true },
            { name: 'value', type: 'text', required: true },
          ],
        },
        { name: 'sameAs', type: 'array', fields: [{ name: 'url', type: 'text', required: true }] },
      ],
    },
    { name: 'associatedRoom', type: 'text', admin: { description: 'xlsx "Room" column.' } },
    { name: 'status', type: 'select', options: ['active', 'inactive'], defaultValue: 'active', required: true },
  ],
};
```

**Category → schemaType mapping (fill in on seed, don't leave to editor judgment):**

| xlsx category | schemaType |
|---|---|
| Art | TouristAttraction (or Museum if it's literally a museum) |
| Museum | Museum |
| Bar | BarOrPub |
| Restaurant | Restaurant |
| Shopping | ShoppingCenter (or LocalBusiness if a single small shop) |
| Parks and Nature | Park |
| Sightseeing | TouristAttraction |
| Party | LocalBusiness *(no closer schema.org fit — flag if this feels wrong once real Party-category places are seeded)* |
| Kids | *(not a distinct schemaType — use the schemaType of the underlying place; "Kids" lives in `targetAudience` instead, not `category`. If the xlsx truly needs "Kids" as a standalone category rather than an audience tag, raise this back to us before seeding — it changes the mapping table.)* |

---

## Section 2 — Wire up the `aeo-schema` package

1. Copy the provided `aeo-schema/` folder into the repo, e.g. `packages/aeo-schema/` (or `lib/aeo-schema/` if the project isn't using a monorepo/workspace structure — either is fine, just be consistent with how other shared libs are organised).
2. Add it as a workspace dependency (or path import) from the Next.js app.
3. **`src/lib/config.ts` is the single file to edit** if/when the other pages' German slugs get confirmed. Do not hardcode paths anywhere else.
4. Write the **data-resolution layer** (not included in the package — this is Payload-specific and belongs in the app, not the pure library):

```ts
// lib/resolvePlace.ts
import { getPayload } from 'payload';

export async function getResolvedPlace(slug: string) {
  const payload = await getPayload({ /* config */ });
  const result = await payload.find({
    collection: 'neighbourhood-places',
    where: { slug: { equals: slug } },
    depth: 2, // must be ≥2 to resolve endorsements.person into full Person objects
    limit: 1,
  });
  return result.docs[0] ?? null;
}
```

`depth: 2` is the important detail here — `buildPlacePageGraph` expects `endorsements[].person` to already be the resolved `Person` object, not just an id. Getting this depth wrong is the most likely bug: it will silently produce a graph missing the reviewer's data rather than throwing, so check it explicitly in a smoke test after wiring this up.

5. **Render the graph** in each page:

```tsx
// app/[locale]/nachbarschaft/[slug]/page.tsx
import { buildPlacePageGraph, defaultConfig } from '@hotel-berlin/aeo-schema';
import { getResolvedPlace } from '@/lib/resolvePlace';
import { notFound } from 'next/navigation';

export default async function PlacePage({ params }: { params: { slug: string } }) {
  const place = await getResolvedPlace(params.slug);
  if (!place || place.status !== 'active') notFound();

  const graph = buildPlacePageGraph(place, defaultConfig);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
      />
      {/* stub content render — full layout TBC, see scope note above */}
      <main>
        <h1>{place.name}</h1>
        <p>{place.description}</p>
      </main>
    </>
  );
}
```

Same pattern for `app/[locale]/you-me-and-berlin/[slug]/page.tsx` using `buildPersonPageGraph`, and for the two listing pages using `buildNeighbourhoodListGraph` / `buildPeopleListGraph`.

---

## Section 3 — Routing (`next-intl` pathnames)

```ts
// i18n/pathnames.ts
export const pathnames = {
  '/': '/',
  '/here': { en: '/here', de: '/hier' },
  '/neighbourhood': { en: '/neighbourhood', de: '/nachbarschaft' },
  '/neighbourhood/[slug]': { en: '/neighbourhood/[slug]', de: '/nachbarschaft/[slug]' },
  '/you-me-berlin': { en: '/you-me-and-berlin', de: '/you-me-and-berlin' },
  '/you-me-berlin/[slug]': { en: '/you-me-and-berlin/[slug]', de: '/you-me-and-berlin/[slug]' },

  // Placeholder — NOT final, do not let these reach production before sign-off:
  '/rooms': { en: '/rooms', de: '/rooms' },
  '/restaurant': { en: '/restaurant', de: '/restaurant' },
  '/meetings': { en: '/meetings', de: '/meetings' },
} satisfies Pathnames;
```

**Hard rule for this PR:** every internal `<Link>` must reference the canonical key (`/neighbourhood`, not a raw string), via next-intl's own `Link`/`redirect`/`usePathname`. No hardcoded `href="/de/nachbarschaft"` anywhere. This is what keeps the placeholder rooms/restaurant/meetings slugs a one-line fix later instead of a repo-wide find-and-replace.

---

## Section 4 — `/nachbarschaft` page (listing)

- **Map** — full Mapbox GL JS (not the static homepage teaser). Single pin colour (existing "Neighbourhood" green token), category differentiated by icon glyph inside the pin, not by pin colour.
- **Filter bar** — category chips (9 xlsx categories), distance-tier toggle (default **walkable**, explicit "show further out" expansion — proximity is the core signal for this page, don't dilute it by defaulting to citywide), indoor/outdoor toggle.
- **All filter/search/pagination state lives in URL query params** (`?category=art&search=kreuzberg&page=2`), server-rendered, not client-side state. Canonical tag on every filtered/paginated variant points back to unfiltered `/nachbarschaft` (page 1) to avoid diluting authority across filter-combination URLs.
- **Grid** — `PlaceCard`: name, category icon+label, walking time, description, stacked recommender chips (one per `endorsement`, linking to `/you-me-and-berlin/[person-slug]`).
- **Pagination** — classic numbered pages, not infinite scroll/load-more (crawlability).
- **JSON-LD** — `buildNeighbourhoodListGraph`, full unfiltered list, regardless of what's currently visible client-side (pagination is a UX concern; the JSON-LD should describe the complete data set).
- **Bridge CTA** to `/you-me-and-berlin`.

## Section 5 — `/you-me-and-berlin` page (listing)

Same filter/search/pagination mechanics as Section 4 (URL query params, canonical tag, numbered pages, page size 24). Filter by `tags` (interest) rather than district. `PersonCard`: photo, name, role, room number, one-line bio. Intro block framing the 500-personality network. Bridge CTA back to `/nachbarschaft`.

**Shared components with Section 4:** filter-chip bar (generic, parameterized by option list), pagination control, the map component (smaller instance reused on the homepage teaser).

---

## Section 6 — Accessibility (build-time, not audit-pass)

Same standard as the rest of the site (see HomepageV2 and HerePage briefs) — repeated here because these are new pages, not an update to existing ones:

- Map: every pin `focusable: true`, keyboard Tab + Enter to open popup, `role="application"` with descriptive `aria-label`, `<noscript>` fallback listing the hotel's own address/transit info.
- Filter chips are real `<button>`s with `aria-pressed`, not styled `<div>`s.
- Pagination controls are a `<nav aria-label="Pagination">` with real links, current page marked `aria-current="page"`.
- All portrait/place images require `altText` — Payload should not allow save without it (same rule as `HerePage_BuildBrief.md`).
- `prefers-reduced-motion` respected on any card/filter transition.

---

## Definition of done

- [ ] `People` collection created, `insiderStories` collection **not** created (folded in)
- [ ] `NeighbourhoodPlaces` collection created with `endorsements` as an array (not a single relationship)
- [ ] `people.picks` join field confirmed working against installed Payload version, or documented fallback (`afterChange` hook) implemented instead
- [ ] `aeo-schema` package integrated, `npm test` passes inside the monorepo/app context exactly as it did standalone
- [ ] `getResolvedPlace`/`getResolvedPerson` fetch with `depth: 2`, confirmed via a manual check that `endorsements[].person` is a full object, not an id string, before wiring into `buildPlacePageGraph`
- [ ] `pathnames.ts` created, all internal links use canonical keys — grep the diff for raw `href="/de/` or `href="/en/` strings, there should be none
- [ ] `/nachbarschaft` renders: map, filter bar, paginated grid, all three driven by URL query params
- [ ] `/you-me-and-berlin` renders: intro, filter bar, paginated grid (24/page)
- [ ] `/nachbarschaft/[slug]` and `/you-me-and-berlin/[slug]` stub pages render with correct JSON-LD (validate with Google's Rich Results Test against a local tunnel before merging)
- [ ] Canonical tags correct on filtered/paginated URL variants
- [ ] Category → schemaType mapping table above applied at seed time, "Party" and "Kids" special cases flagged back if they don't fit cleanly
- [ ] No `reviewRating` anywhere in rendered output (should be structurally impossible given the builder, but check the rendered page source once as a sanity check)
