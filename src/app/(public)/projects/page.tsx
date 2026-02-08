import Link from "next/link";
import { getPublishedContent } from "@/lib/content";

export default async function ProjectsPage() {
  const projects = await getPublishedContent("project");

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--muted)]">
          Work
        </p>
        <h1 className="text-4xl font-serif tracking-tight">Projects</h1>
        <p className="max-w-2xl text-[color:var(--muted)]">
          Ongoing work, experiments, and case studies.
        </p>
      </header>

      <div className="grid gap-6">
        {projects.map((project) => (
          <article
            key={project.id}
            className="rounded-2xl border border-black/10 bg-white/80 p-6"
          >
            <h2 className="text-2xl font-serif tracking-tight">
              <Link href={`/projects/${project.slug}`}>{project.title}</Link>
            </h2>
            <p className="mt-3 text-[color:var(--muted)]">{project.excerpt}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
