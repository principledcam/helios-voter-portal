"use client";

import { useHoaQuery } from "@/app/hooks/useHoaQuery";

export default function AssociationsPage() {
  const {
    data: associations,
    loading,
    error,
  } = useHoaQuery("associations");

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
        <p>No associations found for the current HOA scope.</p>
      ) : (
        associations.map((a: any) => (
          <div
            key={a.id}
            style={{
              border: "1px solid #eee",
              padding: 10,
              marginBottom: 10,
              borderRadius: 8,
              background: "#fff",
            }}
          >
            <h3>{a.name}</h3>

            {a.environment && (
              <p>
                <strong>Environment:</strong> {a.environment}
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