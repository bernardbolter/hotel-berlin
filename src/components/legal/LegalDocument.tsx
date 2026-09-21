import { LegalSpans } from '@/components/legal/LegalSpans'
import type { LegalBlock, LegalListItem, LegalSpan } from '@/lib/legal/types'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

function isHeadingParagraph(spans: LegalSpan[]): boolean {
  if (spans.length !== 1) return false
  const marks = spans[0].marks ?? []
  const text = spans[0].text.trim()
  if (!text) return false
  return marks.includes('strong') || marks.includes('underline')
}

function Heading({
  as: Tag,
  id,
  children,
}: {
  as: 'h2' | 'h3'
  id?: string
  children: string
}) {
  const headingId = id || slugify(children)
  const className =
    Tag === 'h2'
      ? 'mt-14 font-serif text-[clamp(1.45rem,2.3vw,2.1rem)] font-normal leading-[1.12] text-[#1F1F1F] first:mt-0'
      : 'mt-10 font-serif text-[clamp(1.15rem,1.6vw,1.4rem)] font-normal leading-[1.25] text-[#1F1F1F] first:mt-0'

  return (
    <Tag id={headingId} className={`scroll-mt-28 ${className}`}>
      {children}
    </Tag>
  )
}

function List({
  type,
  items,
  nested = false,
}: {
  type: 'ol' | 'ul'
  items: LegalListItem[]
  nested?: boolean
}) {
  const Tag = type
  const className = [
    nested ? 'mt-3' : 'mt-4',
    'font-serif text-[clamp(0.95rem,1.05vw,1.05rem)] leading-[1.7] text-[#2A3540]',
    type === 'ol' ? 'list-decimal pl-5' : 'list-disc pl-5',
  ].join(' ')

  return (
    <Tag className={className}>
      {items.map((item, index) => (
        <li key={index} className="mt-2 pl-1 first:mt-0">
          {item.spans.length > 0 ? <LegalSpans spans={item.spans} /> : null}
          {item.children?.map((child, childIndex) =>
            child.type === 'ol' || child.type === 'ul' ? (
              <List key={childIndex} type={child.type} items={child.items} nested />
            ) : null,
          )}
        </li>
      ))}
    </Tag>
  )
}

function Block({ block }: { block: LegalBlock }) {
  if (block.type === 'h2' || block.type === 'h3') {
    return (
      <Heading as={block.type} id={block.id}>
        {block.text}
      </Heading>
    )
  }

  if (block.type === 'h4') {
    return (
      <p className="mt-3 font-serif text-[clamp(0.95rem,1.05vw,1.05rem)] leading-[1.65] text-gray-600">
        {block.text}
      </p>
    )
  }

  if (block.type === 'ol' || block.type === 'ul') {
    return <List type={block.type} items={block.items} />
  }

  if (block.type !== 'p') return null

  if (isHeadingParagraph(block.spans)) {
    return (
      <Heading as="h3" id={slugify(block.spans[0].text)}>
        {block.spans[0].text.replace(/\s+/g, ' ').trim()}
      </Heading>
    )
  }

  const hasBreaks = block.spans.some((span) => span.text.includes('\n'))

  return (
    <p
      className={`mt-4 font-serif text-[clamp(0.95rem,1.05vw,1.05rem)] leading-[1.7] text-[#2A3540] first:mt-0 ${
        hasBreaks ? 'whitespace-pre-line' : ''
      }`}
    >
      <LegalSpans spans={block.spans} />
    </p>
  )
}

export function LegalDocumentView({
  blocks,
  tocLabel,
}: {
  blocks: LegalBlock[]
  tocLabel: string
}) {
  const toc = blocks.flatMap((block) =>
    block.type === 'h2' && block.id ? [{ id: block.id, text: block.text }] : [],
  )

  return (
    <div>
      {toc.length > 1 ? (
        <nav aria-label={tocLabel} className="mb-10 border-b border-gray-200 pb-6">
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {toc.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="font-ui text-ui-sm text-ctx-accent-text underline-offset-2 hover:underline"
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  )
}
