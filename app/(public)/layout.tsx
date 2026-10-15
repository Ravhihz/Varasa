import { PublicFooter } from '@/components/public/PublicFooter'
import { PublicHeader } from '@/components/public/PublicHeader'
import '../public.css'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main-content" className="skip-link">Lewati ke konten</a>
      <PublicHeader />
      <div className="flex-1">{children}</div>
      <PublicFooter />
    </>
  )
}
