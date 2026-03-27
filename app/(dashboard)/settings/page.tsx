"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Building2, 
  Leaf, 
  Code2, 
  Bell, 
  ShieldCheck, 
  Globe, 
  Zap,
  Save,
  ChevronRight,
  Camera,
  Mail,
  Lock
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { UserProfile } from "@/lib/auth";

type SettingSection = "profile" | "organization" | "sustainability" | "developer" | "notifications" | "security";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingSection>("profile");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  };

  const navItems = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "organization", label: "Organization", icon: Building2 },
    { id: "sustainability", label: "Sustainability", icon: Leaf },
    { id: "developer", label: "Developer API", icon: Code2 },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: ShieldCheck },
  ];

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center bg-transparent">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#10b981]/20 border-t-[#10b981]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-8 lg:px-12 selection:bg-[#10b981]/30">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#10b981]">
            <Globe className="h-3 w-3" />
            Global Workspace
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Settings & Preferences</h1>
          <p className="text-sm text-zinc-500">Manage your account, organization metrics, and developer integration defaults.</p>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Sidebar Nav */}
          <aside className="lg:col-span-3">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as SettingSection)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    activeSection === item.id
                      ? "bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20"
                      : "text-zinc-500 hover:bg-white/5 hover:text-white border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </div>
                  {activeSection === item.id && <ChevronRight className="h-3 w-3" />}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-[32px] border border-white/5 bg-[#0a0a0a]/60 p-6 backdrop-blur-xl sm:p-10"
            >
              <AnimatePresence mode="wait">
                {activeSection === "profile" && <ProfileSection profile={userProfile} />}
                {activeSection === "organization" && <OrganizationSection profile={userProfile} />}
                {activeSection === "sustainability" && <SustainabilitySection />}
                {activeSection === "developer" && <DeveloperSection />}
                {activeSection === "notifications" && <NotificationSection />}
                {activeSection === "security" && <SecuritySection />}
              </AnimatePresence>

              {/* Action Footer */}
              <div className="mt-12 flex items-center justify-end gap-4 border-t border-white/5 pt-8">
                <button className="text-sm font-semibold text-zinc-500 hover:text-white transition-colors">Discard changes</button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-black transition-all hover:bg-[#10b981] disabled:opacity-50"
                >
                  {saving ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}

function ProfileSection({ profile }: { profile: UserProfile | null }) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-bold text-white tracking-tight">Personal Information</h3>
        <p className="text-sm text-zinc-500">Update your photo and personal details.</p>
      </div>

      <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
        <div className="relative group">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#10b981] to-[#3b82f6] flex items-center justify-center text-3xl font-bold text-black border-4 border-white/5 overflow-hidden">
            {profile?.fullName?.substring(0, 2).toUpperCase() ?? "OG"}
          </div>
          <button className="absolute bottom-0 right-0 rounded-full bg-zinc-900 p-2 text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0 shadow-lg">
            <Camera className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Full Name</label>
            <input 
              type="text" 
              defaultValue={profile?.fullName ?? ""} 
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-[#10b981] focus:outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                defaultValue={profile?.email ?? ""} 
                disabled 
                className="w-full rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 pl-10 text-sm text-zinc-400 focus:outline-none cursor-not-allowed"
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrganizationSection({ profile }: { profile: UserProfile | null }) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-bold text-white tracking-tight">Organization Profile</h3>
        <p className="text-sm text-zinc-500">Configure your company identity and billing workspace.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Organization Name</label>
          <input 
            type="text" 
            defaultValue={profile?.organizationName ?? "Internal Tech"} 
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-[#10b981] focus:outline-none transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Current Plan</label>
          <div className="flex items-center justify-between rounded-xl border border-[#10b981]/20 bg-[#10b981]/5 px-4 py-3 transition-all">
            <span className="text-sm font-bold text-[#10b981]">Enterprise Pro</span>
            <button className="text-[10px] font-bold uppercase tracking-widest text-white underline underline-offset-4">Upgrade</button>
          </div>
        </div>
        <div className="col-span-full space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Organization Bio/Description</label>
          <textarea 
            rows={3}
            placeholder="Describe your organization's sustainability goals..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-[#10b981] focus:outline-none transition-all resize-none"
          />
        </div>
      </div>
    </div>
  );
}

function SustainabilitySection() {
  const regions = [
    { name: "Global / Default", value: "global" },
    { name: "US East (Ohio)", value: "us-east-2" },
    { name: "US West (Oregon)", value: "us-west-2" },
    { name: "Europe (Ireland)", value: "eu-west-1" },
    { name: "Asia Pacific (Mumbai)", value: "ap-south-1" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-bold text-white tracking-tight">Carbon Intensity & Metrics</h3>
        <p className="text-sm text-zinc-500">Configure how energy consumption is converted to CO2 equivalents.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-4">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Primary Data Center Region</label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {regions.map((region) => (
              <button
                key={region.value}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-xs font-semibold transition-all ${
                  region.value === "global"
                    ? "border-[#10b981] bg-[#10b981]/10 text-white"
                    : "border-white/5 bg-white/[0.02] text-zinc-500 hover:border-white/20 hover:text-zinc-300"
                }`}
              >
                <Globe className={`h-3 w-3 ${region.value === "global" ? "text-[#10b981]" : ""}`} />
                {region.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-white/[0.02] border border-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#3b82f6]/10 p-2">
              <Zap className="h-4 w-4 text-[#3b82f6]" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Preferred Energy Unit</p>
              <p className="text-[10px] text-zinc-500">Switch between Watts and Kilowatts for dashboard display.</p>
            </div>
          </div>
          <select className="bg-zinc-900 text-xs font-bold text-white border border-white/10 rounded-lg px-3 py-2 focus:outline-none">
            <option>Wh (Watts-hour)</option>
            <option>kWh (Kilowatts-hour)</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function DeveloperSection() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-bold text-white tracking-tight">Developer API Configuration</h3>
        <p className="text-sm text-zinc-500">Manage proxy endpoints and global webhook integrations.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Static Proxy Endpoint</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-xl border border-white/5 bg-[#050505] px-4 py-3 text-xs text-emerald-400 font-mono">
              https://api.ecotrack.ai/v1/proxy
            </code>
            <button className="rounded-xl bg-white/5 p-3 text-zinc-400 hover:text-white transition-colors border border-white/10">
              Copy
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Global Webhook URL</label>
            <span className="text-[8px] font-bold text-[#10b981] uppercase px-1.5 py-0.5 rounded bg-[#10b981]/10 border border-[#10b981]/20">Active</span>
          </div>
          <input 
            type="url" 
            placeholder="https://your-api.com/webhooks/ecotrack"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-[#10b981] focus:outline-none transition-all"
          />
          <p className="text-[10px] text-zinc-600">We'll send POST requests with sustainability telemetry for every proxy call.</p>
        </div>
      </div>
    </div>
  );
}

function NotificationSection() {
  const toggles = [
    { title: "Weekly Impact Report", desc: "Receive a summary of carbon savings and energy trends." },
    { title: "Quota Usage Alerts", desc: "Get notified when project usage reaches 80% or 100%." },
    { title: "Critical Error Alerts", desc: "Instant notifications for proxy fails or invalid provider keys." },
    { title: "Sustainability Recommendations", desc: "AI-driven tips for reducing model footprint." },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-bold text-white tracking-tight">Email & Notifications</h3>
        <p className="text-sm text-zinc-500">Stay informed about your AI sustainability impact.</p>
      </div>

      <div className="space-y-4">
        {toggles.map((t, i) => (
          <div key={i} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.01] transition-colors px-2 rounded-xl">
            <div className="space-y-1">
              <p className="text-sm font-bold text-white">{t.title}</p>
              <p className="text-xs text-zinc-500">{t.desc}</p>
            </div>
            <div className="h-6 w-11 rounded-full bg-[#10b981] p-1 shadow-sm">
              <div className="h-4 w-4 rounded-full bg-white translate-x-5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecuritySection() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-bold text-white tracking-tight">Security & Authentication</h3>
        <p className="text-sm text-zinc-500">Keep your account secure with robust access controls.</p>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Lock className="h-4 w-4 text-zinc-500" />
            <span className="text-sm font-bold text-white">Password Management</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input 
              type="password" 
              placeholder="Current Password" 
              className="w-full rounded-xl border border-white/10 bg-zinc-950/50 px-4 py-3 text-sm focus:border-[#10b981] focus:outline-none"
            />
            <input 
              type="password" 
              placeholder="New Password" 
              className="w-full rounded-xl border border-white/10 bg-zinc-950/50 px-4 py-3 text-sm focus:border-[#10b981] focus:outline-none"
            />
          </div>
          <button className="text-xs font-bold text-[#10b981] uppercase tracking-widest hover:underline">Reset Password via Email</button>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div className="space-y-1">
            <p className="text-sm font-bold text-white">Two-Factor Authentication (2FA)</p>
            <p className="text-xs text-zinc-500">Add an extra layer of security to your account.</p>
          </div>
          <button className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/10 transition-all">
            Enable
          </button>
        </div>
      </div>
    </div>
  );
}
