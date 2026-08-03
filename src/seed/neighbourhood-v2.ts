/**
 * Nachbarschaft / You Me & Berlin seed batch v2 (addendum)
 * Source: doc/payload/HotelBerlin_Nachbarschaft_SeedData_v2.md
 *
 * Adds 9 people + 10 places on top of v1 (20 places total once both seeded).
 * Brief header says "12 places" but the JSON block lists 10 — seeding those 10.
 * Requires v1 people (at least kristiane-kegelmann) for Nobelhart endorsement.
 */
import 'dotenv/config'
import { getPayload } from 'payload'

import config from '../payload.config'
import peopleSeed from './data/neighbourhood-v2-people.json'
import placesSeed from './data/neighbourhood-v2-places.json'

type PersonSeed = (typeof peopleSeed)[number]
type PlaceSeed = (typeof placesSeed)[number]

async function upsertPerson(
  payload: Awaited<ReturnType<typeof getPayload>>,
  person: PersonSeed,
) {
  const existing = await payload.find({
    collection: 'people',
    where: { slug: { equals: person.slug } },
    limit: 1,
  })

  const data = {
    name: person.name,
    slug: person.slug,
    generateSlug: false,
    jobTitle: 'jobTitle' in person ? person.jobTitle : undefined,
    website: 'website' in person ? person.website : undefined,
    roomNumber: 'roomNumber' in person ? person.roomNumber : undefined,
    type: person.type as 'artist' | 'curator' | 'host' | 'partner' | 'staff' | 'local',
    status: person.status as 'draft' | 'published',
  }

  if (existing.docs[0]) {
    await payload.update({
      collection: 'people',
      id: existing.docs[0].id,
      data,
      overrideAccess: true,
    })
    console.log(`Updated person: ${person.name}`)
    return existing.docs[0].id
  }

  const created = await payload.create({
    collection: 'people',
    data,
    overrideAccess: true,
  })
  console.log(`Created person: ${person.name}`)
  return created.id
}

