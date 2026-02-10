export default function PersonalPostsLoading() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-32 rounded-full bg-black/10" />
      <div className="h-10 w-2/3 rounded-full bg-black/10" />
      <div className="h-4 w-72 rounded-full bg-black/10" />
      <div className="grid gap-6">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="h-24 rounded-2xl border border-black/10 bg-white/70"
          />
        ))}
      </div>
    </div>
  );
}
