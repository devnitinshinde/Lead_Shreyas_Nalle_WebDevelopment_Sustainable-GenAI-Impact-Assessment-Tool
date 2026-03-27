import Link from "next/link";

export default function KeysPage() {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)]/90 p-5 sm:p-7">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">API Key Management</p>
          <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">EcoTrack Keys & Provider Keys (Static)</h1>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)]/80 p-5">
            <h2 className="text-sm font-semibold">EcoTrack keys</h2>
            <ul className="mt-3 space-y-2 text-xs text-[color:var(--muted)]">
              <li>eco-sk-org1234-a1b2c3d4e5f6...</li>
              <li>eco-sk-org1234-5f6e7d8c9b0a...</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)]/80 p-5">
            <h2 className="text-sm font-semibold">Provider keys</h2>
            <ul className="mt-3 space-y-2 text-xs text-[color:var(--muted)]">
              <li>OpenAI - Production key (encrypted)</li>
              <li>Anthropic - Staging key (encrypted)</li>
            </ul>
          </article>
        </section>

        <Link
          href="/dashboard"
          className="inline-flex rounded-lg border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--foreground)]/90 hover:border-[color:var(--accent)]"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
