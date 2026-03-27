"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ComponentType, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { clearSession, UserProfile } from "@/lib/auth";

type IconProps = { className?: string };

const menuLinks: Array<{
  href: string;
  label: string;
  icon: ComponentType<IconProps>;
}> = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { href: "/keys", label: "Keys", icon: KeyIcon },
  { href: "/projects", label: "Projects", icon: FolderIcon },
  { href: "/reports", label: "Reports", icon: ReportIcon },
  { href: "/recommendations", label: "Recommendations", icon: SparkIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
  { href: "/documentation", label: "Documentation", icon: DocumentIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await auth.signOut();
    clearSession();
    router.push("/login");
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-72 border-r border-white/5 bg-[#0a0a0a]/80 backdrop-blur-3xl lg:relative h-screen shrink-0 overflow-hidden">
      <div className="flex flex-col h-full px-6 py-8">
        <div className="flex items-center gap-3 px-2 mb-12 shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            <RocketIcon className="w-4 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white uppercase italic">EcoTrack</h1>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
          {menuLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
            return (
              <Link 
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all group relative ${
                  isActive 
                    ? "bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 shadow-[0_4px_12px_rgba(16,185,129,0.05)]" 
                    : "text-zinc-500 hover:bg-white/5 hover:text-white"
                }`}
              >
                <link.icon className={`w-[18px] h-[18px] transition-colors ${isActive ? "text-[#10b981]" : "text-zinc-500 group-hover:text-white"}`} />
                {link.label}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#10b981] rounded-r-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                )}
              </Link>
            );
          })}
        </nav>

        <footer className="mt-8 pt-8 border-t border-white/5 space-y-4 shrink-0">
          <div className="px-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-bold mb-3">Organization</p>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#10b981] to-[#34d399] flex items-center justify-center text-[10px] font-bold text-black border border-white/10 uppercase">
                {userProfile?.organizationName?.substring(0, 2) ?? "OG"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate text-white">{userProfile?.organizationName ?? "Internal Tech"}</p>
                <p className="text-[10px] text-zinc-500 font-medium">Enterprise Tier</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-xs font-semibold text-zinc-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5"
          >
            <LoginIcon className="w-4 h-4" />
            Sign Out
          </button>
        </footer>
      </div>
    </aside>
  );
}

// Icons extracted for internal use
function DashboardIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function KeyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

function FolderIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
    </svg>
  );
}

function ReportIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2Z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}

function SparkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function SettingsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function RocketIcon({ className }: IconProps) {
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

function LoginIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );
}

function DocumentIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}
