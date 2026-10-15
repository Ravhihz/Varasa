'use client'

import Link from 'next/link'
import { useActionState, useEffect, useRef, useState } from 'react'
import { createArticleAction, updateArticleAction, deleteArticleAction, type ArticleFormState } from './actions'
import type { Article, Category } from '@/lib/supabase/types'
import { Editor, type EditorHandle } from '@/components/admin/Editor'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Eye, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { generateSlug } from '@/lib/utils/slug'
import { uploadImage } from '@/lib/utils/upload'
import { toDateInputValue } from '@/lib/utils/date'

type ArticleWithCats = Article & { category_ids?: string[] }

interface ArticleFormProps {
  article: ArticleWithCats | null
  categories: Pick<Category, 'id' | 'name'>[]
}

export function ArticleForm({ article, categories }: ArticleFormProps) {
  const editorRef = useRef<EditorHandle>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const contentInputRef = useRef<HTMLInputElement>(null)

  const [coverImage, setCoverImage] = useState<string | null>(article?.cover_image ?? null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(article?.category_ids ?? [])
  const [pendingStatus, setPendingStatus] = useState<'draft' | 'published'>('draft')

  const isEditing = !!article
  const isScheduled = article?.status === 'published'
    && Boolean(article.published_at && toDateInputValue(article.published_at) > toDateInputValue(new Date()))

  const boundAction = isEditing
    ? updateArticleAction.bind(null, article.id)
    : createArticleAction

  const [state, action, isPending] = useActionState<ArticleFormState, FormData>(boundAction, null)

  useEffect(() => {
    if (state?.success) toast.success(isEditing ? 'Article saved.' : 'Article created.')
    if (state?.error) toast.error(state.error)
  }, [state, isEditing])

  function handleSubmit(status: 'draft' | 'published') {
    setPendingStatus(status)
    // Sync editor content to hidden input before submit
    if (contentInputRef.current) {
      const json = editorRef.current?.getJSON()
      contentInputRef.current.value = json ? JSON.stringify(json) : ''
    }
    // Sync cover image
    const coverInput = formRef.current?.elements.namedItem('cover_image') as HTMLInputElement | null
    if (coverInput) coverInput.value = coverImage ?? ''

    // Set status
    const statusInput = formRef.current?.elements.namedItem('status') as HTMLInputElement | null
    if (statusInput) statusInput.value = status

    formRef.current?.requestSubmit()
  }

  function toggleCategory(id: string) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  async function handleDelete() {
    if (!article) return
    if (!confirm('Delete this article permanently? This cannot be undone.')) return
    const result = await deleteArticleAction(article.id)
    if (result.error) toast.error(result.error)
  }

  return (
    <form ref={formRef} action={action} className="space-y-8">
      {/* Hidden inputs */}
      <input ref={contentInputRef} type="hidden" name="content_json" defaultValue={article?.content_json ? JSON.stringify(article.content_json) : ''} />
      <input type="hidden" name="cover_image" defaultValue={coverImage ?? ''} />
      <input type="hidden" name="status" defaultValue={article?.status ?? 'draft'} />
      {selectedCategories.map((cid) => (
        <input key={cid} type="hidden" name="category_ids" value={cid} />
      ))}

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        {/* Main content */}
        <div className="space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={article?.title ?? ''}
              placeholder="Your article title"
              required
              disabled={isPending}
              className="text-lg font-medium"
              onChange={(e) => {
                const slugInput = formRef.current?.elements.namedItem('slug') as HTMLInputElement | null
                if (slugInput && !slugInput.dataset.manual) {
                  slugInput.value = generateSlug(e.target.value)
                }
              }}
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={article?.slug ?? ''}
              placeholder="article-slug"
              disabled={isPending}
              onInput={(e) => {
                ;(e.currentTarget as HTMLInputElement).dataset.manual = 'true'
              }}
            />
          </div>

          {/* Excerpt */}
          <div className="space-y-1.5">
            <Label htmlFor="excerpt">Excerpt <span className="text-muted-foreground">(optional)</span></Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              defaultValue={article?.excerpt ?? ''}
              placeholder="A short summary of the article shown in listings and meta description"
              rows={3}
              disabled={isPending}
            />
          </div>

          {/* Editor */}
          <div className="space-y-1.5">
            <Label>Content</Label>
            <Editor
              editorRef={editorRef}
              initialContent={article?.content_json}
              disabled={isPending}
              onImageUpload={uploadImage}
            />
          </div>

        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Publish actions */}
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge variant={article?.status === 'published' && !isScheduled ? 'default' : 'secondary'}>
                {isScheduled ? 'scheduled' : article?.status ?? 'draft'}
              </Badge>
            </div>
            <Separator />
            <div className="flex flex-col gap-2">
              {article && (
                <Button type="button" variant="outline" size="sm" asChild>
                  <Link href={`/admin/articles/${article.id}/preview`}>
                    <Eye className="mr-2 h-4 w-4" aria-hidden="true" /> Preview saved version
                  </Link>
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleSubmit('draft')}
                disabled={isPending}
              >
                {isPending && pendingStatus === 'draft'
                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  : null}
                Save draft
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => handleSubmit('published')}
                disabled={isPending}
              >
                {isPending && pendingStatus === 'published'
                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  : null}
                {article?.status === 'published' ? 'Update' : 'Publish'}
              </Button>
              {article?.status === 'published' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSubmit('draft')}
                  disabled={isPending}
                  className="text-muted-foreground"
                >
                  Unpublish
                </Button>
              )}
            </div>
          </div>

          {/* Published at */}
          <div className="space-y-1.5">
            <Label htmlFor="published_at">Publication date <span className="text-muted-foreground">(optional)</span></Label>
            <Input
              id="published_at"
              name="published_at"
              type="date"
              defaultValue={toDateInputValue(article?.published_at)}
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">Scheduled articles go live at 00:00 WIB on this date. Leave empty to publish immediately.</p>
          </div>

          {/* Cover image */}
          <div className="space-y-1.5">
            <Label>Cover image</Label>
            <ImageUpload
              value={coverImage}
              onChange={setCoverImage}
              onUpload={uploadImage}
              disabled={isPending}
              label="Upload cover image"
            />
          </div>

          {/* Categories */}
          <div className="space-y-1.5">
            <Label>Categories</Label>
            {categories.length === 0 ? (
              <p className="text-xs text-muted-foreground">No categories yet. <a href="/admin/categories" className="underline">Add one</a>.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    disabled={isPending}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  >
                    <Badge
                      variant={selectedCategories.includes(cat.id) ? 'default' : 'outline'}
                      className="cursor-pointer select-none"
                    >
                      {cat.name}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* SEO */}
          <div className="space-y-3">
            <p className="text-sm font-medium">SEO</p>
            <div className="space-y-1.5">
              <Label htmlFor="seo_title" className="text-xs">SEO title</Label>
              <Input
                id="seo_title"
                name="seo_title"
                defaultValue={article?.seo_title ?? ''}
                placeholder="Defaults to article title"
                disabled={isPending}
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="meta_description" className="text-xs">Meta description</Label>
              <Textarea
                id="meta_description"
                name="meta_description"
                defaultValue={article?.meta_description ?? ''}
                placeholder="Defaults to excerpt"
                rows={3}
                disabled={isPending}
                className="text-sm"
              />
            </div>
          </div>

          {/* Danger zone */}
          {isEditing && (
            <>
              <Separator />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isPending}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete article
              </Button>
            </>
          )}
        </div>
      </div>
    </form>
  )
}
