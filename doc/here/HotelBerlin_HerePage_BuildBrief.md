# Hotel Berlin, Berlin — /here Guest Hub Build Brief
*For Cursor / Claude Opus*
*Page: `/here` and all `/here/*` sub-pages — inside context*
*Stack: Next.js 15 · Payload CMS 3 · Tailwind CSS · next-intl v4*

---

## What this is

The `/here` page is the guest hub for Hotel Berlin, Berlin. It is the inside context — served to guests already at the hotel, arriving via QR code at check-in, in-room materials, or a conference registration desk. It is architecturally and visually distinct from the main site (`/`) but shares the same Payload CMS instance, the same component library, and the same nav structure.

The page is **mobile-first**. The majority of traffic arrives via QR code scan on a phone. The primary design frame is 480px. Below 480px (iPhone SE) everything stacks to single column automatically — no additional design states needed for that breakpoint. Desktop is a two-column grid adaptation of the same content.

---

## URL structure

| URL | Purpose |
|---|---|
| `/here` | Guest hub homepage — this brief |
| `/here/events` | Full events feed |
| `/here/art` | Art programme — FKKB + On the Walls |
| `/here/dining` | Lütze inside view — menus, hours, reservations |
| `/here/explore` | Neighbourhood picks for guests |
| `/here/faq` | Guest FAQs — stay questions |
| `/here/getting-around` | Transport, U-Bahn, bus, BER route |
| `/here/gallery` | FKKB gallery programme |
| `/here/wallride` | WALLRIDE exhibition — Skateboardmuseum Berlin |

German mirrors at `/de/hier/*` — full structure with `hreflang`.

---

## Context switching via URL parameters

The page adapts based on URL parameters. These drive hero state and card visibility — not separate pages.

| Parameter | Example | Effect |
|---|---|---|
| `?event=[slug]` | `?event=radisson-summit-2026` | Conference/event override — hero, card stack |
| `?context=dining` | `?context=dining` | Lütze visitor — promotes dining cards |
| `?context=gallery` | `?context=gallery` | Gallery visitor — promotes art cards |
| _(none)_ | `/here` | Default — generic guest state |

Parameters are read client-side. No auth, no tokens. A conference QR code is simply a printed URL: `hotel-berlin.de/here?event=radisson-summit-2026`.

---

## Tailwind config — add `xs` breakpoint

Before building any `/here` components, add this to `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    screens: {
      xs: '480px', // larger phones — sits below Tailwind default sm: 640px
    },
  },
},
```

This is the primary mobile breakpoint for `/here`. Below `xs` (iPhone SE, narrow phones) — single column, all cards full width. At `xs` and above — 2-col grid, full/half width cards as specified. At `md` (768px) and above — desktop grid adjustments.

---

## Grid system

```css
/* Base grid — applies at all sizes */
.here-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 0 12px;
}

/* Below xs — everything full width */
@media (max-width: 479px) {
  .here-grid {
    grid-template-columns: 1fr;
  }
}

/* Desktop */
@media (min-width: 768px) {
  .here-grid {
    gap: 16px;
    padding: 0 24px;
    max-width: 1280px;
    margin: 0 auto;
  }
}
```

Card span classes:
- `.card-full` — `grid-column: span 2` — always full width
- `.card-half` — `grid-column: span 1` — half width at `xs` and above, full below

In Tailwind: `col-span-2` for full, `col-span-1` for half. Use `xs:col-span-1` where a card is full width below xs but half above.

---

## Navigation

The nav is already built. Do not touch the primary nav component.

The secondary nav (the `#F3F3F3` utility strip — "In the Building? ENTER" on the outside) adapts for `/here`:

```
Not here yet?  STAY →          ← links to /  · teal #2C6B7A accent
```

German: `Noch nicht hier?  BLEIB →`

The primary nav CTA button changes label on `/here`:

- Outside: **Book Now** (amber `#F79B2E`)
- Inside: **Plan your next stay** (teal `#2C6B7A`) — same Radisson booking URL

