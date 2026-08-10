/** Build a minimal Lexical richText doc from plain paragraphs (\\n\\n separated). */
export function plainRichText(text: string) {
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)

  return {
    root: {
      type: 'root',
      children: paragraphs.map((paragraph) => ({
        type: 'paragraph',
        version: 1,
        children: [{ type: 'text', text: paragraph, version: 1 }],
      })),
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}
