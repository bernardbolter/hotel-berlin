import { getTranslations } from 'next-intl/server'

/**
 * Legacy scaffold hero — grey ground only. Live homepage uses HomeHero (F5).
 */
export async function HeroSection() {
  const t = await getTranslations('hero')
  const tc = await getTranslations('common')

  return (
    <section aria-label={tc('welcomeAria')} className="relative">
      <div className="relative flex aspect-video min-h-105 w-full items-end bg-[#D8D2C8] md:aspect-21/9 md:min-h-130">
        <div className="relative z-10 flex flex-col justify-end p-section-sm pb-12 md:p-section-x md:pb-16">
          <h1 className="font-serif text-serif-2xl font-medium leading-tight text-[#1F1F1F] md:text-serif-3xl">
            {t.rich('headingLine1', {
              em: (chunks) => <em className="italic font-bold">{chunks}</em>,
            })}
            <br />
            {t.rich('headingLine2', {
              em: (chunks) => <em className="italic font-bold">{chunks}</em>,
            })}
          </h1>
        </div>
      </div>
    </section>
  )
}
