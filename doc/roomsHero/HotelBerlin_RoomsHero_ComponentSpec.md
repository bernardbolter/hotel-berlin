# Hotel Berlin, Berlin — RoomsHero Component Spec
*For Cursor / Claude Opus*
*Scope: Visual and behavioural updates to existing components only — no schema work*
*Companion docs: HotelBerlin_RoomsHero_BuildBrief.md · HotelBerlin_RoomsHero_Addendum.md*

---

## Context — what already exists

Cursor has already built the following. **Do not rewrite from scratch.** Apply the precise changes described in each section.

| File | Status | Action |
|---|---|---|
| `src/components/home/RoomsHero.tsx` | Built — structure correct, styling wrong | Update styling |
| `src/components/home/RoomSlider.tsx` | Built — missing autoplay, chevrons, coral | Update |
| `src/components/primitives/SlideDotsNav.tsx` | Built — dash style, amber/teal colours | Add coral variant prop |
| `src/components/sections/RoomsSection.tsx` | Old static JSON version — superseded | Delete + remove from page.tsx |
| `src/components/home/AmenityIcon.tsx` | Complete | No changes |
| `src/components/primitives/SectionHeading.tsx` | Complete | No changes to structure |

---

## Design reference

```
[section bg: #FBFBFB]

  Sleep & Relax          ← SectionHeading label only (no title)
                           coral #F95D62, uppercase, Archivo Narrow

  ┌─ coral border box (1px solid #F95D62) ──────────────────────┐
  │  bg: rgba(208,146,70,0.05) across entire inner area          │
  │                                                              │
  │  [photo — left 55%]     │  [info box — right 45%]           │
  │  KenBurnsSlider         │                                    │
  │  + tint overlay         │  Room to spread out  ← byline     │
  │                         │  [body copy]                       │
  │                         │  ── coral rule ──                  │
  │                         │  [Room name]  ← coral, rotates     │
  │                         │  [Size]  [Sleeps]  ← stat row      │
  │                         │  [Bed]             ← list item     │
  │                         │  [Bathroom]        ← list item     │
  │                         │  ── coral rule ──                  │
  │                         │  From    173,40 €                  │
  │                                                              │
  │  [← ─ ─ ─ ─ ─ ─ ─ ─ ─ →]  ← dots + chevrons, coral        │
  │  Discover our rooms →       ← coral CTA                     │
  └─────────────────────────────────────────────────────────────┘
```

---

## 1 — `RoomsHero.tsx` — replace JSX, keep data fetching

```tsx
import { getLocale, getTranslations } from 'next-intl/server'

import { SectionHeading } from '@/components/primitives/SectionHeading'
import { getRoomsForHero } from '@/lib/payload/rooms'
import { mapRoomToHeroItem } from '@/lib/rooms/roomHero'

import { RoomSlider } from './RoomSlider'

export async function RoomsHero() {
  const t = await getTranslations('rooms')
  const locale = (await getLocale()) as 'de' | 'en'
  const rooms = await getRoomsForHero(locale)

  if (rooms.length === 0) return null

  const items = rooms.map((room) => mapRoomToHeroItem(room, locale))

  return (
    <section aria-labelledby="rooms-heading" className="bg-hbb-page px-section-sm py-section-y md:px-section-x">
      <SectionHeading
        id="rooms-heading"
        label={t('label')}
        className="mb-4"
      />
      <div
        className="border border-hbb-coral"
        style={{ backgroundColor: 'rgba(208, 146, 70, 0.05)' }}
      >
        <RoomSlider rooms={items} />
      </div>
    </section>
  )
}
```

**Notes:**
- `SectionHeading` is called without a `title` prop — see Section 7 for the guard needed.
- `border-hbb-coral` — add to `tailwind.config.ts` if not present (see Section 5).
- The `rgba(208,146,70,0.05)` tint is on the border box div, covering both zones uniformly.

---

## 2 — `RoomSlider.tsx` — full replacement

