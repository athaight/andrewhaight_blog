"use client";

import { useActionState } from "react";
import { subscribeToNewsletter } from "@/app/actions/subscribe";

interface SubscribeFormProps {
  variant?: "inline" | "post";
}

const initialState = { success: false, message: "" };

export default function SubscribeForm({
  variant = "inline",
}: SubscribeFormProps) {
  const [state, formAction, isPending] = useActionState(
    subscribeToNewsletter,
    initialState
  );

  // After successful subscribe, just show the confirmation message
  if (state.success) {
    return (
      <div
        className={
          variant === "post"
            ? "border-t border-black/10 pt-8 mt-10"
            : ""
        }
      >
        <p className="text-sm text-ink italic">
          {state.message}
        </p>
      </div>
    );
  }

  if (variant === "post") {
    return (
      <div className="border-t border-black/10 pt-8 mt-10">
        <p className="text-sm text-muted mb-3">
          If you want to know when I post something new, drop your email below.
          No spam — just a heads up when there&apos;s a new post.
        </p>
        <form action={formAction} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            required
            className="flex-1 rounded border border-black/10 bg-transparent px-3 py-2 text-sm text-ink placeholder:text-muted/60 outline-none focus:border-accent transition-colors"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded bg-ink px-4 py-2 text-sm font-medium text-paper transition-opacity hover:opacity-80 disabled:opacity-50 shrink-0"
          >
            {isPending ? "Subscribing…" : "Subscribe"}
          </button>
        </form>
        {state.message && !state.success && (
          <p className="text-sm text-red-600 mt-2">{state.message}</p>
        )}
      </div>
    );
  }

  // Inline variant — compact, for the footer
  return (
    <div>
      <p className="text-sm text-muted mb-2">
        Get notified when I post something new.
      </p>
      <form action={formAction} className="flex gap-2">
        <input
          type="email"
          name="email"
          placeholder="you@example.com"
          required
          className="w-full max-w-xs rounded border border-black/10 bg-transparent px-3 py-1.5 text-sm text-ink placeholder:text-muted/60 outline-none focus:border-accent transition-colors"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-ink px-3 py-1.5 text-sm font-medium text-paper transition-opacity hover:opacity-80 disabled:opacity-50 shrink-0"
        >
          {isPending ? "…" : "Subscribe"}
        </button>
      </form>
      {state.message && !state.success && (
        <p className="text-xs text-red-600 mt-1">{state.message}</p>
      )}
    </div>
  );
}
