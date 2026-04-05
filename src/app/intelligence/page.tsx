"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { tasks, contributors } from "@/lib/mock-data";

const DEPT_COLORS: Record<string, string> = {
  Marketing: "#3b82f6", Sales: "#22c55e", Operations: "#f59e0b",
  Engineering: "#6366f1", Product: "#ec4899", Finance: "#64748b",
};

function timeAgo(date: string) {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export default function IntelligencePage() {
  const [sortBy, setSortBy] = useState<"updated" | "title" | "dept">("updated");
  const [filterDept, setFilterDept] = useState<string | null>(null);

  let sorted = [...tasks];
  if (sortBy === "updated") sorted.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  if (sortBy === "title") sorted.sort((a, b) => a.title.localeCompare(b.title));
  if (sortBy === "dept") sorted.sort((a, b) => a.department.localeCompare(b.department));
  if (filterDept) sorted = sorted.filter((t) => t.department === filterDept);

  return (
    <AppShell>
      <div className="flex-1 flex flex-col min-h-0">
        <PageHeader title="Company Intelligence" subtitle={`${tasks.length} workflows · ${contributors.length} contributors`}>
          <button
            onClick={() => setSortBy(sortBy === "updated" ? "title" : sortBy === "title" ? "dept" : "updated")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-muted border border-border hover:border-muted-light transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" /></svg>
            Sorted by <span className="text-foreground">{sortBy === "updated" ? "Last updated" : sortBy === "title" ? "Name" : "Department"}</span>
          </button>
          {filterDept && (
            <button onClick={() => setFilterDept(null)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-accent bg-accent/5 border border-accent/20">
              {filterDept}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-surface transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
          </button>
        </PageHeader>

        {/* Table */}
        <div className="flex-1 overflow-y-auto scroll-thin">
          {/* Table header */}
          <div className="sticky top-0 z-10 bg-surface/80 backdrop-blur-sm border-b border-border px-6 py-2 grid grid-cols-[1fr_200px_160px_120px] gap-4 text-[11px] font-medium text-muted-light uppercase tracking-wider">
            <span>Workflow</span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" /></svg>
              Contributors
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75" /></svg>
              Departments
            </span>
            <span>Last updated</span>
          </div>

          {/* Rows */}
          <div>
            {sorted.map((task) => {
              const taskContribs = contributors.filter((c) => task.contributors.includes(c.id));
              const deptColor = DEPT_COLORS[task.department] || "#9ca3af";
              return (
                <Link
                  key={task.id}
                  href={`/intelligence/${task.id}`}
                  className="grid grid-cols-[1fr_200px_160px_120px] gap-4 px-6 py-3.5 border-b border-border hover:bg-surface/50 transition-colors items-center"
                >
                  <span className="text-[13px] font-medium text-foreground">{task.title}</span>

                  <div className="flex items-center gap-1.5">
                    {taskContribs.slice(0, 2).map((c) => (
                      <span key={c.id} className="flex items-center gap-1 text-[12px] text-muted">
                        <svg className="w-3 h-3 text-muted-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" /></svg>
                        {c.name.split(" ")[0]} {c.name.split(" ")[1]?.[0]}.
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFilterDept(task.department); }}
                    className="flex items-center gap-1.5 text-[12px] text-muted hover:text-foreground transition-colors"
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: deptColor }} />
                    {task.department}
                  </button>

                  <span className="text-[12px] text-muted-light">{timeAgo(task.lastUpdated)}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* AI Assistant FAB */}
        <Link href="/assess" className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2.5 rounded-full bg-accent text-white text-[13px] font-medium shadow-lg hover:bg-accent-hover transition-colors z-20">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
          Ask Vishtan
        </Link>
      </div>
    </AppShell>
  );
}
