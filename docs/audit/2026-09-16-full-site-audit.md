# Hotel Berlin, Berlin — Full-Site Audit

*Report only. Written 2026-09-16. Nothing in the repo was changed except this file.*

Dev database: `postgresql://bescohome@localhost:5432/hotelberlin`.  
Running process: `npm run dev` (Next.js 16.2.6).  
Branch: `feat/map-section-places-people`.

Runtime note used throughout §§1, 3, 4, 9, 10: **`/de` and `/en` return 200. Nested locale routes (`/de/hier`, `/de/zimmer`, `/de/nachbarschaft`, `/en/here`, …) return the Next.js default 404** after a successful next-intl rewrite (`x-middleware-rewrite: /de/here` etc.). The page files exist. This is the live server state on 2026-09-16.

---

## 1. Route inventory

### 1. Routes under `src/app/[locale]/`

`generateStaticParams` exists only on the locale layout plus two slug pages. All other pages: **no**.

| File | `generateStaticParams` | Renders |
|------|------------------------|---------|
| `src/app/[locale]/page.tsx` | no (locales from layout `src/app/[locale]/layout.tsx:76-78`) | **Payload with seed/static fallback** via children (hero slides, rooms, meetings, events, FAQs, map) |
| `src/app/[locale]/here/page.tsx` | no | **mixed Payload + i18n + local stand-in images** |
| `src/app/[locale]/here/events/page.tsx` | no | **Payload** `getEventOccurrences` (`here/events/page.tsx:44-49`) |
| `src/app/[locale]/here/explore/page.tsx` | no | **Payload** neighbourhood tips (`here/explore/page.tsx:88-90`) |
| `src/app/[locale]/here/dining/page.tsx` | no | **Payload** venues + hotel, i18n fallbacks |
| `src/app/[locale]/here/faq/page.tsx` | no | **Payload** guest FAQs (`here/faq/page.tsx:32`) |
| `src/app/[locale]/here/art/page.tsx` | no | **stub-ish + Payload exhibition** (`resolveTonightHero`); murals from `HERE_IMAGES`; kicker `inProgress` |
| `src/app/[locale]/here/gallery/page.tsx` | no | **stub + Payload exhibition** (`resolveTonightHero`); kicker `inProgress` |
| `src/app/[locale]/here/wallride/page.tsx` | no | **stub** (i18n only; kicker `inProgress`) |
| `src/app/[locale]/here/getting-around/page.tsx` | no | **stub** (i18n only; kicker `inProgress`) |
| `src/app/[locale]/rooms/page.tsx` | no | **Payload** `getAllRooms` / `getRoomsPageContent` (`rooms/page.tsx:58-59`) |
| `src/app/[locale]/rooms/[slug]/page.tsx` | **yes** `rooms/[slug]/page.tsx:33-39` | **Payload**; `notFound()` if missing |
| `src/app/[locale]/meetings/page.tsx` | no | **Payload + hardcoded meetings-global fallback** |
| `src/app/[locale]/meetings/[slug]/page.tsx` | **yes** `meetings/[slug]/page.tsx:38-44` | **Payload**; `notFound()` |
| `src/app/[locale]/meetings/request/page.tsx` | no | **Payload** inquiry form |
| `src/app/[locale]/meetings/hybrid/page.tsx` | no | **stub** `createScaffoldPage('meetings-hybrid')` |
| `src/app/[locale]/restaurant/page.tsx` | no | **Payload** `getVenueBySlug('lutze')`; `notFound()` if missing |
| `src/app/[locale]/neighbourhood/page.tsx` | no | **Payload** `getNeighbourhoodPlaces` |
| `src/app/[locale]/neighbourhood/[slug]/page.tsx` | no | **Payload**; `notFound()` |
| `src/app/[locale]/you-me-berlin/page.tsx` | no | **Payload** people + places |
| `src/app/[locale]/you-me-berlin/[slug]/page.tsx` | no | **Payload**; `notFound()` |
| `src/app/[locale]/happenings/page.tsx` | no | **Payload** `getEventOccurrences` |
| `src/app/[locale]/faq/page.tsx` | no | **Payload** prospect FAQs |
| `src/app/[locale]/privacy/page.tsx` | no | **Payload with static JSON fallback** (`LegalPageView`) |
| `src/app/[locale]/imprint/page.tsx` | no | **Payload with static JSON fallback** |
| `src/app/[locale]/terms/page.tsx` | no | **Payload with static JSON fallback** |
| `src/app/[locale]/cookies/page.tsx` | no | **Payload with static JSON fallback** |
| `src/app/[locale]/disclaimer/page.tsx` | no | **Payload with static JSON fallback** |
| `src/app/[locale]/about/page.tsx` | no | **stub** scaffold |
| `src/app/[locale]/people/page.tsx` | no | **stub** scaffold |
| `src/app/[locale]/on-the-walls/page.tsx` | no | **stub** scaffold |
| `src/app/[locale]/accessibility/page.tsx` | no | **stub** scaffold |
| `src/app/[locale]/sustainability/page.tsx` | no | **stub** scaffold |
| `src/app/[locale]/contact/page.tsx` | no | **stub** + hotel facts with hardcoded address fallback (`ScaffoldPageView`) |
| `src/app/[locale]/amenities/page.tsx` | no | **stub** scaffold |
| `src/app/[locale]/awards/page.tsx` | no | **stub** scaffold |
| `src/app/[locale]/offers/page.tsx` | no | **stub** scaffold |
| `src/app/[locale]/policies/cancellation/page.tsx` | no | **stub** scaffold |
| `src/app/[locale]/policies/check-in/page.tsx` | no | **stub** scaffold |
| `src/app/[locale]/policies/pets/page.tsx` | no | **stub** scaffold |
| `src/app/[locale]/policies/fees/page.tsx` | no | **stub** scaffold |
| `src/app/[locale]/policies/payment/page.tsx` | no | **stub** scaffold |
| `src/app/[locale]/map-styles/page.tsx` | no | **stub / internal tool** (English UI) |

Also: `src/app/page.tsx` — `redirect('/de')` (`src/app/page.tsx:4`). No `generateStaticParams`. No UI.

No `error.tsx` / `loading.tsx` under `src/app`. `not-found.tsx` only under Payload admin.

### 2. `src/i18n/pathnames.ts` (full)

```ts
export const pathnames = {
  '/': '/',
  '/here': { en: '/here', de: '/hier' },
  '/here/events': { en: '/here/events', de: '/hier/events' },
  '/here/getting-around': { en: '/here/getting-around', de: '/hier/getting-around' },
  '/here/explore': { en: '/here/explore', de: '/hier/explore' },
  '/here/gallery': { en: '/here/gallery', de: '/hier/gallery' },
  '/here/dining': { en: '/here/dining', de: '/hier/dining' },
  '/here/faq': { en: '/here/faq', de: '/hier/faq' },
  '/here/art': { en: '/here/art', de: '/hier/art' },
  '/here/wallride': { en: '/here/wallride', de: '/hier/wallride' },
  '/neighbourhood': { en: '/neighbourhood', de: '/nachbarschaft' },
  '/neighbourhood/[slug]': {
    en: '/neighbourhood/[slug]',
    de: '/nachbarschaft/[slug]',
  },
  '/map-styles': { en: '/map-styles', de: '/map-styles' },
  '/you-me-berlin': { en: '/you-me-and-berlin', de: '/you-me-and-berlin' },
  '/you-me-berlin/[slug]': {
    en: '/you-me-and-berlin/[slug]',
    de: '/you-me-and-berlin/[slug]',
  },
  '/rooms': { en: '/rooms', de: '/zimmer' },
  '/rooms/[slug]': {
    en: '/rooms/[slug]',
    de: '/zimmer/[slug]',
  },
  '/meetings': { en: '/meetings', de: '/tagungen' },
  '/meetings/[slug]': {
    en: '/meetings/[slug]',
    de: '/tagungen/[slug]',
  },
  '/meetings/request': {
    en: '/meetings/request',
    de: '/tagungen/anfrage',
  },
  '/meetings/hybrid': {
    en: '/meetings/hybrid',
    de: '/tagungen/hybrid',
  },
  '/restaurant': { en: '/restaurant', de: '/restaurant' },
  // Placeholder — NOT final, do not let these reach production before sign-off:
  '/happenings': { en: '/happenings', de: '/happenings' },
  '/offers': { en: '/offers', de: '/angebote' },
  '/faq': { en: '/faq', de: '/faq' }, // PLACEHOLDER — German slug not yet confirmed
  '/faqs': { en: '/faqs', de: '/faqs' }, // legacy alias — prefer /faq
  '/imprint': { en: '/imprint', de: '/impressum' },
  '/privacy': { en: '/privacy', de: '/datenschutz' },
  '/terms': { en: '/terms', de: '/agb' },
  '/cookies': { en: '/cookies', de: '/cookies' },
  '/disclaimer': { en: '/disclaimer', de: '/haftungsausschluss' },
  '/about': { en: '/about', de: '/ueber-uns' },
  '/people': { en: '/people', de: '/menschen' },
  '/on-the-walls': { en: '/on-the-walls', de: '/on-the-walls' },
  '/accessibility': { en: '/accessibility', de: '/barrierefreiheit' },
  '/sustainability': { en: '/sustainability', de: '/nachhaltigkeit' },
  '/contact': { en: '/contact', de: '/kontakt' },
  '/amenities': { en: '/amenities', de: '/ausstattung' },
  '/awards': { en: '/awards', de: '/auszeichnungen' },
  '/policies/cancellation': {
    en: '/policies/cancellation',
    de: '/richtlinien/stornierung',
  },
  '/policies/check-in': {
    en: '/policies/check-in',
    de: '/richtlinien/check-in',
  },
  '/policies/pets': { en: '/policies/pets', de: '/richtlinien/haustiere' },
  '/policies/fees': { en: '/policies/fees', de: '/richtlinien/parken' },
  '/policies/payment': {
    en: '/policies/payment',
    de: '/richtlinien/zahlung',
  },
} as const satisfies Pathnames<readonly ['de', 'en']>
```

