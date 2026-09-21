import { Archivo } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import React from 'react'

import { routing } from '@/i18n/routing'
import { buildHotelAmenityJsonLd } from '@/lib/amenities/schema'
import { buildReserveAction, type BookingLocale } from '@/lib/booking'
import { laica } from '@/lib/fonts/laica'
import { softLaunchMetadata } from '@/lib/launch/softLaunch'

import '../globals.css'

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  weight: ['400', '500', '600'],
  display: 'swap',
})

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateMetadata(): Metadata {
  return softLaunchMetadata()
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'de' | 'en')) {
    notFound()
  }

  const messages = await getMessages()
  const tc = await getTranslations('common')

  const bookingLocale: BookingLocale = locale === 'en' ? 'en' : 'de'

  const { amenityFeature, containsPlace } = await buildHotelAmenityJsonLd(locale).catch(() => ({
    amenityFeature: [] as Record<string, unknown>[],
    containsPlace: [] as Record<string, unknown>[],
  }))

  const hotelJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    '@id': 'https://hotel-berlin.de/#hotel',
    name: 'Hotel Berlin, Berlin',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Lützowplatz 17',
      addressLocality: 'Berlin',
      postalCode: '10785',
      addressCountry: 'DE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 52.5027,
      longitude: 13.3583,
    },
    telephone: '+493026050',
    email: 'info@hotel-berlin.de',
    url: 'https://hotel-berlin.de',
    foundingDate: '1958',
    sameAs: ['https://www.wikidata.org/wiki/Q1630833'],
    potentialAction: buildReserveAction(bookingLocale),
    ...(amenityFeature.length > 0 ? { amenityFeature } : {}),
    ...(containsPlace.length > 0 ? { containsPlace } : {}),
  }

  return (
    <html lang={locale} className={`${archivo.variable} ${laica.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelJsonLd) }}
        />
      </head>
      <body data-context="outside">
        <a href="#main-content" className="skip-link">
          {tc('skipToMain')}
        </a>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}
