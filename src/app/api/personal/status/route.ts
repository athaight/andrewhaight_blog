import { NextResponse, type NextRequest } from "next/server";
import {
  PERSONAL_ACCESS_COOKIE,
  verifyPersonalAccessToken,
} from "@/lib/personalAccess";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(PERSONAL_ACCESS_COOKIE)?.value;
  const access = verifyPersonalAccessToken(token);

  return NextResponse.json({ access });
}
