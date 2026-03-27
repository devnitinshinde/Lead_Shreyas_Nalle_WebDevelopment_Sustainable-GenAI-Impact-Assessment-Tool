import Link from "next/link";
import {
  Leaf,
  BarChart3,
  Shield,
  Zap,
  Globe2,
  ArrowRight,
  CheckCircle2,
  Activity,
  FileText,
  Lightbulb,
  ChevronRight,
  Cpu,
  TrendingDown,
  Lock,
} from "lucide-react";

/* ─────────────────────────────────────────
   NAVBAR
───────────────────────────────────────── */
function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#050505]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            <Leaf className="h-5 w-5 text-zinc-950" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">EcoTrack</span>
        </div>

        {/* Nav links */}
        <nav className="hidden items-center gap-6 text-sm text-zinc-400 md:flex">
          <a href="#features" className="transition-colors hover:text-white">Features</a>
          <a href="#how-it-works" className="transition-colors hover:text-white">How it works</a>
          <a href="#impact" className="transition-colors hover:text-white">Impact</a>
        </nav>

        {/* CTA buttons */}
        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/login"
            className="rounded-lg border border-white/10 px-4 py-2 text-zinc-300 transition-all hover:border-white/25 hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-[#10b981] px-4 py-2 font-semibold text-zinc-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:bg-[#34d399] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────
   HERO
