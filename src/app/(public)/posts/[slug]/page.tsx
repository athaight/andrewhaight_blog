import { notFound } from "next/navigation";
import Markdown from "@/components/Markdown";
import { getContentBySlug } from "@/lib/content";

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const item = await getContentBySlug(params.slug);

  if (!item || item.type !== "post" || !item.published) {
    notFound();
  }

  return (
    <article className="space-y-6">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--muted)]">
          Post
        </p>
        <h1 className="text-4xl font-serif tracking-tight">{item.title}</h1>
        <p className="text-sm text-[color:var(--muted)]">{item.createdAt}</p>
      </header>
      <Markdown content={item.content} />
    </article>
  );
}
