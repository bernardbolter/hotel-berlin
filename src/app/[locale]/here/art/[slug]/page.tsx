import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ArtWorkPageView } from '@/components/art/ArtWorkPageView'
import { isUntitledTitle } from '@/lib/art/floors'
import {
  getExhibitionBandForWork,
  getMoreByArtist,
  getMoreOnFloor,
  getWorkBySlug,
  getWorkSlugs,
  workPlainDescription,
} from '@/lib/art/works'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export const dynamicParams = true

export async function generateStaticParams() {
  try {
    const slugs = await getWorkSlugs()
    return slugs.map((slug) => ({ slug }))
  } catch {
    return []
  }
}

function resolveLocale(locale: string): 'de' | 'en' {
  return locale === 'de' ? 'de' : 'en'
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam, slug } = await params
  const locale = resolveLocale(localeParam)
  setRequestLocale(locale)
  const work = await getWorkBySlug(slug, locale)
  if (!work) notFound()

  const title = isUntitledTitle(work.title) ? work.artist.name : work.title.trim()
  const description = workPlainDescription(work) || work.artist.name
  const origin = 'https://hotel-berlin.de'

  return {
    title: `${title} | Hotel Berlin, Berlin`,
    description,
    alternates: {
      canonical: `${origin}${locale === 'de' ? '/de/hier/art' : '/en/here/art'}/${work.slug}`,
      languages: {
        de: `${origin}/de/hier/art/${work.slug}`,
        en: `${origin}/en/here/art/${work.slug}`,
        'x-default': `${origin}/de/hier/art/${work.slug}`,
      },
    },
    openGraph: work.image
      ? { images: [{ url: work.image.src, alt: work.image.alt }] }
      : undefined,
  }
}

export default async function ArtWorkPage({ params }: Props) {
  const { locale: localeParam, slug } = await params
  const locale = resolveLocale(localeParam)
  setRequestLocale(locale)

  const work = await getWorkBySlug(slug, locale)
  if (!work) notFound()

  const page = await getTranslations({ locale, namespace: 'art.page' })
  const grid = await getTranslations({ locale, namespace: 'art.grid' })
  const here = await getTranslations({ locale, namespace: 'here' })

  const [exhibition, moreBy, moreOnFloor] = await Promise.all([
    getExhibitionBandForWork(work.id, locale, {
      partOfUntil: (title, date) => page('partOfUntil', { title, date }),
      partOfPermanent: (title) => page('partOfPermanent', { title }),
      wasPartOf: (title, monthYear) => page('wasPartOf', { title, monthYear }),
    }),
    getMoreByArtist(work.artist.slug, work.slug, locale, 3),
    getMoreOnFloor(work.floor, work.slug, locale, 3),
  ])

  return (
    <ArtWorkPageView
      work={work}
      exhibition={exhibition}
      moreBy={moreBy}
      moreOnFloor={moreOnFloor}
      copy={{
        crumbHere: page('crumbHere'),
        crumbArt: page('title'),
        by: grid.raw('by'),
        year: grid('year'),
        technique: grid('technique'),
        size: grid('size'),
        inBuilding: page('inBuilding'),
        locationTbc: here('artWall.locationTbc'),
        moreBy: page.raw('moreByHeading'),
        moreByAll: page.raw('moreByAll'),
        moreOnFloor: page.raw('moreOnFloor'),
        seeFloor: page('seeFloor'),
        onward: page('workOnward'),
        onwardCta: page('workOnwardCta'),
        exhibitionCta: page('exhibitionCta'),
        untitled: grid('untitled'),
      }}
    />
  )
}
