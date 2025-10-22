import { redirect } from 'next/navigation'
import { getServerSupabase } from '@/lib/supabase/server'
import { DemoTabs } from '@/components/Tabs'

export default async function DashboardPage() {
  const supabase = getServerSupabase()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      <p className="text-white/70">Welcome, {user.email}</p>
      <DemoTabs />
    </div>
  )
}
