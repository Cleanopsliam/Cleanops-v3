// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export function getServerSupabase() {
  const cookieStorePromise = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_STUB ?? process.env.NEXT_PUBLIC_SUPABASE_URL!, // keep URL
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name: string) => (await cookieStorePromise).get(name)?.value,
        set: async (name: string, value: string, options: CookieOptions) => {
            (await cookieStorePromise).set({ name, value, ...options });
        },
        remove: async (name: string) => {
            (await cookieStorePromise).delete(name); // important: pass just the name
        },
      },
    }
  );
}
