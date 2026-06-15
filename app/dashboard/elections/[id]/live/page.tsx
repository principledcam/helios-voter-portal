"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import SidebarLayout from "@/app/components/SidebarLayout";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LiveElectionDashboard() {
  const { id } = useParams();

  const [election, setElection] = useState<any>(null);
  const [ballots, setBallots] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ----------------------------
  // FETCH ALL DATA
  // ----------------------------
  const fetchData = useCallback(async () => {
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
      .select("id, ballot_id, option_id")
      .eq("election_id", id);

    setVotes(voteData || []);

    setLoading(false);
  }, [id]);

  // ----------------------------
  // INITIAL LOAD
  // ----------------------------
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ----------------------------
  // SUPABASE REALTIME
  // ----------------------------
  useEffect(() => {
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
          fetchData(); // refresh on any vote change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, fetchData]);

  // ----------------------------
  // CALCULATE RESULTS
  // ----------------------------
  const getResults = () => {
    const tally: Record<string, number> = {};

    for (const vote of votes) {
      tally[vote.option_id] = (tally[vote.option_id] || 0) + 1;
    }

    return tally;
  };

  const results = getResults();

  const getOptionLabel = (optionId: string) => {
    return options.find((o) => o.id === optionId)?.label || "Unknown";
  };

  const getBallotTitle = (ballotId: string) => {
    return ballots.find((b) => b.id === ballotId)?.title || "Ballot";
  };

  // ----------------------------
  // UI
  // ----------------------------
  if (loading) {
    return (
      <SidebarLayout>
        <p>Loading live dashboard...</p>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div style={{ maxWidth: 900 }}>

        {/* HEADER */}
        <h1>📊 Live Election Dashboard</h1>

        <div style={styles.statusCard}>
          <strong>{election?.title}</strong>
          <p>Status: {election?.status}</p>
          <p>Total Votes: {votes.length}</p>
        </div>

        {/* RESULTS */}
        <h2 style={{ marginTop: 30 }}>Live Results</h2>

        {Object.entries(results).length === 0 ? (
          <p>No votes yet.</p>
        ) : (
          Object.entries(results).map(([optionId, count]) => {
            const option = options.find((o) => o.id === optionId);

            return (
              <div key={optionId} style={styles.resultRow}>
                <div>
                  <strong>{option?.label || "Unknown Option"}</strong>
                  <p style={{ margin: 0, fontSize: 12, opacity: 0.6 }}>
                    {getBallotTitle(option?.ballot_id)}
                  </p>
                </div>

                <div style={styles.count}>
                  {count as number} votes
                </div>
              </div>
            );
          })
        )}

      </div>
    </SidebarLayout>
  );
}

// ----------------------------
// STYLES
// ----------------------------
const styles: Record<string, React.CSSProperties> = {
  statusCard: {
    padding: 15,
    background: "#f5f7ff",
    borderRadius: 10,
    marginTop: 15,
    border: "1px solid #e0e7ff",
  },

  resultRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: 15,
    marginTop: 10,
    border: "1px solid #eee",
    borderRadius: 10,
    background: "#fff",
  },

  count: {
    fontSize: 18,
    fontWeight: 600,
    color: "#08224D",
  },
};