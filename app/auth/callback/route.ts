// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const bodyText = await req.text()
    const parsed = bodyText ? JSON.parse(bodyText) : {}
    const { event, session } = parsed as {
      event?: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | string
      session?: any
    }

    const cookieStore = await cookies()

    const isLocal =
      process.env.NODE_ENV !== 'production' &&
      (process.env.NEXT_PUBLIC_SITE_URL?.startsWith('http://localhost') ||
        typeof window === 'undefined') // route handlers run server-side anyway

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        // 👇 make cookies readable by middleware on http://localhost
        cookieOptions: {
          name: 'sb',
          path: '/',
          sameSite: 'lax',
          secure: false, // <-- IMPORTANT for localhost (no https)
        },
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string) {
            cookieStore.delete(name)
          },
        },
      }
    )

    if (event === 'SIGNED_OUT') {
      await supabase.auth.signOut()
    } else if (session) {
      await supabase.auth.setSession(session)
    }

    const c = {
      access: cookieStore.get('sb-access-token') ? 'present' : 'missing',
      refresh: cookieStore.get('sb-refresh-token') ? 'present' : 'missing',
      legacy: cookieStore.get('supabase-auth-token') ? 'present' : 'missing',
    }

    return NextResponse.json({ ok: true, cookies: c })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}