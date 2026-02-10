import { NextResponse } from "next/server";
import { PERSONAL_ACCESS_COOKIE } from "@/lib/personalAccess";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(PERSONAL_ACCESS_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
