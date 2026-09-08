export type BridgeLabelParts = {
  prompt: string
  action: string
}

const FALLBACK: Record<
  'de' | 'en',
  { toHere: string; toStay: string }
> = {
  en: {
    toHere: 'Already in the house? ENTER →',
    toStay: 'Not here yet? STAY →',
  },
  de: {
    toHere: 'Schon im Haus? ENTER →',
    toStay: 'Noch nicht hier? BLEIB →',
  },
}

/**
 * Split CMS bridge copy ("Schon im Haus? ENTER →") into prefix + boxed action.
 */
export function splitBridgeLabel(
  raw: string | null | undefined,
  fallback: string,
): BridgeLabelParts {
  const value = raw?.trim() || fallback
  const match = value.match(/^(.*?)\s+([A-ZÄÖÜ]{2,})\s*→?\s*$/)
  if (match) {
    return { prompt: match[1].trim(), action: match[2] }
  }
  return { prompt: value.replace(/\s*→\s*$/, '').trim(), action: '→' }
}

export type BridgeNavCopy = {
  toHere: BridgeLabelParts
  toStay: BridgeLabelParts
}

export function resolveBridgeNav(
  bridgeNav:
    | {
        toHereLabelEN?: string | null
        toHereLabelDE?: string | null
        toStayLabelEN?: string | null
        toStayLabelDE?: string | null
      }
    | null
    | undefined,
  locale: 'de' | 'en',
): BridgeNavCopy {
  const fallback = FALLBACK[locale]
  const toHereRaw = locale === 'de' ? bridgeNav?.toHereLabelDE : bridgeNav?.toHereLabelEN
  const toStayRaw = locale === 'de' ? bridgeNav?.toStayLabelDE : bridgeNav?.toStayLabelEN
  return {
    toHere: splitBridgeLabel(toHereRaw, fallback.toHere),
    toStay: splitBridgeLabel(toStayRaw, fallback.toStay),
  }
}
