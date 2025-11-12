// lib/supabase/client.ts
'use client'

import { createBrowserClient } from '@supabase/ssr'

export function getBrowserSupabase() {
  // Explicit options avoid edge cases with token rotation
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          'X-Client-Info': 'cleanopsai-web',
        },
      },
    }
  )
}