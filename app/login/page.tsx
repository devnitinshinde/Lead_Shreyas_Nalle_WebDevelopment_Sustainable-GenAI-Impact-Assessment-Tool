import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-2xl rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)]/90 p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Authentication</p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Organisation Admin Login</h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Static SRS page mock. Firebase login is not wired in this version.
        </p>

        <form className="mt-7 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm text-[color:var(--muted)]">Work email</span>
            <input
              type="email"
              className="w-full rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface-2)] px-4 py-3 text-sm"
              placeholder="admin@company.com"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-[color:var(--muted)]">Password</span>
            <input
              type="password"
              className="w-full rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface-2)] px-4 py-3 text-sm"
              placeholder="••••••••"
            />
          </label>

          <Link
            href="/dashboard"
            className="inline-flex w-full items-center justify-center rounded-xl bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-black hover:bg-[color:var(--accent-2)]"
          >
            Sign in (Static)
          </Link>
        </form>

        <p className="mt-6 text-sm text-[color:var(--muted)]">
          Need an account?{" "}
          <Link href="/signup" className="font-medium text-[color:var(--foreground)] hover:text-[color:var(--accent)]">
            Go to signup
          </Link>
        </p>
      </div>
    </div>
  );
}