**Nachbarschaft brief §3 vs live pathnames — both quoted, no winner.**

Brief (`doc/here/HotelBerlin_NachbarschaftYouMeBerlin_BuildBrief.md` §3):

> `'/rooms': { en: '/rooms', de: '/rooms' },`  
> `'/restaurant': { en: '/restaurant', de: '/restaurant' },`  
> `'/meetings': { en: '/meetings', de: '/meetings' },`

Live (`src/i18n/pathnames.ts:29-48`):

> `'/rooms': { en: '/rooms', de: '/zimmer' },`  
> `'/meetings': { en: '/meetings', de: '/tagungen' },`  
> `'/restaurant': { en: '/restaurant', de: '/restaurant' },`

Still identical DE/EN (placeholder-style): `/restaurant`, `/happenings`, `/faq`, `/faqs`, `/cookies`, `/map-styles`, `/on-the-walls`, `/you-me-and-berlin`.  
`/rooms` and `/meetings` are **no longer** identical; DE is `/zimmer` and `/tagungen`. The file still comments `/happenings` and `/faq` as placeholders (`pathnames.ts:49-52`).

### 3. Both `/de` and `/en`?

Pathnames define both locales for every key above. Cross-slug 307s work (`/de/rooms` → `/de/zimmer`, `/en/zimmer` → `/en/rooms`, `/de/meetings` → `/de/tagungen`).

Against the running dev server (curl + browser, 2026-09-16):

| URL | Status |
|-----|--------|
| `/` | 307 → `/de` |
| `/de` | **200** |
| `/en` | **200** |
| `/de/hier`, `/en/here`, `/de/zimmer`, `/en/rooms`, `/de/tagungen`, `/en/meetings`, `/de/restaurant`, `/de/nachbarschaft`, `/de/you-me-and-berlin`, `/de/happenings`, `/de/faq`, `/de/hier/*`, legal, scaffolds, `/de/map-styles` | **404** (Next default 404 HTML; rewrite header still set) |
| `/book` | 307 → `/de/book` then **404** |
| `/de/faqs`, `/en/faqs` | **404** (pathname exists, **no page file**) |

Not a one-locale-only failure: **both locales 404 on nested routes**. Homepage works in both.

### 4. Hardcoded internal hrefs that bypass next-intl `Link`

Grep for `href="/de/` and `href="/en/`: **none** in `src/`.

Raw strings that do **not** use next-intl `Link`:

| Location | What |
|----------|------|
| `src/app/page.tsx:4` | `redirect('/de')` (`next/navigation`, not next-intl) |
| `src/components/layout/SiteNav.tsx:220,248` | `<a href="/book">` |
| `src/components/layout/FooterColumn.tsx:26-42` | raw `<a>` when `external` or `href.startsWith('/book')` |
| `src/components/layout/BookDirectStrip.tsx:15` | `SweepCta` `unlocalized` to footer `ctaUrl` (seed `/book`, `src/seed/data/footer.ts:60`) |
| `src/components/layout/NavSecondary.tsx:76-77` | `<a href="#">` for `comingSoon` |
| `src/app/[locale]/layout.tsx:67` | `<a href="#main-content">` (skip link) |
| `src/components/meetings/MeetingsHero.tsx:161` | `SweepCta href="#anfrage" unlocalized` |

Canonical-key `href="/rooms"` etc. on next-intl `Link` (`SiteNav.tsx:125-126`, teasers, hub CTAs) are pathname keys, not `/de/...` strings.

Footer **seed** stores internal destinations as `linkType: 'external'` with urls like `'/rooms'` (`src/seed/data/footer.ts:7-13,81`). Fallback mapper `ext()` only marks `http` as external (`src/lib/payload/footerFallback.ts:15`). Live footer therefore depends on CMS `linkType`.

### 5. Orphaned routes (file exists, not linked from nav / footer / card / CTA)

Linked from primary nav (`SiteNav.tsx:27-33`): `/rooms`, `/meetings`, `/restaurant`, `/happenings`, `/neighbourhood`.  
Inside nav (DB `navigation_secondary_links`): `/here/events`, `/here/getting-around`, `/here/explore`, `/here/gallery`, `/here/wallride`.  
Footer seed/fallback: rooms, policies, `/here/dining`, `/on-the-walls`, `/faq`, `/contact`, `/accessibility`, `/about`, `/sustainability`, `/here`, `/here/events`, `/here/art`, `/here/faq`, `/neighbourhood`, legal (imprint/privacy/terms/cookies/accessibility — **not disclaimer** in the live global).

**Orphaned or only self-linked:**

| Route | Notes |
|-------|--------|
| `/map-styles` | no nav/footer/CTA |
| `/people` (`/menschen`) | not in footer; only scaffold related-links |
| `/offers` | not in live footer |
| `/amenities` | not in live footer (redirects from old Galaxy URLs exist) |
| `/awards` | not in live footer |
| `/meetings/hybrid` | scaffold related-links only |
| `/disclaimer` | page file exists; **live footer legal row omits it** (DB: 5 legal links, no disclaimer) |
| `/faqs` | pathname only — **no route file** (see §6) |
| `/you-me-berlin` | linked from neighbourhood page CTA (`neighbourhood/page.tsx:275`), not from main nav/footer |

`/here/art` is not in the five inside-nav slots; it is linked from hub art heading, art wall, gallery, footer “Kunstprogramm”.

### 6. Dead links (linked, no route file)

| Destination | Linked from | Route file |
|-------------|-------------|------------|
| `/book` | `SiteNav.tsx:220,248`; footer book-direct `ctaUrl` | **does not exist** |
| `/faqs` | pathname alias only; no in-app `href` found | **does not exist** |
| `/here/events/[slug]` | **does not exist** as a page; hub/happenings do not link one | — |

Footer Superior / Comfort / Suites / Studio 45 all point at `/rooms` (file exists). Lost & Found points at `/faq` (file exists). Careers is external.

---

## 2. Payload

No collection or global sets Payload `versions` / `drafts`. Some collections have a **status select**, which is not CMS draft/publish.

### 7. Collections and globals

