import type { FlowNode, FlowEdge } from "@/components/FlowCanvas";
import type { InformationFlow, WorkflowRecommendation } from "./types";

// ─── Build org-level information flow map ───
export function buildOrgFlowMap(
  departments: string[],
  flows: InformationFlow[]
): { nodes: FlowNode[]; edges: FlowEdge[] } {
  // Arrange departments in a circle-ish grid
  const positions: Record<string, { x: number; y: number }> = {};
  const cols = 3;
  departments.forEach((dept, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    positions[dept] = {
      x: 120 + col * 280,
      y: 80 + row * 160,
    };
  });

  const nodes: FlowNode[] = departments.map((dept) => ({
    id: dept.toLowerCase().replace(/\s+/g, "-"),
    x: positions[dept].x,
    y: positions[dept].y,
    label: dept,
    type: "department" as const,
    sublabel: `${flows.filter((f) => f.from === dept).length} outgoing flows`,
  }));

  const edges: FlowEdge[] = flows.map((flow) => ({
    from: flow.from.toLowerCase().replace(/\s+/g, "-"),
    to: flow.to.toLowerCase().replace(/\s+/g, "-"),
    label: flow.frequency,
    bottleneck: flow.bottleneck,
  }));

  return { nodes, edges };
}

// ─── Build workflow recommendation flow ───
export function buildWorkflowFlow(
  rec: WorkflowRecommendation
): { nodes: FlowNode[]; edges: FlowEdge[] } {
  const nodes: FlowNode[] = [];
  const edges: FlowEdge[] = [];
  const centerX = 350;
  let y = 40;
  const spacing = 110;

  // Trigger node
  nodes.push({
    id: "trigger",
    x: centerX - 100,
    y,
    label: "Trigger",
    sublabel: rec.trigger.slice(0, 35),
    type: "trigger",
  });
  y += spacing;

  // Step nodes
  rec.steps.forEach((step, i) => {
    const id = `step-${i}`;
    nodes.push({
      id,
      x: centerX - 100,
      y,
      label: step.title,
      sublabel: step.body.slice(0, 30),
      type: "step",
      badge: `Step ${i + 1}`,
    });
    edges.push({
      from: i === 0 ? "trigger" : `step-${i - 1}`,
      to: id,
    });
    y += spacing;
  });

  // Decision points (branching)
  if (rec.decisionPoints.length > 0) {
    const lastStepId = `step-${rec.steps.length - 1}`;
    rec.decisionPoints.forEach((dp, i) => {
      const decId = `decision-${i}`;
      nodes.push({
        id: decId,
        x: centerX - 100,
        y,
        label: "Decision",
        sublabel: dp.question.slice(0, 30),
        type: "decision",
      });
      edges.push({ from: lastStepId, to: decId });
      y += spacing;

      // AI branch
      const aiId = `ai-${i}`;
      nodes.push({
        id: aiId,
        x: centerX - 240,
        y,
        label: "AI Handles",
        sublabel: dp.aiHandles.slice(0, 30),
        type: "ai",
      });
      edges.push({ from: decId, to: aiId, label: "AI" });

      // Human branch
      const humanId = `human-${i}`;
      nodes.push({
        id: humanId,
        x: centerX + 40,
        y,
        label: "You Decide",
        sublabel: dp.humanDecides.slice(0, 30),
        type: "human",
      });
      edges.push({ from: decId, to: humanId, label: "Human" });
      y += spacing;
    });
  }

  // Output node
  nodes.push({
    id: "output",
    x: centerX - 100,
    y,
    label: "Output",
    sublabel: rec.output.slice(0, 35),
    type: "output",
  });

  // Connect last elements to output
  if (rec.decisionPoints.length > 0) {
    const lastDpIdx = rec.decisionPoints.length - 1;
    edges.push({ from: `ai-${lastDpIdx}`, to: "output" });
    edges.push({ from: `human-${lastDpIdx}`, to: "output" });
  } else {
    edges.push({ from: `step-${rec.steps.length - 1}`, to: "output" });
  }

  return { nodes, edges };
}
