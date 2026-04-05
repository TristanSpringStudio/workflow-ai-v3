"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { tasks } from "@/lib/mock-data";

export default function RecommendationsPage() {
  const [filter, setFilter] = useState<"all" | "critical" | "high" | "medium">("all");
  const recsWithTasks = tasks.filter((t) => t.recommendation);
  const filtered = filter === "all" ? recsWithTasks : recsWithTasks.filter((t) => t.recommendation?.priority === filter);

  const totalTimeSaved = recsWithTasks.reduce((sum, t) => {
    const match = t.recommendation!.impact.timeSaved.match(/(\d+\.?\d*)/);
    return sum + (match ? parseFloat(match[1]) : 0);
  }, 0);

  return (
    <AppShell>
      <PageHeader title="Recommendations" subtitle={`${recsWithTasks.length} opportunities · ${totalTimeSaved} hrs/week potential savings`} />
      <div className="flex-1 overflow-y-auto scroll-thin">
        <div className="max-w-4xl mx-auto px-8 py-8">

          {/* Filter */}
          <div className="flex gap-2 mb-6">
            {(["all", "critical", "high", "medium"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-[12px] font-medium capitalize transition-colors ${filter === f ? "bg-foreground text-background" : "bg-surface border border-border text-muted hover:text-foreground"}`}>
                {f} {f !== "all" && `(${recsWithTasks.filter((t) => t.recommendation?.priority === f).length})`}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map((task) => {
              const rec = task.recommendation!;
              return (
                <Link key={task.id} href={`/intelligence/${task.id}`} className="group block p-5 rounded-2xl border border-border hover:border-muted-light transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[14px] font-semibold group-hover:text-accent transition-colors">{task.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${rec.priority === "critical" ? "bg-red-50 text-red-700" : rec.priority === "high" ? "bg-amber-50 text-amber-700" : "bg-surface text-muted"}`}>{rec.priority}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface text-muted border border-border">Phase {rec.phase}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface text-muted border border-border">{task.department}</span>
                      </div>
                      <p className="text-[12px] text-muted">{rec.summary}</p>
                      <div className="mt-2 flex gap-4 text-[11px] text-muted-light">
                        <span>{rec.difficulty}</span>
                        <span>{task.steps.length} steps → {rec.newSteps.length} steps</span>
                        <span>{rec.aiHandles.length} AI tasks · {rec.humanDecides.length} human decisions</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[15px] font-bold text-green-600">{rec.impact.timeSaved}</p>
                      <p className="text-[11px] text-green-600">{rec.impact.costSaved}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
