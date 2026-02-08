"use client";

import { type FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      const redirectPath = searchParams.get("redirectedFrom") ?? "/admin";
      router.push(redirectPath);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-6">
      <header className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--muted)]">
          Admin login
        </p>
        <h1 className="text-3xl font-serif tracking-tight">Welcome back</h1>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-3xl border border-black/10 bg-white/80 p-6"
      >
        <label className="flex flex-col gap-2 text-sm font-semibold">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-xl border border-black/10 bg-white px-4 py-3 text-base font-normal"
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-xl border border-black/10 bg-white px-4 py-3 text-base font-normal"
            required
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          className="w-full rounded-full border border-black/10 bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-white"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