| Slug | File | Top-level fields | Localized fields | Dev DB |
|------|------|------------------|------------------|--------|
| `users` | `Users.ts:3` | 0 (auth defaults) | none | 1 doc; no draft/publish |
| `media` | `Media.ts:3` | 1 (`alt`) | none | **346** |
| `tags` | `Tags.ts:3` | 5 | `name`, `description` | **64** |
| `rooms` | `Rooms.ts:3` | 25 | `name`, `shortDescription`, `description`, `storyConnection.storyTeaser` | **11**; no `_status` |
| `meeting-rooms` | `MeetingRooms.ts:3` | 17 | `name`, `images.alt`, `shortDescription`, `description` | **21** |
| `meeting-documents` | `MeetingDocuments.ts:4` | 7 | `title`, `file` | **10** |
| `meeting-inquiries` | `MeetingInquiries.ts:18` | 17 | none | **0** |
| `venues` | `Venues.ts:5` | 26 | `name`, `tagline`, `description`, `shortDescription` | **5** (`fkkb`, `kttk`, `lutze`, `sissi`, `wundermart`) |
| `hero-slides` | `HeroSlides.ts:3` | 9 | `altText`, `captionOverride` | **4** |
| `faqs` | `FAQs.ts:3` | 7 | `question`, `answer` | **57** (16 prospect + 41 guest). 10 prospect rows **EN-only** (no `de` locale row) |
| `artists` | `Artists.ts:4` | 12 | `bio` | **2** |
| `artworks` | `Artworks.ts:4` | 12 | `description` | **0** |
| `exhibitions` | `Exhibitions.ts:4` | 12 | `description` | **1** |
| `events` | `Events.ts:4` | 20 | `name`, `description`, `shortDescription`, `bookingNote` | **4** |
| `people` | `People.ts:4` | 21 | `bio` | **16**: **6 published / 10 draft** (`people.status`) |
| `neighbourhood-places` | `NeighbourhoodPlaces.ts:5` | 24 | `description` | **21**, all `status=active` (not draft/publish) |
| `places` | `Places.ts:3` | 20 | none (`shortDescriptionDE` instead) | **14** |
| `pages` | `Pages.ts:3` | 4 | `title` | **26**: 1 `in-progress` (`here`) + 25 `skeleton` |
| `legal-documents` | `LegalDocuments.ts:13` | 5 | `title`, `updatedLabel`, `lede`, `body` | **5** |

Globals (one row each): `hotel` (`Hotel.ts:26`, 39 top-level), `homepage` (2), `navigation` (1), `footer` (9, many nested localized), `meetings` (1 tabs field, inner copy localized).

### 8. Empty collections

- `artworks`: **0**
- `meeting-inquiries`: **0**

### 9. Documents but no page/resolver consumer

- **`places`**: 14 docs. Runtime maps use `neighbourhood-places` or `src/lib/data/places.json` via `src/lib/queries/places.ts`, not `payload.find({ collection: 'places' })`.
- **`artists`**: 2 docs (test-events seed). No page `find` on `artists`.
- **`pages`**: 26 CMS records drive nav/footer relationships; no frontend lists CMS `pages` as article content.
- **`users`**: admin only.

### 10. Person ↔ place endorsement

Place → person, **relationship** (not a text field), on an **array**:

```171:198:src/collections/NeighbourhoodPlaces.ts
    {
      name: 'endorsements',
      type: 'array',
      ...
      fields: [
        {
          name: 'person',
          type: 'relationship',
          relationTo: 'people',
          required: true,
        },
        {
          name: 'quote',
          type: 'text',
          required: true,
          ...
        },
        {
          name: 'associatedRoom',
          type: 'text',
          ...
        },
      ],
    },
```

Reverse: People `picks` is a Payload **join** (`People.ts:107-118`) on `endorsements.person`.

### 11. Real media vs `picsum.photos`

| Collection | CMS image state | picsum in DB |
|------------|-----------------|--------------|
| `media` | 346 uploaded files | **0** urls/filenames containing `picsum` |
| `neighbourhood-places` | **0 / 21** have `image_id` | none |
| `people` portraits | 5 of 6 published hosts have media ids 342–346 | none |
| rooms / venues / events | filenames in DB; many `/api/media/file/…` **404** on the running server (terminal) | none |

`next.config.ts:49-53` still allows `picsum.photos`. `getHubTips.ts:79-80` **rejects** picsum at card-build time.

Placeholders in use: Wikimedia/Unsplash map (`src/lib/places/teaserImageFallbacks.ts`), plus `HERE_IMAGES` Unsplash/local (`src/lib/here/images.ts:4-7`).

**Holocaust Memorial** (`neighbourhood_places.slug = holocaust-memorial`): `image_id` **null**. Fallback is Wikimedia `Holocaust_Memorial_Berlin.JPG` (`teaserImageFallbacks.ts:55-59`). Test `tests/int/hub-tips.int.spec.ts:86` asserts a memorial photo, not a random landscape. **Not the 8 Sept inappropriate placeholder in current code/DB.**

Amenity tags `double-bed` / `free-wifi` / `nespresso`: DE locale name is still the English string (`tags_locales`).

### 12. You, Me & Berlin portraits

Imported and linked in DB:

| Slug | status | `portrait_id` | media filename |
|------|--------|---------------|----------------|
| `iris-berndt` | published | 342 | `iris-berndt.jpg` |
| `christiane-fritsch-weith` | published | 343 | `christiane-fritsch-weith.jpg` |
| `jennifer-oeser` | published | 344 | `jennifer-oeser.jpg` |
| `kristiane-kegelmann` | published | 345 | `kristiane-kegelmann.jpg` |
| `gita-kurdpoor` | published | 346 | `gita-kurdpoor.jpg` |
| `katja-morkel` | published | **null** | seed `ymb-portraits.ts:8,41,112-118` clears `portrait: null` |

`gita-kudpoor` appears as a typo slug in v1 seed JSON; curated/ymb use `gita-kurdpoor`. Hub tip copy maps both (`HereTipsSection.tsx:32-33`).

`HerePeopleSection` (the four-person hub row) is **not mounted** on `/here` (see §4). Portraits still attach on `/you-me-and-berlin` via the people collection.

---

## 3. Outside context — page by page

### 13–15. Built state, briefs, copy

#### Homepage — `src/app/[locale]/page.tsx`

**Partially built.** File composes `HomeHero`, `RoomsHero`→`RoomsTeaser`, `MeetingsSection`, `EventsSection`, `LutzeSection`, `NeighbourhoodMapSection`, `FAQSection`, `SiteFooter` (`page.tsx:35-52`).

`HotelBerlin_HomepageV2_BuildBrief.md` (no formal DoD). Quoted goal: client-facing site shows only Header + Hero + Rooms teaser; wrap the rest in a feature flag.

| V2 item | Status | Evidence |
|---------|--------|----------|
| Header/nav | ✅ | `page.tsx:39` |
| Hero | ⚠️ | Present; brief forest `#4F674F` / ~58% vs live `#56674F` and 33/67 (`HomeHeroLayout.tsx` comments; `tailwind` `hbb-forest`) |
| Rooms teaser | ✅ | `RoomsHero.tsx` wraps `RoomsTeaser.tsx:7-28` |
| Hide meetings | ❌ | `page.tsx:42` always renders |
| Hide events | ❌ | `page.tsx:44` |
| Hide map | ❌ | `page.tsx:47` |
| FAQ live | ✅ | `page.tsx:48` |
| Hide footer | ❌ | `page.tsx:50` |
| Lutze block | ⚠️ | Extra vs “top only” (`page.tsx:46`) |

Copy: i18n DE/EN for hero (`de.json` `hero.headingLine1` “Deine Berliner”). Section title **Sleep & Relax** is English on `/de` (browser). Amenity pills **Double bed / Free WiFi / Nespresso machine** are English in both tag locales. Magwie card body on homepage is English (“Magdalena Wiegner (Magwie) invites you…”).

#### `/rooms` · `/zimmer` — `src/app/[locale]/rooms/page.tsx` + `[slug]`

**Built in code** (index + detail + JSON-LD). **404 on the running server.**

`HotelBerlin_RoomsPages_BuildBrief.md` (no DoD). RoomsHero addendum schema/seed: 11 rooms in DB. Individual QA: bed type still `"double"` in seed; `featuredAmenities` not in `rooms.json`.

| Item | Status |
|------|--------|
| `/rooms` · `/zimmer` pathnames | ✅ `pathnames.ts:29-33` |
| Index + `RoomIndexCard` + nav rail + compare | ⚠️ index is a single column, not 2-up; rail has no from-price |
| Detail gallery / specs / amenities | ✅ in files |
| JSON-LD HotelRoom / ItemList | ✅ |
| `insiderStory` replaces `storyConnection` | ❌ still `storyConnection` (`Rooms.ts:196-202`) |
| `homepageTeaser.featuredAmenities` seed | ❌ |

Copy: room names localized both locales in `rooms_locales`. Amenity tag names English in DE.

#### `/meetings` — `src/app/[locale]/meetings/page.tsx`

**Built in code.** **404 live.**

| Brief section | Status |
|---------------|--------|
| Hero | ✅ `MeetingsHero` |
| Document library | ✅ |
| Room finder | ✅ |
| Event-type tiles | ✅ |
| Hybrid teaser | ✅ |
| Food & Drink teaser | ✅ |
| Facilities | ✅ |
| Closing CTA band | ⚠️ inquiry section instead of a separate teal band |
| Detail + `/meetings/request` | ✅ files exist |

22 rooms in the meetings brief vs **21** seed records (`meeting_rooms` slugs listed in §8 Q45).

Copy: meetings global + i18n; fallbacks in `lib/payload/meetings.ts`.

#### Eat & drink `/restaurant`

