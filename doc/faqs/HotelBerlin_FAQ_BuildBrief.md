# Hotel Berlin, Berlin — FAQ System Build Brief
*For Cursor*
*Components: `FAQAccordion` (shared shape, two placements) · Pages: `/faq`, `/here/faq` · Collection: `faqs`*
*Stack: Next.js 15 · Payload CMS 3 · Tailwind CSS · next-intl v4*

---

## What this is

Two placements of one shared accordion shape, both driven by a single `faqs` Payload collection, both projecting `FAQPage` JSON-LD from the exact same data they render:

1. **Mini block** — 4 questions relevant to the current page, sits near the bottom of any content page (rooms, restaurant, meetings, about, `/nachbarschaft`, each `/here` subpage), links out to the full FAQ page.
2. **Full FAQ page** — `/faq` (prospect-facing) and `/here/faq` (guest-facing), category-grouped, all questions for that context.

This also resolves the "FAQ accordion" item that's been sitting flagged-off in the Homepage V2 hide-don't-delete list (Section 5 of that brief) — the homepage's own instance is just the mini block pulling `general` prospect questions. **Unflag it as part of this build**, same pattern as the Meet & Work brief resolving its own item from that list.

No visual redesign work needed — the accepted design is `HotelBerlin_FAQ_DesignMockup_v2.html`, already reviewed. This brief exists to turn that into buildable spec: schema, resolver logic, JSON-LD, and full aria markup.

We don't have the actual question/answer content yet. Everything below is buildable ahead of it — shell, filtering logic, and schema wiring don't depend on knowing the questions. Seed with 4–6 placeholder Q&As per context to build and test against; swap for real content when it lands.

---

## Section 1 — `faqs` Payload collection

This refines the draft already sketched in the AEO survey doc — two changes from that draft, called out below.

```ts
// collections/Faqs.ts
import type { CollectionConfig } from 'payload';

export const Faqs: CollectionConfig = {
  slug: 'faqs',
  admin: { useAsTitle: 'question', defaultColumns: ['question', 'context', 'category', 'order'] },
  fields: [
    { name: 'question', type: 'text', required: true, localized: true },
    {
      name: 'answer',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description:
          'Plain text, not richText. Keep it to 1-3 sentences — this is what ships verbatim into FAQPage JSON-LD acceptedAnswer.text, and long/richly-formatted answers make poor schema. If a question genuinely needs links or lists, that belongs on a dedicated policy page, with this FAQ answer summarizing and pointing there.',
      },
    },
    {
      name: 'context',
      type: 'select',
      required: true,
      options: ['prospect', 'guest'],
      admin: {
        description:
          'prospect = main site (/faq, and mini blocks on outside pages). guest = /here/faq and mini blocks on /here subpages. No "both" option — if a question genuinely applies to both audiences, duplicate the record. A single record can\'t carry two different FAQPage placements cleanly, and prospect/guest phrasing usually differs anyway (see Voice/Tone guide).',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        // prospect-context categories
        'rooms-booking',
        'checkin-checkout',
        'dining',
        'meetings',
        'accessibility',
        'getting-here',
        'pets-parking',
        'general',
        // guest-context categories
        'wifi-tech',
        'guest-services',
        'neighbourhood-guest',
      ],
      admin: {
        description:
          'Full taxonomy is an open item — see bottom of this brief. Prospect and guest categories are listed together here for one shared field, but a given record should only use a category that matches its own context.',
      },
    },
    {
      name: 'relevantPages',
      type: 'relationship',
      relationTo: ['pages'],
      hasMany: true,
      admin: {
        description:
          'Optional manual pin — forces this question into a specific page\'s mini block regardless of category match. Use sparingly; category matching (Section 2) should cover most cases. Confirm "pages" is the right relationTo target per the same open item flagged in the Footer brief (internalPage relationTo).',
      },
    },
    { name: 'order', type: 'number', required: true, defaultValue: 0, admin: { description: 'Display order within a category, and tiebreaker for the mini-block fallback fill.' } },
    { name: 'slug', type: 'text', unique: true, admin: { position: 'sidebar', description: 'Anchor id for deep-linking from search/AI results straight to an open answer, e.g. /faq#pet-policy.' } },
  ],
};
```

