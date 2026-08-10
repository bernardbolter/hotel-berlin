/**
 * Pull plain text from a Lexical richText document (Payload 3).
 * Preserves paragraph breaks as newlines when `preserveParagraphs` is true.
 */
export function lexicalToPlain(
  value: unknown,
  options: { preserveParagraphs?: boolean } = {},
): string {
  if (!value) return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value !== 'object') return ''

  const { preserveParagraphs = false } = options
  const node = value as {
    type?: string
    text?: string
    children?: unknown[]
    root?: unknown
  }

  if (typeof node.text === 'string') return node.text

  if (node.root) {
    return lexicalToPlain(node.root, options).trim()
  }

  if (!Array.isArray(node.children)) return ''

  if (preserveParagraphs && (node.type === 'root' || !node.type)) {
    return node.children
      .map((child) => lexicalToPlain(child, options).trim())
      .filter(Boolean)
      .join('\n\n')
      .trim()
  }

  const joined = node.children.map((child) => lexicalToPlain(child, options)).join('')
  return joined.replace(/\s+/g, ' ').trim()
}

/** Split Lexical richText into paragraph strings for React rendering. */
export function lexicalToParagraphs(value: unknown): string[] {
  const plain = lexicalToPlain(value, { preserveParagraphs: true })
  if (!plain) return []
  return plain.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
}
