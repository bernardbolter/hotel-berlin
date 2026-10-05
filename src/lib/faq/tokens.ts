/**
 * FAQ token registry + resolver.
 * Registry formats (en/de) from doc/faqs/faq-tokens.json — do not invent new formats.
 * HOLD tokens never resolve (return empty) even if a source field has a value.
 */
import type { Amenity, Hotel, Room } from '@/payload-types'

export type FaqLocale = 'en' | 'de'

export type TokenContext = {
  hotel: Hotel | null
  amenitiesBySlug?: Map<string, Amenity>
  roomsBySlug?: Map<string, Room>
  /** meetings.contactEmail when available */
  meetingsContactEmail?: string | null
}

type TokenDef = {
  name: string
  status: 'Ready' | 'Needs confirm' | 'HOLD'
  /** Never resolve — even if source is populated */
  hold?: boolean
  get: (ctx: TokenContext, locale: FaqLocale) => string | null
}

function euro(n: number | null | undefined, locale: FaqLocale): string | null {
  if (n == null || Number.isNaN(Number(n))) return null
  const v = Number(n)
  if (locale === 'de') {
    const formatted = Number.isInteger(v)
      ? String(v)
      : v.toFixed(2).replace('.', ',')
    return `${formatted} €`
  }
  if (Number.isInteger(v)) return `€${v}`
  return `€${v.toFixed(2)}`
}

function heightM(n: number | null | undefined, locale: FaqLocale): string | null {
  if (n == null || Number.isNaN(Number(n))) return null
  const v = Number(n)
  const en = v.toFixed(2)
  if (locale === 'de') return `${en.replace('.', ',')} m`
  return `${en} m`
}

function text(v: string | null | undefined): string | null {
  const t = v?.trim()
  return t ? t : null
}

function formatBreakfastRange(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null
  // Normalize spaces/dashes; keep leading zeros (Step 3 override: "06:30–10:00")
  const cleaned = raw.replace(/\s*[–—-]\s*/g, '–').replace(/\s+/g, '')
  const m = cleaned.match(/^(\d{1,2}:\d{2})–(\d{1,2}:\d{2})$/)
  if (!m) return raw.trim()
  return `${m[1]}–${m[2]}`
}

/** en: "90%" · de: "90 %" (Step 3 tokenValueOverrides) */
function percent(n: number | null | undefined, locale: FaqLocale): string | null {
  if (n == null || Number.isNaN(Number(n))) return null
  const v = Number(n)
  return locale === 'de' ? `${v} %` : `${v}%`
}

function noticeMinutes(n: number | null | undefined, locale: FaqLocale): string | null {
  if (n == null || Number.isNaN(Number(n))) return null
  const v = Number(n)
  if (locale === 'de') return `${v} Minuten`
  return `${v} minutes`
}

function addressLine(hotel: Hotel | null): string | null {
  const a = hotel?.address
  if (!a?.streetAddress || !a.postalCode || !a.addressLocality) return null
  return `${a.streetAddress}, ${a.postalCode} ${a.addressLocality}`
}

function roomSize(rooms: Map<string, Room> | undefined, slug: string): string | null {
  const m2 = rooms?.get(slug)?.floorSizeM2
  if (m2 == null || Number.isNaN(Number(m2))) return null
  return `${Number(m2)} m²`
}

