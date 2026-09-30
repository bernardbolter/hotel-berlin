# Hotel Berlin, Berlin — Launch-Readiness Audit

*Report only. Written 2026-09-19. Nothing in the repo was changed except this file.*

Follows: `docs/audit/2026-09-16-full-site-audit.md` (Step 0) and `docs/content/schema-inventory.md`.

Dev database: Postgres host `localhost`, database `hotelberlin` (credentials not pasted).  
Branch: `feat/map-section-places-people` @ `db8e53a` (9 Sept 2026).  
`origin/main` and `origin/feat/map-section-places-people` also point at `db8e53a`. Local `main` is stale at `80fb4a8`.

Runtime this pass:

| Process | Port | Nested routes |
|---------|------|----------------|
| Pre-existing `next dev` (pid 4704) | **3000** | `/de/hier` **404**, `/de/nachbarschaft` **404** (same class as 16 Sept) |
| Fresh `npm run dev` of this working tree | **3001** | `/de/hier` **200**, `/de/zimmer` **200**, `/de/nachbarschaft` **200**, `/de/tagungen` **200**, … |

Homepage snapshot (browser, `http://127.0.0.1:3001/de`): title `Hotel Berlin, Berlin`; skip link, nav, hero, rooms, meetings, happenings, Lütze, map teaser, FAQ, footer.

All uncommitted working-tree files were treated as the current site. HEAD itself is unchanged since 9 Sept.

---

## 1. Delta since 16 September

### 1. `git log --oneline` since the Step 0 audit commit

**There is no Step 0 audit commit.** `docs/audit/2026-09-16-full-site-audit.md` is still untracked (`?? docs/`). HEAD is still `db8e53a` (`git log -1`: `db8e53ae… 2026-09-09 12:33:55 +0200 fix(seed): add guest A–Z FAQ categories to the Postgres enum.`).

`git log --since='2026-09-16'` → empty.

The delta is the **uncommitted working tree**, not commits.

`git diff --stat` (tracked): 35 files, +1327 / −356. Untracked: 42 paths.

Grouped by area (working tree, not commits):

| Area | Evidence |
|------|----------|
| Booking widget | `src/lib/booking/*`, `src/components/booking/*`, `tests/int/booking.int.spec.ts`; `SiteNav.tsx` replaces `<a href="/book">` with `BookNowButton` / `BookingPanel`; `layout.tsx` emits `buildReserveAction` |
| Entity pages | `src/components/entity/*`, `src/lib/entity/*`, `src/lib/payload/borrow.ts`, `src/lib/payload/entities.ts`; rewritten `neighbourhood/[slug]`, `you-me-berlin/[slug]`; new `happenings/[slug]` |
| Legal | `src/collections/LegalDocuments.ts`, `src/lib/legal/*`, `src/seed/legal.ts`, five legal `page.tsx` files, `buildLegalRedirects` in `next.config.ts` |
| Scaffolds | `src/lib/scaffolds/*`, `src/components/scaffolds/*`, 15 stub routes under `src/app/[locale]/` |
| AEO | `src/lib/aeo-schema/src/builders/event.ts`, `test/event.test.ts`; graph/person/place/ids/config edits |
| Redirects | `src/lib/scaffolds/redirects.ts`, `src/lib/legal/redirects.ts` wired in `next.config.ts` |
| Content schema extraction | `docs/content/schema-inventory.md` + `.json`; prompt `doc/contentSchema/HotelBerlin_ContentSchema_Extraction.md` |
| YMB portraits | `src/seed/ymb-portraits.ts`, `src/seed/assets/ymb-portraits/*` |
| Pathnames | `/happenings/[slug]` added (`src/i18n/pathnames.ts:50`) |
| i18n | `de.json` / `en.json` +150 lines each (booking, entity, scaffolds, legal) |
| Docs | `doc/booking-dropdown/`, `doc/enitities/`, `docs/audit/`, `docs/content/` |

### 2. Step 0 §11 — *built but wrong* and *missing*

**Built but wrong** (Step 0 §62)

| Item | Status | Evidence |
|------|--------|----------|
| Nested locale routes 404 after next-intl rewrite | ⚠️ **partial** | Still **404** on the long-running server **:3000** (`HTTPError 404` for `/de/hier`, `/de/nachbarschaft`). Fresh compile **:3001** returns **200** (`GET /de/hier 200 in 29.2s`, `GET /de/nachbarschaft 200 in 35.6s`). No commit — working-tree + fresh `.next`. Root cause: stale/broken compile on pid 4704, not missing page files. Step 0 also recorded a syntactically broken `.next/dev/types/routes.d.ts`. |
| `HUB_SECTIONS` includes `people`; JSX does not render `HerePeopleSection` | ❌ still open | `here/page.tsx:24-33` still lists `'people'`; render tree has no `HerePeopleSection`. Component exists only via `src/components/here/index.ts:23`. |
| Homepage V2 still shows meetings, events, map, Lutze, footer | ❌ still open | Unchanged since 16 Sept, Step 0 §62. Homepage `page.tsx:38-50` still renders all of them. Browser snapshot 19 Sept confirms. |
| WiFi `HBB_Guest` / `welcome1958` rendered | ❌ still open | DB `hotel.guest_stay_wifi_network\|password` = `HBB_Guest\|welcome1958`. `HereHero.tsx` still loads `getGuestStayInfo`. |
| English on `/de` | ❌ still open | Browser `/de`: **Sleep & Relax**, amenity pills **Double bed / Free WiFi / Nespresso machine**, nav **Meetings / Happenings**, Magwie body in English, cuisine **Italian**, footer **On the Walls**. Message keys now **903/903** (was 849). `de === en` non-empty strings: **125**. Amenity tags: **49/50** `de === en`. |
| 10 prospect FAQs EN-only | ❌ still open | SQL: `prospect\|16\|10` DE-empty. |
| Nav DoD vs `SiteNav` | ⚠️ partial | Booking CTA no longer `/book` (working-tree `SiteNav.tsx`). Mid-width Home strip, promoted `/here`, “Komm wieder” / “Come back” vs DoD copy: unchanged since 16 Sept, Step 0 §62. |
| Wordmark always `/` vs HerePage DoD `/here` | ❌ still open | Unchanged since 16 Sept, Step 0 §62. |
| Footer legal omits Disclaimer | ⚠️ **partial** | Seed `footer.ts:153-159` and fallback `footerFallback.ts:206` now include Disclaimer. **Live DB** `footer_legal_links`: `/imprint`, `/privacy`, `/terms`, `/cookies`, `/accessibility` — **no disclaimer**. Browser footer: Impressum, Datenschutz, AGB, Cookies, Barrierefreiheit — **no Haftungsausschluss**. |
| `/book` CTA 404s | ⚠️ **partial** | Nav uses `BookingMenu` (working tree). Footer **Verfügbarkeit prüfen** still `BookDirectStrip` → CMS/fallback `ctaUrl: '/book'` (`footer.ts:60`, `footerFallback.ts:232`). `/book` page **does not exist**. |
| Mass missing media `/api/media/file/…` | ⚠️ **partial** | Disk: **346/346** files present. **GET** on :3001: sampled files **200** (`GET /api/media/file/hbb-superior-room-05.jpg 200`, homepage carousel/room JPEGs 200). **HEAD** returns **404** (Payload route does not implement HEAD). No GET 404s in the :3001 log this pass. :3000 not re-sampled. |
| Production typecheck fails on `ScaffoldPageView` href union | ❓ not re-run | `pnpm build` / `tsc --noEmit` not executed this pass (compile load on :3001). File still uncommitted. |
| `EditorialBand` / pass-C art band not on the hub | ⚠️ **partial** | Still not on `/hier`. **Now mounted** on person detail `you-me-berlin/[slug]/page.tsx:209`. Hub still uses `ArtWallSection`. |
| In Haus heading serif without link | ❌ still open | Unchanged since 16 Sept, Step 0 §62 (not re-litigated). |
| Neighbourhood places: 0 CMS images | ❌ still open | SQL: `neighbourhood_places` **21 rows, 0 `image_id`**. Map cards use Wikimedia/Unsplash fallbacks (`teaserImageFallbacks.ts`). |
| `gita-kudpoor` vs `gita-kurdpoor` | ❓ not re-queried | Unchanged since 16 Sept, Step 0 §62 unless seed was re-run. |
| 21 meeting rooms vs brief 22 | ❌ still open | SQL: `meeting_rooms` count **21**. |
| Pages CMS 26 vs skeleton 27 | ❌ still open | SQL: `pages` count **26**. |

**Missing** (Step 0 §63)

