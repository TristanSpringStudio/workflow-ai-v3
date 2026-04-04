"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import { mockIntelligence } from "@/lib/mock-data";

export default function DepartmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const dept = mockIntelligence.departments.find((d) => d.name.toLowerCase() === id);
  if (!dept) notFound();

  const deptRecs = mockIntelligence.recommendations.filter((r) => r.department === dept.name || r.connectedDepartments.includes(dept.name));
  const inflows = mockIntelligence.informationFlows.filter((f) => f.to === dept.name);
  const outflows = mockIntelligence.informationFlows.filter((f) => f.from === dept.name);

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto scroll-thin">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <Link href="/departments" className="text-[12px] text-muted hover:text-foreground transition-colors mb-4 inline-block">&larr; All departments</Link>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{dept.name}</h1>
              <p className="text-[14px] text-muted mt-1">{dept.employees.length} employees interviewed · {dept.tools.length} tools</p>
            </div>
            <div className="text-center">
              <p className={`text-3xl font-bold ${dept.aiReadiness >= 60 ? "text-green-600" : dept.aiReadiness >= 40 ? "text-amber-500" : "text-red-500"}`}>
                {Math.round(dept.aiReadiness)}
              </p>
              <p className="text-[11px] text-muted-light">AI Readiness</p>
            </div>
          </div>

          {/* People */}
          <section className="mb-8">
            <h2 className="text-[13px] font-semibold text-muted-light uppercase tracking-wide mb-3">Team Members</h2>
            <div className="grid grid-cols-2 gap-3">
              {dept.employees.map((emp) => (
                <div key={emp.id} className="p-4 rounded-xl border border-border">
                  <p className="text-[14px] font-semibold">{emp.name}</p>
                  <p className="text-[12px] text-muted">{emp.role}</p>
                  <p className="text-[11px] text-muted-light mt-1 capitalize">AI comfort: {emp.aiComfort}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {emp.tools.slice(0, 4).map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-md text-[10px] bg-surface border border-border text-muted">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Pain points + time wasters */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <section className="p-5 rounded-xl border border-red-200 bg-red-50/30">
              <h2 className="text-[12px] font-semibold text-red-700 uppercase tracking-wide mb-3">Pain Points</h2>
              <ul className="space-y-1.5">
                {dept.topPainPoints.map((pp, i) => (
                  <li key={i} className="text-[13px] text-red-900/70 flex gap-2"><span className="text-red-400 shrink-0">-</span>{pp}</li>
                ))}
              </ul>
            </section>
            <section className="p-5 rounded-xl border border-amber-200 bg-amber-50/30">
              <h2 className="text-[12px] font-semibold text-amber-700 uppercase tracking-wide mb-3">Time Wasters</h2>
              <ul className="space-y-1.5">
                {dept.topTimeWasters.map((tw, i) => (
                  <li key={i} className="text-[13px] text-amber-900/70 flex gap-2"><span className="text-amber-400 shrink-0">-</span>{tw}</li>
                ))}
              </ul>
            </section>
          </div>

          {/* Information flows */}
          <section className="mb-8">
            <h2 className="text-[13px] font-semibold text-muted-light uppercase tracking-wide mb-3">Information Flows</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-[12px] font-medium text-muted mb-2">Incoming ({inflows.length})</h3>
                <div className="space-y-2">
                  {inflows.map((f, i) => (
                    <div key={i} className={`p-3 rounded-lg border ${f.bottleneck ? "border-red-200 bg-red-50/30" : "border-border"}`}>
                      <p className="text-[12px] font-medium">From {f.from}</p>
                      <p className="text-[11px] text-muted">{f.type}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-[12px] font-medium text-muted mb-2">Outgoing ({outflows.length})</h3>
                <div className="space-y-2">
                  {outflows.map((f, i) => (
                    <div key={i} className={`p-3 rounded-lg border ${f.bottleneck ? "border-red-200 bg-red-50/30" : "border-border"}`}>
                      <p className="text-[12px] font-medium">To {f.to}</p>
                      <p className="text-[11px] text-muted">{f.type}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Recommendations for this dept */}
          {deptRecs.length > 0 && (
            <section>
              <h2 className="text-[13px] font-semibold text-muted-light uppercase tracking-wide mb-3">Recommended Workflows ({deptRecs.length})</h2>
              <div className="space-y-2">
                {deptRecs.map((rec) => (
                  <div key={rec.id} className="p-4 rounded-xl border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[13px] font-semibold">{rec.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${rec.priority === "critical" ? "bg-red-50 text-red-700" : rec.priority === "high" ? "bg-amber-50 text-amber-700" : "bg-surface text-muted"}`}>{rec.priority}</span>
                    </div>
                    <p className="text-[12px] text-muted">{rec.description}</p>
                    <p className="text-[11px] text-green-600 font-medium mt-1">{rec.impact.timeSaved} saved · {rec.impact.costSaved}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </AppShell>
  );
}
