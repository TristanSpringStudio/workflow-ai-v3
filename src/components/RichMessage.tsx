"use client";

import Link from "next/link";
import { User, DollarSign, Megaphone, TrendingUp, Wrench, FlaskConical, PackageSearch, Headphones, Users } from "lucide-react";
import { useCompanyData } from "@/lib/company-data";
import type { Task, Contributor } from "@/lib/types";

const DEPT_ICONS: Record<string, { Icon: typeof DollarSign; bg: string }> = {
  Sales: { Icon: DollarSign, bg: "#22c55e" },
  Marketing: { Icon: Megaphone, bg: "#a855f7" },
  Finance: { Icon: TrendingUp, bg: "#3b52ce" },
  Operations: { Icon: Wrench, bg: "#f59e0b" },
  Engineering: { Icon: FlaskConical, bg: "#6366f1" },
  Product: { Icon: PackageSearch, bg: "#ec4899" },
  "Customer Success": { Icon: Headphones, bg: "#ca8a04" },
  HR: { Icon: Users, bg: "#3b82f6" },
};

function PersonChip({ name, contributor }: { name: string; contributor?: Contributor }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-surface border border-border text-[12px] font-medium whitespace-nowrap align-middle mx-0.5">
      <User className="w-3 h-3 text-muted-light shrink-0" strokeWidth={2} />
      {name}
      {contributor && (
        <span className="text-[10px] text-muted-light font-normal">{contributor.department}</span>
      )}
    </span>
  );
}

function WorkflowChip({ title, task }: { title: string; task?: Task }) {
  const dept = task?.department || "";
  const cfg = DEPT_ICONS[dept];
  const IconComponent = cfg?.Icon || Wrench;

  const chip = (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-border text-[12px] font-medium whitespace-nowrap align-middle mx-0.5 hover:border-muted-light transition-colors cursor-pointer">
      <span
        className="w-3.5 h-3.5 rounded flex items-center justify-center shrink-0"
        style={{ background: cfg?.bg || "#6b7280" }}
      >
        <IconComponent className="w-2 h-2 text-white" strokeWidth={2} />
      </span>
      {title}
    </span>
  );

  if (task) {
    return (
      <Link href={`/intelligence/${task.id}`} className="no-underline">
        {chip}
      </Link>
    );
  }

  return chip;
}

/**
 * Parses and renders AI assistant messages with interactive chips.
 *
 * Syntax:
 * - @[Person Name] → PersonChip
 * - #[Workflow Title] → WorkflowChip (linked)
 */
export default function RichMessage({ content }: { content: string }) {
  const { tasks, contributors } = useCompanyData();

  // Parse the content into segments
  const segments = parseChips(content);

  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === "text") {
          return <span key={i}>{seg.value}</span>;
        }

        if (seg.type === "person") {
          const contributor = contributors.find(
            (c) => c.name.toLowerCase() === seg.value.toLowerCase()
          );
          return <PersonChip key={i} name={seg.value} contributor={contributor} />;
        }

        if (seg.type === "workflow") {
          const task = tasks.find(
            (t) => t.title.toLowerCase() === seg.value.toLowerCase()
          );
          return <WorkflowChip key={i} title={seg.value} task={task} />;
        }

        return null;
      })}
    </>
  );
}

interface Segment {
  type: "text" | "person" | "workflow";
  value: string;
}

function parseChips(text: string): Segment[] {
  const segments: Segment[] = [];
  // Match @[...] for people and #[...] for workflows
  const regex = /(@\[([^\]]+)\]|#\[([^\]]+)\])/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }

    if (match[2]) {
      // @[Person Name]
      segments.push({ type: "person", value: match[2] });
    } else if (match[3]) {
      // #[Workflow Title]
      segments.push({ type: "workflow", value: match[3] });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments;
}
