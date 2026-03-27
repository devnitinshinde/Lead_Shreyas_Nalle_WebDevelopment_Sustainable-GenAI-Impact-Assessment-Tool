"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { 
  Building2, 
  Mail, 
  Lock, 
  User, 
  Globe2, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck,
  Zap,
  Leaf
} from "lucide-react";

import { Provider, setSession, OrganizationSize, UserProfile } from "@/lib/auth";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const providerOptions: { id: Provider; icon: string }[] = [
  { id: "OpenAI", icon: "OA" },
  { id: "Anthropic", icon: "AN" },
  { id: "Google", icon: "GO" },
  { id: "Azure", icon: "AZ" },
  { id: "Other", icon: "OT" }
];

const organizationSizes: OrganizationSize[] = ["1-10", "11-50", "51-200", "200+"];

const industries = [
  "Fintech", "Healthtech", "Ecommerce", "Education", "Manufacturing", "Government", "Other"
];

const defaultState = {
  fullName: "",
  workEmail: "",
  password: "",
  organizationName: "",
  organizationSize: "1-10" as OrganizationSize,
  industry: "Fintech",
  countryRegion: "",
  intendedProviders: [] as Provider[],
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState(defaultState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setField = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const toggleProvider = (provider: Provider) => {
    setForm((prev: any) => {
      const included = prev.intendedProviders.includes(provider);
      return {
        ...prev,
        intendedProviders: included
          ? prev.intendedProviders.filter((p: any) => p !== provider)
          : [...prev.intendedProviders, provider],
      };
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (form.intendedProviders.length === 0) {
      setError("Please select at least one AI provider to continue.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        form.workEmail, 
        form.password
      );
      const user = userCredential.user;

      // 2. Prepare user profile
      const profile: UserProfile = {
        uid: user.uid,
        fullName: form.fullName,
        workEmail: form.workEmail.toLowerCase(),
        organizationName: form.organizationName,
        organizationSize: form.organizationSize,
        industry: form.industry,
        countryRegion: form.countryRegion,
        intendedProviders: form.intendedProviders as Provider[],
        onboarded: false,
        createdAt: serverTimestamp(),
      };

      // 3. Store in Firestore
      await setDoc(doc(db, "users", user.uid), profile);

      // 4. Set session cookies
      setSession(false);

      // 5. Redirect to onboarding
      router.push("/onboarding");
    } catch (err: any) {
      console.error("Registration error:", err);
      let message = "An error occurred during registration.";
      if (err.code === "auth/email-already-in-use") {
        message = "This email is already registered.";
      } else if (err.code === "auth/weak-password") {
        message = "Password should be at least 6 characters.";
      } else if (err.code === "auth/invalid-email") {
        message = "Invalid email format.";
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background selection:bg-accent selection:text-zinc-950">
      {/* Branding Section - Hidden on Mobile */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-zinc-950 border-r border-line/30 flex-col justify-between p-12">
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.4)]">
              <Leaf className="text-zinc-950 w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">EcoTrack</span>
          </div>
          
          <div className="mt-24 max-w-md">
            <h2 className="text-5xl font-bold leading-tight text-gradient mb-6">
              Measure. <br />Decarbonize. <br />Optimize.
            </h2>
            <p className="text-lg text-muted/80 leading-relaxed">
              Join 500+ organizations quantifying the environmental impact of their AI infrastructure in real-time.
            </p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-8">
          {[
            { icon: ShieldCheck, label: "Enterprise Security", desc: "AES-256-GCM encryption for all provider keys.", color: "text-brand-blue" },
            { icon: Zap, label: "Real-time Metrics", desc: "Instantly track energy Wh and CO2 per API request.", color: "text-brand-amber" }
          ].map((item, i) => (
            <div key={i} className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <item.icon className={`w-6 h-6 ${item.color}`} />
              <h4 className="text-sm font-semibold text-white">{item.label}</h4>
              <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-accent/20 blur-[120px]" />
          <div className="absolute bottom-[10%] left-[-5%] w-[250px] h-[250px] rounded-full bg-brand-blue/10 blur-[80px]" />
          <div className="absolute top-[30%] left-[20%] w-[150px] h-[150px] rounded-full bg-brand-purple/5 blur-[60px]" />
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-20 overflow-y-auto">
        <div className="w-full max-w-xl">
          <div className="mb-10 lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Leaf className="text-zinc-950 w-5 h-5" />
            </div>
            <span className="text-lg font-bold">EcoTrack</span>
          </div>

          <div className="space-y-1 mb-10">
            <h3 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Create workspace</h3>
            <p className="text-muted text-sm">Fill in your organization details to start monitoring AI impact.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-2">
              <InputGroup 
                label="Full name" 
                icon={User} 
                value={form.fullName} 
                onChange={(v) => setField("fullName", v)} 
                placeholder="Priya Sharma"
                required
              />
              <InputGroup 
                label="Work email" 
                icon={Mail} 
                type="email" 
                value={form.workEmail} 
                onChange={(v) => setField("workEmail", v)} 
                placeholder="priya@acme.ai"
                required
              />
              <InputGroup 
                label="Organization name" 
                icon={Building2} 
                value={form.organizationName} 
                onChange={(v) => setField("organizationName", v)} 
                placeholder="Acme Inc."
                required
              />
              <InputGroup 
                label="Password" 
                icon={Lock} 
                type="password" 
                value={form.password} 
                onChange={(v) => setField("password", v)} 
                placeholder="••••••••"
                required
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <SelectGroup 
                label="Org size" 
                options={organizationSizes} 
                value={form.organizationSize} 
                onChange={(v) => setField("organizationSize", v as any)} 
              />
              <SelectGroup 
                label="Industry" 
                options={industries} 
                value={form.industry} 
                onChange={(v) => setField("industry", v)} 
              />
            </div>

            <InputGroup 
              label="Country / Region" 
              icon={Globe2} 
              value={form.countryRegion} 
              onChange={(v) => setField("countryRegion", v)} 
              placeholder="e.g. United States, India, Norway"
              required
            />

            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted font-mono">Intended AI Providers</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "OpenAI", color: "hover:border-[#74aa9c] focus:bg-[#74aa9c]/10", active: "bg-[#74aa9c]/20 border-[#74aa9c] text-[#74aa9c]" },
                  { id: "Anthropic", color: "hover:border-[#d97757] focus:bg-[#d97757]/10", active: "bg-[#d97757]/20 border-[#d97757] text-[#d97757]" },
                  { id: "Google", color: "hover:border-[#4285f4] focus:bg-[#4285f4]/10", active: "bg-[#4285f4]/20 border-[#4285f4] text-[#4285f4]" },
                  { id: "Azure", color: "hover:border-[#0078d4] focus:bg-[#0078d4]/10", active: "bg-[#0078d4]/20 border-[#0078d4] text-[#0078d4]" },
                  { id: "Other", color: "hover:border-accent focus:bg-accent/10", active: "bg-accent/20 border-accent text-accent" }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleProvider(opt.id as Provider)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs transition-all ${
                      form.intendedProviders.includes(opt.id as Provider)
                        ? `${opt.active} font-bold shadow-lg`
                        : `bg-surface border-line/50 text-foreground/60 ${opt.color}`
                    }`}
                  >
                    {form.intendedProviders.includes(opt.id as Provider) && <CheckCircle2 className="w-4 h-4" />}
                    {opt.id}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-xs flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4" />
                 {error}
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full group relative flex items-center justify-center gap-2 bg-[#10b981] text-zinc-950 font-bold py-4 rounded-xl hover:bg-[#34d399] transition-all disabled:opacity-50 shadow-[0_8px_30px_rgba(16,185,129,0.3)]"
            >
              {loading ? "Creating account..." : "Continue to setup"}
              {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:text-accent-2 font-medium underline underline-offset-4 decoration-accent/30 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function InputGroup({ 
  label, 
  icon: Icon, 
  value, 
  onChange, 
  placeholder, 
  type = "text", 
  required = false 
}: { 
  label: string; 
  icon: any; 
  value: string; 
  onChange: (v: string) => void; 
  placeholder: string; 
  type?: string; 
  required?: boolean; 
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-muted/80">{label}</label>
      <div className="relative group">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent transition-colors" />
        <input
          required={required}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-surface border border-line-soft rounded-xl px-12 py-3.5 text-sm text-white outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/5 transition-all placeholder:text-muted/40"
        />
      </div>
    </div>
  );
}

function SelectGroup({ 
  label, 
  options, 
  value, 
  onChange 
}: { 
  label: string; 
  options: string[]; 
  value: string; 
  onChange: (v: string) => void; 
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-muted/80">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface border border-line-soft rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/5 transition-all appearance-none cursor-pointer"
      >
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}



