"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          size?: "invisible" | "compact" | "normal";
        }
      ) => string | number;
      reset: (widgetId?: string | number) => void;
      execute: (widgetId?: string | number) => void;
    };
  }
}

type FormState = {
  name: string;
  email: string;
  message: string;
  company: string;
};

type Status = "idle" | "submitting" | "success" | "error";

const emptyForm: FormState = {
  name: "",
  email: "",
  message: "",
  company: "",
};

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReady, setTurnstileReady] = useState(false);
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<string | number | null>(null);
  const turnstilePromiseRef = useRef<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
  } | null>(null);
  const submissionIdRef = useRef<string | null>(null);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  const emailJsServiceId =
    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "";
  const emailJsTemplateId =
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "";
  const emailJsPublicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "";

  function getSubmissionId() {
    if (!submissionIdRef.current) {
      submissionIdRef.current =
        window.crypto?.randomUUID?.() ??
        `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }
    return submissionIdRef.current;
  }

  async function sendEmailJs() {
    if (!emailJsServiceId || !emailJsTemplateId || !emailJsPublicKey) {
      throw new Error("Email service is not configured.");
    }

    const response = await fetch(
      "https://api.emailjs.com/api/v1.0/email/send",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: emailJsServiceId,
          template_id: emailJsTemplateId,
          user_id: emailJsPublicKey,
          template_params: {
            name: form.name,
            email: form.email,
            title: `New contact from ${form.name}`,
            message: form.message,
          },
        }),
      }
    );

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || "EmailJS request failed.");
    }
  }

  useEffect(() => {
    if (turnstileReady) return;
    if (window.turnstile) {
      setTurnstileReady(true);
      return;
    }
    const timer = window.setTimeout(() => {
      if (window.turnstile) {
        setTurnstileReady(true);
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [turnstileReady]);

  useEffect(() => {
    if (!turnstileSiteKey || !turnstileReady) return;
    if (!turnstileContainerRef.current) return;
    if (turnstileWidgetIdRef.current !== null) return;
    if (!window.turnstile) return;

    turnstileWidgetIdRef.current = window.turnstile.render(
      turnstileContainerRef.current,
      {
        sitekey: turnstileSiteKey,
        size: "invisible",
        callback: (token: string) => {
          setTurnstileToken(token);
          turnstilePromiseRef.current?.resolve(token);
          turnstilePromiseRef.current = null;
        },
        "error-callback": () =>
          setError("Spam check failed to load. Please refresh."),
        "expired-callback": () => setTurnstileToken(""),
      }
    );
  }, [turnstileReady, turnstileSiteKey]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError(null);
    setWarning(null);

    let token = turnstileToken;

    if (!token) {
      const turnstile = window.turnstile;
      if (!turnstile || turnstileWidgetIdRef.current === null) {
        setError("Spam check failed to load. Please refresh.");
        setStatus("error");
        return;
      }

      try {
        token = await new Promise<string>((resolve, reject) => {
          turnstilePromiseRef.current = { resolve, reject };
          turnstile.execute(turnstileWidgetIdRef.current ?? undefined);
          window.setTimeout(() => {
            if (turnstilePromiseRef.current) {
              turnstilePromiseRef.current = null;
              reject(new Error("Spam check timed out. Please retry."));
            }
          }, 8000);
        });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Please complete the spam check before submitting.";
        setError(message);
        setStatus("error");
        return;
      }
    }

    try {
      const submissionId = getSubmissionId();
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          turnstileToken: token,
          submissionId,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          payload?.detail
            ? `${payload.error ?? "Unable to send message."} ${payload.detail}`
            : payload?.error ?? "Unable to send message.";
        throw new Error(message);
      }

      const shouldSendEmail = payload?.shouldSendEmail ?? true;
      if (shouldSendEmail) {
        try {
          await sendEmailJs();
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Email notification failed.";
          setWarning(
            `Message saved, but email notification failed. ${message}`
          );
        }
      }

      setStatus("success");
      setForm(emptyForm);
      submissionIdRef.current = null;
      setTurnstileToken("");
      if (window.turnstile && turnstileWidgetIdRef.current !== null) {
        window.turnstile.reset(turnstileWidgetIdRef.current);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to send.";
      setError(message);
      setStatus("error");
    }
  }

  const isSubmitting = status === "submitting";
  const isSuccess = status === "success";

  return (
    <div className="space-y-8">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setTurnstileReady(true)}
      />
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted">
          Contact
        </p>
        <h1 className="text-4xl font-serif tracking-tight">
          Send a quick note
        </h1>
        <p className="max-w-2xl text-muted">
          Share an idea, ask a question, or just say hello.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <label
          className="absolute -left-2500"
          aria-hidden="true"
          tabIndex={-1}
        >
          Company
          <input
            type="text"
            name="company"
            value={form.company}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                company: event.target.value,
              }))
            }
            autoComplete="off"
            tabIndex={-1}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold">
          Name
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            className="rounded-xl border border-black/10 bg-white px-4 py-3 text-base font-normal"
            required
            maxLength={120}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold">
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
            className="rounded-xl border border-black/10 bg-white px-4 py-3 text-base font-normal"
            required
            maxLength={200}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold">
          Message
          <textarea
            name="message"
            value={form.message}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                message: event.target.value,
              }))
            }
            rows={6}
            className="rounded-xl border border-black/10 bg-white px-4 py-3 text-base font-normal"
            required
            maxLength={4000}
          />
        </label>

        {turnstileSiteKey ? (
          <div className="space-y-2">
            <div
              ref={turnstileContainerRef}
              className="min-h-16.25"
            />
            <p className="text-xs text-muted">
              Protected by Cloudflare Turnstile.
            </p>
          </div>
        ) : (
          <p className="text-xs text-red-600">
            Missing Turnstile site key. Add
            {" "}
            NEXT_PUBLIC_TURNSTILE_SITE_KEY.
          </p>
        )
        }

        {warning ? <p className="text-sm text-amber-700">{warning}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {isSuccess ? (
          <p className="text-sm text-emerald-700">
            Thanks! Your message has been sent.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full border border-black/10 bg-accent px-6 py-3 text-sm font-semibold text-white sm:w-fit"
        >
          {isSubmitting ? "Sending..." : "Send message"}
        </button>
      </form>
    </div>
  );
}
