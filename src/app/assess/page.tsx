"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
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

interface ChatMsg {
  id: string;
  role: "assistant" | "user";
  content: string;
  pills?: string[];
  options?: { label: string; value: string }[];
  deptPills?: string[];
}

const DEPARTMENTS = ["Marketing", "Sales", "Operations", "Engineering", "Product", "Finance", "Design", "Support", "HR", "Legal"];
const TOOLS = Object.keys(TOOL_DOMAINS);

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
        messages: [{ id: id(), role: "assistant", content: "What feels the most repetitive or tedious? The stuff that takes way too long or makes you think 'there has to be a better way.'" }],
        nextStep: 5,
      };

    case 5:
      return {
        messages: [{ id: id(), role: "assistant", content: "Where do you get the information you need? Which teams or tools do you pull data from?" }],
        nextStep: 6,
      };

    case 6:
      return {
        messages: [{ id: id(), role: "assistant", content: "What do you hand off to other teams? What do they need from you, and how does that handoff currently work?" }],
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

    case 8:
      return {
        messages: [{ id: id(), role: "assistant", content: "That's everything I need. Your responses have been added to the intelligence layer. The more people on your team who go through this, the more accurate the map becomes.\n\nYou can always come back and add more context or update your answers." }],
        nextStep: 9,
      };

    default:
      return {
        messages: [{ id: id(), role: "assistant", content: "Thanks! That context has been added. Anything else you want to share about how your work flows?" }],
        nextStep: step + 1,
      };
  }
}

export default function AssessPage() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const [context, setContext] = useState<Record<string, string>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [complete, setComplete] = useState(false);
  const [selectedPills, setSelectedPills] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  // Start conversation
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

    const newCtx = { ...context };
    if (step === 1) newCtx.name = value;
    if (step === 2) newCtx.department = value;
    if (step === 3) newCtx.tools = value;
    setContext(newCtx);

    const result = getStep(step, value, newCtx);
    simulateTyping(result.messages);
    setStep(result.nextStep);
    if (result.nextStep >= 9) setComplete(true);
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

  return (
    <AppShell>
      <div className="flex-1 flex flex-col min-h-0">
        <PageHeader title="AI Assistant" subtitle={`${contributors.length} interviews completed · Add context to the intelligence layer`}>
          <div className="w-40 h-1.5 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${Math.min((step / 9) * 100, 100)}%` }} />
          </div>
        </PageHeader>

        {/* Chat — scrollable area */}
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

                  {/* Department pills */}
                  {msg.deptPills && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {msg.deptPills.map((dept) => (
                        <button key={dept} onClick={() => handleSend(dept)} className="px-3 py-1.5 rounded-full text-[12px] font-medium border border-border hover:border-accent/30 hover:text-accent bg-surface transition-colors">
                          {dept}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Tool pills with logos */}
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

                  {/* Option buttons */}
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

        {/* Input — always pinned at bottom */}
        <div className="shrink-0 border-t border-border bg-background px-6 py-3">
          <div className="max-w-xl mx-auto">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={complete ? "Add more context..." : "Type your response..."}
                disabled={isTyping}
                className="flex-1 h-10 px-4 rounded-xl bg-surface border border-border text-[14px] placeholder:text-muted-light focus:outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 disabled:opacity-50"
              />
              <button type="submit" disabled={isTyping || !input.trim()} className="h-10 w-10 rounded-xl bg-accent text-white flex items-center justify-center hover:bg-accent-hover transition-colors disabled:opacity-20 shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