The wordmark links to `/here` when inside context (not `/`).

All teal accent tokens replace amber throughout the nav on `/here` — active link underline, language toggle active state, Book Now button fill. This is driven by the `--nav-accent` CSS custom property set on the nav wrapper. On `/here` set `--nav-accent: #2C6B7A`.

---

## Hero component — `<HereHero>`

### Structure

```
[full-width image — static, no Ken Burns]
[overlay — gradient bottom third]
  [clock — top right]
  [greeting headline]
  [subline — optional]
  [location line — always]
```

Height: `120px` mobile · `280px` desktop. No Ken Burns. No animation. Static image, chosen from Payload.

### Live clock

Client component (`'use client'`). Updates every 60 seconds. Berlin timezone (`Europe/Berlin`). Format: `20:47` — no "Uhr" suffix, reads universally across EN and DE.

Position: top-right of the hero overlay. Archivo Narrow, 13px, `#cccccc`, slightly muted. Does not compete with the greeting.

```typescript
'use client'
import { useEffect, useState } from 'react'

export function HeroClock() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => {
      setTime(
        new Date().toLocaleTimeString('de-DE', {
          timeZone: 'Europe/Berlin',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      )
    }
    tick()
    const interval = setInterval(tick, 60000)
    return () => clearInterval(interval)
  }, [])

  return <span className="hero-clock">{time}</span>
}
```

The `HeroClock` is the only client component in the hero. Everything else is server-rendered.

### Greeting logic

Time-of-day greeting — computed server-side from Berlin time at render, ISR means it may be up to 60s stale which is fine:

```typescript
function getTimeOfDay(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' {
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 23) return 'evening'
  return 'evening' // after 23:00 — still good evening
}
```

Greeting strings come from Payload (`hereHero` global). Never hardcoded in the component.

### Priority logic — which state to show

```typescript
async function getHeroState(eventSlug?: string, context?: string) {

  // Priority 1 — active event (conference QR code)
  if (eventSlug) {
    const event = await getEventBySlug(eventSlug)
    if (event?.heroActive) return { type: 'event', data: event }
  }

  // Priority 2 — day/time slot from hereHero global
  const global = await getHereHeroGlobal()
  const now = new Date().toLocaleString('en-GB', { timeZone: 'Europe/Berlin' })
  const berlinDate = new Date(now)
  const day = berlinDate.toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'Europe/Berlin' })
  const slot = global.days[day.toLowerCase()] // monday, tuesday etc

  // Priority 3 — FKKB override (if enabled, overrides image and subline)
  if (global.fkkbEnabled && slot) {
    return { type: 'fkkb-day', data: { ...slot, fkkb: global.fkkb } }
  }
  if (global.fkkbEnabled) {
    return { type: 'fkkb', data: { ...global.default, fkkb: global.fkkb } }
  }

  // Priority 4 — Lütze special (overrides subline only, not image)
  if (global.lutzeEnabled) {
    return { type: 'lutze', data: { ...(slot || global.default), lutze: global.lutze } }
  }

  // Priority 5 — day slot
  if (slot) return { type: 'day', data: slot }

  // Fallback — default
  return { type: 'default', data: global.default }
}
```

**FKKB vs Lütze conflict:** If both `fkkbEnabled` and `lutzeEnabled` are true at the same time, FKKB wins — it controls the image. The Lütze subline is suppressed. Only one subline shows at a time.

---

## Payload CMS — `hereHero` global

One document. The hotel team edits this to control the hero. They never need to touch code.

