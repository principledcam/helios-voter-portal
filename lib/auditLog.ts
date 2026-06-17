import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;

  if (!user) {
    console.error("Audit skipped: no authenticated user");
    return;
  }

  if (!associationId) {
    console.error("Audit skipped: missing association_id");
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