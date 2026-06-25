import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function InvitePage({
  params,
}: {
  params: { code: string };
}) {
  const { data: invite } = await supabase
    .from("association_invites")
    .select("*")
    .eq("invite_code", params.code)
    .single();

  if (!invite) {
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

      <button>
        Accept Invitation
      </button>
    </div>
  );
}