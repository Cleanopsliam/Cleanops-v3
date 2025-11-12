'use client'

import { useEffect } from 'react'
import { getBrowserSupabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthListener() {
  const router = useRouter()

  useEffect(() => {
    const supabase = getBrowserSupabase()

    // 1️⃣ Sync once on mount (handles existing sessions)
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        try {
          await fetch('/auth/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // ✅ crucial: ensures cookies are actually written
            body: JSON.stringify({
              event: 'TOKEN_REFRESHED',
              session: data.session,
            }),
          })
          router.refresh()
        } catch (err) {
          console.error('Initial auth sync failed:', err)
        }
      }
    })

    // 2️⃣ Sync on any auth state change
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        await fetch('/auth/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // ✅ was same-origin (didn't send cookies)
          body: JSON.stringify({ event, session }),
        })
      } catch (err) {
        console.error('Auth event sync failed:', err)
      } finally {
        router.refresh()
      }
    })

    return () => {
      sub.subscription.unsubscribe()
    }
  }, [router])

  return null
}