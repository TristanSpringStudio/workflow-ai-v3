"use client";

import Link from "next/link";
import AppShell from "@/components/AppShell";
import { mockIntelligence } from "@/lib/mock-data";

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
        <span className="text-[9px] text-muted-light uppercase tracking-wide">/ 100</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const data = mockIntelligence;
  const totalInterviews = data.interviews.length;
  const totalDepts = data.departments.length;
  const bottlenecks = data.informationFlows.filter((f) => f.bottleneck).length;
  const phase1Recs = data.recommendations.filter((r) => r.phase === 1);

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto scroll-thin">
        <div className="max-w-5xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Company Intelligence</h1>
              <p className="mt-1 text-[14px] text-muted">
                {data.company.name} · {totalDepts} departments · {totalInterviews} interviews completed
              </p>
            </div>
            <Link href="/assess" className="px-4 py-2 rounded-xl bg-accent text-white text-[13px] font-medium hover:bg-accent-hover transition-colors">
              + New interview
            </Link>
          </div>

          {/* Top stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {/* Readiness Score */}
            <div className="col-span-1 p-5 rounded-2xl border border-border flex flex-col items-center justify-center">
              <ScoreRing score={data.readinessScore} />
              <p className="mt-2 text-[12px] font-medium text-muted">AI Readiness</p>
            </div>

            {/* Key metrics */}
            <div className="col-span-3 grid grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl border border-border">
                <p className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-1">Potential Time Saved</p>
                <p className="text-2xl font-bold">{data.estimatedSavings.hoursPerWeek} <span className="text-[14px] font-normal text-muted">hrs/week</span></p>
                <p className="text-[12px] text-muted mt-1">Across all departments</p>
              </div>
              <div className="p-5 rounded-2xl border border-border">
                <p className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-1">Est. Annual Savings</p>
                <p className="text-2xl font-bold">${(data.estimatedSavings.annualCost / 1000).toFixed(0)}K</p>
                <p className="text-[12px] text-muted mt-1">At current team costs</p>
              </div>
              <div className="p-5 rounded-2xl border border-border">
                <p className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-1">Bottlenecks Found</p>
                <p className="text-2xl font-bold text-red-500">{bottlenecks}</p>
                <p className="text-[12px] text-muted mt-1">Cross-department handoffs</p>
              </div>
            </div>
          </div>

          {/* Departments overview */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-semibold">Department Readiness</h2>
              <Link href="/departments" className="text-[12px] text-accent hover:text-accent-hover">View all</Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {data.departments.map((dept) => (
                <Link
                  key={dept.name}
                  href={`/departments/${dept.name.toLowerCase()}`}
                  className="group p-4 rounded-xl border border-border hover:border-muted-light transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[13px] font-semibold group-hover:text-accent transition-colors">{dept.name}</h3>
                    <span className={`text-[12px] font-bold ${dept.aiReadiness >= 60 ? "text-green-600" : dept.aiReadiness >= 40 ? "text-amber-500" : "text-red-500"}`}>
                      {Math.round(dept.aiReadiness)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-light">{dept.employees.length} interviewed · {dept.tools.length} tools</p>
                  {/* Readiness bar */}
                  <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${dept.aiReadiness >= 60 ? "bg-green-500" : dept.aiReadiness >= 40 ? "bg-amber-500" : "bg-red-400"}`}
                      style={{ width: `${dept.aiReadiness}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Information Flow Bottlenecks */}
          <div className="mb-8">
            <h2 className="text-[14px] font-semibold mb-4">Information Flow Bottlenecks</h2>
            <div className="space-y-2">
              {data.informationFlows.filter((f) => f.bottleneck).map((flow, i) => (
                <div key={i} className="p-4 rounded-xl border border-red-200 bg-red-50/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[12px] font-semibold">{flow.from}</span>
                    <svg className="w-4 h-4 text-muted-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    <span className="text-[12px] font-semibold">{flow.to}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700">Bottleneck</span>
                  </div>
                  <p className="text-[12px] text-muted">{flow.type} · via {flow.method} · {flow.frequency}</p>
                  {flow.aiOpportunity && (
                    <p className="mt-1 text-[12px] text-accent font-medium">{flow.aiOpportunity}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick wins */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-semibold">Phase 1: Quick Wins ({phase1Recs.length})</h2>
              <Link href="/recommendations" className="text-[12px] text-accent hover:text-accent-hover">View all recommendations</Link>
            </div>
            <div className="space-y-2">
              {phase1Recs.map((rec) => (
                <Link
                  key={rec.id}
                  href="/recommendations"
                  className="group flex items-center justify-between p-4 rounded-xl border border-border hover:border-muted-light transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-[13px] font-semibold group-hover:text-accent transition-colors">{rec.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${rec.priority === "critical" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                        {rec.priority}
                      </span>
                      {rec.crossDepartment && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-700">Cross-dept</span>
                      )}
                    </div>
                    <p className="text-[12px] text-muted">{rec.department} · {rec.impact.timeSaved} saved · {rec.difficulty}</p>
                  </div>
                  <span className="text-[13px] font-bold text-green-600">{rec.impact.costSaved}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Roadmap preview */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-semibold">Implementation Roadmap</h2>
              <Link href="/roadmap" className="text-[12px] text-accent hover:text-accent-hover">View full roadmap</Link>
            </div>
            <div className="flex gap-4">
              {data.roadmap.map((phase) => (
                <div key={phase.phase} className="flex-1 p-4 rounded-xl border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-md bg-accent/10 text-accent flex items-center justify-center text-[11px] font-bold">{phase.phase}</span>
                    <h3 className="text-[13px] font-semibold">{phase.name}</h3>
                  </div>
                  <p className="text-[11px] text-muted-light mb-2">{phase.duration}</p>
                  <p className="text-[12px] text-muted leading-relaxed">{phase.description}</p>
                  <p className="mt-2 text-[11px] text-muted-light">{phase.recommendations.length} workflows · {phase.milestones.length} milestones</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
