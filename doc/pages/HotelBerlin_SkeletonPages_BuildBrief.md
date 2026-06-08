# Hotel Berlin, Berlin — Skeleton Pages Build Brief
*For Cursor / Claude Opus*
*Goal: create all Next.js route files as skeleton stubs + seed the Payload `pages` collection*
*Stack: Next.js 15 · Payload CMS 3 · next-intl v4*

---

## What this is

Two tasks in one brief:

1. **Create skeleton Next.js route files** for every page in the site — outside context, inside context, and policy pages. Each skeleton resolves without a 404, renders a minimal accessible page, and is ready to receive real content later.

2. **Seed the Payload `pages` collection** with one record per page — matching the fields in the existing collection: Title (English), Title (German), URL slug, Context, Status.

The two tasks must match exactly — every route file has a corresponding Payload record, every Payload record has a corresponding route file.

---

## Skeleton page template

Every skeleton page follows this exact pattern — semantic, accessible, honest about its state:

```typescript
// Example: app/rooms/page.tsx

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rooms & Suites — Hotel Berlin, Berlin',

}

export default function RoomsPage() {
  return (
    <main id="main-content">
      <div style={{ padding: '80px 24px', maxWidth: '640px', margin: '0 auto' }}>
        <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#aaa', marginBottom: '12px' }}>
          In progress
        </p>
        <h1 style={{ fontSize: '28px', fontWeight: '500', marginBottom: '8px' }}>
          Rooms &amp; Suites
        </h1>
        <p style={{ fontSize: '14px', color: '#666' }}>
          This page is being built.
        </p>
      </div>
    </main>
  )
}
```

Rules for every skeleton:
- `<main id="main-content">` — skip link target
- One `<h1>` with the page name in English
- No `robots` meta — do not add noindex. The site is not live during build so there is nothing to protect against, and when it does go live pages should be indexed from day one
- No placeholder images, no Lorem Ipsum, no fake content
- German route files use German `<h1>` text
- `revalidate` not needed on skeletons

---

## Complete route file list

Create the following files. German routes mirror EN exactly with translated `<h1>` and metadata title.

### Outside context — `/app`

| File | Route | h1 |
|---|---|---|
| `app/page.tsx` | `/` | _(homepage — already built, do not touch)_ |
| `app/rooms/page.tsx` | `/rooms` | Rooms & Suites |
| `app/restaurant/page.tsx` | `/restaurant` | Lütze — Eat & Drink |
| `app/meetings/page.tsx` | `/meetings` | Meetings & Events |
| `app/neighbourhood/page.tsx` | `/neighbourhood` | Neighbourhood |
| `app/about/page.tsx` | `/about` | About Hotel Berlin, Berlin |
| `app/happenings/page.tsx` | `/happenings` | What's on |
| `app/people/page.tsx` | `/people` | People |
| `app/on-the-walls/page.tsx` | `/on-the-walls` | On the Walls |

### Inside context — `/app/here`

| File | Route | h1 |
|---|---|---|
| `app/here/page.tsx` | `/here` | _(already being built — do not touch)_ |
| `app/here/events/page.tsx` | `/here/events` | What's on |
| `app/here/art/page.tsx` | `/here/art` | Art programme |
| `app/here/dining/page.tsx` | `/here/dining` | Dining |
| `app/here/explore/page.tsx` | `/here/explore` | Explore the area |
| `app/here/faq/page.tsx` | `/here/faq` | Guest FAQs |
| `app/here/getting-around/page.tsx` | `/here/getting-around` | Getting around |
| `app/here/gallery/page.tsx` | `/here/gallery` | Gallery |
| `app/here/wallride/page.tsx` | `/here/wallride` | Wallride |

### Policy & utility — `/app`

| File | Route | h1 |
|---|---|---|
| `app/policies/cancellation/page.tsx` | `/policies/cancellation` | Cancellation policy |
| `app/policies/check-in/page.tsx` | `/policies/check-in` | Check-in & check-out |
| `app/policies/pets/page.tsx` | `/policies/pets` | Pet policy |
| `app/policies/fees/page.tsx` | `/policies/fees` | Parking & fees |
| `app/policies/payment/page.tsx` | `/policies/payment` | Payment policy |
| `app/accessibility/page.tsx` | `/accessibility` | Accessibility |
| `app/terms-conditions/page.tsx` | `/terms-conditions` | Terms & conditions |
| `app/privacy-policy/page.tsx` | `/privacy-policy` | Privacy policy |
| `app/imprint/page.tsx` | `/imprint` | Imprint |

### German mirrors — `/app/de`

Mirror every outside and inside route above under `app/de/`. next-intl handles routing — follow the existing pattern in the project for German locale routes.

German h1 translations for the skeleton files:

