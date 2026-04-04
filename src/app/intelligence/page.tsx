"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import OrgGraph from "@/components/OrgGraph";
import { tasks, getDepartments, contributors } from "@/lib/mock-data";

export default function IntelligencePage() {
  const departments = getDepartments();
  const [filterDept, setFilterDept] = useState<string>("all");
  const [filterType, setFilterType] = useState<"all" | "bottleneck" | "has-rec">("all");
  const [view, setView] = useState<"graph" | "list">("graph");

  const filtered = tasks.filter((t) => {
    if (filterDept !== "all" && t.department !== filterDept) return false;
    if (filterType === "bottleneck" && !t.isBottleneck) return false;
    if (filterType === "has-rec" && !t.recommendation) return false;
    return true;
  });

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto scroll-thin">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Intelligence Layer</h1>
              <p className="mt-1 text-[14px] text-muted">
                {tasks.length} tasks mapped across {departments.length} departments · {contributors.length} contributors
              </p>
            </div>
            <Link href="/assess" className="px-4 py-2 rounded-xl bg-accent text-white text-[13px] font-medium hover:bg-accent-hover transition-colors">
              + Add context
            </Link>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex gap-1">
              <button onClick={() => setFilterDept("all")} className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${filterDept === "all" ? "bg-foreground text-background" : "bg-surface text-muted border border-border hover:text-foreground"}`}>
                All depts
              </button>
              {departments.map((d) => (
                <button key={d.name} onClick={() => setFilterDept(d.name)} className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${filterDept === d.name ? "bg-foreground text-background" : "bg-surface text-muted border border-border hover:text-foreground"}`}>
                  {d.name}
                </button>
              ))}
            </div>

            <div className="w-px h-5 bg-border" />

            <div className="flex gap-1">
              {([["all", "All"], ["bottleneck", "Bottlenecks"], ["has-rec", "Has recommendation"]] as const).map(([value, label]) => (
                <button key={value} onClick={() => setFilterType(value)} className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${filterType === value ? "bg-foreground text-background" : "bg-surface text-muted border border-border hover:text-foreground"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* View toggle */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-[12px] text-muted-light">{filtered.length} task{filtered.length !== 1 ? "s" : ""}</p>
            <div className="flex gap-1 bg-surface border border-border rounded-lg p-0.5">
              <button onClick={() => setView("graph")} className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${view === "graph" ? "bg-background text-foreground shadow-sm" : "text-muted"}`}>
                Graph
              </button>
              <button onClick={() => setView("list")} className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${view === "list" ? "bg-background text-foreground shadow-sm" : "text-muted"}`}>
                List
              </button>
            </div>
          </div>

          {/* Graph view */}
          {view === "graph" && (
            <div className="mb-8">
              <OrgGraph tasks={filtered} departments={departments.map((d) => d.name)} />
            </div>
          )}

          {/* Task list */}
          {view === "list" && <div className="space-y-2">
            {filtered.map((task) => {
              const taskContributors = contributors.filter((c) => task.contributors.includes(c.id));
              return (
                <Link
                  key={task.id}
                  href={`/intelligence/${task.id}`}
                  className="group block p-5 rounded-2xl border border-border hover:border-muted-light transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-surface text-muted border border-border">{task.department}</span>
                        <span className="text-[11px] text-muted-light">{task.frequency}</span>
                        <span className="text-[11px] text-muted-light">· {task.timeSpent}</span>
                        {task.isBottleneck && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-700 border border-red-200">Bottleneck</span>
                        )}
                        {task.recommendation && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent/10 text-accent border border-accent/20">
                            AI opportunity
                          </span>
                        )}
                      </div>
                      <h2 className="text-[15px] font-semibold group-hover:text-accent transition-colors">{task.title}</h2>
                      <p className="mt-0.5 text-[12px] text-muted leading-relaxed">{task.description}</p>

                      {/* Flow summary */}
                      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-light">
                        <span>{task.inputs.length} input{task.inputs.length !== 1 ? "s" : ""}</span>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                        <span>{task.steps.length} steps</span>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                        <span>{task.outputs.length} output{task.outputs.length !== 1 ? "s" : ""}</span>
                      </div>

                      {/* Tools + contributors */}
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex gap-1">
                          {task.tools.slice(0, 4).map((tool) => (
                            <span key={tool} className="px-2 py-0.5 rounded-md text-[10px] bg-surface border border-border text-muted">{tool}</span>
                          ))}
                          {task.tools.length > 4 && <span className="text-[10px] text-muted-light">+{task.tools.length - 4}</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          {taskContributors.map((c) => (
                            <div key={c.id} className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center text-[9px] font-bold text-accent" title={c.name}>
                              {c.name.charAt(0)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Impact preview if recommendation exists */}
                    {task.recommendation && (
                      <div className="shrink-0 text-right">
                        <p className="text-[14px] font-bold text-green-600">{task.recommendation.impact.timeSaved}</p>
                        <p className="text-[10px] text-muted-light">saved</p>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>}
        </div>
      </div>
    </AppShell>
  );
}
