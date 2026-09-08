import Image from 'next/image'

import { Link } from '@/i18n/routing'
import { toAppHref } from '@/i18n/toAppHref'

export type ArtWallTile = {
  kind: 'exhibition' | 'mural' | 'more'
  href: string
  who: string
  where: string
  image?: { src: string; alt: string } | null
  span: { cols: 1 | 2 | 3; rows: 1 | 2 }
}

type Props = {
  tiles: ArtWallTile[]
  moreLabel: string
}

/**
 * Full-bleed hung wall — no card chrome, no radius. Captions always visible.
 */
export function ArtWall({ tiles, moreLabel }: Props) {
  return (
    <div className="artwall">
      {tiles.map((tile) => {
        const spanStyle = {
          gridColumn: `span ${tile.span.cols}`,
          gridRow: `span ${tile.span.rows}`,
        }

        if (tile.kind === 'more') {
          return (
            <Link
              key="more"
              href={toAppHref(tile.href)}
              className="artwall__tile artwall__tile--more"
              style={spanStyle}
            >
              <p className="font-serif text-[30px] font-normal leading-[1.1] text-white">
                {tile.who}
              </p>
              <span className="font-ui text-[9px] font-bold uppercase tracking-[0.14em] text-white [border-bottom:1.5px_solid_#fff] pb-0.5">
                {moreLabel}
              </span>
            </Link>
          )
        }

        return (
          <Link
            key={tile.who + tile.where}
            href={toAppHref(tile.href)}
            className={`artwall__tile ${tile.kind === 'exhibition' ? 'artwall__tile--hero' : ''}`}
            style={spanStyle}
          >
            {tile.image ? (
              <Image
                src={tile.image.src}
                alt={tile.image.alt}
                fill
                sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 50vw"
                className="object-cover"
              />
            ) : null}
            <div className="artwall__cap">
              <span
                className={`artwall__where ${tile.kind === 'exhibition' ? 'artwall__where--live' : ''}`}
              >
                {tile.where}
              </span>
              <span className="artwall__who">{tile.who}</span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
