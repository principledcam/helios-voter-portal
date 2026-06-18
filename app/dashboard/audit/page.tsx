"use client";

import { useHoaQuery } from "@/app/hooks/useHoaQuery";

export default function AuditPage() {
  const { data, loading, error } = useHoaQuery("audit_logs", {
    select: "*",
  });

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        Loading audit logs...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20, color: "red" }}>
        Error loading audit logs
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Audit Logs</h1>

      <div style={{ marginTop: 20 }}>
        {data.length === 0 ? (
          <p>No audit logs found for this HOA.</p>
        ) : (
          data.map((log: any) => (
            <div
              key={log.id}
              style={{
                padding: 10,
                borderBottom: "1px solid #eee",
              }}
            >
              <strong>{log.action}</strong>
              <div style={{ fontSize: 12, color: "#666" }}>
                {log.created_at}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}