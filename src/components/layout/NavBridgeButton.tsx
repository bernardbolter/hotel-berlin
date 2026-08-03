'use client'

import type { ComponentProps } from 'react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/routing'

type AppHref = ComponentProps<typeof Link>['href']

type Props = {
  context: 'outside' | 'inside'
  size?: 'bar' | 'stacked'
  onNavigate?: () => void
  className?: string
}

/**
 * Boxed bridge button — same ENTER treatment for both contexts.
 * Outside: amber "ENTER" → /here · Inside: teal "STAY" → /
 */
export function NavBridgeButton({
  context,
  size = 'bar',
  onNavigate,
  className = '',
}: Props) {
  const t = useTranslations('nav')
  const isInside = context === 'inside'
  const href = (isInside ? '/' : '/here') as AppHref
  const prompt = isInside ? t('notHereYet') : t('inBuilding')
  const label = isInside ? t('stay') : t('enter')
  const aria = isInside ? t('bridgeToMainAria') : t('bridgeToGuestAria')
  const promptSize = size === 'bar' ? 'text-[13px] lg:text-[15px]' : 'text-[15px]'
  const btnSize = size === 'bar' ? 'text-[11px] lg:text-[12px]' : 'text-[12px]'

  return (
    <div className={`flex shrink-0 flex-nowrap items-center gap-2.5 ${className}`}>
      <span
        className={`shrink-0 font-ui ${promptSize} ${
          isInside ? 'text-hbb-nav-muted' : 'text-hbb-nav-amber'
        }`}
      >
        {prompt}
      </span>
      <Link
        href={href}
        aria-label={aria}
        onClick={onNavigate}
        className={`enter-btn ${btnSize} ${isInside ? 'enter-btn--teal' : ''}`}
      >
        <span className="enter-btn__text">{label}</span>
      </Link>
    </div>
  )
}
