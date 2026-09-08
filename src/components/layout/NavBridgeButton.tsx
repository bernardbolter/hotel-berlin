'use client'

import type { ComponentProps } from 'react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/routing'
import type { BridgeLabelParts } from '@/lib/nav/bridge'

type AppHref = ComponentProps<typeof Link>['href']

type Props = {
  context: 'outside' | 'inside'
  label: BridgeLabelParts
  size?: 'bar' | 'stacked'
  onNavigate?: () => void
  className?: string
}

/**
 * Boxed bridge button — the only accent-coloured element in the header.
 * Outside: ENTER → /here · Inside: STAY → /
 */
export function NavBridgeButton({
  context,
  label,
  size = 'bar',
  onNavigate,
  className = '',
}: Props) {
  const t = useTranslations('nav')
  const isInside = context === 'inside'
  const href = (isInside ? '/' : '/here') as AppHref
  const aria = isInside ? t('bridgeToMainAria') : t('bridgeToGuestAria')
  const promptSize = size === 'bar' ? 'text-[13px] min-[1100px]:text-[15px]' : 'text-[15px]'
  const btnSize = size === 'bar' ? 'text-[11px] min-[1100px]:text-[12px]' : 'text-[12px]'

  return (
    <div className={`flex shrink-0 flex-nowrap items-center gap-2.5 ${className}`}>
      <span className={`shrink-0 font-ui ${promptSize} text-ctx-accent-text`}>
        {label.prompt}
      </span>
      <Link
        href={href}
        aria-label={aria}
        onClick={onNavigate}
        className={`enter-btn ${btnSize}`}
      >
        <span className="enter-btn__text">{label.action}</span>
      </Link>
    </div>
  )
}
