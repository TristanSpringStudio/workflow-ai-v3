"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
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

interface DerivedDepartment {
  name: string;
  contributors: string[];
  taskCount: number;
  bottleneckCount: number;
  aiReadiness: number;
}

interface DerivedStats {
  totalTasks: number;
  recsCount: number;
  bottlenecks: number;
  avgReadiness: number;
  totalContributors: number;
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
  getDepartments: () => DerivedDepartment[];
  getStats: () => DerivedStats;
}

interface CompanyData extends CoreData {
  refresh: () => Promise<void>;
  updateCompany: (company: Company) => void;
  updateUser: (user: UserProfile) => void;
}

// Empty company/user placeholders used during the initial load. Components
// should check `loading` before rendering anything that depends on real data.
const emptyCompany: Company = {
  id: "",
  name: "",
  industry: "",
  size: "",
  createdAt: "",
};

const emptyStats: DerivedStats = {
  totalTasks: 0,
  recsCount: 0,
  bottlenecks: 0,
  avgReadiness: 0,
  totalContributors: 0,
};

const defaultCore: CoreData = {
  company: emptyCompany,
  user: null,
  contributors: [],
  tasks: [],
  interviews: [],
  roadmap: [],
  assessment: null,
  companyId: null,
  isRealData: false,
  loading: true,
  getDepartments: () => [],
  getStats: () => emptyStats,
};

const CompanyDataContext = createContext<CompanyData>({
  ...defaultCore,
  refresh: async () => {},
  updateCompany: () => {},
  updateUser: () => {},
});

/**
 * Compute the derived department list from contributors + tasks.
 * Dedupes case-insensitively and emits canonical title-cased names so the
 * sidebar never fragments "Marketing" vs "marketing".
 */
function computeDepartments(contributors: Contributor[], tasks: Task[]): DerivedDepartment[] {
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

function computeStats(contributors: Contributor[], tasks: Task[]): DerivedStats {
  if (tasks.length === 0 && contributors.length === 0) return emptyStats;
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

      // Map API response to the shape our components expect. No more mock
      // fallbacks — empty DB = empty arrays, and pages handle their own
      // empty states.
      const tasks = (json.workflows || []) as Task[];
      const contributors = (json.contributors || []) as Contributor[];
      const interviews = (json.interviews || []) as InterviewRecord[];

      // Link each interview to its contributor object for convenience.
      const interviewsWithPersons = interviews.map((iv) => {
        if (iv.person) return iv;
        const person = contributors.find((c) => c.id === iv.contributorId);
        return { ...iv, person };
      });

      setCore({
        company: (json.company as Company) || emptyCompany,
        user: (json.user as UserProfile | null) || null,
        contributors,
        tasks,
        interviews: interviewsWithPersons,
        roadmap: (json.roadmap || []) as RoadmapPhase[],
        assessment: json.assessment || null,
        companyId: json.companyId || null,
        isRealData: !!json.isRealData,
        loading: false,
        getDepartments: () => computeDepartments(contributors, tasks),
        getStats: () => computeStats(contributors, tasks),
      });
    } catch {
      // On error, leave the empty state in place and stop loading.
      // Pages will show their "no data yet" states.
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
