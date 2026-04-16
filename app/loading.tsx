export default function GlobalLoading() {
  return (
    <main className="space-y-4 px-3 pt-3 md:px-4">
      <div className="h-52 animate-pulse rounded-3xl bg-[#eadfcf]" />
      <div className="h-5 w-40 animate-pulse rounded bg-[#eadfcf]" />
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="h-52 animate-pulse rounded-2xl bg-[#eadfcf]" />
        ))}
      </div>
    </main>
  );
}
