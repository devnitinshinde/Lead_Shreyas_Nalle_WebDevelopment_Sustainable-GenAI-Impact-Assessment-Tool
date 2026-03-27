"use client";

import { 
  BookOpen, 
  Code, 
  Globe, 
  Key, 
  Layers, 
  ArrowRight, 
  Terminal, 
  Zap, 
  Shield, 
  Cpu,
  Copy,
  Check,
  Server,
  Fingerprint
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

export default function DocumentationPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const endpoints = [
    {
      provider: "OpenAI",
      model: "Chat Completions",
      method: "POST",
      endpoint: "/api/proxy/openai/v1/chat/completions",
      icon: Cpu,
    },
    {
      provider: "Anthropic",
      model: "Messages",
      method: "POST",
      endpoint: "/api/proxy/anthropic/v1/messages",
      icon: Shield,
    },
    {
      provider: "Google",
      model: "Gemini / Generate Content",
      method: "POST",
      endpoint: "/api/proxy/google/v1/generateContent",
      icon: Globe,
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12 pb-24 selection:bg-[#10b981]/30">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3 text-[#10b981] mb-2">
          <BookOpen className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-[0.3em]">Developer Guide</span>
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">EcoTrack Protocol <span className="text-[#10b981] italic tracking-tighter">v1.1</span></h1>
        <p className="text-white/60 max-w-2xl leading-relaxed">
          Integrate EcoTrack as a sustainability proxy for your AI-powered applications. 
          Measure energy consumption and carbon emissions with granular project-level tracking.
        </p>
      </motion.div>

      {/* How it Works */}
      <motion.section 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={item} className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4 hover:border-[#10b981]/30 transition-colors group">
          <div className="w-12 h-12 rounded-2xl bg-[#10b981]/10 flex items-center justify-center transition-transform group-hover:scale-110">
            <Layers className="w-6 h-6 text-[#10b981]" />
          </div>
          <h3 className="text-lg font-bold text-white uppercase tracking-tight">Proxy Mesh</h3>
          <p className="text-white/50 text-sm leading-relaxed">
            A transparent middleware layer that intercepts AI provider requests to extract real-time sustainabilty metadata.
          </p>
        </motion.div>

        <motion.div variants={item} className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4 hover:border-[#10b981]/30 transition-colors group">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center transition-transform group-hover:scale-110">
            <Zap className="w-6 h-6 text-sky-500" />
          </div>
          <h3 className="text-lg font-bold text-white uppercase tracking-tight">Live Telemetry</h3>
          <p className="text-white/50 text-sm leading-relaxed">
            Asynchronous processing of token counts and regional carbon intensity (gCO2/kWh) for zero-latency impact.
          </p>
        </motion.div>

        <motion.div variants={item} className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4 hover:border-[#10b981]/30 transition-colors group">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center transition-transform group-hover:scale-110">
            <Fingerprint className="w-6 h-6 text-purple-500" />
          </div>
          <h3 className="text-lg font-bold text-white uppercase tracking-tight">Project Scoping</h3>
          <p className="text-white/50 text-sm leading-relaxed">
            Granular attribution of AI usage to specific environments (Production, Staging) using Project ID headers.
          </p>
        </motion.div>
      </motion.section>

      {/* Endpoints */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3 border-l-2 border-[#10b981] pl-4">
          <Server className="w-5 h-5 text-[#10b981]" />
          <h2 className="text-xl font-bold text-white uppercase tracking-widest text-sm">Proxy API Registry</h2>
        </div>
        
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Provider</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Method</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Proxy Endpoint</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {endpoints.map((ep, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        <ep.icon className="w-4 h-4 text-white/60 group-hover:text-[#10b981] transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{ep.provider}</p>
                        <p className="text-[10px] text-white/40">{ep.model}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-[#10b981]/10 text-[#10b981] text-[10px] font-bold tracking-widest">
                      {ep.method}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-between gap-4 group/inner">
                      <code className="text-xs font-mono text-white/80">{ep.endpoint}</code>
                      <button 
                        onClick={() => copyToClipboard(ep.endpoint, ep.provider)}
                        className="opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-lg text-white/40"
                      >
                        {copied === ep.provider ? <Check className="w-3 h-3 text-[#10b981]" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* Integration */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="space-y-8"
      >
        <div className="flex items-center gap-3 border-l-2 border-[#10b981] pl-4">
          <Code className="w-5 h-5 text-[#10b981]" />
          <h2 className="text-xl font-bold text-white uppercase tracking-widest text-sm">Implementation Workflow</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-10">
            <div className="space-y-4">
              <h4 className="text-white font-bold flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-[#10b981]/20 text-[#10b981] flex items-center justify-center text-xs border border-[#10b981]/30">1</span>
                Update API Origin
              </h4>
              <p className="text-white/60 text-sm leading-relaxed pl-10">
                Replace your default AI provider base URL with the EcoTrack proxy URL. All SDKs (OpenAI, Anthropic, LangChain) support custom origins.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-white font-bold flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-[#10b981]/20 text-[#10b981] flex items-center justify-center text-xs border border-[#10b981]/30">2</span>
                Define Project Scope
              </h4>
              <p className="text-white/60 text-sm leading-relaxed pl-10">
                Include the <code className="text-[#10b981] font-bold">EcoTrack-Project-Id</code> header to route telemetry to specific project dashboards. Find IDs in the <Link href="/projects" className="text-white underline">Projects</Link> gallery.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-white font-bold flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-[#10b981]/20 text-[#10b981] flex items-center justify-center text-xs border border-[#10b981]/30">3</span>
                Self-Healing Keys
              </h4>
              <p className="text-white/60 text-sm leading-relaxed pl-10">
                If a provider key is missing, EcoTrack will automatically prompt you during project creation, ensuring encrypted storage via AES-256-GCM.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-white/40" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">node.js integration with scoping</span>
              </div>
            </div>
            <div className="bg-[#050505] p-8 rounded-[32px] border border-white/5 font-mono text-[11px] overflow-x-auto space-y-3 leading-relaxed shadow-2xl">
              <p><span className="text-zinc-600">// Sustainable AI Client</span></p>
              <p><span className="text-purple-400">const</span> <span className="text-white">openai</span> = <span className="text-purple-400">new</span> <span className="text-sky-400">OpenAI</span>({'{'} </p>
              <p className="pl-4">  <span className="text-zinc-300">baseURL</span>: <span className="text-emerald-400">"http://localhost:3001/api/proxy/openai/v1"</span>,</p>
              <p className="pl-4">  <span className="text-zinc-300">apiKey</span>: <span className="text-emerald-400">"eco-sk-..."</span>,</p>
              <p className="pl-4">  <span className="text-zinc-300">defaultHeaders</span>: {'{'} </p>
              <p className="pl-8">    <span className="text-emerald-400">"EcoTrack-Project-Id"</span>: <span className="text-emerald-400">"YOUR_PROJECT_ID"</span> </p>
              <p className="pl-4">  {'}'} </p>
              <p>{'}'});</p>
              <p className="mt-6"><span className="text-zinc-600">// Sustainability metrics logged automatically</span></p>
              <p><span className="text-purple-400">await</span> <span className="text-white">openai.chat.completions.</span><span className="text-sky-400">create</span>({'{'} </p>
              <p className="pl-4">  <span className="text-zinc-300">model</span>: <span className="text-emerald-400">"gpt-4o"</span>,</p>
              <p className="pl-4">  <span className="text-zinc-300">messages</span>: [ {'{'} <span className="text-zinc-300">role</span>: <span className="text-emerald-400">"user"</span>, <span className="text-zinc-300">content</span>: <span className="text-emerald-400">"..."</span> {'}'} ]</p>
              <p>{'}'});</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Footer CTA */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="p-12 rounded-[40px] bg-gradient-to-br from-[#10b981]/10 to-transparent border border-[#10b981]/20 flex flex-col items-center text-center space-y-6"
      >
        <div className="w-16 h-16 rounded-[24px] bg-[#10b981]/20 flex items-center justify-center">
          <RocketIcon className="w-8 h-8 text-[#10b981]" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">Ready for Production?</h2>
          <p className="text-white/50 max-w-sm text-sm">Create a production project to start gathering enterprise-grade sustainability metrics.</p>
        </div>
        <Link 
          href="/projects"
          className="flex items-center gap-3 bg-white text-zinc-950 font-bold px-10 py-4 rounded-2xl hover:bg-[#10b981] transition-all group overflow-hidden relative shadow-[0_0_30px_rgba(16,185,129,0.2)]"
        >
          <span className="relative z-10 flex items-center gap-2">
            Go to Projects
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
          <div className="absolute inset-0 bg-[#10b981] translate-y-full group-hover:translate-y-0 transition-transform duration-300 shadow-[0_0_30px_#10b981]" />
        </Link>
      </motion.div>
    </div>
  );
}

function RocketIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.71-2.13.09-3.05a3.91 3.91 0 0 0-3.18-.09Z" />
      <path d="m12 15-3-3m1.35-7.1h0a10.69 10.69 0 0 1 1.84 3.63 10.69 10.69 0 0 1 3.63 1.84h0" />
      <path d="M17 7c-2.83 2.83-5 7-5 7s4.17-2.17 7-5c.95-.95 1-2.46.11-3.39a2.4 2.4 0 0 0-3.39.11Z" />
      <path d="M19 13l-4 4" />
      <path d="M11 5l-4 4" />
    </svg>
  );
}
