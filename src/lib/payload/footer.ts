import type { Hotel, Media, Page } from '@/payload-types'

import { getPayloadClient } from './client'
import { getFooterFallback } from './footerFallback'
import type {
  FooterAwardData,
  FooterBarLink,
  FooterColumnData,
  FooterLinkData,
  FooterPostalAddress,
  FooterViewModel,
} from './footerTypes'

type Locale = 'de' | 'en'

type RawLink = {
  id?: string | null
  label?: string | null
  linkType?: 'internal' | 'external' | null
  internalPage?: number | Page | null
  externalUrl?: string | null
  showArrow?: boolean | null
  dividerBefore?: boolean | null
}

type RawColumn = {
  id?: string | null
  icon?: string | null
  title?: string | null
  links?: RawLink[] | null
}

type RawBarLink = {
  id?: string | null
  visible?: boolean | null
  label?: string | null
  url?: string | null
}

function mediaUrl(image: number | Media | null | undefined): string | null {
  return typeof image === 'object' && image && 'url' in image && image.url ? image.url : null
}

function resolveBarLink(raw: RawBarLink, index: number, idPrefix: string): FooterBarLink | null {
  if (raw.visible === false) return null
  const label = raw.label?.trim()
  const href = raw.url?.trim()
  if (!label || !href) return null

  return {
    id: String(raw.id ?? `${idPrefix}-${index}`),
    label,
    href,
    external: href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:'),
  }
}

function resolveLink(raw: RawLink, index: number): FooterLinkData | null {
  const label = raw.label?.trim()
  if (!label) return null

  let href = ''
  let external = false

  if (raw.linkType === 'internal') {
    const page = raw.internalPage
    if (page && typeof page === 'object' && page.slug) {
      href = `/${page.slug.replace(/^\//, '')}`
    }
  } else if (raw.externalUrl?.trim()) {
    href = raw.externalUrl.trim()
    external =
      href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')
  }

  if (!href) return null

  return {
    id: String(raw.id ?? `${label}-${index}`),
    label,
    href,
    external,
    showArrow: Boolean(raw.showArrow),
    dividerBefore: Boolean(raw.dividerBefore),
  }
}

function resolveColumn(raw: RawColumn, index: number): FooterColumnData | null {
  const title = raw.title?.trim()
  if (!title) return null

  const links = (raw.links ?? [])
    .map((link, i) => resolveLink(link, i))
    .filter((link): link is FooterLinkData => link != null)

  if (links.length === 0) return null

  const defaultIcons = ['BedDouble', 'UtensilsCrossed', 'CircleHelp'] as const

  return {
    id: String(raw.id ?? `col-${index}`),
    title,
    icon: raw.icon?.trim() || defaultIcons[index] || null,
    links,
  }
}

function formatDisplayPhone(phone: string): string {
  // Keep CMS/Hotel E.164 when short; otherwise leave human-facing footer value alone
  if (/^\+\d{8,}$/.test(phone.replace(/\s/g, '')) && !phone.includes(' ')) {
    const digits = phone.replace(/[^\d+]/g, '')
    if (digits.startsWith('+4930')) {
      return `+49 30 ${digits.slice(5)}`
    }
  }
  return phone
}

function postalFromHotel(
  hotel: Hotel | null,
  locale: Locale,
  fallback: FooterPostalAddress,
): FooterPostalAddress {
  const address = hotel?.address
  if (!address?.streetAddress || !address.postalCode || !address.addressLocality) {
    return fallback
  }

  const countryRaw = address.addressCountry?.trim()
  const addressCountry =
    countryRaw === 'DE' || countryRaw === 'de'
      ? locale === 'de'
        ? 'Deutschland'
        : 'Germany'
      : countryRaw || fallback.addressCountry

  return {
    streetAddress: address.streetAddress.trim(),
    postalCode: address.postalCode.trim(),
    addressLocality: address.addressLocality.trim(),
    addressCountry,
  }
}

