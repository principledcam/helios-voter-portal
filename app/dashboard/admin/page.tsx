"use client";

import { useHoaQuery } from "@/app/hooks/useHoaQuery";

export default function AdminPage() {
  const {
    data: members,
    loading: membersLoading,
    error: membersError,
  } = useHoaQuery("association_members", {
    select: `
      id,
      user_id,
      role,
      associations:association_id (
        id,
        name
      )
    `,
  });

  const {
    data: associations,
    loading: hoaLoading,
  } = useHoaQuery("associations");

  if (membersLoading || hoaLoading) {
    return (
      <div style={{ padding: 20 }}>
        Loading admin data...
      </div>
    );
  }

  if (membersError) {
    return (
      <div style={{ padding: 20, color: "red" }}>
        Error loading admin data
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin User Management</h1>

      <p style={{ color: "#666" }}>
        Manage users and HOA assignments
      </p>

      {/* HOA SUMMARY */}
      <div style={{ marginTop: 20 }}>
        <h3>HOAs</h3>

        {associations.length === 0 ? (
          <p>No HOAs found</p>
        ) : (
          associations.map((hoa: any) => (
            <div
              key={hoa.id}
              style={{
                padding: 10,
                borderBottom: "1px solid #eee",
              }}
            >
              🏛️ {hoa.name}
            </div>
          ))
        )}
      </div>

      {/* MEMBERS TABLE */}
      <div style={{ marginTop: 30 }}>
        <h3>Members (Current HOA Scope)</h3>

        {members.length === 0 ? (
          <p>No members found for this HOA</p>
        ) : (
          members.map((m: any) => (
            <div
              key={m.id}
              style={{
                padding: 10,
                borderBottom: "1px solid #eee",
              }}
            >
              <div>
                <strong>User:</strong> {m.user_id}
              </div>

              <div>
                <strong>Role:</strong> {m.role}
              </div>

              <div style={{ fontSize: 12, color: "#666" }}>
                HOA: {m.associations?.name}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}