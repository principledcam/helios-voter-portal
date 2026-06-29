import { createClient } from "@supabase/supabase-js";
import {
  InviteMetrics,
  TimelinePoint,
} from "./analyticsTypes";
import {
  calculateRate,
} from "./calculations";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==========================================
// GET ALL INVITES FOR HOA
// ==========================================

export async function getInvites(
  associationId: string
) {
  const { data, error } = await supabase
    .from("association_invites")
    .select("*")
    .eq("association_id", associationId);

  if (error) throw error;

  return data || [];
}

// ==========================================
// GET AUDIT LOGS
// ==========================================

export async function getInviteAuditLogs(
  associationId: string
) {
  const { data, error } = await supabase
    .from("invite_audit_logs")
    .select("*")
    .eq("association_id", associationId)
    .order("created_at", {
      ascending: false,
    });

  if (error) throw error;

  return data || [];
}

// ==========================================
// KPI METRICS
// ==========================================

export async function getInviteMetrics(
  associationId: string
): Promise<InviteMetrics> {

  const invites =
    await getInvites(associationId);

  const logs =
    await getInviteAuditLogs(associationId);

  const invitesCreated = invites.length;

  const emailsSent = logs.filter(
    (l) => l.action === "emailed"
  ).length;

  const emailsOpened = logs.filter(
    (l) => l.action === "opened"
  ).length;

  const inviteClicks = logs.filter(
    (l) => l.action === "clicked"
  ).length;

  const accepted = invites.filter(
    (i) => i.consumed
  ).length;

  const revoked = invites.filter(
    (i) => i.revoked
  ).length;

  const expired = invites.filter(
    (i) =>
      !i.consumed &&
      !i.revoked &&
      new Date(i.expires_at) <
        new Date()
  ).length;

  return {

    invitesCreated,

    emailsSent,

    emailsOpened,

    inviteClicks,

    accepted,

    revoked,

    expired,

    openRate:
      calculateRate(
        emailsOpened,
        emailsSent
      ),

    clickRate:
      calculateRate(
        inviteClicks,
        emailsOpened
      ),

    acceptanceRate:
      calculateRate(
        accepted,
        inviteClicks
      ),

    overallConversion:
      calculateRate(
        accepted,
        invitesCreated
      ),
  };
}

// ==========================================
// TIMELINE
// ==========================================

export async function getInviteTimeline(
  associationId: string
): Promise<TimelinePoint[]> {

  const logs =
    await getInviteAuditLogs(
      associationId
    );

  const grouped: Record<
    string,
    number
  > = {};

  logs.forEach((log) => {

    const day =
      new Date(
        log.created_at
      ).toLocaleDateString();

    grouped[day] =
      (grouped[day] || 0) + 1;
  });

  return Object.entries(grouped).map(
    ([label, value]) => ({
      label,
      value,
    })
  );
}

// ==========================================
// FUNNEL
// ==========================================

export async function getInviteFunnel(
  associationId: string
) {

  const metrics =
    await getInviteMetrics(
      associationId
    );

  return [
    {
      stage:
        "Invites Created",
      value:
        metrics.invitesCreated,
    },
    {
      stage:
        "Emails Sent",
      value:
        metrics.emailsSent,
    },
    {
      stage:
        "Opened",
      value:
        metrics.emailsOpened,
    },
    {
      stage:
        "Clicked",
      value:
        metrics.inviteClicks,
    },
    {
      stage:
        "Accepted",
      value:
        metrics.accepted,
    },
  ];
}

// ==========================================
// RECENT ACTIVITY
// ==========================================

export async function getRecentInviteActivity(
  associationId: string,
  limit = 25
) {

  const { data, error } =
    await supabase
      .from(
        "invite_audit_logs"
      )
      .select("*")
      .eq(
        "association_id",
        associationId
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(limit);

  if (error) throw error;

  return data || [];
}