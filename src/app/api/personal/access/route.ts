import { NextResponse } from "next/server";
import {
  PERSONAL_ACCESS_COOKIE,
  getPersonalAccessCookieValue,
} from "@/lib/personalAccess";

type AccessBody = {
  passphrase?: string;
};

export async function POST(request: Request) {
  let body: AccessBody = {};

  try {
    body = (await request.json()) as AccessBody;
  } catch {
    body = {};
  }

  const passphrase =
    typeof body.passphrase === "string" ? body.passphrase : "";
  const expected = process.env.PERSONAL_POSTS_PASSPHRASE;

  if (!expected) {
    return NextResponse.json(
      { error: "Access not configured." },
      { status: 500 }
    );
  }

  if (!passphrase || passphrase !== expected) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const token = getPersonalAccessCookieValue();
  if (!token) {
    return NextResponse.json(
      { error: "Access not configured." },
      { status: 500 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(PERSONAL_ACCESS_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}
