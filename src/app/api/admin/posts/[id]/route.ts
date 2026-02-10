import { NextResponse, type NextRequest } from "next/server";
import { applyAuthCookies, requireAdmin } from "@/lib/supabase/admin";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin(request);
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  const { id } = await params;
  const isPersonal =
    request.nextUrl.searchParams.get("scope") === "personal";

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from(isPersonal ? "personal_posts" : "posts")
    .select("id, title, slug, excerpt, type, tags, content, published")
    .eq("id", id)
    .single();

  if (error) {
    const response = NextResponse.json({ error: error.message }, { status: 404 });
    applyAuthCookies(adminCheck.response, response);
    return response;
  }

  const response = NextResponse.json({
    data: isPersonal
      ? { ...data, type: "personal", scope: "personal" }
      : data,
  });
  applyAuthCookies(adminCheck.response, response);
  return response;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin(request);
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  const { id } = await params;
  const isPersonal =
    request.nextUrl.searchParams.get("scope") === "personal";

  const supabase = getSupabaseServiceClient();
  const body = await request.json();

  const payload = {
    title: body.title,
    slug: body.slug,
    content: body.content,
    excerpt: body.excerpt ?? null,
    type: isPersonal ? "personal" : body.type,
    tags: Array.isArray(body.tags) ? body.tags : [],
    published: Boolean(body.published),
  };

  const { data, error } = await supabase
    .from(isPersonal ? "personal_posts" : "posts")
    .update(payload)
    .eq("id", id)
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

  const response = NextResponse.json({ data });
  applyAuthCookies(adminCheck.response, response);
  return response;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin(request);
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  const { id } = await params;
  const isPersonal =
    request.nextUrl.searchParams.get("scope") === "personal";

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase
    .from(isPersonal ? "personal_posts" : "posts")
    .delete()
    .eq("id", id);

  if (error) {
    const response = NextResponse.json({ error: error.message }, { status: 400 });
    applyAuthCookies(adminCheck.response, response);
    return response;
  }

  const response = NextResponse.json({ success: true });
  applyAuthCookies(adminCheck.response, response);
  return response;
}
