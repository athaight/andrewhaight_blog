export default function AboutPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted">
          About
        </p>
        <h1 className="text-4xl font-serif tracking-tight">Hello, I am Andrew.</h1>
      </header>
      <div className="space-y-4 text-muted">
        <p>
          This is a minimal studio log for writing, projects, and notes in
          progress. I use it to keep experiments visible and share the work as
          it develops.
        </p>
      </div>
    </div>
  );
}
