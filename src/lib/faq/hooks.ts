import type { CollectionBeforeChangeHook, CollectionBeforeValidateHook } from 'payload'

import { extractFaqTokens, hasFaqBracketMarker, isKnownFaqToken } from './tokens'

/**
 * Reject unknown {{tokens}} in question/answer (typo guard).
 */
export const faqTokenTypoGuard: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return data
  for (const field of ['question', 'answer'] as const) {
    const value = data[field]
    if (typeof value !== 'string') continue
    for (const name of extractFaqTokens(value)) {
      if (!isKnownFaqToken(name)) {
        throw new Error(
          `Unknown FAQ token {{${name}}} in ${field}. Add it to the token registry (src/lib/faq/tokens.ts) or fix the typo.`,
        )
      }
    }
  }
  return data
}

/**
 * Block publishing when question/answer still contain draft markers like [CONFIRM.
 */
export const faqPublishBracketGuard: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  if (!data) return data
  const nextStatus = data._status ?? originalDoc?._status
  if (nextStatus !== 'published') return data

  for (const field of ['question', 'answer'] as const) {
    const value = data[field] ?? originalDoc?.[field]
    if (typeof value === 'string' && hasFaqBracketMarker(value)) {
      throw new Error(
        `Cannot publish FAQ: ${field} still contains a draft marker (e.g. [CONFIRM / [BESTÄTIGEN / [ADD / [ERGÄNZEN]).`,
      )
    }
  }
  return data
}
