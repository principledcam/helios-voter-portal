"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function InviteClient({ invite }: { invite: any }) {
  const [loading, setLoading] = useState(false);

  // 🟢 NEXT.JS ROUTER (SAFE REDIRECT)
  const router = useRouter();

  const acceptInvite = async () => {
    setLoading(true);

    // =========================
    // GET AUTH SESSION
    // =========================
    const { data } = await supabase.auth.getSession();
    const session = data.session;

    if (!session) {
      alert("You must be logged in.");
      setLoading(false);
      return;
    }

    // =========================
    // CALL ACCEPT API
    // =========================
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

    // =========================
    // ERROR HANDLING
    // =========================
    if (!res.ok) {
      alert(result.error || "Failed to accept invite");
      return;
    }

    // =========================
    // SUCCESS → NAVIGATE
    // =========================
    router.push("/dashboard/hoa");
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>HOA Invitation</h1>

      <p>Email: {invite.email}</p>
      <p>Role: {invite.role}</p>
      <p>Association ID: {invite.association_id}</p>

      <button onClick={acceptInvite} disabled={loading}>
        {loading ? "Accepting..." : "Accept Invitation"}
      </button>
    </div>
  );
}