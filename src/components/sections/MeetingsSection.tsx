import { getLocale } from 'next-intl/server'

import { MeetAndWorkTeaser } from '@/components/home/MeetAndWorkTeaser'
import { getMeetAndWork } from '@/lib/payload/homepage'

export async function MeetingsSection() {
  const locale = (await getLocale()) as 'de' | 'en'
  const copy = await getMeetAndWork(locale)

  return (
    <section
      aria-labelledby="meetings-heading meetings-heading-desktop"
      className="bg-hbb-page"
    >
      {/* Full-bleed light page bg beyond --site-max; content in shell */}
      <div className="site-shell box-border py-12 pr-5 pl-[10px] md:py-14 md:pr-10 lg:py-16 xl:pr-14">
        <MeetAndWorkTeaser copy={copy} />
      </div>
    </section>
  )
}
