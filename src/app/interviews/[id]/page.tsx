"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Zap, User as UserIcon, Building2 } from "lucide-react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { interviews, contributors, tasks } from "@/lib/mock-data";

const DEPT_COLORS: Record<string, string> = {
  Marketing: "#a855f7", Sales: "#22c55e", Operations: "#f59e0b",
  Engineering: "#6366f1", Product: "#ec4899", Finance: "#3b52ce",
};

export default function InterviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const interview = interviews.find((iv) => iv.id === id);
  if (!interview) notFound();

  const person = contributors.find((c) => c.id === interview.contributorId);
  if (!person) notFound();

  const deptColor = DEPT_COLORS[person.department] || "#6b7280";
  const relatedTasks = tasks.filter((t) => t.contributors.includes(person.id));

  return (
    <AppShell>
      <PageHeader
        title={`${person.name}'s Interview`}
        breadcrumbs={[{ label: "Interviews", href: "/interviews", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" }]}
      />

      <div className="flex-1 overflow-y-auto scroll-thin">
        <div className="max-w-3xl mx-auto px-8 py-8">
          {/* Profile card */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-[18px] font-bold text-white" style={{ background: deptColor }}>
              {person.name.charAt(0)}{person.name.split(" ")[1]?.[0]}
            </div>
            <div>
              <h2 className="text-[18px] font-semibold">{person.name}</h2>
              <p className="text-[13px] text-muted">{person.role} · {person.department}</p>
            </div>
          </div>

          {/* Meta stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="p-3 rounded-xl border border-border">
              <div className="flex items-center gap-1.5 text-muted-light mb-1">
                <Clock className="w-3 h-3" strokeWidth={1.5} />
                <span className="text-[10px] uppercase tracking-widest">Duration</span>
              </div>
              <p className="text-[14px] font-semibold">{interview.duration}</p>
            </div>
            <div className="p-3 rounded-xl border border-border">
              <div className="flex items-center gap-1.5 text-muted-light mb-1">
                <Zap className="w-3 h-3" strokeWidth={1.5} />
                <span className="text-[10px] uppercase tracking-widest">Workflows</span>
              </div>
              <p className="text-[14px] font-semibold">{interview.workflowsExtracted} extracted</p>
            </div>
            <div className="p-3 rounded-xl border border-border">
              <div className="flex items-center gap-1.5 text-muted-light mb-1">
                <Building2 className="w-3 h-3" strokeWidth={1.5} />
                <span className="text-[10px] uppercase tracking-widest">Department</span>
              </div>
              <p className="text-[14px] font-semibold">{person.department}</p>
            </div>
            <div className="p-3 rounded-xl border border-border">
              <div className="flex items-center gap-1.5 text-muted-light mb-1">
                <UserIcon className="w-3 h-3" strokeWidth={1.5} />
                <span className="text-[10px] uppercase tracking-widest">AI comfort</span>
              </div>
              <p className="text-[14px] font-semibold capitalize">{person.aiComfort}</p>
            </div>
          </div>

          {/* Extracted workflows */}
          {relatedTasks.length > 0 && (
            <div className="mb-8">
              <h3 className="text-[13px] font-semibold mb-3">Workflows extracted from this interview</h3>
              <div className="space-y-1.5">
                {relatedTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/intelligence/${task.id}`}
                    className="group flex items-center justify-between p-3 rounded-lg border border-border hover:border-muted-light transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: deptColor }} />
                      <span className="text-[13px] group-hover:text-accent transition-colors">{task.title}</span>
                    </div>
                    <span className="text-[11px] text-muted-light">{task.frequency} · {task.timeSpent}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Transcript */}
          <div>
            <h3 className="text-[13px] font-semibold mb-4">Full transcript</h3>
            <div className="rounded-2xl border border-border p-6 space-y-4">
              {interview.transcript ? (
                interview.transcript.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="shrink-0 w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center mr-2 mt-0.5">
                        <svg className="w-3 h-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25" /></svg>
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
          </div>

          {/* Completed timestamp */}
          {interview.completedAt && (
            <p className="mt-6 text-[11px] text-muted-light text-center">
              Completed {new Date(interview.completedAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" })}
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