**Built in code** (Lütze page). **404 live.** Garden subsection and KTTK/Wundermart cross-links: **❌** not in `restaurant/page.tsx`. Breakfast from hotel global: ✅. `/restaurant` identical DE/EN: ✅ `pathnames.ts:48`.

#### `/nachbarschaft` · `/you-me-and-berlin`

**Built in code.** **404 live.**

NachbarschaftYouMeBerlin DoD:

| Item | Status |
|------|--------|
| People collection; no `insiderStories` | ✅ |
| NeighbourhoodPlaces + endorsements array | ✅ |
| `people.picks` join | ✅ `People.ts:107-118` |
| aeo-schema integrated | ✅ |
| depth 2 resolvers | ✅ `lib/aeo/resolve.ts` |
| pathnames + no `/de/` hrefs | ✅ (grep empty) |
| listing + filters + pagination | ✅ in page files |
| `[slug]` + JSON-LD | ✅ |
| Canonical ignores filter query | ✅ `neighbourhood/page.tsx:59-65` (unfiltered URL) |
| No `reviewRating` | ✅ builder + tests |

Seed v2: 21 active places in DB (v2 addendum grew the set). Zero CMS images (see §2.11).

Copy: place `description` localized; names often proper nouns. YMB title in DE messages is still `"You, Me & Berlin"` (`de.json:932`).

#### Events / happenings

`HotelBerlin_Events_BuildBrief.md`: **does not exist** as a file. Recovered DoD from prior transcript only.

Happenings page file uses `getEventOccurrences` (`happenings/page.tsx`). `getEvents()` is exported (`lib/payload/events.ts:14`) and **not imported by any page**. Hub strip uses a separate resolver (`getHubStripCards.ts`). 4 event docs + 1 exhibition in DB. Copy mixed DE titles / EN exhibition body (homepage snapshot).

#### Footer V2

**Built.** `SiteFooter` on homepage and `here/layout.tsx:9`. Tokens, columns, Already Here, awards carousel, copyright year present. Live legal bar: Impressum, Datenschutz, AGB, Cookies, Barrierefreiheit — **no Disclaimer**. KTTK (not TKKT) in seed (`footer.ts:54,101`).

#### Responsive nav

**Built** (`SiteNav.tsx`). Observed on `/de`: skip link, wordmark, hamburger, Book Now, primary Zimmer|Meetings|Essen & Trinken|Happenings|Nachbarschaft, secondary **Was ist los | So kommst du hin | Die Nachbarschaft | Galerie | Wallride**.

DoD from `doc/navigation/HotelBerlin_ResponsiveNav_BuildBrief.md:134-149`:

| Item | Status |
|------|--------|
| One nav, context prop | ✅ `SiteNav.tsx:17-47` |
| Wordmark → `/` both contexts | ✅ `SiteNav.tsx:202-203` |
| CTA Book Now / Plan your next stay | ⚠️ EN string is **“Come back”** (`en.json:33`), DE **“Komm wieder”** (`de.json:33`) |
| Bridge ENTER/STAY | ✅ |
| &lt;480 wordmark/lang/hamburger | ⚠️ drawer has **no group labels** (`SiteNav.tsx:283-293`) |
| Home 480–767 primary on strip | ❌ primary only in drawer below 768; strip is lang+CTA (`245-252`) |
| 768–1099 three rows | ✅ |
| `/here` 480–767 promoted “What’s on tonight” | ❌ does not exist in `SiteNav` |
| ≥1100 two-row | ✅ |
| Hamburger / reduced motion | ✅ `globals.css` |
| No body scroll lock | ✅ |
| Drawer groups labeled | ⚠️ unlabeled |
| DESIGN.md §4 updated | ❌ still unchecked in the brief |

**Contradiction (quoted):** HerePage DoD: wordmark links to `/here` inside context (`doc/here/HotelBerlin_HerePage_BuildBrief.md` DoD). ResponsiveNav DoD: wordmark links to `/` on both. Code follows ResponsiveNav (`SiteNav.tsx:202`).

### 16. Nav bug check (`HotelBerlin_HubNeighbourhood_PeopleFirst.md`)

That brief **does not exist** as a file.

The reported old second nav was: `Schon im Haus? ENTER | Was ist los | So kommst du hin | Die Nachbarschaft | Galerie | Wallride`.

**Still the live outside-context row 2.** Browser on `/de` (2026-09-16): ENTER (labelled “Zum Gäste-Hub”) + those five links. Source: DB `navigation_secondary_links` titles `Was ist los`, `So kommst du hin`, `Die Nachbarschaft`, `Galerie`, `Wallride`; fallback copy `src/lib/payload/navigation.ts:10-25`; seed slugs `src/seed/data.ts:1290-1296`.

`/nachbarschaft` uses `SiteNavWithData context="outside"` (`neighbourhood/page.tsx:143`) — same second row. `/here` uses `context="inside"` (`here/layout.tsx:6`) so those five become **row 1**, not row 2. `/de/hier` and `/de/nachbarschaft` could not be re-checked in the browser because both 404.

---

## 4. Guest hub `/hier`

### 17. `HUB_SECTIONS` vs JSX

From `src/app/[locale]/here/page.tsx:24-68`:

```ts
export const HUB_SECTIONS = [
  'hero',
  'events',
  'dining',
  'inTheHouse',
  'art',
  'people',
  'neighbourhood',
  'help',
] as const
```

JSX render order:

1. `HereHero`
2. `HereHubStrip` (events)
3. `HereDiningSection`
4. `InTheHouseSection`
5. `ArtWallSection`
6. `HereTipsSection` (neighbourhood tips)
7. `HereHelpSection`

**They do not match.** `people` is in the array; `HerePeopleSection` is **not** rendered (`HerePeopleSection` only re-exported from `here/index.ts:23`). Array has no `dining` comment; dining is a real section.

### 18. Section-order PR DoD

`claude/HotelBerlin_HubOrder_CursorBrief.md`: **does not exist**. Recovered checklist vs code:

| Recovered item | Status |
|----------------|--------|
| Canonical order hero → events → inTheHouse → art → neighbourhood → goodToKnow → help; dining comment-only | ❌ array/JSX include dining; no `goodToKnow`; extra unused `people` |
| `TonightSection` gone | ✅ **does not exist** |
| `resolveTonightVenueCards` deleted | ✅ no matches |
| `resolveTonightHero` still exists | ✅ `src/lib/here/tonight.ts:66` |
| Kunst im Haus still on `/hier`, `/hier/art`, `/hier/gallery` | ⚠️ **in source**: hub `ArtWallSection` (`here/page.tsx:63`); art/gallery call `resolveTonightHero`. **Live `/de/hier*` 404.** |
| StayInfo / Aufenthalt gone from hub body | ✅ `StayInfoCard` unused; stay facts inlined in `HereHeroLayout.tsx:107-109` |
| Magwie × CokyOne exactly twice / KTTK twice | see §24 |

### 19. Five follow-up styling passes

`claude/HotelBerlin_HubDining_BuildBrief.md` and related `claude/` files: **do not exist**.

| Pass | Status | Evidence |
|------|--------|----------|
| **A** Essen & Trinken + `EditorialBand` | ⚠️ | `HereDiningSection` + `HereDiningBand` mounted (`here/page.tsx:58`, `HereDiningSection.tsx:30`). Band is a custom 2/3 photo layout (`HereDiningBand.tsx:44-47`), **not** `EditorialBand`. `EditorialBand.tsx` exists (`primitives/EditorialBand.tsx:39`) but is only imported by unused `ArtInBuildingSection` / `BasementSection`. `VenueCompactCard` unused. CTA `href="/here/dining"` (`HereDiningSection.tsx:26`). `OpenStatusBadge` in the band (`HereDiningBand.tsx:80`). `cardOnly` string wired (`HereDiningSection.tsx:36`). |
| **B** Im Haus eight-card grid | ✅ in source | `getInHouseAmenities.ts:177-185` “Eight Im Haus cards”; eight keys including pending `fingerboard` (`:236-246`). Rendered by `InTheHouseSection.tsx:72-80`. |
| **C** Kunst im Haus exhibition band + mural row | ⚠️ | Implemented in unused `ArtInBuildingSection.tsx:49-71` (`EditorialBand` 1:2 + four `ArtLocationCard`s). Hub actually mounts `ArtWallSection` mosaic (`here/page.tsx:63`, `ArtWallSection.tsx:47`). |
| **D** Gut zu wissen expansion | superseded | `here.goodToKnow` remains in `de.json:229` / `en.json:229` and is **not referenced** from components. No Gut zu wissen section in `here/page.tsx`. |
| **E** Brauchst du Hilfe? Guest Care + FAQ localisation | ⚠️ | Guest Care copy lives in the **hero** (`HereHero.tsx:94-97`, `HereHeroLayout`). Help block is FAQ accordion + A–Z CTA (`HereHelpSection.tsx:34-51`). Heading is `faqsHeading` “Häufig gefragt” (`de.json:177-178`), not `needHelp` “Brauchst du Hilfe?” (`de.json:177`) — `needHelp` is unused. FAQs fetched with `locale` (`getFaqs.ts:62-72`). |

