export interface SectionHeadingProps {
  label?: string
  title: string
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

  return (
    <div className={className}>
      {label && (
        <p className={`label-tag mb-1 ${isInverse ? 'text-hbb-footer-teal' : ''}`}>{label}</p>
      )}
      <HeadingTag
        id={id}
        className={`font-serif text-serif-lg font-medium ${isInverse ? 'text-white' : 'text-hbb-black'}`}
      >
        <span className={`heading-underline ${isInverse ? 'heading-underline--inverse' : ''}`}>
          {title}
        </span>
      </HeadingTag>
      {subtitle && (
        <p className={`mt-2 font-ui text-ui-sm ${isInverse ? 'text-white/70' : 'text-gray-500'}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
