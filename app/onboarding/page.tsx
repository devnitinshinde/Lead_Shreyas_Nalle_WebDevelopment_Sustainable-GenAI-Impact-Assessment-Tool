import Link from "next/link";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-6xl rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)]/90 p-5 sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">On-boarding Wizard</p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">4-Step Setup (Static SRS Mock)</h1>

        <div className="mt-7 space-y-5">
          <section className="rounded-2xl border border-dashed border-[color:var(--line)] bg-[color:var(--surface-2)]/70 p-4 sm:p-5">
            <p className="text-sm font-semibold">Step 1: Add provider API key</p>
            <p className="mt-1 text-xs text-[color:var(--muted)]">
              OpenAI / Anthropic / Google key + nickname + &quot;Test and Save&quot;.
            </p>
          </section>

          <section className="rounded-2xl border border-dashed border-[color:var(--line)] bg-[color:var(--surface-2)]/70 p-4 sm:p-5">
            <p className="text-sm font-semibold">Step 2: Receive EcoTrack key</p>
            <p className="mt-1 text-xs text-[color:var(--muted)]">
              Shows one-time org key in format eco-sk-... (static preview).
            </p>
          </section>

          <section className="rounded-2xl border border-dashed border-[color:var(--line)] bg-[color:var(--surface-2)]/70 p-4 sm:p-5">
            <p className="text-sm font-semibold">Step 3: Create first project</p>
            <p className="mt-1 text-xs text-[color:var(--muted)]">
              Project name, description, environment and project-scoped key.
            </p>
          </section>

          <section className="rounded-2xl border border-dashed border-[color:var(--line)] bg-[color:var(--surface-2)]/70 p-4 sm:p-5">
            <p className="text-sm font-semibold">Step 4: Integration verification</p>
            <p className="mt-1 text-xs text-[color:var(--muted)]">
              Proxy endpoint docs + live status panel polling `/api/dashboard/live-feed`.
            </p>
          </section>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-black hover:bg-[color:var(--accent-2)]"
          >
            Complete setup (Static)
          </Link>
          <Link
            href="/keys"
            className="rounded-xl border border-[color:var(--line)] px-5 py-3 text-sm font-medium text-[color:var(--foreground)]/90 hover:border-[color:var(--accent)]"
          >
            Open keys module
          </Link>
        </div>
      </div>
    </div>
  );
}