| Item | Status |
|------|--------|
| Named briefs that do not exist on disk | ❌ unchanged since 16 Sept, Step 0 §63 |
| `TonightSection`, `VenueSpotlightCard` | ❌ does not exist |
| `hereHero` Payload global | ❌ does not exist (`HereHero.tsx:21-23` still says so) |
| `/book` page | ❌ does not exist |
| `/faqs` page file | ❌ does not exist (`pathnames.ts:53` still a legacy alias) |
| `/here/events/[slug]` | ❌ does not exist (entity brief now says cards must not link there) |
| Payload drafts/versions | ❌ does not exist (`grep versions:/drafts:` in `src/` → no matches). People have a **status** select (`draft`/`published`, `People.ts:122-130`) instead. |
| Lütze-Garten subsection / KTTK–Wundermart cross-links on `/restaurant` | ❌ not re-verified as added |
| Neighbourhood full-map side list | ⚠️ **partial** — `/here/explore` now mounts `NeighbourhoodFullMap` (`here/explore/page.tsx:6`) |
| `ArtInBuildingSection` / `HerePeopleSection` / `StayInfoCard` / `VenueCompactCard` on a mounted hub page | ❌ still not imported by `here/page.tsx` |
| Archivo Narrow | ❌ does not exist |
| DialogShift FAQ import | ❌ does not exist |
| Feature flags to hide homepage lower sections | ❌ does not exist |
| Lint pipeline | ❓ not re-run (Step 0 crashed) |
| e2e/a11y suites | ⚠️ homepage structure observed in browser; `@axe-core/playwright` suite **not executed** this pass |

### 3. Nested routes 404 on the dev server

⚠️ **Still true on the server Step 0 used. Not true on a fresh compile of this tree.**

- `:3000` `/de/hier` → `HTTPError 404: Not Found`. `/de/nachbarschaft` → 404.
- `:3001` `GET /de/hier 200`, `GET /en/here 200`, `GET /de/zimmer 200`, `GET /de/nachbarschaft 200`, `GET /de/tagungen 200`.

Root cause of the 16 Sept 404s: **stale Next compile** (Step 0: broken `.next/dev/types/routes.d.ts` + rewrite-then-default-404). Page files existed then. Middleware is `src/proxy.ts` (`createMiddleware(routing)`), not `middleware.ts` (does not exist). Next 16.2.6 uses `proxy.ts`. Fresh compile resolves nested locales.

### 4. Media 404s on `/api/media/file/…`

⚠️ **GET no longer 404s on :3001 against sampled rows. HEAD 404s. Disk matches DB.**

- Media rows: **346**. Alt nonempty: **346/346**. Files on disk `media/`: **346 present, 0 missing**.
- GET `:3001/api/media/file/hbb-superior-room-05.jpg` → **200**, 71383 bytes, `image/jpeg`.
- Homepage subsequently loaded many filenames at **200** (carousel, rooms, `hero_map.png`, `fkkb-monogram.svg`).
- HEAD of the same paths → **404** (Payload upload route).
- `Media.ts` is still default local upload (`upload: true`, no S3/R2 adapter).

### 5. English living in German values

**Messages:** `de.json` and `en.json` both **903** keys; **0** missing either way (was 849 / 849 on 16 Sept).

`de === en` (non-empty strings): **125 / 903** shared keys.

| Namespace | `de === en` count |
|-----------|-------------------|
| here | 47 |
| meetingsPage | 11 |
| rooms | 10 |
| meetings | 7 |
| nav | 5 |
| neighbourhood | 5 |
| scaffolds | 5 |
| events | 5 |
| lutze | 5 |
| culture | 5 |
| common | 4 |
| youMeBerlin | 3 |
| entity, booking, faq, restaurantPage, heroMap | 2 each |
| legal, happenings, hero | 1 each |

Nav still identical: `ENTER`, `Wallride`, `Meetings`, `Happenings`, `hotel-berlin.de`. Differs: `eatDrink` DE=`Essen & Trinken` EN=`Eat & Drink`.

**CMS (dev DB, this pass):**

| Collection | `de === en` / empty DE |
|------------|------------------------|
| tags amenity names | 49/50 equal |
| tags other types | 0 equal (14 rows) |
| rooms names | 7/11 equal |
| faqs prospect | 10/16 DE empty |
| faqs guest | 0/41 DE empty |

### 6. Content schema extraction

✅ **Ran.** Outputs:

- `docs/content/schema-inventory.md`
- `docs/content/schema-inventory.json`

Prompt: `doc/contentSchema/HotelBerlin_ContentSchema_Extraction.md` (16 Sept).

Headline numbers from the inventory (dump `2026-09-16T10:56:50.150Z`; DB counts this pass still match where re-queried):

- Media rows: **346**. Non-empty `alt`: **346/346**. `alt` not localized.
- `imageSizes`: **does not exist** — originals only.
- Neighbourhood CMS images: **0/21**.
- Image slots rendering from **non-Payload** sources (inventory §3): `HERE_IMAGES` (`src/lib/here/images.ts`), `/images/hero_map.png`, `/images/lutze-logo.svg`, `/images/meet-and-work.jpg`, `/images/food-interior.jpg`, `/images/hotel-berlin-berlin-luetzowplatz-satellite.jpg`, `/images/awards/*`, Wikimedia/Unsplash `PLACE_IMAGE_FALLBACKS`, unused Unsplash `homepageImages.ts`.

---

## 2. Signed-off reference: homepage and `/hier`

### 7. Components in order

**Homepage** `src/app/[locale]/page.tsx:35-51` — nav/footer **page-local to this file** (not a layout).

| Order | Component | File | Shared? |
|-------|-----------|------|---------|
| 1 | `SiteNavWithData` `context="outside"` | `page.tsx:38` → `SiteNavWithData.tsx:14` → `SiteNav.tsx:50` | **shared** |
| 2 | `HomeHero` | `page.tsx:40` → `HomeHero.tsx:14` → `HomeHeroLayout.tsx:33` + `HeroMapTeaser` + `HeroPhotoSlider` | **page-local** (`components/home/`) except slider reused by `/hier` |
| 3 | `RoomsHero` | `page.tsx:41` → `RoomsHero.tsx:8` → `RoomsTeaser` | **page-local** |
| 4 | `MeetingsSection` | `page.tsx:42` → `MeetingsSection.tsx:6` → `MeetAndWorkTeaser` | **page-local** |
| 5 | `EventsSection` | `page.tsx:44` → `EventsSection.tsx:30` → `EventsRow` + `SpotlightCard` + `SweepCta` | row/card **shared** with hub/happenings |
| 6 | `LutzeSection` | `page.tsx:46` → `LutzeSection.tsx:15` → `LutzeTeaser` | **page-local** |
| 7 | `NeighbourhoodMapSection` | `page.tsx:47` → `NeighbourhoodMapSection.tsx` → `HomepageMapTeaser` | map teaser **shared** with neighbourhood |
| 8 | `FAQSection` | `page.tsx:48` → `FAQSection.tsx:24` → `FAQAccordion` + `JsonLdScript` | **shared** |
| 9 | `SiteFooter` | `page.tsx:50` | **shared** |

**`/hier`** — nav/footer in **`here/layout.tsx:4-10`** (`SiteNavWithData context="inside"`). Page `here/page.tsx:46-69`:

| Order | Component | File | Shared? |
|-------|-----------|------|---------|
| 1 | `HereHero` | `here/page.tsx:53` → `HereHero.tsx:25` → `HereHeroLayout.tsx` (reuses `HeroPhotoSlider`) | **page-local** + shared slider |
| 2 | `HereHubStrip` | `:56` → `HereHubStrip.tsx:11` → `HubSerifHeading` + `EventsRow` | heading **hub-local**; row **shared** |
| 3 | `HereDiningSection` | `:58` | **hub-local** |
| 4 | `InTheHouseSection` | `:60` → `AmenityCard` + `HubSerifHeading` | **hub-local** |
| 5 | `ArtWallSection` | `:63` | **hub-local** |
| 6 | `HereTipsSection` | `:65` → `TipCard` | **hub-local** |
| 7 | `HereHelpSection` | `:67` (FAQ mini) | **hub-local** / FAQ shared |

`HUB_SECTIONS` (`here/page.tsx:24-33`) lists `events`, `people`, `neighbourhood` in an order the JSX does not follow (events are inside `HereHubStrip`; people/map are omitted).

### 8. Design tokens vs hardcoded

Tokens live in `tokens.json` and `tailwind.config.ts` (`hbb-*`, footer, category, map pins). `globals.css` maps category CSS variables to `tokens.json`.

Hardcoded in these two pages’ trees (bypass tokens):

