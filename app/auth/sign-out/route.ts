import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  const supabase = getServerSupabase();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/auth/sign-in", "http://localhost:3000"));
}
