# Hotel Berlin, Berlin — Footer V2 Build Brief
*For Cursor*
*Component: global site footer (main public-facing site, outside context)*
*Stack: Next.js 15 · Payload CMS 3 · Tailwind CSS · next-intl v4 · Lucide React*

---

## What this is

A rework of the existing site footer: correct fonts (Archivo only, no Archivo Narrow), new background color tokens, and moving the link columns + awards + contact info into Payload so the client can maintain them without a code change. A footer already exists in the codebase but isn't currently rendering — **Step 0 below must happen before any of the rest of this brief.** Treat everything after that as a patch against the existing component and schema, not a rebuild. Reuse whatever's salvageable.

---

## Step 0 — Diagnose the existing footer first

The footer was built in a previous Cursor session and is not displaying. Before writing any new code:

1. Search the repo for the footer component (`Footer.tsx` or similar) and confirm it's actually imported and rendered in the root layout (`app/[locale]/layout.tsx` or equivalent). A component that exists but was never wired into layout is the single most likely cause.
2. If the footer fetches a Payload global/collection, check for a silent early return — `if (!data) return null` (or similar) swallowing the whole component when the fetch fails, returns empty, or the global doesn't exist yet in this environment.
3. Check the browser console and terminal build output for a thrown exception or hydration error specifically tied to the footer.
4. Check CSS: `display: none`, `visibility: hidden`, `height: 0`, an ancestor with `overflow: hidden` clipping it, or something else stacked on top of it (z-index).
5. `git log --oneline -- <path-to-footer-file>` — check the last commit that touched it for a rename, prop change, or removed import that broke it.
6. Confirm the component's export name matches the import name exactly, case-sensitive — a common silent-failure cause after a rename.

**Report back what you find before proceeding.** If the fix is trivial (wiring it up), do that first and confirm it renders, then apply the rest of this brief as a patch. If the existing schema/component is structurally close to what's below, extend it — don't throw it away.

---

## Fonts

- **Archivo throughout** — column headers, link text, contact info, copyright line, everything. No Archivo Narrow anywhere in this component (client-rejected sitewide — see `DESIGN.md`).
- **Laica A is not used in the footer.** This is an all-UI-text component with no body-copy content, so there's nothing here that should be pulling the body font. Grep the existing footer file/CSS for any Archivo Narrow or Laica reference and remove it.

---

## Color tokens — new

Add to `tokens.json`, new `color.footer` group (footer-specific, not reused elsewhere yet):

```json
"footer": {
  "bgDark":   { "value": "#2D2A26", "note": "Main footer body — link columns, contact block, awards" },
  "bgMedium": { "value": "#5A5550", "note": "Partner/brand affiliation strip (Radisson Individuals · Radisson · RewardsPandox)" },
  "bgLight":  { "value": "#BBBBBB", "note": "Bottom copyright/credit bar" }
}
```

**⚠️ Confirm before building:** this dark→medium→light mapping (main body / partner strip / bottom bar) is my read of the mockup, not confirmed by the client. Also confirm text color on `bgLight` — a light grey background needs dark text (the mockup shows dark text there already), don't default to white just because the rest of the footer is white-on-dark.

---

## Structure (from the mockup)

```
[white strip] "Best rate guaranteed when you book direct"       [Check availability →]
─────────────────────────────────────────────────────────────────────────────
[dark #2D2A26]
  Hotel Berlin, Berlin          STAY          EAT & MEET      HELP        ALREADY HERE?
  Lützowplatz 17, 10785         Rooms & Suites  Lütze →       FAQs        [description text]
  Berlin Germany                Superior        Restaurant    Contact     Happenings hub
  Since 1958                    Comfort         & Bar         Lost&Found  What's on
                                 Suites         Meetings      Accessib.   Art programme
  ☎ +49 30 26050                Studio 45      Meeting Rms               All dining
  ✉ info@hotel-berlin.de                                     About       Breakfast
  🚌 Bus 100,106,187 · U         Check-in/      On the Walls  Sustain.    Wundermart
    Nollendorfplatz 7 min ·      Check-out      FKKB →        Careers     Explore nbhd
    S+U Zoo 10 min               Cancelations   KTTK →                   Guest FAQs
                                  Pets           Neighbourhd   Parking

  AWARDS & RECOGNITION
  [BREEAM] [Green Key] [Top 25 Europe Meeting Hotels] [Sustainable Berlin] [Sustainable Meetings Berlin]
─────────────────────────────────────────────────────────────────────────────
[medium #5A5550]  Part of Radisson Individuals · Radisson · RewardsPandox
─────────────────────────────────────────────────────────────────────────────
[light #BBBBBB]                                    © 2026 Pandox Berlin GmbH
                                                     designed with: smoothism.com
```

**Copy fix:** the mockup shows **"TKKT"** in the Eat & Meet column. Everywhere else in this project it's **KTTK** (Königlicher Tischtennis Klub Berlin). Use KTTK in the seed data — flag this for the client as a probable typo rather than silently "correcting" a real decision.

