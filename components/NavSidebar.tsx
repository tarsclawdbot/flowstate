"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  BarChart2,
  Link as LinkIcon,
  Settings,
  Sparkles,
  Zap
} from "lucide-react";

export function NavSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
    { name: "Report", href: "/report", icon: BarChart2 },
    { name: "Connect", href: "/connect/github", icon: LinkIcon, match: "/connect" },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Pricing", href: "/pricing", icon: Sparkles },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border-subtle bg-surface h-screen sticky top-0">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 text-text-primary font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
          <Zap className="w-6 h-6 text-primary-blue fill-primary-blue/20" />
          FlowState
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.match || item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-surface-elevated text-primary-blue border border-border-bright"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated/50 border border-transparent"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-primary-blue" : ""}`} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border-subtle">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer hover:bg-surface-elevated transition-colors">
          <div className="w-8 h-8 rounded-full bg-border-bright flex items-center justify-center text-xs font-mono font-bold text-text-primary">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">Developer</p>
            <p className="text-xs text-text-muted truncate">Free Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
