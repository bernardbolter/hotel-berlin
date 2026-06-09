import { ArrowRight } from 'lucide-react'

import {
  HERO_SATELLITE_HEIGHT_PX,
  HERO_SATELLITE_WIDTH_PX,
} from './heroLayout'

const SATELLITE_IMAGE = '/images/hotel-berlin-berlin-luetzowplatz-satellite.jpg'

const MAPS_URL =
  'https://www.google.com/maps/dir/?api=1&destination=Hotel+Berlin+Berlin&destination_place_id=ChIJYcbvb-9RqEcRhD94S5F0Nw0'

/** Vertical anchor at one quarter of the satellite tile height */
const DIRECTIONS_TOP_PX = Math.round(HERO_SATELLITE_HEIGHT_PX / 4)
const DIRECTIONS_WIDTH_PX = 140
const DIRECTIONS_HEIGHT_PX = 20

const overlayLabelClasses =
  'inline-flex items-center px-2.5 py-1 font-ui text-ui-sm font-medium uppercase leading-none tracking-ui-wide'

const directionsShellClasses = [
  'inline-flex shrink-0 items-center justify-center overflow-hidden',
  'border border-1 border-hbb-nav-amber bg-hbb-nav-amber font-ui text-ui-sm font-medium uppercase leading-none tracking-ui-wide no-underline',
  'before:pointer-events-none before:absolute before:inset-0 before:z-0 before:origin-left',
  'before:scale-x-0 before:bg-white before:content-[""]',
  'before:transition-transform before:duration-300 before:ease-out',
  'group-hover/satellite:before:scale-x-100',
  'motion-reduce:before:transition-none',
].join(' ')

type Props = {
  imageSrc?: string
  satelliteAlt: string
  mapsAriaLabel: string
  address: string
  directions: string
}

export function MiniSatellite({
  imageSrc = SATELLITE_IMAGE,
  satelliteAlt,
  mapsAriaLabel,
  address,
  directions,
}: Props) {
  return (
    <div
      className="relative z-3 block shrink-0 leading-0"
      style={{
        width: HERO_SATELLITE_WIDTH_PX,
        height: HERO_SATELLITE_HEIGHT_PX,
      }}
    >
      <a
        href={MAPS_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={mapsAriaLabel}
        className="group/satellite block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hbb-nav-amber"
      >
        <div
          className="relative"
          style={{
            width: HERO_SATELLITE_WIDTH_PX,
            height: HERO_SATELLITE_HEIGHT_PX,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={satelliteAlt}
            width={HERO_SATELLITE_WIDTH_PX}
            height={HERO_SATELLITE_HEIGHT_PX}
            className="block object-cover object-bottom-left"
            style={{
              width: HERO_SATELLITE_WIDTH_PX,
              height: HERO_SATELLITE_HEIGHT_PX,
            }}
          />

          <div
            className={`${overlayLabelClasses} absolute bottom-0 left-0 z-20 whitespace-nowrap bg-hbb-nav-amber/85 text-white`}
            aria-hidden="true"
          >
            {address}
          </div>

          <span
            className={`${directionsShellClasses} absolute left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-white`}
            style={{
              top: DIRECTIONS_TOP_PX,
              width: DIRECTIONS_WIDTH_PX,
              height: DIRECTIONS_HEIGHT_PX,
            }}
            aria-hidden="true"
          >
            <span className="relative z-10 inline-flex items-center justify-center gap-1.5 transition-colors duration-300 group-hover/satellite:text-hbb-nav-amber">
              {directions}
              <ArrowRight className="size-3 shrink-0" strokeWidth={2.25} aria-hidden />
            </span>
          </span>
        </div>
      </a>
    </div>
  )
}
