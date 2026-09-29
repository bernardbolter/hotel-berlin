import Image from 'next/image'

import { Link } from '@/i18n/routing'
import { toAppHref } from '@/i18n/toAppHref'

type Props = {
  floorLabel: string
  title: string
  href: string
  image?: { src: string; alt: string } | null
}

/** Floor mural card — flat ground when no photo (F5). */
export function ArtLocationCard({ floorLabel, title, href, image }: Props) {
  return (
    <Link href={toAppHref(href)} className="group block no-underline text-inherit">
      <div className="relative aspect-4/3 overflow-hidden bg-[#E8E4DC]">
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 560px) 100vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : null}
      </div>
      <p className="mt-2 font-ui text-[10px] font-bold uppercase tracking-[0.14em] text-[#6b6b6b]">
        {floorLabel}
      </p>
      <h3 className="font-serif text-[17px] font-normal leading-[1.15] text-[#141414]">{title}</h3>
    </Link>
  )
}
