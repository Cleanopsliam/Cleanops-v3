// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Next.js 15-compatible Supabase server client.
 * - Uses awaited cookies() (auth-interrupts friendly)
 * - Allows Supabase to read & write session cookies during RSC render
 * - Works in Server Actions / Route Handlers too
 */
export async function getServerSupabase() {
  const cookieStore = await cookies(); // <- IMPORTANT in Next 15

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get: async (name: string) => cookieStore.get(name)?.value,
      set: async (name: string, value: string, options: CookieOptions) => {
        cookieStore.set({ name, value, ...options });
      },
      remove: async (name: string, options?: CookieOptions) => {
        // delete(name) is enough; keep options for strict domains/paths if needed
        options
          ? cookieStore.set({ name, value: "", ...options, maxAge: 0 })
          : cookieStore.delete(name);
      },
    },
  });
}