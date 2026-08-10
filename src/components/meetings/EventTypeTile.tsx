import { AmenityIcon } from '@/components/home/AmenityIcon'

type Props = {
  label: string
  description: string
  icon?: string | null
  image?: { src: string; alt: string } | null
}

const CORNER_CLASS = [
  'rounded-tl-[25px]',
  'rounded-tr-[25px]',
  'rounded-br-[25px]',
] as const

function cornerClassFor(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % CORNER_CLASS.length
  }
  return CORNER_CLASS[hash]!
}

export function EventTypeTile({ label, description, icon, image }: Props) {
  return (
    <article
      className={[
        'flex h-full flex-col overflow-hidden bg-white',
        'shadow-[0_4px_18px_rgba(20,20,20,0.06)] transition-shadow duration-200',
        'hover:shadow-[0_8px_28px_rgba(20,20,20,0.14)]',
        cornerClassFor(label),
      ].join(' ')}
    >
      {image?.src ? (
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--bg-subtle)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.src}
            alt={image.alt}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      ) : icon ? (
        <div className="flex items-center px-5 pt-5">
          <AmenityIcon iconName={icon} size={22} className="text-hbb-teal" />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-ui text-lg font-bold text-hbb-black">{label}</h3>
        <p className="mt-2 font-serif text-serif-sm text-[var(--body-text)]">{description}</p>
      </div>
    </article>
  )
}
