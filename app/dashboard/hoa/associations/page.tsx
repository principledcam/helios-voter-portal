"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AssociationsPage() {
  const [associations, setAssociations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("associations")
          .select("*")
          .order("name");

        if (error) throw error;

        setAssociations(data || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 30 }}>
        Loading associations...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: 30,
          color: "red",
        }}
      >
        Error loading associations
      </div>
    );
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>🏘️ Associations</h1>

      {associations.length === 0 ? (
        <p>No associations found.</p>
      ) : (
        associations.map((a: any) => (
          <div
            key={a.id}
            style={{
              border: "1px solid #eee",
              padding: 12,
              marginBottom: 12,
              borderRadius: 8,
              background: "#fff",
            }}
          >
            <h3>{a.name}</h3>

            <p>
              <strong>ID:</strong> {a.id}
            </p>

            {a.environment && (
              <p>
                <strong>Environment:</strong>{" "}
                {a.environment}
              </p>
            )}

            {a.status && (
              <p>
                <strong>Status:</strong> {a.status}
              </p>
            )}

            {typeof a.contract_signed !== "undefined" && (
              <p>
                <strong>Contract Signed:</strong>{" "}
                {a.contract_signed ? "Yes" : "No"}
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
}