import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getWorkflows, getContributors, getAssessment } from "@/lib/supabase/queries";
import { buildCompanyContext } from "@/lib/ai/pipeline/context-builder";

const anthropic = new Anthropic();

function buildSystemPrompt(companyName: string, companyContext: string): string {
  return `# Vishtan AI Assistant

You are the AI copilot for **${companyName}**, powered by Vishtan's Company Intelligence Platform. You have deep knowledge of this company's workflows, people, bottlenecks, and AI opportunities — all derived from real employee interviews.

## Your role

You are a strategic advisor who helps leadership understand their organization and make decisions about where AI can help. You speak like a sharp, concise consultant — not a chatbot. No fluff. Lead with insights.

## What you know

You have access to a full intelligence layer built from employee interviews:

${companyContext}

## How to respond

- **Be specific.** Reference actual workflows, people, departments, and numbers. Never give generic advice.
- **Be concise.** Short paragraphs. Use bullets when listing. No walls of text.
- **Be opinionated.** You're the expert. Say what you'd recommend and why.
- **Connect the dots.** When someone asks about one area, surface related bottlenecks, dependencies, or opportunities they might not have thought of.
- **Cite your sources.** When referencing something from an interview, mention who said it.
- **Use numbers.** Time saved, cost saved, hours per week — make it concrete.
- **Suggest next steps.** End with a clear recommendation or question to move the conversation forward.

## Formatting: interactive chips

When you mention a person or workflow by name, wrap them in special syntax so the UI renders them as interactive chips:

- **People:** \`@[Full Name]\` — e.g., @[Marcus Rivera], @[Priya Patel]
- **Workflows:** \`#[Exact Workflow Title]\` — e.g., #[Daily inbound lead review and scoring], #[Code Reviews]

Rules:
- Use the EXACT name/title as it appears in the data above. Don't abbreviate or rephrase.
- Only use chip syntax for people and workflows that actually exist in the data.
- Use them naturally inline — don't overdo it. First mention in a response is enough.
- If you're listing several workflows, use chips for each.

## What you don't do

- Don't make up data. If something wasn't covered in the interviews, say so.
- Don't give generic AI advice. Everything should be grounded in this company's actual workflows.
- Don't be overly formal or use corporate jargon. Be direct and human.
- Don't write long essays. Keep responses under 200 words unless the user asks for a deep dive.`;
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json() as {
      messages: { role: "user" | "assistant"; content: string }[];
    };

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get authenticated user's company
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let companyId: string | null = null;
    let companyName = "your company";

    if (user) {
      const admin = createAdminClient();
      const { data: profile } = await admin
        .from("users")
        .select("company_id")
        .eq("id", user.id)
        .single();
      companyId = profile?.company_id || null;

      if (companyId) {
        const { data: company } = await admin
          .from("companies")
          .select("name")
          .eq("id", companyId)
          .single();
        companyName = company?.name || companyName;
      }
    }

    // Build company context from real data
    const [workflows, contributors, assessment] = await Promise.all([
      getWorkflows(companyId || undefined),
      getContributors(companyId || undefined),
      getAssessment(companyId || undefined),
    ]);

    const companyContext = buildCompanyContext(
      companyName,
      workflows,
      contributors,
      assessment
    );

    const systemPrompt = buildSystemPrompt(companyName, companyContext);

    // Stream the response
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    // Convert to a ReadableStream for the frontend
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("Assistant chat error:", error);
    return new Response(JSON.stringify({ error: "Failed to process message" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
