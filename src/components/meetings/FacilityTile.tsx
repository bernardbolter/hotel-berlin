import { AmenityIcon } from '@/components/home/AmenityIcon'

type Props = {
  icon: string
  label: string
  description: string
}

export function FacilityTile({ icon, label, description }: Props) {
  return (
    <div>
      <AmenityIcon iconName={icon} size={20} className="text-hbb-teal" />
      <h3 className="mt-2 font-ui text-base font-bold text-hbb-black">{label}</h3>
      <p className="mt-1 font-serif text-serif-sm text-[var(--body-text)]">{description}</p>
    </div>
  )
}
