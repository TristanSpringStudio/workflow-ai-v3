"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, PiggyBank, Clock, DollarSign, Megaphone, TrendingUp, Wrench, FlaskConical, PackageSearch, ClipboardList, Brain, Bot, Cpu, Sparkles } from "lucide-react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import ImplementationTray from "@/components/ImplementationTray";
import { tasks, roadmap, company } from "@/lib/mock-data";
import type { Task } from "@/lib/types";

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
  Sales: { Icon: DollarSign, bg: "#22c55e" }, Marketing: { Icon: Megaphone, bg: "#a855f7" },
  Finance: { Icon: TrendingUp, bg: "#3b52ce" }, Operations: { Icon: Wrench, bg: "#f59e0b" },
  Engineering: { Icon: FlaskConical, bg: "#6366f1" }, Product: { Icon: PackageSearch, bg: "#ec4899" },
};

const LEVEL_ICONS = [Brain, Sparkles, Bot, Cpu];
const LEVEL_COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#7c3aed"];

const LEVEL_SUMMARIES: Record<number, { summary: string; savings: string; implTime: string }> = {
  1: {
    summary: `At this level, individuals at ${company.name} start using AI as a thinking tool — for writing, research, and analysis. This is the entry point. No integrations needed. People use standalone AI tools to draft content, brainstorm ideas, and analyze information faster. The goal is to build familiarity and confidence with AI before embedding it into processes.`,
    savings: "$75,200/yr",
    implTime: "2 hours",
  },
  2: {
    summary: `Level 2 moves from standalone AI to AI embedded in ${company.name}'s daily workflows. AI now has company context — it knows your brand voice, your data sources, your processes. This is where cross-department handoffs get streamlined and the real time savings compound.`,
    savings: "$15,600/yr",
    implTime: "4 hours",
  },
  3: {
    summary: `At this level, AI agents handle recurring workflows at ${company.name} with human checkpoints built in. The agents run automatically — pulling data, generating reports, routing information — while humans review and approve. 10-40% of recurring work gets reclaimed.`,
    savings: "$28,800/yr",
    implTime: "8 hours",
  },
  4: {
    summary: `The final level: AI runs critical, complex workflows across ${company.name}. Multi-agent orchestration handles end-to-end processes that previously required multiple people and manual coordination. This is the intelligence-native operating model.`,
    savings: "$50,000/yr",
    implTime: "Ongoing",
  },
};

export default function RoadmapPage() {
  const [trayTask, setTrayTask] = useState<{ task: Task; label: string } | null>(null);

  return (
    <AppShell>
      <PageHeader title="Implementation Plan" />
      <div className="flex-1 overflow-y-auto scroll-thin">
        <div className="max-w-3xl mx-auto px-8 py-8">
          {/* Intro */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold tracking-tight mb-3">AI Transformation Roadmap</h2>
            <p className="text-[14px] text-muted leading-relaxed">
              Based on our assessment of {company.name}, we&apos;ve mapped your workflows against the
              AI Transformation Model — a 4-level framework for becoming AI-native. Each level builds
              on the previous one. Companies operate at multiple levels simultaneously — the goal is to
              move each workflow to its optimal level.
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
                  const levelData = LEVEL_SUMMARIES[phase.phase];
                  const LevelIcon = LEVEL_ICONS[phase.phase - 1] || Brain;
                  const levelColor = LEVEL_COLORS[phase.phase - 1] || "#6b7280";

                  return (
                    <div key={phase.phase} className="relative pl-12">
                      {/* Timeline dot */}
                      <div className="absolute left-0 top-0 w-8 h-8 rounded-lg flex items-center justify-center z-10" style={{ background: levelColor }}>
                        <LevelIcon className="w-4 h-4 text-white" strokeWidth={2} />
                      </div>

                      {/* Level header */}
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-[16px] font-semibold">
                          <span className="text-muted-light">Level {phase.phase}:</span> {phase.name}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-surface border border-border text-muted">
                          {phase.duration}
                        </span>
                      </div>

                      {/* Summary */}
                      <p className="text-[13px] text-muted leading-relaxed mb-6">
                        {levelData?.summary || phase.description}
                      </p>

                      {/* 2-column layout */}
                      <div className="space-y-4">
                        {/* Action items */}
                        {phaseTasks.length > 0 && (
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
                                const label = action?.label || task.title;
                                return (
                                  <button
                                    key={task.id}
                                    onClick={() => setTrayTask({ task, label })}
                                    className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border hover:border-muted-light transition-colors"
                                  >
                                    <div className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ background: deptIcon?.bg || "#6b7280" }}>
                                      <IconComponent className="w-2.5 h-2.5 text-white" strokeWidth={2} />
                                    </div>
                                    <span className="text-[12px] group-hover:text-accent transition-colors">{label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {phaseTasks.length === 0 && (
                          <div className="flex gap-6">
                            <div className="w-44 shrink-0 flex items-start gap-2 pt-1">
                              <Zap className="w-3.5 h-3.5 text-muted-light shrink-0 mt-0.5" strokeWidth={1.5} />
                              <span className="text-[13px] text-muted">Action items</span>
                            </div>
                            <span className="text-[12px] text-muted-light italic">More interviews needed to identify Level {phase.phase} opportunities</span>
                          </div>
                        )}

                        {/* Annual savings */}
                        <div className="flex gap-6">
                          <div className="w-44 shrink-0 flex items-center gap-2">
                            <PiggyBank className="w-3.5 h-3.5 text-muted-light shrink-0" strokeWidth={1.5} />
                            <span className="text-[13px] text-muted">Annual savings</span>
                          </div>
                          <span className="text-[14px] font-semibold">{levelData?.savings || "TBD"}</span>
                        </div>

                        {/* Implementation time */}
                        <div className="flex gap-6">
                          <div className="w-44 shrink-0 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-muted-light shrink-0" strokeWidth={1.5} />
                            <span className="text-[13px] text-muted">Estimated time</span>
                          </div>
                          <span className="text-[14px] font-semibold">{levelData?.implTime || "TBD"}</span>
                        </div>
                      </div>

                      {phaseIdx < roadmap.length - 1 && <div className="mt-8" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Implementation tray */}
      {trayTask && (
        <ImplementationTray task={trayTask.task} actionLabel={trayTask.label} onClose={() => setTrayTask(null)} />
      )}
    </AppShell>
  );
}
