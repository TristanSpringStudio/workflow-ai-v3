"use client";

import Link from "next/link";
import { X, CheckCircle2, Clock, AlertTriangle, ArrowRight, Shield, Zap, User } from "lucide-react";
import type { Task } from "@/lib/types";
import { contributors } from "@/lib/mock-data";

interface ImplementationTrayProps {
  task: Task;
  actionLabel: string;
  onClose: () => void;
}

export default function ImplementationTray({ task, actionLabel, onClose }: ImplementationTrayProps) {
  const rec = task.recommendation;
  const impl = rec?.implementation;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative w-[480px] bg-background border-l border-border h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="shrink-0 px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-accent uppercase tracking-widest">Implementation Guide</span>
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-surface transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-[16px] font-semibold">{actionLabel}</h2>
          <p className="text-[12px] text-muted mt-1">{task.department} · Currently takes {task.timeSpent}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scroll-thin px-6 py-5">
          {/* Summary */}
          {rec && (
            <div className="mb-6">
              <p className="text-[13px] text-muted leading-relaxed">{rec.summary}</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between py-1.5 border-b border-border">
                  <span className="text-[12px] text-muted">Time saved</span>
                  <span className="text-[12px] font-semibold text-green-600">{rec.impact.timeSaved}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-border">
                  <span className="text-[12px] text-muted">Cost saved</span>
                  <span className="text-[12px] font-semibold text-green-600">{rec.impact.costSaved}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-border">
                  <span className="text-[12px] text-muted">Difficulty</span>
                  <span className="text-[12px] font-medium capitalize">{rec.difficulty}</span>
                </div>
              </div>
            </div>
          )}

          {impl ? (
            <>
              {/* Prerequisites */}
              <div className="mb-6">
                <h3 className="flex items-center gap-2 text-[12px] font-semibold mb-3">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.5} />
                  Prerequisites
                </h3>
                {impl.prerequisites.map((p, i) => (
                  <div key={i} className="flex gap-3 py-2 border-b border-border last:border-0">
                    <span className="text-[11px] text-muted-light shrink-0 w-4 text-right">{i + 1}</span>
                    <span className="text-[12px] text-muted">{p}</span>
                  </div>
                ))}
              </div>

              {/* Steps */}
              <div className="mb-6">
                <h3 className="flex items-center gap-2 text-[12px] font-semibold mb-3">
                  <Zap className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                  Steps
                </h3>
                {impl.steps.map((step, i) => {
                  const owner = step.owner ? contributors.find((c) => c.id === step.owner) : null;
                  return (
                    <div key={i} className="py-3 border-b border-border last:border-0">
                      <div className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-md bg-accent/10 text-accent flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[12px] font-semibold">{step.title}</h4>
                            {step.timeEstimate && <span className="text-[10px] text-muted-light shrink-0 ml-2">{step.timeEstimate}</span>}
                          </div>
                          <p className="text-[11px] text-muted mt-0.5">{step.description}</p>
                          {(owner || step.tools) && (
                            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-light">
                              {owner && (
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" strokeWidth={1.5} />
                                  {owner.name.split(" ")[0]}
                                </span>
                              )}
                              {step.tools && <span>{step.tools.join(", ")}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Success criteria */}
              <div className="mb-6">
                <h3 className="flex items-center gap-2 text-[12px] font-semibold mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" strokeWidth={1.5} />
                  Success criteria
                </h3>
                {impl.successCriteria.map((c, i) => (
                  <div key={i} className="flex gap-3 py-2 border-b border-border last:border-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span className="text-[12px] text-muted">{c}</span>
                  </div>
                ))}
              </div>

              {/* Rollback */}
              <div className="mb-6">
                <h3 className="flex items-center gap-2 text-[12px] font-semibold mb-3">
                  <Shield className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.5} />
                  Rollback plan
                </h3>
                <p className="text-[12px] text-muted leading-relaxed">{impl.rollbackPlan}</p>
              </div>

              {/* Timeline */}
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="flex items-center gap-2 text-[12px] text-muted">
                  <Clock className="w-3.5 h-3.5 text-muted-light" strokeWidth={1.5} />
                  Estimated total time
                </span>
                <span className="text-[12px] font-semibold">{impl.estimatedTime}</span>
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <p className="text-[13px] text-muted">Detailed implementation guide coming soon.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-border">
          <Link
            href={`/intelligence/${task.id}`}
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-accent text-white text-[13px] font-medium hover:bg-accent-hover transition-colors"
          >
            View full workflow detail
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  );
}
