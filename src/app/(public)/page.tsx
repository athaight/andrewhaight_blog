import Link from "next/link";
import { cookies } from "next/headers";
import { getPublishedContent } from "@/lib/content";
import { hasPersonalAccess } from "@/lib/personalAccess";
import { getPersonalContent } from "@/lib/personalContent";

export default async function HomePage() {
  const latest = (await getPublishedContent()).slice(0, 4);
  const cookieStore = await cookies();
  const personalAccess = hasPersonalAccess(cookieStore);
  const personalPosts = personalAccess
    ? (await getPersonalContent()).slice(0, 3)
    : [];

  return (
    <div className="space-y-16">
      <section className="space-y-6">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted">
          Personal blog and portfolio
        </p>
        <h1 className="text-4xl font-serif tracking-tight text-ink md:text-5xl">
          Notes, experiments, and projects in steady rotation.
        </h1>
        <p className="max-w-2xl text-lg leading-7 text-muted">
          A minimal space for writing, project updates, and ideas in motion.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/posts"
            className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-semibold text-ink transition hover:-translate-y-0.5"
          >
            Browse posts
          </Link>
          <Link
            href="/projects"
            className="rounded-full border border-black/10 bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
          >
            View projects
          </Link>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-serif tracking-tight">
            Latest updates
          </h2>
          <Link
            href="/posts"
            className="text-sm font-semibold text-accent"
          >
            All posts
          </Link>
        </div>
        <div className="grid gap-6">
          {latest.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                {item.type === "post" ? "Post" : "Project"}
              </p>
              <h3 className="mt-2 text-2xl font-serif tracking-tight">
                <Link href={`/${item.type}s/${item.slug}`}>
                  {item.title}
                </Link>
              </h3>
              <p className="mt-3 text-muted">{item.excerpt}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-black/10 px-2 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {personalAccess && personalPosts.length > 0 ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif tracking-tight">
              Personal posts
            </h2>
            <Link
              href="/personal"
              className="text-sm font-semibold text-accent"
            >
              All personal posts
            </Link>
          </div>
          <div className="grid gap-6">
            {personalPosts.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-black/10 bg-white/80 p-6 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                  Personal post
                </p>
                <h3 className="mt-2 text-2xl font-serif tracking-tight">
                  <Link href={`/personal/${item.slug}`}>{item.title}</Link>
                </h3>
                <p className="mt-3 text-muted">{item.excerpt}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-black/10 px-2 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
