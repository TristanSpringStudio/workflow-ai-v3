"use client";

import { Sparkles } from "lucide-react";

/**
 * Shimmer loading state for AI chat messages.
 * Shows 3 blurred, shimmering text lines to indicate the AI is thinking.
 */
export default function MessageShimmer() {
  return (
    <div className="flex justify-start">
      <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mr-2.5 mt-0.5">
        <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" strokeWidth={2} />
      </div>
      <div className="flex flex-col gap-2.5 pt-1 w-[280px]">
        <div className="h-3.5 rounded-full shimmer-line" style={{ width: "90%" }} />
        <div className="h-3.5 rounded-full shimmer-line" style={{ width: "75%", animationDelay: "0.15s" }} />
        <div className="h-3.5 rounded-full shimmer-line" style={{ width: "60%", animationDelay: "0.3s" }} />
      </div>
    </div>
  );
}
