import type { JsonLdNode, NeighbourhoodPlace, SiteConfig } from '../types';
import { placeNodeId, reviewNodeId } from '../lib/ids';
import { buildAuthorityProps } from '../lib/authority';
import { prune } from '../lib/prune';

export function buildPlaceRef(place: NeighbourhoodPlace, config: SiteConfig): JsonLdNode {
  return prune({
    '@type': place.schemaType,
    '@id': placeNodeId(place.slug, config),
    name: place.name,
  });
}

/**
 * `walkingMinutesFromHotel` has no native schema.org property — this is
 * the correct extensible pattern (`additionalProperty` / `PropertyValue`)
 * for a fact that matters a great deal for this hotel's AEO strategy but
 * isn't a standard vocabulary term. Don't be tempted to bury it in
 * `description` prose instead — that makes it unparseable.
 */
function buildAdditionalProperty(place: NeighbourhoodPlace) {
  const props: { '@type': 'PropertyValue'; name: string; value: string | number }[] = [];

  if (place.walkingMinutes !== undefined) {
    props.push({
      '@type': 'PropertyValue',
      name: 'walkingMinutesFromHotel',
      value: place.walkingMinutes,
    });
  }

  if (place.distanceTier) {
    props.push({
      '@type': 'PropertyValue',
      name: 'distanceTierFromHotel',
      value: place.distanceTier,
    });
  }

  return props.length > 0 ? props : undefined;
}

/**
 * The full Place node — rendered on the place's own detail page
 * (`/nachbarschaft/[slug]`). `review` is an array of @id-only references
 * into Review nodes that live under this same URL (`#review-{personSlug}`)
 * — see reviewNodeId(). This is what makes the many-to-many endorsement
 * case (two people recommending the same place) fall out for free: it's
 * just two entries in this array, no special-casing required.
 */
export function buildPlaceNode(place: NeighbourhoodPlace, config: SiteConfig): JsonLdNode {
  const { sameAs, identifier } = buildAuthorityProps(place.authority);

  const review =
    place.endorsements && place.endorsements.length > 0
      ? place.endorsements.map((e) => ({
          '@id': reviewNodeId(place.slug, e.person.slug, config),
        }))
      : undefined;

  return prune({
    '@type': place.schemaType,
    '@id': placeNodeId(place.slug, config),
    name: place.name,
    description: place.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: place.address.streetAddress,
      addressLocality: place.address.addressLocality,
      postalCode: place.address.postalCode,
      addressCountry: 'DE',
    },
    geo: place.geo
      ? {
          '@type': 'GeoCoordinates',
          latitude: place.geo.latitude,
          longitude: place.geo.longitude,
        }
      : undefined,
    url: place.website,
    openingHours: place.openingHours,
    priceRange: place.priceRange,
    additionalProperty: buildAdditionalProperty(place),
    review,
    sameAs,
    identifier,
  });
}
