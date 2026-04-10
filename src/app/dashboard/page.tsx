"use client";

import { useState, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sun, User, Send } from "lucide-react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { useCompanyData } from "@/lib/company-data";
import { getDeptIcon } from "@/lib/dept-icons";

interface Finding {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium";
  description: string;
  impact: string;
  recommendation: string;
  relatedWorkflows: { id: string; title: string; dept: string }[];
  estimatedSavings?: string;
  depts?: string[];
  person?: string;
  text: string;
}

function DeptChip({ dept }: { dept: string }) {
  const cfg = getDeptIcon(dept);
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-border text-[11px]">
      <span className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ background: cfg.bg }}><cfg.Icon className="w-2.5 h-2.5 text-white" strokeWidth={2} /></span>
      {dept}
    </span>
  );
}

function PersonChip({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border text-[12px] whitespace-nowrap shrink-0">
      <User className="w-3 h-3 text-muted-light shrink-0" strokeWidth={2} />{name}
    </span>
  );
}

export default function HomePage() {
  const { company, tasks, contributors, interviews, assessment, loading } = useCompanyData();
  const router = useRouter();
  const [chatInput, setChatInput] = useState("");
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Derive findings from real data
  const findings = useMemo(() => {
    const result: Finding[] = [];

    // Find bottleneck workflows grouped by department
    const bottlenecks = tasks.filter((t) => t.isBottleneck);
    if (bottlenecks.length > 0) {
      const bottleneckDepts = [...new Set(bottlenecks.map((t) => t.department))];
      result.push({
        id: "f-bottlenecks",
        depts: bottleneckDepts.slice(0, 3),
        text: `have ${bottlenecks.length} workflow bottlenecks`,
        title: `${bottlenecks.length} workflow bottlenecks identified across ${bottleneckDepts.length} departments`,
        severity: "critical",
        description: `We identified ${bottlenecks.length} workflows that are creating bottlenecks. These are high-frequency, time-intensive processes that slow down cross-team work.`,
        impact: `${bottlenecks.length} bottleneck workflows creating delays across ${bottleneckDepts.length} departments.`,
        recommendation: "Prioritize AI automation for these bottleneck workflows to eliminate delays and single points of failure.",
        relatedWorkflows: bottlenecks.slice(0, 4).map((t) => ({ id: t.id, title: t.title, dept: t.department })),
        estimatedSavings: undefined,
      });
    }

    // Find single points of failure (contributors linked to many workflows)
    const contributorWorkflowCount = new Map<string, { name: string; dept: string; count: number; workflows: typeof tasks }>();
    for (const t of tasks) {
      for (const cId of t.contributors) {
        const c = contributors.find((x) => x.id === cId);
        if (!c) continue;
        if (!contributorWorkflowCount.has(cId)) {
          contributorWorkflowCount.set(cId, { name: c.name, dept: c.department, count: 0, workflows: [] });
        }
        const entry = contributorWorkflowCount.get(cId)!;
        entry.count++;
        entry.workflows.push(t);
      }
    }
    // Find contributor with most workflows
    const topContributor = [...contributorWorkflowCount.entries()].sort((a, b) => b[1].count - a[1].count)[0];
    if (topContributor && topContributor[1].count >= 3) {
      const [, info] = topContributor;
      result.push({
        id: "f-spof",
        person: info.name,
        text: `is involved in ${info.count} workflows`,
        title: `Single point of failure: ${info.name} (${info.dept})`,
        severity: "critical",
        description: `${info.name} is a key contributor to ${info.count} workflows in ${info.dept}. If they're unavailable, these workflows are at risk.`,
        impact: `${info.count} workflows depend on a single person.`,
        recommendation: `Document ${info.name}'s top processes, cross-train a backup, and automate where possible.`,
        relatedWorkflows: info.workflows.slice(0, 4).map((t) => ({ id: t.id, title: t.title, dept: t.department })),
      });
    }

    // Find highest-impact recommendations
    const criticalRecs = tasks
      .filter((t) => t.recommendation?.priority === "critical" && !t.isBottleneck)
      .sort((a, b) => {
        const costA = parseFloat((a.recommendation?.impact?.costSaved || "0").replace(/[^0-9.]/g, ""));
        const costB = parseFloat((b.recommendation?.impact?.costSaved || "0").replace(/[^0-9.]/g, ""));
        return costB - costA;
      });
    if (criticalRecs.length > 0) {
      const topRecs = criticalRecs.slice(0, 3);
      const totalSavings = topRecs.reduce((sum, t) => {
        return sum + parseFloat((t.recommendation?.impact?.costSaved || "0").replace(/[^0-9.]/g, ""));
      }, 0);
      result.push({
        id: "f-quick-wins",
        depts: [...new Set(topRecs.map((t) => t.department))],
        text: "have high-impact quick wins available",
        title: "Top AI automation opportunities identified",
        severity: "high",
        description: `${criticalRecs.length} workflows have critical-priority AI recommendations that can be implemented quickly for significant impact.`,
        impact: `${criticalRecs.length} workflows ready for immediate AI automation.`,
        recommendation: "Start with the highest-savings workflows to build momentum and demonstrate ROI.",
        relatedWorkflows: topRecs.map((t) => ({ id: t.id, title: t.title, dept: t.department })),
        estimatedSavings: totalSavings > 0 ? `$${Math.round(totalSavings).toLocaleString()}/year` : undefined,
      });
    }

    return result.slice(0, 3);
  }, [tasks, contributors]);

  // Derive recent activity from real interviews
  const recentActivity = useMemo(() => {
    return interviews
      .filter((iv: any) => iv.status === "completed" && iv.person)
      .slice(0, 5)
      .map((iv: any) => ({
        person: iv.person?.name || "Unknown",
        action: `completed their interview (${iv.workflowsExtracted || 0} workflows extracted)`,
        time: iv.completedAt
          ? formatTimeAgo(iv.completedAt)
          : iv.invitedAt
            ? formatTimeAgo(iv.invitedAt)
            : "",
      }));
  }, [interviews]);

  // Suggested questions based on real departments
  const suggestedQuestions = useMemo(() => {
    const depts = [...new Set(tasks.map((t) => t.department))].slice(0, 3);
    return depts.map((dept) => {
      const deptTasks = tasks.filter((t) => t.department === dept);
      const bottleneck = deptTasks.find((t) => t.isBottleneck);
      const label = bottleneck
        ? `How can AI help with ${bottleneck.title.toLowerCase()}?`
        : `What AI opportunities exist in ${dept}?`;
      return { dept, label };
    });
  }, [tasks]);

  const handleSend = () => {
    if (!chatInput.trim()) return;
    router.push(`/ai-assistant?q=${encodeURIComponent(chatInput.trim())}`);
  };

  return (
    <AppShell>
      <PageHeader title="Home" />
      <div className="flex-1 overflow-y-auto scroll-thin">
        <div className="max-w-3xl mx-auto px-8 py-8">

          <h2 className="text-xl font-semibold tracking-tight mb-6">{greeting}</h2>

          {/* Chat input */}
          <div className="mb-3">
            <div className="chat-border rounded-2xl p-1">
              <div className="bg-background rounded-[14px] p-4">
                <textarea
                  ref={inputRef}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={`Ask anything about ${company.name} ...`}
                  rows={3}
                  className="w-full bg-transparent text-[15px] placeholder:text-muted-light focus:outline-none resize-none leading-relaxed"
                />
                <div className="flex justify-end mt-1">
                  <button
                    onClick={handleSend}
                    disabled={!chatInput.trim()}
                    className="w-9 h-9 rounded-lg bg-foreground text-background flex items-center justify-center hover:bg-foreground/80 transition-colors disabled:opacity-20"
                  >
                    <Send className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Suggested questions */}
          <div className="flex flex-wrap gap-2 mb-12">
            {suggestedQuestions.map((q, i) => {
              const cfg = getDeptIcon(q.dept);
              return (
                <button key={i} onClick={() => { setChatInput(q.label); inputRef.current?.focus(); }} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] border border-border hover:border-muted-light transition-colors">
                  <span className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ background: cfg.bg }}><cfg.Icon className="w-2.5 h-2.5 text-white" strokeWidth={2} /></span>
                  {q.label}
                </button>
              );
            })}
          </div>

          {/* Top findings */}
          <div className="mb-10">
            <h3 className="text-[14px] font-semibold mb-4">Top findings</h3>
            {loading && <p className="text-[13px] text-muted-light">Loading...</p>}
            {!loading && findings.length === 0 && (
              <p className="text-[13px] text-muted-light">Complete more interviews to generate findings.</p>
            )}
            <div className="space-y-1">
              {findings.map((finding) => {
                const isOpen = expandedFinding === finding.id;
                const isFaded = expandedFinding !== null && !isOpen;
                return (
                  <div
                    key={finding.id}
                    className={`rounded-xl transition-all duration-300 ease-in-out ${
                      isFaded ? "opacity-50" : "opacity-100"
                    } ${
                      isOpen
                        ? "border border-border/60"
                        : "border border-transparent hover:bg-surface/70"
                    }`}
                  >
                    <button
                      onClick={() => setExpandedFinding(isOpen ? null : finding.id)}
                      className="w-full flex items-center gap-2.5 px-5 py-4 text-left"
                    >
                      <Sun className="w-4 h-4 text-pink-400 shrink-0" strokeWidth={1.5} />
                      <span className={`text-[13px] text-foreground ${isOpen ? "font-semibold" : "font-medium"}`}>{finding.title}</span>
                    </button>
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-5 pb-5">
                          <div className="ml-[30px] space-y-4">
                            <div>
                              <p className="text-[11px] font-medium text-muted-light uppercase tracking-widest mb-1.5">Details</p>
                              <p className="text-[13px] text-muted leading-relaxed">{finding.description}</p>
                            </div>
                            {finding.depts && finding.depts.length > 0 && (
                              <div>
                                <p className="text-[11px] font-medium text-muted-light uppercase tracking-widest mb-2">Departments</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {finding.depts.map((d) => <DeptChip key={d} dept={d} />)}
                                </div>
                              </div>
                            )}
                            {finding.person && (
                              <div>
                                <p className="text-[11px] font-medium text-muted-light uppercase tracking-widest mb-2">Contributors</p>
                                <PersonChip name={finding.person} />
                              </div>
                            )}
                            {finding.relatedWorkflows.length > 0 && (
                              <div>
                                <p className="text-[11px] font-medium text-muted-light uppercase tracking-widest mb-2">Related workflows</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {finding.relatedWorkflows.map((wf) => {
                                    const cfg = getDeptIcon(wf.dept);
                                    return (
                                      <Link key={wf.id} href={`/intelligence/${wf.id}`} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-border text-[11px] hover:border-muted-light transition-colors">
                                        <span className="w-3.5 h-3.5 rounded flex items-center justify-center shrink-0" style={{ background: cfg.bg }}><cfg.Icon className="w-2 h-2 text-white" strokeWidth={2} /></span>
                                        {wf.title}
                                      </Link>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent activity */}
          <div>
            <h3 className="text-[14px] font-semibold mb-4">Recent activity</h3>
            {loading && <p className="text-[13px] text-muted-light">Loading...</p>}
            {!loading && recentActivity.length === 0 && (
              <p className="text-[13px] text-muted-light">No recent activity yet.</p>
            )}
            <div className="space-y-0">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-border">
                  <div className="leading-relaxed">
                    <span className="inline align-middle mr-1.5"><PersonChip name={item.person} /></span>
                    <span className="text-[13px] align-middle">{item.action}</span>
                  </div>
                  {item.time && <span className="text-[12px] text-muted-light shrink-0 ml-4">{item.time}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} mins ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}
