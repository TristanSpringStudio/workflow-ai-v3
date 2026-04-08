"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Zap, AlertTriangle, ArrowRight, Sparkles, DollarSign, Megaphone, TrendingUp, Wrench, FlaskConical, PackageSearch, Users, Share2, Headphones, Building2 } from "lucide-react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { tasks, contributors, getDepartments, interviews } from "@/lib/mock-data";

const DEPT_CONFIG: Record<string, { Icon: typeof DollarSign; bg: string; color: string }> = {
  Sales: { Icon: DollarSign, bg: "#22c55e", color: "#166534" },
  Marketing: { Icon: Megaphone, bg: "#a855f7", color: "#6b21a8" },
  Finance: { Icon: TrendingUp, bg: "#3b52ce", color: "#1e3a8a" },
  Operations: { Icon: Wrench, bg: "#f59e0b", color: "#92400e" },
  Engineering: { Icon: FlaskConical, bg: "#6366f1", color: "#3730a3" },
  Product: { Icon: PackageSearch, bg: "#ec4899", color: "#9d174d" },
  HR: { Icon: Users, bg: "#3b82f6", color: "#1e40af" },
  IT: { Icon: Share2, bg: "#dc2626", color: "#991b1b" },
  Support: { Icon: Headphones, bg: "#ca8a04", color: "#713f12" },
};

const DEFAULT_CONFIG = { Icon: Building2, bg: "#6b7280", color: "#374151" };

