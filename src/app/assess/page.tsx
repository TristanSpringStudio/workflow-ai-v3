"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, Building2, Briefcase, Wrench, Clock, AlertTriangle, ArrowRight, Check, Pencil, DollarSign, Megaphone, TrendingUp, FlaskConical, PackageSearch, Headphones, Users, Share2 } from "lucide-react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { contributors } from "@/lib/mock-data";

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

function getLogo(tool: string, size: number = 14) {
  const domain = TOOL_DOMAINS[tool];
  return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=${size * 2}` : "";
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
  deptPills?: string[];
}

interface InterviewData {
  name: string;
  role: string;
  department: string;
  tools: string[];
  dailyTasks: string[];
  painPoints: string[];
  infoSources: string[];
  handoffs: string[];
  aiComfort: string;
}

const DEPARTMENTS = ["Marketing", "Sales", "Operations", "Engineering", "Product", "Finance", "Design", "Support", "HR", "Legal"];
const TOOLS = Object.keys(TOOL_DOMAINS);

// ─── Mock task extraction from interview data ───
function extractTasks(data: InterviewData): { title: string; frequency: string }[] {
  const tasks: { title: string; frequency: string }[] = [];
  const text = data.dailyTasks.join(" ").toLowerCase();

  if (text.includes("report") || text.includes("data")) tasks.push({ title: "Compile and distribute reports", frequency: "Weekly" });
  if (text.includes("email") || text.includes("outreach")) tasks.push({ title: "Write and send outreach emails", frequency: "Daily" });
  if (text.includes("meeting") || text.includes("standup")) tasks.push({ title: "Run team meetings and follow-ups", frequency: "Daily" });
  if (text.includes("review") || text.includes("edit")) tasks.push({ title: "Review and edit content or deliverables", frequency: "Daily" });
  if (text.includes("plan") || text.includes("calendar")) tasks.push({ title: "Planning and calendar management", frequency: "Weekly" });
  if (text.includes("client") || text.includes("customer")) tasks.push({ title: "Client communication and management", frequency: "Daily" });
  if (text.includes("budget") || text.includes("invoice")) tasks.push({ title: "Budget tracking and invoice processing", frequency: "Monthly" });
  if (text.includes("document") || text.includes("sop")) tasks.push({ title: "Document processes and SOPs", frequency: "As needed" });
  if (text.includes("onboard")) tasks.push({ title: "New client or employee onboarding", frequency: "Per event" });
  if (text.includes("forecast") || text.includes("pipeline")) tasks.push({ title: "Pipeline forecasting and analysis", frequency: "Weekly" });

  if (tasks.length === 0) {
    tasks.push({ title: "Daily operational tasks", frequency: "Daily" });
    tasks.push({ title: "Team coordination and updates", frequency: "Daily" });
  }

  return tasks;
}

function generateSummary(data: InterviewData): string {
  return `${data.name} is a ${data.role} in the ${data.department} department, working primarily with ${data.tools.slice(0, 3).join(", ")}${data.tools.length > 3 ? ` and ${data.tools.length - 3} other tools` : ""}. Their day-to-day involves ${data.dailyTasks[0]?.toLowerCase() || "various operational tasks"}. Key pain points include ${data.painPoints[0]?.toLowerCase() || "repetitive manual processes"}.`;
}

// ─── Scripted conversation ───
function getStep(step: number, userInput: string, ctx: Record<string, string>): {
  messages: ChatMsg[];
  nextStep: number;
} {
  const id = () => Math.random().toString(36).slice(2, 8);

  switch (step) {
    case 0:
      return {
        messages: [{ id: id(), role: "assistant", content: "Hey! I'm going to ask you about your role, daily work, and how information flows through your team. This helps us build an intelligence map of your organization.\n\nWhat's your name and what do you do?" }],
        nextStep: 1,
      };
    case 1: {
      const name = userInput.split(" ")[0] || "there";
      return {
        messages: [{ id: id(), role: "assistant", content: `Great to meet you, ${name}. Which department are you in?`, deptPills: DEPARTMENTS }],
        nextStep: 2,
      };
    }
    case 2:
      return {
        messages: [{ id: id(), role: "assistant", content: `Got it — ${userInput}.\n\nWhat tools do you use daily? Click all that apply, or type any I missed.`, pills: TOOLS }],
        nextStep: 3,
      };
    case 3:
      return {
        messages: [{ id: id(), role: "assistant", content: "Good stack. Now walk me through your main tasks — what does a typical day or week look like? What do you spend the most time on?" }],
        nextStep: 4,
      };
    case 4:
      return {
        messages: [{ id: id(), role: "assistant", content: "What feels the most repetitive or tedious? The stuff that takes way too long." }],
        nextStep: 5,
      };
    case 5:
      return {
        messages: [{ id: id(), role: "assistant", content: "Where do you get the information you need? Which teams or tools do you pull data from?" }],
        nextStep: 6,
      };
    case 6:
      return {
        messages: [{ id: id(), role: "assistant", content: "What do you hand off to other teams? What do they need from you?" }],
        nextStep: 7,
      };
    case 7:
      return {
        messages: [{ id: id(), role: "assistant", content: "Last one — how comfortable are you with AI tools?", options: [
          { label: "Never used them", value: "none" },
          { label: "Tried a few times", value: "beginner" },
          { label: "Use regularly", value: "intermediate" },
          { label: "Power user", value: "advanced" },
        ]}],
        nextStep: 8,
      };
    default:
      return { messages: [], nextStep: step + 1 };
  }
}

type Phase = "chat" | "summary";

export default function AssessPage() {
  const [phase, setPhase] = useState<Phase>("chat");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const [context, setContext] = useState<Record<string, string>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPills, setSelectedPills] = useState<Set<string>>(new Set());
  const [interviewData, setInterviewData] = useState<InterviewData>({
    name: "", role: "", department: "", tools: [], dailyTasks: [], painPoints: [], infoSources: [], handoffs: [], aiComfort: "",
  });
  const [editingField, setEditingField] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    const result = getStep(0, "", {});
    simulateTyping(result.messages);
    setStep(result.nextStep);
  }, []);

  const simulateTyping = useCallback((msgs: ChatMsg[]) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((p) => [...p, ...msgs]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }, 1000);
  }, []);

  const handleSend = (text?: string) => {
    const value = text || input.trim();
    if (!value || isTyping) return;

    setMessages((p) => [...p, { id: Math.random().toString(36).slice(2, 8), role: "user", content: value }]);
    setInput("");
    setSelectedPills(new Set());

    // Capture structured data
    const newData = { ...interviewData };
    if (step === 1) {
      const parts = value.split(",").map((s) => s.trim());
      newData.name = parts[0]?.split(" ")[0] || value;
      newData.role = parts.length > 1 ? parts.slice(1).join(", ") : value;
    }
    if (step === 2) newData.department = value;
    if (step === 3) newData.tools = value.split(",").map((s) => s.trim()).filter(Boolean);
    if (step === 4) newData.dailyTasks = [value];
    if (step === 5) newData.painPoints = [value];
    if (step === 6) newData.infoSources = [value];
    if (step === 7) newData.handoffs = [value];
    if (step === 8) {
      newData.aiComfort = value;
      setInterviewData(newData);
      // Transition to summary after a brief delay
      setTimeout(() => setPhase("summary"), 1500);
      return;
    }
    setInterviewData(newData);

    const newCtx = { ...context };
    if (step === 1) newCtx.name = value;
    if (step === 2) newCtx.department = value;
    setContext(newCtx);

    const result = getStep(step, value, newCtx);
    simulateTyping(result.messages);
    setStep(result.nextStep);
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

  const extractedTasks = extractTasks(interviewData);
  const summary = generateSummary(interviewData);
  const deptConfig = DEPT_ICONS[interviewData.department] || { Icon: Building2, bg: "#6b7280" };

  // ─── Summary Phase ───
  if (phase === "summary") {
    return (
      <AppShell>
        <PageHeader title="Interview Summary" />
        <div className="flex-1 overflow-y-auto scroll-thin">
          <div className="max-w-2xl mx-auto px-8 py-8">
            {submitted ? (
              /* Success state */
              <div className="text-center py-16">
                <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-7 h-7 text-green-600" strokeWidth={2} />
                </div>
                <h2 className="text-xl font-semibold mb-2">Interview submitted</h2>
                <p className="text-[14px] text-muted mb-6">
                  {interviewData.name}&apos;s responses have been added to the intelligence layer.
                  The more people who complete this, the more accurate the picture becomes.
                </p>
                <Link href="/intelligence" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-[14px] font-medium hover:bg-accent-hover transition-colors">
                  View Intelligence Layer
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold tracking-tight mb-2">Review & Confirm</h2>
                  <p className="text-[13px] text-muted">Review what we captured from your interview. Edit anything that doesn&apos;t look right before submitting.</p>
                </div>

                {/* Profile card */}
                <div className="p-5 rounded-2xl border border-border mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[16px] font-bold text-white" style={{ background: deptConfig.bg }}>
                      {interviewData.name.charAt(0) || "?"}
                    </div>
                    <div>
                      <h3 className="text-[16px] font-semibold">{interviewData.name || "Name not captured"}</h3>
                      <p className="text-[13px] text-muted">{interviewData.role || "Role"} · {interviewData.department || "Department"}</p>
                    </div>
                    <button onClick={() => setEditingField("profile")} className="ml-auto text-muted hover:text-foreground transition-colors">
                      <Pencil className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>

                  {editingField === "profile" && (
                    <div className="space-y-2 pt-2 border-t border-border mt-2">
                      <input value={interviewData.name} onChange={(e) => setInterviewData({ ...interviewData, name: e.target.value })} placeholder="Name" className="w-full h-9 px-3 rounded-lg bg-surface border border-border text-[13px] focus:outline-none focus:border-accent/40" />
                      <input value={interviewData.role} onChange={(e) => setInterviewData({ ...interviewData, role: e.target.value })} placeholder="Role" className="w-full h-9 px-3 rounded-lg bg-surface border border-border text-[13px] focus:outline-none focus:border-accent/40" />
                      <button onClick={() => setEditingField(null)} className="text-[12px] text-accent hover:text-accent-hover">Done editing</button>
                    </div>
                  )}
                </div>

                {/* Summary paragraph */}
                <div className="p-5 rounded-2xl bg-surface border border-border mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[13px] font-semibold">Summary</h3>
                    <button onClick={() => setEditingField("summary")} className="text-muted hover:text-foreground transition-colors">
                      <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                  <p className="text-[13px] text-muted leading-relaxed">{summary}</p>
                </div>

                {/* Workflows & Tasks */}
                <div className="p-5 rounded-2xl border border-border mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[13px] font-semibold">Workflows & Tasks</h3>
                  </div>
                  <div className="space-y-2">
                    {extractedTasks.map((task, i) => {
                      const IconComp = deptConfig.Icon;
                      return (
                        <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-border">
                          <div className="flex items-center gap-2.5">
                            <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: deptConfig.bg }}>
                              <IconComp className="w-3 h-3 text-white" strokeWidth={2} />
                            </div>
                            <span className="text-[13px]">{task.title}</span>
                          </div>
                          <span className="text-[11px] text-muted-light px-2 py-0.5 rounded-full bg-surface border border-border">{task.frequency}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tools */}
                <div className="p-5 rounded-2xl border border-border mb-6">
                  <h3 className="text-[13px] font-semibold mb-3">Tools</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {interviewData.tools.map((tool) => {
                      const logo = getLogo(tool);
                      return (
                        <span key={tool} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border text-[12px]">
                          {logo && <Image src={logo} alt={tool} width={14} height={14} unoptimized />}
                          {tool}
                        </span>
                      );
                    })}
                    {interviewData.tools.length === 0 && <span className="text-[12px] text-muted-light">No tools captured</span>}
                  </div>
                </div>

                {/* Pain points */}
                <div className="p-5 rounded-2xl border border-red-200 bg-red-50/30 mb-6">
                  <h3 className="text-[13px] font-semibold text-red-700 mb-2">Pain Points</h3>
                  {interviewData.painPoints.map((pp, i) => (
                    <p key={i} className="text-[12px] text-red-800/70">- {pp}</p>
                  ))}
                  {interviewData.painPoints.length === 0 && <p className="text-[12px] text-red-400">None captured</p>}
                </div>

                {/* AI Comfort */}
                <div className="p-5 rounded-2xl border border-border mb-8">
                  <h3 className="text-[13px] font-semibold mb-1">AI Comfort Level</h3>
                  <p className="text-[13px] text-muted capitalize">{interviewData.aiComfort || "Not specified"}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPhase("chat")}
                    className="px-4 py-2.5 rounded-xl border border-border text-[13px] font-medium text-muted hover:text-foreground transition-colors"
                  >
                    Back to interview
                  </button>
                  <button
                    onClick={() => setSubmitted(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-[13px] font-medium hover:bg-accent-hover transition-colors"
                  >
                    <Check className="w-4 h-4" strokeWidth={2} />
                    Confirm & Submit
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </AppShell>
    );
  }

  // ─── Chat Phase ───
  return (
    <AppShell>
      <PageHeader title="AI Assistant" />
      <div className="flex-1 flex flex-col min-h-0">
        {/* Chat */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-thin px-6 py-6">
          <div className="max-w-xl mx-auto space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mr-2.5 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                )}
                <div className={`max-w-[80%] ${msg.role === "user" ? "px-4 py-2.5 rounded-2xl rounded-br-md bg-accent text-white text-[14px]" : "text-[14px] leading-relaxed"}`}>
                  {msg.content.split("\n").map((line, i) => (<p key={i} className={i > 0 ? "mt-2" : ""}>{line}</p>))}

                  {msg.deptPills && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {msg.deptPills.map((dept) => (
                        <button key={dept} onClick={() => handleSend(dept)} className="px-3 py-1.5 rounded-full text-[12px] font-medium border border-border hover:border-accent/30 hover:text-accent bg-surface transition-colors">
                          {dept}
                        </button>
                      ))}
                    </div>
                  )}

                  {msg.pills && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {msg.pills.map((tool) => {
                        const sel = selectedPills.has(tool);
                        const logo = getLogo(tool);
                        return (
                          <button key={tool} onClick={() => togglePill(tool)} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] border transition-colors ${sel ? "bg-accent/10 border-accent/30 text-accent" : "bg-surface border-border hover:border-accent/30 hover:text-accent"}`}>
                            {logo && <Image src={logo} alt={tool} width={14} height={14} unoptimized />}
                            {tool}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {msg.options && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {msg.options.map((opt) => (
                        <button key={opt.value} onClick={() => handleSend(opt.label)} className="px-3.5 py-1.5 rounded-xl text-[13px] font-medium border border-border hover:border-accent/30 hover:text-accent transition-colors">
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mr-2.5">
                  <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div className="flex gap-1 pt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-light animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-light animate-pulse" style={{ animationDelay: "0.2s" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-light animate-pulse" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-border bg-background px-6 py-3">
          <div className="max-w-xl mx-auto">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your response..."
                disabled={isTyping}
                className="flex-1 h-10 px-4 rounded-xl bg-surface border border-border text-[14px] placeholder:text-muted-light focus:outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 disabled:opacity-50"
              />
              <button type="submit" disabled={isTyping || !input.trim()} className="h-10 w-10 rounded-xl bg-accent text-white flex items-center justify-center hover:bg-accent-hover transition-colors disabled:opacity-20 shrink-0">
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