async function resolvePersonId(
  payload: Awaited<ReturnType<typeof getPayload>>,
  slug: string,
  cache: Map<string, number>,
) {
  const cached = cache.get(slug)
  if (cached != null) return cached

  const found = await payload.find({
    collection: 'people',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  const id = found.docs[0]?.id
  if (id == null) {
    throw new Error(
      `Person slug "${slug}" not found — run seed:neighbourhood-v1 first if this is a v1 person.`,
    )
  }
  const numeric = Number(id)
  cache.set(slug, numeric)
  return numeric
}

async function seed() {
  process.env.SKIP_GEOCODE_HOOK = '1'
  const payload = await getPayload({ config })
  const personIdsBySlug = new Map<string, number>()

  console.log(`--- Seeding v2 people (${peopleSeed.length}) ---`)
  for (const person of peopleSeed) {
    const id = await upsertPerson(payload, person)
    personIdsBySlug.set(person.slug, Number(id))
  }

  // v2 lean: four xlsx rows agree on 1185 for Kristiane (still confirm with hotel)
  const kristiane = await payload.find({
    collection: 'people',
    where: { slug: { equals: 'kristiane-kegelmann' } },
    limit: 1,
  })
  if (kristiane.docs[0]) {
    await payload.update({
      collection: 'people',
      id: kristiane.docs[0].id,
      data: { roomNumber: '1185' },
      overrideAccess: true,
    })
    personIdsBySlug.set('kristiane-kegelmann', Number(kristiane.docs[0].id))
    console.log('Updated kristiane-kegelmann roomNumber → 1185 (v2 evidence lean)')
  } else {
    console.warn('kristiane-kegelmann missing — Nobelhart endorsement will fail without v1 seed')
  }

  console.log(`--- Seeding v2 neighbourhood-places (${placesSeed.length}) ---`)
  for (const place of placesSeed) {
    const existing = await payload.find({
      collection: 'neighbourhood-places',
      where: { slug: { equals: place.slug } },
      limit: 1,
    })

    const endorsements = []
    for (const entry of place.endorsements ?? []) {
      const personId = await resolvePersonId(payload, entry.person, personIdsBySlug)
      endorsements.push({
        person: personId,
        quote: entry.quote,
        associatedRoom: entry.associatedRoom,
      })
    }

    const placeAddress = place.address as {
      streetAddress?: string
      addressLocality: string
      postalCode?: string
    }
    const placeGeo =
      'geo' in place ? (place as { geo?: { latitude: number; longitude: number } | null }).geo : null
    const walkingMinutes =
      'walkingMinutes' in place
        ? (place as { walkingMinutes?: number | null }).walkingMinutes
        : null
    const distanceTier =
      'distanceTier' in place
        ? (place as { distanceTier?: 'walkable' | 'short-transit' | 'further-out' | null })
            .distanceTier
        : null

    const data = {
      name: place.name,
      slug: place.slug,
      category: place.category as
        | 'Art'
        | 'Bar'
        | 'Kids'
        | 'Museum'
        | 'Parks and Nature'
        | 'Party'
        | 'Restaurant'
        | 'Shopping'
        | 'Sightseeing',
      schemaType: place.schemaType as
        | 'TouristAttraction'
        | 'LocalBusiness'
        | 'Museum'
        | 'Park'
        | 'Restaurant'
        | 'BarOrPub'
        | 'ShoppingCenter',
      address: {
        streetAddress: placeAddress.streetAddress,
        addressLocality: placeAddress.addressLocality,
        postalCode: placeAddress.postalCode,
      },
      ...(placeGeo?.latitude != null && placeGeo?.longitude != null
        ? { geo: { latitude: placeGeo.latitude, longitude: placeGeo.longitude } }
        : {}),
      ...(walkingMinutes != null ? { walkingMinutes } : {}),
      ...(distanceTier != null ? { distanceTier } : {}),
      indoorOutdoor: place.indoorOutdoor as 'indoor' | 'outdoor' | 'both',
      targetAudience: (place.targetAudience ?? []).map((label) => ({ label })),
      description: place.description,
      endorsements,
      status: place.status as 'active' | 'inactive',
    }

    if (existing.docs[0]) {
      await payload.update({
        collection: 'neighbourhood-places',
        id: existing.docs[0].id,
        data,
        locale: 'de',
        overrideAccess: true,
      })
      console.log(`Updated place: ${place.name}`)
    } else {
      await payload.create({
        collection: 'neighbourhood-places',
        data,
        locale: 'de',
        overrideAccess: true,
      })
      console.log(`Created place: ${place.name}`)
    }
  }

  console.log('--- Smoke checks ---')
  const places = await payload.find({
    collection: 'neighbourhood-places',
    limit: 100,
    pagination: false,
  })
  const people = await payload.find({
    collection: 'people',
    limit: 100,
    pagination: false,
  })
  console.log(`✓ neighbourhood-places total: ${places.docs.length} (expect ≥ 18 = 8 v1 + 10 v2)`)
  console.log(`✓ people total: ${people.docs.length} (expect ≥ 16 = 7 v1 + 9 v2)`)

  const nobelhart = await payload.find({
    collection: 'neighbourhood-places',
    where: { slug: { equals: 'nobelhart-und-schmutzig' } },
    depth: 2,
    limit: 1,
  })
  const endo = nobelhart.docs[0]?.endorsements?.[0]
  const person = endo?.person
  if (typeof person === 'object' && person?.slug === 'kristiane-kegelmann') {
    console.log('✓ nobelhart-und-schmutzig → kristiane-kegelmann')
    console.log('✓ quote:', endo?.quote)
  } else {
    console.error('✗ nobelhart endorsement person not resolved:', person)
    process.exitCode = 1
  }

  const olympia = await payload.find({
    collection: 'neighbourhood-places',
    where: { slug: { equals: 'olympiastadion' } },
    depth: 2,
    limit: 1,
  })
  const olympiaPerson = olympia.docs[0]?.endorsements?.[0]?.person
  if (typeof olympiaPerson === 'object' && olympiaPerson?.slug === 'jennifer-oeser') {
    console.log('✓ olympiastadion → jennifer-oeser')
  } else {
    console.error('✗ olympiastadion person not resolved:', olympiaPerson)
    process.exitCode = 1
  }

  console.log('Seed v2 complete.')
  process.exit(process.exitCode ?? 0)
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
