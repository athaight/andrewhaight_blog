import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type AdminCheck =
  | { ok: true; response: NextResponse }
  | { ok: false; response: NextResponse };

function applyCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });
}

export async function requireAdmin(request: NextRequest): Promise<AdminCheck> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!supabaseUrl || !supabaseAnonKey || !adminEmail) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Missing auth config." },
        { status: 500 }
      ),
    };
  }

  const authResponse = NextResponse.next();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          authResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user || data.user.email !== adminEmail) {
    const response = NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
    applyCookies(authResponse, response);
    return { ok: false, response };
  }

  return { ok: true, response: authResponse };
}

export function applyAuthCookies(
  authResponse: NextResponse,
  response: NextResponse
) {
  applyCookies(authResponse, response);
}
