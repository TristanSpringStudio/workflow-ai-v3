"use client";

import Link from "next/link";
import AppShell from "@/components/AppShell";
import { company, tasks, getDepartments, getStats, contributors, roadmap } from "@/lib/mock-data";

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#16a34a" : score >= 50 ? "#2563eb" : score >= 30 ? "#d97706" : "#dc2626";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="4" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>{score}</span>
        <span className="text-[9px] text-muted-light">/ 100</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const stats = getStats();
  const departments = getDepartments();
  const bottleneckTasks = tasks.filter((t) => t.isBottleneck);
  const quickWins = tasks.filter((t) => t.recommendation?.phase === 1);

  // Estimate savings
  const totalTimeSaved = tasks.reduce((sum, t) => {
    if (!t.recommendation) return sum;
    const match = t.recommendation.impact.timeSaved.match(/(\d+\.?\d*)/);
    return sum + (match ? parseFloat(match[1]) : 0);
  }, 0);

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto scroll-thin">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
              <p className="mt-1 text-[14px] text-muted">{company.name} · {stats.totalTasks} tasks mapped · {stats.totalContributors} contributors</p>
            </div>
            <Link href="/assess" className="px-4 py-2 rounded-xl bg-accent text-white text-[13px] font-medium hover:bg-accent-hover transition-colors">
              + New interview
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="p-5 rounded-2xl border border-border flex flex-col items-center justify-center">
              <ScoreRing score={stats.avgReadiness} />
              <p className="mt-2 text-[12px] font-medium text-muted">AI Readiness</p>
            </div>
            <div className="p-5 rounded-2xl border border-border">
              <p className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-1">Tasks Mapped</p>
              <p className="text-2xl font-bold">{stats.totalTasks}</p>
              <p className="text-[12px] text-muted mt-1">Across {departments.length} departments</p>
            </div>
            <div className="p-5 rounded-2xl border border-border">
              <p className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-1">Potential Savings</p>
              <p className="text-2xl font-bold">{totalTimeSaved} <span className="text-[14px] font-normal text-muted">hrs/week</span></p>
              <p className="text-[12px] text-muted mt-1">{stats.recsCount} AI opportunities</p>
            </div>
            <div className="p-5 rounded-2xl border border-border">
              <p className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-1">Bottlenecks</p>
              <p className="text-2xl font-bold text-red-500">{stats.bottlenecks}</p>
              <p className="text-[12px] text-muted mt-1">Cross-team handoffs</p>
            </div>
          </div>

          {/* Departments */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-semibold">Departments</h2>
              <Link href="/intelligence" className="text-[12px] text-accent hover:text-accent-hover">View intelligence layer</Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {departments.map((dept) => (
                <Link key={dept.name} href={`/intelligence?dept=${dept.name}`} className="group p-4 rounded-xl border border-border hover:border-muted-light transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[13px] font-semibold group-hover:text-accent transition-colors">{dept.name}</h3>
                    <span className={`text-[12px] font-bold ${dept.aiReadiness >= 60 ? "text-green-600" : dept.aiReadiness >= 40 ? "text-amber-500" : "text-red-500"}`}>{Math.round(dept.aiReadiness)}</span>
                  </div>
                  <p className="text-[11px] text-muted-light">{dept.taskCount} tasks · {dept.contributors.length} people</p>
                  <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${dept.aiReadiness >= 60 ? "bg-green-500" : dept.aiReadiness >= 40 ? "bg-amber-500" : "bg-red-400"}`} style={{ width: `${dept.aiReadiness}%` }} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Bottlenecks */}
          {bottleneckTasks.length > 0 && (
            <div className="mb-8">
              <h2 className="text-[14px] font-semibold mb-4">Bottlenecks</h2>
              <div className="space-y-2">
                {bottleneckTasks.map((task) => (
                  <Link key={task.id} href={`/intelligence/${task.id}`} className="group block p-4 rounded-xl border border-red-200 bg-red-50/30 hover:border-red-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-[13px] font-semibold group-hover:text-red-700 transition-colors">{task.title}</h3>
                        <p className="text-[12px] text-red-700/60">{task.department} · {task.timeSpent} · {task.painPoints[0]}</p>
                      </div>
                      {task.recommendation && <span className="text-[12px] font-bold text-green-600">{task.recommendation.impact.timeSaved} saveable</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick wins */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-semibold">Quick Wins ({quickWins.length})</h2>
              <Link href="/recommendations" className="text-[12px] text-accent hover:text-accent-hover">View all</Link>
            </div>
            <div className="space-y-2">
              {quickWins.map((task) => (
                <Link key={task.id} href={`/intelligence/${task.id}`} className="group flex items-center justify-between p-4 rounded-xl border border-border hover:border-muted-light transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-[13px] font-semibold group-hover:text-accent transition-colors">{task.title}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface text-muted border border-border">{task.department}</span>
                    </div>
                    <p className="text-[12px] text-muted">{task.recommendation?.summary.slice(0, 80)}...</p>
                  </div>
                  <span className="text-[13px] font-bold text-green-600 shrink-0 ml-4">{task.recommendation?.impact.timeSaved}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Roadmap preview */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-semibold">Roadmap</h2>
              <Link href="/roadmap" className="text-[12px] text-accent hover:text-accent-hover">View full</Link>
            </div>
            <div className="flex gap-4">
              {roadmap.map((phase) => (
                <div key={phase.phase} className="flex-1 p-4 rounded-xl border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-md bg-accent/10 text-accent flex items-center justify-center text-[11px] font-bold">{phase.phase}</span>
                    <h3 className="text-[13px] font-semibold">{phase.name}</h3>
                  </div>
                  <p className="text-[11px] text-muted-light">{phase.duration} · {phase.taskIds.length} tasks</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
