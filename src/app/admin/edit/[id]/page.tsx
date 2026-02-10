import { Suspense } from "react";
import AdminPostEditor from "@/components/admin/AdminPostEditor";

export default function AdminEditPage({ params }: { params: { id: string } }) {
  return (
    <Suspense
      fallback={
        <div className="rounded-3xl border border-black/10 bg-white/80 p-6 text-sm text-muted">
          Loading editor...
        </div>
      }
    >
      <AdminPostEditor postId={params.id} />
    </Suspense>
  );
}
