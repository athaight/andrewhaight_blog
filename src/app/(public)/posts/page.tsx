import Link from "next/link";
import { getPublishedContent } from "@/lib/content";

export default async function PostsPage() {
  const posts = await getPublishedContent("post");

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted">
          Writing
        </p>
        <h1 className="text-4xl font-serif tracking-tight">Posts</h1>
        <p className="max-w-2xl text-muted">
          Essays, notes, and short updates from the studio.
        </p>
      </header>

      <div className="grid gap-6">
        {posts.map((post) => (
          <article
            key={post.id}
            className="rounded-2xl border border-black/10 bg-white/80 p-6"
          >
            <h2 className="text-2xl font-serif tracking-tight">
              <Link href={`/posts/${post.slug}`}>{post.title}</Link>
            </h2>
            <p className="mt-3 text-muted">{post.excerpt}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
