"use client";

import { useState, useRef, useCallback } from "react";

// ─── Types ───
export interface FlowNode {
  id: string;
  x: number;
  y: number;
  label: string;
  sublabel?: string;
  type: "trigger" | "step" | "decision" | "ai" | "human" | "output" | "department";
  badge?: string;
}

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
  bottleneck?: boolean;
}

interface FlowCanvasProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  width?: number;
  height?: number;
}

const NODE_COLORS: Record<FlowNode["type"], { bg: string; border: string; icon: string; text: string }> = {
  trigger: { bg: "#fffbeb", border: "#fcd34d", icon: "#d97706", text: "#92400e" },
  step: { bg: "#ffffff", border: "#e5e7eb", icon: "#6b7280", text: "#111111" },
  decision: { bg: "#fef3c7", border: "#f59e0b", icon: "#d97706", text: "#92400e" },
  ai: { bg: "#eff6ff", border: "#93c5fd", icon: "#2563eb", text: "#1e40af" },
  human: { bg: "#fefce8", border: "#fde68a", icon: "#ca8a04", text: "#854d0e" },
  output: { bg: "#f0fdf4", border: "#86efac", icon: "#16a34a", text: "#166534" },
  department: { bg: "#ffffff", border: "#e5e7eb", icon: "#6b7280", text: "#111111" },
};

const NODE_ICONS: Record<FlowNode["type"], string> = {
  trigger: "M13 10V3L4 14h7v7l9-11h-7z",
  step: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  decision: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  ai: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
  human: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  output: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  department: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
};

const NODE_W = 200;
const NODE_H = 72;

export default function FlowCanvas({ nodes, edges, width = 900, height = 600 }: FlowCanvasProps) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".flow-node")) return;
    setDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return;
      setPan((p) => ({
        x: p.x + (e.clientX - lastPos.current.x) / zoom,
        y: p.y + (e.clientY - lastPos.current.y) / zoom,
      }));
      lastPos.current = { x: e.clientX, y: e.clientY };
    },
    [dragging, zoom]
  );

  const handleMouseUp = useCallback(() => setDragging(false), []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.3, Math.min(2, z - e.deltaY * 0.001)));
  }, []);

  // Build edge paths
  const getEdgePath = (fromNode: FlowNode, toNode: FlowNode) => {
    const fx = fromNode.x + NODE_W / 2;
    const fy = fromNode.y + NODE_H;
    const tx = toNode.x + NODE_W / 2;
    const ty = toNode.y;

    // Vertical or angled connection
    const midY = (fy + ty) / 2;
    return `M ${fx} ${fy} C ${fx} ${midY}, ${tx} ${midY}, ${tx} ${ty}`;
  };

  return (
    <div className="rounded-2xl border border-border bg-[#fafbfc] overflow-hidden relative" style={{ height }}>
      {/* Zoom controls */}
      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 bg-background border border-border rounded-lg shadow-sm">
        <button onClick={() => setZoom((z) => Math.min(2, z + 0.15))} className="w-7 h-7 flex items-center justify-center text-muted hover:text-foreground text-[14px]">+</button>
        <span className="text-[11px] text-muted-light w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom((z) => Math.max(0.3, z - 0.15))} className="w-7 h-7 flex items-center justify-center text-muted hover:text-foreground text-[14px]">-</button>
        <div className="w-px h-4 bg-border" />
        <button onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); }} className="w-7 h-7 flex items-center justify-center text-muted hover:text-foreground">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
        </button>
      </div>

      {/* Dot grid background */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className={`${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Grid pattern */}
        <defs>
          <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.8" fill="#d1d5db" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />

        {/* Transformed group */}
        <g transform={`translate(${pan.x * zoom}, ${pan.y * zoom}) scale(${zoom})`}>
          {/* Edges */}
          {edges.map((edge, i) => {
            const fromNode = nodes.find((n) => n.id === edge.from);
            const toNode = nodes.find((n) => n.id === edge.to);
            if (!fromNode || !toNode) return null;

            const path = getEdgePath(fromNode, toNode);

            return (
              <g key={i}>
                <path
                  d={path}
                  fill="none"
                  stroke={edge.bottleneck ? "#ef4444" : "#d1d5db"}
                  strokeWidth={edge.bottleneck ? 2 : 1.5}
                  strokeDasharray={edge.bottleneck ? "6 3" : "none"}
                  markerEnd={`url(#arrow${edge.bottleneck ? "-red" : ""})`}
                />
                {edge.label && (() => {
                  const mx = (fromNode.x + toNode.x) / 2 + NODE_W / 2;
                  const my = (fromNode.y + NODE_H + toNode.y) / 2;
                  return (
                    <g>
                      <rect x={mx - 40} y={my - 10} width={80} height={20} rx={6} fill="white" stroke={edge.bottleneck ? "#fca5a5" : "#e5e7eb"} strokeWidth={1} />
                      <text x={mx} y={my + 4} textAnchor="middle" className="text-[10px]" fill={edge.bottleneck ? "#dc2626" : "#6b7280"}>
                        {edge.label}
                      </text>
                    </g>
                  );
                })()}
              </g>
            );
          })}

          {/* Arrow markers */}
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#d1d5db" />
            </marker>
            <marker id="arrow-red" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
            </marker>
          </defs>

          {/* Nodes */}
          {nodes.map((node) => {
            const colors = NODE_COLORS[node.type];
            const icon = NODE_ICONS[node.type];
            return (
              <g key={node.id} className="flow-node" transform={`translate(${node.x}, ${node.y})`}>
                {/* Shadow */}
                <rect x={2} y={2} width={NODE_W} height={NODE_H} rx={12} fill="rgba(0,0,0,0.04)" />
                {/* Card */}
                <rect width={NODE_W} height={NODE_H} rx={12} fill={colors.bg} stroke={colors.border} strokeWidth={1.5} />
                {/* Icon */}
                <g transform="translate(14, 16)">
                  <rect x={-4} y={-4} width={28} height={28} rx={6} fill={colors.bg} stroke={colors.border} strokeWidth={1} />
                  <svg x={2} y={2} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.icon} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d={icon} />
                  </svg>
                </g>
                {/* Label */}
                <text x={52} y={28} className="text-[12px] font-semibold" fill={colors.text}>
                  {node.label}
                </text>
                {/* Badge */}
                {node.badge && (
                  <g transform={`translate(${52 + node.label.length * 6.5 + 8}, 18)`}>
                    <rect width={node.badge.length * 6 + 12} height={18} rx={9} fill={colors.border} opacity={0.3} />
                    <text x={6} y={13} className="text-[9px] font-medium" fill={colors.icon}>{node.badge}</text>
                  </g>
                )}
                {/* Sublabel */}
                {node.sublabel && (
                  <text x={52} y={48} className="text-[10px]" fill="#9ca3af">
                    {node.sublabel.length > 25 ? node.sublabel.slice(0, 25) + "..." : node.sublabel}
                  </text>
                )}
                {/* Connection dot bottom */}
                <circle cx={NODE_W / 2} cy={NODE_H} r={4} fill="white" stroke={colors.border} strokeWidth={1.5} />
                {/* Connection dot top */}
                <circle cx={NODE_W / 2} cy={0} r={4} fill="white" stroke={colors.border} strokeWidth={1.5} />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
