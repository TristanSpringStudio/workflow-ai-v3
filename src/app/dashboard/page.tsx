"use client";

import { useState, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Activity, DollarSign, Megaphone, TrendingUp, Wrench, FlaskConical, PackageSearch, User, X, AlertTriangle, ArrowRight, Send, Users, Headphones } from "lucide-react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { useCompanyData } from "@/lib/company-data";

const DEPT_ICONS: Record<string, { Icon: typeof DollarSign; bg: string }> = {
  Sales: { Icon: DollarSign, bg: "#22c55e" }, Marketing: { Icon: Megaphone, bg: "#a855f7" },
  Finance: { Icon: TrendingUp, bg: "#3b52ce" }, Operations: { Icon: Wrench, bg: "#f59e0b" },
  Engineering: { Icon: FlaskConical, bg: "#6366f1" }, Product: { Icon: PackageSearch, bg: "#ec4899" },
  "Customer Success": { Icon: Headphones, bg: "#ca8a04" }, HR: { Icon: Users, bg: "#3b82f6" },
  IT: { Icon: Users, bg: "#dc2626" }, Support: { Icon: Headphones, bg: "#ca8a04" },
};

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
  const cfg = DEPT_ICONS[dept];
  if (!cfg) return <span className="px-2 py-0.5 rounded-md border border-border text-[11px]">{dept}</span>;
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
  const [activeFinding, setActiveFinding] = useState<Finding | null>(null);
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
              const cfg = DEPT_ICONS[q.dept];
              return (
                <button key={i} onClick={() => { setChatInput(q.label); inputRef.current?.focus(); }} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] border border-border hover:border-muted-light transition-colors">
                  {cfg && <span className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ background: cfg.bg }}><cfg.Icon className="w-2.5 h-2.5 text-white" strokeWidth={2} /></span>}
                  {q.label}
                </button>
              );
            })}
          </div>

          {/* Two columns */}
          <div className="grid grid-cols-2 gap-6">
            {/* Top findings */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-muted" strokeWidth={1.5} />
                <h3 className="text-[14px] font-semibold">Top findings</h3>
              </div>
              <div className="rounded-2xl border border-border p-5 space-y-6">
                {loading && <p className="text-[13px] text-muted-light">Loading...</p>}
                {!loading && findings.length === 0 && (
                  <p className="text-[13px] text-muted-light">Complete more interviews to generate findings.</p>
                )}
                {findings.map((finding, i) => (
                  <div key={finding.id}>
                    <button onClick={() => setActiveFinding(finding)} className="w-full text-left hover:bg-surface/50 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                      {finding.depts && !finding.person && (
                        <div className="inline">
                          {finding.depts.map((d) => <span key={d} className="inline-block mr-1.5 align-middle"><DeptChip dept={d} /></span>)}
                          <span className="text-[13px] font-medium align-middle">{finding.text}</span>
                        </div>
                      )}
                      {finding.person && (
                        <div>
                          <div className="inline">
                            <span className="inline-block mr-1.5 align-middle"><PersonChip name={finding.person} /></span>
                            <span className="text-[13px] font-medium align-middle">{finding.text}</span>
                          </div>
                        </div>
                      )}
                    </button>
                    {i < findings.length - 1 && <div className="mt-4" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent activity */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-muted" strokeWidth={1.5} />
                <h3 className="text-[14px] font-semibold">Recent activity</h3>
              </div>
              <div className="rounded-2xl border border-border p-5 space-y-4">
                {loading && <p className="text-[13px] text-muted-light">Loading...</p>}
                {!loading && recentActivity.length === 0 && (
                  <p className="text-[13px] text-muted-light">No recent activity yet.</p>
                )}
                {recentActivity.map((item, i) => (
                  <div key={i}>
                    <div className="leading-relaxed">
                      <span className="inline align-middle mr-1.5"><PersonChip name={item.person} /></span>
                      <span className="text-[13px] align-middle">{item.action}</span>
                    </div>
                    {item.time && <span className="text-[11px] text-muted-light mt-1 block">{item.time}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Finding modal */}
      {activeFinding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={() => setActiveFinding(null)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative w-full max-w-2xl max-h-[85vh] bg-background rounded-2xl border border-border shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="shrink-0 px-6 py-4 border-b border-border">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${activeFinding.severity === "critical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{activeFinding.severity}</span>
                    {activeFinding.estimatedSavings && <span className="text-[12px] font-semibold text-green-600">{activeFinding.estimatedSavings} potential savings</span>}
                  </div>
                  <h2 className="text-[17px] font-semibold">{activeFinding.title}</h2>
                </div>
                <button onClick={() => setActiveFinding(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-surface transition-colors shrink-0">
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto scroll-thin px-6 py-5 space-y-6">
              <p className="text-[14px] text-muted leading-relaxed">{activeFinding.description}</p>
              <div className="p-4 rounded-xl bg-red-50/50 border border-red-200/50">
                <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-red-500" strokeWidth={1.5} /><h3 className="text-[12px] font-semibold text-red-700 uppercase tracking-widest">Impact</h3></div>
                <p className="text-[13px] text-red-900/70">{activeFinding.impact}</p>
              </div>
              <div className="p-4 rounded-xl bg-accent/[0.03] border border-accent/10">
                <div className="flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-accent" strokeWidth={1.5} /><h3 className="text-[12px] font-semibold text-accent uppercase tracking-widest">Recommendation</h3></div>
                <p className="text-[13px] text-foreground/80">{activeFinding.recommendation}</p>
              </div>
              <div>
                <h3 className="text-[12px] font-semibold text-muted-light uppercase tracking-widest mb-3">Related workflows</h3>
                <div className="space-y-1.5">
                  {activeFinding.relatedWorkflows.map((wf) => {
                    const cfg = DEPT_ICONS[wf.dept];
                    const IconComp = cfg?.Icon || Wrench;
                    return (
                      <Link key={wf.id} href={`/intelligence/${wf.id}`} onClick={() => setActiveFinding(null)} className="group flex items-center gap-2.5 p-2.5 rounded-lg border border-border hover:border-muted-light transition-colors">
                        <span className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: cfg?.bg || "#6b7280" }}><IconComp className="w-3 h-3 text-white" strokeWidth={2} /></span>
                        <span className="text-[13px] group-hover:text-accent transition-colors">{wf.title}</span>
                        <ArrowRight className="w-3 h-3 text-muted-light ml-auto opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
