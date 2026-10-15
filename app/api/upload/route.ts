import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminUser } from '@/lib/supabase/auth'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2MB
const BUCKET = 'varasa-media'

export async function POST(request: NextRequest) {
  // Authorization — admin only
  const adminUser = await getAdminUser()
  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
  }

  // Validate MIME type
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Only JPEG, PNG, and WebP images are allowed.' },
      { status: 422 }
    )
  }

  // Validate file size
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: 'File size must be under 2 MB.' },
      { status: 422 }
    )
  }

  // Generate collision-resistant storage path
  const ext = file.type === 'image/jpeg' ? 'jpg'
    : file.type === 'image/png' ? 'png'
    : 'webp'
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 9)
  const path = `uploads/${timestamp}-${random}.${ext}`

  const supabase = await createClient()
  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    console.error('[upload] Supabase Storage error:', uploadError)
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    )
  }

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path)

  return NextResponse.json({ url: publicUrl }, { status: 201 })
}
