/** Surfaces that share the guided hero-slides manager. */
export const HERO_SLIDE_CONTEXTS = ['homepage', 'here', 'eat-and-drink'] as const

export type HeroSlideContext = (typeof HERO_SLIDE_CONTEXTS)[number]

export function isHeroSlideContext(value: unknown): value is HeroSlideContext {
  return (
    typeof value === 'string' &&
    (HERO_SLIDE_CONTEXTS as readonly string[]).includes(value)
  )
}

/** Paths to revalidate when slides for a context change. */
export function heroPathsForContext(context: HeroSlideContext): string[] {
  if (context === 'here') return ['/here', '/de/hier', '/en/here']
  if (context === 'eat-and-drink') {
    return ['/', '/de', '/en', '/restaurant', '/de/restaurant', '/en/restaurant']
  }
  return ['/', '/de', '/en']
}
