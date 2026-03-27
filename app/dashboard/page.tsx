import Link from "next/link";

const liveFeedRows = [
  { model: "gpt-4.1", tokens: "8,420", wh: "27.41", co2: "11.24", project: "Core API", time: "2026-03-27 12:03" },
  { model: "claude-sonnet-4", tokens: "5,180", wh: "18.07", co2: "7.41", project: "Core API", time: "2026-03-27 12:01" },
  { model: "gemini-2.0-flash", tokens: "3,960", wh: "12.64", co2: "5.18", project: "Mobile App", time: "2026-03-27 11:58" },
  { model: "gpt-4o-mini", tokens: "2,310", wh: "7.73", co2: "3.17", project: "Support Bot", time: "2026-03-27 11:56" },
  { model: "gpt-4.1", tokens: "7,940", wh: "25.83", co2: "10.59", project: "Core API", time: "2026-03-27 11:53" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)]/90 p-5 sm:p-7">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Dashboard</p>
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Blissful Turtle</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="rounded-lg border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--foreground)]/90 hover:border-[color:var(--accent)] hover:text-white"
            >
              Home
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
          </div>
        </header>

        <section className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)]/85 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
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
                {liveFeedRows.map((row, index) => (
                  <tr key={`${row.model}-${index}`}>
                    <td className="px-2 py-2 font-mono text-[color:var(--foreground)]">{row.model}</td>
                    <td className="px-2 py-2">{row.tokens}</td>
                    <td className="px-2 py-2">{row.wh}</td>
                    <td className="px-2 py-2">{row.co2}</td>
                    <td className="px-2 py-2">{row.project}</td>
                    <td className="px-2 py-2">{row.time}</td>
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
