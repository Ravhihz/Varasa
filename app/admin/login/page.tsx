import type { Metadata } from 'next'
import { LoginForm } from './login-form'

export const metadata: Metadata = {
  title: 'Login',
  robots: { index: false, follow: false },
}

// Login page reads cookies to check session state — opt out of prerendering.
export const instant = false

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo / brand */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Varasa</h1>
          <p className="text-sm text-muted-foreground">Admin Dashboard</p>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}