export default function DepartmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const deptName = slug.charAt(0).toUpperCase() + slug.slice(1);

  const departments = getDepartments();
  const dept = departments.find((d) => d.name.toLowerCase() === slug);
  if (!dept) notFound();

  const cfg = DEPT_CONFIG[dept.name] || DEFAULT_CONFIG;
  const deptTasks = tasks.filter((t) => t.department === dept.name);
  const deptContributors = contributors.filter((c) => c.department === dept.name);
  const deptInterviews = interviews.filter((iv) => {
    const person = contributors.find((c) => c.id === iv.contributorId);
    return person?.department === dept.name;
  });

  const bottlenecks = deptTasks.filter((t) => t.isBottleneck);
  const withRecs = deptTasks.filter((t) => t.recommendation);
  const totalTimeSpent = deptTasks.reduce((sum, t) => {
    const match = t.timeSpent.match(/(\d+\.?\d*)/);
    return sum + (match ? parseFloat(match[1]) : 0);
  }, 0);
  const totalSaveable = withRecs.reduce((sum, t) => {
    const match = t.recommendation!.impact.timeSaved.match(/(\d+\.?\d*)/);
    return sum + (match ? parseFloat(match[1]) : 0);
  }, 0);

  // Cross-department handoffs involving this dept
  const crossDeptFlows: { task: typeof tasks[0]; direction: "in" | "out"; otherDept: string; what: string }[] = [];
  deptTasks.forEach((task) => {
    task.inputs.forEach((io) => {
      if (departments.some((d) => d.name === io.fromOrTo) && io.fromOrTo !== dept.name) {
        crossDeptFlows.push({ task, direction: "in", otherDept: io.fromOrTo, what: io.what });
      }
    });
    task.outputs.forEach((io) => {
      if (departments.some((d) => d.name === io.fromOrTo) && io.fromOrTo !== dept.name) {
        crossDeptFlows.push({ task, direction: "out", otherDept: io.fromOrTo, what: io.what });
      }
    });
  });

  // Shared steps with other departments
  const sharedSteps: { step: string; otherWorkflow: string; otherDept: string; taskId: string }[] = [];
  deptTasks.forEach((task) => {
    task.steps.forEach((step) => {
      step.sharedWith?.forEach((sw) => {
        const otherTask = tasks.find((t) => t.id === sw.taskId);
        if (otherTask && otherTask.department !== dept.name) {
          sharedSteps.push({ step: step.title, otherWorkflow: sw.taskTitle, otherDept: otherTask.department, taskId: sw.taskId });
        }
      });
    });
  });

  // Pain points aggregated
  const allPainPoints = deptTasks.flatMap((t) => t.painPoints);

  return (
    <AppShell>
      <PageHeader title={dept.name} />

      <div className="flex-1 overflow-y-auto scroll-thin">
        <div className="max-w-4xl mx-auto px-8 py-8">

          {/* Department profile */}
          <div className="flex items-start gap-5 mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: cfg.bg }}>
              <cfg.Icon className="w-7 h-7 text-white" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold tracking-tight">{dept.name}</h2>
              <p className="text-[13px] text-muted mt-0.5">{deptTasks.length} workflows · {deptContributors.length} people · {deptInterviews.length} interviews completed</p>

              {/* Readiness bar */}
              <div className="flex items-center gap-3 mt-3">
                <div className="w-32 h-1.5 bg-border rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${dept.aiReadiness >= 60 ? "bg-green-500" : dept.aiReadiness >= 40 ? "bg-amber-500" : "bg-red-400"}`} style={{ width: `${dept.aiReadiness}%` }} />
                </div>
                <span className={`text-[12px] font-semibold ${dept.aiReadiness >= 60 ? "text-green-600" : dept.aiReadiness >= 40 ? "text-amber-500" : "text-red-500"}`}>
                  {Math.round(dept.aiReadiness)} AI readiness
                </span>
              </div>
            </div>
          </div>

          {/* Stats as data rows */}
          <div className="mb-8">
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <span className="text-[12px] text-muted">Workflows mapped</span>
              <span className="text-[12px] font-semibold">{deptTasks.length}</span>
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <span className="text-[12px] text-muted">Weekly time spent</span>
              <span className="text-[12px] font-semibold">{totalTimeSpent} hrs</span>
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <span className="text-[12px] text-muted">Saveable per week</span>
              <span className="text-[12px] font-semibold text-green-600">{totalSaveable} hrs</span>
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <span className="text-[12px] text-muted">Bottlenecks</span>
              <span className={`text-[12px] font-semibold ${bottlenecks.length > 0 ? "text-red-500" : ""}`}>{bottlenecks.length}</span>
            </div>
          </div>

          {/* Team */}
          <div className="mb-8">
            <h3 className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-3">Team</h3>
            {deptContributors.map((c) => {
              const iv = deptInterviews.find((i) => i.contributorId === c.id);
              return (
                <Link
                  key={c.id}
                  href={iv ? `/interviews/${iv.id}` : "/interviews"}
                  className="group flex items-center justify-between py-2.5 border-b border-border last:border-0 hover:bg-surface/50 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border text-[12px] group-hover:border-accent/30 transition-colors">
                    <svg className="w-3 h-3 text-muted-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" /></svg>
                    {c.name}
                  </span>
                  <span className="text-[11px] text-muted-light">{c.role} · AI: {c.aiComfort}</span>
                </Link>
              );
            })}
          </div>

          {/* Workflows */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold">Workflows</h3>
              <Link href="/intelligence" className="text-[11px] text-accent hover:text-accent-hover">View all →</Link>
            </div>
            <div className="space-y-2">
              {deptTasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/intelligence/${task.id}`}
                  className="group flex items-center justify-between p-4 rounded-xl border border-border hover:border-muted-light transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: cfg.bg }}>
                      <cfg.Icon className="w-3 h-3 text-white" strokeWidth={2} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-[13px] font-medium group-hover:text-accent transition-colors">{task.title}</h4>
                        {task.isBottleneck && <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-red-50 text-red-700">Bottleneck</span>}
                        {task.recommendation && !task.isBottleneck && <Sparkles className="w-3 h-3 text-accent" strokeWidth={1.5} />}
                      </div>
                      <p className="text-[11px] text-muted-light">{task.frequency} · {task.timeSpent}</p>
                    </div>
                  </div>
                  {task.recommendation && (
                    <span className="text-[12px] font-semibold text-green-600 shrink-0">{task.recommendation.impact.timeSaved} saveable</span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Two columns: Pain points + Cross-dept handoffs */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Pain points */}
            <div>
              <h3 className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-3">Pain points</h3>
              {allPainPoints.length > 0 ? (
                <div>
                  {allPainPoints.map((pp, i) => (
                    <div key={i} className="flex gap-2 py-2 border-b border-border last:border-0">
                      <AlertTriangle className="w-3 h-3 text-red-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span className="text-[12px] text-muted">{pp}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-muted-light py-4 text-center">No pain points captured yet</p>
              )}
            </div>

            {/* Cross-dept handoffs */}
            <div>
              <h3 className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-3">Cross-team handoffs</h3>
              {crossDeptFlows.length > 0 ? (
                <div>
                  {crossDeptFlows.slice(0, 6).map((flow, i) => {
                    const otherCfg = DEPT_CONFIG[flow.otherDept] || DEFAULT_CONFIG;
                    return (
                      <div key={i} className="flex items-center gap-2 py-2.5 border-b border-border last:border-0 text-[12px]">
                        {flow.direction === "in" ? (
                          <>
                            <span className="w-4 h-4 rounded flex items-center justify-center" style={{ background: otherCfg.bg }}>
                              <otherCfg.Icon className="w-2.5 h-2.5 text-white" strokeWidth={2} />
                            </span>
                            <span className="text-muted">{flow.otherDept}</span>
                            <ArrowRight className="w-3 h-3 text-muted-light" strokeWidth={1.5} />
                            <span className="font-medium">{dept.name}</span>
                          </>
                        ) : (
                          <>
                            <span className="font-medium">{dept.name}</span>
                            <ArrowRight className="w-3 h-3 text-muted-light" strokeWidth={1.5} />
                            <span className="w-4 h-4 rounded flex items-center justify-center" style={{ background: otherCfg.bg }}>
                              <otherCfg.Icon className="w-2.5 h-2.5 text-white" strokeWidth={2} />
                            </span>
                            <span className="text-muted">{flow.otherDept}</span>
                          </>
                        )}
                        <span className="text-muted-light ml-auto">{flow.what}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[12px] text-muted-light py-4 text-center">No cross-team handoffs</p>
              )}
            </div>
          </div>

          {/* Shared steps */}
          {sharedSteps.length > 0 && (
            <div>
              <h3 className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-3">Shared steps with other departments</h3>
              <div>
                {sharedSteps.map((ss, i) => {
                  const otherCfg = DEPT_CONFIG[ss.otherDept] || DEFAULT_CONFIG;
                  return (
                    <div key={i} className="flex items-center gap-2 py-2.5 border-b border-border last:border-0 text-[12px]">
                      <span className="font-medium">{ss.step}</span>
                      <span className="text-muted-light">also used in</span>
                      <Link href={`/intelligence/${ss.taskId}`} className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border hover:border-muted-light transition-colors">
                        <div className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ background: otherCfg.bg }}>
                          <otherCfg.Icon className="w-2.5 h-2.5 text-white" strokeWidth={2} />
                        </div>
                        <span className="group-hover:text-accent transition-colors">{ss.otherWorkflow}</span>
                      </Link>
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
