"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { tasks, contributors } from "@/lib/mock-data";
import type { TaskStep } from "@/lib/types";

const TOOL_DOMAINS: Record<string, string> = {
  "Google Analytics": "analytics.google.com", "HubSpot": "hubspot.com", "Google Sheets": "sheets.google.com",
  "Google Docs": "docs.google.com", "Gmail": "gmail.com", "Salesforce": "salesforce.com",
  "Slack": "slack.com", "Notion": "notion.so", "Jira": "atlassian.com", "Linear": "linear.app",
  "Figma": "figma.com", "GitHub": "github.com", "Zoom": "zoom.us", "QuickBooks": "quickbooks.intuit.com",
  "Canva": "canva.com", "Excel": "office.com", "Loom": "loom.com",
};

function getLogo(tool: string) {
  const domain = TOOL_DOMAINS[tool];
  return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : "";
}

type Tab = "details" | "map" | "knowledge" | "dependencies" | "assessment";

export default function WorkflowInteriorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const task = tasks.find((t) => t.id === id);
  if (!task) notFound();

  const [tab, setTab] = useState<Tab>("map");
  const [aiRecsOn, setAiRecsOn] = useState(false);
  const [selectedStep, setSelectedStep] = useState<TaskStep | null>(null);

  const taskContribs = contributors.filter((c) => task.contributors.includes(c.id));
  const rec = task.recommendation;
  const displaySteps = aiRecsOn && rec ? rec.newSteps : task.steps;

  const TABS: { key: Tab; label: string }[] = [
    { key: "details", label: "Details" },
    { key: "map", label: "Map" },
    { key: "knowledge", label: "Knowledge" },
    { key: "dependencies", label: "Dependencies" },
    { key: "assessment", label: "Our Assessment" },
  ];

  return (
    <AppShell>
      <div className="flex-1 flex flex-col min-h-0">
        <PageHeader title={task.title} />

        {/* Tabs bar */}
        <div className="shrink-0 px-6 border-b border-border">
          <div className="flex gap-0.5">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                  tab === t.key ? "bg-foreground/5 text-foreground" : "text-muted hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 flex min-h-0">
          {/* ─── Details Tab ─── */}
          {tab === "details" && (
            <div className="flex-1 overflow-y-auto scroll-thin px-6 py-6">
              <div className="max-w-3xl">
                <h2 className="text-xl font-semibold mb-2">{task.title}</h2>
                <p className="text-[14px] text-muted mb-6">{task.description}</p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-surface border border-border">
                    <p className="text-[10px] text-muted-light uppercase tracking-widest mb-1">Frequency</p>
                    <p className="text-[14px] font-medium">{task.frequency}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-surface border border-border">
                    <p className="text-[10px] text-muted-light uppercase tracking-widest mb-1">Time spent</p>
                    <p className="text-[14px] font-medium">{task.timeSpent}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-surface border border-border">
                    <p className="text-[10px] text-muted-light uppercase tracking-widest mb-1">Department</p>
                    <p className="text-[14px] font-medium">{task.department}</p>
                  </div>
                </div>

                {/* Contributors */}
                <div className="mb-6">
                  <p className="text-[11px] font-medium text-muted-light uppercase tracking-widest mb-3">Contributors</p>
                  <div className="flex gap-3">
                    {taskContribs.map((c) => (
                      <div key={c.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border">
                        <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-[10px] font-bold text-accent">{c.name.charAt(0)}{c.name.split(" ")[1]?.[0]}</div>
                        <div>
                          <p className="text-[12px] font-medium">{c.name}</p>
                          <p className="text-[10px] text-muted-light">{c.role} · {c.department}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tools */}
                <div className="mb-6">
                  <p className="text-[11px] font-medium text-muted-light uppercase tracking-widest mb-3">Tools</p>
                  <div className="flex flex-wrap gap-1.5">
                    {task.tools.map((tool) => {
                      const logo = getLogo(tool);
                      return (
                        <span key={tool} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface border border-border text-[12px]">
                          {logo && <Image src={logo} alt={tool} width={14} height={14} unoptimized />}
                          {tool}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Pain points */}
                {task.painPoints.length > 0 && (
                  <div className="p-4 rounded-xl bg-red-50/50 border border-red-200/50">
                    <p className="text-[11px] font-medium text-red-600 uppercase tracking-widest mb-2">Pain Points</p>
                    {task.painPoints.map((pp, i) => (
                      <p key={i} className="text-[12px] text-red-800/70 mb-0.5">- {pp}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── Map Tab ─── */}
          {tab === "map" && (
            <>
              <div className="flex-1 overflow-y-auto scroll-thin">
                <div className="min-h-full bg-[#fafbfc] relative">
                  {/* Dot grid */}
                  <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, #d1d5db 0.7px, transparent 0.7px)", backgroundSize: "20px 20px" }} />

                  {/* Flow nodes */}
                  <div className="relative z-10 flex flex-col items-center py-10 px-6 gap-0">
                    {displaySteps.map((step, i) => {
                      const isAi = step.actor === "ai";
                      const isSelected = selectedStep?.order === step.order;
                      const logo = step.toolIcon ? getLogo(step.toolIcon) : (step.tool ? getLogo(step.tool) : "");
                      return (
                        <div key={i}>
                          <button
                            onClick={() => setSelectedStep(isSelected ? null : step)}
                            className={`w-[360px] text-left p-4 rounded-2xl border-2 transition-all ${
                              aiRecsOn && isAi
                                ? "border-pink-400 bg-pink-50/80"
                                : isSelected
                                  ? "border-accent bg-white shadow-md"
                                  : "border-border bg-white hover:border-muted-light"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                {logo && <Image src={logo} alt="" width={18} height={18} unoptimized />}
                                <span className="text-[13px] font-semibold">{step.title}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {aiRecsOn && isAi && (
                                  <span className="w-5 h-5 rounded-full bg-pink-400 flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25" /></svg>
                                  </span>
                                )}
                                {!aiRecsOn && (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-surface border border-border text-muted capitalize">{step.actor}</span>
                                )}
                              </div>
                            </div>
                            <p className="text-[12px] text-muted">{step.description}</p>
                          </button>

                          {/* Connector */}
                          {i < displaySteps.length - 1 && (
                            <div className="flex flex-col items-center py-1">
                              <div className="w-px h-4" style={{ borderLeft: "1.5px dashed #d1d5db" }} />
                              <svg className="w-3 h-3 text-muted-light -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* AI toggle */}
                    <div className="mt-8">
                      <button
                        onClick={() => { setAiRecsOn(!aiRecsOn); setSelectedStep(null); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium border transition-colors ${
                          aiRecsOn
                            ? "bg-pink-50 border-pink-300 text-pink-700"
                            : "bg-white border-border text-muted hover:border-muted-light"
                        }`}
                      >
                        {aiRecsOn ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25" /></svg>
                        )}
                        AI Recommendations {aiRecsOn ? "On" : "Off"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step detail side panel */}
              {selectedStep && (
                <div className="w-[360px] shrink-0 border-l border-border bg-background overflow-y-auto scroll-thin p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {selectedStep.tool && getLogo(selectedStep.tool) && (
                        <Image src={getLogo(selectedStep.tool)} alt="" width={20} height={20} unoptimized />
                      )}
                      <h3 className="text-[15px] font-semibold">{selectedStep.title}</h3>
                    </div>
                    <button onClick={() => setSelectedStep(null)} className="w-6 h-6 rounded-md flex items-center justify-center text-muted hover:text-foreground">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>

                  <p className="text-[13px] text-muted mb-5">{selectedStep.description}</p>

                  {/* Touchpoints */}
                  {selectedStep.touchpoints && selectedStep.touchpoints.length > 0 && (
                    <div className="mb-5">
                      <p className="text-[11px] font-semibold text-foreground mb-2">Touchpoints</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedStep.touchpoints.map((cId) => {
                          const c = contributors.find((x) => x.id === cId);
                          return c ? (
                            <span key={c.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border text-[12px]">
                              <svg className="w-3 h-3 text-muted-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" /></svg>
                              {c.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Shared step */}
                  {selectedStep.sharedWith && selectedStep.sharedWith.length > 0 && (
                    <div className="mb-5">
                      <p className="text-[11px] font-semibold text-foreground mb-2">Shared step</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedStep.sharedWith.map((sw) => (
                          <Link key={sw.taskId} href={`/intelligence/${sw.taskId}`} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border text-[12px] hover:border-accent/30 transition-colors">
                            <svg className="w-3 h-3 text-muted-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /></svg>
                            {sw.taskTitle}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  <hr className="border-border my-4" />

                  {/* AI ready */}
                  {selectedStep.aiReady && selectedStep.aiReadyNote && (
                    <div className="p-4 rounded-xl bg-pink-50 border border-pink-200">
                      <div className="flex items-center gap-1.5 mb-2">
                        <svg className="w-4 h-4 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25" /></svg>
                        <span className="text-[12px] font-semibold text-pink-700">AI-ready</span>
                      </div>
                      <p className="text-[12px] text-pink-900/70 leading-relaxed">{selectedStep.aiReadyNote}</p>
                    </div>
                  )}
                  {selectedStep.aiReady === false && (
                    <div className="p-3 rounded-xl bg-surface border border-border">
                      <p className="text-[11px] text-muted">This step requires human judgment and is not a candidate for AI automation.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ─── Knowledge Tab ─── */}
          {tab === "knowledge" && (
            <div className="flex-1 overflow-y-auto scroll-thin px-6 py-6">
              <div className="max-w-3xl">
                <h2 className="text-[16px] font-semibold mb-2">Knowledge</h2>
                <p className="text-[13px] text-muted mb-6">How this workflow was documented, with citations from employee interviews.</p>

                {task.knowledge.length === 0 ? (
                  <div className="p-8 rounded-xl border border-dashed border-border text-center">
                    <p className="text-[13px] text-muted">No interview citations yet for this workflow.</p>
                    <Link href="/assess" className="text-[12px] text-accent hover:text-accent-hover mt-1 inline-block">Conduct an interview →</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {task.knowledge.map((k, i) => {
                      const c = contributors.find((x) => x.id === k.contributorId);
                      return (
                        <div key={i} className="p-4 rounded-xl border border-border">
                          <p className="text-[13px] text-foreground italic leading-relaxed">&ldquo;{k.quote}&rdquo;</p>
                          <div className="mt-3 flex items-center gap-2 text-[11px] text-muted">
                            {c && (
                              <>
                                <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center text-[8px] font-bold text-accent">{c.name.charAt(0)}</div>
                                <span className="font-medium text-foreground">{c.name}</span>
                                <span>· {c.role}</span>
                              </>
                            )}
                            <span>· {k.interviewDate}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Added by */}
                <div className="mt-8 p-4 rounded-xl bg-surface border border-border">
                  <p className="text-[11px] font-medium text-muted-light uppercase tracking-widest mb-2">Documented by</p>
                  {(() => {
                    const addedBy = contributors.find((c) => c.id === task.addedBy);
                    return addedBy ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-[9px] font-bold text-accent">{addedBy.name.charAt(0)}</div>
                        <div>
                          <p className="text-[12px] font-medium">{addedBy.name}</p>
                          <p className="text-[10px] text-muted-light">{addedBy.role} · Interviewed {addedBy.interviewedAt ? new Date(addedBy.interviewedAt).toLocaleDateString() : "N/A"}</p>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* ─── Dependencies Tab ─── */}
          {tab === "dependencies" && (
            <div className="flex-1 overflow-y-auto scroll-thin px-6 py-6">
              <div className="max-w-3xl">
                <h2 className="text-[16px] font-semibold mb-2">Dependencies</h2>
                <p className="text-[13px] text-muted mb-6">What this workflow depends on and what depends on it.</p>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[11px] font-medium text-muted-light uppercase tracking-widest mb-3">Inputs (depends on)</p>
                    <div className="space-y-2">
                      {task.inputs.map((io, i) => (
                        <div key={i} className="p-3 rounded-xl border border-border">
                          <p className="text-[12px] font-medium">{io.what}</p>
                          <p className="text-[11px] text-muted">From: {io.fromOrTo} · {io.method}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-muted-light uppercase tracking-widest mb-3">Outputs (depended on by)</p>
                    <div className="space-y-2">
                      {task.outputs.map((io, i) => (
                        <div key={i} className="p-3 rounded-xl border border-border">
                          <p className="text-[12px] font-medium">{io.what}</p>
                          <p className="text-[11px] text-muted">To: {io.fromOrTo} · {io.method}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Shared steps across workflows */}
                {task.steps.some((s) => s.sharedWith && s.sharedWith.length > 0) && (
                  <div className="mt-8">
                    <p className="text-[11px] font-medium text-muted-light uppercase tracking-widest mb-3">Shared steps with other workflows</p>
                    <div className="space-y-2">
                      {task.steps.filter((s) => s.sharedWith && s.sharedWith.length > 0).map((s, i) => (
                        <div key={i} className="p-3 rounded-xl border border-border">
                          <p className="text-[12px] font-medium">{s.title}</p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {s.sharedWith!.map((sw) => (
                              <Link key={sw.taskId} href={`/intelligence/${sw.taskId}`} className="text-[11px] text-accent hover:text-accent-hover">
                                {sw.taskTitle}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── Assessment Tab ─── */}
          {tab === "assessment" && (
            <div className="flex-1 overflow-y-auto scroll-thin px-6 py-6">
              <div className="max-w-3xl">
                <h2 className="text-[16px] font-semibold mb-2">Our Assessment</h2>
                <p className="text-[13px] text-muted mb-6">A report-style assessment of this workflow with recommendations for improvement.</p>

                {rec ? (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="p-5 rounded-2xl bg-accent/[0.03] border border-accent/10">
                      <p className="text-[14px] text-foreground leading-relaxed">{rec.summary}</p>
                      <div className="mt-4 flex gap-4 text-[13px]">
                        <div><span className="text-muted-light">Time saved </span><span className="font-semibold text-green-600">{rec.impact.timeSaved}</span></div>
                        <div><span className="text-muted-light">Cost saved </span><span className="font-semibold text-green-600">{rec.impact.costSaved}</span></div>
                        <div><span className="text-muted-light">Priority </span><span className="font-medium capitalize">{rec.priority}</span></div>
                        <div><span className="text-muted-light">Difficulty </span><span className="font-medium capitalize">{rec.difficulty}</span></div>
                      </div>
                    </div>

                    {/* Current vs Recommended stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-border">
                        <p className="text-[11px] font-medium text-muted-light uppercase tracking-widest mb-2">Current</p>
                        <p className="text-2xl font-bold">{task.steps.length} <span className="text-[14px] font-normal text-muted">steps</span></p>
                        <p className="text-[12px] text-muted mt-1">{task.steps.filter((s) => s.actor === "human").length} human, {task.steps.filter((s) => s.actor !== "human").length} automated</p>
                      </div>
                      <div className="p-4 rounded-xl border border-accent/20 bg-accent/[0.02]">
                        <p className="text-[11px] font-medium text-accent uppercase tracking-widest mb-2">Recommended</p>
                        <p className="text-2xl font-bold">{rec.newSteps.length} <span className="text-[14px] font-normal text-muted">steps</span></p>
                        <p className="text-[12px] text-muted mt-1">{rec.newSteps.filter((s) => s.actor === "human").length} human, {rec.newSteps.filter((s) => s.actor === "ai").length} AI-assisted</p>
                      </div>
                    </div>

                    {/* AI handles vs Human decides */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/50">
                        <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-widest mb-2">AI handles</p>
                        <ul className="space-y-1">
                          {rec.aiHandles.map((r, i) => (<li key={i} className="text-[12px] text-muted flex gap-1.5"><span className="text-blue-500">•</span>{r}</li>))}
                        </ul>
                      </div>
                      <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/50">
                        <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-widest mb-2">You decide</p>
                        <ul className="space-y-1">
                          {rec.humanDecides.map((r, i) => (<li key={i} className="text-[12px] text-muted flex gap-1.5"><span className="text-amber-500">•</span>{r}</li>))}
                        </ul>
                      </div>
                    </div>

                    {/* Quality gain */}
                    <div className="p-4 rounded-xl bg-green-50/50 border border-green-200/50">
                      <p className="text-[11px] font-semibold text-green-700 uppercase tracking-widest mb-1">Quality improvement</p>
                      <p className="text-[13px] text-green-900/80">{rec.impact.qualityGain}</p>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-3">
                      <button onClick={() => setTab("map")} className="px-4 py-2 rounded-xl bg-accent text-white text-[13px] font-medium hover:bg-accent-hover transition-colors">
                        View on map →
                      </button>
                      <Link href="/roadmap" className="px-4 py-2 rounded-xl border border-border text-[13px] font-medium text-muted hover:text-foreground transition-colors">
                        See implementation plan
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-xl border border-dashed border-border text-center">
                    <p className="text-[13px] text-muted">No AI assessment available for this workflow yet.</p>
                    <p className="text-[12px] text-muted-light mt-1">More interview data may help generate recommendations.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
