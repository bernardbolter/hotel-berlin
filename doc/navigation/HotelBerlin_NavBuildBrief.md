# Hotel Berlin, Berlin — Navigation Build Brief
*For Cursor / Claude Opus*
*Component: `<SiteNav>` — dual-row navigation, both contexts*
*Stack: Next.js 15 · Payload CMS 3 · Tailwind CSS · next-intl v4*

---

## Critical constraint — do not touch the existing top bar

The primary nav row (wordmark, main links, Book Now, language toggle) is **already built and styled**. Do not modify, refactor, restyle, or restructure this component. Treat it as locked.

This brief covers two things only:
1. The **secondary nav row** — the "In the Building? ENTER" strip below the primary nav — which needs to be built
2. The **staggered scroll behaviour** — hiding and revealing both rows on scroll — which needs to be added as a layer on top of the existing primary nav without touching its internals
3. The **Payload CMS navigation global and pages collection** — which needs to be created

If any task in this brief would require modifying the existing primary nav component's markup, styles, or logic, stop and flag it rather than proceeding.

---

## What this is

A build brief for the secondary nav row and scroll behaviour for hotel-berlin.de. The primary nav (row 1 — wordmark, main links, Book Now, language toggle) is already built. This brief adds the secondary nav row beneath it, wires up the staggered scroll hide/reveal across both rows, and creates the Payload CMS structure for managing nav links. The nav serves two distinct contexts — outside (prospect-facing, `/`) and inside (guest-facing, `/here` and sub-pages) — with the secondary row adapting via a `context` prop.

---

## Visual structure — two rows

Both rows share the same background: `#F3F3F3`. No dark bar anywhere in this component.

```
┌─────────────────────────────────────────────────────────────┐
│  PRIMARY NAV (row 1)                                        │
│  Hotel Berlin, Berlin  │  Rooms · Meetings · Eat & Drink   │
│                            Happenings · Neighbourhood       │
│                                          DE EN │ Book Now   │
├─────────────────────────────────────────────────────────────┤
│  SECONDARY NAV (row 2)                                      │
│  In the Building? ENTER │ What's on · Getting around ·     │
│                            Local tips · Gallery ·           │
│                            Skateboard Museum                │
└─────────────────────────────────────────────────────────────┘
```

### Primary nav — row 1
- Background: `#F3F3F3`
- Left: **Hotel Berlin, Berlin** wordmark — Archivo Narrow, links to `/` on outside context, links to `/here` on inside context
- Centre: Primary page links — Archivo Narrow, 14px, `#141414`
- Right: Language toggle (see below) · **Book Now** CTA button
- Height: ~52px desktop, ~48px mobile

### Secondary nav — row 2
- Background: `#F3F3F3` — same as row 1, visually one block
- Left: Context bridge link (see context switching section)
- Right: Secondary sub-links
- Height: ~32px desktop, ~28px mobile
- Smaller text than row 1 — Archivo Narrow, 12px, `#555555`

---

## Context switching — outside vs inside

The entire nav component receives a `context` prop: `"outside"` or `"inside"`. This drives accent colour, link sets, bridge link copy, and wordmark destination. No other structural change.

### Accent colour
| Context | Accent | Hex |
|---|---|---|
| Outside `/` | Amber | `#F79B2E` |
| Inside `/here` | Teal | `#2C6B7A` |

Amber and teal apply to:
- The bridge link action word in the secondary nav
- The Book Now button fill
- The active page link underline in the primary nav
- The active language indicator in the language toggle

### Primary nav links

**Outside context (`/`):**
| Label | URL |
|---|---|
| Rooms | `/rooms` |
| Meetings | `/meetings` |
| Eat & Drink | `/restaurant` |
| Happenings | `/happenings` |
| Neighbourhood | `/neighbourhood` |

**Inside context (`/here`):**
| Label | URL |
|---|---|
| What's on | `/here` |
| Art | `/here/art` |
| Dining | `/here/dining` |
| Explore | `/here/explore` |
| FAQ | `/here/faq` |

Active link — current page link gets a 1.5px underline in the accent colour. No bold weight change.

### Secondary nav — bridge link

This is the context switcher. Always left-aligned in the secondary nav row.

**Outside (`/`):**
```
In the Building?  ENTER →
```
- "In the Building?" — muted text, `#888888`, 12px
- "ENTER →" — accent amber `#F79B2E`, 12px, font-weight 500
- Links to `/here`

