import { SweepCta } from '@/components/primitives/SweepCta'

type Props = {
  kicker: string
  headline: string
  body: string
  ctaLabel: string
  ctaHref: string
  image: { src: string; alt: string } | null
  /** Image on the right when false (default left). */
  reverse?: boolean
  external?: boolean
}

export function MeetingsTeaserSplit({
  kicker,
  headline,
  body,
  ctaLabel,
  ctaHref,
  image,
  reverse = false,
  external = false,
}: Props) {
  const isHash = ctaHref.startsWith('#')
  const isExternal = external || /^https?:\/\//.test(ctaHref)
  const usePlainAnchor =
    isExternal || isHash || ctaHref.startsWith('/api/') || ctaHref.startsWith('/media/')

  const copy = (
    <div className="flex flex-col items-start justify-center py-2 md:py-4">
      <p className="font-ui text-[10.5px] font-bold uppercase tracking-[0.14em] text-hbb-teal">
        {kicker}
      </p>
      <h2 className="mt-2 font-ui text-2xl font-bold text-hbb-black">{headline}</h2>
      <p className="mt-4 max-w-md font-serif text-serif-md text-[var(--body-text)]">{body}</p>
      <SweepCta
        href={ctaHref}
        color="meet-work"
        className="mt-8 w-fit"
        {...(isExternal ? { external: true } : usePlainAnchor ? { unlocalized: true } : {})}
      >
        {ctaLabel}
      </SweepCta>
    </div>
  )

  const media = (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--bg-subtle)]">
      {image?.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image.src}
          alt={image.alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
    </div>
  )

  return (
    <section className="mx-auto max-w-6xl px-section-sm py-section-y md:px-section-x">
      <div className="grid items-center gap-8 md:grid-cols-2 md:gap-10">
        {reverse ? (
          <>
            {copy}
            {media}
          </>
        ) : (
          <>
            {media}
            {copy}
          </>
        )}
      </div>
    </section>
  )
}
