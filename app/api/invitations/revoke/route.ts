import { NextResponse } from "next/server";
import { revokeInvite } from "@/lib/invitations/inviteService";

export async function POST(req: Request) {
  try {
    const { invite_id } = await req.json();

    if (!invite_id) {
      return NextResponse.json(
        { error: "Missing invite_id" },
        { status: 400 }
      );
    }

    await revokeInvite(invite_id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}