**Inside (`/here`):**
```
Planning a stay?  hotel-berlin.de →
```
- "Planning a stay?" — muted text, `#888888`, 12px
- "hotel-berlin.de →" — accent teal `#2C6B7A`, 12px, font-weight 500
- Links to `/` (main site root)

The bridge link is a single `<a>` element. The question and the action word are two `<span>` elements inside it for styling — but the whole thing is one link with one accessible label.

### Secondary nav — sub-links (right side)

**Outside (`/`):**
Sub-links are the inside-context pages, ghosted — they signal what's inside without being the focus. Colour: `#AAAAAA`.

```
What's on  ·  Getting around  ·  Local tips  ·  Gallery  ·  Wallride
```

Each links to the corresponding `/here/*` sub-page.

**Inside (`/here`):**
Same links, now fully legible — these are the active context pages. Colour: `#555555`.

```
What's on  ·  Getting around  ·  Local tips  ·  Gallery  ·  Wallride
```

Note: "Wallride" is the name of the permanent exhibition by Skateboardmuseum Berlin installed in the hotel. The page at `/here/wallride` carries the full attribution — curated by Jürgen Blümlein, Skateboardmuseum Berlin — and shows the half-pipe. The nav link uses the exhibition name only.

---

## Language toggle

Sits in the primary nav, right side, left of the Book Now button.

### Visual structure
```
Language        ← small label above, 9px, #AAAAAA, letter-spaced
DE  EN          ← toggle pair
```

- Label text: driven by current locale via next-intl. EN locale → "Language". DE locale → "Sprache". Single translation string `t('nav.language')`.
- `DE` and `EN` are separate `<a>` elements linking to the alternate locale version of the current page via next-intl's `usePathname` + locale switching
- Active locale: accent colour (amber outside, teal inside), font-weight 500
- Inactive locale: `#AAAAAA`
- Font: Archivo Narrow, 13px
- Touch target: minimum 44×44px via padding — WCAG 2.5.8 AA compliance (EAA June 2025)
- Each link carries `lang="de"` / `lang="en"` attribute and `hreflang` — allows screen readers to switch pronunciation correctly
- Wrap in `<div role="group" aria-label="Language / Sprache">` for accessibility

---

## Book Now button

- Sits far right of primary nav row
- Label: `t('nav.bookNow')` → "Book Now" (EN) / "Jetzt buchen" (DE)
- Fill: accent colour — amber `#F79B2E` outside, teal `#2C6B7A` inside
- Text: white `#FFFFFF`, Archivo Narrow, 13px, font-weight 500
- Border radius: `0` — no rounded corners (brand rule: zero border radius except one decorative pill badge)
- Links to Radisson booking URL (external, `target="_blank"`, `rel="noopener"`)
- Minimum height 44px for touch target compliance

---

## Scroll behaviour — staggered hide/reveal

Both nav rows are sticky. On scroll, they hide and reveal in a staggered sequence.

### Behaviour on scroll down (threshold: 60px from top)
1. **Secondary nav hides first** — slides up out of view, 200ms ease, no delay
2. **Primary nav hides 150ms later** — slides up, 200ms ease, `transition-delay: 150ms`
3. End state: both rows hidden. Page content fills viewport to top edge.

### Behaviour on scroll up
1. **Primary nav returns immediately** — slides down to `top: 0`, 200ms ease, no delay
2. **Secondary nav returns 150ms later** — slides down below primary nav, 200ms ease, `transition-delay: 150ms`
3. End state: both rows visible again, layout identical to initial state.

### Reset
If `scrollY < 60px` (near top of page), both rows are always visible regardless of scroll direction. No hide logic fires in this zone.

### Implementation approach

Use CSS transitions with a JS scroll direction detector. `passive: true` on the event listener — never blocks scroll.

```typescript
// Tailwind classes managed via JS — add/remove on wrapper element
// data-nav-state="visible" | "hidden-secondary" | "hidden-both"

// CSS (in globals or component styles):
// [data-nav-state="hidden-secondary"] .nav-secondary { transform: translateY(-100%); }
// [data-nav-state="hidden-both"] .nav-secondary { transform: translateY(-100%); }
// [data-nav-state="hidden-both"] .nav-primary { transform: translateY(-100%); transition-delay: 150ms; }
// Reverse: primary has no delay, secondary has 150ms delay on return
```

