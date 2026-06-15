"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import SidebarLayout from "@/app/components/SidebarLayout";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ManageElectionPage() {
  const { id } = useParams();
  const router = useRouter();

  const [election, setElection] = useState<any>(null);
  const [ballots, setBallots] = useState<any[]>([]);
  const [question, setQuestion] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: electionData } = await supabase
        .from("elections")
        .select("*")
        .eq("id", id)
        .single();

      setElection(electionData);

      const { data: ballotData } = await supabase
        .from("ballots")
        .select("*")
        .eq("election_id", id);

      setBallots(ballotData || []);
    };

    load();
  }, [id]);

  const createBallot = async () => {
    if (!question) return alert("Enter a question");

    const { data, error } = await supabase
      .from("ballots")
      .insert({
        election_id: id,
        question,
      })
      .select()
      .single();

    if (error) return alert(error.message);

    setBallots((prev) => [...prev, data]);
    setQuestion("");
  };

  return (
    <SidebarLayout>
      <div style={{ maxWidth: 700 }}>

        <h1>{election?.title}</h1>
        <p>{election?.description}</p>

        <hr style={{ margin: "20px 0" }} />

        {/* CREATE QUESTION */}
        <h3>Create Question</h3>

        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Approve Budget?"
          style={{
            padding: 10,
            width: "100%",
            marginBottom: 10,
          }}
        />

        <button
          onClick={createBallot}
          style={{
            padding: 10,
            background: "#08224D",
            color: "white",
            border: "none",
          }}
        >
          Add Question
        </button>

        {/* QUESTIONS LIST */}
        <h3 style={{ marginTop: 30 }}>Questions</h3>

        {ballots.map((b) => (
          <div
            key={b.id}
            style={{
              padding: 12,
              border: "1px solid #ddd",
              marginTop: 10,
              borderRadius: 8,
              cursor: "pointer",
            }}
            onClick={() =>
              router.push(
                `/dashboard/elections/${id}/ballots/${b.id}/options`
              )
            }
          >
            {b.question}
          </div>
        ))}

      </div>
    </SidebarLayout>
  );
}