| Route | German h1 |
|---|---|
| `/de/rooms` | Zimmer & Suiten |
| `/de/restaurant` | Lütze — Essen & Trinken |
| `/de/meetings` | Tagungen & Veranstaltungen |
| `/de/neighbourhood` | Nachbarschaft |
| `/de/about` | Über Hotel Berlin, Berlin |
| `/de/happenings` | Was ist los |
| `/de/people` | Menschen |
| `/de/on-the-walls` | On the Walls |
| `/de/hier/events` | Was ist los |
| `/de/hier/art` | Kunstprogramm |
| `/de/hier/dining` | Essen & Trinken |
| `/de/hier/explore` | Die Nachbarschaft |
| `/de/hier/faq` | Gäste-FAQ |
| `/de/hier/getting-around` | So kommst du hin |
| `/de/hier/gallery` | Galerie |
| `/de/hier/wallride` | Wallride |
| `/de/policies/cancellation` | Stornierungsbedingungen |
| `/de/policies/check-in` | Check-in & Check-out |
| `/de/policies/pets` | Haustierregelung |
| `/de/policies/fees` | Parken & Gebühren |
| `/de/policies/payment` | Zahlungsbedingungen |
| `/de/accessibility` | Barrierefreiheit |
| `/de/terms-conditions` | AGB |
| `/de/privacy-policy` | Datenschutz |
| `/de/imprint` | Impressum |

---

## `hreflang` on every skeleton

Every skeleton page must output `hreflang` alternates. Add to metadata:

```typescript
export const metadata: Metadata = {
  title: 'Rooms & Suites — Hotel Berlin, Berlin',

  alternates: {
    canonical: 'https://hotel-berlin.de/rooms',
    languages: {
      'en': 'https://hotel-berlin.de/rooms',
      'de': 'https://hotel-berlin.de/de/rooms',
      'x-default': 'https://hotel-berlin.de/rooms',
    },
  },
}
```

---

## Payload `pages` collection — seed records

Create one record per page using the Payload REST API or a seed script. Match the fields in the existing collection exactly.

The `context` field values must match the select options in the collection. Use whichever values are configured — the table below shows the intent:

| Title (EN) | Title (DE) | Slug | Context | Status |
|---|---|---|---|---|
| Homepage | Startseite | _(root — no slug)_ | outside | live |
| Rooms & Suites | Zimmer & Suiten | `rooms` | outside | skeleton |
| Lütze — Eat & Drink | Lütze — Essen & Trinken | `restaurant` | outside | skeleton |
| Meetings & Events | Tagungen & Veranstaltungen | `meetings` | outside | skeleton |
| Neighbourhood | Nachbarschaft | `neighbourhood` | outside | skeleton |
| About | Über uns | `about` | outside | skeleton |
| What's on | Was ist los | `happenings` | outside | skeleton |
| People | Menschen | `people` | outside | skeleton |
| On the Walls | On the Walls | `on-the-walls` | outside | skeleton |
| Guest Hub | Gästehub | `here` | inside | in-progress |
| What's on tonight | Was ist los | `here/events` | inside | skeleton |
| Art programme | Kunstprogramm | `here/art` | inside | skeleton |
| Dining | Essen & Trinken | `here/dining` | inside | skeleton |
| Explore the area | Die Nachbarschaft | `here/explore` | inside | skeleton |
| Guest FAQs | Gäste-FAQ | `here/faq` | inside | skeleton |
| Getting around | So kommst du hin | `here/getting-around` | inside | skeleton |
| Gallery | Galerie | `here/gallery` | inside | skeleton |
| Wallride | Wallride | `here/wallride` | inside | skeleton |
| Cancellation policy | Stornierungsbedingungen | `policies/cancellation` | policy | skeleton |
| Check-in & check-out | Check-in & Check-out | `policies/check-in` | policy | skeleton |
| Pet policy | Haustierregelung | `policies/pets` | policy | skeleton |
| Parking & fees | Parken & Gebühren | `policies/fees` | policy | skeleton |
| Payment policy | Zahlungsbedingungen | `policies/payment` | policy | skeleton |
| Accessibility | Barrierefreiheit | `accessibility` | policy | skeleton |
| Terms & conditions | AGB | `terms-conditions` | policy | skeleton |
| Privacy policy | Datenschutz | `privacy-policy` | policy | skeleton |
| Imprint | Impressum | `imprint` | policy | skeleton |

### Seed script

Create `payload/seed/pages.ts` and run once:

```typescript
// payload/seed/pages.ts
import { getPayload } from 'payload'
import config from '@payload-config'

const pages = [
  { titleEN: 'Rooms & Suites', titleDE: 'Zimmer & Suiten', slug: 'rooms', context: 'outside', status: 'skeleton' },
  { titleEN: 'Lütze — Eat & Drink', titleDE: 'Lütze — Essen & Trinken', slug: 'restaurant', context: 'outside', status: 'skeleton' },
  { titleEN: 'Meetings & Events', titleDE: 'Tagungen & Veranstaltungen', slug: 'meetings', context: 'outside', status: 'skeleton' },
  { titleEN: 'Neighbourhood', titleDE: 'Nachbarschaft', slug: 'neighbourhood', context: 'outside', status: 'skeleton' },
  { titleEN: 'About', titleDE: 'Über uns', slug: 'about', context: 'outside', status: 'skeleton' },
  { titleEN: "What's on", titleDE: 'Was ist los', slug: 'happenings', context: 'outside', status: 'skeleton' },
  { titleEN: 'People', titleDE: 'Menschen', slug: 'people', context: 'outside', status: 'skeleton' },
  { titleEN: 'On the Walls', titleDE: 'On the Walls', slug: 'on-the-walls', context: 'outside', status: 'skeleton' },
  { titleEN: 'Guest Hub', titleDE: 'Gästehub', slug: 'here', context: 'inside', status: 'in-progress' },
  { titleEN: "What's on tonight", titleDE: 'Was ist los', slug: 'here/events', context: 'inside', status: 'skeleton' },
  { titleEN: 'Art programme', titleDE: 'Kunstprogramm', slug: 'here/art', context: 'inside', status: 'skeleton' },
  { titleEN: 'Dining', titleDE: 'Essen & Trinken', slug: 'here/dining', context: 'inside', status: 'skeleton' },
  { titleEN: 'Explore the area', titleDE: 'Die Nachbarschaft', slug: 'here/explore', context: 'inside', status: 'skeleton' },
  { titleEN: 'Guest FAQs', titleDE: 'Gäste-FAQ', slug: 'here/faq', context: 'inside', status: 'skeleton' },
  { titleEN: 'Getting around', titleDE: 'So kommst du hin', slug: 'here/getting-around', context: 'inside', status: 'skeleton' },
  { titleEN: 'Gallery', titleDE: 'Galerie', slug: 'here/gallery', context: 'inside', status: 'skeleton' },
  { titleEN: 'Wallride', titleDE: 'Wallride', slug: 'here/wallride', context: 'inside', status: 'skeleton' },
  { titleEN: 'Cancellation policy', titleDE: 'Stornierungsbedingungen', slug: 'policies/cancellation', context: 'policy', status: 'skeleton' },
  { titleEN: 'Check-in & check-out', titleDE: 'Check-in & Check-out', slug: 'policies/check-in', context: 'policy', status: 'skeleton' },
  { titleEN: 'Pet policy', titleDE: 'Haustierregelung', slug: 'policies/pets', context: 'policy', status: 'skeleton' },
  { titleEN: 'Parking & fees', titleDE: 'Parken & Gebühren', slug: 'policies/fees', context: 'policy', status: 'skeleton' },
  { titleEN: 'Payment policy', titleDE: 'Zahlungsbedingungen', slug: 'policies/payment', context: 'policy', status: 'skeleton' },
  { titleEN: 'Accessibility', titleDE: 'Barrierefreiheit', slug: 'accessibility', context: 'policy', status: 'skeleton' },
  { titleEN: 'Terms & conditions', titleDE: 'AGB', slug: 'terms-conditions', context: 'policy', status: 'skeleton' },
  { titleEN: 'Privacy policy', titleDE: 'Datenschutz', slug: 'privacy-policy', context: 'policy', status: 'skeleton' },
  { titleEN: 'Imprint', titleDE: 'Impressum', slug: 'imprint', context: 'policy', status: 'skeleton' },
]

async function seed() {
  const payload = await getPayload({ config })

  for (const page of pages) {
    // Check if record already exists — do not create duplicates
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: page.slug } },
      limit: 1,
    })

    if (existing.totalDocs > 0) {
      console.log(`Skipping — already exists: ${page.slug}`)
      continue
    }

    await payload.create({
      collection: 'pages',
      data: {
        titleEN: page.titleEN,
        titleDE: page.titleDE,
        slug: page.slug,
        context: page.context,
        status: page.status,
      },
    })

    console.log(`Created: ${page.slug}`)
  }

  console.log('Seed complete.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
```

Run with:
```bash
npx tsx payload/seed/pages.ts
```

Or add to `package.json`:
```json
"scripts": {
  "seed:pages": "tsx payload/seed/pages.ts"
}
```

---

## Important — do not touch

- `app/page.tsx` — homepage, already built
- `app/here/page.tsx` — guest hub, already in progress
- Any existing component in `components/` — skeleton pages use inline styles only, no shared components needed

---

## Definition of done

- [ ] All route files in the table above exist and return a 200 response — no 404s
- [ ] Every skeleton page has `<main id="main-content">` with one `<h1>`
- [ ] No robots/noindex meta on any skeleton page
- [ ] Every skeleton page has `hreflang` alternates in metadata
- [ ] German route files exist and use German `<h1>` text
- [ ] `app/page.tsx` and `app/here/page.tsx` are untouched
- [ ] Payload `pages` collection has 27 records — one per page in the seed table
- [ ] No duplicate records — seed script checks before creating
- [ ] Slug format correct — no leading slash, `/` separator for nested (e.g. `here/art` not `/here/art`)
- [ ] `here` record has status `in-progress` — all others `skeleton`
- [ ] Seed script exits cleanly with `process.exit(0)`
- [ ] No console errors on any skeleton route
