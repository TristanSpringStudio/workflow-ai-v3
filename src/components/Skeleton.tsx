/**
 * Skeleton primitive — a pulsing rounded block used for loading states.
 *
 * Design:
 * - Uses the surface color so it reads as "this chunk of UI is coming"
 *   rather than looking like a real content block.
 * - `animate-pulse` from Tailwind gives the subtle breathing effect.
 * - Pass width/height via className (e.g. "h-4 w-32") or via inline style.
 */
export function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-foreground/[0.06] ${className}`}
      style={style}
    />
  );
}

/**
 * ContentSkeleton — generic "page loading" placeholder used inside AppShell
 * while the initial company-data fetch is in flight. Mirrors the shape of a
 * typical interior page: a header row, a stats row, and a content block.
 *
 * This replaces what used to be a flash of mock data on every navigation.
 */
export function ContentSkeleton() {
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Page header bar */}
      <div className="shrink-0 h-14 border-b border-border px-6 flex items-center">
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto scroll-thin">
        <div className="max-w-2xl mx-auto px-8 py-10">
          {/* Title block */}
          <div className="mb-10">
            <Skeleton className="h-6 w-56 mb-3" />
            <Skeleton className="h-4 w-80" />
          </div>

          {/* Stats row */}
          <div className="border-t border-border" />
          <div className="grid grid-cols-3 py-6 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
          <div className="border-t border-border mb-10" />

          {/* Content rows */}
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-border">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-72" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
