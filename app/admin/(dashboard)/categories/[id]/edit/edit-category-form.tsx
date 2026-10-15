'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateCategoryAction, type CategoryFormState } from '../../actions'
import type { Category } from '@/lib/supabase/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function EditCategoryForm({ category }: { category: Category }) {
  const router = useRouter()
  const boundAction = updateCategoryAction.bind(null, category.id)
  const [state, action, isPending] = useActionState<CategoryFormState, FormData>(
    boundAction,
    null
  )

  useEffect(() => {
    if (state?.success) {
      toast.success('Category updated.')
      router.push('/admin/categories')
    }
    if (state?.error) toast.error(state.error)
  }, [state, router])

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={category.name} required disabled={isPending} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" defaultValue={category.slug} disabled={isPending} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description <span className="text-muted-foreground">(optional)</span></Label>
        <Textarea id="description" name="description" defaultValue={category.description ?? ''} rows={3} disabled={isPending} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save changes
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isPending}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
