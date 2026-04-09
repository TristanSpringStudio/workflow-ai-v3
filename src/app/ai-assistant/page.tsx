"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Send, ChevronDown, Check } from "lucide-react";
import MessageShimmer from "@/components/MessageShimmer";
import RichMessage from "@/components/RichMessage";
import AppShell from "@/components/AppShell";

interface ChatMsg { id: string; role: "assistant" | "user"; content: string; }

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

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMsg = { id: Math.random().toString(36).slice(2, 8), role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");

    if (messages.length === 0) {
      setChatTitle(text.length > 35 ? text.slice(0, 35) + "..." : text);
    }

    setIsTyping(true);

    // Create a placeholder assistant message for streaming
    const assistantId = Math.random().toString(36).slice(2, 8);
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process SSE events
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + parsed.text }
                    : m
                )
              );
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Sorry, I encountered an error. Please try again." }
            : m
        )
      );
    } finally {
      setIsTyping(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isTyping, messages]);

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
                  {msg.role === "assistant" ? (
                    <div className="whitespace-pre-wrap"><RichMessage content={msg.content} />{isTyping && messages[messages.length - 1]?.id === msg.id && <span className="inline-block w-1.5 h-4 bg-accent/50 animate-pulse ml-0.5 align-middle" />}</div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {isTyping && messages.length > 0 && messages[messages.length - 1]?.content === "" && (
              <MessageShimmer />
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
