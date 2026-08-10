import { lexicalToParagraphs } from '@/lib/richText/lexicalToPlain'

type Props = {
  value: unknown
  className?: string
  paragraphClassName?: string
}

/** Minimal Lexical → paragraphs renderer for room long-form copy. */
export function RichTextParagraphs({
  value,
  className = '',
  paragraphClassName = 'font-serif text-base leading-relaxed text-gray-700',
}: Props) {
  const paragraphs = lexicalToParagraphs(value)
  if (paragraphs.length === 0) return null

  return (
    <div className={className}>
      {paragraphs.map((text, index) => (
        <p key={index} className={index === 0 ? paragraphClassName : `mt-4 ${paragraphClassName}`}>
          {text}
        </p>
      ))}
    </div>
  )
}
