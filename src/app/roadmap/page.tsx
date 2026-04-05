"use client";

import Link from "next/link";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { tasks, roadmap, company } from "@/lib/mock-data";

const PHASE_SUMMARIES: Record<number, { intro: string; rationale: string; expectedOutcome: string }> = {
  1: {
    intro: `Based on our assessment of ${company.name}'s operations, we've identified several high-impact workflows that can be improved immediately with minimal disruption. These "quick wins" are designed to build team confidence in AI-assisted processes while delivering measurable time savings from day one.`,
    rationale: "We're starting here because these workflows share three characteristics: they're highly repetitive (the same format every time), they involve data that's already digital (no manual digitization needed), and the people who do them are already frustrated with how long they take. This means adoption will be natural, not forced.",
    expectedOutcome: "By the end of Week 2, each team member involved should have reclaimed 2-5 hours per week. More importantly, they'll have experienced firsthand how AI augments their work rather than replacing it — setting the foundation for the deeper changes in Phase 2.",
  },
  2: {
    intro: `Phase 2 tackles the handoffs — the moments where work crosses department boundaries. Our interviews revealed that ${company.name}'s biggest time sinks aren't within departments, they're between them. Information gets re-entered, context gets lost, and people wait for other people to manually route things that could flow automatically.`,
    rationale: "Cross-department workflows are harder to change because they require coordination across teams. We're tackling them second (not first) because Phase 1 builds the trust and familiarity needed for teams to embrace changes that affect how they work with each other. The Sales-to-Operations handoff alone accounts for a 2-week onboarding delay that can be compressed to 3 days.",
    expectedOutcome: "By the end of Month 2, the primary bottlenecks identified in our assessment should be eliminated. Information will flow between departments without manual routing, and the 'waiting for someone to forward me the thing' pattern will be replaced with automated handoffs.",
  },
  3: {
    intro: `Phase 3 is the transformation phase — building the intelligence infrastructure that makes ${company.name} a fundamentally different kind of organization. This is where individual workflow improvements compound into a system-wide advantage. Instead of batch reporting (monthly closes, weekly compilations), you move to continuous intelligence.`,
    rationale: "We've saved this for last because it requires the technical foundation laid in Phases 1 and 2, plus organizational buy-in that comes from seeing real results. The financial close process, for example, can only be reimagined after the team has experienced AI-assisted workflows and trusts the system. This phase also has the highest ROI — the month-end close alone represents 20 hours of Finance time that can be reduced to exception-handling.",
    expectedOutcome: "By the end of Quarter 2, leadership will have real-time visibility into operations that previously required waiting for batch reports. The company world model — a continuously updated picture of how the business operates — will be the foundation for faster, better-informed decisions at every level.",
  },
};

export default function RoadmapPage() {
  return (
    <AppShell>
      <PageHeader title="Implementation Plan" />
      <div className="flex-1 overflow-y-auto scroll-thin">
        <div className="max-w-4xl mx-auto px-8 py-8">
          {/* Intro */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold tracking-tight mb-3">Your Implementation Roadmap</h2>
            <p className="text-[14px] text-muted leading-relaxed max-w-2xl">
              Based on {tasks.filter((t) => t.knowledge.length > 0).length} employee interviews across {new Set(tasks.map((t) => t.department)).size} departments,
              we&apos;ve built a phased plan to make {company.name} intelligence-native. Each phase builds on the previous one,
              moving from individual quick wins to cross-team optimization to full organizational transformation.
            </p>
          </div>

          {/* Phases */}
          <div className="space-y-10">
            {roadmap.map((phase) => {
              const phaseTasks = tasks.filter((t) => phase.taskIds.includes(t.id));
              const summary = PHASE_SUMMARIES[phase.phase];
              const totalTimeSaved = phaseTasks.reduce((sum, t) => {
                const match = t.recommendation?.impact.timeSaved.match(/(\d+\.?\d*)/);
                return sum + (match ? parseFloat(match[1]) : 0);
              }, 0);
              const totalCostSaved = phaseTasks.reduce((sum, t) => {
                const match = t.recommendation?.impact.costSaved.match(/\$([\d,]+)/);
                return sum + (match ? parseInt(match[1].replace(",", "")) : 0);
              }, 0);

              return (
                <div key={phase.phase} className="rounded-2xl border border-border overflow-hidden">
                  {/* Phase header */}
                  <div className="p-6 bg-surface/50 border-b border-border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center text-[15px] font-bold">{phase.phase}</span>
                        <div>
                          <h3 className="text-[17px] font-semibold">{phase.name}</h3>
                          <p className="text-[12px] text-muted-light">{phase.duration}</p>
                        </div>
                      </div>
                      <div className="flex gap-4 text-right">
                        <div>
                          <p className="text-[18px] font-bold text-green-600">{totalTimeSaved} hrs/wk</p>
                          <p className="text-[11px] text-muted-light">time saved</p>
                        </div>
                        <div>
                          <p className="text-[18px] font-bold text-green-600">${totalCostSaved.toLocaleString()}</p>
                          <p className="text-[11px] text-muted-light">annual savings</p>
                        </div>
                      </div>
                    </div>

                    {/* Rich summary */}
                    {summary && (
                      <div className="space-y-4 text-[13px] text-muted leading-relaxed">
                        <p>{summary.intro}</p>
                        <div className="p-4 rounded-xl bg-background border border-border">
                          <p className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-2">Why this order</p>
                          <p>{summary.rationale}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-green-50/50 border border-green-200/50">
                          <p className="text-[11px] font-semibold text-green-700 uppercase tracking-widest mb-2">Expected outcome</p>
                          <p className="text-green-900/70">{summary.expectedOutcome}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Workflows */}
                  <div className="divide-y divide-border">
                    {phaseTasks.map((task) => (
                      <Link key={task.id} href={`/intelligence/${task.id}`} className="group flex items-center justify-between p-4 hover:bg-surface/30 transition-colors">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="text-[13px] font-semibold group-hover:text-accent transition-colors">{task.title}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${task.recommendation?.priority === "critical" ? "bg-red-50 text-red-700" : task.recommendation?.priority === "high" ? "bg-amber-50 text-amber-700" : "bg-surface text-muted"}`}>
                              {task.recommendation?.priority}
                            </span>
                          </div>
                          <p className="text-[12px] text-muted">{task.department} · {task.recommendation?.difficulty}</p>
                        </div>
                        <div className="flex items-center gap-4 text-[12px] shrink-0">
                          <span className="text-muted">{task.recommendation?.impact.timeSaved}</span>
                          <span className="font-medium text-green-600">{task.recommendation?.impact.costSaved}</span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Milestones */}
                  <div className="p-4 bg-surface/30 border-t border-border">
                    <p className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-2">Milestones</p>
                    <div className="flex flex-wrap gap-2">
                      {phase.milestones.map((m, i) => (
                        <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] bg-background border border-border text-muted">
                          <span className="w-3 h-3 rounded-full border border-border" />
                          {m}
                        </span>
                      ))}
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
