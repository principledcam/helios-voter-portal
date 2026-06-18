import { SupabaseClient } from "@supabase/supabase-js";

type AuditParams = {
  supabase: SupabaseClient;
  action: string;
  user_id: string;
  association_id?: string;
  entity_type: string;
  entity_id: string;
  before_state?: any;
  after_state?: any;
};

export async function logAudit({
  supabase,
  action,
  user_id,
  association_id,
  entity_type,
  entity_id,
  before_state,
  after_state,
}: AuditParams) {
  const { error } = await supabase.from("audit_logs").insert({
    action,
    user_id,
    association_id,
    entity_type,
    entity_id,
    before_state,
    after_state,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Audit log failed:", error.message);
  }
}