```typescript
// payload/globals/HereHero.ts

import type { GlobalConfig } from 'payload'

const dayFields = (label: string) => ({
  name: label.toLowerCase(),
  label,
  type: 'group' as const,
  fields: [
    {
      name: 'image',
      label: 'Hero image',
      type: 'upload' as const,
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Landscape · min 1200×600px · will be cropped on mobile. Leave blank to use the default image.',
      },
    },
    { name: 'altText', label: 'Image alt text', type: 'text' as const },
    { name: 'greetingEN', label: 'Greeting (English)', type: 'text' as const,
      admin: { description: 'e.g. "Good evening"' } },
    { name: 'greetingDE', label: 'Greeting (German)', type: 'text' as const,
      admin: { description: 'e.g. "Guten Abend"' } },
    { name: 'sublineEN', label: 'Subline (English)', type: 'text' as const,
      admin: { description: 'Optional. e.g. "Tournament night starts at 19:00"' } },
    { name: 'sublineDE', label: 'Subline (German)', type: 'text' as const },
  ],
})

export const HereHero: GlobalConfig = {
  slug: 'hereHero',
  label: 'Guest hub — hero',
  admin: {
    description: 'Controls the hero image and greeting on the /here guest hub page. Changes here are reflected immediately on next page load.',
  },
  fields: [

    // ── DEFAULT ──────────────────────────────────
    {
      name: 'default',
      label: 'Default (fallback)',
      type: 'group',
      admin: {
        description: 'Shown when no day slot matches and no special override is active. The courtyard image is recommended here.',
      },
      fields: [
        {
          name: 'image',
          label: 'Hero image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: {
            description: 'Landscape · min 1200×600px. Recommended: courtyard image.',
          },
        },
        { name: 'altText', label: 'Image alt text', type: 'text', required: true },
        { name: 'greetingEN', label: 'Greeting (English)', type: 'text',
          defaultValue: 'Good evening',
          admin: { description: 'Time-of-day text prepended automatically. This field is the fallback if no time logic matches.' } },
        { name: 'greetingDE', label: 'Greeting (German)', type: 'text',
          defaultValue: 'Guten Abend' },
        { name: 'sublineEN', label: 'Subline (English)', type: 'text' },
        { name: 'sublineDE', label: 'Subline (German)', type: 'text' },
      ],
    },

    // ── DAYS OF THE WEEK ─────────────────────────
    {
      name: 'daysHeading',
      type: 'ui',
      admin: {
        components: {
          Field: () => null, // spacer / heading — cosmetic only
        },
        description: '── Days of the week ── Leave image blank to use the default image for that day.',
      },
    },

    dayFields('Monday'),
    dayFields('Tuesday'),
    dayFields('Wednesday'),
    dayFields('Thursday'),
    dayFields('Friday'),
    dayFields('Saturday'),
    dayFields('Sunday'),

    // ── SPECIAL OVERRIDES ────────────────────────
    {
      name: 'specialHeading',
      type: 'ui',
      admin: {
        description: '── Special overrides ── When enabled, these override the day slot above.',
      },
    },

    // FKKB / Gallery
    {
      name: 'fkkbEnabled',
      label: 'FKKB gallery — show current exhibition',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'When on: uses the FKKB image and subline below. Update when the exhibition changes (monthly).',
      },
    },
    {
      name: 'fkkb',
      label: 'FKKB current exhibition',
      type: 'group',
      admin: {
        condition: (data) => data.fkkbEnabled,
      },
      fields: [
        {
          name: 'image',
          label: 'Exhibition image',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Landscape · min 1200×600px. Use a strong image from the current show.',
          },
        },
        { name: 'altText', label: 'Image alt text', type: 'text' },
        { name: 'sublineEN', label: 'Subline (English)', type: 'text',
          admin: { description: 'e.g. "Anna Taut + Czarnobyl · now open · free entry"' } },
        { name: 'sublineDE', label: 'Subline (German)', type: 'text',
          admin: { description: 'e.g. "Anna Taut + Czarnobyl · jetzt geöffnet · freier Eintritt"' } },
      ],
    },

    // Lütze special
    {
      name: 'lutzeEnabled',
      label: 'Lütze — show special or event',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'When on: adds the Lütze subline to the hero. Does not override the image — the day image still shows. Note: if FKKB override is also on, FKKB wins and this subline is suppressed.',
      },
    },
    {
      name: 'lutze',
      label: 'Lütze special',
      type: 'group',
      admin: {
        condition: (data) => data.lutzeEnabled,
      },
      fields: [
        { name: 'sublineEN', label: 'Subline (English)', type: 'text',
          admin: { description: 'e.g. "Vinyl night tonight · from 20:00"' } },
        { name: 'sublineDE', label: 'Subline (German)', type: 'text' },
      ],
    },

  ],

  hooks: {
    afterChange: [
      async () => {
        const { revalidatePath } = await import('next/cache')
        revalidatePath('/here')
        revalidatePath('/de/hier')
      },
    ],
  },
}
```