```tsx
'use client'

import {
  ArrowRight,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  Ruler,
  ShowerHead,
  Users,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useRef, useState } from 'react'

import { KenBurnsSlider } from '@/components/primitives/KenBurnsSlider'
import { SlideDotsNav } from '@/components/primitives/SlideDotsNav'
import { Link } from '@/i18n/routing'
import type { RoomHeroItem } from '@/lib/rooms/roomHero'

type Props = {
  rooms: RoomHeroItem[]
  autoplayInterval?: number
}

const BATHROOM_LABELS: Record<string, { en: string; de: string }> = {
  'shower':       { en: 'Shower',        de: 'Dusche' },
  'rain-shower':  { en: 'Rain shower',   de: 'Regendusche' },
  'bath-shower':  { en: 'Bath & shower', de: 'Bad & Dusche' },
  'spa-bathroom': { en: 'Spa bathroom',  de: 'Spa-Bad' },
}

export function RoomSlider({ rooms, autoplayInterval = 5000 }: Props) {
  const t = useTranslations('rooms')
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  const activeRoom = rooms[current]

  const advance = () => setCurrent((prev) => (prev + 1) % rooms.length)
  const prev = () => setCurrent((prev) => (prev - 1 + rooms.length) % rooms.length)

  useEffect(() => {
    if (prefersReducedMotion || isPaused || rooms.length <= 1) return
    timerRef.current = setInterval(advance, autoplayInterval)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [isPaused, prefersReducedMotion, rooms.length, autoplayInterval])

  const goTo = (index: number) => {
    if (timerRef.current) clearInterval(timerRef.current)
    setCurrent(index)
    if (!prefersReducedMotion && !isPaused) {
      timerRef.current = setInterval(advance, autoplayInterval)
    }
  }

  const roomImages = useMemo(() => activeRoom?.images ?? [], [activeRoom])

  if (!activeRoom || rooms.length === 0) return null

  const locale = activeRoom.locale ?? 'en'
  const bathroomDisplay = activeRoom.bathroomLabel
    ? (BATHROOM_LABELS[activeRoom.bathroomLabel]?.[locale] ?? activeRoom.bathroomLabel)
    : null

  return (
    <div onPointerEnter={() => setIsPaused(true)} onPointerLeave={() => setIsPaused(false)}>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr]">

        {/* Photo zone */}
        <div className="relative min-h-[280px] md:min-h-[460px]">
          <KenBurnsSlider
            key={activeRoom.id}
            images={roomImages}
            aria-label={t('galleryAria')}
            interval={4500}
            showDots={false}
            className="h-full min-h-[280px] md:min-h-[460px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ backgroundColor: 'rgba(208, 146, 70, 0.05)' }}
          />
        </div>

        {/* Info box */}
        <div className="flex flex-col border-t border-hbb-coral/30 md:border-l md:border-t-0">

          {/* Static editorial */}
          <div className="px-7 pb-5 pt-7">
            <p className="mb-3 font-serif text-xl font-normal leading-snug text-hbb-black">
              {t('byline')}
            </p>
            <p className="font-serif text-sm leading-relaxed text-gray-500">
              {t('body')}
            </p>
          </div>

          <hr className="mx-7 border-hbb-coral/25" />

          {/* Rotating room data */}
          <div
            className="relative flex-1 px-7 pb-5 pt-5"
            aria-live="polite"
            aria-atomic="true"
          >
            {rooms.map((room, i) => (
              <div
                key={room.id}
                aria-hidden={i !== current}
                className={[
                  'transition-opacity',
                  prefersReducedMotion ? '' : 'duration-200',
                  i === current ? 'opacity-100' : 'absolute inset-0 px-7 pt-5 opacity-0',
                ].join(' ')}
              >
                <h3 className="mb-4 font-ui text-lg font-medium leading-tight text-hbb-coral">
                  {room.name}
                </h3>

                {/* Stat row */}
                <div className="mb-4 flex">
                  <div className="flex flex-1 flex-col gap-1">
                    <span className="font-ui text-[10px] uppercase tracking-widest text-gray-400">
                      {t('specSize')}
                    </span>
                    <span className="flex items-center gap-1.5 font-ui text-base font-medium text-hbb-black">
                      <Ruler size={14} aria-hidden="true" className="text-hbb-coral" />
                      {room.sizeLabel ?? '–'}
                    </span>
                  </div>
                  <div className="mx-4 w-px self-stretch bg-hbb-coral/20" />
                  <div className="flex flex-1 flex-col gap-1">
                    <span className="font-ui text-[10px] uppercase tracking-widest text-gray-400">
                      {t('specSleeps')}
                    </span>
                    <span className="flex items-center gap-1.5 font-ui text-base font-medium text-hbb-black">
                      <Users size={14} aria-hidden="true" className="text-hbb-coral" />
                      {room.sleepsLabel ?? '–'}
                    </span>
                  </div>
                </div>

                {/* Spec list */}
                <ul role="list" className="flex flex-col gap-2.5">
                  <li className="flex items-center gap-2.5 font-ui text-sm text-gray-500">
                    <BedDouble size={14} aria-hidden="true" className="shrink-0 text-hbb-coral" />
                    {room.bedLabel ?? '–'}
                  </li>
                  {bathroomDisplay && (
                    <li className="flex items-center gap-2.5 font-ui text-sm text-gray-500">
                      <ShowerHead size={14} aria-hidden="true" className="shrink-0 text-hbb-coral" />
                      {bathroomDisplay}
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>

          <hr className="mx-7 border-hbb-coral/25" />

          {/* Price row */}
          <div className="flex items-baseline justify-between px-7 py-4">
            <span className="font-ui text-[11px] uppercase tracking-wider text-gray-400">
              {t('from')}
            </span>
            <span className="font-ui text-base font-medium text-hbb-black">
              <span className="sr-only">{t('priceScreenReader')} </span>
              {activeRoom.priceLabel}
            </span>
          </div>

        </div>
      </div>

      {/* Nav + CTA — inside border box, below grid */}
      <div className="flex flex-col items-start gap-4 px-7 pb-6 pt-5">

        {/* sr-only live announcement */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {t('nowShowing', { name: activeRoom.name, price: activeRoom.priceLabel })}
        </div>

        {/* Dots + chevrons */}
        <SlideDotsNav
          count={rooms.length}
          current={current}
          labels={rooms.map((r) => r.name)}
          onSelect={goTo}
          onPrev={prev}
          onNext={advance}
          variant="coral"
          showChevrons
          ariaLabel={t('dotNavAria')}
          prevLabel={t('prevRoom')}
          nextLabel={t('nextRoom')}
        />

        {/* CTA */}
        <Link
          href="/rooms"
          className="inline-flex items-center gap-1.5 border-b border-hbb-coral pb-px font-ui text-xs uppercase tracking-widest text-hbb-coral transition-opacity hover:opacity-70"
        >
          {t('cta')}
          <ArrowRight aria-hidden="true" size={13} />
          <span className="sr-only"> {t('ctaSrSuffix')}</span>
        </Link>

      </div>
    </div>
  )
}
```

