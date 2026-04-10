"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Check, Clock, Copy, Link2, Plus, User, Search, X, ArrowRight } from "lucide-react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { useCompanyData } from "@/lib/company-data";

interface PendingInvite {
  id: string;
  token: string;
  status: "invited" | "in_progress" | "completed";
  invited_at: string;
  completed_at: string | null;
  contributors: {
    id: string;
    name: string;
    email: string | null;
    role: string | null;
    department: string | null;
  } | null;
}

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
  const { interviews, contributors } = useCompanyData();
  const [showInvite, setShowInvite] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [sortOpen, setSortOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"completed" | "pending">("completed");
  const sortRef = useRef<HTMLDivElement>(null);

  // Invite form state
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [createdInviteUrl, setCreatedInviteUrl] = useState<string | null>(null);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);

  // Pending invites from DB
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchPendingInvites = async () => {
    setPendingLoading(true);
    try {
      const res = await fetch("/api/invite");
      if (res.ok) {
        const data = await res.json();
        const pending = (data || []).filter((t: PendingInvite) => t.status !== "completed");
        setPendingInvites(pending);
      }
    } catch {
      // silent fail
    } finally {
      setPendingLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingInvites();
  }, []);

  const handleCreateInvite = async () => {
    if (!inviteName.trim() && !inviteEmail.trim()) {
      setInviteError("Enter a name or email");
      return;
    }
    setInviteError(null);
    setInviteLoading(true);
    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inviteName.trim() || undefined,
          email: inviteEmail.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setInviteError(data.error || "Failed to create invite");
        return;
      }
      const data = await res.json();
      setCreatedInviteUrl(data.interviewUrl);
      fetchPendingInvites();
    } catch {
      setInviteError("Network error");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCopyInviteLink = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedInviteId(id);
    setTimeout(() => setCopiedInviteId(null), 2000);
  };

  const resetInviteModal = () => {
    setShowInvite(false);
    setInviteName("");
    setInviteEmail("");
    setInviteError(null);
    setCreatedInviteUrl(null);
  };

  const completed = interviews.filter((iv) => iv.status === "completed");

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

  return (
    <AppShell>
      <div className="flex-1 flex flex-col min-h-0">
        <PageHeader title="Interviews">
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-[12px] font-medium hover:bg-foreground/80 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2} />
            New interview
          </button>
        </PageHeader>

        {/* New interview modal */}
        {showInvite && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={resetInviteModal}>
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative w-full max-w-md bg-background rounded-2xl border border-border shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="text-[15px] font-semibold">New interview</h2>
                <button onClick={resetInviteModal} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-surface transition-colors">
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {!createdInviteUrl ? (
                  <>
                    <p className="text-[13px] text-muted leading-relaxed">
                      Create an interview link for a teammate. They&apos;ll be able to fill in any details we don&apos;t know yet during the conversation.
                    </p>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-medium text-muted mb-1.5">Name</label>
                        <input
                          value={inviteName}
                          onChange={(e) => setInviteName(e.target.value)}
                          placeholder="Alice Chen"
                          className="w-full h-10 px-3 rounded-xl bg-surface border border-border text-[13px] placeholder:text-muted-light focus:outline-none focus:border-foreground/30"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-muted mb-1.5">Email <span className="text-muted-light font-normal">(optional)</span></label>
                        <input
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="alice@company.com"
                          type="email"
                          className="w-full h-10 px-3 rounded-xl bg-surface border border-border text-[13px] placeholder:text-muted-light focus:outline-none focus:border-foreground/30"
                        />
                      </div>
                    </div>

                    {inviteError && (
                      <p className="text-[12px] text-red-600">{inviteError}</p>
                    )}

                    <button
                      onClick={handleCreateInvite}
                      disabled={inviteLoading || (!inviteName.trim() && !inviteEmail.trim())}
                      className="w-full h-10 rounded-xl bg-foreground text-background text-[13px] font-medium hover:bg-foreground/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {inviteLoading ? "Creating..." : "Create invite link"}
                      {!inviteLoading && <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
                      <Check className="w-4 h-4 text-green-600 shrink-0" strokeWidth={2} />
                      <p className="text-[12px] text-green-800">Invite link created. Share it however you like.</p>
                    </div>

                    <div>
                      <p className="text-[11px] font-medium text-muted mb-1.5">Interview link</p>
                      <div className="flex gap-2">
                        <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-surface border border-border text-[12px] text-muted overflow-hidden">
                          <Link2 className="w-3.5 h-3.5 text-muted-light shrink-0" strokeWidth={1.5} />
                          <span className="truncate">{createdInviteUrl}</span>
                        </div>
                        <button
                          onClick={() => handleCopyInviteLink(createdInviteUrl, "modal")}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-[12px] font-medium hover:border-muted-light transition-colors shrink-0"
                        >
                          {copiedInviteId === "modal" ? (
                            <><Check className="w-3.5 h-3.5 text-green-600" strokeWidth={2} />Copied</>
                          ) : (
                            <><Copy className="w-3.5 h-3.5" strokeWidth={1.5} />Copy</>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setCreatedInviteUrl(null);
                          setInviteName("");
                          setInviteEmail("");
                        }}
                        className="flex-1 h-10 rounded-xl border border-border text-[13px] font-medium text-muted hover:text-foreground transition-colors"
                      >
                        Create another
                      </button>
                      <button
                        onClick={resetInviteModal}
                        className="flex-1 h-10 rounded-xl bg-foreground text-background text-[13px] font-medium hover:bg-foreground/80 transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  </>
                )}
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
                Pending ({pendingInvites.length})
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
            <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-2 grid grid-cols-[1fr_140px_100px_100px_100px] gap-4 text-[11px] font-medium text-foreground/70 uppercase tracking-wider">
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
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border text-[12px]">
                      <svg className="w-3 h-3 text-muted-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" /></svg>
                      {person.name}
                    </span>
                    <span className="text-[11px] text-muted-light">{person.role}</span>
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
            {pendingLoading ? (
              <div className="py-16 text-center">
                <p className="text-[13px] text-muted">Loading...</p>
              </div>
            ) : pendingInvites.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-[13px] text-muted">No pending invites</p>
                <button onClick={() => setShowInvite(true)} className="mt-2 text-[12px] text-accent hover:text-accent-hover">Invite someone →</button>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingInvites.map((inv) => {
                  const person = inv.contributors;
                  const displayName = person?.name || "Unnamed teammate";
                  const displayMeta = [person?.role, person?.department, person?.email].filter(Boolean).join(" · ") || "Awaiting details";
                  const inviteUrl = typeof window !== "undefined" ? `${window.location.origin}/interview/${inv.token}` : `/interview/${inv.token}`;
                  const isCopied = copiedInviteId === inv.id;
                  return (
                    <div key={inv.id} className="flex items-center justify-between p-4 rounded-xl border border-dashed border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-muted-light" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-[13px] font-medium">{displayName}</p>
                          <p className="text-[11px] text-muted-light">{displayMeta}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[11px] text-muted-light">
                          <Clock className="w-3 h-3" strokeWidth={1.5} />
                          {inv.status === "in_progress" ? "In progress" : `Invited ${timeAgo(inv.invited_at)}`}
                        </span>
                        <button
                          onClick={() => handleCopyInviteLink(inviteUrl, inv.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border text-[11px] font-medium text-muted hover:text-foreground hover:border-muted-light transition-colors"
                        >
                          {isCopied ? (
                            <><Check className="w-3 h-3 text-green-600" strokeWidth={2} />Copied</>
                          ) : (
                            <><Copy className="w-3 h-3" strokeWidth={1.5} />Copy link</>
                          )}
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
