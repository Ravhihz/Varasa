import { LogoutButton } from './LogoutButton'
import { Separator } from '@/components/ui/separator'

export function AdminHeader() {
  return (
    <>
      <header className="flex h-14 items-center justify-between px-6 bg-background">
        <div />
        <LogoutButton />
      </header>
      <Separator />
    </>
  )
}
