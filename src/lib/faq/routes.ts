/**
 * FAQ route registry — single source for pinnedRoutes / faqPlacements options.
 * Keys match the reconciliation Routes sheet / Part B brief. Adding a template =
 * add a key here. Keys for pages not yet built may be registered but stay inert
 * until a placement row uses them.
 *
 * Nothing imports this yet except the `faqs.pinnedRoutes` field options (Step 1).
 * Selection / placement logic lands in Step 2.
 */
export const FAQ_ROUTE_KEYS = [
  'home',
  'rooms',
  'room-detail',
  'meetings',
  'amenities',
  'sustainability',
  'offers',
  'contact',
  'faq',
  'here',
  'here-dining',
  'here-getting-around',
  'here-faq',
  'policy-checkin',
  'policy-cancellation',
  'policy-pets',
  'policy-fees',
  'policy-payment',
] as const

export type FaqRouteKey = (typeof FAQ_ROUTE_KEYS)[number]

/** Template + localized pathnames for each registry key (from src/i18n/pathnames.ts). */
export const FAQ_ROUTE_META: Record<
  FaqRouteKey,
  { template: string; en: string; de: string }
> = {
  home: {
    template: 'src/app/[locale]/page.tsx',
    en: '/',
    de: '/',
  },
  rooms: {
    template: 'src/app/[locale]/rooms/page.tsx',
    en: '/rooms',
    de: '/zimmer',
  },
  'room-detail': {
    template: 'src/app/[locale]/rooms/[slug]/page.tsx',
    en: '/rooms/[slug]',
    de: '/zimmer/[slug]',
  },
  meetings: {
    template: 'src/app/[locale]/meetings/page.tsx',
    en: '/meetings',
    de: '/tagungen',
  },
  amenities: {
    template: 'src/app/[locale]/amenities/page.tsx',
    en: '/amenities',
    de: '/ausstattung',
  },
  sustainability: {
    template: 'src/app/[locale]/sustainability/page.tsx',
    en: '/sustainability',
    de: '/nachhaltigkeit',
  },
  offers: {
    template: 'src/app/[locale]/offers/page.tsx',
    en: '/offers',
    de: '/angebote',
  },
  contact: {
    template: 'src/app/[locale]/contact/page.tsx',
    en: '/contact',
    de: '/kontakt',
  },
  faq: {
    template: 'src/app/[locale]/faq/page.tsx',
    en: '/faq',
    de: '/faq',
  },
  here: {
    template: 'src/app/[locale]/here/page.tsx',
    en: '/here',
    de: '/hier',
  },
  'here-dining': {
    template: 'src/app/[locale]/here/dining/page.tsx',
    en: '/here/dining',
    de: '/hier/dining',
  },
  'here-getting-around': {
    template: 'src/app/[locale]/here/getting-around/page.tsx',
    en: '/here/getting-around',
    de: '/hier/getting-around',
  },
  'here-faq': {
    template: 'src/app/[locale]/here/faq/page.tsx',
    en: '/here/faq',
    de: '/hier/faq',
  },
  'policy-checkin': {
    template: 'src/app/[locale]/policies/check-in/page.tsx',
    en: '/policies/check-in',
    de: '/richtlinien/check-in',
  },
  'policy-cancellation': {
    template: 'src/app/[locale]/policies/cancellation/page.tsx',
    en: '/policies/cancellation',
    de: '/richtlinien/stornierung',
  },
  'policy-pets': {
    template: 'src/app/[locale]/policies/pets/page.tsx',
    en: '/policies/pets',
    de: '/richtlinien/haustiere',
  },
  'policy-fees': {
    template: 'src/app/[locale]/policies/fees/page.tsx',
    en: '/policies/fees',
    de: '/richtlinien/parken',
  },
  'policy-payment': {
    template: 'src/app/[locale]/policies/payment/page.tsx',
    en: '/policies/payment',
    de: '/richtlinien/zahlung',
  },
}

export const FAQ_ROUTE_OPTIONS = FAQ_ROUTE_KEYS.map((value) => ({
  label: value,
  value,
}))
