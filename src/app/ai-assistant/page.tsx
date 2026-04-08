"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Send, Home, ChevronDown, Check } from "lucide-react";
import AppShell from "@/components/AppShell";

interface ChatMsg { id: string; role: "assistant" | "user"; content: string; }

const MOCK_RESPONSES: Record<string, string> = {
  "default": "Based on our intelligence layer, I can see several opportunities across your organization. The biggest quick win is automating the weekly performance report — Sarah spends 3 hours every Friday on something AI can do in minutes. Want me to dive deeper into any specific area?",
  "sales": "Your sales team is spending about 2 hours per day on personalized outreach emails — that's 10 hours a week. AI can draft these in 2 minutes each while maintaining the personalization that gets replies. Marcus's reply rate could jump from 2% to 11% based on what we've seen in similar orgs.",
  "appointments": "Looking at your data, the main bottleneck to booking more appointments is the manual outreach process. Marcus writes each email from scratch. If we set up AI-powered outreach, he could 5x his send volume without sacrificing personalization. The implementation takes about 1.5 hours.",
  "p&l": "David spends 5 full days on month-end close. 95% of the transaction categorization is repetitive. With an AI-powered financial layer, the close could go from 5 days to 1 day. The estimated annual savings is $28,800. Want me to show you the implementation plan?",
  "priya": "Priya Patel is a critical single point of failure. She's the sole contributor to 5 workflows in Operations — client onboarding, SOP documentation, status meetings, client health monitoring, and vendor management. None of these are documented. If she goes on vacation, they all stop. Priority recommendation: document her top 3 processes immediately.",
  "bottleneck": "The biggest bottleneck is the Sales-to-Operations handoff. When a deal closes, it takes 14 days for onboarding to begin. The industry average is 3 days. The handoff involves email chains, manual Notion checklists, and hand-created Jira tickets. We can automate this to a 48-hour kickoff.",
};

function AiAssistantContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatTitle, setChatTitle] = useState("New AI chat");
  const [chatHistoryOpen, setChatHistoryOpen] = useState(false);
  const [chatHistory] = useState([
    { id: "ch1", title: "New AI chat", date: "Today" },
    { id: "ch2", title: "Sales automation opportunities", date: "Today" },
    { id: "ch3", title: "Marketing report analysis", date: "Previous 7 days" },
    { id: "ch4", title: "Onboarding bottleneck deep dive", date: "Previous 7 days" },
    { id: "ch5", title: "Finance close process review", date: "Previous 30 days" },
    { id: "ch6", title: "Cross-team data redundancy", date: "Previous 30 days" },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const hasProcessedInitial = useRef(false);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) setChatHistoryOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const getResponse = useCallback((q: string): string => {
    const lower = q.toLowerCase();
    if (lower.includes("sales") || lower.includes("call")) return MOCK_RESPONSES["sales"];
    if (lower.includes("appointment") || lower.includes("book")) return MOCK_RESPONSES["appointments"];
    if (lower.includes("p&l") || lower.includes("financial") || lower.includes("automat")) return MOCK_RESPONSES["p&l"];
    if (lower.includes("priya") || lower.includes("single point") || lower.includes("failure")) return MOCK_RESPONSES["priya"];
    if (lower.includes("bottleneck") || lower.includes("handoff") || lower.includes("onboard")) return MOCK_RESPONSES["bottleneck"];
    return MOCK_RESPONSES["default"];
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMsg = { id: Math.random().toString(36).slice(2, 8), role: "user", content: text };
    setMessages((p) => [...p, userMsg]);
    setInput("");

    if (messages.length === 0) {
      setChatTitle(text.length > 35 ? text.slice(0, 35) + "..." : text);
    }

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((p) => [...p, { id: Math.random().toString(36).slice(2, 8), role: "assistant", content: getResponse(text) }]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }, 1500);
  }, [isTyping, messages.length, getResponse]);

  // Auto-send initial query from homepage
  useEffect(() => {
    if (initialQuery && !hasProcessedInitial.current) {
      hasProcessedInitial.current = true;
      sendMessage(initialQuery);
    }
  }, [initialQuery, sendMessage]);

  return (
    <AppShell>
      {/* Breadcrumb header with chat history dropdown */}
      <div className="shrink-0 h-14 border-b border-border px-6 flex items-center">
        <div className="flex items-center gap-2 text-[14px]">
          <a href="/ai-assistant" className="flex items-center gap-1.5 text-muted hover:text-foreground transition-colors">
            <Sparkles className="w-4 h-4" strokeWidth={1.5} />
            <span>AI Assistant</span>
          </a>
          <span className="text-muted-light">/</span>

          <div ref={historyRef} className="relative">
            <button
              onClick={() => setChatHistoryOpen(!chatHistoryOpen)}
              className="flex items-center gap-1 font-semibold text-foreground hover:text-accent transition-colors"
            >
              {chatTitle}
              <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform ${chatHistoryOpen ? "rotate-180" : ""}`} strokeWidth={2} />
            </button>

            {chatHistoryOpen && (
              <div className="absolute top-full left-0 mt-1 w-[280px] rounded-xl bg-background border border-border shadow-lg z-30 py-1 max-h-[400px] overflow-y-auto scroll-thin">
                {(() => {
                  const groups: Record<string, typeof chatHistory> = {};
                  chatHistory.forEach((ch) => {
                    if (!groups[ch.date]) groups[ch.date] = [];
                    groups[ch.date].push(ch);
                  });
                  return Object.entries(groups).map(([date, chats]) => (
                    <div key={date}>
                      <p className="px-3 pt-2 pb-1 text-[10px] font-medium text-muted-light uppercase tracking-widest">{date}</p>
                      {chats.map((ch) => (
                        <button
                          key={ch.id}
                          onClick={() => { setChatTitle(ch.title); setChatHistoryOpen(false); }}
                          className="w-full flex items-center justify-between px-3 py-2 text-[13px] text-left hover:bg-surface transition-colors"
                        >
                          <span className={ch.title === chatTitle ? "text-foreground font-medium" : "text-muted"}>{ch.title}</span>
                          {ch.title === chatTitle && <Check className="w-3.5 h-3.5 text-accent" strokeWidth={2} />}
                        </button>
                      ))}
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-thin px-6 py-6">
          <div className="max-w-xl mx-auto space-y-4">
            {messages.length === 0 && !isTyping && (
              <div className="text-center py-20">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-5 h-5 text-accent" strokeWidth={1.5} />
                </div>
                <p className="text-[14px] text-muted">Ask anything about your company</p>
                <p className="text-[12px] text-muted-light mt-1">I have context from all employee interviews and the intelligence layer</p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mr-2.5 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-accent" strokeWidth={2} />
                  </div>
                )}
                <div className={`max-w-[80%] ${msg.role === "user" ? "px-4 py-2.5 rounded-2xl rounded-br-md bg-accent text-white text-[14px]" : "text-[14px] leading-relaxed text-muted"}`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mr-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent" strokeWidth={2} />
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
            <div className="chat-border rounded-xl">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex items-center gap-2 px-3 py-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your company..."
                  disabled={isTyping}
                  autoFocus
                  className="flex-1 bg-transparent text-[14px] placeholder:text-muted-light focus:outline-none disabled:opacity-50"
                />
                <button type="submit" disabled={isTyping || !input.trim()} className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center hover:bg-foreground/80 transition-colors disabled:opacity-20 shrink-0">
                  <Send className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function AiAssistantPage() {
  return (
    <Suspense fallback={<AppShell><div className="flex-1" /></AppShell>}>
      <AiAssistantContent />
    </Suspense>
  );
}
