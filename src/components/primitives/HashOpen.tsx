'use client'

import { useHashOpen } from '@/hooks/useHashOpen'

/** Mount on list pages that open `<details>` (or later art panels) from the URL hash. */
export function HashOpen(): null {
  useHashOpen()
  return null
}
