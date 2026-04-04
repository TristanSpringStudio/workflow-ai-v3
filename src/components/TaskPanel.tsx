"use client";

import Link from "next/link";
import type { Task, Contributor } from "@/lib/types";

const ACTOR_STYLES = {
  human: { bg: "bg-amber-50", border: "border-amber-200", label: "Human", dot: "bg-amber-500" },
  tool: { bg: "bg-surface", border: "border-border", label: "Tool", dot: "bg-muted-light" },
  ai: { bg: "bg-blue-50", border: "border-blue-200", label: "AI", dot: "bg-accent" },
};

interface TaskPanelProps {
  task: Task;
  contributors: Contributor[];
  onClose: () => void;
}

export default function TaskPanel({ task, contributors: allContribs, onClose }: TaskPanelProps) {
  const taskContribs = allContribs.filter((c) => task.contributors.includes(c.id));
  const rec = task.recommendation;

  return (
    <div className="w-[420px] shrink-0 border-l border-border bg-background flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface text-muted border border-border">{task.department}</span>
            {task.isBottleneck && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-700 border border-red-200">Bottleneck</span>}
            {rec && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent/10 text-accent border border-accent/20">AI opportunity</span>}
          </div>
          <button onClick={onClose} className="w-6 h-6 rounded-md flex items-center justify-center text-muted hover:text-foreground hover:bg-surface transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <h2 className="text-[16px] font-semibold">{task.title}</h2>
        <p className="text-[12px] text-muted mt-0.5">{task.frequency} · {task.timeSpent}</p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scroll-thin px-5 py-4 space-y-5">
        {/* Description */}
        <p className="text-[13px] text-muted leading-relaxed">{task.description}</p>

        {/* Contributors */}
        <div>
          <p className="text-[10px] font-semibold text-muted-light uppercase tracking-widest mb-2">Contributors</p>
          <div className="flex gap-2">
            {taskContribs.map((c) => (
              <div key={c.id} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-surface border border-border">
                <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center text-[9px] font-bold text-accent">{c.name.charAt(0)}</div>
                <div>
                  <p className="text-[11px] font-medium leading-none">{c.name}</p>
                  <p className="text-[9px] text-muted-light">{c.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inputs / Outputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] font-semibold text-muted-light uppercase tracking-widest mb-2">Inputs</p>
            {task.inputs.map((io, i) => (
              <div key={i} className="text-[11px] mb-1.5">
                <p className="font-medium">{io.what}</p>
                <p className="text-muted-light">from {io.fromOrTo} · {io.method}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-[10px] font-semibold text-muted-light uppercase tracking-widest mb-2">Outputs</p>
            {task.outputs.map((io, i) => (
              <div key={i} className="text-[11px] mb-1.5">
                <p className="font-medium">{io.what}</p>
                <p className="text-muted-light">to {io.fromOrTo} · {io.method}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pain points */}
        {task.painPoints.length > 0 && (
          <div className="p-3 rounded-lg bg-red-50/50 border border-red-200/50">
            <p className="text-[10px] font-semibold text-red-600 uppercase tracking-widest mb-1.5">Pain points</p>
            {task.painPoints.map((pp, i) => (
              <p key={i} className="text-[11px] text-red-800/70 flex gap-1.5 mb-0.5"><span className="text-red-400 shrink-0">-</span>{pp}</p>
            ))}
          </div>
        )}

        {/* Current flow */}
        <div>
          <p className="text-[10px] font-semibold text-muted-light uppercase tracking-widest mb-2">
            {rec ? "Current flow" : "Workflow"}
          </p>
          <div className="space-y-1">
            {task.steps.map((step, i) => {
              const style = ACTOR_STYLES[step.actor as keyof typeof ACTOR_STYLES] || ACTOR_STYLES.human;
              return (
                <div key={i} className={`flex items-start gap-2 p-2 rounded-lg ${style.bg} border ${style.border}`}>
                  <div className="shrink-0 w-4 h-4 rounded bg-white/70 flex items-center justify-center text-[9px] font-bold text-muted mt-0.5">{step.order}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium">{step.title}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                    </div>
                    <p className="text-[10px] text-muted">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommendation */}
        {rec && (
          <div className="p-4 rounded-xl border border-accent/20 bg-accent/[0.02]">
            <div className="flex items-center gap-1.5 mb-2">
              <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <span className="text-[10px] font-semibold text-accent uppercase tracking-widest">Recommended flow</span>
            </div>

            <div className="space-y-1 mb-3">
              {rec.newSteps.map((step, i) => {
                const style = ACTOR_STYLES[step.actor as keyof typeof ACTOR_STYLES] || ACTOR_STYLES.human;
                return (
                  <div key={i} className={`flex items-start gap-2 p-2 rounded-lg ${style.bg} border ${style.border}`}>
                    <div className="shrink-0 w-4 h-4 rounded bg-white/70 flex items-center justify-center text-[9px] font-bold text-muted mt-0.5">{step.order}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-medium">{step.title}</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      </div>
                      <p className="text-[10px] text-muted">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Impact */}
            <div className="flex gap-3 text-[11px] pt-2 border-t border-accent/10">
              <span className="text-green-600 font-medium">{rec.impact.timeSaved} saved</span>
              <span className="text-green-600 font-medium">{rec.impact.costSaved}</span>
              <span className="text-muted-light">{rec.difficulty}</span>
            </div>
          </div>
        )}

        {/* Tools */}
        <div>
          <p className="text-[10px] font-semibold text-muted-light uppercase tracking-widest mb-2">Tools</p>
          <div className="flex flex-wrap gap-1">
            {task.tools.map((tool) => (
              <span key={tool} className="px-2 py-0.5 rounded-md text-[10px] bg-surface border border-border text-muted">{tool}</span>
            ))}
          </div>
        </div>

        {/* Full detail link */}
        <Link href={`/intelligence/${task.id}`} className="block text-center py-2 text-[12px] text-accent hover:text-accent-hover font-medium">
          Open full detail →
        </Link>
      </div>
    </div>
  );
}
