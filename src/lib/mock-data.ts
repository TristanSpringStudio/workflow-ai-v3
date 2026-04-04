import type { Company, Contributor, Task, Department, RoadmapPhase } from "./types";

// ─── Company ───
export const company: Company = {
  id: "company-1",
  name: "Acme Technologies",
  industry: "B2B SaaS",
  size: "51-200",
  createdAt: "2026-03-14T00:00:00Z",
};

// ─── Contributors ───
export const contributors: Contributor[] = [
  { id: "c1", name: "Sarah Chen", role: "Marketing Manager", department: "Marketing", aiComfort: "intermediate", interviewedAt: "2026-03-15T10:00:00Z" },
  { id: "c2", name: "Marcus Rivera", role: "Sales Director", department: "Sales", aiComfort: "beginner", interviewedAt: "2026-03-16T14:00:00Z" },
  { id: "c3", name: "Priya Patel", role: "Operations Manager", department: "Operations", aiComfort: "beginner", interviewedAt: "2026-03-17T09:00:00Z" },
  { id: "c4", name: "James Park", role: "Engineering Lead", department: "Engineering", aiComfort: "advanced", interviewedAt: "2026-03-18T11:00:00Z" },
  { id: "c5", name: "Lisa Nakamura", role: "Product Manager", department: "Product", aiComfort: "intermediate", interviewedAt: "2026-03-19T13:00:00Z" },
  { id: "c6", name: "David Kim", role: "Finance Manager", department: "Finance", aiComfort: "beginner", interviewedAt: "2026-03-20T10:00:00Z" },
];

