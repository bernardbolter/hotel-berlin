'use client'

import { useEffect, useState } from 'react'

const DEFAULT_MS = 28

/** Types `text` character-by-character; shows full text immediately when disabled. */
export function useTypewriter(text: string, enabled: boolean, ms = DEFAULT_MS) {
  const [display, setDisplay] = useState(text)

  useEffect(() => {
    if (!enabled) {
      setDisplay(text)
      return
    }

    setDisplay('')
    let index = 0
    const timer = window.setInterval(() => {
      index += 1
      setDisplay(text.slice(0, index))
      if (index >= text.length) window.clearInterval(timer)
    }, ms)

    return () => window.clearInterval(timer)
  }, [enabled, ms, text])

  return display
}