**Two deviations from the original AEO survey draft, deliberate:**
1. `question`/`answer` use `localized: true` rather than separate `locale` select + duplicate records — matches the convention already used on `people` and `neighbourhood-places`, rather than the separate pattern used in the footer brief. One record per question, not one per question-per-language.
2. `answer` is plain `text`, not `richText` — richText needs serialization to get a clean string into `acceptedAnswer.text`, and the audit's schema-validation check penalizes malformed/markup-polluted schema strings.

---

## Section 2 — Relevance resolver

Pure function, same shape as the `SpotlightCard` resolver pattern — no data fetching inside it, just selection logic over an already-fetched list.

```ts
// lib/faqs/getRelevantFaqs.ts
import type { Faq } from '@/payload-types';

export function getRelevantFaqs(
  allFaqs: Faq[],
  opts: { context: 'prospect' | 'guest'; pageId?: string; category?: string; limit?: number }
): Faq[] {
  const { context, pageId, category, limit = 4 } = opts;
  const inContext = allFaqs.filter((f) => f.context === context);

  const pinned = pageId
    ? inContext.filter((f) => f.relevantPages?.some((p) => (typeof p === 'string' ? p : p.id) === pageId))
    : [];

  const categoryMatched = category
    ? inContext.filter((f) => f.category === category && !pinned.includes(f))
    : [];

  const combined = [...pinned, ...categoryMatched].sort((a, b) => a.order - b.order);

  if (combined.length >= limit) return combined.slice(0, limit);

  // Fallback fill — top-ordered "general" (prospect) items, not yet included
  const fallback = inContext
    .filter((f) => f.category === 'general' && !combined.includes(f))
    .sort((a, b) => a.order - b.order);

  return [...combined, ...fallback].slice(0, limit);
}
```

Call site on a content page:

```ts
const allFaqs = await getFaqs({ context: 'prospect', locale });
const relevant = getRelevantFaqs(allFaqs, { context: 'prospect', pageId: currentPage.id, category: 'meetings', limit: 4 });
```

---

## Section 3 — `aeo-schema` addition: `buildFAQPageGraph`

Add to the existing `aeo-schema` package alongside `buildPlacePageGraph` / `buildPersonPageGraph`. Do not hand-write this JSON-LD in page components — same rule as the neighbourhood brief.

```ts
// aeo-schema/src/buildFAQPageGraph.ts
export function buildFAQPageGraph(faqs: Faq[], config: AeoConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };
}
```

**Critical rule, called out because it's the easiest thing to get wrong:** the array passed in must be exactly the array rendered on screen — same order, same items. The mini block calls this with its 4-item `getRelevantFaqs()` result; the full FAQ page calls it with the complete filtered set for that context. Never pass the full dataset into a mini block's schema call "for extra AEO coverage" — that produces schema that describes content the page doesn't actually show, which is precisely the mismatch the audit's schema-validation check penalizes (see `hotelberlinAEOaudit.pdf`, point 6).

---

## Section 4 — `FAQAccordion` component

One component, two placements, driven by a `variant` prop — not two separate components, to guarantee the visual/markup shape can't drift between mini and full.

```typescript
type FAQAccordionProps = {
  items: { id: string; question: string; answer: string }[];
  variant: 'mini' | 'full';
  context: 'prospect' | 'guest'; // drives amber/teal accent token
  heading?: string;               // mini: e.g. "Questions about the rooms". full: "Frequently asked questions"
  ctaHref?: string;                // mini only — "See all FAQs" target
};
```

Full aria markup — reusing the pattern already specified for the `/here` accordion (Here Page brief), not re-approximating it:

```html
<div class="accordion-item">
  <h3>
    <button
      aria-expanded="false"
      aria-controls="faq-answer-pet-policy"
      id="faq-question-pet-policy"
    >
      Are pets allowed in the rooms?
    </button>
  </h3>
  <div
    id="faq-answer-pet-policy"
    role="region"
    aria-labelledby="faq-question-pet-policy"
    hidden
  >
    <p>Answer text…</p>
  </div>
</div>
```

