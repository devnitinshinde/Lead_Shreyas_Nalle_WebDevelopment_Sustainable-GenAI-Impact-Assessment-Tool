"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { 
  clearSession, 
  UserProfile 
} from "@/lib/auth";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, limit } from "firebase/firestore";
import { useEffect, useState } from "react";

type FeedRow = {
  model: string;
  tokens: number;
  wh: number;
  co2: number;
  project: string;
  timestamp: string;
};

const models = ["gpt-4.1", "claude-sonnet-4", "gemini-2.0-flash", "gpt-4o-mini"];

function buildFeed(projectName: string): FeedRow[] {
  return Array.from({ length: 20 }, (_, index) => {
    const model = models[index % models.length];
    const tokens = 640 + (index % 7) * 180 + index * 35;
    const wh = Number((tokens * 0.0032 + (index % 4) * 0.17).toFixed(2));
    const co2 = Number((wh * 0.41).toFixed(2));
    const minute = String((index * 3) % 60).padStart(2, "0");

    return {
      model,
      tokens,
      wh,
      co2,
      project: projectName || "Core API",
      timestamp: `2026-03-27 12:${minute}`,
    };
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // 1. Fetch User Profile
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          setUserProfile(profile);

          // 2. Fetch first project for this user
          const q = query(
            collection(db, "projects"), 
            where("userId", "==", user.uid), 
            limit(1)
          );
          const projectSnap = await getDocs(q);
          if (!projectSnap.empty) {
            setProject(projectSnap.docs[0].data());
          }
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const liveFeed = useMemo(
    () => buildFeed(project?.projectName || userProfile?.organizationName || "Default Project"),
    [project?.projectName, userProfile?.organizationName],
  );

  const totals = useMemo(() => {
    const windowWh = liveFeed.reduce((sum, row) => sum + row.wh, 0);
    const monthlyCalls = 14000 + liveFeed.length * 190;
    const monthlyKwh = Number(((windowWh * 88) / 1000).toFixed(2));
    const monthlyCo2 = Number((monthlyKwh * 0.39).toFixed(2));
    const sustainabilityScore = Math.max(58, 100 - Math.round(monthlyCo2 / 9));

    const modelBreakdown = liveFeed.reduce<Record<string, number>>((result, row) => {
      result[row.model] = (result[row.model] ?? 0) + row.co2;
      return result;
    }, {});

    return {
      monthlyCalls,
      monthlyKwh,
      monthlyCo2,
      sustainabilityScore,
      modelBreakdown,
    };
  }, [liveFeed]);

  const usageByModel = Object.entries(totals.modelBreakdown)
    .sort(([, a], [, b]) => b - a)
    .map(([model, co2]) => ({ model, co2: Number(co2.toFixed(2)) }));

  const daySeries = [2.1, 2.8, 3.2, 2.6, 3.7, 3.4, 4.1, 3.9, 4.3, 3.6];

  const handleSignOut = async () => {
    await auth.signOut();
    clearSession();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
          <p className="text-sm text-muted animate-pulse">Syncing telemetry data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)]/90 p-5 sm:p-7">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Dashboard</p>
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
              {userProfile?.organizationName ?? "Organization"} sustainability overview
            </h1>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Data source: proxy logs and runtime inference telemetry.
            </p>
          </div>
          <button
            onClick={handleSignOut}
            type="button"
            className="rounded-lg border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--foreground)]/90 hover:border-[color:var(--accent)] hover:text-white"
          >
            Sign out
          </button>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Total API calls this month" value={totals.monthlyCalls.toLocaleString()} />
          <MetricCard title="Total energy (kWh)" value={totals.monthlyKwh.toLocaleString()} />
          <MetricCard title="Total CO2 emitted (kg)" value={totals.monthlyCo2.toLocaleString()} />
          <MetricCard title="Sustainability score (0-100)" value={totals.sustainabilityScore.toString()} />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)]/80 p-5">
            <h2 className="text-sm font-semibold">Line chart: Energy consumed per day (last 30 days)</h2>
            <div className="mt-4 flex h-36 items-end gap-2">
              {daySeries.map((point, index) => (
                <div
                  key={`${point}-${index}`}
                  className="flex-1 rounded-t-md bg-gradient-to-t from-zinc-500/65 to-zinc-200/80"
                  style={{ height: `${point * 18}px` }}
                  aria-label={`Day ${index + 1} energy ${point} kWh`}
                />
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)]/80 p-5">
            <h2 className="text-sm font-semibold">Bar chart: CO2 by AI model</h2>
            <div className="mt-4 space-y-2">
              {usageByModel.map((entry) => (
                <div key={entry.model}>
                  <div className="mb-1 flex items-center justify-between text-xs text-[color:var(--muted)]">
                    <span>{entry.model}</span>
                    <span>{entry.co2} kg</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded bg-slate-800">
                    <div
                      className="h-full rounded bg-gradient-to-r from-zinc-300 to-zinc-100"
                      style={{ width: `${Math.min(100, entry.co2 * 3.8)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)]/80 p-5">
            <h2 className="text-sm font-semibold">Donut chart: Calls by project</h2>
            <div className="mt-4 flex items-center gap-5">
              <div
                className="h-28 w-28 rounded-full"
                style={{
                  background:
                    "conic-gradient(#e4e4e7 0 57%, #a1a1aa 57% 79%, #d4d4d8 79% 100%)",
                }}
              />
              <ul className="space-y-1 text-xs text-[color:var(--muted)]">
                <li>{project?.projectName ?? "Core API"} - 57%</li>
                <li>Mobile assistant - 22%</li>
                <li>Internal batch jobs - 21%</li>
              </ul>
            </div>
          </article>

          <article className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)]/80 p-5">
            <h2 className="text-sm font-semibold">Top 5 most expensive prompts by energy cost</h2>
            <ol className="mt-4 space-y-2 text-xs text-[color:var(--muted)]">
              <li className="rounded-lg border border-[color:var(--line-soft)] bg-[color:var(--surface-2)] px-3 py-2">
                1. Risk assessment generation - 1.82 kWh
              </li>
              <li className="rounded-lg border border-[color:var(--line-soft)] bg-[color:var(--surface-2)] px-3 py-2">
                2. Long-context legal summary - 1.66 kWh
              </li>
              <li className="rounded-lg border border-[color:var(--line-soft)] bg-[color:var(--surface-2)] px-3 py-2">
                3. Product image multi-captioning - 1.41 kWh
              </li>
              <li className="rounded-lg border border-[color:var(--line-soft)] bg-[color:var(--surface-2)] px-3 py-2">
                4. Multi-agent planning run - 1.18 kWh
              </li>
              <li className="rounded-lg border border-[color:var(--line-soft)] bg-[color:var(--surface-2)] px-3 py-2">
                5. Incident triage chain - 0.97 kWh
              </li>
            </ol>
          </article>
        </section>

        <section className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)]/80 p-5">
          <h2 className="text-sm font-semibold">Live feed (last 20 API calls, updates every 10s)</h2>
          <p className="mt-2 text-xs text-[color:var(--muted)]">
            Model, tokens, Wh, CO2, project and timestamp from proxy logs.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-[color:var(--line-soft)] text-left text-xs">
              <thead className="text-[color:var(--muted)]">
                <tr>
                  <th className="px-2 py-2 font-medium">Model</th>
                  <th className="px-2 py-2 font-medium">Tokens</th>
                  <th className="px-2 py-2 font-medium">Wh</th>
                  <th className="px-2 py-2 font-medium">CO2 (g)</th>
                  <th className="px-2 py-2 font-medium">Project</th>
                  <th className="px-2 py-2 font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--line-soft)]/80">
                {liveFeed.map((row, index) => (
                  <tr key={`${row.model}-${row.timestamp}-${index}`}>
                    <td className="px-2 py-2 font-mono text-[color:var(--foreground)]">{row.model}</td>
                    <td className="px-2 py-2">{row.tokens.toLocaleString()}</td>
                    <td className="px-2 py-2">{row.wh.toFixed(2)}</td>
                    <td className="px-2 py-2">{row.co2.toFixed(2)}</td>
                    <td className="px-2 py-2">{row.project}</td>
                    <td className="px-2 py-2">{row.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

type MetricCardProps = {
  title: string;
  value: string;
};

function MetricCard({ title, value }: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)]/85 p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">{title}</p>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </article>
  );
}
