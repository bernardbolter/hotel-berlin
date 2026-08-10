/**
 * Old live-site room URL segments → new Payload room slugs.
 * Source: scraped EN/DE folder names + HotelBerlin_RoomsPages_BuildBrief §8.
 */
export const ROOM_REDIRECT_SLUGS: {
  newSlug: string
  enOld: string
  deOld: string
}[] = [
  { newSlug: 'individual', enOld: 'individual-room', deOld: 'einzelzimmer' },
  { newSlug: 'cosy-small', enOld: 'cosy-small-room', deOld: 'gemuetliches-kleines-zimmer' },
  { newSlug: 'standard', enOld: 'standard-room', deOld: 'standard' },
  { newSlug: 'superior', enOld: 'superior-room', deOld: 'superior' },
  { newSlug: 'family', enOld: 'family-room', deOld: 'familien-zimmer' },
  { newSlug: 'premium-family', enOld: 'premium-family-room', deOld: 'premium-family-zimmer' },
  { newSlug: 'premium', enOld: 'premium-room', deOld: 'premium' },
  { newSlug: 'junior-suite', enOld: 'junior-suite', deOld: 'junior-suite' },
  { newSlug: 'suite-one-bedroom', enOld: 'suite-one-bedroom', deOld: 'suite-one-bedroom' },
  { newSlug: 'corner-suite', enOld: 'corner-suite', deOld: 'corner-suite' },
  { newSlug: 'studio-45', enOld: 'studio45-suite', deOld: 'studio45-suite' },
]

/** Extra EN aliases that also pointed at a room type on the live site. */
const EN_EXTRA_ALIASES: { old: string; newSlug: string }[] = [
  { old: 'executive-suite', newSlug: 'junior-suite' },
]

export function buildRoomRedirects(): { source: string; destination: string; permanent: boolean }[] {
  const redirects: { source: string; destination: string; permanent: boolean }[] = [
    {
      source: '/en/sleep-relax/rooms-suites',
      destination: '/en/rooms',
      permanent: true,
    },
    {
      source: '/en/sleep-relax',
      destination: '/en/rooms',
      permanent: true,
    },
    {
      source: '/ubernachten-relaxen/zimmer-suiten',
      destination: '/de/zimmer',
      permanent: true,
    },
    {
      source: '/ubernachten-relaxen',
      destination: '/de/zimmer',
      permanent: true,
    },
    {
      source: '/de/ubernachten-relaxen/zimmer-suiten',
      destination: '/de/zimmer',
      permanent: true,
    },
    {
      source: '/de/ubernachten-relaxen',
      destination: '/de/zimmer',
      permanent: true,
    },
  ]

  for (const room of ROOM_REDIRECT_SLUGS) {
    redirects.push(
      {
        source: `/en/sleep-relax/rooms-suites/${room.enOld}`,
        destination: `/en/rooms/${room.newSlug}`,
        permanent: true,
      },
      {
        source: `/ubernachten-relaxen/zimmer-suiten/${room.deOld}`,
        destination: `/de/zimmer/${room.newSlug}`,
        permanent: true,
      },
      {
        source: `/de/ubernachten-relaxen/zimmer-suiten/${room.deOld}`,
        destination: `/de/zimmer/${room.newSlug}`,
        permanent: true,
      },
    )
  }

  for (const alias of EN_EXTRA_ALIASES) {
    redirects.push({
      source: `/en/sleep-relax/rooms-suites/${alias.old}`,
      destination: `/en/rooms/${alias.newSlug}`,
      permanent: true,
    })
  }

  return redirects
}
