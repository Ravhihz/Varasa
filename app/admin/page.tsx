import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { FileText, FolderOpen, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
}

export const instant = false

async function getDashboardStats() {
  const supabase = await createClient()

  const [articlesResult, categoriesResult, publishedResult] = await Promise.all([
    supabase.from('articles').select('id', { count: 'exact', head: true }),
    supabase.from('categories').select('id', { count: 'exact', head: true }),
    supabase
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published'),
  ])

  return {
    totalArticles: articlesResult.count ?? 0,
    totalCategories: categoriesResult.count ?? 0,
    publishedArticles: publishedResult.count ?? 0,
  }
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back. Here's an overview of your content.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Articles
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalArticles}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Published
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.publishedArticles}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categories
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalCategories}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