### 20. 8 Sept Gut zu wissen merge

`claude/HotelBerlin_GutZuWissen_Merge_Prompt.md`: **does not exist**. Recovered DoD vs code:

| Item | Status |
|------|--------|
| GUT ZU WISSEN card gone | ✅ not in hub JSX; strings leftover in messages |
| One help block (Guest Care + FAQ + A–Z) | ⚠️ Guest Care in hero; FAQ+A–Z in `HereHelpSection` |
| No phone-ext placeholder | ✅ `here.help.guestCare.extension` is `""` (`de.json:185`); `HereHero.tsx:97` omits when empty |
| `/hier/faq` full A–Z both locales | ⚠️ **41 guest FAQs** in DB with DE+EN; page file `here/faq/page.tsx`; **live URL 404** |
| “Zahlung nur mit Karte” in Essen & Trinken | ✅ `de.json:85` `here.diningBand.cardOnly`; passed `HereDiningSection.tsx:36`; also `src/seed/guest-az-faqs.ts:227,576` |
| “Flughafenshuttle” anywhere | ✅ **not in product copy**. Only `tests/int/guest-az-faqs.int.spec.ts:52` (negative assertion) |
| No WiFi credentials as fact | ❌ see §8 Q41 — hero **does** render them |
| Parking 1,80 m | ✅ asserted in `guest-az-faqs.int.spec.ts:35` |

### 21. 8 Sept Tips changes

`claude/HotelBerlin_Tips_Changes_Prompt.md`: **does not exist**. Closest recovered: “§6 Changes: Avatars + Move the Map”.

| Item | Status |
|------|--------|
| Five portraits + Katja null | ✅ §2.12 |
| Map gone from `/hier` | ✅ `HereTipsSection.tsx` has cards only; map is on `here/explore/page.tsx:130` |
| “Wem die Nachbarschaft gehört” exactly once | ⚠️ **two message keys**: `here.peopleRow.title` (`de.json:159`) used by `HereTipsSection.tsx:46`; `neighbourhood.hereTitle` (`de.json:839`) used when map `framing === 'endorser'` (`NeighbourhoodMapSection.tsx:215`). Homepage `/de` heading is “Du bist im richtigen Teil Berlins” (place framing), so the phrase is **not** on the homepage snapshot. Hub page 404; in source the hub tips heading is that string once. |
| CTA “Alle Empfehlungen →” → `/hier/explore` | ✅ `de.json:160`; `HereTipsSection.tsx:47` `href="/here/explore"` |
| `/hier/explore` all seeded tips + three filters | ⚠️ file filters `category`, `indoor`, `audience` (`here/explore/page.tsx:63-68,163-190`) — not query names `kategorie` / `zielgruppe`. `matchExploreFilters` ANDs them (`getHubTips.ts:54-76`). Live URL 404. |
| No random Holocaust photo | ✅ Wikimedia memorial fallback |

### 22. Hub subpages

| Path | File | Data | Live |
|------|------|------|------|
| `/hier/faq` | `here/faq/page.tsx` | Payload guest FAQs + `buildFAQPageGraph` | 404 |
| `/hier/explore` | `here/explore/page.tsx` | Payload tips + map + filters | 404 |
| `/hier/dining` | `here/dining/page.tsx` | Payload Lütze/Wundermart/hotel | 404 |
| `/hier/art` | `here/art/page.tsx` | exhibition + `HERE_IMAGES` murals; `inProgress` | 404 |
| `/hier/events` | `here/events/page.tsx` | Payload occurrences | 404 |
| `/hier/gallery` | `here/gallery/page.tsx` | exhibition facts; `inProgress` | 404 |
| `/hier/wallride` | `here/wallride/page.tsx` | i18n stub | 404 |
| `/hier/getting-around` | `here/getting-around/page.tsx` | i18n stub | 404 |

### 23. Heading-treatment rule

Rule (from `HubSerifHeading.tsx:4-6`): serif + link if the section leads somewhere; omit link if self-contained. Recovered pass also specified uppercase `SectionDivider` for self-contained sections. `SectionDivider` is **runtime unused** (only `BasementSection`, unused).

| Hub section | Treatment | Violation? |
|-------------|-----------|------------|
| Events strip | `HubSerifHeading` + href `/here/events` | no |
| Dining | `HubSerifHeading` + href `/here/dining` | no |
| Im Haus | `HubSerifHeading` **without** href (`InTheHouseSection.tsx:71`) | **yes** vs uppercase-divider rule; serif without link |
| Art | `HubSerifHeading` + href `/here/art` | no |
| Tips | `HubSerifHeading` + href `/here/explore` | no |
| Help | serif `h2` “Häufig gefragt” + `SweepCta` (`HereHelpSection.tsx:40-49`) — not `HubSerifHeading` | ⚠️ leads somewhere but different component |

### 24. Duplicate-render check

**Could not count on `/hier` (404).** In source, on a hub render:

- **Magwie × CokyOne**: `getArtWall.ts:77` title fallback + possible hub-strip exhibition card (`getHubStripCards.ts` + `getCurrentExhibitionForVenue`) + hardcoded `'Magwie × CokyOne'` in `tonight.ts:76` (art/gallery pages). Homepage happenings also shows the card (browser: one Magwie SpotlightCard).
- **KTTK**: Im Haus amenity card (`getInHouseAmenities.ts:211`) plus any KTTK event in the hub strip / happenings row (homepage snapshot did **not** show a KTTK card in Happenings; only Magwie).

---

## 5. Components

### 25. Inventory (`src/components/`)

**Runtime unused** (barrel/type-only or only imported by unused parents):

`StayInfoCard`, `VenueCompactCard`, `TonightHeroCard`, `HerePeopleSection`, `ArtInBuildingSection`, `BasementSection`, `SectionDivider`, `PersonCard` (`here/`), `EditorialBand`, `ContentCard`, `CultureSection`, `HeroSection`, `MapTeaser`, `MapboxStaticImage`, `HintDot`, `HotelDiscPin`, `KenBurnsSlider`, `SlideDotsNav`, `RoomSlider`, `CtaButton`, `SpotlightGrid`, `HotelBerlinBerlinLogo`, `CategoryPinMark`, `HERO_MAP_BADGE_PX`.

`TonightSection` / `VenueSpotlightCard`: **do not exist**.

**Used (file:line of a primary call site):**

| Component | Used at |
|-----------|---------|
| `JsonLdScript` | e.g. `rooms/page.tsx:92`, `here/faq/page.tsx:58`, `HereHelpSection.tsx:39` |
| `SiteNav` / `SiteNavWithData` | `page.tsx:39`, `here/layout.tsx:6` |
| `NavSecondary` | `SiteNav.tsx:264` |
| `LanguageSwitcher` | `SiteNav.tsx:9` |
| `SiteFooter` / `FooterColumn` / `FooterContact` / `AlreadyHereColumn` / `AwardsCarousel` / `BookDirectStrip` | `SiteFooter` |
| `HomeHero` / `HomeHeroLayout` / `HeroPhotoSlider` / `HeroMapTeaser` | `page.tsx:40`, `HomeHero.tsx` |
| `RoomsHero` / `RoomsTeaser` | `page.tsx:41` |
| `MeetingsSection` / `MeetAndWorkTeaser` | `page.tsx:42` |
| `EventsSection` / `EventsRow` / `SpotlightCard` | `page.tsx:44`; `happenings/page.tsx:94`; `HereHubStrip.tsx:28` |
| `LutzeSection` / `LutzeTeaser` | `page.tsx:46` |
| `NeighbourhoodMapSection` / `HomepageMapTeaser` / `NeighbourhoodGuideMap` / `PlaceInfoCard` / `TeaserPlaceList` / `HereRecommenderList` / `MapPin` | homepage map |
| `FAQSection` / `FAQAccordion` / `FAQPageView` | `page.tsx:48`; faq pages |
| `HereHero` / `HereHeroLayout` / `HeroClock` | `here/page.tsx:53` |
| `HereHubStrip` | `here/page.tsx:56` |
| `HereDiningSection` / `HereDiningBand` / `OpenStatusBadge` | `here/page.tsx:58` |
| `InTheHouseSection` / `AmenityCard` | `here/page.tsx:60` |
| `ArtWallSection` / `ArtWall` | `here/page.tsx:63` |
| `HereTipsSection` / `TipCard` | `here/page.tsx:65`; `here/explore/page.tsx:152` |
| `HereHelpSection` | `here/page.tsx:67` |
| `HubSerifHeading` | hub sections |
| `HereSubpage` / `HereFactGroup` / `ArtLocationCard` | here subpages |
| `PlacesMapView` / `NeighbourhoodFullMap` | neighbourhood + explore |
| `PlaceCard` / `PersonCard` (neighbourhood) / filters / `PaginationNav` | neighbourhood + YMB |
| `InitialsAvatar` | map + YMB |
| `RoomIndexCard` / `RoomsNavRail` / `RoomsCompareTable` / `RoomGallery` / `RoomSpecStrip` / `RoomAmenityGrid` / `RoomFeatureIcons` / `RoomsSuitesCallout` | rooms |
| `MeetingsHero` / `MeetingRoomFinder` / `DocumentCard` / `EventTypeTile` / `FacilityTile` / `MeetingsTeaserSplit` / `MeetingInquirySection` / `MeetingInquiryForm` | meetings |
| `LegalPageView` / `LegalDocument` / `LegalSpans` | legal pages |
| `ScaffoldPageView` | `lib/scaffolds/createPage.tsx:26` |
| `SweepCta` / `LineCta` / `SectionHeading` / `RichTextParagraphs` | widespread |
| `AmenityIcon` | footer, teasers |
| `VideoEmbed` | `you-me-berlin/[slug]/page.tsx` |
| `MapStylePreview` | `map-styles/page.tsx:25` |
| `LucideIconPicker` / `ContextBadge` | admin fields |
| `NavBridgeButton` | `NavSecondary.tsx:123` |

