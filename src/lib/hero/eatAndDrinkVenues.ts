/** Venues offered in the Eat & Drink hero place dropdown. */
export const EAT_AND_DRINK_VENUE_SLUGS = ['lutze', 'wundermart', 'fruehstueck'] as const

export type EatAndDrinkVenueSlug = (typeof EAT_AND_DRINK_VENUE_SLUGS)[number]

export function isEatAndDrinkVenueSlug(slug: string | null | undefined): slug is EatAndDrinkVenueSlug {
  return Boolean(slug && (EAT_AND_DRINK_VENUE_SLUGS as readonly string[]).includes(slug))
}
