"use client";

import { type FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type AdminLoginFormProps = {
  fallbackRedirect?: string;
};

export default function AdminLoginForm({
  fallbackRedirect = "/admin",
}: AdminLoginFormProps) {
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

      const redirectPath =
        searchParams.get("redirectedFrom") ?? fallbackRedirect;
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
        className="w-full rounded-full border border-black/10 bg-accent px-6 py-3 text-sm font-semibold text-white"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
