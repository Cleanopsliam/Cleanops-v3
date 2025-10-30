import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  const supabase = getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();

  return NextResponse.json({
    user_id: auth.user?.id ?? null,
    email: auth.user?.email ?? null,
  });
}
