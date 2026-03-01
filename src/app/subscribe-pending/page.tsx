import Container from "@/components/Container";

export const metadata = {
  title: "Check Your Inbox — Andrew Haight",
  description: "Confirm your subscription to get notified about new posts.",
};

export default function SubscribePending() {
  return (
    <Container>
      <div className="py-20 max-w-lg">
        <h1 className="font-serif text-3xl font-semibold text-ink mb-4">
          Almost there.
        </h1>
        <p className="text-muted leading-relaxed">
          I just sent you a confirmation email. Click the link in it to confirm
          your subscription, and you&apos;ll get a heads up whenever I publish
          something new.
        </p>
        <p className="text-muted leading-relaxed mt-4 text-sm">
          If you don&apos;t see it, check your spam folder — sometimes email
          filters are overly enthusiastic.
        </p>
      </div>
    </Container>
  );
}
