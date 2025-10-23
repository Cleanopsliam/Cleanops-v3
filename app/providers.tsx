'use client'
import { createContext, useContext, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ThemeProvider } from '@/components/theme/ThemeProvider'

const SupabaseCtx = createContext<SupabaseClient | null>(null)

export function Providers({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anon) {
      console.error(
        '@supabase/ssr: Missing env vars. Check .env.local for NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
      )
      return null
    }
    return createBrowserClient(url, anon)
  }, [])

  if (!supabase) {
    return (
      <div style={{padding:'1rem',border:'1px solid rgba(255,255,255,0.2)',borderRadius:12}}>
        <p style={{opacity:.9,marginBottom:8}}>
          Missing Supabase config. Add a <code>.env.local</code> in your project root:
        </p>
        <pre style={{whiteSpace:'pre-wrap',opacity:.8}}>
{`NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-PUBLIC-KEY`}
        </pre>
        <p style={{opacity:.8}}>Then restart the dev server.</p>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <SupabaseCtx.Provider value={supabase}>{children}</SupabaseCtx.Provider>
    </ThemeProvider>
  )
}

export function useSupabase() {
  const ctx = useContext(SupabaseCtx)
  if (!ctx) throw new Error('Supabase provider missing')
  return ctx
}