### 26. Superseded components still imported?

| Name | Exists? | Still imported? |
|------|---------|-----------------|
| `StayInfoCard` | yes `here/StayInfoCard.tsx:39` | barrel only `here/index.ts:3` — **unused at runtime** |
| `SpotlightCard` | yes | **yes** `EventsRow.tsx:5`, `happenings/page.tsx:5` |
| `VenueSpotlightCard` | **does not exist** | — |
| `VenueCompactCard` | yes `cards/VenueCompactCard.tsx:33` | barrel only — **unused** |
| `TonightSection` | **does not exist** | — |

### 27. Overlapping cards

Two `PersonCard`s (`here/` unused vs `neighbourhood/` live). Tip / Place / PlaceInfoCard all show place content at different densities. `SpotlightCard` vs dead `VenueCompactCard` / `TonightHeroCard`. `MapTeaser` (static, unused) vs `HomepageMapTeaser`. Spec: `claude/HotelBerlin_HubCards_BuildBrief.md` and `claude/HotelBerlin_CuratedTips_CardSystem.html` **do not exist**. Live hub cards: `AmenityCard`, `TipCard`, `SpotlightCard` (strip), `ArtWall` tiles.

### 28. `EditorialBand`

**Exists** `src/components/primitives/EditorialBand.tsx:39`. **Not used on any mounted page.** Passes B and C as coded: B does not use it; C’s consumer `ArtInBuildingSection` is unused.

### 29. Map `places` prop

All live map shells take a **caller-supplied** `places` array: `PlacesMapView.tsx:46`, `NeighbourhoodGuideMap.tsx` places prop, `NeighbourhoodFullMap.tsx:16`, `HomepageMapTeaser.tsx` places. They do not internally load the full catalogue.

### 30. Neighbourhood side panel (list rows pan the map)

**Homepage teaser: exists.** `TeaserPlaceList` (`TeaserPlaceIndex.tsx:20-22`) “Selecting a row pans/opens the same place as its pin”; wired when `showPlaceNav` (`NeighbourhoodMapSection.tsx:218-231`, `HomepageMapTeaser`). Browser `/de`: buttons Neue Nationalgalerie, Käthe-Kollwitz-Museum, etc.

**Neighbourhood full map / PlacesMapView: does not exist** (pin + `PlaceInfoCard` only).  
**`HereRecommenderList`:** links to `/you-me-berlin/[slug]`; does not pan (`HereRecommenderList.tsx`).

---

## 6. AEO / structured data

### 31. Exported functions in `src/lib/aeo-schema/`

Public barrel `src/lib/aeo-schema/src/index.ts` re-exports builders, ids, prune, authority, types.

| Export | Called from |
|--------|-------------|
| `buildFAQPageGraph` | `HereHelpSection.tsx:39`, `here/faq/page.tsx:54`, `faq/page.tsx`, `FAQSection.tsx:55` |
| `buildPlacePageGraph` | `neighbourhood/[slug]/page.tsx` |
| `buildPersonPageGraph` | `you-me-berlin/[slug]/page.tsx:65` |
| `buildPeopleListGraph` | `you-me-berlin/page.tsx:88` |
| `buildNeighbourhoodListGraph` | `neighbourhood/page.tsx:109`, `NeighbourhoodMapSection.tsx:211` |
| `buildHotelRoomPageGraph` / `buildRoomsListGraph` | rooms pages |
| `buildMeetingRoomPageGraph` / `buildMeetingsListGraph` | meetings pages |
| `buildVenuePageGraph` / `buildVenueNode` | `restaurant/page.tsx` |
| `buildPersonNode` / `buildPersonRef` | graph internals + `aeo-schema/test/person.test.ts` + `src/seed/smoke-aeo-schema.ts` |
| `reviewRatingIsAbsent` | tests only |
| `prune`, `dedupeById`, `buildAuthorityProps`, `toSchemaDays`, `venueTypeToSchemaType`, id helpers, `build*Ref` / breadcrumbs | internals and/or tests |
| `buildReviewNode` / `buildReviewNodesForPlace` | graph + tests |

### 32. JSON-LD by route (source)

| Route | Graph |
|-------|--------|
| All `[locale]` pages | Hotel node in `layout.tsx:34-64` |
| `/` home | FAQPage (FAQSection) + neighbourhood ItemList (map) |
| `/rooms` | ItemList of rooms |
| `/rooms/[slug]` | HotelRoom + Offer |
| `/meetings` | meetings ItemList |
| `/meetings/[slug]` | MeetingRoom |
| `/restaurant` | Venue / Restaurant |
| `/neighbourhood` | neighbourhood list |
| `/neighbourhood/[slug]` | Place + Review(s) |
| `/you-me-and-berlin` | people ItemList |
| `/you-me-and-berlin/[slug]` | Person + places/reviews |
| `/faq`, `/here/faq` | FAQPage from `getFaqs` |
| `/here` | FAQPage for the three hub FAQs (`HereHelpSection`) |
| happenings, here/events, explore, dining, art, gallery, scaffolds, legal, map-styles | **none beyond layout Hotel** (unless a child adds it; these pages do not) |

### 33. FAQPage on `/hier/faq`

Populated from the **collection** via `getFaqs({ context: 'guest', locale })` then `buildFAQPageGraph(faqs)` (`here/faq/page.tsx:32-54`). Not hardcoded.

### 34. `buildPersonNode` / `buildPersonPageGraph` / `buildPeopleListGraph`

Wired: person detail and people list pages (files above). `buildPersonNode` is not imported by app pages directly; `buildPersonPageGraph` uses it (`graph.ts:91-92`).

### 35. `reviewRating` guard + test counts

Guard tests **pass** (`aeo-schema` `npm`-equivalent `tsx --test`: **46 pass / 0 fail / 0 skipped**, including both `reviewRating` GUARD tests). Last known 34; **now 46**.

`venue-time`: tests live in `tests/int/venue-time.int.spec.ts` (**32** `it(`). Last known 33; **now 32**. Included in `npm run test:int`: **98 passed / 0 skipped**.

### 36. Canonical and hreflang

Present via `generateMetadata` / helpers on: home, here + here subpages (`here/canonical.ts`), rooms, meetings, restaurant, neighbourhood, YMB, faq, happenings, legal (`legal/canonical.ts`), scaffolds (`scaffolds/canonical.ts`).

| Missing / odd | Evidence |
|---------------|----------|
| `map-styles` | `title` + `robots: noindex` only (`map-styles/page.tsx:6-8`) — **no canonical/hreflang** |
| Filtered neighbourhood / explore URLs | canonical is the **unfiltered** path (`neighbourhood/page.tsx:59-65`; here explore uses `herePageMetadata` without searchParams) |
| Legal meta descriptions | always English strings in page files |
| Live 404 pages | Next default 404 has `robots: noindex`, no locale layout, no skip link |

---

## 7. i18n

### 37. English on `/de` (current)

