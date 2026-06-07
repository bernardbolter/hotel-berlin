import type { Place } from '@/lib/queries/places'

export function placeToJsonLd(place: Place): object {
  return {
    '@context': 'https://schema.org',
    '@type': place.schemaType,
    '@id': `https://hotel-berlin.de/neighbourhood#${place.slug}`,
    name: place.name,
    description: place.shortDescription,
    ...(place.address && { address: place.address }),
    geo: {
      '@type': 'GeoCoordinates',
      latitude: place.location.lat,
      longitude: place.location.lng,
    },
    ...(place.website && { url: place.website }),
    ...(place.walkingMinutes && {
      additionalProperty: {
        '@type': 'PropertyValue',
        name: 'walkingMinutesFromHotel',
        value: place.walkingMinutes,
      },
    }),
    containedInPlace: {
      '@type': 'Hotel',
      '@id': 'https://hotel-berlin.de/#hotel',
      name: 'Hotel Berlin, Berlin',
    },
  }
}
