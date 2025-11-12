'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { getBrowserSupabase } from '@/lib/supabase/client'

export default function SignInPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const redirect = sp.get('redirect') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const supabase = getBrowserSupabase()
      const { error: signErr } = await supabase.auth.signInWithPassword({ email, password })
      if (signErr) {
        setError(signErr.message)
        setLoading(false)
        return
      }

      // Get the session object to send to the server
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession()
      if (sessionErr) {
        setError(sessionErr.message)
        setLoading(false)
        return
      }
      const session = sessionData?.session
      if (!session) {
        setError('No session returned from Supabase.')
        setLoading(false)
        return
      }

      // Sync cookies on the server so middleware can see them
      const resp = await fetch('/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ event: 'SIGNED_IN', session }),
      })
      if (!resp.ok) {
        const text = await resp.text()
        setError(`Cookie sync failed: ${text || resp.status}`)
        setLoading(false)
        return
      }

      // OPTIONAL: verify server sees cookies before navigating
      try {
        const status = await fetch('/auth/status', { cache: 'no-store' }).then(r => r.json())
        if (status?.cookies?.['sb-access-token'] !== 'present') {
          console.warn('Server cookie missing after sync:', status)
        }
      } catch {}

      // Navigate; middleware should now allow access
      router.replace(redirect)
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Unexpected error')
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-md">
      <div className="card p-6 mt-8">
        <h1 className="text-2xl font-semibold mb-2">Welcome back</h1>
        <p className="text-sm text-[var(--muted)] mb-6">Sign in to continue to your dashboard.</p>

        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block">
            <span className="text-sm opacity-80">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
              autoComplete="email"
            />
          </label>

          <label className="block">
            <span className="text-sm opacity-80">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
              autoComplete="current-password"
            />
          </label>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
            <Link href="/auth/sign-up" className="btn-secondary">
              Create account
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}