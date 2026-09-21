/**
 * Test-site seed: 6 endorsers + 10 curated tips for /here §6.
 * Placeholder imagery. Do not treat as production photography or rooms.
 *
 *   npm run seed:curated-tips
 */
import 'dotenv/config'
import './guard'
import { getPayload } from 'payload'

import { enrichNeighbourhoodPlace } from '../lib/geocode'
import { HUB_TIP_SLUGS } from '../lib/here/pickHubTips'
import config from '../payload.config'

type PersonSeed = {
  slug: string
  aliases?: string[]
  name: string
  jobTitle: string
  website?: string
  roomNumber?: string | null
  roomConfirmed: boolean
  type: 'artist' | 'host'
  displayOrder: number
}

type PlaceSeed = {
  slug: string
  name: string
  category: 'Art' | 'Museum' | 'Restaurant' | 'Sightseeing'
  secondaryCategory?: 'Art'
  schemaType: 'TouristAttraction' | 'Museum' | 'Restaurant' | 'LocalBusiness'
  indoorOutdoor: 'indoor' | 'outdoor' | 'both'
  targetAudience: string[]
  description: { de: string; en: string }
  address: { streetAddress?: string; addressLocality: string; postalCode?: string }
  endorser: string
  listedDistrict: string
}

const PEOPLE: PersonSeed[] = [
  {
    slug: 'iris-berndt',
    name: 'Dr. Iris Berndt',
    jobTitle: 'Direktorin des Käthe-Kollwitz-Museums, Kunsthistorikerin',
    website: 'https://irisberndt.de',
    roomNumber: '1171',
    roomConfirmed: true,
    type: 'host',
    displayOrder: 1,
  },
  {
    slug: 'christiane-fritsch-weith',
    name: 'Christiane Fritsch-Weith',
    jobTitle: 'Buchhändlerin in dritter Generation, seit 1919',
    website: 'https://buchladen-bayerischer-platz.de',
    roomNumber: '1169',
    roomConfirmed: true,
    type: 'host',
    displayOrder: 2,
  },
  {
    slug: 'jennifer-oeser',
    name: 'Jennifer Oeser',
    jobTitle: 'Leichtathletin, Olympia-Medaillengewinnerin',
    website: 'https://de.wikipedia.org/wiki/Jennifer_Oeser',
    roomNumber: '1314',
    roomConfirmed: true,
    type: 'host',
    displayOrder: 3,
  },
  {
    slug: 'kristiane-kegelmann',
    name: 'Kristiane Kegelmann',
    jobTitle: 'Künstlerin, Bildhauerei',
    website: 'https://kristianekegelmann.com',
    roomNumber: null,
    roomConfirmed: false,
    type: 'artist',
    displayOrder: 4,
  },
  {
    slug: 'gita-kurdpoor',
    aliases: ['gita-kudpoor'],
    name: 'Gita Kurdpoor',
    jobTitle: 'Künstlerin',
    website: 'https://gitakurdpoor.com',
    roomNumber: null,
    roomConfirmed: false,
    type: 'artist',
    displayOrder: 5,
  },
  {
    slug: 'katja-morkel',
    name: 'Katja Morkel',
    jobTitle: 'Schmuckdesignerin',
    website: 'https://morkel.de',
    roomNumber: null,
    roomConfirmed: false,
    type: 'artist',
    displayOrder: 6,
  },
]

