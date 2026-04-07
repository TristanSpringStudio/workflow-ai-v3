"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Clock, Send, Copy, Link2, Plus, User } from "lucide-react";
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

export default function InterviewsPage() {
  const [showInvite, setShowInvite] = useState(false);
  const [copied, setCopied] = useState(false);

  const completed = interviews.filter((iv) => iv.status === "completed");
  const invited = interviews.filter((iv) => iv.status === "invited");

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://app.vishtan.com/interview/zippy-zaps-abc123");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell>
      <PageHeader title="Interviews">
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-[12px] font-medium hover:bg-accent-hover transition-colors"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          Invite employee
        </button>
      </PageHeader>

      <div className="flex-1 overflow-y-auto scroll-thin">
        <div className="max-w-4xl mx-auto px-8 py-8">
          {/* Invite panel */}
          {showInvite && (
            <div className="mb-8 p-5 rounded-2xl border border-accent/20 bg-accent/[0.02]">
              <h3 className="text-[14px] font-semibold mb-1">Share interview link</h3>
              <p className="text-[12px] text-muted mb-4">Send this link to employees. They&apos;ll complete a 10-minute AI interview about their role, tasks, and workflows.</p>

              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border text-[13px] text-muted">
                  <Link2 className="w-3.5 h-3.5 text-muted-light shrink-0" strokeWidth={1.5} />
                  <span className="truncate">https://app.vishtan.com/interview/zippy-zaps-abc123</span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-[12px] font-medium hover:border-muted-light transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" strokeWidth={2} /> : <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />}
                  {copied ? "Copied" : "Copy link"}
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-[11px] font-medium text-muted-light uppercase tracking-widest mb-2">Or invite by email</p>
                <div className="flex gap-2">
                  <input placeholder="name@company.com" className="flex-1 h-9 px-3 rounded-lg bg-background border border-border text-[13px] placeholder:text-muted-light focus:outline-none focus:border-accent/40" />
                  <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-white text-[12px] font-medium hover:bg-accent-hover transition-colors">
                    <Send className="w-3.5 h-3.5" strokeWidth={2} />
                    Send invite
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl border border-border">
              <p className="text-2xl font-bold">{completed.length}</p>
              <p className="text-[12px] text-muted">Completed</p>
            </div>
            <div className="p-4 rounded-xl border border-border">
              <p className="text-2xl font-bold">{invited.length}</p>
              <p className="text-[12px] text-muted">Pending</p>
            </div>
            <div className="p-4 rounded-xl border border-border">
              <p className="text-2xl font-bold">{completed.reduce((s, iv) => s + iv.workflowsExtracted, 0)}</p>
              <p className="text-[12px] text-muted">Workflows extracted</p>
            </div>
          </div>

          {/* Completed interviews */}
          <div className="mb-8">
            <h3 className="text-[13px] font-semibold mb-3">Completed ({completed.length})</h3>
            <div className="rounded-2xl border border-border overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_140px_100px_100px_80px] gap-4 px-5 py-2.5 bg-surface/50 border-b border-border text-[11px] font-medium text-muted-light uppercase tracking-wider">
                <span>Employee</span>
                <span>Department</span>
                <span>Duration</span>
                <span>Workflows</span>
                <span>Date</span>
              </div>

              {completed.map((iv) => {
                const person = contributors.find((c) => c.id === iv.contributorId);
                if (!person) return null;
                const deptColor = DEPT_COLORS[person.department] || "#6b7280";

                return (
                  <Link
                    key={iv.id}
                    href={`/interviews/${iv.id}`}
                    className="grid grid-cols-[1fr_140px_100px_100px_80px] gap-4 px-5 py-3.5 border-b border-border hover:bg-surface/50 transition-colors items-center"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center text-[10px] font-bold text-muted">
                        {person.name.charAt(0)}{person.name.split(" ")[1]?.[0]}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium">{person.name}</p>
                        <p className="text-[11px] text-muted-light">{person.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: deptColor }} />
                      <span className="text-[12px] text-muted">{person.department}</span>
                    </div>

                    <span className="text-[12px] text-muted">{iv.duration}</span>

                    <span className="text-[12px] text-muted">{iv.workflowsExtracted} extracted</span>

                    <span className="text-[11px] text-muted-light">{iv.completedAt ? timeAgo(iv.completedAt) : "—"}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Pending invites */}
          {invited.length > 0 && (
            <div>
              <h3 className="text-[13px] font-semibold mb-3">Pending invites ({invited.length})</h3>
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
                          <p className="text-[11px] text-muted-light">{person.role} · {person.department}</p>
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
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
