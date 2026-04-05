"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDepartments } from "@/lib/mock-data";

const DEPT_COLORS: Record<string, string> = {
  Marketing: "#3b82f6", Sales: "#22c55e", Operations: "#f59e0b",
  Engineering: "#6366f1", Product: "#ec4899", Finance: "#64748b",
};

const NAV_ITEMS = [
  { label: "Home", href: "/dashboard", icon: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
  { label: "Company Intelligence", href: "/intelligence", icon: "M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" },
  { label: "Implementation Plan", href: "/roadmap", icon: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" },
  { label: "AI Assistant", href: "/assess", icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const departments = getDepartments();
  const [deptsOpen, setDeptsOpen] = useState(true);

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-[220px] shrink-0 border-r border-border flex flex-col bg-surface/30">
        {/* Logo */}
        <div className="h-14 px-4 flex items-center gap-2 border-b border-border">
          <div className="w-6 h-6 rounded-md bg-foreground flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303" /></svg>
          </div>
          <span className="text-[14px] font-semibold tracking-tight">Vishtan</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto scroll-thin">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-colors ${
                  isActive ? "bg-foreground/5 text-foreground font-medium" : "text-muted hover:text-foreground hover:bg-foreground/[0.03]"
                }`}
              >
                <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          })}

          {/* Department tree */}
          <div className="pt-4 mt-4 border-t border-border">
            <button onClick={() => setDeptsOpen(!deptsOpen)} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-muted-light uppercase tracking-widest w-full">
              <svg className={`w-3 h-3 transition-transform ${deptsOpen ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              Departments
            </button>
            {deptsOpen && (
              <div className="mt-1 space-y-0.5">
                {departments.map((dept) => (
                  <Link
                    key={dept.name}
                    href={`/intelligence?dept=${dept.name}`}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] text-muted hover:text-foreground hover:bg-foreground/[0.03] transition-colors"
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: DEPT_COLORS[dept.name] || "#9ca3af" }} />
                    {dept.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Settings */}
        <div className="px-2 py-2 border-t border-border">
          <Link href="/settings" className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] text-muted hover:text-foreground hover:bg-foreground/[0.03] transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Settings
          </Link>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
