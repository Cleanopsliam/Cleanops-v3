'use client'

import { useEffect, useState } from 'react'
import { getBrowserSupabase } from '@/lib/supabase/client'

type CookieStatus = 'present' | 'missing'

export default function AuthDebug() {
  const [clientSession, setClientSession] = useState<any>(null)
  const [status, setStatus] = useState<{ cookies: Record<string, CookieStatus> } | null>(null)
  const [syncResp, setSyncResp] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = getBrowserSupabase()
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) setError(error.message)
      setClientSession(data?.session ?? null)
    })
    fetch('/auth/status', { cache: 'no-store' })
      .then(r => r.json())
      .then(setStatus)
      .catch(() => {})
  }, [])

  async function forceSync() {
    setError(null); setLoading(true); setSyncResp(null)
    try {
      const supabase = getBrowserSupabase()
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      const resp = await fetch('/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ event: 'TOKEN_REFRESHED', session: data.session }),
      })
      const json = await resp.json()
      setSyncResp(json)
      // re-check cookie status
      const s = await fetch('/auth/status', { cache: 'no-store' }).then(r => r.json())
      setStatus(s)
    } catch (e: any) {
      setError(e?.message ?? 'forceSync failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-3xl">
      <div className="card p-6 mt-8 space-y-4">
        <h1 className="text-2xl font-semibold">Auth Debug</h1>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        <section>
          <h2 className="font-medium mb-2">Client Session</h2>
          <pre className="text-xs opacity-90 overflow-auto bg-[var(--surface)] p-3 rounded-lg">
            {JSON.stringify(clientSession, null, 2)}
          </pre>
        </section>

        <section>
          <h2 className="font-medium mb-2">Server Cookies (/auth/status)</h2>
          <pre className="text-xs opacity-90 overflow-auto bg-[var(--surface)] p-3 rounded-lg">
            {JSON.stringify(status, null, 2)}
          </pre>
        </section>

        <section className="flex items-center gap-3">
          <button className="btn" onClick={forceSync} disabled={loading}>
            {loading ? 'Syncing…' : 'Force Cookie Sync'}
          </button>
          {syncResp && (
            <span className="text-sm opacity-80">
              callback response: {syncResp.ok ? 'ok' : 'failed'}
            </span>
          )}
        </section>

        {syncResp && (
          <section>
            <h2 className="font-medium mb-2">/auth/callback response</h2>
            <pre className="text-xs opacity-90 overflow-auto bg-[var(--surface)] p-3 rounded-lg">
              {JSON.stringify(syncResp, null, 2)}
            </pre>
          </section>
        )}
      </div>
    </div>
  )
}