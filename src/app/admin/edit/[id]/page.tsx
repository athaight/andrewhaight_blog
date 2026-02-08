import AdminPostEditor from "@/components/admin/AdminPostEditor";

export default function AdminEditPage({ params }: { params: { id: string } }) {
  return <AdminPostEditor postId={params.id} />;
}
