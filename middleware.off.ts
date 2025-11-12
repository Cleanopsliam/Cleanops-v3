// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Apply ONLY to the app area, not auth or static files
export const config = {
  matcher: ['/dashboard/:path*'],
}

export function middleware(req: NextRequest) {
  // Allow preflight / non-HTML requests to pass through
  if (req.method === 'OPTIONS' || req.method === 'HEAD') {
    return NextResponse.next()
  }

  const cookies = req.cookies

  // Supabase v2 sets these cookies when using server-side sessions
  const sbAccess = cookies.get('sb-access-token')?.value
  const sbRefresh = cookies.get('sb-refresh-token')?.value

  // Some setups store a JSON bundle cookie named 'supabase-auth-token'
  // If it exists (even without parsing), we treat as authenticated.
  const legacyJson = cookies.get('supabase-auth-token')?.value

  const isAuthed = Boolean(sbAccess || sbRefresh || legacyJson)

  if (!isAuthed) {
    const url = new URL('/auth/sign-in', req.url)
    // send the user back to exactly where they were going
    url.searchParams.set('redirect', req.nextUrl.pathname + req.nextUrl.search)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}