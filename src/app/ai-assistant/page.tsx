"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sun, Send, ChevronDown, Check, Plus, Trash2 } from "lucide-react";
import MessageShimmer from "@/components/MessageShimmer";
import RichMessage from "@/components/RichMessage";
import AppShell from "@/components/AppShell";

interface ChatMsg {
  id: string;
  role: "assistant" | "user";
  content: string;
}

interface ChatHistoryItem {
  id: string;
  title: string;
  updated_at: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function AiAssistantContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatTitle, setChatTitle] = useState("New AI chat");
  const [chatId, setChatId] = useState<string | null>(null);
  const [chatHistoryOpen, setChatHistoryOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const hasProcessedInitial = useRef(false);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

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

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const res = await fetch("/api/assistant/chats");
      if (res.ok) {
        const data = await res.json();
        setChatHistory(data.chats || []);
      }
    } catch {
      // Silently fail — chat history is non-critical
    }
  };

  const saveChat = useCallback(
    async (title: string, msgs: ChatMsg[], existingChatId: string | null) => {
      if (msgs.length === 0) return;

      // Debounce saves
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(async () => {
        try {
          const res = await fetch("/api/assistant/chats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chatId: existingChatId,
              title,
              messages: msgs,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (!existingChatId && data.chatId) {
              setChatId(data.chatId);
            }
            loadChatHistory();
          }
        } catch {
          // Silently fail
        }
      }, 1000);
    },
    []
  );

  const loadChat = async (historyItem: ChatHistoryItem) => {
    try {
      const res = await fetch(`/api/assistant/chats/${historyItem.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.chat.messages || []);
        setChatTitle(data.chat.title);
        setChatId(data.chat.id);
        setChatHistoryOpen(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    } catch {
      // Silently fail
    }
  };

  const deleteChat = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await fetch(`/api/assistant/chats/${id}`, { method: "DELETE" });
      setChatHistory((prev) => prev.filter((ch) => ch.id !== id));
      if (chatId === id) {
        startNewChat();
      }
    } catch {
      // Silently fail
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setChatTitle("New AI chat");
    setChatId(null);
    setChatHistoryOpen(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isTyping) return;

      const userMsg: ChatMsg = {
        id: Math.random().toString(36).slice(2, 8),
        role: "user",
        content: text,
      };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");

      const newTitle =
        messages.length === 0
          ? text.length > 35
            ? text.slice(0, 35) + "..."
            : text
          : chatTitle;

      if (messages.length === 0) {
        setChatTitle(newTitle);
      }

      setIsTyping(true);

      const assistantId = Math.random().toString(36).slice(2, 8);

      try {
        const res = await fetch("/api/assistant/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No reader");

        // Only add assistant message once first token arrives
        let assistantAdded = false;
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                if (!assistantAdded) {
                  // First token — add the assistant message
                  assistantAdded = true;
                  setMessages((prev) => [
                    ...prev,
                    { id: assistantId, role: "assistant", content: parsed.text },
                  ]);
                } else {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId
                        ? { ...m, content: m.content + parsed.text }
                        : m
                    )
                  );
                }
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }

        // Save chat after response completes
        setMessages((prev) => {
          const finalMessages = [...prev];
          saveChat(newTitle, finalMessages, chatId);
          return prev;
        });
      } catch (error) {
        console.error("Chat error:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again.",
          },
        ]);
      } finally {
        setIsTyping(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [isTyping, messages, chatTitle, chatId, saveChat]
  );

  // Auto-send initial query from homepage
  useEffect(() => {
    if (initialQuery && !hasProcessedInitial.current) {
      hasProcessedInitial.current = true;
      sendMessage(initialQuery);
    }
  }, [initialQuery, sendMessage]);

  // Group chat history by date
  const groupedHistory = chatHistory.reduce<Record<string, ChatHistoryItem[]>>(
    (groups, ch) => {
      const label = formatDate(ch.updated_at);
      if (!groups[label]) groups[label] = [];
      groups[label].push(ch);
      return groups;
    },
    {}
  );

  return (
    <AppShell>
      {/* Breadcrumb header with chat history dropdown */}
      <div className="shrink-0 h-14 border-b border-border px-6 flex items-center">
        <div className="flex items-center gap-2 text-[14px]">
          <a
            href="/ai-assistant"
            className="flex items-center gap-1.5 text-muted hover:text-foreground transition-colors"
          >
            <Sun className="w-4 h-4" strokeWidth={1.5} />
            <span>AI Assistant</span>
          </a>
          <span className="text-muted-light">/</span>

          <div ref={historyRef} className="relative">
            <button
              onClick={() => setChatHistoryOpen(!chatHistoryOpen)}
              className="flex items-center gap-1 font-semibold text-foreground hover:text-accent transition-colors"
            >
              {chatTitle}
              <ChevronDown
                className={`w-3.5 h-3.5 text-muted transition-transform ${chatHistoryOpen ? "rotate-180" : ""}`}
                strokeWidth={2}
              />
            </button>

            {chatHistoryOpen && (
              <div className="absolute top-full left-0 mt-1 w-[300px] rounded-xl bg-background border border-border shadow-lg z-30 py-1 max-h-[400px] overflow-y-auto scroll-thin">
                {/* New chat button */}
                <button
                  onClick={startNewChat}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-accent hover:bg-surface transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                  New chat
                </button>
                <div className="border-t border-border my-1" />

                {chatHistory.length === 0 ? (
                  <p className="px-3 py-3 text-[12px] text-muted-light text-center">No previous chats</p>
                ) : (
                  Object.entries(groupedHistory).map(([date, chats]) => (
                    <div key={date}>
                      <p className="px-3 pt-2 pb-1 text-[10px] font-medium text-muted-light uppercase tracking-widest">
                        {date}
                      </p>
                      {chats.map((ch) => (
                        <button
                          key={ch.id}
                          onClick={() => loadChat(ch)}
                          className="w-full group flex items-center justify-between px-3 py-2 text-[13px] text-left hover:bg-surface transition-colors"
                        >
                          <span
                            className={
                              ch.id === chatId
                                ? "text-foreground font-medium truncate"
                                : "text-muted truncate"
                            }
                          >
                            {ch.title}
                          </span>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            {ch.id === chatId && (
                              <Check className="w-3.5 h-3.5 text-accent" strokeWidth={2} />
                            )}
                            <button
                              onClick={(e) => deleteChat(e, ch.id)}
                              className="w-5 h-5 flex items-center justify-center rounded text-muted-light hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 className="w-3 h-3" strokeWidth={2} />
                            </button>
                          </div>
                        </button>
                      ))}
                    </div>
                  ))
                )}
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
                  <Sun className="w-5 h-5 text-accent" strokeWidth={1.5} />
                </div>
                <p className="text-[14px] text-muted">Ask anything about your company</p>
                <p className="text-[12px] text-muted-light mt-1">
                  I have context from all employee interviews and the intelligence layer
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] ${
                    msg.role === "user"
                      ? "px-4 py-2.5 rounded-2xl rounded-br-md bg-surface text-foreground text-[14px]"
                      : "text-[14px] leading-relaxed text-muted"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="whitespace-pre-wrap">
                      <RichMessage content={msg.content} />
                      {isTyping && messages[messages.length - 1]?.id === msg.id && (
                        <span className="inline-block w-1.5 h-4 bg-accent/50 animate-pulse ml-0.5 align-middle" />
                      )}
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {isTyping &&
              (messages.length === 0 ||
                messages[messages.length - 1]?.role === "user") && <MessageShimmer />}
          </div>
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-border bg-background px-6 py-3">
          <div className="max-w-xl mx-auto">
            <div className="chat-border rounded-xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(input);
                  if (inputRef.current) inputRef.current.style.height = "auto";
                }}
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
                      sendMessage(input);
                      if (inputRef.current) inputRef.current.style.height = "auto";
                    }
                  }}
                  placeholder="Ask about your company..."
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