| Location | Values |
|----------|--------|
| `HomeHeroLayout.tsx:55,68,77` | `rounded-bl-[25px]`, `rounded-bl-[50px]`, `text-[11px]`, `tracking-[0.14em]` |
| `RoomsHero.tsx:27` | `pt-14 pr-5 pb-[41px] pl-[15px] … lg:pl-[10px]` |
| `MeetingsSection.tsx:16` | `py-12 pr-5 pl-[10px]` |
| `EventsSection.tsx:23-24` | `text-[clamp(2.15rem,3.4vw,3.1rem)] … text-[#1F1F1F]` |
| `NeighbourhoodMapSection.tsx:23-24` | smaller clamp, `text-[#1F1F1F]` |
| `HubSerifHeading.tsx:8-14` | same clamp/`#1F1F1F`; underline `#1F1F1F` |
| `here/layout` / page | `gap-12`, `md:gap-16`, `px-section-*` (tokens) + `bg-hbb-page` (token) |

Archivo: `next/font/google` in `layout.tsx:13-18`. Laica: `next/font/local` `src/lib/fonts/laica.ts`.

### 9. What owns the signed-off patterns

| Pattern | Owner |
|---------|--------|
| Heading (serif clamp, off-black) | Homepage: duplicated `HEADING_CLASS` in `EventsSection.tsx:23-24` and `NeighbourhoodMapSection.tsx:23-24`. Hub: `HubSerifHeading.tsx:8-9`. Not `SectionHeading.tsx` (smaller `text-serif-lg` + underline). |
| Section rhythm | Homepage: per-section padding (`RoomsHero` / `MeetingsSection` site-shell). Hub: `gap-12 md:gap-16` + `py-section-y` (`here/page.tsx:55`). |
| Card system | Happenings: `SpotlightCard`. Hub tips: `TipCard`. In-house: `AmenityCard`. Map: `PlaceInfoCard` / `TeaserPlaceList`. |
| CTA | `SweepCta` (`primitives/SweepCta.tsx`) colours terracotta / ctx / meet-work / ink / espresso / forest. Hub also `hub-section-link` underline (`HubSerifHeading.tsx:47`). Nav book: `.book-now-btn`. |
| Image aspect | Hero photo: `aspect-[1/0.75]` / `aspect-[2/1]` (`HomeHeroLayout.tsx:68`). Rooms teaser: RoomsTeaser internals. Hub tips: 4:3 in `TipCard` / `getHubTips`. Map fallback satellite: viewport height box. |

### 10. Placeholder content still on signed-off pages

🔒 unless noted as code.

| Surface | What |
|---------|------|
| Homepage rooms h2 | **Sleep & Relax** on `/de` (i18n `rooms.title` DE===EN) |
| Amenity pills | English tag names from CMS |
| Happenings card | Magwie paragraph English; `spotlightTeasers.ts:5` still “Placeholder copy for layout review” (fallback if Payload empty — live Magwie was shown) |
| Lütze cuisine | **Italian** on `/de` |
| Map place photos | Wikimedia/Unsplash `PLACE_IMAGE_FALLBACKS` (`teaserImageFallbacks.ts:2` “until CMS media is uploaded”). Credit **Manfred Brückels** visible on `/de`. |
| Footer strip | `ctaUrl: '/book'` — page does not exist |
| Hub WiFi | Seed credentials as facts |
| Hub `HUB_SECTIONS.people` | Listed, not rendered |
| `fallbackHeroSlides` | Unsplash URLs in `heroSlides.ts:12` / `homepageImages.ts` — homepage this pass used **Payload** `/api/media/file/hbb-carousel-*.jpg` instead |
| Picsum | Rejected at `PlaceCard.tsx:40` / `mediaUrl.ts` — not observed on homepage |

---

## 3. Every other page — conformance and completeness

HTTP below is **:3001** unless marked. `:3000` still 404s nested routes.

### 11–16. Per-route notes

Status key: **built** = real page composition; **partial** = real data + stub kickers / missing sections; **stub** = `createScaffoldPage` / in-progress kicker only.

**Rooms**

- Index `rooms/page.tsx` — built, Payload. Nav+footer in page. HTTP `/de/zimmer` 200, `/en/rooms` 200. Cross-slug `/de/rooms` followed to **200** `final=/de/zimmer`; `/en/zimmer` followed to **200** `final=/en/rooms` (next-intl; earlier non-follow sample was **307**).
- Detail `rooms/[slug]/page.tsx` — built, `generateStaticParams`, JSON-LD HotelRoom+Offer. Probe `/de/zimmer/standard` and `/en/rooms/standard` **timed out** (60s first compile). Own gallery (`RoomGallery`), not homepage teaser.

**Meetings**

- Index `meetings/page.tsx` — built. `/de/tagungen` 200, `/en/meetings` 200.
- Detail `meetings/[slug]/page.tsx` — built, `generateStaticParams`.
- Request `meetings/request/page.tsx` — built, `MeetingInquiryForm`. Same form as index. HTTP `/de/tagungen/anfrage` 200 (`Tagungsanfrage | Hotel Berlin, Berlin`), `/en/meetings/request` 200 (`Request for Proposal | Hotel Berlin, Berlin`).
- Hybrid `meetings/hybrid/page.tsx` — **stub** `createScaffoldPage('meetings-hybrid')`. HTTP `/de/tagungen/hybrid` 200, `/en/meetings/hybrid` 200.

**Eat & drink / Lütze** — `restaurant/page.tsx` built, Payload `getVenueBySlug('lutze')`. `/de/restaurant` 200, `/en/restaurant` 200. Slug identical DE/EN (`pathnames.ts:47`).

**Happenings**

- Index `happenings/page.tsx` — built, `SpotlightCard`. `/de/happenings` 200, `/en/happenings` 200. Placeholder slug (same DE/EN).
- Detail `happenings/[slug]/page.tsx` — **new**, entity shell + `buildEventPageGraph`. Pathname comment still “NOT final”. Missing slug `/de/happenings/does-not-exist` → **404**, `title=NO TITLE` (default Next 404, not locale shell).

**Neighbourhood** — index + `[slug]` built, Payload. `/de/nachbarschaft` 200. Slug pages now `generateStaticParams` + entity components (`EntityIdentity`, `EntityFacts`, `BorrowedRow`, `EntityBand`). 0 CMS images; PlaceCard/Wikimedia fallbacks.

**You, Me & Berlin** — index + `[slug]` built. Path identical `/you-me-and-berlin` both locales. Probe `/de/you-me-and-berlin` and `/en/you-me-and-berlin` **timed out** (60s). Portraits: SQL **5/16** `portrait_id`. `EditorialBand` on person page.

**Hub subpages** (`here/*`)

| Route | Status | Notes |
|-------|--------|--------|
| `/here/events` | built | Payload occurrences. HTTP `/de/hier/events` 200, `/en/here/events` 200 |
| `/here/explore` | built | tips + `NeighbourhoodFullMap`. HTTP `/de/hier/explore` 200, `/en/here/explore` 200 |
| `/here/dining` | built | venues + hotel. Probe `/de/hier/dining` and `/en/here/dining` timed out (40s) |
| `/here/faq` | built | guest FAQs. HTTP `/en/here/faq` 200 (`From A to Z | Hotel Berlin, Berlin`); `/de/hier/faq` timed out |
| `/here/art` | partial | `kicker={t('inProgress')}`; murals from `HERE_IMAGES`. HTTP `/de/hier/art` 200, `/en/here/art` 200 |
| `/here/gallery` | stub-ish | inProgress + exhibition title. HTTP `/de/hier/gallery` 200, `/en/here/gallery` 200 |
| `/here/wallride` | stub | i18n only, inProgress. Probe both locales timed out |
| `/here/getting-around` | stub | i18n only, inProgress. Probe both locales timed out |

**FAQ** — `faq/page.tsx` built. `/de/faq` 200, `/en/faq` 200. DE slug still placeholder (`pathnames.ts:52`).

**Legal** — `LegalPageView` + Payload with JSON fallback. `/de/impressum` 200, `/en/imprint` 200, `/de/datenschutz` 200, `/en/privacy` 200, `/en/terms` 200, `/de/cookies` 200, `/en/cookies` 200, `/en/disclaimer` 200. Probe `/de/agb` and `/de/haftungsausschluss` **timed out** (60s; earlier server log had `GET /de/agb` 200). One-off styles: `text-[#1F1F1F]`, `text-[#2A3540]`, `text-gray-500` (`LegalPageView.tsx:30-44`).

