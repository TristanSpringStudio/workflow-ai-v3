"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Upload, X } from "lucide-react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { useCompanyData } from "@/lib/company-data";
import type { Company } from "@/lib/types";

const INDUSTRY_OPTIONS = [
  "SaaS",
  "E-commerce",
  "Financial Services",
  "Healthcare",
  "Manufacturing",
  "Professional Services",
  "Media",
  "Education",
  "Real Estate",
  "Other",
];

const SIZE_OPTIONS = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
];

export default function SettingsPage() {
  const { company, contributors, getDepartments, isRealData, updateCompany, refresh } = useCompanyData();
  const departments = getDepartments();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state — initialized from company, kept in sync when company changes externally
  const [name, setName] = useState(company.name);
  const [industry, setIndustry] = useState(company.industry);
  const [size, setSize] = useState(company.size);

  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  // Sync local form when the underlying company changes (e.g. after refresh)
  useEffect(() => {
    setName(company.name);
    setIndustry(company.industry);
    setSize(company.size);
  }, [company.name, company.industry, company.size]);

  const isDirty =
    name.trim() !== company.name ||
    industry !== company.industry ||
    size !== company.size;

  const canSave = isDirty && name.trim().length > 0 && !saving;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          industry,
          size,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to save");
      }
      updateCompany(json.company as Company);
      setSavedAt(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function handleDiscard() {
    setName(company.name);
    setIndustry(company.industry);
    setSize(company.size);
    setError(null);
  }

  async function handleLogoUpload(file: File) {
    setUploadingLogo(true);
    setLogoError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/company/logo", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      updateCompany(json.company as Company);
      // Refresh to make sure the sidebar logo updates everywhere
      refresh();
    } catch (e) {
      setLogoError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleLogoRemove() {
    setUploadingLogo(true);
    setLogoError(null);
    try {
      const res = await fetch("/api/company/logo", { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to remove logo");
      updateCompany(json.company as Company);
      refresh();
    } catch (e) {
      setLogoError(e instanceof Error ? e.message : "Failed to remove logo");
    } finally {
      setUploadingLogo(false);
    }
  }

  // "Saved" indicator auto-clears after a couple seconds
  useEffect(() => {
    if (!savedAt) return;
    const t = setTimeout(() => setSavedAt(null), 2500);
    return () => clearTimeout(t);
  }, [savedAt]);

  const initials = company.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const lastInterview = contributors
    .map((c) => c.interviewedAt)
    .filter((d): d is string => !!d)
    .sort()
    .pop();

  return (
    <AppShell>
      <PageHeader title="Settings" />
      <div className="flex-1 overflow-y-auto scroll-thin">
        <div className="max-w-2xl mx-auto px-8 py-10">

          {/* Company logo */}
          <section className="mb-10">
            <h2 className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-4">Brand</h2>
            <div className="flex items-center gap-5 p-5 rounded-2xl border border-border">
              <div className="relative shrink-0">
                {company.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={company.logoUrl}
                    alt={`${company.name} logo`}
                    className="w-16 h-16 rounded-xl object-cover bg-surface border border-border"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-foreground flex items-center justify-center text-[20px] font-bold text-background">
                    {initials}
                  </div>
                )}
                {uploadingLogo && (
                  <div className="absolute inset-0 rounded-xl bg-background/80 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-muted" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium mb-0.5">Company logo</p>
                <p className="text-[12px] text-muted">PNG, JPEG, WebP, or SVG. Max 2 MB.</p>
                {logoError && <p className="mt-1.5 text-[12px] text-red-600">{logoError}</p>}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleLogoUpload(f);
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo || !isRealData}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-[12px] font-medium hover:border-muted-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-3.5 h-3.5" strokeWidth={2} />
                  {company.logoUrl ? "Replace" : "Upload"}
                </button>
                {company.logoUrl && (
                  <button
                    onClick={handleLogoRemove}
                    disabled={uploadingLogo || !isRealData}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-border text-muted hover:text-foreground hover:border-muted-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Remove logo"
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Company details */}
          <section className="mb-10">
            <h2 className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-4">Company</h2>
            <div className="rounded-2xl border border-border divide-y divide-border">
              <div className="p-5">
                <label htmlFor="company-name" className="block text-[12px] font-medium text-muted mb-1.5">Company name</label>
                <input
                  id="company-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Acme Inc"
                  maxLength={120}
                  className="w-full bg-transparent text-[14px] outline-none placeholder:text-muted-light"
                />
              </div>
              <div className="p-5">
                <label htmlFor="company-industry" className="block text-[12px] font-medium text-muted mb-1.5">Industry</label>
                <select
                  id="company-industry"
                  value={industry || ""}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-transparent text-[14px] outline-none"
                >
                  <option value="" disabled>Select an industry…</option>
                  {INDUSTRY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                  {industry && !INDUSTRY_OPTIONS.includes(industry) && (
                    <option value={industry}>{industry}</option>
                  )}
                </select>
              </div>
              <div className="p-5">
                <label htmlFor="company-size" className="block text-[12px] font-medium text-muted mb-1.5">Company size</label>
                <select
                  id="company-size"
                  value={size || ""}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full bg-transparent text-[14px] outline-none"
                >
                  <option value="" disabled>Select a size…</option>
                  {SIZE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt} employees</option>
                  ))}
                  {size && !SIZE_OPTIONS.includes(size) && (
                    <option value={size}>{size}</option>
                  )}
                </select>
              </div>
            </div>

            {/* Save bar */}
            <div className="mt-4 flex items-center justify-between min-h-[32px]">
              <div className="text-[12px] text-muted">
                {error ? (
                  <span className="text-red-600">{error}</span>
                ) : savedAt ? (
                  <span className="inline-flex items-center gap-1.5 text-green-600">
                    <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> Saved
                  </span>
                ) : isDirty ? (
                  <span className="text-muted-light">Unsaved changes</span>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                {isDirty && (
                  <button
                    onClick={handleDiscard}
                    disabled={saving}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-medium text-muted hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    Discard
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={!canSave}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-foreground text-background text-[12px] font-medium hover:bg-foreground/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {saving ? "Saving" : "Save changes"}
                </button>
              </div>
            </div>

            {!isRealData && (
              <p className="mt-3 text-[11px] text-muted-light">
                You&apos;re viewing demo data. Sign up to edit your company.
              </p>
            )}
          </section>

          {/* Assessment summary */}
          <section className="mb-10">
            <h2 className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-4">Assessment</h2>
            <div className="p-5 rounded-2xl border border-border">
              <p className="text-[13px] font-medium mb-1">Interviews completed</p>
              <p className="text-[12px] text-muted">
                {contributors.length} {contributors.length === 1 ? "employee" : "employees"} across {departments.length} {departments.length === 1 ? "department" : "departments"}
              </p>
              {lastInterview && (
                <p className="text-[12px] text-muted-light mt-2">
                  Last interview: {new Date(lastInterview).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              )}
            </div>
          </section>

        </div>
      </div>
    </AppShell>
  );
}
