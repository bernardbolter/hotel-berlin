import type {
  Authority,
  AuthorityIdentifier,
  NeighbourhoodPlace as AeoPlace,
  Person as AeoPerson,
  PlaceCategory,
  PlaceSchemaType,
} from '@/lib/aeo-schema/src/types'
import type { NeighbourhoodPlace as PayloadPlace, Person as PayloadPerson } from '@/payload-types'

function mapAuthority(
  authority:
    | {
        identifier?: { propertyID: string; value: string }[] | null
        sameAs?: { url: string }[] | null
      }
    | null
    | undefined,
): Authority | undefined {
  if (!authority) return undefined

  const identifier = authority.identifier
    ?.filter((entry) => entry.propertyID && entry.value)
    .map(
      (entry) =>
        ({
          propertyID: entry.propertyID,
          value: entry.value,
        }) as AuthorityIdentifier,
    )

  const sameAs = authority.sameAs?.map((entry) => entry.url).filter(Boolean)

  if ((!identifier || identifier.length === 0) && (!sameAs || sameAs.length === 0)) {
    return undefined
  }

  return {
    ...(identifier && identifier.length > 0 ? { identifier } : {}),
    ...(sameAs && sameAs.length > 0 ? { sameAs } : {}),
  }
}

export function toAeoPerson(doc: PayloadPerson): AeoPerson {
  return {
    id: String(doc.id),
    slug: doc.slug,
    name: doc.name,
    jobTitle: doc.jobTitle ?? undefined,
    shortBio: doc.shortBio ?? undefined,
    quote: doc.quote ?? undefined,
    website: doc.website ?? undefined,
    instagram: doc.instagram ?? undefined,
    roomNumber: doc.roomNumber ?? undefined,
    basedIn: doc.basedIn ?? undefined,
    type: doc.type ?? undefined,
    authority: mapAuthority(doc.authority),
    status: doc.status,
  }
}

/**
 * Maps a Payload neighbourhood-place (depth ≥ 2 so endorsements.person is populated)
 * into the aeo-schema NeighbourhoodPlace shape. Endorsements whose person is still
 * an unresolved id are dropped — builders require a full Person object.
 */
export function toAeoPlace(doc: PayloadPlace): AeoPlace {
  const endorsements = (doc.endorsements ?? [])
    .map((entry) => {
      if (typeof entry.person !== 'object' || !entry.person) return null
      return {
        person: toAeoPerson(entry.person),
        quote: entry.quote,
      }
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry != null)

  const geo =
    doc.geo?.latitude != null && doc.geo?.longitude != null
      ? { latitude: doc.geo.latitude, longitude: doc.geo.longitude }
      : undefined

  return {
    id: String(doc.id),
    slug: doc.slug,
    name: doc.name,
    category: doc.category as PlaceCategory,
    schemaType: doc.schemaType as PlaceSchemaType,
    address: {
      streetAddress: doc.address?.streetAddress ?? undefined,
      addressLocality: doc.address?.addressLocality || 'Berlin',
      postalCode: doc.address?.postalCode ?? undefined,
    },
    geo,
    walkingMinutes: doc.walkingMinutes ?? undefined,
    distanceTier: doc.distanceTier ?? undefined,
    indoorOutdoor: doc.indoorOutdoor ?? undefined,
    targetAudience: doc.targetAudience
      ?.map((row) => row.label)
      .filter((label): label is string => Boolean(label)),
    description: doc.description ?? undefined,
    endorsements: endorsements.length > 0 ? endorsements : undefined,
    website: doc.website ?? undefined,
    openingHours: doc.openingHours ?? undefined,
    priceRange: doc.priceRange ?? undefined,
    authority: mapAuthority(doc.authority),
    status: doc.status,
  }
}

/**
 * Reverse-join picks for a person page: each place this person endorsed,
 * paired with their endorsement quote on that place.
 */
export function picksFromPersonDoc(
  person: PayloadPerson,
): { place: AeoPlace; quote: string }[] {
  const docs = person.picks?.docs ?? []
  const picks: { place: AeoPlace; quote: string }[] = []

  for (const doc of docs) {
    if (typeof doc !== 'object' || !doc) continue

    const endorsement = doc.endorsements?.find((entry) => {
      const personId = typeof entry.person === 'object' ? entry.person?.id : entry.person
      return personId === person.id
    })

    if (!endorsement?.quote) continue

    picks.push({
      place: toAeoPlace(doc),
      quote: endorsement.quote,
    })
  }

  return picks
}