```typescript
// Scroll direction detector — useNavScroll hook
'use client'
import { useEffect, useRef } from 'react'

export function useNavScroll() {
  const lastY = useRef(0)
  const wrapperRef = useRef<HTMLElement>(null)
  const THRESHOLD = 60

  useEffect(() => {
    const handler = () => {
      const y = window.scrollY
      const wrapper = wrapperRef.current
      if (!wrapper) return

      if (y < THRESHOLD) {
        wrapper.dataset.navState = 'visible'
      } else if (y > lastY.current) {
        // scrolling down — secondary first, then primary
        wrapper.dataset.navState = 'hidden-both'
      } else {
        // scrolling up — primary first, then secondary
        wrapper.dataset.navState = 'visible'
      }
      lastY.current = y
    }

    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return wrapperRef
}
```

Both nav rows use `position: sticky`. The wrapper `<header>` is `position: sticky; top: 0; z-index: 50`. Each row has `overflow: hidden` on the wrapper to clip the sliding rows cleanly.

`prefers-reduced-motion`: if the user has requested reduced motion, skip the transition entirely — show/hide instantly with no animation. Check via `@media (prefers-reduced-motion: reduce)` and set `transition: none`.

---

## Mobile behaviour

Below `768px`:

- Primary nav: wordmark left · hamburger menu icon right (Tabler `ti-menu-2`) · Book Now hidden (accessible in hamburger menu)
- Secondary nav: hidden entirely on mobile — collapses to zero height. The bridge link and sub-links move into the hamburger menu.

### Hamburger menu (mobile only)
Full-width overlay panel, slides in from top or right. Contains:

**Inside context section:**
- What's on
- Art
- Dining
- Explore
- FAQ

**Divider line**

**Bridge link:**
- "Planning a stay? hotel-berlin.de →" (inside) or "In the Building? ENTER →" (outside)

**Language toggle:**
- "Language / Sprache" label
- DE · EN links

**Book Now button** — full width, accent colour fill

Hamburger button: `aria-expanded`, `aria-controls="mobile-menu"`, `aria-label="Open menu"`. Menu has `role="dialog"`, `aria-modal="true"`. Closes on Escape, focus returns to trigger. Focus trapped inside while open.

---

## Payload CMS — navigation management

The primary nav links and secondary sub-links are managed in Payload, not hardcoded. This allows the hotel team to add, remove, reorder, enable/disable links without a deployment.

### Global: `navigation`

Create a Payload **Global** (not a collection) called `navigation`. A global is a single document — one set of nav settings for the whole site.

```typescript
// payload/globals/Navigation.ts

import type { GlobalConfig } from 'payload'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Navigation',
  admin: {
    description: 'Manage navigation links for both the main site and the guest hub.',
  },
  fields: [
    {
      name: 'outsideLinks',
      label: 'Main site links (hotel-berlin.de)',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      admin: {
        description: 'Primary nav links for the / context. Drag to reorder.',
        components: {
          // Payload array fields support drag-to-reorder natively — no custom UI needed
        },
      },
      fields: [
        {
          name: 'labelEN',
          label: 'Label (English)',
          type: 'text',
          required: true,
        },
        {
          name: 'labelDE',
          label: 'Label (German)',
          type: 'text',
          required: true,
        },
        {
          name: 'page',
          label: 'Page',
          type: 'relationship',
          relationTo: 'pages', // skeleton pages collection — see below
          required: false,
          admin: {
            description: 'Link to an internal page. Use this OR External URL — not both.',
          },
        },
        {
          name: 'externalUrl',
          label: 'External URL',
          type: 'text',
          required: false,
          admin: {
            description: 'Use for external links only. Leave blank if linking to a page above.',
          },
        },
        {
          name: 'enabled',
          label: 'Enabled',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Uncheck to hide this link without deleting it.',
          },
        },
      ],
    },
    {
      name: 'insideLinks',
      label: 'Guest hub links (/here)',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      admin: {
        description: 'Primary nav links for the /here context. Drag to reorder.',
      },
      fields: [
        // same fields as outsideLinks
        { name: 'labelEN', label: 'Label (English)', type: 'text', required: true },
        { name: 'labelDE', label: 'Label (German)', type: 'text', required: true },
        { name: 'page', label: 'Page', type: 'relationship', relationTo: 'pages', required: false },
        { name: 'externalUrl', label: 'External URL', type: 'text', required: false },
        { name: 'enabled', label: 'Enabled', type: 'checkbox', defaultValue: true },
      ],
    },
    {
      name: 'secondaryLinks',
      label: 'Secondary nav sub-links (both contexts)',
      type: 'array',
      maxRows: 8,
      admin: {
        description: 'The smaller links in the secondary nav row (e.g. What\'s on, Getting around). Drag to reorder. These appear ghosted on / and prominent on /here.',
      },
      fields: [
        { name: 'labelEN', label: 'Label (English)', type: 'text', required: true },
        { name: 'labelDE', label: 'Label (German)', type: 'text', required: true },
        { name: 'page', label: 'Page', type: 'relationship', relationTo: 'pages', required: false },
        { name: 'externalUrl', label: 'External URL', type: 'text', required: false },
        { name: 'enabled', label: 'Enabled', type: 'checkbox', defaultValue: true },
      ],
    },
  ],
}
```

