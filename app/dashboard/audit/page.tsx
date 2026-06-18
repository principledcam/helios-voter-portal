"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useHoa } from "@/app/hooks/useHoa";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuditPage() {
  const { activeHoa } = useHoa();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // -----------------------------
  // LOAD AUDIT LOGS (HOA-SCOPED)
  // -----------------------------
  const load = async () => {
    if (!activeHoa?.id) return;

    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("association_id", activeHoa.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error.message);
      setError(error.message);
      setLoading(false);
      return;
    }

    setData(data || []);
    setLoading(false);
  };

  // -----------------------------
  // INITIAL LOAD + HOA CHANGE
  // -----------------------------
  useEffect(() => {
    load();

    const interval = setInterval(() => {
      load();
    }, 10000); // refresh every 10s

    return () => clearInterval(interval);
  }, [activeHoa?.id]);

  // -----------------------------
  // UI STATES
  // -----------------------------
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
        Error loading audit logs: {error}
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

              {log.entity_type && (
                <div style={{ fontSize: 12 }}>
                  Entity: {log.entity_type}
                </div>
              )}

              {log.metadata && (
                <pre style={{ fontSize: 11 }}>
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}