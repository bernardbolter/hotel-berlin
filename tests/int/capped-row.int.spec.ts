import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { CappedRow } from '../../src/components/primitives/CappedRow'

describe('CappedRow', () => {
  it('keeps extras in the DOM and caps with data-count', () => {
    const html = renderToStaticMarkup(
      createElement(
        CappedRow,
        { ariaLabel: 'Happenings', max: 4, minCols: 1 },
        ['a', 'b', 'c', 'd', 'e'].map((id) => createElement('li', { key: id }, id)),
      ),
    )

    expect(html).toContain('data-count="4"')
    expect(html).toContain('data-min-cols="1"')
    expect(html).toContain('>d</li>')
    expect(html).not.toContain('>e</li>')
    expect(html.match(/<li/g)?.length).toBe(4)
  })

  it('does not invent empty cells when there are fewer items than columns', () => {
    const html = renderToStaticMarkup(
      createElement(
        CappedRow,
        { ariaLabel: 'Two', max: 6, minCols: 2 },
        ['a', 'b'].map((id) => createElement('li', { key: id }, id)),
      ),
    )

    expect(html).toContain('data-count="2"')
    expect(html).toContain('data-min-cols="2"')
    expect(html.match(/<li/g)?.length).toBe(2)
  })
})