### Event hero fields — add to existing `events` collection

Add these fields to the existing `events` Payload collection. They sit at the bottom of the document under a collapsible group labelled "Guest hub hero":

```typescript
{
  name: 'heroOverride',
  label: 'Guest hub hero (optional)',
  type: 'group',
  admin: {
    description: 'When a guest scans the QR code for this event (?event=[slug]), these fields control the /here hero. Enable on the morning of the event.',
  },
  fields: [
    {
      name: 'heroActive',
      label: 'Show this hero on /here',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Flip on when the event starts. Flip off when it ends.',
      },
    },
    {
      name: 'heroImage',
      label: 'Event image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (data) => data?.heroOverride?.heroActive,
        description: 'Landscape · min 1200×600px. Can be a conference logo, venue shot, or event graphic.',
      },
    },
    { name: 'heroAltText', label: 'Image alt text', type: 'text' },
    { name: 'heroGreetingEN', label: 'Greeting (English)', type: 'text',
      admin: { description: 'e.g. "Welcome to Radisson Summit 2026"' } },
    { name: 'heroGreetingDE', label: 'Greeting (German)', type: 'text' },
    { name: 'heroSublineEN', label: 'Subline (English)', type: 'text',
      admin: { description: 'e.g. "9–11 June · Hotel Berlin, Berlin"' } },
    { name: 'heroSublineDE', label: 'Subline (German)', type: 'text' },
  ],
},
```

---

## Card grid — content and layout

### Page background
`#FBFBFB` — warm off-white. Same as homepage.

### Section dividers
Between card groups, a centred label between two hairlines:

```html
<div class="section-divider">
  <hr />
  <span>During your stay</span>
  <hr />
</div>
```

Archivo Narrow · 10px · `#AAAAAA` · letter-spacing 0.07em · uppercase. Visually separates the card groups without adding heavy headers.

---

### Card 1 — Stay info `<StayInfoCard>`
**Width:** full (col-span-2 always)
**Style:** white `#FFFFFF` · 1px border `#E0E0E0` · no image · operational register
**Section label:** "During your stay" / "Dein Aufenthalt"

Content — inline data rows, not a paragraph:

```
Check-out        12:00 noon
Breakfast        06:30 – 10:00  ·  Lütze ground floor
WiFi             [network]  [password]   ← monospace pill for each
Parking          Underground · 200+ spaces · €4/hr · max €25/day
Luggage          Available after check-out · ask at reception
─────────────────────────────────────────────────────────────
Parking · luggage · pets · all FAQs →   ← link to /here/faq
```

WiFi credentials: `network` and `password` rendered in `font-mono` in a small `#F0F0F0` pill. These come from the `hotel` Payload global — not hardcoded.

