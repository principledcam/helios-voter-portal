import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 🔴 SERVER ONLY
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, associationId, inviteCode } = body;

    if (!email || !password || !associationId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Validate association
    const { data: association, error: assocError } = await supabase
      .from("associations")
      .select("*")
      .eq("id", associationId)
      .single();

    if (assocError || !association) {
      return NextResponse.json(
        { error: "Association not found" },
        { status: 404 }
      );
    }

    if (association.status !== "active" || !association.contract_signed) {
      return NextResponse.json(
        { error: "Association not authorized for voting access" },
        { status: 403 }
      );
    }

    // 2. OPTIONAL: validate invite
    if (inviteCode) {
      const { data: invite } = await supabase
        .from("association_invites")
        .select("*")
        .eq("invite_code", inviteCode)
        .eq("association_id", associationId)
        .eq("used", false)
        .single();

      if (!invite) {
        return NextResponse.json(
          { error: "Invalid invite code" },
          { status: 403 }
        );
      }
    }

    // 3. Create Supabase Auth user
    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError || !authUser.user) {
      return NextResponse.json(
        { error: authError?.message || "User creation failed" },
        { status: 500 }
      );
    }

    // 4. Insert into association_members
    const { error: memberError } = await supabase
      .from("association_members")
      .insert({
        user_id: authUser.user.id,
        association_id: associationId,
        role: "member",
      });

    if (memberError) {
      return NextResponse.json(
        { error: "Failed to assign association membership" },
        { status: 500 }
      );
    }

    // 5. Mark invite as used (if applicable)
    if (inviteCode) {
      await supabase
        .from("association_invites")
        .update({ used: true })
        .eq("invite_code", inviteCode);
    }

    return NextResponse.json({
      success: true,
      user_id: authUser.user.id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}