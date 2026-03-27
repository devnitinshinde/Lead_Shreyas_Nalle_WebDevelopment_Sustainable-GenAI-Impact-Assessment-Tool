export default function SettingsPage() {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-4xl rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)]/90 p-5 sm:p-7">
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Settings</p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Organisation Settings (Static)</h1>

        <div className="mt-5 space-y-3 text-sm text-[color:var(--muted)]">
          <p>Region: India</p>
          <p>Default project: Core API</p>
          <p>Notification frequency: Weekly</p>
          <p>Data retention: 12 months</p>
        </div>
      </div>
    </div>
  );
}
