import Link from "next/link";
import { searchPublishedContent } from "@/lib/content";

type SearchPageProps = {
  searchParams: { q?: string };
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q?.trim() ?? "";
  const results = query ? await searchPublishedContent(query) : [];

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted">
          Search
        </p>
        <h1 className="text-4xl font-serif tracking-tight">Find a post</h1>
        <p className="text-muted">
          Search across published posts and projects.
        </p>
      </header>
      <form
        className="flex flex-col gap-3 sm:flex-row"
        method="get"
        action="/search"
      >
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search by keyword"
          className="flex-1 rounded-full border border-black/10 bg-white px-5 py-3 text-sm"
        />
        <button
          type="submit"
          className="rounded-full border border-black/10 bg-accent px-6 py-3 text-sm font-semibold text-white"
        >
          Search
        </button>
      </form>

      {query ? (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            {results.length} result{results.length === 1 ? "" : "s"} for
            &quot;{query}&quot;
          </p>
          <div className="grid gap-4">
            {results.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-black/10 bg-white/80 p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                  {item.type}
                </p>
                <h2 className="mt-2 text-2xl font-serif tracking-tight">
                  <Link href={`/${item.type}s/${item.slug}`}>{item.title}</Link>
                </h2>
                <p className="mt-2 text-muted">{item.excerpt}</p>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted">
          Enter a keyword to start searching.
        </p>
      )}
    </div>
  );
}
