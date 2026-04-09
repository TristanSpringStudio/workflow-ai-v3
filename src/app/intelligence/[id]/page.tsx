"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Sparkles, Eye, CheckCircle2, DollarSign, Megaphone, TrendingUp, Wrench, FlaskConical, PackageSearch } from "lucide-react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { useCompanyData } from "@/lib/company-data";
import type { TaskStep } from "@/lib/types";

const TOOL_DOMAINS: Record<string, string> = {
  "Google Analytics": "analytics.google.com", "HubSpot": "hubspot.com", "Google Sheets": "sheets.google.com",
  "Google Docs": "docs.google.com", "Gmail": "gmail.com", "Salesforce": "salesforce.com",
  "Slack": "slack.com", "Notion": "notion.so", "Jira": "atlassian.com", "Linear": "linear.app",
  "Figma": "figma.com", "GitHub": "github.com", "Zoom": "zoom.us", "QuickBooks": "quickbooks.intuit.com",
  "Canva": "canva.com", "Excel": "office.com", "Loom": "loom.com",
};

const DEPT_ICONS: Record<string, { Icon: typeof DollarSign; bg: string }> = {
  Sales: { Icon: DollarSign, bg: "#22c55e" }, Marketing: { Icon: Megaphone, bg: "#a855f7" },
  Finance: { Icon: TrendingUp, bg: "#3b52ce" }, Operations: { Icon: Wrench, bg: "#f59e0b" },
  Engineering: { Icon: FlaskConical, bg: "#6366f1" }, Product: { Icon: PackageSearch, bg: "#ec4899" },
};

function getLogo(tool: string) {
  const domain = TOOL_DOMAINS[tool];
  return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : "";
}

type Tab = "details" | "map" | "knowledge" | "dependencies" | "assessment" | "implementation";

