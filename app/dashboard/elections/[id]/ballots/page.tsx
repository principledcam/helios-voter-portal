"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BallotListPage() {
  const { id } = useParams();

  const [ballots, setBallots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("ballots")
        .select("*")
        .eq("election_id", id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error.message);
      }

      setBallots(data || []);
      setLoading(false);
    };

    load();
  }, [id]);

  return (
          <div style={styles.card}>
        <h1>Ballots</h1>

        <p style={{ color: "#666" }}>
          Election ID: {id}
        </p>

        {loading ? (
          <p>Loading ballots...</p>
        ) : ballots.length === 0 ? (
          <p>No ballots created yet.</p>
        ) : (
          ballots.map((b) => (
            <div key={b.id} style={styles.item}>
              <strong>{b.choice}</strong>

              <p style={{ fontSize: 12, color: "#777" }}>
                Ballot ID: {b.id}
              </p>
            </div>
          ))
        )}
      </div>
      );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "#fff",
    padding: 30,
    borderRadius: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    maxWidth: 700,
  },

  item: {
    padding: 12,
    border: "1px solid #eee",
    borderRadius: 8,
    marginTop: 10,
    background: "#fafafa",
  },
};