"use client";

import { useEffect, useState } from "react";
import SidebarLayout from "@/app/components/SidebarLayout";
import { createBrowserClient } from "@supabase/ssr";
import { useHoa } from "@/app/context/HoaContext";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuditPage() {
  const { activeHoa } = useHoa();

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!activeHoa?.id) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("association_id", activeHoa.id)   // 🔥 TENANT FILTER ADDED
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Audit load error:", error.message);
      setLoading(false);
      return;
    }

    setLogs(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [activeHoa?.id]); // 🔥 reload when HOA changes

  return (
    <SidebarLayout>
      <div style={{ maxWidth: 900 }}>
        <h1>🧠 Admin Audit Dashboard</h1>
        <p>
          System-wide activity log for:{" "}
          <b>{activeHoa?.name || "No HOA Selected"}</b>
        </p>

        {loading && <p>Loading logs...</p>}

        {!loading && logs.length === 0 && (
          <p>No audit logs found for this HOA.</p>
        )}

        {!loading &&
          logs.map((log) => (
            <div
              key={log.id}
              style={{
                border: "1px solid #eee",
                padding: 12,
                marginBottom: 10,
                borderRadius: 8,
                background: "#fafafa",
              }}
            >
              <b>{log.action}</b>

              <div>User: {log.user_id}</div>
              <div>Entity: {log.entity_type}</div>
              <div>ID: {log.entity_id}</div>
              <div>
                Time:{" "}
                {log.created_at
                  ? new Date(log.created_at).toLocaleString()
                  : "N/A"}
              </div>

              <pre style={{ fontSize: 12 }}>
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          ))}
      </div>
    </SidebarLayout>
  );
}