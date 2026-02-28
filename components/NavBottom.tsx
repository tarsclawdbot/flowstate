"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  BarChart2,
  Link as LinkIcon,
  Settings,
  Sparkles
} from "lucide-react";

export function NavBottom() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
    { name: "Report", href: "/report", icon: BarChart2 },
    { name: "Connect", href: "/connect/github", icon: LinkIcon, match: "/connect" },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Pricing", href: "/pricing", icon: Sparkles },
  ];

  // Hide bottom nav on the landing page
  if (pathname === "/") return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-t border-border-subtle pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.match || item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? "text-primary-blue" : "text-text-secondary"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "fill-primary-blue/20" : ""}`} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
