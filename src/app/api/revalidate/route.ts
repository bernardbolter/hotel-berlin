import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

import { CMS_CACHE_TAG } from '@/lib/payload/revalidate'

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  const path = request.nextUrl.searchParams.get('path')
  const tag = request.nextUrl.searchParams.get('tag')

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  if (!path && !tag) {
    return NextResponse.json({ message: 'Missing path or tag' }, { status: 400 })
  }

  revalidatePath('/', 'layout')
  if (path) {
    revalidatePath(path)
    revalidatePath(`/de${path}`)
    revalidatePath(`/en${path}`)
  }
  revalidateTag(CMS_CACHE_TAG, 'max')
  if (tag) {
    revalidateTag(tag, 'max')
  }

  return NextResponse.json({ revalidated: true, path, tag })
}
