"use client";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode; // right side content
}

export default function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="shrink-0 h-14 border-b border-border px-6 flex items-center justify-between">
      {/* Left: Vishtan logo + divider + page title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303" /></svg>
          </div>
          <span className="text-[14px] font-semibold">Vishtan</span>
        </div>
        <div className="w-px h-6 bg-border" />
        <div>
          <h1 className="text-[14px] font-semibold">{title}</h1>
          {subtitle && <p className="text-[11px] text-muted-light">{subtitle}</p>}
        </div>
      </div>

      {/* Right: optional content */}
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
