export default function ReportsPage() {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-6xl rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)]/90 p-5 sm:p-7">
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Reports</p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Monthly Audit Reports (Static)</h1>
        <ul className="mt-5 space-y-2 text-sm text-[color:var(--muted)]">
          <li>March 2026 - Sustainability Audit PDF</li>
          <li>February 2026 - Sustainability Audit PDF</li>
          <li>January 2026 - Sustainability Audit PDF</li>
        </ul>
      </div>
    </div>
  );
}
