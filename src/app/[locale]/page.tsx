import { getTranslations } from 'next-intl/server'
import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'

import { Link } from '@/i18n/routing'
import config from '@/payload.config'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'home' })

  return {
    title: 'Hotel Berlin, Berlin',
    description: t('heroSubline'),
    alternates: {
      canonical: `https://hotel-berlin.de/${locale}`,
      languages: {
        de: 'https://hotel-berlin.de/de',
        en: 'https://hotel-berlin.de/en',
        'x-default': 'https://hotel-berlin.de/de',
      },
    },
  }
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations('home')
  const tNav = await getTranslations('nav')

  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  const alternateLocale = locale === 'de' ? 'en' : 'de'

  return (
    <main id="main-content" className="min-h-screen bg-hbb-page px-section-sm py-section-y md:px-section-x">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <Image
          alt="Payload Logo"
          height={65}
          src="https://raw.githubusercontent.com/payloadcms/payload/3.x/packages/ui/src/assets/payload-favicon.svg"
          width={65}
        />
        <h1 className="font-serif text-serif-2xl font-medium text-hbb-black">{t('heroHeadline')}</h1>
        <p className="font-ui text-ui-lg text-hbb-black/80">{t('heroSubline')}</p>
        {!user && <p className="font-ui text-ui-md">{tNav('bookNow')}</p>}
        {user && <p className="font-ui text-ui-md">Welcome back, {user.email}</p>}
        <ul role="list" className="flex flex-wrap items-center justify-center gap-3">
          <li>
            <Link href="/" locale={alternateLocale} className="font-ui text-ui-md text-hbb-teal">
              {tNav('langToggle')}
            </Link>
          </li>
          <li>
            <a
              className="font-ui text-ui-md text-hbb-teal"
              href={payloadConfig.routes.admin}
              rel="noopener noreferrer"
              target="_blank"
            >
              Go to admin panel
            </a>
          </li>
        </ul>
      </div>
    </main>
  )
}
