import { createElement, Fragment, act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'

import { HashOpen } from '../../src/components/primitives/HashOpen'

async function mount(node: React.ReactNode) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () => {
    root.render(node)
  })
  return container
}

describe('useHashOpen', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('opens the matching details from the URL hash', async () => {
    window.history.replaceState(null, '', '/amenities#sauna')

    await mount(
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

  it('ignores an unknown hash', async () => {
    window.history.replaceState(null, '', '/amenities#missing')

    await mount(
      createElement(
        Fragment,
        null,
        createElement(HashOpen),
        createElement('details', { id: 'sauna' }, createElement('summary', null, 'Sauna')),
      ),
    )

    expect((document.getElementById('sauna') as HTMLDetailsElement).open).toBe(false)
  })

  it('unhides an art panel from /hier/art#werk-x', async () => {
    window.history.replaceState(null, '', '/hier/art#werk-somari')

    await mount(
      createElement(
        Fragment,
        null,
        createElement(HashOpen),
        createElement(
          'section',
          { id: 'werk-somari', hidden: true },
          createElement('h2', null, 'Somari'),
        ),
      ),
    )

    expect(document.getElementById('werk-somari')?.hasAttribute('hidden')).toBe(false)
  })
})
