"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type PostSummary = {
  id: string;
  title: string;
  slug: string;
  type: "post" | "project";
  published: boolean;
  created_at: string;
};

export default function AdminPostList() {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/posts", { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load posts.");
        }
        return response.json();
      })
      .then((payload) => {
        if (!active) return;
        setPosts(payload.data ?? []);
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
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this entry?")) return;

    const response = await fetch(`/api/admin/posts/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const message = await response.text();
      setError(message || "Delete failed.");
      return;
    }

    setPosts((current) => current.filter((post) => post.id !== id));
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <article
          key={post.id}
          className="rounded-2xl border border-black/10 bg-white/80 p-5"
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                {post.type} · {post.published ? "Published" : "Draft"}
              </p>
              <h3 className="text-xl font-serif tracking-tight">
                {post.title}
              </h3>
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-semibold">
              {post.id ? (
                <Link
                  href={`/admin/edit/${post.id}`}
                  className="rounded-full border border-black/10 bg-white px-4 py-2"
                >
                  Edit
                </Link>
              ) : (
                <span className="rounded-full border border-black/10 bg-white px-4 py-2 text-muted">
                  Edit
                </span>
              )}
              <button
                type="button"
                onClick={() => handleDelete(post.id)}
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </article>
      ))}
      {posts.length === 0 ? (
        <p className="text-sm text-muted">
          No posts yet. Create the first entry.
        </p>
      ) : null}
    </div>
  );
}
