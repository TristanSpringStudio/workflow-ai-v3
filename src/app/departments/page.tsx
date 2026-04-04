"use client";

import Link from "next/link";
import AppShell from "@/components/AppShell";
import FlowCanvas from "@/components/FlowCanvas";
import { mockIntelligence } from "@/lib/mock-data";
import { buildOrgFlowMap } from "@/lib/flow-helpers";

export default function DepartmentsPage() {
  const data = mockIntelligence;
  const deptNames = data.departments.map((d) => d.name);
  const { nodes: flowNodes, edges: flowEdges } = buildOrgFlowMap(deptNames, data.informationFlows);

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto scroll-thin">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <h1 className="text-2xl font-semibold tracking-tight mb-2">Departments</h1>
          <p className="text-[14px] text-muted mb-8">{data.departments.length} departments mapped · {data.interviews.length} employees interviewed</p>

          {/* Department grid */}
          <div className="space-y-4 mb-12">
            {data.departments.map((dept) => (
              <Link
                key={dept.name}
                href={`/departments/${dept.name.toLowerCase()}`}
                className="group block p-5 rounded-2xl border border-border hover:border-muted-light transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[16px] font-semibold group-hover:text-accent transition-colors">{dept.name}</h2>
                  <div className="flex items-center gap-3">
                    <span className={`text-[14px] font-bold ${dept.aiReadiness >= 60 ? "text-green-600" : dept.aiReadiness >= 40 ? "text-amber-500" : "text-red-500"}`}>
                      {Math.round(dept.aiReadiness)} readiness
                    </span>
                    <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${dept.aiReadiness >= 60 ? "bg-green-500" : dept.aiReadiness >= 40 ? "bg-amber-500" : "bg-red-400"}`} style={{ width: `${dept.aiReadiness}%` }} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-[12px] text-muted-light mb-3">
                  <span>{dept.employees.length} interviewed</span>
                  <span>{dept.tools.length} tools</span>
                  <span>{dept.handoffsOut.length} outbound handoffs</span>
                </div>

                {/* Top pain points */}
                <div className="flex flex-wrap gap-1.5">
                  {dept.topPainPoints.slice(0, 3).map((pp, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-full text-[11px] bg-red-50 text-red-600 border border-red-100">{pp}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>

          {/* Information Flow Canvas */}
          <h2 className="text-[16px] font-semibold mb-4">Information Flow Map</h2>
          <div className="mb-8">
            <FlowCanvas nodes={flowNodes} edges={flowEdges} height={450} />
          </div>

          <h2 className="text-[16px] font-semibold mb-4">Flow Details</h2>
          <div className="space-y-2">
            {data.informationFlows.map((flow, i) => (
              <div key={i} className={`p-4 rounded-xl border ${flow.bottleneck ? "border-red-200 bg-red-50/30" : "border-border"}`}>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[13px] font-medium w-24">{flow.from}</span>
                  <svg className="w-5 h-5 text-muted-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  <span className="text-[13px] font-medium w-24">{flow.to}</span>
                  <span className="text-[11px] text-muted-light">{flow.frequency}</span>
                  {flow.bottleneck && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700">Bottleneck</span>}
                </div>
                <p className="text-[12px] text-muted ml-0">{flow.type}</p>
                {flow.aiOpportunity && <p className="text-[11px] text-accent mt-1">{flow.aiOpportunity}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
