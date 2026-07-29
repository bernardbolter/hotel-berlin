/**
 * Nachbarschaft / You Me & Berlin seed batch v1
 * Source: doc/here/HotelBerlin_Nachbarschaft_SeedData_v1.md
 *
 * People are seeded as draft (not live). Places are active so the pipe can be
 * smoke-tested. Geo / walkingMinutes intentionally empty until geocoding pass.
 */
import 'dotenv/config'
import { getPayload } from 'payload'

import config from '../payload.config'
import peopleSeed from './data/neighbourhood-v1-people.json'
import placesSeed from './data/neighbourhood-v1-places.json'

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
    shortBio: 'shortBio' in person ? person.shortBio : undefined,
    quote: 'quote' in person ? person.quote : undefined,
    website: 'website' in person ? person.website : undefined,
    roomNumber: 'roomNumber' in person ? person.roomNumber : undefined,
    basedIn: 'basedIn' in person ? person.basedIn : undefined,
    type: person.type as 'artist' | 'curator' | 'host' | 'partner' | 'staff' | 'local',
    status: person.status as 'draft' | 'published',
  }

  if (existing.docs[0]) {
    await payload.update({
      collection: 'people',
      id: existing.docs[0].id,
      data,
    })
    console.log(`Updated person: ${person.name}`)
    return existing.docs[0].id
  }

  const created = await payload.create({
    collection: 'people',
    data,
  })
  console.log(`Created person: ${person.name}`)
  return created.id
}

async function seed() {
  const payload = await getPayload({ config })

  const personIdsBySlug = new Map<string, number>()

  console.log('--- Seeding people (7) ---')
  for (const person of peopleSeed) {
    const id = await upsertPerson(payload, person)
    personIdsBySlug.set(person.slug, Number(id))
  }

  console.log('--- Seeding neighbourhood-places (8) ---')
  for (const place of placesSeed) {
    const existing = await payload.find({
      collection: 'neighbourhood-places',
      where: { slug: { equals: place.slug } },
      limit: 1,
    })

    const endorsements = (place.endorsements ?? []).map((entry) => {
      const personId = personIdsBySlug.get(entry.person)
      if (personId == null) {
        throw new Error(
          `Place "${place.slug}" references unknown person slug "${entry.person}"`,
        )
      }
      return {
        person: personId,
        quote: entry.quote,
        associatedRoom: entry.associatedRoom,
      }
    })

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
        addressLocality: place.address.addressLocality,
      },
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
      })
      console.log(`Updated place: ${place.name}`)
    } else {
      await payload.create({
        collection: 'neighbourhood-places',
        data,
        locale: 'de',
      })
      console.log(`Created place: ${place.name}`)
    }
  }

  console.log('--- Smoke checks (depth: 2) ---')

  const koenig = await payload.find({
    collection: 'neighbourhood-places',
    where: { slug: { equals: 'koenig-galerie' } },
    depth: 2,
    limit: 1,
  })
  const koenigDoc = koenig.docs[0]
  const koenigPerson = koenigDoc?.endorsements?.[0]?.person
  if (typeof koenigPerson === 'object' && koenigPerson?.name === 'Kristiane Kegelmann') {
    console.log('✓ koenig-galerie endorsements[0].person resolved:', koenigPerson.name)
  } else {
    console.error('✗ koenig-galerie person not resolved at depth 2:', koenigPerson)
    process.exitCode = 1
  }

  const schloss = await payload.find({
    collection: 'neighbourhood-places',
    where: { slug: { equals: 'schloss-charlottenburg' } },
    depth: 2,
    limit: 1,
  })
  const schlossDoc = schloss.docs[0]
  const schlossEndorsements = schlossDoc?.endorsements ?? []
  if (schlossEndorsements.length === 2) {
    const rooms = schlossEndorsements.map((e) => e.associatedRoom).sort()
    const names = schlossEndorsements.map((e) =>
      typeof e.person === 'object' && e.person ? e.person.name : String(e.person),
    )
    console.log('✓ schloss-charlottenburg endorsements:', names.join(' + '))
    console.log('✓ associatedRoom per endorsement:', rooms.join(' / '))
    if (rooms.join('/') !== '1273/1337') {
      console.error('✗ expected rooms 1273 and 1337, got', rooms)
      process.exitCode = 1
    }
  } else {
    console.error('✗ expected 2 endorsements, got', schlossEndorsements.length)
    process.exitCode = 1
  }

  const unattributed = await payload.find({
    collection: 'neighbourhood-places',
    where: {
      slug: { in: ['hamburger-bahnhof', 'neue-nationalgalerie'] },
    },
    depth: 2,
    limit: 2,
  })
  for (const doc of unattributed.docs) {
    const count = doc.endorsements?.length ?? 0
    if (count === 0) {
      console.log(`✓ ${doc.slug}: no endorsements`)
    } else {
      console.error(`✗ ${doc.slug}: expected 0 endorsements, got ${count}`)
      process.exitCode = 1
    }
  }

  console.log('Seed v1 complete.')
  process.exit(process.exitCode ?? 0)
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
