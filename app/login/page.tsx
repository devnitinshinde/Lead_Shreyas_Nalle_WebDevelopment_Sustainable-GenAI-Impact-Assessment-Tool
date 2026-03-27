import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Leaf,
  ShieldCheck,
  Zap,
  Globe2
} from "lucide-react";

import { setSession } from "@/lib/auth";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      // 1. Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // 2. Fetch user profile from Firestore to get onboarded status
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      let isOnboarded = false;
      if (userDoc.exists()) {
        isOnboarded = userDoc.data().onboarded || false;
      }

      // 3. Set session cookies
      setSession(isOnboarded);

      // 4. Redirect based on status
      router.push(isOnboarded ? "/dashboard" : "/onboarding");
    } catch (err: any) {
      console.error("Login error:", err);
      let message = "Invalid email or password.";
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        message = "Invalid credentials. Please try again.";
      } else if (err.code === "auth/invalid-email") {
        message = "Invalid email format.";
      }
      setError(message);
      setPending(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background selection:bg-accent selection:text-zinc-950">
      {/* Branding Section */}
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
              Welcome <br />Back.
            </h2>
            <p className="text-lg text-muted/80 leading-relaxed">
              Continue monitoring your organization's AI carbon footprint and optimizing resource efficiency.
            </p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-8">
          {[
            { icon: Globe2, label: "Global Standards", desc: "Align with GHG Protocol and ISO 14064-1 metrics.", color: "text-brand-blue" },
            { icon: Zap, label: "Efficiency Insights", desc: "Automated recommendations to reduce Wh per token.", color: "text-brand-amber" }
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
          <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-accent/15 blur-[120px]" />
          <div className="absolute bottom-[20%] left-[-10%] w-[300px] h-[300px] rounded-full bg-brand-blue/10 blur-[100px]" />
          <div className="absolute top-[30%] right-[10%] w-[200px] h-[200px] rounded-full bg-brand-purple/5 blur-[80px]" />
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-20 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Leaf className="text-zinc-950 w-5 h-5" />
            </div>
            <span className="text-lg font-bold">EcoTrack</span>
          </div>

          <div className="space-y-2 mb-10 text-center lg:text-left">
            <h3 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Sign in</h3>
            <p className="text-muted text-xs font-mono uppercase tracking-[0.2em] leading-relaxed">Enter your credentials to access your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <InputGroup 
                label="Work email" 
                icon={Mail} 
                type="email" 
                value={email} 
                onChange={setEmail} 
                placeholder="priya@acme.ai"
                required
              />
              <InputGroup 
                label="Password" 
                icon={Lock} 
                type="password" 
                value={password} 
                onChange={setPassword} 
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-xs flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4" />
                 {error}
              </div>
            )}

            <button
              disabled={pending}
              type="submit"
              className="w-full group relative flex items-center justify-center gap-2 bg-[#10b981] text-zinc-950 font-bold py-4 rounded-xl hover:bg-[#34d399] transition-all disabled:opacity-50 shadow-[0_8px_30px_rgba(16,185,129,0.3)]"
            >
              {pending ? "Signing in..." : "Access Dashboard"}
              {!pending && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted">
            New to EcoTrack?{" "}
            <Link href="/register" className="text-accent hover:text-accent-2 font-medium underline underline-offset-4 decoration-accent/30 transition-colors">
              Create an account
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
          onChange={(e: any) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-surface border border-line-soft rounded-xl px-12 py-3.5 text-sm text-white outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/5 transition-all placeholder:text-muted/40"
        />
      </div>
    </div>
  );
}


