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
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, slug, published, type")
    .eq("published", true)
    .eq("slug", slug)
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message, code: error.code, details: error.details },
      { status: 400 }
    );
  }

  return NextResponse.json({ data });
}
