'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSupabase } from '@/app/providers'

export function Navbar() {
  const pathname = usePathname()
  const supabase = useSupabase()

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const isDashboard = pathname?.startsWith('/dashboard')

  return (
    <header className="sticky top-0 z-50 backdrop-blur border-b border-white/10 bg-navy/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">CleanOpsAI</Link>
        <nav className="flex items-center gap-3">
          <Link className="btn-secondary" href="/">Home</Link>
          <Link className="btn-secondary" href="/auth/sign-in">Sign in</Link>
          <Link className="btn" href="/auth/sign-up">Start free</Link>
          {isDashboard && (
            <button onClick={signOut} className="btn-secondary">Sign out</button>
          )}
        </nav>
      </div>
    </header>
  )
}
