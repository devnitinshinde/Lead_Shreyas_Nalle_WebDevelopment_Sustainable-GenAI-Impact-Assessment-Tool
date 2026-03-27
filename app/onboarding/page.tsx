"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import {
  clearSession,
  generateEcoTrackKey,
  getRegisteredUser,
  saveOnboardingState,
  setOnboarded,
} from "@/lib/auth";
import { useClientReady } from "@/lib/use-client-ready";

type ProviderKeys = Record<string, string>;

const providerLabels = [
  { key: "openai", label: "OpenAI API key" },
  { key: "anthropic", label: "Anthropic API key" },
  { key: "google", label: "Google / Gemini API key" },
  { key: "azure", label: "Azure OpenAI API key" },
  { key: "other", label: "Other provider key" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const clientReady = useClientReady();
  const user = useMemo(() => (clientReady ? getRegisteredUser() : null), [clientReady]);

  const [providerApiKeys, setProviderApiKeys] = useState<ProviderKeys>({
    openai: "",
    anthropic: "",
    google: "",
    azure: "",
    other: "",
  });
  const [ecoTrackApiKey, setEcoTrackApiKey] = useState("");
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [environment, setEnvironment] = useState("Production");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const updateProviderKey = (name: string, value: string) => {
    setProviderApiKeys((previous) => ({ ...previous, [name]: value }));
  };

  const handleGenerateEcoTrackKey = () => {
    setEcoTrackApiKey(generateEcoTrackKey());
  };

  const handleComplete = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!projectName.trim()) {
      setError("Please add your first project name.");
      return;
    }

    setSubmitting(true);
    const nextKey = ecoTrackApiKey || generateEcoTrackKey();

    saveOnboardingState({
      providerApiKeys,
      ecoTrackApiKey: nextKey,
      projectName: projectName.trim(),
      description: description.trim(),
      environment,
    });

    setEcoTrackApiKey(nextKey);
    setOnboarded(true);
    router.push("/dashboard");
  };

  const handleSignOut = () => {
    clearSession();
    router.push("/login");
  };

  if (!clientReady) {
    return (
      <div className="min-h-screen px-4 py-10 sm:px-8">
        <div className="mx-auto w-full max-w-2xl rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6">
          <p className="text-sm text-[color:var(--muted)]">Preparing onboarding...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen px-4 py-10 sm:px-8">
        <div className="mx-auto w-full max-w-2xl rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6">
          <h1 className="text-2xl font-semibold">No registration profile found</h1>
          <p className="mt-3 text-sm text-[color:var(--muted)]">
            Register your organization first, then complete onboarding.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex rounded-lg bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-black hover:bg-[color:var(--accent-2)]"
          >
            Go to registration
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-6xl rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)]/90 p-5 sm:p-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">On-boarding</p>
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
              Set up {user.organizationName} for live tracking
            </h1>
          </div>
          <button
            onClick={handleSignOut}
            type="button"
            className="rounded-lg border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--foreground)]/90 hover:border-[color:var(--accent)] hover:text-white"
          >
            Sign out
          </button>
        </div>

        <form onSubmit={handleComplete} className="space-y-6">
          <section className="rounded-2xl border border-dashed border-[color:var(--line)] bg-[color:var(--surface-2)]/70 p-4 sm:p-5">
            <p className="text-sm font-semibold text-[color:var(--foreground)]">
              Step 1: Add AI provider API key (stored encrypted)
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {providerLabels.map((provider) => (
                <label key={provider.key} className="space-y-2">
                  <span className="text-xs text-[color:var(--muted)]">{provider.label}</span>
                  <input
                    value={providerApiKeys[provider.key]}
                    onChange={(event) => updateProviderKey(provider.key, event.target.value)}
                    className="w-full rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm outline-none ring-white/20 focus:ring"
                    placeholder="sk-..."
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-dashed border-[color:var(--line)] bg-[color:var(--surface-2)]/70 p-4 sm:p-5">
            <p className="text-sm font-semibold text-[color:var(--foreground)]">Step 2: Generate EcoTrack API key</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleGenerateEcoTrackKey}
                className="rounded-lg border border-[color:var(--line)] px-4 py-2 text-sm hover:border-[color:var(--accent)]"
              >
                Generate key
              </button>
              <input
                value={ecoTrackApiKey}
                onChange={(event) => setEcoTrackApiKey(event.target.value)}
                className="min-w-[260px] flex-1 rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm font-mono text-[color:var(--foreground)] outline-none ring-white/20 focus:ring"
                placeholder="eco_XXXX_XXXX"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-dashed border-[color:var(--line)] bg-[color:var(--surface-2)]/70 p-4 sm:p-5">
            <p className="text-sm font-semibold text-[color:var(--foreground)]">
              Step 3: Create your first project (with its own sub-key)
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-2">
                <span className="text-xs text-[color:var(--muted)]">Project name</span>
                <input
                  required
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  className="w-full rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm outline-none ring-white/20 focus:ring"
                />
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-xs text-[color:var(--muted)]">Description</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="h-24 w-full rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm outline-none ring-white/20 focus:ring"
                  placeholder="What this project tracks..."
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs text-[color:var(--muted)]">Environment</span>
                <select
                  value={environment}
                  onChange={(event) => setEnvironment(event.target.value)}
                  className="w-full rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm outline-none ring-white/20 focus:ring"
                >
                  <option>Development</option>
                  <option>Staging</option>
                  <option>Production</option>
                </select>
              </label>
            </div>
          </section>

          {error ? (
            <p className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface-2)] px-4 py-3 text-sm text-[color:var(--foreground)]">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-black hover:bg-[color:var(--accent-2)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Finishing setup..." : "Complete onboarding"}
          </button>
        </form>
      </div>
    </div>
  );
}
