import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * GET /api/assistant/chats — List user's chat history
 * POST /api/assistant/chats — Create or update a chat
 */

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ chats: [] });
    }

    const admin = createAdminClient();
    const { data: chats, error } = await admin
      .from("ai_chats")
      .select("id, title, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Failed to fetch chats:", error);
      return NextResponse.json({ chats: [] });
    }

    return NextResponse.json({ chats: chats || [] });
  } catch (error) {
    console.error("Chats GET error:", error);
    return NextResponse.json({ chats: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("users")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (!profile?.company_id) {
      return NextResponse.json({ error: "No company" }, { status: 400 });
    }

    const { chatId, title, messages } = await request.json();

    if (chatId) {
      // Update existing chat
      const { data, error } = await admin
        .from("ai_chats")
        .update({ title, messages, updated_at: new Date().toISOString() })
        .eq("id", chatId)
        .eq("user_id", user.id)
        .select("id")
        .single();

      if (error) {
        console.error("Failed to update chat:", error);
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
      }

      return NextResponse.json({ chatId: data.id });
    } else {
      // Create new chat
      const { data, error } = await admin
        .from("ai_chats")
        .insert({
          company_id: profile.company_id,
          user_id: user.id,
          title,
          messages,
        })
        .select("id")
        .single();

      if (error) {
        console.error("Failed to create chat:", error);
        return NextResponse.json({ error: "Failed to create" }, { status: 500 });
      }

      return NextResponse.json({ chatId: data.id });
    }
  } catch (error) {
    console.error("Chats POST error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
