import { NextResponse, type NextRequest } from "next/server";
import { applyAuthCookies, requireAdmin } from "@/lib/supabase/admin";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  const includePersonal =
    request.nextUrl.searchParams.get("includePersonal") === "true";
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

  let personalData:
    | (typeof data & Array<{ scope: "personal"; type: "personal" }>)
    | [] = [];
  if (includePersonal) {
    const { data: personalRows, error: personalError } = await supabase
      .from("personal_posts")
      .select("id, title, slug, excerpt, type, published, created_at, tags")
      .order("created_at", { ascending: false });

    if (personalError) {
      const response = NextResponse.json(
        { error: personalError.message },
        { status: 500 }
      );
      applyAuthCookies(adminCheck.response, response);
      return response;
    }

    personalData = (personalRows ?? []).map((row) => ({
      ...row,
      type: "personal" as const,
      scope: "personal" as const,
    }));
  }

  const merged = [
    ...(data ?? []).map((row) => ({ ...row, scope: "standard" as const })),
    ...personalData,
  ];

  const response = NextResponse.json({ data: merged });
  applyAuthCookies(adminCheck.response, response);
  return response;
}

export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

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
