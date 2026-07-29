import Image from 'next/image'

import { Link } from '@/i18n/routing'

export type PersonCardProps = {
  name: string
  slug: string
  jobTitle?: string | null
  roomNumber?: string | null
  roomLabel?: string
  shortBio?: string | null
  portraitUrl?: string | null
  portraitAlt?: string
}

export function PersonCard({
  name,
  slug,
  jobTitle,
  roomNumber,
  roomLabel,
  shortBio,
  portraitUrl,
  portraitAlt = '',
}: PersonCardProps) {
  return (
    <article className="flex flex-col motion-safe:transition-opacity motion-reduce:transition-none">
      <Link
        href={{ pathname: '/you-me-berlin/[slug]', params: { slug } }}
        className="relative mb-4 aspect-3/4 overflow-hidden bg-gray-100"
      >
        {portraitUrl ? (
          <Image
            src={portraitUrl}
            alt={portraitAlt}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center font-ui text-ui-lg text-gray-300">
            {name.slice(0, 1)}
          </span>
        )}
      </Link>

      <h3 className="font-ui text-ui-md font-medium text-hbb-black">
        <Link
          href={{ pathname: '/you-me-berlin/[slug]', params: { slug } }}
          className="hover:text-hbb-green"
        >
          {name}
        </Link>
      </h3>

      {jobTitle ? (
        <p className="mt-1 font-ui text-ui-sm text-gray-500">{jobTitle}</p>
      ) : null}

      {roomNumber ? (
        <p className="mt-1 font-ui text-ui-xs uppercase tracking-ui-label text-gray-400">
          {roomLabel ? `${roomLabel} ${roomNumber}` : roomNumber}
        </p>
      ) : null}

      {shortBio ? (
        <p className="mt-2 line-clamp-2 font-ui text-ui-sm text-gray-600">{shortBio}</p>
      ) : null}
    </article>
  )
}
