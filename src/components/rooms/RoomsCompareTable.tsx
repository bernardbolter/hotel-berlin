'use client'

import { useState, type ReactNode } from 'react'
import {
  Accessibility,
  Check,
  Flame,
  Flower2,
  LayoutPanelLeft,
  X,
} from 'lucide-react'

import { Link } from '@/i18n/routing'
import { getBathroomLabel } from '@/lib/rooms/bathroomLabels'

export type RoomsCompareRow = {
  slug: string
  name: string
  floorSizeM2: number | null
  bedLabel: string
  occupancyMax: number | null
  bathroomLabel: string | null
  fromPriceLabel: string
  hasBalcony: boolean
  hasSauna: boolean
  hasSeparateLiving: boolean
  isAccessible: boolean
}

type Props = {
  rooms: RoomsCompareRow[]
  locale: 'de' | 'en'
  labels: {
    toggleOpen: string
    toggleClose: string
    room: string
    size: string
    bed: string
    occupancy: string
    bathroom: string
    price: string
    balcony: string
    sauna: string
    separateLiving: string
    accessible: string
  }
  className?: string
}

function BoolCell({ value, label }: { value: boolean; label: string }) {
  return (
    <span
      title={label}
      className="inline-flex"
      aria-label={value ? label : undefined}
    >
      {value ? (
        <Check size={14} className="text-hbb-rooms-highlight" aria-hidden="true" />
      ) : (
        <X size={14} className="text-gray-300" aria-hidden="true" />
      )}
    </span>
  )
}

function FeatureHeader({ label, children }: { label: string; children: ReactNode }) {
  return (
    <th scope="col" className="group relative px-1 py-3 text-center font-medium sm:px-2">
      <span className="inline-flex cursor-help" title={label} aria-label={label}>
        {children}
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 -translate-x-1/2 whitespace-nowrap bg-hbb-black px-2 py-1 font-ui text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {label}
      </span>
    </th>
  )
}

function FeatureIcons({
  room,
  labels,
}: {
  room: RoomsCompareRow
  labels: Props['labels']
}) {
  return (
    <ul className="flex flex-wrap items-center gap-x-3 gap-y-1" aria-label="Features">
      <li className="inline-flex items-center gap-1">
        <BoolCell value={room.hasBalcony} label={labels.balcony} />
        <span className="font-ui text-[11px] text-gray-500 md:sr-only">{labels.balcony}</span>
      </li>
      <li className="inline-flex items-center gap-1">
        <BoolCell value={room.hasSauna} label={labels.sauna} />
        <span className="font-ui text-[11px] text-gray-500 md:sr-only">{labels.sauna}</span>
      </li>
      <li className="inline-flex items-center gap-1">
        <BoolCell value={room.hasSeparateLiving} label={labels.separateLiving} />
        <span className="font-ui text-[11px] text-gray-500 md:sr-only">
          {labels.separateLiving}
        </span>
      </li>
      <li className="inline-flex items-center gap-1">
        <BoolCell value={room.isAccessible} label={labels.accessible} />
        <span className="font-ui text-[11px] text-gray-500 md:sr-only">{labels.accessible}</span>
      </li>
    </ul>
  )
}

