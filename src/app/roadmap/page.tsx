"use client";

import Link from "next/link";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { tasks, roadmap, company } from "@/lib/mock-data";

export default function RoadmapPage() {
  return (
    <AppShell>
      <PageHeader title="Implementation Plan" />
      <div className="flex-1 overflow-y-auto scroll-thin">
        <div className="max-w-4xl mx-auto px-8 py-8">

          <div className="space-y-8">
            {roadmap.map((phase) => {
              const phaseTasks = tasks.filter((t) => phase.taskIds.includes(t.id));
              return (
                <div key={phase.phase} className="rounded-2xl border border-border overflow-hidden">
                  <div className="p-5 bg-surface/50 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center text-[14px] font-bold">{phase.phase}</span>
                        <div>
                          <h2 className="text-[16px] font-semibold">{phase.name}</h2>
                          <p className="text-[12px] text-muted-light">{phase.duration}</p>
                        </div>
                      </div>
                      <span className="text-[13px] text-muted">{phaseTasks.length} tasks</span>
                    </div>
                    <p className="mt-3 text-[13px] text-muted">{phase.description}</p>
                  </div>

                  <div className="divide-y divide-border">
                    {phaseTasks.map((task) => (
                      <Link key={task.id} href={`/intelligence/${task.id}`} className="group flex items-center justify-between p-4 hover:bg-surface/30 transition-colors">
                        <div>
                          <h3 className="text-[13px] font-semibold group-hover:text-accent transition-colors">{task.title}</h3>
                          <p className="text-[12px] text-muted">{task.department} · {task.recommendation?.difficulty}</p>
                        </div>
                        <div className="flex items-center gap-4 text-[12px]">
                          <span className="text-muted">{task.recommendation?.impact.timeSaved}</span>
                          <span className="font-medium text-green-600">{task.recommendation?.impact.costSaved}</span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="p-4 bg-surface/30 border-t border-border">
                    <p className="text-[11px] font-semibold text-muted-light uppercase tracking-wide mb-2">Milestones</p>
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
