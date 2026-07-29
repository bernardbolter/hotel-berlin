import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'

import { JsonLdScript } from '@/components/aeo/JsonLdScript'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteNavWithData } from '@/components/layout/SiteNavWithData'
import { FilterChipBar } from '@/components/neighbourhood/FilterChipBar'
import { PaginationNav } from '@/components/neighbourhood/PaginationNav'
import { PersonCard } from '@/components/neighbourhood/PersonCard'
import { SearchFilter } from '@/components/neighbourhood/SearchFilter'
import { LineCta } from '@/components/primitives/LineCta'
import { SectionHeading } from '@/components/primitives/SectionHeading'
import { getAllPeopleForSchema } from '@/lib/aeo/resolve'
import {
  buildPeopleListGraph,
  defaultConfig,
} from '@/lib/aeo-schema/src/index'
import { getPeople, getPeopleFilterTags } from '@/lib/queries/people'
import type { Media, Person, Tag } from '@/payload-types'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function mediaUrl(image: number | Media | null | undefined): string | null {
  return typeof image === 'object' && image && 'url' in image && image.url ? image.url : null
}

function mediaAlt(image: number | Media | null | undefined): string {
  return typeof image === 'object' && image && 'alt' in image ? (image.alt ?? '') : ''
}

function personSlug(person: Person): string | null {
  return typeof person.slug === 'string' ? person.slug : null
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'youMeBerlin' })
  const schemaPeople = await getAllPeopleForSchema(locale)
  const hasPublished = schemaPeople.some((person) => person.status === 'published')

  return {
    title: `${t('title')} | Hotel Berlin, Berlin`,
    description: t('subtitle'),
    alternates: {
      canonical: `https://hotel-berlin.de/${locale}/you-me-and-berlin`,
      languages: {
        de: 'https://hotel-berlin.de/de/you-me-and-berlin',
        en: 'https://hotel-berlin.de/en/you-me-and-berlin',
        'x-default': 'https://hotel-berlin.de/de/you-me-and-berlin',
      },
    },
    // Safety net while the v1 seed is draft-only — listing still emits JSON-LD for the pipe.
    ...(!hasPublished ? { robots: { index: false, follow: false } } : {}),
  }
}

export default async function YouMeBerlinPage({ params, searchParams }: Props) {
  const { locale } = await params
  const sp = await searchParams
  const t = await getTranslations('youMeBerlin')

  const tag = first(sp.tag) ?? null
  const search = first(sp.search) ?? null
  const page = Math.max(1, Number(first(sp.page) ?? '1') || 1)

  const [result, tags, schemaPeople] = await Promise.all([
    getPeople({ locale, tag, search, page }),
    getPeopleFilterTags(locale),
    // JSON-LD describes the complete set (including drafts during preview).
    getAllPeopleForSchema(locale),
  ])

  const listGraph = buildPeopleListGraph(schemaPeople, defaultConfig)

  const people = result.docs as Person[]
  const totalPages = result.totalPages

  const tagOptions = (tags as Tag[]).map((item) => ({
    value: String(item.id),
    label: item.name,
  }))

  const preservedQuery = {
    tag: tag ?? undefined,
    search: search ?? undefined,
  }

  return (
    <>
      <JsonLdScript graph={listGraph} />
      <SiteNavWithData context="outside" />
      <main id="main-content" className="bg-hbb-page">
        <div className="px-section-sm pb-8 pt-10 md:px-section-x">
          <SectionHeading
            label={t('label')}
            title={t('title')}
            subtitle={t('subtitle')}
          />
          <p className="mt-6 max-w-2xl font-ui text-ui-sm text-gray-600">{t('intro')}</p>
        </div>

        <div className="px-section-sm pb-section-y md:px-section-x">
          <Suspense
            fallback={<div className="h-24 animate-pulse bg-gray-100" aria-hidden="true" />}
          >
            <div className="flex flex-col gap-6">
              <SearchFilter
                pathname="/you-me-berlin"
                initialValue={search ?? ''}
                placeholder={t('searchPlaceholder')}
                submitLabel={t('searchSubmit')}
                clearLabel={t('searchClear')}
              />

              {tagOptions.length > 0 ? (
                <FilterChipBar
                  pathname="/you-me-berlin"
                  options={tagOptions}
                  param="tag"
                  activeValue={tag}
                  ariaLabel={t('tagFilterAria')}
                  allLabel={t('allTags')}
                />
              ) : null}
            </div>
          </Suspense>

          {people.length === 0 ? (
            <p className="mt-10 font-ui text-ui-sm text-gray-500">{t('empty')}</p>
          ) : (
            <ul className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {people.map((person) => {
                const slug = personSlug(person)
                if (!slug) return null

                const portrait = person.portrait as
                  | (number | Media | null | undefined)
                  | { altText?: string | null }

                const portraitMedia =
                  typeof portrait === 'object' && portrait && 'url' in portrait
                    ? (portrait as Media)
                    : null

                return (
                  <li key={person.id}>
                    <PersonCard
                      name={person.name}
                      slug={slug}
                      jobTitle={(person as Person & { jobTitle?: string | null }).jobTitle}
                      roomNumber={(person as Person & { roomNumber?: string | null }).roomNumber}
                      roomLabel={t('room')}
                      shortBio={person.shortBio}
                      portraitUrl={mediaUrl(portraitMedia)}
                      portraitAlt={
                        (typeof portrait === 'object' &&
                          portrait &&
                          'altText' in portrait &&
                          typeof portrait.altText === 'string' &&
                          portrait.altText) ||
                        mediaAlt(portraitMedia)
                      }
                    />
                  </li>
                )
              })}
            </ul>
          )}

          <PaginationNav
            pathname="/you-me-berlin"
            currentPage={page}
            totalPages={totalPages}
            query={preservedQuery}
            ariaLabel={t('paginationAria')}
            previousLabel={t('previous')}
            nextLabel={t('next')}
          />

          <div className="mt-16 border-t border-gray-200 pt-10">
            <p className="font-ui text-ui-sm text-gray-600">{t('bridgeIntro')}</p>
            <LineCta href="/neighbourhood" className="mt-4 font-ui text-xs uppercase tracking-widest">
              {t('bridgeCta')}
            </LineCta>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
