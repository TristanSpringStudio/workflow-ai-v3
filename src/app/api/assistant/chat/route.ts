import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// Force edge-compatible streaming (no buffering)
export const maxDuration = 60;
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getWorkflows, getContributors, getAssessment } from "@/lib/supabase/queries";
import { loadPrompt } from "@/lib/ai/pipeline/prompt-loader";
import { buildCompanyContext } from "@/lib/ai/pipeline/context-builder";

const anthropic = new Anthropic();

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

    // Load system prompt with context injected
    const systemPrompt = await loadPrompt("assistant-system.md", {
      companyName,
      companyContext,
    });

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
        "Transfer-Encoding": "chunked",
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
