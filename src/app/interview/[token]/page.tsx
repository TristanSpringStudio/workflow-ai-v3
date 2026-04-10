"use client";

import { use, useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Send, ArrowRight, Check, Building2, DollarSign, Megaphone, TrendingUp, Wrench, FlaskConical, PackageSearch, Users, Share2, Headphones } from "lucide-react";
import MessageShimmer from "@/components/MessageShimmer";
import { company } from "@/lib/mock-data";
import type { ExtractedSoFar } from "@/lib/ai/schemas/interview-output";

// ─── Tool logos ───
const TOOL_DOMAINS: Record<string, string> = {
  "Salesforce": "salesforce.com", "HubSpot": "hubspot.com", "Google Docs": "docs.google.com",
  "Google Sheets": "sheets.google.com", "Google Analytics": "analytics.google.com",
  "Notion": "notion.so", "Slack": "slack.com", "Gmail": "gmail.com", "Figma": "figma.com",
  "Canva": "canva.com", "Jira": "atlassian.com", "Linear": "linear.app", "GitHub": "github.com",
  "Zoom": "zoom.us", "Excel": "office.com", "Asana": "asana.com", "Monday": "monday.com",
  "Trello": "trello.com", "QuickBooks": "quickbooks.intuit.com", "Stripe": "stripe.com",
  "Intercom": "intercom.com", "Zendesk": "zendesk.com", "Loom": "loom.com",
  "Claude": "claude.ai", "ChatGPT": "chat.openai.com", "VS Code": "code.visualstudio.com",
};

