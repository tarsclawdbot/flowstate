"use client";

import { usePathname } from "next/navigation";
import { NavSidebar } from "./NavSidebar";
import { NavBottom } from "./NavBottom";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isLandingPage = pathname === "/";

  if (isLandingPage) {
    return <div className="min-h-screen bg-bg">{children}</div>;
  }

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <NavSidebar />
      <main className="flex-1 overflow-y-auto w-full md:pb-0 pb-20">
        <div className="max-w-7xl mx-auto w-full h-full p-4 md:p-8">
          {children}
        </div>
      </main>
      <NavBottom />
    </div>
  );
}
