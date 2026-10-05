import { getFaqs } from '@/lib/faqs'

/** @deprecated Prefer `getFaqs` from `@/lib/faqs`. Always published-only. */
export async function getFAQs(
  opts: {
    audience?: 'prospect' | 'guest' | 'both'
    category?: string
    locale?: string
  } = {},
) {
  const locale = opts.locale ?? 'en'
  const category = opts.category as
    | 'rooms-booking'
    | 'checkin-checkout'
    | 'dining'
    | 'meetings'
    | 'accessibility'
    | 'getting-here'
    | 'pets-parking'
    | 'general'
    | 'wifi-tech'
    | 'guest-services'
    | 'neighbourhood-guest'
    | undefined

  if (opts.audience === 'both' || !opts.audience) {
    const docs = await getFaqs({ locale, allPublished: true })
    return category ? docs.filter((d) => d.category === category) : docs
  }

  return getFaqs({
    context: opts.audience,
    locale,
    category,
  })
}
