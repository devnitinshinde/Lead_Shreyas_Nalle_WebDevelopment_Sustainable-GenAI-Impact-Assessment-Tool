"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Provider, RegistrationDraft, saveRegisteredUser, setSession } from "@/lib/auth";

const providerOptions: Provider[] = ["OpenAI", "Anthropic", "Google", "Azure", "Other"];

const organizationSizes: RegistrationDraft["organizationSize"][] = ["1-10", "11-50", "51-200", "200+"];

const industries = [
  "Fintech",
  "Healthtech",
  "Ecommerce",
  "Education",
  "Manufacturing",
  "Government",
  "Other",
];

const defaultState: RegistrationDraft = {
  fullName: "",
  workEmail: "",
  password: "",
  organizationName: "",
  organizationSize: "1-10",
  industry: "Fintech",
  countryRegion: "",
  intendedProviders: [],
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegistrationDraft>(defaultState);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const setField = <K extends keyof RegistrationDraft>(field: K, value: RegistrationDraft[K]) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const toggleProvider = (provider: Provider) => {
    setForm((previous) => {
      const included = previous.intendedProviders.includes(provider);
      return {
        ...previous,
        intendedProviders: included
          ? previous.intendedProviders.filter((entry) => entry !== provider)
          : [...previous.intendedProviders, provider],
      };
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (form.intendedProviders.length === 0) {
      setError("Please select at least one intended AI provider.");
      return;
    }

    setSaving(true);
    saveRegisteredUser(form);
    setSession(false);
    router.push("/onboarding");
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-5xl rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)]/90 p-5 sm:p-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
              Registration
            </p>
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Create your organization account</h1>
          </div>
          <Link
            href="/login"
            className="rounded-lg border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--foreground)]/90 hover:border-[color:var(--accent)] hover:text-white"
          >
            Already registered? Sign in
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm text-[color:var(--muted)]">Full name</span>
            <input
              required
              value={form.fullName}
              onChange={(event) => setField("fullName", event.target.value)}
              className="w-full rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface-2)] px-4 py-3 text-sm outline-none ring-white/20 placeholder:text-slate-500 focus:ring"
              placeholder="Priya Sharma"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-[color:var(--muted)]">Work email</span>
            <input
              required
              type="email"
              value={form.workEmail}
              onChange={(event) => setField("workEmail", event.target.value)}
              className="w-full rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface-2)] px-4 py-3 text-sm outline-none ring-white/20 placeholder:text-slate-500 focus:ring"
              placeholder="you@company.com"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-[color:var(--muted)]">Password</span>
            <input
              required
              minLength={8}
              type="password"
              value={form.password}
              onChange={(event) => setField("password", event.target.value)}
              className="w-full rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface-2)] px-4 py-3 text-sm outline-none ring-white/20 placeholder:text-slate-500 focus:ring"
              placeholder="Minimum 8 characters"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-[color:var(--muted)]">Organization name</span>
            <input
              required
              value={form.organizationName}
              onChange={(event) => setField("organizationName", event.target.value)}
              className="w-full rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface-2)] px-4 py-3 text-sm outline-none ring-white/20 placeholder:text-slate-500 focus:ring"
              placeholder="Company namespace"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-[color:var(--muted)]">Organization size</span>
            <select
              value={form.organizationSize}
              onChange={(event) => setField("organizationSize", event.target.value as RegistrationDraft["organizationSize"])}
              className="w-full rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface-2)] px-4 py-3 text-sm outline-none ring-white/20 focus:ring"
            >
              {organizationSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm text-[color:var(--muted)]">Industry</span>
            <select
              value={form.industry}
              onChange={(event) => setField("industry", event.target.value)}
              className="w-full rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface-2)] px-4 py-3 text-sm outline-none ring-white/20 focus:ring"
            >
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm text-[color:var(--muted)]">Country / region</span>
            <input
              required
              value={form.countryRegion}
              onChange={(event) => setField("countryRegion", event.target.value)}
              className="w-full rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface-2)] px-4 py-3 text-sm outline-none ring-white/20 placeholder:text-slate-500 focus:ring"
              placeholder="Used to estimate local grid carbon intensity"
            />
          </label>

          <fieldset className="space-y-3 rounded-2xl border border-dashed border-[color:var(--line)] bg-[color:var(--surface-2)]/70 p-4 sm:col-span-2">
            <legend className="px-2 text-sm text-[color:var(--muted)]">Intended AI providers</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {providerOptions.map((provider) => (
                <label
                  key={provider}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface)]/80 px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={form.intendedProviders.includes(provider)}
                    onChange={() => toggleProvider(provider)}
                    className="accent-neutral-200"
                  />
                  {provider}
                </label>
              ))}
            </div>
          </fieldset>

          {error ? (
            <p className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface-2)] px-4 py-3 text-sm text-[color:var(--foreground)] sm:col-span-2">
              {error}
            </p>
          ) : null}

          <button
            disabled={saving}
            type="submit"
            className="rounded-xl bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-black hover:bg-[color:var(--accent-2)] disabled:cursor-not-allowed disabled:opacity-70 sm:col-span-2"
          >
            {saving ? "Creating account..." : "Continue to onboarding"}
          </button>
        </form>
      </div>
    </div>
  );
}
