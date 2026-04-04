import type {
  CompanyIntelligence,
  EmployeeInterview,
  DepartmentProfile,
  WorkflowRecommendation,
  InformationFlow,
  RoadmapPhase,
} from "./types";

// ─── Mock Interviews ───
const interviews: EmployeeInterview[] = [
  {
    id: "int-1",
    name: "Sarah Chen",
    role: "Marketing Manager",
    department: "Marketing",
    tools: ["HubSpot", "Google Analytics", "Canva", "Slack", "Google Docs", "Notion"],
    dailyTasks: ["Campaign briefs", "Performance reports", "Content review", "Social media planning", "Vendor coordination"],
    painPoints: ["Reports take 3+ hours every Friday", "Brand consistency across 4 writers", "Manual data compilation from 3 sources"],
    timeWasters: ["Weekly performance report compilation", "Copy-pasting data between GA and Sheets", "Editing blog posts for voice consistency"],
    informationSources: ["Sales (pipeline data)", "Product (roadmap updates)", "Finance (budget approvals)"],
    handoffs: [
      { to: "Sales", what: "Qualified leads and campaign assets", how: "Email + HubSpot", frequency: "Daily" },
      { to: "Product", what: "Customer feedback summaries", how: "Notion doc", frequency: "Weekly" },
    ],
    decisions: ["Campaign messaging and positioning", "Budget allocation across channels", "Content calendar priorities"],
    aiComfort: "intermediate",
    transcript: "",
    completedAt: "2026-03-15T10:00:00Z",
  },
  {
    id: "int-2",
    name: "Marcus Rivera",
    role: "Sales Director",
    department: "Sales",
    tools: ["Salesforce", "Gmail", "Slack", "Google Sheets", "Zoom", "LinkedIn"],
    dailyTasks: ["Prospect outreach", "Pipeline review", "Deal negotiations", "Team standups", "Forecasting"],
    painPoints: ["Personalized emails take 20 min each", "CRM data entry is manual", "Forecasting requires pulling from 5 reports"],
    timeWasters: ["Writing personalized outreach emails", "Updating Salesforce after calls", "Compiling weekly forecast"],
    informationSources: ["Marketing (lead quality data)", "Product (feature roadmap for deals)", "Finance (pricing approvals)"],
    handoffs: [
      { to: "Operations", what: "Signed contracts and onboarding details", how: "Email + Salesforce", frequency: "Per deal" },
      { to: "Finance", what: "Revenue forecasts and deal terms", how: "Google Sheets", frequency: "Weekly" },
    ],
    decisions: ["Pricing and discount approval", "Deal prioritization", "Territory assignments"],
    aiComfort: "beginner",
    transcript: "",
    completedAt: "2026-03-16T14:00:00Z",
  },
  {
    id: "int-3",
    name: "Priya Patel",
    role: "Operations Manager",
    department: "Operations",
    tools: ["Notion", "Google Sheets", "Slack", "Zoom", "Jira"],
    dailyTasks: ["Process documentation", "Vendor management", "Team coordination", "Status reporting", "Onboarding new clients"],
    painPoints: ["SOPs live in people's heads", "Client onboarding takes 2 weeks", "Status meetings consume 8 hrs/week"],
    timeWasters: ["Writing and updating SOPs", "Client onboarding checklist management", "Status meeting prep and follow-up"],
    informationSources: ["Sales (new client details)", "Product (feature changes)", "Engineering (deployment schedules)"],
    handoffs: [
      { to: "Engineering", what: "Client requirements and setup tickets", how: "Jira", frequency: "Per client" },
      { to: "Sales", what: "Client health reports", how: "Slack + meeting", frequency: "Monthly" },
    ],
    decisions: ["Process changes and improvements", "Resource allocation", "Escalation paths"],
    aiComfort: "beginner",
    transcript: "",
    completedAt: "2026-03-17T09:00:00Z",
  },
  {
    id: "int-4",
    name: "James Park",
    role: "Engineering Lead",
    department: "Engineering",
    tools: ["GitHub", "Linear", "Slack", "VS Code", "Figma", "Notion"],
    dailyTasks: ["Code review", "Sprint planning", "Architecture decisions", "Bug triage", "Documentation"],
    painPoints: ["Context switching between 6 tools", "Writing technical docs nobody reads", "Translating product requirements into specs"],
    timeWasters: ["Writing PR descriptions and release notes", "Updating Linear tickets after standups", "Cross-team sync meetings"],
    informationSources: ["Product (requirements)", "Operations (client issues)", "Design (mockups)"],
    handoffs: [
      { to: "Product", what: "Release notes and feature updates", how: "Slack + Notion", frequency: "Per sprint" },
      { to: "Operations", what: "Deployment notifications", how: "Slack", frequency: "Daily" },
    ],
    decisions: ["Technical architecture choices", "Build vs. buy decisions", "Sprint scope"],
    aiComfort: "advanced",
    transcript: "",
    completedAt: "2026-03-18T11:00:00Z",
  },
  {
    id: "int-5",
    name: "Lisa Nakamura",
    role: "Product Manager",
    department: "Product",
    tools: ["Linear", "Figma", "Notion", "Slack", "Google Docs", "Loom"],
    dailyTasks: ["Writing PRDs", "User research synthesis", "Roadmap updates", "Stakeholder alignment", "Sprint reviews"],
    painPoints: ["PRDs take a full day to write", "Synthesizing user feedback from 4 channels", "Keeping roadmap current across 3 teams"],
    timeWasters: ["Writing product requirement documents", "Summarizing user research interviews", "Status updates for different stakeholders"],
    informationSources: ["Engineering (feasibility)", "Sales (customer requests)", "Marketing (market data)", "Support (bug reports)"],
    handoffs: [
      { to: "Engineering", what: "PRDs and specifications", how: "Notion + Linear", frequency: "Per sprint" },
      { to: "Marketing", what: "Feature announcements and positioning", how: "Notion doc", frequency: "Per release" },
      { to: "Sales", what: "Competitive intel and feature roadmap", how: "Google Docs", frequency: "Monthly" },
    ],
    decisions: ["Feature prioritization", "Scope and trade-off calls", "Release timing"],
    aiComfort: "intermediate",
    transcript: "",
    completedAt: "2026-03-19T13:00:00Z",
  },
  {
    id: "int-6",
    name: "David Kim",
    role: "Finance Manager",
    department: "Finance",
    tools: ["QuickBooks", "Google Sheets", "Excel", "Slack", "Gmail"],
    dailyTasks: ["Budget tracking", "Invoice processing", "Financial reporting", "Forecasting", "Expense approvals"],
    painPoints: ["Manual data entry from 3 systems", "Month-end close takes 5 days", "Budget vs. actual requires manual reconciliation"],
    timeWasters: ["Reconciling data across QuickBooks, Sheets, and Salesforce", "Generating monthly financial summaries", "Processing expense reports"],
    informationSources: ["Sales (revenue data)", "Operations (cost data)", "All departments (expense reports)"],
    handoffs: [
      { to: "Leadership", what: "Monthly P&L and financial reports", how: "Email + presentation", frequency: "Monthly" },
      { to: "Sales", what: "Pricing approvals and margin analysis", how: "Email", frequency: "Per deal" },
    ],
    decisions: ["Budget allocation", "Expense policy exceptions", "Financial forecasting assumptions"],
    aiComfort: "beginner",
    transcript: "",
    completedAt: "2026-03-20T10:00:00Z",
  },
];

