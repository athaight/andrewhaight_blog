import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { hasPersonalAccess } from "@/lib/personalAccess";
import { getPersonalContent } from "@/lib/personalContent";

export default async function PersonalPostsPage() {
  const cookieStore = await cookies();
  const access = hasPersonalAccess(cookieStore);
  if (!access) {
    notFound();
  }

  const posts = await getPersonalContent();

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted">
          Personal
        </p>
        <h1 className="text-4xl font-serif tracking-tight">Personal posts</h1>
        <p className="max-w-2xl text-muted">
          Private notes and works in progress.
        </p>
      </header>

      <div className="grid gap-6">
        {posts.map((post) => (
          <article
            key={post.id}
            className="rounded-2xl border border-black/10 bg-white/80 p-6"
          >
            <h2 className="text-2xl font-serif tracking-tight">
              <Link href={`/personal/${post.slug}`}>{post.title}</Link>
            </h2>
            <p className="mt-3 text-muted">{post.excerpt}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
