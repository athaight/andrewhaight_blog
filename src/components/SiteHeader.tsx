"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Container from "./Container";

const baseNavItems = [
  { href: "/posts", label: "Posts" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/search", label: "Search" },
  { href: "/contact", label: "Contact" },
];

const konamiSequence = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
  "b",
  "a",
  "Enter",
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [personalUnlocked, setPersonalUnlocked] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const [passphraseError, setPassphraseError] = useState<string | null>(null);
  const [passphraseLoading, setPassphraseLoading] = useState(false);
  const [passphraseSuccess, setPassphraseSuccess] = useState<string | null>(
    null
  );
  const modalRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const successTimerRef = useRef<number | null>(null);
  const konamiIndexRef = useRef(0);
  const unlockInFlightRef = useRef(false);
  const router = useRouter();

  const navItems = personalUnlocked
    ? [...baseNavItems, { href: "/personal", label: "Personal posts" }]
    : baseNavItems;

  const unlockPersonalAccess = useCallback(async (value: string) => {
    if (personalUnlocked || unlockInFlightRef.current) return;

    const trimmed = value.trim();
    if (!trimmed) {
      setPassphraseError("Enter the passphrase to continue.");
      return;
    }

    unlockInFlightRef.current = true;
    setPassphraseLoading(true);
    try {
      const response = await fetch("/api/personal/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase: trimmed }),
      });

      if (!response.ok) {
        setPassphraseError("Access denied.");
        return;
      }

      setPersonalUnlocked(true);
      setPassphraseSuccess("Well well well, look who has access?");
      setPassphraseError(null);
      if (successTimerRef.current) {
        window.clearTimeout(successTimerRef.current);
      }
      successTimerRef.current = window.setTimeout(() => {
        setModalOpen(false);
        setPassphraseSuccess(null);
        successTimerRef.current = null;
      }, 3000);
      router.refresh();
      setPassphrase("");
    } finally {
      unlockInFlightRef.current = false;
      setPassphraseLoading(false);
    }
  }, [personalUnlocked, router]);

  const openAccessModal = useCallback(() => {
    if (personalUnlocked) return;
    setPassphrase("");
    setPassphraseError(null);
    setPassphraseSuccess(null);
    setModalOpen(true);
  }, [personalUnlocked]);

  useEffect(() => {
    let active = true;
    fetch("/api/personal/status", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (!active) return;
        setPersonalUnlocked(Boolean(payload?.access));
      })
      .catch(() => {
        if (!active) return;
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const key =
        event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const expected = konamiSequence[konamiIndexRef.current];
      if (key === expected) {
        konamiIndexRef.current += 1;
        if (konamiIndexRef.current === konamiSequence.length) {
          konamiIndexRef.current = 0;
          openAccessModal();
        }
        return;
      }

      konamiIndexRef.current =
        key === konamiSequence[0] ? 1 : 0;
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [openAccessModal]);

  useEffect(() => {
    function handleFooterUnlock() {
      openAccessModal();
    }

    window.addEventListener("personal-access-request", handleFooterUnlock);
    return () => {
      window.removeEventListener(
        "personal-access-request",
        handleFooterUnlock
      );
    };
  }, [openAccessModal]);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        window.clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!personalUnlocked) return;

    function clearPersonalAccess() {
      const url = "/api/personal/logout";
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url);
        return;
      }
      fetch(url, { method: "POST", keepalive: true }).catch(() => undefined);
    }

    window.addEventListener("beforeunload", clearPersonalAccess);
    return () => {
      window.removeEventListener("beforeunload", clearPersonalAccess);
    };
  }, [personalUnlocked]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setModalOpen(false);
    }

    if (modalOpen) {
      window.setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }

    return undefined;
  }, [modalOpen]);

  useEffect(() => {
    if (!modalOpen) return;

    function handleTab(event: KeyboardEvent) {
      if (event.key !== "Tab") return;
      const container = modalRef.current;
      if (!container) return;
      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
        )
      ).filter((element) => !element.hasAttribute("disabled"));

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleTab);
    return () => window.removeEventListener("keydown", handleTab);
  }, [modalOpen]);

  return (
    <header className="border-b border-black/10 bg-white/70 backdrop-blur">
      <Container className="flex flex-col gap-6 py-6">
        <div className="flex items-start justify-between gap-6 md:items-center">
          <div>
            <Link
              href="/"
              className="text-xl font-serif tracking-tight text-ink"
            >
              Andrew Haight
            </Link>
            <p className="mt-1 text-sm text-muted">
              Writing, notes, and projects in progress.
            </p>
          </div>
          <button
            type="button"
            className="md:hidden inline-flex items-center text-lg text-muted transition-colors hover:text-ink"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span aria-hidden="true" className="leading-none">
              {menuOpen ? "×" : "≡"}
            </span>
          </button>
          <nav className="hidden md:flex flex-wrap gap-4 text-sm font-medium uppercase tracking-[0.2em] text-muted">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <nav
          id="mobile-nav"
          className={`md:hidden flex flex-col gap-3 overflow-hidden text-sm font-medium uppercase tracking-[0.2em] text-muted transition-[max-height,opacity,transform] duration-[220ms] ease-out motion-reduce:transition-none ${
            menuOpen
              ? "max-h-64 opacity-100 translate-y-0"
              : "max-h-0 opacity-0 -translate-y-1 pointer-events-none"
          }`}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-ink"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </Container>
      {modalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center px-6">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="personal-access-title"
            className="relative w-full max-w-md rounded-3xl border border-black/10 bg-white/95 p-6 shadow-xl"
            ref={modalRef}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted">
                  Personal access
                </p>
                <h2
                  id="personal-access-title"
                  className="mt-2 text-2xl font-serif tracking-tight"
                >
                  Enter the passphrase
                </h2>
              </div>
              <button
                type="button"
                className="text-lg text-muted transition-colors hover:text-ink"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            {passphraseSuccess ? (
              <div className="mt-5 rounded-2xl border border-black/10 bg-white/80 px-4 py-4 text-sm text-ink">
                <p aria-live="polite">{passphraseSuccess}</p>
              </div>
            ) : (
              <form
                className="mt-5 grid gap-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  unlockPersonalAccess(passphrase);
                }}
              >
                <label className="grid gap-2 text-sm font-semibold">
                  Passphrase
                  <input
                    type="password"
                    value={passphrase}
                    onChange={(event) => {
                      setPassphrase(event.target.value);
                      if (passphraseError) setPassphraseError(null);
                    }}
                    ref={inputRef}
                    autoFocus
                    className="rounded-xl border border-black/10 bg-white px-4 py-3 text-base font-normal"
                    disabled={passphraseLoading}
                  />
                </label>
                {passphraseError ? (
                  <p className="text-sm text-red-600">{passphraseError}</p>
                ) : null}
                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className="rounded-full border border-black/10 bg-accent px-6 py-3 text-sm font-semibold text-white"
                    disabled={passphraseLoading}
                  >
                    {passphraseLoading ? "Checking..." : "Unlock"}
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold"
                    onClick={() => setModalOpen(false)}
                    disabled={passphraseLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
