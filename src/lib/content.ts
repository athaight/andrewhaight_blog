import { createClient } from "@supabase/supabase-js";
import { unstable_noStore as noStore } from "next/cache";

export type ContentType = "post" | "project";

export type ContentItem = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  type: ContentType;
  tags: string[];
  published: boolean;
  createdAt: string;
};

type PostRow = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  type: ContentType;
  tags: string[] | null;
  published: boolean;
  created_at: string;
};

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function mapPost(row: PostRow): ContentItem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    excerpt: row.excerpt ?? "",
    type: row.type,
    tags: row.tags ?? [],
    published: row.published,
    createdAt: row.created_at,
  };
}

export async function getPublishedContent(type?: ContentType) {
  noStore();
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  let query = supabase
    .from("posts")
    .select(
      "id, title, slug, content, excerpt, type, tags, published, created_at"
    )
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (type) {
    query = query.eq("type", type);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return data.map(mapPost);
}

export async function getContentBySlug(slug: string) {
  noStore();
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, title, slug, content, excerpt, type, tags, published, created_at"
    )
    .eq("published", true)
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return null;
  }

  return mapPost(data as PostRow);
}

export async function searchPublishedContent(rawQuery: string) {
  noStore();
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const query = rawQuery.trim().replace(/,/g, " ").replace(/[%_]/g, " ");
  if (!query) return [];

  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, title, slug, content, excerpt, type, tags, published, created_at"
    )
    .eq("published", true)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map(mapPost);
}