**Scaffolds** (all `createScaffoldPage`): about, people, on-the-walls, accessibility, sustainability, contact, amenities, awards, offers, five policies. **Stub**. HTTP 200 both locales for people, on-the-walls (DE title still **On the Walls**), accessibility, sustainability, amenities, awards, offers, pets, fees, payment; EN also check-in / cancellation / hybrid / contact / about. `/de/richtlinien/check-in` timed out (40s). Contact adds `ContactFacts` with hardcoded address fallback (`ScaffoldPageView.tsx:22-28`). Same one-off heading colours as legal. Accessibility **exists as a stub**, not a BFSG statement.

**Map styles** — `map-styles/page.tsx` internal tool, English, `robots: noindex`. No site shell. Probe `/de/map-styles` **timed out**. `/admin` **timed out**.

**Does not exist:** `/book`, `/faqs` page, `/here/events/[slug]`, `/newsletter`, artist/exhibition/artwork public routes, `error.tsx`, locale `not-found.tsx`. Confirmed HTTP **404**: `/de/book`, `/en/book`, `/de/faqs`, `/en/faqs`, `/robots.txt`, `/sitemap.xml`.

**Entity brief DoD** (`doc/enitities/HotelBerlin_EntityPages_BuildBrief.md:358-379`) — items **not** in Step 0:

| DoD item | Status |
|----------|--------|
| `/happenings/[slug]` + pathnames placeholder comment | ✅ `pathnames.ts:50` |
| `generateStaticParams` on all three slug routes | ✅ neighbourhood, ymb, happenings (plus rooms/meetings) |
| No `/here/events/[slug]` links; teasers not `/here/gallery` | ✅ `spotlightTeasers.ts` hrefs `/here/art` and `/happenings/…` |
| `EditorialBand` on a live page | ✅ person detail |
| `buildEventPageGraph` + tests | ✅ `event.test.ts` (6 tests, suite 52 pass) |
| Canonical + hreflang on three entity routes | ✅ `entityMetadata` (`canonical.ts:46-70`) |
| Google Rich Results Test | ❌ not run |
| Nested-route 404 blocker note in that brief | ⚠️ cleared on :3001, not on :3000 |

**Reachability (re-check)**

- Nav outside: rooms, meetings, restaurant, happenings, neighbourhood + hub bridge. Not legal, not scaffolds except via footer.
- Footer seed: rooms, policies, dining, meetings, on-the-walls, contact, about, accessibility, sustainability, faq, `/book` strip.
- Orphans: `/map-styles` (noindex tool). `/faqs` linked nowhere useful (pathname only).
- Dead: `/book` still linked from footer strip (`/de/book` **404**, `/en/book` **404**). `/de/faqs` and `/en/faqs` **404**.
- Live Galaxy `/karriere`, `/newsletter` have **no** new-site page (careers is external Radisson URL in footer).

### Route table

HTTP = :3001 this pass. Probe finished 19 Sept 13:48. Followed redirects. Timeouts (60s) on first compile: `/de/agb`, `/de/haftungsausschluss`, room details, YMB index, `/de/map-styles`, `/admin`, `/de/hier/faq`, and all other sampled `/de/hier/*` subpages except those already 200 earlier.

| Route | Status | Conformance | Content DE | Content EN | Blockers |
|-------|--------|-------------|------------|------------|----------|
| `/rooms` `/zimmer` | built | own rooms system, shared nav/footer/SweepCta | seed CMS | seed CMS | 🔒 bed labels EN on DE |
| `/rooms/[slug]` | built | own gallery | seed | seed | 🔒 |
| `/meetings` `/tagungen` | built | own meetings system | seed | seed | 🔒 21 vs 22 rooms |
| `/meetings/[slug]` | built | own | seed | seed | |
| `/meetings/request` | built | form, not homepage pattern | i18n | i18n | 🔒 email templates PLACEHOLDER; no spam controls |
| `/meetings/hybrid` | stub | scaffold one-off type | i18n stub | i18n stub | 🔒 copy |
| `/restaurant` | built | own Lutze page | seed; cuisine EN | seed | 🔒 |
| `/happenings` | built | SpotlightCard (homepage card) | mixed EN body | seed | 🔒 slug sign-off; EN copy |
| `/happenings/[slug]` | built | entity shell (not homepage) | seed events (4) | seed | 🔒 |
| `/neighbourhood` | built | map + filters; PlaceCard | seed; 0 photos | seed | 🔒 photos |
| `/neighbourhood/[slug]` | built | entity shell | seed | seed | 🔒 photos |
| `/you-me-and-berlin` | built | own listing | seed | seed | 🔒 portraits 5/16 |
| `/you-me-and-berlin/[slug]` | built | entity + EditorialBand | seed | seed | 🔒 |
| `/here/events` | built | hub subpage | Payload | Payload | |
| `/here/explore` | built | hub + full map | Payload | Payload | 🔒 photos; Mapbox consent |
| `/here/dining` | built | hub facts | Payload | Payload | |
| `/here/faq` | built | hub + FAQ | guest FAQs DE | guest FAQs | |
| `/here/art` | partial | inProgress + HERE_IMAGES | mixed | mixed | 🔒 artworks 0 |
| `/here/gallery` | stub | inProgress | exhibition title | same | 🔒 |
| `/here/wallride` | stub | inProgress | i18n | i18n | 🔒 |
| `/here/getting-around` | stub | inProgress | i18n | i18n | 🔒 |
| `/faq` | built | FAQ accordion | 10 EN-only prospect | seed | 🔒 DE FAQs; slug |
| `/imprint` `/impressum` | built | legal one-off type | CMS+JSON real-looking | CMS+JSON | 🔒 hotel legal sign-off |
| `/privacy` `/datenschutz` | built | same | JSON/CMS 24 Apr 2026 text | EN | 🔒 |
| `/terms` `/agb` | built | same | JSON/CMS | JSON/CMS | 🔒 |
| `/cookies` | built | same | summary of privacy | EN | 🔒 CMP missing |
| `/disclaimer` `/haftungsausschluss` | built | same | JSON/CMS | JSON/CMS | 🔒 not in live footer |
| `/about` `/ueber-uns` | stub | scaffold | i18n stub | i18n stub | 🔒 |
| `/people` `/menschen` | stub | scaffold **not** people index | stub | stub | 🔒; conflicts with YMB |
| `/on-the-walls` | stub | scaffold | stub | stub | 🔒 slug DE=EN |
| `/accessibility` `/barrierefreiheit` | stub | scaffold | stub | stub | 🔒 BFSG text |
| `/sustainability` | stub | scaffold | stub | stub | 🔒 |
| `/contact` `/kontakt` | stub | scaffold + address facts | hotel global / fallback | same | 🔒 no contact form |
| `/amenities` `/ausstattung` | stub | scaffold | stub | stub | 🔒 |
| `/awards` | stub | scaffold | stub | stub | 🔒 |
| `/offers` `/angebote` | stub | scaffold | stub | stub | 🔒 |
| `/policies/*` | stub | scaffold | stub | stub | 🔒 |
| `/map-styles` | stub/tool | English, no shell | n/a | English UI | should not ship indexed |
| `/book` | not built | — | — | — | footer still points here |
| `/faqs` | not built | pathname only | — | — | dead alias |

---

## 4. Routing, URLs and migration from the live site

### 17. `src/i18n/pathnames.ts`

Pasted in Step 0 §2. **Delta:** line 50 `/happenings/[slug]` added. File still at `pathnames.ts:7-78`.

Still placeholders / awaiting sign-off (file comments + identical DE/EN): `/happenings`, `/happenings/[slug]`, `/faq`, `/faqs`, `/restaurant`, `/cookies`, `/map-styles`, `/on-the-walls`, `/you-me-and-berlin`.

Nav labels: EN **Eat & Drink** / DE **Essen & Trinken** (`nav.eatDrink` — **not** equal). EN/DE **Happenings** **are** equal. EN/DE **Meetings** **are** equal.

### 18. Redirect map

✅ Exists in `next.config.ts:18-23`: room + meeting + **legal** + **scaffold** builders.

| Builder | `source:` entries |
|---------|-------------------|
| `buildRoomRedirects` | 6 static + 11×3 + 1 alias = **40** |
| `buildMeetingRedirects` | **4** (index + inquiry only — **not** per-room Galaxy slugs) |
| `buildLegalRedirects` | **12** |
| `buildScaffoldRedirects` | **51** |
| **Total** | **107** |

Generated **by hand in TS** from Galaxy folder names / briefs (comment `rooms/redirects.ts:3`). Not from the live sitemap dump.

