"use client";

import Link from "next/link";
import { Zap, PiggyBank, Clock, DollarSign, Megaphone, TrendingUp, Wrench, FlaskConical, PackageSearch, ClipboardList } from "lucide-react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { tasks, roadmap, company } from "@/lib/mock-data";

const ACTION_LABELS: Record<string, { label: string; dept: string }> = {
  t1: { label: "Automate weekly performance reporting", dept: "Marketing" },
  t2: { label: "AI-powered sales outreach at scale", dept: "Sales" },
  t3: { label: "Streamline client onboarding handoff", dept: "Operations" },
  t4: { label: "AI-assisted PRD writing and sprint planning", dept: "Product" },
  t5: { label: "Automate P&L and financial close", dept: "Finance" },
  t6: { label: "Replace status meetings with async updates", dept: "Operations" },
  t7: { label: "Generate campaign briefs from bullet points", dept: "Marketing" },
  t8: { label: "Convert tribal knowledge into documented SOPs", dept: "Operations" },
  t15: { label: "Auto-generate release notes from PRs", dept: "Engineering" },
  t16: { label: "AI-powered user research synthesis", dept: "Product" },
};

const DEPT_ICONS: Record<string, { Icon: typeof DollarSign; bg: string }> = {
  Sales: { Icon: DollarSign, bg: "#22c55e" },
  Marketing: { Icon: Megaphone, bg: "#a855f7" },
  Finance: { Icon: TrendingUp, bg: "#3b52ce" },
  Operations: { Icon: Wrench, bg: "#f59e0b" },
  Engineering: { Icon: FlaskConical, bg: "#6366f1" },
  Product: { Icon: PackageSearch, bg: "#ec4899" },
};

const PHASE_DATA: Record<number, { title: string; timeline: string; iconBg: string; summary: string; savings: string; implTime: string }> = {
  1: {
    title: "Build the foundation",
    timeline: "This week",
    iconBg: "#2563eb",
    summary: `Based on our interviews across ${company.name}, we've identified high-impact workflows that can be improved immediately with minimal disruption. Each phase builds on the previous one, moving from individual quick wins to cross-team optimization to full organizational transformation.`,
    savings: "$75,200/yr",
    implTime: "2 hours",
  },
  2: {
    title: "Cross-team optimization",
    timeline: "Next week",
    iconBg: "#6366f1",
    summary: `Phase 2 tackles the handoffs — the moments where work crosses department boundaries at ${company.name}. Our interviews revealed that the biggest time sinks aren't within departments, they're between them. Information gets re-entered, context gets lost, and people wait for manual routing.`,
    savings: "$15,600/yr",
    implTime: "4 hours",
  },
  3: {
    title: "Transformation",
    timeline: "Next month",
    iconBg: "#7c3aed",
    summary: `Building the intelligence infrastructure that makes ${company.name} a fundamentally different kind of organization. This is where individual workflow improvements compound into a system-wide advantage. Instead of batch reporting (monthly closes, weekly compilations), you move to continuous intelligence.`,
    savings: "$28,800/yr",
    implTime: "8 hours",
  },
};

export default function RoadmapPage() {
  return (
    <AppShell>
      <PageHeader title="Implementation Plan" />
      <div className="flex-1 overflow-y-auto scroll-thin">
        <div className="max-w-3xl mx-auto px-8 py-8">
          {/* Intro */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold tracking-tight mb-3">Your Implementation Roadmap</h2>
            <p className="text-[14px] text-muted leading-relaxed">
              Based on {tasks.filter((t) => t.knowledge.length > 0).length} employee interviews across {new Set(tasks.map((t) => t.department)).size} departments,
              we&apos;ve built a phased plan to make {company.name} intelligence-native. Each phase builds
              on the previous one, moving from individual quick wins to cross-team optimization to full
              organizational transformation.
            </p>
          </div>

          {/* Timeline */}
          <div className="rounded-2xl border border-border p-8">
            <div className="relative">
              {/* Vertical connecting line */}
              <div className="absolute left-[15px] top-8 bottom-8 w-px bg-border" />

              <div className="space-y-10">
                {roadmap.map((phase, phaseIdx) => {
                  const phaseTasks = tasks.filter((t) => phase.taskIds.includes(t.id));
                  const data = PHASE_DATA[phase.phase];

                  return (
                    <div key={phase.phase} className="relative pl-12">
                      {/* Timeline dot */}
                      <div className="absolute left-0 top-0 w-8 h-8 rounded-lg flex items-center justify-center z-10" style={{ background: data?.iconBg || "#6b7280" }}>
                        <ClipboardList className="w-4 h-4 text-white" strokeWidth={2} />
                      </div>

                      {/* Phase header */}
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-[16px] font-semibold">{data?.title || phase.name}</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-surface border border-border text-muted">
                          {data?.timeline || phase.duration}
                        </span>
                      </div>

                      {/* Summary */}
                      <p className="text-[13px] text-muted leading-relaxed mb-6">
                        {data?.summary || phase.description}
                      </p>

                      {/* 2-column layout: labels left, values right */}
                      <div className="space-y-4">
                        {/* Action items */}
                        <div className="flex gap-6">
                          <div className="w-44 shrink-0 flex items-start gap-2 pt-1">
                            <Zap className="w-3.5 h-3.5 text-muted-light shrink-0 mt-0.5" strokeWidth={1.5} />
                            <span className="text-[13px] text-muted">Action items</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {phaseTasks.map((task) => {
                              const action = ACTION_LABELS[task.id];
                              const deptIcon = DEPT_ICONS[action?.dept || task.department];
                              const IconComponent = deptIcon?.Icon || Wrench;
                              return (
                                <Link
                                  key={task.id}
                                  href={`/intelligence/${task.id}`}
                                  className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border hover:border-muted-light transition-colors"
                                >
                                  <div className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ background: deptIcon?.bg || "#6b7280" }}>
                                    <IconComponent className="w-2.5 h-2.5 text-white" strokeWidth={2} />
                                  </div>
                                  <span className="text-[12px] group-hover:text-accent transition-colors">
                                    {action?.label || task.title}
                                  </span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>

                        {/* Annual savings */}
                        <div className="flex gap-6">
                          <div className="w-44 shrink-0 flex items-center gap-2">
                            <PiggyBank className="w-3.5 h-3.5 text-muted-light shrink-0" strokeWidth={1.5} />
                            <span className="text-[13px] text-muted">Annual savings</span>
                          </div>
                          <span className="text-[14px] font-semibold">{data?.savings}</span>
                        </div>

                        {/* Implementation time */}
                        <div className="flex gap-6">
                          <div className="w-44 shrink-0 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-muted-light shrink-0" strokeWidth={1.5} />
                            <span className="text-[13px] text-muted">Estimated implementation time</span>
                          </div>
                          <span className="text-[14px] font-semibold">{data?.implTime}</span>
                        </div>
                      </div>

                      {/* Divider between phases (not after last) */}
                      {phaseIdx < roadmap.length - 1 && (
                        <div className="mt-8" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
