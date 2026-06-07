export interface SectionHeadingProps {
  label?: string
  title: string
  subtitle?: string
  as?: 'h1' | 'h2'
  id?: string
  className?: string
}

export function SectionHeading({
  label,
  title,
  subtitle,
  as: HeadingTag = 'h2',
  id,
  className = '',
}: SectionHeadingProps) {
  return (
    <div className={className}>
      {label && <p className="label-tag mb-1">{label}</p>}
      <HeadingTag id={id} className="font-serif text-serif-lg font-medium text-hbb-black">
        <span className="heading-underline">{title}</span>
      </HeadingTag>
      {subtitle && <p className="mt-2 font-ui text-ui-sm text-gray-500">{subtitle}</p>}
    </div>
  )
}
