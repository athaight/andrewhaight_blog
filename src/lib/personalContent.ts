import { unstable_noStore as noStore } from "next/cache";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export type PersonalContentItem = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  type: "personal";
  tags: string[];
  published: boolean;
  createdAt: string;
};

type PersonalRow = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  type: string | null;
  tags: string[] | null;
  published: boolean;
  created_at: string;
};

function mapRow(row: PersonalRow): PersonalContentItem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    excerpt: row.excerpt ?? "",
    type: "personal",
    tags: row.tags ?? [],
    published: row.published,
    createdAt: row.created_at,
  };
}

export async function getPersonalContent() {
  noStore();
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("personal_posts")
    .select("id, title, slug, content, excerpt, type, tags, published, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map(mapRow);
}

export async function getPersonalContentBySlug(slug: string) {
  noStore();
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("personal_posts")
    .select("id, title, slug, content, excerpt, type, tags, published, created_at")
    .eq("published", true)
    .eq("slug", slug)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  return mapRow(data as PersonalRow);
}
