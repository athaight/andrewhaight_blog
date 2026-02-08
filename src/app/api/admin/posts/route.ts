import { NextResponse, type NextRequest } from "next/server";
import { applyAuthCookies, requireAdmin } from "@/lib/supabase/admin";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, type, published, created_at, tags")
    .order("created_at", { ascending: false });

  if (error) {
    const response = NextResponse.json({ error: error.message }, { status: 500 });
    applyAuthCookies(adminCheck.response, response);
    return response;
  }

  const response = NextResponse.json({ data });
  applyAuthCookies(adminCheck.response, response);
  return response;
}

export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  const supabase = getSupabaseServiceClient();
  const body = await request.json();

  const payload = {
    title: body.title,
    slug: body.slug,
    content: body.content,
    excerpt: body.excerpt ?? null,
    type: body.type,
    tags: Array.isArray(body.tags) ? body.tags : [],
    published: Boolean(body.published),
  };

  const { data, error } = await supabase
    .from("posts")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    const status = error.code === "23505" ? 409 : 400;
    const message =
      error.code === "23505"
        ? "Slug already exists. Please choose a unique slug."
        : error.message;
    const response = NextResponse.json({ error: message }, { status });
    applyAuthCookies(adminCheck.response, response);
    return response;
  }

  const response = NextResponse.json({ data }, { status: 201 });
  applyAuthCookies(adminCheck.response, response);
  return response;
}
