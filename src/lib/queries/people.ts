import type { Where } from 'payload'

import { getPayloadClient } from '@/lib/payload/client'

export const PEOPLE_PAGE_SIZE = 24

export type PeopleListParams = {
  locale: string
  tag?: string | null
  search?: string | null
  page?: number
  unpaginated?: boolean
}

export async function getPeople(params: PeopleListParams) {
  const payload = await getPayloadClient()
  const page = Math.max(1, params.page ?? 1)

  const and: Where[] = [{ status: { equals: 'published' } }]

  if (params.tag) {
    and.push({ tags: { in: [params.tag] } })
  }

  if (params.search?.trim()) {
    const q = params.search.trim()
    and.push({
      or: [
        { name: { contains: q } },
        { jobTitle: { contains: q } },
        { shortBio: { contains: q } },
        { basedIn: { contains: q } },
      ],
    })
  }

  return payload.find({
    collection: 'people',
    locale: params.locale as 'de' | 'en',
    where: { and },
    depth: 2,
    sort: 'name',
    page: params.unpaginated ? 1 : page,
    limit: params.unpaginated ? 500 : PEOPLE_PAGE_SIZE,
  })
}

export async function getPersonBySlug(slug: string, locale: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'people',
    locale: locale as 'de' | 'en',
    where: {
      and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }],
    },
    depth: 2,
    limit: 1,
  })

  return result.docs[0] ?? null
}

/** Tag options used to filter the You, Me & Berlin listing. */
export async function getPeopleFilterTags(locale: string) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'tags',
    locale: locale as 'de' | 'en',
    where: {
      type: { in: ['theme', 'category', 'neighbourhood'] },
    },
    sort: 'name',
    limit: 100,
    depth: 0,
  })

  return docs
}
