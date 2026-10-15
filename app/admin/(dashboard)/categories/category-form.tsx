'use client'

import { useActionState, useEffect } from 'react'
import { createCategoryAction, type CategoryFormState } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { generateSlug } from '@/lib/utils/slug'

export function CategoryForm() {
  const [state, action, isPending] = useActionState<CategoryFormState, FormData>(
    createCategoryAction,
    null
  )

  useEffect(() => {
    if (state?.success) toast.success('Category created.')
    if (state?.error) toast.error(state.error)
  }, [state])

  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="cat-name">Name</Label>
          <Input
            id="cat-name"
            name="name"
            placeholder="Strategi Bisnis"
            required
            disabled={isPending}
            onChange={(e) => {
              const slugInput = e.currentTarget.form?.elements.namedItem('slug') as HTMLInputElement | null
              if (slugInput && !slugInput.dataset.manual) {
                slugInput.value = generateSlug(e.target.value)
              }
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cat-slug">Slug</Label>
          <Input
            id="cat-slug"
            name="slug"
            placeholder="strategi-bisnis"
            disabled={isPending}
            onInput={(e) => {
              ;(e.currentTarget as HTMLInputElement).dataset.manual = 'true'
            }}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cat-desc">Description <span className="text-muted-foreground">(optional)</span></Label>
        <Textarea
          id="cat-desc"
          name="description"
          placeholder="Artikel tentang strategi bisnis dan pertumbuhan usaha"
          rows={2}
          disabled={isPending}
        />
      </div>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Add category
      </Button>
    </form>
  )
}