---

## 3 — `RoomHeroItem` type + `mapRoomToHeroItem` additions

Locate `src/lib/rooms/roomHero.ts`. Add to the `RoomHeroItem` interface:

```typescript
bathroomLabel: string | null
sleepsLabel: string
locale: 'en' | 'de'
```

Add to `mapRoomToHeroItem()`:

```typescript
bathroomLabel: room.bathroomLabel ?? null,
sleepsLabel: String(room.occupancy?.maxTotal ?? room.occupancy?.maxAdults ?? '–'),
locale,
```

---

## 4 — i18n translation keys

Add to `src/i18n/messages/en.json` under `rooms`:

```json
"label": "Sleep & Relax",
"byline": "Room to spread out",
"body": "701 rooms. Quiet ones, big ones, ones with a story behind them. Whatever you need to arrive and actually rest — it's here.",
"specSize": "Size",
"specSleeps": "Sleeps",
"from": "From",
"priceScreenReader": "Price from",
"cta": "Discover our rooms",
"ctaSrSuffix": "at Hotel Berlin, Berlin",
"ctaAvailability": "Check availability",
"galleryAria": "Room photography",
"dotNavAria": "Room types",
"prevRoom": "Previous room",
"nextRoom": "Next room",
"nowShowing": "Now showing: {name}, from {price}"
```

