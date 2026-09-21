import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

import { revalidatePath, revalidateTag } from 'next/cache'

import { CMS_CACHE_TAG, revalidateCms } from '@/lib/payload/revalidate'

describe('revalidateCms', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('skips when disableRevalidate is set', async () => {
    await revalidateCms({ context: { disableRevalidate: true } }, ['rooms'])
    expect(revalidatePath).not.toHaveBeenCalled()
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('revalidates the layout, the cms tag, extras, and specific paths', async () => {
    await revalidateCms(undefined, ['rooms'], ['/en/imprint'])
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
    expect(revalidatePath).toHaveBeenCalledWith('/en/imprint')
    expect(revalidateTag).toHaveBeenCalledWith(CMS_CACHE_TAG, 'max')
    expect(revalidateTag).toHaveBeenCalledWith('rooms', 'max')
  })
})
