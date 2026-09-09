import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import TopNav from './TopNav'
import DashboardNavigation from './DashboardNavigation'
import ScrollToTop from './ScrollToTop'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col md:flex-row pb-16 md:pb-0 relative">
      <DashboardNavigation userEmail={user.email} />
      <ScrollToTop />

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        <TopNav userEmail={user.email} />

        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