/** Token name without braces → definition */
export const FAQ_TOKEN_DEFS: Record<string, TokenDef> = {
  checkinTime: {
    name: 'checkinTime',
    status: 'Ready',
    get: (ctx) => text(ctx.hotel?.checkinTime),
  },
  checkoutTime: {
    name: 'checkoutTime',
    status: 'Ready',
    get: (ctx) => text(ctx.hotel?.checkoutTime),
  },
  earlyCheckinFrom: {
    name: 'earlyCheckinFrom',
    status: 'Needs confirm',
    get: (ctx) => text(ctx.hotel?.earlyCheckin?.from),
  },
  earlyCheckinFee: {
    name: 'earlyCheckinFee',
    status: 'Needs confirm',
    get: (ctx, locale) => euro(ctx.hotel?.earlyCheckin?.fee, locale),
  },
  lateCheckoutTime: {
    name: 'lateCheckoutTime',
    status: 'Needs confirm',
    get: (ctx) => text(ctx.hotel?.lateCheckout?.until),
  },
  lateCheckoutFee: {
    name: 'lateCheckoutFee',
    status: 'Needs confirm',
    get: (ctx, locale) => euro(ctx.hotel?.lateCheckout?.fee, locale),
  },
  breakfastWeekday: {
    name: 'breakfastWeekday',
    status: 'Ready',
    get: (ctx, locale) => {
      const pair = ctx.hotel?.guestStay?.breakfast
      const raw = locale === 'de' ? pair?.valueDE : pair?.valueEN
      return formatBreakfastRange(raw)
    },
  },
  breakfastWeekend: {
    name: 'breakfastWeekend',
    status: 'Needs confirm',
    get: () => null, // seedNow=false — leave empty on purpose
  },
  breakfastPrice: {
    name: 'breakfastPrice',
    status: 'Ready',
    get: (ctx, locale) => euro(ctx.hotel?.breakfastPricing?.adultPrice, locale),
  },
  breakfastPriceChild: {
    name: 'breakfastPriceChild',
    status: 'Needs confirm',
    get: () => null, // seedNow=false
  },
  breakfastChildMinAge: {
    name: 'breakfastChildMinAge',
    status: 'Ready',
    get: (ctx) => {
      const n = ctx.hotel?.breakfastPricing?.childAgeFrom
      if (n == null) return null
      return String(n)
    },
  },
  parkingSpaces: {
    name: 'parkingSpaces',
    status: 'Ready',
    get: (ctx) => {
      const n = ctx.hotel?.parking?.spaces
      return n == null ? null : String(n)
    },
  },
  parkingHourly: {
    name: 'parkingHourly',
    status: 'Ready',
    get: (ctx, locale) => euro(ctx.hotel?.parking?.hourly, locale),
  },
  parkingDaily: {
    name: 'parkingDaily',
    status: 'Ready',
    get: (ctx, locale) => euro(ctx.hotel?.parking?.dailyMax, locale),
  },
  parkingMaxHeight: {
    name: 'parkingMaxHeight',
    status: 'Ready',
    get: (ctx, locale) => heightM(ctx.hotel?.parking?.maxHeight, locale),
  },
  petFee: {
    name: 'petFee',
    status: 'Ready',
    get: (ctx, locale) => euro(ctx.hotel?.petFee, locale),
  },
  saunaNotice: {
    name: 'saunaNotice',
    status: 'Ready',
    get: (ctx, locale) => noticeMinutes(ctx.amenitiesBySlug?.get('sauna')?.noticeMinutes, locale),
  },
  cancelFlexibleUntil: {
    name: 'cancelFlexibleUntil',
    status: 'Ready',
    get: (ctx) => text(ctx.hotel?.ratePolicy?.flexibleCancelUntil),
  },
  noShowCharge: {
    name: 'noShowCharge',
    status: 'Ready',
    get: (ctx, locale) => percent(ctx.hotel?.ratePolicy?.noShowPercent, locale),
  },
  smokingFee: {
    name: 'smokingFee',
    status: 'Ready',
    get: (ctx, locale) => euro(ctx.hotel?.smokingFee, locale),
  },
  phoneRateDomestic: {
    name: 'phoneRateDomestic',
    status: 'Ready',
    get: (ctx, locale) => euro(ctx.hotel?.roomPhoneRates?.domestic, locale),
  },
  phoneRateIntlMin: {
    name: 'phoneRateIntlMin',
    status: 'Ready',
    get: (ctx, locale) => euro(ctx.hotel?.roomPhoneRates?.intlMin, locale),
  },
  phoneRateIntlMax: {
    name: 'phoneRateIntlMax',
    status: 'Ready',
    get: (ctx, locale) => euro(ctx.hotel?.roomPhoneRates?.intlMax, locale),
  },
  emailInfo: {
    name: 'emailInfo',
    status: 'Ready',
    get: (ctx) => text(ctx.hotel?.email),
  },
  emailReservations: {
    name: 'emailReservations',
    status: 'Needs confirm',
    get: (ctx) => text(ctx.hotel?.emails?.reservations),
  },
  emailConference: {
    name: 'emailConference',
    status: 'Needs confirm',
    get: (ctx) => text(ctx.meetingsContactEmail),
  },
  emailSustainability: {
    name: 'emailSustainability',
    status: 'Needs confirm',
    get: (ctx) => text(ctx.hotel?.emails?.sustainability),
  },
  emailCareers: {
    name: 'emailCareers',
    status: 'Needs confirm',
    get: (ctx) => text(ctx.hotel?.emails?.careers),
  },
  hotelAddress: {
    name: 'hotelAddress',
    status: 'Ready',
    get: (ctx) => addressLine(ctx.hotel),
  },
  lostPropertyUrl: {
    name: 'lostPropertyUrl',
    status: 'Needs confirm',
    get: (ctx) => text(ctx.hotel?.lostPropertyUrl),
  },
  roomLargestSize: {
    name: 'roomLargestSize',
    status: 'Needs confirm',
    get: (ctx) => roomSize(ctx.roomsBySlug, 'studio-45'),
  },
  roomFamilySize: {
    name: 'roomFamilySize',
    status: 'Needs confirm',
    get: (ctx) => roomSize(ctx.roomsBySlug, 'premium-family'),
  },
  roomPremiumSize: {
    name: 'roomPremiumSize',
    status: 'Needs confirm',
    get: (ctx) => roomSize(ctx.roomsBySlug, 'premium'),
  },
  wifiSsid: {
    name: 'wifiSsid',
    status: 'HOLD',
    hold: true,
    get: () => null,
  },
  saunaHours: {
    name: 'saunaHours',
    status: 'HOLD',
    hold: true,
    get: () => null,
  },
  phoneMain: {
    name: 'phoneMain',
    status: 'HOLD',
    hold: true,
    get: () => null,
  },
  phoneReception: {
    name: 'phoneReception',
    status: 'HOLD',
    hold: true,
    get: () => null,
  },
}

