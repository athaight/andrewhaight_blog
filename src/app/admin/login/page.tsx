import { Suspense } from "react";
import AdminLoginForm from "./AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-6">
      <header className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted">
          Admin login
        </p>
        <h1 className="text-3xl font-serif tracking-tight">Welcome back</h1>
      </header>

      <Suspense
        fallback={
          <div className="rounded-3xl border border-black/10 bg-white/80 p-6 text-center text-sm text-[color:var(--muted)]">
            Loading login...
          </div>
        }
      >
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
