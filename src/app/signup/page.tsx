"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<"account" | "company">("account");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "account") {
      setStep("company");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Create user + company via server API (bypasses RLS, auto-confirms email)
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName, companyName, industry, companySize }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Signup failed");

      // 2. Sign in immediately (user is already confirmed)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
            <svg className="w-4 h-4 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25" /></svg>
          </div>
          <span className="text-[16px] font-semibold tracking-tight">Vishtan</span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight mb-1">
          {step === "account" ? "Create your account" : "Set up your company"}
        </h1>
        <p className="text-[14px] text-muted mb-8">
          {step === "account"
            ? "Start mapping your organization's AI opportunities."
            : "We'll use this to personalize your intelligence layer."}
        </p>

        {error && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-3">
          {step === "account" ? (
            <>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                required
                className="w-full h-11 px-4 rounded-xl bg-surface border border-border text-[14px] placeholder:text-muted-light focus:outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Work email"
                type="email"
                required
                className="w-full h-11 px-4 rounded-xl bg-surface border border-border text-[14px] placeholder:text-muted-light focus:outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10"
              />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
                required
                minLength={8}
                className="w-full h-11 px-4 rounded-xl bg-surface border border-border text-[14px] placeholder:text-muted-light focus:outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10"
              />
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface border border-border mb-1">
                <Building2 className="w-4 h-4 text-muted-light" strokeWidth={1.5} />
                <div className="text-[13px]">
                  <span className="font-medium">{fullName}</span>
                  <span className="text-muted-light"> · {email}</span>
                </div>
              </div>

              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Company name"
                required
                className="w-full h-11 px-4 rounded-xl bg-surface border border-border text-[14px] placeholder:text-muted-light focus:outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10"
              />
              <input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Industry (e.g. SaaS, E-commerce, Agency)"
                className="w-full h-11 px-4 rounded-xl bg-surface border border-border text-[14px] placeholder:text-muted-light focus:outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10"
              />
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                required
                className="w-full h-11 px-4 rounded-xl bg-surface border border-border text-[14px] text-foreground focus:outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 appearance-none"
              >
                <option value="" disabled>Company size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-accent text-white text-[14px] font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Creating account..." : step === "account" ? "Continue" : "Create account"}
            {!loading && <ArrowRight className="w-4 h-4" strokeWidth={2} />}
          </button>
        </form>

        <p className="text-[13px] text-muted text-center mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:text-accent-hover">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
