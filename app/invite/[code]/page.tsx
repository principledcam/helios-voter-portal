"use client";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

// 🧠 Browser client ONLY for accept action
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function InvitePage({
  params,
}: {
  params: { code: string };
}) {
  const cookieStore = cookies();

  const serverSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // read-only page
        },
      },
    }
  );

  // =========================
  // FETCH INVITE (SERVER SIDE)
  // =========================
  const { data: invite, error } = await serverSupabase
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

  // =========================
  // CLIENT COMPONENT WRAPPER
  // =========================
  return <InviteClient invite={invite} />;
}

// ======================================================
// CLIENT SIDE ACCEPT LOGIC
// ======================================================
function InviteClient({ invite }: { invite: any }) {
  const [loading, setLoading] = useState(false);

  const acceptInvite = async () => {
    setLoading(true);

    const { data } = await supabase.auth.getSession();
    const session = data.session;

    if (!session) {
      alert("You must be logged in to accept this invite.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/invite/accept", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        invite_code: invite.invite_code,
      }),
    });

    const result = await res.json();

    setLoading(false);

    if (!res.ok) {
      alert(result.error || "Failed to accept invite");
      return;
    }

    // 🎯 redirect to HOA dashboard
    window.location.href = "/dashboard/hoa";
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>HOA Invitation</h1>

      <p>
        <strong>Email:</strong> {invite.email}
      </p>

      <p>
        <strong>Role:</strong> {invite.role || "member"}
      </p>

      <p>
        <strong>Association ID:</strong> {invite.association_id}
      </p>

      <button
        onClick={acceptInvite}
        disabled={loading}
        style={{
          marginTop: 20,
          padding: 10,
          background: "#08224D",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        {loading ? "Accepting..." : "Accept Invitation"}
      </button>
    </div>
  );
}