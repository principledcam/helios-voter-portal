"use client";

import { useEffect, useState } from "react";
import { useHoa } from "@/app/context/HoaContext";

// 🧱 UI SYSTEM
import {
  PageHeader,
  Section,
  Card,
  StatCard,
  Spinner,
} from "@/app/components/ui";

// =========================
// TYPES
// =========================
type Election = {
  id: string;
  title: string;
  status: string;
  start_date: string;
  end_date: string;
};

type VoteStats = {
  totalVoters: number;
  totalVotes: number;
  participationRate: number;
};

export default function ElectionsPage() {
  const { activeHoa } = useHoa();

  const [elections, setElections] = useState<Election[]>([]);
  const [stats, setStats] = useState<VoteStats | null>(null);
  const [loading, setLoading] = useState(true);

  // =========================
  // LOAD DATA
  // =========================
  useEffect(() => {
    if (activeHoa?.id) {
      loadData();
    }
  }, [activeHoa?.id]);

  async function loadData() {
    if (!activeHoa?.id) return;

    setLoading(true);

    try {
      const res = await fetch(
        `/api/elections?hoa=${activeHoa.id}`
      );

      const data = await res.json();

      setElections(data.elections || []);
      setStats(data.stats || null);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  // =========================
  // LOADING STATE
  // =========================
  if (loading) {
    return (
      <>
        <Section title="Loading Elections">
          <Spinner />
        </Section>
      </>
    );
  }

  // =========================
  // MAIN PAGE
  // =========================
  return (
    <>
      {/* =========================
          PAGE HEADER
      ========================= */}
      <PageHeader
        title="🗳️ Elections"
        subtitle="Manage HOA voting, ballots, and election cycles"
      />

      {/* =========================
          ELECTION OVERVIEW
      ========================= */}
      <Section title="Election Overview">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
          }}
        >
          <StatCard
            label="Total Elections"
            value={elections.length}
          />

          <StatCard
            label="Active Elections"
            value={
              elections.filter(
                (e) => e.status === "active"
              ).length
            }
          />

          <StatCard
            label="Completed Elections"
            value={
              elections.filter(
                (e) => e.status === "completed"
              ).length
            }
          />
        </div>
      </Section>

      {/* =========================
          VOTING PERFORMANCE
      ========================= */}
      <Section title="Voting Performance">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
          }}
        >
          <StatCard
            label="Total Voters"
            value={stats?.totalVoters ?? 0}
          />

          <StatCard
            label="Total Votes"
            value={stats?.totalVotes ?? 0}
          />

          <StatCard
            label="Participation Rate"
            value={`${stats?.participationRate?.toFixed(1) ?? "0.0"}%`}
          />
        </div>
      </Section>

      {/* =========================
          ELECTION LIST
      ========================= */}
      <Section title="All Elections">
        <Card>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {elections.length === 0 ? (
              <div
                style={{
                  padding: 16,
                  color: "#666",
                }}
              >
                No elections found.
              </div>
            ) : (
              elections.map((election) => (
                <div
                  key={election.id}
                  style={{
                    padding: 12,
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                    }}
                  >
                    {election.title}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: "#666",
                    }}
                  >
                    {election.status.toUpperCase()}
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: "#999",
                    }}
                  >
                    {new Date(
                      election.start_date
                    ).toLocaleDateString()}{" "}
                    →{" "}
                    {new Date(
                      election.end_date
                    ).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </Section>
    </>
  );
}