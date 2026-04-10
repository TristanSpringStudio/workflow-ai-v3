"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowRight, DollarSign, Megaphone, TrendingUp, Wrench, FlaskConical, PackageSearch, Users, Share2, Headphones, Building2 } from "lucide-react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { useCompanyData } from "@/lib/company-data";
import { matchesDeptSlug } from "@/lib/department-slug";

const DEPT_CONFIG: Record<string, { Icon: typeof DollarSign; bg: string }> = {
  Sales: { Icon: DollarSign, bg: "#22c55e" },
  Marketing: { Icon: Megaphone, bg: "#a855f7" },
  Finance: { Icon: TrendingUp, bg: "#3b52ce" },
  Operations: { Icon: Wrench, bg: "#f59e0b" },
  Engineering: { Icon: FlaskConical, bg: "#6366f1" },
  Product: { Icon: PackageSearch, bg: "#ec4899" },
  HR: { Icon: Users, bg: "#3b82f6" },
  IT: { Icon: Share2, bg: "#dc2626" },
  Support: { Icon: Headphones, bg: "#ca8a04" },
};

const DEFAULT_CONFIG = { Icon: Building2, bg: "#6b7280" };

// Parse a time string like "5 hrs/week" or "2.5 hours" → number of hours.
// Returns 0 if no number can be found.
function parseHours(s: string): number {
  const match = s.match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : 0;
}

