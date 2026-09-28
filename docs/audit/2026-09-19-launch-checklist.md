# Hotel Berlin, Berlin — Launch Checklist v1

*19 September 2026 · built from `docs/audit/2026-09-16-full-site-audit.md` (Step 0), `docs/audit/2026-09-19-launch-readiness.md` (LR) and `docs/audit/HotelBerlin_Production_Infrastructure.md`*

**Launch path:** soft launch on a hotel-owned subdomain (not indexed, password-protected) → Bernard enters all content on production → switch hotel-berlin.de over. Everything is in scope. Target: as soon as possible.

**Owners:** **C** = code (Cursor brief) · **B** = Bernard · **H** = hotel. References point at audit sections.

---

## Decisions logged today

| # | Decision | Consequence |
|---|---|---|
| D1 | **Hosting: Vercel (managed)**, owned by the hotel, Bernard as admin. Neon Postgres in Frankfurt, **Cloudflare R2** for media (decided 20 Sept; not Vercel Blob), Resend EU. | The Netcup plan in `deploy/netcup/` is **retired**. R2 adapter and real migrations become code blockers. |
| D2 | **The signed-off homepage wins.** Meetings, events, map, Lütze and FAQ all stay. | The Homepage V2 "hide lower sections / feature flags" item is closed. Step 0 contradiction #5 is resolved. |
| D3 | **WiFi stays visible** in the hub. The hotel confirms the credentials are current and OK to publish. | Goes on the hotel list. Step 0 contradiction #7 resolved in favour of the HerePage DoD. |
| D4 | **All 15 placeholder pages ship.** Bernard writes their copy from the live site; the hotel approves it. | Content workstream, not code. The pages already exist as scaffolds. |

---

## Phase 0 — Today: secure the work

- [ ] **0.1 B** Commit and push the working tree. About 77 files of booking, entity, legal, scaffold, redirect and AEO work exist only on the iMac and are on no remote (LR §1, §64). Use a branch per area, or one "launch-prep" branch.
- [ ] **0.2 B** Bring local `main` up to `origin/main` (`db8e53a`). It is stale at `80fb4a8`.
- [ ] **0.3 B** Commit `docs/audit/*` and `docs/content/*` so the audits live with the code.
- [ ] **0.4 B** Send the hotel request (see *Asks for the hotel* below): accounts, DNS contact, DPO, Galaxy contract end.
- [ ] **0.5 B** Pick one package runner: `pnpm` isn't on PATH and `npm` is what actually runs (LR §63). Update scripts and docs to match.

---

## Phase 1 — Production foundation (before any content entry)

Everything entered after this lands in the production database. Nothing is entered twice.

**Accounts and hosting**
- [ ] **1.1 H/B** Hotel-owned Vercel Pro team. Move or recreate the existing `hotel-berlin-berlin` Vercel project there (LR §47).
- [ ] **1.2 H/B** Neon project in Frankfurt. Production branch plus a preview branch.
- [ ] **1.3 H/B** Cloudflare R2 bucket (EU jurisdiction). Public access via `NEXT_PUBLIC_MEDIA_URL` (`*.r2.dev` now, `media.hotel-berlin.de` later). CORS must allow browser-direct uploads (`doc/dev/MEDIA.md`).
- [ ] **1.4 H/B** Hotel-owned Mapbox account. Public token restricted to the production and soft-launch URLs (LR §32).
- [ ] **1.5 H/B** Resend account with an EU-region sending domain (e.g. `mail.hotel-berlin.de`). Needs DNS.
- [x] **1.6 B** Archive `deploy/netcup/`: mark it superseded, don't delete it.

