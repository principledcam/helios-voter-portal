"use client";

import { useEffect, useState } from "react";
import { useHoa } from "@/app/context/HoaContext";

import {
  PageHeader,
  Section,
  Card,
  StatCard,
  Spinner,
} from "@/app/components/ui";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import {
  getInviteMetrics,
  getInviteFunnel,
  getRecentInviteActivity,
} from "@/lib/analytics/inviteAnalytics";

import { InviteMetrics } from "@/lib/analytics/analyticsTypes";

export default function InvitationAnalyticsPage() {
  const { activeHoa } = useHoa();

  const [metrics, setMetrics] = useState<InviteMetrics | null>(null);
  const [funnel, setFunnel] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeHoa?.id) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [activeHoa?.id]);

  async function loadData() {
    if (!activeHoa?.id) return;

    setLoading(true);

    try {
      const [metricsData, funnelData, activityData] =
        await Promise.all([
          getInviteMetrics(activeHoa.id),
          getInviteFunnel(activeHoa.id),
          getRecentInviteActivity(activeHoa.id),
        ]);

      setMetrics(metricsData);
      setFunnel(funnelData || []);
      setActivity(activityData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Section title="Loading Invitation Analytics">
        <Spinner />
      </Section>
    );
  }

  const safeMetrics = metrics ?? {
    invitesCreated: 0,
    emailsSent: 0,
    accepted: 0,
    openRate: 0,
    clickRate: 0,
    acceptanceRate: 0,
    overallConversion: 0,
  };

  return (
    <>
      <PageHeader
        title="📊 Invitation Analytics"
        subtitle="Track invitation performance across your HOA"
      />

      <Section title="Key Performance Indicators">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 12,
          }}
        >
          <StatCard
            label="Invites Created"
            value={safeMetrics.invitesCreated}
          />

          <StatCard
            label="Emails Sent"
            value={safeMetrics.emailsSent}
          />

          <StatCard
            label="Accepted"
            value={safeMetrics.accepted}
          />

          <StatCard
            label="Open Rate"
            value={`${safeMetrics.openRate.toFixed(1)}%`}
          />

          <StatCard
            label="Click Rate"
            value={`${safeMetrics.clickRate.toFixed(1)}%`}
          />

          <StatCard
            label="Acceptance Rate"
            value={`${safeMetrics.acceptanceRate.toFixed(
              1
            )}%`}
          />
        </div>
      </Section>

      <Section title="Invitation Funnel">
        <Card>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel}>
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#28A8A8"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Section>

      <Section title="Recent Activity">
        <Card>
          {activity.length === 0 ? (
            <p>No activity found.</p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {activity.map((log: any) => (
                <div
                  key={log.id}
                  style={{
                    padding: 10,
                    borderBottom:
                      "1px solid #e5e5e5",
                  }}
                >
                  <strong>{log.action}</strong>

                  <div
                    style={{
                      fontSize: 12,
                      color: "#666",
                    }}
                  >
                    {log.email || "system"}
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: "#999",
                    }}
                  >
                    {new Date(
                      log.created_at
                    ).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </Section>
    </>
  );
}