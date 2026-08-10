export type RoomsSuitesCalloutProps = {
  quote: string
  title: string
  body: string
  className?: string
}

/**
 * Quote + heading block between Premium and suite rows on the rooms index.
 */
export function RoomsSuitesCallout({
  quote,
  title,
  body,
  className = '',
}: RoomsSuitesCalloutProps) {
  return (
    <aside
      className={`mx-auto max-w-4xl px-4 py-2 md:py-4 ${className}`}
      aria-labelledby="rooms-suites-callout-title"
    >
      <div className="flex flex-col gap-6 text-center md:grid md:grid-cols-2 md:items-start md:gap-10 md:text-left lg:gap-14">
        <blockquote className="font-serif text-[clamp(1.375rem,2.6vw,2.25rem)] leading-snug text-gray-800 md:pr-2">
          <span aria-hidden="true">&ldquo;</span>
          {quote}
          <span aria-hidden="true">&rdquo;</span>
        </blockquote>

        <div className="md:pt-0.5">
          <h2
            id="rooms-suites-callout-title"
            className="mt-0 font-ui text-[clamp(1.35rem,2.2vw,1.85rem)] font-medium leading-tight text-hbb-rooms-highlight max-md:mt-2"
          >
            {title}
          </h2>

          {body ? (
            <p className="mt-3 font-serif text-serif-md leading-relaxed text-gray-700">{body}</p>
          ) : null}
        </div>
      </div>
    </aside>
  )
}
