"use client";

import { useEffect, useRef } from "react";
import Container from "./Container";

const TAP_THRESHOLD = 7;
const RESET_MS = 2500;
const EVENT_NAME = "personal-access-request";

export default function SiteFooter() {
  const tapCountRef = useRef(0);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  function handleTap() {
    tapCountRef.current += 1;

    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current);
    }

    if (tapCountRef.current >= TAP_THRESHOLD) {
      tapCountRef.current = 0;
      resetTimerRef.current = null;
      window.dispatchEvent(new CustomEvent(EVENT_NAME));
      return;
    }

    resetTimerRef.current = window.setTimeout(() => {
      tapCountRef.current = 0;
      resetTimerRef.current = null;
    }, RESET_MS);
  }

  return (
    <footer className="mt-auto border-t border-black/10 py-6">
      <Container>
        <p className="text-sm text-muted">
          © 2024{" "}
          <button
            type="button"
            onClick={handleTap}
            className="font-semibold text-ink transition-colors hover:text-accent"
            aria-label="Andrew Haight"
          >
            Andrew Haight
          </button>
        </p>
      </Container>
    </footer>
  );
}
