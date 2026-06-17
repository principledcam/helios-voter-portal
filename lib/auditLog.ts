import { createSupabaseServerClient } from "./supabaseServer";

type AuditMetadata = {
  old_value?: any;
  new_value?: any;
  timestamp?: string;
  [key: string]: any;
};

export async function logAudit({
  associationId,
  action,
  entityType,
  entityId,
  metadata,
}: {
  associationId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: AuditMetadata;
}) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  if (!associationId) {
    console.error("Missing association_id - audit skipped");
    return;
  }

  const { error } = await supabase.from("audit_logs").insert({
    user_id: user.id,
    association_id: associationId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString(),
    },
  });

  if (error) {
    console.error("Audit log failed:", error.message);
  }
}