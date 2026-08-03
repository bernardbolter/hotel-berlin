import type { RelativeTimeState } from './types'

/**
 * Maps RelativeTimeState → next-intl message key + values.
 * Keys live under `relativeTime.*` in en.json / de.json (placeholder copy).
 */
export function relativeTimeMessage(
  state: RelativeTimeState,
): { key: 'now' | 'soon' | 'scheduled'; values?: Record<string, string> } {
  switch (state.kind) {
    case 'now':
      return { key: 'now' }
    case 'soon':
      return { key: 'soon', values: { duration: state.minutesOrHours } }
    case 'scheduled':
      return { key: 'scheduled', values: { time: state.time } }
  }
}
