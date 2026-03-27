"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  Key, 
  Plus, 
  Check, 
  Copy, 
  Loader2, 
  ArrowRight, 
  ArrowLeft, 
  Server, 
  Globe, 
  Shield, 
  Zap,
  Cpu,
  Terminal,
  Monitor,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { setSession, UserProfile, clearSession } from "@/lib/auth";

// Extend UserProfile locally for onboarding specific fields
interface OnboardingUserProfile extends UserProfile {
  region?: string;
}

const providers = [
  { id: "openai", label: "OpenAI", icon: Cpu, placeholder: "sk-..." },
  { id: "anthropic", label: "Anthropic", icon: Shield, placeholder: "sk-ant-..." },
  { id: "google", label: "Google / Gemini", icon: Globe, placeholder: "AIza..." },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userProfile, setUserProfile] = useState<OnboardingUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Provider Keys
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [providerKey, setProviderKey] = useState("");
  const [providerNickname, setProviderNickname] = useState("Production Key");

  // Step 2: EcoTrack Key
  const [ecoTrackKey, setEcoTrackKey] = useState("");
  const [copied, setCopied] = useState(false);

  // Step 3: Project Details
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [environment, setEnvironment] = useState("Production");
  const [projectScopedKey, setProjectScopedKey] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as OnboardingUserProfile);
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleNext = () => setStep((s) => Math.min(s + 1, 4));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const saveProviderKey = async () => {
    if (!providerKey || !userProfile) return;
    setSubmitting(true);
    setError(null);
    try {
      const testRes = await fetch("/api/keys/provider/test", {
        method: "POST",
        body: JSON.stringify({ provider: selectedProvider, apiKey: providerKey })
      });
      if (!testRes.ok) {
        const data = await testRes.json();
        throw new Error(data.error || "Key verification failed");
      }

      const saveRes = await fetch("/api/keys/provider", {
        method: "POST",
        body: JSON.stringify({ 
          provider: selectedProvider, 
          apiKey: providerKey, 
          nickname: providerNickname,
          orgId: userProfile.uid 
        })
      });
      if (!saveRes.ok) throw new Error("Failed to save provider key");

      handleNext();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const generateGlobalKey = async () => {
    if (!userProfile) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/keys/eco/generate", {
        method: "POST",
        body: JSON.stringify({ orgId: userProfile.uid, name: "Global Main Key" })
      });
      const data = await res.json();
      if (data.fullKey) {
        setEcoTrackKey(data.fullKey);
      }
    } catch (err) {
      setError("Failed to generate key");
    } finally {
      setSubmitting(false);
    }
  };

  const createProject = async () => {
    if (!projectName || !userProfile) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        body: JSON.stringify({ 
          orgId: userProfile.uid, 
          projectName, 
          description: projectDesc, 
          environment 
        })
      });
      const data = await res.json();
      if (data.fullKey) {
        setProjectScopedKey(data.fullKey);
        handleNext();
      }
    } catch (err) {
      setError("Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  const finishOnboarding = async () => {
    if (!userProfile) return;
    setSubmitting(true);
    try {
      await updateDoc(doc(db, "users", userProfile.uid), {
        onboarded: true
      });
      setSession(true);
      router.push("/dashboard");
    } catch (err) {
      setError("Failed to complete setup");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-accent animate-spin" />
          <p className="text-sm font-medium text-white/60 animate-pulse tracking-widest uppercase">Initializing Wizard...</p>
        </div>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#050505] selection:bg-accent/30 selection:text-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-brand-blue/20 blur-[100px]" />
      </div>

      <div className="w-full max-w-4xl relative z-10">
        <div className="mb-12 flex items-center justify-between px-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all duration-500
                ${step === i ? "bg-accent text-zinc-950 scale-110 shadow-[0_0_20px_rgba(16,185,129,0.4)]" : 
                  step > i ? "bg-white/10 text-accent" : "bg-white/5 text-white/30 border border-white/5"}
              `}>
                {step > i ? <Check className="w-5 h-5" /> : i}
              </div>
              {i < 4 && <div className={`w-12 h-[2px] rounded-full hidden sm:block ${step > i ? "bg-accent/40" : "bg-white/5"}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="premium-card p-8 sm:p-12 rounded-[32px] glass-accent relative overflow-hidden"
          >
            <div className="mb-10 text-center sm:text-left">
              <p className="text-accent text-[10px] font-bold uppercase tracking-[0.3em] mb-3">Step 0{step}</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                {step === 1 && "Connect AI Provider"}
                {step === 2 && "Global Access Token"}
                {step === 3 && "Create First Project"}
                {step === 4 && "Verify Integration"}
              </h2>
              <p className="text-white/60 text-sm sm:text-base max-w-xl leading-relaxed">
                {step === 1 && "Link your existing AI provider keys. We encrypt these using AES-256-GCM before storage."}
                {step === 2 && "This is your master key for EcoTrack. it's only shown once — keep it very secure."}
                {step === 3 && "Projects allow you to organize your API metrics by application, environment, or tier."}
                {step === 4 && "Finalize setup by verifying your proxy connection. You can start tracking immediately after."}
              </p>
            </div>

            <div className="min-h-[300px]">
              {step === 1 && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {providers.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedProvider(p.id)}
                        className={`
                          p-6 rounded-2xl flex flex-col items-center gap-4 transition-all
                          ${selectedProvider === p.id ? "bg-accent/10 border-accent/40 shadow-[0_0_25px_rgba(16,185,129,0.1)]" : "bg-white/5 border-white/5 hover:bg-white/10"}
                          border
                        `}
                      >
                        <p.icon className={`w-8 h-8 ${selectedProvider === p.id ? "text-accent" : "text-white/40"}`} />
                        <span className={`text-sm font-semibold ${selectedProvider === p.id ? "text-white" : "text-white/60"}`}>{p.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 ml-1">Provider API Key</label>
                      <div className="relative group">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-accent transition-colors" />
                        <input
                          type="password"
                          value={providerKey}
                          onChange={(e) => setProviderKey(e.target.value)}
                          placeholder={providers.find(p => p.id === selectedProvider)?.placeholder}
                          className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-12 py-4 text-sm text-white outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 ml-1">Key Nickname</label>
                      <input
                        type="text"
                        value={providerNickname}
                        onChange={(e) => setProviderNickname(e.target.value)}
                        placeholder="e.g. Production Main"
                        className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-5 py-4 text-sm text-white outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col items-center justify-center text-center space-y-8 py-10">
                  {!ecoTrackKey ? (
                    <div className="space-y-6 flex flex-col items-center">
                      <div className="w-20 h-20 rounded-[24px] bg-accent/10 border border-accent/20 flex items-center justify-center">
                        <Zap className="w-10 h-10 text-accent animate-pulse" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-bold text-white">Generate Master Key</h4>
                        <p className="text-white/50 text-sm max-w-xs leading-relaxed">Click below to create your organization's unique global access token.</p>
                      </div>
                      <button
                        onClick={generateGlobalKey}
                        disabled={submitting}
                        className="flex items-center gap-3 bg-white text-zinc-950 font-bold px-8 py-4 rounded-xl hover:bg-accent hover:text-zinc-950 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] active:scale-95"
                      >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        Generate Now
                      </button>
                    </div>
                  ) : (
                    <div className="w-full max-w-xl space-y-8 animate-in fade-in zoom-in duration-500">
                      <div className="p-1 rounded-2xl bg-gradient-to-r from-accent/40 via-brand-blue/40 to-brand-purple/40">
                        <div className="bg-zinc-950 rounded-2xl p-6 flex items-center justify-between gap-4 border border-white/5">
                          <code className="text-accent font-mono text-sm sm:text-base break-all">{ecoTrackKey}</code>
                          <button
                            onClick={() => copyToClipboard(ecoTrackKey)}
                            className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-accent transition-all flex-shrink-0"
                          >
                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 p-5 rounded-2xl bg-brand-amber/5 border border-brand-amber/20 text-brand-amber text-xs leading-relaxed text-left">
                        <Shield className="w-6 h-6 flex-shrink-0 mt-0.5" />
                        <p>IMPORTANT: We generate this key once and then hash it. We cannot recover it if lost. Please copy it to a secure password manager now.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 ml-1">Project Name</label>
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="e.g. Mobile App API"
                        className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-5 py-4 text-sm text-white outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 ml-1">Environment</label>
                      <select
                        value={environment}
                        onChange={(e) => setEnvironment(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-5 py-4 text-sm text-white outline-none focus:border-accent/40 transition-all appearance-none cursor-pointer"
                      >
                        <option value="Production">Production</option>
                        <option value="Staging">Staging</option>
                        <option value="Development">Development</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 ml-1">Description (Optional)</label>
                    <textarea
                      value={projectDesc}
                      onChange={(e) => setProjectDesc(e.target.value)}
                      placeholder="What metrics will this project track?"
                      className="w-full h-32 bg-zinc-900/50 border border-white/5 rounded-xl px-5 py-4 text-sm text-white outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all resize-none"
                    />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Terminal className="w-5 h-5 text-accent" />
                        <span className="text-sm font-bold text-white tracking-tight">Configuration Snippet</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-error/40" />
                        <div className="w-3 h-3 rounded-full bg-brand-amber/40" />
                        <div className="w-3 h-3 rounded-full bg-accent/40" />
                      </div>
                    </div>
                    <div className="bg-black/40 rounded-xl p-5 font-mono text-[11px] sm:text-xs text-white/70 leading-relaxed overflow-x-auto">
                      <p className="text-accent underline underline-offset-4 mb-3 uppercase font-bold tracking-widest">Setup Instructions</p>
                      <p className="mb-2"><span className="text-brand-purple">ECO_BASE_URL</span> = <span className="text-brand-blue">"http://localhost:3000/api/proxy"</span></p>
                      <p><span className="text-brand-purple">ECO_API_KEY</span> = <span className="text-white">"{projectScopedKey || ecoTrackKey || "YOUR_KEY"}"</span></p>
                      <div className="mt-6 p-4 rounded-lg bg-accent/5 border border-accent/10 flex items-center gap-3 text-accent text-[10px]">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>POLLING LIVE TELEMETRY FEED...</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Endpoint Status</p>
                        <p className="text-sm font-bold text-white">Active (v1.0)</p>
                      </div>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-brand-blue" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Region</p>
                        <p className="text-sm font-bold text-white">{userProfile?.region || "Global"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-xs flex items-center gap-3"
              >
                <Shield className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/5 pt-8">
              <div className="flex items-center gap-2 order-2 sm:order-1">
                {step > 1 && (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-white/40 hover:text-white text-sm font-semibold pr-6 border-r border-white/10"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </button>
                )}
                <button
                  onClick={async () => {
                    await auth.signOut();
                    clearSession();
                    router.push("/login");
                  }}
                  className="text-white/30 hover:text-error text-[10px] font-bold uppercase tracking-widest pl-6"
                >
                  Exit setup
                </button>
              </div>

              <div className="order-1 sm:order-2 w-full sm:w-auto">
                {step === 1 && (
                  <button
                    disabled={submitting || !providerKey}
                    onClick={saveProviderKey}
                    className="w-full sm:w-auto bg-white text-zinc-950 px-10 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-accent transition-all disabled:opacity-50 disabled:grayscale"
                  >
                    {submitting ? "Verifying..." : "Test and Continue"}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
                {step === 2 && (
                  <button
                    disabled={!ecoTrackKey}
                    onClick={handleNext}
                    className="w-full sm:w-auto bg-white text-zinc-950 px-10 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-accent transition-all disabled:opacity-50"
                  >
                    Continue to Projects
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
                {step === 3 && (
                  <button
                    disabled={submitting || !projectName}
                    onClick={createProject}
                    className="w-full sm:w-auto bg-white text-zinc-950 px-10 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-accent transition-all disabled:opacity-50"
                  >
                    {submitting ? "Creating..." : "Config Project"}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
                {step === 4 && (
                  <button
                    disabled={submitting}
                    onClick={finishOnboarding}
                    className="w-full sm:w-auto bg-accent text-zinc-950 px-10 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-accent-2 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                  >
                    {submitting ? "Finishing..." : "Enter Dashboard"}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-center gap-3 opacity-30">
          <Zap className="w-4 h-4 text-accent fill-accent" />
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white">EcoTrack Protocol v1.0</span>
        </div>
      </div>
    </div>
  );
}
