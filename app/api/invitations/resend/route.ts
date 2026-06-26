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

    // Load existing invitation
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

    // Generate new invite code
    const newCode = crypto.randomUUID();

    const { error: updateError } = await supabase
      .from("association_invites")
      .update({
        invite_code: newCode,
        consumed: false,
        revoked: false,
        expires_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      })
      .eq("id", invite_id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // Send email through Edge Function
    const response = await fetch(
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
            invite.association_name ||
            "Principled CAM Association",
          role: invite.role || "member",
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();

      return NextResponse.json(
        {
          error: text,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Invitation resent successfully.",
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err.message,
      },
      {
        status: 500,
      }
    );
  }
}