Galaxy URLs in the 185-URL sitemap **without** a matching `source` include: `/karriere`, `/en/careers`, `/newsletter`, `/en/newsletter`, `/faqs` (no page), `/explore-connect/*` article slugs (index only redirected), `/insider-und-ikonen/*` person slugs (index only), `/tagungen-arbeiten/{berlin1,tagungsraum-a1,…}` and `/en/meet-work/{…}` room slugs, `/en/meet-work/brussels`.

### 19. Live sitemap

`https://www.hotel-berlin.de/robots.txt` **200**: `Sitemap: https://www.hotel-berlin.de/sitemap.xml` (and a Galaxy video sitemap).

`https://www.hotel-berlin.de/sitemap.xml` **200**, 31686 bytes, `x-glxd-source-region: eu-central-1`.

**185 URLs.** Unprefixed (DE Galaxy): **94**. `/en/…`: **91**.

Sample patterns (counts): `/en/insiders-and-icons/[slug]` 24, `/en/meet-work/[slug]` 23, `/en/sleep-relax/[slug]` 16, `/ubernachten-relaxen/zimmer-suiten/[slug]` 11, `/en/explore-connect/[slug]` 7, plus index legal/contact/eat-drink/gallery/newsletter/careers.

### 20. `/` → `/de`, localePrefix, trailing slash

- `/` → **307** `Location: /de` (`src/app/page.tsx:4` `redirect('/de')`).
- Galaxy-style `/impressum` → **308** `/de/impressum` (`permanent: true`).
- `/de/rooms` → `/de/zimmer` (next-intl; non-follow **307**, follow **200**). `/en/zimmer` → `/en/rooms` (follow **200**).
- `/de/meetings` → `/de/tagungen` (follow **200**). `/en/tagungen` → `/en/meetings` (follow **200**).
- Bare `/impressum` → **308** `/de/impressum`; `/datenschutz` → **308** `/de/datenschutz` (probe, 19 Sept).
- `localePrefix: 'always'` still `src/i18n/routing.ts:8-9`. `localeDetection: false`.
- `trailingSlash` **does not exist** in `next.config.ts` (Next default: no trailing slash). Live Galaxy URLs also unprefixed without trailing slash in the sitemap.

### 21. `not-found.tsx` / `error.tsx`

❌ Locale `not-found.tsx` — **does not exist**.  
❌ `error.tsx` / `global-error.tsx` / `loading.tsx` under `src/app` — **does not exist**.  
Payload admin only: `src/app/(payload)/admin/[[...segments]]/not-found.tsx`.

Default Next 404 is unlocalised, outside the site shell (Step 0 §36). Nested 404s on :3000 still that document. Confirmed on :3001: `/de/happenings/does-not-exist` **404** `title=NO TITLE`; `/de/book` **404** `title=404: This page could not be found.`

---

## 5. SEO, AEO and metadata

### 22. Per-route metadata (gaps)

Helpers: homepage `page.tsx:17-32`; hub `hereAlternates`; rooms/meetings/restaurant own `generateMetadata`; entity `entityMetadata`; legal `legalPageMetadata`; scaffolds `scaffoldPageMetadata`.

| Field | State |
|-------|--------|
| `<title>` | Present on sampled routes. Missing-doc slug pages return `{ title: 'Not found' }` (`happenings/[slug]/page.tsx:50`). |
| meta description | Homepage uses `t('heroSubline')`. Legal uses first body paragraph. Scaffolds use stub intro. |
| canonical | Homepage `https://hotel-berlin.de/${locale}` (`page.tsx:25`) — **no `www`**. Live site is `www.hotel-berlin.de`. |
| hreflang de/en/x-default | Present on helpers. `map-styles`: **none** (title + noindex only). |
| OG image | **Only** `rooms/[slug]/page.tsx:86-96` (`socialImage`). All other routes: **does not exist**. |
| OG title/description | **does not exist** except room social image block (no `openGraph.title`). |

Duplicates: many titles are `{page} \| Hotel Berlin, Berlin`. Homepage title is exactly `Hotel Berlin, Berlin` both locales (`page.tsx:22`).

### 23. `sitemap.xml` / `robots.txt` (this app)

❌ `src/app/robots.ts` — **does not exist**.  
❌ `src/app/sitemap.ts` — **does not exist**.  
`:3001/robots.txt` **404** `title=NO TITLE`. `:3001/sitemap.xml` **404** `title=NO TITLE`. No staging/production switch in code.

Live Galaxy robots: `User-agent: *` / `Disallow:` (allows indexing) — that is the **current hotel site**, not this app.

### 24. JSON-LD

| Route | Graph |
|-------|--------|
| All `[locale]` | Hotel + **`ReserveAction`** (`layout.tsx:37-60`) — **new since Step 0** |
| Home | FAQPage + neighbourhood ItemList (unchanged pattern) |
| `/rooms` | ItemList |
| `/rooms/[slug]` | HotelRoom + Offer |
| `/meetings` | ItemList |
| `/meetings/[slug]` | MeetingRoom |
| `/restaurant` | Venue |
| `/neighbourhood` `[slug]` | Place + Review |
| `/you-me-and-berlin` `[slug]` | Person |
| `/happenings/[slug]` | **Event** (`buildEventPageGraph`) — **new** |
| `/faq`, `/here/faq`, hub help | FAQPage |
| Scaffolds, most here subpages, legal | **none beyond layout Hotel** |

Schema validator (Google Rich Results / local): **not run**.  
`reviewRating` guard tests: **pass** (`aeo-schema` 52/52 including both GUARD tests).

### 25. Booking handoff (widget audit §7)

✅ `buildRadissonBookingUrl` — `src/lib/booking/radisson.ts:47`.  
✅ Tests — `tests/int/booking.int.spec.ts` (11 `it`).  
✅ `ReserveAction` from the same template (`reserveAction.ts:19`; `buildRadissonBookingUrlTemplate`). Emitted on every locale layout.  
⚠️ `priceRange`: Hotel JSON-LD in `layout.tsx` **does not emit `priceRange`**. DB `hotel.price_range` = **`€€`**. Venues/places builders still have a `priceRange` field; Lütze UI shows cuisine **Italian** not the Galaxy `7480.00 €` string.  
✅ `Offer` / `HotelRoom`: room detail via `buildHotelRoomPageGraph` / `buildOfferNode` (`hotelRoom.ts:68`).

English Radisson path is `en-gb` (`radisson.ts:13`), not Galaxy `en-us`.

### 26. Test counts

| Suite | This pass | Step 0 |
|-------|-----------|--------|
| `aeo-schema` `tsx --test` | **52 pass / 0 fail / 0 skipped** | 46 |
| `venue-time` `it(` count | **32** in `tests/int/venue-time.int.spec.ts` | 32 |
| no-fabricated-`reviewRating` | both GUARD tests **pass** | pass |

Full `test:int` **not re-run** this pass.

### 27. Favicon / PWA

❌ `favicon` — **does not exist** (`find public src/app` for favicon/apple-touch/manifest → empty).  
❌ `apple-touch-icon` — **does not exist**.  
❌ web manifest — **does not exist**.  
❌ `theme-color` — **does not exist** in app source.

`public/` contains `images/` only.

---

## 6. Forms, email and third-party integrations

### 28. Forms

| Form | Route | Handler | Destination | Validation | Spam | States | i18n |
|------|-------|---------|-------------|------------|------|--------|------|
| Meeting inquiry | `/meetings`, `/meetings/request` | `MeetingInquiryForm.tsx` POST `src/app/api/meeting-inquiries/route.ts:5` | Payload `meeting-inquiries`; emails via `afterChange` → `inquiryEmails.ts` | Client `MeetingInquiryForm.tsx:82-83`; server required fields `route.ts:28-38` | **does not exist** (no honeypot / rate limit / captcha) | form status submitting/error; API 400/500 | yes `meetingsPage.request` |
| Contact | `/contact` | **does not exist** | address/tel/mailto only | — | — | — | stub copy |
| Newsletter | **does not exist** | — | live Galaxy `/newsletter` has no new-site equivalent | — | — | — | — |

### 29. Resend

⚠️ Partial. `RESEND_API_KEY` / `RESEND_FROM_EMAIL` read in `inquiryEmails.ts:24-34`. **Not** in `.env.example`. Default from `Hotel Berlin, Berlin <noreply@hotel-berlin.de>`. Subjects still `[PLACEHOLDER]`. If key missing: logger warn, inquiry still saved (`inquiryEmails.ts:25-29`). `.env` this machine: those vars **not listed** (only DATABASE_URL, PAYLOAD_SECRET, MAPBOX). **Nothing sends in dev today.** Payload: `No email adapter provided. Email will be written to console.`

