"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Key, Shield, HardDrive, Box, Sparkles, AlertCircle, Copy, Cpu, LayoutGrid, Leaf, ChevronDown, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, title: "AI Provider Setup", subtitle: "Connect your LLM" },
  { id: 2, title: "EcoTrack API", subtitle: "Generate your access key" },
  { id: 3, title: "Create Project", subtitle: "Setup your first workspace" },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () => {
    alert("Onboarding complete! Welcome to EcoTrack.");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Background elegant decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-primary/10 blur-[100px] rounded-full" />
      </div>

      <div className="w-full max-w-4xl grid md:grid-cols-[280px_1fr] gap-8 relative z-10">
        
        {/* Left Sidebar - Progress */}
        <div className="hidden md:flex flex-col gap-8 glass rounded-3xl p-8 border border-border/50 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full" />
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(var(--foreground),0.1)]">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">EcoTrack</span>
          </div>

          <div className="flex flex-col gap-6 mt-8">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500",
                    currentStep > step.id ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(0,0,0,0.1)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)]" : 
                    currentStep === step.id ? "bg-foreground text-background ring-4 ring-primary/20" : 
                    "bg-muted text-muted-foreground border border-border bg-black/5 dark:bg-white/5"
                  )}>
                    {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  {idx !== steps.length - 1 && (
                    <div className={cn(
                      "w-px h-10 mt-2 transition-colors duration-500",
                      currentStep > step.id ? "bg-primary/50" : "bg-border"
                    )} />
                  )}
                </div>
                <div className="pt-1 flex flex-col">
                  <span className={cn(
                    "text-sm font-semibold transition-colors duration-300",
                    currentStep === step.id ? "text-foreground" : "text-muted-foreground"
                  )}>{step.title}</span>
                  <span className="text-xs text-muted-foreground/70">{step.subtitle}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex flex-col min-h-[500px] glass rounded-3xl p-6 sm:p-10 border border-border/50 shadow-2xl shadow-black/5 dark:shadow-white/5 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col"
            >
              {currentStep === 1 && <Step1AIProvider />}
              {currentStep === 2 && <Step2EcoTrackAPI />}
              {currentStep === 3 && <Step3ProjectSetup />}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
            <button
              onClick={prevStep}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-medium transition-all",
                currentStep === 1 ? "opacity-0 pointer-events-none" : "hover:bg-foreground/5 text-foreground"
              )}
            >
              Back
            </button>
            <button
              onClick={currentStep === steps.length ? goToNextPage : nextStep}
              className="px-8 py-2.5 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-all flex items-center gap-2 shadow-lg shadow-black/5 dark:shadow-white/5 active:scale-95"
            >
              {currentStep === steps.length ? "Complete Setup" : "Continue"}
              {currentStep !== steps.length && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step1AIProvider() {
  const [provider, setProvider] = useState<string>("openai");
  const [otherProvider, setOtherProvider] = useState<string>("mistral");
  const [model, setModel] = useState<string>("gpt-4o");

  const modelsByProvider: Record<string, {id: string, name: string}[]> = {
    openai: [
      {id: "gpt-4o", name: "GPT-4o"}, 
      {id: "gpt-4-turbo", name: "GPT-4 Turbo"}, 
      {id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo"}
    ],
    anthropic: [
      {id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet"}, 
      {id: "claude-3-opus", name: "Claude 3 Opus"}, 
      {id: "claude-3-haiku", name: "Claude 3 Haiku"}
    ],
    gemini: [
      {id: "gemini-1.5-pro", name: "Gemini 1.5 Pro"}, 
      {id: "gemini-1.5-flash", name: "Gemini 1.5 Flash"}
    ],
    mistral: [
      {id: "mistral-large-latest", name: "Mistral Large"}, 
      {id: "mistral-small-latest", name: "Mistral Small"}
    ],
    cohere: [
      {id: "command-r-plus", name: "Command R+"}, 
      {id: "command-r", name: "Command R"}
    ],
    deepseek: [
      {id: "deepseek-coder", name: "DeepSeek Coder"}, 
      {id: "deepseek-chat", name: "DeepSeek Chat"}
    ],
    perplexity: [
      {id: "sonar-reasoning-pro", name: "Sonar Reasoning Pro"}, 
      {id: "sonar-pro", name: "Sonar Pro"}
    ],
    groq: [
      {id: "llama3-70b-8192", name: "LLaMA3 70B"}, 
      {id: "mixtral-8x7b-32768", name: "Mixtral 8x7B"}
    ]
  };

  const activeProvider = provider === "other" ? otherProvider : provider;

  useEffect(() => {
    // When active provider changes, set default model to the first in the list
    if (modelsByProvider[activeProvider]) {
      setModel(modelsByProvider[activeProvider][0].id);
    }
  }, [activeProvider]);
  
  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
          Connect AI Provider
          <Sparkles className="w-6 h-6 text-primary" />
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Provide your preferred LLM API key. We store this securely encrypted at rest and never share it.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { id: "openai", name: "OpenAI", icon: Cpu },
          { id: "anthropic", name: "Anthropic", icon: Box },
          { id: "gemini", name: "Gemini", icon: LayoutGrid },
          { id: "other", name: "Other", icon: MoreHorizontal },
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => setProvider(p.id)}
            className={cn(
              "p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2",
              provider === p.id 
                ? "border-primary bg-primary/5 shadow-[0_4px_20px_rgba(14,165,233,0.1)]" 
                : "border-border hover:border-foreground/20 hover:bg-foreground/5 bg-transparent"
            )}
          >
            <p.icon className={cn("w-5 h-5", provider === p.id ? "text-primary" : "text-muted-foreground")} />
            <span className={cn("text-xs font-semibold whitespace-nowrap", provider === p.id ? "text-foreground" : "text-muted-foreground")}>{p.name}</span>
          </button>
        ))}
      </div>

      <div className="space-y-4 flex-1">
        <div className="grid grid-cols-1 gap-4">
          
          <AnimatePresence mode="popLayout">
            {provider === "other" && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: "1rem" }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <label className="text-sm font-medium flex items-center gap-2">
                  Select Provider
                </label>
                <div className="relative group">
                  <select 
                    value={otherProvider}
                    onChange={(e) => setOtherProvider(e.target.value)}
                    className="w-full px-4 py-3 bg-transparent border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm appearance-none cursor-pointer"
                  >
                    <option value="mistral" className="bg-background text-foreground">Mistral AI</option>
                    <option value="cohere" className="bg-background text-foreground">Cohere</option>
                    <option value="deepseek" className="bg-background text-foreground">DeepSeek</option>
                    <option value="perplexity" className="bg-background text-foreground">Perplexity</option>
                    <option value="groq" className="bg-background text-foreground">Groq</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              Model
            </label>
            <div className="relative group">
              <select 
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-4 py-3 bg-transparent border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm appearance-none cursor-pointer"
              >
                {modelsByProvider[activeProvider]?.map((m) => (
                  <option key={m.id} value={m.id} className="bg-background text-foreground">
                    {m.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown className="w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              API Key
              <Shield className="w-3.5 h-3.5 text-primary" />
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="w-5 h-5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
              </div>
              <input 
                type="password" 
                placeholder="sk-..." 
                className="w-full pl-10 pr-4 py-3 bg-transparent border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm placeholder:text-muted-foreground/50"
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-4 rounded-xl bg-foreground/5 border border-border text-foreground mt-6">
          <Shield className="w-5 h-5 shrink-0 mt-0.5 opacity-70" />
          <p className="text-xs leading-relaxed font-medium opacity-80">
            Your keys are encrypted using AES-256 before being stored in our vault. They are only decrypted in memory during execution.
          </p>
        </div>
      </div>
    </div>
  );
}

function Step2EcoTrackAPI() {
  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2">EcoTrack Access Key</h2>
        <p className="text-muted-foreground leading-relaxed">
          This is your master API key to authenticate your backend servers with EcoTrack.
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center py-8">
        <div className="w-full max-w-md space-y-6">
          <div className="relative group cursor-pointer" onClick={() => alert('Copied to clipboard!')}>
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-foreground/30 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative flex items-center justify-between p-4 bg-background border border-border rounded-xl shadow-sm">
              <div className="flex items-center gap-3 overflow-hidden">
                <HardDrive className="w-5 h-5 text-primary shrink-0" />
                <code className="text-sm font-mono truncate text-foreground/80">et_live_9f8b7e2c1a4d6f5e3b2a</code>
              </div>
              <button className="p-2 hover:bg-foreground/5 rounded-lg transition-colors shrink-0">
                <Copy className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
              </button>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-foreground/5 text-foreground">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 opacity-70" />
            <p className="text-xs leading-relaxed font-medium opacity-80">
              Store this key safely. You won't be able to see it again after you leave this page. If you lose it, you'll need to generate a new one.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step3ProjectSetup() {
  const [env, setEnv] = useState('development');

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Create First Project</h2>
        <p className="text-muted-foreground leading-relaxed">
          Set up a workspace to track carbon impact. Each project will get a unique sub-key for isolated tracking.
        </p>
      </div>

      <div className="space-y-5 flex-1">
        <div className="space-y-2">
          <label className="text-sm font-medium">Project Name</label>
          <input 
            type="text" 
            placeholder="e.g. Chatbot Alpha" 
            className="w-full px-4 py-3 bg-transparent border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm placeholder:text-muted-foreground/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Project Description <span className="text-muted-foreground/50 font-normal">(Optional)</span></label>
          <textarea 
            placeholder="What does this project do?" 
            rows={3}
            className="w-full px-4 py-3 bg-transparent border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm resize-none placeholder:text-muted-foreground/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Environment</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'development', label: 'Development' },
              { id: 'production', label: 'Production' },
            ].map(e => (
              <button
                key={e.id}
                onClick={() => setEnv(e.id)}
                className={cn(
                  "py-3 rounded-xl border text-sm font-medium transition-all",
                  env === e.id
                    ? "border-foreground bg-foreground text-background shadow-lg shadow-black/10 dark:shadow-white/10"
                    : "border-border hover:border-foreground/20 hover:bg-foreground/5 text-foreground"
                )}
              >
                {e.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
