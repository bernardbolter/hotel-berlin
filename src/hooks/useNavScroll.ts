'use client'

import { useEffect, useRef, useState } from 'react'

const TOP_ZONE = 60

export type NavScrollState = 'visible' | 'hidden-secondary'

export function useNavScroll() {
  const lastY = useRef(0)
  const headerRef = useRef<HTMLElement>(null)
  const [navState, setNavState] = useState<NavScrollState>('visible')

  useEffect(() => {
    const header = headerRef.current
    if (!header) return

    const measure = () => {
      const secondary = header.querySelector<HTMLElement>('.nav-secondary-clip .nav-secondary')
      if (!secondary) return
      header.style.setProperty('--nav-secondary-height', `${secondary.offsetHeight}px`)
    }

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

    const raf = requestAnimationFrame(() => {
      measure()
      lastY.current = window.scrollY
    })

    const secondary = header.querySelector<HTMLElement>('.nav-secondary-clip .nav-secondary')
    const resizeObserver =
      secondary && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(measure)
        : null
    resizeObserver?.observe(secondary!)

    window.addEventListener('resize', measure)
    window.addEventListener('scroll', handler, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      resizeObserver?.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', handler)
    }
  }, [])

  return { headerRef, navState }
}
