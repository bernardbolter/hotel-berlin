import { LineCta } from '@/components/primitives/LineCta'

type Column = {
  title: string
  items: string[]
}

type Props = {
  title: string
  columns: Column[]
  gettingAroundCta: string
  className?: string
}

export function GoodToKnowCard({
  title,
  columns,
  gettingAroundCta,
  className = '',
}: Props) {
  return (
    <article
      className={`border border-[#E0E0E0] bg-white p-4 md:p-5 ${className}`}
      aria-labelledby="good-to-know-heading"
    >
      <h2 id="good-to-know-heading" className="font-ui text-ui-md font-medium text-hbb-black">
        {title}
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-5 xs:grid-cols-2 lg:grid-cols-4">
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="font-ui text-[11px] uppercase tracking-[0.06em] text-gray-500">
              {col.title}
            </h3>
            <ul className="mt-2 space-y-0.5">
              {col.items.map((item) => (
                <li key={item} className="font-ui text-ui-sm text-gray-600">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <LineCta href="/here/getting-around" className="text-ui-sm">
          {gettingAroundCta}
        </LineCta>
      </div>
    </article>
  )
}
