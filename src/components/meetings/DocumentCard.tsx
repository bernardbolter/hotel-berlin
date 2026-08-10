import { FileText } from 'lucide-react'

type Props = {
  title: string
  categoryLabel: string
  fileUrl: string
  fileSizeLabel?: string
}

const CORNER_CLASS = [
  'rounded-tl-[25px]',
  'rounded-tr-[25px]',
  'rounded-br-[25px]',
] as const

/** Stable pick so SSR + client match; reads as random across the grid. */
function cornerClassFor(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % CORNER_CLASS.length
  }
  return CORNER_CLASS[hash]!
}

export function DocumentCard({ title, categoryLabel, fileUrl, fileSizeLabel }: Props) {
  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        'flex gap-3 bg-white p-4 shadow-[0_4px_18px_rgba(20,20,20,0.06)] transition-shadow duration-200',
        'hover:shadow-[0_8px_28px_rgba(20,20,20,0.14)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hbb-teal focus-visible:ring-offset-2',
        cornerClassFor(`${title}:${fileUrl}`),
      ].join(' ')}
    >
      <FileText size={20} className="mt-0.5 shrink-0 text-hbb-teal" aria-hidden="true" />
      <span className="min-w-0">
        <span className="block font-ui text-[10.5px] font-bold uppercase tracking-[0.14em] text-hbb-teal">
          {categoryLabel}
        </span>
        <span className="mt-1 block font-ui text-base font-bold text-hbb-black">{title}</span>
        {fileSizeLabel ? (
          <span className="mt-1 block font-ui text-ui-xs text-[var(--dim)]">{fileSizeLabel}</span>
        ) : null}
      </span>
    </a>
  )
}
