import Link from "next/link";
import { cookies } from "next/headers";
import { searchPublishedContent } from "@/lib/content";
import { hasPersonalAccess } from "@/lib/personalAccess";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q?.trim() ?? "";
  const cookieStore = await cookies();
  const personalAccess = hasPersonalAccess(cookieStore);
  const isQueryValid = query.length >= 2;
  const { results, error } = isQueryValid
    ? await searchPublishedContent(query, { includePersonal: personalAccess })
    : { results: [], error: null };

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

      {isQueryValid ? (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            {results.length} result{results.length === 1 ? "" : "s"} for
            &quot;{query}&quot;
          </p>
          {error ? (
            <p className="text-sm text-red-600">Search error: {error}</p>
          ) : null}
          {!error && results.length === 0 ? (
            <p className="text-sm text-muted">
              No posts found for &quot;{query}&quot;. Try different keywords or{" "}
              <Link href="/posts" className="underline">
                browse all posts
              </Link>
              .
            </p>
          ) : null}
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
                  <Link
                    href={
                      item.type === "personal"
                        ? `/personal/${item.slug}`
                        : `/${item.type}s/${item.slug}`
                    }
                  >
                    {item.title}
                  </Link>
                </h2>
                <p className="mt-2 text-muted">{item.excerpt}</p>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted">
          Please enter a more specific search term.
        </p>
      )}
    </div>
  );
}