// ─── Tasks: the intelligence layer ───
export const tasks: Task[] = [
  {
    id: "t1",
    title: "Weekly Performance Report",
    description: "Compile marketing metrics from GA, HubSpot, and Sheets into a formatted report for leadership every Friday.",
    department: "Marketing",
    contributors: ["c1"],
    frequency: "Weekly",
    timeSpent: "3 hours",
    tools: ["Google Analytics", "HubSpot", "Google Sheets", "Google Docs"],
    inputs: [
      { what: "Traffic and conversion data", fromOrTo: "Google Analytics", method: "Manual export" },
      { what: "Lead and campaign metrics", fromOrTo: "HubSpot", method: "Manual export" },
      { what: "Budget spend data", fromOrTo: "Finance", method: "Google Sheets" },
    ],
    steps: [
      { order: 1, title: "Export data from GA", description: "Pull weekly traffic, conversion, and source data", actor: "human", tool: "Google Analytics" },
      { order: 2, title: "Export data from HubSpot", description: "Pull lead gen, email, and campaign metrics", actor: "human", tool: "HubSpot" },
      { order: 3, title: "Compile in Sheets", description: "Copy data into master spreadsheet, calculate WoW changes", actor: "human", tool: "Google Sheets" },
      { order: 4, title: "Write narrative summary", description: "Draft insights, trends, and recommendations", actor: "human", tool: "Google Docs" },
      { order: 5, title: "Send to leadership", description: "Email report with key highlights", actor: "human", tool: "Gmail" },
    ],
    outputs: [
      { what: "Formatted performance report", fromOrTo: "Leadership", method: "Email" },
      { what: "Key metrics summary", fromOrTo: "Sales", method: "Slack" },
    ],
    painPoints: ["Takes 3 hours every Friday", "Manual copy-paste between 3 tools", "Format is always the same"],
    isBottleneck: false,
    recommendation: {
      summary: "Automate data compilation with AI. Human reviews insights and adds context instead of building from scratch.",
      impact: { timeSaved: "2.5 hrs/week", costSaved: "$6,500/year", qualityGain: "Catches anomalies humans miss, more consistent" },
      priority: "critical",
      difficulty: "easy",
      newSteps: [
        { order: 1, title: "Auto-pull data", description: "AI connects to GA, HubSpot, and Sheets to gather metrics", actor: "ai" },
        { order: 2, title: "Generate draft report", description: "AI formats data with trends, WoW changes, and anomaly flags", actor: "ai" },
        { order: 3, title: "Review and add context", description: "Marketing manager reviews, adds strategic commentary", actor: "human" },
        { order: 4, title: "Distribute", description: "Auto-send to leadership and Slack", actor: "ai" },
      ],
      aiHandles: ["Data compilation from 3 sources", "WoW calculations", "Anomaly detection", "Formatting and distribution"],
      humanDecides: ["Strategic interpretation", "What to escalate", "Business context", "Final approval"],
      phase: 1,
    },
    tags: ["reporting", "data", "leadership"],
    lastUpdated: "2026-03-15T10:00:00Z",
    addedBy: "c1",
  },
  {
    id: "t2",
    title: "Prospect Outreach Emails",
    description: "Research prospects and write personalized cold outreach emails to generate meetings.",
    department: "Sales",
    contributors: ["c2"],
    frequency: "Daily",
    timeSpent: "2 hours/day",
    tools: ["Salesforce", "Gmail", "LinkedIn"],
    inputs: [
      { what: "Target account list", fromOrTo: "Marketing", method: "HubSpot" },
      { what: "Product positioning", fromOrTo: "Product", method: "Google Docs" },
    ],
    steps: [
      { order: 1, title: "Review prospect list", description: "Check CRM for new leads and target accounts", actor: "human", tool: "Salesforce" },
      { order: 2, title: "Research each prospect", description: "Check LinkedIn, company news, recent activity", actor: "human", tool: "LinkedIn" },
      { order: 3, title: "Write personalized email", description: "Draft email referencing specific context for each prospect", actor: "human", tool: "Gmail" },
      { order: 4, title: "Log in CRM", description: "Record outreach activity in Salesforce", actor: "human", tool: "Salesforce" },
    ],
    outputs: [
      { what: "Personalized outreach emails", fromOrTo: "Prospects", method: "Email" },
      { what: "Pipeline activity", fromOrTo: "Sales leadership", method: "Salesforce" },
    ],
    painPoints: ["20 min per email for real personalization", "Manual CRM logging", "Inconsistent quality across reps"],
    isBottleneck: false,
    recommendation: {
      summary: "AI researches prospects and drafts personalized emails. Rep reviews for accuracy and relationship context.",
      impact: { timeSaved: "1.5 hrs/day", costSaved: "$20,800/year", qualityGain: "5-10x reply rate improvement" },
      priority: "critical",
      difficulty: "easy",
      newSteps: [
        { order: 1, title: "AI gathers context", description: "Pulls prospect data from LinkedIn, CRM, company signals", actor: "ai" },
        { order: 2, title: "Generate draft email", description: "AI writes personalized email with proven frameworks", actor: "ai" },
        { order: 3, title: "Rep reviews and sends", description: "Quick review for accuracy, tone, and relationship fit", actor: "human" },
        { order: 4, title: "Auto-log activity", description: "AI records outreach in Salesforce", actor: "ai" },
      ],
      aiHandles: ["Prospect research", "Email drafting", "CRM logging", "Follow-up scheduling"],
      humanDecides: ["Relationship judgment", "Personalization authenticity", "Deal strategy", "Timing"],
      phase: 1,
    },
    tags: ["outreach", "email", "sales"],
    lastUpdated: "2026-03-16T14:00:00Z",
    addedBy: "c2",
  },
  {
    id: "t3",
    title: "New Client Onboarding",
    description: "Set up new clients after a deal closes — create accounts, assign team, kick off implementation.",
    department: "Operations",
    contributors: ["c3", "c2"],
    frequency: "Per deal",
    timeSpent: "4 hours/client",
    tools: ["Salesforce", "Notion", "Jira", "Slack"],
    inputs: [
      { what: "Signed contract and client details", fromOrTo: "Sales", method: "Email + Salesforce" },
      { what: "Technical requirements", fromOrTo: "Sales", method: "Meeting notes" },
    ],
    steps: [
      { order: 1, title: "Receive deal info from Sales", description: "Get contract, client details, and requirements", actor: "human" },
      { order: 2, title: "Create onboarding checklist", description: "Build Notion doc with all setup tasks", actor: "human", tool: "Notion" },
      { order: 3, title: "Create Jira tickets", description: "Set up implementation tickets for Engineering", actor: "human", tool: "Jira" },
      { order: 4, title: "Schedule kickoff call", description: "Coordinate with client and internal team", actor: "human", tool: "Slack" },
      { order: 5, title: "Assign team members", description: "Allocate resources based on requirements", actor: "human" },
    ],
    outputs: [
      { what: "Setup tickets", fromOrTo: "Engineering", method: "Jira" },
      { what: "Client timeline", fromOrTo: "Client", method: "Email" },
      { what: "Health status", fromOrTo: "Sales", method: "Slack" },
    ],
    painPoints: ["Manual data transfer from Salesforce", "Takes 2 weeks to fully onboard", "Things get missed without a checklist"],
    isBottleneck: true,
    recommendation: {
      summary: "Auto-generate onboarding packages from deal data. AI creates checklist, tickets, and timeline from CRM.",
      impact: { timeSaved: "3 hrs/client", costSaved: "$15,600/year", qualityGain: "Onboarding from 2 weeks to 3 days" },
      priority: "high",
      difficulty: "moderate",
      newSteps: [
        { order: 1, title: "Auto-extract deal data", description: "AI pulls contract terms, requirements from Salesforce", actor: "ai" },
        { order: 2, title: "Generate onboarding package", description: "AI creates checklist, Jira tickets, and timeline", actor: "ai" },
        { order: 3, title: "Ops reviews and customizes", description: "Check for non-standard requirements, assign team", actor: "human" },
        { order: 4, title: "Auto-notify stakeholders", description: "AI sends kickoff info to client and internal team", actor: "ai" },
      ],
      aiHandles: ["Data extraction from CRM", "Checklist and ticket generation", "Timeline estimation", "Notifications"],
      humanDecides: ["Custom requirements", "Resource allocation", "Client relationship", "Escalation handling"],
      phase: 2,
    },
    tags: ["onboarding", "client", "cross-team"],
    lastUpdated: "2026-03-17T09:00:00Z",
    addedBy: "c3",
  },
  {
    id: "t4",
    title: "Sprint Planning & PRD Writing",
    description: "Write product requirement documents and break features into engineering tickets each sprint.",
    department: "Product",
    contributors: ["c5", "c4"],
    frequency: "Bi-weekly",
    timeSpent: "8 hours/sprint",
    tools: ["Notion", "Linear", "Figma", "Slack"],
    inputs: [
      { what: "User research and feedback", fromOrTo: "Support + Sales", method: "Notion" },
      { what: "Technical feasibility", fromOrTo: "Engineering", method: "Slack + meetings" },
      { what: "Design mockups", fromOrTo: "Design", method: "Figma" },
    ],
    steps: [
      { order: 1, title: "Synthesize user research", description: "Review feedback from support, sales, and interviews", actor: "human" },
      { order: 2, title: "Write PRD", description: "Create full product requirement document in Notion", actor: "human", tool: "Notion" },
      { order: 3, title: "Review with Engineering", description: "Align on feasibility, scope, and trade-offs", actor: "human" },
      { order: 4, title: "Create Linear tickets", description: "Break PRD into implementation tickets with acceptance criteria", actor: "human", tool: "Linear" },
      { order: 5, title: "Kickoff sprint", description: "Present to team, answer questions, clarify scope", actor: "human" },
    ],
    outputs: [
      { what: "PRD and specifications", fromOrTo: "Engineering", method: "Notion + Linear" },
      { what: "Feature announcements", fromOrTo: "Marketing", method: "Notion" },
      { what: "Roadmap updates", fromOrTo: "Sales", method: "Google Docs" },
    ],
    painPoints: ["PRDs take a full day to write", "Synthesizing feedback from 4 channels", "Manually creating Linear tickets from PRD"],
    isBottleneck: false,
    recommendation: {
      summary: "AI drafts PRDs from research notes and auto-generates Linear tickets. PM focuses on strategy and scope decisions.",
      impact: { timeSaved: "5 hrs/sprint", costSaved: "$18,000/year", qualityGain: "More consistent PRDs, fewer gaps" },
      priority: "high",
      difficulty: "easy",
      newSteps: [
        { order: 1, title: "AI synthesizes research", description: "Aggregates feedback from all channels into structured insights", actor: "ai" },
        { order: 2, title: "AI generates PRD draft", description: "Creates structured doc with user stories and acceptance criteria", actor: "ai" },
        { order: 3, title: "PM refines and scopes", description: "Strategic decisions, scope trade-offs, stakeholder alignment", actor: "human" },
        { order: 4, title: "Auto-create tickets", description: "AI generates Linear tickets from approved PRD", actor: "ai" },
      ],
      aiHandles: ["Research synthesis", "PRD structure and drafting", "Ticket generation", "Acceptance criteria writing"],
      humanDecides: ["Feature prioritization", "Scope decisions", "Strategic alignment", "Stakeholder negotiation"],
      phase: 1,
    },
    tags: ["product", "engineering", "planning"],
    lastUpdated: "2026-03-19T13:00:00Z",
    addedBy: "c5",
  },
  {
    id: "t5",
    title: "Month-End Financial Close",
    description: "Reconcile all accounts, categorize transactions, and produce monthly P&L report for leadership.",
    department: "Finance",
    contributors: ["c6"],
    frequency: "Monthly",
    timeSpent: "5 days",
    tools: ["QuickBooks", "Google Sheets", "Excel", "Gmail"],
    inputs: [
      { what: "Revenue data", fromOrTo: "Sales (Salesforce)", method: "Manual export" },
      { what: "Expense reports", fromOrTo: "All departments", method: "Email + Sheets" },
      { what: "Vendor invoices", fromOrTo: "Operations", method: "Email" },
    ],
    steps: [
      { order: 1, title: "Export data from all sources", description: "Pull from QuickBooks, Salesforce, expense reports", actor: "human" },
      { order: 2, title: "Reconcile accounts", description: "Match transactions across systems", actor: "human", tool: "Excel" },
      { order: 3, title: "Categorize transactions", description: "Assign categories, handle edge cases", actor: "human", tool: "QuickBooks" },
      { order: 4, title: "Generate P&L", description: "Build profit and loss statement with comparisons", actor: "human", tool: "Google Sheets" },
      { order: 5, title: "Write financial narrative", description: "Explain variances, add context for leadership", actor: "human", tool: "Google Docs" },
      { order: 6, title: "Present to leadership", description: "Monthly finance review meeting", actor: "human" },
    ],
    outputs: [
      { what: "Monthly P&L report", fromOrTo: "Leadership", method: "Email + presentation" },
      { what: "Budget vs actual", fromOrTo: "Department heads", method: "Google Sheets" },
    ],
    painPoints: ["5-day close process", "Manual reconciliation across 3 systems", "95% of categorization is repetitive"],
    isBottleneck: true,
    recommendation: {
      summary: "Build a real-time financial intelligence layer. AI handles continuous reconciliation and auto-categorization. Finance reviews exceptions.",
      impact: { timeSaved: "20 hrs/month", costSaved: "$28,800/year", qualityGain: "Close from 5 days to 1 day" },
      priority: "medium",
      difficulty: "complex",
      newSteps: [
        { order: 1, title: "Continuous data sync", description: "AI maintains live connections to all financial systems", actor: "ai" },
        { order: 2, title: "Auto-categorize", description: "AI categorizes 95% of transactions based on learned patterns", actor: "ai" },
        { order: 3, title: "Review exceptions", description: "Finance handles the 5% that need human judgment", actor: "human" },
        { order: 4, title: "Generate reports on demand", description: "AI produces P&L with narrative at any time", actor: "ai" },
      ],
      aiHandles: ["Data reconciliation", "Transaction categorization", "Report generation", "Variance analysis"],
      humanDecides: ["Policy exceptions", "Strategic commentary", "Audit decisions", "Forecast assumptions"],
      phase: 3,
    },
    tags: ["finance", "reporting", "compliance"],
    lastUpdated: "2026-03-20T10:00:00Z",
    addedBy: "c6",
  },
  {
    id: "t6",
    title: "Status Meetings & Updates",
    description: "Prepare for and run cross-team status meetings. Write follow-up summaries for different audiences.",
    department: "Operations",
    contributors: ["c3"],
    frequency: "8 hrs/week",
    timeSpent: "8 hours/week",
    tools: ["Slack", "Notion", "Zoom", "Google Docs"],
    inputs: [
      { what: "Status from each team", fromOrTo: "All departments", method: "Slack + meetings" },
      { what: "Project timelines", fromOrTo: "Engineering + Product", method: "Linear + Notion" },
    ],
    steps: [
      { order: 1, title: "Gather updates from teams", description: "Ping each team lead for their status before meeting", actor: "human", tool: "Slack" },
      { order: 2, title: "Prepare agenda", description: "Organize topics, flag blockers, set meeting structure", actor: "human", tool: "Notion" },
      { order: 3, title: "Run meeting", description: "Facilitate discussion, capture decisions and action items", actor: "human", tool: "Zoom" },
      { order: 4, title: "Write summary for execs", description: "High-level version with metrics and decisions", actor: "human" },
      { order: 5, title: "Write summary for teams", description: "Detailed version with action items and owners", actor: "human" },
      { order: 6, title: "Distribute and follow up", description: "Post to relevant channels, track action items", actor: "human", tool: "Slack" },
    ],
    outputs: [
      { what: "Exec status summary", fromOrTo: "Leadership", method: "Email" },
      { what: "Team action items", fromOrTo: "All departments", method: "Slack" },
    ],
    painPoints: ["8 hours/week on meetings and follow-ups", "Writing 3 versions of the same update", "Action items get lost"],
    isBottleneck: false,
    recommendation: {
      summary: "Replace most meetings with AI-generated async updates. One set of notes becomes multiple audience-specific versions.",
      impact: { timeSaved: "6 hrs/week", costSaved: "$15,600/year", qualityGain: "Better-informed stakeholders, less meeting fatigue" },
      priority: "high",
      difficulty: "easy",
      newSteps: [
        { order: 1, title: "Team dumps status notes", description: "Quick text updates, no formatting required", actor: "human" },
        { order: 2, title: "AI generates audience versions", description: "Exec summary, engineering detail, client update", actor: "ai" },
        { order: 3, title: "Review and distribute", description: "Quick review, post to channels", actor: "human" },
      ],
      aiHandles: ["Reformatting for audiences", "Action item extraction", "Consistent formatting", "Distribution"],
      humanDecides: ["What to escalate", "Sensitive topics tone", "When a meeting is actually needed", "Strategic framing"],
      phase: 1,
    },
    tags: ["meetings", "communication", "async"],
    lastUpdated: "2026-03-17T09:00:00Z",
    addedBy: "c3",
  },
  {
    id: "t7",
    title: "Campaign Brief Writing",
    description: "Write detailed campaign briefs for each new marketing initiative before creative work begins.",
    department: "Marketing",
    contributors: ["c1"],
    frequency: "4-5 per month",
    timeSpent: "2-3 hours each",
    tools: ["Google Docs", "Notion"],
    inputs: [
      { what: "Campaign goals and budget", fromOrTo: "Leadership", method: "Meeting" },
      { what: "Audience data", fromOrTo: "Google Analytics", method: "Manual" },
    ],
    steps: [
      { order: 1, title: "Gather campaign requirements", description: "Goal, audience, channels, timeline, budget", actor: "human" },
      { order: 2, title: "Research audience and positioning", description: "Pull data, review competitive landscape", actor: "human" },
      { order: 3, title: "Write the brief", description: "Full document: context, strategy, messaging, timeline", actor: "human", tool: "Google Docs" },
      { order: 4, title: "Review with stakeholders", description: "Get alignment from leadership and cross-functional", actor: "human" },
      { order: 5, title: "Distribute to creative team", description: "Brief kicks off design and content work", actor: "human" },
    ],
    outputs: [
      { what: "Campaign brief", fromOrTo: "Creative team", method: "Google Docs" },
      { what: "Timeline and milestones", fromOrTo: "Operations", method: "Notion" },
    ],
    painPoints: ["2-3 hours per brief, doing 4-5/month", "Format is always the same", "Research phase is repetitive"],
    isBottleneck: false,
    recommendation: {
      summary: "AI generates first draft from bullet points. Marketing manager refines strategy and adds context.",
      impact: { timeSaved: "8 hrs/month", costSaved: "$6,500/year", qualityGain: "More consistent briefs, faster turnaround" },
      priority: "high",
      difficulty: "easy",
      newSteps: [
        { order: 1, title: "Input bullet points", description: "Goal, audience, channels, timeline, key message", actor: "human" },
        { order: 2, title: "AI generates draft brief", description: "Full brief matching your template and tone", actor: "ai" },
        { order: 3, title: "Refine and approve", description: "Add strategic nuance, stakeholder context", actor: "human" },
      ],
      aiHandles: ["First draft generation", "Consistent formatting", "Research compilation", "Messaging variations"],
      humanDecides: ["Strategic positioning", "Budget allocation", "Stakeholder language", "Go/no-go on direction"],
      phase: 1,
    },
    tags: ["content", "marketing", "briefs"],
    lastUpdated: "2026-03-15T10:00:00Z",
    addedBy: "c1",
  },
  {
    id: "t8",
    title: "SOP Documentation",
    description: "Document standard operating procedures for all repeatable processes. Currently most live in people's heads.",
    department: "Operations",
    contributors: ["c3"],
    frequency: "As needed",
    timeSpent: "3 hours per SOP",
    tools: ["Notion", "Google Docs"],
    inputs: [
      { what: "Process knowledge", fromOrTo: "Team members (tribal)", method: "Conversations" },
    ],
    steps: [
      { order: 1, title: "Interview process owner", description: "Talk through how they do it step by step", actor: "human" },
      { order: 2, title: "Draft SOP document", description: "Write up structured steps, decisions, edge cases", actor: "human", tool: "Notion" },
      { order: 3, title: "Review with team", description: "Verify accuracy, fill gaps", actor: "human" },
      { order: 4, title: "Publish and train", description: "Store in wiki, train relevant team members", actor: "human" },
    ],
    outputs: [
      { what: "Documented SOPs", fromOrTo: "All teams", method: "Notion" },
    ],
    painPoints: ["3 hours per SOP", "Most knowledge is tribal — undocumented", "SOPs go stale quickly"],
    isBottleneck: false,
    recommendation: {
      summary: "Record process walkthroughs conversationally. AI converts to structured SOPs with steps, decisions, and checklists.",
      impact: { timeSaved: "2 hrs/SOP", costSaved: "$4,800/year", qualityGain: "15 years of tribal knowledge documented in weeks" },
      priority: "high",
      difficulty: "easy",
      newSteps: [
        { order: 1, title: "Brain dump conversationally", description: "Talk or type through the process — no structure needed", actor: "human" },
        { order: 2, title: "AI structures into SOP", description: "Converts to numbered steps, decision trees, checklists", actor: "ai" },
        { order: 3, title: "Review and fill gaps", description: "Team adds edge cases and missing context", actor: "human" },
      ],
      aiHandles: ["Converting conversation to structure", "Identifying gaps", "Multiple format versions", "Version tracking"],
      humanDecides: ["Actual process knowledge", "Edge cases", "Detail level per audience", "When to update"],
      phase: 1,
    },
    tags: ["documentation", "processes", "knowledge"],
    lastUpdated: "2026-03-17T09:00:00Z",
    addedBy: "c3",
  },
];

