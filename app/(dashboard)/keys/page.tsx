"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Plus, Key, Shield, Trash2, Copy, Check, Info, AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type EcoKey = {
  id: string;
  name: string;
  keyPrefix: string;
  projectId: string | null;
  revoked: boolean;
  createdAt: any;
  lastUsedAt: any;
};

type ProviderKey = {
  id: string;
  provider: "openai" | "anthropic" | "google";
  nickname: string;
  createdAt: any;
};

export default function KeysPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"eco" | "provider">("eco");
  const [ecoKeys, setEcoKeys] = useState<EcoKey[]>([]);
  const [providerKeys, setProviderKeys] = useState<ProviderKey[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isEcoModalOpen, setIsEcoModalOpen] = useState(false);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [newEcoKey, setNewEcoKey] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState("");
  
  // Provider Form
  const [providerForm, setProviderForm] = useState({
    provider: "openai",
    apiKey: "",
    nickname: ""
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchData(user.uid);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  async function fetchData(uid: string) {
    setLoading(true);
    try {
      const [ecoRes, provRes] = await Promise.all([
        fetch(`/api/keys/eco?orgId=${uid}`),
        fetch(`/api/keys/provider?orgId=${uid}`)
      ]);
      
      if (ecoRes.ok) setEcoKeys(await ecoRes.json());
      if (provRes.ok) setProviderKeys(await provRes.json());
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleGenerateEcoKey = async () => {
    if (!newKeyName.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/keys/eco/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId: user.uid, name: newKeyName })
      });
      const data = await res.json();
      if (res.ok) {
        setNewEcoKey(data.fullKey);
        setNewKeyName("");
        fetchData(user.uid);
        showToast("EcoTrack key generated successfully");
      } else {
        showToast(data.error || "Failed to generate key", "error");
      }
    } catch (err) {
      showToast("An error occurred", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeEcoKey = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this key? It will immediately stop working.")) return;
    try {
      const res = await fetch(`/api/keys/eco/${id}`, { method: "DELETE" });
      if (res.ok) {
        setEcoKeys(ecoKeys.map(k => k.id === id ? { ...k, revoked: true } : k));
        showToast("Key revoked successfully");
      }
    } catch (err) {
      showToast("Failed to revoke key", "error");
    }
  };

  const handleAddProviderKey = async () => {
    if (!providerForm.apiKey || !providerForm.nickname) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/keys/provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...providerForm, orgId: user.uid })
      });
      if (res.ok) {
        setIsProviderModalOpen(false);
        setProviderForm({ provider: "openai", apiKey: "", nickname: "" });
        fetchData(user.uid);
        showToast("Provider key added successfully");
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to add provider key", "error");
      }
    } catch (err) {
      showToast("An error occurred", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProviderKey = async (id: string) => {
    if (!confirm("Remove this provider key? This will break any EcoTrack keys that depend on it.")) return;
    try {
      const res = await fetch(`/api/keys/provider/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProviderKeys(providerKeys.filter(k => k.id !== id));
        showToast("Provider key removed");
      }
    } catch (err) {
      showToast("Failed to remove key", "error");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard");
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <RefreshCw className="w-8 h-8 text-[#10b981] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 selection:bg-[#10b981]/30 pb-20">
      <div className="max-w-6xl mx-auto px-6 pt-12 space-y-10">
        
        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#10b981] font-bold">
            <Shield className="w-3 h-3" />
            Security & Authentication
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold text-white tracking-tight">API Management</h1>
              <p className="text-zinc-500 text-sm max-w-xl">
                Manage your EcoTrack proxy keys and connect AI provider credentials to enable sustainability tracking.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => activeTab === "eco" ? setIsEcoModalOpen(true) : setIsProviderModalOpen(true)}
                className="flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-black font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-xl transition-all shadow-[0_4px_20px_rgba(16,185,129,0.2)] active:scale-95"
              >
                <Plus className="w-4 h-4" />
                {activeTab === "eco" ? "New Proxy Key" : "Add Provider"}
              </button>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-2xl border border-white/5 w-fit">
          <TabButton 
            active={activeTab === "eco"} 
            onClick={() => setActiveTab("eco")}
            icon={<Key className="w-4 h-4" />}
            label="EcoTrack Keys"
          />
          <TabButton 
            active={activeTab === "provider"} 
            onClick={() => setActiveTab("provider")}
            icon={<Shield className="w-4 h-4" />}
            label="Provider Credentials"
          />
        </div>

        {/* Content Area */}
        <div className="grid gap-8">
          
          <AnimatePresence mode="wait">
            {activeTab === "eco" ? (
              <motion.section 
                key="eco"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* One-time Key Display */}
                {newEcoKey && (
                  <div className="bg-[#10b981]/10 border border-[#10b981]/30 rounded-3xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                      <AlertTriangle className="w-20 h-20 text-[#10b981]" />
                    </div>
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#10b981]">
                        <Info className="w-4 h-4" />
                        COPY THIS KEY NOW
                      </div>
                      <h3 className="text-white font-bold">New EcoTrack API Key Generated</h3>
                      <p className="text-zinc-400 text-xs">For your security, we only show this full key once. Store it safely.</p>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <div className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-[#10b981] break-all">
                          {newEcoKey}
                        </div>
                        <button 
                          onClick={() => copyToClipboard(newEcoKey)}
                          className="flex items-center justify-center gap-2 bg-white text-black font-bold text-xs uppercase px-6 py-3 rounded-xl hover:bg-zinc-200 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                          Copy Key
                        </button>
                        <button 
                          onClick={() => setNewEcoKey(null)}
                          className="px-4 py-3 text-xs font-bold text-zinc-500 hover:text-white transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="overflow-hidden rounded-3xl border border-white/5 bg-[#0a0a0a]/50 backdrop-blur-xl">
                  <table className="min-w-full text-left text-xs">
                    <thead>
                      <tr className="bg-white/[0.02] border-b border-white/5">
                        <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-widest text-[9px]">Name/Label</th>
                        <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-widest text-[9px]">Key Prefix</th>
                        <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-widest text-[9px]">Environment</th>
                        <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-widest text-[9px]">Status</th>
                        <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-widest text-[9px]">Created</th>
                        <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-widest text-[9px]">Last Used</th>
                        <th className="px-6 py-4 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                      {ecoKeys.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-zinc-600 font-medium">
                            No EcoTrack keys found. Generate one to start tracking.
                          </td>
                        </tr>
                      ) : (
                        ecoKeys.map((key) => (
                          <tr key={key.id} className="hover:bg-white/[0.01] transition-colors group">
                            <td className="px-6 py-4 text-white font-semibold">{key.name}</td>
                            <td className="px-6 py-4 font-mono text-zinc-500">{key.keyPrefix}...</td>
                            <td className="px-6 py-4">
                              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                                {key.projectId ? "Project Scoped" : "Global"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={cn(
                                "px-2 py-0.5 rounded text-[9px] font-bold uppercase",
                                key.revoked ? "bg-red-500/10 text-red-500" : "bg-[#10b981]/10 text-[#10b981]"
                              )}>
                                {key.revoked ? "Revoked" : "Active"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-zinc-500">
                              {key.createdAt?.seconds ? new Date(key.createdAt.seconds * 1000).toLocaleDateString() : "—"}
                            </td>
                            <td className="px-6 py-4 text-zinc-500">
                              {key.lastUsedAt?.seconds ? new Date(key.lastUsedAt.seconds * 1000).toLocaleDateString() : "Never"}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {!key.revoked && (
                                <button 
                                  onClick={() => handleRevokeEcoKey(key.id)}
                                  className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                                  title="Revoke Key"
                                >
                                  <AlertTriangle className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.section>
            ) : (
              <motion.section 
                key="provider"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {providerKeys.length === 0 ? (
                    <div className="col-span-full border border-dashed border-white/10 rounded-3xl p-12 text-center space-y-4">
                      <div className="mx-auto w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center text-zinc-600">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-white font-bold">No providers connected</p>
                        <p className="text-zinc-500 text-xs">Add your AI provider API keys to relay requests through EcoTrack.</p>
                      </div>
                    </div>
                  ) : (
                    providerKeys.map((key) => (
                      <div key={key.id} className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 hover:border-[#10b981]/30 transition-all group">
                        <div className="flex items-start justify-between mb-6">
                          <ProviderBadge provider={key.provider} />
                          <button 
                            onClick={() => handleDeleteProviderKey(key.id)}
                            className="p-2 text-zinc-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-white font-bold">{key.nickname}</h4>
                          <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">
                            Added on {key.createdAt?.seconds ? new Date(key.createdAt.seconds * 1000).toLocaleDateString() : "—"}
                          </p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                          <Check className="w-3 h-3 text-[#10b981]" />
                          Connected & Encrypted
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* Eco Modal */}
      <Modal isOpen={isEcoModalOpen} onClose={() => setIsEcoModalOpen(false)} title="Generate EcoTrack Key">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Key Name / Label</label>
            <input 
              type="text"
              placeholder="e.g. Production Main / Mobile App"
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#10b981]/50 transition-colors"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
            />
            <p className="text-[10px] text-zinc-600 leading-relaxed font-medium"> This label helps you identify this key later. We recommend naming it after the specific service or project using it.</p>
          </div>
          <button 
            onClick={handleGenerateEcoKey}
            disabled={submitting || !newKeyName}
            className="w-full bg-[#10b981] disabled:opacity-50 text-black font-bold uppercase text-xs py-4 rounded-xl shadow-[0_4px_20px_rgba(16,185,129,0.2)]"
          >
            {submitting ? "Generating..." : "Generate Key"}
          </button>
        </div>
      </Modal>

      {/* Provider Modal */}
      <Modal isOpen={isProviderModalOpen} onClose={() => setIsProviderModalOpen(false)} title="Connect AI Provider">
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">AI Provider</label>
            <select 
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#10b981]/50 transition-colors appearance-none"
              value={providerForm.provider}
              onChange={(e: any) => setProviderForm({ ...providerForm, provider: e.target.value })}
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="google">Google Gemini</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">API Key (Encrypted)</label>
            <input 
              type="password"
              placeholder="sk-..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#10b981]/50 transition-colors"
              value={providerForm.apiKey}
              onChange={(e) => setProviderForm({ ...providerForm, apiKey: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nickname</label>
            <input 
              type="text"
              placeholder="e.g. My Pro Account"
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#10b981]/50 transition-colors"
              value={providerForm.nickname}
              onChange={(e) => setProviderForm({ ...providerForm, nickname: e.target.value })}
            />
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex gap-3">
             <Shield className="w-4 h-4 text-[#10b981] flex-shrink-0" />
             <p className="text-[10px] text-zinc-500 leading-normal font-medium">Your provider keys are encrypted using AES-256-GCM. We never store them in plaintext, and they are only decrypted in-memory during proxy requests.</p>
          </div>
          <button 
            onClick={handleAddProviderKey}
            disabled={submitting || !providerForm.apiKey || !providerForm.nickname}
            className="w-full bg-white disabled:opacity-50 text-black font-bold uppercase text-xs py-4 rounded-xl mt-2"
          >
            {submitting ? "Encrypting..." : "Connect Provider"}
          </button>
        </div>
      </Modal>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={cn(
              "fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest shadow-2xl z-50 flex items-center gap-2",
              toast.type === "success" ? "bg-[#10b981] text-black" : "bg-red-500 text-white"
            )}
          >
            {toast.type === "success" ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
        active ? "bg-[#10b981]/10 text-[#10b981]" : "text-zinc-500 hover:text-white"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function ProviderBadge({ provider }: { provider: string }) {
  const styles: any = {
    openai: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    anthropic: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    google: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };
  return (
    <span className={cn(
      "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border",
      styles[provider] || "bg-zinc-800 text-zinc-400 border-white/5"
    )}>
      {provider}
    </span>
  );
}

function Modal({ isOpen, onClose, title, children }: any) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
