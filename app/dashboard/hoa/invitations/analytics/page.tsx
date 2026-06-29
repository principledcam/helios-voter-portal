"use client";

import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useHoa } from "@/app/context/HoaContext";
import RoleGuard from "@/components/RoleGuard";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Invite = {
  id: string;
  email: string;
  consumed: boolean;
  revoked: boolean;
  expires_at: string;
  created_at: string;
};

type AuditLog = {
  id: string;
  invite_id: string;
  action: string;
  email: string;
  created_at: string;
};

export default function InvitationAnalyticsPage() {
  const { activeHoa } = useHoa();

  const [invites, setInvites] = useState<Invite[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeHoa?.id) {
      loadData();
    }
  }, [activeHoa?.id]);

  async function loadData() {
    if (!activeHoa?.id) return;

    setLoading(true);

    // =========================
    // LOAD INVITES
    // =========================
    const { data: inviteData } = await supabase
      .from("association_invites")
      .select("*")
      .eq("association_id", activeHoa.id);

    // =========================
    // LOAD AUDIT LOGS
    // =========================
    const { data: logData } = await supabase
      .from("invite_audit_logs")
      .select("*")
      .eq("association_id", activeHoa.id)
      .order("created_at", { ascending: false })
      .limit(50);

    setInvites(inviteData || []);
    setLogs(logData || []);
    setLoading(false);
  }

  // =========================
  // DERIVED METRICS
  // =========================
  const stats = useMemo(() => {
    const total = invites.length;

    const accepted = invites.filter((i) => i.consumed).length;

    const revoked = invites.filter((i) => i.revoked).length;

    const expired = invites.filter(
      (i) =>
        !i.consumed &&
        !i.revoked &&
        new Date(i.expires_at) < new Date()
    ).length;

    const active = total - accepted - revoked - expired;

    const successRate =
      total === 0 ? 0 : Math.round((accepted / total) * 100);

    return {
      total,
      accepted,
      revoked,
      expired,
      active,
      successRate,
    };
  }, [invites]);

  // =========================
  // LOADING STATE
  // =========================
  if (loading) {
    return (
      <RoleGuard>
        <div style={{ padding: 30 }}>Loading analytics...</div>
      </RoleGuard>
    );
  }

  // =========================
  // EMAIL SENT METRIC (FUNNEL STEP)
  // =========================
  const emailsSent = logs.filter(
    (l) => l.action === "emailed"
  ).length;

  return (
    <RoleGuard>
      <div style={{ padding: 30 }}>
        <h1>📊 Invitation Analytics</h1>

        {/* =========================
            KPI CARDS
        ========================= */}
        <div style={styles.grid}>
          <Card label="Total Invites" value={stats.total} />
          <Card label="Active" value={stats.active} />
          <Card label="Accepted" value={stats.accepted} />
          <Card label="Expired" value={stats.expired} />
          <Card label="Revoked" value={stats.revoked} />
          <Card
            label="Success Rate"
            value={`${stats.successRate}%`}
          />
        </div>

        {/* =========================
            FUNNEL VISUALIZATION (NEW)
        ========================= */}
        <h2 style={{ marginTop: 30 }}>Invite Funnel</h2>

        <div style={styles.funnelBox}>
          <FunnelStep label="Invites Created" value={stats.total} />
          <Arrow />
          <FunnelStep label="Emails Sent" value={emailsSent} />
          <Arrow />
          <FunnelStep label="Accepted" value={stats.accepted} />
        </div>

        {/* =========================
            ACTIVITY FEED
        ========================= */}
        <h2 style={{ marginTop: 30 }}>Recent Activity</h2>

        <div style={styles.feed}>
          {logs.map((log) => (
            <div key={log.id} style={styles.logItem}>
              <div>
                <strong>{log.action}</strong>
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>
                {log.email || "system"}
              </div>
              <div style={{ fontSize: 11, color: "#999" }}>
                {new Date(log.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </RoleGuard>
  );
}

// =========================
// COMPONENTS
// =========================

function Card({ label, value }: { label: string; value: any }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardLabel}>{label}</div>
      <div style={styles.cardValue}>{value}</div>
    </div>
  );
}

function FunnelStep({ label, value }: any) {
  return (
    <div style={styles.funnelStep}>
      <div style={{ fontSize: 12 }}>{label}</div>
      <strong>{value}</strong>
    </div>
  );
}

function Arrow() {
  return <div style={{ margin: "0 10px" }}>➡️</div>;
}

// =========================
// STYLES
// =========================

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
    marginTop: 20,
  },

  card: {
    padding: 16,
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 8,
  },

  cardLabel: {
    fontSize: 12,
    color: "#777",
  },

  cardValue: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 6,
  },

  funnelBox: {
    display: "flex",
    alignItems: "center",
    marginTop: 20,
    padding: 20,
    border: "1px solid #eee",
    borderRadius: 10,
    background: "#fafafa",
  },

  funnelStep: {
    padding: 15,
    background: "#fff",
    borderRadius: 8,
    textAlign: "center",
    minWidth: 140,
    border: "1px solid #eee",
  },

  feed: {
    marginTop: 10,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  logItem: {
    padding: 10,
    border: "1px solid #eee",
    borderRadius: 6,
    background: "#fafafa",
  },
};