### 30. Booking CTAs

| Place | What it produces |
|-------|------------------|
| Nav `BookNowButton` | Opens `BookingPanel`; rooms tab → `buildRadissonBookingUrl` (`BookingMenu.tsx` + `radisson.ts`). DE: `https://www.radissonhotels.com/de-de/hotels/radisson-individuals-berlin?datein=…&languageid=7`. EN: `en-gb` + `languageid=1`. Optional `_ga`. |
| Nav events tab | `buildMeetingPackageUrl` → `https://hotelberlinberlin.meetingpackage.com/venue/hotel-berlin-berlin-2?…&lang={locale}` |
| Footer **Verfügbarkeit prüfen** | `href="/book"` unlocalized (`BookDirectStrip` + seed) — **404** |
| Meetings pages | inquiry form, not Radisson |

### 31. Third-party scripts in this repo

| Vendor | Loaded? | Where |
|--------|---------|--------|
| MeetingPackage | **URL builder only**, no vendor script | `src/lib/booking/meetings.ts` |
| DialogShift | **does not exist** as a script (legal cookie JSON may mention it historically) |
| Hotjar | **does not exist** |
| Hotelchamp | **does not exist** |
| GA/GTM | **does not exist** as a tag. `getGaLinkerParam` reads `_ga` cookie if some other party set it (`ga.ts:1-7`) |
| Mapbox GL | **yes**, static `import mapbox-gl` | `NeighbourhoodGuideMap.tsx:3`, `MapStylePreview.tsx:3`. Homepage ships `node_modules_mapbox-gl_dist_mapbox-gl_*.js` (DOM script list on `/de`). **Not** `next/dynamic`. |
| Galaxy/gms | **does not exist** |

### 32. Mapbox

- Token: `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` (`.env` SET, public pk). Optional `MAPBOX_ACCESS_TOKEN`, `NEXT_PUBLIC_MAPBOX_STYLE_ID`.
- Default style `mapbox/light-v11` (`config.ts:23-30`).
- Routes importing `mapbox-gl`: neighbourhood map teaser (homepage + neighbourhood + explore), `/map-styles`.
- Lazy-load: **does not exist**.
- Bundle: homepage client includes full `mapbox-gl` chunk (observed). Production size **not measured** (no `pnpm build` this pass).
- URL-scope of the public token: ❓ needs checking in Mapbox account (not in repo).

---

## 7. Legal and compliance (Germany / EU)

### 33. Impressum / Datenschutzerklärung

✅ Routes both locales (`/de/impressum`, `/en/imprint`, `/de/datenschutz`, `/en/privacy`) — HTTP 200 on :3001.  
Content: JSON fallback is live-site-like (Pandox Berlin GmbH, HRB 96069, privacy dated **24. April 2026**). CMS `legal_documents` **5 rows**, DE+EN titles filled. Render: Payload first, else JSON (`documents.ts:61-69`).  
🔒 Hotel has not been recorded as signing this copy in-repo.  
Footer: Impressum + Datenschutz **yes** on `/de`. Disclaimer **no** (DB). Terms as AGB **yes**.

### 34. Cookie / consent

❌ CMP (Cookiebot / Usercentrics / Klaro) — **does not exist**.  
`src/lib/consent/mapConsent.ts:4-6`: “No CMP is wired”.  
`HomepageMapTeaser.tsx:80`: **“Cookie consent gate temporarily skipped: map loads whenever a token is present.”**

First load `/de` (browser, no consent cookie):

- Same-origin: `/_next/*`, `/api/media/file/*`.
- **upload.wikimedia.org** via `/_next/image?url=https://upload.wikimedia.org/…` (Neue Nationalgalerie fallback).
- Mapbox **JS** bundled same-origin; **tile hosts not observed** in this snapshot (`canvas.mapboxgl-canvas` count 0 at inspect time — map may still initialise and then call `api.mapbox.com` / `events.mapbox.com`).
- `images.unsplash.com` allowed in `next.config.ts:40-42`; 893 Ryotei fallback is Unsplash (`teaserImageFallbacks.ts:36-38`) — not in the first 8 imgs this snapshot.
- Google Fonts **runtime request**: not observed (Archivo via `next/font`).
- GA/GTM/Hotjar: none.

### 35. Fonts

- **Laica A**: self-hosted `src/assets/fonts/laica/*.woff2` (`laica.ts:3-25`). **License file: does not exist** in that folder (only woff/woff2).
- **Archivo**: `next/font/google` (`layout.tsx:13`) — Next downloads at build and **self-hosts** at runtime. No `fonts.googleapis.com` in `src/`.
- Archivo Narrow: **does not exist**.

### 36. Accessibility statement

⚠️ Route `/de/barrierefreiheit` / `/en/accessibility` **exists as a scaffold stub** (`createScaffoldPage('accessibility')`). It is **not** a BFSG/EAA statement. Footer links it.

### 37. `legal-documents` collection

Exists (`LegalDocuments.ts`, `payload.config.ts:62`). DB: **5** docs (imprint, privacy, terms, cookies, disclaimer), locales de+en. **Rendering:** `getLegalDocumentFromPayload` then JSON fallback. Admin English labels (`'Legal page'`). `revalidatePath` on change (`LegalDocuments.ts:34-40`).

---

## 8. Accessibility

### 38. axe

⚠️ **Not run against every route this pass.** `@axe-core/playwright` exists (`tests/e2e/a11y-homepage.spec.ts`, config `baseURL: http://localhost:3001`). Suite not executed (compile contention).

Homepage browser snapshot (`/de`): skip link first in DOM; one `h1`; named map buttons; FAQ buttons named; hamburger named. Duplicate meetings **h2** “Tagen & Arbeiten” / “Tagen &Arbeiten” still present (Step 0 §58). Duplicate map card headings (Neue Nationalgalerie twice in the a11y tree).

### 39. Keyboard

| Surface | Observed |
|---------|----------|
| Homepage skip link | First interactive in snapshot (`layout.tsx:71`). CSS `.skip-link` off-screen until `:focus` (`globals.css:86-101`). `:focus-visible` ring `2px var(--ctx-accent)` (`globals.css:104`). Automation Tab did not move focus off `BODY` — **inconclusive** in this tool. |
| Booking panel | `role="dialog"` `aria-modal` Escape handler (`BookingMenu.tsx:91-114`). Click on “Jetzt buchen” in automation left `aria-expanded` **collapsed** — **not verified open**. |
| `/hier`, room detail, inquiry form, map | **not keyboard-walked** this pass (hub 200 on :3001 but not exercised). Map `easeTo` duration 450 (`NeighbourhoodGuideMap.tsx:439`) with keyboard disabled on canvas (`:243`). |

### 40. Contrast

Not measured with a contrast engine this pass. Token notes already in `tokens.json`: white on food/gold **fails AA at small sizes** (`tokens.json:40`); community navy+white ~5.9:1 (`tokens.json:52`). Used together: category pills on happenings cards; footer `hbb-footer-link` `#BBBBBB` on `#2D2A26`.

Legal/scaffold `text-gray-500` on `bg-hbb-page` — Tailwind gray, not a token pair.

### 41. `prefers-reduced-motion`

Hero: `HomeHeroLayout.tsx:44` / `HereHeroLayout.tsx:69` + many `globals.css` `@media (prefers-reduced-motion: reduce)` blocks.  
Map pin ease: **no** reduced-motion branch around `easeTo` duration 450 (`NeighbourhoodGuideMap.tsx:434-443`). Initial `fitBounds` `duration: 0` (`:233`).

### 42. Images empty/missing alt

Media collection alt **346/346** filled. Neighbourhood slots empty → name-block fallback, not empty `<img alt="">`. Wikimedia fallbacks have credits. Decorative: awards carousel uses alt from CMS; not audited per-file this pass.

---

## 9. Performance

### 43. Production build / Lighthouse

❌ **`pnpm` is not on PATH** (same as Step 0 §49).  
❌ `pnpm build && pnpm start` **not run** this pass.  
❌ Lighthouse **not run**.

Step 0: `npm run build` compiled then **TypeScript failed** on `ScaffoldPageView` href union. That file is still uncommitted; not re-checked.

### 44. Client JS / mapbox-gl

No production build output. Dev homepage **does** ship `node_modules_mapbox-gl_dist_mapbox-gl_*.js`. Import is **static**, not lazy. Routes: homepage teaser, neighbourhood, `/here/explore`, `/map-styles`.

### 45. Images