// ─── Departments ───
function buildDepartments(interviews: EmployeeInterview[]): DepartmentProfile[] {
  const deptMap = new Map<string, EmployeeInterview[]>();
  interviews.forEach((i) => {
    const existing = deptMap.get(i.department) || [];
    existing.push(i);
    deptMap.set(i.department, existing);
  });

  return [...deptMap.entries()].map(([name, employees]) => ({
    name,
    employees,
    tools: [...new Set(employees.flatMap((e) => e.tools))],
    topPainPoints: employees.flatMap((e) => e.painPoints).slice(0, 5),
    topTimeWasters: employees.flatMap((e) => e.timeWasters).slice(0, 5),
    handoffsIn: employees.flatMap((e) =>
      interviews
        .filter((other) => other.department !== name)
        .flatMap((other) => other.handoffs.filter((h) => h.to === name))
    ),
    handoffsOut: employees.flatMap((e) => e.handoffs),
    aiReadiness:
      employees.reduce((sum, e) => {
        const scores = { none: 10, beginner: 30, intermediate: 60, advanced: 85 };
        return sum + scores[e.aiComfort];
      }, 0) / employees.length,
  }));
}

// ─── Information Flows ───
const informationFlows: InformationFlow[] = [
  { from: "Marketing", to: "Sales", type: "Qualified leads + campaign assets", frequency: "Daily", method: "HubSpot + Email", bottleneck: false, aiOpportunity: "Auto-route and score leads with AI, attach relevant assets automatically" },
  { from: "Sales", to: "Operations", type: "Signed contracts + client details", frequency: "Per deal", method: "Email + Salesforce", bottleneck: true, aiOpportunity: "Auto-generate onboarding packages from deal data, eliminate manual handoff" },
  { from: "Sales", to: "Finance", type: "Revenue forecasts + deal terms", frequency: "Weekly", method: "Google Sheets", bottleneck: true, aiOpportunity: "Real-time forecast from CRM data, no manual compilation needed" },
  { from: "Product", to: "Engineering", type: "PRDs + specifications", frequency: "Per sprint", method: "Notion + Linear", bottleneck: false, aiOpportunity: "AI-assisted PRD drafting, auto-generate Linear tickets from specs" },
  { from: "Product", to: "Marketing", type: "Feature announcements + positioning", frequency: "Per release", method: "Notion", bottleneck: false, aiOpportunity: "Auto-generate marketing briefs from PRDs and release notes" },
  { from: "Engineering", to: "Product", type: "Release notes + feature updates", frequency: "Per sprint", method: "Slack + Notion", bottleneck: false, aiOpportunity: "Auto-generate release notes from PR descriptions and commits" },
  { from: "Engineering", to: "Operations", type: "Deployment notifications", frequency: "Daily", method: "Slack", bottleneck: false, aiOpportunity: "Automated deployment summaries with impact analysis" },
  { from: "Operations", to: "Engineering", type: "Client requirements + setup tickets", frequency: "Per client", method: "Jira", bottleneck: true, aiOpportunity: "AI generates setup tickets from client contract data automatically" },
  { from: "Operations", to: "Sales", type: "Client health reports", frequency: "Monthly", method: "Slack + meeting", bottleneck: true, aiOpportunity: "Continuous AI-generated health scores, eliminating monthly manual reports" },
  { from: "Finance", to: "Leadership", type: "Monthly P&L + financial reports", frequency: "Monthly", method: "Email + presentation", bottleneck: true, aiOpportunity: "Real-time financial dashboard with AI-generated narrative insights" },
  { from: "Marketing", to: "Product", type: "Customer feedback summaries", frequency: "Weekly", method: "Notion", bottleneck: false, aiOpportunity: "AI synthesizes feedback from all channels into structured insights" },
  { from: "Product", to: "Sales", type: "Competitive intel + roadmap", frequency: "Monthly", method: "Google Docs", bottleneck: false, aiOpportunity: "Auto-updated competitive battle cards from product intelligence" },
];

