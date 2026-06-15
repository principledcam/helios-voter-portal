"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function InvitesPage() {
  const [email, setEmail] = useState("");
  const [associationId, setAssociationId] = useState("");

  const sendInvite = async () => {
    const code = crypto.randomUUID();

    await supabase.from("association_invites").insert({
      email,
      association_id: associationId,
      invite_code: code,
      expires_at: new Date(Date.now() + 7 * 86400000),
    });

    alert("Invite created: " + code);
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>✉️ Invite Member</h1>

      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Association ID" onChange={(e) => setAssociationId(e.target.value)} />

      <button onClick={sendInvite}>Generate Invite</button>
    </div>
  );
}