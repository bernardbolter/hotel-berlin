'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

import {
  RoomFinderCard,
  type MeetingRoomSummaryCard,
} from '@/components/meetings/RoomFinderCard'

type FilterKey = 'size' | 'layout' | 'guests' | 'features' | 'area'

type Filters = Record<FilterKey, string | null>

type Props = {
  rooms: MeetingRoomSummaryCard[]
  areaOptions: { value: string; label: string }[]
  sizeOptions: { value: string; label: string }[]
  layoutOptions: { value: string; label: string }[]
  guestOptions: { value: string; label: string }[]
  featureOptions: { value: string; label: string }[]
  sizeMetaLabel: string
  combinableLabel: string
  featureLabels: {
    daylight: string
    divisible: string
    screen: string
    projector: string
  }
}

function matchesSize(sizeM2: number, filter: string | null): boolean {
  if (!filter) return true
  if (filter === '0-50') return sizeM2 <= 50
  if (filter === '51-100') return sizeM2 >= 51 && sizeM2 <= 100
  if (filter === '101-200') return sizeM2 >= 101 && sizeM2 <= 200
  if (filter === '201+') return sizeM2 >= 201
  return true
}

function matchesGuests(
  room: MeetingRoomSummaryCard,
  filter: string | null,
): boolean {
  if (!filter) return true
  const max = room.maxGuests
  if (filter === '1-20') return max <= 20
  if (filter === '21-50') return max >= 21 && max <= 50
  if (filter === '51-100') return max >= 51 && max <= 100
  if (filter === '101+') return max >= 101
  return true
}

function matchesLayout(room: MeetingRoomSummaryCard, filter: string | null): boolean {
  if (!filter) return true
  return room.layoutKeys.includes(filter)
}

function matchesFeature(room: MeetingRoomSummaryCard, filter: string | null): boolean {
  if (!filter) return true
  if (filter === 'screen') return room.hasScreen
  if (filter === 'projector') return room.hasProjector
  if (filter === 'daylight') return room.hasDaylight
  if (filter === 'divisible') return room.isDivisible
  return true
}

function filtersFromParams(params: URLSearchParams): Filters {
  return {
    size: params.get('size'),
    layout: params.get('layout'),
    guests: params.get('guests'),
    features: params.get('features'),
    area: params.get('area'),
  }
}

/** Update the query string without triggering a Next.js navigation / RSC refresh. */
function replaceQuery(next: Filters) {
  const params = new URLSearchParams()
  for (const key of Object.keys(next) as FilterKey[]) {
    const value = next[key]
    if (value) params.set(key, value)
  }
  const qs = params.toString()
  const path = window.location.pathname
  window.history.replaceState(window.history.state, '', qs ? `${path}?${qs}` : path)
}

export function MeetingRoomFinder({
  rooms,
  areaOptions,
  sizeOptions,
  layoutOptions,
  guestOptions,
  featureOptions,
  sizeMetaLabel,
  combinableLabel,
  featureLabels,
}: Props) {
  const t = useTranslations('meetingsPage')
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<Filters>(() =>
    filtersFromParams(new URLSearchParams(searchParams.toString())),
  )

  useEffect(() => {
    function onPopState() {
      setFilters(filtersFromParams(new URLSearchParams(window.location.search)))
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const setFilter = useCallback((key: FilterKey, value: string | null) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value }
      replaceQuery(next)
      return next
    })
  }, [])

  const clearFilters = useCallback(() => {
    const next: Filters = {
      size: null,
      layout: null,
      guests: null,
      features: null,
      area: null,
    }
    setFilters(next)
    replaceQuery(next)
  }, [])

  const filtered = useMemo(() => {
    return rooms.filter((room) => {
      if (filters.area && room.areaValue !== filters.area) return false
      if (!matchesSize(room.sizeM2, filters.size)) return false
      if (!matchesGuests(room, filters.guests)) return false
      if (!matchesLayout(room, filters.layout)) return false
      if (!matchesFeature(room, filters.features)) return false
      return true
    })
  }, [rooms, filters])

  const chipClass = (active: boolean) =>
    `inline-flex min-h-10 items-center border px-3 font-ui text-ui-xs uppercase tracking-ui-label transition-colors ${
      active
        ? 'border-hbb-teal bg-hbb-teal/10 text-hbb-teal'
        : 'border-gray-200 bg-transparent text-gray-600 hover:border-gray-400 hover:text-hbb-black'
    }`

  function ChipGroup({
    ariaLabel,
    param,
    options,
    active,
  }: {
    ariaLabel: string
    param: FilterKey
    options: { value: string; label: string }[]
    active: string | null
  }) {
    return (
      <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={!active}
          className={chipClass(!active)}
          onClick={() => setFilter(param, null)}
        >
          {t('filterAll')}
        </button>
        {options.map((opt) => {
          const pressed = active === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={pressed}
              className={chipClass(pressed)}
              onClick={() => setFilter(param, pressed ? null : opt.value)}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <section aria-labelledby="room-finder-heading" className="py-section-y">
      <h2 id="room-finder-heading" className="font-ui text-2xl font-bold text-hbb-black">
        {t('finderHeading')}
      </h2>
      <p className="mt-2 max-w-2xl font-serif text-serif-md text-[var(--body-text)]">
        {t('finderIntro')}
      </p>

      <div className="mt-8 space-y-4">
        <ChipGroup
          ariaLabel={t('filterSize')}
          param="size"
          options={sizeOptions}
          active={filters.size}
        />
        <ChipGroup
          ariaLabel={t('filterLayout')}
          param="layout"
          options={layoutOptions}
          active={filters.layout}
        />
        <ChipGroup
          ariaLabel={t('filterGuests')}
          param="guests"
          options={guestOptions}
          active={filters.guests}
        />
        <ChipGroup
          ariaLabel={t('filterFeatures')}
          param="features"
          options={featureOptions}
          active={filters.features}
        />
      </div>

      <nav
        aria-label={t('areaNavAria')}
        className="mt-8 flex flex-wrap gap-2 border-b border-gray-200 pb-3"
      >
        <button
          type="button"
          aria-pressed={!filters.area}
          className={chipClass(!filters.area)}
          onClick={() => setFilter('area', null)}
        >
          {t('areaAll')}
        </button>
        {areaOptions.map((opt) => {
          const pressed = filters.area === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={pressed}
              className={chipClass(pressed)}
              onClick={() => setFilter('area', pressed ? null : opt.value)}
            >
              {opt.label}
            </button>
          )
        })}
      </nav>

      <p className="mt-4 font-ui text-ui-sm text-[var(--dim)]" aria-live="polite">
        {t('resultCount', { count: filtered.length })}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-[3px] border border-[var(--rule)] bg-[var(--bg-subtle)] p-8 text-center">
          <p className="font-ui text-base text-hbb-black">{t('emptyState')}</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 font-ui text-ui-sm font-bold text-hbb-teal underline-offset-4 hover:underline"
          >
            {t('clearFilters')}
          </button>
        </div>
      ) : (
        <ul role="list" className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((room) => (
            <li key={room.slug} className="h-full">
              <RoomFinderCard
                room={room}
                sizeLabel={sizeMetaLabel}
                combinableLabel={combinableLabel}
                featureLabels={featureLabels}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
