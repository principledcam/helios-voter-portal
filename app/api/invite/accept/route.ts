import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  try {
    // =========================
    // AUTH CHECK
    // =========================
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Missing authorization" },
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

    const body = await req.json();
    const { invite_code } = body;

    if (!invite_code) {
      return NextResponse.json(
        { error: "Missing invite code" },
        { status: 400 }
      );
    }

    // =========================
    // GET INVITE
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
    // VALIDATION
    // =========================
    if (invite.consumed) {
      return NextResponse.json(
        { error: "Invite already used" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    if (invite.expires_at && invite.expires_at < now) {
      return NextResponse.json(
        { error: "Invite expired" },
        { status: 400 }
      );
    }

    // =========================
    // CHECK MEMBERSHIP (DO NOT BLOCK FLOW)
    // =========================
    const { data: existingMember } = await supabase
      .from("association_members")
      .select("*")
      .eq("user_id", user.id)
      .eq("association_id", invite.association_id)
      .single();

    let action = "created";

    // =========================
    // INSERT ONLY IF NOT EXISTS
    // =========================
    if (!existingMember) {
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
    } else {
      action = "already_member";
    }

    // =========================
    // ALWAYS MARK INVITE CONSUMED
    // =========================
    const { error: updateError } = await supabase
      .from("association_invites")
      .update({ consumed: true })
      .eq("invite_code", invite_code);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // =========================
    // SUCCESS RESPONSE
    // =========================
    return NextResponse.json({
      success: true,
      action,
      association_id: invite.association_id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}