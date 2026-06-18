import { createServerClient } from "@supabase/ssr";

export async function logAudit({
  supabase,
  action,
  user_id,
  association_id,
  entity_type,
  entity_id,
  metadata = {},
  before_state = null,
  after_state = null,
  request,
}: any) {
  const ip =
    request?.headers?.get("x-forwarded-for") ||
    request?.headers?.get("x-real-ip");

  const user_agent = request?.headers?.get("user-agent");

  return await supabase.from("audit_logs").insert({
    action,
    user_id,
    association_id,
    entity_type,
    entity_id,
    metadata,
    before_state,
    after_state,
    ip_address: ip,
    user_agent,
    request_id: crypto.randomUUID(),
  });
}