- `id`s derive from each FAQ's `slug` field (`faq-question-{slug}` / `faq-answer-{slug}`) — this is what makes `/faq#pet-policy` a valid deep link, and it's stable across re-orders since it's not index-based.
- Question wrapped in `<h3>` inside `<button>` — full page has `<h2>` category labels above each group, so `<h3>` per question keeps heading hierarchy correct; the mini block's single `<h2>` heading sits above its own `<h3>` list the same way.
- Minimum 44×44px touch target on the button (padding, not element size) — same rule as the rest of the site's interactive elements.
- Visible focus ring on `:focus-visible`, colored with the context accent token.
- CSS/spacing/typography: pull directly from `HotelBerlin_FAQ_DesignMockup_v2.html` — 96px section padding desktop / 56px mobile, 900px reading column, context-accent restricted to chevron/hover/CTA underline only, per the accepted v2 design.

---

## Section 5 — Pages and routing

```ts
// i18n/pathnames.ts — addition
'/faq': { en: '/faq', de: '/faq' }, // PLACEHOLDER — German slug not yet confirmed, see open items
```

- **`/faq`** — full prospect FAQ page. Chip row filters client-side (dataset is small — no pagination, no URL-query-param state needed here unlike the neighbourhood listing page). `buildFAQPageGraph` over the complete unfiltered prospect set, regardless of which chip is active client-side — same "schema describes the full page, not the current filter view" principle as the neighbourhood listing's JSON-LD rule.
- **`/here/faq`** — same page template, `context="guest"`. Already has a JSON-LD stub target from the original Cursor build brief; wire the real builder in.
- **Homepage mini block** — pulls `context: 'prospect', category: 'general'`, unflag from Homepage V2 Section 5.
- **Other content pages** — each passes its own `category` (and `pageId` for pin overrides) to `getRelevantFaqs`.
- `hreflang` alternates and `<link rel="canonical">` on both `/faq` and `/here/faq`, following the same pattern as every other indexed page.

---

## Definition of done (build progress)

- [x] `faqs` collection matches brief fields (`context`, categories, `relevantPages`, `order`, `slug`)
- [x] `getFaqs` + `getRelevantFaqs`
- [x] `buildFAQPageGraph` in aeo-schema — array passed = array rendered
- [x] `FAQAccordion` mini/full + prospect/guest accents + slug-based aria ids
- [x] `/faq` and `/here/faq` pages with chips, category groups, canonical/hreflang
- [x] Homepage mini block CMS-driven (`prospect` / `general`) + JSON-LD
- [x] Placeholder seed (`npm run seed:faqs`)
- [ ] Design spacing polish vs `HotelBerlin_FAQ_DesignMockup_v2.html` (mockup not in repo)
- [ ] Real Q&A content swap when copy lands

---

## Open items — do not silently resolve these

1. **Category taxonomy isn't final.** The list in Section 1 is a reasonable starting split (mirrors the mockup's chip row plus the guest-side categories named in the Extension Brief), but hasn't been confirmed against the actual question set, which doesn't exist yet. Expect to revisit once real questions arrive — some may not fit cleanly, some categories may end up empty.
2. **`relevantPages` relationTo target (`'pages'`)** is the same open guess flagged in the Footer brief — confirm the actual collection slug for linkable pages before this field can resolve anything. *(Wired to `pages` for now since that collection exists.)*
3. **Whether the pin-override mechanism is needed at MVP.** Category matching alone may be sufficient for launch; `relevantPages` adds editorial complexity that might not earn its keep until there's a real backlog of mismatched pages.
4. **German `/faq` slug** — placeholder keeps it as `/faq` in both locales, matching the placeholder pattern already used for `/rooms`, `/restaurant`, `/meetings` in the Nachbarschaft brief's routing table. Not for production without sign-off.
5. **Per-subpage mini blocks inside `/here`** — does every `/here` subpage (art, dining, events) get its own mini block, or does `/here` index carry the only one for that context? The mockup only shows one instance per context; the "any content page" placement described at the top of this brief is my extrapolation, not something confirmed against a specific `/here` subpage list.
6. **Fallback category name (`general`)** — assumes a `general` bucket exists in both contexts for the fallback-fill logic in Section 2. If the real taxonomy doesn't end up with a clean catch-all category, that fallback needs a different source query.
