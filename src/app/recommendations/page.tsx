"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import FlowCanvas from "@/components/FlowCanvas";
import { mockIntelligence } from "@/lib/mock-data";
import { buildWorkflowFlow } from "@/lib/flow-helpers";
import type { WorkflowRecommendation } from "@/lib/types";

export default function RecommendationsPage() {
  const data = mockIntelligence;
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "critical" | "high" | "medium">("all");

  const filtered = filter === "all" ? data.recommendations : data.recommendations.filter((r) => r.priority === filter);

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto scroll-thin">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <h1 className="text-2xl font-semibold tracking-tight mb-2">Recommendations</h1>
          <p className="text-[14px] text-muted mb-6">{data.recommendations.length} AI workflow opportunities identified</p>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl border border-border text-center">
              <p className="text-2xl font-bold">{data.estimatedSavings.hoursPerWeek}</p>
              <p className="text-[12px] text-muted">Hours saved / week</p>
            </div>
            <div className="p-4 rounded-xl border border-border text-center">
              <p className="text-2xl font-bold text-green-600">${(data.estimatedSavings.annualCost / 1000).toFixed(0)}K</p>
              <p className="text-[12px] text-muted">Annual savings</p>
            </div>
            <div className="p-4 rounded-xl border border-border text-center">
              <p className="text-2xl font-bold">{data.recommendations.length}</p>
              <p className="text-[12px] text-muted">Workflows identified</p>
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-2 mb-6">
            {(["all", "critical", "high", "medium"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-[12px] font-medium capitalize transition-colors ${filter === f ? "bg-foreground text-background" : "bg-surface border border-border text-muted hover:text-foreground"}`}>
                {f} {f !== "all" && `(${data.recommendations.filter((r) => r.priority === f).length})`}
              </button>
            ))}
          </div>

          {/* Recommendations */}
          <div className="space-y-3">
            {filtered.map((rec) => (
              <div key={rec.id} className="rounded-2xl border border-border overflow-hidden">
                <button
                  onClick={() => setExpanded(expanded === rec.id ? null : rec.id)}
                  className="w-full text-left p-5 hover:bg-surface/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[14px] font-semibold">{rec.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${rec.priority === "critical" ? "bg-red-50 text-red-700" : rec.priority === "high" ? "bg-amber-50 text-amber-700" : "bg-surface text-muted"}`}>{rec.priority}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface text-muted border border-border">Phase {rec.phase}</span>
                        {rec.crossDepartment && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-700">Cross-dept</span>}
                      </div>
                      <p className="text-[12px] text-muted">{rec.department} · {rec.difficulty} · {rec.impact.timeSaved} saved</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] font-bold text-green-600">{rec.impact.costSaved}</span>
                      <svg className={`w-4 h-4 text-muted transition-transform ${expanded === rec.id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </button>

                {expanded === rec.id && (
                  <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
                    <p className="text-[13px] text-muted leading-relaxed">{rec.description}</p>

                    {/* Workflow Canvas */}
                    {(() => {
                      const { nodes, edges } = buildWorkflowFlow(rec);
                      const canvasHeight = Math.max(500, nodes.length * 100 + 100);
                      return <FlowCanvas nodes={nodes} edges={edges} height={canvasHeight} />;
                    })()}

                    {/* Trigger + Output */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200/50">
                        <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide mb-0.5">Trigger</p>
                        <p className="text-[12px] text-amber-900/80">{rec.trigger}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-green-50/50 border border-green-200/50">
                        <p className="text-[10px] font-semibold text-green-700 uppercase tracking-wide mb-0.5">Output</p>
                        <p className="text-[12px] text-green-900/80">{rec.output}</p>
                      </div>
                    </div>

                    {/* Steps */}
                    <div>
                      <p className="text-[11px] font-semibold text-muted-light uppercase tracking-wide mb-2">Steps</p>
                      <div className="space-y-2">
                        {rec.steps.map((s, i) => (
                          <div key={i} className="flex gap-2.5">
                            <span className="shrink-0 w-5 h-5 rounded bg-accent/10 text-accent flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                            <div>
                              <p className="text-[12px] font-medium">{s.title}</p>
                              <p className="text-[11px] text-muted">{s.body}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI vs Human */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-accent/[0.03] border border-accent/10">
                        <p className="text-[10px] font-semibold text-accent uppercase tracking-wide mb-1.5">AI handles</p>
                        <ul className="space-y-1">
                          {rec.aiRole.map((r, i) => (<li key={i} className="text-[11px] text-muted flex gap-1.5"><span className="text-accent">•</span>{r}</li>))}
                        </ul>
                      </div>
                      <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100">
                        <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide mb-1.5">Human decides</p>
                        <ul className="space-y-1">
                          {rec.humanRole.map((r, i) => (<li key={i} className="text-[11px] text-muted flex gap-1.5"><span className="text-amber-600">•</span>{r}</li>))}
                        </ul>
                      </div>
                    </div>

                    {/* Impact */}
                    <div className="flex gap-4 text-[12px]">
                      <div><span className="text-muted">Time saved: </span><span className="font-medium">{rec.impact.timeSaved}</span></div>
                      <div><span className="text-muted">Cost saved: </span><span className="font-medium text-green-600">{rec.impact.costSaved}</span></div>
                      <div><span className="text-muted">Quality: </span><span className="font-medium">{rec.impact.qualityImprovement}</span></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
