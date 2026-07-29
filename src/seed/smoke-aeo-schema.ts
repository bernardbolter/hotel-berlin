/**
 * Smoke-render JSON-LD graphs from live Payload data (seed v1).
 * Run: npx tsx src/seed/smoke-aeo-schema.ts
 */
import 'dotenv/config'

import {
  buildNeighbourhoodListGraph,
  buildPeopleListGraph,
  buildPersonPageGraph,
  buildPlacePageGraph,
  defaultConfig,
} from '../lib/aeo-schema/src/index'
import {
  getAllPeopleForSchema,
  getAllPlacesForSchema,
  getResolvedPerson,
  getResolvedPlace,
} from '../lib/aeo/resolve'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function summarize(label: string, graph: { '@graph': { '@type'?: string; '@id'?: string; [k: string]: unknown }[] }) {
  console.log(`\n=== ${label} ===`)
  console.log(JSON.stringify(graph, null, 2))
}

async function main() {
  const locale = 'de'

  // 1. koenig-galerie
  const koenig = await getResolvedPlace('koenig-galerie', locale)
  assert(koenig, 'koenig-galerie missing')
  const koenigGraph = buildPlacePageGraph(koenig.aeo, defaultConfig)
  summarize('koenig-galerie', koenigGraph)

  const reviews = koenigGraph['@graph'].filter((n) => n['@type'] === 'Review')
  assert(reviews.length === 1, `expected 1 Review, got ${reviews.length}`)
  const author = reviews[0].author as { '@id'?: string } | undefined
  const kristiane = koenigGraph['@graph'].find(
    (n) => n['@type'] === 'Person' && n['@id']?.includes('kristiane-kegelmann'),
  )
  assert(kristiane, 'Kristiane Person stub missing from graph')
  assert(
    author?.['@id'] === kristiane['@id'],
    'Review author @id must point at Kristiane person @id',
  )
  assert(!('reviewRating' in reviews[0]), 'reviewRating must be absent')

  // Place page inlines a Person stub (@id + name); full profile is on the person page.
  // Real resolved data is verified on the endorsement payload that fed the builders:
  assert(koenig.aeo.endorsements?.[0]?.person.name === 'Kristiane Kegelmann', 'endorsement person name')
  assert(
    koenig.aeo.endorsements?.[0]?.person.website?.includes('kristianekegelmann'),
    'endorsement person website',
  )
  assert(koenig.aeo.endorsements?.[0]?.person.jobTitle === 'Artist / Sculptor', 'endorsement jobTitle')
  assert(koenig.aeo.endorsements?.[0]?.quote === 'Its spaces are unbelievable.', 'quote')

  // 2. schloss-charlottenburg
  const schloss = await getResolvedPlace('schloss-charlottenburg', locale)
  assert(schloss, 'schloss-charlottenburg missing')
  const schlossGraph = buildPlacePageGraph(schloss.aeo, defaultConfig)
  summarize('schloss-charlottenburg', schlossGraph)

  const schlossReviews = schlossGraph['@graph'].filter((n) => n['@type'] === 'Review')
  assert(schlossReviews.length === 2, `expected 2 Reviews, got ${schlossReviews.length}`)
  const authors = schlossReviews.map((r) => (r.author as { '@id': string })['@id']).sort()
  assert(authors[0] !== authors[1], 'two distinct author @ids')
  const itemReviewed = schlossReviews.map((r) => (r.itemReviewed as { '@id': string })['@id'])
  assert(itemReviewed[0] === itemReviewed[1], 'both Reviews share the same itemReviewed @id')
  assert(
    schloss.aeo.endorsements?.map((e) => e.person.slug).sort().join(',') ===
      'alessandra-botts,maike',
    'endorsers must be maike + alessandra-botts',
  )

  // 3. hamburger-bahnhof
  const bahnhof = await getResolvedPlace('hamburger-bahnhof', locale)
  assert(bahnhof, 'hamburger-bahnhof missing')
  const bahnhofGraph = buildPlacePageGraph(bahnhof.aeo, defaultConfig)
  summarize('hamburger-bahnhof', bahnhofGraph)

  const placeNode = bahnhofGraph['@graph'].find((n) => n['@type'] === 'Museum')
  assert(placeNode, 'Museum place node missing')
  assert(!('review' in placeNode), 'review key must be absent (not empty array)')
  assert(
    bahnhofGraph['@graph'].every((n) => n['@type'] !== 'Review'),
    'no Review nodes expected',
  )

  // 4. listings
  const places = await getAllPlacesForSchema(locale)
  const people = await getAllPeopleForSchema(locale)
  const placesList = buildNeighbourhoodListGraph(places, defaultConfig)
  const peopleList = buildPeopleListGraph(people, defaultConfig)
  summarize('neighbourhood list', placesList)
  summarize('people list', peopleList)

  assert(places.length === 8, `expected 8 places, got ${places.length}`)
  assert(people.length === 7, `expected 7 people, got ${people.length}`)

  const placeItems = (placesList['@graph'][0].itemListElement as { item: Record<string, unknown> }[])
  for (const entry of placeItems) {
    const keys = Object.keys(entry.item).sort()
    assert(
      keys.includes('@id') && keys.includes('@type') && keys.includes('name'),
      `list item should be ref-shaped, got keys: ${keys.join(',')}`,
    )
    assert(!('description' in entry.item), 'full place node must not leak into ItemList')
    assert(!('review' in entry.item), 'review must not leak into ItemList')
  }

  // 5. person reverse-join (kristiane)
  const kristianeResolved = await getResolvedPerson('kristiane-kegelmann', locale)
  assert(kristianeResolved, 'kristiane person missing')
  assert(kristianeResolved.picks.length >= 1, 'kristiane picks join empty — reverse-join failed')
  assert(
    kristianeResolved.picks.some((p) => p.place.slug === 'koenig-galerie'),
    'kristiane picks should include koenig-galerie',
  )
  const personGraph = buildPersonPageGraph(
    kristianeResolved.aeo,
    kristianeResolved.picks,
    defaultConfig,
  )
  summarize('kristiane-kegelmann person page', personGraph)
  const personNode = personGraph['@graph'].find((n) => n['@type'] === 'Person')
  assert(personNode?.jobTitle === 'Artist / Sculptor', 'full person node on person page')
  assert(personNode?.url === 'https://kristianekegelmann.com/', 'website on person page')

  console.log('\n✓ All smoke checks passed.')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