**Message-key parity:** `en.json` and `de.json` both **849** keys; **0** missing either way.

English **visible on `/de` homepage** (browser 2026-09-16):

| Surface | Strings |
|---------|---------|
| Rooms teaser | heading **Sleep & Relax**; amenity pills **Double bed**, **Free WiFi**, **Nespresso machine** (DE tag locale stores the same English) |
| Nav | **Meetings**, **Happenings**, **ENTER** (`de.json:28-30,38`) |
| Happenings card | Magwie body paragraph in English |
| Lütze | cuisine value **Italian** |
| Footer | **On the Walls**, **FAQs**, **Comfort**, **Superior**, **Meetings** |
| FAQ accordion on this homepage snapshot | German questions (the four shown) |

Not on this homepage snapshot but in DE messages / components: **Guest Care Center** (`de.json:184`), **Gym**, **Business Center**, **You, Me & Berlin** (`de.json:932`), **Sleep & Relax** rooms namespace (`de.json:489`), hero stay WiFi labels via i18n but **credential values** from CMS (English network name).

10 prospect FAQ rows have **no DE locale** (`fallbackLocale: 'en'` in `getFaqs.ts:72`) — those slugs would render English on `/de` if selected.

Hub/dining/FAQ-accordion English flagged historically: dining `OpenStatusBadge` uses `lutze.openStatus` i18n; hub could not be loaded (404).

### 38. Hardcoded user-facing strings not through next-intl

| File:line | String |
|-----------|--------|
| `tonight.ts:76` / `getArtWall.ts:77` | `'Magwie × CokyOne'` |
| `tonight.ts:91` | `'Open now · free entry'` / DE branch separate |
| `map-styles/page.tsx:7-21` | entire English UI |
| `rooms/page.tsx:102` and other breadcrumb pages | `aria-label="Breadcrumb"` |
| slug `generateMetadata` | `'Not found'` |
| `FAQAccordion.tsx:54` | default `ctaLabel = 'See all FAQs'` (homepage passes `t('allFaqs')` so not used there) |
| `navigation.ts:12-23` | fallback inside-nav English/German literals |
| `hotel.ts` / `footerFallback.ts` | fallback addresses, wifi, column labels |
| `ScaffoldPageView` contact fallbacks | `Lützowplatz 17`, `+49 30 26050`, `info@hotel-berlin.de` |
| Legal page `generateMetadata` | English descriptions |

### 39. Message-key parity

**None missing.** 849 / 849.

### 40. `/` → `/de` and `localePrefix: 'always'`

✅ `src/app/page.tsx:4` `redirect('/de')`.  
✅ `src/i18n/routing.ts:8-9` `localePrefix: 'always'`, `defaultLocale: 'de'`, `localeDetection: false`.

---

## 8. Known open items — code today

### 41. WiFi credentials

**Renders `HBB_Guest` / `welcome1958`.** Hotel global DB: `guest_stay_wifi_network = HBB_Guest`, `guest_stay_wifi_password = welcome1958`. Same fallback `src/lib/payload/hotel.ts:51-52` and seed `src/seed/data.ts:97-98`. UI: `HereHeroLayout.tsx:107-109`. **`HBB-GUESTCONNECT` does not appear** in code (docs only). Guest FAQ answers do not include the password (`guest-az-faqs.int.spec.ts:41`).

### 42. Sauna hours

FAQ `guest-sauna` DE: “auf Anfrage” (`guest-az-faqs.ts:484-495`). Venue `sauna` is **not** in the 5 venue rows. Im Haus card subcopy tells the reader two published schedules exist (`de.json:131`). Hotel `guestStay.more.saunaFitness` seed value `24/7` (`data.ts:124-128`). **No clock times rendered as fact on the amenity card;** FAQ says on request. The two conflicting sources remain in copy/seed notes.

### 43. Guest Care Center phone extension

**Omitted.** `extension: ""` (`de.json:185` / `en.json:185`); `HereHero.tsx:97` `trim() || null`.

### 44. Bed configuration

**Present** on schema (`Rooms.ts:22-39`) and all 11 room docs (`bed_configuration_type` e.g. `double`). Individual QA still flags hotel confirmation. Homepage amenity pill shows **Double bed**.

### 45. Meeting-room seed

**21 records**, not 22: `berlin-berlin`, `berlin-1`…`berlin-6`, `meeting-room-a1`–`a4`, `b1`–`b8`, `c4`, `meeting-island`.

### 46. Fonts

**Laica A is referenced and loaded:** `src/lib/fonts/laica.ts` (LaicaA Regular/Italic/BoldItalic), `layout.tsx:8,59` `laica.variable`, `tailwind.config.ts` `fontFamily.serif: ['var(--font-laica)', …]`, `globals.css` serif rules.  
**Archivo** from `next/font/google` (`layout.tsx:12-16`, weights 400/500/600). Body `font-family: var(--font-archivo)` (`globals.css:76`).  
**Archivo Narrow: no matches.**  
The site does **not** render Archivo only; serif/editorial uses Laica.

### 47. Kids map-pin category

**`category`**, option `Kids` on `neighbourhood-places` (`NeighbourhoodPlaces.ts` category enum; Tempelhofer Feld `category=Kids`). `targetAudience` is a separate array of labels (e.g. Familien/Kinder). Legacy `places` collection has neither Kids nor `targetAudience`.

### 48. FAQ collection

**Seeded.** Orchestrator `src/seed/faqs.ts`: prospect from `src/seed/data.ts`, guest A–Z from `src/seed/guest-az-faqs.ts`. **57** rows. DialogShift appears only in legal cookie/privacy JSON, **not** as the FAQ import source. 10 prospect FAQs EN-only.

---

## 9. Build health

### 49. `pnpm build` / `npm run build`

`pnpm` is not on PATH. `npm run build` (Next 16.2.6 Turbopack): **compile succeeded (41s), TypeScript check failed.**

```
./src/components/scaffolds/ScaffoldPageView.tsx:114:27
Type error: Type '"/" | "/here" | ... | "/policies/payment"' is not assignable to ...
  Type '"/neighbourhood/[slug]"' is not assignable to type ... Did you mean '"/neighbourhood"'?
```

### 50. `tsc --noEmit`

**Not clean.** Errors in generated `.next/dev/types/routes.d.ts:167` **unterminated string literal** (`": {}` spliced into the `LayoutProps` block), then cascade TS1005 through line 230. `tsconfig.json:38-39` includes `.next/dev/types/**/*.ts`.

### 51. Lint

**Does not produce error/warning counts.** `npm run lint` crashes:

```
TypeError: Converting circular structure to JSON
    at ConfigValidator.formatErrors
    at ... eslint-config-next / eslintrc ...
```

### 52. Tests

| Suite | Result |
|-------|--------|
| `npm run test:int` | **10 files, 98 passed, 0 skipped** |
| `aeo-schema` `tsx --test` | **46 passed, 0 skipped** |
| `test:e2e` / `test:a11y` | **not run this pass** |

### 53. Console on `/de`, `/de/hier`, `/de/zimmer`

**`/de` (dev):** terminal shows mass `GET /api/media/file/*.jpg 404`, `The requested resource isn't a valid image`, Next/Image width/height warnings on award PNGs, duplicate sharp `GNotificationCenterDelegate`. Browser snapshot otherwise rendered.  
**`/de/hier`, `/de/zimmer`:** Next 404 page (title `404: This page could not be found.`).  
**Production build:** did not complete (typecheck), so production console **was not captured**.

### 54. Git

- Branch: `feat/map-section-places-people` @ `db8e53a`, tracking `origin/feat/map-section-places-people`.
- `main` local `80fb4a8` **behind `origin/main` by 7**.
- Unmerged vs `main`: this feature branch only (of local/remote names listed).
- **Uncommitted:** legal pages, scaffolds, `pathnames.ts`, footer/seed, YMB portraits, `LegalDocuments`, etc. (see `git status` at audit time).
- `gh pr list`: **not available** (`gh auth login` required). Open PRs not enumerated.

### 55. `TODO` / `FIXME` / `HACK` / `@ts-ignore`

**TODO / FIXME / HACK / `@ts-ignore`:** none in `*.ts/tsx/js/jsx`.

**`@ts-expect-error` (3):**

- `src/components/primitives/SweepCta.tsx:106`
- `src/components/here/HubSerifHeading.tsx:45`
- `src/components/layout/LanguageSwitcher.tsx:119` and `:137` (two sites in one file)

---

## 10. Accessibility spot check

### 56. Skip link first focusable

**On `/de`:** yes. First interactive ref is `Zum Hauptinhalt springen` (`layout.tsx:67-68`, before `{children}`).  
**On `/de/hier` and `/de/zimmer`:** 404 document has **no skip link** (no locale layout).

