import type { ArtFloor } from '@/lib/art/types'
import { FLOOR_LOCATOR_LEVELS, floorLabel, locatorLevelFor } from '@/lib/art/floors'

type Props = {
  floor: ArtFloor
  spot: string | null
  kicker: string
}

export function FloorLocator({ floor, spot, kicker }: Props) {
  const active = locatorLevelFor(floor)
  return (
    <div className="art-loc">
      <div className="art-loc__floors" aria-hidden="true">
        {FLOOR_LOCATOR_LEVELS.map((level) => (
          <div
            key={level}
            className={`art-loc__bar${level === active ? ' is-on' : ''}${level === 'Keller' ? ' is-keller' : ''}`}
          />
        ))}
      </div>
      <div className="art-loc__txt">
        <span className="art-loc__k">{kicker}</span>
        <span className="art-loc__v">{floorLabel(floor)}</span>
        {spot ? <span className="art-loc__s">{spot}</span> : null}
      </div>
    </div>
  )
}
