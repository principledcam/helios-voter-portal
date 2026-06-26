import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { invite_id } = await req.json();

    if (!invite_id) {
      return NextResponse.json(
        { error: "Missing invite_id" },
        { status: 400 }
      );
    }

    // STEP 1 — get invite
    const { data: invite, error } = await supabase
      .from("association_invites")
      .select("*")
      .eq("id", invite_id)
      .single();

    if (error || !invite) {
      return NextResponse.json(
        { error: "Invite not found" },
        { status: 404 }
      );
    }

    // STEP 2 — regenerate invite code
    const newCode = crypto.randomUUID();

    await supabase
      .from("association_invites")
      .update({
        invite_code: newCode,
        consumed: false,
        revoked: false,
        expires_at: new Date(
          Date.now() + 7 * 86400000
        ).toISOString(),
      })
      .eq("id", invite_id);

    // STEP 3 — call Edge Function (email)
    await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-invite-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: invite.email,
          invite_code: newCode,
          association_name:
            invite.association_name || "HOA",
          role: invite.role || "member",
        }),
      }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}