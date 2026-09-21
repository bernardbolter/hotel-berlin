import type { ReactNode } from 'react'
import Image from 'next/image'

import { InitialsAvatar } from '@/components/people/InitialsAvatar'
import { Link } from '@/i18n/routing'
import { resolveCategoryToken, type CategoryToken } from '@/lib/spotlight/categoryTokens'
import type { AppPathnames } from '@/i18n/pathnames'

export type LocalHref = AppPathnames | string

export type EntityChip = { chip: string; token?: CategoryToken; color?: string }

export type EntityIdentityProps = {
  breadcrumb: { label: string; href: LocalHref }
  title: string
  meta: ReadonlyArray<string | EntityChip>
  lead?: string
  portrait?: { src: string; alt: string } | null
  fallback?: 'quote' | 'dot'
}

function Chip({ chip, token, color }: EntityChip) {
  const style = token ? resolveCategoryToken(token) : null
  const fill = color ?? style?.fill ?? 'var(--ctx-accent)'
  return (
    <span
      className="inline-flex items-center gap-1.5 font-ui text-label uppercase tracking-ui-label"
      style={{ color: fill }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: fill }} aria-hidden="true" />
      {chip}
    </span>
  )
}

function CategoryDot({ color, size = 26 }: { color: string; size?: number }) {
  return (
    <span
      className="inline-grid shrink-0 place-items-center rounded-full border border-dashed"
      style={{ width: size, height: size, borderColor: color }}
      aria-hidden="true"
    >
      <span className="block rounded-full" style={{ width: size * 0.3, height: size * 0.3, background: color }} />
    </span>
  )
}

function metaColor(item: string | EntityChip): string | undefined {
  if (typeof item === 'string') return undefined
  if (item.color) return item.color
  if (item.token) return resolveCategoryToken(item.token).fill
  return undefined
}

export function EntityIdentity({
  breadcrumb,
  title,
  meta,
  lead,
  portrait,
  fallback,
}: EntityIdentityProps) {
  const quoteHero = !portrait && fallback === 'quote' && Boolean(lead?.trim())
  const initialsHero = !portrait && fallback === 'quote' && !lead?.trim()
  const firstChipColor = meta.map(metaColor).find(Boolean)

  return (
    <header className="px-section-sm md:px-section-x">
      <p className="font-ui text-label uppercase tracking-ui-label text-[var(--ctx-accent-text)]">
        <Link href={breadcrumb.href as '/'} className="hover:underline">
          {breadcrumb.label}
        </Link>
      </p>

      {portrait ? (
        <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-start md:gap-12">
          <div className="relative aspect-3/4 w-full max-w-xs overflow-hidden bg-[var(--bg-subtle)] md:w-64 md:max-w-none">
            <Image
              src={portrait.src}
              alt={portrait.alt}
              fill
              sizes="(max-width: 768px) 100vw, 256px"
              className="object-cover"
              priority
            />
          </div>
          <IdentityCopy title={title} meta={meta} lead={lead} />
        </div>
      ) : quoteHero ? (
        <div className="mt-8 max-w-2xl">
          <blockquote className="entity-quote-hero">
            <p>{lead}</p>
          </blockquote>
          <h1 className="mt-6 font-ui text-ui-xl font-medium text-hbb-black md:text-ui-2xl">{title}</h1>
          <MetaLine meta={meta} dotColor={firstChipColor} />
        </div>
      ) : initialsHero ? (
        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start">
          <InitialsAvatar name={title} size="xl" className="h-[104px] w-[104px] text-ui-xl md:h-[104px] md:w-[104px]" />
          <IdentityCopy title={title} meta={meta} />
        </div>
      ) : (
        <div className="mt-8">
          <IdentityCopy title={title} meta={meta} lead={lead} />
        </div>
      )}
    </header>
  )
}

function IdentityCopy({
  title,
  meta,
  lead,
}: {
  title: string
  meta: EntityIdentityProps['meta']
  lead?: string
}) {
  return (
    <div className="min-w-0 flex-1">
      <h1 className="font-ui text-ui-2xl font-medium text-hbb-black md:text-[2rem]">{title}</h1>
      <MetaLine meta={meta} />
      {lead ? (
        <p className="mt-6 max-w-[62ch] font-serif text-serif-sm text-gray-700">{lead}</p>
      ) : null}
    </div>
  )
}

function MetaLine({
  meta,
  dotColor,
}: {
  meta: EntityIdentityProps['meta']
  dotColor?: string
}) {
  if (meta.length === 0 && !dotColor) return null
  return (
    <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-ui text-ui-sm text-[var(--dim)]">
      {dotColor ? <CategoryDot color={dotColor} /> : null}
      {meta.map((item, index) =>
        typeof item === 'string' ? (
          <span key={`${item}-${index}`}>{item}</span>
        ) : (
          <Chip key={`${item.chip}-${index}`} {...item} />
        ),
      )}
    </p>
  )
}
