"use client";

import Link from "next/link";
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

      {/* ADMIN ACTIONS */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginTop: 20,
          marginBottom: 30,
        }}
      >
        <Link href="/dashboard/hoa/associations" style={styles.button}>
          🏘️ Manage Associations
        </Link>

        <Link href="/dashboard/hoa/members" style={styles.button}>
          👥 Manage Members
        </Link>

        <Link href="/dashboard/hoa/invites" style={styles.button}>
          ✉️ Invite Users
        </Link>

        <Link href="/dashboard/elections/create" style={styles.button}>
          🗳️ Create Election
        </Link>
      </div>

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

              <div
                style={{
                  fontSize: 12,
                  color: "#666",
                }}
              >
                HOA: {m.associations?.name}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  button: {
    padding: "10px 14px",
    background: "#08224D",
    color: "#fff",
    textDecoration: "none",
    borderRadius: 8,
    fontWeight: 600,
    display: "inline-block",
  },
};