const PLACES: PlaceSeed[] = [
  {
    slug: 'kaethe-kollwitz-museum',
    name: 'Käthe-Kollwitz-Museum',
    category: 'Museum',
    secondaryCategory: 'Art',
    schemaType: 'Museum',
    indoorOutdoor: 'indoor',
    targetAudience: ['Alle'],
    description: {
      de: 'Museum mit starkem künstlerischem Profil.',
      en: 'Museum with a strong artistic profile.',
    },
    address: {
      streetAddress: 'Fasanenstraße 24',
      addressLocality: 'Berlin',
      postalCode: '10719',
    },
    endorser: 'iris-berndt',
    listedDistrict: 'Charlottenburg',
  },
  {
    slug: 'bayerischer-platz',
    name: 'Bayerischer Platz',
    category: 'Sightseeing',
    schemaType: 'TouristAttraction',
    indoorOutdoor: 'outdoor',
    targetAudience: ['Alle'],
    description: {
      de: 'Ruhiger Platz mit schönem Kiezcharakter.',
      en: 'A quiet square with a neighbourhood character.',
    },
    address: {
      streetAddress: 'Bayerischer Platz',
      addressLocality: 'Berlin',
      postalCode: '10779',
    },
    endorser: 'christiane-fritsch-weith',
    listedDistrict: 'Schöneberg',
  },
  {
    slug: 'olympiastadion',
    name: 'Olympiastadion',
    category: 'Museum',
    schemaType: 'TouristAttraction',
    indoorOutdoor: 'both',
    targetAudience: ['Alle'],
    description: {
      de: 'Historischer Ort mit Führungs- und Besuchswert.',
      en: 'A historic site worth a tour or a visit.',
    },
    address: {
      streetAddress: 'Olympischer Platz 3',
      addressLocality: 'Berlin',
      postalCode: '14053',
    },
    endorser: 'jennifer-oeser',
    listedDistrict: 'Charlottenburg',
  },
  {
    slug: 'koenig-galerie',
    name: 'König Galerie',
    category: 'Art',
    schemaType: 'TouristAttraction',
    indoorOutdoor: 'indoor',
    targetAudience: ['Kunstinteressierte'],
    description: {
      de: 'Galerie für zeitgenössische Kunst.',
      en: 'Gallery for contemporary art.',
    },
    address: {
      streetAddress: 'Alexandrinenstraße 118',
      addressLocality: 'Berlin',
      postalCode: '10969',
    },
    endorser: 'kristiane-kegelmann',
    listedDistrict: 'Kreuzberg',
  },
  {
    slug: 'einsunternull',
    name: 'Restaurant Einsunternull',
    category: 'Restaurant',
    schemaType: 'Restaurant',
    indoorOutdoor: 'indoor',
    targetAudience: ['Paare', 'Business'],
    description: {
      de: 'Moderne Küche auf hohem Niveau.',
      en: 'Modern cooking at a high level.',
    },
    address: {
      streetAddress: 'Hannoversche Str. 1',
      addressLocality: 'Berlin',
      postalCode: '10115',
    },
    endorser: 'kristiane-kegelmann',
    listedDistrict: 'Mitte',
  },
  {
    slug: 'lokal',
    name: 'Lokal',
    category: 'Restaurant',
    schemaType: 'Restaurant',
    indoorOutdoor: 'indoor',
    targetAudience: ['Paare', 'Business'],
    description: {
      de: 'Reduzierte, zeitgemäße Küche.',
      en: 'Reduced, contemporary cooking.',
    },
    address: {
      streetAddress: 'Linienstraße 160',
      addressLocality: 'Berlin',
      postalCode: '10115',
    },
    endorser: 'kristiane-kegelmann',
    listedDistrict: 'Mitte',
  },
  {
    slug: 'nobelhart-und-schmutzig',
    name: 'Nobelhart & Schmutzig',
    category: 'Restaurant',
    schemaType: 'Restaurant',
    indoorOutdoor: 'indoor',
    targetAudience: ['Paare', 'Business'],
    description: {
      de: 'Anspruchsvolles Fine Dining mit regionalem Fokus.',
      en: 'Ambitious fine dining with a regional focus.',
    },
    address: {
      streetAddress: 'Friedrichstraße 218',
      addressLocality: 'Berlin',
      postalCode: '10969',
    },
    endorser: 'kristiane-kegelmann',
    listedDistrict: 'Mitte',
  },
  {
    slug: 'holocaust-memorial',
    name: 'Holocaust Memorial',
    category: 'Museum',
    schemaType: 'TouristAttraction',
    indoorOutdoor: 'outdoor',
    targetAudience: ['Alle'],
    description: {
      de: 'Zentrale Gedenkstätte in Berlin.',
      en: "Berlin's central memorial.",
    },
    address: {
      streetAddress: 'Cora-Berliner-Straße 1',
      addressLocality: 'Berlin',
      postalCode: '10117',
    },
    endorser: 'gita-kurdpoor',
    listedDistrict: 'Mitte',
  },
  {
    slug: 'anjoy',
    name: 'Anjoy',
    category: 'Restaurant',
    schemaType: 'Restaurant',
    indoorOutdoor: 'indoor',
    targetAudience: ['Freunde', 'Paare'],
    description: {
      de: 'Vietnamesische Küche in entspannter Umgebung.',
      en: 'Vietnamese cooking in a relaxed setting.',
    },
    address: {
      streetAddress: 'Wörther Straße',
      addressLocality: 'Berlin',
      postalCode: '10435',
    },
    endorser: 'gita-kurdpoor',
    listedDistrict: 'Prenzlauer Berg',
  },
  {
    slug: 'einar-und-bert-bookshop',
    name: 'Einar & Bert Bookshop',
    category: 'Art',
    schemaType: 'LocalBusiness',
    indoorOutdoor: 'indoor',
    targetAudience: ['Alle'],
    description: {
      de: 'Buchladen mit Kulturcharakter.',
      en: 'Bookshop with a cultural character.',
    },
    address: {
      streetAddress: 'Torstraße 68',
      addressLocality: 'Berlin',
      postalCode: '10119',
    },
    endorser: 'katja-morkel',
    listedDistrict: 'Friedrichshain',
  },
]

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function districtFromHit(placeName: string | undefined, listed: string): string {
  const hay = (placeName ?? '').toLowerCase()
  const candidates = [
    'friedrichshain',
    'prenzlauer berg',
    'mitte',
    'kreuzberg',
    'charlottenburg',
    'schöneberg',
    'schoeneberg',
    'tiergarten',
    'wedding',
  ]
  const hit = candidates.find((d) => hay.includes(d))
  if (!hit) return `unparsed (listed ${listed})`
  const normalised = hit === 'schoeneberg' ? 'schöneberg' : hit
  return normalised
}

