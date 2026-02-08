import type { ReactNode } from "react";
import Link from "next/link";
import AdminSignOutButton from "@/components/admin/AdminSignOutButton";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-paper">
      <header className="border-b border-black/10 bg-white/80">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="text-xl font-serif tracking-tight">
              Andrew Haight
            </Link>
            <p className="text-sm text-muted">Admin studio</p>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm font-semibold">
            <Link href="/admin" className="hover:text-accent">
              Dashboard
            </Link>
            <Link
              href="/admin/new"
              className="hover:text-accent"
            >
              New entry
            </Link>
            <AdminSignOutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        {children}
      </main>
    </div>
  );
}
