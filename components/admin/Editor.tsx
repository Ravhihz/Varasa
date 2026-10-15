'use client'

import { useEffect, useImperativeHandle, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import type { TiptapDocument } from '@/lib/supabase/types'
import { isValidTiptapDocument } from '@/lib/content/renderer'
import {
  Bold, Italic, Heading2, Heading3,
  List, ListOrdered, Quote, Minus,
  Link2, ImageIcon, Undo, Redo,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface EditorHandle {
  getJSON: () => TiptapDocument | null
}

interface EditorProps {
  initialContent?: TiptapDocument | null
  onChange?: (doc: TiptapDocument | null) => void
  editorRef?: React.Ref<EditorHandle>
  onImageUpload?: (file: File) => Promise<string>
  disabled?: boolean
}

export function Editor({
  initialContent,
  onChange,
  editorRef,
  onImageUpload,
  disabled = false,
}: EditorProps) {
  const onChangeRef = useRef(onChange)
  useEffect(() => { onChangeRef.current = onChange }, [onChange])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: false,
        // Disable nodes we don't support
        code: false,
        codeBlock: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
        protocols: ['http', 'https', 'mailto'],
      }),
      Image.configure({
        HTMLAttributes: { loading: 'lazy' },
      }),
    ],
    content: initialContent ?? '',
    editable: !disabled,
    onUpdate({ editor }) {
      const json = editor.getJSON()
      const doc = isValidTiptapDocument(json) ? json : null
      onChangeRef.current?.(doc)
    },
  })

  // Expose getJSON via ref
  useImperativeHandle(editorRef, () => ({
    getJSON: () => {
      if (!editor) return null
      const json = editor.getJSON()
      return isValidTiptapDocument(json) ? json : null
    },
  }))

  // Handle image upload via toolbar button
  const handleImageInsert = async () => {
    if (!editor || !onImageUpload) return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/jpeg,image/png,image/webp'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      try {
        const url = await onImageUpload(file)
        editor.chain().focus().setImage({ src: url }).run()
      } catch {
        // Error handled by parent via toast
      }
    }
    input.click()
  }

  // Handle link insert
  const handleLinkInsert = () => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Enter URL (https:// or mailto:)', previousUrl ?? '')
    if (url === null) return
    if (!url) {
      editor.chain().focus().unsetLink().run()
      return
    }
    if (!/^(https?:|mailto:)/i.test(url)) {
      alert('Only http://, https://, and mailto: links are allowed.')
      return
    }
    editor.chain().focus().setLink({ href: url }).run()
  }

  if (!editor) return null

  return (
    <div className={cn('rounded-md border border-input bg-background', disabled && 'opacity-60')}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-input px-2 py-1.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold"
          disabled={disabled}
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic"
          disabled={disabled}
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
          disabled={disabled}
        >
          <Heading2 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
          disabled={disabled}
        >
          <Heading3 className="h-3.5 w-3.5" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet list"
          disabled={disabled}
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Ordered list"
          disabled={disabled}
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Blockquote"
          disabled={disabled}
        >
          <Quote className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal rule"
          disabled={disabled}
        >
          <Minus className="h-3.5 w-3.5" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={handleLinkInsert}
          active={editor.isActive('link')}
          title="Link"
          disabled={disabled}
        >
          <Link2 className="h-3.5 w-3.5" />
        </ToolbarButton>
        {onImageUpload && (
          <ToolbarButton
            onClick={handleImageInsert}
            title="Insert image"
            disabled={disabled}
          >
            <ImageIcon className="h-3.5 w-3.5" />
          </ToolbarButton>
        )}

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo() || disabled}
          title="Undo"
        >
          <Undo className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo() || disabled}
          title="Redo"
        >
          <Redo className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>

      {/* Editor content */}
      <EditorContent
        editor={editor}
        className={cn(
          'min-h-[400px] px-4 py-3 text-sm focus-within:outline-none',
          '[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[380px]',
          '[&_.ProseMirror_p]:mb-3',
          '[&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:mt-6 [&_.ProseMirror_h2]:mb-2',
          '[&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:mt-4 [&_.ProseMirror_h3]:mb-2',
          '[&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ul]:mb-3',
          '[&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_ol]:mb-3',
          '[&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-border [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:mb-3',
          '[&_.ProseMirror_hr]:border-border [&_.ProseMirror_hr]:my-4',
          '[&_.ProseMirror_img]:rounded-lg [&_.ProseMirror_img]:max-w-full',
          '[&_.ProseMirror_a]:text-primary [&_.ProseMirror_a]:underline',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-["Start_writing…"] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0',
        )}
      />
    </div>
  )
}

function ToolbarButton({
  onClick,
  active,
  title,
  disabled,
  children,
}: {
  onClick: () => void
  active?: boolean
  title?: string
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      variant={active ? 'secondary' : 'ghost'}
      size="icon"
      className="h-7 w-7"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
    >
      {children}
    </Button>
  )
}

function ToolbarDivider() {
  return <div className="mx-0.5 h-5 w-px bg-border" aria-hidden="true" />
}
