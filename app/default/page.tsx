import Link from "next/link";

export default function DefaultPage() {
  return (
    <div className="min-h-screen px-4 py-10 sm:px-8">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)]/90 p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Default Page</p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Static Navigation Hub</h1>
        <p className="mt-3 text-sm text-[color:var(--muted)]">
          Middleware and auth redirects are disabled for now. Use these links to move between static pages.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-lg border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--foreground)]/90 hover:border-[color:var(--accent)] hover:text-white"
          >
            Landing
          </Link>
          <Link
            href="/signup"
            className="rounded-lg border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--foreground)]/90 hover:border-[color:var(--accent)] hover:text-white"
          >
            Signup
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--foreground)]/90 hover:border-[color:var(--accent)] hover:text-white"
          >
            Login
          </Link>
          <Link
            href="/onboarding"
            className="rounded-lg border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--foreground)]/90 hover:border-[color:var(--accent)] hover:text-white"
          >
            On-boarding
          </Link>
          <Link
            href="/keys"
            className="rounded-lg border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--foreground)]/90 hover:border-[color:var(--accent)] hover:text-white"
          >
            Keys
          </Link>
          <Link
            href="/projects"
            className="rounded-lg border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--foreground)]/90 hover:border-[color:var(--accent)] hover:text-white"
          >
            Projects
          </Link>
          <Link
            href="/reports"
            className="rounded-lg border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--foreground)]/90 hover:border-[color:var(--accent)] hover:text-white"
          >
            Reports
          </Link>
          <Link
            href="/recommendations"
            className="rounded-lg border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--foreground)]/90 hover:border-[color:var(--accent)] hover:text-white"
          >
            Recommendations
          </Link>
          <Link
            href="/settings"
            className="rounded-lg border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--foreground)]/90 hover:border-[color:var(--accent)] hover:text-white"
          >
            Settings
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-black hover:bg-[color:var(--accent-2)]"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
