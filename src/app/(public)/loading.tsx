export default function PublicLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-obsidian pt-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 h-10 w-64 rounded-lg bg-midnight" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-80 rounded-card bg-midnight" />
          ))}
        </div>
      </div>
    </div>
  );
}
