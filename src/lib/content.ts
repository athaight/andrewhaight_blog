import { createClient } from "@supabase/supabase-js";
import { unstable_noStore as noStore } from "next/cache";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export type ContentType = "post" | "project";
export type SearchContentType = ContentType | "personal";

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

type SearchRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  type: SearchContentType;
  tags: string[] | null;
  created_at: string;
  rank: number | null;
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

function getSupabaseServiceClientSafe() {
  try {
    return getSupabaseServiceClient();
  } catch {
    return null;
  }
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

function mapSearchRow(row: SearchRow): SearchItem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? "",
    type: row.type,
    tags: row.tags ?? [],
    createdAt: row.created_at,
    rank: row.rank ?? 0,
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

export async function getContentBySlug(slug: string, type?: ContentType) {
  noStore();
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  let query = supabase
    .from("posts")
    .select(
      "id, title, slug, content, excerpt, type, tags, published, created_at"
    )
    .eq("published", true)
    .eq("slug", slug);

  if (type) {
    query = query.eq("type", type);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapPost(data as PostRow);
}

export type SearchResult = {
  results: SearchItem[];
  error: string | null;
};

export type SearchItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  type: SearchContentType;
  tags: string[];
  createdAt: string;
  rank: number;
};

export async function searchPublishedContent(
  rawQuery: string,
  options?: { includePersonal?: boolean }
): Promise<SearchResult> {
  noStore();
  const includePersonal = Boolean(options?.includePersonal);
  const supabase = includePersonal
    ? getSupabaseServiceClientSafe()
    : getSupabaseClient();
  if (!supabase) {
    return { results: [], error: "Supabase client not configured." };
  }

  const query = rawQuery.trim();
  if (!query) return { results: [], error: null };

  const { data, error } = await supabase.rpc("search_published_posts", {
    search_query: query,
    include_personal: includePersonal,
  });

  if (error) {
    return { results: [], error: error.message };
  }

  if (!data) {
    return { results: [], error: "No data returned from search." };
  }

  return { results: (data as SearchRow[]).map(mapSearchRow), error: null };
}
