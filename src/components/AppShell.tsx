"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Radio, ClipboardList, Sun, Settings, ChevronRight, DollarSign, Megaphone, TrendingUp, Users, Share2, Headphones, Wrench, PackageSearch, FlaskConical, MessageSquare, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useCompanyData } from "@/lib/company-data";
import { deptToSlug } from "@/lib/department-slug";
import CommandPalette from "@/components/CommandPalette";
import { Skeleton, ContentSkeleton } from "@/components/Skeleton";

const DEPT_CONFIG: Record<string, { color: string; bg: string; Icon: typeof DollarSign }> = {
  Sales: { color: "#ffffff", bg: "#22c55e", Icon: DollarSign },
  Marketing: { color: "#ffffff", bg: "#a855f7", Icon: Megaphone },
  Finance: { color: "#ffffff", bg: "#3b82f6", Icon: TrendingUp },
  HR: { color: "#ffffff", bg: "#3b82f6", Icon: Users },
  IT: { color: "#ffffff", bg: "#dc2626", Icon: Share2 },
  Support: { color: "#ffffff", bg: "#ca8a04", Icon: Headphones },
  Operations: { color: "#ffffff", bg: "#f59e0b", Icon: Wrench },
  Engineering: { color: "#ffffff", bg: "#6366f1", Icon: FlaskConical },
  Product: { color: "#ffffff", bg: "#ec4899", Icon: PackageSearch },
};

const DEFAULT_DEPT = { color: "#ffffff", bg: "#6b7280", Icon: Users };

const NAV_ITEMS = [
  { label: "Home", href: "/dashboard", Icon: Home },
  { label: "Company Intelligence", href: "/intelligence", Icon: Radio },
  { label: "Interviews", href: "/interviews", Icon: MessageSquare },
  { label: "Implementation Plan", href: "/roadmap", Icon: ClipboardList },
  { label: "AI Assistant", href: "/ai-assistant", Icon: Sun },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { company, getDepartments, loading } = useCompanyData();
  const departments = getDepartments();
  const [deptsOpen, setDeptsOpen] = useState(true);

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-[220px] shrink-0 border-r border-border flex flex-col bg-surface/30">
        {/* Company logo */}
        <div className="h-14 px-4 flex items-center gap-2.5 border-b border-border">
          {loading ? (
            <>
              <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
              <Skeleton className="h-4 w-24" />
            </>
          ) : company.logoUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={company.logoUrl}
                alt={`${company.name} logo`}
                className="w-7 h-7 rounded-lg object-cover bg-surface border border-border shrink-0"
              />
              <span className="text-[14px] font-semibold tracking-tight truncate">{company.name}</span>
            </>
          ) : (
            <>
              <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center text-[11px] font-bold text-background shrink-0">
                {company.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <span className="text-[14px] font-semibold tracking-tight truncate">{company.name}</span>
            </>
          )}
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
                <item.Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}

          {/* Departments */}
          <div className="pt-4 mt-4 border-t border-border">
            <button onClick={() => setDeptsOpen(!deptsOpen)} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-muted-light uppercase tracking-widest w-full">
              <ChevronRight className={`w-3 h-3 transition-transform ${deptsOpen ? "rotate-90" : ""}`} strokeWidth={2} />
              Departments
            </button>
            {deptsOpen && (
              <div className="mt-1.5 space-y-0.5">
                {loading ? (
                  // Skeleton rows while the first fetch is in flight
                  [0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-2.5 px-2.5 py-1.5">
                      <Skeleton className="w-5 h-5 rounded-md shrink-0" />
                      <Skeleton className="h-3 flex-1" />
                    </div>
                  ))
                ) : (
                  departments.map((dept) => {
                    const cfg = DEPT_CONFIG[dept.name] || DEFAULT_DEPT;
                    return (
                      <Link
                        key={dept.name}
                        href={`/departments/${deptToSlug(dept.name)}`}
                        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px] text-muted hover:text-foreground hover:bg-foreground/[0.03] transition-colors"
                      >
                        <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
                          <cfg.Icon className="w-3 h-3" style={{ color: cfg.color }} strokeWidth={2} />
                        </div>
                        {dept.name}
                      </Link>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Settings + Logout */}
        <div className="px-2 py-2 border-t border-border space-y-0.5">
          <Link href="/settings" className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] text-muted hover:text-foreground hover:bg-foreground/[0.03] transition-colors">
            <Settings className="w-4 h-4" strokeWidth={1.5} />
            Settings
          </Link>
          <button
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] text-muted hover:text-foreground hover:bg-foreground/[0.03] transition-colors"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            Log out
          </button>
        </div>
      </div>

      {/* Main */}
      {loading ? (
        // Generic content skeleton during the initial fetch. Once loading
        // flips to false, each page's own content (with its own empty /
        // loaded states) takes over.
        <ContentSkeleton />
      ) : (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {children}
        </div>
      )}

      {/* Command palette (⌘K) — globally mounted */}
      <CommandPalette />
    </div>
  );
}
