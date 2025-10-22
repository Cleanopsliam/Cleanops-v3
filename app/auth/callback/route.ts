import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  // Supabase sends ?code=... (and sometimes ?next=...)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/dashboard'

  const supabase = getServerSupabase()

  if (code) {
    // This will set the auth cookies if the code is valid
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL(next, request.url))
}