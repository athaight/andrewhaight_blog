import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Markdown from "@/components/Markdown";
import { hasPersonalAccess } from "@/lib/personalAccess";
import { getPersonalContentBySlug } from "@/lib/personalContent";

export default async function PersonalPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const cookieStore = await cookies();
  const access = hasPersonalAccess(cookieStore);
  if (!access) {
    notFound();
  }

  const { slug } = await params;
  const item = await getPersonalContentBySlug(slug);

  if (!item || !item.published) {
    notFound();
  }

  return (
    <article className="space-y-6">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted">
          Personal post
        </p>
        <h1 className="text-4xl font-serif tracking-tight">{item.title}</h1>
        <p className="text-sm text-muted">{item.createdAt}</p>
      </header>
      <Markdown content={item.content} />
    </article>
  );
}
