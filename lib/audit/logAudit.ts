export async function logAudit({
  supabase,
  action,
  user_id,
  association_id,
  entity_type,
  entity_id,
  performed_by,
  performed_by_name,
  before_state = null,
  after_state = null,
  metadata = {},
}: {
  supabase: any;
  action: string;
  user_id?: string;
  association_id?: string;
  entity_type: string;
  entity_id?: string;
  performed_by?: string;
  performed_by_name?: string;
  before_state?: any;
  after_state?: any;
  metadata?: any;
}) {
  const { error } = await supabase
    .from("audit_logs")
    .insert({
      action,
      user_id,
      association_id,
      entity_type,
      entity_id,
      performed_by,
      performed_by_name,
      before_state,
      after_state,
      metadata,
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Audit Log Error:", error);
  }
}