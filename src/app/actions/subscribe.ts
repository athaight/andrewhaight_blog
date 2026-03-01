"use server";

interface SubscribeResult {
  success: boolean;
  message: string;
}

export async function subscribeToNewsletter(
  _prevState: SubscribeResult,
  formData: FormData
): Promise<SubscribeResult> {
  const email = formData.get("email")?.toString().trim();

  if (!email) {
    return { success: false, message: "Please enter your email address." };
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, message: "That doesn't look like a valid email." };
  }

  const apiKey = process.env.BUTTONDOWN_API_KEY;
  if (!apiKey) {
    console.error("BUTTONDOWN_API_KEY is not configured");
    return {
      success: false,
      message: "Newsletter service isn't configured yet. Try again later.",
    };
  }

  try {
    const response = await fetch(
      "https://api.buttondown.email/v1/subscribers",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${apiKey}`,
        },
        body: JSON.stringify({
          email_address: email,
          notes: "Subscribed via andrewhaight.com",
          tags: ["website"],
        }),
      }
    );

    if (response.ok) {
      return {
        success: true,
        message: "Check your inbox — I sent a confirmation email.",
      };
    }

    const error = await response.json();

    // Handle duplicate subscriber
    if (
      response.status === 400 &&
      JSON.stringify(error).toLowerCase().includes("already")
    ) {
      return {
        success: false,
        message: "Looks like you're already subscribed!",
      };
    }

    console.error("Buttondown API error:", error);
    return {
      success: false,
      message: "Something went wrong. Try again in a bit.",
    };
  } catch (err) {
    console.error("Subscribe error:", err);
    return {
      success: false,
      message: "Couldn't reach the newsletter service. Try again later.",
    };
  }
}
