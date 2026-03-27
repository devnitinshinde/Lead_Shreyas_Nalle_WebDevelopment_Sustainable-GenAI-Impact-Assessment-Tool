import Link from "next/link";

const projects = [
  { id: "core-api", name: "Core API", env: "Production", calls: "12,430", energy: "188.2 kWh" },
  { id: "mobile-assistant", name: "Mobile Assistant", env: "Staging", calls: "3,842", energy: "44.1 kWh" },
  { id: "support-bot", name: "Support Bot", env: "Development", calls: "1,528", energy: "14.8 kWh" },
];

export default function ProjectsPage() {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)]/90 p-5 sm:p-7">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Projects</p>
          <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Project Tracking (Static)</h1>
        </header>

        <div className="overflow-x-auto rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)]/80">
          <table className="min-w-full divide-y divide-[color:var(--line-soft)] text-left text-xs">
            <thead className="text-[color:var(--muted)]">
              <tr>
                <th className="px-3 py-3 font-medium">Project</th>
                <th className="px-3 py-3 font-medium">Environment</th>
                <th className="px-3 py-3 font-medium">Calls</th>
                <th className="px-3 py-3 font-medium">Energy</th>
                <th className="px-3 py-3 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--line-soft)]/80">
              {projects.map((project) => (
                <tr key={project.id}>
                  <td className="px-3 py-3">{project.name}</td>
                  <td className="px-3 py-3">{project.env}</td>
                  <td className="px-3 py-3">{project.calls}</td>
                  <td className="px-3 py-3">{project.energy}</td>
                  <td className="px-3 py-3">
                    <Link href={`/projects/${project.id}`} className="underline">
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
