"use client";

import Link from "next/link";
import { Play, DollarSign, Megaphone, TrendingUp, Wrench, FlaskConical, PackageSearch, Clock, BadgeDollarSign } from "lucide-react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { tasks, roadmap, company } from "@/lib/mock-data";

// Transformational action item names
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

const PHASE_DATA: Record<number, { title: string; summary: string; metrics: { label: string; value: string }[] }> = {
  1: {
    title: "Build the foundation",
    summary: `Based on our interviews across ${company.name}, we've identified high-impact workflows that can be improved immediately with minimal disruption. These quick wins are designed to build team confidence in AI-assisted processes while delivering measurable time savings from day one. Each phase builds on the previous one, moving from individual quick wins to cross-team optimization to full organizational transformation.`,
    metrics: [
      { label: "Savings", value: "$75,200/yr" },
      { label: "Time saved", value: "26 hrs/wk" },
      { label: "ROI", value: "4.2x" },
    ],
  },
  2: {
    title: "Cross-team optimization",
    summary: `Phase 2 tackles the handoffs — the moments where work crosses department boundaries at ${company.name}. Our interviews revealed that the biggest time sinks aren't within departments, they're between them. Information gets re-entered, context gets lost, and people wait for manual routing that could flow automatically.`,
    metrics: [
      { label: "Savings", value: "$15,600/yr" },
      { label: "Time saved", value: "3 hrs/client" },
      { label: "Onboarding", value: "2wk → 3d" },
    ],
  },
  3: {
    title: "Transformation",
    summary: `Building the intelligence infrastructure that makes ${company.name} a fundamentally different kind of organization. This is where individual workflow improvements compound into a system-wide advantage. Instead of batch reporting (monthly closes, weekly compilations), you move to continuous intelligence.`,
    metrics: [
      { label: "Savings", value: "$28,800/yr" },
      { label: "Time saved", value: "20 hrs/mo" },
      { label: "Close time", value: "5d → 1d" },
    ],
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

          {/* Phases */}
          <div className="space-y-8">
            {roadmap.map((phase) => {
              const phaseTasks = tasks.filter((t) => phase.taskIds.includes(t.id));
              const data = PHASE_DATA[phase.phase];

              return (
                <div key={phase.phase} className="rounded-2xl border border-border overflow-hidden">
                  <div className="p-6">
                    {/* Phase header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                        <Play className="w-3.5 h-3.5 text-white" fill="white" />
                      </div>
                      <h3 className="text-[16px] font-semibold">
                        Step {phase.phase}: {data?.title || phase.name}
                      </h3>
                    </div>

                    {/* Summary */}
                    <p className="text-[13px] text-muted leading-relaxed mb-6">
                      {data?.summary || phase.description}
                    </p>

                    <hr className="border-border mb-5" />

                    {/* Action items */}
                    <div className="mb-6">
                      <h4 className="text-[13px] font-semibold mb-3">Action items</h4>
                      <div className="space-y-2">
                        {phaseTasks.map((task) => {
                          const action = ACTION_LABELS[task.id];
                          const deptIcon = DEPT_ICONS[action?.dept || task.department];
                          const IconComponent = deptIcon?.Icon || Wrench;

                          return (
                            <Link
                              key={task.id}
                              href={`/intelligence/${task.id}`}
                              className="group flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border hover:border-muted-light transition-colors w-fit"
                            >
                              <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: deptIcon?.bg || "#6b7280" }}>
                                <IconComponent className="w-3 h-3 text-white" strokeWidth={2} />
                              </div>
                              <span className="text-[13px] group-hover:text-accent transition-colors">
                                {action?.label || task.title}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    <hr className="border-border mb-5" />

                    {/* Projected Impact */}
                    <div>
                      <h4 className="text-[13px] font-semibold mb-3">Projected Impact</h4>
                      <div className="grid grid-cols-3 gap-6">
                        {(data?.metrics || []).map((metric, i) => (
                          <div key={i}>
                            <p className="text-[11px] text-muted-light">{metric.label}</p>
                            <p className="text-[17px] font-bold mt-0.5">{metric.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
