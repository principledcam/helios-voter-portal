import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // ✅ TEMPORARY DEBUG LOG
  console.log("OPEN TRACKED:", req.url);

  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ ok: true });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Find invite
  const { data: invite } = await supabase
    .from("association_invites")
    .select("id, association_id, email")
    .eq("invite_code", code)
    .single();

  if (!invite) {
    console.log("OPEN TRACKED: Invite not found for code:", code);
    return NextResponse.json({ ok: true });
  }

  // Log open event
  const { error } = await supabase
    .from("invite_audit_logs")
    .insert({
      invite_id: invite.id,
      association_id: invite.association_id,
      email: invite.email,
      action: "opened",
    });

  if (error) {
    console.error("Failed to write invite audit log:", error);
  } else {
    console.log("Invite open logged for:", invite.email);
  }

  // Return 1x1 transparent pixel
  const pixel =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO3Xl1sAAAAASUVORK5CYII=";

  return new Response(Buffer.from(pixel, "base64"), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}