**Context adaptation:**
- `?event=[slug]` — hide check-out row, replace with event room/location row. Show event programme subline.
- `?context=dining` — hide entirely (Lütze visitors don't need stay info)
- `?context=gallery` — hide entirely

---

### Card 2 — Tonight hero event `<TonightHeroCard>`
**Width:** full (col-span-2)
**Style:** teal tint `#F0F8F7` · teal border `#2C6B7A` · with image
**Section label:** "Tonight" / "Heute Abend"

Shows the current/next FKKB exhibition or event from the `exhibitions` collection where `status: current`.

```
[exhibition image — 80px tall on mobile]
● Open now · free entry      ← OpenStatusBadge component
Anna Taut + Czarnobyl
FKKB gallery · until 22:00 · ground floor
```

Links to `/here/art`.

---

### Cards 3 + 4 — KTTK + Lütze `<VenueCard>` × 2
**Width:** half each (col-span-1 at xs+, col-span-2 below xs)
**Style:** KTTK amber tint `#FDF6EE` · Lütze gold tint `#FDF8EE`

These are tap targets — name, status, one line, link. Not reading cards.

**KTTK:**
```
Thu 19:00        ← badge
KTTK
Tournament night · €5 · B2
```
Links to `/here/events`.

**Lütze:**
```
● Kitchen open   ← OpenStatusBadge — live from Lütze hours
Lütze
Until 22:30 · reserve →
```
Links to `/here/dining`. The open/closed status is computed from `openingHoursSpecification` in the Lütze venue record, Berlin timezone.

---

### Card 5 — Art current show `<ArtHeroCard>`
**Width:** full (col-span-2)
**Style:** teal tint · with image
**Section label:** "Art in the building" / "Kunst im Haus"

```
[exhibition image]
Current show     ← badge
FKKB — Anna Taut + Czarnobyl
Gallery · ground floor · free entry · explore all 27 editions →
```

Links to `/here/art`.

---

### Cards 6–9 — On the Walls floor cards `<ArtLocationCard>` × 4
**Width:** half (col-span-1 at xs+)
**Style:** white · teal floor label

Each card is a work in the building with its physical location. Data from `artworks` collection, `locationInBuilding` field (floor + wing).

```
Floor 4           ← teal label
Somari
East corridor
```

Four cards shown on the hub. Full list at `/here/art`. These cards are half-width at `xs` — they are navigational tap targets, not reading content.

**Note:** `locationInBuilding` is a field to be added to the `artworks` collection (text field — floor + wing description). This data must be gathered from the hotel team before these cards can show real content. Placeholder: "Location TBC".

---

### Card 10 — Neighbourhood map `<NeighbourhoodMap>`
**Width:** full (col-span-2 always)
**Style:** green tint `#F0F6F0` · map fills the card
**Section label:** "Explore the area" / "Die Nachbarschaft"

Full interactive Mapbox GL JS map — not the static `<MapTeaser>` used on the homepage. GDPR/cookie concerns do not apply here — this is a guest-facing page, not a cold landing page.

Map height: `160px` mobile · `280px` desktop.

Pin system:
- Amber teardrops — neighbourhood places from `neighbourhoodPlaces` collection, `context: outside`
- Teal teardrops — in-building locations, `context: inside`
- Dark purple teardrops — concierge picks

"Open full map →" links to `/here/explore`.

---

### Cards 11 + 12 — Basement venues `<VenueCard>` × 2
**Width:** half each (col-span-1 at xs+)
**Style:** KTTK amber · Wallride neutral gray
**Section label:** "In the basement" / "Im Keller"

**KTTK (full venue card — more detail than the Tonight half-card above):**
```
B2 · Mon–Sun     ← badge
KTTK
4 JOOLA tables · €5 / 30 min
Bats at Lütze bar
```

**Wallride:**
```
Permanent        ← badge
Wallride
Half-pipe · Cold War Berlin skate history
By Skateboardmuseum Berlin
```
Links to `/here/wallride`.

---

### Card 13 — FAQ accordion `<FAQSection pageContext="here">`
**Width:** full (col-span-2)
**Style:** white
**Section label:** "Need help?" / "Brauchst du Hilfe?"

Same `<FAQAccordion>` component as the homepage. `pageContext="here"` surfaces the 3 most relevant guest FAQs:

1. What time is check-out?
2. Where is the nearest U-Bahn?
3. Can I store luggage after check-out?

"All guest FAQs →" links to `/here/faq`.

**Context adaptation:**
- `?event=[slug]` — surfaces event-specific FAQs if present on the event record
- `?context=dining` — surfaces Lütze FAQs (opening hours, reservations, menu)
- `?context=gallery` — surfaces FKKB FAQs (opening times, free entry, location)

---

## Desktop grid layout (768px+)

```
┌─────────────────────────┬─────────────────────────┐
│  Stay info card         │  Tonight hero (FKKB)    │
│  (full height)          ├────────────┬────────────┤
│                         │ KTTK       │ Lütze      │
├─────────────────────────┴────────────┴────────────┤
│  Art current show — full width                    │
├─────────────┬─────────────┬─────────────┬─────────┤
│ Floor card  │ Floor card  │ Floor card  │ Floor   │
├─────────────┴─────────────┴─────────────┴─────────┤
│  Neighbourhood map — full width                   │
├─────────────────────────┬─────────────────────────┤
│ KTTK (basement)         │ Wallride                │
├─────────────────────────┴─────────────────────────┤
│  FAQ accordion — full width                       │
└───────────────────────────────────────────────────┘
```

The stay info card and tonight section share a row because they're the two things a just-arrived guest needs simultaneously. CSS Grid `align-items: stretch` handles unequal heights — both cards stretch to the tallest sibling. The tonight hero image uses `object-fit: cover` to handle extra height gracefully.

---

## Footer

Compressed variant — no full sitemap, no awards, no Radisson logos.

```
Hotel Berlin, Berlin · Lützowplatz 17 · 10785 Berlin

Contact  ·  Accessibility  ·  Privacy  ·  hotel-berlin.de →
```

Background: dark purple `#1E1530` (same as main site footer). The "hotel-berlin.de →" exit link is in teal `#2C6B7A` — prominent, easy to find. This is the secondary escape route for users who missed the bridge link in the nav.

---

## i18n — copy reference

All copy below comes from Payload or `next-intl` translation strings. Never hardcoded in components.

### Bridge link (secondary nav)
| | EN | DE |
|---|---|---|
| Outside `/` | In the Building? **ENTER →** | Schon drin? **REIN →** |
| Inside `/here` | Not here yet? **STAY →** | Noch nicht hier? **BLEIB →** |

### Primary nav CTA
| Context | EN | DE |
|---|---|---|
| Outside | Book Now | Jetzt buchen |
| Inside | Plan your next stay | Bald wiederkommen? |

### Time-of-day greetings (from Payload `hereHero` global — these are defaults)
| Time | EN | DE |
|---|---|---|
| 06:00–11:59 | Good morning | Guten Morgen |
| 12:00–17:59 | Good afternoon | Guten Tag |
| 18:00–22:59 | Good evening | Guten Abend |
| 23:00–05:59 | Good evening | Guten Abend |

### Day-of-week sublines (from Payload `hereHero` global — these are suggested defaults)
| Day | EN | DE |
|---|---|---|
| Thursday | Tournament night starts at 19:00 | Turniernacht im Keller ab 19 Uhr |
| Saturday | No rush today | Heute ist Zeit |
| Sunday | Breakfast until 10:00 | Frühstück bis 10 Uhr |
| Others | _(empty — just the greeting)_ | _(empty)_ |

---

## Colour tokens — inside context

```css
--accent: #2C6B7A;              /* teal — primary accent throughout /here */
--card-teal-bg: #F0F8F7;
--card-teal-border: #2C6B7A;
--card-amber-bg: #FDF6EE;
--card-amber-border: #B87A2E;
--card-gold-bg: #FDF8EE;
--card-gold-border: #A08C38;
--card-green-bg: #F0F6F0;
--card-green-border: #4A7A68;
--page-bg: #FBFBFB;
--footer-bg: #1E1530;
```

---

## Accessibility requirements

- `<main id="main-content">` — skip link target
- Skip to main content link — first focusable element, visually hidden until focused
- `<article>` or `<section>` with `aria-labelledby` for each named card group
- All card images: descriptive `alt` text required — never empty for content images
- OpenStatusBadge: `aria-live="polite"` if status updates without page reload
- FAQ accordion: same `aria-expanded` / `aria-controls` / `role="region"` pattern as homepage
- Clock: `aria-label="Current time in Berlin"` · `aria-live="off"` (no announcement on update)
- Interactive map: `aria-label="Neighbourhood map"` · keyboard navigable pins
- All half-width cards: minimum 44px touch target height — use padding to achieve this at 218px card width
- Contrast: all text on tinted card backgrounds passes WCAG AA 4.5:1 — verify each card colour at launch
- `prefers-reduced-motion`: no transitions on card hover states

---

## JSON-LD schema

The `/here` page is guest-facing and not indexed by search engines (`noindex`). However JSON-LD is still output for `FAQPage` (guest FAQs) and `Event`/`ExhibitionEvent` for the current show — these may be indexed independently.

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What time is check-out?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Check-out is by 12:00 noon. Late check-out is available subject to availability — ask at reception."
      }
    }
  ]
}
```

ExhibitionEvent JSON-LD for current FKKB show — same schema as `/here/art`, reduced to current show only.

---

## Definition of done

- [ ] `/here` renders at all breakpoints — 320px, 480px, 768px, 1280px
- [ ] Below 480px: all cards full width, no half-width cards
- [ ] At 480px+: stay info, tonight hero, art hero, map, FAQ full width · KTTK/Lütze, floor cards, basement venues half width
- [ ] Clock renders in Berlin timezone, updates every 60 seconds
- [ ] Clock is client component, rest of hero is server-rendered
- [ ] Hero greeting changes by time of day
- [ ] `hereHero` Payload global exists with all fields — default, 7 day slots, FKKB group, Lütze group
- [ ] Day slot image falls back to default image if day image is blank
- [ ] FKKB override: when enabled, FKKB image and subline show regardless of day slot
- [ ] Lütze override: when enabled, Lütze subline shows · does not override image
- [ ] FKKB + Lütze conflict: FKKB wins, Lütze subline suppressed
- [ ] `?event=[slug]` param: loads event record, if `heroActive` true → event hero shown
- [ ] `?event=[slug]`: stay info card adapts, shows event room/time, hides check-out row
- [ ] `?context=dining`: stay info card hidden, Lütze card promoted
- [ ] `?context=gallery`: art cards promoted, stay info hidden
- [ ] OpenStatusBadge on Lütze card reflects live Berlin time against opening hours
- [ ] WiFi credentials come from `hotel` Payload global — not hardcoded
- [ ] `locationInBuilding` field exists on `artworks` collection — shows "Location TBC" if blank
- [ ] Neighbourhood map renders full interactive Mapbox GL JS — not static image
- [ ] Map pins: amber (neighbourhood), teal (in-building), dark purple (concierge picks)
- [ ] Bridge link: "Not here yet? STAY →" in teal · links to `/`
- [ ] Bridge link DE: "Noch nicht hier? BLEIB →"
- [ ] Primary nav CTA: "Plan your next stay" in teal on `/here`
- [ ] Primary nav CTA DE: "Bald wiederkommen?"
- [ ] Wordmark links to `/here` (not `/`) when inside context
- [ ] Footer: compressed, dark purple `#1E1530`, "hotel-berlin.de →" in teal
- [ ] `noindex` meta tag on all `/here/*` pages
- [ ] FAQPage JSON-LD output on `/here/faq`
- [ ] ExhibitionEvent JSON-LD for current show
- [ ] `hreflang` on all `/here/*` pages — EN and DE alternates
- [ ] `<html lang>` correct per locale
- [ ] Skip to main content link present and functional
- [ ] All card images have `alt` text
- [ ] FAQ accordion correct aria attributes
- [ ] Clock has `aria-label="Current time in Berlin"`
- [ ] No console errors
- [ ] `prefers-reduced-motion`: no hover transitions
- [ ] `afterChange` hook on `hereHero` global revalidates `/here` and `/de/hier`