// ─── Recommendations ───
const recommendations: WorkflowRecommendation[] = [
  {
    id: "rec-1",
    title: "Automated Weekly Performance Reports",
    department: "Marketing",
    description: "Replace manual Friday report compilation with AI-generated reports that pull from GA, HubSpot, and Sheets automatically.",
    trigger: "Every Friday at 2pm, or on-demand request",
    steps: [
      { title: "Auto-pull data from sources", body: "AI connects to GA, HubSpot, and Sheets APIs to gather weekly metrics" },
      { title: "Generate narrative report", body: "AI creates formatted report with trends, insights, and anomalies" },
      { title: "Flag items needing human review", body: "AI highlights unusual metrics or strategic implications" },
      { title: "Marketing manager reviews and sends", body: "15-minute review instead of 3-hour compilation" },
    ],
    decisionPoints: [
      { question: "Is this anomaly worth escalating?", aiHandles: "Identifies statistical outliers automatically", humanDecides: "Whether the anomaly requires strategic action or is expected" },
    ],
    output: "Polished weekly performance report ready for leadership",
    aiRole: ["Data compilation from 3 sources", "Trend calculation and visualization", "Narrative summary drafting", "Anomaly detection"],
    humanRole: ["Strategic interpretation", "Deciding what to escalate", "Adding business context", "Final approval"],
    tools: ["Google Analytics", "HubSpot", "Google Sheets"],
    impact: { timeSaved: "2.5 hrs/week", costSaved: "$6,500/year", qualityImprovement: "More consistent, catches anomalies humans miss" },
    difficulty: "easy",
    priority: "critical",
    phase: 1,
    crossDepartment: false,
    connectedDepartments: [],
  },
  {
    id: "rec-2",
    title: "AI-Powered Sales Outreach",
    department: "Sales",
    description: "Use AI to research prospects and generate personalized outreach emails, cutting per-email time from 20 minutes to 2 minutes.",
    trigger: "New prospect added to pipeline or follow-up cadence triggers",
    steps: [
      { title: "Prospect context gathering", body: "AI pulls data from LinkedIn, company website, and CRM history" },
      { title: "Generate personalized email", body: "AI drafts using proven frameworks + prospect-specific hooks" },
      { title: "Sales rep reviews", body: "Quick check for accuracy and relationship context" },
      { title: "Send and log", body: "AI logs activity in Salesforce automatically" },
    ],
    decisionPoints: [
      { question: "Is this the right personalization angle?", aiHandles: "Identifies 2-3 relevant hooks from prospect data", humanDecides: "Which angle fits the relationship and deal stage" },
    ],
    output: "Personalized outreach emails at 10x the speed",
    aiRole: ["Prospect research", "Personalized copy drafting", "CRM logging", "Follow-up scheduling"],
    humanRole: ["Relationship judgment", "Deal strategy", "Pricing decisions", "Reading between the lines on responses"],
    tools: ["Salesforce", "Gmail", "LinkedIn"],
    impact: { timeSaved: "8 hrs/week", costSaved: "$20,800/year", qualityImprovement: "5-10x reply rate improvement" },
    difficulty: "easy",
    priority: "critical",
    phase: 1,
    crossDepartment: false,
    connectedDepartments: [],
  },
  {
    id: "rec-3",
    title: "Sales → Ops Handoff Automation",
    department: "Operations",
    description: "Eliminate the manual handoff between Sales and Operations when a deal closes. Auto-generate onboarding packages from deal data.",
    trigger: "Deal marked as 'Closed Won' in Salesforce",
    steps: [
      { title: "Auto-extract deal details", body: "Pull contract terms, client info, and requirements from Salesforce" },
      { title: "Generate onboarding package", body: "AI creates checklist, timeline, and setup tickets from deal data" },
      { title: "Route to Ops team", body: "Package appears in Notion with assigned owner" },
      { title: "Ops reviews and kicks off", body: "Review for accuracy, then begin onboarding" },
    ],
    decisionPoints: [
      { question: "Does this client need custom setup?", aiHandles: "Flags non-standard requirements from contract", humanDecides: "Whether to use standard or custom onboarding path" },
    ],
    output: "Complete onboarding package auto-generated from deal data",
    aiRole: ["Data extraction from CRM", "Checklist and ticket generation", "Timeline estimation", "Routing and notification"],
    humanRole: ["Custom requirement decisions", "Resource allocation", "Client relationship management", "Escalation handling"],
    tools: ["Salesforce", "Notion", "Jira"],
    impact: { timeSaved: "4 hrs/client", costSaved: "$15,600/year", qualityImprovement: "Onboarding time cut from 2 weeks to 3 days" },
    difficulty: "moderate",
    priority: "high",
    phase: 2,
    crossDepartment: true,
    connectedDepartments: ["Sales", "Operations", "Engineering"],
  },
  {
    id: "rec-4",
    title: "SOP Documentation from Conversations",
    department: "Operations",
    description: "Convert tribal knowledge into structured SOPs by recording process walkthroughs and using AI to document them.",
    trigger: "New process identified or existing SOP needs updating",
    steps: [
      { title: "Record process walkthrough", body: "Team member explains the process conversationally (voice or text)" },
      { title: "AI structures into SOP", body: "Converts brain dump into numbered steps, decision trees, and checklists" },
      { title: "Review and fill gaps", body: "Team reviews, adds edge cases and assumed knowledge" },
      { title: "Publish and maintain", body: "Store in Notion, create quick-reference version" },
    ],
    decisionPoints: [
      { question: "How detailed should this SOP be?", aiHandles: "Generates both detailed and summary versions", humanDecides: "Which version matches the audience (new hire vs. experienced)" },
    ],
    output: "Structured SOP with steps, decision points, and quick-reference card",
    aiRole: ["Converting conversation to structure", "Identifying gaps", "Creating multiple format versions", "Maintaining version history"],
    humanRole: ["Actual process knowledge", "Edge case identification", "Audience-appropriate detail level", "Approval and publishing"],
    tools: ["Notion", "Slack"],
    impact: { timeSaved: "2 hrs/SOP", costSaved: "$4,800/year", qualityImprovement: "15 years of tribal knowledge documented in weeks" },
    difficulty: "easy",
    priority: "high",
    phase: 1,
    crossDepartment: false,
    connectedDepartments: [],
  },
  {
    id: "rec-5",
    title: "AI-Assisted PRD Writing",
    department: "Product",
    description: "Cut PRD writing from a full day to 2 hours by using AI to generate first drafts from user research and stakeholder notes.",
    trigger: "New feature approved for development",
    steps: [
      { title: "Gather inputs", body: "User research notes, stakeholder requirements, competitive context" },
      { title: "AI generates PRD draft", body: "Structured document with user stories, acceptance criteria, edge cases" },
      { title: "PM reviews and refines", body: "Add strategic context, adjust scope, refine priorities" },
      { title: "Share with Engineering", body: "Final PRD pushed to Notion, tickets auto-created in Linear" },
    ],
    decisionPoints: [
      { question: "What's in scope vs. out of scope?", aiHandles: "Suggests scope based on similar past features", humanDecides: "Final scope decisions based on strategic priorities and capacity" },
    ],
    output: "Complete PRD with user stories, acceptance criteria, and implementation tickets",
    aiRole: ["Drafting structure and user stories", "Generating acceptance criteria", "Creating Linear tickets from PRD", "Competitive context research"],
    humanRole: ["Feature prioritization", "Scope decisions", "Strategic alignment", "Stakeholder negotiation"],
    tools: ["Notion", "Linear", "Figma"],
    impact: { timeSaved: "6 hrs/PRD", costSaved: "$18,000/year", qualityImprovement: "More consistent PRDs with fewer gaps" },
    difficulty: "easy",
    priority: "high",
    phase: 1,
    crossDepartment: false,
    connectedDepartments: [],
  },
  {
    id: "rec-6",
    title: "Real-Time Financial Dashboard",
    department: "Finance",
    description: "Replace the 5-day month-end close with a continuously updated financial intelligence layer.",
    trigger: "Always-on — replaces monthly batch process",
    steps: [
      { title: "Connect data sources", body: "Link QuickBooks, Salesforce, and expense tools" },
      { title: "AI maintains live model", body: "Continuous reconciliation and categorization" },
      { title: "Generate narrative reports on demand", body: "AI creates P&L narratives, variance analysis, forecasts" },
      { title: "Finance reviews and certifies", body: "Spot-check AI work, handle exceptions, sign off" },
    ],
    decisionPoints: [
      { question: "How should this expense be categorized?", aiHandles: "Auto-categorizes 95% of transactions based on patterns", humanDecides: "Edge cases, new vendor categories, policy exceptions" },
    ],
    output: "Real-time financial visibility replacing monthly batch reports",
    aiRole: ["Data reconciliation across systems", "Auto-categorization", "Variance analysis", "Forecast modeling"],
    humanRole: ["Policy decisions", "Exception handling", "Strategic financial planning", "Audit and compliance sign-off"],
    tools: ["QuickBooks", "Google Sheets", "Salesforce"],
    impact: { timeSaved: "20 hrs/month", costSaved: "$28,800/year", qualityImprovement: "Month-end close from 5 days to 1 day" },
    difficulty: "complex",
    priority: "medium",
    phase: 3,
    crossDepartment: true,
    connectedDepartments: ["Finance", "Sales", "Operations"],
  },
  {
    id: "rec-7",
    title: "Async Status Updates (Kill Status Meetings)",
    department: "Operations",
    description: "Replace 8 hours of weekly status meetings with AI-generated async updates tailored to each audience.",
    trigger: "End of day/week or on-demand",
    steps: [
      { title: "Team members dump status notes", body: "Quick text updates — no formatting needed" },
      { title: "AI generates audience-specific updates", body: "Execs get metrics, engineers get technical details, clients get impact" },
      { title: "Distribute via Slack/email", body: "Each audience gets their version in their preferred channel" },
      { title: "Respond to questions async", body: "Threaded questions replace scheduled meetings" },
    ],
    decisionPoints: [
      { question: "Does this need a live meeting instead?", aiHandles: "Flags high-urgency items that may warrant synchronous discussion", humanDecides: "Whether the situation truly requires a meeting or can be resolved async" },
    ],
    output: "Multiple audience-specific status updates from a single input",
    aiRole: ["Reformatting for different audiences", "Highlighting key metrics", "Consistent formatting", "Distribution automation"],
    humanRole: ["Deciding what to escalate", "Tone for sensitive topics", "When to override with a meeting", "Strategic framing"],
    tools: ["Slack", "Notion"],
    impact: { timeSaved: "6 hrs/week", costSaved: "$15,600/year", qualityImprovement: "Better-informed stakeholders with less time investment" },
    difficulty: "easy",
    priority: "high",
    phase: 1,
    crossDepartment: true,
    connectedDepartments: ["Operations", "Engineering", "Product", "Sales"],
  },
];

