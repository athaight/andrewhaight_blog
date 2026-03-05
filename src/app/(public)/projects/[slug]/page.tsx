import { notFound } from "next/navigation";
import Markdown from "@/components/Markdown";
import { getContentBySlug } from "@/lib/content";
import { formatDate, getReadingTimeString } from "@/lib/formatters";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Next.js provides params as a Promise in async route handlers.
  const { slug } = await params;
  const item = await getContentBySlug(slug, "project");

  if (!item || item.type !== "project" || !item.published) {
    notFound();
  }

  return (
    <article className="space-y-6">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted">
          Project
        </p>
        <h1 className="text-4xl font-serif tracking-tight">{item.title}</h1>
        <p className="text-sm text-muted">{formatDate(item.createdAt)} · {getReadingTimeString(item.content)}</p>
      </header>
      <Markdown content={item.content} />
    </article>
  );
}
