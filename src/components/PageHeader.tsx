"use client";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode; // right side content
}

export default function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="shrink-0 h-14 border-b border-border px-6 flex items-center justify-between">
      {/* Left: icon + page title */}
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303" /></svg>
        <h1 className="text-[14px] font-medium">{title}</h1>
      </div>

      {/* Right: optional content */}
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
