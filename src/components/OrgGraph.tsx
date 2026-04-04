"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import type { Task } from "@/lib/types";

interface OrgGraphProps {
  tasks: Task[];
  departments: string[];
}

// Layout: departments in a circle, tasks clustered around their department
function computeLayout(departments: string[], tasks: Task[]) {
  const centerX = 500;
  const centerY = 350;
  const deptRadius = 250;
  const taskRadius = 90;

  const deptPositions: Record<string, { x: number; y: number }> = {};
  const nodePositions: Record<string, { x: number; y: number; dept: string }> = {};

  // Place departments in a circle
  departments.forEach((dept, i) => {
    const angle = (i / departments.length) * Math.PI * 2 - Math.PI / 2;
    deptPositions[dept] = {
      x: centerX + Math.cos(angle) * deptRadius,
      y: centerY + Math.sin(angle) * deptRadius,
    };
  });

  // Place tasks around their department
  const tasksByDept: Record<string, Task[]> = {};
  tasks.forEach((t) => {
    if (!tasksByDept[t.department]) tasksByDept[t.department] = [];
    tasksByDept[t.department].push(t);
  });

  Object.entries(tasksByDept).forEach(([dept, deptTasks]) => {
    const deptPos = deptPositions[dept];
    if (!deptPos) return;
    deptTasks.forEach((task, i) => {
      const angle = (i / deptTasks.length) * Math.PI * 2 - Math.PI / 2;
      nodePositions[task.id] = {
        x: deptPos.x + Math.cos(angle) * taskRadius,
        y: deptPos.y + Math.sin(angle) * taskRadius,
        dept,
      };
    });
  });

  return { deptPositions, nodePositions };
}

// Colors per department
const DEPT_COLORS: Record<string, { fill: string; stroke: string; text: string; bg: string }> = {
  Marketing: { fill: "#dbeafe", stroke: "#3b82f6", text: "#1d4ed8", bg: "#eff6ff" },
  Sales: { fill: "#dcfce7", stroke: "#22c55e", text: "#15803d", bg: "#f0fdf4" },
  Operations: { fill: "#fef3c7", stroke: "#f59e0b", text: "#b45309", bg: "#fffbeb" },
  Engineering: { fill: "#e0e7ff", stroke: "#6366f1", text: "#4338ca", bg: "#eef2ff" },
  Product: { fill: "#fce7f3", stroke: "#ec4899", text: "#be185d", bg: "#fdf2f8" },
  Finance: { fill: "#f1f5f9", stroke: "#64748b", text: "#334155", bg: "#f8fafc" },
};

const DEFAULT_COLOR = { fill: "#f3f4f6", stroke: "#9ca3af", text: "#4b5563", bg: "#f9fafb" };

