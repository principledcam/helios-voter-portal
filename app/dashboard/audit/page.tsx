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
        console.error(error.message);
        setLoading(false);
        return;
      }

      setLogs(data || []);
      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return <p>Loading audit logs...</p>;
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <h1>🧾 Audit Log</h1>

      {logs.length === 0 ? (
        <p>No audit logs found.</p>
      ) : (
        logs.map((log) => (
          <div key={log.id} style={{ padding: 12, marginBottom: 10 }}>
            <strong>{log.action}</strong>
            <div>User: {log.user_id}</div>
            <div>Entity: {log.entity_type}</div>
            <div>ID: {log.entity_id}</div>

            <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
          </div>
        ))
      )}
    </div>
  );
}