function getLogo(tool: string) {
  const domain = TOOL_DOMAINS[tool];
  return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=28` : "";
}

const DEPT_ICONS: Record<string, { Icon: typeof DollarSign; bg: string }> = {
  Sales: { Icon: DollarSign, bg: "#22c55e" }, Marketing: { Icon: Megaphone, bg: "#a855f7" },
  Finance: { Icon: TrendingUp, bg: "#3b52ce" }, Operations: { Icon: Wrench, bg: "#f59e0b" },
  Engineering: { Icon: FlaskConical, bg: "#6366f1" }, Product: { Icon: PackageSearch, bg: "#ec4899" },
  HR: { Icon: Users, bg: "#3b82f6" }, IT: { Icon: Share2, bg: "#dc2626" },
  Support: { Icon: Headphones, bg: "#ca8a04" }, Design: { Icon: Megaphone, bg: "#8b5cf6" },
  Legal: { Icon: Building2, bg: "#64748b" },
};

interface ChatMsg {
  id: string;
  role: "assistant" | "user";
  content: string;
  pills?: string[];
  options?: { label: string; value: string }[];
}

type Phase = "welcome" | "chat" | "summary" | "done";

const STORAGE_KEY_PREFIX = "vishtan-interview-";

// Token context from Supabase
interface TokenContext {
  id: string; // token record ID
  token: string;
  company_id: string;
  contributor_id: string | null;
  companies: { id: string; name: string; logo_url: string | null } | null;
  contributors: { id: string; name: string; email: string; role: string; department: string } | null;
}

export default function InterviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const storageKey = STORAGE_KEY_PREFIX + token;

  const [phase, setPhase] = useState<Phase>("welcome");
  const [welcomeName, setWelcomeName] = useState("");
  const [email, setEmail] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPills, setSelectedPills] = useState<Set<string>>(new Set());
  const [extracted, setExtracted] = useState<ExtractedSoFar>({
    tools: [], workflows: [], painPoints: [], handoffs: [],
  });
  const [submitted, setSubmitted] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tokenCtx, setTokenCtx] = useState<TokenContext | null>(null);
  const [tokenError, setTokenError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // The conversation history sent to the API (plain role+content, no UI metadata)
  const apiMessages = messages.map((m) => ({ role: m.role, content: m.content }));

  // Resolved company name + logo — from DB or fallback
  const companyName = tokenCtx?.companies?.name || company.name;
  const companyLogoUrl = tokenCtx?.companies?.logo_url || null;
  const companyInitials = companyName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Look up the token on mount
  useEffect(() => {
    async function lookup() {
      try {
        const res = await fetch(`/api/interview/token?token=${token}`);
        if (res.ok) {
          const data = await res.json();
          setTokenCtx(data);
          // Pre-fill name/email if contributor already exists
          if (data.contributors?.name) setWelcomeName(data.contributors.name);
          if (data.contributors?.email) setEmail(data.contributors.email);
        } else {
          // Token not found — still allow interview with mock company (dev mode)
          console.warn("Token not found in DB, using fallback");
        }
      } catch {
        console.warn("Could not look up token, using fallback");
      }
    }
    lookup();
  }, [token]);

  // Load saved state from localStorage (fallback / resume)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const state = JSON.parse(saved);
        if (state.submitted) {
          setPhase("done");
          setExtracted(state.extracted || { tools: [], workflows: [], painPoints: [], handoffs: [] });
          setSubmitted(true);
        } else if (state.messages?.length > 0) {
          setMessages(state.messages);
          setExtracted(state.extracted || { tools: [], workflows: [], painPoints: [], handoffs: [] });
          if (!welcomeName && state.welcomeName) setWelcomeName(state.welcomeName);
          if (!email && state.email) setEmail(state.email);
          setPhase("chat");
        }
      }
    } catch {}
  }, [storageKey]);

  // Auto-save to localStorage
  useEffect(() => {
    if (phase === "welcome") return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        messages, extracted, welcomeName, email, submitted,
      }));
    } catch {}
  }, [messages, extracted, welcomeName, email, submitted, storageKey, phase]);

  // Auto-save to Supabase (debounced, on each new message)
  useEffect(() => {
    if (!tokenCtx || phase === "welcome" || messages.length === 0) return;
    const timeout = setTimeout(() => {
      fetch("/api/interview/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: tokenCtx.id,
          companyId: tokenCtx.company_id,
          contributorId: tokenCtx.contributor_id,
          transcript: messages.map((m) => ({ role: m.role, content: m.content })),
          extractedData: extracted,
        }),
      }).catch(() => {}); // Silent fail — localStorage is the primary backup
    }, 2000); // 2s debounce
    return () => clearTimeout(timeout);
  }, [messages, extracted, tokenCtx, phase]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  /**
   * Call the interview API and handle the response.
   */
  const callInterviewAPI = useCallback(async (msgs: { role: "assistant" | "user"; content: string }[]) => {
    setIsTyping(true);
    try {
      const res = await fetch("/api/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: msgs,
          companyName,
          userName: welcomeName,
          companyId: tokenCtx?.company_id,
        }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();

      // Update extracted data
      if (data.extractedSoFar) {
        setExtracted(data.extractedSoFar);
      }

      // Build the chat message with optional UI elements
      const assistantMsg: ChatMsg = {
        id: Math.random().toString(36).slice(2, 8),
        role: "assistant",
        content: data.message,
        pills: data.suggestedPills,
        options: data.suggestedOptions,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Surface a Submit button inline once the AI signals completion.
      // We deliberately do NOT auto-navigate so the user can read the
      // closing message and decide when to submit (or keep adding context).
      if (data.interviewComplete) {
        setInterviewComplete(true);
      }
    } catch (error) {
      console.error("Interview API error:", error);
      // Fallback message
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).slice(2, 8),
          role: "assistant",
          content: "Sorry, I had a brief hiccup. Could you repeat that?",
        },
      ]);
    } finally {
      setIsTyping(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [companyName, welcomeName, tokenCtx?.company_id]);

  const startInterview = () => {
    setPhase("chat");
    // Get the opening message from API (empty messages = opening)
    callInterviewAPI([]);
  };

  const handleSend = (text?: string) => {
    const value = text || input.trim();
    if (!value || isTyping) return;

    const userMsg: ChatMsg = {
      id: Math.random().toString(36).slice(2, 8),
      role: "user",
      content: value,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSelectedPills(new Set());
    // Reset textarea height
    if (inputRef.current) inputRef.current.style.height = "auto";

    // Build the full message history including the new user message
    const fullHistory = [
      ...apiMessages,
      { role: "user" as const, content: value },
    ];

    callInterviewAPI(fullHistory);
  };

  const submitInterview = async () => {
    if (submitting || submitted) return;
    setSubmitting(true);
    setSubmitted(true);
    setPhase("done");
    if (tokenCtx) {
      try {
        await fetch("/api/interview/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokenId: tokenCtx.id,
            companyId: tokenCtx.company_id,
            transcript: messages.map((m) => ({ role: m.role, content: m.content })),
            extractedData: extracted,
          }),
        });
      } catch {}
    }
    setSubmitting(false);
  };

  const togglePill = (pill: string) => {
    setSelectedPills((prev) => {
      const next = new Set(prev);
      if (next.has(pill)) next.delete(pill);
      else next.add(pill);
      setInput([...next].join(", "));
      return next;
    });
  };

  const deptConfig = DEPT_ICONS[extracted.department || ""] || { Icon: Building2, bg: "#6b7280" };

  // ─── Welcome Screen ───
  if (phase === "welcome") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Company branding */}
          <div className="flex items-center gap-3 mb-8">
            {companyLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={companyLogoUrl}
                alt={`${companyName} logo`}
                className="w-10 h-10 rounded-xl object-cover bg-surface border border-border"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center text-[14px] font-bold text-background">
                {companyInitials}
              </div>
            )}
            <div>
              <p className="text-[15px] font-semibold">{companyName}</p>
              <p className="text-[12px] text-muted-light">Powered by Vishtan</p>
            </div>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight mb-2">Help us understand how your team works</h1>
          <p className="text-[14px] text-muted leading-relaxed mb-8">
            You&apos;ll chat with our AI assistant about your role, daily tasks, and how work flows through your team.
            It takes about 10-15 minutes. Your responses help us find opportunities to save time across the organization.
          </p>

          <div className="space-y-3 mb-8">
            <input
              value={welcomeName}
              onChange={(e) => setWelcomeName(e.target.value)}
              placeholder="Your name"
              className="w-full h-11 px-4 rounded-xl bg-surface border border-border text-[14px] placeholder:text-muted-light focus:outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              type="email"
              className="w-full h-11 px-4 rounded-xl bg-surface border border-border text-[14px] placeholder:text-muted-light focus:outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10"
            />
          </div>

          <button
            onClick={startInterview}
            disabled={!welcomeName.trim()}
            className="w-full h-11 rounded-xl bg-foreground text-background text-[14px] font-medium hover:bg-foreground/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Start interview
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </button>

          <p className="text-[11px] text-muted-light text-center mt-4">
            You can pause and come back anytime — your progress is saved automatically.
          </p>
        </div>
      </div>
    );
  }

  // ─── Done Screen ───
  if (phase === "done") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-7 h-7 text-green-600" strokeWidth={2} />
          </div>
          <h2 className="text-xl font-semibold mb-2">Interview submitted</h2>
          <p className="text-[14px] text-muted mb-6">
            Thanks{extracted.name ? `, ${extracted.name}` : ""}! Your responses have been recorded and will be incorporated into the intelligence layer.
            The more people who complete this, the more accurate the picture becomes.
          </p>
          <button onClick={() => { setPhase("chat"); setSubmitted(false); }} className="text-[13px] text-accent hover:text-accent-hover">
            Add more context →
          </button>
          <p className="text-[11px] text-muted-light mt-8">Powered by Vishtan</p>
        </div>
      </div>
    );
  }

  // ─── Summary Screen ───
  if (phase === "summary") {
    const summaryText = extracted.name
      ? `${extracted.name} is a ${extracted.role || "team member"} in the ${extracted.department || "organization"}, working primarily with ${extracted.tools.slice(0, 3).join(", ")}${extracted.tools.length > 3 ? ` and ${extracted.tools.length - 3} other tools` : ""}. ${extracted.workflows.length} workflows identified across their day-to-day work.`
      : "Interview data captured.";

    return (
      <div className="min-h-screen bg-background">
        {/* Minimal header */}
        <div className="h-14 border-b border-border px-6 flex items-center">
          <div className="flex items-center gap-2">
            {companyLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={companyLogoUrl}
                alt={`${companyName} logo`}
                className="w-6 h-6 rounded-lg object-cover bg-surface border border-border"
              />
            ) : (
              <div className="w-6 h-6 rounded-lg bg-foreground flex items-center justify-center text-[9px] font-bold text-background">
                {companyInitials}
              </div>
            )}
            <span className="text-[13px] font-medium">{companyName}</span>
            <span className="text-muted-light">/</span>
            <span className="text-[13px] text-muted">Interview Summary</span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-8">
          <h2 className="text-xl font-semibold tracking-tight mb-2">Review & Confirm</h2>
          <p className="text-[13px] text-muted mb-6">Review what we captured. Edit anything that doesn&apos;t look right.</p>

          {/* Profile */}
          <div className="p-5 rounded-2xl border border-border mb-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[16px] font-bold text-white" style={{ background: deptConfig.bg }}>
                {(extracted.name || "?").charAt(0)}
              </div>
              <div>
                <h3 className="text-[16px] font-semibold">{extracted.name || "Name"}</h3>
                <p className="text-[13px] text-muted">{extracted.role || "Role"} · {extracted.department || "Department"}</p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="p-5 rounded-2xl bg-surface border border-border mb-5">
            <h3 className="text-[13px] font-semibold mb-2">Summary</h3>
            <p className="text-[13px] text-muted leading-relaxed">{summaryText}</p>
          </div>

          {/* Workflows */}
          {extracted.workflows.length > 0 && (
            <div className="p-5 rounded-2xl border border-border mb-5">
              <h3 className="text-[13px] font-semibold mb-3">Workflows & Tasks</h3>
              <div className="space-y-2">
                {extracted.workflows.map((wf, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-border">
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: deptConfig.bg }}>
                        <deptConfig.Icon className="w-3 h-3 text-white" strokeWidth={2} />
                      </div>
                      <span className="text-[13px]">{wf.title}</span>
                    </div>
                    {wf.frequency && (
                      <span className="text-[11px] text-muted-light px-2 py-0.5 rounded-full bg-surface border border-border">{wf.frequency}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tools */}
          {extracted.tools.length > 0 && (
            <div className="p-5 rounded-2xl border border-border mb-5">
              <h3 className="text-[13px] font-semibold mb-3">Tools</h3>
              <div className="flex flex-wrap gap-1.5">
                {extracted.tools.map((tool) => {
                  const logo = getLogo(tool);
                  return (
                    <span key={tool} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border text-[12px]">
                      {logo && <Image src={logo} alt={tool} width={14} height={14} unoptimized />}
                      {tool}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pain Points */}
          {extracted.painPoints.length > 0 && (
            <div className="p-5 rounded-2xl border border-border mb-5">
              <h3 className="text-[13px] font-semibold mb-3">Pain Points</h3>
              {extracted.painPoints.map((pp, i) => (
                <div key={i} className="flex gap-2 py-1.5">
                  <span className="text-[12px] text-red-400 shrink-0">•</span>
                  <span className="text-[13px] text-muted">{pp}</span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button onClick={() => setPhase("chat")} className="px-4 py-2.5 rounded-xl border border-border text-[13px] font-medium text-muted hover:text-foreground transition-colors">
              Back to interview
            </button>
            <button
              onClick={submitInterview}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background text-[13px] font-medium hover:bg-foreground/80 transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4" strokeWidth={2} />
              {submitting ? "Submitting..." : "Confirm & Submit"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Chat Screen ───
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Minimal header */}
      <div className="shrink-0 h-14 border-b border-border px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {companyLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={companyLogoUrl}
              alt={`${companyName} logo`}
              className="w-6 h-6 rounded-lg object-cover bg-surface border border-border"
            />
          ) : (
            <div className="w-6 h-6 rounded-lg bg-foreground flex items-center justify-center text-[9px] font-bold text-background">
              {companyInitials}
            </div>
          )}
          <span className="text-[13px] font-medium">{companyName}</span>
          <span className="text-muted-light">/</span>
          <span className="text-[13px] text-muted">Interview</span>
        </div>
        <span className="text-[11px] text-muted-light">Auto-saved</span>
      </div>

      {/* Chat */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-thin px-6 py-6">
        <div className="max-w-xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] ${msg.role === "user" ? "px-4 py-2.5 rounded-2xl rounded-br-md bg-surface text-foreground text-[14px]" : "text-[14px] leading-relaxed text-muted"}`}>
                {msg.content.split("\n").map((line, i) => (<p key={i} className={i > 0 ? "mt-2" : ""}>{line}</p>))}

                {msg.pills && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {msg.pills.map((pill) => {
                      const sel = selectedPills.has(pill);
                      const logo = getLogo(pill);
                      return (
                        <button key={pill} onClick={() => togglePill(pill)} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] border transition-colors ${sel ? "bg-foreground/5 border-foreground/20 text-foreground" : "bg-surface border-border hover:border-foreground/20 hover:text-foreground"}`}>
                          {logo && <Image src={logo} alt={pill} width={14} height={14} unoptimized />}
                          {pill}
                        </button>
                      );
                    })}
                  </div>
                )}

                {msg.options && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {msg.options.map((opt) => (
                      <button key={opt.value} onClick={() => handleSend(opt.label)} className="px-3.5 py-1.5 rounded-xl text-[13px] font-medium border border-border hover:border-foreground/20 hover:text-foreground transition-colors">
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && <MessageShimmer />}

          {/* Inline submit panel — appears once the AI signals the interview is complete.
              Stays visible so the user can read the closing message and decide when to submit
              (or keep typing to add more context). */}
          {interviewComplete && !isTyping && (
            <div className="pt-2 flex flex-col items-start gap-3">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={submitInterview}
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background text-[13px] font-medium hover:bg-foreground/80 transition-colors disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" strokeWidth={2} />
                  {submitting ? "Submitting..." : "Submit interview"}
                </button>
                <button
                  onClick={() => setPhase("summary")}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl border border-border text-[13px] font-medium text-muted hover:text-foreground hover:border-foreground/20 transition-colors disabled:opacity-50"
                >
                  Review what we captured
                </button>
              </div>
              <p className="text-[11px] text-muted-light">
                Or keep typing below if you have more to add.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border bg-background px-6 py-3">
        <div className="max-w-xl mx-auto">
          <div className="chat-border rounded-xl">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex items-end gap-2 px-3 py-2"
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  const el = e.target;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 160) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your response..."
                disabled={isTyping}
                rows={1}
                autoFocus
                className="flex-1 min-h-[28px] max-h-[160px] bg-transparent text-[14px] placeholder:text-muted-light focus:outline-none disabled:opacity-50 resize-none leading-snug py-1"
              />
              <button
                type="submit"
                disabled={isTyping || !input.trim()}
                className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center hover:bg-foreground/80 transition-colors disabled:opacity-20 shrink-0"
              >
                <Send className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
