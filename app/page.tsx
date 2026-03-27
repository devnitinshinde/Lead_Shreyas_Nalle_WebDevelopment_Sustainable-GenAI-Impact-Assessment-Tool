import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen px-4 pb-10 pt-6 sm:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[color:var(--line-soft)] bg-[color:var(--surface)]/80 px-5 py-4 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--muted)]">
              AI Carbon Intelligence
            </p>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Blissful Turtle
            </h1>
          </div>
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <Link
              href="/login"
              className="rounded-lg border border-[color:var(--line)] px-4 py-2 text-[color:var(--foreground)]/90 hover:border-[color:var(--accent)] hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-[color:var(--accent)] px-4 py-2 font-medium text-black hover:bg-[color:var(--accent-2)]"
            >
              Create account
            </Link>
          </nav>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
          <article className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)]/90 p-6 sm:p-8">
            <p className="inline-flex rounded-full border border-[color:var(--line)] bg-[color:var(--surface-2)] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[color:var(--foreground)]/90">
              Landing page
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
              Track AI energy, carbon emissions, and cost in one place.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
              Blissful Turtle helps teams understand model usage by project, estimate
              energy cost in real time, and improve sustainability scores before bills
              and emissions grow out of control.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-xl bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-black hover:bg-[color:var(--accent-2)]"
              >
                Start registration
              </Link>
              <Link
                href="/default"
                className="rounded-xl border border-[color:var(--line)] px-5 py-3 text-sm font-medium text-[color:var(--foreground)]/90 hover:border-[color:var(--accent)] hover:text-white"
              >
                Open default app page
              </Link>
            </div>
          </article>

          <article className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)]/75 p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
              What you asked for
            </p>
            <div className="mt-4 space-y-3 text-sm text-[color:var(--foreground)]/85">
              <p className="rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface-2)]/80 p-3">
                `Registration` with full organization profile and provider checkboxes.
              </p>
              <p className="rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface-2)]/80 p-3">
                `On-boarding` for API keys, EcoTrack key generation, and first project.
              </p>
              <p className="rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface-2)]/80 p-3">
                `Dashboard` with KPIs, chart sections, and a live API activity table.
              </p>
              <p className="rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface-2)]/80 p-3">
                `Auth flow` with protected routes and default redirects.
              </p>
            </div>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-4">
          {["Landing page", "Registration", "On-boarding", "Dashboard"].map((step, index) => (
            <article
              key={step}
              className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)]/75 p-4"
            >
              <p className="font-mono text-xs text-[color:var(--foreground)]/85">
                0{index + 1}
              </p>
              <h3 className="mt-2 text-sm font-semibold">{step}</h3>
              <p className="mt-1 text-xs leading-6 text-[color:var(--muted)]">
                Flow section is now wired and linked in the app navigation.
              </p>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