### 57. One `<h1>` per page

| Route observed / inferred from source | h1 |
|----------------------------------------|----|
| `/de` | **one**: “Deine Berliner Geschichte beginnt hier” |
| `/de/hier`, `/de/zimmer` | Next 404: heading “404” |
| Rooms index (source) | one `h1` `rooms/page.tsx:118` |
| Here subpages | one in `HereSubpage.tsx:33` |
| Scaffolds / legal | one |
| `map-styles` | h1 in page; `MapStylePreview.tsx:145` also an `h1` if token present — **risk of two** |

### 58. Skipped heading levels

`/de` homepage: h1 → h2 sections → h3 cards/FAQs. **No h2→h4 skip** on the snapshot. Two **h2** “Tagen & Arbeiten” (duplicate `MeetAndWorkTeaser` headings).  
FAQ mini: section `h2` + questions `h3` (`FAQAccordion.tsx:80,139`).

### 59. Interactive without accessible names

Homepage snapshot: skip, wordmark, hamburger (`Navigationsmenü öffnen`), lang, Book Now, nav links, map place **buttons named**, FAQ buttons named, footer accordion buttons named. Map pin component sets `aria-label` (`MapPin.tsx:142`).  
`comingSoon` secondary links use `href="#"` + `sr-only` coming-soon (`NavSecondary.tsx:74-86`).  
404 page: only “Open Next.js Dev Tools” besides headings.

### 60. `prefers-reduced-motion`

Hero rotation: `HomeHeroLayout.tsx:44` / `HeroPhotoSlider.tsx:49` / `HereHeroLayout.tsx:77`. Rooms teaser/gallery, meetings hero, KenBurns (unused), awards, `globals.css` multiple `@media (prefers-reduced-motion: reduce)` blocks. Gallery: `RoomGallery.tsx:64-185`. Hub 404: not observed live.

---

## 11. Close

### 61. What’s built and working

| Route | Code | Live `/de`·`/en` 2026-09-16 |
|-------|------|------------------------------|
| `/` → `/de` | redirect | 307 / 200 homepage |
| `/en` | homepage | 200 |
| `/here` (`/hier`) | hub composition in `here/page.tsx` | **404** |
| `/rooms` (`/zimmer`) + `[slug]` | full pages + JSON-LD | **404** (cross-slug 307 works) |
| `/meetings` (`/tagungen`) + `[slug]` + request | full pages | **404** |
| `/restaurant` | Lütze page | **404** |
| `/neighbourhood` + `[slug]` | map + filters + JSON-LD | **404** |
| `/you-me-and-berlin` + `[slug]` | listing + profiles + JSON-LD | **404** |
| `/happenings` | event grid | **404** |
| `/faq` | prospect FAQs | **404** |
| `/here/*` subpages | mixed real/stub | **404** |
| legal 5 | Payload + JSON fallback | **404** |
| 15 scaffolds | `ScaffoldPageView` | **404** |
| `/map-styles` | preview tool | **404** |
| Payload admin | `(payload)/admin` | not probed |

Homepage `/de` **does render**: nav, hero (DE headline), rooms teaser, meetings teaser, happenings (Magwie), Lütze, map teaser with place-list pan, FAQ (DE), footer. Media files 404.

### 62. What’s built but wrong

- Nested locale routes 404 after a correct next-intl rewrite; `.next/dev/types/routes.d.ts` is syntactically broken.
- `HUB_SECTIONS` includes `people`; JSX does not render `HerePeopleSection`.
- Homepage V2 still shows meetings, events, map, Lutze, footer (no hide flags).
- WiFi `HBB_Guest` / `welcome1958` rendered in the hub hero despite FAQ/tests treating credentials as non-facts.
- English on `/de`: Sleep & Relax, amenity tags, Meetings/Happenings/ENTER, Magwie EN body, Italian, Guest Care Center string, YMB title, Double bed.
- 10 prospect FAQs EN-only; tag DE names copy English.
- Nav DoD vs `SiteNav`: mid-width Home strip, promoted `/here` link, “Plan your next stay” copy, drawer group labels.
- Wordmark always `/` vs HerePage DoD `/here`.
- Footer legal omits Disclaimer despite seed/page.
- `/book` CTA 404s.
- Mass missing media at `/api/media/file/…`.
- Production typecheck fails on `ScaffoldPageView` href union (uncommitted scaffolds).
- `EditorialBand` / pass-C art band not on the hub; mosaic `ArtWallSection` instead.
- In Haus heading is serif without link (vs divider rule).
- Neighbourhood places: 0 CMS images.
- `gita-kudpoor` vs `gita-kurdpoor` slug split in seed.
- 21 meeting rooms vs brief 22.
- Pages CMS: 26 vs skeleton brief 27; several live routes have no `pages` row (cookies, contact, …).

### 63. What’s missing

- `claude/HotelBerlin_HubOrder_CursorBrief.md`, `HubDining_BuildBrief.md`, `GutZuWissen_Merge_Prompt.md`, `Tips_Changes_Prompt.md`, `HubCards_BuildBrief.md`, `HotelBerlin_CuratedTips_CardSystem.html`, `HotelBerlin_HubNeighbourhood_PeopleFirst.md`, `HotelBerlin_Events_BuildBrief.md` — **do not exist** on disk.
- `TonightSection`, `VenueSpotlightCard` — **do not exist**.
- `hereHero` Payload global — **does not exist**.
- `/book` page — **does not exist**.
- `/faqs` page file — **does not exist**.
- `/here/events/[slug]` — **does not exist**.
- Payload drafts/versions — **does not exist**.
- Lütze-Garten subsection and eat-page KTTK/Wundermart cross-links on `/restaurant`.
- Neighbourhood full-map side list that pans pins (homepage teaser only).
- `ArtInBuildingSection` / `HerePeopleSection` / `StayInfoCard` / `VenueCompactCard` on any mounted page.
- Archivo Narrow — **does not exist**.
- DialogShift FAQ import — **does not exist**.
- Feature flags to hide homepage lower sections.
- Lint pipeline (crashes).
- e2e/a11y suites not executed this pass.

### 64. What’s blocked on the hotel

- Bed configuration confirmation (still seed `double` / “Double bed”).
- Sauna which of two published schedules is current (`de.json:131`; FAQ “auf Anfrage”).
- Guest Care extension (empty by design until a number exists).
- WiFi SSID/password as publishable fact (currently seeded and shown).
- Fingerboard location/photos/hours (`de.json:120` “Wartet auf das Hotelteam”).
- Neighbourhood photography (0 CMS images on 21 places).
- Artwork records (0).
- Missing DE translations for 10 prospect FAQs.
- Media files 404ing relative to DB filenames (ops/storage, not schema).
- `/book` destination.
- Final DE slugs for `/happenings`, `/faq`, `/restaurant`, `/you-me-and-berlin`, `/on-the-walls`.

### 65. Contradictions between documents

1. **Rooms/meetings DE slugs.** Nachbarschaft §3: DE=`/rooms` and `/meetings`. Rooms/Meetings briefs + `pathnames.ts`: DE=`/zimmer`, `/tagungen`. Code follows the later pathnames.
2. **Wordmark target.** HerePage DoD: `/here` inside context. ResponsiveNav DoD: `/` both contexts. Code: `/`.
3. **Gut zu wissen.** HubOrder recovered: keep/move §7. GutZuWissen merge recovered: delete into help. Code: section gone; leftover i18n; Guest Care not in that help block.
4. **Hub map.** Missing PeopleFirst vs Tips Changes “move the map”. Code: no map on hub file; map on `/here/explore`.
5. **Homepage V2 hide vs live.** V2: hide meetings/events/map/footer. Code: all render. FAQ explicitly kept live in a later note of that brief.
6. **CTA copy.** ResponsiveNav DoD “Plan your next stay” / DE “Bald wiederkommen?” vs messages “Come back” / “Komm wieder”.
7. **WiFi as fact.** HerePage DoD: credentials from hotel global. GutZuWissen merge recovered: do not seed credentials as fact. Code: global + hero render `HBB_Guest` / `welcome1958`; guest FAQs omit them.
8. **Meeting room count.** Meetings brief 22 vs seed/DB 21.
9. **Skeleton pages 27** vs CMS `pages` 26 vs `pagesSeed` expanded in `seed/data.ts`.
10. **Pass numbering.** HubDining “§2” vs later “Essen & Trinken §3”.
11. **Footer TKKT vs KTTK.** Footer V2 notes mockup TKKT; seed uses KTTK.
12. **`insiderStory` vs `storyConnection`.** Rooms brief vs `Rooms.ts`.
)
