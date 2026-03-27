export default function RecommendationsPage() {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-6xl rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)]/90 p-5 sm:p-7">
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Recommendations</p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Rule-Based Suggestions (Static)</h1>

        <div className="mt-5 space-y-3 text-sm text-[color:var(--foreground)]/90">
          <article className="rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface-2)]/80 p-4">
            Switch staging workloads to smaller models during off-peak hours.
          </article>
          <article className="rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface-2)]/80 p-4">
            Add prompt compression for repeated long-context requests.
          </article>
          <article className="rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface-2)]/80 p-4">
            Move highest CO2 workflows to lower carbon-intensity region windows.
          </article>
        </div>
      </div>
    </div>
  );
}
