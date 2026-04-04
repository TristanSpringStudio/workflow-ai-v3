"use client";

import { useState } from "react";
import type { Task, Contributor } from "@/lib/types";

const DEPT_COLORS: Record<string, { bg: string; border: string; text: string; accent: string }> = {
  Marketing: { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af", accent: "#3b82f6" },
  Sales: { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534", accent: "#22c55e" },
  Operations: { bg: "#fffbeb", border: "#fde68a", text: "#92400e", accent: "#f59e0b" },
  Engineering: { bg: "#eef2ff", border: "#c7d2fe", text: "#3730a3", accent: "#6366f1" },
  Product: { bg: "#fdf2f8", border: "#fbcfe8", text: "#9d174d", accent: "#ec4899" },
  Finance: { bg: "#f8fafc", border: "#e2e8f0", text: "#334155", accent: "#64748b" },
};
const DEFAULT_COLOR = { bg: "#f9fafb", border: "#e5e7eb", text: "#374151", accent: "#6b7280" };

interface SwimLaneMapProps {
  tasks: Task[];
  contributors: Contributor[];
  departments: string[];
  onSelectTask: (task: Task) => void;
  selectedTaskId?: string;
  highlightPerson?: string;
}

export default function SwimLaneMap({
  tasks,
  contributors,
  departments,
  onSelectTask,
  selectedTaskId,
  highlightPerson,
}: SwimLaneMapProps) {
  const [collapsedDepts, setCollapsedDepts] = useState<Set<string>>(new Set());

  const toggleDept = (dept: string) => {
    setCollapsedDepts((prev) => {
      const next = new Set(prev);
      if (next.has(dept)) next.delete(dept);
      else next.add(dept);
      return next;
    });
  };

  // Group tasks by department
  const tasksByDept: Record<string, Task[]> = {};
  departments.forEach((d) => { tasksByDept[d] = []; });
  tasks.forEach((t) => {
    if (!tasksByDept[t.department]) tasksByDept[t.department] = [];
    tasksByDept[t.department].push(t);
  });

  // Find cross-department connections
  const crossConnections: { fromId: string; toDept: string; label: string; bottleneck: boolean }[] = [];
  tasks.forEach((task) => {
    task.outputs.forEach((output) => {
      if (departments.includes(output.fromOrTo) && output.fromOrTo !== task.department) {
        crossConnections.push({ fromId: task.id, toDept: output.fromOrTo, label: output.what, bottleneck: task.isBottleneck });
      }
    });
  });

  return (
    <div className="rounded-2xl border border-border bg-[#fafbfc] overflow-hidden">
      {/* Legend */}
      <div className="px-4 py-2.5 border-b border-border flex items-center justify-between bg-background">
        <div className="flex items-center gap-4 text-[10px] text-muted-light">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent" /> AI opportunity</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Bottleneck</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-muted-light" /> Handoff</span>
        </div>
        <span className="text-[10px] text-muted-light">{tasks.length} tasks · {departments.length} departments</span>
      </div>

      {/* Swim lanes */}
      <div className="overflow-x-auto scroll-thin">
        <div className="min-w-[800px]">
          {departments.map((dept) => {
            const deptTasks = tasksByDept[dept] || [];
            const color = DEPT_COLORS[dept] || DEFAULT_COLOR;
            const isCollapsed = collapsedDepts.has(dept);
            const deptContributors = contributors.filter((c) => c.department === dept);

            return (
              <div key={dept} className="border-b border-border last:border-b-0">
                {/* Lane header */}
                <button
                  onClick={() => toggleDept(dept)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface/50 transition-colors text-left"
                >
                  <svg className={`w-3 h-3 text-muted transition-transform ${isCollapsed ? "" : "rotate-90"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  <span className="w-3 h-3 rounded-full" style={{ background: color.accent }} />
                  <span className="text-[13px] font-semibold" style={{ color: color.text }}>{dept}</span>
                  <span className="text-[11px] text-muted-light">{deptTasks.length} tasks</span>
                  {/* Contributors avatars */}
                  <div className="flex -space-x-1 ml-auto">
                    {deptContributors.slice(0, 3).map((c) => (
                      <div
                        key={c.id}
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold border-2 border-background ${highlightPerson === c.id ? "ring-2 ring-accent" : ""}`}
                        style={{ background: color.bg, color: color.text }}
                        title={c.name}
                      >
                        {c.name.charAt(0)}
                      </div>
                    ))}
                  </div>
                </button>

                {/* Tasks */}
                {!isCollapsed && (
                  <div className="px-4 pb-3 flex gap-2 overflow-x-auto scroll-thin">
                    {deptTasks.map((task) => {
                      const isSelected = selectedTaskId === task.id;
                      const isFaded = highlightPerson && !task.contributors.includes(highlightPerson);
                      const taskContribs = contributors.filter((c) => task.contributors.includes(c.id));
                      const hasRec = !!task.recommendation;
                      const hasConnection = crossConnections.some((cc) => cc.fromId === task.id);

                      return (
                        <button
                          key={task.id}
                          onClick={() => onSelectTask(task)}
                          className={`shrink-0 w-[200px] text-left p-3 rounded-xl border-2 transition-all ${
                            isSelected
                              ? "border-accent shadow-md"
                              : task.isBottleneck
                                ? "border-red-300"
                                : `border-transparent`
                          } ${isFaded ? "opacity-20" : ""}`}
                          style={{ background: isSelected ? "#ffffff" : color.bg }}
                        >
                          {/* Indicators */}
                          <div className="flex items-center gap-1 mb-1.5">
                            {task.isBottleneck && <span className="w-2 h-2 rounded-full bg-red-500" />}
                            {hasRec && !task.isBottleneck && <span className="w-2 h-2 rounded-full bg-accent" />}
                            {hasConnection && (
                              <svg className="w-3 h-3 text-muted-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /></svg>
                            )}
                            <span className="text-[9px] text-muted-light ml-auto">{task.frequency}</span>
                          </div>

                          {/* Title */}
                          <h3 className="text-[12px] font-semibold leading-snug" style={{ color: color.text }}>
                            {task.title}
                          </h3>

                          {/* Time + steps */}
                          <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-light">
                            <span>{task.timeSpent}</span>
                            <span>·</span>
                            <span>{task.steps.length} steps</span>
                          </div>

                          {/* Contributors */}
                          <div className="mt-2 flex items-center gap-1">
                            {taskContribs.map((c) => (
                              <div
                                key={c.id}
                                className={`w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold ${highlightPerson === c.id ? "ring-2 ring-accent" : ""}`}
                                style={{ background: "white", color: color.text, border: `1px solid ${color.border}` }}
                                title={c.name}
                              >
                                {c.name.charAt(0)}
                              </div>
                            ))}
                            {hasRec && (
                              <span className="ml-auto text-[9px] font-medium text-green-600">
                                {task.recommendation!.impact.timeSaved}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
