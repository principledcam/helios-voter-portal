"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResultsPage() {
  const { id } = useParams();

  const [election, setElection] = useState<any>(null);
  const [ballots, setBallots] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ----------------------------
  // LOAD DATA
  // ----------------------------
  const load = async () => {
    setLoading(true);

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

    const { data: optionData } = await supabase
      .from("ballot_options")
      .select("*")
      .in("ballot_id", (ballotData || []).map((b) => b.id));

    setOptions(optionData || []);

    const { data: voteData } = await supabase
      .from("votes")
      .select("*")
      .eq("election_id", id);

    setVotes(voteData || []);

    setLoading(false);
  };

  useEffect(() => {
    load();

    // 🔴 REAL-TIME SUBSCRIPTION
    const channel = supabase
      .channel("live-votes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "votes",
          filter: `election_id=eq.${id}`,
        },
        () => {
          load();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  // ----------------------------
  // COUNT FUNCTION
  // ----------------------------
  const getVoteCount = (optionId: string) => {
    return votes.filter((v) => v.option_id === optionId).length;
  };

  // ----------------------------
  // 🟣 WINNER DETECTION (ADDED)
  // ----------------------------
  const getWinner = (ballotId: string) => {
    const optionsForBallot = options.filter(
      (o) => o.ballot_id === ballotId
    );

    let topOption: string | null = null;
    let maxVotes = 0;

    optionsForBallot.forEach((opt) => {
      const count = votes.filter((v) => v.option_id === opt.id).length;

      if (count > maxVotes) {
        maxVotes = count;
        topOption = opt.label;
      }
    });

    return { winner: topOption, votes: maxVotes };
  };

  if (loading) {
    return (
              <p>Loading results...</p>
          );
  }

  return (
          <div style={{ maxWidth: 900 }}>

        <h1>📊 Live Results</h1>

        {election && (
          <div style={{ marginBottom: 20 }}>
            <h2>{election.title}</h2>
            <p>{election.description}</p>
          </div>
        )}

        {ballots.map((ballot) => {
          // 🟢 CHART DATA
          const data = options
            .filter((o) => o.ballot_id === ballot.id)
            .map((o) => ({
              name: o.label,
              votes: votes.filter((v) => v.option_id === o.id).length,
            }));

          const result = getWinner(ballot.id);

          return (
            <div
              key={ballot.id}
              style={{
                padding: 15,
                marginBottom: 20,
                border: "1px solid #eee",
                borderRadius: 10,
                background: "#fafafa",
              }}
            >
              <h3>{ballot.title}</h3>

              {/* 🟢 WINNER DISPLAY */}
              <div
                style={{
                  marginBottom: 10,
                  fontWeight: "bold",
                  color: "#08224D",
                }}
              >
                🏆 Winner: {result.winner || "No votes yet"} (
                {result.votes})
              </div>

              {/* 🟢 BAR CHART */}
              <div style={{ width: "100%", height: 250 }}>
                <ResponsiveContainer>
                  <BarChart data={data}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="votes" fill="#28A8A8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* 🔽 RAW NUMBERS */}
              <div style={{ marginTop: 10 }}>
                {options
                  .filter((o) => o.ballot_id === ballot.id)
                  .map((option) => (
                    <div
                      key={option.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "6px 0",
                      }}
                    >
                      <span>{option.label}</span>
                      <strong>{getVoteCount(option.id)} votes</strong>
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
      );
}