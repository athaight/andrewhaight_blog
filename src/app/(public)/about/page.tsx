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
        <p>
          For the MVP, this page is intentionally short. It will expand with
          background, focus areas, and links once the content system is wired
          up.
        </p>
      </div>
    </div>
  );
}
