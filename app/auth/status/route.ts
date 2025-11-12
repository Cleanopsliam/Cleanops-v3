// app/auth/status/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const c = await cookies()
  const sbAccess = c.get('sb-access-token')?.value ? 'present' : 'missing'
  const sbRefresh = c.get('sb-refresh-token')?.value ? 'present' : 'missing'
  const legacy = c.get('supabase-auth-token')?.value ? 'present' : 'missing'

  return NextResponse.json({
    cookies: {
      'sb-access-token': sbAccess,
      'sb-refresh-token': sbRefresh,
      'supabase-auth-token': legacy,
    },
  })
}