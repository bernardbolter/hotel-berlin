export interface SectionHeadingProps {
  label?: string
  title?: string
  subtitle?: string
  as?: 'h1' | 'h2'
  id?: string
  className?: string
  tone?: 'default' | 'inverse'
}

export function SectionHeading({
  label,
  title,
  subtitle,
  as: HeadingTag = 'h2',
  id,
  className = '',
  tone = 'default',
}: SectionHeadingProps) {
  const isInverse = tone === 'inverse'
  const labelOnly = Boolean(label && !title)

  return (
    <div className={className}>
      {label && (
        <p
          id={labelOnly ? id : undefined}
          className={[
            'label-tag mb-1',
            labelOnly ? 'text-hbb-coral' : '',
            isInverse ? 'label-tag--inverse' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {label}
        </p>
      )}
      {title && (
        <HeadingTag
          id={id}
          className={`font-serif text-serif-lg font-medium ${isInverse ? 'text-white' : 'text-hbb-black'}`}
        >
          <span className={`heading-underline ${isInverse ? 'heading-underline--inverse' : ''}`}>
            {title}
          </span>
        </HeadingTag>
      )}
      {subtitle && (
        <p className={`mt-2 font-ui text-ui-sm ${isInverse ? 'text-white/70' : 'text-gray-500'}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
