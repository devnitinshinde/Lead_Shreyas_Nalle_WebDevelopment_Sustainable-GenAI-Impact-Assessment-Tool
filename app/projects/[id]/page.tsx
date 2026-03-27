import Link from "next/link";

type ProjectDetailPageProps = {
  params: Promise<{ id: string }>;
};

const staticProjectIds = ["core-api", "mobile-assistant", "support-bot"];

export function generateStaticParams() {
  return staticProjectIds.map((id) => ({ id }));
}

export const dynamicParams = false;

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <header className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)]/90 p-5 sm:p-7">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Project Detail</p>
          <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{id} (Static)</h1>
        </header>

        <section className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)]/80 p-5 text-sm text-[color:var(--muted)]">
          This is a static summary placeholder for `/projects/{id}` based on the SRS structure.
        </section>

        <Link
          href="/projects"
          className="inline-flex rounded-lg border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--foreground)]/90 hover:border-[color:var(--accent)]"
        >
          Back to projects
        </Link>
      </div>
    </div>
  );
}
