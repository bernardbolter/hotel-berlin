import type { ReactNode } from 'react'
import Image from 'next/image'

import { LineCta } from '@/components/primitives/LineCta'

export type EditorialBandRatio = '2:1' | '1:2'

export type EditorialBandImageCredit = {
  creditText: string
  creditUrl?: string | null
}

type Cta = {
  href: string
  label: string
}

type Props = {
  ratio?: EditorialBandRatio
  /** Omit for the text-only letter variant (Direction C person page). */
  image?: { src: string; alt: string } | null
  imageCredit?: EditorialBandImageCredit | null
  /** Mark layout-test photography so gaps are visible, not silently filled. */
  placeholder?: boolean
  placeholderLabel?: string
  eyebrow?: string
  heading: string
  body?: string
  meta?: string
  cta?: Cta
  children?: ReactNode
  id?: string
  className?: string
}

/**
 * Shared 2:1 / 1:2 photo band for home and `/here`.
 * Pass no `image` for the text-only letter variant — never an empty frame.
 */
export function EditorialBand({
  ratio = '1:2',
  image,
  imageCredit,
  placeholder = false,
  placeholderLabel = 'Photography forthcoming',
  eyebrow,
  heading,
  body,
  meta,
  cta,
  children,
  id,
  className = '',
}: Props) {
  const headingId = id ?? undefined
  const creditText = imageCredit?.creditText?.trim()
  const hasImage = Boolean(image?.src)
  const ratioClass = !hasImage
    ? 'editorial-band--text'
    : ratio === '2:1'
      ? 'editorial-band--2-1'
      : 'editorial-band--1-2'

  return (
    <section
      aria-labelledby={headingId}
      className={`editorial-band ${ratioClass} ${className}`}
    >
      {hasImage && image ? (
        <div className="editorial-band__photo">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 1023px) 100vw, 67vw"
            className="object-cover"
          />
          {creditText ? (
            <p className="absolute bottom-0 left-0 right-0 bg-black/55 px-2 py-0.5 font-ui text-[9px] leading-tight text-white/90">
              {imageCredit?.creditUrl ? (
                <a
                  href={imageCredit.creditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-2 hover:underline"
                >
                  {creditText}
                </a>
              ) : (
                creditText
              )}
            </p>
          ) : null}
          {placeholder ? (
            <p className="absolute top-3 left-3 border border-dashed border-white/80 bg-black/45 px-2 py-0.5 font-ui text-[9.5px] uppercase tracking-[0.12em] text-white">
              {placeholderLabel}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="editorial-band__copy flex min-w-0 flex-col items-start">
        {eyebrow ? (
          <>
            <p className="editorial-band__eyebrow">{eyebrow}</p>
            <span aria-hidden="true" className="editorial-band__rule mt-2 mb-4" />
          </>
        ) : null}
        <h2
          id={headingId}
          className="text-left font-serif text-[clamp(1.45rem,2.3vw,2.1rem)] font-normal leading-[1.12] text-[#1F1F1F]"
        >
          {heading}
        </h2>
        {meta ? (
          <p className="mt-2 font-ui text-[11px] uppercase tracking-[0.06em] text-gray-500">
            {meta}
          </p>
        ) : null}
        {body ? (
          <p className="mt-4 max-w-prose font-serif text-[clamp(0.95rem,1.05vw,1.05rem)] leading-[1.65] text-[#3a3a3a]">
            {body}
          </p>
        ) : null}
        {children}
        {cta ? (
          <div className="mt-6">
            <LineCta href={cta.href} className="text-ui-sm">
              {cta.label}
            </LineCta>
          </div>
        ) : null}
      </div>
    </section>
  )
}
