'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2MB

interface ImageUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  onUpload: (file: File) => Promise<string>
  disabled?: boolean
  label?: string
}

export function ImageUpload({
  value,
  onChange,
  onUpload,
  disabled = false,
  label = 'Upload image',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    // Validate MIME type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Only JPEG, PNG, and WebP images are allowed.')
      return
    }

    // Validate file size
    if (file.size > MAX_SIZE_BYTES) {
      setError('File size must be under 2 MB.')
      return
    }

    setIsUploading(true)
    try {
      const url = await onUpload(file)
      onChange(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
      // Reset input so same file can be re-selected after error
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function handleRemove() {
    onChange(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="sr-only"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        aria-label={label}
      />

      {value ? (
        <div className="relative w-full overflow-hidden rounded-md border border-input">
          <div className="relative aspect-[16/9] w-full bg-muted">
            <Image
              src={value}
              alt="Cover image"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 700px"
            />
          </div>
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2 h-7 w-7"
              onClick={handleRemove}
              aria-label="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || isUploading}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-input bg-muted/30 px-4 py-10 text-sm text-muted-foreground transition-colors',
            'hover:bg-muted/50 hover:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            (disabled || isUploading) && 'cursor-not-allowed opacity-60',
          )}
          aria-label={label}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
              <span>Uploading…</span>
            </>
          ) : (
            <>
              <Upload className="h-6 w-6" aria-hidden="true" />
              <span>{label}</span>
              <span className="text-xs">JPEG, PNG, WebP · Max 2 MB</span>
            </>
          )}
        </button>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
