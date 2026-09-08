import Image from 'next/image'
import type { ComponentProps } from 'react'

import { Link } from '@/i18n/routing'

type AppHref = ComponentProps<typeof Link>['href']

type Props = {
  floorLabel: string
  title: string
  href: string
  image: { src: string; alt: string }
}

export function ArtLocationCard({ floorLabel, title, href, image }: Props) {
  return (
    <Link
      href={href as AppHref}
      className="flex h-full flex-col overflow-hidden border border-[#E0E0E0] bg-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctx-accent-text focus-visible:ring-offset-2"
    >
      <div className="relative h-24 w-full overflow-hidden md:h-28">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(max-width: 1024px) 50vw, 25vw"
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <p className="font-ui text-[11px] font-medium uppercase tracking-[0.06em] text-ctx-accent-text">
          {floorLabel}
        </p>
        <h3 className="mt-1 font-ui text-ui-md font-medium text-hbb-black">{title}</h3>
      </div>
    </Link>
  )
}
