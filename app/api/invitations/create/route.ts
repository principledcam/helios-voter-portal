import { NextResponse } from "next/server";
import { createInvite } from "@/lib/invitations/inviteService";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const invite = await createInvite({
      email: body.email,
      association_id: body.association_id,
      role: body.role,
    });

    // Edge function email
    await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-invite-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: invite.email,
          invite_code: invite.invite_code,
          association_name: body.association_name,
          role: invite.role,
        }),
      }
    );

    return NextResponse.json({
      success: true,
      invite,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}