import { createSupabaseServerClient } from "./supabaseServer";

export async function logAudit(
  action: string,
  entityType: string,
  entityId: string,
  oldValue?: any,
  newValue?: any
) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase.from("audit_logs").insert({
    user_id: user.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata: {
      old_value: oldValue ?? null,
      new_value: newValue ?? null,
      timestamp: new Date().toISOString(),
    },
  });

  if (error) {
    console.error("Audit log failed:", error.message);
  }
}