- Many slots still **raw `<img>`** with `eslint-disable-next-line @next/next/no-img-element` (hero slider, rooms teaser, Lutze, meetings, map fallback).
- Wikimedia place fallbacks go through **`next/image`** (`/_next/image?url=https://upload.wikimedia.org/…&w=3840&q=75`) — **`w=3840`** on a card is oversized.
- `sizes` : PlaceCard inventory said `(max-width: 768px) 100vw, 33vw`. Hero native imgs: **sizes not set**.
- Original upload resolution: Media **no `imageSizes`**. GET `1600091938-5f5f7722a4ac3-thumb.jpg` = **160067 bytes**; `1608916183-5fe61cd744125-thumb.jpg` = **229447**. None of the three GET samples exceeded 500 KB. Full corpus **not** weighed on the wire.

### 46. Rendering mode / revalidation

No `export const revalidate` / `dynamic` on app pages (grep). Pages that call Payload are **dynamic by default**.

Revalidate hooks:

- `LegalDocuments` `revalidatePath` (`LegalDocuments.ts:34-40`)
- Footer / Homepage / Navigation globals: `revalidatePath('/', 'layout')`
- NeighbourhoodPlaces / Places: `fetch` `/api/revalidate?secret=` **if** `REVALIDATE_SECRET` set (`NeighbourhoodPlaces.ts:19-28`). `.env` this machine: **not set**.
- `src/app/api/revalidate/route.ts` GET with secret.

Publishing without those secrets/hooks: **process restart / rebuild**. `PAYLOAD_DATABASE_PUSH` still the schema strategy (`payload.config.ts:81-83`). `payload_migrations` row: `dev` / batch `-1` (push mode, **not** a real migration history).

---

## 10. Infrastructure and deployment

### 47. Hosting

❌ `vercel.json` — **does not exist**.  
✅ Netcup VPS docs: `deploy/netcup/DEPLOY.md`, `nginx.conf`, `ecosystem.config.cjs` (PM2 `next start`, `cwd: /var/www/hotel-berlin`, `PORT=3000`).  
DEPLOY.md: turn **off** Vercel project **hotel-berlin-berlin** auto-deploys. Git clone `github.com/bernardbolter/hotel-berlin`.  
`hotel-berlin.bernardbolter.com`: mentioned in **briefs** as a 2 Sept preview (`doc/here/HotelBerlin_HomeHereReconciliation_BuildBrief.md:4`). **Not** in deploy config. ❓ where it is deployed from — needs checking outside the repo.

Preview deploys: ❓ Vercel still connected? DEPLOY.md says disconnect.

### 48. Database

`postgresAdapter` `connectionString: process.env.DATABASE_URL` (`payload.config.ts:75-78`). Host this env: **localhost**, db **hotelberlin**.  
Migrations: **not used**; `push: true` in non-production. `payload migrate:status` **not run** (would only show the dummy `dev` row).  
Seed: `npm run seed` and many `seed:*` scripts. `isSeeded()` skips if rows exist (`seed/index.ts:26-30`). **No `NODE_ENV === 'production'` abort.** DEPLOY.md tells operators to run seed on first boot. ⚠️ unsafe if pointed at a filled production DB with empty checks failing open on new collections.

### 49. Media storage

Payload **local disk** default (`Media.ts:15` `upload: true`; no cloud plugin in `payload.config.ts:86` `plugins: []`). **Does not survive a serverless deploy.** Netcup disk is the intended target (`DEPLOY.md:99`). `next.config.ts` already allows `*.r2.cloudflarestorage.com` — adapter **not wired**.

### 50. Environment variables

| Var | File:line | `.env.example` | Build vs runtime |
|-----|-----------|----------------|------------------|
| `DATABASE_URL` | `payload.config.ts:77` | yes | runtime (Payload) |
| `PAYLOAD_SECRET` | `payload.config.ts:71` | yes | runtime |
| `PAYLOAD_DATABASE_PUSH` | `payload.config.ts:83` | commented | runtime |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | `map/config.ts:26` | yes | **build+runtime** (inlined) |
| `NEXT_PUBLIC_MAPBOX_STYLE_ID` | `map/config.ts:30` | commented | build+runtime |
| `MAPBOX_ACCESS_TOKEN` | `geocode/constants.ts:38` | commented | runtime geocode |
| `NOMINATIM_USER_AGENT` | `nominatimGeocode.ts:5` | commented | runtime |
| `SKIP_GEOCODE_HOOK` | geocode hook + seeds | commented | runtime |
| `REVALIDATE_SECRET` | `api/revalidate/route.ts:8`, collection hooks | commented | runtime |
| `NEXT_PUBLIC_SITE_URL` | Places/Neighbourhood hooks | commented | runtime |
| `RESEND_API_KEY` | `inquiryEmails.ts:24` | **no** | runtime |
| `RESEND_FROM_EMAIL` | `inquiryEmails.ts:34` | **no** | runtime |
| `CI` | `playwright.config.ts` | no | tests |
| `QA_BASE_URL` | `scripts/qa-map-pass.ts:22` | no | scripts |
| `ROOM_ASSETS_DIR` / `HERO_ASSETS_DIR` / various `*_SEED_FORCE` | seed scripts | no | seed CLI |
| `NODE_ENV` | payload push | implicit | both |

Secrets in git: **not searched in history this pass**. `.env` is local. No `.env` in `git status`.

### 51. EU data residency

- Live Galaxy: `x-glxd-source-region: eu-central-1` on sitemap (CloudFront TXL).
- This app: Netcup VPS + local Postgres — **region not named** in repo. ❓
- Media: local disk on that VPS if DEPLOY.md followed. ❓
- Mapbox / Resend / Nominatim: third-party, region ❓

### 52. Security headers

❌ **does not exist** in `next.config.ts`.  
❌ Netcup `nginx.conf` is reverse proxy only (no CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy).  
Live Galaxy (not this app): HSTS `max-age=63072000; includeSubdomains; preload`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.

### 53. Error monitoring / uptime / analytics

❌ Sentry — **does not exist**.  
❌ Uptime check in repo — **does not exist**.  
❌ Analytics tags — **does not exist**.

### 54. Backups

❌ Database backup script — **does not exist**.  
DEPLOY.md: “back up that folder with the database” (prose only). No cron/export script.

---

## 11. Payload admin and handover

### 55. Users and roles

`Users.ts`: **no `roles` field**, **no custom access**. One user: `bernardbolter@gmail.com`.  
Payload default: any logged-in user can admin.  
Collections with `read: () => true` (public read): Media, People, NeighbourhoodPlaces, HeroSlides, Places, LegalDocuments, FAQs, MeetingDocuments (read public; write logged-in), MeetingInquiries (`create: () => true` — **public create**).  
Rooms, Events, etc. with **no `access` key**: Payload default (logged-in for all ops) — public site still reads via Local API `overrideAccess` default true.  
❌ Editor role that cannot touch `users` — **does not exist**.

### 56. Admin UI language / descriptions

`payload.config.ts` `admin`: **no `i18n` / German UI**. Labels English (“Legal page”, “Draft”/“Published”).  
Naive count of `name:` vs `description:` keys in collections/globals/fields: **~493 name keys, ~225 description keys**. Collections with **0** description keys: `Artists.ts`, `Users.ts`, `Media.ts` (alt has no `admin.description`).

### 57. Drafts / versions / preview

❌ Collection `versions` / `drafts: true` — **does not exist**.  
People `status` draft/published select is **not** Payload drafts.  
Live preview URL: NeighbourhoodPlaces / Places hooks hit `/api/revalidate`, not Payload live preview. **Live preview config: does not exist.**

### 58. Editor must compute by hand

Unchanged inventory §6 plus working-tree additions. Editors still author walking copy that geocode can compute; district can be computed (`district.ts`) while a CMS field may still exist (entity brief: district migration out of scope). Event RRULE expansion is computed. Legal Lexical is converted to spans. Footer year is computed.

### 59. `/admin` protection

Login only (Payload auth). **No** rate limiting in repo. **Not** linked from the public nav. **Not** listed in a robots file (app has none) — crawlers can request `/admin` if they guess the path. `proxy.ts` matcher **excludes** `admin` from next-intl (`proxy.ts:9`).

---

## 12. Code health

### 60. Build / tsc / lint / tests

| Check | This pass | Step 0 |
|-------|-----------|--------|
| `pnpm build` / `npm run build` | **not run** | compile ok, tsc fail ScaffoldPageView |
| `tsc --noEmit` | **not run** | not clean (broken `.next/dev/types`) |
| `npm run lint` | **not run** | crashed circular JSON |
| `test:int` | **not run** | 10 files, 98 passed |
| `aeo-schema` | **52 passed** | 46 |
| `test:e2e` / `test:a11y` | **not run** | not run |

