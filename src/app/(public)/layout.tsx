import type { ReactNode } from "react";
import Container from "@/components/Container";
import SiteHeader from "@/components/SiteHeader";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="py-12">
        <Container>{children}</Container>
      </main>
    </div>
  );
}
