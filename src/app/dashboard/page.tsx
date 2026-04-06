"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Activity, DollarSign, Megaphone, TrendingUp, Wrench, FlaskConical, PackageSearch, User, X, AlertTriangle, Clock, ArrowRight } from "lucide-react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { company, tasks, contributors } from "@/lib/mock-data";

const DEPT_ICONS: Record<string, { Icon: typeof DollarSign; bg: string }> = {
  Sales: { Icon: DollarSign, bg: "#22c55e" }, Marketing: { Icon: Megaphone, bg: "#a855f7" },
  Finance: { Icon: TrendingUp, bg: "#3b52ce" }, Operations: { Icon: Wrench, bg: "#f59e0b" },
  Engineering: { Icon: FlaskConical, bg: "#6366f1" }, Product: { Icon: PackageSearch, bg: "#ec4899" },
};

const SUGGESTED_QUESTIONS = [
  { dept: "Sales", label: "How can I automate my sales calls?" },
  { dept: "Marketing", label: "How can I book more appointments?" },
  { dept: "Finance", label: "How to make my P&L populate automatically?" },
];

interface Finding {
  id: string;
  depts?: string[];
  person?: string;
  text: string;
  actions?: { label: string; dept: string }[];
  // Detail fields for modal
  title: string;
  severity: "critical" | "high" | "medium";
  description: string;
  evidence: { quote: string; person: string; date: string }[];
  impact: string;
  recommendation: string;
  relatedWorkflows: { id: string; title: string; dept: string }[];
  estimatedSavings?: string;
}

const FINDINGS: Finding[] = [
  {
    id: "f1",
    depts: ["Sales", "Marketing"],
    text: "all pull from the same Salesforce data",
    title: "Redundant data pulling across Sales and Marketing",
    severity: "high",
    description: "Both the Sales and Marketing teams independently export data from Salesforce and HubSpot every week. Marketing pulls it for the weekly performance report. Sales pulls overlapping data for their forecast. Finance pulls some of the same HubSpot metrics monthly. That's 3 teams, pulling from the same sources, reformatting the same numbers — roughly 8 hours per week of duplicated effort.",
    evidence: [
      { quote: "I pull some of the same HubSpot data for my monthly financial reports. Didn't know marketing was pulling it weekly too.", person: "David Kim", date: "March 20, 2026" },
      { quote: "Every Friday I spend about 3 hours pulling data from GA, HubSpot, and our spreadsheets.", person: "Sarah Chen", date: "March 15, 2026" },
      { quote: "The forecasting requires pulling from 5 different reports.", person: "Marcus Rivera", date: "March 16, 2026" },
    ],
    impact: "~8 hours/week of redundant work across 3 departments. Data is often stale by the time it reaches leadership because each team pulls at different times.",
    recommendation: "Create a single automated data pipeline that pulls from Salesforce and HubSpot once, stores it in a shared dashboard, and lets each team query what they need. Eliminates all manual exports.",
    relatedWorkflows: [
      { id: "t1", title: "Weekly Performance Report", dept: "Marketing" },
      { id: "t11", title: "Sales Forecasting", dept: "Sales" },
      { id: "t5", title: "Month-End Financial Close", dept: "Finance" },
    ],
    estimatedSavings: "$20,800/year",
  },
  {
    id: "f2",
    person: "Priya Patel",
    text: "is single point of failure in",
    actions: [
      { label: "Client onboarding", dept: "Operations" },
      { label: "SOP documentation", dept: "Operations" },
      { label: "Status updates", dept: "Operations" },
    ],
    title: "Single point of failure: Priya Patel (Operations)",
    severity: "critical",
    description: "Priya is the sole contributor to 5 critical workflows in Operations — client onboarding, SOP documentation, status meetings, client health monitoring, and vendor management. None of these processes are documented. If Priya is unavailable, these workflows stop entirely.",
    evidence: [
      { quote: "When Sales closes a deal, I get an email with the contract attached. Then I have to manually create the checklist, the Jira tickets, schedule the kickoff — it takes 4 hours per client.", person: "Priya Patel", date: "March 17, 2026" },
      { quote: "I spend 8 hours a week on status meetings and writing follow-ups. That's a full day every week just on updates.", person: "Priya Patel", date: "March 17, 2026" },
    ],
    impact: "5 workflows with zero backup. If Priya takes vacation, client onboarding stops, status updates stop, and new SOPs don't get written. This is the highest operational risk in the organization.",
    recommendation: "Priority 1: Document Priya's top 3 processes using the SOP workflow. Priority 2: Cross-train at least one other team member on client onboarding. Priority 3: Automate the status update workflow to reduce her load by 6 hrs/week.",
    relatedWorkflows: [
      { id: "t3", title: "New Client Onboarding", dept: "Operations" },
      { id: "t8", title: "SOP Documentation", dept: "Operations" },
      { id: "t6", title: "Status Meetings & Updates", dept: "Operations" },
      { id: "t18", title: "Client Health Monitoring", dept: "Operations" },
    ],
    estimatedSavings: "$36,000/year",
  },
  {
    id: "f3",
    depts: ["Sales", "Operations"],
    text: "have a 14-day handoff bottleneck",
    title: "Sales → Operations handoff takes 14 days",
    severity: "high",
    description: "When a deal closes in Sales, the handoff to Operations for client onboarding takes an average of 14 days. The process involves email chains, manual Notion checklists, hand-created Jira tickets, and multiple rounds of clarification. The industry average for this handoff is 3 days.",
    evidence: [
      { quote: "I close the deal and then I basically have to re-explain everything to Ops over email. There should be a way for the deal info to just flow through.", person: "Marcus Rivera", date: "March 16, 2026" },
      { quote: "The setup tickets from Ops are often missing details. I end up pinging Priya to clarify requirements that were probably in the original contract.", person: "James Park", date: "March 18, 2026" },
    ],
    impact: "14-day delay between deal close and client onboarding start. Clients experience a 'dead zone' after signing. Risk of buyer's remorse and early churn.",
    recommendation: "Automate the handoff: when a deal is marked Closed Won in Salesforce, auto-generate the onboarding package (Notion checklist + Jira tickets) from the deal data. Target: 48-hour kickoff.",
    relatedWorkflows: [
      { id: "t3", title: "New Client Onboarding", dept: "Operations" },
      { id: "t2", title: "Prospect Outreach Emails", dept: "Sales" },
    ],
    estimatedSavings: "$15,600/year",
  },
];

