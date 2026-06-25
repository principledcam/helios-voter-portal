import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import InviteClient from "./InviteClient";

export default async function InvitePage({
  params,
}: {
  params: { code: string };
}) {
  const cookieStore = cookies();

  // =========================
  // SERVER SUPABASE CLIENT
  // =========================
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // no-op for server render
        },
      },
    }
  );

  // =========================
  // FETCH INVITE (SERVER SIDE)
  // =========================
  const { data: invite, error } = await supabase
    .from("association_invites")
    .select("*")
    .eq("invite_code", params.code)
    .single();

  // =========================
  // INVALID INVITE HANDLING
  // =========================
  if (error || !invite) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Invalid Invite</h1>
      </div>
    );
  }

  // =========================
  // PASS TO CLIENT COMPONENT
  // =========================
  return <InviteClient invite={invite} />;
}