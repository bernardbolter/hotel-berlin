export const OPEN_BOOKING_EVENT = 'hotelberlin:open-booking'

/** Open the site booking panel from CTAs outside SiteNav (footer strip, etc.). */
export function requestOpenBookingPanel(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(OPEN_BOOKING_EVENT))
}