### Collection: `pages` (skeleton pages)

Before a page can be linked in the nav, it needs to exist as a record in Payload. Create a lightweight `pages` collection. Each record is a skeleton — just enough to make it linkable and give it a URL. Real content comes later.

```typescript
// payload/collections/Pages.ts

import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  label: 'Pages',
  admin: {
    useAsTitle: 'title',
    description: 'All site pages. Create a skeleton here before linking in navigation.',
    defaultColumns: ['title', 'slug', 'context', 'status'],
  },
  fields: [
    {
      name: 'title',
      label: 'Page title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      label: 'URL slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'e.g. "rooms" → hotel-berlin.de/rooms · "here/art" → hotel-berlin.de/here/art',
      },
    },
    {
      name: 'context',
      label: 'Context',
      type: 'select',
      options: [
        { label: 'Outside (main site)', value: 'outside' },
        { label: 'Inside (/here)', value: 'inside' },
        { label: 'Both', value: 'both' },
        { label: 'Policy / utility', value: 'policy' },
      ],
      required: true,
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Skeleton — not yet built', value: 'skeleton' },
        { label: 'In progress', value: 'in-progress' },
        { label: 'Live', value: 'live' },
      ],
      defaultValue: 'skeleton',
    },
    {
      name: 'titleEN',
      label: 'SEO title (English)',
      type: 'text',
    },
    {
      name: 'titleDE',
      label: 'SEO title (German)',
      type: 'text',
    },
  ],
}
```

### Seed data — skeleton pages to create on launch

Create these records in the `pages` collection immediately so the nav global can reference them:

| Title | Slug | Context | Status |
|---|---|---|---|
| Rooms & Suites | `rooms` | outside | skeleton |
| Meetings | `meetings` | outside | skeleton |
| Eat & Drink | `restaurant` | outside | skeleton |
| Happenings | `happenings` | outside | skeleton |
| Neighbourhood | `neighbourhood` | outside | skeleton |
| About | `about` | outside | skeleton |
| Guest Hub | `here` | inside | skeleton |
| What's on | `here/events` | inside | skeleton |
| Art programme | `here/art` | inside | skeleton |
| Dining | `here/dining` | inside | skeleton |
| Explore | `here/explore` | inside | skeleton |
| Guest FAQ | `here/faq` | inside | skeleton |
| Getting around | `here/getting-around` | inside | skeleton |
| Gallery | `here/gallery` | inside | skeleton |
| Wallride | `here/wallride` | inside | skeleton |

### How the frontend consumes the nav global

```typescript
// lib/nav.ts
import { getPayload } from 'payload'
import config from '@payload-config'

export async function getNavigation() {
  const payload = await getPayload({ config })
  const nav = await payload.findGlobal({ slug: 'navigation' })
  return nav
}
```

Fetch once per request in the root layout via React Server Components. Pass down as props — no client-side fetch needed. ISR handles caching; on-demand revalidation fires when the navigation global is saved in Payload admin (via `afterChange` hook calling `revalidatePath('/', 'layout')`).

```typescript
// payload/globals/Navigation.ts — add hooks
hooks: {
  afterChange: [
    async () => {
      const { revalidatePath } = await import('next/cache')
      revalidatePath('/', 'layout') // revalidates nav on every page
    },
  ],
},
```

---

## Component structure

```
<SiteNav context="outside" | "inside">
  <NavPrimary>                          ← row 1, sticky
    <NavWordmark />                     ← links to / or /here
    <NavPrimaryLinks links={...} />     ← from Payload outsideLinks or insideLinks
    <NavLanguageToggle />               ← Language/Sprache label + DE/EN
    <NavBookNow />                      ← accent colour fill
  </NavPrimary>
  <NavSecondary>                        ← row 2, sticky below row 1
    <NavBridgeLink />                   ← context-aware escape/enter link
    <NavSecondaryLinks links={...} />   ← from Payload secondaryLinks
  </NavSecondary>
</SiteNav>
```

