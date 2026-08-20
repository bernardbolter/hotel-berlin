import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteNavWithData } from '@/components/layout/SiteNavWithData'

export default function HereLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNavWithData context="inside" />
      {children}
      <SiteFooter />
    </>
  )
}
