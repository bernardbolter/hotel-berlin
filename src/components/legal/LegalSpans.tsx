import type { ReactNode } from 'react'

import { Link } from '@/i18n/routing'
import type { LegalMark, LegalSpan } from '@/lib/legal/types'

const APP_PATHS = {
  '/imprint': true,
  '/privacy': true,
  '/terms': true,
  '/cookies': true,
  '/disclaimer': true,
  '/faq': true,
  '/meetings': true,
} as const

type AppLegalHref = keyof typeof APP_PATHS

function markClass(marks: LegalMark[] | undefined): string {
  if (!marks?.length) return ''
  const classes: string[] = []
  if (marks.includes('strong')) classes.push('font-medium text-[#1F1F1F]')
  if (marks.includes('em')) classes.push('italic')
  if (marks.includes('underline')) classes.push('underline decoration-black/25 underline-offset-2')
  return classes.join(' ')
}

function normalizeText(text: string): string {
  return text.replace(/\n{2,}/g, '\n').replace(/\u00a0/g, ' ')
}

export function LegalSpans({ spans }: { spans: LegalSpan[] }) {
  return (
    <>
      {spans.map((span, index) => {
        const text = normalizeText(span.text)
        const className = markClass(span.marks)
        let node: ReactNode = text

        if (span.href) {
          const href = span.href
          if (href.startsWith('mailto:') || href.startsWith('tel:')) {
            node = (
              <a href={href} className="text-ctx-accent-text underline-offset-2 hover:underline">
                {text}
              </a>
            )
          } else if (href in APP_PATHS) {
            node = (
              <Link
                href={href as AppLegalHref}
                className="text-ctx-accent-text underline-offset-2 hover:underline"
              >
                {text}
              </Link>
            )
          } else if (href.startsWith('http')) {
            node = (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ctx-accent-text underline-offset-2 hover:underline"
              >
                {text}
              </a>
            )
          }
        }

        return (
          <span key={index} className={className || undefined}>
            {node}
          </span>
        )
      })}
    </>
  )
}
