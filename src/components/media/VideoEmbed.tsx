type Props = {
  url: string
  title: string
  className?: string
}

function embedSrc(raw: string): string | null {
  const url = raw.trim()
  if (!url) return null

  try {
    const parsed = new URL(url)

    if (parsed.hostname.includes('youtu')) {
      const id =
        parsed.hostname === 'youtu.be' || parsed.hostname === 'www.youtu.be'
          ? parsed.pathname.replace(/^\//, '')
          : parsed.searchParams.get('v')
      if (!id) return null
      return `https://www.youtube-nocookie.com/embed/${id}`
    }

    if (parsed.hostname.includes('vimeo.com')) {
      const id = parsed.pathname.split('/').filter(Boolean).pop()
      if (!id || !/^\d+$/.test(id)) return null
      return `https://player.vimeo.com/video/${id}`
    }
  } catch {
    return null
  }

  return null
}

/** YouTube / Vimeo only — returns null for empty or unrecognized URLs. */
export function VideoEmbed({ url, title, className = '' }: Props) {
  const src = embedSrc(url)
  if (!src) return null

  return (
    <div className={`aspect-video overflow-hidden bg-gray-100 ${className}`}>
      <iframe
        src={src}
        title={title}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