---

## Payload schema — new `footer` global

Full editability, per your call. Two shared/reusable pieces first, since the columns schema depends on both:

### Shared piece 1 — `linkField` (internal-or-external toggle)

Define once, reuse in `columns`, `alreadyHereColumn`, and `partnerLinks`:

```typescript
// src/fields/linkField.ts
import type { Field } from 'payload'

export const linkField: Field[] = [
  {
    name: 'label',
    type: 'group',
    fields: [
      { name: 'de', type: 'text', required: true },
      { name: 'en', type: 'text', required: true },
    ],
  },
  {
    name: 'linkType',
    type: 'radio',
    options: [
      { label: 'Internal page', value: 'internal' },
      { label: 'External URL', value: 'external' },
    ],
    defaultValue: 'internal',
  },
  {
    name: 'internalPage',
    type: 'relationship',
    // ⚠️ relationTo needs Cursor to confirm actual collection slugs for
    // static/CMS-managed pages in this project (rooms, venues, static pages
    // like About/Careers/Parking may or may not share one collection).
    relationTo: ['pages'],
    admin: { condition: (_, siblingData) => siblingData?.linkType === 'internal' },
  },
  {
    name: 'externalUrl',
    type: 'text',
    admin: { condition: (_, siblingData) => siblingData?.linkType === 'external' },
  },
  {
    name: 'showArrow',
    type: 'checkbox',
    defaultValue: false,
    admin: {
      description:
        'Adds the "→" treatment used for Lütze / FKKB / KTTK — links that exit to a different venue frontend rather than a page within this site.',
    },
  },
  {
    name: 'dividerBefore',
    type: 'checkbox',
    defaultValue: false,
    admin: {
      description:
        'Adds a small gap above this link — used to group related links within a column (e.g. the gap before "Check-in/Check-out", or before "On the Walls").',
    },
  },
]
```

### Shared piece 2 — Lucide icon picker

The project's current pattern (`Tags.lucideIcon`, per `HotelBerlin_RoomsHero_Addendum.md`) is a free-text field where the admin types the exact PascalCase Lucide component name. That's fragile — a typo renders nothing with no warning. Build a real picker **once**, as a custom Payload admin field component:

- Searchable dropdown/combobox listing Lucide icon names (bundle a static JSON list of names at build time — no need to hit an API).
- Live SVG preview next to each option and next to the selected value.
- **Saves the exact same plain string as before** — this is a UI-only change, not a data-shape change, so it's a drop-in admin-component swap on `Tags.lucideIcon` too, not just new for the footer. Worth doing both while you're in there, since it's the same underlying fragility either way.

```typescript
// src/fields/lucideIconField.ts
import type { Field } from 'payload'

export const lucideIconField = (name = 'icon', label = 'Icon'): Field => ({
  name,
  type: 'text',
  label,
  admin: {
    // Custom component: src/admin/components/LucideIconPicker.tsx
    components: {
      Field: '/admin/components/LucideIconPicker#LucideIconPicker',
    },
    description: 'Pick a Lucide icon. Leave blank for no icon.',
  },
})
```

### The `footer` global

```typescript
import { linkField } from '../fields/linkField'
import { lucideIconField } from '../fields/lucideIconField'

const bilingualText = (name: string, required = false) => ({
  name,
  type: 'group' as const,
  fields: [
    { name: 'de', type: 'text' as const, required },
    { name: 'en', type: 'text' as const, required },
  ],
})

export const Footer = {
  slug: 'footer',
  fields: [
    // ── Top book-direct strip ──
    {
      name: 'bookDirectStrip',
      type: 'group',
      fields: [
        bilingualText('message'),
        bilingualText('ctaLabel'),
        { name: 'ctaUrl', type: 'text' },
      ],
      admin: {
        description:
          'Check whether this strip already exists as a separate site-wide component elsewhere (e.g. a persistent booking bar) before building it fresh here — avoid duplicating.',
      },
    },

    // ── Contact block ──
    {
      name: 'contact',
      type: 'group',
      fields: [
        { name: 'sinceYear', type: 'text', defaultValue: '1958' },
        { name: 'addressLines', type: 'array', fields: [{ name: 'line', type: 'text' }] },
        { name: 'phone', type: 'text' },
        { name: 'email', type: 'text' },
        {
          name: 'transitLines',
          type: 'array',
          labels: { singular: 'Transit line', plural: 'Transit lines' },
          fields: [bilingualText('line')],
          admin: { description: 'e.g. "Bus 100, 106, 187", "U Nollendorfplatz 7 min", "S+U Zoo 10 min" — one per row, rendered joined by " · ".' },
        },
      ],
    },

    // ── Link columns — fully editable, repeatable ──
    {
      name: 'columns',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Column', plural: 'Columns' },
      fields: [
        lucideIconField('icon', 'Column icon'),
        bilingualText('title', true),
        {
          name: 'links',
          type: 'array',
          minRows: 1,
          fields: linkField,
        },
      ],
    },

    // ── Already Here column — separate, manually curated ──
    {
      name: 'alreadyHereColumn',
      type: 'group',
      fields: [
        bilingualText('title', true),
        {
          name: 'description',
          type: 'group',
          fields: [
            { name: 'de', type: 'textarea' },
            { name: 'en', type: 'textarea' },
          ],
        },
        { name: 'links', type: 'array', fields: linkField },
      ],
    },

    // ── Awards & recognition ──
    {
      name: 'awards',
      type: 'array',
      labels: { singular: 'Award / Recognition', plural: 'Awards & Recognition' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        bilingualText('altText', true),
        {
          name: 'linkUrl',
          type: 'text',
          admin: { description: 'Optional — leave blank if the badge isn\'t clickable.' },
        },
      ],
    },

    // ── Partner / brand affiliation strip ──
    {
      name: 'partnerLinks',
      type: 'array',
      labels: { singular: 'Partner link', plural: 'Partner links' },
      fields: [
        { name: 'label', type: 'text' },
        { name: 'url', type: 'text' },
      ],
    },

    // ── Bottom bar ──
    {
      name: 'copyrightEntity',
      type: 'text',
      defaultValue: 'Pandox Berlin GmbH',
      admin: { description: 'Year is generated at render time — do not include a year here.' },
    },
  ],
}
```