The `useNavScroll` hook is called inside `<SiteNav>` (client component wrapper). The child row components are server-renderable — only the scroll logic needs to be client-side. Use the `'use client'` boundary at the `<SiteNav>` level only.

---

## Accessibility requirements

- `<header>` wraps the entire nav. `role="banner"`.
- `<nav aria-label="Main navigation">` wraps primary links.
- `<nav aria-label="Secondary navigation">` wraps secondary links.
- Skip to main content link — visually hidden, visible on focus, first focusable element on every page:
  ```html
  <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:p-2">
    Skip to main content
  </a>
  ```
- Active link: `aria-current="page"` on the current page link — not just a visual underline.
- Book Now: `aria-label="Book now at Hotel Berlin, Berlin"` — descriptive for screen readers.
- Bridge link: `aria-label="Go to guest hub"` (outside) / `aria-label="Go to main hotel site"` (inside).
- Language toggle: `role="group"` wrapper, `aria-label="Language / Sprache"`. Each link has `lang="de"` / `lang="en"` attribute.
- Hamburger: `aria-expanded`, `aria-controls`, `aria-label`. Mobile menu has `role="dialog"`, `aria-modal="true"`. Focus trap. Closes on Escape.
- All interactive elements: visible focus ring. Never suppress `outline`.
- `prefers-reduced-motion`: disable all scroll transition animations. Instant show/hide.
- Contrast: all text meets WCAG AA 4.5:1 on `#F3F3F3` background. Check amber `#F79B2E` — this is borderline at small sizes; use font-weight 500 and minimum 13px to compensate.

---

## Colour tokens

```css
/* Nav-specific tokens — add to globals.css or tailwind config */
--nav-bg: #F3F3F3;
--nav-text-primary: #141414;
--nav-text-secondary: #555555;
--nav-text-muted: #AAAAAA;
--nav-accent-outside: #F79B2E;   /* amber */
--nav-accent-inside: #2C6B7A;    /* teal */
--nav-border: rgba(0,0,0,0.08); /* subtle bottom border on primary nav */
```

The `context` prop drives which accent token is active. Implement via a CSS custom property set on the `<SiteNav>` wrapper:

```typescript
// In <SiteNav>:
style={{ '--nav-accent': context === 'inside' ? '#2C6B7A' : '#F79B2E' } as React.CSSProperties}
```

All child components reference `var(--nav-accent)` rather than hardcoding either colour. Swapping context swaps everything automatically.

---

## Definition of done

- [ ] Both nav rows render on every page — `/`, `/here`, all sub-pages
- [ ] `#F3F3F3` background on both rows — no dark bar
- [ ] Outside context: amber `#F79B2E` accents — Book Now, bridge link, active underline, active language
- [ ] Inside context: teal `#2C6B7A` accents — same elements
- [ ] Primary nav wordmark links to `/` on outside, `/here` on inside
- [ ] Bridge link: "In the Building? ENTER →" on outside linking to `/here`
- [ ] Bridge link: "Planning a stay? hotel-berlin.de →" on inside linking to `/`
- [ ] Secondary sub-links ghosted (`#AAAAAA`) on outside, prominent (`#555555`) on inside
- [ ] Language toggle: "Language" label in EN locale, "Sprache" in DE locale
- [ ] Active locale in accent colour, inactive in `#AAAAAA`
- [ ] Each language link carries correct `lang` attribute and links to correct locale alternate
- [ ] Scroll down: secondary nav hides first (0ms delay), primary nav follows (150ms delay)
- [ ] Scroll up: primary nav returns first (0ms delay), secondary nav follows (150ms delay)
- [ ] Threshold: no hide behaviour within first 60px of scroll
- [ ] `prefers-reduced-motion`: transitions disabled, instant show/hide
- [ ] Mobile: hamburger at `768px` breakpoint, Book Now moves inside menu
- [ ] Mobile menu: focus trap, Escape closes, focus returns to trigger
- [ ] Payload `navigation` global exists and is editable in admin
- [ ] Payload `pages` collection exists with all skeleton records seeded
- [ ] Drag-to-reorder works on all three link arrays in Payload admin
- [ ] `enabled` toggle hides a link without deleting it
- [ ] `afterChange` hook on navigation global triggers `revalidatePath('/', 'layout')`
- [ ] Nav links render from Payload data — not hardcoded in component
- [ ] `aria-current="page"` on active link
- [ ] Skip to main content link present and functional on every page
- [ ] No console errors
- [ ] Contrast check: all text on `#F3F3F3` passes WCAG AA 4.5:1
