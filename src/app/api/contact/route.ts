import { createHmac } from "crypto";
import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

function sanitize(value: string) {
  return value.trim();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hashIp(ip: string) {
  const secret = process.env.CONTACT_IP_HASH_SECRET ?? "contact-rate-limit";
  return createHmac("sha256", secret).update(ip).digest("hex");
}

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  let payload: {
    name?: string;
    email?: string;
    message?: string;
    company?: string;
    turnstileToken?: string;
    submissionId?: string;
  };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 }
    );
  }

  const name = sanitize(payload.name ?? "");
  const email = sanitize(payload.email ?? "");
  const message = sanitize(payload.message ?? "");
  const company = sanitize(payload.company ?? "");
  const turnstileToken = sanitize(payload.turnstileToken ?? "");
  const submissionId = sanitize(payload.submissionId ?? "");

  const clientIp = getClientIp(request);
  const ipHash = hashIp(clientIp);

  if (company) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (!turnstileSecret) {
    return NextResponse.json(
      { error: "Server is missing spam protection config." },
      { status: 500 }
    );
  }

  if (!turnstileToken) {
    return NextResponse.json(
      { error: "Missing spam protection token." },
      { status: 400 }
    );
  }

  if (!submissionId) {
    return NextResponse.json(
      { error: "Missing submission id." },
      { status: 400 }
    );
  }

  const verifyResponse = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: turnstileSecret,
        response: turnstileToken,
        remoteip: clientIp === "unknown" ? "" : clientIp,
      }),
    }
  );

  const verifyPayload = (await verifyResponse.json()) as { success?: boolean };
  if (!verifyPayload.success) {
    return NextResponse.json(
      { error: "Spam check failed. Please try again." },
      { status: 400 }
    );
  }

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
      { status: 400 }
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Please provide a valid email address." },
      { status: 400 }
    );
  }

  if (name.length > 120 || email.length > 200 || message.length > 4000) {
    return NextResponse.json(
      { error: "One or more fields exceed the allowed length." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServiceClient();
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  const { count, error: rateError } = await supabase
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);

  if (rateError) {
    return NextResponse.json(
      { error: "Unable to verify rate limit." },
      { status: 500 }
    );
  }

  if ((count ?? 0) >= RATE_LIMIT_MAX) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const { data, error } = await supabase
    .from("contact_messages")
    .insert({
      name,
      email,
      message,
      ip_hash: ipHash,
      submission_id: submissionId,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { ok: true, shouldSendEmail: false },
        { status: 200 }
      );
    }
    return NextResponse.json(
      { error: "Unable to save your message right now." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { ok: true, shouldSendEmail: true, messageId: data.id },
    { status: 201 }
  );
}