export default function OrgGraph({ tasks, departments }: OrgGraphProps) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.85);
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const { deptPositions, nodePositions } = computeLayout(departments, tasks);

  // Find cross-department edges (handoffs)
  const edges: { from: string; to: string; fromDept: string; toDept: string; label: string; bottleneck: boolean }[] = [];
  tasks.forEach((task) => {
    task.outputs.forEach((output) => {
      // Find a task in the target department
      const targetDept = output.fromOrTo;
      const targetTask = tasks.find((t) => t.department === targetDept && t.id !== task.id);
      if (targetTask && nodePositions[task.id] && nodePositions[targetTask.id]) {
        edges.push({
          from: task.id,
          to: targetTask.id,
          fromDept: task.department,
          toDept: targetDept,
          label: output.what.slice(0, 20),
          bottleneck: task.isBottleneck,
        });
      }
    });
  });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
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
    <div className="rounded-2xl border border-border bg-[#fafbfc] overflow-hidden relative" style={{ height: 600 }}>
      {/* Controls */}
      <div className="absolute top-3 left-3 z-10">
        <div className="flex items-center gap-2 flex-wrap">
          {departments.map((dept) => {
            const color = DEPT_COLORS[dept] || DEFAULT_COLOR;
            const count = tasks.filter((t) => t.department === dept).length;
            return (
              <span key={dept} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium" style={{ background: color.fill, color: color.text, border: `1px solid ${color.stroke}40` }}>
                <span className="w-2 h-2 rounded-full" style={{ background: color.stroke }} />
                {dept} ({count})
              </span>
            );
          })}
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 bg-background border border-border rounded-lg shadow-sm">
        <button onClick={() => setZoom((z) => Math.min(2, z + 0.15))} className="w-7 h-7 flex items-center justify-center text-muted hover:text-foreground text-[14px]">+</button>
        <span className="text-[11px] text-muted-light w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom((z) => Math.max(0.3, z - 0.15))} className="w-7 h-7 flex items-center justify-center text-muted hover:text-foreground text-[14px]">-</button>
        <div className="w-px h-4 bg-border" />
        <button onClick={() => { setPan({ x: 0, y: 0 }); setZoom(0.85); }} className="w-7 h-7 flex items-center justify-center text-muted hover:text-foreground">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
        </button>
      </div>

      <svg
        width="100%"
        height="100%"
        className={dragging ? "cursor-grabbing" : "cursor-grab"}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Grid */}
        <defs>
          <pattern id="grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.7" fill="#d1d5db" />
          </pattern>
          <marker id="arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#9ca3af" />
          </marker>
          <marker id="arrowhead-red" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
          </marker>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        <g transform={`translate(${pan.x * zoom}, ${pan.y * zoom}) scale(${zoom})`}>
          {/* Department halos */}
          {departments.map((dept) => {
            const pos = deptPositions[dept];
            if (!pos) return null;
            const color = DEPT_COLORS[dept] || DEFAULT_COLOR;
            return (
              <g key={`halo-${dept}`}>
                <circle cx={pos.x} cy={pos.y} r={120} fill={color.bg} stroke={color.stroke} strokeWidth={1} strokeDasharray="4 4" opacity={0.5} />
                <text x={pos.x} y={pos.y - 105} textAnchor="middle" fill={color.text} fontSize={11} fontWeight={700} letterSpacing={1}>
                  {dept.toUpperCase()}
                </text>
              </g>
            );
          })}

          {/* Edges */}
          {edges.map((edge, i) => {
            const from = nodePositions[edge.from];
            const to = nodePositions[edge.to];
            if (!from || !to) return null;

            const isHighlighted = hoveredTask === edge.from || hoveredTask === edge.to;
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            // Curve outward
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const cx = midX - dy * 0.15;
            const cy = midY + dx * 0.15;

            return (
              <g key={`edge-${i}`} opacity={hoveredTask && !isHighlighted ? 0.15 : 1}>
                <path
                  d={`M ${from.x} ${from.y} Q ${cx} ${cy}, ${to.x} ${to.y}`}
                  fill="none"
                  stroke={edge.bottleneck ? "#ef4444" : "#d1d5db"}
                  strokeWidth={isHighlighted ? 2.5 : 1.5}
                  strokeDasharray={edge.bottleneck ? "6 3" : "none"}
                  markerEnd={edge.bottleneck ? "url(#arrowhead-red)" : "url(#arrowhead)"}
                />
              </g>
            );
          })}

          {/* Task nodes */}
          {tasks.map((task) => {
            const pos = nodePositions[task.id];
            if (!pos) return null;
            const color = DEPT_COLORS[task.department] || DEFAULT_COLOR;
            const isHovered = hoveredTask === task.id;
            const isFaded = hoveredTask !== null && !isHovered;
            const nodeW = 140;
            const nodeH = 48;

            return (
              <g
                key={task.id}
                transform={`translate(${pos.x - nodeW / 2}, ${pos.y - nodeH / 2})`}
                onMouseEnter={() => setHoveredTask(task.id)}
                onMouseLeave={() => setHoveredTask(null)}
                opacity={isFaded ? 0.25 : 1}
                className="cursor-pointer"
              >
                <Link href={`/intelligence/${task.id}`}>
                  {/* Shadow */}
                  {isHovered && <rect x={1} y={1} width={nodeW} height={nodeH} rx={10} fill="rgba(0,0,0,0.06)" />}
                  {/* Card */}
                  <rect
                    width={nodeW}
                    height={nodeH}
                    rx={10}
                    fill="white"
                    stroke={isHovered ? color.stroke : task.isBottleneck ? "#ef4444" : "#e5e7eb"}
                    strokeWidth={isHovered ? 2 : task.isBottleneck ? 2 : 1}
                  />
                  {/* Bottleneck indicator */}
                  {task.isBottleneck && (
                    <circle cx={nodeW - 8} cy={8} r={4} fill="#ef4444" />
                  )}
                  {/* AI opportunity indicator */}
                  {task.recommendation && !task.isBottleneck && (
                    <circle cx={nodeW - 8} cy={8} r={4} fill={color.stroke} />
                  )}
                  {/* Title */}
                  <text x={12} y={20} fontSize={11} fontWeight={600} fill="#111">
                    {task.title.length > 18 ? task.title.slice(0, 18) + "..." : task.title}
                  </text>
                  {/* Meta */}
                  <text x={12} y={36} fontSize={9} fill="#9ca3af">
                    {task.frequency} · {task.timeSpent}
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
