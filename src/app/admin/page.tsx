import Link from "next/link";
import AdminPostList from "@/components/admin/AdminPostList";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted">
            Admin
          </p>
          <h1 className="text-3xl font-serif tracking-tight">Dashboard</h1>
        </div>
        <Link
          href="/admin/new"
          className="rounded-full border border-black/10 bg-accent px-6 py-3 text-sm font-semibold text-white"
        >
          New entry
        </Link>
      </header>

      <AdminPostList />
    </div>
  );
}
