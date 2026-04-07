"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ZoomIn, ZoomOut, Maximize2, Sparkles, DollarSign, Megaphone, TrendingUp, Wrench, FlaskConical, PackageSearch } from "lucide-react";
import type { Task } from "@/lib/types";

const DEPT_CONFIG: Record<string, { bg: string; light: string; Icon: typeof DollarSign }> = {
  Sales: { bg: "#22c55e", light: "#f0fdf4", Icon: DollarSign },
  Marketing: { bg: "#a855f7", light: "#faf5ff", Icon: Megaphone },
  Finance: { bg: "#3b52ce", light: "#eff6ff", Icon: TrendingUp },
  Operations: { bg: "#f59e0b", light: "#fffbeb", Icon: Wrench },
  Engineering: { bg: "#6366f1", light: "#eef2ff", Icon: FlaskConical },
  Product: { bg: "#ec4899", light: "#fdf2f8", Icon: PackageSearch },
};

const DEFAULT_CFG = { bg: "#6b7280", light: "#f9fafb", Icon: Wrench };

interface WorkflowCanvasProps {
  tasks: Task[];
}

export default function WorkflowCanvas({ tasks }: WorkflowCanvasProps) {
  const [pan, setPan] = useState({ x: 20, y: 20 });
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const lastPos = useRef({ x: 0, y: 0 });

  // Group tasks by department
  const departments = [...new Set(tasks.map((t) => t.department))];
  const tasksByDept: Record<string, Task[]> = {};
  departments.forEach((d) => { tasksByDept[d] = tasks.filter((t) => t.department === d); });

  // Layout: departments as horizontal rows, tasks spread horizontally within each
  const NODE_W = 180;
  const NODE_H = 70;
  const DEPT_PADDING = 20;
  const ROW_GAP = 30;
  const COL_GAP = 24;
  const LABEL_W = 0;

  const positions: Record<string, { x: number; y: number }> = {};
  let currentY = 0;

  departments.forEach((dept) => {
    const deptTasks = tasksByDept[dept];
    deptTasks.forEach((task, i) => {
      positions[task.id] = {
        x: LABEL_W + i * (NODE_W + COL_GAP),
        y: currentY + DEPT_PADDING,
      };
    });
    currentY += NODE_H + DEPT_PADDING * 2 + ROW_GAP;
  });

  // Find connections between tasks (cross-department handoffs via outputs/inputs)
  const connections: { fromId: string; toId: string; bottleneck: boolean }[] = [];
  tasks.forEach((task) => {
    task.outputs.forEach((output) => {
      const targetDept = output.fromOrTo;
      const targetTasks = tasks.filter((t) => t.department === targetDept && t.id !== task.id);
      if (targetTasks.length > 0 && positions[task.id] && positions[targetTasks[0].id]) {
        connections.push({ fromId: task.id, toId: targetTasks[0].id, bottleneck: task.isBottleneck });
      }
    });
    // Shared step connections
    task.steps.forEach((step) => {
      step.sharedWith?.forEach((sw) => {
        if (positions[task.id] && positions[sw.taskId] && !connections.some((c) => (c.fromId === task.id && c.toId === sw.taskId) || (c.fromId === sw.taskId && c.toId === task.id))) {
          connections.push({ fromId: task.id, toId: sw.taskId, bottleneck: false });
        }
      });
    });
  });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".canvas-node")) return;
    setDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setPan((p) => ({
      x: p.x + (e.clientX - lastPos.current.x) / zoom,
      y: p.y + (e.clientY - lastPos.current.y) / zoom,
    }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, [dragging, zoom]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.3, Math.min(2, z - e.deltaY * 0.001)));
  }, []);

  return (
    <div className="h-full w-full bg-[#fafbfc] relative overflow-hidden">
      {/* Zoom controls */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1 bg-background border border-border rounded-lg shadow-sm">
        <button onClick={() => setZoom((z) => Math.min(2, z + 0.15))} className="w-8 h-8 flex items-center justify-center text-muted hover:text-foreground transition-colors">
          <ZoomIn className="w-4 h-4" strokeWidth={1.5} />
        </button>
        <span className="text-[11px] text-muted-light w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom((z) => Math.max(0.3, z - 0.15))} className="w-8 h-8 flex items-center justify-center text-muted hover:text-foreground transition-colors">
          <ZoomOut className="w-4 h-4" strokeWidth={1.5} />
        </button>
        <div className="w-px h-4 bg-border" />
        <button onClick={() => { setPan({ x: 20, y: 20 }); setZoom(1); }} className="w-8 h-8 flex items-center justify-center text-muted hover:text-foreground transition-colors">
          <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3 text-[10px] text-muted-light">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent" /> AI opportunity</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Bottleneck</span>
        <span className="flex items-center gap-1.5"><span className="w-6 h-px bg-muted-light" /> Handoff</span>
        <span className="flex items-center gap-1.5"><span className="w-6 h-px bg-muted-light" style={{ borderTop: "1.5px dashed #ef4444" }} /> Bottleneck flow</span>
      </div>

      <svg
        width="100%"
        height="100%"
        className={`select-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ touchAction: "none" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Dot grid */}
        <defs>
          <pattern id="wc-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.7" fill="#d1d5db" />
          </pattern>
          <marker id="wc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#c4c4c4" />
          </marker>
          <marker id="wc-arrow-red" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
          </marker>
        </defs>
        <rect width="100%" height="100%" fill="url(#wc-dots)" />

        <g transform={`translate(${pan.x * zoom}, ${pan.y * zoom}) scale(${zoom})`}>
          {/* Department row backgrounds */}
          {(() => {
            let rowY = 0;
            return departments.map((dept) => {
              const cfg = DEPT_CONFIG[dept] || DEFAULT_CFG;
              const deptTasks = tasksByDept[dept];
              const rowW = deptTasks.length * (NODE_W + COL_GAP) + LABEL_W + 40;
              const rowH = NODE_H + DEPT_PADDING * 2;
              const y = rowY;
              rowY += rowH + ROW_GAP;
              return (
                <g key={`bg-${dept}`}>
                  <rect x={-10} y={y} width={rowW} height={rowH} rx={16} fill={cfg.light} stroke={cfg.bg} strokeWidth={0.5} strokeOpacity={0.3} />
                  <text x={6} y={y + 14} fontSize={10} fontWeight={600} fill={cfg.bg} opacity={0.7} letterSpacing={0.5}>
                    {dept.toUpperCase()}
                  </text>
                </g>
              );
            });
          })()}

          {/* Connections */}
          {connections.map((conn, i) => {
            const from = positions[conn.fromId];
            const to = positions[conn.toId];
            if (!from || !to) return null;

            const fx = from.x + NODE_W / 2;
            const fy = from.y + NODE_H / 2;
            const tx = to.x + NODE_W / 2;
            const ty = to.y + NODE_H / 2;

            const isHighlighted = hoveredTask === conn.fromId || hoveredTask === conn.toId;
            const isFaded = hoveredTask && !isHighlighted;

            // Bezier curve
            const midX = (fx + tx) / 2;
            const midY = (fy + ty) / 2;
            const dx = tx - fx;
            const dy = ty - fy;
            const cx = midX - dy * 0.1;
            const cy = midY + dx * 0.1;

            return (
              <path
                key={`conn-${i}`}
                d={`M ${fx} ${fy} Q ${cx} ${cy}, ${tx} ${ty}`}
                fill="none"
                stroke={conn.bottleneck ? "#ef4444" : "#d1d5db"}
                strokeWidth={isHighlighted ? 2.5 : 1.5}
                strokeDasharray={conn.bottleneck ? "6 3" : "none"}
                opacity={isFaded ? 0.1 : 1}
                markerEnd={conn.bottleneck ? "url(#wc-arrow-red)" : "url(#wc-arrow)"}
              />
            );
          })}

          {/* Task nodes */}
          {tasks.map((task) => {
            const pos = positions[task.id];
            if (!pos) return null;
            const cfg = DEPT_CONFIG[task.department] || DEFAULT_CFG;
            const isHovered = hoveredTask === task.id;
            const isFaded = hoveredTask !== null && !isHovered && !connections.some((c) => (c.fromId === task.id || c.toId === task.id) && (c.fromId === hoveredTask || c.toId === hoveredTask));

            return (
              <g
                key={task.id}
                className="canvas-node"
                transform={`translate(${pos.x}, ${pos.y})`}
                onMouseEnter={() => setHoveredTask(task.id)}
                onMouseLeave={() => setHoveredTask(null)}
                opacity={isFaded ? 0.2 : 1}
                style={{ transition: "opacity 0.2s ease" }}
              >
                <Link href={`/intelligence/${task.id}`}>
                  {/* Shadow on hover */}
                  {isHovered && <rect x={2} y={2} width={NODE_W} height={NODE_H} rx={12} fill="rgba(0,0,0,0.06)" />}
                  {/* Card */}
                  <rect
                    width={NODE_W}
                    height={NODE_H}
                    rx={12}
                    fill="white"
                    stroke={isHovered ? cfg.bg : task.isBottleneck ? "#ef4444" : "#e5e7eb"}
                    strokeWidth={isHovered ? 2 : task.isBottleneck ? 1.5 : 1}
                  />
                  {/* Department icon */}
                  <g transform="translate(10, 12)">
                    <rect width={20} height={20} rx={5} fill={cfg.bg} />
                    {/* Using a simple circle as icon placeholder in SVG */}
                    <circle cx={10} cy={10} r={4} fill="white" opacity={0.8} />
                  </g>
                  {/* Title */}
                  <text x={38} y={24} fontSize={11} fontWeight={600} fill="#111">
                    {task.title.length > 16 ? task.title.slice(0, 16) + "…" : task.title}
                  </text>
                  {/* Meta */}
                  <text x={38} y={40} fontSize={9} fill="#9ca3af">
                    {task.frequency} · {task.timeSpent}
                  </text>
                  {/* Indicators */}
                  {task.isBottleneck && <circle cx={NODE_W - 12} cy={12} r={4} fill="#ef4444" />}
                  {task.recommendation && !task.isBottleneck && <circle cx={NODE_W - 12} cy={12} r={4} fill="#2563eb" />}
                  {/* Steps count */}
                  <text x={38} y={56} fontSize={8} fill="#c4c4c4">
                    {task.steps.length} steps · {task.outputs.length} outputs
                  </text>
                </Link>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
