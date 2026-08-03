'use client'

import { useEffect, useRef, useState } from 'react'

const TOP_ZONE = 60

export type NavScrollState = 'visible' | 'hidden-secondary'

export function useNavScroll() {
  const lastY = useRef(0)
  const headerRef = useRef<HTMLElement>(null)
  const [navState, setNavState] = useState<NavScrollState>('visible')

  useEffect(() => {
    const handler = () => {
      const y = window.scrollY

      if (y < TOP_ZONE) {
        setNavState('visible')
      } else if (y > lastY.current) {
        setNavState('hidden-secondary')
      } else if (y < lastY.current) {
        setNavState('visible')
      }

      lastY.current = y
    }

    lastY.current = window.scrollY
    window.addEventListener('scroll', handler, { passive: true })

    return () => {
      window.removeEventListener('scroll', handler)
    }
  }, [])

  return { headerRef, navState }
}
