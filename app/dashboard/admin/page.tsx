"use client";

import Link from "next/link";
import { useHoaQuery } from "@/app/hooks/useHoaQuery";

// 🧱 UI SYSTEM
import {
  PageHeader,
  Section,
  Card,
  Spinner,
} from "@/app/components/ui";

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

  // =========================
  // LOADING
  // =========================
  if (membersLoading || hoaLoading) {
    return (
      <Section title="Loading Admin">
        <Spinner />
      </Section>
    );
  }

  // =========================
  // ERROR
  // =========================
  if (membersError) {
    return (
      <Section title="Error">
        <Card>
          <div style={{ color: "red" }}>
            Error loading admin data.
          </div>
        </Card>
      </Section>
    );
  }

  // =========================
  // MAIN PAGE
  // =========================
  return (
    <>
      <PageHeader
        title="Admin User Management"
        subtitle="Manage users, associations, invitations and elections"
      />

      <Section title="Administration">
        <Card>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <Link
              href="/dashboard/hoa/associations"
              style={styles.button}
            >
              🏘️ Manage Associations
            </Link>

            <Link
              href="/dashboard/hoa/members"
              style={styles.button}
            >
              👥 Manage Members
            </Link>

            <Link
              href="/dashboard/hoa/invites"
              style={styles.button}
            >
              ✉️ Invite Users
            </Link>

            <Link
              href="/dashboard/elections/create"
              style={styles.button}
            >
              🗳️ Create Election
            </Link>
          </div>
        </Card>
      </Section>

      <Section title="Associations">
        <Card>
          {associations.length === 0 ? (
            <p>No associations found.</p>
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
        </Card>
      </Section>

      <Section title="Members">
        <Card>
          {members.length === 0 ? (
            <p>No members found.</p>
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
              </div>
            ))
          )}
        </Card>
      </Section>
    </>
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