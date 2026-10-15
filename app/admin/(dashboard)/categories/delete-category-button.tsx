'use client'

import { useTransition } from 'react'
import { deleteCategoryAction } from './actions'
import { Button } from '@/components/ui/button'
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export function DeleteCategoryButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`Delete category "${name}"? This cannot be undone.`)) return
    startTransition(async () => {
      const result = await deleteCategoryAction(id)
      if (result.error) toast.error(result.error)
      else toast.success('Category deleted.')
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={isPending}
      className="text-destructive hover:text-destructive hover:bg-destructive/10"
      aria-label={`Delete category ${name}`}
    >
      {isPending
        ? <Loader2 className="h-4 w-4 animate-spin" />
        : <Trash2 className="h-4 w-4" />
      }
    </Button>
  )
}
