import {
  Baby,
  FerrisWheel,
  Landmark,
  Martini,
  Palette,
  PartyPopper,
  ShoppingBag,
  TreePine,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'

import type { PlaceCategory } from '@/lib/neighbourhood/constants'

/** Shared Lucide glyphs — PlaceCard badges and MapPin markers stay in sync. */
export const CATEGORY_LUCIDE_ICON: Record<PlaceCategory, LucideIcon> = {
  Art: Palette,
  Bar: Martini,
  Kids: Baby,
  Museum: Landmark,
  'Parks and Nature': TreePine,
  Party: PartyPopper,
  Restaurant: UtensilsCrossed,
  Shopping: ShoppingBag,
  Sightseeing: FerrisWheel,
}
