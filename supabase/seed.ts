/**
 * Seed script: creates a company, 20 contributors, interview tokens,
 * and realistic interview transcripts in Supabase.
 *
 * Run with: npx tsx supabase/seed.ts
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Org Structure: 20 people across 6 departments ───

interface Person {
  name: string;
  email: string;
  role: string;
  department: string;
  ai_comfort: "none" | "beginner" | "intermediate" | "advanced";
  transcript: { role: "assistant" | "user"; content: string }[];
}

const PEOPLE: Person[] = [
  // ─── MARKETING (4) ───
  {
    name: "Sarah Chen", email: "sarah@zippyzaps.com", role: "Marketing Manager", department: "Marketing", ai_comfort: "intermediate",
    transcript: [
      { role: "assistant", content: "Hi Sarah! I'm the Vishtan interviewer for Zippy Zaps. Let's start — what's your role here?" },
      { role: "user", content: "I'm the Marketing Manager. I oversee all our campaigns, content, and performance reporting." },
      { role: "assistant", content: "Great! What tools do you use regularly?" },
      { role: "user", content: "Google Analytics, HubSpot, Google Sheets, Google Docs, Canva, Slack, and Gmail mostly. I also use Loom for async updates." },
      { role: "assistant", content: "Walk me through your typical week — what takes up the most time?" },
      { role: "user", content: "Every Friday I spend about 3 hours pulling data from GA, HubSpot, and our spreadsheets to build the weekly performance report. I compile traffic, conversion, and source data into a formatted report for leadership. It's very manual — lots of copy-pasting between tools." },
      { role: "assistant", content: "That sounds tedious. What else takes significant time?" },
      { role: "user", content: "Campaign briefs. When we launch a new campaign, I write a 2-3 page brief that covers objectives, audience, channels, budget, and timeline. Takes me about 2-3 hours each. The format is always the same but I start from scratch every time." },
      { role: "assistant", content: "Do you have a template?" },
      { role: "user", content: "Sort of — I usually duplicate the last one and edit it. But half the time the data is outdated and I have to re-pull metrics anyway. I also spend about 4 hours a month on content calendar planning, coordinating with Tom on blog posts and Maya on ad schedules." },
      { role: "assistant", content: "What about pain points — what feels most frustrating?" },
      { role: "user", content: "The weekly report is the worst. The format never changes — it's the same template every time. I'm literally just a human copy-paste machine between three tools. Also, I pull some of the same HubSpot data that Sales pulls for their forecasting. Total waste." },
      { role: "assistant", content: "Who do you hand off work to, and who sends you things?" },
      { role: "user", content: "I send the weekly report to leadership via email. I get campaign performance data from Maya. I hand off approved briefs to Tom for content creation and Jake for design assets. Sales sometimes asks me for marketing-sourced lead data which I pull from HubSpot." },
      { role: "assistant", content: "How comfortable are you with AI tools?" },
      { role: "user", content: "I use ChatGPT regularly for drafting copy and brainstorming. I've tried Claude for longer documents. I'd say intermediate — I use it but haven't built any automations." },
    ],
  },
  {
    name: "Tom Walsh", email: "tom@zippyzaps.com", role: "Content Writer", department: "Marketing", ai_comfort: "beginner",
    transcript: [
      { role: "assistant", content: "Hi Tom! What's your role at Zippy Zaps?" },
      { role: "user", content: "I'm the Content Writer. I handle blog posts, email newsletters, social media copy, and some internal comms." },
      { role: "assistant", content: "What tools do you work with?" },
      { role: "user", content: "Google Docs for writing, Notion for our content calendar, Slack, Gmail, and sometimes Canva for social graphics when Jake is busy." },
      { role: "assistant", content: "What does a typical week look like?" },
      { role: "user", content: "I write 2-3 blog posts a week. Each one takes about 3-4 hours — research, outline, draft, edit. I also write the weekly email newsletter which takes about 2 hours. And I draft social posts for the week, maybe 1-2 hours total." },
      { role: "assistant", content: "How does the blog post process work step by step?" },
      { role: "user", content: "Sarah gives me a brief or topic. I research it, check what competitors have written, outline the structure, write the first draft in Google Docs, then Sarah reviews it. Usually 1-2 rounds of edits. Then I format it for the CMS, add images, and publish. The research phase is the longest — I spend about an hour per post just reading other content." },
      { role: "assistant", content: "What feels most tedious?" },
      { role: "user", content: "The research. I read like 10 articles for every post I write. Also, reformatting content for different channels — I write a blog post, then have to rewrite parts of it for email and social. It's the same ideas just different formats." },
      { role: "assistant", content: "Where do you get information from and hand off to?" },
      { role: "user", content: "Sarah sends me briefs and topics. I sometimes get data from Maya for data-driven content. I hand finished posts to Sarah for approval, and I give Jake asset requests for featured images." },
      { role: "assistant", content: "How comfortable are you with AI tools?" },
      { role: "user", content: "I've tried ChatGPT a few times for outlines but honestly the output is pretty generic. I'm a beginner." },
    ],
  },
  {
    name: "Maya Rodriguez", email: "maya@zippyzaps.com", role: "Growth Marketer", department: "Marketing", ai_comfort: "advanced",
    transcript: [
      { role: "assistant", content: "Hi Maya! What do you do at Zippy Zaps?" },
      { role: "user", content: "I'm the Growth Marketer. I run paid ads, manage our analytics, and optimize our conversion funnel." },
      { role: "assistant", content: "What tools?" },
      { role: "user", content: "Google Analytics, Google Ads, Meta Ads Manager, HubSpot, Google Sheets, Looker Studio, Hotjar, and Slack." },
      { role: "assistant", content: "Walk me through your week." },
      { role: "user", content: "Mondays I review weekend ad performance and adjust budgets — takes about 2 hours. Throughout the week I monitor campaigns and make optimizations, maybe an hour a day. Wednesdays I do a deep analytics dive for Sarah's weekly report — I pull conversion data, funnel metrics, and attribution data. That's about 2 hours. Fridays I plan the next week's ad spend and creative tests." },
      { role: "assistant", content: "Tell me more about the analytics dive." },
      { role: "user", content: "I pull data from GA, Google Ads, and Meta into a master spreadsheet. Then I calculate week-over-week changes, identify anomalies, and write up a summary. Sarah uses my numbers for the leadership report. It's very manual — I wish there was a way to auto-pull this data." },
      { role: "assistant", content: "What's most frustrating?" },
      { role: "user", content: "The data pulling. I do the same exports every week from the same three platforms. Also, I format the same spreadsheet every time. It should be automated but nobody has set it up." },
      { role: "assistant", content: "Who do you coordinate with?" },
      { role: "user", content: "I give Sarah the analytics data. I coordinate with Jake on ad creative. I share lead quality data with Rachel in Sales so she knows which channels are driving the best leads." },
      { role: "assistant", content: "AI comfort level?" },
      { role: "user", content: "Advanced. I've built custom GPTs for ad copy generation and I use Claude for analyzing campaign data. I've also experimented with automated reporting scripts." },
    ],
  },
  {
    name: "Jake Liu", email: "jake@zippyzaps.com", role: "Brand Designer", department: "Marketing", ai_comfort: "intermediate",
    transcript: [
      { role: "assistant", content: "Hi Jake! What's your role?" },
      { role: "user", content: "Brand Designer. I create all visual assets — ad creative, social graphics, blog images, pitch deck templates, and brand guidelines." },
      { role: "assistant", content: "What tools?" },
      { role: "user", content: "Figma, Canva, Adobe Photoshop, Google Slides, Slack, and Notion." },
      { role: "assistant", content: "What does your typical week look like?" },
      { role: "user", content: "I get about 8-10 design requests per week. Each one takes anywhere from 30 minutes to 4 hours depending on complexity. I also spend about 3 hours a week updating our brand asset library and creating templates. And I sit in on campaign kickoff meetings to understand creative direction." },
      { role: "assistant", content: "How do design requests come in?" },
      { role: "user", content: "All over the place — Slack DMs, emails, Notion comments, sometimes someone just walks over. There's no formal request process. I have to chase people for specs half the time. What size? What copy? What's the deadline? It's chaotic." },
      { role: "assistant", content: "That sounds frustrating. Anything else?" },
      { role: "user", content: "Yeah, the revision cycle. I'll create something, get feedback, revise it, get more feedback from someone else who wasn't in the first review, revise again. Sometimes I do 4-5 rounds for a simple social graphic. No single source of truth for approvals." },
      { role: "assistant", content: "Who do you work with most?" },
      { role: "user", content: "Tom sends me blog image requests. Sarah sends me campaign creative briefs. Maya needs ad creative. Derek from Sales sometimes needs custom pitch deck slides. It's basically everyone." },
      { role: "assistant", content: "AI comfort?" },
      { role: "user", content: "Intermediate. I use Midjourney for concept exploration and ChatGPT for writing alt text and social copy variations." },
    ],
  },

  // ─── SALES (4) ───
  {
    name: "Marcus Rivera", email: "marcus@zippyzaps.com", role: "Sales Manager", department: "Sales", ai_comfort: "beginner",
    transcript: [
      { role: "assistant", content: "Hi Marcus! What's your role at Zippy Zaps?" },
      { role: "user", content: "I'm the Sales Manager. I run the sales team, manage the pipeline, do forecasting, and close our bigger deals." },
      { role: "assistant", content: "What tools do you use?" },
      { role: "user", content: "Salesforce is the big one. Also HubSpot for lead data, Google Sheets for forecasting models, Slack, Zoom for calls, Gmail, and Loom for async demos." },
      { role: "assistant", content: "Walk me through your week." },
      { role: "user", content: "Mondays are pipeline review — I spend 2 hours going through every deal in Salesforce, updating stages, checking next steps. Tuesdays I have deal review meetings with the team, about 3 hours total. I spend about 2 hours a week on sales forecasting — pulling data from Salesforce into a spreadsheet model. And I'm on prospect calls maybe 4-5 hours a week for the bigger accounts." },
      { role: "assistant", content: "Tell me about the forecasting process." },
      { role: "user", content: "I export pipeline data from Salesforce, paste it into our Google Sheets model, apply our conversion rates by stage, and produce a quarterly forecast. The annoying part is that I pull some of the same HubSpot data that Marketing pulls for their reports. We should just have one source of truth." },
      { role: "assistant", content: "What's most painful?" },
      { role: "user", content: "CRM hygiene. Getting reps to update Salesforce is like pulling teeth. I spend an hour a week just chasing people to update deal stages. Also, when we close a deal, the handoff to Ops takes forever — like 14 days. I close the deal and then basically have to re-explain everything to Priya over email." },
      { role: "assistant", content: "What does the handoff look like?" },
      { role: "user", content: "I send Priya an email with the contract, client details, and timeline. She then manually creates a Jira project, an onboarding checklist, and schedules the kickoff. There's no automation — it's all copy-paste from my email into her tools." },
      { role: "assistant", content: "AI comfort?" },
      { role: "user", content: "Beginner. I've tried ChatGPT for email drafts but that's about it." },
    ],
  },
  {
    name: "Rachel Kim", email: "rachel@zippyzaps.com", role: "SDR Lead", department: "Sales", ai_comfort: "intermediate",
    transcript: [
      { role: "assistant", content: "Hi Rachel! What do you do?" },
      { role: "user", content: "I'm the SDR Lead. I manage our outbound prospecting team and run lead qualification." },
      { role: "assistant", content: "Tools?" },
      { role: "user", content: "Salesforce, HubSpot, Outreach.io for sequences, LinkedIn Sales Navigator, Zoom, Slack, and Gmail." },
      { role: "assistant", content: "What's your typical week?" },
      { role: "user", content: "I write and manage email sequences — that's about 4 hours a week. I review and score inbound leads every morning, about 30 minutes. I do 1-on-1s with my SDRs to review their pipeline, about 3 hours. And I personally handle qualification calls for our bigger inbound leads, maybe 5 hours a week." },
      { role: "assistant", content: "How does lead scoring work?" },
      { role: "user", content: "Honestly, it's pretty manual. I look at the lead in HubSpot — company size, industry, title, what pages they visited, what content they downloaded. Then I assign a score and route to the right SDR. I do this for maybe 15-20 leads a day. It takes forever." },
      { role: "assistant", content: "What's most frustrating?" },
      { role: "user", content: "Writing outreach sequences. I spend hours crafting personalized emails that get 3% reply rates. Also the lead scoring — it's the same criteria every time, I'm basically a human algorithm. And I get lead data from Maya in Marketing but it's always in a different format than what I need." },
      { role: "assistant", content: "Who do you coordinate with?" },
      { role: "user", content: "Maya sends me lead quality data from marketing campaigns. I hand qualified leads to Derek for demos. Marcus reviews my pipeline weekly." },
      { role: "assistant", content: "AI comfort?" },
      { role: "user", content: "Intermediate. I use ChatGPT a lot for writing outreach emails. I've also tried AI tools for lead enrichment." },
    ],
  },
  {
    name: "Derek Johnson", email: "derek@zippyzaps.com", role: "Account Executive", department: "Sales", ai_comfort: "beginner",
    transcript: [
      { role: "assistant", content: "Hi Derek! What's your role?" },
      { role: "user", content: "Account Executive. I run demos, write proposals, negotiate contracts, and close deals." },
      { role: "assistant", content: "Tools?" },
      { role: "user", content: "Salesforce, Zoom, Google Slides, Google Docs, PandaDoc for proposals, Slack, and Gmail." },
      { role: "assistant", content: "What takes up most of your time?" },
      { role: "user", content: "Proposal writing. I probably write 3-4 proposals a week, each takes 2-3 hours. I customize our template for each prospect — company background, proposed solution, pricing, timeline. It's mostly the same structure but I personalize every section." },
      { role: "assistant", content: "What else?" },
      { role: "user", content: "Demo prep takes about an hour per prospect. I research the company, customize the demo deck, and prepare talking points. I also spend about 3 hours a week updating Salesforce with notes from calls. And I have to build custom pitch decks for bigger deals — sometimes I need Jake from Marketing for slides." },
      { role: "assistant", content: "Pain points?" },
      { role: "user", content: "Proposal writing is so repetitive. 80% of every proposal is the same — I just change the company name, their pain points, and the pricing. Also, I waste time re-researching companies that Marketing already has data on. And the CRM updates — I hate logging notes after every call." },
      { role: "assistant", content: "Handoffs?" },
      { role: "user", content: "Rachel sends me qualified leads. I hand closed deals to Marcus who coordinates with Priya in Ops for onboarding. Jake helps me with custom deck slides." },
      { role: "assistant", content: "AI comfort?" },
      { role: "user", content: "Beginner. I've used ChatGPT for email follow-ups but that's it." },
    ],
  },
  {
    name: "Nina Patel", email: "nina@zippyzaps.com", role: "Customer Success Manager", department: "Sales", ai_comfort: "beginner",
    transcript: [
      { role: "assistant", content: "Hi Nina! Tell me about your role." },
      { role: "user", content: "I'm a Customer Success Manager. I manage our post-sale client relationships — onboarding, health monitoring, renewals, and upsells." },
      { role: "assistant", content: "Tools?" },
      { role: "user", content: "Salesforce, Jira for tracking client requests, Slack, Zoom, Google Sheets for health scores, Gmail." },
      { role: "assistant", content: "What's your typical week?" },
      { role: "user", content: "I have check-in calls with 8-10 clients a week, about 30 minutes each. I monitor client health scores manually in a spreadsheet — usage metrics, support tickets, NPS. I spend about 2 hours a week updating that. I also handle escalations — maybe 3-4 a week — which can eat up a whole afternoon." },
      { role: "assistant", content: "How does health monitoring work?" },
      { role: "user", content: "I pull usage data from our dashboard, check Jira for open tickets, look at their last NPS score, and manually update a Google Sheet. If anything looks off — usage dropping, too many tickets — I flag it and reach out proactively. It's all manual lookups across 3-4 systems." },
      { role: "assistant", content: "What's frustrating?" },
      { role: "user", content: "The manual health score updates. I'm just copying numbers from one place to another. Also, when a new client onboards, Priya hands me off but there's no structured handoff document. I have to piece together what was promised from the contract and random Slack messages." },
      { role: "assistant", content: "Coordination?" },
      { role: "user", content: "Priya hands off new clients after onboarding. I escalate product issues to James in Engineering. I work with Marcus on renewal forecasting." },
      { role: "assistant", content: "AI?" },
      { role: "user", content: "Beginner. Haven't really explored it for my work." },
    ],
  },

  // ─── OPERATIONS (3) ───
  {
    name: "Priya Patel", email: "priya@zippyzaps.com", role: "Operations Manager", department: "Operations", ai_comfort: "beginner",
    transcript: [
      { role: "assistant", content: "Hi Priya! What's your role?" },
      { role: "user", content: "Operations Manager. I handle client onboarding, internal processes, SOPs, and basically make sure everything runs smoothly between teams." },
      { role: "assistant", content: "Tools?" },
      { role: "user", content: "Jira, Notion, Google Docs, Google Sheets, Slack, Gmail, and Zoom." },
      { role: "assistant", content: "What takes the most time?" },
      { role: "user", content: "Client onboarding — by far. When Sales closes a deal, I get an email from Marcus with the contract attached. Then I have to manually create a checklist in Jira, set up the project, schedule the kickoff call, send welcome emails, and coordinate with Engineering if there's any custom setup. Each onboarding takes about 4 hours and I do 2-3 a month." },
      { role: "assistant", content: "What else?" },
      { role: "user", content: "I run our weekly status meetings — takes about 8 hours a week including prep. I collect updates from every department via Slack, compile them into a status doc, present it, then send out action items. I also maintain our SOPs — takes about 3 hours per SOP to write or update. We have about 20 and most are outdated." },
      { role: "assistant", content: "What's most painful?" },
      { role: "user", content: "I'm the single point of failure for onboarding. If I'm sick or on vacation, nothing moves. Also the status meetings — I spend more time collecting updates than discussing them. Everyone should just post their own updates asynchronously." },
      { role: "assistant", content: "Handoffs?" },
      { role: "user", content: "Marcus hands me closed deals. I hand onboarded clients to Nina for ongoing success. Carlos helps me with project tracking. I coordinate with James when engineering work is needed for custom client setups." },
      { role: "assistant", content: "AI?" },
      { role: "user", content: "Beginner. I've used ChatGPT a couple times for writing SOPs." },
    ],
  },
  {
    name: "Carlos Mendez", email: "carlos@zippyzaps.com", role: "Project Coordinator", department: "Operations", ai_comfort: "none",
    transcript: [
      { role: "assistant", content: "Hi Carlos! What do you do?" },
      { role: "user", content: "Project Coordinator. I track project timelines, manage resource allocation, and keep cross-team projects on schedule." },
      { role: "assistant", content: "Tools?" },
      { role: "user", content: "Jira, Google Sheets, Slack, and Gmail." },
      { role: "assistant", content: "Walk me through your week." },
      { role: "user", content: "Monday mornings I update all project timelines in our master Google Sheet — about 2 hours. Then I check in with each team lead to see if anything is blocked. I send status updates to stakeholders every Wednesday — that's about an hour of compiling info. Thursdays I do resource planning for the next sprint with Priya." },
      { role: "assistant", content: "What feels repetitive?" },
      { role: "user", content: "The timeline updates. I manually check every ticket in Jira, update the master spreadsheet, and recalculate dates. If Jira and the spreadsheet could just sync automatically, I'd save 2 hours a week minimum." },
      { role: "assistant", content: "Who do you work with?" },
      { role: "user", content: "Everyone, really. Priya directs me. I coordinate with James for engineering timelines, Lisa N for product milestones, and Sarah for marketing launch dates." },
      { role: "assistant", content: "AI?" },
      { role: "user", content: "Never used any AI tools." },
    ],
  },
  {
    name: "Amy Lin", email: "amy@zippyzaps.com", role: "Office Manager", department: "Operations", ai_comfort: "none",
    transcript: [
      { role: "assistant", content: "Hi Amy! What's your role?" },
      { role: "user", content: "Office Manager. I handle vendor relationships, office supplies, event planning, and general admin." },
      { role: "assistant", content: "Tools?" },
      { role: "user", content: "Google Sheets, Gmail, QuickBooks, Slack." },
      { role: "assistant", content: "What takes up your time?" },
      { role: "user", content: "Vendor invoice processing — I get about 15-20 invoices a month. Each one I have to verify against our POs, enter into QuickBooks, and get approval from Priya or David. Takes about 3 hours a week. I also handle expense report processing — collecting receipts from employees, categorizing them, entering into QuickBooks. That's about 2 hours bi-weekly." },
      { role: "assistant", content: "Pain points?" },
      { role: "user", content: "Chasing people for receipts. I send 3-4 reminder emails before people submit their expense reports. And the invoice matching — comparing POs to invoices line by line is so tedious." },
      { role: "assistant", content: "Handoffs?" },
      { role: "user", content: "David in Finance reviews everything I process. I send him the monthly vendor report. Priya approves larger purchases." },
      { role: "assistant", content: "AI?" },
      { role: "user", content: "No, never tried it." },
    ],
  },

  // ─── ENGINEERING (4) ───
  {
    name: "James Park", email: "james@zippyzaps.com", role: "Engineering Lead", department: "Engineering", ai_comfort: "advanced",
    transcript: [
      { role: "assistant", content: "Hi James! What's your role?" },
      { role: "user", content: "Engineering Lead. I manage the engineering team, do code reviews, set technical direction, and handle sprint planning with product." },
      { role: "assistant", content: "Tools?" },
      { role: "user", content: "GitHub, VS Code, Jira, Linear, Slack, Notion, Zoom, and Figma for design handoffs." },
      { role: "assistant", content: "What's your week like?" },
      { role: "user", content: "Sprint planning with Lisa Nakamura takes about 4 hours per sprint — reviewing the backlog, sizing stories, planning capacity. Code reviews eat about 2 hours a day. I write release notes every two weeks, maybe 1.5 hours. Architecture reviews for bigger features are a few hours a week. And I handle technical escalations from Customer Success." },
      { role: "assistant", content: "Tell me about the code review process." },
      { role: "user", content: "Developer opens a PR on GitHub, I get notified, I review the code — check for bugs, performance, style, tests. I leave comments, they address them, I approve. For a medium PR it takes 20-30 minutes. I review about 5-8 PRs a day." },
      { role: "assistant", content: "What's painful?" },
      { role: "user", content: "Release notes. I have to go through every merged PR since the last release, read the descriptions, summarize the changes in user-friendly language, and organize them by category. It's 90% reading git history and reformatting. Also sprint planning — Lisa and I spend half the time re-prioritizing the same backlog items." },
      { role: "assistant", content: "Handoffs?" },
      { role: "user", content: "Lisa Nakamura sends me PRDs and we plan sprints together. Sam handles deployments after I approve releases. Nina escalates client bugs to me. Kevin handles the backend implementation for features I scope." },
      { role: "assistant", content: "AI?" },
      { role: "user", content: "Advanced. I use Copilot daily for coding, Claude for architecture discussions, and I've built internal tools with the OpenAI API." },
    ],
  },
  {
    name: "Lisa Chen", email: "lisac@zippyzaps.com", role: "Frontend Engineer", department: "Engineering", ai_comfort: "intermediate",
    transcript: [
      { role: "assistant", content: "Hi Lisa! What do you do?" },
      { role: "user", content: "I'm a Frontend Engineer. I build the UI for our product — components, pages, interactions, accessibility." },
      { role: "assistant", content: "Tools?" },
      { role: "user", content: "VS Code, GitHub, Figma, Chrome DevTools, Linear, Storybook, Slack." },
      { role: "assistant", content: "What does your week look like?" },
      { role: "user", content: "I spend about 60% of my time writing code. Maybe 2 hours a day on code reviews — both reviewing others' PRs and addressing feedback on mine. I have design handoff meetings with Anna twice a week — about an hour each where we go through Figma specs. And I maintain our component library in Storybook, about 3 hours a week." },
      { role: "assistant", content: "What's frustrating?" },
      { role: "user", content: "Design handoffs. Anna gives me a Figma file but often the specs aren't complete — missing hover states, mobile breakpoints, edge cases. I have to ping her on Slack multiple times to get clarity. Also, writing tests is tedious — I know I need to do it but it takes almost as long as writing the feature." },
      { role: "assistant", content: "Coordination?" },
      { role: "user", content: "Anna hands me designs. James reviews my PRs. Kevin provides the APIs I build against. I file bugs in Linear when I find backend issues." },
      { role: "assistant", content: "AI?" },
      { role: "user", content: "Intermediate. I use Copilot and sometimes Claude for writing tests and debugging." },
    ],
  },
  {
    name: "Kevin O'Brien", email: "kevin@zippyzaps.com", role: "Backend Engineer", department: "Engineering", ai_comfort: "advanced",
    transcript: [
      { role: "assistant", content: "Hi Kevin! What's your role?" },
      { role: "user", content: "Backend Engineer. APIs, database design, integrations, and performance optimization." },
      { role: "assistant", content: "Tools?" },
      { role: "user", content: "VS Code, GitHub, PostgreSQL, Redis, Docker, AWS, Datadog, Linear, Slack." },
      { role: "assistant", content: "Walk me through your week." },
      { role: "user", content: "I build API endpoints and services — that's maybe 50% of my time. Code reviews are another 2 hours a day. I handle database migrations and schema changes. I troubleshoot production issues when they come up — maybe 3-4 incidents a week, each takes 30 minutes to an hour. And I write API documentation, about 2 hours a week." },
      { role: "assistant", content: "What's painful?" },
      { role: "user", content: "API documentation. I write the code, then have to separately document every endpoint in our docs. If the API changes, I have to update the docs manually. Also, debugging production issues — I spend too much time searching through logs. And database migrations are nerve-wracking because there's no easy rollback." },
      { role: "assistant", content: "Coordination?" },
      { role: "user", content: "Lisa C consumes my APIs. Sam deploys what I build. James reviews my architecture decisions. Priya sometimes needs custom data exports for client onboarding." },
      { role: "assistant", content: "AI?" },
      { role: "user", content: "Advanced. Copilot everywhere, Claude for debugging complex issues, and I've integrated AI into some of our internal tools." },
    ],
  },
  {
    name: "Sam Nguyen", email: "sam@zippyzaps.com", role: "DevOps Engineer", department: "Engineering", ai_comfort: "intermediate",
    transcript: [
      { role: "assistant", content: "Hi Sam! What do you do?" },
      { role: "user", content: "DevOps. CI/CD pipelines, infrastructure, monitoring, security, and deployments." },
      { role: "assistant", content: "Tools?" },
      { role: "user", content: "GitHub Actions, AWS, Terraform, Docker, Datadog, PagerDuty, Slack." },
      { role: "assistant", content: "What's your week like?" },
      { role: "user", content: "I manage our deployment pipeline — we deploy 3-4 times a week. Each deployment takes about an hour of my time for the pre-deploy checklist, running it, monitoring, and verifying. I spend about 4 hours a week on infrastructure maintenance. Security patching is about 2 hours a week. And I'm on-call for production incidents." },
      { role: "assistant", content: "What's painful?" },
      { role: "user", content: "The deployment checklist. It's 15 steps and I do it manually every time. Run tests, check staging, update changelog, merge to main, deploy, verify health checks, check error rates. Should be fully automated but we haven't invested in it. Also, I write the same Terraform configs over and over for similar resources." },
      { role: "assistant", content: "Who do you work with?" },
      { role: "user", content: "James approves releases, I deploy them. Kevin needs infrastructure for new services. I coordinate with everyone during incidents." },
      { role: "assistant", content: "AI?" },
      { role: "user", content: "Intermediate. I use Copilot for Terraform and shell scripts. Haven't used AI for incident response yet but want to." },
    ],
  },

  // ─── PRODUCT (3) ───
  {
    name: "Lisa Nakamura", email: "lisan@zippyzaps.com", role: "Product Manager", department: "Product", ai_comfort: "intermediate",
    transcript: [
      { role: "assistant", content: "Hi Lisa! What's your role?" },
      { role: "user", content: "I'm the Product Manager. I own the roadmap, write PRDs, run sprint planning with Engineering, and do customer research." },
      { role: "assistant", content: "Tools?" },
      { role: "user", content: "Linear, Notion, Figma, Google Docs, Slack, Zoom, Loom." },
      { role: "assistant", content: "What does your week look like?" },
      { role: "user", content: "Sprint planning with James is about 4 hours per sprint. I write 1-2 PRDs a week, each takes about 3 hours. I do user research — reviewing feedback from Nina in CS, analyzing feature requests, and running occasional user interviews, maybe 3 hours a week. Stakeholder alignment meetings eat up another 2-3 hours." },
      { role: "assistant", content: "How does PRD writing work?" },
      { role: "user", content: "I gather customer feedback from Nina and from our feedback channels. Then I synthesize the problem, write up the user stories, define success metrics, and outline the solution. I share it with James for technical feasibility, then Anna for design. Lots of back-and-forth before it's finalized." },
      { role: "assistant", content: "What's frustrating?" },
      { role: "user", content: "User research synthesis. I have notes from 10 different customer calls, feature requests in 3 different tools, and NPS comments in a spreadsheet. Synthesizing all of that into actionable insights takes forever. I also spend too much time in alignment meetings that could be async." },
      { role: "assistant", content: "Handoffs?" },
      { role: "user", content: "Nina gives me customer feedback. I hand PRDs to James for sprint planning and Anna for design. Ben helps me with user research when I need deeper insights." },
      { role: "assistant", content: "AI?" },
      { role: "user", content: "Intermediate. I use Claude for writing PRDs and synthesizing research notes." },
    ],
  },
  {
    name: "Ben Cooper", email: "ben@zippyzaps.com", role: "UX Researcher", department: "Product", ai_comfort: "intermediate",
    transcript: [
      { role: "assistant", content: "Hi Ben! What do you do?" },
      { role: "user", content: "UX Researcher. I plan and run user studies, analyze results, and present insights to the product and design teams." },
      { role: "assistant", content: "Tools?" },
      { role: "user", content: "Dovetail, Notion, Figma, Google Sheets, Zoom, Loom, Slack." },
      { role: "assistant", content: "What's your typical week?" },
      { role: "user", content: "I run 2-3 user interviews a week — each is 45 minutes plus an hour for notes and analysis. I maintain our research repository in Dovetail — tagging and organizing findings. I write research reports every 2 weeks, about 4 hours each. And I review Anna's designs against our research findings." },
      { role: "assistant", content: "What's painful?" },
      { role: "user", content: "Transcribing and coding interviews. I record them on Zoom, then go through the transcript tagging themes and pulling quotes. For a 45-minute interview, the analysis takes about 2 hours. It's the most repetitive part of my job. Also, nobody reads the full research reports — I write 10 pages and people just want the bullet points." },
      { role: "assistant", content: "Handoffs?" },
      { role: "user", content: "Lisa N asks me for research. I give findings to Anna and Lisa N. Sometimes Marcus asks me to talk to churned customers." },
      { role: "assistant", content: "AI?" },
      { role: "user", content: "Intermediate. I've used Dovetail's AI features and Claude for summarizing interview transcripts." },
    ],
  },
  {
    name: "Anna Schmidt", email: "anna@zippyzaps.com", role: "Product Designer", department: "Product", ai_comfort: "intermediate",
    transcript: [
      { role: "assistant", content: "Hi Anna! What's your role?" },
      { role: "user", content: "Product Designer. I design features from wireframe to final UI, create prototypes, and maintain our design system." },
      { role: "assistant", content: "Tools?" },
      { role: "user", content: "Figma, FigJam, Notion, Slack, Loom." },
      { role: "assistant", content: "What does your week look like?" },
      { role: "user", content: "I design 1-2 features per sprint. Each goes through wireframes, lo-fi mockups, feedback rounds, then hi-fi designs. The full process takes about 10-15 hours per feature. I also maintain our design system in Figma — updating components, documenting patterns, maybe 3 hours a week. And I do design reviews with Lisa C before she builds." },
      { role: "assistant", content: "What's frustrating?" },
      { role: "user", content: "The feedback loop. I share a design, get comments from Lisa N, James, and sometimes Sarah in Marketing. They all have different opinions and I have to reconcile them. Also, creating responsive versions — I design for desktop, then have to create tablet and mobile variants. It's mostly mechanical resizing." },
      { role: "assistant", content: "Handoffs?" },
      { role: "user", content: "Ben gives me research findings. Lisa N gives me PRDs. I hand designs to Lisa C for implementation. Jake and I occasionally coordinate on brand consistency." },
      { role: "assistant", content: "AI?" },
      { role: "user", content: "Intermediate. I use Figma's AI features and ChatGPT for writing component documentation." },
    ],
  },

  // ─── FINANCE (2) ───
  {
    name: "David Kim", email: "david@zippyzaps.com", role: "Finance Manager", department: "Finance", ai_comfort: "beginner",
    transcript: [
      { role: "assistant", content: "Hi David! What do you do at Zippy Zaps?" },
      { role: "user", content: "I'm the Finance Manager. I handle financial close, reporting, budgeting, and vendor payments." },
      { role: "assistant", content: "Tools?" },
      { role: "user", content: "QuickBooks, Google Sheets, Excel, Gmail, Slack." },
      { role: "assistant", content: "Walk me through your month." },
      { role: "user", content: "The month-end financial close is the big one — takes about 5 full days. I reconcile all accounts, categorize transactions, verify revenue recognition, and produce the P&L, balance sheet, and cash flow statements. During the month, I process vendor invoices that Amy prepares — about 3 hours a week. I also review expense reports bi-weekly and manage our budget vs actuals." },
      { role: "assistant", content: "What's painful about the close?" },
      { role: "user", content: "Reconciliation. I'm comparing bank statements line by line against QuickBooks entries. If there's a discrepancy I have to trace it back. Also, I pull some of the same HubSpot data for revenue attribution that Marketing and Sales already pull. Three departments pulling the same data independently." },
      { role: "assistant", content: "What else is frustrating?" },
      { role: "user", content: "The budget vs actuals report. Every month I manually pull spending data from QuickBooks, compare it to our budget spreadsheet, calculate variances, and write explanations for anything off by more than 10%. Same process every month." },
      { role: "assistant", content: "Handoffs?" },
      { role: "user", content: "Amy processes invoices and expenses, I review them. I send financial reports to leadership. Marcus gives me revenue forecasts for planning." },
      { role: "assistant", content: "AI?" },
      { role: "user", content: "Beginner. I know AI could help with categorization and anomaly detection but I haven't tried anything." },
    ],
  },
  {
    name: "Michelle Torres", email: "michelle@zippyzaps.com", role: "Accountant", department: "Finance", ai_comfort: "none",
    transcript: [
      { role: "assistant", content: "Hi Michelle! What's your role?" },
      { role: "user", content: "I'm the Accountant. I handle accounts payable, accounts receivable, payroll processing, and tax prep support." },
      { role: "assistant", content: "Tools?" },
      { role: "user", content: "QuickBooks, Excel, Gmail, and our payroll system." },
      { role: "assistant", content: "What's your typical week?" },
      { role: "user", content: "I process incoming payments and match them to invoices — about 5 hours a week. I run payroll bi-weekly which takes a full day — entering hours, verifying deductions, running the calculations, and distributing pay stubs. I also prepare quarterly tax filings, which takes about a week each quarter." },
      { role: "assistant", content: "What's most tedious?" },
      { role: "user", content: "Invoice matching. I get a payment, then I have to find the corresponding invoice in QuickBooks, verify the amount matches, apply any discounts or credits, and mark it as paid. For 50+ invoices a month, it's incredibly repetitive. Also payroll — I enter the same kind of data every two weeks." },
      { role: "assistant", content: "Who do you work with?" },
      { role: "user", content: "David reviews my work. Amy sends me vendor invoices that have been approved. I coordinate with HR for payroll changes — new hires, terminations, benefit changes." },
      { role: "assistant", content: "AI?" },
      { role: "user", content: "I haven't used any AI tools." },
    ],
  },
];

// ─── Seed Function ───

async function seed() {
  console.log("🌱 Starting seed...\n");

  // 1. Create or find the company
  const { data: existingCompany } = await supabase
    .from("companies")
    .select("id")
    .eq("name", "Zippy Zaps")
    .single();

  let companyId: string;
  if (existingCompany) {
    companyId = existingCompany.id;
    console.log(`Found existing company: ${companyId}`);
  } else {
    const { data: newCompany, error } = await supabase
      .from("companies")
      .insert({ name: "Zippy Zaps", industry: "B2B SaaS", size: "51-200" })
      .select("id")
      .single();
    if (error) throw error;
    companyId = newCompany!.id;
    console.log(`Created company: ${companyId}`);
  }

  // 2. Create contributors and interviews
  for (const person of PEOPLE) {
    console.log(`  📋 ${person.name} (${person.department})...`);

    // Check if contributor already exists
    const { data: existing } = await supabase
      .from("contributors")
      .select("id")
      .eq("company_id", companyId)
      .eq("email", person.email)
      .single();

    let contributorId: string;
    if (existing) {
      contributorId = existing.id;
      // Update
      await supabase.from("contributors").update({
        name: person.name,
        role: person.role,
        department: person.department,
        ai_comfort: person.ai_comfort,
        interviewed_at: new Date().toISOString(),
      }).eq("id", contributorId);
    } else {
      const { data: contrib, error } = await supabase
        .from("contributors")
        .insert({
          company_id: companyId,
          name: person.name,
          email: person.email,
          role: person.role,
          department: person.department,
          ai_comfort: person.ai_comfort,
          interviewed_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (error) throw error;
      contributorId = contrib!.id;
    }

    // Create interview token
    const token = `seed-${person.email.split("@")[0]}-${Date.now().toString(36)}`;
    const { data: tokenData, error: tokenErr } = await supabase
      .from("interview_tokens")
      .insert({
        token,
        company_id: companyId,
        contributor_id: contributorId,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (tokenErr) throw tokenErr;

    // Create interview record
    const { error: ivErr } = await supabase
      .from("interviews")
      .insert({
        token_id: tokenData!.id,
        company_id: companyId,
        contributor_id: contributorId,
        transcript: person.transcript,
        extracted_data: {
          name: person.name,
          role: person.role,
          department: person.department,
          tools: [],
          workflows: [],
          painPoints: [],
          handoffs: [],
          aiComfort: person.ai_comfort,
        },
        status: "completed",
        completed_at: new Date().toISOString(),
        duration: `${10 + Math.floor(Math.random() * 10)} min`,
        workflows_extracted: 0,
      });
    if (ivErr) throw ivErr;

    console.log(`     ✅ Created contributor + interview`);
  }

  console.log(`\n🎉 Seed complete! ${PEOPLE.length} contributors and interviews created.`);
  console.log(`   Company ID: ${companyId}`);
}

seed().catch(console.error);
