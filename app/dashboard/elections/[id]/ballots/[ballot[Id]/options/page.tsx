"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SidebarLayout from "@/app/components/SidebarLayout";
import { createBrowserClient } from "@supabase/ssr";
import { submitVote } from "@/lib/voting/voteService";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BallotOptionsPage() {
  const { id, ballotId } = useParams();

  const [user, setUser] = useState<any>(null);
  const [ballot, setBallot] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [selection, setSelection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ----------------------------
  // LOAD DATA
  // ----------------------------
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data: auth } = await supabase.auth.getUser();
      const currentUser = auth.user;

      if (!currentUser) {
        setLoading(false);
        return;
      }

      setUser(currentUser);

      const { data: ballotData } = await supabase
        .from("ballots")
        .select("*")
        .eq("id", ballotId)
        .single();

      setBallot(ballotData);

      const { data: optionsData } = await supabase
        .from("ballot_options")
        .select("*")
        .eq("ballot_id", ballotId)
        .order("created_at", { ascending: true });

      setOptions(optionsData || []);

      setLoading(false);
    };

    load();
  }, [ballotId]);

  // ----------------------------
  // VOTE HANDLER (SERVICE LAYER)
  // ----------------------------
  const handleVote = async () => {
    if (!user || submitting) return;

    if (!selection) {
      alert("Please select an option");
      return;
    }

    setSubmitting(true);

    try {
      await submitVote({
        supabase,
        user_id: user.id,
        election_id: id,
        ballot_id: ballotId,
        option_id: selection,
      });

      alert("Vote submitted!");
    } catch (error: any) {
      alert(error.message || "Failed to submit vote");
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------------------
  // UI STATES
  // ----------------------------
  if (loading) {
    return (
      <SidebarLayout>
        <p>Loading...</p>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div style={{ maxWidth: 700 }}>

        <h2>Question</h2>
        <h3 style={{ marginBottom: 20 }}>
          {ballot?.title || "Untitled Question"}
        </h3>

        <hr />

        {/* OPTIONS */}
        <h3 style={{ marginTop: 20 }}>Options</h3>

        {options.length === 0 ? (
          <p>No options yet.</p>
        ) : (
          options.map((opt) => (
            <label key={opt.id} style={styles.optionRow}>
              <input
                type="radio"
                name={ballotId as string}
                value={opt.id}
                checked={selection === opt.id}
                onChange={() => setSelection(opt.id)}
              />
              <span style={{ marginLeft: 8 }}>{opt.label}</span>
            </label>
          ))
        )}

        {/* SUBMIT */}
        <button
          style={styles.voteButton}
          onClick={handleVote}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Vote"}
        </button>

      </div>
    </SidebarLayout>
  );
}

// ----------------------------
// STYLES
// ----------------------------
const styles: Record<string, React.CSSProperties> = {
  optionRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: 10,
    padding: 10,
    border: "1px solid #eee",
    borderRadius: 8,
    background: "#fafafa",
    cursor: "pointer",
  },

  voteButton: {
    marginTop: 20,
    padding: 12,
    width: "100%",
    background: "#08224D",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
};