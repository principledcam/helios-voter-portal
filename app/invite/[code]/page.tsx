import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export default async function InvitePage({
  params,
}: {
  params: { code: string };
}) {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // no-op for read-only page
        },
      },
    }
  );

  const { data: invite, error } = await supabase
    .from("association_invites")
    .select("*")
    .eq("invite_code", params.code)
    .single();

  if (error || !invite) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Invalid Invite</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>HOA Invitation</h1>

      <p>Email: {invite.email}</p>
      <p>Role: {invite.role}</p>
      <p>Association ID: {invite.association_id}</p>

      <button>Accept Invitation</button>
    </div>
  );
}