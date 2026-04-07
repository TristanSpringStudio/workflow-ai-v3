"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { ZoomIn, ZoomOut, Maximize2, Sparkles, DollarSign, Megaphone, TrendingUp, Wrench, FlaskConical, PackageSearch, Hand } from "lucide-react";
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

const NODE_W = 180;
const NODE_H = 70;
const DEPT_PADDING = 20;
const ROW_GAP = 30;
const COL_GAP = 24;

export default function WorkflowCanvas({ tasks }: WorkflowCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  // Group tasks by department
  const departments = [...new Set(tasks.map((t) => t.department))];
  const tasksByDept: Record<string, Task[]> = {};
  departments.forEach((d) => { tasksByDept[d] = tasks.filter((t) => t.department === d); });

  // Layout positions
  const positions: Record<string, { x: number; y: number }> = {};
  let currentY = 0;
  departments.forEach((dept) => {
    const deptTasks = tasksByDept[dept];
    deptTasks.forEach((task, i) => {
      positions[task.id] = {
        x: i * (NODE_W + COL_GAP),
        y: currentY + DEPT_PADDING,
      };
    });
    currentY += NODE_H + DEPT_PADDING * 2 + ROW_GAP;
  });

  // Connections
  const connections: { fromId: string; toId: string; bottleneck: boolean }[] = [];
  tasks.forEach((task) => {
    task.outputs.forEach((output) => {
      const targetTasks = tasks.filter((t) => t.department === output.fromOrTo && t.id !== task.id);
      if (targetTasks.length > 0 && positions[task.id] && positions[targetTasks[0].id]) {
        connections.push({ fromId: task.id, toId: targetTasks[0].id, bottleneck: task.isBottleneck });
      }
    });
    task.steps.forEach((step) => {
      step.sharedWith?.forEach((sw) => {
        if (positions[task.id] && positions[sw.taskId] && !connections.some((c) =>
          (c.fromId === task.id && c.toId === sw.taskId) || (c.fromId === sw.taskId && c.toId === task.id)
        )) {
          connections.push({ fromId: task.id, toId: sw.taskId, bottleneck: false });
        }
      });
    });
  });

  // Mouse handlers on the container div (not SVG)
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Don't drag if clicking a node link
    if ((e.target as HTMLElement).closest("a")) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...pan };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [pan]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan({
      x: panStart.current.x + dx / zoom,
      y: panStart.current.y + dy / zoom,
    });
  }, [isDragging, zoom]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.3, Math.min(2, z - e.deltaY * 0.001)));
  }, []);

  // Attach wheel listener with passive: false
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  return (
    <div
      ref={containerRef}
      className={`h-full w-full bg-[#fafbfc] relative overflow-hidden select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ touchAction: "none" }}
    >
      {/* Dot grid background — fixed, doesn't move */}
      <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, #d1d5db 0.7px, transparent 0.7px)", backgroundSize: "20px 20px" }} />

      {/* Transformed canvas content */}
      <div
        className="absolute"
        style={{
          transform: `translate(${pan.x * zoom}px, ${pan.y * zoom}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {/* Department row backgrounds */}
        {(() => {
          let rowY = 0;
          return departments.map((dept) => {
            const cfg = DEPT_CONFIG[dept] || DEFAULT_CFG;
            const deptTasks = tasksByDept[dept];
            const rowW = Math.max(deptTasks.length * (NODE_W + COL_GAP) + 40, 400);
            const rowH = NODE_H + DEPT_PADDING * 2;
            const y = rowY;
            rowY += rowH + ROW_GAP;
            return (
              <div
                key={`bg-${dept}`}
                className="absolute rounded-2xl"
                style={{
                  left: -10,
                  top: y,
                  width: rowW,
                  height: rowH,
                  background: cfg.light,
                  border: `1px solid ${cfg.bg}30`,
                }}
              >
                <span className="absolute top-2 left-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: `${cfg.bg}99` }}>
                  {dept}
                </span>
              </div>
            );
          });
        })()}

        {/* SVG for connections only */}
        <svg className="absolute top-0 left-0 pointer-events-none" width={2000} height={currentY + 200} style={{ overflow: "visible" }}>
          <defs>
            <marker id="wc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#c4c4c4" />
            </marker>
            <marker id="wc-arrow-red" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
            </marker>
          </defs>
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

            const dx = tx - fx;
            const dy = ty - fy;
            const cx = (fx + tx) / 2 - dy * 0.1;
            const cy = (fy + ty) / 2 + dx * 0.1;

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
                style={{ transition: "opacity 0.2s" }}
              />
            );
          })}
        </svg>

        {/* Task nodes as DOM elements */}
        {tasks.map((task) => {
          const pos = positions[task.id];
          if (!pos) return null;
          const cfg = DEPT_CONFIG[task.department] || DEFAULT_CFG;
          const isHovered = hoveredTask === task.id;
          const isFaded = hoveredTask !== null && !isHovered && !connections.some((c) =>
            (c.fromId === task.id || c.toId === task.id) && (c.fromId === hoveredTask || c.toId === hoveredTask)
          );

          return (
            <Link
              key={task.id}
              href={`/intelligence/${task.id}`}
              title={`${task.title}\n${task.department} · ${task.frequency} · ${task.timeSpent}`}
              className="absolute block cursor-pointer"
              style={{
                left: pos.x,
                top: pos.y,
                width: NODE_W,
                height: NODE_H,
                opacity: isFaded ? 0.2 : 1,
                transition: "opacity 0.2s, box-shadow 0.2s, border-color 0.2s",
              }}
              onMouseEnter={() => setHoveredTask(task.id)}
              onMouseLeave={() => setHoveredTask(null)}
            >
              <div
                className={`w-full h-full rounded-xl bg-white border-[1.5px] p-2.5 ${isHovered ? "shadow-md" : "shadow-sm"}`}
                style={{ borderColor: isHovered ? cfg.bg : task.isBottleneck ? "#ef4444" : "#e5e7eb" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
                    <cfg.Icon className="w-3 h-3 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-[11px] font-semibold truncate">{task.title}</span>
                  {task.isBottleneck && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
                  {task.recommendation && !task.isBottleneck && <span className="w-2 h-2 rounded-full bg-accent shrink-0" />}
                </div>
                <p className="text-[9px] text-muted-light ml-7">{task.frequency} · {task.timeSpent}</p>
                <p className="text-[8px] text-muted-light/60 ml-7 mt-0.5">{task.steps.length} steps · {task.outputs.length} outputs</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom toolbar: zoom + legend */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between">
        {/* Zoom controls */}
        <div className="flex items-center gap-1 bg-background border border-border rounded-lg shadow-sm">
          <button onClick={() => setZoom((z) => Math.min(2, z + 0.15))} className="w-8 h-8 flex items-center justify-center text-muted hover:text-foreground transition-colors">
            <ZoomIn className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <span className="text-[11px] text-muted-light w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.max(0.3, z - 0.15))} className="w-8 h-8 flex items-center justify-center text-muted hover:text-foreground transition-colors">
            <ZoomOut className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <div className="w-px h-4 bg-border" />
          <button onClick={() => { setPan({ x: 40, y: 40 }); setZoom(1); }} className="w-8 h-8 flex items-center justify-center text-muted hover:text-foreground transition-colors" title="Reset view">
            <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 bg-background border border-border rounded-lg shadow-sm px-3 py-1.5 text-[10px] text-muted-light">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent" /> AI opportunity</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Bottleneck</span>
          <span className="flex items-center gap-1.5"><span className="w-5 h-px bg-muted-light" /> Handoff</span>
          <span className="flex items-center gap-1.5 text-muted-light"><Hand className="w-3 h-3" strokeWidth={1.5} /> Drag to pan</span>
        </div>
      </div>
    </div>
  );
}