// ─── Roadmap ───
const roadmap: RoadmapPhase[] = [
  {
    phase: 1,
    name: "Quick Wins",
    duration: "Weeks 1-2",
    description: "Implement high-impact, low-effort workflows that show immediate ROI and build confidence.",
    recommendations: ["rec-1", "rec-2", "rec-4", "rec-5", "rec-7"],
    milestones: [
      "All Phase 1 workflows documented and piloted",
      "Baseline time savings measured",
      "Team feedback collected",
    ],
  },
  {
    phase: 2,
    name: "Foundation",
    duration: "Month 1-2",
    description: "Tackle cross-department workflows and eliminate major bottlenecks in information flow.",
    recommendations: ["rec-3"],
    milestones: [
      "Sales→Ops handoff fully automated",
      "Cross-department flows mapped and optimized",
      "AI tools integrated with existing stack",
    ],
  },
  {
    phase: 3,
    name: "Transformation",
    duration: "Quarter 1-2",
    description: "Build the intelligence layer — real-time dashboards, continuous optimization, and company-wide AI adoption.",
    recommendations: ["rec-6"],
    milestones: [
      "Real-time financial dashboard live",
      "Company world model operational",
      "All departments at 70%+ AI readiness",
    ],
  },
];

// ─── Full Intelligence Object ───
export const mockIntelligence: CompanyIntelligence = {
  company: {
    id: "company-1",
    name: "Acme Technologies",
    industry: "B2B SaaS",
    size: "51-200",
    createdAt: "2026-03-14T00:00:00Z",
  },
  departments: buildDepartments(interviews),
  interviews,
  recommendations,
  informationFlows: informationFlows,
  readinessScore: 48,
  estimatedSavings: {
    hoursPerWeek: 42,
    annualCost: 109200,
  },
  roadmap,
};
