"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { List, Map } from "lucide-react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import WorkflowCanvas from "@/components/WorkflowCanvas";
import { tasks, getDepartments, contributors } from "@/lib/mock-data";

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

type SortKey = "updated" | "title-az" | "title-za" | "dept" | "contributor";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "updated", label: "Last updated" },
  { key: "title-az", label: "Name A → Z" },
  { key: "title-za", label: "Name Z → A" },
  { key: "dept", label: "Department" },
  { key: "contributor", label: "Contributor" },
];

export default function IntelligencePage() {
  const departments = getDepartments();
  const [sortBy, setSortBy] = useState<SortKey>("updated");
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterDepts, setFilterDepts] = useState<Set<string>>(new Set());
  const [filterContributors, setFilterContributors] = useState<Set<string>>(new Set());
  const [filterStatuses, setFilterStatuses] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "canvas">("list");
  const sortRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  let sorted = [...tasks];

  // Search
  if (search) {
    const q = search.toLowerCase();
    sorted = sorted.filter((t) =>
      t.title.toLowerCase().includes(q) ||
      t.department.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tools.some((tool) => tool.toLowerCase().includes(q))
    );
  }

  // Filters (multi-select)
  if (filterDepts.size > 0) sorted = sorted.filter((t) => filterDepts.has(t.department));
  if (filterContributors.size > 0) sorted = sorted.filter((t) => t.contributors.some((c) => filterContributors.has(c)));
  if (filterStatuses.has("bottleneck")) sorted = sorted.filter((t) => t.isBottleneck);
  if (filterStatuses.has("ai-ready")) sorted = sorted.filter((t) => !!t.recommendation);

  // Sort
  if (sortBy === "updated") sorted.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  if (sortBy === "title-az") sorted.sort((a, b) => a.title.localeCompare(b.title));
  if (sortBy === "title-za") sorted.sort((a, b) => b.title.localeCompare(a.title));
  if (sortBy === "dept") sorted.sort((a, b) => a.department.localeCompare(b.department));
  if (sortBy === "contributor") sorted.sort((a, b) => {
    const aName = contributors.find((c) => c.id === a.contributors[0])?.name || "";
    const bName = contributors.find((c) => c.id === b.contributors[0])?.name || "";
    return aName.localeCompare(bName);
  });

  const activeFilterCount = filterDepts.size + filterContributors.size + filterStatuses.size;

  const toggleSet = <T,>(set: Set<T>, val: T): Set<T> => {
    const next = new Set(set);
    if (next.has(val)) next.delete(val);
    else next.add(val);
    return next;
  };

  const clearFilters = () => {
    setFilterDepts(new Set());
    setFilterContributors(new Set());
    setFilterStatuses(new Set());
  };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col min-h-0">
        <PageHeader title="Company Intelligence" />

        {/* Filter/Sort bar */}
        <div className="shrink-0 px-6 py-2.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Sort dropdown */}
            <div ref={sortRef} className="relative">
              <button
                onClick={() => { setSortOpen(!sortOpen); setFilterOpen(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border border-border hover:border-muted-light transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" /></svg>
                Sorted by <span className="text-foreground">{SORT_OPTIONS.find((s) => s.key === sortBy)?.label}</span>
              </button>
              {sortOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 rounded-xl bg-background border border-border shadow-lg z-20 py-1">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => { setSortBy(opt.key); setSortOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-[12px] hover:bg-surface transition-colors ${sortBy === opt.key ? "text-accent font-medium" : "text-muted"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-border" />

            {/* Filter dropdown */}
            <div ref={filterRef} className="relative">
              <button
                onClick={() => { setFilterOpen(!filterOpen); setSortOpen(false); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors ${activeFilterCount > 0 ? "border-accent/30 bg-accent/5 text-accent" : "border-border hover:border-muted-light text-muted"}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
                Filter
                {activeFilterCount > 0 && <span className="w-4 h-4 rounded-full bg-accent text-white text-[9px] flex items-center justify-center">{activeFilterCount}</span>}
              </button>
              {filterOpen && (
                <div className="absolute top-full left-0 mt-1 w-[320px] rounded-xl bg-background border border-border shadow-lg z-20 p-4">
                  {/* Department filter */}
                  <div className="mb-4">
                    <p className="text-[11px] font-medium text-muted-light uppercase tracking-widest mb-2">Department</p>
                    <div className="flex flex-wrap gap-1.5">
                      {departments.map((d) => (
                        <button
                          key={d.name}
                          onClick={() => setFilterDepts(toggleSet(filterDepts, d.name))}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${filterDepts.has(d.name) ? "border-accent/30 bg-accent/10 text-accent" : "border-border text-muted hover:border-muted-light"}`}
                        >
                          <span className="w-2 h-2 rounded-full" style={{ background: DEPT_COLORS[d.name] || "#9ca3af" }} />
                          {d.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Contributor filter */}
                  <div className="mb-4">
                    <p className="text-[11px] font-medium text-muted-light uppercase tracking-widest mb-2">Contributor</p>
                    <div className="flex flex-wrap gap-1.5">
                      {contributors.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setFilterContributors(toggleSet(filterContributors, c.id))}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${filterContributors.has(c.id) ? "border-accent/30 bg-accent/10 text-accent" : "border-border text-muted hover:border-muted-light"}`}
                        >
                          {c.name.split(" ")[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggle filters */}
                  <div className="mb-3">
                    <p className="text-[11px] font-medium text-muted-light uppercase tracking-widest mb-2">Status</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFilterStatuses(toggleSet(filterStatuses, "bottleneck"))}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${filterStatuses.has("bottleneck") ? "border-red-300 bg-red-50 text-red-700" : "border-border text-muted hover:border-muted-light"}`}
                      >
                        Bottlenecks
                      </button>
                      <button
                        onClick={() => setFilterStatuses(toggleSet(filterStatuses, "ai-ready"))}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${filterStatuses.has("ai-ready") ? "border-accent/30 bg-accent/10 text-accent" : "border-border text-muted hover:border-muted-light"}`}
                      >
                        AI opportunities
                      </button>
                    </div>
                  </div>

                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} className="text-[11px] text-accent hover:text-accent-hover">
                      Clear all filters
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Active filter pills */}
            {[...filterDepts].map((dept) => (
              <button key={dept} onClick={() => setFilterDepts(toggleSet(filterDepts, dept))} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border border-accent/20 bg-accent/5 text-accent">
                <span className="w-2 h-2 rounded-full" style={{ background: DEPT_COLORS[dept] || "#9ca3af" }} />
                {dept}
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            ))}
            {[...filterContributors].map((cId) => {
              const c = contributors.find((x) => x.id === cId);
              return c ? (
                <button key={cId} onClick={() => setFilterContributors(toggleSet(filterContributors, cId))} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border border-accent/20 bg-accent/5 text-accent">
                  {c.name.split(" ")[0]}
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              ) : null;
            })}
          </div>

          {/* View toggle + Search */}
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5 bg-surface border border-border rounded-lg p-0.5">
              <button onClick={() => setView("list")} className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${view === "list" ? "bg-background text-foreground shadow-sm" : "text-muted"}`}>
                <List className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
              <button onClick={() => setView("canvas")} className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${view === "canvas" ? "bg-background text-foreground shadow-sm" : "text-muted"}`}>
                <Map className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-44 h-8 pl-8 pr-3 rounded-lg bg-surface border border-border text-[12px] placeholder:text-muted-light focus:outline-none focus:border-accent/40 focus:w-64 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Canvas view */}
        {view === "canvas" && (
          <div className="flex-1">
            <WorkflowCanvas tasks={sorted} />
          </div>
        )}

        {/* Table (list view) */}
        {view === "list" && <div className="flex-1 overflow-y-auto scroll-thin">
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

                  <div className="flex items-center gap-1.5 text-[12px] text-muted">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: deptColor }} />
                    {task.department}
                  </div>

                  <span className="text-[12px] text-muted-light">{timeAgo(task.lastUpdated)}</span>
                </Link>
              );
            })}
          </div>

          {sorted.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-[13px] text-muted">No workflows match your filters</p>
              <button onClick={clearFilters} className="text-[12px] text-accent hover:text-accent-hover mt-1">Clear filters</button>
            </div>
          )}
        </div>}
      </div>
    </AppShell>
  );
}
