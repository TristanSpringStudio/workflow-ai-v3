"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import { tasks, contributors } from "@/lib/mock-data";

const ACTOR_STYLES = {
  human: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", label: "Human" },
  tool: { bg: "bg-surface", border: "border-border", text: "text-muted", label: "Tool" },
  ai: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", label: "AI" },
};

function StepFlow({ steps, label }: { steps: { order: number; title: string; description: string; actor: string; tool?: string }[]; label: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-4">{label}</p>
      <div className="space-y-0">
        {steps.map((step, i) => {
          const style = ACTOR_STYLES[step.actor as keyof typeof ACTOR_STYLES] || ACTOR_STYLES.human;
          return (
            <div key={i}>
              <div className={`flex gap-3 p-3.5 rounded-xl ${style.bg} border ${style.border}`}>
                <div className="shrink-0 w-7 h-7 rounded-lg bg-white/80 border border-white flex items-center justify-center text-[12px] font-bold text-muted">
                  {step.order}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[13px] font-semibold">{step.title}</h4>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${style.text} bg-white/60`}>{style.label}</span>
                    {step.tool && <span className="text-[10px] text-muted-light">{step.tool}</span>}
                  </div>
                  <p className="text-[12px] text-muted mt-0.5">{step.description}</p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="flex justify-center py-1">
                  <svg className="w-4 h-4 text-muted-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const task = tasks.find((t) => t.id === id);
  if (!task) notFound();

  const taskContributors = contributors.filter((c) => task.contributors.includes(c.id));
  const rec = task.recommendation;

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto scroll-thin">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <Link href="/intelligence" className="text-[12px] text-muted hover:text-foreground transition-colors mb-4 inline-block">&larr; Intelligence Layer</Link>

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-surface text-muted border border-border">{task.department}</span>
                <span className="text-[11px] text-muted-light">{task.frequency} · {task.timeSpent}</span>
                {task.isBottleneck && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-700 border border-red-200">Bottleneck</span>}
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">{task.title}</h1>
              <p className="mt-1 text-[14px] text-muted">{task.description}</p>
            </div>
          </div>

          {/* Contributors */}
          <div className="mb-8 p-4 rounded-xl bg-surface border border-border">
            <p className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-3">Contributors</p>
            <div className="flex gap-3">
              {taskContributors.map((c) => (
                <div key={c.id} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-[12px] font-bold text-accent">
                    {c.name.charAt(0)}{c.name.split(" ")[1]?.charAt(0) || ""}
                  </div>
                  <div>
                    <p className="text-[12px] font-medium">{c.name}</p>
                    <p className="text-[10px] text-muted-light">{c.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inputs / Outputs */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-xl border border-border">
              <p className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-3">Inputs</p>
              <div className="space-y-2">
                {task.inputs.map((io, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12px]">
                    <svg className="w-3 h-3 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                    <span className="font-medium">{io.what}</span>
                    <span className="text-muted-light">from {io.fromOrTo}</span>
                    <span className="text-[10px] text-muted-light">({io.method})</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-xl border border-border">
              <p className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-3">Outputs</p>
              <div className="space-y-2">
                {task.outputs.map((io, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12px]">
                    <svg className="w-3 h-3 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                    <span className="font-medium">{io.what}</span>
                    <span className="text-muted-light">to {io.fromOrTo}</span>
                    <span className="text-[10px] text-muted-light">({io.method})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pain points */}
          {task.painPoints.length > 0 && (
            <div className="mb-8 p-4 rounded-xl border border-red-200 bg-red-50/30">
              <p className="text-[11px] font-semibold text-red-600 uppercase tracking-widest mb-2">Pain Points</p>
              <ul className="space-y-1">
                {task.painPoints.map((pp, i) => (
                  <li key={i} className="text-[12px] text-red-800/70 flex gap-2"><span className="text-red-400 shrink-0">-</span>{pp}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Before / After flows */}
          {rec ? (
            <div className="mb-8">
              <h2 className="text-[16px] font-semibold mb-4">Workflow: Current vs. Recommended</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-[13px] font-medium text-muted">Current flow</span>
                  </div>
                  <StepFlow steps={task.steps} label="Before" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-[13px] font-medium text-green-700">Recommended flow</span>
                  </div>
                  <StepFlow steps={rec.newSteps} label="After" />
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <h2 className="text-[16px] font-semibold mb-4">Current Workflow</h2>
              <StepFlow steps={task.steps} label="Steps" />
            </div>
          )}

          {/* Recommendation detail */}
          {rec && (
            <div className="mb-8 p-6 rounded-2xl border border-accent/20 bg-accent/[0.02]">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                <span className="text-[11px] font-semibold text-accent uppercase tracking-widest">AI Recommendation</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${rec.priority === "critical" ? "bg-red-50 text-red-700" : rec.priority === "high" ? "bg-amber-50 text-amber-700" : "bg-surface text-muted"}`}>
                  {rec.priority} · Phase {rec.phase}
                </span>
              </div>
              <p className="text-[14px] text-muted leading-relaxed">{rec.summary}</p>

              {/* Impact */}
              <div className="mt-4 flex gap-6 text-[13px]">
                <div><span className="text-muted-light">Time saved </span><span className="font-semibold text-green-600">{rec.impact.timeSaved}</span></div>
                <div><span className="text-muted-light">Cost saved </span><span className="font-semibold text-green-600">{rec.impact.costSaved}</span></div>
                <div><span className="text-muted-light">Quality </span><span className="font-medium">{rec.impact.qualityGain}</span></div>
              </div>

              {/* AI vs Human */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200/50">
                  <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wide mb-1.5">AI handles</p>
                  <ul className="space-y-1">
                    {rec.aiHandles.map((r, i) => (<li key={i} className="text-[11px] text-muted flex gap-1.5"><span className="text-blue-500 shrink-0">•</span>{r}</li>))}
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200/50">
                  <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide mb-1.5">You decide</p>
                  <ul className="space-y-1">
                    {rec.humanDecides.map((r, i) => (<li key={i} className="text-[11px] text-muted flex gap-1.5"><span className="text-amber-500 shrink-0">•</span>{r}</li>))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Tools */}
          <div className="mb-8">
            <p className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-3">Tools Used</p>
            <div className="flex flex-wrap gap-1.5">
              {task.tools.map((tool) => (
                <span key={tool} className="px-3 py-1.5 rounded-full text-[12px] font-medium bg-surface border border-border text-muted">{tool}</span>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {task.tags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 rounded-full text-[11px] text-muted-light bg-surface border border-border">#{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
