import type { LegalBlock, LegalListItem, LegalMark, LegalSpan } from '@/lib/legal/types'

type LexNode = {
  type?: string
  tag?: string
  text?: string
  format?: number | string
  listType?: string
  fields?: { url?: string; linkType?: string; newTab?: boolean }
  url?: string
  children?: LexNode[]
  version?: number
  [key: string]: unknown
}

type LexDoc = {
  root: {
    type: 'root'
    children: LexNode[]
    direction: 'ltr'
    format: ''
    indent: 0
    version: 1
  }
}

const BOLD = 1
const ITALIC = 2
const UNDERLINE = 8

function marksToFormat(marks?: LegalMark[]): number {
  let format = 0
  if (!marks) return format
  if (marks.includes('strong')) format |= BOLD
  if (marks.includes('em')) format |= ITALIC
  if (marks.includes('underline')) format |= UNDERLINE
  return format
}

function formatToMarks(format: number | string | undefined): LegalMark[] | undefined {
  const n = typeof format === 'number' ? format : 0
  const marks: LegalMark[] = []
  if (n & BOLD) marks.push('strong')
  if (n & ITALIC) marks.push('em')
  if (n & UNDERLINE) marks.push('underline')
  return marks.length ? marks : undefined
}

function textNode(text: string, format = 0): LexNode {
  return {
    type: 'text',
    text,
    format,
    detail: 0,
    mode: 'normal',
    style: '',
    version: 1,
  }
}

function linebreakNode(): LexNode {
  return { type: 'linebreak', version: 1 }
}

function wrapLink(children: LexNode[], href?: string): LexNode[] {
  if (!href) return children
  return [
    {
      type: 'link',
      fields: {
        url: href,
        linkType: 'custom',
        newTab: href.startsWith('http'),
      },
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 3,
    },
  ]
}

function nodesFromSpan(span: LegalSpan): LexNode[] {
  const format = marksToFormat(span.marks)
  const parts = span.text.split('\n')
  const inner: LexNode[] = []
  parts.forEach((part, index) => {
    if (part) inner.push(textNode(part, format))
    if (index < parts.length - 1) inner.push(linebreakNode())
  })
  if (inner.length === 0 && span.href) inner.push(textNode(span.href, format))
  return wrapLink(inner, span.href)
}

function paragraphNode(children: LexNode[]): LexNode {
  return {
    type: 'paragraph',
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    textFormat: 0,
    version: 1,
  }
}

function headingNode(tag: 'h2' | 'h3' | 'h4', text: string): LexNode {
  return {
    type: 'heading',
    tag,
    children: [textNode(text)],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  }
}

function listFromBlock(block: Extract<LegalBlock, { type: 'ol' | 'ul' }>): LexNode {
  return {
    type: 'list',
    listType: block.type === 'ol' ? 'number' : 'bullet',
    tag: block.type,
    start: 1,
    children: block.items.map((item, index) => listItemNode(item, index + 1)),
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  }
}

function listItemNode(item: LegalListItem, value: number): LexNode {
  const children: LexNode[] = item.spans.flatMap(nodesFromSpan)
  for (const child of item.children ?? []) {
    if (child.type === 'ol' || child.type === 'ul') children.push(listFromBlock(child))
  }
  return {
    type: 'listitem',
    value,
    children: children.length ? children : [textNode('')],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  }
}

export function blocksToLexical(blocks: LegalBlock[]): LexDoc {
  const children: LexNode[] = []
  for (const block of blocks) {
    if (block.type === 'p') {
      children.push(paragraphNode(block.spans.flatMap(nodesFromSpan)))
    } else if (block.type === 'h2' || block.type === 'h3' || block.type === 'h4') {
      children.push(headingNode(block.type, block.text))
    } else {
      children.push(listFromBlock(block))
    }
  }

  return {
    root: {
      type: 'root',
      children: children.length ? children : [paragraphNode([])],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

function hrefFromNode(node: LexNode): string | undefined {
  if (node.type === 'link' || node.type === 'autolink') {
    return node.fields?.url || node.url
  }
  return undefined
}

function collectSpans(nodes: LexNode[] | undefined, inheritedHref?: string): LegalSpan[] {
  const spans: LegalSpan[] = []
  if (!nodes) return spans

  const push = (text: string, marks?: LegalMark[], href?: string) => {
    if (!text && !href) return
    const last = spans[spans.length - 1]
    const same =
      last &&
      last.href === href &&
      JSON.stringify(last.marks ?? []) === JSON.stringify(marks ?? [])
    if (same) {
      last.text += text
      return
    }
    spans.push({ text, ...(href ? { href } : {}), ...(marks ? { marks } : {}) })
  }

  for (const node of nodes) {
    if (node.type === 'text') {
      push(node.text ?? '', formatToMarks(node.format), inheritedHref)
    } else if (node.type === 'linebreak') {
      push('\n', undefined, inheritedHref)
    } else if (node.type === 'link' || node.type === 'autolink') {
      spans.push(...collectSpans(node.children, hrefFromNode(node) || inheritedHref))
    } else if (node.type === 'paragraph' || !node.type) {
      spans.push(...collectSpans(node.children, inheritedHref))
    }
  }

  return spans
}

function listItemsFromNode(node: LexNode): LegalListItem[] {
  const items: LegalListItem[] = []
  for (const child of node.children ?? []) {
    if (child.type !== 'listitem') continue
    const spans: LegalSpan[] = []
    const nested: LegalBlock[] = []
    for (const part of child.children ?? []) {
      if (part.type === 'list') {
        nested.push({
          type: part.listType === 'number' || part.tag === 'ol' ? 'ol' : 'ul',
          items: listItemsFromNode(part),
        })
      } else {
        spans.push(...collectSpans([part]))
      }
    }
    items.push({
      spans,
      ...(nested.length ? { children: nested } : {}),
    })
  }
  return items
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

export function lexicalToBlocks(value: unknown): LegalBlock[] {
  if (!value || typeof value !== 'object') return []
  const root = 'root' in value ? (value as { root?: LexNode }).root : (value as LexNode)
  if (!root?.children) return []

  const blocks: LegalBlock[] = []
  for (const node of root.children) {
    if (node.type === 'heading') {
      const tag = node.tag === 'h3' || node.tag === 'h4' ? node.tag : 'h2'
      const text = collectSpans(node.children)
        .map((span) => span.text)
        .join('')
        .replace(/\s+/g, ' ')
        .trim()
      if (text) blocks.push({ type: tag, text, id: slugify(text) })
      continue
    }
    if (node.type === 'list') {
      blocks.push({
        type: node.listType === 'number' || node.tag === 'ol' ? 'ol' : 'ul',
        items: listItemsFromNode(node),
      })
      continue
    }
    if (node.type === 'paragraph' || node.type === 'quote') {
      const spans = collectSpans(node.children)
      if (spans.some((span) => span.text.trim() || span.href)) {
        blocks.push({ type: 'p', spans })
      }
    }
  }
  return blocks
}
