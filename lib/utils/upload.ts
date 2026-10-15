/**
 * Client-side upload helper.
 * Sends a file to the /api/upload route and returns the public URL.
 * Throws an error with a user-friendly message on failure.
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  const json = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(
      typeof json?.error === 'string'
        ? json.error
        : 'Upload failed. Please try again.'
    )
  }

  if (typeof json?.url !== 'string') {
    throw new Error('Unexpected response from upload server.')
  }

  return json.url
}