async function findPerson(
  payload: Awaited<ReturnType<typeof getPayload>>,
  slug: string,
  aliases: string[] = [],
) {
  for (const candidate of [slug, ...aliases]) {
    const found = await payload.find({
      collection: 'people',
      where: { slug: { equals: candidate } },
      limit: 1,
    })
    if (found.docs[0]) return found.docs[0]
  }
  return null
}

async function seed() {
  process.env.SKIP_GEOCODE_HOOK = '1'
  const payload = await getPayload({ config })
  const personIds = new Map<string, number>()

  console.log('--- Curated tips (test site): people ---')
  for (const person of PEOPLE) {
    const existing = await findPerson(payload, person.slug, person.aliases)
    const data = {
      name: person.name,
      slug: person.slug,
      generateSlug: false,
      jobTitle: person.jobTitle,
      website: person.website,
      roomNumber: person.roomConfirmed ? person.roomNumber : null,
      roomConfirmed: person.roomConfirmed,
      type: person.type,
      status: 'published' as const,
      featured: true,
      displayOrder: person.displayOrder,
      portrait: null,
    }

    if (existing) {
      await payload.update({
        collection: 'people',
        id: existing.id,
        data,
        overrideAccess: true,
      })
      personIds.set(person.slug, Number(existing.id))
      console.log(`Updated person ${person.name} (${person.slug}) roomConfirmed=${person.roomConfirmed}`)
    } else {
      const created = await payload.create({
        collection: 'people',
        data,
        overrideAccess: true,
      })
      personIds.set(person.slug, Number(created.id))
      console.log(`Created person ${person.name}`)
    }
  }

  const enabled = await payload.find({
    collection: 'neighbourhood-places',
    where: { 'hereTeaser.enabled': { equals: true } },
    limit: 200,
    depth: 0,
  })
  for (const doc of enabled.docs) {
    await payload.update({
      collection: 'neighbourhood-places',
      id: doc.id,
      data: { hereTeaser: { enabled: false, order: null } },
      overrideAccess: true,
    })
  }

  console.log('--- Curated tips (test site): places ---')
  let order = 1
  for (const place of PLACES) {
    const endorserId = personIds.get(place.endorser)
    if (!endorserId) throw new Error(`Missing endorser ${place.endorser}`)

    const existing = await payload.find({
      collection: 'neighbourhood-places',
      where: { slug: { equals: place.slug } },
      limit: 1,
      depth: 0,
    })

    const existingDoc = existing.docs[0]
    const hasGeo =
      existingDoc?.geo?.latitude != null && existingDoc?.geo?.longitude != null

    let geo = hasGeo
      ? {
          latitude: existingDoc.geo!.latitude!,
          longitude: existingDoc.geo!.longitude!,
        }
      : null
    let walkingMinutes = existingDoc?.walkingMinutes ?? null
    let distanceTier = existingDoc?.distanceTier ?? null
    let geocodeHit: string | undefined

    if (!geo) {
      const outcome = await enrichNeighbourhoodPlace({
        name: place.name,
        address: place.address,
      })
      if (outcome.ok) {
        geo = outcome.result.geo
        walkingMinutes = outcome.result.walkingMinutes
        distanceTier = outcome.result.distanceTier
        geocodeHit = outcome.result.placeName
        if (outcome.result.streetAddress && !place.address.streetAddress) {
          place.address.streetAddress = outcome.result.streetAddress
        }
        if (outcome.result.postalCode && !place.address.postalCode) {
          place.address.postalCode = outcome.result.postalCode
        }
      } else {
        console.warn(`  geocode miss ${place.slug}: ${outcome.failure.message}`)
      }
      await sleep(1100)
    } else {
      geocodeHit = `${geo.latitude.toFixed(5)}, ${geo.longitude.toFixed(5)} (existing)`
    }

    const district = districtFromHit(geocodeHit, place.listedDistrict)
    const listed = place.listedDistrict.toLowerCase()
    if (!district.includes(listed) && !geocodeHit?.toLowerCase().includes(listed)) {
      console.warn(
        `  DISTRICT ${place.slug}: listed ${place.listedDistrict} vs geocoder “${district}” / ${geocodeHit}`,
      )
    } else {
      console.log(`  district ${place.slug}: ${district}`)
    }

    const data = {
      name: place.name,
      slug: place.slug,
      category: place.category,
      secondaryCategory: place.secondaryCategory ?? null,
      schemaType: place.schemaType,
      address: place.address,
      indoorOutdoor: place.indoorOutdoor,
      targetAudience: place.targetAudience.map((label) => ({ label })),
      description: place.description.de,
      endorsements: [
        {
          person: endorserId,
          quote: place.description.de,
          associatedRoom: PEOPLE.find((p) => p.slug === place.endorser)?.roomConfirmed
            ? PEOPLE.find((p) => p.slug === place.endorser)?.roomNumber
            : null,
        },
      ],
      status: 'active' as const,
      hereTeaser: { enabled: true, order },
      geo: geo ?? undefined,
      walkingMinutes,
      distanceTier,
    }

    if (existingDoc) {
      await payload.update({
        collection: 'neighbourhood-places',
        id: existingDoc.id,
        data,
        locale: 'de',
        overrideAccess: true,
      })
      await payload.update({
        collection: 'neighbourhood-places',
        id: existingDoc.id,
        data: { description: place.description.en },
        locale: 'en',
        overrideAccess: true,
      })
      console.log(`Updated place ${place.name}`)
    } else {
      const created = await payload.create({
        collection: 'neighbourhood-places',
        data,
        locale: 'de',
        overrideAccess: true,
      })
      await payload.update({
        collection: 'neighbourhood-places',
        id: created.id,
        data: { description: place.description.en },
        locale: 'en',
        overrideAccess: true,
      })
      console.log(`Created place ${place.name}`)
    }
    order += 1
  }

  console.log(`--- Done. ${PEOPLE.length} people, ${HUB_TIP_SLUGS.length} hereTeaser tips. Portraits left empty (no-portrait state).`)
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
