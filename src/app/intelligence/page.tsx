"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import SwimLaneMap from "@/components/SwimLaneMap";
import TaskPanel from "@/components/TaskPanel";
import { tasks, getDepartments, contributors } from "@/lib/mock-data";
import type { Task } from "@/lib/types";

export default function IntelligencePage() {
  const departments = getDepartments();
  const deptNames = departments.map((d) => d.name);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [highlightPerson, setHighlightPerson] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState<"all" | "bottleneck" | "ai">("all");

  const filteredTasks = tasks.filter((t) => {
    if (showFilter === "bottleneck") return t.isBottleneck;
    if (showFilter === "ai") return !!t.recommendation;
    return true;
  });

  const personTasks = highlightPerson
    ? tasks.filter((t) => t.contributors.includes(highlightPerson)).length
    : null;

  const selectedPerson = highlightPerson
    ? contributors.find((c) => c.id === highlightPerson)
    : null;

  return (
    <AppShell>
      <div className="flex-1 flex min-h-0">
        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="shrink-0 px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-[18px] font-semibold tracking-tight">Intelligence Layer</h1>
                <p className="text-[12px] text-muted">{tasks.length} tasks · {contributors.length} contributors · {deptNames.length} departments</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Filter pills */}
                {(["all", "bottleneck", "ai"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setShowFilter(f)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                      showFilter === f ? "bg-foreground text-background" : "bg-surface text-muted border border-border"
                    }`}
                  >
                    {f === "all" ? "All tasks" : f === "bottleneck" ? "Bottlenecks" : "AI opportunities"}
                  </button>
                ))}
              </div>
            </div>

            {/* Person filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-light mr-1">People:</span>
              <button
                onClick={() => setHighlightPerson(null)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${!highlightPerson ? "bg-foreground text-background" : "bg-surface text-muted border border-border"}`}
              >
                All
              </button>
              {contributors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setHighlightPerson(highlightPerson === c.id ? null : c.id)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                    highlightPerson === c.id ? "bg-accent text-white" : "bg-surface text-muted border border-border hover:border-accent/30"
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-bold ${highlightPerson === c.id ? "bg-white/30" : "bg-accent/10 text-accent"}`}>
                    {c.name.charAt(0)}
                  </span>
                  {c.name.split(" ")[0]}
                </button>
              ))}
            </div>

            {/* Person summary */}
            {selectedPerson && (
              <div className="mt-2 p-2.5 rounded-lg bg-accent/5 border border-accent/10 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-[11px] font-bold text-accent">
                  {selectedPerson.name.charAt(0)}{selectedPerson.name.split(" ")[1]?.charAt(0)}
                </div>
                <div>
                  <p className="text-[12px] font-medium">{selectedPerson.name} <span className="text-muted font-normal">· {selectedPerson.role} · {selectedPerson.department}</span></p>
                  <p className="text-[10px] text-muted-light">{personTasks} tasks · AI comfort: {selectedPerson.aiComfort}</p>
                </div>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="flex-1 overflow-y-auto scroll-thin p-4">
            <SwimLaneMap
              tasks={filteredTasks}
              contributors={contributors}
              departments={deptNames}
              onSelectTask={(task) => setSelectedTask(task)}
              selectedTaskId={selectedTask?.id}
              highlightPerson={highlightPerson || undefined}
            />
          </div>
        </div>

        {/* Task detail panel */}
        {selectedTask && (
          <TaskPanel
            task={selectedTask}
            contributors={contributors}
            onClose={() => setSelectedTask(null)}
          />
        )}
      </div>
    </AppShell>
  );
}
