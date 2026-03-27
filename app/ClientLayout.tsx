"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Define routes that should NOT have the sidebar
  const noSidebarRoutes = ["/", "/login", "/signup", "/register", "/onboarding"];
  const showSidebar = !noSidebarRoutes.includes(pathname);

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#050505]">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto custom-scrollbar">
        {children}
      </main>
    </div>
  );
}
