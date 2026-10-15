// Login is outside the protected (dashboard) route group, so it renders
// without the admin sidebar and without the dashboard authorization check.
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
