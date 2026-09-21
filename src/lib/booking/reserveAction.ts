import { prune } from '@/lib/aeo-schema/src/lib/prune'
import type { JsonLdNode } from '@/lib/aeo-schema/src/types'

import {
  buildRadissonBookingUrlTemplate,
  RADISSON_LOCALES,
  type BookingLocale,
} from './radisson'

const RESULT_NAME: Record<BookingLocale, string> = {
  de: 'Zimmerbuchung',
  en: 'Room reservation',
}

/**
 * Machine-readable booking entry point. Built from the same parameter list
 * as `buildRadissonBookingUrl`, so the human button and the graph cannot drift.
 */
export function buildReserveAction(locale: BookingLocale): JsonLdNode {
  const { inLanguage } = RADISSON_LOCALES[locale]
  return prune({
    '@type': 'ReserveAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: buildRadissonBookingUrlTemplate(locale),
      inLanguage,
      httpMethod: 'GET',
      actionPlatform: [
        'https://schema.org/DesktopWebPlatform',
        'https://schema.org/MobileWebPlatform',
      ],
    },
    result: {
      '@type': 'LodgingReservation',
      name: RESULT_NAME[locale],
    },
  })
}
