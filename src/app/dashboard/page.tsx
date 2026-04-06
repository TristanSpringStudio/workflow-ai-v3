"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Activity, DollarSign, Megaphone, TrendingUp, Wrench, FlaskConical, PackageSearch, User } from "lucide-react";
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

// Mock findings
const FINDINGS = [
  {
    depts: ["Sales", "Marketing"],
    text: "all pull from the same Salesforce data",
  },
  {
    person: "Priya Patel",
    text: "is single point of failure in",
    actions: [
      { label: "Implement invoice automation", dept: "Sales" },
      { label: "Set up chatbot", dept: "Marketing" },
      { label: "Automate P&L", dept: "Finance" },
    ],
  },
  {
    depts: ["Sales", "Marketing"],
    text: "all pull from the same Salesforce data",
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
                  <div key={i}>
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
    </AppShell>
  );
}
