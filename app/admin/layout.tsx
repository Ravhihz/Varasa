// Keep the parent layout neutral: /admin/login is a sibling route to the
// protected dashboard and must render without the dashboard authorization gate.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