// ─── Derived: Departments ───
export function getDepartments(): Department[] {
  const deptMap = new Map<string, { contributors: Contributor[]; tasks: Task[] }>();
  contributors.forEach((c) => {
    if (!deptMap.has(c.department)) deptMap.set(c.department, { contributors: [], tasks: [] });
    deptMap.get(c.department)!.contributors.push(c);
  });
  tasks.forEach((t) => {
    if (!deptMap.has(t.department)) deptMap.set(t.department, { contributors: [], tasks: [] });
    deptMap.get(t.department)!.tasks.push(t);
  });

  return [...deptMap.entries()].map(([name, data]) => ({
    name,
    contributors: data.contributors,
    taskCount: data.tasks.length,
    bottleneckCount: data.tasks.filter((t) => t.isBottleneck).length,
    aiReadiness: data.contributors.length > 0
      ? data.contributors.reduce((sum, c) => {
          const scores = { none: 10, beginner: 30, intermediate: 60, advanced: 85 };
          return sum + scores[c.aiComfort];
        }, 0) / data.contributors.length
      : 0,
  }));
}

// ─── Derived: Stats ───
export function getStats() {
  const recsCount = tasks.filter((t) => t.recommendation).length;
  const bottlenecks = tasks.filter((t) => t.isBottleneck).length;
  const avgReadiness = Math.round(getDepartments().reduce((s, d) => s + d.aiReadiness, 0) / getDepartments().length);
  return { totalTasks: tasks.length, recsCount, bottlenecks, avgReadiness, totalContributors: contributors.length };
}

// ─── Roadmap ───
export const roadmap: RoadmapPhase[] = [
  {
    phase: 1, name: "Quick Wins", duration: "Weeks 1-2",
    description: "High-impact, low-effort workflows. Immediate ROI and team confidence.",
    taskIds: tasks.filter((t) => t.recommendation?.phase === 1).map((t) => t.id),
    milestones: ["All Phase 1 workflows piloted", "Baseline time savings measured", "Team feedback collected"],
  },
  {
    phase: 2, name: "Foundation", duration: "Month 1-2",
    description: "Cross-department workflows and bottleneck elimination.",
    taskIds: tasks.filter((t) => t.recommendation?.phase === 2).map((t) => t.id),
    milestones: ["Sales→Ops handoff automated", "Cross-dept flows optimized", "AI tools integrated with stack"],
  },
  {
    phase: 3, name: "Transformation", duration: "Quarter 1-2",
    description: "Intelligence layer operational. Real-time dashboards, continuous optimization.",
    taskIds: tasks.filter((t) => t.recommendation?.phase === 3).map((t) => t.id),
    milestones: ["Real-time financial dashboard live", "Company world model operational", "70%+ AI readiness org-wide"],
  },
];
