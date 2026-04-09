"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  company as mockCompany,
  contributors as mockContributors,
  tasks as mockTasks,
  interviews as mockInterviews,
  roadmap as mockRoadmap,
  getDepartments as getMockDepartments,
  getStats as getMockStats,
} from "@/lib/mock-data";
import type { Company, Contributor, Task, RoadmapPhase } from "@/lib/types";

interface InterviewRecord {
  id: string;
  contributorId: string;
  status: "completed" | "in-progress" | "invited";
  duration?: string;
  completedAt?: string;
  invitedAt?: string;
  workflowsExtracted: number;
  transcript?: { role: string; content: string }[];
  person?: Contributor;
}

interface CompanyData {
  company: Company;
  contributors: Contributor[];
  tasks: Task[];
  interviews: InterviewRecord[];
  roadmap: RoadmapPhase[];
  assessment: {
    overallScore: number;
    summary: string;
    strengths: string[];
    improvements: string[];
    quickWins: string[];
    estimatedImpact: string;
  } | null;
  companyId: string | null;
  isRealData: boolean;
  loading: boolean;
  getDepartments: () => { name: string; contributors: string[]; taskCount: number; bottleneckCount: number; aiReadiness: number }[];
  getStats: () => ReturnType<typeof getMockStats>;
}

const defaultData: CompanyData = {
  company: mockCompany,
  contributors: mockContributors,
  tasks: mockTasks,
  interviews: mockInterviews as unknown as InterviewRecord[],
  roadmap: mockRoadmap,
  assessment: null,
  companyId: null,
  isRealData: false,
  loading: true,
  getDepartments: () => getMockDepartments().map((d) => ({ ...d, contributors: d.contributors.map((c) => c.id || (c as unknown as string)) })) as { name: string; contributors: string[]; taskCount: number; bottleneckCount: number; aiReadiness: number }[],
  getStats: getMockStats,
};

const CompanyDataContext = createContext<CompanyData>(defaultData);

export function CompanyDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CompanyData>(defaultData);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/company-data");
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();

        // Map API response to the shape our components expect
        const tasks = (json.workflows || []) as Task[];
        const contributors = (json.contributors || []) as Contributor[];
        const interviews = (json.interviews || []) as InterviewRecord[];

        // Link interview persons
        const interviewsWithPersons = interviews.map((iv) => {
          if (iv.person) return iv;
          const person = contributors.find((c) => c.id === iv.contributorId);
          return { ...iv, person };
        });

        setData({
          company: json.company || mockCompany,
          contributors: contributors.length > 0 ? contributors : mockContributors,
          tasks: tasks.length > 0 ? tasks : mockTasks,
          interviews: interviewsWithPersons.length > 0 ? interviewsWithPersons : (mockInterviews as unknown as InterviewRecord[]),
          roadmap: json.roadmap?.length > 0 ? json.roadmap : mockRoadmap,
          assessment: json.assessment || null,
          companyId: json.companyId,
          isRealData: json.isRealData || false,
          loading: false,
          getDepartments: () => {
            if (contributors.length > 0 && tasks.length > 0) {
              // Build departments from real data
              const deptMap = new Map<string, { contributors: string[]; taskCount: number; bottlenecks: number; aiScores: number[] }>();
              for (const c of contributors) {
                const dept = c.department || "Other";
                if (!deptMap.has(dept)) deptMap.set(dept, { contributors: [], taskCount: 0, bottlenecks: 0, aiScores: [] });
                const d = deptMap.get(dept)!;
                d.contributors.push(c.id);
                const score = c.aiComfort === "none" ? 10 : c.aiComfort === "beginner" ? 30 : c.aiComfort === "intermediate" ? 60 : 85;
                d.aiScores.push(score);
              }
              for (const t of tasks) {
                const dept = t.department || "Other";
                if (!deptMap.has(dept)) deptMap.set(dept, { contributors: [], taskCount: 0, bottlenecks: 0, aiScores: [] });
                const d = deptMap.get(dept)!;
                d.taskCount++;
                if (t.isBottleneck) d.bottlenecks++;
              }
              return Array.from(deptMap.entries()).map(([name, d]) => ({
                name,
                contributors: d.contributors,
                taskCount: d.taskCount,
                bottleneckCount: d.bottlenecks,
                aiReadiness: d.aiScores.length > 0 ? Math.round(d.aiScores.reduce((a, b) => a + b, 0) / d.aiScores.length) : 0,
              }));
            }
            return getMockDepartments().map((d) => ({
              ...d,
              contributors: d.contributors.map((c: any) => typeof c === "string" ? c : c.id),
            }));
          },
          getStats: () => {
            if (tasks.length > 0) {
              return {
                totalTasks: tasks.length,
                recsCount: tasks.filter((t) => t.recommendation).length,
                bottlenecks: tasks.filter((t) => t.isBottleneck).length,
                avgReadiness: contributors.length > 0
                  ? Math.round(contributors.reduce((sum, c) => {
                      const score = c.aiComfort === "none" ? 10 : c.aiComfort === "beginner" ? 30 : c.aiComfort === "intermediate" ? 60 : 85;
                      return sum + score;
                    }, 0) / contributors.length)
                  : 0,
                totalContributors: contributors.length,
              };
            }
            return getMockStats();
          },
        });
      } catch {
        // On error, keep mock data but stop loading
        setData((prev) => ({ ...prev, loading: false }));
      }
    }

    fetchData();
  }, []);

  return (
    <CompanyDataContext.Provider value={data}>
      {children}
    </CompanyDataContext.Provider>
  );
}

export function useCompanyData() {
  return useContext(CompanyDataContext);
}
