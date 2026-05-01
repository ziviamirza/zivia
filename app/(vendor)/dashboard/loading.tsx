export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-transparent px-4 py-16">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="h-4 w-32 rounded bg-neutral-200" />
        <div className="mt-4 h-10 w-64 max-w-full rounded bg-neutral-200" />
        <div className="mt-2 h-4 w-96 max-w-full rounded bg-neutral-100" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-amber-100 bg-white/90 p-4">
              <div className="aspect-square rounded-xl bg-neutral-200" />
              <div className="mt-4 h-5 w-[85%] rounded bg-neutral-200" />
              <div className="mt-2 h-4 w-1/2 rounded bg-neutral-100" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
