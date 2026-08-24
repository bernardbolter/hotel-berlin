import { HOTEL_PIN_COLOR } from '@/lib/neighbourhood/categories'
import { personInitials } from '@/lib/people/initials'

type Props = {
  name: string
  /** Override computed initials. */
  initials?: string
  portraitUrl?: string | null
  portraitAlt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'pin' | 'pinActive'
  className?: string
}

const SIZE: Record<NonNullable<Props['size']>, string> = {
  sm: 'h-5 w-5 text-[9px]',
  md: 'h-8 w-8 text-[11px]',
  lg: 'h-12 w-12 text-ui-sm',
  xl: 'h-28 w-28 text-ui-2xl md:h-36 md:w-36',
  pin: 'h-8 w-8 text-[10px]',
  pinActive: 'h-9 w-9 text-[11px]',
}

/**
 * Portrait or initials-on-ink. Used by MapPin `variant="person"`, PersonCard,
 * PlaceInfoCard person emphasis, and person detail — one fallback, not a stock photo.
 */
export function InitialsAvatar({
  name,
  initials,
  portraitUrl,
  portraitAlt = '',
  size = 'md',
  className = '',
}: Props) {
  const letters = (initials ?? personInitials(name)).slice(0, 2)
  const sizeClass = SIZE[size]

  if (portraitUrl) {
    return (
      // Native img: Mapbox marker hosts and small chips don't need next/image.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={portraitUrl}
        alt={portraitAlt || name}
        className={`shrink-0 rounded-full object-cover ${sizeClass} ${className}`}
      />
    )
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-ui font-medium text-white ${sizeClass} ${className}`}
      style={{ backgroundColor: HOTEL_PIN_COLOR }}
      aria-hidden="true"
    >
      {letters}
    </span>
  )
}
