"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";

type Project = {
  id: string;
  name: string;
  description: string;
  environment: string;
  createdAt: any;
  selectedModels?: string[];
  stats?: {
    totalCalls: number;
    totalEnergyKwh: number;
    totalCo2Kg: number;
  };
};

const AVAILABLE_MODELS = [
  { id: "openai", name: "OpenAI (GPT-4, 3.5)", provider: "openai" },
  { id: "anthropic", name: "Anthropic (Claude 3.5)", provider: "anthropic" },
  { id: "google", name: "Google (Gemini 1.5)", provider: "google" }
];

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);

  // Form State
  const [newProjectName, setNewProjectName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newEnv, setNewEnv] = useState("development");
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [existingProviders, setExistingProviders] = useState<string[]>([]);
  const [newProviderKeys, setNewProviderKeys] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    let unsubscribeProjects: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setOrgId(user.uid);
        fetchExistingProviders(user.uid);
        
        const q = query(collection(db, "projects"), where("orgId", "==", user.uid));

        unsubscribeProjects = onSnapshot(q, (snapshot) => {
          const projectsData = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() })) as Project[];
            
          const activeProjects = projectsData
            .filter(p => (p as any).archived !== true)
            .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

          setProjects(activeProjects);
          setLoading(false);
        }, (err) => {
          console.error("Firestore projects fetch failed:", err);
          setLoading(false);
        });

      } else {
        router.push("/login");
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProjects) unsubscribeProjects();
    };
  }, [router]);

  async function fetchExistingProviders(uid: string) {
    try {
      const q = query(collection(db, "providerKeys"), where("orgId", "==", uid));
      const snap = await getDocs(q);
      const providers = snap.docs.map(d => d.data().provider);
      setExistingProviders(providers);
    } catch (err) {
      console.error("Failed to fetch legacy providers:", err);
    }
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId || !newProjectName) return;

    setIsCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          projectName: newProjectName,
          description: newDesc,
          environment: newEnv,
          selectedModels,
          newProviderKeys
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewProjectName("");
        setNewDesc("");
        setSelectedModels([]);
        setNewProviderKeys({});
        fetchExistingProviders(orgId); // Refresh provider list
      }
    } catch (err) {
      console.error("Create project failed:", err);
    } finally {
      setIsCreating(false);
    }
  }

  const toggleModel = (id: string) => {
    setSelectedModels(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="w-10 h-10 border-2 border-[#10b981]/20 border-t-[#10b981] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 lg:p-14 selection:bg-[#10b981]/30">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="flex flex-wrap items-end justify-between gap-6 border-b border-white/5 pb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#10b981] font-bold">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
              Project Management
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white">Your Projects</h1>
            <p className="text-sm text-zinc-500 max-w-xl font-medium">
              Manage multi-environment deployments and track their specific sustainability impact.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="rounded-2xl bg-[#10b981] px-6 py-3 text-sm font-bold text-black hover:bg-[#34d399] transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95"
          >
            Create New Project
          </button>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((project) => (
            <Link 
              key={project.id}
              href={`/projects/${project.id}`}
              className="group rounded-3xl border border-white/5 bg-[#0a0a0a] p-6 transition-all hover:border-[#10b981]/30 hover:bg-white/[0.02] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                    project.environment === 'production' 
                      ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20' 
                      : 'bg-zinc-800 text-zinc-400 border-white/5'
                  }`}>
                    {project.environment}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-zinc-800 group-hover:bg-[#10b981] transition-colors shadow-[0_0_8px_rgba(16,185,129,0)] group-hover:shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#10b981] transition-colors line-clamp-1">{project.name}</h3>
                <p className="text-[9px] font-mono text-zinc-600 mb-4 tracking-tighter">ID: {project.id}</p>
                <p className="text-xs text-zinc-500 mb-6 line-clamp-2 leading-relaxed">{project.description || "No description provided."}</p>
              </div>

              <div className="pt-6 border-t border-white/5 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-zinc-600">Calls</span>
                  <span className="text-white">{project.stats?.totalCalls.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-zinc-600">Energy</span>
                  <span className="text-white">{project.stats?.totalEnergyKwh || 0} kWh</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-zinc-600">CO2 Impact</span>
                  <span className="text-[#10b981]">{project.stats?.totalCo2Kg || 0} kg</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Create Project Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto pt-20">
            <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0a0a0a] p-8 shadow-2xl animate-in fade-in zoom-in duration-300 my-auto">
              <header className="mb-8">
                <h2 className="text-2xl font-bold text-white">New Tracking Project</h2>
                <p className="text-sm text-zinc-500 mt-1">Configure environment and AI providers.</p>
              </header>

              <form onSubmit={handleCreateProject} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 ml-1">Name</label>
                    <input
                      type="text" required value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="e.g. Production API"
                      className="w-full rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-white focus:border-[#10b981]/50 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 ml-1">Environment</label>
                    <select 
                      value={newEnv} onChange={(e) => setNewEnv(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-white focus:border-[#10b981]/50 outline-none transition-all appearance-none"
                    >
                      <option value="production">Production</option>
                      <option value="staging">Staging</option>
                      <option value="development">Development</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 ml-1">AI Models & Providers</label>
                  <div className="grid gap-2">
                    {AVAILABLE_MODELS.map(model => (
                      <div key={model.id} className="space-y-2">
                        <button
                          type="button"
                          onClick={() => toggleModel(model.id)}
                          className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                            selectedModels.includes(model.id)
                              ? "bg-[#10b981]/10 border-[#10b981]/30 text-white"
                              : "bg-white/[0.02] border-white/5 text-zinc-500 hover:border-white/10"
                          }`}
                        >
                          <span className="text-xs font-bold uppercase tracking-wider">{model.name}</span>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            selectedModels.includes(model.id) ? "border-[#10b981] bg-[#10b981]" : "border-zinc-700"
                          }`}>
                            {selectedModels.includes(model.id) && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                          </div>
                        </button>
                        
                        {/* Prompt for Key if missing */}
                        {selectedModels.includes(model.id) && !existingProviders.includes(model.provider) && (
                          <div className="px-4 py-3 bg-[#10b981]/5 border border-[#10b981]/20 rounded-xl space-y-2 animate-in slide-in-from-top-2">
                            <p className="text-[10px] text-[#10b981] font-bold uppercase">Missing {model.provider} API Key</p>
                            <input
                              type="password"
                              placeholder={`Enter your ${model.provider} API Key...`}
                              required
                              value={newProviderKeys[model.provider] || ""}
                              onChange={(e) => setNewProviderKeys(prev => ({ ...prev, [model.provider]: e.target.value }))}
                              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-700 focus:border-[#10b981]/50 outline-none"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button" onClick={() => setShowCreateModal(false)}
                    className="flex-1 rounded-2xl bg-white/5 px-6 py-4 text-sm font-bold text-white hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit" disabled={isCreating}
                    className="flex-1 rounded-2xl bg-[#10b981] px-6 py-4 text-sm font-bold text-black hover:bg-[#34d399] transition-all disabled:opacity-50"
                  >
                    {isCreating ? "Creating..." : "Launch Project"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
