"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  company as mockCompany,
  contributors as mockContributors,
  tasks as mockTasks,
  interviews as mockInterviews,
  roadmap as mockRoadmap,
  getDepartments as getMockDepartments,
  getStats as getMockStats,
} from "@/lib/mock-data";
import type { Company, Contributor, Task, RoadmapPhase, UserProfile } from "@/lib/types";
import { normalizeDepartment } from "@/lib/normalize-department";

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

interface CoreData {
  company: Company;
  user: UserProfile | null;
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

interface CompanyData extends CoreData {
  refresh: () => Promise<void>;
  updateCompany: (company: Company) => void;
  updateUser: (user: UserProfile) => void;
}

const defaultCore: CoreData = {
  company: mockCompany,
  user: null,
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

const CompanyDataContext = createContext<CompanyData>({
  ...defaultCore,
  refresh: async () => {},
  updateCompany: () => {},
  updateUser: () => {},
});

export function CompanyDataProvider({ children }: { children: ReactNode }) {
  const [core, setCore] = useState<CoreData>(defaultCore);

  const updateCompany = useCallback((company: Company) => {
    setCore((prev) => ({ ...prev, company }));
  }, []);

  const updateUser = useCallback((user: UserProfile) => {
    setCore((prev) => ({ ...prev, user }));
  }, []);

  const fetchData = useCallback(async () => {
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

      setCore({
        company: json.company || mockCompany,
        user: (json.user as UserProfile | null) || null,
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
            // Dedupe departments case-insensitively and always display in
            // Title Case, so "marketing" / "Marketing" collapse into a single
            // "Marketing" nav entry even if the DB still has stale rows.
            type DeptAccum = { name: string; contributors: string[]; taskCount: number; bottlenecks: number; aiScores: number[] };
            const deptMap = new Map<string, DeptAccum>();

            const deptKey = (raw: string) => raw.trim().toLowerCase();

            const ensureDept = (raw: string): DeptAccum => {
              const key = deptKey(raw);
              let d = deptMap.get(key);
              if (!d) {
                d = { name: normalizeDepartment(raw) || raw.trim(), contributors: [], taskCount: 0, bottlenecks: 0, aiScores: [] };
                deptMap.set(key, d);
              }
              return d;
            };

            for (const c of contributors) {
              const d = ensureDept(c.department || "Other");
              d.contributors.push(c.id);
              const score = c.aiComfort === "none" ? 10 : c.aiComfort === "beginner" ? 30 : c.aiComfort === "intermediate" ? 60 : 85;
              d.aiScores.push(score);
            }
            for (const t of tasks) {
              const d = ensureDept(t.department || "Other");
              d.taskCount++;
              if (t.isBottleneck) d.bottlenecks++;
            }
            return Array.from(deptMap.values()).map((d) => ({
              name: d.name,
              contributors: d.contributors,
              taskCount: d.taskCount,
              bottleneckCount: d.bottlenecks,
              aiReadiness: d.aiScores.length > 0 ? Math.round(d.aiScores.reduce((a, b) => a + b, 0) / d.aiScores.length) : 0,
            }));
          }
          return getMockDepartments().map((d) => ({
            ...d,
            contributors: d.contributors.map((c: unknown) => (typeof c === "string" ? c : (c as { id: string }).id)),
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
      setCore((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const value = useMemo<CompanyData>(
    () => ({ ...core, refresh: fetchData, updateCompany, updateUser }),
    [core, fetchData, updateCompany, updateUser]
  );

  return (
    <CompanyDataContext.Provider value={value}>
      {children}
    </CompanyDataContext.Provider>
  );
}

export function useCompanyData() {
  return useContext(CompanyDataContext);
}
