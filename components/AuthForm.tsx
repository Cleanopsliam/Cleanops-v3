'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/app/providers'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const router = useRouter()
  const supabase = useSupabase()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setInfo(null)

    try {
      if (mode === 'sign-in') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
        router.refresh()
        return
      }

      // SIGN-UP flow
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: origin ? `${origin}/auth/callback` : undefined
        }
      })
      if (error) throw error

      // Two cases:
      // A) If your Supabase project DISABLES "Email Confirmations", you'll have a session immediately.
      // B) If confirmations are ENABLED, no session yet; user must click the email link.
      if (data.session) {
        router.push('/dashboard')
        router.refresh()
      } else {
        setInfo('Check your email — click the sign-in link to finish setting up your account.')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4">
      <div>
        <label className="block text-sm mb-1">Email</label>
        <input
          type="email"
          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Password</label>
        <input
          type="password"
          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {info && <p className="text-mint text-sm">{info}</p>}

      <button disabled={loading} className="btn w-full justify-center">
        {loading ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
      </button>
    </form>
  )
}