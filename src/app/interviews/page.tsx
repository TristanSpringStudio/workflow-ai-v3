"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Check, Clock, Send, Copy, Link2, Plus, User, Search } from "lucide-react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { interviews, contributors, pendingContributors } from "@/lib/mock-data";

const DEPT_COLORS: Record<string, string> = {
  Marketing: "#a855f7", Sales: "#22c55e", Operations: "#f59e0b",
  Engineering: "#6366f1", Product: "#ec4899", Finance: "#3b52ce",
  Support: "#ca8a04", HR: "#3b82f6",
};

function timeAgo(date: string) {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

type SortKey = "date" | "name" | "dept";

export default function InterviewsPage() {
  const [showInvite, setShowInvite] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [sortOpen, setSortOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"completed" | "pending">("completed");
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const completed = interviews.filter((iv) => iv.status === "completed");
  const invited = interviews.filter((iv) => iv.status === "invited");

  // Build display list with contributor info
  let displayList = completed.map((iv) => {
    const person = contributors.find((c) => c.id === iv.contributorId);
    return { ...iv, person };
  }).filter((iv) => iv.person);

  if (search) {
    const q = search.toLowerCase();
    displayList = displayList.filter((iv) =>
      iv.person!.name.toLowerCase().includes(q) ||
      iv.person!.role.toLowerCase().includes(q) ||
      iv.person!.department.toLowerCase().includes(q)
    );
  }

  if (sortBy === "date") displayList.sort((a, b) => new Date(b.completedAt || "").getTime() - new Date(a.completedAt || "").getTime());
  if (sortBy === "name") displayList.sort((a, b) => (a.person?.name || "").localeCompare(b.person?.name || ""));
  if (sortBy === "dept") displayList.sort((a, b) => (a.person?.department || "").localeCompare(b.person?.department || ""));

  const handleCopyLink = () => {
    navigator.clipboard.writeText("/i/zippy-zaps-abc123");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col min-h-0">
        <PageHeader title="Interviews">
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-[12px] font-medium hover:bg-accent-hover transition-colors"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2} />
            Invite employee
          </button>
        </PageHeader>

        {/* Invite panel — collapsible below header */}
        {showInvite && (
          <div className="shrink-0 px-6 py-4 border-b border-border bg-accent/[0.02]">
            <div className="max-w-3xl">
              <p className="text-[12px] text-muted mb-3">Send this link to employees. They&apos;ll complete a 10-minute AI interview about their role, tasks, and workflows.</p>
              <div className="flex gap-2 mb-3">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border text-[13px] text-muted">
                  <Link2 className="w-3.5 h-3.5 text-muted-light shrink-0" strokeWidth={1.5} />
                  <span className="truncate">/i/zippy-zaps-abc123</span>
                </div>
                <button onClick={handleCopyLink} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-[12px] font-medium hover:border-muted-light transition-colors">
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" strokeWidth={2} /> : <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="flex gap-2">
                <input placeholder="name@company.com" className="flex-1 h-8 px-3 rounded-lg bg-background border border-border text-[12px] placeholder:text-muted-light focus:outline-none focus:border-accent/40" />
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-[12px] font-medium hover:bg-accent-hover transition-colors">
                  <Send className="w-3 h-3" strokeWidth={2} />
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter/Sort bar — matches Intelligence page */}
        <div className="shrink-0 px-6 py-2.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Tabs */}
            <div className="flex gap-1 bg-surface border border-border rounded-lg p-0.5 mr-2">
              <button onClick={() => setTab("completed")} className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${tab === "completed" ? "bg-background text-foreground shadow-sm" : "text-muted"}`}>
                Completed ({completed.length})
              </button>
              <button onClick={() => setTab("pending")} className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${tab === "pending" ? "bg-background text-foreground shadow-sm" : "text-muted"}`}>
                Pending ({invited.length})
              </button>
            </div>

            {/* Sort dropdown */}
            <div ref={sortRef} className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border border-border hover:border-muted-light transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" /></svg>
                Sorted by <span className="text-foreground">{sortBy === "date" ? "Date" : sortBy === "name" ? "Name" : "Department"}</span>
              </button>
              {sortOpen && (
                <div className="absolute top-full left-0 mt-1 w-40 rounded-xl bg-background border border-border shadow-lg z-20 py-1">
                  {([["date", "Date"], ["name", "Name"], ["dept", "Department"]] as const).map(([key, label]) => (
                    <button key={key} onClick={() => { setSortBy(key); setSortOpen(false); }} className={`w-full text-left px-3 py-2 text-[12px] hover:bg-surface transition-colors ${sortBy === key ? "text-accent font-medium" : "text-muted"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-light" strokeWidth={1.5} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-44 h-8 pl-8 pr-3 rounded-lg bg-surface border border-border text-[12px] placeholder:text-muted-light focus:outline-none focus:border-accent/40 focus:w-64 transition-all"
            />
          </div>
        </div>

        {/* Table — completed tab */}
        {tab === "completed" && (
          <div className="flex-1 overflow-y-auto scroll-thin">
            {/* Sticky header */}
            <div className="sticky top-0 z-10 bg-surface/80 backdrop-blur-sm border-b border-border px-6 py-2 grid grid-cols-[1fr_140px_100px_100px_100px] gap-4 text-[11px] font-medium text-muted-light uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" strokeWidth={2} />
                Employee
              </span>
              <span>Department</span>
              <span>Duration</span>
              <span>Workflows</span>
              <span>Completed</span>
            </div>

            {displayList.map((iv) => {
              const person = iv.person!;
              const deptColor = DEPT_COLORS[person.department] || "#6b7280";
              return (
                <Link
                  key={iv.id}
                  href={`/interviews/${iv.id}`}
                  className="grid grid-cols-[1fr_140px_100px_100px_100px] gap-4 px-6 py-3.5 border-b border-border hover:bg-surface/50 transition-colors items-center"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: deptColor }}>
                      {person.name.charAt(0)}{person.name.split(" ")[1]?.[0]}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium">{person.name}</p>
                      <p className="text-[11px] text-muted-light">{person.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: deptColor }} />
                    <span className="text-[12px] text-muted">{person.department}</span>
                  </div>

                  <span className="text-[12px] text-muted">{iv.duration}</span>
                  <span className="text-[12px] text-muted">{iv.workflowsExtracted} extracted</span>
                  <span className="text-[12px] text-muted-light">{iv.completedAt ? timeAgo(iv.completedAt) : "—"}</span>
                </Link>
              );
            })}

            {displayList.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-[13px] text-muted">No interviews match your search</p>
              </div>
            )}
          </div>
        )}

        {/* Pending tab */}
        {tab === "pending" && (
          <div className="flex-1 overflow-y-auto scroll-thin px-6 py-6">
            {invited.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-[13px] text-muted">No pending invites</p>
                <button onClick={() => setShowInvite(true)} className="mt-2 text-[12px] text-accent hover:text-accent-hover">Invite someone →</button>
              </div>
            ) : (
              <div className="space-y-2">
                {invited.map((iv) => {
                  const person = pendingContributors.find((c) => c.id === iv.contributorId);
                  if (!person) return null;
                  return (
                    <div key={iv.id} className="flex items-center justify-between p-4 rounded-xl border border-dashed border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-muted-light" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-[13px] font-medium">{person.name}</p>
                          <p className="text-[11px] text-muted-light">{person.role} · {person.department} · {person.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[11px] text-muted-light">
                          <Clock className="w-3 h-3" strokeWidth={1.5} />
                          Invited {iv.invitedAt ? timeAgo(iv.invitedAt) : ""}
                        </span>
                        <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border text-[11px] font-medium text-muted hover:text-foreground hover:border-muted-light transition-colors">
                          <Send className="w-3 h-3" strokeWidth={1.5} />
                          Resend
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
