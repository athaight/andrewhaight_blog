import Link from "next/link";
import Container from "./Container";

const navItems = [
  { href: "/posts", label: "Posts" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/search", label: "Search" },
];

export default function SiteHeader() {
  return (
    <header className="border-b border-black/10 bg-white/70 backdrop-blur">
      <Container className="flex flex-col gap-6 py-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            href="/"
            className="text-xl font-serif tracking-tight text-[color:var(--ink)]"
          >
            Andrew Haight
          </Link>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Writing, notes, and projects in progress.
          </p>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--muted)]">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-[color:var(--ink)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </Container>
    </header>
  );
}
