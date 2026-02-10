"use client";

import Link from "next/link";
import { useState } from "react";
import Container from "./Container";

const navItems = [
  { href: "/posts", label: "Posts" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/search", label: "Search" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

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
    </header>
  );
}
