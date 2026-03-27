"use client";

import Link from "next/link";
import { type ComponentType, useEffect, useState } from "react";

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

const liveFeedRows = [
  { model: "gpt-4.1", tokens: "8,420", wh: "27.41", co2: "11.24", project: "Core API", time: "2026-03-27 12:03" },
  { model: "claude-sonnet-4", tokens: "5,180", wh: "18.07", co2: "7.41", project: "Core API", time: "2026-03-27 12:01" },
  { model: "gemini-2.0-flash", tokens: "3,960", wh: "12.64", co2: "5.18", project: "Mobile App", time: "2026-03-27 11:58" },
  { model: "gpt-4o-mini", tokens: "2,310", wh: "7.73", co2: "3.17", project: "Support Bot", time: "2026-03-27 11:56" },
  { model: "gpt-4.1", tokens: "7,940", wh: "25.83", co2: "10.59", project: "Core API", time: "2026-03-27 11:53" },
];

const menuLinks: Array<{
  href: string;
  label: string;
  icon: ComponentType<IconProps>;
}> = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { href: "/default", label: "Default", icon: GridIcon },
  { href: "/keys", label: "Keys", icon: KeyIcon },
  { href: "/projects", label: "Projects", icon: FolderIcon },
  { href: "/charts-demo", label: "Charts Demo", icon: ChartBarsIcon },
  { href: "/reports", label: "Reports", icon: ReportIcon },
  { href: "/recommendations", label: "Recommendations", icon: SparkIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
  { href: "/onboarding", label: "On-boarding", icon: RocketIcon },
  { href: "/login", label: "Login", icon: LoginIcon },
  { href: "/charts-demo", label: "Charts", icon: ChartBarsIcon },
];

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
  }, [menuOpen]);

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
          </header>

          <main className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
            <section className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)]/85 p-5">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Metric title="Total API calls this month" value="17,800" />
                <Metric title="Total energy (kWh)" value="246.38" />
                <Metric title="Total CO2 emitted (kg)" value="96.11" />
                <Metric title="Sustainability score (0-100)" value="84" />
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <CardLine text="Line chart -> Energy consumed per day (last 30 days)" />
              <CardLine text="Bar chart -> CO2 by AI model (which model is dirtiest)" />
              <CardLine text="Donut chart -> Calls by project (which app uses AI most)" />
              <CardLine text="Bar chart -> Top 5 most expensive prompts by energy cost" />
            </section>

            <section className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)]/80 p-5">
              <h2 className="text-sm font-semibold">Live feed (bottom):</h2>
              <p className="mt-2 text-xs text-[color:var(--muted)]">
                A real-time table showing the last 20 API calls with model, tokens, Wh, CO2,
                project name, and timestamp. Updates automatically via WebSocket or polling
                every 10 seconds.
              </p>
              <p className="mt-2 text-xs text-[color:var(--muted)]">
                Data being collected and shown here all comes from the logs your proxy wrote to
                the database.
              </p>

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

type MetricProps = {
  title: string;
  value: string;
};

function Metric({ title, value }: MetricProps) {
  return (
    <article className="rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface-2)]/80 p-4">
      <p className="text-xs uppercase tracking-[0.15em] text-[color:var(--muted)]">{title}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </article>
  );
}

type CardLineProps = {
  text: string;
};

function CardLine({ text }: CardLineProps) {
  return (
    <article className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)]/80 p-5">
      <p className="text-sm text-[color:var(--foreground)]/90">{text}</p>
    </article>
  );
}

function MenuIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z" />
    </svg>
  );
}

function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M6.7 5.3 12 10.6l5.3-5.3 1.4 1.4L13.4 12l5.3 5.3-1.4 1.4L12 13.4l-5.3 5.3-1.4-1.4 5.3-5.3-5.3-5.3 1.4-1.4Z" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="m14.7 6.3-1.4-1.4L6.2 12l7.1 7.1 1.4-1.4L9.1 12l5.6-5.7Z" />
    </svg>
  );
}

function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="m9.3 17.7 1.4 1.4 7.1-7.1-7.1-7.1-1.4 1.4 5.6 5.6-5.6 5.8Z" />
    </svg>
  );
}

function DashboardIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M3 3h8v8H3V3Zm10 0h8v5h-8V3ZM3 13h5v8H3v-8Zm7 0h11v8H10v-8Z" />
    </svg>
  );
}

function GridIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" />
    </svg>
  );
}

function KeyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M14.5 3a6.5 6.5 0 0 0-6.3 8h-5L2 12.2V16h3v2h2v2h3l2.4-2.4a6.5 6.5 0 1 0 2.1-14.6Zm0 4A2.5 2.5 0 1 1 12 9.5 2.5 2.5 0 0 1 14.5 7Z" />
    </svg>
  );
}

function FolderIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M3 5h7l2 2h9v12H3V5Zm2 4v8h14V9H5Z" />
    </svg>
  );
}

function ReportIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M6 3h9l5 5v13H6V3Zm8 1v5h5l-5-5ZM9 12h8v2H9v-2Zm0 4h8v2H9v-2Z" />
    </svg>
  );
}

function SparkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="m12 2 2.2 5.8L20 10l-5.8 2.2L12 18l-2.2-5.8L4 10l5.8-2.2L12 2Zm7 12 1 2.5L22.5 18 20 19l-1 2.5L18 19l-2.5-1L18 16.5l1-2.5ZM5 14l1 2.5L8.5 18 6 19l-1 2.5L4 19l-2.5-1L4 16.5 5 14Z" />
    </svg>
  );
}

function SettingsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="m20.7 13.3.1-2.6-2.1-.8a7 7 0 0 0-.5-1.2l1-2-1.9-1.9-2 .9a7 7 0 0 0-1.2-.5l-.8-2.1h-2.6l-.8 2.1a7 7 0 0 0-1.2.5l-2-.9-1.9 1.9 1 2a7 7 0 0 0-.5 1.2l-2.1.8-.1 2.6 2.1.8a7 7 0 0 0 .5 1.2l-1 2 1.9 1.9 2-.9a7 7 0 0 0 1.2.5l.8 2.1h2.6l.8-2.1a7 7 0 0 0 1.2-.5l2 .9 1.9-1.9-1-2a7 7 0 0 0 .5-1.2l2.1-.8ZM12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
    </svg>
  );
}

function RocketIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M14 3c3 0 5 2 5 5 0 4-3 7-7 9l-2 4-1.5-3.5L5 16l4-2c2-4 5-7 9-7Zm0 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
    </svg>
  );
}

function LoginIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M10 3h9v18h-9v-2h7V5h-7V3ZM5.7 12l2.6 2.6-1.4 1.4L2 12l4.9-4 1.4 1.4L5.7 12Zm4.3-1h9v2h-9v-2Z" />
    </svg>
  );
}

function ChartBarsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M4 19h16v2H2V3h2v16Zm2-2h3V9H6v8Zm5 0h3V5h-3v12Zm5 0h3v-6h-3v6Z" />
    </svg>
  );
}
