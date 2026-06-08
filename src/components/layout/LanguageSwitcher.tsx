'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useId } from 'react'

import { Link } from '@/i18n/routing'

export type LanguageSwitcherVariant = 'nav' | 'footer'

export type LanguageSwitcherSize = 'md' | 'lg'

export type LanguageSwitcherColors = {
  label?: string
  link?: string
  active?: string
  hover?: string
  separator?: string
}

type Props = {
  className?: string
  align?: 'start' | 'end'
  variant?: LanguageSwitcherVariant
  size?: LanguageSwitcherSize
  colors?: LanguageSwitcherColors
}

const variantColors: Record<LanguageSwitcherVariant, Required<LanguageSwitcherColors>> = {
  nav: {
    label: 'text-hbb-nav-link/70',
    link: 'text-hbb-nav-link',
    active: 'text-hbb-teal',
    hover: 'hover:text-hbb-black',
    separator: 'text-hbb-nav-link/35',
  },
  footer: {
    label: 'text-hbb-footer-muted',
    link: 'text-hbb-footer-link',
    active: 'text-hbb-footer-teal',
    hover: 'hover:text-hbb-footer-primary',
    separator: 'text-hbb-footer-muted/40',
  },
}

const sizeStyles: Record<
  LanguageSwitcherSize,
  { link: string; touch: string; separator: string; label: string }
> = {
  md: {
    link: 'text-ui-lg',
    touch: 'min-h-10 px-1.5',
    separator: 'text-ui-xl leading-none',
    label: 'text-[8.5px]',
  },
  lg: {
    link: 'text-ui-xl',
    touch: 'min-h-11 px-2',
    separator: 'text-[22px] leading-none',
    label: 'text-[9px]',
  },
}

export function LanguageSwitcher({
  className = '',
  align = 'end',
  variant = 'nav',
  size = 'md',
  colors,
}: Props) {
  const t = useTranslations('nav')
  const tc = useTranslations('common')
  const locale = useLocale()
  const labelId = useId()

  const palette = { ...variantColors[variant], ...colors }
  const sizing = sizeStyles[size]

  const langLinkBase = [
    'inline-flex items-center justify-center font-ui font-medium transition-colors duration-200 ease-out',
    sizing.touch,
    sizing.link,
  ].join(' ')

  const inactiveLinkClass = `${palette.link} ${palette.hover}`
  const activeLinkClass = palette.active

  return (
    <div className={align === 'start' ? 'self-start' : 'self-end'}>
      <div className={`flex flex-col items-center gap-0 ${className}`}>
        <span
          id={labelId}
          className={`font-ui uppercase leading-none tracking-ui-tight ${sizing.label} ${palette.label}`}
        >
          {t('language')}
        </span>
        <div
          role="group"
          aria-labelledby={labelId}
          className="-mt-1 flex items-center"
        >
          <Link
            href="/"
            locale="de"
            hrefLang="de"
            lang="de"
            aria-label={tc('langDe')}
            aria-current={locale === 'de' ? 'true' : undefined}
            className={`${langLinkBase} ${locale === 'de' ? activeLinkClass : inactiveLinkClass}`}
          >
            DE
          </Link>
          <span
            aria-hidden="true"
            className={`select-none px-px font-ui font-normal ${sizing.separator} ${palette.separator}`}
          >
            |
          </span>
          <Link
            href="/"
            locale="en"
            hrefLang="en"
            lang="en"
            aria-label={tc('langEn')}
            aria-current={locale === 'en' ? 'true' : undefined}
            className={`${langLinkBase} ${locale === 'en' ? activeLinkClass : inactiveLinkClass}`}
          >
            EN
          </Link>
        </div>
      </div>
    </div>
  )
}
