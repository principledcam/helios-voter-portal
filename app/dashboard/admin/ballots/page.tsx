"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CreateBallotPage() {
  const [elections, setElections] = useState<any[]>([]);
  const [electionId, setElectionId] = useState("");
  const [title, setTitle] = useState(""); // ✅ renamed from "choice"
  const [question, setQuestion] = useState(""); // optional but now supported
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // ----------------------------
  // LOAD ELECTIONS
  // ----------------------------
  useEffect(() => {
    const load = async () => {
      setFetching(true);

      const { data, error } = await supabase
        .from("elections")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error.message);
      }

      setElections(data || []);
      setFetching(false);
    };

    load();
  }, []);

  // ----------------------------
  // CREATE BALLOT
  // ----------------------------
  const createBallot = async () => {
    const cleanTitle = title.trim();
    const cleanQuestion = question.trim();

    if (!electionId) {
      alert("Please select an election");
      return;
    }

    if (!cleanTitle) {
      alert("Please enter a ballot option (YES / NO / ABSTAIN / Candidate Name)");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("ballots").insert({
      election_id: electionId,

      // ✅ FIX: replace invalid "choice"
      title: cleanTitle,

      // optional structured field (safe with your schema)
      question: cleanQuestion || null,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Ballot created!");

    setTitle("");
    setQuestion("");
  };

  return (
    <div style={{ padding: 30, maxWidth: 600 }}>
      <h1>Create Ballot</h1>

      <p style={{ color: "#666", marginTop: 5 }}>
        Select an election and add a voting option (YES / NO / ABSTAIN)
      </p>

      {/* -------------------- ELECTION SELECT -------------------- */}
      <div style={{ marginTop: 20 }}>
        <label>Election</label>

        {fetching ? (
          <p>Loading elections...</p>
        ) : (
          <select
            value={electionId}
            onChange={(e) => setElectionId(e.target.value)}
            style={{
              display: "block",
              padding: 10,
              marginTop: 5,
              width: "100%",
            }}
          >
            <option value="">-- Select election --</option>

            {elections.length === 0 ? (
              <option disabled>No elections found</option>
            ) : (
              elections.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))
            )}
          </select>
        )}
      </div>

      {/* -------------------- BALLOT TITLE -------------------- */}
      <div style={{ marginTop: 20 }}>
        <label>Ballot Option</label>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. YES, NO, ABSTAIN"
          style={{
            display: "block",
            padding: 10,
            marginTop: 5,
            width: "100%",
          }}
        />
      </div>

      {/* -------------------- OPTIONAL QUESTION -------------------- */}
      <div style={{ marginTop: 20 }}>
        <label>Question (Optional)</label>

        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Optional ballot question"
          style={{
            display: "block",
            padding: 10,
            marginTop: 5,
            width: "100%",
          }}
        />
      </div>

      {/* -------------------- SUBMIT -------------------- */}
      <button
        onClick={createBallot}
        disabled={loading}
        style={{
          marginTop: 20,
          padding: 12,
          width: "100%",
          background: loading ? "#999" : "#08224D",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Creating..." : "Create Ballot"}
      </button>
    </div>
  );
}