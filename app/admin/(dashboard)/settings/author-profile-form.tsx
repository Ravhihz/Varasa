'use client'

import { useActionState, useEffect } from 'react'
import { upsertAuthorAction, type ProfileFormState } from './actions'
import type { Author } from '@/lib/supabase/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { generateSlug } from '@/lib/utils/slug'

export function AuthorProfileForm({ author }: { author: Author | null }) {
  const [state, action, isPending] = useActionState<ProfileFormState, FormData>(
    upsertAuthorAction,
    null
  )

  useEffect(() => {
    if (state?.success) toast.success('Profile saved.')
    if (state?.error) toast.error(state.error)
  }, [state])

  return (
    <form action={action} className="space-y-4">
      {author?.id && <input type="hidden" name="id" value={author.id} />}

      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={author?.name ?? ''}
          placeholder="Your full name"
          required
          disabled={isPending}
          onChange={(e) => {
            const form = e.currentTarget.form
            const slugInput = form?.elements.namedItem('slug') as HTMLInputElement | null
            if (slugInput && !slugInput.dataset.manual) {
              slugInput.value = generateSlug(e.target.value)
            }
          }}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={author?.slug ?? ''}
          placeholder="your-name"
          disabled={isPending}
          onInput={(e) => {
            ;(e.currentTarget as HTMLInputElement).dataset.manual = 'true'
          }}
        />
        <p className="text-xs text-muted-foreground">Used in your public author URL: /author/your-slug</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio">Bio <span className="text-muted-foreground">(optional)</span></Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={author?.bio ?? ''}
          placeholder="Tell readers about yourself"
          rows={4}
          disabled={isPending}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="avatar_url">Avatar URL <span className="text-muted-foreground">(optional)</span></Label>
        <Input
          id="avatar_url"
          name="avatar_url"
          defaultValue={author?.avatar_url ?? ''}
          placeholder="https://example.com/avatar.jpg"
          type="url"
          disabled={isPending}
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {author ? 'Save changes' : 'Create profile'}
      </Button>
    </form>
  )
}