**Code that has to exist before production takes content**
- [x] **1.7 C** Switch Payload from `push: true` to real migrations. Generate a baseline migration from the current schema. `payload_migrations` today holds only a dummy `dev` row (LR §46, §48). *Baseline is `src/migrations/20260919_122612_baseline.ts` (full CREATE for empty DBs). Local `next dev` still uses push. Production: `npm run migrate`. Do not run migrate against a push-built database.*
- [x] **1.8 C** Media: `@payloadcms/storage-s3` against Cloudflare R2 with `clientUploads: true` to get past the 4.5 MB function limit. Public URLs from `NEXT_PUBLIC_MEDIA_URL` (not stored on the record). *Adapter is enabled only when R2 credentials are set; local disk remains the fallback. See `doc/dev/MEDIA.md`.*
- [x] **1.9 C** Media: define `imageSizes` (card, hero, portrait, OG) and turn on `focalPoint` / `crop` **before** real photos are uploaded. Today only originals are served (LR §6). Base the widths on the largest rendered sizes in `schema-inventory.md` §3.
- [x] **1.10 C** Make `alt` localised (it's currently one language only) (LR §6).
- [x] **1.11 C** Guard the seed scripts: stop when `NODE_ENV=production` unless an explicit flag is set. `DEPLOY.md` currently tells operators to seed on first boot (LR §48).
- [x] **1.12 C** Complete `.env.example`: add `RESEND_*`, `REVALIDATE_SECRET`, `NEXT_PUBLIC_SITE_URL`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `NEXT_PUBLIC_MEDIA_URL` and the soft-launch flags (LR §50).
- [x] **1.13 C** Production build green: `tsc --noEmit` clean (`ScaffoldPageView` href union, Step 0), lint pipeline fixed (it crashes on circular JSON), full `test:int` passing (LR §60). *19 Sept: `tsc --noEmit` 0; `npm run lint` 0 errors / 44 warnings (Next 16 flat config, no FlatCompat crash); `test:int` 12 files / 118 passed; `npm run build` compiled + typechecked, 212 pages.*
- [x] **1.14 C** Soft-launch mode, controlled by env: basic auth in `proxy.ts`, a `robots.ts` that disallows everything, and `noindex` metadata. One switch flips all three at the domain switch. *`SOFT_LAUNCH=true` enables all three (`src/lib/launch/softLaunch.ts`). Unset it to go live.*
- [x] **1.15 C** Revalidation: every collection and global calls `revalidatePath` / `revalidateTag` on change. Today only legal, the globals and the places collections do (LR §46). Without it, content Bernard enters won't appear without a redeploy. *Shared helper `src/lib/payload/revalidate.ts` (`revalidatePath('/', 'layout')` + tag `cms` + collection tag). Skips `users` and `meeting-inquiries`. HTTP `/api/revalidate` still works and also busts the layout.*
- [x] **1.16 C** Payload roles: `admin` and `editor`. The editor role can't touch `users` or config globals (LR §55). *`role` on Users (`saveToJWT`). Editors are hidden from Users and the Hotel global; they can still edit collections plus Homepage, Navigation, Footer, Meetings. Public meeting-inquiry create is unchanged. Existing sessions without `role` are treated as admin so the current operator is not locked out. New hotel accounts: set role to Editor.*
- [ ] **1.17 B** First deploy to `*.vercel.app`. Run migrations and a one-time import of the 346 existing media files into R2 (`scripts/media-to-r2.ts`), then check that nested routes return 200 on a clean production build. The 404s on :3000 were a stale dev compile (LR §3), but that has to be proven on production.

---

## Phase 2 — Code blockers (before the soft launch)

**Routing and errors**
- [x] **2.1 C** A localised `not-found.tsx` and `error.tsx` inside the site shell. Today missing slugs render Next's default page with `title=NO TITLE` (LR §21). *`[locale]/not-found.tsx` + catch-all `[...rest]`; `/here` has content-only variants so the hub layout is not doubled. `error.tsx` is a client boundary with retry + home.*
- [ ] **2.2 C** The footer's "Verfügbarkeit prüfen" → open `BookingPanel` or go straight to `buildRadissonBookingUrl`. `/book` doesn't exist (LR §30).
- [ ] **2.3 C** Remove the `/faqs` pathname alias, or redirect it to `/faq` (LR §11).
- [ ] **2.4 C** Put `/map-styles` behind auth or exclude it from production builds (LR §11).
- [ ] **2.5 C** Make `HUB_SECTIONS` match what `/hier` actually renders. Remove `people` or render it (LR §7).

**SEO and metadata**
- [ ] **2.6 C** `sitemap.ts`: both locales, generated from Payload, with hreflang alternates (LR §23).
- [ ] **2.7 C** OG image, title and description on every route, falling back to the Hotel global's default image. Today only room detail has them (LR §22).
- [ ] **2.8 C** Canonical host follows decision **O1** below. The code says `hotel-berlin.de`, Galaxy is indexed as `www.hotel-berlin.de` (LR §22).
- [ ] **2.9 C** Favicon set, `apple-touch-icon`, web manifest, `theme-color` (LR §27).
- [ ] **2.10 B** Run the Google Rich Results Test on one route per graph type: Hotel, HotelRoom+Offer, MeetingRoom, Event, Person, Place, FAQPage (LR §24).

**Forms and email**
- [ ] **2.11 C** Meeting inquiry spam protection: honeypot plus a per-IP rate limit (LR §28).
- [ ] **2.12 C** Inquiry email templates: replace the `[PLACEHOLDER]` subjects and body with DE and EN versions (LR §29).
- [ ] **2.13 C** Contact page: a form, or a deliberate decision that phone and email are enough (LR §28). *See O4.*

**Privacy and consent**
- [ ] **2.14 C** Consent: put Mapbox **and** the external image fallbacks (Wikimedia/Unsplash) behind consent, or proxy/self-host the images. Remove the skipped gate at `HomepageMapTeaser.tsx:80` (LR §34). *See O2 for which consent tool.*
- [ ] **2.15 C** Security headers in `next.config.ts`: HSTS, CSP, `frame-ancestors`, `nosniff`, Referrer-Policy, Permissions-Policy (LR §52). With no nginx any more, they have to live in the app.

**Performance**
- [ ] **2.16 C** Lazy-load `mapbox-gl` with `next/dynamic` and only initialise it on scroll-into-view. It is currently bundled statically on the homepage (LR §32, §44).
- [ ] **2.17 C** Move the LCP images (hero, rooms teaser, Lütze, meetings) from raw `<img>` to `next/image` with `sizes` and `priority` (LR §45).
- [ ] **2.18 C** Fix the `w=3840` requests on neighbourhood cards (LR §45).
- [ ] **2.19 C** Rendering mode: static/ISR for content pages (`revalidate` + tag hooks from 1.15) instead of fully dynamic. This matters for cost and speed on Vercel (LR §46).
- [ ] **2.20 B** Lighthouse (mobile) on home, `/hier`, rooms, room detail, meetings and `/nachbarschaft` against the production build (LR §43).

**Accessibility**
- [ ] **2.21 C** Fix the duplicate meetings `h2` on the homepage and the duplicate map card headings (LR §38).
- [ ] **2.22 C** Add a reduced-motion branch around the map `easeTo` (LR §41).
- [ ] **2.23 C** Run the axe suite on every route in both locales and fix the results (LR §38).
- [ ] **2.24 B** Keyboard pass on `/hier`, room detail, the inquiry form, the map and the booking panel. The panel opening was not verified (LR §39).
- [ ] **2.25 C** Fix the contrast pairs: white on food/gold at small sizes, footer `#BBBBBB` on `#2D2A26`, and `text-gray-500` on the legal/scaffold pages (LR §40).

**Pattern conformance with the signed-off pages**
- [ ] **2.26 C** Move the serif section heading into one component. It is duplicated in `EventsSection`, `NeighbourhoodMapSection` and `HubSerifHeading` (LR §9).
- [ ] **2.27 C** Replace the hard-coded `#1F1F1F`, `#2A3540`, `text-[11px]` and arbitrary paddings with tokens (LR §8). This includes `LegalPageView` and `ScaffoldPageView`.
- [ ] **2.28 C** Give the legal and scaffold pages the signed-off heading and section rhythm (LR §11).

**Redirects**
- [ ] **2.29 C** Regenerate the redirect map **from the live 185-URL sitemap**, not by hand. It is missing: 23 meeting-room slugs, 24 `insiders-and-icons` person slugs → `/you-me-and-berlin/[slug]`, 7 `explore-connect` articles, `/karriere`, `/newsletter`, `/en/meet-work/brussels` (LR §18). Add a test that every sitemap URL returns 200 or 308.

---

## Phase 3 — Content (Bernard enters it on production, from the hotel's material)

**German translations** (LR §5)
- [ ] **3.1 B** 125 message keys where DE and EN are identical. Go through the namespaces: `here` 47, `meetingsPage` 11, `rooms` 10, and the rest. Proper names (Wallride, KTTK) stay as they are.
- [ ] **3.2 B** 49 of the 50 amenity tag names.
- [ ] **3.3 B** Room names where DE and EN are identical (7 of 11). Check which are deliberate.
- [ ] **3.4 B** German versions of the 10 English-only prospect FAQs.
- [ ] **3.5 B** Lütze cuisine ("Italian"), the Magwie happening body, the "On the Walls" title.

**Photos** (upload after 1.9)
- [ ] **3.6 H/B** Neighbourhood places: 0 of 21 have images. They currently fall back to Wikimedia/Unsplash.
- [ ] **3.7 H/B** You, Me & Berlin portraits: 5 of 16. Also fix the `gita-kudpoor` / `gita-kurdpoor` slug split.
- [ ] **3.8 H/B** Artwork records: 0. Blocks `/hier/art`, `/hier/gallery` and `/on-the-walls`.
- [ ] **3.9 H/B** Replace the non-Payload image slots (`HERE_IMAGES`, the `/public/images/*` files, the fallbacks), so every photo can be edited in the CMS.

**Hotel facts**
- [ ] **3.10 H** Bed configuration per room (still seeded as "double").
- [ ] **3.11 H** Meeting rooms: 21 in the database vs 22 in the brief. Which is right, and the data for the missing one.
- [ ] **3.12 H** Confirm the WiFi SSID and password are current and OK to publish (D3).
- [ ] **3.13 H** Sauna hours: two published schedules conflict.
- [ ] **3.14 H** Guest Care Center phone extension.
- [ ] **3.15 H** Fingerboard location, photos and hours.
- [ ] **3.16 H** Room rates with a "last checked" date, or confirmation that we launch with no `Offer` price.
- [ ] **3.17 H** The DialogShift export for the FAQs (full history, EN/DE).

**Placeholder pages** (D4: Bernard writes from the live site, the hotel approves)
- [ ] **3.18 B** About, contact, amenities, awards, offers, sustainability.
- [ ] **3.19 B** Five policies: check-in, cancellation, pets, fees, payment.
- [ ] **3.20 B** Hybrid meetings, on-the-walls.
- [ ] **3.21 B** `/people` vs You, Me & Berlin. *See O3.*
- [ ] **3.22 B** Finish `/hier/art`, `/hier/gallery`, `/hier/wallride` and `/hier/getting-around`. They still show an "in progress" label.

**Legal** (LR §33–37)
- [ ] **3.23 H** Sign off Impressum, Datenschutz, AGB, Cookies and Haftungsausschluss. Datenschutz needs updating to list Vercel, Neon, Cloudflare R2, Resend, Mapbox and the consent tool.
- [ ] **3.24 B** Add the Disclaimer to the footer in the **database**. The seed has it; the production footer doesn't.
- [ ] **3.25 B/H** Accessibility statement (Barrierefreiheitserklärung) under the BFSG. It is currently a stub.
- [ ] **3.26 H** Buy the Laica A licence from Dinamo and add the licence file to the repo (LR §35).

**CMS**
- [ ] **3.27 C** Add `admin.description` to every field; about 270 have none. `Artists`, `Media` and `Users` have no descriptions at all (LR §56).
- [ ] **3.28 C** Admin interface in German (`@payloadcms/translations`) (LR §56).
- [ ] **3.29 B** Create the hotel's editor accounts, with the editor role from 1.16.

---

## Phase 4 — Soft-launch gate

- [ ] **4.1 H/B** DNS: subdomain (e.g. `neu.hotel-berlin.de`) → Vercel. **Blocked until we know who controls DNS.**
- [ ] **4.2 B** Walk every route in both locales on the production build. The audit's 60-second first-compile timeouts don't count as passes.
- [ ] **4.3 B** Send a test meeting inquiry end to end. Both emails must arrive in DE and EN.
- [ ] **4.4 B** Hand the hotel review access: basic-auth credentials and a list of what to check.
- [ ] **4.5 C** Error monitoring (Sentry or Vercel's own) plus an uptime check (LR §53).
- [ ] **4.6 B** Confirm Neon point-in-time restore is on, and test one restore (LR §54).

---

## Phase 5 — Domain-switch gate

- [ ] **5.1 H** All legal texts signed off (3.23, 3.25).
- [ ] **5.2 H** Placeholder-page copy approved (D4).
- [ ] **5.3 H** Final DE slugs and nav labels approved: `/happenings`, `/faq`, `/restaurant`, `/you-me-and-berlin`, `/on-the-walls`; "Meetings" and "Happenings" in the DE nav (LR §17).
- [ ] **5.4 H** Notice given on the Galaxy/TravelClick contract. Galaxy stays up until the switch.
- [ ] **5.5 B** Redirect test: every one of the 185 Galaxy URLs returns 200 or 308 on the new site (2.29).
- [ ] **5.6 B** Flip the soft-launch switch (1.14): no basic auth, indexing allowed, the real sitemap.
- [ ] **5.7 H/B** DNS cutover: apex and `www`, with one of them 308-redirecting to the canonical host (O1).
- [ ] **5.8 B** Google Search Console: verify the domain, submit the sitemap, watch coverage and 404s daily for 2 weeks.
- [ ] **5.9 H** The `/hier` QR codes: print them **only now**, pointing at the final URL.
- [ ] **5.10 B** Analytics, if the hotel wants it, behind consent (O2).

---

## Phase 6 — After launch

- Payload drafts, versions and live preview (LR §57).
- Delete the unused hub components: `HerePeopleSection`, `ArtInBuildingSection`, `StayInfoCard`, `VenueCompactCard`, `BasementSection` (LR §62). Also merge `places` / `neighbourhood-places`.
- Newsletter and careers pages. Careers is an external Radisson link for now.
- A Radisson rate or promo code parameter, if one exists (booking widget audit §8).
- MeetingPackage decision: inquiry form first, instant-book second (booking widget audit §7).
- A `/nachbarschaft` and You, Me & Berlin editorial rhythm with the hotel.

---

## Asks for the hotel — one message

1. Vercel, Neon and Mapbox accounts in the hotel's name, with Bernard as admin. The billing entity.
2. **Who controls DNS for hotel-berlin.de.**
3. Contact for the data protection officer. DPAs with Vercel, Neon, Cloudflare, Resend, Mapbox and the consent tool.
4. Galaxy/TravelClick contract end date and notice period.
5. Legal sign-off: Impressum, Datenschutz, AGB, Cookies, Haftungsausschluss, the accessibility statement.
6. Facts: bed configurations, meeting room 21 vs 22, WiFi confirmation, sauna hours, Guest Care extension, fingerboard, room rates.
7. Photos: 21 neighbourhood places, 11 portraits, artworks, and any hotel photography newer than what's on the site.
8. The DialogShift export.
9. Buy the Laica A licence.
10. Which consent tool, and whether they want analytics (O2).

---

## Open decisions

| # | Question | Recommendation |
|---|---|---|
| O1 | Canonical host: `www.hotel-berlin.de` or `hotel-berlin.de`? | **www**. It matches every URL Google has indexed today, so there are no extra redirect hops. The apex 308s to www. |
| O2 | Consent tool and analytics? | Keep it minimal: a small self-hosted consent banner covering the map and external images, and no analytics at launch unless the hotel asks. If they want analytics, use Plausible or Matomo (EU, cookieless) over GA. |
| O3 | `/people` scaffold vs You, Me & Berlin: two people pages. | Redirect `/people` / `/menschen` to `/you-me-and-berlin`. Map the 24 Galaxy "Insider und Ikonen" slugs there too. |
| O4 | Contact form, or phone/email only? | Phone and email for launch. The meeting inquiry form covers the enquiries that matter commercially. |
| O5 | Wordmark link inside `/hier`: `/` or `/here`? (Step 0 contradiction #2) | `/`. The signed-off hub already does this. Close the HerePage DoD item. |
| O6 | Nav CTA copy: "Come back / Komm wieder" (code) vs "Plan your next stay / Bald wiederkommen?" (ResponsiveNav DoD) | The code, since the signed-off pages show it. Update the brief. |
| O7 | Remaining Step 0 contradictions: #8–12 (room count, pages 26/27, pass numbering, TKKT/KTTK, `insiderStory` vs `storyConnection`) | Mostly housekeeping. Close them in one doc-cleanup pass. KTTK is correct. |
