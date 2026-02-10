import { notFound } from "next/navigation";
import Markdown from "@/components/Markdown";
import { getContentBySlug } from "@/lib/content";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Next.js provides params as a Promise in async route handlers.
  const { slug } = await params;
  const item = await getContentBySlug(slug, "post");

  if (!item || item.type !== "post" || !item.published) {
    notFound();
  }

  return (
    <article className="space-y-6">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted">
          Post
        </p>
        <h1 className="text-4xl font-serif tracking-tight">{item.title}</h1>
        <p className="text-sm text-muted">{item.createdAt}</p>
      </header>
      <Markdown content={item.content} />
    </article>
  );
}
