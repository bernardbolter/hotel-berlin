import type { AmenityCardImage } from '@/components/here/AmenityCard'
import type { Amenity, Faq, Media } from '@/payload-types'
import { mediaAlt, mediaUrl } from '@/lib/spotlight/media'
import { getPayloadClient } from '@/lib/payload/client'

import {
  amenityHoursMode,
  formatAmenityHours,
  formatAmenityNotice,
  type AmenityHoursMode,
} from './formatHours'
import { resolveLucideIcon } from './lucide'
import type { AmenityHoursLabels } from './types'

export type AmenitySpecCopy = {
  specWhen: string
  specPrice: string
  specWhat: string
  locationTbc: string
  labels: AmenityHoursLabels
}

export type RelatedFaqLink = {
  slug: string
  question: string
  href: string
}

export type ResolvedAmenityCard = {
  key: string
  slug: string
  eyebrow: string
  title: string
  specs: { label: string; value: string }[]
  line: string | null
  notice: string | null
  summary: string | null
  subline?: string | null
  image?: AmenityCardImage | null
  icon: ReturnType<typeof resolveLucideIcon>
  href: string
  pageHref: string | null
  pending?: boolean
  access: string | null
  details: Amenity['details']
  hoursNote: string | null
  relatedFaqs: RelatedFaqLink[]
  hoursMode: AmenityHoursMode
}

const HUB_MAX = 6

function photoFromMedia(
  image: number | Media | null | undefined,
  fallbackAlt: string,
): AmenityCardImage | null {
  const src = mediaUrl(image)
  if (!src || typeof image !== 'object' || !image) return null
  return {
    src,
    alt: mediaAlt(image, fallbackAlt),
    width: image.width ?? undefined,
    height: image.height ?? undefined,
  }
}

function faqHref(faq: Faq): string {
  return faq.context === 'guest' ? `/here/faq#${faq.slug}` : `/faq#${faq.slug}`
}

function relatedFaqLinks(doc: Amenity): RelatedFaqLink[] {
  const rows = doc.relatedFaqs ?? []
  const out: RelatedFaqLink[] = []
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue
    const slug = row.slug?.trim()
    const question = row.question?.trim()
    if (!slug || !question) continue
    out.push({ slug, question, href: faqHref(row) })
  }
  return out
}

function hoursInput(doc: Amenity, locale: 'de' | 'en', copy: AmenitySpecCopy) {
  return {
    openingHours: doc.openingHours,
    specialHours: doc.specialHours,
    hoursOverride: doc.hoursOverride,
    locale,
    labels: copy.labels,
  }
}

export function amenityToCard(doc: Amenity, locale: 'de' | 'en', copy: AmenitySpecCopy): ResolvedAmenityCard {
  const when = formatAmenityHours(hoursInput(doc, locale, copy))
  const notice = formatAmenityNotice(hoursInput(doc, locale, copy))
  const summary = doc.summary?.trim() || doc.subline?.trim() || null
  const line = [when, doc.price?.trim()].filter(Boolean).join(' · ') || summary
  const specs = [
    when ? { label: copy.specWhen, value: when } : null,
    doc.price?.trim() ? { label: copy.specPrice, value: doc.price.trim() } : null,
    doc.what?.trim() ? { label: copy.specWhat, value: doc.what.trim() } : null,
  ].filter((row): row is { label: string; value: string } => row != null)

  const weeklyNote =
    doc.openingHours
      ?.map((row) => row.note?.trim())
      .find((note) => Boolean(note)) ?? null

  return {
    key: doc.slug,
    slug: doc.slug,
    eyebrow: doc.location?.trim() || copy.locationTbc,
    title: doc.title,
    specs,
    line,
    notice: notice && notice !== line ? notice : null,
    summary,
    subline: summary,
    image: photoFromMedia(doc.image, doc.title),
    icon: resolveLucideIcon(doc.lucideIcon),
    href: `/amenities#${doc.slug}`,
    pageHref: doc.href?.trim() || null,
    pending: Boolean(doc.pending),
    access: doc.access?.trim() || null,
    details: doc.details,
    hoursNote: weeklyNote,
    relatedFaqs: relatedFaqLinks(doc),
    hoursMode: amenityHoursMode(hoursInput(doc, locale, copy)),
  }
}

export async function getPublishedAmenities(locale: string): Promise<Amenity[]> {
  const loc = locale === 'de' ? 'de' : 'en'
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'amenities',
    locale: loc,
    fallbackLocale: 'en',
    depth: 1,
    limit: 100,
    sort: '_order',
    where: { hidden: { not_equals: true } },
  })
  return docs
}

export async function getAmenities(args: {
  context: 'hub'
  locale: string
}): Promise<Amenity[]>
export async function getAmenities(args: {
  context: 'list'
  locale: string
}): Promise<{ facilities: Amenity[]; services: Amenity[] }>
export async function getAmenities(args: {
  context: 'hub' | 'list'
  locale: string
}): Promise<Amenity[] | { facilities: Amenity[]; services: Amenity[] }> {
  const docs = await getPublishedAmenities(args.locale)
  if (args.context === 'hub') {
    return docs
      .filter((doc) => doc.kind !== 'service' && doc.showInHub !== false)
      .slice(0, HUB_MAX)
  }
  return {
    facilities: docs.filter((doc) => doc.kind !== 'service'),
    services: docs.filter((doc) => doc.kind === 'service'),
  }
}

export async function getSchemaAmenities(locale: string): Promise<Amenity[]> {
  const loc = locale === 'de' ? 'de' : 'en'
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'amenities',
    locale: loc,
    fallbackLocale: 'en',
    depth: 1,
    limit: 100,
    sort: '_order',
    where: {
      and: [
        { hidden: { not_equals: true } },
        { pending: { not_equals: true } },
        { includeInSchema: { equals: true } },
      ],
    },
  })
  return docs
}
