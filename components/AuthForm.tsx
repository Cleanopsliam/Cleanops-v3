"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/client";

type Props = { mode: "sign-in" | "sign-up" };

export function AuthForm({ mode }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const supabase = getBrowserSupabase();

    const fn =
      mode === "sign-in"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });

    const { error } = await fn;
    setPending(false);

    if (error) {
      setError(error.message);
      return;
    }

    // On success, Supabase writes sb-<project-ref>-auth-token cookie in the browser.
    // Kick to dashboard and let server components see the cookie.
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 max-w-md">
      <input
        className="w-full rounded-md px-3 py-2 bg-white/10 border border-white/20"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        className="w-full rounded-md px-3 py-2 bg-white/10 border border-white/20"
        type="password"
        placeholder="••••••••"
        autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error ? <p className="text-red-400 text-sm">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-white text-black px-4 py-2 disabled:opacity-50"
      >
        {mode === "sign-in" ? (pending ? "Signing in..." : "Sign in") : (pending ? "Creating..." : "Create account")}
      </button>
    </form>
  );
}
