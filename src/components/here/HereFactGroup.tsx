type Item = {
  label?: string
  body: string
}

type Props = {
  title: string
  items: Item[]
  className?: string
}

/** Labelled fact list for /here deep-page stubs. */
export function HereFactGroup({ title, items, className = '' }: Props) {
  return (
    <section className={`border border-[#E0E0E0] bg-white p-4 ${className}`}>
      <h2 className="font-ui text-[11px] font-medium uppercase tracking-[0.06em] text-gray-500">
        {title}
      </h2>
      <dl className="mt-3">
        {items.map((item) => (
          <div
            key={`${item.label ?? ''}-${item.body}`}
            className="border-b border-gray-100 py-2 last:border-b-0"
          >
            {item.label ? (
              <dt className="font-ui text-ui-sm text-gray-500">{item.label}</dt>
            ) : null}
            <dd className="font-ui text-ui-sm text-hbb-black">{item.body}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
