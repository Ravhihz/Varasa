'use client'

import { useTransition } from 'react'
import { logoutAction } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { LogOut, Loader2 } from 'lucide-react'

export function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => {
      await logoutAction()
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={isPending}
      className="text-muted-foreground hover:text-foreground"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <>
          <LogOut className="h-4 w-4 mr-1.5" aria-hidden="true" />
          Sign out
        </>
      )}
    </Button>
  )
}
