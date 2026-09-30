import Image from 'next/image'

import { Link } from '@/i18n/routing'
import { toAppHref } from '@/i18n/toAppHref'
import type { ArtWallChipVariant } from '@/lib/here/artWallMosaic'

export type ArtWallTile = {
  kind: 'exhibition' | 'mural' | 'more'
  href: string
  who: string
  where: string
  subtitle?: string
  chipVariant?: ArtWallChipVariant
  galleryChip?: string | null
  image?: { src: string; alt: string } | null
  span: { cols: 1 | 2; rows: 1 | 2 }
}

type Props = {
  tiles: ArtWallTile[]
  moreLabel: string
  columns?: 3 | 4
}

/**
 * Full-bleed hung wall — 4-col mosaic (3-col when sparse). Captions always visible.
 */
export function ArtWall({ tiles, moreLabel, columns = 4 }: Props) {
  return (
    <div
      className={`artwall${columns === 3 ? ' artwall--sparse' : ''}`}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {tiles.map((tile, index) => {
        const spanStyle = {
          gridColumn: `span ${tile.span.cols}`,
          gridRow: `span ${tile.span.rows}`,
        }
        const key = `${tile.kind}-${tile.href}-${tile.who}-${index}`

        if (tile.kind === 'more') {
          return (
            <Link
              key={key}
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

        const chipClass =
          tile.chipVariant === 'soon'
            ? 'artwall__where artwall__where--soon'
            : tile.chipVariant === 'now' || tile.chipVariant === 'permanent'
              ? 'artwall__where artwall__where--live'
              : 'artwall__where'

        return (
          <Link
            key={key}
            href={toAppHref(tile.href)}
            className={`artwall__tile ${tile.kind === 'exhibition' || tile.span.cols > 1 ? 'artwall__tile--hero' : ''}`}
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
              <span className={chipClass}>{tile.where}</span>
              {tile.galleryChip ? (
                <span className="artwall__where artwall__where--gallery">{tile.galleryChip}</span>
              ) : null}
              <span className="artwall__who">{tile.who}</span>
              {tile.subtitle ? <span className="artwall__sub">{tile.subtitle}</span> : null}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
