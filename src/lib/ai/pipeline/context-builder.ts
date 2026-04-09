/**
 * Builds a condensed company context string for the AI assistant.
 * Dynamically generated from real Supabase data on each request.
 *
 * Designed to be compact (~2-3K tokens) while giving Claude enough
 * to answer most questions. At scale, this gets replaced with tool use.
 */

import type { Task, Contributor } from "@/lib/types";

interface AssessmentData {
  overall_score?: number;
  summary?: string;
  strengths?: string[];
  improvements?: string[];
  quick_wins?: string[];
  estimated_impact?: string;
}

export function buildCompanyContext(
  companyName: string,
  tasks: Task[],
  contributors: Contributor[],
  assessment: AssessmentData | null
): string {
  const sections: string[] = [];

  // ─── Company overview ───
  const departments = [...new Set(tasks.map((t) => t.department))];
  const bottlenecks = tasks.filter((t) => t.isBottleneck);
  const withRecs = tasks.filter((t) => t.recommendation);
  const criticalRecs = withRecs.filter((t) => t.recommendation?.priority === "critical");

  sections.push(`## Company Overview
- **Company:** ${companyName}
- **Employees interviewed:** ${contributors.length}
- **Departments:** ${departments.join(", ")}
- **Workflows documented:** ${tasks.length}
- **Bottlenecks identified:** ${bottlenecks.length}
- **AI recommendations:** ${withRecs.length} (${criticalRecs.length} critical)`);

  // ─── Assessment ───
  if (assessment) {
    sections.push(`## AI Readiness Assessment
- **Overall score:** ${assessment.overall_score || "N/A"}/100
- **Summary:** ${assessment.summary || "N/A"}
- **Estimated impact:** ${assessment.estimated_impact || "N/A"}
${assessment.quick_wins?.length ? `- **Quick wins:** ${assessment.quick_wins.join("; ")}` : ""}`);
  }

  // ─── Department summaries ───
  const deptSummaries = departments.map((dept) => {
    const deptTasks = tasks.filter((t) => t.department === dept);
    const deptContribs = contributors.filter((c) => c.department === dept);
    const deptBottlenecks = deptTasks.filter((t) => t.isBottleneck);
    const deptRecs = deptTasks.filter((t) => t.recommendation);

    // Calculate total time savings
    let totalTimeSaved = "";
    const timeParts = deptRecs
      .map((t) => t.recommendation?.impact?.timeSaved)
      .filter(Boolean);
    if (timeParts.length > 0) {
      totalTimeSaved = ` | Est. savings: ${timeParts.join(", ")}`;
    }

    return `**${dept}** (${deptContribs.length} people, ${deptTasks.length} workflows, ${deptBottlenecks.length} bottlenecks${totalTimeSaved})`;
  });

  sections.push(`## Departments\n${deptSummaries.join("\n")}`);

  // ─── Bottleneck workflows ───
  if (bottlenecks.length > 0) {
    const bottleneckLines = bottlenecks.map((t) => {
      const rec = t.recommendation;
      const savings = rec ? ` → ${rec.impact.timeSaved} saved, ${rec.impact.costSaved}/yr` : "";
      return `- **${t.title}** (${t.department}) — ${t.frequency}, ${t.timeSpent}${savings}`;
    });
    sections.push(`## Bottleneck Workflows\n${bottleneckLines.join("\n")}`);
  }

  // ─── All workflows with recommendations (condensed) ───
  const workflowLines = tasks.map((t) => {
    const rec = t.recommendation;
    const flags: string[] = [];
    if (t.isBottleneck) flags.push("BOTTLENECK");
    if (rec?.priority === "critical") flags.push("CRITICAL");

    const flagStr = flags.length > 0 ? ` [${flags.join(", ")}]` : "";
    const recStr = rec
      ? ` | AI: ${rec.summary.split(".")[0]}. Phase ${rec.phase}, ${rec.priority} priority, ${rec.difficulty} difficulty. Saves ${rec.impact.timeSaved}, ${rec.impact.costSaved}/yr.`
      : "";

    // Include contributor names
    const contribNames = t.contributors
      .map((id) => contributors.find((c) => c.id === id)?.name)
      .filter(Boolean)
      .join(", ");

    return `- **${t.title}** (${t.department}${contribNames ? `, ${contribNames}` : ""}) — ${t.frequency}, ${t.timeSpent}${flagStr}${recStr}`;
  });
  sections.push(`## All Workflows\n${workflowLines.join("\n")}`);

  // ─── Contributors ───
  const contribLines = contributors.map((c) => {
    const taskCount = tasks.filter((t) => t.contributors.includes(c.id)).length;
    return `- **${c.name}** — ${c.role}, ${c.department} (${taskCount} workflows, AI comfort: ${c.aiComfort})`;
  });
  sections.push(`## People\n${contribLines.join("\n")}`);

  // ─── Key interview quotes (pain points only, for color) ───
  const painQuotes: string[] = [];
  for (const t of tasks) {
    if (t.knowledge && t.knowledge.length > 0) {
      for (const k of t.knowledge.slice(0, 1)) {
        const person = contributors.find((c) => c.id === k.contributorId);
        if (person && k.quote.length < 200) {
          painQuotes.push(`- "${k.quote}" — ${person.name} (re: ${t.title})`);
        }
      }
    }
  }
  if (painQuotes.length > 0) {
    sections.push(`## Notable Interview Quotes\n${painQuotes.slice(0, 15).join("\n")}`);
  }

  return sections.join("\n\n");
}