/** Footer global → view model, with static fallback when CMS is empty. */
export async function getFooterData(locale: Locale): Promise<FooterViewModel> {
  const fallback = getFooterFallback(locale)

  try {
    const payload = await getPayloadClient()
    const [doc, hotel] = await Promise.all([
      payload.findGlobal({
        slug: 'footer',
        locale,
        depth: 2,
      }),
      payload.findGlobal({
        slug: 'hotel',
        locale,
        depth: 0,
      }) as Promise<Hotel>,
    ])

    const columns = (doc.columns ?? [])
      .map((col, i) => resolveColumn(col as RawColumn, i))
      .filter((col): col is FooterColumnData => col != null)

    const alreadyLinks = (doc.alreadyHereColumn?.links ?? [])
      .map((link, i) => resolveLink(link as RawLink, i))
      .filter((link): link is FooterLinkData => link != null)

    const awards: FooterAwardData[] = (doc.awards ?? []).flatMap((award, i) => {
      if (award.visible === false) return []
      const altText = award.altText?.trim()
      if (!altText) return []
      return [
        {
          id: String(award.id ?? `award-${i}`),
          altText,
          imageUrl: mediaUrl(award.image as number | Media | null),
          linkUrl: award.linkUrl?.trim() || null,
        },
      ]
    })

    const addressLines = (doc.contact?.addressLines ?? [])
      .map((row) => row.line?.trim())
      .filter((line): line is string => Boolean(line))

    const transitJoined = (doc.contact?.transitLines ?? [])
      .map((row) => row.line?.trim())
      .filter((line): line is string => Boolean(line))
      .join(' · ')

    const partnerLinks = (doc.partnerLinks ?? [])
      .map((row, i) => resolveBarLink(row as RawBarLink, i, 'partner'))
      .filter((row): row is FooterBarLink => row != null)

    const legalLinks = (doc.legalLinks ?? [])
      .map((row, i) => resolveBarLink(row as RawBarLink, i, 'legal'))
      .filter((row): row is FooterBarLink => row != null)

    const hasCmsColumns = columns.length > 0
    const postalAddress = postalFromHotel(hotel, locale, fallback.contact.postalAddress)

    const phoneRaw =
      doc.contact?.phone?.trim() || hotel.telephone?.trim() || fallback.contact.phone
    const email =
      doc.contact?.email?.trim() || hotel.email?.trim() || fallback.contact.email

    const cmsHasAwards = Array.isArray(doc.awards) && doc.awards.length > 0
    const cmsHasPartners = Array.isArray(doc.partnerLinks) && doc.partnerLinks.length > 0
    const cmsHasLegal = Array.isArray(doc.legalLinks) && doc.legalLinks.length > 0

    return {
      bookDirectStrip: {
        visible: doc.bookDirectStrip?.visible ?? fallback.bookDirectStrip.visible,
        message: doc.bookDirectStrip?.message?.trim() || fallback.bookDirectStrip.message,
        ctaLabel: doc.bookDirectStrip?.ctaLabel?.trim() || fallback.bookDirectStrip.ctaLabel,
        ctaUrl: doc.bookDirectStrip?.ctaUrl?.trim() || fallback.bookDirectStrip.ctaUrl,
      },
      contact: {
        hotelName: hotel.name?.trim() || fallback.contact.hotelName,
        sinceYear: doc.contact?.sinceYear?.trim() || fallback.contact.sinceYear,
        postalAddress,
        addressLines: addressLines.length > 0 ? addressLines : fallback.contact.addressLines,
        phone: formatDisplayPhone(phoneRaw),
        email,
        transitJoined: transitJoined || fallback.contact.transitJoined,
      },
      columns: hasCmsColumns ? columns : fallback.columns,
      alreadyHere: {
        title: doc.alreadyHereColumn?.title?.trim() || fallback.alreadyHere.title,
        icon: doc.alreadyHereColumn?.icon?.trim() || fallback.alreadyHere.icon || 'MapPin',
        description:
          doc.alreadyHereColumn?.description?.trim() || fallback.alreadyHere.description,
        links: alreadyLinks.length > 0 ? alreadyLinks : fallback.alreadyHere.links,
      },
      awardsHeading: doc.awardsHeading?.trim() || fallback.awardsHeading,
      awards: cmsHasAwards ? awards : fallback.awards,
      partnerLinks: cmsHasPartners ? partnerLinks : fallback.partnerLinks,
      legalLinks: cmsHasLegal ? legalLinks : fallback.legalLinks,
      copyrightEntity: doc.copyrightEntity?.trim() || fallback.copyrightEntity,
    }
  } catch (error) {
    console.error('[getFooterData] Failed to load footer global:', error)
    return fallback
  }
}
