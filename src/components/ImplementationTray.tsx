"use client";

import Link from "next/link";
import { X, CheckCircle2, Clock, AlertTriangle, ArrowRight, Shield } from "lucide-react";
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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Tray */}
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

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto scroll-thin px-6 py-5 space-y-6">
          {/* Summary */}
          {rec && (
            <div>
              <p className="text-[13px] text-muted leading-relaxed">{rec.summary}</p>
              <div className="mt-3 flex gap-4 text-[12px]">
                <span className="text-green-600 font-semibold">{rec.impact.timeSaved} saved</span>
                <span className="text-green-600 font-semibold">{rec.impact.costSaved}/yr</span>
                <span className="text-muted capitalize">{rec.difficulty} difficulty</span>
              </div>
            </div>
          )}

          {impl ? (
            <>
              {/* Prerequisites */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.5} />
                  <h3 className="text-[12px] font-semibold uppercase tracking-widest text-muted-light">Prerequisites</h3>
                </div>
                <ul className="space-y-1.5">
                  {impl.prerequisites.map((p, i) => (
                    <li key={i} className="flex gap-2 text-[12px] text-muted">
                      <span className="w-4 h-4 rounded-full border border-border flex items-center justify-center shrink-0 mt-0.5 text-[8px] text-muted-light">{i + 1}</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Steps */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                  <h3 className="text-[12px] font-semibold uppercase tracking-widest text-muted-light">Steps</h3>
                </div>
                <div className="space-y-3">
                  {impl.steps.map((step, i) => {
                    const owner = step.owner ? contributors.find((c) => c.id === step.owner) : null;
                    return (
                      <div key={i} className="p-3 rounded-xl bg-surface border border-border">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-accent/10 text-accent flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
                            <h4 className="text-[12px] font-semibold">{step.title}</h4>
                          </div>
                          {step.timeEstimate && (
                            <span className="flex items-center gap-1 text-[10px] text-muted-light shrink-0">
                              <Clock className="w-3 h-3" strokeWidth={1.5} />
                              {step.timeEstimate}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted leading-relaxed ml-7">{step.description}</p>
                        {(owner || step.tools) && (
                          <div className="mt-2 ml-7 flex items-center gap-3 text-[10px] text-muted-light">
                            {owner && <span>Owner: <span className="text-foreground font-medium">{owner.name.split(" ")[0]}</span></span>}
                            {step.tools && step.tools.length > 0 && (
                              <span>{step.tools.join(", ")}</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Success criteria */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" strokeWidth={1.5} />
                  <h3 className="text-[12px] font-semibold uppercase tracking-widest text-muted-light">Success criteria</h3>
                </div>
                <ul className="space-y-1.5">
                  {impl.successCriteria.map((c, i) => (
                    <li key={i} className="flex gap-2 text-[12px] text-muted">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Rollback */}
              <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/50">
                <div className="flex items-center gap-2 mb-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-600" strokeWidth={1.5} />
                  <h3 className="text-[11px] font-semibold text-amber-700 uppercase tracking-widest">Rollback plan</h3>
                </div>
                <p className="text-[12px] text-amber-900/70 leading-relaxed">{impl.rollbackPlan}</p>
              </div>

              {/* Timeline */}
              <div className="flex items-center gap-2 text-[12px]">
                <Clock className="w-3.5 h-3.5 text-muted-light" strokeWidth={1.5} />
                <span className="text-muted">Estimated total time:</span>
                <span className="font-semibold">{impl.estimatedTime}</span>
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <p className="text-[13px] text-muted">Detailed implementation guide coming soon.</p>
              <p className="text-[12px] text-muted-light mt-1">View the current workflow and AI recommendation for now.</p>
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
