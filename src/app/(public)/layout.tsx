import type { ReactNode } from "react";
import Container from "@/components/Container";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 py-12">
        <Container>{children}</Container>
      </main>
      <SiteFooter />
    </div>
  );
}
