import { createElement, Fragment } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'

import { HashOpen } from '../../src/components/primitives/HashOpen'

function mount(node: React.ReactNode) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  createRoot(container).render(node)
  return container
}

describe('useHashOpen', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('opens the matching details from the URL hash', () => {
    window.history.replaceState(null, '', '/amenities#sauna')

    mount(
      createElement(
        Fragment,
        null,
        createElement(HashOpen),
        createElement(
          'details',
          { id: 'sauna' },
          createElement('summary', null, 'Sauna'),
          createElement('p', null, 'Body'),
        ),
        createElement('details', { id: 'gym' }, createElement('summary', null, 'Gym')),
      ),
    )

    expect((document.getElementById('sauna') as HTMLDetailsElement).open).toBe(true)
    expect((document.getElementById('gym') as HTMLDetailsElement).open).toBe(false)
  })

  it('ignores an unknown hash', () => {
    window.history.replaceState(null, '', '/amenities#missing')

    mount(
      createElement(
        Fragment,
        null,
        createElement(HashOpen),
        createElement('details', { id: 'sauna' }, createElement('summary', null, 'Sauna')),
      ),
    )

    expect((document.getElementById('sauna') as HTMLDetailsElement).open).toBe(false)
  })
})
