"use client";

import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { company, contributors, getDepartments } from "@/lib/mock-data";

export default function SettingsPage() {
  const departments = getDepartments();
  return (
    <AppShell>
      <PageHeader title="Settings" subtitle={company.name} />
      <div className="flex-1 overflow-y-auto scroll-thin">
        <div className="max-w-2xl mx-auto px-8 py-8">

          <section className="mb-8">
            <h2 className="text-[13px] font-semibold text-muted-light uppercase tracking-wide mb-4">Company</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                <div>
                  <p className="text-[13px] font-medium">Company name</p>
                  <p className="text-[12px] text-muted">{company.name}</p>
                </div>
                <button className="text-[12px] text-accent hover:text-accent-hover">Edit</button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                <div>
                  <p className="text-[13px] font-medium">Industry</p>
                  <p className="text-[12px] text-muted">{company.industry}</p>
                </div>
                <button className="text-[12px] text-accent hover:text-accent-hover">Edit</button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                <div>
                  <p className="text-[13px] font-medium">Company size</p>
                  <p className="text-[12px] text-muted">{company.size} employees</p>
                </div>
                <button className="text-[12px] text-accent hover:text-accent-hover">Edit</button>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-[13px] font-semibold text-muted-light uppercase tracking-wide mb-4">Assessment</h2>
            <div className="p-4 rounded-xl border border-border">
              <p className="text-[13px] font-medium mb-1">Interviews completed</p>
              <p className="text-[12px] text-muted">{contributors.length} employees across {departments.length} departments</p>
              <p className="text-[12px] text-muted-light mt-2">Last interview: {new Date(contributors[contributors.length - 1].interviewedAt || "").toLocaleDateString()}</p>
            </div>
          </section>

          <section>
            <h2 className="text-[13px] font-semibold text-muted-light uppercase tracking-wide mb-4">Data</h2>
            <div className="space-y-3">
              <button className="w-full p-4 rounded-xl border border-border text-left hover:bg-surface transition-colors">
                <p className="text-[13px] font-medium">Export report</p>
                <p className="text-[12px] text-muted">Download the full intelligence report as PDF</p>
              </button>
              <button className="w-full p-4 rounded-xl border border-red-200 text-left hover:bg-red-50/50 transition-colors">
                <p className="text-[13px] font-medium text-red-600">Reset assessment</p>
                <p className="text-[12px] text-red-400">Clear all interview data and start over</p>
              </button>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
