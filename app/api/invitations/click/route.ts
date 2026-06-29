import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Lookup invite
  const { data: invite } = await supabase
    .from("association_invites")
    .select("id, association_id, email")
    .eq("invite_code", code)
    .single();

  if (invite) {
    // Log click event
    await supabase.from("invite_audit_logs").insert({
      invite_id: invite.id,
      association_id: invite.association_id,
      email: invite.email,
      action: "clicked",
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Redirect user to invitation page
  return NextResponse.redirect(
    new URL(`/invite/${code}`, req.url)
  );
}