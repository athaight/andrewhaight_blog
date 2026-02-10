import { createHmac, timingSafeEqual } from "crypto";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export const PERSONAL_ACCESS_COOKIE = "personal_access";
const TOKEN_SALT = "personal-access";

function getPassphrase() {
  return process.env.PERSONAL_POSTS_PASSPHRASE ?? "";
}

export function getPersonalAccessCookieValue() {
  const passphrase = getPassphrase();
  if (!passphrase) return null;

  return createHmac("sha256", passphrase).update(TOKEN_SALT).digest("hex");
}

export function verifyPersonalAccessToken(value?: string | null) {
  const expected = getPersonalAccessCookieValue();
  if (!expected || !value) return false;
  if (value.length !== expected.length) return false;

  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}

export function hasPersonalAccess(cookies: ReadonlyRequestCookies) {
  return verifyPersonalAccessToken(
    cookies.get(PERSONAL_ACCESS_COOKIE)?.value
  );
}
