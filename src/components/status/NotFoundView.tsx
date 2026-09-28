import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

import { LineCta } from '@/components/primitives/LineCta'
import { StatusMessage } from '@/components/status/StatusMessage'
import { StatusShell } from '@/components/status/StatusShell'
import { softLaunchMetadata } from '@/lib/launch/softLaunch'

export async function notFoundMetadata(): Promise<Metadata> {
  const t = await getTranslations('errors')
  return {
    ...softLaunchMetadata(),
    title: t('notFoundTitle'),
    robots: { index: false, follow: false },
  }
}

export async function NotFoundCopy() {
  const t = await getTranslations('errors')
  return (
    <StatusMessage
      title={t('notFoundTitle')}
      body={t('notFoundBody')}
      action={<LineCta href="/">{t('homeCta')}</LineCta>}
    />
  )
}

export async function NotFoundView() {
  return (
    <>
      <StatusShell />
      <NotFoundCopy />
    </>
  )
}
