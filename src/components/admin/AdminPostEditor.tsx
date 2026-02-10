"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Markdown from "@/components/Markdown";

type EditorData = {
  id?: string;
  title: string;
  slug: string;
  type: "post" | "project" | "personal";
  tags: string[];
  excerpt: string;
  content: string;
  published: boolean;
};

const emptyPost: EditorData = {
  title: "",
  slug: "",
  type: "post",
  tags: [],
  excerpt: "",
  content: "",
  published: false,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type AdminPostEditorProps = {
  postId?: string;
};

async function getErrorMessage(response: Response, fallback: string) {
  const text = await response.text();
  if (text) {
    try {
      const data = JSON.parse(text) as { error?: string };
      if (data?.error) return data.error;
    } catch {
      return text;
    }
  }
  return fallback;
}

export default function AdminPostEditor({ postId }: AdminPostEditorProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const routeId = Array.isArray(params?.id)
    ? params.id[0]
    : typeof params?.id === "string"
      ? params.id
      : undefined;
  const normalizedPostId =
    typeof postId === "string" && postId !== "undefined" ? postId : undefined;
  const normalizedRouteId =
    typeof routeId === "string" && routeId !== "undefined" ? routeId : undefined;
  const effectivePostId = normalizedPostId ?? normalizedRouteId;
  const router = useRouter();
  const [post, setPost] = useState<EditorData>(emptyPost);
  const [postScope, setPostScope] = useState<"standard" | "personal">(
    searchParams.get("scope") === "personal" ? "personal" : "standard"
  );
  const [tagsInput, setTagsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugDirty, setSlugDirty] = useState(false);

  useEffect(() => {
    if (!effectivePostId) {
      if (normalizedPostId === undefined && normalizedRouteId === undefined) {
        return;
      }
      setError("Missing post id.");
      return;
    }

    let active = true;
    setLoading(true);
    const scopeParam = postScope === "personal" ? "?scope=personal" : "";
    fetch(`/api/admin/posts/${effectivePostId}${scopeParam}`, {
      credentials: "include",
    })
      .then(async (response) => {
        if (!response.ok) {
          const message = await getErrorMessage(
            response,
            "Failed to load post."
          );
          throw new Error(message);
        }
        return response.json();
      })
      .then((payload) => {
        if (!active) return;
        const data = payload.data as EditorData & {
          scope?: "personal" | "standard";
        };
        setPost({
          id: data.id,
          title: data.title,
          slug: data.slug,
          type: data.type,
          tags: data.tags ?? [],
          excerpt: data.excerpt ?? "",
          content: data.content ?? "",
          published: data.published ?? false,
        });
        if (data.scope === "personal") {
          setPostScope("personal");
        }
        setSlugDirty(Boolean(data.slug && data.slug !== slugify(data.title)));
        setTagsInput((data.tags ?? []).join(", "));
      })
      .catch((err: Error) => {
        if (!active) return;
        setError(err.message);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [effectivePostId, normalizedPostId, normalizedRouteId, postScope]);

  useEffect(() => {
    if (slugDirty) return;
    setPost((current) => ({
      ...current,
      slug: slugify(current.title),
    }));
  }, [post.title, slugDirty]);

  const previewContent = useMemo(() => {
    if (!post.content) {
      return "Start writing to see a live preview.";
    }
    return post.content;
  }, [post.content]);

  const tags = useMemo(() => {
    return tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }, [tagsInput]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (effectivePostId && postScope === "standard" && post.type === "personal") {
      setError("Create a new personal entry instead of converting this one.");
      setLoading(false);
      return;
    }

    if (postScope === "personal" && post.type !== "personal") {
      setError("Personal entries must remain personal.");
      setLoading(false);
      return;
    }

    const targetScope = post.type === "personal" ? "personal" : "standard";
    const scopeParam = targetScope === "personal" ? "?scope=personal" : "";

    const payload = {
      title: post.title,
      slug: post.slug,
      type: post.type,
      tags,
      excerpt: post.excerpt,
      content: post.content,
      published: post.published,
    };

    try {
      const response = await fetch(
        effectivePostId
          ? `/api/admin/posts/${effectivePostId}${scopeParam}`
          : `/api/admin/posts${scopeParam}`,
        {
          method: effectivePostId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const message = await getErrorMessage(response, "Failed to save post.");
        throw new Error(message);
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted">
          {effectivePostId ? "Edit" : "New"}
        </p>
        <h1 className="text-3xl font-serif tracking-tight">
          {effectivePostId ? "Edit entry" : "Create a new entry"}
        </h1>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid gap-8 rounded-3xl border border-black/10 bg-white/80 p-6"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-semibold">
            Title
            <input
              value={post.title}
              onChange={(event) =>
                setPost((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              className="rounded-xl border border-black/10 bg-white px-4 py-3 text-base font-normal"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold">
            Slug
            <input
              value={post.slug}
              onChange={(event) => {
                setSlugDirty(true);
                setPost((current) => ({
                  ...current,
                  slug: event.target.value,
                }));
              }}
              className="rounded-xl border border-black/10 bg-white px-4 py-3 text-base font-normal"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold">
            Type
            <select
              value={post.type}
              onChange={(event) =>
                setPost((current) => ({
                  ...current,
                  type: event.target.value as "post" | "project" | "personal",
                }))
              }
              className="rounded-xl border border-black/10 bg-white px-4 py-3 text-base font-normal"
            >
              <option value="post">Post</option>
              <option value="project">Project</option>
              <option value="personal">Personal</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold">
            Tags (comma separated)
            <input
              value={tagsInput}
              onChange={(event) => setTagsInput(event.target.value)}
              className="rounded-xl border border-black/10 bg-white px-4 py-3 text-base font-normal"
            />
          </label>
        </div>

        <label className="flex flex-col gap-2 text-sm font-semibold">
          Excerpt
          <textarea
            value={post.excerpt}
            onChange={(event) =>
              setPost((current) => ({
                ...current,
                excerpt: event.target.value,
              }))
            }
            rows={3}
            className="rounded-xl border border-black/10 bg-white px-4 py-3 text-base font-normal"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold">
          Markdown
          <textarea
            value={post.content}
            onChange={(event) =>
              setPost((current) => ({
                ...current,
                content: event.target.value,
              }))
            }
            rows={12}
            className="rounded-xl border border-black/10 bg-white px-4 py-3 text-base font-normal font-mono"
          />
        </label>

        <label className="flex items-center gap-3 text-sm font-semibold">
          <input
            type="checkbox"
            checked={post.published}
            onChange={(event) =>
              setPost((current) => ({
                ...current,
                published: event.target.checked,
              }))
            }
            className="h-4 w-4"
          />
          Published
        </label>

        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-full border border-black/10 bg-accent px-6 py-3 text-sm font-semibold text-white"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold"
            onClick={() => router.push("/admin")}
          >
            Cancel
          </button>
        </div>
      </form>

      <section className="grid gap-4">
        <h2 className="text-xl font-serif tracking-tight">Live preview</h2>
        <div className="rounded-3xl border border-black/10 bg-white/80 p-6">
          <Markdown content={previewContent} />
        </div>
      </section>
    </div>
  );
}
