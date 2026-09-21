'use client'

import { useEffect } from 'react'

function navOffset(): number {
  const header = document.querySelector<HTMLElement>('.site-nav-header')
  if (header) return header.getBoundingClientRect().height
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--site-nav-height')
  const parsed = Number.parseFloat(raw)
  return Number.isFinite(parsed) ? parsed : 112
}

function focusTarget(el: HTMLElement): HTMLElement {
  if (el instanceof HTMLDetailsElement) {
    return el.querySelector('summary') ?? el
  }
  const heading = el.querySelector<HTMLElement>('h2, h3, [tabindex]')
  return heading ?? el
}

function openElement(el: HTMLElement): void {
  if (el instanceof HTMLDetailsElement) {
    el.open = true
    return
  }
  if (el.hasAttribute('hidden')) {
    el.removeAttribute('hidden')
  }
}

function hashId(): string {
  return decodeURIComponent(window.location.hash.replace(/^#/, ''))
}

function openFromHash(): void {
  const id = hashId()
  if (!id) return
  const el = document.getElementById(id)
  if (!el) return

  openElement(el)
  const top = el.getBoundingClientRect().top + window.scrollY - navOffset()
  window.scrollTo({ top: Math.max(0, top), behavior: 'auto' })
  const target = focusTarget(el)
  if (!target.hasAttribute('tabindex') && target.tabIndex < 0) {
    target.setAttribute('tabindex', '-1')
  }
  target.focus({ preventScroll: true })
}

function stripHash(): void {
  const { pathname, search } = window.location
  window.history.replaceState(null, '', `${pathname}${search}`)
}

/**
 * Deep-link into in-page rows. `replaceState` only — back leaves the page.
 * Unknown hashes are ignored.
 */
export function useHashOpen(): void {
  useEffect(() => {
    openFromHash()

    const onHashChange = () => {
      if (!hashId()) return
      openFromHash()
    }

    const onToggle = (event: Event) => {
      const details = event.target
      if (!(details instanceof HTMLDetailsElement) || !details.id) return
      if (details.open) {
        window.history.replaceState(null, '', `#${details.id}`)
      } else if (hashId() === details.id) {
        stripHash()
      }
    }

    window.addEventListener('hashchange', onHashChange)
    document.addEventListener('toggle', onToggle, true)
    return () => {
      window.removeEventListener('hashchange', onHashChange)
      document.removeEventListener('toggle', onToggle, true)
    }
  }, [])
}
