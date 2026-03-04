/**
 * Send a blog post as a Buttondown email to all subscribers.
 * Uses the free-tier Emails API (no paid automation needed).
 */
export async function sendPostAsEmail(post: {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.BUTTONDOWN_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "BUTTONDOWN_API_KEY not configured" };
  }

  const siteUrl = "https://andrewhaight.com";
  const postUrl = `${siteUrl}/posts/${post.slug}`;

  // Buttondown supports Markdown in the body
  const body = [
    post.content,
    "",
    "---",
    "",
    `[Read on the web](${postUrl})`,
  ].join("\n");

  const res = await fetch("https://api.buttondown.email/v1/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${apiKey}`,
    },
    body: JSON.stringify({
      subject: post.title,
      body,
      status: "about_to_send",
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error("Buttondown send error:", res.status, err);
    return { ok: false, error: `Buttondown API ${res.status}` };
  }

  return { ok: true };
}