export default function DepartmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { tasks, contributors, interviews, getDepartments, loading } = useCompanyData();

  const departments = getDepartments();
  // Resolve via the slug helper so "Customer Success" → "customer-success"
  // (and any other space/symbol-heavy name) round-trips correctly.
  const dept = departments.find((d) => matchesDeptSlug(d.name, slug));

  // While the initial company-data fetch is in flight, AppShell is already
  // showing a skeleton in place of `children`, so this component never
  // actually paints. Return a harmless shell to avoid calling notFound()
  // before the real data arrives.
  if (loading) {
    return (
      <AppShell>
        <div />
      </AppShell>
    );
  }

  if (!dept) notFound();

  // Case-insensitive department match so mixed-casing rows in the DB
  // ("Marketing" vs "marketing") still land under the same page.
  const deptKey = dept.name.trim().toLowerCase();
  const matchesDept = (raw: string | null | undefined) =>
    (raw || "").trim().toLowerCase() === deptKey;

  const cfg = DEPT_CONFIG[dept.name] || DEFAULT_CONFIG;
  const deptTasks = tasks.filter((t) => matchesDept(t.department));
  const deptContributors = contributors.filter((c) => matchesDept(c.department));
  const deptInterviews = interviews.filter((iv) => {
    const person = contributors.find((c) => c.id === iv.contributorId);
    return matchesDept(person?.department);
  });

  const bottlenecks = deptTasks.filter((t) => t.isBottleneck);
  const withRecs = deptTasks.filter((t) => t.recommendation);
  const totalTimeSpent = deptTasks.reduce((sum, t) => sum + parseHours(t.timeSpent), 0);
  const totalSaveable = withRecs.reduce((sum, t) => sum + parseHours(t.recommendation!.impact.timeSaved), 0);

  // Cross-department handoffs involving this dept
  const crossDeptFlows: { direction: "in" | "out"; otherDept: string; what: string }[] = [];
  deptTasks.forEach((task) => {
    task.inputs.forEach((io) => {
      if (departments.some((d) => d.name === io.fromOrTo) && !matchesDept(io.fromOrTo)) {
        crossDeptFlows.push({ direction: "in", otherDept: io.fromOrTo, what: io.what });
      }
    });
    task.outputs.forEach((io) => {
      if (departments.some((d) => d.name === io.fromOrTo) && !matchesDept(io.fromOrTo)) {
        crossDeptFlows.push({ direction: "out", otherDept: io.fromOrTo, what: io.what });
      }
    });
  });

  // Shared steps with other departments
  const sharedSteps: { step: string; otherWorkflow: string; otherDept: string; taskId: string }[] = [];
  deptTasks.forEach((task) => {
    task.steps.forEach((step) => {
      step.sharedWith?.forEach((sw) => {
        const otherTask = tasks.find((t) => t.id === sw.taskId);
        if (otherTask && !matchesDept(otherTask.department)) {
          sharedSteps.push({ step: step.title, otherWorkflow: sw.taskTitle, otherDept: otherTask.department, taskId: sw.taskId });
        }
      });
    });
  });

  const allPainPoints = deptTasks.flatMap((t) => t.painPoints);

  const formatHrs = (n: number) => {
    if (n === 0) return "—";
    // Show one decimal only if needed
    return Number.isInteger(n) ? `${n} hrs` : `${n.toFixed(1)} hrs`;
  };

  return (
    <AppShell>
      <PageHeader title={dept.name} />

      <div className="flex-1 overflow-y-auto scroll-thin">
        <div className="max-w-2xl mx-auto px-8 py-10">

          {/* Department profile header */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
              <cfg.Icon className="w-7 h-7 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-[22px] font-semibold tracking-tight">{dept.name}</h2>
              <p className="text-[13px] text-muted mt-0.5">
                {deptContributors.length} {deptContributors.length === 1 ? "person" : "people"}
                {" · "}
                {deptTasks.length} {deptTasks.length === 1 ? "workflow" : "workflows"}
                {deptInterviews.length > 0 && ` · ${deptInterviews.length} ${deptInterviews.length === 1 ? "interview" : "interviews"}`}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="border-t border-border" />
          <div className="grid grid-cols-3 py-6">
            <div>
              <p className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-1.5">Workflows</p>
              <p className="text-[15px] font-medium">{deptTasks.length}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-1.5">Weekly time</p>
              <p className="text-[15px] font-medium">{formatHrs(totalTimeSpent)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-1.5">Saveable</p>
              <p className={`text-[15px] font-medium ${totalSaveable > 0 ? "text-green-600" : ""}`}>{formatHrs(totalSaveable)}</p>
            </div>
          </div>
          <div className="border-t border-border mb-10" />

          {/* Team */}
          {deptContributors.length > 0 && (
            <div className="mb-10">
              <h3 className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-3">Team</h3>
              <div className="flex flex-wrap gap-1.5">
                {deptContributors.map((c) => {
                  const iv = deptInterviews.find((i) => i.contributorId === c.id);
                  const chipClass = "group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border hover:border-muted-light transition-colors text-[12px]";
                  const body = (
                    <>
                      <svg className="w-3 h-3 text-muted-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                      </svg>
                      <span className="group-hover:text-accent transition-colors">{c.name}</span>
                    </>
                  );
                  return iv ? (
                    <Link key={c.id} href={`/interviews/${iv.id}`} className={chipClass}>
                      {body}
                    </Link>
                  ) : (
                    <span key={c.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border text-[12px]">
                      {body}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Workflows */}
          {deptTasks.length > 0 && (
            <div className="mb-10">
              <h3 className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-3">Workflows</h3>
              <div className="flex flex-wrap gap-1.5">
                {deptTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/intelligence/${task.id}`}
                    className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${
                      task.isBottleneck
                        ? "border-red-200 hover:border-red-300 bg-red-50/40"
                        : "border-border hover:border-muted-light"
                    }`}
                  >
                    <div className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
                      <cfg.Icon className="w-2.5 h-2.5 text-white" strokeWidth={2} />
                    </div>
                    <span className="text-[12px] group-hover:text-accent transition-colors">{task.title}</span>
                    {task.isBottleneck && (
                      <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" strokeWidth={2} />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Pain points */}
          {allPainPoints.length > 0 && (
            <div className="mb-10">
              <h3 className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-3">Pain points</h3>
              <div className="rounded-2xl border border-border divide-y divide-border">
                {allPainPoints.map((pp, i) => (
                  <div key={i} className="flex gap-2.5 px-4 py-2.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span className="text-[13px] text-muted leading-relaxed">{pp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cross-team handoffs */}
          {crossDeptFlows.length > 0 && (
            <div className="mb-10">
              <h3 className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-3">Cross-team handoffs</h3>
              <div className="rounded-2xl border border-border divide-y divide-border">
                {crossDeptFlows.slice(0, 8).map((flow, i) => {
                  const otherCfg = DEPT_CONFIG[flow.otherDept] || DEFAULT_CONFIG;
                  return (
                    <div key={i} className="flex items-center gap-2 px-4 py-2.5 text-[12px]">
                      {flow.direction === "in" ? (
                        <>
                          <span className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ background: otherCfg.bg }}>
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
                          <span className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ background: otherCfg.bg }}>
                            <otherCfg.Icon className="w-2.5 h-2.5 text-white" strokeWidth={2} />
                          </span>
                          <span className="text-muted">{flow.otherDept}</span>
                        </>
                      )}
                      <span className="text-muted-light ml-auto truncate">{flow.what}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Shared steps */}
          {sharedSteps.length > 0 && (
            <div className="mb-10">
              <h3 className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-3">Shared steps with other teams</h3>
              <div className="flex flex-wrap gap-1.5">
                {sharedSteps.map((ss, i) => {
                  const otherCfg = DEPT_CONFIG[ss.otherDept] || DEFAULT_CONFIG;
                  return (
                    <Link
                      key={i}
                      href={`/intelligence/${ss.taskId}`}
                      className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border hover:border-muted-light transition-colors"
                    >
                      <div className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ background: otherCfg.bg }}>
                        <otherCfg.Icon className="w-2.5 h-2.5 text-white" strokeWidth={2} />
                      </div>
                      <span className="text-[12px] group-hover:text-accent transition-colors">{ss.otherWorkflow}</span>
                    </Link>
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
