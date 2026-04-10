"use client";

/**
 * Shimmer loading state for AI chat messages.
 * Shows "Thinking..." text with a shimmer animation.
 */
export default function MessageShimmer() {
  return (
    <div className="flex justify-start">
      <div className="text-[14px] text-muted-light">
        <span className="shimmer-text">Thinking...</span>
      </div>
    </div>
  );
}
