import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

import { KenBurnsSlider } from '@/components/primitives/KenBurnsSlider'
import { heroImages, satelliteImage } from '@/lib/data/homepageImages'

export async function HeroSection() {
  const t = await getTranslations('hero')
  const tc = await getTranslations('common')

  return (
    <section aria-label={tc('welcomeAria')} className="relative">
      <div className="relative aspect-[16/9] min-h-[420px] w-full md:aspect-[21/9] md:min-h-[520px]">
        <KenBurnsSlider
          images={[...heroImages]}
          aria-label={t('galleryAria')}
          interval={5000}
          className="absolute inset-0 h-full"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-hbb-dark/70 via-hbb-dark/20 to-transparent" />

          <div className="absolute inset-0 z-10 flex flex-col justify-end p-section-sm pb-12 md:p-section-x md:pb-16">
            <h1 className="font-serif text-serif-2xl font-medium leading-tight text-white md:text-serif-3xl">
              {t('headingLine1')}
              <br />
              {t('headingLine2')}
            </h1>
            <p className="mt-4 max-w-md font-ui text-ui-lg text-white/80">
              {t('subtextLine1')}
              <br />
              {t('subtextLine2')}
            </p>
            <p className="mt-2 font-ui text-ui-sm text-white/60">
              {t('detailLine1')}
              <br />
              {t('detailLine2')}
            </p>
          </div>

          <div className="absolute right-4 top-4 z-10 opacity-80" aria-hidden="true">
            <span className="font-ui text-label uppercase tracking-ui-label text-white/70">
              {tc('radissonIndividuals')}
            </span>
          </div>

          <a
            href="https://maps.google.com/?q=Lützowplatz+17,+10785+Berlin"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('mapsLink')}
            className="absolute bottom-4 right-4 z-10 h-20 w-20 overflow-hidden border border-white/20"
          >
            <Image
              src={satelliteImage}
              alt={t('satelliteAlt')}
              fill
              sizes="80px"
              style={{ objectFit: 'cover' }}
            />
          </a>
        </KenBurnsSlider>
      </div>
    </section>
  )
}
