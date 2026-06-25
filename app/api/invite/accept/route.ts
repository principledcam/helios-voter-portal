import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// 🧱 Server Supabase (IMPORTANT: NOT browser client)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 🔥 REQUIRED for secure server operations
);

export async function POST(req: Request) {
  try {
    const { invite_code } = await req.json();

    if (!invite_code) {
      return NextResponse.json(
        { error: "Missing invite code" },
        { status: 400 }
      );
    }

    // =========================
    // 1. GET AUTH USER
    // =========================
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Invalid user session" },
        { status: 401 }
      );
    }

    // =========================
    // 2. FETCH INVITE
    // =========================
    const { data: invite, error: inviteError } = await supabase
      .from("association_invites")
      .select("*")
      .eq("invite_code", invite_code)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: "Invalid invite" },
        { status: 404 }
      );
    }

    // =========================
    // 3. VALIDATE INVITE STATE
    // =========================
    if (invite.consumed) {
      return NextResponse.json(
        { error: "Invite already used" },
        { status: 409 }
      );
    }

    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Invite expired" },
        { status: 410 }
      );
    }

    // =========================
    // 4. PREVENT DUPLICATE MEMBERSHIP
    // =========================
    const { data: existingMember } = await supabase
      .from("association_members")
      .select("*")
      .eq("user_id", user.id)
      .eq("association_id", invite.association_id)
      .maybeSingle();

    if (existingMember) {
      return NextResponse.json(
        { error: "Already a member" },
        { status: 409 }
      );
    }

    // =========================
    // 5. INSERT MEMBERSHIP
    // =========================
    const { error: insertError } = await supabase
      .from("association_members")
      .insert({
        user_id: user.id,
        association_id: invite.association_id,
        role: invite.role || "member",
      });

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    // =========================
    // 6. MARK INVITE CONSUMED
    // =========================
    const { error: consumeError } = await supabase
      .from("association_invites")
      .update({
        consumed: true,
      })
      .eq("id", invite.id);

    if (consumeError) {
      return NextResponse.json(
        { error: "Failed to mark invite consumed" },
        { status: 500 }
      );
    }

    // =========================
    // 7. AUDIT LOG (OPTIONAL BUT RECOMMENDED)
    // =========================
    await supabase.from("audit_logs").insert({
      action: "invite_accepted",
      user_id: user.id,
      association_id: invite.association_id,
      entity_type: "association_invite",
      entity_id: invite.id,
      metadata: {
        invite_code,
        role: invite.role,
      },
    });

    // =========================
    // 8. SUCCESS RESPONSE
    // =========================
    return NextResponse.json({
      success: true,
      association_id: invite.association_id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}