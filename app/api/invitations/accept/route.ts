import { NextResponse } from "next/server";
import { acceptInvite } from "@/lib/invitations/inviteService";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: "Missing code" },
        { status: 400 }
      );
    }

    const invite = await acceptInvite(code);

    return NextResponse.json({
      success: true,
      invite,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 400 }
    );
  }
}