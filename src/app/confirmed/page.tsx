import Container from "@/components/Container";
import Link from "next/link";

export const metadata = {
  title: "Subscribed — Andrew Haight",
  description: "You're all set. You'll be notified when new posts go live.",
};

export default function Confirmed() {
  return (
    <Container>
      <div className="py-20 max-w-lg">
        <h1 className="font-serif text-3xl font-semibold text-ink mb-4">
          You&apos;re in.
        </h1>
        <p className="text-muted leading-relaxed">
          You&apos;ll get an email whenever I publish a new post or project
          write-up. No spam, no fluff — just a quick heads up that
          something&apos;s live.
        </p>
        <p className="text-muted leading-relaxed mt-4">
          In the meantime, feel free to{" "}
          <Link
            href="/posts"
            className="text-accent underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            browse what&apos;s already here
          </Link>
          .
        </p>
      </div>
    </Container>
  );
}