This gives full admin control — add/remove/reorder columns, add/remove/reorder links within a column, swap any icon — with no code change required for ordinary content updates. The only things that need a developer are structural (new field types, new column *kinds*), which is the right line to draw.

### Rendering

One generic `<FooterColumn>` component fed by the `columns` array — no hardcoded per-column markup, since columns are now data. `alreadyHereColumn` gets its own small component (it has description text + no icon header, styled distinctly per the mockup) but reuses the same link-rendering logic.

Copyright line renders as:
```
© {new Date().getFullYear()} {footer.copyrightEntity}
```
— never a stored year.

---

## Icons — Lucide names

| Element | Icon |
|---|---|
| STAY column | `BedDouble` |
| EAT & MEET column | `UtensilsCrossed` |
| HELP column | `CircleHelp` |
| ALREADY HERE column | `Tag` *(confirm against actual mockup glyph — I inferred this from the small icon shape, didn't have a clean view of it)* |
| Phone | `Phone` |
| Email | `Mail` |
| Bus/transit | `Bus` |

These are stored as plain strings via the picker described above — same underlying field as `Tags.lucideIcon`.

---

## Awards carousel behavior

- Always renders as **one horizontal row**.
- On wide viewports where all awards fit, it's just a static row — no rotation logic runs.
- Below whatever width they stop fitting, auto-rotate through pages of logos, plus small prev/next arrows (real `<button>`s, not divs).
- **Don't hardcode "5 items" anywhere** — the count needs to expand/contract without a rebuild, so pagination should be driven by measuring container width vs. logo width at runtime, not a fixed breakpoint tied to today's count.
- Respect `prefers-reduced-motion`: disable autoplay, keep manual arrow navigation only.
- Pause autoplay on hover/focus.
- The carousel region shouldn't be in a live-announcing `aria-live` region — don't have it interrupt screen reader users every rotation; the arrows need clear `aria-label`s ("Previous award", "Next award").

---

## Accessibility

- `<footer role="contentinfo">` landmark.
- Hotel address wrapped in `<address>`.
- Icon-only elements (phone/email/bus icons if not paired with visible text) need accessible names — don't rely on the icon alone.
- Carousel arrows: real `<button>`, visible focus ring, 44×44px minimum touch target.
- Standard WCAG 2.1 AA contrast check on all three new background tokens against whatever text color sits on them — verify `bgLight` specifically per the flag above.

---

## Bilingual copy — column headers (placeholder, confirm with client)

| EN | DE |
|---|---|
| STAY | ÜBERNACHTEN |
| EAT & MEET | ESSEN & TREFFEN |
| HELP | HILFE |
| ALREADY HERE? | SCHON HIER? |

---

## Open items — do not silently resolve these

1. **Color-to-region mapping** (dark/medium/light → body/partner-strip/bottom-bar) is my read of the mockup, not client-confirmed.
2. **Text color on `bgLight` (#BBBBBB)** — needs dark text; confirm exact shade rather than defaulting to `--ink`.
3. **KTTK vs. "TKKT"** in the mockup — flagged as a likely typo, using KTTK in seed data.
4. **`internalPage` relationTo** — placeholder `['pages']` in the schema above. Confirm actual collection slug(s) that represent linkable static/CMS pages in this Payload instance before building; About/Careers/Parking/Sustainability may not all live in one collection.
5. **"Already Here?" glyph** — confirmed as a separate, manually-curated list (not derived from `/here`), but the icon (`Tag`) is a guess — confirm against the actual mockup asset.
6. **`bookDirectStrip`** — check whether this already exists as a shared site-wide component before building a footer-specific copy of it.
