"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useHoa } from "@/app/context/HoaContext";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function InvitesPage() {
  const { activeHoa } = useHoa();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const sendInvite = async () => {
    if (!activeHoa?.id) {
      alert("No HOA selected.");
      return;
    }

    if (!email.trim()) {
      alert("Email is required.");
      return;
    }

    setLoading(true);

    try {
      const code = crypto.randomUUID();

      const { error } = await supabase
        .from("association_invites")
        .insert({
          email: email.trim(),
          association_id: activeHoa.id,
          invite_code: code,
          expires_at: new Date(
            Date.now() + 7 * 86400000
          ).toISOString(),
        });

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      alert(`Invite created: ${code}`);

      setEmail("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>✉️ Invite Member</h1>

      <div
        style={{
          marginBottom: 20,
          padding: 12,
          background: "#f5f5f5",
          borderRadius: 8,
        }}
      >
        <strong>Active HOA:</strong>{" "}
        {activeHoa?.name || "No HOA Selected"}
      </div>

      <input
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: "100%",
          maxWidth: 500,
          padding: 10,
          marginBottom: 15,
          border: "1px solid #ddd",
          borderRadius: 6,
        }}
      />

      <br />

      <button
        onClick={sendInvite}
        disabled={loading || !activeHoa}
        style={{
          padding: "10px 16px",
          background: "#08224D",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        {loading ? "Generating..." : "Generate Invite"}
      </button>
    </div>
  );
}