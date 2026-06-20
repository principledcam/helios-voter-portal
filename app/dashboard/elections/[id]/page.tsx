"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  // REALTIME ENGINE
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
  // ANALYTICS
  // ----------------------------
  useEffect(() => {
    if (!voteHistory.length) return;

    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;

    const recent = voteHistory.filter((v) => v.time > oneMinuteAgo);

    setVotesPerMinute(recent.length);
    setLastSpike(recent.length > 10);
  }, [voteHistory]);

  const results = (votes || []).reduce((acc: any, v: any) => {
    acc[v.option_id] = (acc[v.option_id] || 0) + 1;
    return acc;
  }, {});

  const totalVotes = votes.length;

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
    return <p>Loading Enterprise Console...</p>;
  }

  return (
    <div style={{ maxWidth: 1000 }}>
      <h1>🏛️ Enterprise Election Console</h1>
      <p>{election?.title}</p>

      <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
        {["overview", "vote", "live", "results", "audit", "settings"].map(
          (t) => (
            <button
              key={t}
              onClick={() => setTab(t as Tab)}
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                background: tab === t ? "#08224D" : "#eee",
                color: tab === t ? "#fff" : "#000",
              }}
            >
              {t.toUpperCase()}
            </button>
          )
        )}
      </div>

      {tab === "overview" && (
        <div style={{ padding: 15 }}>
          <h3>📊 Live Metrics</h3>
          <p>Total Votes: {totalVotes}</p>
          <p>Ballots: {ballots.length}</p>
          <p>Status: {election?.status}</p>
        </div>
      )}

      {tab === "vote" && (
        <div>
          {ballots.map((b) => (
            <div key={b.id} style={{ padding: 15 }}>
              <h3>{b.title}</h3>

              {options
                .filter((o) => o.ballot_id === b.id)
                .map((opt) => {
                  const checked =
                    selections[b.id]?.includes(opt.id) || false;

                  return (
                    <label key={opt.id} style={{ display: "block" }}>
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

          <button onClick={submitVotes}>Submit Vote</button>
        </div>
      )}

      {tab === "live" && (
        <div>
          <h2>🔴 Control Room</h2>
          <p>Votes: {votes.length}</p>
          <p>Votes/min: {votesPerMinute}</p>
          <p>Status: {lastSpike ? "SPIKE" : "Stable"}</p>
        </div>
      )}

      {tab === "results" && (
        <div>
          <h3>Results</h3>
          {Object.entries(results).map(([opt, count]) => (
            <div key={opt}>
              {opt}: {count as number}
            </div>
          ))}
        </div>
      )}

      {tab === "audit" && (
        <div>
          <h3>Audit Log</h3>
          {audit.map((a) => (
            <div key={a.id}>
              {a.action} -{" "}
              {new Date(a.created_at).toLocaleString()}
            </div>
          ))}
        </div>
      )}

      {tab === "settings" && (
        <div>
          <h3>Settings</h3>
          <p>Status: {election?.status}</p>
          <p>Multi-vote: {allowMulti ? "Yes" : "No"}</p>
        </div>
      )}
    </div>
  );
}