// Mock activity
const ACTIVITY = [
  { person: "Sarah Chen", action: "just completed their interview", time: "15 mins ago" },
  { person: "Marcus Rivera", action: "just completed their interview", time: "2 hours ago" },
  { person: "Priya Patel", action: "just completed their interview", time: "1 day ago" },
];

function DeptChip({ dept }: { dept: string }) {
  const cfg = DEPT_ICONS[dept];
  if (!cfg) return <span className="px-2 py-0.5 rounded-md border border-border text-[11px]">{dept}</span>;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-border text-[11px]">
      <span className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
        <cfg.Icon className="w-2.5 h-2.5 text-white" strokeWidth={2} />
      </span>
      {dept}
    </span>
  );
}

function PersonChip({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-border text-[11px]">
      <User className="w-3 h-3 text-muted-light" strokeWidth={2} />
      {name}
    </span>
  );
}

function ActionChip({ label, dept }: { label: string; dept: string }) {
  const cfg = DEPT_ICONS[dept];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-border text-[11px]">
      {cfg && (
        <span className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
          <cfg.Icon className="w-2.5 h-2.5 text-white" strokeWidth={2} />
        </span>
      )}
      {label}
    </span>
  );
}

export default function HomePage() {
  const [chatInput, setChatInput] = useState("");
  const [activeFinding, setActiveFinding] = useState<Finding | null>(null);

  // Get time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <AppShell>
      <PageHeader title="Home" />
      <div className="flex-1 overflow-y-auto scroll-thin">
        <div className="max-w-3xl mx-auto px-8 py-8">

          {/* Greeting */}
          <h2 className="text-xl font-semibold tracking-tight mb-6">{greeting}, Frank</h2>

          {/* Chat input */}
          <div className="mb-3">
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
                  <Link href="/assess" className="w-9 h-9 rounded-lg bg-foreground text-background flex items-center justify-center hover:bg-foreground/80 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Suggested questions */}
          <div className="flex flex-wrap gap-2 mb-12">
            {SUGGESTED_QUESTIONS.map((q, i) => {
              const cfg = DEPT_ICONS[q.dept];
              return (
                <button
                  key={i}
                  onClick={() => setChatInput(q.label)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] border border-border hover:border-muted-light transition-colors"
                >
                  {cfg && (
                    <span className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
                      <cfg.Icon className="w-2.5 h-2.5 text-white" strokeWidth={2} />
                    </span>
                  )}
                  {q.label}
                </button>
              );
            })}
          </div>

          {/* Two columns: Top findings + Recent activity */}
          <div className="grid grid-cols-2 gap-6">
            {/* Top findings */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-muted" strokeWidth={1.5} />
                <h3 className="text-[14px] font-semibold">Top findings</h3>
              </div>

              <div className="rounded-2xl border border-border p-5 space-y-6">
                {FINDINGS.map((finding, i) => (
                  <div key={finding.id}>
                    <button onClick={() => setActiveFinding(finding)} className="w-full text-left hover:bg-surface/50 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                      {/* Department-based finding */}
                      {finding.depts && (
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            {finding.depts.map((d) => <DeptChip key={d} dept={d} />)}
                            <span className="text-[13px] font-medium">{finding.text}</span>
                          </div>
                        </div>
                      )}

                      {/* Person-based finding */}
                      {finding.person && (
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5 mb-2">
                            <PersonChip name={finding.person} />
                            <span className="text-[13px] font-medium">{finding.text}</span>
                          </div>
                          {finding.actions && (
                            <div className="flex flex-wrap gap-1.5 ml-0">
                              {finding.actions.map((a, j) => (
                                <ActionChip key={j} label={a.label} dept={a.dept} />
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </button>

                    {i < FINDINGS.length - 1 && <div className="mt-4" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent activity */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-muted" strokeWidth={1.5} />
                <h3 className="text-[14px] font-semibold">Recent activity</h3>
              </div>

              <div className="rounded-2xl border border-border p-5 space-y-4">
                {ACTIVITY.map((item, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <PersonChip name={item.person} />
                      <span className="text-[13px]">{item.action}</span>
                    </div>
                    <span className="text-[11px] text-muted-light">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center peek modal */}
      {activeFinding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={() => setActiveFinding(null)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative w-full max-w-2xl max-h-[85vh] bg-background rounded-2xl border border-border shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="shrink-0 px-6 py-4 border-b border-border">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      activeFinding.severity === "critical" ? "bg-red-100 text-red-700" :
                      activeFinding.severity === "high" ? "bg-amber-100 text-amber-700" :
                      "bg-surface text-muted"
                    }`}>
                      {activeFinding.severity}
                    </span>
                    {activeFinding.estimatedSavings && (
                      <span className="text-[12px] font-semibold text-green-600">{activeFinding.estimatedSavings} potential savings</span>
                    )}
                  </div>
                  <h2 className="text-[17px] font-semibold">{activeFinding.title}</h2>
                </div>
                <button onClick={() => setActiveFinding(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-surface transition-colors shrink-0">
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto scroll-thin px-6 py-5 space-y-6">
              {/* Description */}
              <p className="text-[14px] text-muted leading-relaxed">{activeFinding.description}</p>

              {/* Evidence */}
              <div>
                <h3 className="text-[12px] font-semibold text-muted-light uppercase tracking-widest mb-3">Evidence from interviews</h3>
                <div className="space-y-3">
                  {activeFinding.evidence.map((e, i) => (
                    <div key={i} className="p-3.5 rounded-xl border border-border">
                      <p className="text-[13px] italic text-foreground leading-relaxed">&ldquo;{e.quote}&rdquo;</p>
                      <div className="mt-2 flex items-center gap-2 text-[11px] text-muted">
                        <PersonChip name={e.person} />
                        <span>{e.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Impact */}
              <div className="p-4 rounded-xl bg-red-50/50 border border-red-200/50">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" strokeWidth={1.5} />
                  <h3 className="text-[12px] font-semibold text-red-700 uppercase tracking-widest">Impact</h3>
                </div>
                <p className="text-[13px] text-red-900/70 leading-relaxed">{activeFinding.impact}</p>
              </div>

              {/* Recommendation */}
              <div className="p-4 rounded-xl bg-accent/[0.03] border border-accent/10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-accent" strokeWidth={1.5} />
                  <h3 className="text-[12px] font-semibold text-accent uppercase tracking-widest">Recommendation</h3>
                </div>
                <p className="text-[13px] text-foreground/80 leading-relaxed">{activeFinding.recommendation}</p>
              </div>

              {/* Related workflows */}
              <div>
                <h3 className="text-[12px] font-semibold text-muted-light uppercase tracking-widest mb-3">Related workflows</h3>
                <div className="space-y-1.5">
                  {activeFinding.relatedWorkflows.map((wf) => {
                    const cfg = DEPT_ICONS[wf.dept];
                    const IconComp = cfg?.Icon || Wrench;
                    return (
                      <Link
                        key={wf.id}
                        href={`/intelligence/${wf.id}`}
                        onClick={() => setActiveFinding(null)}
                        className="group flex items-center gap-2.5 p-2.5 rounded-lg border border-border hover:border-muted-light transition-colors"
                      >
                        <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: cfg?.bg || "#6b7280" }}>
                          <IconComp className="w-3 h-3 text-white" strokeWidth={2} />
                        </div>
                        <span className="text-[13px] group-hover:text-accent transition-colors">{wf.title}</span>
                        <ArrowRight className="w-3 h-3 text-muted-light ml-auto opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
