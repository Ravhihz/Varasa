// Login page has its own layout — no admin sidebar/header.
// The auth check in app/admin/layout.tsx is bypassed here
// because middleware redirects unauthenticated users TO this page.
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
