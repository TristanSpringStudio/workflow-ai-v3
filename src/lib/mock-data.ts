import type { Company, Contributor, Task, Department, RoadmapPhase } from "./types";

// ─── Company ───
export const company: Company = {
  id: "company-1",
  name: "Zippy Zaps",
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
      { order: 1, title: "Export data from GA", description: "Pull weekly traffic, conversion, and source data", actor: "human", tool: "Google Analytics", toolIcon: "Google Analytics", touchpoints: ["c1"], aiReady: true, aiReadyNote: "GA API supports scheduled data pulls. An AI agent can extract and format this data automatically." },
      { order: 2, title: "Export data from HubSpot", description: "Pull lead gen, email, and campaign metrics", actor: "human", tool: "HubSpot", toolIcon: "HubSpot", touchpoints: ["c1"], sharedWith: [{ taskId: "t10", taskTitle: "Lead Scoring & Qualification" }, { taskId: "t11", taskTitle: "Sales Forecasting" }], aiReady: true, aiReadyNote: "HubSpot's API supports scheduled data pulls. An AI agent can extract, format, and load this data into your reporting template automatically — eliminating the manual export entirely." },
      { order: 3, title: "Compile in Sheets", description: "Copy data into master spreadsheet, calculate WoW changes", actor: "human", tool: "Google Sheets", toolIcon: "Google Sheets", touchpoints: ["c1"], aiReady: true, aiReadyNote: "Spreadsheet compilation and WoW calculations can be fully automated with a script or AI agent." },
      { order: 4, title: "Write narrative summary", description: "Draft insights, trends, and recommendations", actor: "human", tool: "Google Docs", toolIcon: "Google Docs", touchpoints: ["c1"], aiReady: false },
      { order: 5, title: "Send to leadership", description: "Email report with key highlights", actor: "human", tool: "Gmail", toolIcon: "Gmail", touchpoints: ["c1"], aiReady: true, aiReadyNote: "Distribution can be fully automated once the report is approved." },
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
    knowledge: [
      { contributorId: "c1", quote: "Every Friday I spend about 3 hours pulling data from GA, HubSpot, and our spreadsheets to build the weekly report. The format never changes — it's the same template every time.", interviewDate: "2026-03-15" },
      { contributorId: "c1", quote: "The worst part is copy-pasting between tools. I export from GA, export from HubSpot, paste into Sheets, calculate the changes, then write it up in Docs. It's mind-numbing.", interviewDate: "2026-03-15" },
      { contributorId: "c6", quote: "I pull some of the same HubSpot data for my monthly financial reports. Didn't know marketing was pulling it weekly too.", interviewDate: "2026-03-20" },
    ],
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
      { order: 1, title: "Review prospect list", description: "Check CRM for new leads and target accounts", actor: "human", tool: "Salesforce", toolIcon: "Salesforce", touchpoints: ["c2"], aiReady: true, aiReadyNote: "AI can auto-surface prioritized prospect lists based on scoring criteria and recent activity signals." },
      { order: 2, title: "Research each prospect", description: "Check LinkedIn, company news, recent activity", actor: "human", tool: "LinkedIn", touchpoints: ["c2"], aiReady: true, aiReadyNote: "AI agents can pull prospect context from LinkedIn, company websites, and news sources in seconds." },
      { order: 3, title: "Write personalized email", description: "Draft email referencing specific context for each prospect", actor: "human", tool: "Gmail", toolIcon: "Gmail", touchpoints: ["c2"], aiReady: true, aiReadyNote: "AI can generate personalized drafts using prospect context. Human reviews for relationship nuance." },
      { order: 4, title: "Log in CRM", description: "Record outreach activity in Salesforce", actor: "human", tool: "Salesforce", toolIcon: "Salesforce", touchpoints: ["c2"], sharedWith: [{ taskId: "t11", taskTitle: "Sales Forecasting" }, { taskId: "t12", taskTitle: "Deal Reviews & Pipeline Standups" }], aiReady: true, aiReadyNote: "CRM logging can be fully automated — AI records the activity, email content, and next steps after each outreach." },
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
    knowledge: [
      { contributorId: "c2", quote: "I spend about 20 minutes per email if I really personalize it. That's 6 emails a day max. My team does the same thing — we're all reinventing the wheel on every email.", interviewDate: "2026-03-16" },
      { contributorId: "c2", quote: "The CRM logging is the worst part. After every call or email, I have to go update Salesforce manually. Half the time I forget and then the data's stale.", interviewDate: "2026-03-16" },
    ],
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
      { order: 1, title: "Receive deal info from Sales", description: "Get contract, client details, and requirements", actor: "human", touchpoints: ["c3", "c2"], aiReady: true, aiReadyNote: "Deal data can be auto-extracted from Salesforce when a deal is marked Closed Won, eliminating the manual handoff email." },
      { order: 2, title: "Create onboarding checklist", description: "Build Notion doc with all setup tasks", actor: "human", tool: "Notion", toolIcon: "Notion", touchpoints: ["c3"], sharedWith: [{ taskId: "t8", taskTitle: "SOP Documentation" }], aiReady: true, aiReadyNote: "AI can generate a standardized checklist from deal data, pre-populated with client-specific requirements." },
      { order: 3, title: "Create Jira tickets", description: "Set up implementation tickets for Engineering", actor: "human", tool: "Jira", toolIcon: "Jira", touchpoints: ["c3", "c4"], aiReady: true, aiReadyNote: "Jira tickets can be auto-created from the onboarding checklist with templates and acceptance criteria." },
      { order: 4, title: "Schedule kickoff call", description: "Coordinate with client and internal team", actor: "human", tool: "Slack", toolIcon: "Slack", touchpoints: ["c3"], aiReady: false },
      { order: 5, title: "Assign team members", description: "Allocate resources based on requirements", actor: "human", touchpoints: ["c3"], aiReady: false },
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
    knowledge: [
      { contributorId: "c3", quote: "When Sales closes a deal, I get an email with the contract attached. Then I have to manually create the checklist, the Jira tickets, schedule the kickoff — it takes 4 hours per client.", interviewDate: "2026-03-17" },
      { contributorId: "c2", quote: "I close the deal and then I basically have to re-explain everything to Ops over email. There should be a way for the deal info to just flow through.", interviewDate: "2026-03-16" },
      { contributorId: "c4", quote: "The setup tickets from Ops are often missing details. I end up pinging Priya to clarify requirements that were probably in the original contract.", interviewDate: "2026-03-18" },
    ],
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
      { order: 1, title: "Synthesize user research", description: "Review feedback from support, sales, and interviews", actor: "human", touchpoints: ["c5"], sharedWith: [{ taskId: "t16", taskTitle: "User Research Synthesis" }], aiReady: true, aiReadyNote: "AI can aggregate feedback from multiple channels and surface themes, frequency, and sentiment automatically." },
      { order: 2, title: "Write PRD", description: "Create full product requirement document in Notion", actor: "human", tool: "Notion", toolIcon: "Notion", touchpoints: ["c5"], aiReady: true, aiReadyNote: "AI can draft a structured PRD from research notes and past examples. PM refines strategy and scope." },
      { order: 3, title: "Review with Engineering", description: "Align on feasibility, scope, and trade-offs", actor: "human", touchpoints: ["c5", "c4"], aiReady: false },
      { order: 4, title: "Create Linear tickets", description: "Break PRD into implementation tickets with acceptance criteria", actor: "human", tool: "Linear", toolIcon: "Linear", touchpoints: ["c5"], aiReady: true, aiReadyNote: "Linear tickets can be auto-generated from PRD sections with acceptance criteria and story points." },
      { order: 5, title: "Kickoff sprint", description: "Present to team, answer questions, clarify scope", actor: "human", touchpoints: ["c5", "c4"], aiReady: false },
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
    knowledge: [],
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
      { order: 1, title: "Export data from all sources", description: "Pull from QuickBooks, Salesforce, expense reports", actor: "human", touchpoints: ["c6"], sharedWith: [{ taskId: "t1", taskTitle: "Weekly Performance Report" }, { taskId: "t13", taskTitle: "Vendor Invoice Processing" }], aiReady: true, aiReadyNote: "API integrations can continuously sync data from all financial systems, eliminating batch exports." },
      { order: 2, title: "Reconcile accounts", description: "Match transactions across systems", actor: "human", tool: "Excel", toolIcon: "Excel", touchpoints: ["c6"], aiReady: true, aiReadyNote: "AI can auto-reconcile 95% of transactions using pattern matching. Human reviews exceptions only." },
      { order: 3, title: "Categorize transactions", description: "Assign categories, handle edge cases", actor: "human", tool: "QuickBooks", toolIcon: "QuickBooks", touchpoints: ["c6"], sharedWith: [{ taskId: "t13", taskTitle: "Vendor Invoice Processing" }], aiReady: true, aiReadyNote: "AI learns categorization patterns and handles routine entries. Flags ambiguous transactions for human review." },
      { order: 4, title: "Generate P&L", description: "Build profit and loss statement with comparisons", actor: "human", tool: "Google Sheets", toolIcon: "Google Sheets", touchpoints: ["c6"], aiReady: true, aiReadyNote: "P&L generation can be fully automated from categorized data with month-over-month comparisons." },
      { order: 5, title: "Write financial narrative", description: "Explain variances, add context for leadership", actor: "human", tool: "Google Docs", toolIcon: "Google Docs", touchpoints: ["c6"], aiReady: false },
      { order: 6, title: "Present to leadership", description: "Monthly finance review meeting", actor: "human", touchpoints: ["c6"], aiReady: false },
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
    knowledge: [
      { contributorId: "c6", quote: "Month-end close takes 5 full days. I'm reconciling data across QuickBooks, Salesforce, and our spreadsheets. 95% of the categorization is the same every month.", interviewDate: "2026-03-20" },
      { contributorId: "c6", quote: "By the time I finish the P&L, the data is already a week old. Leadership is making decisions on stale numbers.", interviewDate: "2026-03-20" },
    ],
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
      { order: 1, title: "Gather updates from teams", description: "Ping each team lead for their status before meeting", actor: "human", tool: "Slack", toolIcon: "Slack", touchpoints: ["c3", "c1", "c2", "c4", "c5"], aiReady: true, aiReadyNote: "AI can pull status from Linear, Jira, and Slack automatically — no manual pinging needed." },
      { order: 2, title: "Prepare agenda", description: "Organize topics, flag blockers, set meeting structure", actor: "human", tool: "Notion", toolIcon: "Notion", touchpoints: ["c3"], aiReady: true, aiReadyNote: "AI can generate agendas from gathered status data, flagging blockers and stalled items automatically." },
      { order: 3, title: "Run meeting", description: "Facilitate discussion, capture decisions and action items", actor: "human", tool: "Zoom", toolIcon: "Zoom", touchpoints: ["c3", "c1", "c2", "c4", "c5", "c6"], aiReady: false },
      { order: 4, title: "Write summary for execs", description: "High-level version with metrics and decisions", actor: "human", touchpoints: ["c3"], sharedWith: [{ taskId: "t1", taskTitle: "Weekly Performance Report" }], aiReady: true, aiReadyNote: "AI can generate audience-specific summaries from meeting notes — execs get metrics, teams get action items." },
      { order: 5, title: "Write summary for teams", description: "Detailed version with action items and owners", actor: "human", touchpoints: ["c3"], aiReady: true, aiReadyNote: "Same meeting notes, different audience. AI generates both versions simultaneously." },
      { order: 6, title: "Distribute and follow up", description: "Post to relevant channels, track action items", actor: "human", tool: "Slack", toolIcon: "Slack", touchpoints: ["c3"], aiReady: true, aiReadyNote: "Auto-post to channels, create follow-up reminders, track action item completion." },
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
    knowledge: [
      { contributorId: "c3", quote: "I spend 8 hours a week on status meetings and writing follow-ups. That's a full day every week just on updates. And I write three versions of the same thing for different audiences.", interviewDate: "2026-03-17" },
      { contributorId: "c4", quote: "Most of these status meetings could be a Slack message. I'd rather read an update async than sit in a 30-minute meeting.", interviewDate: "2026-03-18" },
    ],
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
      { order: 1, title: "Gather campaign requirements", description: "Goal, audience, channels, timeline, budget", actor: "human", touchpoints: ["c1"], aiReady: false },
      { order: 2, title: "Research audience and positioning", description: "Pull data, review competitive landscape", actor: "human", touchpoints: ["c1"], aiReady: true, aiReadyNote: "AI can pull audience data from GA, competitive intel from web, and synthesize positioning context." },
      { order: 3, title: "Write the brief", description: "Full document: context, strategy, messaging, timeline", actor: "human", tool: "Google Docs", toolIcon: "Google Docs", touchpoints: ["c1"], sharedWith: [{ taskId: "t1", taskTitle: "Weekly Performance Report" }], aiReady: true, aiReadyNote: "AI generates a complete first draft from bullet points, matching your existing brief template and tone." },
      { order: 4, title: "Review with stakeholders", description: "Get alignment from leadership and cross-functional", actor: "human", touchpoints: ["c1"], aiReady: false },
      { order: 5, title: "Distribute to creative team", description: "Brief kicks off design and content work", actor: "human", touchpoints: ["c1"], aiReady: true, aiReadyNote: "Auto-distribute finalized brief to creative channels with relevant assets attached." },
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
    knowledge: [],
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
      { order: 1, title: "Interview process owner", description: "Talk through how they do it step by step", actor: "human", touchpoints: ["c3"], aiReady: false },
      { order: 2, title: "Draft SOP document", description: "Write up structured steps, decisions, edge cases", actor: "human", tool: "Notion", toolIcon: "Notion", touchpoints: ["c3"], sharedWith: [{ taskId: "t3", taskTitle: "New Client Onboarding" }], aiReady: true, aiReadyNote: "AI converts conversational walkthroughs into structured SOPs with decision trees, checklists, and edge cases." },
      { order: 3, title: "Review with team", description: "Verify accuracy, fill gaps", actor: "human", touchpoints: ["c3"], aiReady: false },
      { order: 4, title: "Publish and train", description: "Store in wiki, train relevant team members", actor: "human", touchpoints: ["c3"], aiReady: true, aiReadyNote: "AI can generate both detailed and quick-reference versions, then distribute to relevant channels." },
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
    knowledge: [],
    tags: ["documentation", "processes", "knowledge"],
    lastUpdated: "2026-03-17T09:00:00Z",
    addedBy: "c3",
  },
  // ─── Additional tasks to fill out the map ───
  {
    id: "t9", title: "Content Calendar Planning", description: "Plan monthly content across blog, social, and email channels.", department: "Marketing", contributors: ["c1"], frequency: "Monthly", timeSpent: "4 hours", tools: ["Notion", "Google Sheets"],
    inputs: [{ what: "Performance data", fromOrTo: "Google Analytics", method: "Manual" }],
    steps: [{ order: 1, title: "Review past performance", description: "Check what worked last month", actor: "human" }, { order: 2, title: "Draft calendar", description: "Plan topics and dates", actor: "human" }],
    outputs: [{ what: "Content calendar", fromOrTo: "Creative team", method: "Notion" }],
    painPoints: ["Takes a full afternoon"], isBottleneck: false, knowledge: [], tags: ["content", "planning"], lastUpdated: "2026-03-15T10:00:00Z", addedBy: "c1",
  },
  {
    id: "t10", title: "Lead Scoring & Qualification", description: "Score inbound leads and route qualified ones to sales reps.", department: "Marketing", contributors: ["c1"], frequency: "Daily", timeSpent: "1 hour", tools: ["HubSpot", "Salesforce"],
    inputs: [{ what: "Inbound leads", fromOrTo: "Website + Ads", method: "HubSpot" }],
    steps: [{ order: 1, title: "Review new leads", description: "Check lead data and engagement", actor: "human" }, { order: 2, title: "Score and route", description: "Assign score, route to rep", actor: "human" }],
    outputs: [{ what: "Qualified leads", fromOrTo: "Sales", method: "Salesforce" }],
    painPoints: ["Manual scoring is inconsistent"], isBottleneck: false, knowledge: [], tags: ["leads", "qualification"], lastUpdated: "2026-03-15T10:00:00Z", addedBy: "c1",
  },
  {
    id: "t11", title: "Sales Forecasting", description: "Compile weekly sales forecast from pipeline data across all reps.", department: "Sales", contributors: ["c2"], frequency: "Weekly", timeSpent: "2 hours", tools: ["Salesforce", "Google Sheets"],
    inputs: [{ what: "Pipeline data", fromOrTo: "Salesforce", method: "Manual export" }],
    steps: [{ order: 1, title: "Export pipeline", description: "Pull current pipeline from CRM", actor: "human" }, { order: 2, title: "Apply weightings", description: "Adjust based on stage and confidence", actor: "human" }, { order: 3, title: "Build forecast", description: "Create summary for leadership", actor: "human" }],
    outputs: [{ what: "Weekly forecast", fromOrTo: "Finance + Leadership", method: "Google Sheets" }],
    painPoints: ["Pulling from 5 different reports", "Numbers are always stale by the time they're compiled"], isBottleneck: false, knowledge: [], tags: ["sales", "forecasting"], lastUpdated: "2026-03-16T14:00:00Z", addedBy: "c2",
  },
  {
    id: "t12", title: "Deal Reviews & Pipeline Standups", description: "Weekly pipeline review with each rep to update deal status and strategy.", department: "Sales", contributors: ["c2"], frequency: "Weekly", timeSpent: "3 hours", tools: ["Salesforce", "Zoom"],
    inputs: [{ what: "Deal updates from reps", fromOrTo: "Sales team", method: "Meeting" }],
    steps: [{ order: 1, title: "Prep deal list", description: "Pull stalled and key deals", actor: "human" }, { order: 2, title: "Run 1:1 reviews", description: "30 min per rep, review pipeline", actor: "human" }],
    outputs: [{ what: "Updated pipeline", fromOrTo: "Salesforce", method: "Manual update" }],
    painPoints: ["3 hours of meetings every week", "CRM updates happen after meetings, not during"], isBottleneck: false, knowledge: [], tags: ["sales", "pipeline", "meetings"], lastUpdated: "2026-03-16T14:00:00Z", addedBy: "c2",
  },
  {
    id: "t13", title: "Vendor Invoice Processing", description: "Receive, verify, and process vendor invoices for payment.", department: "Finance", contributors: ["c6"], frequency: "Weekly", timeSpent: "3 hours", tools: ["QuickBooks", "Gmail", "Google Sheets"],
    inputs: [{ what: "Invoices from vendors", fromOrTo: "Vendors", method: "Email" }],
    steps: [{ order: 1, title: "Collect invoices", description: "Check email for new invoices", actor: "human" }, { order: 2, title: "Verify and categorize", description: "Match to POs, categorize", actor: "human" }, { order: 3, title: "Enter in QuickBooks", description: "Manual data entry", actor: "human" }],
    outputs: [{ what: "Processed invoices", fromOrTo: "QuickBooks", method: "Manual entry" }],
    painPoints: ["Manual data entry", "Chasing down approvals"], isBottleneck: false, knowledge: [], tags: ["finance", "invoices"], lastUpdated: "2026-03-20T10:00:00Z", addedBy: "c6",
  },
  {
    id: "t14", title: "Code Review & PR Management", description: "Review pull requests, provide feedback, and manage merge queue.", department: "Engineering", contributors: ["c4"], frequency: "Daily", timeSpent: "2 hours", tools: ["GitHub", "Slack"],
    inputs: [{ what: "Pull requests", fromOrTo: "Engineering team", method: "GitHub" }],
    steps: [{ order: 1, title: "Review queue", description: "Check open PRs by priority", actor: "human" }, { order: 2, title: "Review code", description: "Read diff, check quality, test coverage", actor: "human" }, { order: 3, title: "Provide feedback", description: "Comment or approve", actor: "human" }],
    outputs: [{ what: "Approved PRs", fromOrTo: "Main branch", method: "GitHub" }],
    painPoints: ["Context switching between reviews and coding", "No automated quality checks"], isBottleneck: false, knowledge: [], tags: ["engineering", "code-review"], lastUpdated: "2026-03-18T11:00:00Z", addedBy: "c4",
  },
  {
    id: "t15", title: "Release Notes & Changelog", description: "Write release notes for each deployment, distribute to stakeholders.", department: "Engineering", contributors: ["c4"], frequency: "Bi-weekly", timeSpent: "1.5 hours", tools: ["GitHub", "Notion", "Slack"],
    inputs: [{ what: "Merged PRs and commits", fromOrTo: "GitHub", method: "Manual" }],
    steps: [{ order: 1, title: "Gather merged PRs", description: "List all PRs since last release", actor: "human" }, { order: 2, title: "Write release notes", description: "Summarize changes in plain language", actor: "human" }, { order: 3, title: "Distribute", description: "Post to Slack and Notion", actor: "human" }],
    outputs: [{ what: "Release notes", fromOrTo: "Product + Marketing + Sales", method: "Slack + Notion" }],
    painPoints: ["Tedious to compile from PRs", "Nobody reads them anyway"], isBottleneck: false,
    recommendation: {
      summary: "Auto-generate release notes from PR descriptions and commit messages.", impact: { timeSaved: "1 hr/sprint", costSaved: "$3,000/year", qualityGain: "Consistent, timely notes" }, priority: "medium", difficulty: "easy",
      newSteps: [{ order: 1, title: "AI compiles from PRs", description: "Extracts summaries from merged PRs", actor: "ai" }, { order: 2, title: "Engineer reviews", description: "Quick check for accuracy", actor: "human" }, { order: 3, title: "Auto-distribute", description: "Posts to channels", actor: "ai" }],
      aiHandles: ["PR summarization", "Formatting", "Distribution"], humanDecides: ["What to highlight", "What's customer-facing vs internal"], phase: 1,
    },
    knowledge: [],
    tags: ["engineering", "documentation"], lastUpdated: "2026-03-18T11:00:00Z", addedBy: "c4",
  },
  {
    id: "t16", title: "User Research Synthesis", description: "Aggregate and synthesize user feedback from support, sales, and direct interviews.", department: "Product", contributors: ["c5"], frequency: "Weekly", timeSpent: "3 hours", tools: ["Notion", "Google Docs", "Slack"],
    inputs: [{ what: "Support tickets", fromOrTo: "Support", method: "Zendesk" }, { what: "Sales call notes", fromOrTo: "Sales", method: "Slack" }, { what: "Interview transcripts", fromOrTo: "Research", method: "Google Docs" }],
    steps: [{ order: 1, title: "Gather feedback from all channels", description: "Check support, sales notes, interview transcripts", actor: "human" }, { order: 2, title: "Tag and categorize", description: "Group by theme, feature, and severity", actor: "human" }, { order: 3, title: "Write synthesis doc", description: "Summarize trends and insights", actor: "human" }],
    outputs: [{ what: "Research synthesis", fromOrTo: "Product + Engineering", method: "Notion" }],
    painPoints: ["Feedback scattered across 4 channels", "Synthesis is subjective and time-consuming"], isBottleneck: false,
    recommendation: {
      summary: "AI aggregates feedback from all channels and produces structured synthesis.", impact: { timeSaved: "2 hrs/week", costSaved: "$5,200/year", qualityGain: "Nothing falls through cracks" }, priority: "high", difficulty: "moderate",
      newSteps: [{ order: 1, title: "AI pulls from all channels", description: "Aggregates support, sales, and research feedback", actor: "ai" }, { order: 2, title: "AI categorizes and themes", description: "Tags by theme, frequency, severity", actor: "ai" }, { order: 3, title: "PM reviews and interprets", description: "Adds strategic context and priority", actor: "human" }],
      aiHandles: ["Multi-channel aggregation", "Categorization", "Trend detection"], humanDecides: ["Strategic interpretation", "Priority decisions", "What to act on"], phase: 2,
    },
    knowledge: [],
    tags: ["product", "research", "feedback"], lastUpdated: "2026-03-19T13:00:00Z", addedBy: "c5",
  },
  {
    id: "t17", title: "Expense Report Processing", description: "Collect, verify, and reimburse employee expense reports.", department: "Finance", contributors: ["c6"], frequency: "Bi-weekly", timeSpent: "2 hours", tools: ["Google Sheets", "Gmail", "QuickBooks"],
    inputs: [{ what: "Expense submissions", fromOrTo: "All employees", method: "Email + Sheets" }],
    steps: [{ order: 1, title: "Collect submissions", description: "Check email for expense reports", actor: "human" }, { order: 2, title: "Verify receipts", description: "Match receipts to claims", actor: "human" }, { order: 3, title: "Approve and process", description: "Enter in QuickBooks for reimbursement", actor: "human" }],
    outputs: [{ what: "Processed reimbursements", fromOrTo: "Employees", method: "Direct deposit" }],
    painPoints: ["Chasing missing receipts", "Manual data entry"], isBottleneck: false, knowledge: [], tags: ["finance", "expenses"], lastUpdated: "2026-03-20T10:00:00Z", addedBy: "c6",
  },
  {
    id: "t18", title: "Client Health Monitoring", description: "Track client satisfaction and flag at-risk accounts for proactive outreach.", department: "Operations", contributors: ["c3"], frequency: "Weekly", timeSpent: "2 hours", tools: ["Salesforce", "Slack", "Notion"],
    inputs: [{ what: "Usage data", fromOrTo: "Product analytics", method: "Dashboard" }, { what: "Support tickets", fromOrTo: "Support", method: "Zendesk" }],
    steps: [{ order: 1, title: "Review client metrics", description: "Check usage, support volume, NPS", actor: "human" }, { order: 2, title: "Flag at-risk accounts", description: "Identify declining engagement", actor: "human" }, { order: 3, title: "Alert account owners", description: "Notify Sales of at-risk clients", actor: "human" }],
    outputs: [{ what: "Client health report", fromOrTo: "Sales", method: "Slack" }],
    painPoints: ["Manual data compilation", "By the time we flag it, it's often too late"], isBottleneck: false, knowledge: [], tags: ["operations", "client-success"], lastUpdated: "2026-03-17T09:00:00Z", addedBy: "c3",
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
