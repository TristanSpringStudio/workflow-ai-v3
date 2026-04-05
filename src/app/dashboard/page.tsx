"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { company, tasks, getDepartments, getStats, roadmap } from "@/lib/mock-data";

const SUGGESTED_QUESTIONS = [
  { icon: "💰", color: "bg-amber-50 border-amber-200 text-amber-800", label: "How can I automate my sales calls?" },
  { icon: "📅", color: "bg-orange-50 border-orange-200 text-orange-800", label: "How can I book more appointments?" },
  { icon: "📊", color: "bg-blue-50 border-blue-200 text-blue-800", label: "How to make my P&L populate automatically?" },
];

function ScoreRing({ score, size = 72 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#16a34a" : score >= 50 ? "#2563eb" : score >= 30 ? "#d97706" : "#dc2626";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="3.5" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [chatInput, setChatInput] = useState("");
  const stats = getStats();
  const departments = getDepartments();
  const bottleneckTasks = tasks.filter((t) => t.isBottleneck);
  const quickWins = tasks.filter((t) => t.recommendation?.phase === 1);

  const totalTimeSaved = tasks.reduce((sum, t) => {
    if (!t.recommendation) return sum;
    const match = t.recommendation.impact.timeSaved.match(/(\d+\.?\d*)/);
    return sum + (match ? parseFloat(match[1]) : 0);
  }, 0);

  return (
    <AppShell>
      <PageHeader title="Home" subtitle={`${company.name} · ${stats.totalTasks} tasks mapped`} />
      <div className="flex-1 overflow-y-auto scroll-thin">
        <div className="max-w-4xl mx-auto px-8 py-8">

          {/* Chat input — the entrypoint */}
          <div className="mb-10">
            <div className="chat-border rounded-2xl p-1">
              <div className="bg-background rounded-[14px] p-4">
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask anything about your company ..."
                  rows={3}
                  className="w-full bg-transparent text-[15px] placeholder:text-muted-light focus:outline-none resize-none leading-relaxed"
                />
                <div className="flex justify-end mt-1">
                  <Link
                    href="/assess"
                    className="w-9 h-9 rounded-lg bg-accent text-white flex items-center justify-center hover:bg-accent-hover transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Suggested questions */}
            <div className="flex gap-2 mt-3 justify-center">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setChatInput(q.label)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-[12px] font-medium border transition-colors hover:shadow-sm ${q.color}`}
                >
                  <span>{q.icon}</span>
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-2xl border border-border flex items-center gap-4">
              <ScoreRing score={stats.avgReadiness} />
              <div>
                <p className="text-[11px] text-muted-light uppercase tracking-widest">AI Readiness</p>
                <p className="text-[13px] font-medium mt-0.5">{stats.avgReadiness}/100</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl border border-border">
              <p className="text-[11px] text-muted-light uppercase tracking-widest">Tasks Mapped</p>
              <p className="text-2xl font-bold mt-1">{stats.totalTasks}</p>
              <p className="text-[11px] text-muted">{departments.length} departments</p>
            </div>
            <div className="p-4 rounded-2xl border border-border">
              <p className="text-[11px] text-muted-light uppercase tracking-widest">Potential Savings</p>
              <p className="text-2xl font-bold mt-1">{totalTimeSaved} <span className="text-[13px] font-normal text-muted">hrs/wk</span></p>
              <p className="text-[11px] text-muted">{stats.recsCount} opportunities</p>
            </div>
            <div className="p-4 rounded-2xl border border-border">
              <p className="text-[11px] text-muted-light uppercase tracking-widest">Bottlenecks</p>
              <p className="text-2xl font-bold mt-1 text-red-500">{stats.bottlenecks}</p>
              <p className="text-[11px] text-muted">Cross-team handoffs</p>
            </div>
          </div>

          {/* Two columns: departments + bottlenecks */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Departments */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[13px] font-semibold">Departments</h2>
                <Link href="/intelligence" className="text-[11px] text-accent hover:text-accent-hover">View all</Link>
              </div>
              <div className="space-y-2">
                {departments.map((dept) => (
                  <Link key={dept.name} href={`/intelligence?dept=${dept.name}`} className="group flex items-center justify-between p-3 rounded-xl border border-border hover:border-muted-light transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: ({ Marketing: "#3b82f6", Sales: "#22c55e", Operations: "#f59e0b", Engineering: "#6366f1", Product: "#ec4899", Finance: "#64748b" } as Record<string, string>)[dept.name] || "#9ca3af" }} />
                      <span className="text-[13px] font-medium group-hover:text-accent transition-colors">{dept.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-light">
                      <span>{dept.taskCount} tasks</span>
                      <div className="w-14 h-1.5 bg-border rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${dept.aiReadiness >= 60 ? "bg-green-500" : dept.aiReadiness >= 40 ? "bg-amber-500" : "bg-red-400"}`} style={{ width: `${dept.aiReadiness}%` }} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Bottlenecks */}
            <div>
              <h2 className="text-[13px] font-semibold mb-3">Bottlenecks</h2>
              <div className="space-y-2">
                {bottleneckTasks.map((task) => (
                  <Link key={task.id} href={`/intelligence/${task.id}`} className="group block p-3 rounded-xl border border-red-200 bg-red-50/30 hover:border-red-300 transition-colors">
                    <h3 className="text-[12px] font-semibold group-hover:text-red-700 transition-colors">{task.title}</h3>
                    <p className="text-[11px] text-red-700/60 mt-0.5">{task.department} · {task.timeSpent}</p>
                    {task.recommendation && <p className="text-[11px] font-medium text-green-600 mt-1">{task.recommendation.impact.timeSaved} saveable</p>}
                  </Link>
                ))}
                {bottleneckTasks.length === 0 && <p className="text-[12px] text-muted-light p-3">No bottlenecks detected</p>}
              </div>
            </div>
          </div>

          {/* Quick wins */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-semibold">Quick Wins</h2>
              <Link href="/recommendations" className="text-[11px] text-accent hover:text-accent-hover">View all</Link>
            </div>
            <div className="space-y-2">
              {quickWins.slice(0, 4).map((task) => (
                <Link key={task.id} href={`/intelligence/${task.id}`} className="group flex items-center justify-between p-3 rounded-xl border border-border hover:border-muted-light transition-colors">
                  <div>
                    <h3 className="text-[12px] font-semibold group-hover:text-accent transition-colors">{task.title}</h3>
                    <p className="text-[11px] text-muted mt-0.5">{task.department} · {task.recommendation?.difficulty}</p>
                  </div>
                  <span className="text-[12px] font-bold text-green-600 shrink-0">{task.recommendation?.impact.timeSaved}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Roadmap preview */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-semibold">Roadmap</h2>
              <Link href="/roadmap" className="text-[11px] text-accent hover:text-accent-hover">View full</Link>
            </div>
            <div className="flex gap-3">
              {roadmap.map((phase) => (
                <div key={phase.phase} className="flex-1 p-3 rounded-xl border border-border">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-md bg-accent/10 text-accent flex items-center justify-center text-[10px] font-bold">{phase.phase}</span>
                    <h3 className="text-[12px] font-semibold">{phase.name}</h3>
                  </div>
                  <p className="text-[10px] text-muted-light">{phase.duration} · {phase.taskIds.length} tasks</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
