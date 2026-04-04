"use client";

import AppShell from "@/components/AppShell";
import { mockIntelligence } from "@/lib/mock-data";

export default function RoadmapPage() {
  const data = mockIntelligence;

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto scroll-thin">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <h1 className="text-2xl font-semibold tracking-tight mb-2">Implementation Roadmap</h1>
          <p className="text-[14px] text-muted mb-8">
            A phased plan to make {data.company.name} intelligence-native.
            {" "}{data.recommendations.length} workflows across {data.roadmap.length} phases.
          </p>

          {/* Summary bar */}
          <div className="mb-10 p-5 rounded-2xl bg-surface border border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-medium">Overall Progress</span>
              <span className="text-[12px] text-muted">0 of {data.recommendations.length} implemented</span>
            </div>
            <div className="flex gap-1">
              {data.roadmap.map((phase) => (
                <div key={phase.phase} className="flex-1">
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-accent/30 rounded-full" style={{ width: "0%" }} />
                  </div>
                  <p className="text-[10px] text-muted-light mt-1 text-center">Phase {phase.phase}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Phases */}
          <div className="space-y-8">
            {data.roadmap.map((phase) => {
              const phaseRecs = data.recommendations.filter((r) => phase.recommendations.includes(r.id));
              const totalTimeSaved = phaseRecs.reduce((sum, r) => {
                const match = r.impact.timeSaved.match(/(\d+\.?\d*)/);
                return sum + (match ? parseFloat(match[1]) : 0);
              }, 0);

              return (
                <div key={phase.phase} className="rounded-2xl border border-border overflow-hidden">
                  {/* Phase header */}
                  <div className="p-5 bg-surface/50 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center text-[14px] font-bold">{phase.phase}</span>
                        <div>
                          <h2 className="text-[16px] font-semibold">{phase.name}</h2>
                          <p className="text-[12px] text-muted-light">{phase.duration}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[14px] font-bold text-green-600">~{totalTimeSaved} hrs/week</p>
                        <p className="text-[11px] text-muted-light">{phaseRecs.length} workflows</p>
                      </div>
                    </div>
                    <p className="mt-3 text-[13px] text-muted leading-relaxed">{phase.description}</p>
                  </div>

                  {/* Workflows in this phase */}
                  <div className="divide-y divide-border">
                    {phaseRecs.map((rec) => (
                      <div key={rec.id} className="p-4 flex items-center justify-between hover:bg-surface/30 transition-colors">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-[13px] font-semibold">{rec.title}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${rec.priority === "critical" ? "bg-red-50 text-red-700" : rec.priority === "high" ? "bg-amber-50 text-amber-700" : "bg-surface text-muted"}`}>{rec.priority}</span>
                          </div>
                          <p className="text-[12px] text-muted">{rec.department} · {rec.difficulty}</p>
                        </div>
                        <div className="flex items-center gap-4 text-[12px]">
                          <span className="text-muted">{rec.impact.timeSaved}</span>
                          <span className="font-medium text-green-600">{rec.impact.costSaved}</span>
                          <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden">
                            <div className="h-full bg-accent/30 rounded-full" style={{ width: "0%" }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Milestones */}
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
