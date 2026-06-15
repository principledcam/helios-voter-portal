"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SidebarLayout from "@/app/components/SidebarLayout";
import { createBrowserClient } from "@supabase/ssr";
import { submitVote } from "@/lib/voting/voteService";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Tab =
  | "overview"
  | "vote"
  | "live"
  | "results"
  | "audit"
  | "settings";

export default function EnterpriseElectionConsole() {
  const { id } = useParams();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("overview");

  const [user, setUser] = useState<any>(null);
  const [election, setElection] = useState<any>(null);
  const [ballots, setBallots] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [audit, setAudit] = useState<any[]>([]);

  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const allowMulti = election?.settings?.allow_multiple_votes;

  // ============================
  // CONTROL ROOM STATE
  // ============================
  const [liveFeed, setLiveFeed] = useState<any[]>([]);
  const [votesPerMinute, setVotesPerMinute] = useState(0);
  const [voteHistory, setVoteHistory] = useState<any[]>([]);
  const [lastSpike, setLastSpike] = useState(false);

  // ----------------------------
  // LOAD DATA
  // ----------------------------
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data: auth } = await supabase.auth.getUser();
      const currentUser = auth.user;

      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);

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

      const { data: auditData } = await supabase
        .from("vote_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      setAudit(auditData || []);

      setLoading(false);
    };

    load();
  }, [id]);

  // ----------------------------
  // REALTIME CONTROL ROOM ENGINE
  // ----------------------------
  useEffect(() => {
    const channel = supabase
      .channel("control-room")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "votes",
          filter: `election_id=eq.${id}`,
        },
        (payload) => {
          const vote = payload.new as any;
          const now = Date.now();

          setVotes((prev) => [...prev, vote]);

          setLiveFeed((prev) => [
            {
              time: now,
              ballot_id: vote.ballot_id,
              option_id: vote.option_id,
            },
            ...prev.slice(0, 19),
          ]);

          setVoteHistory((prev) => [...prev, { time: now }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  // ----------------------------
  // ANALYTICS ENGINE
  // ----------------------------
  useEffect(() => {
    if (!voteHistory.length) return;

    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;

    const recent = voteHistory.filter((v) => v.time > oneMinuteAgo);

    setVotesPerMinute(recent.length);
    setLastSpike(recent.length > 10);
  }, [voteHistory]);

  // ----------------------------
  // RESULTS ENGINE
  // ----------------------------
  const results = (votes || []).reduce((acc: any, v: any) => {
    acc[v.option_id] = (acc[v.option_id] || 0) + 1;
    return acc;
  }, {});

  const totalVotes = votes.length;

  // ----------------------------
  // SUBMIT VOTE
  // ----------------------------
  const submitVotes = async () => {
    if (!user || submitting) return;

    setSubmitting(true);

    try {
      for (const [ballotId, optionIds] of Object.entries(selections)) {
        for (const optionId of optionIds as string[]) {
          await submitVote({
            supabase,
            user_id: user.id,
            election_id: id as string,
            ballot_id: ballotId,
            option_id: optionId,
          });
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SidebarLayout>
        <p>Loading Enterprise Console...</p>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div style={{ maxWidth: 1000 }}>

        <h1>🏛️ Enterprise Election Console</h1>
        <p>{election?.title}</p>

        {/* TABS */}
        <div style={styles.tabs}>
          {["overview", "vote", "live", "results", "audit", "settings"].map(
            (t) => (
              <button
                key={t}
                onClick={() => setTab(t as Tab)}
                style={{
                  ...styles.tab,
                  background: tab === t ? "#08224D" : "#eee",
                  color: tab === t ? "#fff" : "#000",
                }}
              >
                {t.toUpperCase()}
              </button>
            )
          )}
        </div>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div style={styles.card}>
            <h3>📊 Live Metrics</h3>
            <p>Total Votes: {totalVotes}</p>
            <p>Ballots: {ballots.length}</p>
            <p>Status: {election?.status}</p>
          </div>
        )}

        {/* VOTE */}
        {tab === "vote" && (
          <div>
            {ballots.map((b) => (
              <div key={b.id} style={styles.card}>
                <h3>{b.title}</h3>

                {options
                  .filter((o) => o.ballot_id === b.id)
                  .map((opt) => {
                    const checked =
                      selections[b.id]?.includes(opt.id) || false;

                    return (
                      <label key={opt.id} style={styles.row}>
                        <input
                          type={allowMulti ? "checkbox" : "radio"}
                          name={b.id}
                          checked={checked}
                          onChange={() => {
                            setSelections((prev) => {
                              const current = prev[b.id] || [];

                              if (allowMulti) {
                                return {
                                  ...prev,
                                  [b.id]: current.includes(opt.id)
                                    ? current.filter((x) => x !== opt.id)
                                    : [...current, opt.id],
                                };
                              }

                              return {
                                ...prev,
                                [b.id]: [opt.id],
                              };
                            });
                          }}
                        />
                        <span style={{ marginLeft: 8 }}>{opt.label}</span>
                      </label>
                    );
                  })}
              </div>
            ))}

            <button style={styles.primary} onClick={submitVotes}>
              Submit Vote
            </button>
          </div>
        )}

        {/* LIVE CONTROL ROOM */}
        {tab === "live" && (
          <div>
            <h2>🔴 Election Control Room</h2>

            <div style={styles.grid}>
              <div style={styles.card}>
                <h3>Total Votes</h3>
                <p style={styles.big}>{votes.length}</p>
              </div>

              <div style={styles.card}>
                <h3>Votes / Min</h3>
                <p style={styles.big}>{votesPerMinute}</p>
              </div>

              <div style={styles.card}>
                <h3>Status</h3>
                <p style={styles.big}>
                  {lastSpike ? "⚡ SPIKE" : "🟢 Stable"}
                </p>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <h3>📡 Live Stream</h3>

              {liveFeed.length === 0 ? (
                <p>No activity yet</p>
              ) : (
                liveFeed.map((e, i) => (
                  <div key={i} style={styles.feedRow}>
                    <span>{e.ballot_id.slice(0, 6)}</span>
                    <span>{e.option_id.slice(0, 6)}</span>
                    <small>{new Date(e.time).toLocaleTimeString()}</small>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* RESULTS */}
        {tab === "results" && (
          <div>
            <h3>📊 Results</h3>
            {Object.entries(results).map(([opt, count]) => {
              const option = options.find((o) => o.id === opt);

              return (
                <div key={opt} style={styles.row}>
                  <span>{option?.label || "Unknown"}</span>
                  <strong>{count as number}</strong>
                </div>
              );
            })}
          </div>
        )}

        {/* AUDIT */}
        {tab === "audit" && (
          <div>
            <h3>🧾 Audit Log</h3>
            {audit.map((a) => (
              <div key={a.id} style={styles.auditRow}>
                <span>{a.action}</span>
                <small>{new Date(a.created_at).toLocaleString()}</small>
              </div>
            ))}
          </div>
        )}

        {/* SETTINGS */}
        {tab === "settings" && (
          <div style={styles.card}>
            <h3>⚙️ Settings</h3>

            <p>Status: {election?.status}</p>
            <p>Multi-vote: {allowMulti ? "Yes" : "No"}</p>

            <button
              style={styles.primary}
              onClick={() =>
                router.push(`/dashboard/elections/${id}/live`)
              }
            >
              Open Live View
            </button>
          </div>
        )}

      </div>
    </SidebarLayout>
  );
}

// ----------------------------
// STYLES (APPEND ONLY)
// ----------------------------
const styles: Record<string, React.CSSProperties> = {
  tabs: {
    display: "flex",
    gap: 8,
    marginTop: 20,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  tab: {
    padding: "8px 12px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
  },
  card: {
    padding: 15,
    border: "1px solid #eee",
    borderRadius: 10,
    marginBottom: 15,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: 10,
    borderBottom: "1px solid #eee",
  },
  auditRow: {
    padding: 10,
    borderBottom: "1px solid #eee",
    display: "flex",
    justifyContent: "space-between",
  },
  primary: {
    marginTop: 15,
    padding: 12,
    width: "100%",
    background: "#08224D",
    color: "#fff",
    border: "none",
    borderRadius: 8,
  },

  // NEW CONTROL ROOM STYLES
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
    marginTop: 10,
  },

  big: {
    fontSize: 28,
    fontWeight: 700,
    marginTop: 10,
  },

  feedRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: 10,
    borderBottom: "1px solid #eee",
    fontSize: 12,
  },
};