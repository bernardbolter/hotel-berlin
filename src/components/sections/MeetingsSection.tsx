import { getLocale } from 'next-intl/server'

import { MeetAndWorkTeaser } from '@/components/home/MeetAndWorkTeaser'
import {
  SectionShell,
  type LightSectionBackground,
} from '@/components/layout/SectionShell'
import { getMeetAndWork } from '@/lib/payload/homepage'

type Props = {
  /** Explicit section tint — required so rhythm stays intentional. */
  background: LightSectionBackground
}

export async function MeetingsSection({ background }: Props) {
  const locale = (await getLocale()) as 'de' | 'en'
  const copy = await getMeetAndWork(locale)

  return (
    <SectionShell
      as="section"
      background={background}
      aria-labelledby="meetings-heading meetings-heading-desktop"
      className="mt-[3px] sm:mt-[5px] md:mt-[7px] lg:mt-[9px] xl:mt-[12px]"
    >
      {/* Match RoomsHero vertical padding (hero → rooms rhythm). */}
      <div className="site-shell box-border pt-14 pr-5 pb-[41px] pl-[15px] min-[551px]:pl-5 md:pt-16 md:pr-10 md:pb-[49px] lg:pt-20 lg:pb-[65px] lg:pl-[10px] xl:pr-14">
        <MeetAndWorkTeaser copy={copy} />
      </div>
    </SectionShell>
  )
}
