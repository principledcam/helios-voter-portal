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

  // =========================
  // SEND INVITE
  // =========================
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

      // STEP 1 — CREATE INVITE
      const { error } = await supabase
        .from("association_invites")
        .insert({
          email: email.trim(),
          association_id: activeHoa.id,
          invite_code: code,
          expires_at: new Date(
            Date.now() + 7 * 86400000
          ).toISOString(),
          consumed: false,
        });

      if (error) {
        alert(error.message);
        return;
      }

      // STEP 2 — SEND EMAIL
      const { error: emailError } =
        await supabase.functions.invoke(
          "send-invite-email",
          {
            body: {
              email: email.trim(),
              invite_code: code,
              association_name: activeHoa.name,
              role: "member",
            },
          }
        );

      if (emailError) {
        console.error("Email Function Error:", emailError);

        alert(
          "Invite created successfully, but email failed. You can resend later."
        );
      } else {
        alert("Invite created and email sent successfully!");
      }

      setEmail("");
    } catch (err: any) {
      console.error(err);

      alert(
        err.message ||
          "Unexpected error creating invite."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // MAIN UI
  // =========================
  return (
    <>
      <h1>✉️ Invite Member</h1>

      <div style={styles.hoaBox}>
        <strong>Active HOA:</strong>{" "}
        {activeHoa?.name || "No HOA Selected"}
      </div>

      <div style={styles.formBox}>
        <input
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <button
          onClick={sendInvite}
          disabled={loading || !activeHoa}
          style={{
            ...styles.button,
            opacity: loading || !activeHoa ? 0.6 : 1,
            cursor:
              loading || !activeHoa
                ? "not-allowed"
                : "pointer",
          }}
        >
          {loading
            ? "Generating..."
            : "Generate Invite"}
        </button>
      </div>
    </>
  );
}

// =========================
// STYLES
// =========================
const styles: Record<string, React.CSSProperties> = {
  hoaBox: {
    marginBottom: 20,
    padding: 12,
    background: "#f5f5f5",
    borderRadius: 8,
  },

  formBox: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    maxWidth: 500,
  },

  input: {
    width: "100%",
    padding: 10,
    border: "1px solid #ddd",
    borderRadius: 6,
  },

  button: {
    padding: "10px 16px",
    background: "#08224D",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontWeight: 600,
  },
};