New int specs on disk (uncommitted): `booking.int.spec.ts` (11), `entity-pages.int.spec.ts` (9). Count of `it(`/`test(` under `tests/`: **higher than 98** if those files are included.

### 61. TODO / FIXME / HACK / `@ts-ignore` / `eslint-disable`

- `TODO` / `FIXME` / `HACK` / `@ts-ignore` in `*.ts/tsx`: **none** (same as Step 0).
- `@ts-expect-error`: `SweepCta.tsx:106`, `HubSerifHeading.tsx:45`, `LanguageSwitcher.tsx:119,137`.
- `eslint-disable` `@next/next/no-img-element`: hero, rooms teaser, Lutze, meetings, map, spotlight, etc. (launch-relevant: LCP images not going through `next/image`).
- `payload-types.ts`: file-level `/* eslint-disable */`.

### 62. Dead code (delta vs Step 0 §5.25)

Still unused on mounted hub: `HerePeopleSection`, `ArtInBuildingSection`, `StayInfoCard`, `VenueCompactCard`, `BasementSection`, `TonightSection` (does not exist). `CultureSection` / `HeroSection` / `RoomSlider` still unmounted (inventory). `places` collection still parallel to `neighbourhood-places`. `EditorialBand` **now used** on person pages.

### 63. Dependencies

`pnpm` **not on PATH** — `pnpm outdated` / `pnpm audit` **not run**.  
Locked in `package.json`: Next **16.2.6**, Payload **3.85.0**, next-intl **^4.13.0**, React **19.2.6**.

### 64. Git

- Branch `feat/map-section-places-people` = `origin/main` = `db8e53a`.
- Local `main` **behind** at `80fb4a8`.
- **Uncommitted** launch work (booking, entities, legal, scaffolds, redirects) is **not on any remote**.
- `gh pr list`: **not available** (`gh auth login` required). Open PRs not enumerated.

---

## 13. Close

### 65. Launch blockers — code

1. Nested locale 404 on the long-running / production-like compile path still reproduces on :3000 (§3). Fresh compile works; the broken compile must not be what ships.  
2. No `robots.ts` / `sitemap.ts` for this app (§23).  
3. No locale `not-found.tsx` / `error.tsx` (§21).  
4. Footer **Verfügbarkeit prüfen** still targets `/book`, which does not exist (§30, §2).  
5. Meeting inquiry: no spam protection; Resend templates still `[PLACEHOLDER]`; `RESEND_*` undocumented (§28–29).  
6. Mapbox loads without a CMP; consent gate skipped in code (§34).  
7. Media adapter is local disk — not viable if the host is serverless; R2 pattern in Next config is unused (§49).  
8. No security headers in Next or nginx (§52).  
9. No favicon / apple-touch-icon / manifest / theme-color (§27).  
10. OG image missing on all routes except room detail; canonical host is `hotel-berlin.de` not `www` (§22).  
11. `mapbox-gl` statically bundled on the homepage (§32, §44).  
12. Production TypeScript build not shown green this pass; Step 0 failed on scaffolds still in the tree (§60).  
13. Lint pipeline still unknown (Step 0 crash) (§60).  
14. `/faqs` pathname without a page (§11).  
15. No editor roles — every CMS user is a full admin (§55).  
16. Meeting Galaxy room URLs not in the redirect map (§18).  
17. Live preview / drafts do not exist — editors publish straight to whatever the app reads (§57).

### 66. Launch blockers — hotel

1. Legal copy sign-off (Impressum, Datenschutz, AGB, cookies, disclaimer) — pages wait on 🔒 (§33, §37).  
2. BFSG/EAA accessibility statement — stub only (§36).  
3. CMP / cookie decision — whole site third-party map + Wikimedia (§34).  
4. Final DE slugs: Happenings, FAQ, restaurant, you-me-and-berlin, on-the-walls (§17).  
5. DE translations: 10 prospect FAQs; 49/50 amenity tags; Sleep & Relax; Meetings/Happenings nav; Magwie EN body; Italian (§5, §10).  
6. Neighbourhood photography (0/21) and remaining YMB portraits (5/16) (§4, §10).  
7. Artwork records (0) — art/gallery/on-the-walls (§11).  
8. WiFi as a publishable fact vs FAQ (§2).  
9. Sauna hours conflict — unchanged since 16 Sept, Step 0 §64.  
10. Guest Care extension empty — unchanged since 16 Sept, Step 0 §64.  
11. Bed configuration confirmation — unchanged since 16 Sept, Step 0 §64.  
12. Fingerboard location/photos/hours — unchanged since 16 Sept, Step 0 §64.  
13. Meeting room count 21 vs brief 22 (§2).  
14. Scaffold pages (about, contact, offers, policies, sustainability, awards, amenities, people, hybrid) need real copy (§11).  
15. Resend sending domain / from-address / approved email copy (§29).  
16. Disclaimer in the **CMS footer** (seed has it, DB does not) (§2).

### 67. Launch blockers — infrastructure / accounts

1. DNS / www vs apex for `hotel-berlin.de` vs canonicals in code (`https://hotel-berlin.de` without www) (§22).  
2. Netcup (or other) production host, TLS, `server_name` still `YOUR_DOMAIN` in `nginx.conf` (§47, §52).  
3. Whether Vercel **hotel-berlin-berlin** is disconnected (§47) ❓.  
4. Where `hotel-berlin.bernardbolter.com` currently points ❓.  
5. Mapbox public token URL restrictions (§32) ❓.  
6. `RESEND_API_KEY` + domain auth (§29).  
7. `REVALIDATE_SECRET` / `NEXT_PUBLIC_SITE_URL` for CMS-triggered ISR (§46, §50).  
8. Laica A **licence file missing** from the repo (§35).  
9. Postgres + media backup process (prose only) (§54).  
10. EU region of the VPS/DB ❓ (§51).  
11. Payload admin account for the hotel (only one user today) (§55).

### 68. Should-fix before launch

- English identical strings that are not proper names (Sleep & Relax, Meetings, Happenings, Check-in/out) (§5).  
- Duplicate meetings h2 on homepage (§38).  
- `HUB_SECTIONS` vs JSX drift including unused `people` (§7).  
- Wikimedia/Unsplash on the homepage map without consent (§34).  
- `next/image` `w=3840` for neighbourhood cards (§45).  
- Raw `<img>` on LCP hero/rooms (§45, §61).  
- HEAD 404 on media (harmless for browsers, noisy for probes) (§4).  
- Scaffold/legal heading colours `#1F1F1F` / gray-500 vs tokens (§8).  
- `priceRange` €€ on Hotel global not in layout JSON-LD — confirm intentional vs widget-audit Galaxy `7480.00 €` (§25).  
- `/map-styles` reachable if guessed (§11).  
- People scaffold `/menschen` vs YMB people index (§11).

### 69. Can follow after launch

- Payload drafts/versions/live preview (§57).  
- Editor role + German admin UI (§55–56).  
- Cloud media adapter once hosting is a VPS with disk (§49).  
- Per-room Galaxy meeting redirects (§18).  
- Newsletter / careers (external today) (§28).  
- Archivo Narrow if design still wants it (§35).  
- Feature flags to hide homepage lower sections (V2 brief) (§2).  
- Deleting unused hub components (`StayInfoCard`, …) (entity brief out of scope).  
- `pnpm` as the documented runner vs `npm` actually used (§63).  
- Sentry/uptime (§53).

### 70. Contradictions between documents

Unchanged since 16 Sept, Step 0 §65, items 1–12, **plus this pass:**

13. **Nested 404.** Entity brief (`HotelBerlin_EntityPages_BuildBrief.md:389`) and Step 0 say nested routes 404. This pass: **404 on :3000, 200 on :3001**. Both are true of running processes today.  
14. **`/book`.** Widget audit + entity brief: live rates / `/book` are a separate workstream. Nav now has a Radisson/MeetingPackage dropdown; footer seed still `/book`.  
15. **English Radisson locale.** Widget audit §2: live Galaxy uses `en-us`. Code uses `en-gb` (`radisson.ts:8-13`) and cites that audit.  
16. **Footer Disclaimer.** Seed + fallback include it; live footer DB and the rendered `/de` footer omit it.  
17. **Canonical host.** Code `hotel-berlin.de`; live sitemap `www.hotel-berlin.de`.  
18. **People routes.** Scaffold `/people` `/menschen` vs YMB `/you-me-and-berlin` both exist; entity brief treats YMB as the person page.  
19. **Schema inventory vs brief “18 collections”.** Inventory: 19 including `legal-documents` (already noted 16 Sept). Collection is now in `payload.config.ts` and has 5 rows.