Add to `src/i18n/messages/de.json` under `rooms`:

```json
"label": "Übernachten & Relaxen",
"byline": "Zimmer zum Ausstrecken",
"body": "701 Zimmer. Ruhige, große, welche mit einer Geschichte dahinter. Was auch immer du brauchst, um anzukommen und wirklich zu entspannen — es ist hier.",
"specSize": "Größe",
"specSleeps": "Schlafplätze",
"from": "Ab",
"priceScreenReader": "Preis ab",
"cta": "Alle Zimmer entdecken",
"ctaSrSuffix": "im Hotel Berlin, Berlin",
"ctaAvailability": "Verfügbarkeit prüfen",
"galleryAria": "Zimmerfotos",
"dotNavAria": "Zimmerkategorien",
"prevRoom": "Vorheriges Zimmer",
"nextRoom": "Nächstes Zimmer",
"nowShowing": "Jetzt angezeigt: {name}, ab {price}"
```

Merge with any existing keys — do not overwrite keys already present.

---

## 5 — `SlideDotsNav.tsx` — full replacement

Adds `variant="coral"` and `showChevrons` props. Default variant (dash/amber/teal) is unchanged.

```tsx
'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface SlideDotsNavProps {
  count: number
  current: number
  labels: string[]
  onSelect: (index: number) => void
  onPrev?: () => void
  onNext?: () => void
  className?: string
  ariaLabel?: string
  prevLabel?: string
  nextLabel?: string
  variant?: 'default' | 'coral'
  showChevrons?: boolean
}

export function SlideDotsNav({
  count,
  current,
  labels,
  onSelect,
  onPrev,
  onNext,
  className = '',
  ariaLabel = 'Navigation',
  prevLabel = 'Previous',
  nextLabel = 'Next',
  variant = 'default',
  showChevrons = false,
}: SlideDotsNavProps) {

  if (variant === 'coral') {
    return (
      <nav aria-label={ariaLabel} className={`flex items-center gap-2 ${className}`}>
        {showChevrons && onPrev && (
          <button
            type="button"
            aria-label={prevLabel}
            onClick={onPrev}
            className="text-gray-400 transition-colors hover:text-hbb-coral focus-visible:outline focus-visible:outline-2 focus-visible:outline-hbb-coral"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
        )}
        <div role="tablist" aria-label={ariaLabel} className="flex items-center gap-1.5">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={labels[i] ?? i}
              type="button"
              role="tab"
              aria-selected={i === current}
              aria-label={labels[i]}
              onClick={() => onSelect(i)}
              className={[
                'rounded-full transition-all duration-300',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-hbb-coral',
                i === current
                  ? 'h-[7px] w-[7px] bg-hbb-coral'
                  : 'h-[5px] w-[5px] bg-gray-300 hover:bg-gray-400',
              ].join(' ')}
            />
          ))}
        </div>
        {showChevrons && onNext && (
          <button
            type="button"
            aria-label={nextLabel}
            onClick={onNext}
            className="text-gray-400 transition-colors hover:text-hbb-coral focus-visible:outline focus-visible:outline-2 focus-visible:outline-hbb-coral"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        )}
      </nav>
    )
  }

  // Default variant — unchanged
  return (
    <div role="tablist" aria-label={ariaLabel} className={`flex gap-1.5 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={labels[i] ?? i}
          type="button"
          role="tab"
          aria-selected={i === current}
          aria-label={labels[i]}
          onClick={() => onSelect(i)}
          className={`h-[2px] rounded-none transition-all duration-300 ${
            i === current ? 'w-8 bg-hbb-amber' : 'w-[18px] bg-hbb-teal/20'
          }`}
        />
      ))}
    </div>
  )
}
```

---

## 6 — `SectionHeading.tsx` — make title optional

Add guard so an empty or omitted `title` doesn't render an empty `<h2>`:

```tsx
// Change interface:
title?: string  // was required