export function RoomsCompareTable({ rooms, locale, labels, className = '' }: Props) {
  const [open, setOpen] = useState(false)

  if (rooms.length === 0) return null

  return (
    <section className={className}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="font-ui text-[clamp(1.15rem,1.5vw,1.35rem)] font-semibold text-hbb-black transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hbb-rooms-highlight"
      >
        {open ? labels.toggleClose : labels.toggleOpen}
      </button>

      {open ? (
        <>
          {/* Narrow: stacked cards — no horizontal scroll */}
          <ul className="mt-6 flex flex-col gap-4 md:hidden" role="list">
            {rooms.map((room) => (
              <li
                key={room.slug}
                className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0"
              >
                <Link
                  href={{ pathname: '/rooms/[slug]', params: { slug: room.slug } }}
                  className="font-ui text-ui-md font-medium text-hbb-black hover:underline"
                >
                  {room.name}
                </Link>

                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 font-ui text-ui-xs text-gray-600">
                  <div>
                    <dt className="text-gray-400">{labels.size}</dt>
                    <dd className="tabular-nums text-hbb-black">
                      {room.floorSizeM2 != null ? `${room.floorSizeM2} m²` : '–'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-400">{labels.occupancy}</dt>
                    <dd className="tabular-nums text-hbb-black">{room.occupancyMax ?? '–'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-400">{labels.price}</dt>
                    <dd className="tabular-nums text-hbb-black">{room.fromPriceLabel}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-400">{labels.bathroom}</dt>
                    <dd className="text-hbb-black">
                      {getBathroomLabel(room.bathroomLabel, locale) || '–'}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-gray-400">{labels.bed}</dt>
                    <dd className="text-hbb-black">{room.bedLabel || '–'}</dd>
                  </div>
                </dl>

                <div className="mt-2.5">
                  <FeatureIcons room={room} labels={labels} />
                </div>
              </li>
            ))}
          </ul>

          {/* md+: fluid table that wraps instead of scrolling */}
          <div className="mt-6 hidden md:block">
            <table className="w-full table-fixed border-collapse font-ui text-[11px] leading-snug text-hbb-black lg:text-ui-xs">
              <colgroup>
                <col className="w-[16%]" />
                <col className="w-[7%]" />
                <col className="w-[22%]" />
                <col className="w-[7%]" />
                <col className="w-[11%]" />
                <col className="w-[9%]" />
                <col className="w-[7%]" />
                <col className="w-[7%]" />
                <col className="w-[7%]" />
                <col className="w-[7%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th scope="col" className="py-3 pr-2 font-medium">
                    {labels.room}
                  </th>
                  <th scope="col" className="px-1 py-3 font-medium sm:px-2">
                    {labels.size}
                  </th>
                  <th scope="col" className="px-1 py-3 font-medium sm:px-2">
                    {labels.bed}
                  </th>
                  <th scope="col" className="px-1 py-3 font-medium sm:px-2">
                    {labels.occupancy}
                  </th>
                  <th scope="col" className="px-1 py-3 font-medium sm:px-2">
                    {labels.bathroom}
                  </th>
                  <th scope="col" className="px-1 py-3 font-medium sm:px-2">
                    {labels.price}
                  </th>
                  <FeatureHeader label={labels.balcony}>
                    <Flower2 size={14} aria-hidden="true" />
                  </FeatureHeader>
                  <FeatureHeader label={labels.sauna}>
                    <Flame size={14} aria-hidden="true" />
                  </FeatureHeader>
                  <FeatureHeader label={labels.separateLiving}>
                    <LayoutPanelLeft size={14} aria-hidden="true" />
                  </FeatureHeader>
                  <FeatureHeader label={labels.accessible}>
                    <Accessibility size={14} aria-hidden="true" />
                  </FeatureHeader>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.slug} className="border-b border-gray-100 align-top">
                    <th scope="row" className="py-3 pr-2 text-left font-medium">
                      <Link
                        href={{ pathname: '/rooms/[slug]', params: { slug: room.slug } }}
                        className="hover:underline"
                      >
                        {room.name}
                      </Link>
                    </th>
                    <td className="px-1 py-3 tabular-nums text-gray-600 sm:px-2">
                      {room.floorSizeM2 != null ? `${room.floorSizeM2} m²` : '–'}
                    </td>
                    <td className="break-words px-1 py-3 text-gray-600 sm:px-2">
                      {room.bedLabel || '–'}
                    </td>
                    <td className="px-1 py-3 tabular-nums text-gray-600 sm:px-2">
                      {room.occupancyMax ?? '–'}
                    </td>
                    <td className="break-words px-1 py-3 text-gray-600 sm:px-2">
                      {getBathroomLabel(room.bathroomLabel, locale) || '–'}
                    </td>
                    <td className="px-1 py-3 tabular-nums text-gray-600 sm:px-2">
                      {room.fromPriceLabel}
                    </td>
                    <td className="px-1 py-3 text-center">
                      <BoolCell value={room.hasBalcony} label={labels.balcony} />
                    </td>
                    <td className="px-1 py-3 text-center">
                      <BoolCell value={room.hasSauna} label={labels.sauna} />
                    </td>
                    <td className="px-1 py-3 text-center">
                      <BoolCell value={room.hasSeparateLiving} label={labels.separateLiving} />
                    </td>
                    <td className="px-1 py-3 text-center">
                      <BoolCell value={room.isAccessible} label={labels.accessible} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </section>
  )
}
