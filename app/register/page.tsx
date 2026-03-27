import Link from "next/link";

const providers = ["OpenAI", "Anthropic", "Google", "Azure", "Other"];

export default function RegisterPage() {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-5xl rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)]/90 p-5 sm:p-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Signup</p>
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Organisation Registration (Static)</h1>
          </div>
          <Link
            href="/login"
            className="rounded-lg border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--foreground)]/90 hover:border-[color:var(--accent)]"
          >
            Already registered? Login
          </Link>
        </div>

        <form className="grid gap-4 sm:grid-cols-2">
          <Input label="Full name" placeholder="Priya Sharma" />
          <Input label="Work email" placeholder="admin@company.com" type="email" />
          <Input label="Password" placeholder="Minimum 8 characters" type="password" />
          <Input label="Organisation name" placeholder="Company namespace" />

          <label className="space-y-2">
            <span className="text-sm text-[color:var(--muted)]">Organisation size</span>
            <select className="w-full rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface-2)] px-4 py-3 text-sm">
              <option>1-10</option>
              <option>11-50</option>
              <option>51-200</option>
              <option>200+</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm text-[color:var(--muted)]">Industry</span>
            <select className="w-full rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface-2)] px-4 py-3 text-sm">
              <option>Fintech</option>
              <option>Healthtech</option>
              <option>Ecommerce</option>
              <option>Education</option>
              <option>Other</option>
            </select>
          </label>

          <Input
            label="Country / region"
            placeholder="Used for grid carbon intensity"
            className="sm:col-span-2"
          />

          <fieldset className="space-y-3 rounded-2xl border border-dashed border-[color:var(--line)] bg-[color:var(--surface-2)]/70 p-4 sm:col-span-2">
            <legend className="px-2 text-sm text-[color:var(--muted)]">Intended AI providers</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {providers.map((provider) => (
                <label
                  key={provider}
                  className="flex items-center gap-2 rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface)]/80 px-3 py-2 text-sm"
                >
                  <input type="checkbox" className="accent-neutral-200" />
                  {provider}
                </label>
              ))}
            </div>
          </fieldset>

          <Link
            href="/onboarding"
            className="sm:col-span-2 inline-flex items-center justify-center rounded-xl bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-black hover:bg-[color:var(--accent-2)]"
          >
            Continue to onboarding (Static)
          </Link>
        </form>
      </div>
    </div>
  );
}

type InputProps = {
  label: string;
  placeholder: string;
  type?: "text" | "email" | "password";
  className?: string;
};

function Input({ label, placeholder, type = "text", className }: InputProps) {
  return (
    <label className={`space-y-2 ${className ?? ""}`}>
      <span className="text-sm text-[color:var(--muted)]">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[color:var(--line-soft)] bg-[color:var(--surface-2)] px-4 py-3 text-sm"
      />
    </label>
  );
}
