import type { Payload } from 'payload'

type PageSeed = {
  slug: string
  titleEN: string
  titleDE: string
  context: 'outside' | 'inside' | 'both' | 'policy'
  status?: 'skeleton' | 'in-progress' | 'live'
}

export async function upsertPage(
  payload: Payload,
  { slug, titleEN, titleDE, context, status = 'skeleton' }: PageSeed,
): Promise<number> {
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  if (existing.docs[0]) {
    const id = existing.docs[0].id as number
    await payload.update({
      collection: 'pages',
      id,
      data: { context, status, title: titleEN },
      locale: 'en',
    })
    await payload.update({
      collection: 'pages',
      id,
      data: { title: titleDE },
      locale: 'de',
    })
    return id
  }

  const doc = await payload.create({
    collection: 'pages',
    data: {
      slug,
      context,
      status,
      title: titleEN,
    },
    locale: 'en',
  })

  const id = doc.id as number

  await payload.update({
    collection: 'pages',
    id,
    data: { title: titleDE },
    locale: 'de',
  })

  return id
}
