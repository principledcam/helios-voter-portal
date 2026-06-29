import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type DateRange = {
  from?: string;
  to?: string;
};

// =========================
// INVITATION FUNNEL ANALYTICS
// =========================
export async function getInviteFunnel(association_id: string, range?: DateRange) {
  const query = supabase
    .from("invite_audit_logs")
    .select("*")
    .eq("association_id", association_id);

  const { data, error } = await query;

  if (error) throw error;

  const logs = data || [];

  const invitesCreated = logs.filter(l => l.action === "created").length;
  const emailsSent = logs.filter(l => l.action === "emailed").length;
  const emailFailed = logs.filter(l => l.action === "failed_email").length;
  const accepted = logs.filter(l => l.action === "accepted").length;
  const resent = logs.filter(l => l.action === "resent").length;
  const revoked = logs.filter(l => l.action === "revoked").length;

  return {
    invitesCreated,
    emailsSent,
    emailFailed,
    accepted,
    resent,
    revoked,
    conversionRate:
      invitesCreated > 0 ? (accepted / invitesCreated) * 100 : 0,
  };
}

// =========================
// DAILY TREND (optional chart)
// =========================
export async function getInviteTrends(association_id: string) {
  const { data, error } = await supabase
    .from("invite_audit_logs")
    .select("created_at, action")
    .eq("association_id", association_id);

  if (error) throw error;

  const grouped: Record<string, any> = {};

  (data || []).forEach((log) => {
    const day = new Date(log.created_at).toISOString().split("T")[0];

    if (!grouped[day]) {
      grouped[day] = {
        invites: 0,
        emails: 0,
        accepted: 0,
      };
    }

    if (log.action === "created") grouped[day].invites++;
    if (log.action === "emailed") grouped[day].emails++;
    if (log.action === "accepted") grouped[day].accepted++;
  });

  return Object.entries(grouped).map(([date, values]) => ({
    date,
    ...values,
  }));
}