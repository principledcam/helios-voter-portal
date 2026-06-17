"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      setLogs(data || []);
      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return (
      <SidebarLayout>
        <p>Loading audit logs...</p>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div style={{ maxWidth: 900 }}>
        <h1>🧾 Audit Log</h1>

        {logs.length === 0 ? (
          <p>No audit logs found.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} style={styles.card}>
              <div style={styles.header}>
                <strong>{log.action}</strong>
                <span style={{ color: "#666" }}>
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>

              <p>
                <strong>Entity:</strong> {log.entity_type} ({log.entity_id})
              </p>

              <p>
                <strong>User:</strong> {log.user_id}
              </p>

              {log.metadata && (
                <div style={styles.meta}>
                  {log.metadata.old_role && (
                    <p>
                      <strong>Old:</strong> {log.metadata.old_role}
                    </p>
                  )}

                  {log.metadata.new_role && (
                    <p>
                      <strong>New:</strong> {log.metadata.new_role}
                    </p>
                  )}

                  {log.metadata.timestamp && (
                    <p style={{ fontSize: 12, color: "#888" }}>
                      {log.metadata.timestamp}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </SidebarLayout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    border: "1px solid #eee",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  meta: {
    marginTop: 8,
    paddingTop: 8,
    borderTop: "1px solid #f2f2f2",
  },
};