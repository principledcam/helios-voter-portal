"use client";

import { useEffect, useState } from "react";
import SidebarLayout from "@/app/components/SidebarLayout";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ----------------------------
  // LOAD RESULTS
  // ----------------------------
  const loadResults = async () => {
    setLoading(true);

    const { data: votes } = await supabase
      .from("votes")
      .select("ballot_id, choice");

    if (!votes) {
      setResults([]);
      setLoading(false);
      return;
    }

    // Aggregate counts
    const grouped: Record<string, any> = {};

    votes.forEach((v) => {
      const key = v.ballot_id + "::" + v.choice;

      if (!grouped[key]) {
        grouped[key] = {
          ballot_id: v.ballot_id,
          choice: v.choice,
          count: 0,
        };
      }

      grouped[key].count += 1;
    });

    setResults(Object.values(grouped));
    setLoading(false);
  };

  // ----------------------------
  // REAL-TIME SUBSCRIPTION
  // ----------------------------
  useEffect(() => {
    loadResults();

    const channel = supabase
      .channel("votes-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votes" },
        () => {
          loadResults();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ----------------------------
  // UI
  // ----------------------------
  return (
    <SidebarLayout>
      <div style={styles.card}>
        <h1>Live Election Results</h1>
        <p>Real-time vote tracking</p>

        {loading && <p>Loading results...</p>}

        {!loading && results.length === 0 && (
          <p>No votes yet.</p>
        )}

        <div style={styles.grid}>
          {results.map((r, i) => (
            <div key={i} style={styles.box}>
              <h3>{r.choice}</h3>
              <p style={styles.count}>{r.count} votes</p>
              <small>{r.ballot_id}</small>
            </div>
          ))}
        </div>
      </div>
    </SidebarLayout>
  );
}

// ----------------------------
// STYLES
// ----------------------------
const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "#fff",
    padding: 30,
    borderRadius: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 15,
    marginTop: 20,
  },

  box: {
    padding: 15,
    borderRadius: 10,
    border: "1px solid #eee",
    background: "#fafafa",
  },

  count: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 5,
  },
};