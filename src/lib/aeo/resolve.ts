import { getPayloadClient } from '@/lib/payload/client'
import { picksFromPersonDoc, toAeoPerson, toAeoPlace } from '@/lib/aeo/mapToSchema'
import type { NeighbourhoodPlace as AeoPlace, Person as AeoPerson } from '@/lib/aeo-schema/src/types'
import type { NeighbourhoodPlace as PayloadPlace, Person as PayloadPerson } from '@/payload-types'

export type ResolvedPlace = {
  payload: PayloadPlace
  aeo: AeoPlace
}

export type ResolvedPerson = {
  payload: PayloadPerson
  aeo: AeoPerson
  picks: { place: AeoPlace; quote: string }[]
}

/**
 * Place detail resolver. depth: 2 is required so endorsements[].person is a
 * full Person object — getting this wrong silently drops reviewer data from
 * the JSON-LD graph.
 */
export async function getResolvedPlace(
  slug: string,
  locale: string,
): Promise<ResolvedPlace | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'neighbourhood-places',
    locale: locale as 'de' | 'en',
    where: {
      and: [{ slug: { equals: slug } }, { status: { equals: 'active' } }],
    },
    depth: 2,
    limit: 1,
  })

  const doc = result.docs[0]
  if (!doc) return null

  return { payload: doc, aeo: toAeoPlace(doc) }
}

/**
 * Person detail resolver. Includes draft records (with noindex at the page
 * layer) so the preview pipe can be smoke-tested. depth: 2 + picks join so
 * reverse-join places carry endorsement quotes.
 */
export async function getResolvedPerson(
  slug: string,
  locale: string,
): Promise<ResolvedPerson | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'people',
    locale: locale as 'de' | 'en',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
    joins: {
      picks: {
        limit: 100,
      },
    },
  })

  const doc = result.docs[0]
  if (!doc) return null

  return {
    payload: doc,
    aeo: toAeoPerson(doc),
    picks: picksFromPersonDoc(doc),
  }
}

/** Full active place set for listing JSON-LD (unpaginated, unfiltered). */
export async function getAllPlacesForSchema(locale: string): Promise<AeoPlace[]> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'neighbourhood-places',
    locale: locale as 'de' | 'en',
    where: { status: { equals: 'active' } },
    depth: 2,
    sort: 'name',
    limit: 500,
  })

  return result.docs.map(toAeoPlace)
}

/**
 * Full people set for listing JSON-LD. Includes drafts so the v1 seed batch
 * is represented in the graph during preview — pages themselves noindex drafts.
 */
export async function getAllPeopleForSchema(locale: string): Promise<AeoPerson[]> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'people',
    locale: locale as 'de' | 'en',
    depth: 0,
    sort: 'name',
    limit: 500,
  })

  return result.docs.map(toAeoPerson)
}
