import Anthropic from "@anthropic-ai/sdk";
import { loadPrompts } from "./prompt-loader";
import {
  InterviewTurnOutput,
  type InterviewTurnOutput as InterviewTurnOutputType,
} from "../schemas/interview-output";

const anthropic = new Anthropic();

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Process one turn of the interview conversation.
 * Sends the full conversation history + system prompt to Claude Haiku.
 * Returns the structured interview turn output.
 */
export async function processInterviewTurn(
  messages: ChatMessage[],
  companyName: string,
  existingDepartments: string[] = [],
  knownName?: string
): Promise<InterviewTurnOutputType> {
  // Load and compose the system prompt. We pass the company's existing
  // departments so the AI can offer them as `suggestedOptions` during warmup
  // and avoid spelling/casing mismatches that would fragment the org.
  const departmentList =
    existingDepartments.length > 0
      ? existingDepartments.map((d) => `- ${d}`).join("\n")
      : "(none yet — this is the first interview for this company)";

  // If we already know the person's name from the welcome screen, tell the
  // AI explicitly so it doesn't re-ask or ignore that context mid-conversation.
  const knownNameBlock = knownName && knownName.trim().length > 0
    ? `**The person you're talking to is named ${knownName.trim()}.** You already know this from the welcome screen — do NOT ask for their name again. Use it naturally and carry it forward in \`extractedSoFar.name\` from turn 1.`
    : `You do not know the person's name yet — ask for it in Phase 1.`;

  const systemPrompt = await loadPrompts(
    ["interview-system.md", "interview-probing.md"],
    {
      company_name: companyName,
      existing_departments: departmentList,
      known_name: knownNameBlock,
    }
  );

  // Call Claude Haiku
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  // Extract text from response
  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  // Parse and validate with Zod
  let parsed: InterviewTurnOutputType;
  try {
    // Try to extract JSON from the response (handle potential markdown fences)
    const jsonStr = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const raw = JSON.parse(jsonStr);
    parsed = InterviewTurnOutput.parse(raw);
  } catch (error) {
    // If parsing fails, return a fallback that keeps the conversation going
    console.error("Failed to parse interview turn output:", error);
    console.error("Raw response:", text);
    parsed = {
      message:
        "I'd love to hear more about your work. Could you tell me about what a typical day looks like for you?",
      phase: "warmup",
      extractedSoFar: {
        tools: [],
        workflows: [],
        painPoints: [],
        handoffs: [],
      },
      shouldProbe: false,
      interviewComplete: false,
    };
  }

  return parsed;
}

/**
 * Generate the opening message for a new interview.
 * If we already know the person's name from the welcome screen, greet them
 * and skip straight to asking about their role.
 */
export function getOpeningMessage(
  companyName: string,
  userName?: string
): InterviewTurnOutputType {
  const hasName = userName && userName.trim().length > 0;
  const name = hasName ? userName.trim() : null;

  const greeting = name ? `Hi ${name}!` : "Hi there!";
  const startQuestion = name
    ? `what's your role at ${companyName}?`
    : `what's your name and what do you do at ${companyName}?`;

  return {
    message: `${greeting} I'm the Vishtan interviewer for ${companyName}. I'm going to ask you a few questions about how you work day-to-day — your tools, your workflows, what takes up your time. There are no wrong answers, and this should only take about 15 minutes. Let's start — ${startQuestion}`,
    phase: "warmup",
    extractedSoFar: {
      name: name ?? undefined,
      tools: [],
      workflows: [],
      painPoints: [],
      handoffs: [],
    },
    shouldProbe: false,
    interviewComplete: false,
  };
}
