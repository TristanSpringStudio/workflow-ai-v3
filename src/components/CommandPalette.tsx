"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Home,
  Radio,
  ClipboardList,
  Sun,
  MessageSquare,
  Users,
  Briefcase,
  ArrowRight,
  CornerDownLeft,
  Plus,
} from "lucide-react";
import { useCompanyData } from "@/lib/company-data";

type ItemKind = "nav" | "workflow" | "person" | "department" | "action" | "ai";

interface CommandItem {
  id: string;
  kind: ItemKind;
  label: string;
  sublabel?: string;
  Icon: typeof Home;
  onSelect: () => void;
}

const SECTION_LABEL: Record<ItemKind, string> = {
  nav: "Navigation",
  workflow: "Workflows",
  person: "People",
  department: "Departments",
  action: "Actions",
  ai: "Ask AI",
};

const SECTION_ORDER: ItemKind[] = ["ai", "workflow", "person", "department", "nav", "action"];

export default function CommandPalette() {
  const router = useRouter();
  const { tasks, contributors, getDepartments } = useCompanyData();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Global ⌘K / Ctrl+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const close = () => setOpen(false);

  const navigate = (href: string) => {
    router.push(href);
    close();
  };

  const askAI = (q: string) => {
    router.push(`/ai-assistant?q=${encodeURIComponent(q)}`);
    close();
  };

  const items = useMemo<CommandItem[]>(() => {
    const q = query.trim().toLowerCase();
    const all: CommandItem[] = [];

    // Ask AI is always first when there's a query
    if (q.length > 0) {
      all.push({
        id: "ai-ask",
        kind: "ai",
        label: `Ask AI about: "${query.trim()}"`,
        sublabel: "Open AI assistant with this question",
        Icon: Sun,
        onSelect: () => askAI(query.trim()),
      });
    }

    // Workflows
    const workflowMatches = tasks
      .filter((t) => !q || t.title.toLowerCase().includes(q) || t.department.toLowerCase().includes(q))
      .slice(0, q ? 8 : 5);
    for (const t of workflowMatches) {
      all.push({
        id: `workflow-${t.id}`,
        kind: "workflow",
        label: t.title,
        sublabel: t.department,
        Icon: Briefcase,
        onSelect: () => navigate(`/intelligence/${t.id}`),
      });
    }

    // People
    const personMatches = contributors
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q) || c.department.toLowerCase().includes(q))
      .slice(0, q ? 6 : 0);
    for (const c of personMatches) {
      all.push({
        id: `person-${c.id}`,
        kind: "person",
        label: c.name,
        sublabel: `${c.role} · ${c.department}`,
        Icon: Users,
        onSelect: () => navigate(`/departments/${c.department.toLowerCase()}`),
      });
    }

    // Departments
    const departments = getDepartments();
    const deptMatches = departments
      .filter((d) => !q || d.name.toLowerCase().includes(q))
      .slice(0, q ? 6 : 0);
    for (const d of deptMatches) {
      all.push({
        id: `dept-${d.name}`,
        kind: "department",
        label: d.name,
        sublabel: `${d.taskCount} workflows`,
        Icon: Users,
        onSelect: () => navigate(`/departments/${d.name.toLowerCase()}`),
      });
    }

    // Navigation (always shown, filtered by query)
    const nav: { label: string; href: string; Icon: typeof Home }[] = [
      { label: "Home", href: "/dashboard", Icon: Home },
      { label: "Company Intelligence", href: "/intelligence", Icon: Radio },
      { label: "Interviews", href: "/interviews", Icon: MessageSquare },
      { label: "Implementation Plan", href: "/roadmap", Icon: ClipboardList },
      { label: "AI Assistant", href: "/ai-assistant", Icon: Sun },
    ];
    const navMatches = nav.filter((n) => !q || n.label.toLowerCase().includes(q));
    for (const n of navMatches) {
      all.push({
        id: `nav-${n.href}`,
        kind: "nav",
        label: n.label,
        Icon: n.Icon,
        onSelect: () => navigate(n.href),
      });
    }

    // Actions
    const actions: { label: string; sublabel?: string; Icon: typeof Home; onSelect: () => void }[] = [
      {
        label: "New interview invite",
        sublabel: "Create an invite link for a teammate",
        Icon: Plus,
        onSelect: () => navigate("/interviews"),
      },
    ];
    const actionMatches = actions.filter((a) => !q || a.label.toLowerCase().includes(q));
    for (const a of actionMatches) {
      all.push({
        id: `action-${a.label}`,
        kind: "action",
        label: a.label,
        sublabel: a.sublabel,
        Icon: a.Icon,
        onSelect: a.onSelect,
      });
    }

    return all;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, tasks, contributors]);

  // Group items by section in a stable order
  const grouped = useMemo(() => {
    const map: Record<string, CommandItem[]> = {};
    for (const item of items) {
      if (!map[item.kind]) map[item.kind] = [];
      map[item.kind].push(item);
    }
    return SECTION_ORDER.filter((k) => map[k]?.length).map((k) => ({ kind: k, items: map[k] }));
  }, [items]);

  // Flat list (in render order) for arrow key navigation
  const flat = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  // Clamp selected when items change
  useEffect(() => {
    if (selected >= flat.length) setSelected(Math.max(0, flat.length - 1));
  }, [flat.length, selected]);

  // Scroll selected into view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-index="${selected}"]`) as HTMLElement | null;
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [selected]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => (s + 1) % Math.max(1, flat.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => (s - 1 + Math.max(1, flat.length)) % Math.max(1, flat.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = flat[selected];
      if (item) item.onSelect();
    }
  };

  if (!open) return null;

  let runningIndex = -1;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4" onClick={close}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-xl bg-background rounded-2xl border border-border shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 h-12 border-b border-border">
          <Search className="w-4 h-4 text-muted-light shrink-0" strokeWidth={2} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search workflows, people, or ask AI..."
            className="flex-1 bg-transparent text-[14px] placeholder:text-muted-light focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 h-5 rounded bg-surface border border-border text-[10px] text-muted-light font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[55vh] overflow-y-auto scroll-thin py-1">
          {grouped.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-[13px] text-muted">No results</p>
              <button
                onClick={() => askAI(query.trim() || "Tell me about my company")}
                className="mt-2 text-[12px] text-accent hover:text-accent-hover"
              >
                Ask AI instead →
              </button>
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.kind} className="py-1">
                <div className="px-4 py-1 text-[10px] font-medium text-muted-light uppercase tracking-widest">
                  {SECTION_LABEL[group.kind]}
                </div>
                {group.items.map((item) => {
                  runningIndex++;
                  const isSelected = runningIndex === selected;
                  const myIndex = runningIndex;
                  return (
                    <button
                      key={item.id}
                      data-index={myIndex}
                      onMouseEnter={() => setSelected(myIndex)}
                      onClick={() => item.onSelect()}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                        isSelected ? "bg-surface" : ""
                      }`}
                    >
                      <item.Icon
                        className={`w-4 h-4 shrink-0 ${item.kind === "ai" ? "text-pink-400" : "text-muted-light"}`}
                        strokeWidth={1.5}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] text-foreground truncate">{item.label}</div>
                        {item.sublabel && (
                          <div className="text-[11px] text-muted-light truncate">{item.sublabel}</div>
                        )}
                      </div>
                      {isSelected && (
                        <CornerDownLeft className="w-3.5 h-3.5 text-muted-light shrink-0" strokeWidth={1.5} />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center justify-between px-4 h-9 border-t border-border bg-surface/30 text-[10px] text-muted-light">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center w-4 h-4 rounded bg-background border border-border font-mono">↑</kbd>
              <kbd className="inline-flex items-center justify-center w-4 h-4 rounded bg-background border border-border font-mono">↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center px-1 h-4 rounded bg-background border border-border font-mono">↵</kbd>
              select
            </span>
          </div>
          <span className="flex items-center gap-1">
            <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
            {flat.length} {flat.length === 1 ? "result" : "results"}
          </span>
        </div>
      </div>
    </div>
  );
}