export const FAQ_TOKEN_NAMES = Object.keys(FAQ_TOKEN_DEFS)

const TOKEN_RE = /\{\{\s*([a-zA-Z][a-zA-Z0-9]*)\s*\}\}/g

/** Known registry names (no braces). */
export function isKnownFaqToken(name: string): boolean {
  return Object.prototype.hasOwnProperty.call(FAQ_TOKEN_DEFS, name)
}

/**
 * Replace {{tokens}} in text. Empty / HOLD / missing sources → unresolved.
 * Text with no tokens is returned unchanged.
 */
export function resolveFaqTokens(
  text: string,
  locale: FaqLocale,
  ctx: TokenContext,
): { text: string; unresolved: string[] } {
  if (!text) return { text: text ?? '', unresolved: [] }
  const unresolved: string[] = []
  const seen = new Set<string>()
  const out = text.replace(TOKEN_RE, (_full, name: string) => {
    const def = FAQ_TOKEN_DEFS[name]
    if (!def || def.hold) {
      if (!seen.has(name)) {
        seen.add(name)
        unresolved.push(name)
      }
      return `{{${name}}}`
    }
    const value = def.get(ctx, locale)
    if (value == null || value === '') {
      if (!seen.has(name)) {
        seen.add(name)
        unresolved.push(name)
      }
      return `{{${name}}}`
    }
    return value
  })
  return { text: out, unresolved }
}

/** Extract {{token}} names from a string. */
export function extractFaqTokens(text: string | null | undefined): string[] {
  if (!text) return []
  const names: string[] = []
  const re = /\{\{\s*([a-zA-Z][a-zA-Z0-9]*)\s*\}\}/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) != null) {
    names.push(m[1])
  }
  return names
}

/** Draft markers like [CONFIRM, [BESTÄTIGEN, [ADD, [ERGÄNZEN */
export const FAQ_BRACKET_MARKER_RE = /\[(CONFIRM|BESTÄTIGEN|ADD|ERGÄNZEN)\b/i

export function hasFaqBracketMarker(text: string | null | undefined): boolean {
  if (!text) return false
  return FAQ_BRACKET_MARKER_RE.test(text)
}
