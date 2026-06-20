"use client";

import { useEffect } from "react";
import { useHoa } from "@/app/context/HoaContext";
import { useHoaQuery } from "@/app/hooks/useHoaQuery";
import { formatAudit } from "@/lib/audit/formatter";

export default function AuditPage() {
  const { activeHoa } = useHoa();

  const { data, loading, error, refetch } = useHoaQuery("audit_logs", {
    select: "*",
  });

  // refresh when HOA changes
  useEffect(() => {
    refetch();
  }, [activeHoa?.id, refetch]);

  if (loading) {
    return <p style={{ padding: 20 }}>Loading audit logs...</p>;
  }

  if (error) {
    return (
      <p style={{ padding: 20, color: "red" }}>
        Error loading audit logs
      </p>
    );
  }

  // ✅ FIX: do NOT filter out valid system/global logs
  const filteredLogs = (data || [])
    .filter((log: any) => {
      // show:
      // 1. HOA-specific logs
      // 2. global/system logs (null association_id)
      return (
        !activeHoa?.id ||
        log.association_id === activeHoa.id ||
        log.association_id == null
      );
    })
    .sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    );

  return (
    <div style={{ padding: 20, maxWidth: 900 }}>
      <h1>🧠 Enterprise Audit Log</h1>

      {!activeHoa?.id && (
        <p style={{ color: "orange" }}>
          Showing system-wide audit logs
        </p>
      )}

      {filteredLogs.length === 0 && <p>No logs found</p>}

      {filteredLogs.map((log: any) => (
        <div
          key={log.id}
          style={{
            padding: 12,
            borderBottom: "1px solid #eee",
            marginBottom: 10,
          }}
        >
          <strong>{formatAudit(log)}</strong>

          <div style={{ fontSize: 12, color: "#666" }}>
            {new Date(log.created_at).toLocaleString()}
          </div>

          {log.before_state && (
            <pre style={{ fontSize: 11, color: "#999" }}>
              {JSON.stringify(log.before_state, null, 2)}
            </pre>
          )}

          {log.after_state && (
            <pre style={{ fontSize: 11, color: "#999" }}>
              {JSON.stringify(log.after_state, null, 2)}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}