# Hotel Berlin — next-intl Implementation Brief
*For Cursor / Claude Opus*

---

## Overview

Set up `next-intl` with `localePrefix: 'always'` and German (`de`) as the default locale. All routes are prefixed — `/de/`, `/en/` — no bare `/` root. German is primary, matching the existing site's URL authority.

**Locales:** `['de', 'en']`  
**Default locale:** `'de'`  
**Locale detection:** off — no `Accept-Language` redirect  
**Prefix strategy:** `always` — every route has a locale prefix

---

## Package

```bash
npm install next-intl
```

---

## File Structure to Create

```
├── messages/
│   ├── de.json
│   └── en.json
├── i18n/
│   ├── routing.ts
│   └── request.ts
├── middleware.ts              ← project root
└── app/
    └── [locale]/
        ├── layout.tsx         ← replaces app/layout.tsx
        └── page.tsx           ← replaces app/page.tsx
```

---

## Step 1 — `i18n/routing.ts`

```ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['de', 'en'],
  defaultLocale: 'de',
  localePrefix: 'always',
});
```

---

## Step 2 — `i18n/request.ts`

```ts
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as 'de' | 'en')) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

---

## Step 3 — `middleware.ts` (project root)

```ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match all pathnames except static files and internals
    '/((?!_next|_vercel|.*\\..*).*)',
  ],
};
```

---

## Step 4 — Move app directory to `app/[locale]/`

Rename `app/layout.tsx` → `app/[locale]/layout.tsx`  
Rename `app/page.tsx` → `app/[locale]/page.tsx`

Update `app/[locale]/layout.tsx`:

```tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'de' | 'en')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
```

---

## Step 5 — Root redirect `app/page.tsx`

Since `localePrefix: 'always'`, a bare `/` request needs to redirect to `/de/`.

```tsx
// app/page.tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/de');
}
```

---

## Step 6 — Seed message files

### `messages/de.json`

```json
{
  "nav": {
    "rooms": "Zimmer & Suiten",
    "restaurant": "Lütze",
    "meetings": "Meetings & Events",
    "about": "Über uns",
    "whatsOn": "Was läuft",
    "events": "Events",
    "art": "Kunst",
    "dining": "Restaurant",
    "explore": "Entdecken",
    "faq": "FAQ",
    "theHotel": "Zum Hotel",
    "bookNow": "Jetzt buchen",
    "langToggle": "EN"
  },
  "home": {
    "heroHeadline": "Lass deine Berlin-Geschichte beginnen.",
    "heroSubline": "Hotel Berlin, Berlin — seit 1958."
  },
  "here": {
    "heroHeadline": "Was heute los ist.",
    "heroSubline": "Dein Aufenthalt, deine Stadt."
  },
  "rooms": {
    "sectionLabel": "Schlafen & Entspannen",
    "intro": "Ob erster Berlin-Besuch oder Stammgast — ruhige Zimmer und Suiten mit einem Gefühl wie zu Hause.",
    "discoverCta": "Alle Zimmer entdecken"
  },
  "meetings": {
    "sectionLabel": "Tagen & Arbeiten",
    "intro": "Über 4.000 m² flexible Konferenz- und Meetingflächen, modernste Technik, und ein Team das alles reibungslos laufen lässt.",
    "cta": "Alle Meetingräume"
  },
  "arts": {
    "sectionLabel": "Kunst & Kultur"
  },
  "lutze": {
    "sectionLabel": "Lütze",
    "tagline": "Der Ort zum Essen, Spielen und Verweilen.",
    "cta": "Lütze entdecken",
    "reserveCta": "Tisch reservieren"
  },
  "footer": {
    "address": "Lützowplatz 17, 10785 Berlin",
    "phone": "+49 30 260050",
    "email": "info@hotel-berlin.de"
  }
}
```

### `messages/en.json`

```json
{
  "nav": {
    "rooms": "Rooms & Suites",
    "restaurant": "Lütze",
    "meetings": "Meetings & Events",
    "about": "About",
    "whatsOn": "What's on",
    "events": "Events",
    "art": "Art",
    "dining": "Dining",
    "explore": "Explore",
    "faq": "FAQ",
    "theHotel": "The hotel",
    "bookNow": "Book now",
    "langToggle": "DE"
  },
  "home": {
    "heroHeadline": "Let's start your Berlin story.",
    "heroSubline": "Hotel Berlin, Berlin — since 1958."
  },
  "here": {
    "heroHeadline": "What's on today.",
    "heroSubline": "Your stay, your city."
  },
  "rooms": {
    "sectionLabel": "Sleep & Relax",
    "intro": "Whether it's your first time in Berlin or you're a seasoned traveller — thoughtful design details make every room a personal retreat.",
    "discoverCta": "Discover our rooms"
  },
  "meetings": {
    "sectionLabel": "Meet & Work",
    "intro": "Over 4,000m² of flexible conference and meeting space, cutting-edge event technology, and a dedicated team to ensure everything runs smoothly.",
    "cta": "All meeting rooms"
  },
  "arts": {
    "sectionLabel": "Arts & Culture"
  },
  "lutze": {
    "sectionLabel": "Lütze",
    "tagline": "The place to eat, play, and hang all day.",
    "cta": "Visit Lütze",
    "reserveCta": "Reserve a table"
  },
  "footer": {
    "address": "Lützowplatz 17, 10785 Berlin",
    "phone": "+49 30 260050",
    "email": "info@hotel-berlin.de"
  }
}
```

---

## Step 7 — Usage in components

### Server components
```tsx
import { useTranslations } from 'next-intl';