export default function WorkflowInteriorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { tasks, contributors } = useCompanyData();
  const task = tasks.find((t) => t.id === id);
  if (!task) notFound();

  const [tab, setTab] = useState<Tab>("details");
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
    ...(rec?.implementation ? [{ key: "implementation" as Tab, label: "Implementation" }] : []),
  ];

  return (
    <AppShell>
      <div className="flex-1 flex flex-col min-h-0">
        <PageHeader
          title={task.title}
          breadcrumbs={[{ label: "Company Intelligence", href: "/intelligence", icon: "M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" }]}
        />

        {/* Tabs bar */}
        <div className="shrink-0 px-6 py-2 border-b border-border">
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
          {tab === "details" && (() => {
            const deptIcon = DEPT_ICONS[task.department];
            const DeptIcon = deptIcon?.Icon || Wrench;
            const allShared = task.steps.flatMap((s) =>
              (s.sharedWith || []).map((sw) => {
                const swTask = tasks.find((t) => t.id === sw.taskId);
                return { ...sw, dept: swTask?.department || "" };
              })
            );
            // dedupe by taskId
            const uniqueShared = allShared.filter((sw, i, arr) => arr.findIndex((x) => x.taskId === sw.taskId) === i);

            return (
              <div className="flex-1 overflow-y-auto scroll-thin px-6 py-10">
                <div className="max-w-2xl mx-auto">

                  {/* Title */}
                  <h2 className="text-[22px] font-semibold tracking-tight mb-4">{task.title}</h2>

                  {/* Description */}
                  <p className="text-[14px] text-muted leading-relaxed mb-10">{task.description}</p>

                  {/* Stats row */}
                  <div className="border-t border-border" />
                  <div className="grid grid-cols-3 py-6">
                    <div>
                      <p className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-1.5">Frequency</p>
                      <p className="text-[15px] font-medium">{task.frequency}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-1.5">Time spent</p>
                      <p className="text-[15px] font-medium">{task.timeSpent}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-1.5">Potential savings</p>
                      <p className="text-[15px] font-medium">{rec ? rec.impact.timeSaved : "—"}</p>
                    </div>
                  </div>
                  <div className="border-t border-border mb-10" />

                  {/* Tools */}
                  <div className="mb-6">
                    <h3 className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-3">Tools</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {task.tools.map((tool) => {
                        const logo = getLogo(tool);
                        return (
                          <span key={tool} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border text-[12px]">
                            {logo && <Image src={logo} alt={tool} width={14} height={14} unoptimized />}
                            {tool}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Department */}
                  <div className="mb-6">
                    <h3 className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-3">Department</h3>
                    <Link href={`/departments/${task.department.toLowerCase()}`} className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border hover:border-muted-light transition-colors">
                      <div className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ background: deptIcon?.bg || "#6b7280" }}>
                        <DeptIcon className="w-2.5 h-2.5 text-white" strokeWidth={2} />
                      </div>
                      <span className="text-[12px] group-hover:text-accent transition-colors">{task.department}</span>
                    </Link>
                  </div>

                  {/* Contributors */}
                  <div className="mb-6">
                    <h3 className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-3">Contributors</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {taskContribs.map((c) => (
                        <span key={c.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border text-[12px]">
                          <svg className="w-3 h-3 text-muted-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" /></svg>
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Shared workflows */}
                  {uniqueShared.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-3">Shared with</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {uniqueShared.map((sw) => {
                          const swDeptIcon = DEPT_ICONS[sw.dept];
                          const SwIcon = swDeptIcon?.Icon || Wrench;
                          return (
                            <Link key={sw.taskId} href={`/intelligence/${sw.taskId}`} className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border hover:border-muted-light transition-colors">
                              <div className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ background: swDeptIcon?.bg || "#6b7280" }}>
                                <SwIcon className="w-2.5 h-2.5 text-white" strokeWidth={2} />
                              </div>
                              <span className="text-[12px] group-hover:text-accent transition-colors">{sw.taskTitle}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })()}

          {/* ─── Map Tab ─── */}
          {tab === "map" && (
            <>
              <div className="flex-1 flex flex-col min-h-0">
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

                    </div>
                  </div>
                </div>

                {/* AI toggle — floating bottom */}
                <div className="shrink-0 px-6 py-4 flex justify-center">
                  <button
                    onClick={() => { setAiRecsOn(!aiRecsOn); setSelectedStep(null); }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-medium border shadow-md transition-colors ${
                      aiRecsOn
                        ? "bg-pink-50 border-pink-300 text-pink-700 shadow-pink-200/50"
                        : "bg-white border-border text-muted hover:border-muted-light"
                    }`}
                  >
                    {aiRecsOn ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    AI Recommendations {aiRecsOn ? "On" : "Off"}
                  </button>
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
                      <div className="flex flex-wrap gap-1.5">
                        {selectedStep.sharedWith.map((sw) => {
                          const swTask = tasks.find((t) => t.id === sw.taskId);
                          const deptIcon = swTask ? DEPT_ICONS[swTask.department] : null;
                          const SwIcon = deptIcon?.Icon || Wrench;
                          return (
                            <Link key={sw.taskId} href={`/intelligence/${sw.taskId}`} className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border hover:border-muted-light transition-colors">
                              <div className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ background: deptIcon?.bg || "#6b7280" }}>
                                <SwIcon className="w-2.5 h-2.5 text-white" strokeWidth={2} />
                              </div>
                              <span className="text-[12px] group-hover:text-accent transition-colors">{sw.taskTitle}</span>
                            </Link>
                          );
                        })}
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
            <div className="flex-1 overflow-y-auto scroll-thin px-6 py-10">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-[22px] font-semibold tracking-tight mb-4">Knowledge</h2>
                <p className="text-[14px] text-muted leading-relaxed mb-10">How this workflow was documented, with citations from employee interviews.</p>

                {task.knowledge.length === 0 ? (
                  <p className="text-[13px] text-muted-light py-8 text-center">No interview citations yet.</p>
                ) : (
                  <>
                    <h3 className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-3">Interview citations</h3>
                    {task.knowledge.map((k, i) => {
                      const c = contributors.find((x) => x.id === k.contributorId);
                      return (
                        <div key={i} className="py-4 border-b border-border last:border-0">
                          <p className="text-[13px] italic leading-relaxed text-muted">&ldquo;{k.quote}&rdquo;</p>
                          <div className="mt-2.5 flex items-center gap-2">
                            {c && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border text-[12px]">
                                <svg className="w-3 h-3 text-muted-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" /></svg>
                                {c.name}
                              </span>
                            )}
                            <span className="text-[11px] text-muted-light">{k.interviewDate}</span>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* Documented by */}
                {(() => {
                  const addedBy = contributors.find((c) => c.id === task.addedBy);
                  return addedBy ? (
                    <div className="mt-10">
                      <h3 className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-3">Documented by</h3>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border text-[12px]">
                        <svg className="w-3 h-3 text-muted-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" /></svg>
                        {addedBy.name}
                      </span>
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
          )}

          {/* ─── Dependencies Tab ─── */}
          {tab === "dependencies" && (
            <div className="flex-1 overflow-y-auto scroll-thin px-6 py-10">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-[22px] font-semibold tracking-tight mb-4">Dependencies</h2>
                <p className="text-[14px] text-muted leading-relaxed mb-10">What this workflow depends on and what depends on it.</p>

                <div className="grid grid-cols-2 gap-8 mb-10">
                  <div>
                    <h3 className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-3">Inputs</h3>
                    {task.inputs.map((io, i) => (
                      <div key={i} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                        <span className="text-[12px] font-medium">{io.what}</span>
                        <span className="text-[11px] text-muted-light">{io.fromOrTo} · {io.method}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h3 className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-3">Outputs</h3>
                    {task.outputs.map((io, i) => (
                      <div key={i} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                        <span className="text-[12px] font-medium">{io.what}</span>
                        <span className="text-[11px] text-muted-light">{io.fromOrTo} · {io.method}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {task.steps.some((s) => s.sharedWith && s.sharedWith.length > 0) && (
                  <div>
                    <h3 className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-3">Shared steps</h3>
                    {task.steps.filter((s) => s.sharedWith && s.sharedWith.length > 0).map((s, i) => (
                      <div key={i} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                        <span className="text-[12px] font-medium">{s.title}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {s.sharedWith!.map((sw) => {
                            const swTask = tasks.find((t) => t.id === sw.taskId);
                            const deptIcon = swTask ? DEPT_ICONS[swTask.department] : null;
                            const SwIcon = deptIcon?.Icon || Wrench;
                            return (
                              <Link key={sw.taskId} href={`/intelligence/${sw.taskId}`} className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border hover:border-muted-light transition-colors">
                                <div className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ background: deptIcon?.bg || "#6b7280" }}>
                                  <SwIcon className="w-2.5 h-2.5 text-white" strokeWidth={2} />
                                </div>
                                <span className="text-[12px] group-hover:text-accent transition-colors">{sw.taskTitle}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── Assessment Tab ─── */}
          {tab === "assessment" && (
            <div className="flex-1 overflow-y-auto scroll-thin px-6 py-10">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-[22px] font-semibold tracking-tight mb-4">Our Assessment</h2>

                {rec ? (
                  <div>
                    <p className="text-[14px] text-muted leading-relaxed mb-10">{rec.summary}</p>

                    {/* Impact stats row */}
                    <div className="border-t border-border" />
                    <div className="grid grid-cols-3 py-6">
                      <div>
                        <p className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-1.5">Time saved</p>
                        <p className="text-[15px] font-medium text-green-600">{rec.impact.timeSaved}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-1.5">Cost saved</p>
                        <p className="text-[15px] font-medium text-green-600">{rec.impact.costSaved}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-1.5">Difficulty</p>
                        <p className="text-[15px] font-medium capitalize">{rec.difficulty}</p>
                      </div>
                    </div>
                    <div className="border-t border-border mb-10" />

                    {/* Additional metrics */}
                    <div className="mb-10">
                      <div className="flex items-center justify-between py-2.5 border-b border-border">
                        <span className="text-[12px] text-muted">Quality improvement</span>
                        <span className="text-[12px] font-medium">{rec.impact.qualityGain}</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5 border-b border-border">
                        <span className="text-[12px] text-muted">Priority</span>
                        <span className="text-[12px] font-medium capitalize">{rec.priority}</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5 border-b border-border">
                        <span className="text-[12px] text-muted">Current steps</span>
                        <span className="text-[12px] font-medium">{task.steps.length} ({task.steps.filter((s) => s.actor === "human").length} human)</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5 border-b border-border">
                        <span className="text-[12px] text-muted">Recommended steps</span>
                        <span className="text-[12px] font-medium">{rec.newSteps.length} ({rec.newSteps.filter((s) => s.actor === "ai").length} AI-assisted)</span>
                      </div>
                    </div>

                    {/* AI handles / You decide */}
                    <div className="grid grid-cols-2 gap-8 mb-10">
                      <div>
                        <h3 className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-3">AI handles</h3>
                        {rec.aiHandles.map((r, i) => (
                          <div key={i} className="py-2 text-[12px] text-muted border-b border-border last:border-0">{r}</div>
                        ))}
                      </div>
                      <div>
                        <h3 className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-3">You decide</h3>
                        {rec.humanDecides.map((r, i) => (
                          <div key={i} className="py-2 text-[12px] text-muted border-b border-border last:border-0">{r}</div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button onClick={() => setTab("map")} className="px-4 py-2 rounded-xl bg-accent text-white text-[13px] font-medium hover:bg-accent-hover transition-colors">View on map</button>
                      <Link href="/roadmap" className="px-4 py-2 rounded-xl border border-border text-[13px] font-medium text-muted hover:text-foreground transition-colors">See implementation plan</Link>
                    </div>
                  </div>
                ) : (
                  <p className="text-[13px] text-muted-light py-8 text-center">No assessment available yet.</p>
                )}
              </div>
            </div>
          )}

          {/* ─── Implementation Tab ─── */}
          {tab === "implementation" && rec?.implementation && (
            <div className="flex-1 overflow-y-auto scroll-thin px-6 py-10">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-[22px] font-semibold tracking-tight mb-4">Implementation Guide</h2>
                <p className="text-[14px] text-muted leading-relaxed mb-10">{rec.summary}</p>

                {/* Overview stats row */}
                <div className="border-t border-border" />
                <div className="grid grid-cols-3 py-6">
                  <div>
                    <p className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-1.5">Time saved</p>
                    <p className="text-[15px] font-medium text-green-600">{rec.impact.timeSaved}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-1.5">Difficulty</p>
                    <p className="text-[15px] font-medium capitalize">{rec.difficulty}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-1.5">Timeline</p>
                    <p className="text-[15px] font-medium">{rec.implementation.estimatedTime}</p>
                  </div>
                </div>
                <div className="border-t border-border mb-10" />

                {/* Prerequisites */}
                <div className="mb-10">
                  <h3 className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-3">Prerequisites</h3>
                  {rec.implementation.prerequisites.map((p, i) => (
                    <div key={i} className="flex gap-3 py-2.5 border-b border-border last:border-0">
                      <span className="text-[11px] text-muted-light shrink-0 w-4 text-right">{i + 1}</span>
                      <span className="text-[12px] text-muted">{p}</span>
                    </div>
                  ))}
                </div>

                {/* Steps */}
                <div className="mb-10">
                  <h3 className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-3">Steps</h3>
                  {rec.implementation.steps.map((step, i) => {
                    const owner = step.owner ? contributors.find((c) => c.id === step.owner) : null;
                    return (
                      <div key={i} className="py-3 border-b border-border last:border-0">
                        <div className="flex items-start gap-3">
                          <span className="w-5 h-5 rounded-md bg-accent/10 text-accent flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-[12px] font-semibold">{step.title}</h4>
                              {step.timeEstimate && <span className="text-[10px] text-muted-light">{step.timeEstimate}</span>}
                            </div>
                            <p className="text-[11px] text-muted mt-0.5">{step.description}</p>
                            {(owner || step.tools) && (
                              <div className="flex items-center gap-2 mt-1.5">
                                {owner && (
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-surface border border-border text-[11px]">
                                    <svg className="w-3 h-3 text-muted-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" /></svg>
                                    {owner.name}
                                  </span>
                                )}
                                {step.tools && <span className="text-[10px] text-muted-light">{step.tools.join(", ")}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Success criteria */}
                <div className="mb-10">
                  <h3 className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-3">Success criteria</h3>
                  {rec.implementation.successCriteria.map((c, i) => (
                    <div key={i} className="flex gap-3 py-2 border-b border-border last:border-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span className="text-[12px] text-muted">{c}</span>
                    </div>
                  ))}
                </div>

                {/* Rollback */}
                <div>
                  <h3 className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-2">Rollback plan</h3>
                  <p className="text-[12px] text-muted leading-relaxed">{rec.implementation.rollbackPlan}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