───────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative overflow-hidden px-5 pb-24 pt-20 sm:px-8 sm:pt-28">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[#10b981]/10 blur-[120px]" />
        <div className="absolute right-[-15%] top-[10%] h-[400px] w-[400px] rounded-full bg-[#3b82f6]/8 blur-[100px]" />
        <div className="absolute bottom-0 left-[-10%] h-[300px] w-[400px] rounded-full bg-[#8b5cf6]/8 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Badge */}
        <div className="mb-6 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#10b981]/25 bg-[#10b981]/8 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-[#10b981]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#10b981]" />
            AI Carbon Intelligence Platform
          </span>
        </div>

        {/* Headline */}
        <h1 className="mx-auto max-w-4xl text-center text-4xl font-bold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
          Measure & reduce your{" "}
          <span className="bg-gradient-to-r from-[#10b981] via-[#34d399] to-[#6ee7b7] bg-clip-text text-transparent">
            AI carbon footprint
          </span>{" "}
          in real time
        </h1>

        {/* Sub-headline */}
        <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-zinc-400 sm:text-lg">
          EcoTrack sits between your app and AI providers — tracking energy consumption, CO₂ emissions,
          and costs per API call, so you can optimise sustainability without slowing development.
        </p>

        {/* CTA row */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 rounded-xl bg-[#10b981] px-7 py-3.5 text-sm font-bold text-zinc-950 shadow-[0_8px_32px_rgba(16,185,129,0.35)] transition-all hover:bg-[#34d399] hover:shadow-[0_8px_40px_rgba(16,185,129,0.5)]"
          >
            Start free — no card needed
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-7 py-3.5 text-sm font-medium text-zinc-300 transition-all hover:border-white/25 hover:text-white"
          >
            Sign in to dashboard
          </Link>
        </div>

        {/* Trust strip */}
        <p className="mt-6 text-center text-xs text-zinc-500">
          Fully proxy-compatible with{" "}
          <span className="text-zinc-300">OpenAI · Anthropic · Google Gemini</span>
        </p>

        {/* Fake dashboard preview */}
        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0a0a0a] shadow-[0_40px_120px_rgba(0,0,0,0.8)]">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-white/[0.06] bg-[#111]/80 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-500/70" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
              <span className="h-3 w-3 rounded-full bg-green-500/70" />
              <div className="ml-4 flex h-5 w-60 items-center rounded bg-white/5 px-3">
                <span className="text-[10px] text-zinc-500">app.ecotrack.ai/dashboard</span>
              </div>
            </div>

            {/* Dashboard mock */}
            <div className="grid grid-cols-4 gap-3 p-5 sm:gap-4 sm:p-6">
              {[
                { label: "Energy Used (Wh)", value: "48.2k", delta: "-12%", color: "#10b981" },
                { label: "CO₂ Emissions (g)", value: "7.84k", delta: "-9%", color: "#3b82f6" },
                { label: "API Calls", value: "124,590", delta: "+3%", color: "#8b5cf6" },
                { label: "Eco Score", value: "87 / 100", delta: "+5pts", color: "#f59e0b" },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="col-span-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 sm:col-span-1"
                >
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500">{kpi.label}</p>
                  <p className="mt-2 text-xl font-bold text-white sm:text-2xl">{kpi.value}</p>
                  <p className="mt-1 text-xs font-medium" style={{ color: kpi.color }}>{kpi.delta} this month</p>
                </div>
              ))}

              {/* Fake chart bar */}
              <div className="col-span-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">Energy Usage (Last 30 days)</p>
                <div className="flex h-20 items-end gap-1">
                  {[40, 65, 50, 80, 60, 95, 70, 55, 85, 65, 90, 75, 60, 88, 72, 55, 80, 68, 92, 78, 50, 65, 88, 74, 60, 95, 70, 80, 66, 85].map(
                    (h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-sm"
                        style={{
                          height: `${h}%`,
                          background: `rgba(16,185,129,${0.15 + (h / 100) * 0.55})`,
                        }}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Glow under dashboard */}
          <div className="pointer-events-none absolute inset-x-10 -bottom-8 h-16 rounded-full bg-[#10b981]/12 blur-2xl" />
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   LOGOS / SOCIAL PROOF
───────────────────────────────────────── */
function ProofBar() {
  const providers = ["OpenAI", "Anthropic", "Google Gemini", "AWS Bedrock"];
  return (
    <section className="border-y border-white/[0.05] bg-[#080808] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl text-center">
        <p className="mb-6 text-xs uppercase tracking-widest text-zinc-500">
          Proxy-compatible with all major AI providers
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {providers.map((p) => (
            <span key={p} className="text-sm font-semibold text-zinc-400">{p}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   FEATURES
───────────────────────────────────────── */
const FEATURES = [
  {
    icon: Activity,
    color: "#10b981",
    title: "Real-time Telemetry",
    desc: "Every AI API call is intercepted, measured, and logged — energy (Wh), carbon (gCO₂), and latency — before the response reaches your app.",
  },
  {
    icon: BarChart3,
    color: "#3b82f6",
    title: "Live Dashboard",
    desc: "Unified charts for daily, weekly, and monthly consumption. Compare models, projects, and providers in one view.",
  },
  {
    icon: Lightbulb,
    color: "#f59e0b",
    title: "Smart Recommendations",
    desc: "Rule-based engine automatically suggests switching to a lighter model, trimming context length, or offloading staging calls.",
  },
  {
    icon: FileText,
    color: "#8b5cf6",
    title: "Audit Reports (PDF / CSV)",
    desc: "Monthly sustainability reports aligned with GHG Protocol — ready to attach to CSR disclosures or investor updates.",
  },
  {
    icon: Lock,
    color: "#ec4899",
    title: "Secure Key Vault",
    desc: "Provider API keys are encrypted with AES-256-GCM at rest. EcoTrack keys are project-scoped and revocable at any time.",
  },
  {
    icon: Globe2,
    color: "#06b6d4",
    title: "Region-aware Carbon Intensity",
    desc: "CO₂ calculations use grid-specific carbon intensity (gCO₂/Wh) so your numbers reflect your actual infrastructure region.",
  },
];

function Features() {
  return (
    <section id="features" className="px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#10b981]">Platform features</p>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Everything you need to go green</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-400">
            A complete sustainability layer for AI infrastructure — no refactoring, just a one-line base URL change.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <div
                className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: `${f.color}14`, boxShadow: `0 0 20px ${f.color}25` }}
              >
                <f.icon className="h-5 w-5" style={{ color: f.color }} />
              </div>
              <h3 className="mb-2 text-base font-semibold text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   HOW IT WORKS
───────────────────────────────────────── */
const STEPS = [
  {
    num: "01",
    icon: Cpu,
    title: "Register your organisation",
    desc: "Sign up as an org admin, add your AI provider keys (OpenAI, Anthropic, Google). Keys are encrypted immediately.",
  },
  {
    num: "02",
    icon: Shield,
    title: "Get your EcoTrack key",
    desc: "Generate a project-scoped EcoTrack proxy key during onboarding. One-line change to your app's base URL — that's the entire integration.",
  },
  {
    num: "03",
    icon: Activity,
    title: "Proxy routes every call",
    desc: "Your app calls EcoTrack. EcoTrack validates, forwards to the real provider, logs energy & CO₂ asynchronously, and returns the response.",
  },
  {
    num: "04",
    icon: TrendingDown,
    title: "Optimise with insights",
    desc: "Use the dashboard, monthly reports, and automated recommendations to progressively reduce your AI carbon footprint.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="relative px-5 py-24 sm:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[#10b981]/5 blur-[120px]" />
      </div>
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#10b981]">Integration in 4 steps</p>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">How EcoTrack works</h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-zinc-400">
            Zero downtime. Zero re-architecture. One proxy, full visibility.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.num} className="relative">
              {/* Connector arrow */}
              {i < STEPS.length - 1 && (
                <ChevronRight className="absolute -right-4 top-6 z-10 hidden h-4 w-4 text-zinc-600 lg:block" />
              )}
              <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-6 h-full">
                <div className="mb-5 flex items-center gap-3">
                  <span className="font-mono text-xs text-[#10b981]">{s.num}</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#10b981]/10 border border-[#10b981]/20">
                    <s.icon className="h-4.5 w-4.5 h-4 w-4 text-[#10b981]" />
                  </div>
                </div>
                <h3 className="mb-2 text-sm font-bold text-white">{s.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   STATS / IMPACT
───────────────────────────────────────── */
const STATS = [
  { value: "~5 Wh", label: "Energy per 1k tokens (GPT-4)", sub: "vs 0.001 Wh for a Google search" },
  { value: "0.82 gCO₂", label: "Per Wh in India's grid", sub: "vs 0.233 gCO₂/Wh in Norway" },
  { value: "30%+", label: "Potential savings", sub: "by switching model for simple tasks" },
  { value: "<1 ms", label: "Proxy overhead", sub: "async logging, zero blocking" },
];

function Impact() {
  return (
    <section id="impact" className="px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-3xl border border-[#10b981]/15 bg-gradient-to-br from-[#10b981]/8 via-[#0a0a0a] to-[#0a0a0a]">
          <div className="p-8 sm:p-12">
            <div className="mb-12 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#10b981]">By the numbers</p>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">The real-world impact</h2>
              <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-zinc-400">
                AI inference is energy-intensive. EcoTrack makes the invisible visible so teams can act.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 text-center">
                  <p className="text-3xl font-extrabold text-[#10b981]">{s.value}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{s.label}</p>
                  <p className="mt-1 text-xs text-zinc-500">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   WHAT'S INCLUDED
───────────────────────────────────────── */
const INCLUDED = [
  "Project-level API key scoping",
  "Per-call energy & CO₂ logging",
  "Dashboard with live charts",
  "Model comparison leaderboard",
  "Monthly PDF / CSV audit reports",
  "Rule-based recommendation engine",
  "AES-256-GCM provider key encryption",
  "Onboarding wizard with proxy guide",
  "Multi-provider support (OpenAI, Anthropic, Google)",
  "Region-specific carbon intensity",
];

function Included() {
  return (
    <section className="px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#10b981]">What you get</p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Everything in the free plan</h2>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400">
              No feature-gating for your core sustainability data. Everything you need to measure, report, and reduce AI 
              emissions is available from day one.
            </p>
            <Link
              href="/signup"
              className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-[#10b981] px-6 py-3 text-sm font-bold text-zinc-950 shadow-[0_8px_24px_rgba(16,185,129,0.3)] transition-all hover:bg-[#34d399]"
            >
              Create free account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {INCLUDED.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#10b981]" />
                <span className="text-sm text-zinc-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   CTA BANNER
───────────────────────────────────────── */
function CTA() {
  return (
    <section className="px-5 pb-24 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl bg-[#0d1f18] border border-[#10b981]/20 px-8 py-16 text-center sm:px-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-[#10b981]/15 blur-[80px]" />
          </div>
          <div className="relative">
            <Zap className="mx-auto mb-4 h-10 w-10 text-[#10b981]" />
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to track your AI&apos;s environmental impact?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-zinc-400">
              Set up in minutes. Change one URL. Start seeing energy and CO₂ data on your very first proxied call.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-xl bg-[#10b981] px-8 py-3.5 text-sm font-bold text-zinc-950 shadow-[0_8px_32px_rgba(16,185,129,0.4)] transition-all hover:bg-[#34d399]"
              >
                Get started for free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-8 py-3.5 text-sm font-medium text-zinc-300 transition-all hover:border-white/30 hover:text-white"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   FOOTER
───────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-white/[0.05] bg-[#050505] px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#10b981]">
            <Leaf className="h-4 w-4 text-zinc-950" />
          </div>
          <span className="text-sm font-bold text-white">EcoTrack</span>
        </div>
        <p className="text-xs text-zinc-500">
          Sustainable GenAI Impact Assessment Tool · v1.1 · Built with Next.js + Firebase
        </p>
        <div className="flex gap-4 text-xs text-zinc-500">
          <Link href="/login" className="transition-colors hover:text-zinc-300">Sign in</Link>
          <Link href="/signup" className="transition-colors hover:text-zinc-300">Register</Link>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────
   PAGE
───────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <ProofBar />
        <Features />
        <HowItWorks />
        <Impact />
        <Included />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
