import { createClient } from "@supabase/supabase-js";
import { Invite } from "./types";
import {
  canAcceptInvite,
  getInviteStatus,
} from "./inviteValidation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// =========================
// 🧠 AUDIT HELPER (NEW)
// =========================
async function logInviteEvent(input: {
  invite_id?: string;
  association_id?: string;
  email?: string;
  action: string;
  metadata?: any;
}) {
  const supabaseAudit = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await supabaseAudit.from("invite_audit_logs").insert({
    invite_id: input.invite_id,
    association_id: input.association_id,
    email: input.email,
    action: input.action,
    metadata: input.metadata || {},
  });
}

// =========================
// CREATE INVITE
// =========================
export async function createInvite(input: {
  email: string;
  association_id: string;
  role?: string;
}) {
  const code = crypto.randomUUID();

  const { data, error } = await supabase
    .from("association_invites")
    .insert({
      email: input.email,
      association_id: input.association_id,
      invite_code: code,
      role: input.role || "member",
      consumed: false,
      revoked: false,
      expires_at: new Date(
        Date.now() + 7 * 86400000
      ).toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  // 🧠 AUDIT: CREATED
  await logInviteEvent({
    invite_id: data.id,
    association_id: input.association_id,
    email: input.email,
    action: "created",
  });

  return data;
}

// =========================
// REVOKE INVITE
// =========================
export async function revokeInvite(invite_id: string) {
  const { error } = await supabase
    .from("association_invites")
    .update({ revoked: true })
    .eq("id", invite_id);

  if (error) throw error;

  // 🧠 AUDIT: REVOKED
  await logInviteEvent({
    invite_id,
    action: "revoked",
  });

  return true;
}

// =========================
// RESEND INVITE
// =========================
export async function resendInvite(invite_id: string) {
  const { data: invite, error } = await supabase
    .from("association_invites")
    .select("*")
    .eq("id", invite_id)
    .single();

  if (error || !invite)
    throw new Error("Invite not found");

  const newCode = crypto.randomUUID();

  const { error: updateError } = await supabase
    .from("association_invites")
    .update({
      invite_code: newCode,
      consumed: false,
      revoked: false,
      expires_at: new Date(
        Date.now() + 7 * 86400000
      ).toISOString(),
    })
    .eq("id", invite_id);

  if (updateError) throw updateError;

  // 🧠 AUDIT: RESENT
  await logInviteEvent({
    invite_id,
    association_id: invite.association_id,
    email: invite.email,
    action: "resent",
  });

  return {
    invite,
    newCode,
  };
}

// =========================
// ACCEPT INVITE
// =========================
export async function acceptInvite(code: string) {
  const { data: invite, error } = await supabase
    .from("association_invites")
    .select("*")
    .eq("invite_code", code)
    .single();

  if (error || !invite) {
    throw new Error("Invalid invite");
  }

  if (!canAcceptInvite(invite)) {
    throw new Error("Invite cannot be accepted");
  }

  const { data, error: updateError } = await supabase
    .from("association_invites")
    .update({
      consumed: true,
    })
    .eq("id", invite.id)
    .eq("consumed", false)
    .eq("revoked", false)
    .select()
    .single();

  if (updateError || !data) {
    throw new Error("Invite already used or invalid state");
  }

  // 🧠 AUDIT: ACCEPTED
  await logInviteEvent({
    invite_id: invite.id,
    association_id: invite.association_id,
    email: invite.email,
    action: "accepted",
  });

  return data;
}

// =========================
// GET INVITES
// =========================
export async function getInvitesByHoa(
  association_id: string
) {
  const { data, error } = await supabase
    .from("association_invites")
    .select("*")
    .eq("association_id", association_id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data || [];
}