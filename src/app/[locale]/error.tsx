'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'

import { LineCta } from '@/components/primitives/LineCta'
import { StatusMessage } from '@/components/status/StatusMessage'
import { StatusShell } from '@/components/status/StatusShell'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function LocaleError({ error, reset }: Props) {
  const t = useTranslations('errors')
  const tc = useTranslations('common')

  useEffect(() => {
    document.title = `${t('errorTitle')} — ${tc('hotelName')}`
    console.error(error)
  }, [error, t, tc])

  return (
    <>
      <StatusShell />
      <StatusMessage
        title={t('errorTitle')}
        body={t('errorBody')}
        action={
          <div className="flex flex-wrap gap-8">
            <LineCta onClick={() => reset()}>{t('retry')}</LineCta>
            <LineCta href="/">{t('homeCta')}</LineCta>
          </div>
        }
      />
    </>
  )
}
