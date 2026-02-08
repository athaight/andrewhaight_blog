import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "Missing Supabase public env vars." },
      { status: 500 }
    );
  }

  const slug = request.nextUrl.searchParams.get("slug") ?? "";
  if (!slug) {
    return NextResponse.json(
      { error: "Missing slug query param." },
      { status: 400 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: publishedRow, error: publishedError } = await supabase
    .from("posts")
    .select("id, title, slug, published, type")
    .eq("published", true)
    .eq("slug", slug)
    .single();

  const { data: anyRow, error: anyError } = await supabase
    .from("posts")
    .select("id, title, slug, published, type")
    .eq("slug", slug)
    .maybeSingle();

  const { data: publishedList, error: listError } = await supabase
    .from("posts")
    .select("id, slug, published, type")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(5);

  return NextResponse.json({
    publishedRow,
    publishedError: publishedError
      ? {
          message: publishedError.message,
          code: publishedError.code,
          details: publishedError.details,
        }
      : null,
    anyRow,
    anyError: anyError
      ? {
          message: anyError.message,
          code: anyError.code,
          details: anyError.details,
        }
      : null,
    publishedList,
    listError: listError
      ? {
          message: listError.message,
          code: listError.code,
          details: listError.details,
        }
      : null,
  });
}
