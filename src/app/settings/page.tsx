"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Upload, X } from "lucide-react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { useCompanyData } from "@/lib/company-data";
import type { Company, UserProfile } from "@/lib/types";

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

// ─── Shared input styles ───
// Single source of truth for "standard input field" look.
const INPUT_CLASS =
  "w-full h-10 px-3 rounded-lg bg-background border border-border text-[14px] text-foreground placeholder:text-muted-light focus:outline-none focus:border-muted-light focus:ring-2 focus:ring-foreground/5 transition-colors disabled:bg-surface disabled:text-muted disabled:cursor-not-allowed";
const LABEL_CLASS = "block text-[12px] font-medium text-foreground mb-1.5";
const HELPER_CLASS = "mt-1.5 text-[11px] text-muted-light";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function SettingsPage() {
  const {
    company,
    user,
    contributors,
    getDepartments,
    isRealData,
    updateCompany,
    updateUser,
    refresh,
  } = useCompanyData();
  const departments = getDepartments();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // ─── Profile form state ───
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || "");

  // ─── Company form state ───
  const [name, setName] = useState(company.name);
  const [industry, setIndustry] = useState(company.industry);
  const [size, setSize] = useState(company.size);

  // ─── Save state ───
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ─── Upload state ───
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Sync local state when the underlying records change externally
  useEffect(() => {
    setFullName(user?.fullName || "");
    setJobTitle(user?.jobTitle || "");
  }, [user?.fullName, user?.jobTitle]);

  useEffect(() => {
    setName(company.name);
    setIndustry(company.industry);
    setSize(company.size);
  }, [company.name, company.industry, company.size]);

  const profileDirty =
    !!user &&
    (fullName.trim() !== user.fullName || jobTitle.trim() !== user.jobTitle);
  const companyDirty =
    name.trim() !== company.name ||
    industry !== company.industry ||
    size !== company.size;

  const isDirty = profileDirty || companyDirty;
  const canSave = isDirty && name.trim().length > 0 && (!user || fullName.trim().length > 0) && !saving;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      // Run profile + company updates in parallel when both are dirty.
      const tasks: Promise<unknown>[] = [];

      if (profileDirty) {
        tasks.push(
          fetch("/api/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fullName: fullName.trim(),
              jobTitle: jobTitle.trim(),
            }),
          }).then(async (res) => {
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to save profile");
            updateUser(json.user as UserProfile);
          })
        );
      }

      if (companyDirty) {
        tasks.push(
          fetch("/api/company", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: name.trim(),
              industry,
              size,
            }),
          }).then(async (res) => {
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to save company");
            updateCompany(json.company as Company);
          })
        );
      }

      await Promise.all(tasks);
      setSavedAt(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function handleDiscard() {
    setFullName(user?.fullName || "");
    setJobTitle(user?.jobTitle || "");
    setName(company.name);
    setIndustry(company.industry);
    setSize(company.size);
    setError(null);
  }

  // ─── Logo upload handlers ───
  async function handleLogoUpload(file: File) {
    setUploadingLogo(true);
    setLogoError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/company/logo", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      updateCompany(json.company as Company);
      refresh();
    } catch (e) {
      setLogoError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
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

  // ─── Avatar upload handlers ───
  async function handleAvatarUpload(file: File) {
    setUploadingAvatar(true);
    setAvatarError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/profile/avatar", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      updateUser(json.user as UserProfile);
    } catch (e) {
      setAvatarError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  }

  async function handleAvatarRemove() {
    setUploadingAvatar(true);
    setAvatarError(null);
    try {
      const res = await fetch("/api/profile/avatar", { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to remove avatar");
      updateUser(json.user as UserProfile);
    } catch (e) {
      setAvatarError(e instanceof Error ? e.message : "Failed to remove avatar");
    } finally {
      setUploadingAvatar(false);
    }
  }

  // Auto-clear "Saved" indicator
  useEffect(() => {
    if (!savedAt) return;
    const t = setTimeout(() => setSavedAt(null), 2500);
    return () => clearTimeout(t);
  }, [savedAt]);

  const companyInitials = getInitials(company.name);
  const userInitials = user?.fullName ? getInitials(user.fullName) : "?";
  const lastInterview = contributors
    .map((c) => c.interviewedAt)
    .filter((d): d is string => !!d)
    .sort()
    .pop();

  return (
    <AppShell>
      <PageHeader title="Settings" />
      <div className="flex-1 overflow-y-auto scroll-thin">
        <div className="max-w-2xl mx-auto px-8 py-10 pb-40">

          {/* ─── Profile ─── */}
          <section className="mb-10">
            <h2 className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-4">Profile</h2>

            {/* Avatar */}
            <div className="flex items-center gap-5 p-5 rounded-2xl border border-border mb-4">
              <div className="relative shrink-0">
                {user?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName || "Avatar"}
                    className="w-16 h-16 rounded-full object-cover bg-surface border border-border"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-foreground flex items-center justify-center text-[20px] font-bold text-background">
                    {userInitials}
                  </div>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 rounded-full bg-background/80 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-muted" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium mb-0.5">Profile photo</p>
                <p className="text-[12px] text-muted">PNG, JPEG, WebP, or SVG. Max 2 MB.</p>
                {avatarError && <p className="mt-1.5 text-[12px] text-red-600">{avatarError}</p>}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleAvatarUpload(f);
                  }}
                />
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar || !isRealData}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-[12px] font-medium hover:border-muted-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-3.5 h-3.5" strokeWidth={2} />
                  {user?.avatarUrl ? "Replace" : "Upload"}
                </button>
                {user?.avatarUrl && (
                  <button
                    onClick={handleAvatarRemove}
                    disabled={uploadingAvatar || !isRealData}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-border text-muted hover:text-foreground hover:border-muted-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Remove avatar"
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                )}
              </div>
            </div>

            {/* Name / email / job title */}
            <div className="p-5 rounded-2xl border border-border space-y-4">
              <div>
                <label htmlFor="profile-name" className={LABEL_CLASS}>Full name</label>
                <input
                  id="profile-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ada Lovelace"
                  maxLength={120}
                  disabled={!isRealData}
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label htmlFor="profile-email" className={LABEL_CLASS}>Email</label>
                <input
                  id="profile-email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className={INPUT_CLASS}
                />
                <p className={HELPER_CLASS}>
                  Email is tied to your login and can&apos;t be changed here.
                </p>
              </div>

              <div>
                <label htmlFor="profile-title" className={LABEL_CLASS}>Job title</label>
                <input
                  id="profile-title"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Founder, VP Engineering"
                  maxLength={120}
                  disabled={!isRealData}
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          </section>

          {/* ─── Brand ─── */}
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
                    {companyInitials}
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
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleLogoUpload(f);
                  }}
                />
                <button
                  onClick={() => logoInputRef.current?.click()}
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

          {/* ─── Company ─── */}
          <section className="mb-10">
            <h2 className="text-[11px] font-semibold text-muted-light uppercase tracking-widest mb-4">Company</h2>
            <div className="p-5 rounded-2xl border border-border space-y-4">
              <div>
                <label htmlFor="company-name" className={LABEL_CLASS}>Company name</label>
                <input
                  id="company-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Acme Inc"
                  maxLength={120}
                  disabled={!isRealData}
                  className={INPUT_CLASS}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="company-industry" className={LABEL_CLASS}>Industry</label>
                  <select
                    id="company-industry"
                    value={industry || ""}
                    onChange={(e) => setIndustry(e.target.value)}
                    disabled={!isRealData}
                    className={INPUT_CLASS}
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

                <div>
                  <label htmlFor="company-size" className={LABEL_CLASS}>Company size</label>
                  <select
                    id="company-size"
                    value={size || ""}
                    onChange={(e) => setSize(e.target.value)}
                    disabled={!isRealData}
                    className={INPUT_CLASS}
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
            </div>
          </section>

          {/* ─── Assessment summary ─── */}
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

          {!isRealData && (
            <p className="text-[11px] text-muted-light">
              You&apos;re viewing demo data. Sign up to edit your profile and company.
            </p>
          )}
        </div>
      </div>

      {/* ─── Sticky save bar ─── */}
      {/* Appears only when there are unsaved changes, OR briefly when saved */}
      {(isDirty || savedAt || error) && (
        <div className="sticky bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur px-8 py-3">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="text-[12px]">
              {error ? (
                <span className="text-red-600">{error}</span>
              ) : savedAt ? (
                <span className="inline-flex items-center gap-1.5 text-green-600">
                  <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> Saved
                </span>
              ) : isDirty ? (
                <span className="text-muted">You have unsaved changes</span>
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
              {isDirty && (
                <button
                  onClick={handleSave}
                  disabled={!canSave}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-foreground text-background text-[12px] font-medium hover:bg-foreground/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {saving ? "Saving" : "Save changes"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
