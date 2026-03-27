"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { getRegisteredUser, setSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setPending(true);

    const user = getRegisteredUser();
    if (!user) {
      setPending(false);
      setError("No account found. Please register first.");
      return;
    }

    const sameEmail = user.workEmail.toLowerCase() === email.trim().toLowerCase();
    const samePassword = user.password === password;

    if (!sameEmail || !samePassword) {
      setPending(false);
      setError("Invalid email or password.");
      return;
    }

    setSession(user.onboarded);
    router.push(user.onboarded ? "/dashboard" : "/onboarding");
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-lg rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)]/90 p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
          Authentication
        </p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Sign in to Blissful Turtle</h1>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm text-[color:var(--muted)]">Work email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface-2)] px-4 py-3 text-sm outline-none ring-white/20 placeholder:text-slate-500 focus:ring"
              placeholder="you@company.com"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-[color:var(--muted)]">Password</span>
            <input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface-2)] px-4 py-3 text-sm outline-none ring-white/20 placeholder:text-slate-500 focus:ring"
            />
          </label>

          {error ? (
            <p className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface-2)] px-4 py-3 text-sm text-[color:var(--foreground)]">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-black hover:bg-[color:var(--accent-2)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pending ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-[color:var(--muted)]">
          New here?{" "}
          <Link href="/register" className="font-medium text-[color:var(--foreground)] hover:text-[color:var(--accent)]">
            Create an account
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
