"use client";

import Link from "next/link";
import {
  Home,
  Radio,
  MessageSquare,
  ClipboardList,
  Sun,
  Settings as SettingsIcon,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";

interface Breadcrumb {
  label: string;
  href: string;
  icon?: LucideIcon;
}

interface PageHeaderProps {
  title: string;
  icon?: LucideIcon;
  breadcrumbs?: Breadcrumb[];
  children?: React.ReactNode;
}

/**
 * Title → lucide icon. Mirrors the sidebar nav in AppShell so the breadcrumb
 * icon for "Home" and the "Home" sidebar item render the same glyph. If a
 * caller needs a different icon (e.g. a department page), pass one via `icon`.
 */
const PAGE_ICONS: Record<string, LucideIcon> = {
  Home,
  "Company Intelligence": Radio,
  Interviews: MessageSquare,
  "Implementation Plan": ClipboardList,
  "AI Assistant": Sun,
  Recommendations: Lightbulb,
  Settings: SettingsIcon,
};

export default function PageHeader({ title, icon, breadcrumbs, children }: PageHeaderProps) {
  const Icon = icon || PAGE_ICONS[title] || Radio;

  return (
    <div className="shrink-0 h-14 border-b border-border px-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          /* Breadcrumb mode */
          <div className="flex items-center gap-2 text-[14px]">
            {breadcrumbs.map((crumb, i) => {
              const CrumbIcon = crumb.icon;
              return (
                <div key={i} className="flex items-center gap-2">
                  {i === 0 && CrumbIcon && (
                    <CrumbIcon className="w-4 h-4 text-muted-light" strokeWidth={1.5} />
                  )}
                  <Link href={crumb.href} className="text-muted hover:text-foreground transition-colors">
                    {crumb.label}
                  </Link>
                  <span className="text-muted-light">/</span>
                </div>
              );
            })}
            <span className="font-semibold text-foreground">{title}</span>
          </div>
        ) : (
          /* Simple mode */
          <>
            <Icon className="w-4 h-4 text-muted" strokeWidth={1.5} />
            <h1 className="text-[14px] font-medium">{title}</h1>
          </>
        )}
      </div>

      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