export default function Nav() {
  const t = useTranslations('nav');
  return <a href="#">{t('rooms')}</a>;
}
```

### Client components
```tsx
'use client';
import { useTranslations } from 'next-intl';

export default function BookingButton() {
  const t = useTranslations('nav');
  return <button>{t('bookNow')}</button>;
}
```

### Language toggle link
```tsx
import { Link } from '@/i18n/routing';

// Link component from next-intl routing automatically handles locale prefix
<Link href="/" locale="en">EN</Link>
<Link href="/" locale="de">DE</Link>
```

Export a typed `Link`, `useRouter`, `usePathname`, and `redirect` from `i18n/routing.ts`:

```ts
// Add to i18n/routing.ts
import { createLocalizedPathnamesNavigation } from 'next-intl/navigation';

export const { Link, redirect, usePathname, useRouter } =
  createLocalizedPathnamesNavigation(routing);
```

---

## Step 8 — hreflang in metadata

In each page, export metadata with alternates:

```tsx
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });

  return {
    title: 'Hotel Berlin, Berlin',
    description: t('heroSubline'),
    alternates: {
      canonical: `https://hotel-berlin.de/${locale}`,
      languages: {
        'de': 'https://hotel-berlin.de/de',
        'en': 'https://hotel-berlin.de/en',
        'x-default': 'https://hotel-berlin.de/de',
      },
    },
  };
}
```

---

## Step 9 — `next.config.ts` update

```ts
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig = {
  images: {
    remotePatterns: [
      // Stub R2 bucket for future — not active yet
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
```

---

## Adding a third language later

1. Add locale to `routing.ts`: `locales: ['de', 'en', 'fr']`
2. Add `messages/fr.json`
3. Add `fr` to `generateStaticParams()` — already handled by `routing.locales.map()`
4. Add hreflang alternate in metadata
5. No other changes needed

---

## Definition of done

- [ ] `npm run dev` starts without errors
- [ ] `/de` resolves and renders with `<html lang="de">`
- [ ] `/en` resolves and renders with `<html lang="en">`
- [ ] Bare `/` redirects to `/de`
- [ ] `/xx` (unknown locale) returns 404
- [ ] `useTranslations('nav')` returns correct strings in both locales
- [ ] Language toggle switches locale and stays on equivalent page
- [ ] `hreflang` alternates present in `<head>` on all pages
- [ ] No console errors
