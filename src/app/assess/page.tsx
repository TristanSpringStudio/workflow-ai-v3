"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { mockIntelligence } from "@/lib/mock-data";

interface ChatMsg {
  id: string;
  role: "assistant" | "user";
  content: string;
}

const QUESTIONS = [
  "What's your name and role?",
  "Which department do you work in?",
  "What does a typical day look like for you? Walk me through your main tasks.",
  "What tools and software do you use daily?",
  "What takes the most time or feels most repetitive?",
  "Where do you get the information you need to do your work? Which teams or tools?",
  "What do you regularly hand off to other teams? How does that handoff work?",
  "What key decisions do you make in your role?",
  "How comfortable are you with AI tools like ChatGPT or Claude?",
];

export default function AssessPage() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: "0", role: "assistant", content: "Welcome to the assessment. I'll ask you a series of questions about your role, daily work, and how information flows through your team. This helps us build an intelligence map of your organization.\n\nLet's start — what's your name and role?" },
  ]);
  const [input, setInput] = useState("");
  const [qIndex, setQIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [complete, setComplete] = useState(false);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    const userMsg: ChatMsg = { id: Math.random().toString(36).slice(2), role: "user", content: input };
    setMessages((p) => [...p, userMsg]);
    setInput("");

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const nextQ = qIndex + 1;
      if (nextQ < QUESTIONS.length) {
        setMessages((p) => [...p, { id: Math.random().toString(36).slice(2), role: "assistant", content: `Got it, thanks.\n\n${QUESTIONS[nextQ]}` }]);
        setQIndex(nextQ);
      } else {
        setMessages((p) => [...p, { id: Math.random().toString(36).slice(2), role: "assistant", content: "That's everything I need. Your responses have been recorded and will be incorporated into the company intelligence map. Thank you!" }]);
        setComplete(true);
      }
    }, 1000);
  };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="shrink-0 h-14 border-b border-border px-6 flex items-center justify-between">
          <div>
            <h1 className="text-[14px] font-semibold">Employee Assessment</h1>
            <p className="text-[11px] text-muted-light">{mockIntelligence.interviews.length} interviews completed · Question {Math.min(qIndex + 1, QUESTIONS.length)} of {QUESTIONS.length}</p>
          </div>
          {/* Progress */}
          <div className="w-40 h-1.5 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${((qIndex + (complete ? 1 : 0)) / QUESTIONS.length) * 100}%` }} />
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-y-auto scroll-thin px-6 py-6">
          <div className="max-w-xl mx-auto space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="shrink-0 w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center mr-2.5 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                )}
                <div className={`max-w-[80%] ${msg.role === "user" ? "px-4 py-2.5 rounded-2xl rounded-br-md bg-accent text-white text-[14px]" : "text-[14px] leading-relaxed"}`}>
                  {msg.content.split("\n").map((line, i) => (<p key={i} className={i > 0 ? "mt-2" : ""}>{line}</p>))}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-1 ml-10 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-light animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-light animate-pulse" style={{ animationDelay: "0.2s" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-light animate-pulse" style={{ animationDelay: "0.4s" }} />
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        {!complete && (
          <div className="shrink-0 px-6 py-3 border-t border-border">
            <div className="max-w-xl mx-auto">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your response..." disabled={isTyping} className="flex-1 h-10 px-3 rounded-xl bg-surface border border-border text-[14px] placeholder:text-muted-light focus:outline-none focus:border-accent/40 disabled:opacity-50" />
                <button type="submit" disabled={isTyping || !input.trim()} className="h-10 w-10 rounded-xl bg-accent text-white flex items-center justify-center hover:bg-accent-hover disabled:opacity-20 shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
