import type { ReactNode } from 'react'

type Props = {
  title: string
  body: string
  action: ReactNode
}

export function StatusMessage({ title, body, action }: Props) {
  return (
    <main id="main-content" className="bg-hbb-page">
      <div className="site-shell px-section-sm py-section-y md:px-section-x">
        <article className="mx-auto max-w-3xl">
          <h1 className="font-serif text-[clamp(2.15rem,3.4vw,3.1rem)] font-normal leading-[1.12] text-[#1F1F1F]">
            {title}
          </h1>
          <p className="mt-4 font-serif text-serif-sm text-[#2A3540]">{body}</p>
          <div className="mt-10">{action}</div>
        </article>
      </div>
    </main>
  )
}