// Wrap the HeadingTag render:
{title && (
  <HeadingTag id={id} className={`font-serif text-serif-lg font-medium ${isInverse ? 'text-white' : 'text-hbb-black'}`}>
    <span className={`heading-underline ${isInverse ? 'heading-underline--inverse' : ''}`}>
      {title}
    </span>
  </HeadingTag>
)}
```

---

## 7 — `tailwind.config.ts` — add `hbb-coral`

Check existing theme colours. Add only if missing:

```typescript
'hbb-coral': '#F95D62',
```

---

## 8 — Retire `RoomsSection.tsx`

1. Delete `src/components/sections/RoomsSection.tsx`
2. In `src/app/[locale]/page.tsx` remove any `RoomsSection` import and usage
3. Confirm `<RoomsHero />` is present in `page.tsx` — add if missing:
   ```tsx
   import { RoomsHero } from '@/components/home/RoomsHero'
   // place after <HomeHero /> in the page component tree
   ```

---

## 9 — Accessibility checklist

- [ ] `<section>` has `aria-labelledby="rooms-heading"`
- [ ] `SectionHeading` with no `title` renders only the label `<p>` — no empty `<h2>`
- [ ] Room name is `<h3>` — correct level under section label
- [ ] All Lucide icons have `aria-hidden="true"`
- [ ] Dots: `<button role="tab" aria-selected>` inside `role="tablist"`
- [ ] Chevrons: `aria-label` from i18n keys `prevRoom` / `nextRoom`
- [ ] `aria-live="polite" aria-atomic="true"` sr-only div announces room changes
- [ ] `prefers-reduced-motion`: autoplay off, `duration-200` class removed from fade
- [ ] Autoplay pauses on `pointerenter`, resumes on `pointerleave`
- [ ] Timer resets on manual navigation — no double-speed side effects
- [ ] CTA has sr-only suffix via `ctaSrSuffix` i18n key
- [ ] Price row has sr-only `priceScreenReader` prefix
- [ ] Null `sizeLabel` renders `–` not empty
- [ ] All interactive elements keyboard reachable (Tab, Enter, Space)
- [ ] Focus rings visible — do not suppress `outline`
- [ ] Body/spec text is `text-gray-500` — coral used only for labels, headings, icons, CTA

---

## Files modified — summary

| File | Action |
|---|---|
| `src/components/home/RoomsHero.tsx` | Replace JSX — keep data fetching |
| `src/components/home/RoomSlider.tsx` | Full replacement |
| `src/components/primitives/SlideDotsNav.tsx` | Full replacement — coral variant added |
| `src/components/primitives/SectionHeading.tsx` | Make `title` optional + guard |
| `src/lib/rooms/roomHero.ts` | Add `bathroomLabel`, `sleepsLabel`, `locale` |
| `src/i18n/messages/en.json` | Merge rooms keys |
| `src/i18n/messages/de.json` | Merge rooms keys |
| `tailwind.config.ts` | Add `hbb-coral` if missing |
| `src/components/sections/RoomsSection.tsx` | Delete |
| `src/app/[locale]/page.tsx` | Remove RoomsSection, confirm RoomsHero present |

---

*Hotel Berlin, Berlin — RoomsHero Component Spec · June 2026*
*Companion: HotelBerlin_RoomsHero_BuildBrief.md · HotelBerlin_RoomsHero_Addendum.md*
