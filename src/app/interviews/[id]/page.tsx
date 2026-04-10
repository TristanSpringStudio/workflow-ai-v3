"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Sun, DollarSign, Megaphone, TrendingUp, Wrench, FlaskConical, PackageSearch } from "lucide-react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { useCompanyData } from "@/lib/company-data";

const DEPT_COLORS: Record<string, string> = {
  Marketing: "#a855f7", Sales: "#22c55e", Operations: "#f59e0b",
  Engineering: "#6366f1", Product: "#ec4899", Finance: "#3b52ce",
};

const DEPT_ICONS: Record<string, { Icon: typeof DollarSign; bg: string }> = {
  Sales: { Icon: DollarSign, bg: "#22c55e" }, Marketing: { Icon: Megaphone, bg: "#a855f7" },
  Finance: { Icon: TrendingUp, bg: "#3b52ce" }, Operations: { Icon: Wrench, bg: "#f59e0b" },
  Engineering: { Icon: FlaskConical, bg: "#6366f1" }, Product: { Icon: PackageSearch, bg: "#ec4899" },
};

export default function InterviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { interviews, contributors, tasks } = useCompanyData();
  const interview = interviews.find((iv) => iv.id === id);
  if (!interview) notFound();

  const person = contributors.find((c) => c.id === interview.contributorId);
  if (!person) notFound();

  const deptColor = DEPT_COLORS[person.department] || "#6b7280";
  const relatedTasks = tasks.filter((t) => t.contributors.includes(person.id));
  const deptIcon = DEPT_ICONS[person.department];
  const DeptIcon = deptIcon?.Icon || Wrench;
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);
  const hasTranscript = !!(interview.transcript && interview.transcript.length > 0);

  return (
    <AppShell>
      <PageHeader
        title={`${person.name}'s Interview`}
        breadcrumbs={[{ label: "Interviews", href: "/interviews", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" }]}
      />

      <div className="flex-1 overflow-y-auto scroll-thin">
        <div className="max-w-2xl mx-auto px-8 py-10">

          {/* Profile header */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-[18px] font-bold text-white shrink-0" style={{ background: deptColor }}>
              {person.name.charAt(0)}{person.name.split(" ")[1]?.[0]}
            </div>
            <div>
              <h2 className="text-[22px] font-semibold tracking-tight">{person.name}</h2>
              <p className="text-[13px] text-muted">{person.role} · {person.department}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="border-t border-border" />
          <div className="grid grid-cols-3 py-6">
            <div>
              <p className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-1.5">Completed</p>
              <p className="text-[15px] font-medium">
                {interview.completedAt
                  ? new Date(interview.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-1.5">Workflows extracted</p>
              <p className="text-[15px] font-medium">{interview.workflowsExtracted}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-1.5">AI comfort</p>
              <p className="text-[15px] font-medium capitalize">{person.aiComfort}</p>
            </div>
          </div>
          <div className="border-t border-border mb-10" />

          {/* Department */}
          <div className="mb-6">
            <h3 className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-3">Department</h3>
            <Link href={`/departments/${person.department.toLowerCase()}`} className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border hover:border-muted-light transition-colors">
              <div className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ background: deptIcon?.bg || "#6b7280" }}>
                <DeptIcon className="w-2.5 h-2.5 text-white" strokeWidth={2} />
              </div>
              <span className="text-[12px] group-hover:text-accent transition-colors">{person.department}</span>
            </Link>
          </div>

          {/* Extracted workflows */}
          {relatedTasks.length > 0 && (
            <div className="mb-6">
              <h3 className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-3">Workflows extracted</h3>
              <div className="flex flex-wrap gap-1.5">
                {relatedTasks.map((task) => {
                  const tDeptIcon = DEPT_ICONS[task.department];
                  const TIcon = tDeptIcon?.Icon || Wrench;
                  return (
                    <Link
                      key={task.id}
                      href={`/intelligence/${task.id}`}
                      className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border hover:border-muted-light transition-colors"
                    >
                      <div className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ background: tDeptIcon?.bg || "#6b7280" }}>
                        <TIcon className="w-2.5 h-2.5 text-white" strokeWidth={2} />
                      </div>
                      <span className="text-[12px] group-hover:text-accent transition-colors">{task.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Transcript */}
          <div className="mb-6">
            <h3 className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-3">Transcript</h3>
            <div className="relative">
              <div className={`rounded-2xl border border-border p-6 space-y-4 overflow-hidden ${transcriptExpanded ? "" : "max-h-[480px]"}`}>
                {hasTranscript ? (
                  interview.transcript!.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.role === "assistant" && (
                        <div className="shrink-0 w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center mr-2 mt-0.5">
                          <Sun className="w-3 h-3 text-muted" strokeWidth={2} />
                        </div>
                      )}
                      <div className={`max-w-[80%] ${
                        msg.role === "user"
                          ? "px-3.5 py-2 rounded-2xl rounded-br-md bg-surface border border-border text-[13px]"
                          : "text-[13px] text-muted leading-relaxed"
                      }`}>
                        {msg.content}
                      </div>
                      {msg.role === "user" && (
                        <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center ml-2 mt-0.5 text-[8px] font-bold" style={{ background: deptColor, color: "white" }}>
                          {person.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-[13px] text-muted-light text-center py-8">Transcript not available for this interview.</p>
                )}
              </div>

              {/* Fade + show button — only when collapsed and there's transcript to hide */}
              {hasTranscript && !transcriptExpanded && (
                <>
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none rounded-b-2xl" />
                  <div className="absolute inset-x-0 bottom-6 flex justify-center">
                    <button
                      onClick={() => setTranscriptExpanded(true)}
                      className="px-4 py-2 rounded-lg bg-background border border-border text-[12px] font-medium hover:border-muted-light transition-colors shadow-sm"
                    >
                      Show full transcript
                    </button>
                  </div>
                </>
              )}
            </div>

            {hasTranscript && transcriptExpanded && (
              <div className="mt-3 flex justify-center">
                <button
                  onClick={() => setTranscriptExpanded(false)}
                  className="text-[12px] text-muted hover:text-foreground transition-colors"
                >
                  Hide transcript
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </AppShell>
  );
}
